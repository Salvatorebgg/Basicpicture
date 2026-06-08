/* ── Results Interpretation ───────────────────────────── */

function initInterpretation() {}

async function generateInterpretation() {
  const btn = el('generateInterpretBtn');

  if (!STATE.activeChartType) {
    toast('请先选择图表类型并载入数据', 'warning');
    return;
  }
  if (!(STATE.columns || []).length) {
    toast('请先载入数据', 'warning');
    return;
  }

  // Always start fresh — discard any cached interpretation from a previous chart
  STATE.currentInterpretData = null;
  setLoading(btn, true);

  try {
    // Read chart params directly from current DOM state, don't merge with cache
    const chartParams = {};
    if (typeof collectChartParams === 'function') {
      try { Object.assign(chartParams, collectChartParams()); } catch (e) {}
    }
    STATE.currentChartParams = { ...chartParams };

    const body = {
      use_demo: !STATE.uploadId,
      dataset_name: STATE.uploadId ? undefined : (STATE.datasetName || 'baseline_table_example'),
      upload_id: STATE.uploadId || undefined,
      chart_type: STATE.activeChartType,
      chart_params: chartParams,
    };

    const result = await apiPost('/api/interpret', body);
    STATE.currentInterpretData = result;
    renderInterpretation(result);
    toast('解读报告已生成', 'success');
  } catch (e) {
    toast('解读失败: ' + e.message, 'error');
    console.error(e);
  } finally {
    setLoading(btn, false);
  }
}

function setInterpretButtonLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = loading;
  btn.dataset.loading = loading ? 'true' : 'false';
  const label = btn.querySelector('.interpret-btn-label');
  if (label) label.textContent = loading ? '生成中...' : '生成解读';
}

