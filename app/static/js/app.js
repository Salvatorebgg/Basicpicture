/* ── Main Application Entry ─────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  initChartCategoryTabs();
  initChartTypeGrid();
  initCenterTabs();
  initFileInputs();
  initTableTypeTabs();
  initChartThemeSelect();
  initExportButtons();
  loadExampleList();

  if (typeof loadChinaGeoJSON === 'function') {
    loadChinaGeoJSON().then(() => { loadChinaCentroids(); }).catch(() => {});
  }
  if (typeof loadWorldGeoJSON === 'function') {
    loadWorldGeoJSON().catch(() => {});
  }

  const genBtn = el('generateChartBtn');
  if (genBtn) genBtn.addEventListener('click', generateChart);

  const tableGenBtn = el('generateTableBtn');
  if (tableGenBtn) tableGenBtn.addEventListener('click', generateTable);

  renderMiniChartGrid('basic');
  bootEmptyState();
});

// ── Chart Category Tabs ────────────────────────────────
function initChartCategoryTabs() {
  qsa('#chartCatTabs .cat-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      qsa('#chartCatTabs .cat-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      STATE.activeChartCategory = this.dataset.cat;
      renderMiniChartGrid(this.dataset.cat);
    });
  });
}

// ── Mini Chart Grid ────────────────────────────────────
function initChartTypeGrid() {
  const grid = el('miniChartGrid');
  if (grid) {
    grid.addEventListener('click', function(e) {
      const card = e.target.closest('.mini-chart-card');
      if (!card) return;
      const chartId = card.dataset.chart;
      if (chartId) selectChart(chartId);
    });
  }
}

function renderMiniChartGrid(category) {
  const grid = el('miniChartGrid');
  if (!grid) return;
  const charts = Object.values(CHART_CATALOG).filter(c => c.category === category);
  grid.innerHTML = charts.map(chart => `
    <div class="mini-chart-card ${STATE.activeChartType === chart.id ? 'selected' : ''}" data-chart="${chart.id}">
      <span class="mini-chart-icon">${chart.icon}</span>
      <span class="mini-chart-name">${chart.name}</span>
    </div>
  `).join('');
}

function selectChart(chartId) {
  if (STATE.activeChartType && STATE.activeChartType !== chartId) {
    saveActiveChartWorkspace();
  }

  STATE.activeChartType = chartId;
  loadChartWorkspace(chartId);
  STATE.currentPlotlyData = null;
  STATE.currentPlotlyLayout = null;
  STATE.currentChartSourceData = null;

  const config = getChartConfig(chartId);
  if (!STATE.uploadId && !STATE.datasetName && config && config.exampleDataset) {
    STATE.datasetName = config.exampleDataset;
  }

  qsa('.mini-chart-card').forEach(c => c.classList.remove('selected'));
  const activeCard = qs(`.mini-chart-card[data-chart="${chartId}"]`);
  if (activeCard) activeCard.classList.add('selected');

  const label = el('selectedChartLabel');
  if (label) label.textContent = config ? config.name : chartId;

  const previewTitle = el('chartPreviewTitle');
  if (previewTitle) previewTitle.textContent = config ? config.name : '图形预览';
  const previewBadge = el('chartPreviewBadge');
  if (previewBadge) previewBadge.textContent = config ? config.description || '' : '';

  updateFlowLine(1);
  resetChartPreview(config);
  renderDataPanel();
  buildChartVarControls();
  updateMetricGrid();
  updatePreviewTable();
  updateDownloadList();
  renderAppearanceControls();
}

function resetChartPreview(config) {
  const container = el('chartPreviewContainer');
  if (!container) return;
  disconnectChartResizeObserver();
  const plot = container.querySelector('.js-plotly-plot');
  if (plot && window.Plotly) Plotly.purge(plot);
  container.innerHTML = `<div class="empty-state">${config ? `已选择「${config.name}」，载入数据后点击生成` : '请在左侧选择图表类型'}</div>`;
  const exportBar = el('chartExportBar');
  if (exportBar) exportBar.style.display = 'none';
}

// ── Center Panel Tabs ──────────────────────────────────
function initCenterTabs() {
  qsa('.tabs .tab').forEach(tab => {
    tab.addEventListener('click', function() {
      qsa('.tabs .tab').forEach(t => t.classList.remove('active'));
      qsa('.tab-panel').forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      const target = el(`tab-${this.dataset.tab}`);
      if (target) target.classList.add('active');
      if (this.dataset.tab === 'table') buildTableVarControls();
    });
  });
}

// ── File Inputs ────────────────────────────────────────
function initFileInputs() {
  const fileInput = el('wsFileInput');
  const uploadBtn = el('uploadDataBtn');

  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => fileInput.click());
  }
  if (fileInput) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        handleFile(fileInput.files[0], { fromChart: true });
        fileInput.value = '';
      }
    });
  }

  const loadBtn = el('loadExampleBtn');
  if (loadBtn) {
    loadBtn.addEventListener('click', () => doLoadExample());
  }
}

async function doLoadExample() {
  if (!STATE.activeChartType) {
    const firstCard = qs('.mini-chart-card');
    if (firstCard && firstCard.dataset.chart) {
      selectChart(firstCard.dataset.chart);
    } else {
      toast('请先选择图表类型', 'info');
      return;
    }
  }
  const config = getChartConfig(STATE.activeChartType);
  if (!config) { toast('请先选择图表类型', 'info'); return; }

  const loadBtn = el('loadExampleBtn');
  const exampleName = config.exampleDataset || 'baseline_table_example';
  if (loadBtn) setLoading(loadBtn, true);
  try {
    await loadExampleDataset(exampleName, { stayOnTab: true, silent: true });
    renderDataPanel();
    buildChartVarControls();
    renderAppearanceControls();
    updateMetricGrid();
    updatePreviewTable();
    updateDownloadList();
    updateFlowLine(2);
    setStatus('数据已载入');
    toast(`已加载「${config.name}」示例数据`, 'success');
  } catch(e) {
    toast('加载示例失败: ' + e.message, 'error');
  } finally {
    if (loadBtn) setLoading(loadBtn, false);
  }
}

// ── Table Type Tabs ────────────────────────────────────
function initTableTypeTabs() {
  qsa('#tableTypeTabs .cat-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      qsa('#tableTypeTabs .cat-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      STATE.activeTableType = this.dataset.tt;
    });
  });
}

// ── Chart Theme Select ─────────────────────────────────
function initChartThemeSelect() {
  const sel = el('chartThemeSelect');
  if (!sel) return;
  sel.value = STATE.chartTheme || 'cnsTheme';
  sel.addEventListener('change', () => {
    STATE.chartTheme = sel.value;
    STATE.userColors = null;
    renderAppearanceControls();
    toast('主题: ' + (CHART_THEMES[sel.value]?.name || sel.value), 'info');
    if (STATE.currentPlotlyData && STATE.currentPlotlyData.length > 0) generateChart();
  });
}

// ── Export Buttons ──────────────────────────────────────
function initExportButtons() {
  document.addEventListener('click', function(e) {
    const exportBtn = e.target.closest('.export-btn');
    if (exportBtn) {
      e.preventDefault();
      const fmt = exportBtn.dataset.fmt;
      if (fmt === 'png') downloadChartImage('png');
      else if (fmt === 'svg') downloadChartImage('svg');
      else if (fmt === 'csv') downloadChartCSV();
      else if (fmt === 'publication') downloadPublicationChart();
    }
    const tableExportBtn = e.target.closest('.table-export-btn');
    if (tableExportBtn) {
      e.preventDefault();
      const texp = tableExportBtn.dataset.texp;
      if (texp === 'excel') exportTableExcel();
      else if (texp === 'csv') exportTableCSV();
      else if (texp === 'html') exportTableHTML();
      else if (texp === 'clipboard') copyTableToClipboard();
    }
  });
}

// ── Appearance Controls (color pickers + size sliders) ──
function getChartElementTypes(chartType) {
  const markerCharts = ['scatter', 'grouped_scatter', 'bubble', 'beeswarm', 'volcano', 'pca'];
  const lineCharts = ['line', 'multi_line', 'area', 'survival', 'roc', 'dca'];
  const barCharts = ['bar', 'stacked_bar', 'error_bar'];
  const boxCharts = ['box', 'violin', 'box_scatter', 'violin_box_scatter', 'raincloud', 'beanplot'];
  const heatmapCharts = ['heatmap', 'correlation_heatmap', 'missingness_heatmap'];
  const mapCharts = ['china_map', 'world_map'];
  const forestCharts = ['forest', 'dumbbell'];
  const histCharts = ['histogram', 'density'];

  const types = [];
  if (markerCharts.includes(chartType)) types.push('marker');
  if (lineCharts.includes(chartType)) types.push('line');
  if (barCharts.includes(chartType)) types.push('bar');
  if (boxCharts.includes(chartType)) types.push('marker', 'line');
  if (forestCharts.includes(chartType)) types.push('marker', 'line');
  if (histCharts.includes(chartType)) types.push('bar');
  if (heatmapCharts.includes(chartType) || mapCharts.includes(chartType)) types.push('colorscale');
  return [...new Set(types)];
}

function getAppearanceParams(chartType) {
  let params = {};
  if (typeof collectChartParams === 'function' && qsa('.chart-var-select').length > 0) {
    params = collectChartParams();
  }
  return {
    ...(CHART_DEFAULT_VARS[chartType] || {}),
    ...(STATE.currentChartParams || {}),
    ...(params || {}),
  };
}

function getAppearanceData() {
  if (STATE.currentChartSourceData) return STATE.currentChartSourceData;
  if (typeof buildDataFromState === 'function') return buildDataFromState();
  return {};
}

function uniqueValueCount(data, column) {
  if (!data || !column || !Array.isArray(data[column])) return 0;
  const values = data[column]
    .map(v => String(v ?? '').trim())
    .filter(v => v !== '' && v.toLowerCase() !== 'nan' && v.toLowerCase() !== 'null');
  return new Set(values).size;
}

function selectedValueCount(params, key) {
  const val = params ? params[key] : null;
  if (Array.isArray(val)) return val.filter(Boolean).length;
  return val ? 1 : 0;
}

function getAppearanceColorCount(chartType, palette) {
  const params = getAppearanceParams(chartType);
  const data = getAppearanceData();
  let count = 1;

  const groupColumnByChart = {
    grouped_scatter: 'color_var',
    multi_line: 'color_var',
    stacked_bar: 'color_var',
    survival: 'color_var',
    pca: 'color_var',
    raincloud: 'x_var',
    beeswarm: 'x_var',
    beanplot: 'x_var',
  };

  if (chartType === 'bar') {
    count = uniqueValueCount(data, params.x_var) || 1;
  } else if (chartType === 'dumbbell') {
    count = 2;
  } else if (['venn', 'upset', 'dca', 'correlation_heatmap'].includes(chartType)) {
    count = selectedValueCount(params, 'value_vars') || 1;
  } else if (groupColumnByChart[chartType]) {
    const groupCount = uniqueValueCount(data, params[groupColumnByChart[chartType]]);
    count = groupCount || selectedValueCount(params, groupColumnByChart[chartType]) || 1;
  }

  const maxColors = Math.max(1, (palette || []).length || 1);
  return Math.max(1, Math.min(count, maxColors));
}

function renderAppearanceControls() {
  const container = el('appearanceControls');
  if (!container) return;
  const chartType = STATE.activeChartType;
  if (!chartType) {
    container.innerHTML = '';
    return;
  }

  const elemTypes = getChartElementTypes(chartType);
  const theme = getActiveTheme();
  const palette = theme.colorway || ['#2E6F9E', '#D95F59', '#2A9D8F', '#E9A93A', '#6F5AA7', '#7C8B52'];

  let html = '';

  // Color pickers for each trace/group (skip for heatmap types which use their own colorscale)
  const heatmapTypes = ['heatmap', 'correlation_heatmap', 'missingness_heatmap'];
  const numColors = heatmapTypes.includes(chartType) ? 0 : getAppearanceColorCount(chartType, palette);
  if (!heatmapTypes.includes(chartType)) {
    html += '<div class="appearance-section">';
    html += '<label class="appearance-label">配色方案</label>';
    html += '<div class="color-picker-row" id="colorPickerRow">';
    if (STATE.userColors) {
      STATE.userColors = STATE.userColors.slice(0, numColors);
    }
    for (let i = 0; i < numColors; i++) {
      const currentColor = (STATE.userColors && STATE.userColors[i]) || palette[i % palette.length];
      html += `<input type="color" class="color-swatch" data-idx="${i}" value="${currentColor}" title="颜色 ${i + 1}">`;
    }
    html += '<button class="color-reset-btn" id="resetColorsBtn" title="重置为主题默认色">重置</button>';
    html += '</div></div>';
  }

  // Size controls based on chart type
  if (elemTypes.includes('marker')) {
    const val = STATE.markerSize || 8;
    html += `<div class="appearance-section">
      <label class="appearance-label">点/标记大小</label>
      <div class="slider-row">
        <input type="range" id="markerSizeInput" min="3" max="20" value="${val}" class="app-slider">
        <span class="slider-val" id="markerSizeVal">${val}</span>
      </div>
    </div>`;

    const shape = STATE.markerShape || 'circle';
    html += `<div class="appearance-section">
      <label class="appearance-label">标记形状</label>
      <div class="shape-select-row">
        <select id="markerShapeInput">
          <option value="circle"${shape === 'circle' ? ' selected' : ''}>● 圆形</option>
          <option value="square"${shape === 'square' ? ' selected' : ''}>■ 方形</option>
          <option value="diamond"${shape === 'diamond' ? ' selected' : ''}>◆ 菱形</option>
          <option value="triangle-up"${shape === 'triangle-up' ? ' selected' : ''}>▲ 三角形</option>
          <option value="triangle-down"${shape === 'triangle-down' ? ' selected' : ''}>▼ 倒三角</option>
          <option value="cross"${shape === 'cross' ? ' selected' : ''}>✚ 十字</option>
          <option value="x"${shape === 'x' ? ' selected' : ''}>✕ X形</option>
          <option value="star"${shape === 'star' ? ' selected' : ''}>★ 星形</option>
          <option value="hexagon"${shape === 'hexagon' ? ' selected' : ''}>⬡ 六边形</option>
          <option value="pentagon"${shape === 'pentagon' ? ' selected' : ''}>⬠ 五边形</option>
        </select>
      </div>
    </div>`;

    const opacity = STATE.markerOpacity != null ? STATE.markerOpacity : 0.88;
    html += `<div class="appearance-section">
      <label class="appearance-label">透明度</label>
      <div class="slider-row">
        <input type="range" id="markerOpacityInput" min="0.1" max="1" step="0.05" value="${opacity}" class="app-slider">
        <span class="slider-val" id="markerOpacityVal">${opacity}</span>
      </div>
    </div>`;
  }

  if (elemTypes.includes('line')) {
    const val = STATE.lineWidth || 2.5;
    html += `<div class="appearance-section">
      <label class="appearance-label">线条宽度</label>
      <div class="slider-row">
        <input type="range" id="lineWidthInput" min="0.5" max="8" step="0.5" value="${val}" class="app-slider">
        <span class="slider-val" id="lineWidthVal">${val}</span>
      </div>
    </div>`;
  }

  if (elemTypes.includes('bar')) {
    const val = STATE.barGap != null ? STATE.barGap : 0.15;
    html += `<div class="appearance-section">
      <label class="appearance-label">柱体间距</label>
      <div class="slider-row">
        <input type="range" id="barGapInput" min="0" max="0.6" step="0.05" value="${val}" class="app-slider">
        <span class="slider-val" id="barGapVal">${val}</span>
      </div>
    </div>`;
  }

  if (!elemTypes.includes('marker') && (elemTypes.includes('bar') || elemTypes.includes('line'))) {
    const opacity = STATE.markerOpacity != null ? STATE.markerOpacity : 0.88;
    html += `<div class="appearance-section">
      <label class="appearance-label">透明度</label>
      <div class="slider-row">
        <input type="range" id="markerOpacityInput" min="0.1" max="1" step="0.05" value="${opacity}" class="app-slider">
        <span class="slider-val" id="markerOpacityVal">${opacity}</span>
      </div>
    </div>`;
  }

  container.innerHTML = html;

  // Bind color pickers
  qsa('.color-swatch', container).forEach(input => {
    input.addEventListener('input', (e) => {
      if (!STATE.userColors) STATE.userColors = [...palette.slice(0, numColors)];
      STATE.userColors[Number(e.target.dataset.idx)] = e.target.value;
    });
    input.addEventListener('change', () => {
      if (STATE.currentPlotlyData && STATE.currentPlotlyData.length > 0) generateChart();
    });
  });

  const resetBtn = el('resetColorsBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      STATE.userColors = null;
      renderAppearanceControls();
      if (STATE.currentPlotlyData && STATE.currentPlotlyData.length > 0) generateChart();
    });
  }

  // Bind sliders
  const markerSlider = el('markerSizeInput');
  if (markerSlider) {
    markerSlider.addEventListener('input', () => {
      STATE.markerSize = Number(markerSlider.value);
      el('markerSizeVal').textContent = markerSlider.value;
    });
    markerSlider.addEventListener('change', () => {
      if (STATE.currentPlotlyData && STATE.currentPlotlyData.length > 0) generateChart();
    });
  }

  const shapeSelect = el('markerShapeInput');
  if (shapeSelect) {
    shapeSelect.addEventListener('change', () => {
      STATE.markerShape = shapeSelect.value;
      if (STATE.currentPlotlyData && STATE.currentPlotlyData.length > 0) generateChart();
    });
  }

  const opacitySlider = el('markerOpacityInput');
  if (opacitySlider) {
    opacitySlider.addEventListener('input', () => {
      STATE.markerOpacity = Number(opacitySlider.value);
      el('markerOpacityVal').textContent = opacitySlider.value;
    });
    opacitySlider.addEventListener('change', () => {
      if (STATE.currentPlotlyData && STATE.currentPlotlyData.length > 0) generateChart();
    });
  }

  const lineSlider = el('lineWidthInput');
  if (lineSlider) {
    lineSlider.addEventListener('input', () => {
      STATE.lineWidth = Number(lineSlider.value);
      el('lineWidthVal').textContent = lineSlider.value;
    });
    lineSlider.addEventListener('change', () => {
      if (STATE.currentPlotlyData && STATE.currentPlotlyData.length > 0) generateChart();
    });
  }

  const barSlider = el('barGapInput');
  if (barSlider) {
    barSlider.addEventListener('input', () => {
      STATE.barGap = Number(barSlider.value);
      el('barGapVal').textContent = barSlider.value;
    });
    barSlider.addEventListener('change', () => {
      if (STATE.currentPlotlyData && STATE.currentPlotlyData.length > 0) generateChart();
    });
  }
}

// ── Data Panel Rendering ───────────────────────────────
function renderDataPanel() {
  const config = getChartConfig(STATE.activeChartType);
  const hasData = (STATE.columns || []).length > 0;

  const meta = el('wsDataMeta');
  if (meta) {
    meta.textContent = hasData
      ? `${STATE.rowCount || 0} 行 · ${STATE.colCount || 0} 列 · ${STATE.uploadId ? STATE.fileName : (STATE.datasetName || '示例')}`
      : (config ? `推荐示例：${config.exampleDataset || 'baseline_table_example'}` : '请先选择图表类型');
  }
}

// ── Flow Line ──────────────────────────────────────────
function updateFlowLine(activeIndex) {
  qsa('.flow-line span').forEach((span, i) => {
    span.classList.toggle('is-active', i < activeIndex);
  });
}

// ── Status Stack ───────────────────────────────────────
function setStatus(msg, isError) {
  const stack = el('statusStack');
  if (!stack) return;
  const div = document.createElement('div');
  div.className = `status-item active${isError ? ' error' : ''}`;
  div.textContent = msg;
  stack.appendChild(div);
  while (stack.children.length > 4) stack.removeChild(stack.firstChild);
}

// ── Metric Grid ────────────────────────────────────────
function updateMetricGrid() {
  const grid = el('metricGrid');
  if (!grid) return;
  const hasData = (STATE.columns || []).length > 0;
  const summary = STATE.summary || {};
  const config = getChartConfig(STATE.activeChartType);

  grid.innerHTML = `
    <div class="summary-card"><span>N</span><strong>${hasData ? (STATE.rowCount || '—') : '--'}</strong><small>样本</small></div>
    <div class="summary-card"><span>Vars</span><strong>${hasData ? (STATE.colCount || '—') : '--'}</strong><small>变量</small></div>
    <div class="summary-card"><span>Missing</span><strong>${hasData ? (summary.missing_percent || '—') : '--'}</strong><small>缺失%</small></div>
    <div class="summary-card"><span>Type</span><strong>${config ? config.icon : '--'}</strong><small>${config ? config.name : '—'}</small></div>
  `;
}

// ── Preview Table ──────────────────────────────────────
function updatePreviewTable() {
  const target = el('previewTable');
  if (!target) return;
  const rows = STATE.previewRows || [];
  const cols = (STATE.columns || []).slice(0, 8);

  if (!rows.length || !cols.length) {
    target.innerHTML = '<div class="empty-state small">等待数据载入</div>';
    return;
  }

  const maxRows = Math.min(rows.length, 5);
  let html = '<table class="three-line"><thead><tr>';
  cols.forEach(c => { html += `<th>${escapeHtml(String(c))}</th>`; });
  html += '</tr></thead><tbody>';
  for (let i = 0; i < maxRows; i++) {
    html += '<tr>';
    cols.forEach(c => {
      const v = rows[i][c];
      html += `<td>${v !== undefined && v !== null ? escapeHtml(String(v)) : ''}</td>`;
    });
    html += '</tr>';
  }
  if (rows.length > maxRows) html += `<caption>前 ${maxRows} 行 / 共 ${rows.length} 行</caption>`;
  html += '</tbody></table>';
  target.innerHTML = html;
}

// ── Dataset Meta ───────────────────────────────────────
function updateDatasetMeta() {
  const meta = el('datasetMeta');
  if (!meta) return;
  const hasData = (STATE.columns || []).length > 0;
  meta.textContent = hasData
    ? `${STATE.fileName || STATE.datasetName || '已载入'} · ${STATE.rowCount || 0} 行 × ${STATE.colCount || 0} 列`
    : '未载入数据';
}

// ── Download List ──────────────────────────────────────
function updateDownloadList() {
  const list = el('downloadList');
  if (!list) return;
  const config = getChartConfig(STATE.activeChartType);

  if (!config) {
    list.className = 'download-list empty';
    list.textContent = '选择图表类型后可导出';
    return;
  }

  const exampleName = config.exampleDataset || 'baseline_table_example';
  list.className = 'download-list';
  list.innerHTML = `<a class="download-link" href="/api/examples/${exampleName}/download" target="_blank" rel="noreferrer"><span>示例 CSV</span><small>${exampleName}.csv</small></a>`;
}

// ── Example List ───────────────────────────────────────
async function loadExampleList() {
  try {
    const examples = await apiGet('/api/examples');
    const list = el('exampleList');
    if (!list) return;
    list.innerHTML = examples.slice(0, 6).map(ex => `
      <a class="download-link" href="/api/examples/${ex.name}/download" target="_blank" rel="noreferrer">
        <span>${ex.name}</span><small>${ex.row_count || '-'}行</small>
      </a>
    `).join('');
  } catch (e) {}
}

// ── Bootstrap ──────────────────────────────────────────
function bootEmptyState() {
  updateMetricGrid();
  updatePreviewTable();
  updateDatasetMeta();
  updateDownloadList();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
