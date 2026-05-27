/* ── Three-Line Table Generator ──────────────────────────── */

function initTableGenerator() {
  // Table type tabs initialized in app.js initTableTypeTabs()
  // Generate button bound in app.js DOMContentLoaded
}

async function generateTable() {
  const btn = el('generateTableBtn');
  if (!btn) return;
  setLoading(btn, true);

  const tableType = STATE.activeTableType || 'baseline';
  const groupVarSel = el('tableGroupVar');
  const groupVar = groupVarSel ? groupVarSel.value : '';
  const decimalsSel = el('tableDecimals');
  const decimals = decimalsSel ? (parseInt(decimalsSel.value) || 2) : 2;
  const varSel = el('tableVars');
  const selectedVars = varSel ? Array.from(varSel.selectedOptions).map(o => o.value).filter(Boolean) : [];

  if (tableType === 'baseline' && !groupVar) {
    toast('基线资料表需要选择分组变量', 'warning');
    setLoading(btn, false);
    return;
  }

  try {
    const body = {
      use_demo: !STATE.uploadId,
      dataset_name: STATE.uploadId ? undefined : (STATE.datasetName || 'baseline_table_example'),
      upload_id: STATE.uploadId || undefined,
      group_var: groupVar || undefined,
      variables: selectedVars.length > 0 ? selectedVars : undefined,
      decimal_places: decimals,
      p_digits: 3,
    };

    const endpoint =
      tableType === 'baseline' ? '/api/table/baseline' :
      tableType === 'descriptive' ? '/api/table/descriptive' :
      '/api/table/missing';

    const result = await apiPost(endpoint, body);

    STATE.currentTableData = result;
    renderTableResult(result, tableType);

    const toolbar = el('tableToolbar');
    if (toolbar) toolbar.style.display = 'flex';
    toast('三线表已生成', 'success');
  } catch (e) {
    toast('三线表生成失败: ' + e.message, 'error');
    console.error(e);
  }

  setLoading(btn, false);
}

function renderTableResult(result, tableType) {
  const container = el('tableResultContainer');
  if (!container) return;
  const cols = result.columns || [];
  const rows = result.rows || [];
  const titleMap = {
    baseline: '基线资料表 (Table 1)',
    descriptive: '连续变量描述统计表',
    missing: '缺失值统计表'
  };

  let html = '<div class="data-table-wrap"><table class="medical-table">';
  html += `<caption>${titleMap[tableType] || '三线表'} (N = ${result.n_total || '—'})</caption>`;
  html += '<thead><tr>';
  cols.forEach(col => {
    html += `<th>${escapeHtml(String(col))}</th>`;
  });
  html += '</tr></thead><tbody>';

  rows.forEach(row => {
    html += '<tr>';
    cols.forEach(col => {
      const val = row[col] !== undefined && row[col] !== null ? String(row[col]) : '—';
      html += `<td>${escapeHtml(val)}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  container.innerHTML = html;
}

function buildTableVarControls() {
  const allCols = STATE.columns || [];
  const vt = STATE.variableTypes || {};
  const contCols = vt.continuous || [];
  const binCols = vt.binary || [];
  const catColsVt = vt.categorical || [];
  const groupCols = vt.group || [];

  // Group var candidates: binary, group, or categorical with <=10 cats
  const groupCandidates = [...binCols, ...groupCols, ...catColsVt].filter(Boolean);

  const groupSel = el('tableGroupVar');
  if (groupSel) {
    let opts = '<option value="">— 选择分组变量 —</option>';
    const candidates = groupCandidates.length > 0 ? groupCandidates : allCols;
    candidates.forEach(c => {
      opts += `<option value="${c}">${c}</option>`;
    });
    groupSel.innerHTML = opts;
  }

  // Variable multi-select
  const analyzableCols = [...contCols, ...binCols, ...catColsVt].filter(Boolean);
  const varSel = el('tableVars');
  if (varSel) {
    let opts = '';
    const candidates = analyzableCols.length > 0 ? analyzableCols : allCols;
    candidates.forEach(c => {
      opts += `<option value="${c}">${c}</option>`;
    });
    varSel.innerHTML = opts;
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