function renderInterpretation(data) {
  const container = el('interpretResultContainer');
  if (!container) return;

  const dp = data.data_profile || {};
  const q = data.quality || {};
  const ins = data.insights || {};
  const pub = data.publication || {};
  const report = data.report || {};
  const guide = data.visual_guide || {};
  const scores = normalizeQualityScores(data);
  const observations = ins.observations || [];
  const score = clampNumber(pub.score ?? report.quality_score ?? averageScore(scores), 0, 100);
  const grade = pub.grade || gradeFromScore(score);
  const headline = report.headline || `${data.chart_name || '当前图表'}已完成质量评估`;
  const subheadline = report.subheadline || `纳入 ${dp.n || 0} 条观测、${dp.variables || 0} 个变量，缺失率 ${dp.missing_pct ?? '—'}%。`;

  container.innerHTML = `
    <article class="ir-report">
      <section class="ir-hero">
        <div class="ir-hero-copy">
          <div class="ir-kicker">Interpretation Report</div>
          <h4>${esc(data.chart_name || '结果解读')}</h4>
          <p>${esc(headline)}</p>
          <span>${esc(subheadline)}</span>
          <div class="ir-meta-pills">
            ${metricPill('N', dp.n ?? 0, '样本')}
            ${metricPill('Vars', dp.variables ?? 0, '变量')}
            ${metricPill('Missing', dp.missing_pct != null ? `${dp.missing_pct}%` : '—', '缺失')}
            ${metricPill('Type', esc(data.chart_name || '—'), '图形')}
          </div>
        </div>
        ${scoreDial(score, grade, pub.level || '')}
      </section>

      <div class="ir-top-grid">
        <section class="ir-panel ir-quality-panel">
          <div class="ir-panel-head">
            <div>
              <h4>质量仪表盘</h4>
              <span>样本、完整性、离群值与分布形态</span>
            </div>
            <b>${averageScore(scores)}/100</b>
          </div>
          <div class="ir-quality-meters">
            ${scores.map(qualityMeter).join('')}
          </div>
        </section>

        <section class="ir-panel ir-guide-panel">
          <div class="ir-panel-head">
            <div>
              <h4>读图指南</h4>
              <span>${esc(guide.title || '识别主体模式、异常值与统计限制')}</span>
            </div>
          </div>
          <div class="ir-guide-layout">
            <div class="ir-guide-visual" aria-hidden="true">
              ${guideGraphic(guide.kind || visualKindFromChart(data.chart_type))}
            </div>
            <div class="ir-guide-copy">
              <p>${esc(guide.signal || data.chart_purpose || '先看总体结构，再看局部偏离和异常点。')}</p>
              <div class="ir-role-list">
                ${(guide.roles || fallbackRoles()).map(role => `<span><b>${esc(role.label)}</b>${esc(role.value)}</span>`).join('')}
              </div>
              <small>${esc(guide.caution || '图形发现需要结合研究设计和统计检验共同解释。')}</small>
            </div>
          </div>
        </section>
      </div>

      <div class="ir-main-grid">
        <section class="ir-panel">
          <div class="ir-panel-head compact">
            <h4>关键发现</h4>
            <span>${observations.length || 0} 条</span>
          </div>
          ${orderedFindings(observations)}
        </section>

        <section class="ir-panel">
          <div class="ir-panel-head compact">
            <h4>临床解释</h4>
            <span>Clinical meaning</span>
          </div>
          <div class="ir-clinical-card">
            <p>${esc(report.clinical_note || ins.clinical_note || '当前图形可用于识别数据模式，建议结合研究设计、变量定义和统计检验进行解释。')}</p>
          </div>
          <div class="ir-subgrid">
            ${miniList('优势', report.strengths || pub.strengths || [], 'ok')}
            ${miniList('限制', report.limitations || [], 'warn')}
          </div>
        </section>
      </div>

      <div class="ir-bottom-grid">
        <section class="ir-panel">
          <div class="ir-panel-head compact">
            <h4>统计审查</h4>
            <span>Method check</span>
          </div>
          ${plainList(report.method_notes || ins.stats_notes || [], 'ir-note-list')}
        </section>

        <section class="ir-panel">
          <div class="ir-panel-head compact">
            <h4>发表前建议</h4>
            <span>${esc(pub.level || 'Publication readiness')}</span>
          </div>
          ${actionList(report.next_steps || pub.tips || [])}
        </section>
      </div>

      <section class="ir-panel ir-caption-panel">
        <div class="ir-panel-head compact">
          <h4>图注草稿</h4>
          <span>Caption draft</span>
        </div>
        <p>${esc(report.caption || `${data.chart_name || '本图'}用于${data.chart_purpose || '展示数据特征'}。`)}</p>
      </section>
    </article>
  `;
}

function metricPill(label, value, sub) {
  return `<span class="ir-meta-pill"><b>${label}</b><strong>${value}</strong><small>${sub}</small></span>`;
}

function scoreDial(score, grade, level) {
  const dash = clampNumber(score, 0, 100);
  return `
    <div class="ir-score-dial" style="--score:${dash}">
      <svg viewBox="0 0 120 120" role="img" aria-label="出版适宜性 ${dash}/100">
        <circle class="ir-dial-bg" cx="60" cy="60" r="48" pathLength="100"></circle>
        <circle class="ir-dial-fg" cx="60" cy="60" r="48" pathLength="100" stroke-dasharray="${dash} 100"></circle>
      </svg>
      <div class="ir-score-text">
        <strong>${dash}</strong>
        <span>${esc(grade)} · ${esc(level || '出版适宜性')}</span>
      </div>
    </div>
  `;
}

function qualityMeter(item) {
  const score = clampNumber(item.score ?? labelScore(item.status), 0, 100);
  return `
    <div class="ir-meter-card tone-${item.tone || toneFromStatus(item.status)}" style="--value:${score}">
      <div class="ir-meter-top">
        <span>${esc(item.label)}</span>
        ${statusPill(item.status, item.tone)}
      </div>
      <div class="ir-meter-track"><i></i></div>
      <p>${esc(item.note || '—')}</p>
    </div>
  `;
}

function statusPill(label, tone) {
  return `<b class="istat tone-${tone || toneFromStatus(label)}">${esc(label || '—')}</b>`;
}

