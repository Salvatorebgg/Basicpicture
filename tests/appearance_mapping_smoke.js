const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');

function parseCsv(text) {
  text = text.replace(/^\uFEFF/, '').trim();
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"') {
      if (quoted && next === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (ch === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && next === '\n') i += 1;
      row.push(cell);
      if (row.some(v => v !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.some(v => v !== '')) rows.push(row);
  const headers = rows.shift();
  const data = {};
  headers.forEach(h => { data[h] = []; });
  rows.forEach(r => headers.forEach((h, i) => { data[h].push(r[i] ?? ''); }));
  return data;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function rgbToken(hex) {
  if (!hex || !hex.startsWith('#')) return '';
  const clean = hex.slice(1);
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return '';
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

function jsonHasAnyColor(obj, colors) {
  const text = JSON.stringify(obj);
  return colors.some(c => text.includes(c) || (rgbToken(c) && text.includes(rgbToken(c))));
}

function jsonHasScaleColors(obj, colors) {
  const text = JSON.stringify(obj);
  return colors.length >= 2 && text.includes(colors[0]) && text.includes(colors[colors.length - 1]);
}

const context = {
  STATE: { chartTheme: 'cnsTheme' },
  console,
  window: {},
  document: {
    addEventListener: () => {},
    getElementById: () => null,
    querySelectorAll: () => [],
    querySelector: () => null,
  },
  el: () => null,
  qs: () => null,
  qsa: () => [],
};
vm.createContext(context);

[
  'app/static/js/chartThemes.js',
  'app/static/js/plotConfigs.js',
  'app/static/js/charts.js',
  'app/static/js/variableSelect.js',
  'app/static/js/app.js',
].forEach(rel => {
  vm.runInContext(fs.readFileSync(path.join(root, rel), 'utf8'), context, { filename: rel });
});

const catalog = vm.runInContext('CHART_CATALOG', context);
const defaultVars = vm.runInContext('CHART_DEFAULT_VARS', context);
const colorScaleCharts = new Set(vm.runInContext('getColorScaleCharts()', context));
const userPaletteBase = ['#111111', '#d95f02', '#1b9e77', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d'];
const checked = [];
const colorCounts = {};

Object.keys(catalog).forEach(chartId => {
  const cfg = catalog[chartId];
  assert(cfg.exampleDataset, `${chartId}: missing example dataset binding`);
  const csvPath = path.join(root, 'data', 'examples', `${cfg.exampleDataset}.csv`);
  assert(fs.existsSync(csvPath), `${chartId}: missing example csv ${cfg.exampleDataset}.csv`);
  const data = parseCsv(fs.readFileSync(csvPath, 'utf8'));
  const params = JSON.parse(JSON.stringify(defaultVars[chartId] || {}));

  context.STATE = {
    chartTheme: 'cnsTheme',
    activeChartType: chartId,
    currentChartParams: params,
    currentChartSourceData: data,
    markerSize: 14,
    markerShape: 'diamond',
    markerOpacity: 0.62,
    lineWidth: 5,
    barGap: 0.2,
    userColors: null,
  };

  context.__chartId = chartId;
  context.__data = data;
  context.__params = params;

  const count = vm.runInContext("getAppearanceColorCount(__chartId, CHART_THEMES.cnsTheme.colorway)", context);
  assert(Number.isInteger(count) && count >= 1, `${chartId}: invalid color control count ${count}`);
  colorCounts[chartId] = count;
  context.STATE.userColors = userPaletteBase.slice(0, Math.max(2, count));

  const result = vm.runInContext(`(() => {
    const cfg = getChartConfig(__chartId);
    const traces = cfg.buildTraces(__data, __params, CHART_THEMES.cnsTheme);
    const layout = cfg.buildLayout(__params, CHART_THEMES.cnsTheme);
    const polishedTraces = polishTracesForPublication(traces, CHART_THEMES.cnsTheme);
    const polishedLayout = polishLayoutForPublication(layout, __chartId, CHART_THEMES.cnsTheme);
    const elemTypes = getChartElementTypes(__chartId);
    return { traces, layout, polishedTraces, polishedLayout, elemTypes };
  })()`, context);

  assert(Array.isArray(result.traces) && result.traces.length > 0, `${chartId}: no traces generated`);
  assert(result.polishedLayout && typeof result.polishedLayout === 'object', `${chartId}: missing polished layout`);

  if (colorScaleCharts.has(chartId)) {
    assert(count === (chartId === 'missingness_heatmap' ? 2 : 3), `${chartId}: wrong colorscale button count`);
    const scaleColors = context.STATE.userColors.slice(0, count);
    assert(
      result.polishedTraces.some(t => jsonHasScaleColors([t.colorscale, t.marker && t.marker.colorscale, t.line && t.line.colorscale], scaleColors)),
      `${chartId}: colorscale controls do not reach plot traces`
    );
  } else {
    assert(
      jsonHasAnyColor([result.polishedTraces, result.polishedLayout], context.STATE.userColors),
      `${chartId}: custom color controls do not reach rendered output`
    );
  }

  if (result.elemTypes.includes('marker')) {
    const markerTrace = result.polishedTraces.find(t =>
      ['scatter', 'scattergeo', 'scatterpolar'].includes(t.type) &&
      t.marker &&
      !Array.isArray(t.marker.symbol)
    );
    if (markerTrace) {
      assert(markerTrace.marker.symbol === 'diamond', `${chartId}: marker shape control did not apply`);
    }
  }

  if (result.elemTypes.includes('line')) {
    const lineTrace = result.polishedTraces.find(t =>
      t.line &&
      Number(t.line.width) >= 4.5
    );
    assert(lineTrace, `${chartId}: line width control did not apply to any line trace`);
  }

  checked.push(chartId);
});

assert(colorCounts.volcano === 3, 'volcano: should expose Down/NS/Up colors');
assert(colorCounts.forest === 2, 'forest: should expose protective/risk colors');
assert(colorCounts.risk_calibration === 4, 'risk_calibration: should expose 4 element colors');
assert(colorCounts.heatmap === 3, 'heatmap: should expose 3 colorscale colors');
assert(colorCounts.missingness_heatmap === 2, 'missingness_heatmap: should expose 2 binary colors');

console.log(JSON.stringify({ checked: checked.length, colorCounts }, null, 2));
