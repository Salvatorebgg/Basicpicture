/* ── Variable Select Module ─────────────────────────────── */

const CHART_DEFAULT_VARS = {
  scatter: { x_var: 'age', y_var: 'bmi', color_var: 'group' },
  grouped_scatter: { x_var: 'age', y_var: 'bmi', color_var: 'group' },
  bar: { x_var: 'treatment', y_var: 'value', color_var: 'response' },
  stacked_bar: { x_var: 'treatment', y_var: 'value', color_var: 'response' },
  line: { x_var: 'week', y_var: 'sbp', color_var: 'group' },
  multi_line: { x_var: 'week', y_var: 'sbp', color_var: 'group' },
  area: { x_var: 'week', y_var: 'sbp', color_var: 'group' },
  histogram: { x_var: 'bmi', color_var: 'group' },
  density: { x_var: 'bmi', color_var: 'group' },
  box: { x_var: 'group', y_var: 'bmi', color_var: 'sex' },
  violin: { x_var: 'group', y_var: 'bmi', color_var: 'sex' },
  box_scatter: { x_var: 'group', y_var: 'bmi', color_var: 'sex' },
  violin_box_scatter: { x_var: 'group', y_var: 'bmi', color_var: 'sex' },
  error_bar: { x_var: 'treatment', y_var: 'value', color_var: 'response' },
  dumbbell: { x_var: 'parameter', y_var: 'baseline_mean', color_var: 'followup_mean' },
  forest: { x_var: 'subgroup', y_var: 'or' },
  volcano: { x_var: 'log2fc', y_var: 'pvalue', color_var: 'gene' },
  bubble: { x_var: 'prevalence', y_var: 'risk_ratio', size_var: 'sample_size', color_var: 'region' },
  heatmap: { x_var: 'timepoint', y_var: 'indicator', color_var: 'value' },
  correlation_heatmap: { value_vars: ['Age', 'BMI', 'SBP', 'DBP', 'Glucose', 'HbA1c', 'Total Cholesterol', 'LDL-C', 'HDL-C', 'Triglycerides', 'CRP', 'ALT', 'Creatinine', 'eGFR', 'Waist'] },
  pca: { value_vars: ['age', 'bmi', 'sbp', 'dbp', 'glucose', 'cholesterol'], color_var: 'group' },
  survival: { time_var: 'time', event_var: 'event', color_var: 'group' },
  roc: { outcome_var: 'outcome', predictor_var: 'risk_score' },
  raincloud: { x_var: 'method', y_var: 'bmi' },
  beeswarm: { x_var: 'method', y_var: 'bmi' },
  beanplot: { x_var: 'method', y_var: 'bmi' },
  venn: { value_vars: ['hypertension', 'diabetes', 'dyslipidemia', 'obesity'] },
  upset: { value_vars: ['hypertension', 'diabetes', 'dyslipidemia', 'obesity'] },
  dca: { outcome_var: 'outcome', value_vars: ['risk_score', 'biomarker_a', 'biomarker_b', 'biomarker_c'] },
  china_map: { province_var: 'province', y_var: 'incidence' },
  world_map: { country_var: 'country', y_var: 'incidence' },
};

