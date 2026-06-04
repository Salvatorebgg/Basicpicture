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

const context = {
  STATE: {
    chartTheme: 'cnsTheme',
    chinaGeoJSON: JSON.parse(fs.readFileSync(path.join(root, 'app/static/china_provinces.geojson'), 'utf8')),
    worldGeoJSON: JSON.parse(fs.readFileSync(path.join(root, 'app/static/world_countries.geojson'), 'utf8')),
  },
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
].forEach(rel => {
  vm.runInContext(fs.readFileSync(path.join(root, rel), 'utf8'), context, { filename: rel });
});

function render(chartId) {
  const meta = vm.runInContext(`({
    cfg: getChartConfig('${chartId}'),
    defaults: CHART_DEFAULT_VARS['${chartId}'] || {}
  })`, context);
  assert(meta.cfg, `${chartId}: missing chart config`);
  const csvPath = path.join(root, 'data', 'examples', `${meta.cfg.exampleDataset}.csv`);
  const data = parseCsv(fs.readFileSync(csvPath, 'utf8'));
  context.__data = data;
  context.__params = JSON.parse(JSON.stringify(meta.defaults));
  return vm.runInContext(`(() => {
    const cfg = getChartConfig('${chartId}');
    const traces = cfg.buildTraces(__data, __params, CHART_THEMES.cnsTheme);
    const layout = cfg.buildLayout(__params, CHART_THEMES.cnsTheme);
    return { traces, layout, params: __params };
  })()`, context);
}

const chartIds = ['china_map', 'china_bubble_map', 'world_map', 'world_bubble_map', 'usa_map', 'europe_map', 'uk_map'];
const summary = {};

for (const id of chartIds) {
  const result = render(id);
  summary[id] = result.traces.length;
  assert(result.layout && result.layout.geo, `${id}: missing geo layout`);
  assert(result.traces.length >= 1, `${id}: no traces generated`);
  assert(result.traces.some(t => ['choropleth', 'scattergeo'].includes(t.type)), `${id}: missing map trace`);
  if (id.includes('bubble') || id === 'uk_map') {
    assert(result.traces.some(t => t.type === 'scattergeo' && t.marker && Array.isArray(t.marker.size)), `${id}: missing scaled bubble markers`);
  }
  if (id === 'china_bubble_map') {
    assert(result.traces.some(t => t.type === 'choropleth'), 'china_bubble_map: missing province boundary base layer');
  }
  if (id === 'usa_map') {
    assert(result.traces.some(t => t.type === 'choropleth' && t.locationmode === 'USA-states'), 'usa_map: missing USA state choropleth mode');
  }
  if (id === 'europe_map') {
    assert(result.layout.geo.scope === 'europe' || result.layout.geo.lonaxis, 'europe_map: missing Europe-focused viewport');
  }
}

console.log(JSON.stringify({ checked: chartIds, traceCounts: summary }, null, 2));
