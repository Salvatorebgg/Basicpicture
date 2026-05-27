/* ── Charts Module ──────────────────────────────────────── */

function activateChartWorkspace(chartId) {
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
  const card = qs(`.mini-chart-card[data-chart="${chartId}"]`);
  if (card) card.classList.add('selected');
  const label = el('selectedChartLabel');
  if (label) label.textContent = config ? config.name : chartId;
  const previewTitle = el('chartPreviewTitle');
  if (previewTitle) previewTitle.textContent = config ? config.name : '图形预览';
  if (typeof updateFlowLine === 'function') updateFlowLine(1);
  resetChartPreview(config);
  if (typeof renderDataPanel === 'function') renderDataPanel();
  buildChartVarControls();
  if (typeof updateMetricGrid === 'function') updateMetricGrid();
  if (typeof updatePreviewTable === 'function') updatePreviewTable();
  if (typeof updateDownloadList === 'function') updateDownloadList();
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

/* ── Chart Generation ──────────────────────────────────── */
async function generateChart() {
  const chartType = STATE.activeChartType;
  if (!chartType) { toast('请先选择图表类型', 'warning'); return; }

  const btn = el('generateChartBtn');
  if (!btn) return;
  setLoading(btn, true);

  if (chartType === 'china_map' && !STATE.chinaGeoJSON) {
    if (typeof loadChinaGeoJSON === 'function') {
      try { await loadChinaGeoJSON(); } catch (e) {}
    }
    if (typeof loadChinaCentroids === 'function') {
      try { loadChinaCentroids(); } catch (e) {}
    }
  }
  if (chartType === 'world_map' && !STATE.worldGeoJSON && typeof loadWorldGeoJSON === 'function') {
    try { await loadWorldGeoJSON(); } catch (e) {}
  }

  const config = getChartConfig(chartType);
  if (!config) { toast('图表配置未找到', 'error'); setLoading(btn, false); return; }
  if (!STATE.uploadId && !STATE.datasetName && (!STATE.columns || STATE.columns.length === 0)) {
    toast('请先加载示例数据或上传数据文件', 'warning');
    setLoading(btn, false);
    return;
  }

  const params = collectChartParams();
  const slots = getChartVarSlots ? getChartVarSlots(chartType) : [];
  for (const slot of slots) {
    if (!slot.optional) {
      const val = params[slot.name];
      if (!val || (Array.isArray(val) && val.length === 0)) {
        toast(`请选择"${slot.label}"`, 'warning');
        setLoading(btn, false);
        return;
      }
    }
  }

  let data = {};
  try {
    data = await loadChartDataset(config);
  } catch (e) {
    console.warn('Full dataset load failed, using preview:', e);
    data = buildDataFromState();
  }

  if (Object.keys(data).length === 0) {
    toast('无法加载数据', 'error');
    setLoading(btn, false);
    return;
  }

  STATE.currentChartSourceData = data;
  if (typeof renderAppearanceControls === 'function') renderAppearanceControls();

  params.title = (el('chartTitleInput') ? el('chartTitleInput').value : '') || '';

  const theme = getActiveTheme();
  let traces, layout;

  try {
    traces = config.buildTraces(data, params, theme);
    layout = config.buildLayout(params, theme);
  } catch (e) {
    console.error('Chart build error:', e);
    toast('图表构建失败: ' + e.message, 'error');
    setLoading(btn, false);
    return;
  }

  if (!traces || traces.length === 0) {
    toast('未能生成图表数据，请检查变量选择', 'warning');
    setLoading(btn, false);
    return;
  }

  const defaultMargin = { l: 72, r: 48, t: 72, b: 72 };
  traces = polishTracesForPublication(traces, theme);
  layout = applyThemeLayout(layout, theme);
  layout.margin = { ...defaultMargin, ...(layout.margin || {}) };
  layout = polishLayoutForPublication(layout, chartType, theme);
  layout.autosize = true;
  if (layout.showlegend === undefined) {
    layout.showlegend = traces.some(t => t && t.showlegend !== false && t.name);
  }
  if (STATE.barGap != null && traces.some(t => t.type === 'bar' || t.type === 'histogram')) {
    layout.bargap = STATE.barGap;
  }

  const container = el('chartPreviewContainer');
  if (!container) { setLoading(btn, false); return; }

  const oldPlot = container.matches('.js-plotly-plot') ? container : container.querySelector('.js-plotly-plot');
  disconnectChartResizeObserver();
  if (oldPlot) Plotly.purge(oldPlot);
  container.classList.remove('js-plotly-plot');
  container.innerHTML = '';
  const plotMount = document.createElement('div');
  plotMount.className = 'chart-plot';
  container.appendChild(plotMount);
  const frameSize = fitChartPlotToFrame(plotMount, chartType);
  layout.width = frameSize.width;
  layout.height = frameSize.height;
  layout.autosize = false;

  STATE.currentPlotlyData = traces;
  STATE.currentPlotlyLayout = layout;
  STATE.currentChartSourceData = data;
  saveCurrentChartParams(params);

  Plotly.newPlot(plotMount, traces, layout, {
    responsive: true,
    displaylogo: false,
    displayModeBar: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d', 'sendDataToCloud'],
    toImageButtonOptions: {
      format: 'png', height: 1440, width: 2160, scale: 2,
      filename: (chartType || 'chart') + '_' + Date.now(),
    },
  }).then(() => {
    installChartResizeObserver(plotMount, chartType);
    if (window.Plotly && typeof Plotly.Plots?.resize === 'function') Plotly.Plots.resize(plotMount);
  }).catch(e => {
    console.error('Plotly render error:', e);
    toast('图表渲染失败', 'error');
  });

  const exportBar = el('chartExportBar');
  if (exportBar) exportBar.style.display = 'flex';
  if (typeof updateFlowLine === 'function') updateFlowLine(4);
  if (typeof setStatus === 'function') setStatus('图表已生成');
  toast(config.name + ' 已生成', 'success');
  setLoading(btn, false);
}

// ── Polish traces for publication ────────────────────
function remapArrayColors(colorArray, palette) {
  const uniqueMap = {};
  let idx = 0;
  return colorArray.map(c => {
    if (!uniqueMap[c]) {
      uniqueMap[c] = palette[idx % palette.length];
      idx++;
    }
    return uniqueMap[c];
  });
}

function polishTracesForPublication(traces, theme) {
  const userPalette = STATE.userColors && STATE.userColors.length > 0 ? STATE.userColors : null;
  const customPalette = typeof getActivePalette === 'function' ? getActivePalette() : null;
  const palette = userPalette || customPalette || theme.colorway || ['#2E6F9E', '#D95F59', '#2A9D8F', '#E9A93A'];
  const ink = theme.ink || '#111827';
  const markerLine = theme.markerLine || '#ffffff';
  const userMarkerSize = STATE.markerSize || 8;
  const userLineWidth = STATE.lineWidth || 3;
  const userMarkerShape = STATE.markerShape || 'circle';
  const userMarkerOpacity = STATE.markerOpacity != null ? STATE.markerOpacity : (theme.opacity ?? 0.88);

  return (traces || []).map((trace, i) => {
    const t = { ...trace };
    const color = palette[i % palette.length];
    const mode = String(t.mode || '');
    const hasArrayColor = Array.isArray(t.marker?.color);

    if (t.type === 'scatter' || t.type === 'scattergeo') {
      const isLine = mode.includes('lines');
      const isMarker = mode.includes('markers') || !mode;
      const hasText = mode.includes('text');
      t.line = {
        ...(t.line || {}),
        color,
        width: isLine ? userLineWidth : 1.8,
        shape: t.line?.shape || (isLine ? 'spline' : undefined),
        smoothing: t.line?.smoothing ?? (isLine ? 0.4 : undefined),
      };
      if (isMarker) {
        const markerColor = hasArrayColor ? remapArrayColors(t.marker.color, palette) : color;
        t.marker = {
          ...(t.marker || {}),
          color: markerColor,
          size: t.type === 'scattergeo' ? 9 : userMarkerSize,
          symbol: t.marker?.symbol || userMarkerShape,
          opacity: userMarkerOpacity,
          line: { color: markerLine, width: 1 },
        };
      }
      if (hasText) {
        t.textfont = { ...(t.textfont || {}), family: theme.fontFamily, size: 10, color: ink };
      }
    }

    if (t.type === 'bar') {
      const barColor = hasArrayColor ? remapArrayColors(t.marker.color, palette) : color;
      t.marker = {
        ...(t.marker || {}),
        color: barColor,
        opacity: userMarkerOpacity,
        line: { color: '#ffffff', width: 0.8 },
      };
      t.textposition = t.textposition || 'outside';
      t.textfont = { ...(t.textfont || {}), family: theme.fontFamily, size: 10, color: ink };
      t.cliponaxis = false;
    }

    if (t.type === 'histogram') {
      t.marker = { ...(t.marker || {}), color, opacity: 0.78, line: { color: '#ffffff', width: 0.6 } };
      t.nbinsx = t.nbinsx || 28;
    }

    if (t.type === 'box') {
      t.line = { ...(t.line || {}), color, width: 1.6 };
      t.fillcolor = withAlpha(color, 0.2);
      t.marker = { ...(t.marker || {}), color, size: 4, opacity: 0.55, line: { color: '#ffffff', width: 0.4 } };
      t.boxmean = t.boxmean ?? 'sd';
      t.boxpoints = t.boxpoints ?? false;
    }

    if (t.type === 'violin') {
      t.line = { ...(t.line || {}), color, width: 1.5 };
      t.fillcolor = withAlpha(color, 0.25);
      t.marker = { ...(t.marker || {}), color, opacity: 0.45, size: 3.5, line: { color: '#ffffff', width: 0.3 } };
      t.meanline = { visible: true, color: ink, width: 1, ...(t.meanline || {}) };
      t.spanmode = t.spanmode || 'soft';
    }

    if (t.type === 'heatmap') {
      const isBinary = t.zmax === 1 && t.zmin === 0 && Array.isArray(t.colorscale) && t.colorscale.length === 4;
      if (!isBinary) {
        const isDivergent = t.zmin !== undefined && t.zmin < 0;
        // Only override with theme scale if trace did not provide a rich custom scale
        const alreadyRich = Array.isArray(t.colorscale) && t.colorscale.length >= 8;
        if (!alreadyRich) {
          const themeScale = isDivergent
            ? (theme.divergentScale || [[0, '#B64C4C'], [0.5, '#F8FAFC'], [1, '#246B80']])
            : (theme.sequentialScale || [[0, '#F8FBFD'], [0.3, '#D6E8F3'], [0.6, '#78AAC8'], [1, '#1F5B89']]);
          t.colorscale = themeScale;
        }
      }
      t.hoverongaps = false;
      t.colorbar = {
        thickness: 18, len: 0.82, outlinewidth: 0,
        tickfont: { family: theme.fontFamily, size: 10, color: ink },
        ...(t.colorbar || {}),
      };
    }

    if (t.type === 'choropleth') {
      t.colorscale = t.colorscale || theme.sequentialScale;
      t.marker = { line: { color: '#ffffff', width: 0.4 }, ...(t.marker || {}) };
      t.colorbar = { thickness: 12, outlinewidth: 0, tickfont: { family: theme.fontFamily, size: 10, color: ink }, ...(t.colorbar || {}) };
    }

    return t;
  });
}

function polishLayoutForPublication(layout, chartType, theme) {
  const l = { ...layout };
  const ink = theme.ink || '#111827';
  const family = theme.fontFamily || "'Arial', 'Noto Sans SC', sans-serif";
  const axisColor = theme.axisLineColor || '#26313D';
  const isSetPlot = ['venn', 'upset'].includes(chartType);
  const isSpatial = ['china_map', 'world_map'].includes(chartType);
  const isHeatmap = ['heatmap', 'correlation_heatmap', 'missingness_heatmap'].includes(chartType);

  l.paper_bgcolor = theme.bgColor || '#ffffff';
  l.plot_bgcolor = theme.plotBgColor || '#ffffff';
  l.separators = '.';
  l.hoverlabel = {
    bgcolor: '#ffffff',
    bordercolor: theme.axisLineColor || '#D7DEE8',
    font: { family, color: ink, size: 11 },
    ...(l.hoverlabel || {}),
  };
  l.legend = {
    orientation: 'h',
    x: 0, y: -0.16,
    xanchor: 'left', yanchor: 'top',
    bgcolor: 'rgba(255,255,255,0)',
    borderwidth: 0,
    tracegroupgap: 10,
    itemwidth: 28,
    font: { family, size: (theme.legendFontSize || 11), color: ink },
    ...(l.legend || {}),
  };
  l.title = normalizePublicationTitle(l.title, theme, chartType);

  if (!isSetPlot && !isSpatial) {
    if (!l.xaxis) l.xaxis = {};
    if (!l.yaxis) l.yaxis = {};
  }

  const axisKeys = Object.keys(l).filter(k => /^xaxis\d*$|^yaxis\d*$/.test(k));
  axisKeys.forEach((key) => {
    const prev = l[key] || {};
    if (prev.visible === false) return;
    const isY = key.startsWith('yaxis');
    l[key] = {
      showline: false,
      linewidth: 0,
      mirror: false,
      ticks: 'outside',
      ticklen: 4,
      tickwidth: 1,
      tickcolor: axisColor,
      zeroline: false,
      showgrid: isY,
      gridcolor: theme.gridColor || 'rgba(31,41,55,0.07)',
      gridwidth: 0.6,
      automargin: true,
      tickfont: { family, size: (theme.tickFontSize || 11), color: ink },
      title: {
        font: { family, size: (theme.axisFontSize || 13), color: ink },
        standoff: 10,
        ...(typeof prev.title === 'string' ? { text: prev.title } : (prev.title || {})),
      },
      ...(prev || {}),
      showline: false,
      linewidth: 0,
    };
  });

  if (l.geo) {
    l.geo = {
      bgcolor: 'rgba(0,0,0,0)',
      lakecolor: '#ffffff',
      landcolor: '#F5F2EF',
      countrycolor: '#ffffff',
      coastlinecolor: '#B0BEC5',
      coastlinewidth: 0.5,
      showframe: false,
      domain: { x: [0, 1], y: [0, 1] },
      ...(l.geo || {}),
    };
  }

  if (['heatmap', 'correlation_heatmap', 'missingness_heatmap'].includes(chartType)) {
    l.margin = { l: 160, r: 90, t: 85, b: 120, ...(l.margin || {}) };
  }
  if (chartType === 'upset') l.margin = { l: 80, r: 70, t: 85, b: 70, ...(l.margin || {}) };
  if (chartType === 'venn') l.margin = { l: 20, r: 20, t: 80, b: 30, ...(l.margin || {}) };
  if (isSpatial) {
    l.margin = { l: 10, r: 10, t: 60, b: 10, ...(l.margin || {}) };
    l.legend = { ...(l.legend || {}), y: -0.05 };
    l.geo = { ...(l.geo || {}), domain: { x: [0.01, 0.99], y: [0.01, 0.96] } };
  }

  // Draw complete coordinate axes as clean L-shaped lines with arrow tips
  if (!isSetPlot && !isSpatial && !isHeatmap) {
    const existingAnnots = Array.isArray(l.annotations) ? l.annotations : [];
    const existingShapes = Array.isArray(l.shapes) ? l.shapes : [];
    l.shapes = [
      ...existingShapes,
      // X-axis line: from origin to right edge
      {
        type: 'line',
        xref: 'x domain', yref: 'y domain',
        x0: 0, y0: 0, x1: 1, y1: 0,
        line: { color: axisColor, width: 1.5 },
        layer: 'above',
      },
      // Y-axis line: from origin to top edge
      {
        type: 'line',
        xref: 'x domain', yref: 'y domain',
        x0: 0, y0: 0, x1: 0, y1: 1,
        line: { color: axisColor, width: 1.5 },
        layer: 'above',
      },
    ];
    l.annotations = [
      {
        x: 1.02, y: 0,
        xref: 'x domain', yref: 'y domain',
        ax: 0.97, ay: 0,
        axref: 'x domain', ayref: 'y domain',
        showarrow: true,
        arrowhead: 3,
        arrowsize: 1.2,
        arrowwidth: 1.5,
        arrowcolor: axisColor,
        text: '',
      },
      {
        x: 0, y: 1.03,
        xref: 'x domain', yref: 'y domain',
        ax: 0, ay: 0.97,
        axref: 'x domain', ayref: 'y domain',
        showarrow: true,
        arrowhead: 3,
        arrowsize: 1.2,
        arrowwidth: 1.5,
        arrowcolor: axisColor,
        text: '',
      },
      ...existingAnnots,
    ];
  }

  return l;
}

function normalizePublicationTitle(title, theme, chartType) {
  const titleObj = typeof title === 'string' ? { text: title } : (title || { text: '' });
  return {
    ...titleObj,
    x: titleObj.x ?? 0.02,
    y: titleObj.y ?? 0.97,
    xanchor: titleObj.xanchor || 'left',
    yanchor: titleObj.yanchor || 'top',
    font: {
      family: theme.fontFamily,
      color: theme.titleColor || theme.ink || '#111827',
      size: titleObj.font?.size || (theme.titleFontSize || 17),
      ...(titleObj.font || {}),
    },
  };
}

function withAlpha(hex, alpha) {
  if (!hex || !String(hex).startsWith('#')) return hex;
  const clean = String(hex).slice(1);
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return hex;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

// ── ResizeObserver ───────────────────────────────────
function disconnectChartResizeObserver() {
  if (STATE.currentChartResizeObserver) {
    STATE.currentChartResizeObserver.disconnect();
    STATE.currentChartResizeObserver = null;
  }
}

function getChartFrameSize(plotMount, chartType) {
  const preview = el('chartPreviewContainer') || plotMount.parentElement;
  const previewStyle = preview ? getComputedStyle(preview) : null;
  const padX = previewStyle ? parseFloat(previewStyle.paddingLeft || 0) + parseFloat(previewStyle.paddingRight || 0) : 0;
  const padY = previewStyle ? parseFloat(previewStyle.paddingTop || 0) + parseFloat(previewStyle.paddingBottom || 0) : 0;
  const width = Math.max(400, Math.floor((preview?.clientWidth || 900) - padX));
  const spatial = ['china_map', 'world_map'].includes(chartType);
  const setPlot = ['venn', 'upset'].includes(chartType);
  const isHeatmap = ['heatmap', 'correlation_heatmap', 'missingness_heatmap'].includes(chartType);
  const minHeight = spatial ? 620 : (setPlot ? 600 : (isHeatmap ? 720 : 580));
  const height = Math.max(minHeight, Math.floor((preview?.clientHeight || minHeight) - padY));
  return { width, height };
}

function fitChartPlotToFrame(plotMount, chartType) {
  const size = getChartFrameSize(plotMount, chartType);
  plotMount.style.width = '100%';
  plotMount.style.height = `${size.height}px`;
  plotMount.style.minHeight = `${size.height}px`;
  return size;
}

function installChartResizeObserver(plotMount, chartType) {
  if (!window.ResizeObserver) return;
  let resizeFrame = null;
  const observer = new ResizeObserver(() => {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      const size = fitChartPlotToFrame(plotMount, chartType);
      if (window.Plotly && plotMount.isConnected) {
        Plotly.relayout(plotMount, { width: size.width, height: size.height, autosize: false });
      }
    });
  });
  observer.observe(plotMount.parentElement || plotMount);
  STATE.currentChartResizeObserver = observer;
}

