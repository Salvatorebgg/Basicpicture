/* ── Download Module ────────────────────────────────────── */

function initDownloads() {
  // Export buttons are handled via event delegation in app.js initExportButtons()
}

async function downloadChartImage(format) {
  const previewEl = el('chartPreviewContainer');
  let plotEl = qs('#chartPreviewContainer .chart-plot');
  if (!plotEl) plotEl = qs('#chartPreviewContainer .js-plotly-plot');
  if (!plotEl) plotEl = previewEl?.querySelector('[class*="plotly"]');
  if (!plotEl) plotEl = previewEl?.querySelector('div[data-plotly]');

  if (!plotEl) {
    toast('请先生成图表', 'warning');
    return;
  }

  if (!window.Plotly) {
    toast('Plotly 未加载，无法导出图表。请刷新页面后重试。', 'error');
    return;
  }

  const filename = `${safeFilename(STATE.activeChartType || 'chart')}_${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const options = {
    format,
    width: 2400,
    height: 1600,
    scale: format === 'png' ? 3 : 1,
  };

  try {
    if (typeof Plotly.Plots?.resize === 'function') {
      await Plotly.Plots.resize(plotEl);
    }
    const dataUrl = await Plotly.toImage(plotEl, options);
    downloadDataUrl(dataUrl, `${filename}.${format}`);
    toast(`${format.toUpperCase()} 已下载`, 'success');
  } catch (err) {
    console.error('Chart export failed:', err);
    try {
      await Plotly.downloadImage(plotEl, { ...options, filename });
      toast(`${format.toUpperCase()} 已下载`, 'success');
    } catch (fallbackErr) {
      console.error('Plotly downloadImage fallback failed:', fallbackErr);
      toast(`导出 ${format.toUpperCase()} 失败: ${fallbackErr.message || err.message}`, 'error');
    }
  }
}

function downloadChartCSV() {
  if (!STATE.currentPlotlyData && !STATE.currentChartSourceData) { toast('请先生成图表', 'warning'); return; }
  if (STATE.currentChartSourceData && STATE.currentChartParams) {
    const params = STATE.currentChartParams || {};
    const selectedCols = uniqueCsvColumns([
      params.x_var, params.y_var, params.color_var, params.size_var, params.group_var,
      params.time_var, params.event_var, params.outcome_var, params.predictor_var,
      params.province_var, params.country_var,
      ...(params.value_vars || []),
    ]).filter(c => STATE.currentChartSourceData[c]);

    if (selectedCols.length > 0) {
      const csv = columnDataToCSV(STATE.currentChartSourceData, selectedCols);
      downloadBlob(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }), `${safeFilename(STATE.activeChartType || 'chart')}_source_data.csv`);
      toast('CSV 已下载', 'success');
      return;
    }
  }

  const traces = STATE.currentPlotlyData || [];
  let csv = 'trace,x,y,z,text\n';
  for (const trace of traces) {
    const x = trace.x || [];
    const y = trace.y || [];
    const z = Array.isArray(trace.z) ? trace.z : [];
    const text = trace.text || [];
    const n = Math.max(x.length, y.length, text.length, Array.isArray(z[0]) ? z.length : z.length);
    for (let i = 0; i < n; i++) {
      csv += [
        csvEscape(trace.name || trace.type || 'trace'),
        csvEscape(x[i] ?? ''),
        csvEscape(y[i] ?? ''),
        csvEscape(Array.isArray(z[i]) ? JSON.stringify(z[i]) : (z[i] ?? '')),
        csvEscape(text[i] ?? ''),
      ].join(',') + '\n';
    }
  }
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `${STATE.activeChartType || 'chart'}_data.csv`);
  toast('CSV 已下载', 'success');
}

function downloadChartConfig() {
  if (!STATE.currentPlotlyData || !STATE.currentPlotlyLayout) { toast('请先生成图表', 'warning'); return; }
  const config = {
    chartType: STATE.activeChartType,
    theme: STATE.chartTheme,
    params: STATE.currentChartParams,
    plotlyData: STATE.currentPlotlyData,
    layout: STATE.currentPlotlyLayout,
  };
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `${STATE.activeChartType || 'chart'}_config.json`);
  toast('图表配置 JSON 已下载', 'success');
}

function exportTableExcel() {
  if (!STATE.currentTableData || !STATE.currentTableData.rows) {
    toast('请先生成三线表', 'warning'); return;
  }
  const cols = STATE.currentTableData.columns;
  const rows = STATE.currentTableData.rows;
  let csv = cols.join(',') + '\n';
  rows.forEach(row => {
    const vals = cols.map(c => {
      const v = row[c] !== undefined ? String(row[c]).replace(/,/g, ';') : '';
      return v.includes(' ') ? `"${v}"` : v;
    });
    csv += vals.join(',') + '\n';
  });
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, 'three_line_table.csv');
  toast('表格已导出为 CSV (可用Excel打开)', 'success');
}

function exportTableCSV() {
  exportTableExcel();
}

function exportTableHTML() {
  if (!STATE.currentTableData || !STATE.currentTableData.rows) {
    toast('请先生成三线表', 'warning'); return;
  }
  const cols = STATE.currentTableData.columns;
  const rows = STATE.currentTableData.rows;
  let html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>三线表</title>
<style>body{font-family:'Noto Sans SC',sans-serif;padding:24px;}
.three-line{border-collapse:collapse;width:100%;}
.three-line thead{border-top:2px solid #000;border-bottom:1px solid #000;}
.three-line th{padding:8px 12px;text-align:left;font-weight:800;background:#f9fafb;}
.three-line td{padding:8px 12px;}
.three-line tbody tr:last-child{border-bottom:2px solid #000;}
</style></head><body><table class="three-line"><thead><tr>`;
  cols.forEach(c => { html += `<th>${c}</th>`; });
  html += '</tr></thead><tbody>';
  rows.forEach(row => {
    html += '<tr>';
    cols.forEach(c => { html += `<td>${row[c] !== undefined ? row[c] : ''}</td>`; });
    html += '</tr>';
  });
  html += '</tbody></table></body></html>';
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  downloadBlob(blob, 'three_line_table.html');
  toast('HTML 表格已下载', 'success');
}

