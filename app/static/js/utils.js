/* ── Global state ─────────────────────────────────────── */
const STATE = {
  uploadId: null,
  fileName: null,
  fileType: null,
  sheetNames: [],
  activeSheet: null,
  columns: [],
  dtypes: {},
  variableTypes: {},
  rowCount: 0,
  colCount: 0,
  previewRows: [],
  summary: {},
  activeChartType: null,
  activeChartCategory: 'basic',
  datasetName: null,
  currentPlotlyData: null,
  currentPlotlyLayout: null,
  currentInterpretData: null,
  currentChartSourceData: null,
  currentChartParams: null,
  currentChartResizeObserver: null,
  chartTheme: 'cnsTheme',
  chartPalette: 'default',
  customPalette: null,
  userColors: null,
  markerSize: 8,
  markerShape: 'circle',
  markerOpacity: 0.88,
  lineWidth: 3,
  barGap: null,
  chartWorkspaces: {},
  chinaGeoJSON: null,
  chinaCentroids: null,
  worldGeoJSON: null,
};

/* ── API helpers ──────────────────────────────────────── */
async function apiPost(url, body = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

async function apiGet(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

function apiDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || '';
  a.click();
}

/* ── DOM helpers ──────────────────────────────────────── */
function el(id) { return document.getElementById(id); }
function qs(sel, parent) { return (parent || document).querySelector(sel); }
function qsa(sel, parent) { return (parent || document).querySelectorAll(sel); }

/* ── Toast notifications ──────────────────────────────── */
function toast(msg, type = 'info') {
  const container = el('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s ease'; setTimeout(() => t.remove(), 300); }, 3200);
}

/* ── Tab switching ────────────────────────────────────── */
function switchTab(tabName) {
  qsa('.tab-content').forEach(tc => tc.style.display = 'none');
  qsa('.nav-tab').forEach(nt => nt.classList.remove('active'));
  const tabEl = el(`tab-${tabName}`);
  if (tabEl) tabEl.style.display = 'block';
  const navEl = qs(`.nav-tab[data-tab="${tabName}"]`);
  if (navEl) navEl.classList.add('active');
}

/* ── Loading & State ──────────────────────────────────── */
function rememberButtonDefaultText(btn) {
  if (!btn) return '';
  if (!btn._defaultText) {
    btn._defaultText = (btn.textContent || '').trim() || '\u751f\u6210\u56fe\u8868';
  }
  return btn._defaultText;
}

function setLoading(btn, loading, loadingText) {
  if (!btn) return;
  const defaultText = rememberButtonDefaultText(btn);
  if (loading) {
    btn.dataset.loading = 'true';
    btn.textContent = loadingText || '\u5904\u7406\u4e2d...';
    btn.disabled = true;
    btn.style.opacity = '0.72';
  } else {
    btn.dataset.loading = 'false';
    btn.textContent = defaultText;
    btn.disabled = false;
    btn.style.opacity = '1';
  }
}

function setButtonComplete(btn, text) {
  if (!btn) return;
  rememberButtonDefaultText(btn);
  btn.dataset.loading = 'false';
  btn.textContent = text || '\u5904\u7406\u5b8c\u6210';
  btn.disabled = false;
  btn.style.opacity = '1';
}

function resetActionButton(btn, defaultText) {
  if (!btn) return;
  btn._defaultText = defaultText || (btn._defaultText || (btn.textContent || '').trim());
  btn.dataset.loading = 'false';
  btn.textContent = btn._defaultText;
  btn.disabled = false;
  btn.style.opacity = '1';
}

function resetGenerateChartButton() {
  resetActionButton(el('generateChartBtn'), '\u751f\u6210\u56fe\u8868');
}

function getInterpretEmptyHtml(title, message) {
  return `
    <div class="interpret-empty">
      <div class="interpret-empty-graphic" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
      <strong>${escapeBasicHtml(title || '\u7b49\u5f85\u751f\u6210\u89e3\u8bfb\u62a5\u544a')}</strong>
      <p>${escapeBasicHtml(message || '\u5f53\u524d\u56fe\u8868\u6216\u53c2\u6570\u5df2\u66f4\u65b0\uff0c\u8bf7\u91cd\u65b0\u751f\u6210\u89e3\u8bfb\u62a5\u544a\u3002')}</p>
    </div>
  `;
}

