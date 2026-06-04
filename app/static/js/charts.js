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
  const generateBtn = el('generateChartBtn');
  if (generateBtn && typeof setLoading === 'function') setLoading(generateBtn, false);
}

/* ── Chart Generation ──────────────────────────────────── */
async function generateChart() {
  const chartType = STATE.activeChartType;
  if (!chartType) { toast('请先选择图表类型', 'warning'); return; }

  const btn = el('generateChartBtn');
  if (!btn) return;
  setLoading(btn, true);

  if (['china_map', 'china_bubble_map'].includes(chartType) && !STATE.chinaGeoJSON) {
    if (typeof loadChinaGeoJSON === 'function') {
      try { await loadChinaGeoJSON(); } catch (e) {}
    }
    if (typeof loadChinaCentroids === 'function') {
      try { loadChinaCentroids(); } catch (e) {}
    }
  }
  if (['world_map', 'world_bubble_map', 'europe_map'].includes(chartType) && !STATE.worldGeoJSON && typeof loadWorldGeoJSON === 'function') {
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

  if (typeof activateWorkspaceTab === 'function') activateWorkspaceTab('chart');

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

  try {
    await Plotly.newPlot(plotMount, traces, layout, {
      responsive: true,
      displaylogo: false,
      displayModeBar: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d', 'sendDataToCloud'],
      toImageButtonOptions: {
        format: 'png', height: 1440, width: 2160, scale: 2,
        filename: (chartType || 'chart') + '_' + Date.now(),
      },
    });
    syncCurrentPlotlyLayoutFromDom(plotMount);
    installChartResizeObserver(plotMount, chartType);
    if (chartType !== 'treemap' && window.Plotly && typeof Plotly.Plots?.resize === 'function') {
      const resizePromise = Plotly.Plots.resize(plotMount);
      if (resizePromise && typeof resizePromise.then === 'function') {
        await resizePromise;
      }
      syncCurrentPlotlyLayoutFromDom(plotMount);
    }
  } catch (e) {
    console.error('Plotly render error:', e);
    toast('\u56fe\u8868\u6e32\u67d3\u5931\u8d25', 'error');
    setLoading(btn, false);
    return;
  }

  const exportBar = el('chartExportBar');
  if (exportBar) exportBar.style.display = 'flex';
  if (typeof updateFlowLine === 'function') updateFlowLine(4);
  if (typeof setStatus === 'function') setStatus('图表已生成');
  toast(config.name + ' 已生成', 'success');
  if (typeof setButtonComplete === 'function') setButtonComplete(btn, '\u5904\u7406\u5b8c\u6210');
  else setLoading(btn, false);
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

function buildCustomColorScale(colors) {
  const clean = (colors || []).filter(Boolean);
  if (clean.length < 2) return null;
  if (clean.length === 2) return [[0, clean[0]], [1, clean[1]]];
  return clean.map((c, i) => [i / (clean.length - 1), c]);
}

function isNumericColorArray(values) {
  return Array.isArray(values) && values.length > 0 && values.every(v => Number.isFinite(Number(v)));
}

function polishTracesForPublication(traces, theme) {
  const userPalette = STATE.userColors && STATE.userColors.length > 0 ? STATE.userColors : null;
  const customPalette = typeof getActivePalette === 'function' ? getActivePalette() : null;
  const basePalette = userPalette || customPalette || theme.colorway || ['#2E6F9E', '#D95F59', '#2A9D8F', '#E9A93A'];
  // Use expandPalette to guarantee enough colors for all categories
  const palette = typeof expandPalette === 'function' ? expandPalette(basePalette, 24) : basePalette;
  const customColorScale = buildCustomColorScale(userPalette);
  const ink = theme.ink || '#111827';
  const markerLine = theme.markerLine || '#ffffff';
  const userMarkerSize = STATE.markerSize || 8;
  const userLineWidth = STATE.lineWidth || 3;
  const userMarkerShape = STATE.markerShape || 'circle';
  const userMarkerOpacity = STATE.markerOpacity != null ? STATE.markerOpacity : (theme.opacity ?? 0.88);
  const fontFamily = theme.fontFamily || "'Arial', 'Noto Sans SC', sans-serif";

  return (traces || []).map((trace, i) => {
    const t = { ...trace };
    const colorIndex = Number.isFinite(Number(t.meta?.colorIndex)) ? Number(t.meta.colorIndex) : i;
    const color = t.meta?.fixedColor || palette[colorIndex % palette.length];
    const mode = String(t.mode || '');
    const hasArrayColor = Array.isArray(t.marker?.color);
    const usesContinuousMarkerScale = hasArrayColor && isNumericColorArray(t.marker.color) && Boolean(t.marker?.colorscale || t.marker?.colorbar || t.marker?.showscale);
    const visualRole = t.meta?.visualRole || t._visualRole;
    const errorColorIndex = Number.isFinite(Number(t.meta?.errorColorIndex)) ? Number(t.meta.errorColorIndex) : null;
    const errorColor = errorColorIndex != null ? palette[errorColorIndex % palette.length] : color;

    // ── Scatter / Scattergeo ──
    if (t.type === 'scatter' || t.type === 'scattergeo') {
      const isLine = mode.includes('lines');
      const isMarker = mode.includes('markers') || !mode;
      const hasText = mode.includes('text');
      if (visualRole === 'backgroundTrajectory') {
        t.line = {
          ...(t.line || {}),
          color,
          width: t.line?.width ?? 0.85,
          shape: 'linear',
          smoothing: 0,
        };
        t.opacity = t.opacity ?? 0.32;
        t.hoverinfo = t.hoverinfo || 'skip';
        return t;
      }
      t.line = {
        ...(t.line || {}),
        color,
        width: visualRole === 'lollipopStemLine' ? Math.max(1.8, Math.min(userLineWidth, 2.8)) : (isLine ? userLineWidth : 1.8),
        shape: visualRole === 'lollipopStemLine' ? 'linear' : (t.line?.shape || (isLine ? 'spline' : undefined)),
        smoothing: visualRole === 'lollipopStemLine' ? 0 : (t.line?.smoothing ?? (isLine ? 0.4 : undefined)),
      };
      if (t.error_y) {
        t.error_y = {
          ...(t.error_y || {}),
          color: errorColor,
          thickness: t.error_y.thickness ?? 1.6,
          width: t.error_y.width ?? 5,
        };
      }
      if (t.fill && t.fill !== 'none' && t.fill !== 'toself') {
        t.fillcolor = withAlpha(color, t.fillcolor ? 0.18 : 0.20);
      }
      if (t.fill === 'toself') {
        t.fillcolor = t.fillcolor || withAlpha(color, 0.28);
      }
      if (isMarker) {
        const markerColor = hasArrayColor && !usesContinuousMarkerScale ? remapArrayColors(t.marker.color, palette) : (hasArrayColor ? t.marker.color : color);
        const markerSize = Array.isArray(t.marker?.size)
          ? t.marker.size
          : (visualRole === 'lollipopHead' ? Math.max(15, userMarkerSize + 7) : userMarkerSize);
        t.marker = {
          ...(t.marker || {}),
          color: markerColor,
          size: markerSize,
          symbol: userMarkerShape && userMarkerShape !== 'circle' ? userMarkerShape : (t.marker?.symbol || userMarkerShape),
          opacity: userMarkerOpacity,
          line: { color: markerLine, width: visualRole === 'lollipopHead' ? 1.6 : 1.2 },
        };
        if (usesContinuousMarkerScale && customColorScale) {
          t.marker.colorscale = customColorScale;
        }
      }
      if (hasText) {
        t.textfont = { ...(t.textfont || {}), family: fontFamily, size: visualRole === 'lollipopHead' ? 12 : 11, color: ink };
      }
    }

    // ── Scatterpolar (radar) ──
    if (t.type === 'scatterpolar') {
      t.line = { ...(t.line || {}), color, width: userLineWidth };
      t.marker = { ...(t.marker || {}), color, size: userMarkerSize, symbol: userMarkerShape, line: { color: '#ffffff', width: 1.2 } };
    }

    // ── Bar ──
    if (t.type === 'bar') {
      if (visualRole === 'lollipopStem') {
        if (Array.isArray(t.marker?.color)) {
          const uniqueMap = {};
          let stemIdx = 0;
          const stemColors = t.marker.color.map(c => {
            if (!uniqueMap[c]) {
              uniqueMap[c] = withAlpha(palette[stemIdx % palette.length], 0.22);
              stemIdx++;
            }
            return uniqueMap[c];
          });
          t.marker = {
            ...(t.marker || {}),
            color: stemColors,
            line: { color: stemColors.map((_, idx) => withAlpha(palette[idx % palette.length], 0.38)), width: 1 },
          };
        }
        t.marker = {
          ...(t.marker || {}),
          opacity: t.marker?.opacity ?? 1,
          line: t.marker?.line || { color: '#ffffff', width: 0.6 },
        };
        t.textposition = 'none';
        t.hoverinfo = 'skip';
        t.cliponaxis = false;
        return t;
      }
      if (visualRole === 'riskCalibrationBars') {
        const alpha = Math.max(0.16, Math.min(userMarkerOpacity, 0.34));
        t.marker = {
          ...(t.marker || {}),
          color: withAlpha(color, alpha),
          line: { color: withAlpha(color, alpha + 0.18), width: 1 },
        };
        t.showlegend = false;
        t.cliponaxis = false;
        return t;
      }
      const barColor = hasArrayColor ? remapArrayColors(t.marker.color, palette) : color;
      t.marker = {
        ...(t.marker || {}),
        color: barColor,
        opacity: userMarkerOpacity,
        line: { color: '#ffffff', width: 1.2 },
      };
      t.textposition = t.textposition || 'outside';
      t.textfont = { ...(t.textfont || {}), family: fontFamily, size: 11, color: ink };
      t.cliponaxis = false;
    }

    // ── Barpolar ──
    if (t.type === 'barpolar') {
      const barpolarColor = Array.isArray(t.marker?.color) ? remapArrayColors(t.marker.color, palette) : color;
      t.marker = { ...(t.marker || {}), color: barpolarColor, opacity: userMarkerOpacity, line: { color: '#ffffff', width: 1.5 } };
    }

    // ── Histogram ──
    if (t.type === 'histogram') {
      t.marker = { ...(t.marker || {}), color, opacity: 0.82, line: { color: '#ffffff', width: 0.8 } };
      t.nbinsx = t.nbinsx || 28;
    }

    // ── Box ──
    if (t.type === 'box') {
      t.line = { ...(t.line || {}), color, width: Math.max(1.2, Math.min(userLineWidth, 5)) };
      t.fillcolor = withAlpha(color, 0.25);
      t.marker = { ...(t.marker || {}), color, size: 4.5, opacity: 0.55, line: { color: '#ffffff', width: 0.5 } };
      t.boxmean = t.boxmean ?? 'sd';
      t.boxpoints = t.boxpoints ?? false;
      t.whiskerwidth = 0.7;
    }

    // ── Violin ──
    if (t.type === 'violin') {
      t.line = { ...(t.line || {}), color, width: Math.max(1.2, Math.min(userLineWidth, 5)) };
      t.fillcolor = withAlpha(color, 0.30);
      t.marker = { ...(t.marker || {}), color, opacity: 0.45, size: 3.5, line: { color: '#ffffff', width: 0.3 } };
      t.meanline = { visible: true, color: ink, width: 1.2, ...(t.meanline || {}) };
      t.spanmode = t.spanmode || 'soft';
    }

    // ── Pie / Donut ──
    if (t.type === 'pie') {
      const sliceCount = Math.max((t.labels || []).length, (t.values || []).length, 1);
      t.marker = { ...(t.marker || {}), colors: Array.from({ length: sliceCount }, (_, idx) => palette[idx % palette.length]), line: { color: '#ffffff', width: 2.5 } };
      t.textfont = { ...(t.textfont || {}), family: fontFamily, size: 12 };
    }

    // ── Funnel ──
    if (t.type === 'funnel') {
      t.textfont = { ...(t.textfont || {}), family: fontFamily, size: 13 };
      const funnelCount = Math.max((t.y || []).length, (t.x || []).length, 1);
      t.marker = { ...(t.marker || {}), color: Array.from({ length: funnelCount }, (_, idx) => palette[idx % palette.length]), line: { color: '#ffffff', width: 2 } };
    }

    // ── Treemap ──
    if (t.type === 'treemap') {
      const treemapCount = Math.max((t.labels || []).length, (t.values || []).length, 1);
      t.marker = {
        ...(t.marker || {}),
        colors: Array.from({ length: treemapCount }, (_, idx) => palette[idx % palette.length]),
        line: { color: '#ffffff', width: 1.5, ...(t.marker?.line || {}) },
      };
      t.textfont = { ...(t.textfont || {}), family: fontFamily };
    }

    // ── Heatmap ──
    if (t.type === 'heatmap') {
      const isBinary = t.zmax === 1 && t.zmin === 0 && Array.isArray(t.colorscale) && t.colorscale.length === 4;
      if (customColorScale) {
        t.colorscale = customColorScale;
      } else if (!isBinary) {
        const isDivergent = t.zmin !== undefined && t.zmin < 0;
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
        tickfont: { family: fontFamily, size: 10, color: ink },
        ...(t.colorbar || {}),
      };
    }

    // ── Choropleth ──
    if (t.type === 'choropleth') {
      t.colorscale = customColorScale || t.colorscale || theme.sequentialScale;
      t.marker = { line: { color: '#ffffff', width: 0.4 }, ...(t.marker || {}) };
      t.colorbar = { thickness: 12, outlinewidth: 0, tickfont: { family: fontFamily, size: 10, color: ink }, ...(t.colorbar || {}) };
    }

    // ── Sankey ──
    if (t.type === 'sankey') {
      if (t.node) {
        const nodeCount = Math.max((t.node.label || []).length, 1);
        t.node = { ...t.node, color: Array.from({ length: nodeCount }, (_, idx) => palette[idx % palette.length]), line: { color: '#ffffff', width: 1.5 } };
      }
      if (t.link && Array.isArray(t.link.source)) {
        t.link = {
          ...t.link,
          color: t.link.source.map((s, idx) => withAlpha(palette[Number(s) % palette.length] || palette[idx % palette.length], 0.34)),
        };
      }
    }

    // ── Parallel coordinates ──
    if (t.type === 'parcoords') {
      t.line = { ...(t.line || {}), colorscale: customColorScale || t.line?.colorscale };
      if (Array.isArray(t.dimensions)) {
        t.dimensions = t.dimensions.map(dim => ({
          ...dim,
          labelfont: { family: fontFamily, size: 11, color: ink, ...(dim.labelfont || {}) },
          tickfont: { family: fontFamily, size: 9, color: ink, ...(dim.tickfont || {}) },
        }));
      }
    }

    return t;
  });
}

function polishLayoutForPublication(layout, chartType, theme) {
  const l = { ...layout };
  const ink = theme.ink || '#111827';
  const family = theme.fontFamily || "'Arial', 'Noto Sans SC', sans-serif";
  const axisColor = theme.axisLineColor || '#26313D';
  const userPalette = STATE.userColors && STATE.userColors.length > 0 ? STATE.userColors : null;
  const customPalette = typeof getActivePalette === 'function' ? getActivePalette() : null;
  const basePalette = userPalette || customPalette || theme.colorway || ['#2E6F9E', '#D95F59', '#2A9D8F', '#E9A93A'];
  const palette = typeof expandPalette === 'function' ? expandPalette(basePalette, 24) : basePalette;
  const isSetPlot = ['venn', 'upset'].includes(chartType);
  const isSpatial = ['china_map', 'china_bubble_map', 'world_map', 'world_bubble_map', 'usa_map', 'europe_map', 'uk_map'].includes(chartType);
  const isHeatmap = ['heatmap', 'correlation_heatmap', 'missingness_heatmap'].includes(chartType);
  const isPieLike = ['donut', 'pie', 'funnel', 'treemap', 'sankey', 'polar_bar'].includes(chartType);
  const isPolar = ['radar', 'polar_bar'].includes(chartType);

  l.paper_bgcolor = theme.bgColor || '#ffffff';
  l.plot_bgcolor = theme.plotBgColor || '#ffffff';
  l.separators = '.';
  l.hoverlabel = {
    bgcolor: '#ffffff',
    bordercolor: theme.axisLineColor || '#D7DEE8',
    font: { family, color: ink, size: 12 },
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

  if (!isSetPlot && !isSpatial && !isPieLike) {
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
      ticklen: 5,
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
        standoff: 12,
        ...(typeof prev.title === 'string' ? { text: prev.title } : (prev.title || {})),
      },
      ...(prev || {}),
      showline: false,
      linewidth: 0,
    };
  });

  // Polar layout theming
  if (l.polar) {
    l.polar = {
      ...l.polar,
      bgcolor: 'rgba(0,0,0,0)',
      radialaxis: {
        ...(l.polar.radialaxis || {}),
        gridcolor: theme.gridColor || 'rgba(31,41,55,0.10)',
        linecolor: axisColor,
        tickfont: { family, size: 9, color: ink },
      },
      angularaxis: {
        ...(l.polar.angularaxis || {}),
        gridcolor: theme.gridColor || 'rgba(31,41,55,0.08)',
        linecolor: axisColor,
        tickfont: { family, size: 11, color: ink },
      },
    };
  }

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
  if (chartType === 'sankey') l.margin = { l: 20, r: 20, t: 80, b: 30, ...(l.margin || {}) };
  if (chartType === 'treemap') l.margin = { l: 10, r: 10, t: 78, b: 10, ...(l.margin || {}) };
  if (chartType === 'ridgeline') l.margin = { l: 72, r: 48, t: 78, b: 60, ...(l.margin || {}) };
  if (isSpatial) {
    l.margin = { l: 10, r: 10, t: 60, b: 10, ...(l.margin || {}) };
    l.legend = { ...(l.legend || {}), y: -0.05 };
    l.geo = { ...(l.geo || {}), domain: { x: [0.01, 0.99], y: [0.01, 0.96] } };
  }

  if (chartType === 'venn' && Array.isArray(l.shapes)) {
    let circleIdx = 0;
    l.shapes = l.shapes.map((shape) => {
      if (shape.type !== 'circle') return shape;
      const c = palette[circleIdx % palette.length];
      circleIdx += 1;
      return {
        ...shape,
        fillcolor: withAlpha(c, 0.20),
        line: { ...(shape.line || {}), color: c, width: shape.line?.width || 2.2 },
      };
    });
  }

  // Draw coordinate axes as clean L-shaped lines with arrow tips
  // Skip for special chart types that don't use standard axes
  if (!isSetPlot && !isSpatial && !isHeatmap && !isPieLike && !isPolar) {
    const existingAnnots = Array.isArray(l.annotations) ? l.annotations : [];
    const existingShapes = Array.isArray(l.shapes) ? l.shapes : [];
    l.shapes = [
      ...existingShapes,
      {
        type: 'line',
        xref: 'x domain', yref: 'y domain',
        x0: 0, y0: 0, x1: 1, y1: 0,
        line: { color: axisColor, width: 1.5 },
        layer: 'above',
      },
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
  const width = Math.max(560, Math.floor((preview?.clientWidth || 900) - padX));
  const spatial = ['china_map', 'china_bubble_map', 'world_map', 'world_bubble_map', 'usa_map', 'europe_map', 'uk_map'].includes(chartType);
  const setPlot = ['venn', 'upset'].includes(chartType);
  const isPieLike = ['donut', 'pie', 'funnel', 'treemap', 'sankey', 'radar', 'polar_bar'].includes(chartType);
  const isHeatmap = ['heatmap', 'correlation_heatmap', 'missingness_heatmap'].includes(chartType);
  const minHeight = spatial ? 520 : (setPlot ? 520 : (isPieLike ? 520 : (isHeatmap ? 560 : 480)));
  const availableHeight = Math.floor((preview?.clientHeight || 0) - padY);
  const viewportHeight = Math.floor(window.innerHeight * 0.56);
  const height = Math.max(minHeight, availableHeight, viewportHeight);
  return { width, height };
}

function fitChartPlotToFrame(plotMount, chartType) {
  const size = getChartFrameSize(plotMount, chartType);
  const scale = 1.0;
  const preview = plotMount.parentElement;
  const previewStyle = preview ? getComputedStyle(preview) : null;
  const padX = previewStyle ? parseFloat(previewStyle.paddingLeft || 0) + parseFloat(previewStyle.paddingRight || 0) : 0;
  const padY = previewStyle ? parseFloat(previewStyle.paddingTop || 0) + parseFloat(previewStyle.paddingBottom || 0) : 0;
  const maxW = Math.max(320, Math.floor((preview?.clientWidth || 900) - padX));
  const maxH = Math.max(320, Math.floor((preview?.clientHeight || 600) - padY));
  const w = Math.min(maxW, Math.max(320, Math.floor(size.width * scale)));
  const h = Math.min(maxH, Math.max(320, Math.floor(size.height * scale)));
  plotMount.style.width = `${w}px`;
  plotMount.style.height = `${h}px`;
  plotMount.style.minHeight = `${h}px`;
  return { width: w, height: h };
}

function syncCurrentPlotlyLayoutFromDom(plotMount) {
  if (!plotMount || !plotMount._fullLayout || !STATE.currentPlotlyLayout) return;
  const width = Math.floor(plotMount._fullLayout.width || plotMount.clientWidth || STATE.currentPlotlyLayout.width || 0);
  const height = Math.floor(plotMount._fullLayout.height || plotMount.clientHeight || STATE.currentPlotlyLayout.height || 0);
  if (width > 0 && height > 0) {
    STATE.currentPlotlyLayout = {
      ...STATE.currentPlotlyLayout,
      width,
      height,
      autosize: false,
    };
  }
}

function installChartResizeObserver(plotMount, chartType) {
  if (!window.ResizeObserver) return;
  let resizeFrame = null;
  const observer = new ResizeObserver(() => {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      const size = fitChartPlotToFrame(plotMount, chartType);
      if (window.Plotly && plotMount.isConnected) {
        const relayoutPromise = Plotly.relayout(plotMount, { width: size.width, height: size.height, autosize: false });
        if (relayoutPromise && typeof relayoutPromise.then === 'function') {
          relayoutPromise.then(() => syncCurrentPlotlyLayoutFromDom(plotMount));
        } else {
          syncCurrentPlotlyLayoutFromDom(plotMount);
        }
        if (STATE.currentPlotlyLayout) {
          STATE.currentPlotlyLayout = { ...STATE.currentPlotlyLayout, width: size.width, height: size.height, autosize: false };
        }
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

// Restored preview sizing: keep the rendered figure centered with publication
// whitespace instead of stretching every Plotly canvas to the full preview box.
function getChartFrameSize(plotMount, chartType) {
  const preview = el('chartPreviewContainer') || plotMount.parentElement;
  const previewStyle = preview ? getComputedStyle(preview) : null;
  const padX = previewStyle ? parseFloat(previewStyle.paddingLeft || 0) + parseFloat(previewStyle.paddingRight || 0) : 0;
  const padY = previewStyle ? parseFloat(previewStyle.paddingTop || 0) + parseFloat(previewStyle.paddingBottom || 0) : 0;
  const maxW = Math.max(520, Math.floor((preview?.clientWidth || 960) - padX));
  const maxH = Math.max(440, Math.floor((preview?.clientHeight || 680) - padY));
  const spatial = ['china_map', 'china_bubble_map', 'world_map', 'world_bubble_map', 'usa_map', 'europe_map', 'uk_map'].includes(chartType);
  const setPlot = ['venn', 'upset'].includes(chartType);
  const pieLike = ['donut', 'pie', 'funnel', 'treemap', 'sankey', 'radar', 'polar_bar'].includes(chartType);
  const heatmap = ['heatmap', 'correlation_heatmap', 'missingness_heatmap'].includes(chartType);
  const aspect = chartType === 'sankey' ? 1.90
    : (heatmap ? 1.85
      : (spatial ? 1.55
        : (pieLike ? 1.18
          : (setPlot ? 1.45 : 1.62))));
  const usableW = Math.max(360, Math.floor(maxW * 0.90));
  const usableH = Math.max(360, Math.floor(maxH * 0.88));
  let width = Math.floor(usableH * aspect);
  let height = usableH;
  if (width > usableW) {
    width = usableW;
    height = Math.floor(width / aspect);
  }
  const minH = spatial ? 500 : (heatmap ? 500 : (pieLike ? 440 : 480));
  if (height < Math.min(minH, usableH)) {
    height = Math.min(minH, usableH);
    width = Math.min(usableW, Math.floor(height * aspect));
  }
  return { width, height };
}

function fitChartPlotToFrame(plotMount, chartType) {
  const size = getChartFrameSize(plotMount, chartType);
  plotMount.style.setProperty('width', `${size.width}px`, 'important');
  plotMount.style.setProperty('height', `${size.height}px`, 'important');
  plotMount.style.setProperty('min-height', `${size.height}px`, 'important');
  plotMount.style.setProperty('max-width', '100%', 'important');
  plotMount.style.setProperty('max-height', '100%', 'important');
  return size;
}