// ── Data loading ─────────────────────────────────────
async function loadChartDataset(config) {
  const body = STATE.uploadId ? {
    upload_id: STATE.uploadId,
    sheet_name: STATE.activeSheet || undefined,
    use_demo: false,
  } : {
    use_demo: true,
    dataset_name: STATE.datasetName || config.exampleDataset || 'baseline_table_example',
  };
  const result = await apiPost('/api/dataset/data', body);
  if (!STATE.uploadId && result.name) STATE.datasetName = result.name;
  saveActiveChartWorkspace();
  return result.data || {};
}

function collectChartParams() {
  const params = {};
  qsa('.chart-var-select').forEach(sel => {
    const name = sel.id.replace('chartVar_', '');
    if (sel.multiple) {
      const selected = Array.from(sel.selectedOptions).map(o => o.value).filter(Boolean);
      if (selected.length > 0) params[name] = selected;
    } else {
      if (sel.value) params[name] = sel.value;
    }
  });
  if (params.value_vars && !Array.isArray(params.value_vars)) params.value_vars = [params.value_vars];
  return params;
}

function buildDataFromState() {
  const data = {};
  const rows = STATE.previewRows || [];
  const cols = STATE.columns || [];
  if (rows.length === 0 || cols.length === 0) return data;
  cols.forEach(c => { data[c] = []; });
  rows.forEach(r => { cols.forEach(c => { data[c].push(r[c] !== undefined && r[c] !== null ? r[c] : ''); }); });
  return data;
}

// ── CSV parsing ──────────────────────────────────────
function parseCSV(text) {
  if (!text || text.trim().length === 0) return {};
  const lines = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') inQuotes = !inQuotes;
    if (ch === '\n' && !inQuotes) { lines.push(current); current = ''; }
    else if (ch === '\r' && !inQuotes) {}
    else current += ch;
  }
  if (current) lines.push(current);
  if (lines.length < 2) return {};
  const headers = parseCSVLine(lines[0]);
  const data = {};
  headers.forEach(h => { data[h] = []; });
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i]);
    headers.forEach((h, j) => { data[h].push(j < vals.length ? vals[j] : ''); });
  }
  return data;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else current += ch;
  }
  result.push(current.trim());
  return result;
}