function copyTableToClipboard() {
  if (!STATE.currentTableData || !STATE.currentTableData.rows) {
    toast('请先生成三线表', 'warning'); return;
  }
  const cols = STATE.currentTableData.columns;
  const rows = STATE.currentTableData.rows;
  let text = cols.join('\t') + '\n';
  rows.forEach(row => {
    text += cols.map(c => row[c] !== undefined ? row[c] : '').join('\t') + '\n';
  });
  navigator.clipboard.writeText(text).then(() => {
    toast('表格已复制到剪贴板，可直接粘贴到Word/Excel', 'success');
  }).catch(() => toast('复制失败，请手动复制', 'error'));
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 250);
}

function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => a.remove(), 250);
}

function safeFilename(value) {
  return String(value || 'download').replace(/[\\/:*?"<>|]+/g, '_').slice(0, 80);
}

function csvEscape(value) {
  const s = String(value ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function uniqueCsvColumns(cols) {
  return [...new Set((cols || []).flat().filter(Boolean))];
}

function columnDataToCSV(data, columns) {
  const n = Math.max(...columns.map(c => (data[c] || []).length), 0);
  let csv = columns.map(csvEscape).join(',') + '\n';
  for (let i = 0; i < n; i++) {
    csv += columns.map(c => csvEscape((data[c] || [])[i] ?? '')).join(',') + '\n';
  }
  return csv;
}

// ── Server-side publication export ─────────────────────
const SERVER_PUBLICATION_CHARTS = new Set([
  'scatter', 'grouped_scatter', 'box', 'violin', 'box_scatter',
  'violin_box_scatter', 'bar', 'stacked_bar', 'error_bar',
  'heatmap', 'correlation_heatmap',
  'line', 'multi_line', 'area', 'histogram', 'density',
  'forest', 'survival', 'roc', 'bubble', 'dumbbell',
  'china_map', 'world_map',
]);

function supportsServerPublicationExport(chartType) {
  return SERVER_PUBLICATION_CHARTS.has(String(chartType || ''));
}

function normalizePublicationStyle(style) {
  const value = String(style || '').toLowerCase();
  if (value.includes('nature')) return 'nature';
  return 'cns';
}

async function downloadPublicationChart() {
  if (!STATE.activeChartType) {
    toast('请先生成图表', 'warning');
    return;
  }

  const canUseServer = supportsServerPublicationExport(STATE.activeChartType);
  const format = await showFormatDialog({ supportsPdf: canUseServer });
  if (!format) return;

  if (!canUseServer) {
    await downloadChartImage(format);
    return;
  }

  const params = collectChartParams();
  const theme = getActiveTheme();
  const userPalette = STATE.userColors && STATE.userColors.length > 0 ? STATE.userColors : null;
  const activePalette = userPalette || (typeof getActivePalette === 'function' ? getActivePalette() : null) || theme.colorway || [];

  const payload = {
    chart_type: STATE.activeChartType,
    format: format,
    style: normalizePublicationStyle(STATE.chartTheme),
    title: params.title || '',
    x_var: params.x_var || '',
    y_var: params.y_var || '',
    color_var: params.color_var || '',
    value_vars: params.value_vars || [],
    time_var: params.time_var || '',
    event_var: params.event_var || '',
    outcome_var: params.outcome_var || '',
    predictor_var: params.predictor_var || '',
    ci_lower_var: params.ci_lower_var || '',
    ci_upper_var: params.ci_upper_var || '',
    province_var: params.province_var || '',
    country_var: params.country_var || '',
    map_value_var: params.y_var || params.map_value_var || '',
    upload_id: STATE.uploadId || null,
    use_demo: !STATE.uploadId,
    dataset_name: STATE.datasetName || '',
    colors: activePalette,
    marker_size: STATE.markerSize || 8,
    line_width: STATE.lineWidth || 3,
  };

  try {
    toast('正在生成出版级图表...', 'info');
    const response = await fetch('/api/export/chart/publication', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Export failed');
    }

    const blob = await response.blob();
    const filename = `${safeFilename(STATE.activeChartType)}_publication_${new Date().toISOString().replace(/[:.]/g, '-')}.${format}`;
    downloadBlob(blob, filename);
    toast(`出版级 ${format.toUpperCase()} 已下载`, 'success');
  } catch (err) {
    console.error('Publication chart export failed:', err);
    if (format === 'png' || format === 'svg') {
      toast('后端出版导出失败，已切换为高分辨率 Plotly 导出', 'warning');
      await downloadChartImage(format);
      return;
    }
    toast(`导出失败: ${err.message}`, 'error');
  }
}

function showFormatDialog(options = {}) {
  const supportsPdf = options.supportsPdf !== false;
  return new Promise((resolve) => {
    const dialog = document.createElement('div');
    dialog.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10000;';
    dialog.innerHTML = `
      <div style="background:white;padding:24px;border-radius:12px;max-width:400px;box-shadow:0 4px 20px rgba(0,0,0,0.3);">
        <h3 style="margin:0 0 16px 0;font-size:18px;">选择导出格式</h3>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <button class="primary-btn" data-format="png" style="width:100%;">PNG (高分辨率位图)</button>
          <button class="primary-btn" data-format="svg" style="width:100%;">SVG (矢量图)</button>
          ${supportsPdf ? '<button class="primary-btn" data-format="pdf" style="width:100%;">PDF (出版标准)</button>' : ''}
          <button class="ghost-btn" data-format="cancel" style="width:100%;">取消</button>
        </div>
      </div>
    `;

    dialog.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const format = btn.dataset.format;
      document.body.removeChild(dialog);
      resolve(format === 'cancel' ? null : format);
    });

    document.body.appendChild(dialog);
  });
}
