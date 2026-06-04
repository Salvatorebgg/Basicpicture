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

const chartsToCheck = vm.runInContext(`Object.values(CHART_CATALOG).filter(c => c.category === 'basic').map(c => c.id)`, context);

const expectedColorCounts = {
  line: 4,
  multi_line: 4,
  bar: 4,
  horizontal_bar: 4,
  lollipop: 4,
  density: 3,
  box: 3,
  violin: 3,
  error_bar: 4,
};

const results = [];
for (const chartId of chartsToCheck) {
  const meta = vm.runInContext(`({
    cfg: getChartConfig('${chartId}'),
    defaults: CHART_DEFAULT_VARS['${chartId}'] || {}
  })`, context);
  if (!meta.cfg) throw new Error(`${chartId}: missing chart config`);
  const csvPath = path.join(root, 'data', 'examples', `${meta.cfg.exampleDataset}.csv`);
  const data = parseCsv(fs.readFileSync(csvPath, 'utf8'));
  context.__data = data;
  context.__params = { ...meta.defaults };
  const result = vm.runInContext(`(() => {
    const cfg = getChartConfig('${chartId}');
    const traces = cfg.buildTraces(__data, __params, CHART_THEMES.cnsTheme);
    const layout = cfg.buildLayout(__params, CHART_THEMES.cnsTheme);
    return {
      chartId: '${chartId}',
      traceCount: Array.isArray(traces) ? traces.length : 0,
      firstType: traces && traces[0] && traces[0].type,
      hasLayout: !!layout
    };
  })()`, context);
  if (!result.traceCount) throw new Error(`${chartId}: no traces generated`);
  if (!result.hasLayout) throw new Error(`${chartId}: no layout generated`);
  const colorCount = vm.runInContext(`(() => {
    STATE.activeChartType = '${chartId}';
    STATE.currentChartSourceData = __data;
    STATE.currentChartParams = __params;
    return getAppearanceColorCount('${chartId}', CHART_THEMES.cnsTheme.colorway);
  })()`, context);
  if (!Number.isFinite(colorCount) || colorCount < 1) {
    throw new Error(`${chartId}: invalid color picker count ${colorCount}`);
  }
  if (expectedColorCounts[chartId] && colorCount !== expectedColorCounts[chartId]) {
    throw new Error(`${chartId}: expected ${expectedColorCounts[chartId]} color pickers, got ${colorCount}`);
  }
  result.colorCount = colorCount;
  results.push(result);
}

console.log(JSON.stringify(results, null, 2));
