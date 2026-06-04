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

const forest = render('forest');
assert(forest.traces.length >= 2, 'forest: expected effect trace and OR=1 reference trace');
assert(forest.traces[0].error_x && forest.traces[0].error_x.array.length > 0, 'forest: missing 95% CI error bars');
assert(forest.layout.xaxis && forest.layout.xaxis.type === 'log', 'forest: OR axis should be log scaled');
assert(forest.traces.some(t => String(t.name).includes('OR=1')), 'forest: missing null-effect reference line');

const volcano = render('volcano');
const volcanoNames = volcano.traces.map(t => String(t.name));
assert(volcanoNames.includes('上调') && volcanoNames.includes('下调') && volcanoNames.includes('不显著'), 'volcano: missing up/down/not-significant classes');
assert((volcano.layout.shapes || []).length >= 3, 'volcano: missing fold-change and P-value cutoff lines');
assert(volcano.traces.filter(t => t.mode === 'markers+text').length >= 1, 'volcano: missing top feature labels');

const pca = render('pca');
const pcaPointTraces = pca.traces.filter(t => t.type === 'scatter' && t.mode === 'markers');
const pcaEllipses = pca.traces.filter(t => t.fill === 'toself');
assert(pcaPointTraces.length >= 2, 'pca: expected at least two grouped point traces');
assert(new Set(pcaPointTraces.map(t => t.marker && t.marker.symbol)).size >= 2, 'pca: groups should use distinct marker symbols');
assert(pcaEllipses.length >= 2, 'pca: missing confidence ellipses');
assert(String(pca.layout.xaxis.title).includes('PC1') && String(pca.layout.yaxis.title).includes('PC2'), 'pca: missing PC axis titles with explained variance');

const survival = render('survival');
assert(survival.traces.some(t => String(t.name).includes('事件=')), 'survival: missing event counts in group labels');
assert(survival.traces.some(t => String(t.name).includes('删失')), 'survival: missing censor markers');
assert(survival.layout.yaxis && survival.layout.yaxis.range[1] >= 1, 'survival: y-axis should show survival probability');

const roc = render('roc');
assert(roc.traces.some(t => String(t.name).includes('ROC (AUC')), 'roc: missing AUC curve label');
assert(roc.traces.some(t => String(t.name).toLowerCase().includes('youden')), 'roc: missing Youden cutoff marker');
assert((roc.layout.annotations || []).some(a => String(a.text).includes('AUC')), 'roc: missing AUC annotation');

const multiRoc = render('multi_roc');
assert(multiRoc.traces.filter(t => t.mode === 'lines').length >= 4, 'multi_roc: expected multiple ROC curves plus random reference');
assert(multiRoc.traces.some(t => String(t.name).includes('AUC=')), 'multi_roc: missing AUC labels');

const riskCalibration = render('risk_calibration');
assert(riskCalibration.traces.some(t => t.error_y && t.error_y.array.length > 0), 'risk_calibration: missing binomial confidence intervals');
assert(riskCalibration.traces[0].meta && riskCalibration.traces[0].meta.colorIndex === 3, 'risk_calibration: ideal line should map to color swatch 4');
assert(riskCalibration.traces[1].meta && riskCalibration.traces[1].meta.colorIndex === 1, 'risk_calibration: sample bars should map to color swatch 2');
assert(riskCalibration.traces[2].meta && riskCalibration.traces[2].meta.colorIndex === 0, 'risk_calibration: calibration curve should map to color swatch 1');
assert(riskCalibration.traces[2].meta && riskCalibration.traces[2].meta.errorColorIndex === 2, 'risk_calibration: confidence intervals should map to color swatch 3');
context.STATE.userColors = ['#111111', '#222222', '#333333', '#444444'];
context.__riskCalibrationTraces = riskCalibration.traces;
const polishedRiskCalibration = vm.runInContext('polishTracesForPublication(__riskCalibrationTraces, CHART_THEMES.cnsTheme)', context);
assert(polishedRiskCalibration[0].line.color === '#444444', 'risk_calibration: ideal line does not respond to swatch 4');
assert(String(polishedRiskCalibration[1].marker.color).includes('34,34,34'), 'risk_calibration: sample bars do not respond to swatch 2');
assert(polishedRiskCalibration[2].line.color === '#111111', 'risk_calibration: calibration curve does not respond to swatch 1');
assert(polishedRiskCalibration[2].error_y.color === '#333333', 'risk_calibration: CI error bars do not respond to swatch 3');
context.STATE.userColors = null;
assert(riskCalibration.traces.some(t => String(t.name).includes('理想') || String(t.name).toLowerCase().includes('ideal')), 'risk_calibration: missing ideal calibration line');

const nomogram = render('nomogram');
assert(nomogram.traces.length >= 5, 'nomogram: expected multiple factor axes and risk scale');
assert(nomogram.layout.yaxis && Array.isArray(nomogram.layout.yaxis.ticktext) && nomogram.layout.yaxis.ticktext.includes('Predicted risk'), 'nomogram: missing predicted risk scale');

const dca = render('dca');
const dcaNames = dca.traces.map(t => String(t.name));
const dcaModelTraces = dca.traces.filter(t => !String(t.name).includes('Treat all') && !String(t.name).includes('Treat none'));
assert(dcaNames.some(n => n.includes('Treat all')) && dcaNames.some(n => n.includes('Treat none')), 'dca: missing treat-all/treat-none clinical reference strategies');
assert(dcaModelTraces.length >= 3, 'dca: expected multiple model net-benefit curves');
assert(dca.traces.every(t => (t.y || []).every(Number.isFinite)), 'dca: net-benefit curves contain non-finite values');
assert(dca.layout.yaxis && dca.layout.yaxis.range[1] > 0.08, 'dca: net-benefit axis range is too flat');

const calibration = render('calibration_curve');
assert(calibration.traces.length >= 2, 'calibration: expected model curve and ideal reference line');
assert(calibration.traces.some(t => String(t.name).includes('校准') || String(t.name).toLowerCase().includes('ideal')), 'calibration: missing ideal calibration reference');

console.log(JSON.stringify({
  checked: ['forest', 'volcano', 'pca', 'survival', 'roc', 'multi_roc', 'risk_calibration', 'nomogram', 'dca', 'calibration_curve'],
  traceCounts: {
    forest: forest.traces.length,
    volcano: volcano.traces.length,
    pca: pca.traces.length,
    survival: survival.traces.length,
    roc: roc.traces.length,
    multi_roc: multiRoc.traces.length,
    risk_calibration: riskCalibration.traces.length,
    nomogram: nomogram.traces.length,
    dca: dca.traces.length,
    calibration_curve: calibration.traces.length,
  },
}, null, 2));
