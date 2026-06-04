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
  const generateBtn = el('generateChartBtn');
  if (generateBtn && typeof setLoading === 'function') setLoading(generateBtn, false);
}

// ── Center Panel Tabs ──────────────────────────────────
function initCenterTabs() {
  qsa('.tabs .tab').forEach(tab => {
    tab.addEventListener('click', function() {
      activateWorkspaceTab(this.dataset.tab);
    });
  });
}

function activateWorkspaceTab(tabName) {
  qsa('.tabs .tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
  qsa('.tab-panel').forEach(p => p.classList.remove('active'));
  const target = el(`tab-${tabName}`);
  if (target) target.classList.add('active');
  if (tabName === 'table') buildTableVarControls();
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
    if (typeof activateWorkspaceTab === 'function') activateWorkspaceTab('overview');
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
    const downloadToggle = e.target.closest('#chartDownloadBtn');
    if (downloadToggle) {
      e.preventDefault();
      toggleChartDownloadMenu();
      return;
    }

    const exportBtn = e.target.closest('.export-btn');
    if (exportBtn) {
      e.preventDefault();
      const fmt = exportBtn.dataset.fmt;
      closeChartDownloadMenu();
      if (['png', 'svg', 'tiff', 'pdf'].includes(fmt)) downloadChartImage(fmt);
      else if (fmt === 'csv') downloadChartCSV();
      return;
    }

    if (!e.target.closest('#chartExportBar')) {
      closeChartDownloadMenu();
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

function toggleChartDownloadMenu() {
  const menu = el('chartDownloadMenu');
  const btn = el('chartDownloadBtn');
  if (!menu || !btn) return;
  const willOpen = menu.hidden;
  menu.hidden = !willOpen;
  btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
}

function closeChartDownloadMenu() {
  const menu = el('chartDownloadMenu');
  const btn = el('chartDownloadBtn');
  if (!menu || !btn) return;
  menu.hidden = true;
  btn.setAttribute('aria-expanded', 'false');
}

// ── Appearance Controls (color pickers + size sliders) ──
function getChartElementTypes(chartType) {
  const markerCharts = ['scatter', 'grouped_scatter', 'line', 'multi_line', 'bubble', 'beeswarm', 'volcano', 'pca', 'bland_altman', 'calibration_curve', 'risk_calibration', 'nomogram', 'multi_roc', 'swimmer', 'qq_plot', 'lollipop', 'radar', 'cleveland_dot', 'ridgeline', 'china_bubble_map', 'uk_map', 'world_bubble_map'];
  const lineCharts = ['line', 'multi_line', 'area', 'density', 'survival', 'roc', 'multi_roc', 'risk_calibration', 'nomogram', 'dca', 'slope', 'paired_line', 'calibration_curve', 'qq_plot', 'ridgeline'];
  const barCharts = ['bar', 'stacked_bar', 'horizontal_bar', 'grouped_bar', 'percent_stacked_bar', 'lollipop', 'waterfall', 'swimmer', 'population_pyramid', 'error_bar', 'polar_bar', 'funnel'];
  const boxCharts = ['box', 'violin', 'box_scatter', 'violin_box_scatter', 'raincloud', 'beanplot'];
  const heatmapCharts = ['heatmap', 'correlation_heatmap', 'missingness_heatmap'];
  const mapCharts = ['china_map', 'china_bubble_map', 'world_map', 'world_bubble_map', 'usa_map', 'europe_map', 'uk_map'];
  const forestCharts = ['forest', 'dumbbell'];
  const histCharts = ['histogram'];
  const pieCharts = ['donut', 'pie'];

  const types = [];
  if (markerCharts.includes(chartType)) types.push('marker');
  if (lineCharts.includes(chartType)) types.push('line');
  if (barCharts.includes(chartType)) types.push('bar');
  if (boxCharts.includes(chartType)) types.push('marker', 'line');
  if (forestCharts.includes(chartType)) types.push('marker', 'line');
  if (histCharts.includes(chartType)) types.push('bar');
  if (pieCharts.includes(chartType)) types.push('bar');
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

function getColorScaleCharts() {
  return [
    'heatmap',
    'correlation_heatmap',
    'missingness_heatmap',
    'china_map',
    'china_bubble_map',
    'world_map',
    'world_bubble_map',
    'usa_map',
    'europe_map',
    'uk_map',
  ];
}

function getAppearanceColorCount(chartType, palette) {
  const params = getAppearanceParams(chartType);
  const data = getAppearanceData();
  let count = 1;

  const groupColumnByChart = {
    grouped_scatter: 'color_var',
    grouped_bar: 'color_var',
    percent_stacked_bar: 'color_var',
    histogram: 'color_var',
    density: 'color_var',
    area: 'color_var',
    multi_line: 'color_var',
    stacked_bar: 'color_var',
    slope: 'color_var',
    paired_line: 'color_var',
    waterfall: 'color_var',
    calibration_curve: 'color_var',
    swimmer: 'color_var',
    survival: 'color_var',
    pca: 'color_var',
    bubble: 'color_var',
    radar: 'color_var',
    parallel_coords: 'color_var',
    cleveland_dot: 'color_var',
    raincloud: 'x_var',
    beeswarm: 'x_var',
    beanplot: 'x_var',
    ridgeline: 'x_var',
  };

  const categoryColorByChart = {
    bar: 'x_var',
    horizontal_bar: 'x_var',
    lollipop: 'x_var',
    error_bar: 'x_var',
    box: 'x_var',
    violin: 'x_var',
    box_scatter: 'x_var',
    violin_box_scatter: 'x_var',
    donut: 'x_var',
    pie: 'x_var',
    funnel: 'x_var',
    polar_bar: 'x_var',
  };

  if (getColorScaleCharts().includes(chartType)) {
    count = chartType === 'missingness_heatmap' ? 2 : 3;
  } else if (chartType === 'volcano') {
    count = 3;
  } else if (chartType === 'forest') {
    count = 2;
  } else if (chartType === 'risk_calibration') {
    count = 4;
  } else if (['dumbbell', 'population_pyramid'].includes(chartType)) {
    count = 2;
  } else if (['sankey', 'treemap'].includes(chartType)) {
    const allCols = data ? Object.keys(data) : [];
    count = Math.min(allCols.length, 12);
  } else if (['venn', 'upset', 'dca', 'multi_roc', 'nomogram'].includes(chartType)) {
    count = selectedValueCount(params, 'value_vars') || 1;
  } else if (categoryColorByChart[chartType]) {
    const categoryCount = uniqueValueCount(data, params[categoryColorByChart[chartType]]);
    count = categoryCount || 1;
  } else if (groupColumnByChart[chartType]) {
    const groupCount = uniqueValueCount(data, params[groupColumnByChart[chartType]]);
    count = groupCount || selectedValueCount(params, groupColumnByChart[chartType]) || 1;
  }

  const maxColors = Math.max(1, (palette || []).length || 1);
  return Math.max(1, Math.min(count, maxColors));
}

function getAppearanceColorLabels(chartType, count) {
  const labelsByChart = {
    risk_calibration: ['校准曲线/点', '样本分布柱', '95%CI 误差线', '理想校准虚线'],
    heatmap: ['低值色', '中值色', '高值色'],
    correlation_heatmap: ['负相关色', '零相关色', '正相关色'],
    missingness_heatmap: ['完整值色', '缺失值色'],
    volcano: ['下调', '不显著', '上调'],
    forest: ['保护方向', '风险方向'],
    china_map: ['低值色', '中值色', '高值色'],
    china_bubble_map: ['低值色', '中值色', '高值色'],
    world_map: ['低值色', '中值色', '高值色'],
    world_bubble_map: ['低值色', '中值色', '高值色'],
    usa_map: ['低值色', '中值色', '高值色'],
    europe_map: ['低值色', '中值色', '高值色'],
    uk_map: ['低值色', '中值色', '高值色'],
    dca: ['模型曲线 1', '模型曲线 2', '模型曲线 3', '模型曲线 4', '模型曲线 5'],
    multi_roc: ['ROC 曲线 1', 'ROC 曲线 2', 'ROC 曲线 3', 'ROC 曲线 4', 'ROC 曲线 5'],
    nomogram: ['风险因子 1', '风险因子 2', '风险因子 3', '风险因子 4', '风险因子 5', '风险因子 6'],
  };
  const base = labelsByChart[chartType] || [];
  return Array.from({ length: count }, (_, i) => base[i] || `颜色 ${i + 1}`);
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

  const colorScaleCharts = getColorScaleCharts();
  const numColors = getAppearanceColorCount(chartType, palette);
  if (numColors > 0) {
    const colorLabels = getAppearanceColorLabels(chartType, numColors);
    html += '<div class="appearance-section">';
    html += `<label class="appearance-label">${colorScaleCharts.includes(chartType) ? '色阶配色' : '配色方案'}</label>`;
    html += '<div class="color-picker-row" id="colorPickerRow">';
    if (STATE.userColors) {
      STATE.userColors = STATE.userColors.slice(0, numColors);
    }
    for (let i = 0; i < numColors; i++) {
      const currentColor = (STATE.userColors && STATE.userColors[i]) || palette[i % palette.length];
      const colorLabel = escapeAttr(colorLabels[i] || `Color ${i + 1}`);
      html += `<input type="color" class="color-swatch" data-idx="${i}" value="${currentColor}" title="${colorLabel}" aria-label="${colorLabel}">`;
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
  const cols = STATE.columns || [];

  if (!rows.length || !cols.length) {
    target.innerHTML = '<div class="empty-state small">等待数据载入</div>';
    return;
  }

  let html = '<table class="three-line"><thead><tr>';
  cols.forEach(c => { html += `<th>${escapeHtml(String(c))}</th>`; });
  html += '</tr></thead><tbody>';
  for (let i = 0; i < rows.length; i++) {
    html += '<tr>';
    cols.forEach(c => {
      const v = rows[i][c];
      html += `<td>${v !== undefined && v !== null ? escapeHtml(String(v)) : ''}</td>`;
    });
    html += '</tr>';
  }
  const totalRows = STATE.rowCount || rows.length;
  if (totalRows > rows.length) html += `<caption>显示前 ${rows.length} 行 / 共 ${totalRows} 行</caption>`;
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

// 5.7.3: trend charts use one color for one aggregate curve, and group-count
// colors when a grouping variable is selected.
(function finalTrendAppearance573() {
  const baseGetChartElementTypes = getChartElementTypes;
  getChartElementTypes = function trendGetChartElementTypes(chartType) {
    const types = baseGetChartElementTypes(chartType) || [];
    if (['line', 'multi_line', 'area'].includes(chartType)) {
      types.push('line', 'marker');
    }
    return [...new Set(types)];
  };

  const baseGetAppearanceColorCount = getAppearanceColorCount;
  getAppearanceColorCount = function trendGetAppearanceColorCount(chartType, palette) {
    if (['line', 'multi_line', 'area'].includes(chartType)) {
      const params = getAppearanceParams(chartType);
      const data = getAppearanceData();
      const groupCount = params.color_var ? uniqueValueCount(data, params.color_var) : 0;
      const maxColors = Math.max(1, (palette || []).length || 1);
      return Math.max(1, Math.min(groupCount || 1, maxColors));
    }
    return baseGetAppearanceColorCount(chartType, palette);
  };

  const baseGetAppearanceColorLabels = getAppearanceColorLabels;
  getAppearanceColorLabels = function trendGetAppearanceColorLabels(chartType, count) {
    if (['line', 'multi_line', 'area'].includes(chartType)) {
      const params = getAppearanceParams(chartType);
      const data = getAppearanceData();
      const groupValues = params.color_var && data && Array.isArray(data[params.color_var])
        ? [...new Set(data[params.color_var].map(v => String(v ?? '').trim()).filter(Boolean))]
        : [];
      if (groupValues.length > 1) {
        return Array.from({ length: count }, (_, i) => groupValues[i] || `组 ${i + 1}`);
      }
      return Array.from({ length: count }, (_, i) => (i === 0 ? '均值趋势' : `颜色 ${i + 1}`));
    }
    return baseGetAppearanceColorLabels(chartType, count);
  };
})();

// 5.7.2: final runtime override. Keep the entire example library visible in
// the left rail; the list itself scrolls when the templates exceed the panel.
async function loadExampleList() {
  try {
    const examples = await apiGet('/api/examples');
    const list = el('exampleList');
    if (!list) return;
    const items = (examples || []).slice().sort((a, b) => String(a.name).localeCompare(String(b.name)));
    list.innerHTML = items.map(ex => `
      <a class="download-link" href="/api/examples/${ex.name}/download" target="_blank" rel="noreferrer">
        <span>${escapeHtml(ex.name)}</span><small>${ex.row_count || '-'}\u884c</small>
      </a>
    `).join('');
  } catch (e) {}
}

// 5.7.1: extended controls and full-height example library.
(function applyExtendedChartUiPatch() {
  const extraMarkerCharts = [
    'ecdf_plot', 'mean_ci_plot', 'strip_plot', 'step_plot',
    'precision_recall', 'lift_chart', 'time_auc_curve', 'decision_impact_curve',
    'usa_bubble_map', 'europe_bubble_map', 'uk_tile_map', 'china_rank_map', 'world_label_map',
    'waffle_chart', 'chord_flow', 'radial_tree'
  ];
  const extraLineCharts = [
    'ecdf_plot', 'step_plot', 'precision_recall', 'lift_chart', 'time_auc_curve',
    'decision_impact_curve', 'chord_flow', 'radial_tree'
  ];
  const extraBarCharts = ['mean_ci_plot', 'pareto_chart', 'clinical_decile_plot', 'waffle_chart'];
  const extraHeatmapCharts = ['mosaic_plot', 'subgroup_effect_matrix'];
  const extraColorScaleCharts = [
    'mosaic_plot', 'subgroup_effect_matrix',
    'usa_bubble_map', 'europe_bubble_map', 'uk_tile_map', 'china_rank_map', 'world_label_map'
  ];

  const baseGetChartElementTypes = getChartElementTypes;
  getChartElementTypes = function patchedGetChartElementTypes(chartType) {
    const types = baseGetChartElementTypes(chartType) || [];
    if (extraMarkerCharts.includes(chartType)) types.push('marker');
    if (extraLineCharts.includes(chartType)) types.push('line');
    if (extraBarCharts.includes(chartType)) types.push('bar');
    if (extraHeatmapCharts.includes(chartType) || extraColorScaleCharts.includes(chartType)) types.push('colorscale');
    return [...new Set(types)];
  };

  const baseGetColorScaleCharts = getColorScaleCharts;
  getColorScaleCharts = function patchedGetColorScaleCharts() {
    return [...new Set([...(baseGetColorScaleCharts() || []), ...extraColorScaleCharts])];
  };

  const baseGetAppearanceColorCount = getAppearanceColorCount;
  getAppearanceColorCount = function patchedGetAppearanceColorCount(chartType, palette) {
    const params = getAppearanceParams(chartType);
    const data = getAppearanceData();
    const maxColors = Math.max(1, (palette || []).length || 1);
    const byGroup = (key) => Math.max(1, Math.min(uniqueValueCount(data, params[key]), maxColors));
    const byVars = () => Math.max(1, Math.min(selectedValueCount(params, 'value_vars') || 1, maxColors));
    const customCounts = {
      ecdf_plot: () => byGroup('color_var'),
      step_plot: () => byGroup('color_var'),
      strip_plot: () => byGroup('x_var'),
      mean_ci_plot: () => byGroup('x_var'),
      pareto_chart: () => byGroup('x_var'),
      precision_recall: () => 2,
      lift_chart: () => byVars(),
      time_auc_curve: () => byVars(),
      decision_impact_curve: () => Math.min(Math.max(byVars(), 3), maxColors),
      clinical_decile_plot: () => 2,
      sunburst_chart: () => Math.min(Math.max(uniqueValueCount(data, params.color_var || params.parent_var), 3), maxColors),
      waffle_chart: () => byGroup('x_var'),
      mosaic_plot: () => 3,
      chord_flow: () => Math.min(8, maxColors),
      radial_tree: () => Math.min(8, maxColors),
    };
    if (customCounts[chartType]) return customCounts[chartType]();
    if (extraColorScaleCharts.includes(chartType)) return Math.min(3, maxColors);
    return baseGetAppearanceColorCount(chartType, palette);
  };

  const baseGetAppearanceColorLabels = getAppearanceColorLabels;
  getAppearanceColorLabels = function patchedGetAppearanceColorLabels(chartType, count) {
    const labels = {
      precision_recall: ['Precision-Recall', '\u57fa\u7ebf\u9633\u6027\u7387'],
      lift_chart: ['\u6a21\u578b 1', '\u6a21\u578b 2', '\u6a21\u578b 3', '\u6a21\u578b 4'],
      time_auc_curve: ['\u6a21\u578b 1', '\u6a21\u578b 2', '\u6a21\u578b 3', '\u6a21\u578b 4'],
      decision_impact_curve: ['\u51c0\u6536\u76ca', 'Treat all', 'Treat none', '\u6269\u5c55\u6a21\u578b'],
      clinical_decile_plot: ['\u89c2\u5bdf\u98ce\u9669', '\u9884\u6d4b\u98ce\u9669'],
      mosaic_plot: ['\u4f4e\u9891', '\u4e2d\u9891', '\u9ad8\u9891'],
      subgroup_effect_matrix: ['\u4fdd\u62a4\u65b9\u5411', '\u4e2d\u6027', '\u98ce\u9669\u65b9\u5411'],
      usa_bubble_map: ['\u4f4e\u503c\u8272', '\u4e2d\u503c\u8272', '\u9ad8\u503c\u8272'],
      europe_bubble_map: ['\u4f4e\u503c\u8272', '\u4e2d\u503c\u8272', '\u9ad8\u503c\u8272'],
      uk_tile_map: ['\u4f4e\u503c\u8272', '\u4e2d\u503c\u8272', '\u9ad8\u503c\u8272'],
      china_rank_map: ['\u4f4e\u503c\u8272', '\u4e2d\u503c\u8272', '\u9ad8\u503c\u8272'],
      world_label_map: ['\u4f4e\u503c\u8272', '\u4e2d\u503c\u8272', '\u9ad8\u503c\u8272'],
    };
    if (labels[chartType]) {
      return Array.from({ length: count }, (_, i) => labels[chartType][i] || `\u989c\u8272 ${i + 1}`);
    }
    return baseGetAppearanceColorLabels(chartType, count);
  };
})();

async function loadExampleList() {
  try {
    const examples = await apiGet('/api/examples');
    const list = el('exampleList');
    if (!list) return;
    const items = (examples || []).slice().sort((a, b) => String(a.name).localeCompare(String(b.name)));
    list.innerHTML = items.map(ex => `
      <a class="download-link" href="/api/examples/${ex.name}/download" target="_blank" rel="noreferrer">
        <span>${escapeHtml(ex.name)}</span><small>${ex.row_count || '-'}\u884c</small>
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

function escapeAttr(value) {
  return escapeHtml(value);
}

// Restored clean UI renderers for the 10:48 state. Keep text as Unicode escapes to avoid Windows encoding drift.
function textCN(value) { return value; }

function renderMiniChartGrid(category) {
  const grid = el('miniChartGrid');
  if (!grid) return;
  const charts = Object.values(CHART_CATALOG)
    .filter(c => c.category === category)
    .map(c => (typeof getChartConfig === 'function' ? getChartConfig(c.id) : c) || c);
  grid.innerHTML = charts.map(chart => `
    <div class="mini-chart-card ${STATE.activeChartType === chart.id ? 'selected' : ''}" data-chart="${chart.id}">
      <span class="mini-chart-icon">${escapeHtml(chart.icon || '')}</span>
      <span class="mini-chart-name">${escapeHtml(chart.name || chart.id)}</span>
    </div>
  `).join('');
}

function selectChart(chartId) {
  if (STATE.activeChartType && STATE.activeChartType !== chartId) saveActiveChartWorkspace();
  STATE.activeChartType = chartId;
  loadChartWorkspace(chartId);
  STATE.currentPlotlyData = null;
  STATE.currentPlotlyLayout = null;
  STATE.currentChartSourceData = null;

  const config = getChartConfig(chartId);
  if (!STATE.uploadId && !STATE.datasetName && config && config.exampleDataset) STATE.datasetName = config.exampleDataset;

  qsa('.mini-chart-card').forEach(c => c.classList.remove('selected'));
  const activeCard = qs(`.mini-chart-card[data-chart="${chartId}"]`);
  if (activeCard) activeCard.classList.add('selected');

  const label = el('selectedChartLabel');
  if (label) label.textContent = config ? config.name : chartId;
  const previewTitle = el('chartPreviewTitle');
  if (previewTitle) previewTitle.textContent = config ? config.name : '\u56fe\u5f62\u9884\u89c8';
  const previewBadge = el('chartPreviewBadge');
  if (previewBadge) previewBadge.textContent = config ? (config.description || '') : '';

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
  container.innerHTML = `<div class="empty-state">${config ? `\u5df2\u9009\u62e9\u300c${escapeHtml(config.name)}\u300d\uff0c\u8f7d\u5165\u6570\u636e\u540e\u70b9\u51fb\u751f\u6210` : '\u8bf7\u5728\u5de6\u4fa7\u9009\u62e9\u56fe\u8868\u7c7b\u578b'}</div>`;
  const exportBar = el('chartExportBar');
  if (exportBar) exportBar.style.display = 'none';
}

async function doLoadExample() {
  if (!STATE.activeChartType) {
    const firstCard = qs('.mini-chart-card');
    if (firstCard && firstCard.dataset.chart) selectChart(firstCard.dataset.chart);
    else { toast('\u8bf7\u5148\u9009\u62e9\u56fe\u8868\u7c7b\u578b', 'info'); return; }
  }
  const config = getChartConfig(STATE.activeChartType);
  if (!config) { toast('\u8bf7\u5148\u9009\u62e9\u56fe\u8868\u7c7b\u578b', 'info'); return; }
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
    if (typeof activateWorkspaceTab === 'function') activateWorkspaceTab('overview');
    setStatus('\u6570\u636e\u5df2\u8f7d\u5165');
    toast(`\u5df2\u52a0\u8f7d\u300c${config.name}\u300d\u793a\u4f8b\u6570\u636e`, 'success');
  } catch(e) {
    toast('\u52a0\u8f7d\u793a\u4f8b\u5931\u8d25: ' + e.message, 'error');
  } finally {
    if (loadBtn) setLoading(loadBtn, false);
  }
}

function initChartThemeSelect() {
  const sel = el('chartThemeSelect');
  if (!sel) return;
  sel.value = STATE.chartTheme || 'cnsTheme';
  sel.addEventListener('change', () => {
    STATE.chartTheme = sel.value;
    STATE.userColors = null;
    renderAppearanceControls();
    toast('\u4e3b\u9898: ' + (CHART_THEMES[sel.value]?.name || sel.value), 'info');
    if (STATE.currentPlotlyData && STATE.currentPlotlyData.length > 0) generateChart();
  });
}

function getAppearanceColorLabels(chartType, count) {
  const labelsByChart = {
    risk_calibration: ['\u6821\u51c6\u66f2\u7ebf/\u70b9', '\u6837\u672c\u5206\u5e03\u67f1', '95%CI \u8bef\u5dee\u7ebf', '\u7406\u60f3\u6821\u51c6\u865a\u7ebf'],
    heatmap: ['\u4f4e\u503c\u8272', '\u4e2d\u503c\u8272', '\u9ad8\u503c\u8272'],
    correlation_heatmap: ['\u8d1f\u76f8\u5173\u8272', '\u96f6\u76f8\u5173\u8272', '\u6b63\u76f8\u5173\u8272'],
    missingness_heatmap: ['\u5b8c\u6574\u503c\u8272', '\u7f3a\u5931\u503c\u8272'],
    volcano: ['\u4e0b\u8c03', '\u4e0d\u663e\u8457', '\u4e0a\u8c03'],
    forest: ['\u4fdd\u62a4\u65b9\u5411', '\u98ce\u9669\u65b9\u5411'],
    china_map: ['\u4f4e\u503c\u8272', '\u4e2d\u503c\u8272', '\u9ad8\u503c\u8272'],
    china_bubble_map: ['\u4f4e\u503c\u8272', '\u4e2d\u503c\u8272', '\u9ad8\u503c\u8272'],
    world_map: ['\u4f4e\u503c\u8272', '\u4e2d\u503c\u8272', '\u9ad8\u503c\u8272'],
    world_bubble_map: ['\u4f4e\u503c\u8272', '\u4e2d\u503c\u8272', '\u9ad8\u503c\u8272'],
    usa_map: ['\u4f4e\u503c\u8272', '\u4e2d\u503c\u8272', '\u9ad8\u503c\u8272'],
    europe_map: ['\u4f4e\u503c\u8272', '\u4e2d\u503c\u8272', '\u9ad8\u503c\u8272'],
    uk_map: ['\u4f4e\u503c\u8272', '\u4e2d\u503c\u8272', '\u9ad8\u503c\u8272'],
    dca: ['\u6a21\u578b\u66f2\u7ebf 1', '\u6a21\u578b\u66f2\u7ebf 2', '\u6a21\u578b\u66f2\u7ebf 3', '\u6a21\u578b\u66f2\u7ebf 4', '\u6a21\u578b\u66f2\u7ebf 5'],
    multi_roc: ['ROC \u66f2\u7ebf 1', 'ROC \u66f2\u7ebf 2', 'ROC \u66f2\u7ebf 3', 'ROC \u66f2\u7ebf 4', 'ROC \u66f2\u7ebf 5'],
    nomogram: ['\u98ce\u9669\u56e0\u5b50 1', '\u98ce\u9669\u56e0\u5b50 2', '\u98ce\u9669\u56e0\u5b50 3', '\u98ce\u9669\u56e0\u5b50 4', '\u98ce\u9669\u56e0\u5b50 5', '\u98ce\u9669\u56e0\u5b50 6'],
  };
  const base = labelsByChart[chartType] || [];
  return Array.from({ length: count }, (_, i) => base[i] || `\u989c\u8272 ${i + 1}`);
}

function renderAppearanceControls() {
  const container = el('appearanceControls');
  if (!container) return;
  const chartType = STATE.activeChartType;
  if (!chartType) { container.innerHTML = ''; return; }
  const elemTypes = getChartElementTypes(chartType);
  const theme = getActiveTheme();
  const palette = theme.colorway || ['#2E6F9E', '#D95F59', '#2A9D8F', '#E9A93A', '#6F5AA7', '#7C8B52'];
  const colorScaleCharts = getColorScaleCharts();
  const numColors = getAppearanceColorCount(chartType, palette);
  let html = '';
  if (numColors > 0) {
    const colorLabels = getAppearanceColorLabels(chartType, numColors);
    html += '<div class="appearance-section">';
    html += `<label class="appearance-label">${colorScaleCharts.includes(chartType) ? '\u8272\u9636\u914d\u8272' : '\u914d\u8272\u65b9\u6848'}</label>`;
    html += '<div class="color-picker-row" id="colorPickerRow">';
    if (STATE.userColors) STATE.userColors = STATE.userColors.slice(0, numColors);
    for (let i = 0; i < numColors; i++) {
      const currentColor = (STATE.userColors && STATE.userColors[i]) || palette[i % palette.length];
      const colorLabel = escapeAttr(colorLabels[i] || `Color ${i + 1}`);
      html += `<input type="color" class="color-swatch" data-idx="${i}" value="${currentColor}" title="${colorLabel}" aria-label="${colorLabel}">`;
    }
    html += '<button class="color-reset-btn" id="resetColorsBtn" title="\u91cd\u7f6e\u4e3a\u4e3b\u9898\u9ed8\u8ba4\u8272">\u91cd\u7f6e</button>';
    html += '</div></div>';
  }
  if (elemTypes.includes('marker')) {
    const val = STATE.markerSize || 8;
    const shape = STATE.markerShape || 'circle';
    const opacity = STATE.markerOpacity != null ? STATE.markerOpacity : 0.88;
    html += `<div class="appearance-section"><label class="appearance-label">\u70b9/\u6807\u8bb0\u5927\u5c0f</label><div class="slider-row"><input type="range" id="markerSizeInput" min="3" max="20" value="${val}" class="app-slider"><span class="slider-val" id="markerSizeVal">${val}</span></div></div>`;
    html += `<div class="appearance-section"><label class="appearance-label">\u6807\u8bb0\u5f62\u72b6</label><div class="shape-select-row"><select id="markerShapeInput">
      <option value="circle"${shape === 'circle' ? ' selected' : ''}>\u25cf \u5706\u5f62</option>
      <option value="square"${shape === 'square' ? ' selected' : ''}>\u25a0 \u65b9\u5f62</option>
      <option value="diamond"${shape === 'diamond' ? ' selected' : ''}>\u25c6 \u83f1\u5f62</option>
      <option value="triangle-up"${shape === 'triangle-up' ? ' selected' : ''}>\u25b2 \u4e09\u89d2\u5f62</option>
      <option value="triangle-down"${shape === 'triangle-down' ? ' selected' : ''}>\u25bc \u5012\u4e09\u89d2</option>
      <option value="cross"${shape === 'cross' ? ' selected' : ''}>+ \u5341\u5b57</option>
      <option value="x"${shape === 'x' ? ' selected' : ''}>x X\u5f62</option>
      <option value="star"${shape === 'star' ? ' selected' : ''}>\u2605 \u661f\u5f62</option>
      <option value="hexagon"${shape === 'hexagon' ? ' selected' : ''}>\u2b22 \u516d\u8fb9\u5f62</option>
      <option value="pentagon"${shape === 'pentagon' ? ' selected' : ''}>\u2b1f \u4e94\u8fb9\u5f62</option>
    </select></div></div>`;
    html += `<div class="appearance-section"><label class="appearance-label">\u900f\u660e\u5ea6</label><div class="slider-row"><input type="range" id="markerOpacityInput" min="0.1" max="1" step="0.05" value="${opacity}" class="app-slider"><span class="slider-val" id="markerOpacityVal">${opacity}</span></div></div>`;
  }
  if (elemTypes.includes('line')) {
    const val = STATE.lineWidth || 2.5;
    html += `<div class="appearance-section"><label class="appearance-label">\u7ebf\u6761\u5bbd\u5ea6</label><div class="slider-row"><input type="range" id="lineWidthInput" min="0.5" max="8" step="0.5" value="${val}" class="app-slider"><span class="slider-val" id="lineWidthVal">${val}</span></div></div>`;
  }
  if (elemTypes.includes('bar')) {
    const val = STATE.barGap != null ? STATE.barGap : 0.15;
    html += `<div class="appearance-section"><label class="appearance-label">\u67f1\u4f53\u95f4\u8ddd</label><div class="slider-row"><input type="range" id="barGapInput" min="0" max="0.6" step="0.05" value="${val}" class="app-slider"><span class="slider-val" id="barGapVal">${val}</span></div></div>`;
  }
  if (!elemTypes.includes('marker') && (elemTypes.includes('bar') || elemTypes.includes('line'))) {
    const opacity = STATE.markerOpacity != null ? STATE.markerOpacity : 0.88;
    html += `<div class="appearance-section"><label class="appearance-label">\u900f\u660e\u5ea6</label><div class="slider-row"><input type="range" id="markerOpacityInput" min="0.1" max="1" step="0.05" value="${opacity}" class="app-slider"><span class="slider-val" id="markerOpacityVal">${opacity}</span></div></div>`;
  }
  container.innerHTML = html;
  bindAppearanceControlEvents(container);
}

function bindAppearanceControlEvents(container) {
  qsa('.color-swatch', container).forEach(input => {
    input.addEventListener('input', (e) => {
      const theme = getActiveTheme();
      const palette = theme.colorway || ['#2E6F9E', '#D95F59', '#2A9D8F', '#E9A93A'];
      if (!STATE.userColors) STATE.userColors = [...palette.slice(0, qsa('.color-swatch', container).length)];
      STATE.userColors[Number(e.target.dataset.idx)] = e.target.value;
    });
    input.addEventListener('change', () => { if (STATE.currentPlotlyData?.length) generateChart(); });
  });
  const resetBtn = el('resetColorsBtn');
  if (resetBtn) resetBtn.addEventListener('click', () => { STATE.userColors = null; renderAppearanceControls(); if (STATE.currentPlotlyData?.length) generateChart(); });
  const markerSlider = el('markerSizeInput');
  if (markerSlider) {
    markerSlider.addEventListener('input', () => { STATE.markerSize = Number(markerSlider.value); el('markerSizeVal').textContent = markerSlider.value; });
    markerSlider.addEventListener('change', () => { if (STATE.currentPlotlyData?.length) generateChart(); });
  }
  const shapeSelect = el('markerShapeInput');
  if (shapeSelect) shapeSelect.addEventListener('change', () => { STATE.markerShape = shapeSelect.value; if (STATE.currentPlotlyData?.length) generateChart(); });
  const opacitySlider = el('markerOpacityInput');
  if (opacitySlider) {
    opacitySlider.addEventListener('input', () => { STATE.markerOpacity = Number(opacitySlider.value); el('markerOpacityVal').textContent = opacitySlider.value; });
    opacitySlider.addEventListener('change', () => { if (STATE.currentPlotlyData?.length) generateChart(); });
  }
  const lineSlider = el('lineWidthInput');
  if (lineSlider) {
    lineSlider.addEventListener('input', () => { STATE.lineWidth = Number(lineSlider.value); el('lineWidthVal').textContent = lineSlider.value; });
    lineSlider.addEventListener('change', () => { if (STATE.currentPlotlyData?.length) generateChart(); });
  }
  const barSlider = el('barGapInput');
  if (barSlider) {
    barSlider.addEventListener('input', () => { STATE.barGap = Number(barSlider.value); el('barGapVal').textContent = barSlider.value; });
    barSlider.addEventListener('change', () => { if (STATE.currentPlotlyData?.length) generateChart(); });
  }
}

function renderDataPanel() {
  const config = getChartConfig(STATE.activeChartType);
  const hasData = (STATE.columns || []).length > 0;
  const meta = el('wsDataMeta');
  if (meta) {
    meta.textContent = hasData
      ? `${STATE.rowCount || 0} \u884c · ${STATE.colCount || 0} \u5217 · ${STATE.uploadId ? STATE.fileName : (STATE.datasetName || '\u793a\u4f8b')}`
      : (config ? `\u63a8\u8350\u793a\u4f8b\uff1a${config.exampleDataset || 'baseline_table_example'}` : '\u8bf7\u5148\u9009\u62e9\u56fe\u8868\u7c7b\u578b');
  }
}

function updateMetricGrid() {
  const grid = el('metricGrid');
  if (!grid) return;
  const hasData = (STATE.columns || []).length > 0;
  const summary = STATE.summary || {};
  const config = getChartConfig(STATE.activeChartType);
  grid.innerHTML = `
    <div class="summary-card"><span>N</span><strong>${hasData ? (STATE.rowCount || '-') : '--'}</strong><small>\u6837\u672c</small></div>
    <div class="summary-card"><span>Vars</span><strong>${hasData ? (STATE.colCount || '-') : '--'}</strong><small>\u53d8\u91cf</small></div>
    <div class="summary-card"><span>Missing</span><strong>${hasData ? (summary.missing_percent || '-') : '--'}</strong><small>\u7f3a\u5931%</small></div>
    <div class="summary-card"><span>Type</span><strong>${config ? escapeHtml(config.icon || '--') : '--'}</strong><small>${config ? escapeHtml(config.name) : '-'}</small></div>
  `;
}

function updatePreviewTable() {
  const target = el('previewTable');
  if (!target) return;
  const rows = STATE.previewRows || [];
  const cols = STATE.columns || [];
  if (!rows.length || !cols.length) {
    target.innerHTML = '<div class="empty-state small">\u7b49\u5f85\u6570\u636e\u8f7d\u5165</div>';
    return;
  }
  let html = '<table class="three-line"><thead><tr>';
  cols.forEach(c => { html += `<th>${escapeHtml(String(c))}</th>`; });
  html += '</tr></thead><tbody>';
  for (let i = 0; i < rows.length; i++) {
    html += '<tr>';
    cols.forEach(c => {
      const v = rows[i][c];
      html += `<td>${v !== undefined && v !== null ? escapeHtml(String(v)) : ''}</td>`;
    });
    html += '</tr>';
  }
  const totalRows = STATE.rowCount || rows.length;
  if (totalRows > rows.length) html += `<caption>\u663e\u793a\u524d ${rows.length} \u884c / \u5171 ${totalRows} \u884c</caption>`;
  html += '</tbody></table>';
  target.innerHTML = html;
}

function updateDatasetMeta() {
  const meta = el('datasetMeta');
  if (!meta) return;
  const hasData = (STATE.columns || []).length > 0;
  meta.textContent = hasData
    ? `${STATE.fileName || STATE.datasetName || '\u5df2\u8f7d\u5165'} · ${STATE.rowCount || 0} \u884c × ${STATE.colCount || 0} \u5217`
    : '\u672a\u8f7d\u5165\u6570\u636e';
}

function updateDownloadList() {
  const list = el('downloadList');
  if (!list) return;
  const config = getChartConfig(STATE.activeChartType);
  if (!config) {
    list.className = 'download-list empty';
    list.textContent = '\u9009\u62e9\u56fe\u8868\u7c7b\u578b\u540e\u53ef\u5bfc\u51fa';
    return;
  }
  const exampleName = config.exampleDataset || 'baseline_table_example';
  list.className = 'download-list';
  list.innerHTML = `<a class="download-link" href="/api/examples/${exampleName}/download" target="_blank" rel="noreferrer"><span>\u793a\u4f8b CSV</span><small>${exampleName}.csv</small></a>`;
}

async function loadExampleList() {
  try {
    const examples = await apiGet('/api/examples');
    const list = el('exampleList');
    if (!list) return;
    const sorted = Array.isArray(examples)
      ? examples.slice().sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
      : [];
    list.innerHTML = sorted.map(ex => `
      <a class="download-link" href="/api/examples/${ex.name}/download" target="_blank" rel="noreferrer" title="${escapeHtml(ex.name)}">
        <span>${escapeHtml(ex.name)}</span><small>${ex.row_count || '-'}\u884c</small>
      </a>
    `).join('');
  } catch (e) {}
}