function buildChartVarControls() {
  const container = el('varControls');
  if (!container) return;
  const vt = STATE.variableTypes || {};
  const chartType = STATE.activeChartType || 'scatter';
  const config = getChartConfig ? getChartConfig(chartType) : null;

  if (!STATE.activeChartType) {
    container.innerHTML = `
      <div class="chart-control-empty">
        <div class="chart-control-empty-title">还没有选择图表</div>
        <div class="chart-control-empty-desc">请先在“选择图表”中点击一种图形，系统会打开对应工作台。</div>
      </div>
    `;
    return;
  }

  if (!STATE.columns || STATE.columns.length === 0) {
    container.innerHTML = `
      <div class="chart-control-empty">
        <div class="chart-control-empty-title">先准备 ${config ? config.name : '当前图表'} 的数据</div>
        <div class="chart-control-empty-desc">左侧上方可加载本图示例、下载示例 CSV，或上传自己的数据。数据载入后这里会显示当前图所需变量。</div>
      </div>
    `;
    return;
  }

  const numCols = uniqueList((vt.continuous && vt.continuous.length > 0) ? vt.continuous : guessNumericCols());
  const catCols = uniqueList([...(vt.categorical || []), ...(vt.binary || []), ...(vt.group || [])]);
  if (catCols.length === 0) catCols.push(...guessCatCols());
  const allCols = STATE.columns && STATE.columns.length > 0 ? STATE.columns : Object.keys(buildDataFromState());
  const regionCols = uniqueList((vt.region && vt.region.length > 0) ? vt.region : allCols.filter(c => c.toLowerCase().includes('province') || c.toLowerCase().includes('country')));
  const binCols = uniqueList((vt.binary && vt.binary.length > 0) ? vt.binary : allCols.filter(c => c.toLowerCase().includes('outcome') || c.toLowerCase().includes('event') || c.toLowerCase().includes('hypertension') || c.toLowerCase().includes('diabetes')));
  const dateCols = uniqueList([...(vt.date || []), ...(vt.time || [])]);
  const defaults = {
    ...(CHART_DEFAULT_VARS[chartType] || {}),
    ...(STATE.currentChartParams || {}),
  };
  const used = new Set();

  const slots = getChartVarSlots(chartType);
  let html = '';

  for (const slot of slots) {
    let candidates = getCandidatesForSlot(chartType, slot, { allCols, numCols, catCols, regionCols, binCols, dateCols });

    if (candidates.length === 0 && !slot.optional) candidates = allCols;
    if (candidates.length === 0) continue;
    candidates = uniqueList(candidates).filter(c => allCols.includes(c));
    const selected = defaultSelection(slot, defaults[slot.name], candidates, used, chartType);

    html += '<div class="form-group">';
    html += `<label class="form-label">${slot.label} ${slot.optional ? '(可选)' : '<span style="color:#B34D3E;">*必需</span>'}</label>`;
    html += `<select class="form-select chart-var-select" id="chartVar_${slot.name}"${slot.multiple ? ' multiple size="' + Math.min(candidates.length, 6) + '"' : ''}>`;
    if (!slot.multiple) html += `<option value="">— ${slot.placeholder || '选择变量'} —</option>`;
    for (const col of candidates) {
      html += `<option value="${col}"${selected.includes(col) ? ' selected' : ''}>${col}</option>`;
    }
    html += '</select>';
    if (slot.hint) html += `<div class="form-hint">${slot.hint}</div>`;
    html += '</div>';
  }
  container.innerHTML = html;

  qsa('.chart-var-select', container).forEach(sel => {
    sel.addEventListener('change', () => {
      if (typeof renderAppearanceControls === 'function') renderAppearanceControls();
    });
  });
}