function resetInterpretationState(title, message) {
  STATE.currentInterpretData = null;
  const container = el('interpretResultContainer');
  if (container) container.innerHTML = getInterpretEmptyHtml(title, message);
  const btn = el('generateInterpretBtn');
  if (btn) {
    btn.disabled = false;
    btn.dataset.loading = 'false';
    const label = btn.querySelector('.interpret-btn-label');
    if (label) label.textContent = '\u751f\u6210\u89e3\u8bfb';
  }
}

function invalidateChartOutputs(reason) {
  resetGenerateChartButton();
  resetInterpretationState(
    '\u7b49\u5f85\u751f\u6210\u89e3\u8bfb\u62a5\u544a',
    reason || '\u56fe\u8868\u3001\u6570\u636e\u6216\u53c2\u6570\u5df2\u53d8\u66f4\uff0c\u8bf7\u5148\u751f\u6210\u56fe\u8868\uff0c\u518d\u751f\u6210\u89e3\u8bfb\u3002'
  );
}

function escapeBasicHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function resetDatasetState() {
  STATE.uploadId = null;
  STATE.fileName = null;
  STATE.fileType = null;
  STATE.sheetNames = [];
  STATE.activeSheet = null;
  STATE.columns = [];
  STATE.dtypes = {};
  STATE.variableTypes = {};
  STATE.rowCount = 0;
  STATE.colCount = 0;
  STATE.previewRows = [];
  STATE.summary = {};
  STATE.datasetName = null;
}

function getWorkspaceStateFromCurrent() {
  return {
    uploadId: STATE.uploadId,
    fileName: STATE.fileName,
    fileType: STATE.fileType,
    sheetNames: [...(STATE.sheetNames || [])],
    activeSheet: STATE.activeSheet,
    columns: [...(STATE.columns || [])],
    dtypes: { ...(STATE.dtypes || {}) },
    variableTypes: { ...(STATE.variableTypes || {}) },
    rowCount: STATE.rowCount || 0,
    colCount: STATE.colCount || 0,
    previewRows: [...(STATE.previewRows || [])],
    summary: { ...(STATE.summary || {}) },
    datasetName: STATE.datasetName || null,
    chartParams: { ...(STATE.currentChartParams || {}) },
  };
}

function saveActiveChartWorkspace() {
  if (!STATE.activeChartType) return;
  STATE.chartWorkspaces[STATE.activeChartType] = getWorkspaceStateFromCurrent();
}

function loadChartWorkspace(chartId) {
  const workspace = STATE.chartWorkspaces[chartId];
  if (!workspace) {
    resetDatasetState();
    STATE.currentChartParams = null;
    return;
  }
  STATE.uploadId = workspace.uploadId || null;
  STATE.fileName = workspace.fileName || null;
  STATE.fileType = workspace.fileType || null;
  STATE.sheetNames = [...(workspace.sheetNames || [])];
  STATE.activeSheet = workspace.activeSheet || null;
  STATE.columns = [...(workspace.columns || [])];
  STATE.dtypes = { ...(workspace.dtypes || {}) };
  STATE.variableTypes = { ...(workspace.variableTypes || {}) };
  STATE.rowCount = workspace.rowCount || 0;
  STATE.colCount = workspace.colCount || 0;
  STATE.previewRows = [...(workspace.previewRows || [])];
  STATE.summary = { ...(workspace.summary || {}) };
  STATE.datasetName = workspace.datasetName || null;
  STATE.currentChartParams = { ...(workspace.chartParams || {}) };
}

function saveCurrentChartParams(params) {
  STATE.currentChartParams = { ...(params || {}) };
  saveActiveChartWorkspace();
  resetInterpretationState(
    '\u89e3\u8bfb\u5df2\u8fc7\u671f',
    '\u56fe\u8868\u53c2\u6570\u6216\u53ef\u89c6\u5316\u7ed3\u679c\u5df2\u66f4\u65b0\uff0c\u8bf7\u91cd\u65b0\u751f\u6210\u7ed3\u679c\u89e3\u8bfb\u3002'
  );
}
