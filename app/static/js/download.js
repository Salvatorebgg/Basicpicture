/* ── Download Module ────────────────────────────────────── */

function initDownloads() {
  // Export buttons are handled via event delegation in app.js initExportButtons()
}

async function downloadChartImage(format) {
  const normalizedFormat = String(format || '').toLowerCase();
  if (!['png', 'svg', 'tiff', 'pdf'].includes(normalizedFormat)) {
    toast(`暂不支持 ${String(format).toUpperCase()} 格式`, 'warning');
    return;
  }

  const plotEl = getCurrentPlotElement();
  if (!plotEl) {
    toast('请先生成图表', 'warning');
    return;
  }

  if (!window.Plotly) {
    toast('Plotly 未加载，无法导出图表。请刷新页面后重试。', 'error');
    return;
  }

  const filename = `${safeFilename(STATE.activeChartType || 'chart')}_${new Date().toISOString().replace(/[:.]/g, '-')}`;

  try {
    if (normalizedFormat === 'svg') {
      const dataUrl = await exportPlotlyDataUrl(plotEl, 'svg', 1);
      downloadDataUrl(dataUrl, `${filename}.svg`);
      toast('SVG 已按当前预览下载', 'success');
      return;
    }

    if (normalizedFormat === 'png') {
      const dataUrl = await exportPlotlyDataUrl(plotEl, 'png', 2.5);
      downloadDataUrl(dataUrl, `${filename}.png`);
      toast('PNG 已按当前预览下载', 'success');
      return;
    }

    const raster = await rasterizeCurrentPlot(plotEl, 2.5);
    if (normalizedFormat === 'tiff') {
      const tiffBytes = encodeCanvasAsTiff(raster.canvas);
      downloadBlob(new Blob([tiffBytes], { type: 'image/tiff' }), `${filename}.tiff`);
      toast('TIFF 已按当前预览下载', 'success');
      return;
    }

    if (normalizedFormat === 'pdf') {
      const pdfBytes = encodeCanvasAsPdf(raster.canvas, raster.cssWidth, raster.cssHeight);
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `${filename}.pdf`);
      toast('PDF 已按当前预览下载', 'success');
    }
  } catch (err) {
    console.error('Chart export failed:', err);
    try {
      const fallbackSize = getDisplayedPlotSize(plotEl);
      await Plotly.downloadImage(plotEl, {
        format: normalizedFormat === 'svg' ? 'svg' : 'png',
        width: fallbackSize.width,
        height: fallbackSize.height,
        scale: 2.5,
        filename,
      });
      toast(`${normalizedFormat.toUpperCase()} 已按当前预览尺寸下载`, 'success');
    } catch (fallbackErr) {
      console.error('Plotly downloadImage fallback failed:', fallbackErr);
      toast(`导出 ${normalizedFormat.toUpperCase()} 失败: ${fallbackErr.message || err.message}`, 'error');
    }
  }
}

async function exportPlotlyDataUrl(plotEl, format, scale) {
  const exportSize = await syncPlotForWysiwygExport(plotEl);
  return Plotly.toImage(plotEl, {
    format,
    width: exportSize.width,
    height: exportSize.height,
    scale,
  });
}

function getCurrentPlotElement() {
  const previewEl = el('chartPreviewContainer');
  let plotEl = qs('#chartPreviewContainer .chart-plot');
  if (!plotEl) plotEl = qs('#chartPreviewContainer .js-plotly-plot');
  if (!plotEl) plotEl = previewEl?.querySelector('[class*="plotly"]');
  if (!plotEl) plotEl = previewEl?.querySelector('div[data-plotly]');
  return plotEl || null;
}

function getDisplayedPlotSize(plotEl) {
  const full = plotEl?._fullLayout || {};
  const width = Math.floor(full.width || plotEl?.clientWidth || STATE.currentPlotlyLayout?.width || 1200);
  const height = Math.floor(full.height || plotEl?.clientHeight || STATE.currentPlotlyLayout?.height || 720);
  return {
    width: Math.max(320, width),
    height: Math.max(320, height),
  };
}

async function syncPlotForWysiwygExport(plotEl) {
  if (!plotEl || !window.Plotly) return getDisplayedPlotSize(plotEl);

  if (typeof Plotly.Plots?.resize === 'function') {
    const resizePromise = Plotly.Plots.resize(plotEl);
    if (resizePromise && typeof resizePromise.then === 'function') {
      await resizePromise;
    }
  }

  const size = getDisplayedPlotSize(plotEl);
  const relayoutPromise = Plotly.relayout(plotEl, {
    width: size.width,
    height: size.height,
    autosize: false,
  });
  if (relayoutPromise && typeof relayoutPromise.then === 'function') {
    await relayoutPromise;
  }
  if (STATE.currentPlotlyLayout) {
    STATE.currentPlotlyLayout = {
      ...STATE.currentPlotlyLayout,
      width: size.width,
      height: size.height,
      autosize: false,
    };
  }
  return size;
}