function uniqueList(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function getCandidatesForSlot(chartType, slot, cols) {
  const { allCols, numCols, catCols, regionCols, binCols, dateCols } = cols;
  const continuousX = ['scatter', 'grouped_scatter', 'volcano', 'bubble'];
  const categoricalX = ['bar', 'stacked_bar', 'box', 'violin', 'box_scatter', 'violin_box_scatter', 'error_bar', 'raincloud', 'beeswarm', 'beanplot', 'heatmap'];
  const timeX = ['line', 'multi_line', 'area'];

  if (slot.name === 'value_vars') {
    if (['venn', 'upset'].includes(chartType)) return binCols.length ? binCols : allCols;
    return numCols.length ? numCols : allCols;
  }
  if (['province_var', 'country_var'].includes(slot.name)) return regionCols.length ? regionCols : allCols;
  if (['event_var', 'outcome_var'].includes(slot.name)) return binCols.length ? binCols : allCols;
  if (['predictor_var', 'size_var'].includes(slot.name)) return numCols.length ? numCols : allCols;
  if (['color_var', 'group_var', 'facet_var'].includes(slot.name)) {
    if (['dumbbell', 'heatmap'].includes(chartType) && slot.name === 'color_var') return numCols.length ? numCols : allCols;
    if (['volcano', 'bubble'].includes(chartType)) return uniqueList([...catCols, ...allCols]);
    return catCols.length ? catCols : allCols;
  }
  if (slot.name === 'time_var') return uniqueList([...dateCols, ...numCols, ...allCols]);
  if (slot.name === 'x_var') {
    if (continuousX.includes(chartType)) return numCols.length ? numCols : allCols;
    if (categoricalX.includes(chartType)) return catCols.length ? catCols : allCols;
    if (timeX.includes(chartType)) return uniqueList([...dateCols, ...numCols, ...allCols]);
    return allCols;
  }
  if (slot.name === 'y_var') {
    if (chartType === 'heatmap') return catCols.length ? catCols : allCols;
    if (['forest', 'dumbbell'].includes(chartType)) return numCols.length ? numCols : allCols;
    return numCols.length ? numCols : allCols;
  }
  return allCols;
}

function defaultSelection(slot, configured, candidates, used, chartType) {
  const configuredList = Array.isArray(configured) ? configured : (configured ? [configured] : []);
  if (slot.multiple) {
    let values = configuredList.filter(v => candidates.includes(v));
    if (values.length === 0 && !slot.optional) {
      const max = chartType === 'upset' ? 6 : chartType === 'venn' ? 4 : 6;
      values = candidates.slice(0, max);
    }
    values.forEach(v => used.add(v));
    return values;
  }

  const configuredValue = configuredList.find(v => candidates.includes(v));
  if (configuredValue) {
    used.add(configuredValue);
    return [configuredValue];
  }
  if (slot.optional) return [];

  const fallback = candidates.find(c => !used.has(c)) || candidates[0];
  if (fallback) used.add(fallback);
  return fallback ? [fallback] : [];
}

function guessNumericCols() {
  const data = buildDataFromState();
  return Object.keys(data).filter(k => {
    const vals = data[k] || [];
    return vals.length > 0 && vals.some(v => v !== '' && v !== null && v !== undefined && !isNaN(Number(v)));
  });
}

function guessCatCols() {
  const data = buildDataFromState();
  return Object.keys(data).filter(k => {
    const vals = data[k] || [];
    const unique = new Set(vals.filter(v => v !== '' && v !== null && v !== undefined));
    return unique.size <= 30 && unique.size > 0;
  });
}

function getChartVarSlots(chartType) {
  const slotsMap = {
    scatter: [
      { name: 'x_var', label: 'X 轴变量（连续）', optional: false },
      { name: 'y_var', label: 'Y 轴变量（连续）', optional: false },
      { name: 'color_var', label: '颜色分组', optional: true },
    ],
    grouped_scatter: [
      { name: 'x_var', label: 'X 轴变量', optional: false },
      { name: 'y_var', label: 'Y 轴变量', optional: false },
      { name: 'color_var', label: '分组变量', optional: false },
    ],
    bar: [
      { name: 'x_var', label: 'X 轴（分类）', optional: false },
      { name: 'y_var', label: 'Y 轴（数值）', optional: false },
      { name: 'color_var', label: '颜色分组', optional: true },
    ],
    stacked_bar: [
      { name: 'x_var', label: 'X 轴（分类）', optional: false },
      { name: 'y_var', label: 'Y 轴（数值）', optional: false },
      { name: 'color_var', label: '堆叠分组', optional: false },
    ],
    line: [
      { name: 'x_var', label: 'X 轴变量', optional: false },
      { name: 'y_var', label: 'Y 轴变量', optional: false },
      { name: 'color_var', label: '分组', optional: true },
    ],
    multi_line: [
      { name: 'x_var', label: 'X 轴变量', optional: false },
      { name: 'y_var', label: 'Y 轴变量', optional: false },
      { name: 'color_var', label: '分组变量', optional: false },
    ],
    area: [
      { name: 'x_var', label: 'X 轴变量', optional: false },
      { name: 'y_var', label: 'Y 轴变量', optional: false },
      { name: 'color_var', label: '颜色分组', optional: true },
    ],
    histogram: [
      { name: 'x_var', label: '变量', optional: false },
      { name: 'color_var', label: '颜色分组', optional: true },
    ],
    density: [
      { name: 'x_var', label: '变量', optional: false },
      { name: 'color_var', label: '颜色分组', optional: true },
    ],
    box: [
      { name: 'x_var', label: 'X 轴（分组）', optional: true },
      { name: 'y_var', label: 'Y 轴变量', optional: false },
      { name: 'color_var', label: '颜色分组', optional: true },
    ],
    violin: [
      { name: 'x_var', label: 'X 轴（分组）', optional: true },
      { name: 'y_var', label: 'Y 轴变量', optional: false },
      { name: 'color_var', label: '颜色分组', optional: true },
    ],
    box_scatter: [
      { name: 'x_var', label: 'X 轴（分组）', optional: true },
      { name: 'y_var', label: 'Y 轴变量', optional: false },
      { name: 'color_var', label: '颜色分组', optional: true },
    ],
    violin_box_scatter: [
      { name: 'x_var', label: 'X 轴（分组）', optional: true },
      { name: 'y_var', label: 'Y 轴变量', optional: false },
      { name: 'color_var', label: '颜色分组', optional: true },
    ],
    error_bar: [
      { name: 'x_var', label: 'X 轴（分组）', optional: false },
      { name: 'y_var', label: 'Y 轴（数值）', optional: false },
      { name: 'color_var', label: '颜色分组', optional: true },
    ],
    dumbbell: [
      { name: 'x_var', label: '标签列', optional: false },
      { name: 'y_var', label: '起点数值列', optional: false },
      { name: 'color_var', label: '终点数值列', optional: false },
    ],
    forest: [
      { name: 'x_var', label: '亚组标签列', optional: false },
      { name: 'y_var', label: '效应量列 (OR/RR)', optional: false },
      { name: 'color_var', label: '分组（可选）', optional: true },
    ],
    volcano: [
      { name: 'x_var', label: 'log2FC 列', optional: false },
      { name: 'y_var', label: 'p-value 列', optional: false },
      { name: 'color_var', label: '标签列（可选）', optional: true },
    ],
    bubble: [
      { name: 'x_var', label: 'X 轴变量', optional: false },
      { name: 'y_var', label: 'Y 轴变量', optional: false },
      { name: 'size_var', label: '气泡大小', optional: false },
      { name: 'color_var', label: '标签/颜色', optional: true },
    ],
    heatmap: [
      { name: 'x_var', label: 'X 轴（列类别）', optional: false },
      { name: 'y_var', label: 'Y 轴（行类别）', optional: false },
      { name: 'color_var', label: '数值变量', optional: false },
    ],
    correlation_heatmap: [
      { name: 'value_vars', label: '纳入变量（多选）', optional: false, multiple: true, hint: '按住 Ctrl 多选，至少 2 个连续变量' },
    ],
    missingness_heatmap: [],
    pca: [
      { name: 'value_vars', label: '纳入变量（多选）', optional: false, multiple: true, hint: '按住 Ctrl 多选，至少 2 个连续变量' },
      { name: 'color_var', label: '颜色分组', optional: true },
    ],
    survival: [
      { name: 'time_var', label: '时间变量', optional: false },
      { name: 'event_var', label: '事件变量 (0/1)', optional: false },
      { name: 'color_var', label: '分组变量', optional: false },
    ],
    roc: [
      { name: 'outcome_var', label: '结局变量 (0/1)', optional: false },
      { name: 'predictor_var', label: '预测变量（连续）', optional: false },
    ],
    raincloud: [
      { name: 'x_var', label: 'X 轴（分组）', optional: false },
      { name: 'y_var', label: 'Y 轴变量', optional: false },
      { name: 'color_var', label: '颜色分组', optional: true },
    ],
    beeswarm: [
      { name: 'x_var', label: 'X 轴（分组）', optional: false },
      { name: 'y_var', label: 'Y 轴变量', optional: false },
      { name: 'color_var', label: '颜色分组', optional: true },
    ],
    china_map: [
      { name: 'province_var', label: '省份变量', optional: false },
      { name: 'y_var', label: '数值变量', optional: false },
    ],
    world_map: [
      { name: 'country_var', label: '国家变量', optional: false },
      { name: 'y_var', label: '数值变量', optional: false },
    ],
    venn: [
      { name: 'value_vars', label: '集合变量（多选，2-4个0/1列）', optional: false, multiple: true, hint: '按住 Ctrl 多选，选择 2-4 个二分类变量' },
    ],
    upset: [
      { name: 'value_vars', label: '集合变量（多选，2-6个0/1列）', optional: false, multiple: true, hint: '按住 Ctrl 多选，选择多个二分类变量' },
    ],
    beanplot: [
      { name: 'x_var', label: 'X 轴（分组）', optional: false },
      { name: 'y_var', label: 'Y 轴变量', optional: false },
      { name: 'color_var', label: '颜色分组', optional: true },
    ],
    dca: [
      { name: 'outcome_var', label: '结局变量 (0/1)', optional: false },
      { name: 'value_vars', label: '预测模型列（多选）', optional: false, multiple: true, hint: '按住 Ctrl 多选，选择风险预测列' },
    ],
  };

  const defaultSlots = [
    { name: 'x_var', label: 'X 轴变量', optional: true },
    { name: 'y_var', label: 'Y 轴变量（连续）', optional: false },
    { name: 'color_var', label: '颜色/分组', optional: true },
  ];

  return slotsMap[chartType] || defaultSlots;
}