function orderedFindings(items) {
  if (!items.length) return '<p class="ir-none">当前数据未检出明显的主体模式。</p>';
  return `<ol class="ir-finding-list">${items.map((item, i) => `
    <li>
      <span>${String(i + 1).padStart(2, '0')}</span>
      <p>${esc(item)}</p>
    </li>
  `).join('')}</ol>`;
}

function miniList(title, items, tone) {
  const list = (items || []).length ? items : ['暂无额外提示'];
  return `
    <div class="ir-mini-list tone-${tone}">
      <h5>${title}</h5>
      ${list.slice(0, 4).map(item => `<p>${esc(item)}</p>`).join('')}
    </div>
  `;
}

function plainList(items, cls) {
  const list = (items || []).length ? items : ['图形结论应与预设统计分析计划保持一致。'];
  return `<ul class="${cls}">${list.slice(0, 6).map(item => `<li>${esc(item)}</li>`).join('')}</ul>`;
}

function actionList(items) {
  const normalized = (items || []).map(item => {
    if (typeof item === 'string') return { priority: '建议', title: item, detail: '用于提升图形的期刊呈现质量。' };
    return item;
  });
  const list = normalized.length ? normalized : [{ priority: '可选', title: '补充图注中的样本定义', detail: '让读者明确纳入对象、变量单位和统计口径。' }];
  return `<div class="ir-action-list">${list.slice(0, 5).map(item => `
    <div class="ir-action-item">
      <span>${esc(item.priority || '建议')}</span>
      <div><b>${esc(item.title || '')}</b><p>${esc(item.detail || '')}</p></div>
    </div>
  `).join('')}</div>`;
}

function normalizeQualityScores(data) {
  if (Array.isArray(data.quality_scores) && data.quality_scores.length) return data.quality_scores;
  const q = data.quality || {};
  const items = [
    ['sample', '样本量', q.sample],
    ['missing', '完整性', q.missing],
    ['outliers', '离群值', q.outliers],
    ['normality', '分布形态', q.normality],
  ];
  return items.map(([key, label, raw]) => ({
    key,
    label,
    status: (raw || {}).label || '—',
    note: (raw || {}).note || '',
    score: labelScore((raw || {}).label),
    tone: toneFromStatus((raw || {}).label),
  }));
}

function fallbackRoles() {
  return (STATE.columns || []).slice(0, 3).map((c, i) => ({ label: i === 0 ? '变量' : '参考', value: c }));
}

function averageScore(items) {
  if (!items || !items.length) return 0;
  return Math.round(items.reduce((sum, item) => sum + clampNumber(item.score ?? 0, 0, 100), 0) / items.length);
}

function labelScore(label) {
  const map = { '充足': 96, '优': 96, '良': 84, '可接受': 72, '中': 60, '偏小': 42, '差': 26, '无数据': 0, '—': 50 };
  return map[label] ?? 50;
}

function toneFromStatus(label) {
  if (['充足', '优', '良'].includes(label)) return 'ok';
  if (['可接受', '中', '偏小'].includes(label)) return 'warn';
  if (['差', '无数据'].includes(label)) return 'err';
  return 'neutral';
}

function gradeFromScore(score) {
  if (score >= 90) return 'A';
  if (score >= 70) return 'B';
  return 'C';
}