async function rasterizeCurrentPlot(plotEl, scale = 2.5) {
  const size = await syncPlotForWysiwygExport(plotEl);
  const dataUrl = await Plotly.toImage(plotEl, {
    format: 'png',
    width: size.width,
    height: size.height,
    scale,
  });
  const img = await loadImageFromDataUrl(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  return { canvas, cssWidth: size.width, cssHeight: size.height };
}

function loadImageFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('无法读取当前预览图像'));
    img.src = dataUrl;
  });
}

function encodeCanvasAsTiff(canvas) {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const rgba = ctx.getImageData(0, 0, width, height).data;
  const pixelBytes = width * height * 3;
  const entryCount = 12;
  const ifdOffset = 8;
  const ifdSize = 2 + entryCount * 12 + 4;
  const bitsOffset = ifdOffset + ifdSize;
  const xResOffset = bitsOffset + 6;
  const yResOffset = xResOffset + 8;
  const pixelOffset = yResOffset + 8;
  const totalBytes = pixelOffset + pixelBytes;
  const buffer = new ArrayBuffer(totalBytes);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  bytes[0] = 0x49; bytes[1] = 0x49;
  view.setUint16(2, 42, true);
  view.setUint32(4, ifdOffset, true);
  view.setUint16(ifdOffset, entryCount, true);

  let entry = ifdOffset + 2;
  const writeEntry = (tag, type, count, value) => {
    view.setUint16(entry, tag, true);
    view.setUint16(entry + 2, type, true);
    view.setUint32(entry + 4, count, true);
    if (type === 3 && count === 1) {
      view.setUint16(entry + 8, value, true);
      view.setUint16(entry + 10, 0, true);
    } else {
      view.setUint32(entry + 8, value, true);
    }
    entry += 12;
  };

  writeEntry(256, 4, 1, width);
  writeEntry(257, 4, 1, height);
  writeEntry(258, 3, 3, bitsOffset);
  writeEntry(259, 3, 1, 1);
  writeEntry(262, 3, 1, 2);
  writeEntry(273, 4, 1, pixelOffset);
  writeEntry(277, 3, 1, 3);
  writeEntry(278, 4, 1, height);
  writeEntry(279, 4, 1, pixelBytes);
  writeEntry(282, 5, 1, xResOffset);
  writeEntry(283, 5, 1, yResOffset);
  writeEntry(296, 3, 1, 2);
  view.setUint32(ifdOffset + 2 + entryCount * 12, 0, true);

  view.setUint16(bitsOffset, 8, true);
  view.setUint16(bitsOffset + 2, 8, true);
  view.setUint16(bitsOffset + 4, 8, true);
  view.setUint32(xResOffset, 300, true);
  view.setUint32(xResOffset + 4, 1, true);
  view.setUint32(yResOffset, 300, true);
  view.setUint32(yResOffset + 4, 1, true);

  let p = pixelOffset;
  for (let i = 0; i < rgba.length; i += 4) {
    const a = rgba[i + 3] / 255;
    bytes[p++] = Math.round(rgba[i] * a + 255 * (1 - a));
    bytes[p++] = Math.round(rgba[i + 1] * a + 255 * (1 - a));
    bytes[p++] = Math.round(rgba[i + 2] * a + 255 * (1 - a));
  }
  return bytes;
}

function encodeCanvasAsPdf(canvas, cssWidth, cssHeight) {
  const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.96);
  const jpegBytes = dataUrlToBytes(jpegDataUrl);
  const pageWidth = Math.max(320, Math.round(cssWidth || canvas.width));
  const pageHeight = Math.max(320, Math.round(cssHeight || canvas.height));
  const imageWidth = canvas.width;
  const imageHeight = canvas.height;
  const encoder = new TextEncoder();
  const chunks = [];
  const offsets = [0];
  let length = 0;

  const push = (chunk) => {
    const bytes = typeof chunk === 'string' ? encoder.encode(chunk) : chunk;
    chunks.push(bytes);
    length += bytes.length;
  };
  const startObject = (id) => {
    offsets[id] = length;
    push(`${id} 0 obj\n`);
  };

  push('%PDF-1.4\n');
  startObject(1);
  push('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  startObject(2);
  push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  startObject(3);
  push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`);
  startObject(4);
  push(`<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`);
  push(jpegBytes);
  push('\nendstream\nendobj\n');
  const content = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im0 Do\nQ\n`;
  startObject(5);
  push(`<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream\nendobj\n`);

  const xrefOffset = length;
  push('xref\n0 6\n0000000000 65535 f \n');
  for (let i = 1; i <= 5; i++) {
    push(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  }
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  const out = new Uint8Array(length);
  let offset = 0;
  chunks.forEach(chunk => {
    out.set(chunk, offset);
    offset += chunk.length;
  });
  return out;
}

function dataUrlToBytes(dataUrl) {
  const base64 = String(dataUrl).split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
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
