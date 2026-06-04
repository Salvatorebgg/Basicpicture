const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');

const fakePlot = {
  _fullLayout: { width: 1111, height: 777 },
  clientWidth: 1111,
  clientHeight: 777,
};

const fakePreview = {
  querySelector: () => fakePlot,
};

const calls = {
  relayout: null,
  toImage: null,
  downloads: [],
  toasts: [],
};

const context = {
  STATE: {
    activeChartType: 'stacked_bar',
    currentPlotlyLayout: { width: 1111, height: 777, autosize: false },
  },
  console,
  window: {},
  Plotly: {
    Plots: {
      resize: async () => {},
    },
    relayout: async (plotEl, update) => {
      calls.relayout = update;
      plotEl._fullLayout = { ...(plotEl._fullLayout || {}), ...update };
    },
    toImage: async (_plotEl, options) => {
      calls.toImage = options;
      return 'data:image/png;base64,AA==';
    },
    downloadImage: async () => {
      throw new Error('fallback should not run');
    },
  },
  el: (id) => (id === 'chartPreviewContainer' ? fakePreview : null),
  qs: (selector) => (selector.includes('chartPreviewContainer') ? fakePlot : null),
  toast: (msg, type) => calls.toasts.push({ msg, type }),
  URL: { createObjectURL: () => 'blob:test', revokeObjectURL: () => {} },
  Blob,
  document: {
    createElement: () => ({
      style: {},
      click: () => calls.downloads.push(true),
      remove: () => {},
    }),
    body: { appendChild: () => {} },
  },
  setTimeout: (fn) => fn(),
};
context.window.Plotly = context.Plotly;

const downloadSource = fs.readFileSync(path.join(root, 'app/static/js/download.js'), 'utf8');
if (downloadSource.includes('/api/export/chart/publication')) {
  throw new Error('frontend image export must not call server-side publication redraw');
}

vm.createContext(context);
vm.runInContext(downloadSource, context, {
  filename: 'app/static/js/download.js',
});

async function main() {
  await vm.runInContext("downloadChartImage('png')", context);

  if (!calls.relayout || calls.relayout.width !== 1111 || calls.relayout.height !== 777) {
    throw new Error(`relayout did not use displayed size: ${JSON.stringify(calls.relayout)}`);
  }
  if (!calls.toImage || calls.toImage.width !== 1111 || calls.toImage.height !== 777) {
    throw new Error(`toImage did not use displayed size: ${JSON.stringify(calls.toImage)}`);
  }
  if (calls.toImage.scale !== 2.5) {
    throw new Error(`PNG scale should improve resolution without changing layout, got ${calls.toImage.scale}`);
  }
  if (context.STATE.currentPlotlyLayout.width !== 1111 || context.STATE.currentPlotlyLayout.height !== 777) {
    throw new Error('STATE.currentPlotlyLayout was not synchronized');
  }
  calls.toImage = null;
  await vm.runInContext("downloadChartImage('svg')", context);
  if (!calls.toImage || calls.toImage.format !== 'svg' || calls.toImage.width !== 1111 || calls.toImage.height !== 777) {
    throw new Error(`SVG export did not use displayed size: ${JSON.stringify(calls.toImage)}`);
  }
  console.log(JSON.stringify({
    chart: context.STATE.activeChartType,
    exportWidth: 1111,
    exportHeight: 777,
    pngScale: 2.5,
    svgScale: calls.toImage.scale,
    wysiwyg: true,
    serverRedraw: false,
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