function visualKindFromChart(chartType) {
  const groups = {
    relationship: ['scatter', 'grouped_scatter', 'bubble', 'pca', 'bland_altman', 'method_comparison'],
    distribution: ['box', 'violin', 'box_scatter', 'violin_box_scatter', 'histogram', 'density', 'raincloud', 'beanplot', 'beeswarm', 'strip_plot', 'ridgeline', 'qq_plot'],
    ranking: ['bar', 'horizontal_bar', 'grouped_bar', 'stacked_bar', 'percent_stacked_bar', 'lollipop', 'cleveland_dot', 'error_bar', 'pareto_chart', 'polar_bar', 'population_pyramid'],
    trend: ['line', 'multi_line', 'area', 'survival', 'slope', 'paired_line', 'step_plot', 'ecdf_plot', 'swimmer', 'waterfall'],
    interval: ['forest', 'dumbbell', 'mean_ci_plot', 'subgroup_effect_matrix'],
    matrix: ['heatmap', 'correlation_heatmap', 'upset', 'parallel_coords'],
    spatial: ['china_map', 'world_map', 'usa_map', 'europe_map', 'uk_map', 'china_bubble_map', 'world_bubble_map'],
    flow: ['sankey', 'treemap', 'funnel', 'sunburst_chart', 'chord_flow', 'radial_tree', 'venn'],
    diagnostic: ['roc', 'multi_roc', 'precision_recall', 'lift_chart', 'time_auc_curve', 'calibration_curve', 'risk_calibration', 'dca', 'decision_impact_curve', 'nomogram', 'clinical_decile_plot'],
  };
  for (const [kind, charts] of Object.entries(groups)) {
    if (charts.includes(chartType)) return kind;
  }
  return 'generic';
}

function guideGraphic(kind) {
  if (kind === 'distribution') return distributionGraphic();
  if (kind === 'ranking') return rankingGraphic();
  if (kind === 'trend') return trendGraphic();
  if (kind === 'interval') return intervalGraphic();
  if (kind === 'matrix') return matrixGraphic();
  if (kind === 'spatial') return spatialGraphic();
  if (kind === 'flow') return flowGraphic();
  if (kind === 'diagnostic') return diagnosticGraphic();
  if (kind === 'relationship') return relationshipGraphic();
  return workflowGraphic();
}

function relationshipGraphic() {
  return `
    <svg class="ir-svg ir-svg-relationship" viewBox="0 0 300 190">
      <path class="ir-grid" d="M40 20V158M94 20V158M148 20V158M202 20V158M256 20V158M34 132H270M34 92H270M34 52H270"/>
      <path class="ir-axis" d="M34 158H272M34 158V18"/>
      <path class="ir-trend" d="M52 132C98 113 130 102 166 80S225 48 258 35"/>
      <g class="ir-dots">
        <circle cx="58" cy="134" r="5"/><circle cx="82" cy="124" r="4"/><circle cx="108" cy="118" r="5"/>
        <circle cx="128" cy="94" r="4"/><circle cx="152" cy="96" r="5"/><circle cx="174" cy="74" r="4"/>
        <circle cx="200" cy="68" r="5"/><circle cx="226" cy="49" r="4"/><circle cx="248" cy="42" r="5"/>
      </g>
    </svg>`;
}

function distributionGraphic() {
  return `
    <svg class="ir-svg ir-svg-distribution" viewBox="0 0 300 190">
      <path class="ir-grid" d="M36 150H270M36 112H270M36 74H270"/>
      <path class="ir-density" d="M38 150C70 150 73 72 112 72C145 72 151 128 176 128C202 128 205 44 242 44C264 44 267 150 276 150"/>
      <path class="ir-box" d="M86 154H220M112 140V168M112 154H190M190 140V168M151 138V170"/>
      <g class="ir-dots small">
        <circle cx="78" cy="154" r="3"/><circle cx="104" cy="154" r="3"/><circle cx="132" cy="154" r="3"/>
        <circle cx="158" cy="154" r="3"/><circle cx="206" cy="154" r="3"/><circle cx="236" cy="154" r="3"/>
      </g>
    </svg>`;
}

function rankingGraphic() {
  return `
    <svg class="ir-svg ir-svg-ranking" viewBox="0 0 300 190">
      <path class="ir-grid" d="M44 34V156M98 34V156M152 34V156M206 34V156M260 34V156"/>
      <g class="ir-bars">
        <rect x="50" y="118" width="34" height="38" rx="6"/><rect x="104" y="88" width="34" height="68" rx="6"/>
        <rect x="158" y="62" width="34" height="94" rx="6"/><rect x="212" y="38" width="34" height="118" rx="6"/>
      </g>
      <path class="ir-trend secondary" d="M67 112L121 84L175 58L229 34"/>
    </svg>`;
}

function trendGraphic() {
  return `
    <svg class="ir-svg ir-svg-trend" viewBox="0 0 300 190">
      <path class="ir-grid" d="M38 150H268M38 112H268M38 74H268M38 36H268"/>
      <path class="ir-axis" d="M38 158H272M38 158V24"/>
      <path class="ir-trend" d="M48 132C76 116 92 102 118 105C148 108 154 68 186 64C216 60 230 80 260 44"/>
      <path class="ir-trend secondary" d="M48 142C82 136 100 120 128 126C162 132 174 104 202 98C228 92 242 100 260 76"/>
    </svg>`;
}

function intervalGraphic() {
  return `
    <svg class="ir-svg ir-svg-interval" viewBox="0 0 300 190">
      <path class="ir-axis vertical" d="M150 28V162"/>
      <g class="ir-intervals">
        <path d="M82 52H184"/><circle cx="132" cy="52" r="6"/>
        <path d="M120 86H232"/><circle cx="176" cy="86" r="6"/>
        <path d="M68 120H144"/><circle cx="104" cy="120" r="6"/>
        <path d="M154 154H248"/><circle cx="198" cy="154" r="6"/>
      </g>
    </svg>`;
}

function matrixGraphic() {
  const cells = Array.from({ length: 20 }, (_, i) => {
    const x = 48 + (i % 5) * 38;
    const y = 28 + Math.floor(i / 5) * 34;
    const cls = ['a', 'b', 'c', 'd'][i % 4];
    return `<rect class="${cls}" x="${x}" y="${y}" width="30" height="26" rx="6"/>`;
  }).join('');
  return `<svg class="ir-svg ir-svg-matrix" viewBox="0 0 300 190"><g class="ir-matrix">${cells}</g></svg>`;
}

function spatialGraphic() {
  return `
    <svg class="ir-svg ir-svg-spatial" viewBox="0 0 300 190">
      <path class="ir-map-shape" d="M82 44C104 18 142 32 158 52C176 32 222 38 232 72C244 112 216 156 176 148C154 176 98 164 92 130C58 120 54 76 82 44Z"/>
      <circle class="ir-map-dot a" cx="116" cy="78" r="10"/><circle class="ir-map-dot b" cx="166" cy="94" r="16"/>
      <circle class="ir-map-dot c" cx="198" cy="126" r="12"/><circle class="ir-map-dot d" cx="128" cy="132" r="7"/>
    </svg>`;
}

function flowGraphic() {
  return `
    <svg class="ir-svg ir-svg-flow" viewBox="0 0 300 190">
      <path class="ir-flow-path a" d="M58 62C120 36 178 42 236 72"/>
      <path class="ir-flow-path b" d="M58 96C126 104 176 112 238 104"/>
      <path class="ir-flow-path c" d="M58 132C118 158 180 152 238 122"/>
      <g class="ir-flow-nodes"><rect x="34" y="46" width="48" height="104" rx="12"/><rect x="218" y="58" width="50" height="78" rx="12"/></g>
    </svg>`;
}

function diagnosticGraphic() {
  return `
    <svg class="ir-svg ir-svg-diagnostic" viewBox="0 0 300 190">
      <path class="ir-grid" d="M42 150H266M42 112H266M42 74H266M42 36H266"/>
      <path class="ir-axis" d="M42 154H268M42 154V26"/>
      <path class="ir-reference" d="M42 154L268 26"/>
      <path class="ir-trend" d="M42 154C82 88 126 54 168 40C204 28 236 30 268 26"/>
    </svg>`;
}

function workflowGraphic() {
  return `
    <svg class="ir-svg ir-svg-workflow" viewBox="0 0 300 190">
      <path class="ir-flow-path b" d="M72 96H226"/>
      <g class="ir-workflow-nodes">
        <circle cx="70" cy="96" r="24"/><circle cx="150" cy="96" r="24"/><circle cx="230" cy="96" r="24"/>
      </g>
    </svg>`;
}

function clampNumber(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function esc(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
