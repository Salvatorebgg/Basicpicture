/* ── Chart Configurations for Clinical Graphics ──────────── */

function numeric(arr) { return (arr || []).map(v => Number(v)).filter(v => !isNaN(v)); }
function unique(arr) { return [...new Set(arr || [])].filter(Boolean); }
function fmtNum(value, digits = 1) {
  const n = Number(value);
  if (Number.isNaN(n)) return '';
  return Math.abs(n) >= 100 ? n.toFixed(0) : n.toFixed(digits);
}
function numericSeries(arr) {
  return (arr || []).map(v => {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  });
}
function isMissingCell(value) {
  if (value === null || value === undefined) return true;
  const text = String(value).trim();
  return text === '' || ['NA', 'N/A', 'NULL', 'NaN', 'nan', 'None', 'none', '缺失', '未记录'].includes(text);
}
function cnsMapScale(theme) {
  return theme.mapScale || [
    [0, '#F7FBFF'],
    [0.2, '#C6DBEF'],
    [0.45, '#6BAED6'],
    [0.7, '#2171B5'],
    [0.9, '#08306B'],
  ];
}
function journalMapScale(theme) {
  return theme.sequentialScale || [
    [0, '#FFF5F0'],
    [0.2, '#FDCBA5'],
    [0.45, '#F8765C'],
    [0.7, '#D7301F'],
    [0.9, '#7F0000'],
  ];
}
const THEME_HEATMAP_SCALES = {
  cnsTheme: [[0, '#313695'], [0.10, '#4575B4'], [0.22, '#74ADD1'], [0.34, '#ABD9E9'], [0.46, '#E0F3F8'], [0.50, '#FFFFFF'], [0.56, '#FEE090'], [0.68, '#FDAE61'], [0.80, '#F46D43'], [0.92, '#D73027'], [1, '#A50026']],
  clinicalTheme: [[0, '#004C4C'], [0.14, '#0E7C7B'], [0.28, '#5AB8AF'], [0.42, '#DDF3EC'], [0.50, '#FFFDF7'], [0.58, '#F6D9B8'], [0.72, '#E9A05F'], [0.86, '#C65C4A'], [1, '#7F1D1D']],
  journalTheme: [[0, '#081D2E'], [0.16, '#1B4F72'], [0.32, '#75A3BF'], [0.46, '#F2F2F2'], [0.50, '#FFFFFF'], [0.58, '#E4C26E'], [0.74, '#B7950B'], [0.90, '#784212'], [1, '#3D1F0F']],
  natureStyleTheme: [[0, '#3C5488'], [0.16, '#4DBBD5'], [0.32, '#91D1C2'], [0.46, '#F7F7F7'], [0.50, '#FFFFFF'], [0.60, '#F39B7F'], [0.76, '#E64B35'], [0.90, '#B51F1F'], [1, '#7A1111']],
  lancetTheme: [[0, '#00468B'], [0.14, '#0099B4'], [0.30, '#8FD1D5'], [0.46, '#F7F7F7'], [0.50, '#FFFFFF'], [0.60, '#FDAF91'], [0.74, '#ED0000'], [0.90, '#AD002A'], [1, '#6D001A']],
  nejmTheme: [[0, '#0072B5'], [0.16, '#6F99AD'], [0.32, '#D6E7EF'], [0.46, '#FFF8F0'], [0.50, '#FFFFFF'], [0.60, '#FFDC91'], [0.74, '#E18727'], [0.90, '#BC3C29'], [1, '#7F1F18']],
  scienceTheme: [[0, '#1B195E'], [0.14, '#3B4992'], [0.30, '#9089C2'], [0.46, '#F8F8F8'], [0.50, '#FFFFFF'], [0.60, '#9CCB8F'], [0.74, '#008B45'], [0.90, '#005B2E'], [1, '#00391E']],
  warmTheme: [[0, '#4A1F1A'], [0.14, '#8A3C2B'], [0.30, '#C5741A'], [0.44, '#F7D39C'], [0.50, '#FFF8F0'], [0.60, '#E8B35B'], [0.74, '#B34D3E'], [0.90, '#7A2E28'], [1, '#401512']],
  coolTheme: [[0, '#0A2A43'], [0.14, '#2E5090'], [0.30, '#4A90D9'], [0.44, '#B9E7EF'], [0.50, '#FFFFFF'], [0.60, '#8FD7CF'], [0.74, '#1B7A8A'], [0.90, '#0E4E5B'], [1, '#062E36']],
  pastelTheme: [[0, '#BEBADA'], [0.14, '#80B1D3'], [0.30, '#8DD3C7'], [0.44, '#F7FCF8'], [0.50, '#FFFFFF'], [0.60, '#FFFFB3'], [0.74, '#FDB462'], [0.90, '#FB8072'], [1, '#D95F59']],
  darkMutedTheme: [[0, '#141A21'], [0.14, '#304C68'], [0.30, '#6090B8'], [0.44, '#8AC6B4'], [0.50, '#252A30'], [0.60, '#D0A850'], [0.74, '#D08070'], [0.90, '#9D4F58'], [1, '#4E1E2A']],
  monoTheme: [[0, '#000000'], [0.18, '#262626'], [0.34, '#666666'], [0.48, '#D9D9D9'], [0.50, '#FFFFFF'], [0.62, '#B8B8B8'], [0.78, '#707070'], [0.92, '#333333'], [1, '#111111']],
};
const THEME_CORRELATION_SCALES = {
  cnsTheme: [[0, '#053061'], [0.12, '#2166AC'], [0.26, '#67A9CF'], [0.42, '#D1E5F0'], [0.50, '#FFFFFF'], [0.58, '#FDDBC7'], [0.74, '#EF8A62'], [0.88, '#B2182B'], [1, '#67001F']],
  clinicalTheme: [[0, '#005F60'], [0.18, '#0E7C7B'], [0.34, '#8FD0C8'], [0.48, '#F7FBF7'], [0.50, '#FFFFFF'], [0.62, '#F2C69D'], [0.78, '#B34D3E'], [0.92, '#7F1D1D'], [1, '#4A0E0E']],
  journalTheme: [[0, '#17202A'], [0.18, '#1B4F72'], [0.36, '#9DB8C9'], [0.50, '#FFFFFF'], [0.64, '#E6CF87'], [0.82, '#922B21'], [1, '#3A0F0A']],
  natureStyleTheme: [[0, '#3C5488'], [0.18, '#4DBBD5'], [0.36, '#91D1C2'], [0.50, '#FFFFFF'], [0.64, '#F39B7F'], [0.82, '#E64B35'], [1, '#7A1111']],
  lancetTheme: [[0, '#00468B'], [0.18, '#0099B4'], [0.36, '#A6DCE2'], [0.50, '#FFFFFF'], [0.64, '#FDAF91'], [0.82, '#ED0000'], [1, '#AD002A']],
  nejmTheme: [[0, '#0072B5'], [0.18, '#7FB3D5'], [0.36, '#DDECF4'], [0.50, '#FFFFFF'], [0.64, '#FFDC91'], [0.82, '#BC3C29'], [1, '#7F1F18']],
  scienceTheme: [[0, '#3B4992'], [0.18, '#7876B1'], [0.36, '#D6D3EA'], [0.50, '#FFFFFF'], [0.64, '#A7D8A0'], [0.82, '#008B45'], [1, '#005B2E']],
  warmTheme: [[0, '#5A241E'], [0.18, '#C5741A'], [0.36, '#F5D4A8'], [0.50, '#FFF8F0'], [0.64, '#D59F32'], [0.82, '#B34D3E'], [1, '#401512']],
  coolTheme: [[0, '#1A3A5C'], [0.18, '#4A90D9'], [0.36, '#B8E4EE'], [0.50, '#FFFFFF'], [0.64, '#8DDCD3'], [0.82, '#1B7A8A'], [1, '#062E36']],
  pastelTheme: [[0, '#BEBADA'], [0.18, '#80B1D3'], [0.36, '#DDEFEA'], [0.50, '#FFFFFF'], [0.64, '#FFFFB3'], [0.82, '#FB8072'], [1, '#D95F59']],
  darkMutedTheme: [[0, '#141A21'], [0.18, '#6090B8'], [0.36, '#8AC6B4'], [0.50, '#252A30'], [0.64, '#D0A850'], [0.82, '#D08070'], [1, '#4E1E2A']],
  monoTheme: [[0, '#000000'], [0.22, '#4A4A4A'], [0.42, '#D0D0D0'], [0.50, '#FFFFFF'], [0.66, '#A0A0A0'], [0.84, '#4A4A4A'], [1, '#111111']],
};
function activeThemeKey() {
  return (typeof STATE !== 'undefined' && STATE.chartTheme) ? STATE.chartTheme : 'cnsTheme';
}
function themeHeatmapScale(theme) {
  return theme.heatmapScale || THEME_HEATMAP_SCALES[activeThemeKey()] || THEME_HEATMAP_SCALES.cnsTheme;
}
function themeCorrelationScale(theme) {
  return theme.correlationScale || THEME_CORRELATION_SCALES[activeThemeKey()] || theme.divergentScale || THEME_CORRELATION_SCALES.cnsTheme;
}
let _geoJSONCache = null;
let _worldGeoJSONCache = null;
async function loadChinaGeoJSON() {
  if (_geoJSONCache) return _geoJSONCache;
  try {
    const resp = await fetch('/static/china_provinces.geojson');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    _geoJSONCache = await resp.json();
    STATE.chinaGeoJSON = _geoJSONCache;
    return _geoJSONCache;
  } catch (e) {
    console.warn('Failed to load China GeoJSON:', e);
    return null;
  }
}
async function loadWorldGeoJSON() {
  if (_worldGeoJSONCache) return _worldGeoJSONCache;
  try {
    const resp = await fetch('/static/world_countries.geojson');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    _worldGeoJSONCache = await resp.json();
    STATE.worldGeoJSON = _worldGeoJSONCache;
    return _worldGeoJSONCache;
  } catch (e) {
    console.warn('Failed to load world GeoJSON:', e);
    return null;
  }
}
function loadChinaCentroids() {
  if (STATE.chinaCentroids) return STATE.chinaCentroids;
  try {
    // Embedded centroids from generated china_centroids.json
    STATE.chinaCentroids = {
      "anhui":[31.86,117.21],"beijing":[40.18,116.41],"chongqing":[30.06,107.87],
      "fujian":[26.08,117.92],"gansu":[38.54,102.64],"guangdong":[23.38,113.53],
      "guangxi":[23.61,108.28],"guizhou":[26.83,106.82],"hainan":[19.2,109.85],
      "hebei":[38.62,115.7],"heilongjiang":[48.57,127.7],"henan":[33.9,113.5],
      "hong kong":[22.35,114.15],"hubei":[30.98,112.24],"hunan":[27.69,111.68],
      "inner mongol":[43.93,114.07],"jiangsu":[32.97,119.55],"jiangxi":[27.59,116.02],
      "jilin":[43.67,126.13],"liaoning":[41.29,122.63],"ningxia":[37.36,106.09],
      "qinghai":[35.39,98.81],"shaanxi":[35.84,109.08],"shandong":[36.33,118.23],
      "shanghai":[31.24,121.47],"shanxi":[37.25,111.73],"sichuan":[30.18,103.97],
      "taiwan":[23.75,120.97],"tianjin":[39.28,117.34],"xinjiang":[41.1,85.19],
      "xizang":[31.69,88.12],"yunnan":[25.3,101.87],"zhejiang":[29.25,120.04],
      "macau":[22.19,113.54]
    };
    return STATE.chinaCentroids;
  } catch (e) {
    return {};
  }
}
function groupBy(xVals, yVals, gVals) {
  const groups = unique(gVals);
  return groups.map(g => {
    const indices = (gVals || []).map((v, i) => v === g ? i : -1).filter(i => i >= 0);
    return {
      name: String(g),
      x: indices.map(i => xVals[i]),
      y: indices.map(i => yVals[i]),
    };
  });
}

function safeName(name) { return name || ''; }

const CHINA_PROVINCE_LABELS = {
  'beijing':'北京','tianjin':'天津','hebei':'河北','shanxi':'山西','inner mongol':'内蒙古',
  'liaoning':'辽宁','jilin':'吉林','heilongjiang':'黑龙江','shanghai':'上海','jiangsu':'江苏',
  'zhejiang':'浙江','anhui':'安徽','fujian':'福建','jiangxi':'江西','shandong':'山东',
  'henan':'河南','hubei':'湖北','hunan':'湖南','guangdong':'广东','guangxi':'广西',
  'hainan':'海南','chongqing':'重庆','sichuan':'四川','guizhou':'贵州','yunnan':'云南',
  'xizang':'西藏','shaanxi':'陕西','gansu':'甘肃','qinghai':'青海','ningxia':'宁夏',
  'xinjiang':'新疆','hong kong':'香港','macau':'澳门','taiwan':'台湾',
};

const CHINA_PROVINCE_ALIASES = {
  '北京':'beijing','北京市':'beijing',
  '天津':'tianjin','天津市':'tianjin',
  '河北':'hebei','河北省':'hebei',
  '山西':'shanxi','山西省':'shanxi',
  '内蒙古':'inner mongol','内蒙古自治区':'inner mongol','inner mongolia':'inner mongol','nei menggu':'inner mongol',
  '辽宁':'liaoning','辽宁省':'liaoning',
  '吉林':'jilin','吉林省':'jilin',
  '黑龙江':'heilongjiang','黑龙江省':'heilongjiang',
  '上海':'shanghai','上海市':'shanghai',
  '江苏':'jiangsu','江苏省':'jiangsu',
  '浙江':'zhejiang','浙江省':'zhejiang',
  '安徽':'anhui','安徽省':'anhui',
  '福建':'fujian','福建省':'fujian',
  '江西':'jiangxi','江西省':'jiangxi',
  '山东':'shandong','山东省':'shandong',
  '河南':'henan','河南省':'henan',
  '湖北':'hubei','湖北省':'hubei',
  '湖南':'hunan','湖南省':'hunan',
  '广东':'guangdong','广东省':'guangdong',
  '广西':'guangxi','广西壮族自治区':'guangxi',
  '海南':'hainan','海南省':'hainan',
  '重庆':'chongqing','重庆市':'chongqing',
  '四川':'sichuan','四川省':'sichuan',
  '贵州':'guizhou','贵州省':'guizhou',
  '云南':'yunnan','云南省':'yunnan',
  '西藏':'xizang','西藏自治区':'xizang','tibet':'xizang',
  '陕西':'shaanxi','陕西省':'shaanxi','shaanxi province':'shaanxi',
  '甘肃':'gansu','甘肃省':'gansu',
  '青海':'qinghai','青海省':'qinghai',
  '宁夏':'ningxia','宁夏回族自治区':'ningxia',
  '新疆':'xinjiang','新疆维吾尔自治区':'xinjiang',
  '香港':'hong kong','香港特别行政区':'hong kong','hongkong':'hong kong',
  '澳门':'macau','澳门特别行政区':'macau','macao':'macau',
  '台湾':'taiwan','台湾省':'taiwan',
};

function normalizeProvinceKey(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const lower = raw.toLowerCase();
  if (CHINA_PROVINCE_ALIASES[raw]) return CHINA_PROVINCE_ALIASES[raw];
  if (CHINA_PROVINCE_ALIASES[lower]) return CHINA_PROVINCE_ALIASES[lower];
  return lower
    .replace(/\s+province$/g, '')
    .replace(/\s+municipality$/g, '')
    .replace(/\s+autonomous region$/g, '')
    .replace(/\s+special administrative region$/g, '')
    .trim();
}

function getChinaFeatureKeys(centroids) {
  const geo = STATE.chinaGeoJSON || _geoJSONCache;
  const keys = geo && Array.isArray(geo.features)
    ? geo.features.map(f => f?.properties?.id).filter(Boolean)
    : Object.keys(centroids || {}).filter(k => k === k.toLowerCase() && !/[一-鿿]/.test(k));
  return [...new Set(keys)];
}

const COUNTRY_ISO3 = {
  'china': 'CHN',
  'united states': 'USA',
  'united states of america': 'USA',
  'usa': 'USA',
  'india': 'IND',
  'japan': 'JPN',
  'germany': 'DEU',
  'brazil': 'BRA',
  'russia': 'RUS',
  'russian federation': 'RUS',
  'united kingdom': 'GBR',
  'uk': 'GBR',
  'france': 'FRA',
  'italy': 'ITA',
  'canada': 'CAN',
  'australia': 'AUS',
  'korea, south': 'KOR',
  'south korea': 'KOR',
  'republic of korea': 'KOR',
  'indonesia': 'IDN',
  'nigeria': 'NGA',
  'south africa': 'ZAF',
  'mexico': 'MEX',
  'turkey': 'TUR',
  'thailand': 'THA',
  'vietnam': 'VNM',
  'viet nam': 'VNM',
  'egypt': 'EGY',
  'pakistan': 'PAK',
  'bangladesh': 'BGD',
  'philippines': 'PHL',
};

function normalizeCountryISO(value) {
  const key = String(value ?? '').trim().toLowerCase();
  if (!key) return '';
  if (/^[A-Za-z]{3}$/.test(String(value).trim())) return String(value).trim().toUpperCase();
  return COUNTRY_ISO3[key] || '';
}

function getWorldFeatureISO3() {
  const geo = STATE.worldGeoJSON || _worldGeoJSONCache;
  const keys = geo && Array.isArray(geo.features)
    ? geo.features.map(f => f?.properties?.ISO_A3).filter(k => k && k !== '-99')
    : [];
  return [...new Set(keys)];
}

/* ── Chart Catalog ──────────────────────────────────────── */
const CHART_CATALOG = {

  // ═══ Basic Charts ═══════════════════════════════════════
  scatter: {
    id: 'scatter', name: '散点图', category: 'basic',
    description: '展示两个连续变量之间的关系，每个点代表一个观测值。',
    icon: 'XY', exampleDataset: 'scatter_example',
    buildTraces(data, params, theme) {
      const x = data[safeName(params.x_var)] || [];
      const y = data[safeName(params.y_var)] || [];
      return [{
        type: 'scatter', mode: 'markers', name: '',
        x: x, y: y,
        marker: { color: theme.colorway[0], size: 8, opacity: theme.opacity, line: { color: theme.markerLine, width: 0.5 } },
        hovertemplate: '%{x:.2f}, %{y:.2f}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return { title: params.title || '散点图', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) }, hovermode: 'closest' };
    },
  },

  grouped_scatter: {
    id: 'grouped_scatter', name: '分组散点图', category: 'basic',
    description: '按颜色分组的散点图，展示不同亚群中两个变量的分布关系。',
    icon: 'XYg', exampleDataset: 'scatter_example',
    buildTraces(data, params, theme) {
      const x = data[safeName(params.x_var)] || [];
      const y = data[safeName(params.y_var)] || [];
      const g = data[safeName(params.color_var)] || [];
      return groupBy(x, y, g).map((grp, i) => ({
        type: 'scatter', mode: 'markers', name: grp.name,
        x: grp.x, y: grp.y,
        marker: { color: theme.colorway[i % theme.colorway.length], size: 8, opacity: theme.opacity },
        hovertemplate: '%{x:.2f}, %{y:.2f}<extra>' + grp.name + '</extra>',
      }));
    },
    buildLayout(params) {
      return { title: params.title || '分组散点图', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) }, hovermode: 'closest' };
    },
  },

  bar: {
    id: 'bar', name: '柱状图', category: 'basic',
    description: '展示分类变量的频数或连续变量的均值，适合组间比较。',
    icon: 'Bar', exampleDataset: 'bar_example',
    buildTraces(data, params, theme) {
      const labels = data[safeName(params.x_var)] || [];
      const vals = data[safeName(params.y_var)] || [];
      // Aggregate by label
      const agg = {};
      labels.forEach((l, i) => {
        const key = String(l);
        if (!agg[key]) agg[key] = [];
        agg[key].push(Number(vals[i]) || 0);
      });
      const cats = Object.keys(agg);
      const means = cats.map(c => agg[c].reduce((a, b) => a + b, 0) / Math.max(agg[c].length, 1));
      return [{
        type: 'bar', x: cats, y: means,
        text: means.map(v => fmtNum(v)),
        marker: { color: cats.map((_, i) => theme.colorway[i % theme.colorway.length]), opacity: theme.opacity },
        hovertemplate: '%{x}: %{y:.2f}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return { title: params.title || '柱状图', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) } };
    },
  },

  stacked_bar: {
    id: 'stacked_bar', name: '堆叠柱状图', category: 'basic',
    description: '展示各部分在整体中的构成，适合展示组成结构。',
    icon: 'Stk', exampleDataset: 'bar_example',
    buildTraces(data, params, theme) {
      const xVals = data[safeName(params.x_var)] || [];
      const yVals = data[safeName(params.y_var)] || [];
      const gVals = data[safeName(params.color_var)] || unique(xVals);
      const xCats = unique(xVals);
      const groups = unique(gVals);
      return groups.map((g, i) => {
        const vals = xCats.map(xc => {
          let sum = 0;
          xVals.forEach((xv, j) => { if (String(xv) === String(xc) && String(gVals[j]) === String(g)) sum += Number(yVals[j]) || 0; });
          return sum;
        });
        return {
          type: 'bar', name: String(g), x: xCats, y: vals,
          text: vals.map(v => fmtNum(v)),
          textposition: 'inside',
          insidetextanchor: 'middle',
          marker: { color: theme.colorway[i % theme.colorway.length], opacity: theme.opacity },
        };
      });
    },
    buildLayout(params) {
      return { title: params.title || '堆叠柱状图', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) }, barmode: 'stack' };
    },
  },

  line: {
    id: 'line', name: '折线图', category: 'basic',
    description: '展示数值随变量变化的趋势，适合时间序列数据。',
    icon: 'Ln', exampleDataset: 'line_example',
    buildTraces(data, params, theme) {
      const x = numeric(data[safeName(params.x_var)] || []);
      const y = numeric(data[safeName(params.y_var)] || []);
      const sorted = x.map((xv, i) => ({ x: xv, y: y[i] || 0 })).sort((a, b) => a.x - b.x);
      return [{
        type: 'scatter', mode: 'lines+markers',
        x: sorted.map(d => d.x), y: sorted.map(d => d.y),
        line: { color: theme.colorway[0], width: 2.5 }, marker: { color: theme.colorway[0], size: 6 },
        hovertemplate: '%{x}, %{y:.2f}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return { title: params.title || '折线图', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) } };
    },
  },

  multi_line: {
    id: 'multi_line', name: '多组折线图', category: 'basic',
    description: '多组折线图，展示不同组随变量的变化趋势。',
    icon: 'MLn', exampleDataset: 'line_example',
    buildTraces(data, params, theme) {
      const groups = unique(data[safeName(params.color_var)] || []);
      const xAll = data[safeName(params.x_var)] || [];
      const yAll = data[safeName(params.y_var)] || [];
      const gAll = data[safeName(params.color_var)] || [];
      return groups.map((g, i) => {
        const xg = [], yg = [];
        xAll.forEach((xv, j) => { if (String(gAll[j]) === String(g)) { xg.push(Number(xv)); yg.push(Number(yAll[j]) || 0); } });
        const sorted = xg.map((xv, si) => ({ x: xv, y: yg[si] })).sort((a, b) => a.x - b.x);
        return {
          type: 'scatter', mode: 'lines+markers', name: String(g),
          x: sorted.map(d => d.x), y: sorted.map(d => d.y),
          line: { color: theme.colorway[i % theme.colorway.length], width: 2.5 }, marker: { size: 5 },
        };
      });
    },
    buildLayout(params) {
      return { title: params.title || '多组折线图', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) } };
    },
  },

  area: {
    id: 'area', name: '面积图', category: 'basic',
    description: '填充区域折线图，强调数值的累积感。',
    icon: 'Ar', exampleDataset: 'line_example',
    buildTraces(data, params, theme) {
      const x = numeric(data[safeName(params.x_var)] || []);
      const y = numeric(data[safeName(params.y_var)] || []);
      const sorted = x.map((xv, i) => ({ x: xv, y: y[i] || 0 })).sort((a, b) => a.x - b.x);
      return [{
        type: 'scatter', mode: 'lines', fill: 'tozeroy',
        x: sorted.map(d => d.x), y: sorted.map(d => d.y),
        line: { color: theme.colorway[0], width: 2 },
        fillcolor: theme.colorway[0] + '30',
        hovertemplate: '%{x}, %{y:.2f}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return { title: params.title || '面积图', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) } };
    },
  },

  histogram: {
    id: 'histogram', name: '直方图', category: 'basic',
    description: '展示连续变量的频数分布，观察分布形态。',
    icon: 'Hist', exampleDataset: 'boxplot_example',
    buildTraces(data, params, theme) {
      let vals = numeric(data[safeName(params.x_var)] || []);
      if (vals.length === 0) vals = numeric(data[safeName(params.y_var)] || []);
      return [{
        type: 'histogram', x: vals,
        marker: { color: theme.colorway[0], opacity: theme.opacity, line: { color: theme.markerLine, width: 0.5 } },
        hovertemplate: '%{x}: %{y}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return { title: params.title || '直方图', xaxis: { title: safeName(params.x_var || params.y_var) }, yaxis: { title: 'Frequency' }, bargap: 0.05 };
    },
  },

  density: {
    id: 'density', name: '密度图', category: 'basic',
    description: '平滑的分布曲线，展示数据分布形态。',
    icon: 'Dns', exampleDataset: 'boxplot_example',
    buildTraces(data, params, theme) {
      const vals = numeric(data[safeName(params.x_var)] || []);
      const label = safeName(params.x_var) || 'Value';
      return [{
        type: 'violin', x: Array(vals.length).fill(label), y: vals,
        points: false, box: { visible: false }, meanline: { visible: false },
        line: { color: theme.colorway[0] }, fillcolor: theme.colorway[0] + '50',
        side: 'positive', width: 3,
        hovertemplate: '%{y:.2f}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return { title: params.title || '密度图', xaxis: { title: '' }, yaxis: { title: safeName(params.x_var) } };
    },
  },

  box: {
    id: 'box', name: '箱线图', category: 'basic',
    description: '展示数据的中位数、四分位数和异常值，适合组间分布比较。',
    icon: 'Box', exampleDataset: 'boxplot_example',
    buildTraces(data, params, theme) {
      const xv = params.x_var ? (data[safeName(params.x_var)] || []) : null;
      const yv = numeric(data[safeName(params.y_var)] || []);
      if (xv && xv.length > 0) {
        return [{
          type: 'box', x: xv, y: yv, name: '',
          marker: { color: theme.colorway[0], outliercolor: theme.colorway[4] },
          line: { color: theme.colorway[2] }, fillcolor: theme.colorway[0] + '40',
          hovertemplate: '%{x}: %{y:.2f}<extra></extra>',
        }];
      }
      return [{
        type: 'box', y: yv, name: safeName(params.y_var),
        marker: { color: theme.colorway[0] }, fillcolor: theme.colorway[0] + '40',
        hovertemplate: '%{y:.2f}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return { title: params.title || '箱线图', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) } };
    },
  },

  violin: {
    id: 'violin', name: '小提琴图', category: 'basic',
    description: '展示数据分布密度的平滑曲线，比箱线图更丰富。',
    icon: 'Viol', exampleDataset: 'violin_example',
    buildTraces(data, params, theme) {
      const xv = params.x_var ? (data[safeName(params.x_var)] || []) : null;
      const yv = numeric(data[safeName(params.y_var)] || []);
      if (xv && xv.length > 0) {
        return [{
          type: 'violin', x: xv, y: yv,
          points: false, box: { visible: true, width: 0.2 },
          line: { color: theme.colorway[2] }, fillcolor: theme.colorway[0] + '50',
          meanline: { visible: true },
          hovertemplate: '%{x}: %{y:.2f}<extra></extra>',
        }];
      }
      return [{
        type: 'violin', y: yv, name: safeName(params.y_var),
        points: false, box: { visible: true }, line: { color: theme.colorway[2] },
        fillcolor: theme.colorway[0] + '50', meanline: { visible: true },
      }];
    },
    buildLayout(params) {
      return { title: params.title || '小提琴图', xaxis: { title: '' }, yaxis: { title: safeName(params.y_var) } };
    },
  },

  box_scatter: {
    id: 'box_scatter', name: '箱线图+散点', category: 'basic',
    icon: 'B+S', exampleDataset: 'boxplot_example',
    buildTraces(data, params, theme) {
      const xv = params.x_var ? (data[safeName(params.x_var)] || []) : Array((data[safeName(params.y_var)] || []).length).fill('');
      const yv = numeric(data[safeName(params.y_var)] || []);
      return [
        { type: 'box', x: xv, y: yv, name: '', fillcolor: theme.colorway[0] + '30', line: { color: theme.colorway[2] }, boxpoints: false, hoverinfo: 'y' },
        { type: 'scatter', mode: 'markers', x: xv, y: yv, name: '', marker: { color: theme.colorway[3], size: 3, opacity: 0.5 }, hoverinfo: 'skip' },
      ];
    },
    buildLayout(params) {
      return { title: params.title || '箱线图+散点叠加', xaxis: { title: '' }, yaxis: { title: safeName(params.y_var) } };
    },
  },

  violin_box_scatter: {
    id: 'violin_box_scatter', name: '小提琴+箱线+散点', category: 'basic',
    icon: 'VBS', exampleDataset: 'violin_example',
    buildTraces(data, params, theme) {
      const xv = params.x_var ? (data[safeName(params.x_var)] || []) : Array((data[safeName(params.y_var)] || []).length).fill('');
      const yv = numeric(data[safeName(params.y_var)] || []);
      return [
        { type: 'violin', x: xv, y: yv, name: '', points: false, box: { visible: true, width: 0.15 }, line: { color: theme.colorway[1] }, fillcolor: theme.colorway[0] + '40', meanline: { visible: true }, hoverinfo: 'y' },
        { type: 'scatter', mode: 'markers', x: xv, y: yv, name: '', marker: { color: theme.colorway[4], size: 2.5, opacity: 0.55 }, hoverinfo: 'skip' },
      ];
    },
    buildLayout(params) {
      return { title: params.title || '小提琴+箱线+散点', xaxis: { title: '' }, yaxis: { title: safeName(params.y_var) } };
    },
  },

  error_bar: {
    id: 'error_bar', name: '误差线图', category: 'basic',
    description: '展示各组均值及标准差范围。',
    icon: 'Err', exampleDataset: 'bar_example',
    buildTraces(data, params, theme) {
      const xv = data[safeName(params.x_var)] || [];
      const yv = numeric(data[safeName(params.y_var)] || []);
      const cats = unique(xv);
      const means = cats.map(c => {
        const vals = xv.map((x, i) => String(x) === String(c) ? yv[i] : null).filter(v => v !== null);
        return vals.reduce((a, b) => a + b, 0) / Math.max(vals.length, 1);
      });
      const sds = cats.map(c => {
        const vals = xv.map((x, i) => String(x) === String(c) ? yv[i] : null).filter(v => v !== null);
        const m = vals.reduce((a, b) => a + b, 0) / Math.max(vals.length, 1);
        return Math.sqrt(vals.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(vals.length - 1, 1));
      });
      return [{
        type: 'scatter', mode: 'markers',
        x: cats, y: means,
        text: means.map((m, i) => `${fmtNum(m)} ± ${fmtNum(sds[i])}`),
        textposition: 'top center',
        error_y: { type: 'data', array: sds, visible: true, thickness: 1.5, width: 6 },
        marker: { color: theme.colorway[0], size: 10 },
        hovertemplate: '%{x}: %{y:.2f} ± %{error_y.array:.2f}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return { title: params.title || '误差线图 (Mean ± SD)', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) } };
    },
  },

  // ═══ Advanced Charts ════════════════════════════════════
  dumbbell: {
    id: 'dumbbell', name: '哑铃图', category: 'advanced',
    description: '展示前后或两组间的指标变化对比。',
    icon: 'Dum', exampleDataset: 'dumbbell_example',
    buildTraces(data, params, theme) {
      const labels = data[safeName(params.x_var)] || data['parameter'] || [];
      const startVals = numeric(data[safeName(params.y_var)] || data['baseline_mean'] || []);
      const endVals = numeric(data[safeName(params.color_var)] || data['followup_mean'] || []);
      const traces = [
        { type: 'scatter', mode: 'markers', name: '起点', x: startVals, y: labels, marker: { color: theme.colorway[0], size: 14 }, hovertemplate: '起点: %{x:.2f}<extra></extra>' },
        { type: 'scatter', mode: 'markers', name: '终点', x: endVals, y: labels, marker: { color: theme.colorway[2], size: 14, symbol: 'circle' }, hovertemplate: '终点: %{x:.2f}<extra></extra>' },
      ];
      for (let i = 0; i < labels.length; i++) {
        traces.push({ type: 'scatter', mode: 'lines', showlegend: false, x: [startVals[i], endVals[i]], y: [labels[i], labels[i]], line: { color: '#bbb', width: 1.5, dash: 'dot' }, hoverinfo: 'skip' });
      }
      return traces;
    },
    buildLayout(params) {
      return { title: params.title || '哑铃图', xaxis: { title: 'Value' }, yaxis: { title: '' } };
    },
  },

  forest: {
    id: 'forest', name: '森林图', category: 'advanced',
    description: '展示多组/亚组的效应量及95%置信区间，Meta分析和亚组分析核心图形。',
    icon: 'Frst', exampleDataset: 'forest_example',
    buildTraces(data, params, theme) {
      const labels = data[safeName(params.x_var)] || data['subgroup'] || [];
      const or = numeric(data[safeName(params.y_var)] || data['or'] || []);
      const ciL = numeric(data['ci_lower'] || []);
      const ciU = numeric(data['ci_upper'] || []);
      if (or.length === 0) {
        // Generate simple demo with dummy data
        return fallbackForest();
      }
      return [{
        type: 'scatter', mode: 'markers',
        x: or, y: labels,
        error_x: { type: 'data', symmetric: false, array: ciU.map((u, i) => u - or[i]), arrayminus: or.map((o, i) => o - ciL[i]), color: '#aaa' },
        marker: { color: or.map(o => o < 1 ? theme.colorway[3] : theme.colorway[0]), size: 12 },
        hovertemplate: 'OR: %{x:.2f} (95%CI)<extra></extra>',
      }];
    },
    buildLayout(params) {
      return { title: params.title || '森林图', xaxis: { title: 'Odds Ratio (95% CI)', type: 'log' }, yaxis: { title: '' } };
    },
  },

  volcano: {
    id: 'volcano', name: '火山图', category: 'advanced',
    description: '展示差异表达的显著性 vs 效应量，差异分析核心图。',
    icon: 'Volc', exampleDataset: 'volcano_example',
    buildTraces(data, params, theme) {
      const fc = numeric(data[safeName(params.x_var)] || data['log2fc'] || []);
      const pv = numeric(data[safeName(params.y_var)] || data['pvalue'] || []).map(p => -Math.log10(Math.max(p, 1e-10)));
      const labels = data[safeName(params.color_var)] || data['gene'] || [];
      const colors = fc.map((f, i) => pv[i] > 1.3 ? (Math.abs(f) > 1 ? theme.colorway[0] : theme.colorway[5]) : theme.colorway[5]);
      return [{
        type: 'scatter', mode: 'markers',
        x: fc, y: pv, text: labels,
        marker: { color: colors, size: 7, opacity: 0.7 },
        hovertemplate: '%{text}<br>log2FC: %{x:.2f}, -log10(p): %{y:.2f}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return { title: params.title || '火山图', xaxis: { title: 'log2 Fold Change' }, yaxis: { title: '-log10(P value)' } };
    },
  },

  bubble: {
    id: 'bubble', name: '气泡图', category: 'advanced',
    description: '气泡大小表示第三维度数据，多变量可视化工具。',
    icon: 'Bub', exampleDataset: 'bubble_example',
    buildTraces(data, params, theme) {
      const x = numeric(data[safeName(params.x_var)] || data['prevalence'] || []);
      const y = numeric(data[safeName(params.y_var)] || data['risk_ratio'] || []);
      const size = numeric(data[safeName(params.size_var)] || data['sample_size'] || []);
      const labels = data[safeName(params.color_var)] || data['disease'] || [];
      const maxSize = Math.max(...size.filter(v => Number.isFinite(v)), 1);
      return [{
        type: 'scatter', mode: 'markers+text',
        x: x, y: y, text: labels, textposition: 'top center',
        customdata: size,
        marker: {
          size,
          sizemode: 'area',
          sizeref: 2 * maxSize / (46 ** 2),
          sizemin: 7,
          color: y,
          colorscale: cnsMapScale(theme),
          opacity: 0.72,
          line: { color: '#FFFFFF', width: 1.1 },
          colorbar: { title: { text: safeName(params.y_var || 'Y') }, thickness: 12, len: 0.56, outlinewidth: 0 },
        },
        hovertemplate: '%{text}<br>X: %{x}<br>Y: %{y}<br>Size: %{customdata}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return { title: params.title || '气泡图', xaxis: { title: safeName(params.x_var || 'X') }, yaxis: { title: safeName(params.y_var || 'Y') } };
    },
  },

  heatmap: {
    id: 'heatmap', name: '热图', category: 'advanced',
    description: '用颜色梯度展示矩阵数据。',
    icon: 'Heat', exampleDataset: 'heatmap_example',
    buildTraces(data, params, theme) {
      const xCol = data[safeName(params.x_var)] || data['timepoint'] || [];
      const yCol = data[safeName(params.y_var)] || data['indicator'] || [];
      const zCol = numeric(data[safeName(params.color_var)] || data['value'] || []);
      const xCats = unique(xCol);
      const yCats = unique(yCol);
      const z = yCats.map(yc => xCats.map(xc => {
        for (let i = 0; i < zCol.length; i++) {
          if (String(yCol[i]) === String(yc) && String(xCol[i]) === String(xc)) return zCol[i];
        }
        return 0;
      }));
      const allVals = z.flat().filter(v => Number.isFinite(Number(v))).map(Number);
      const absMax = Math.max(...allVals.map(v => Math.abs(v)), 1);
      const zMin = -absMax;
      const zMax = absMax;
      // Publication-quality rich colorscale: deep blue → teal → green → yellow → orange → red
      const richScale = [
        [0, '#313695'], [0.10, '#4575B4'], [0.22, '#74ADD1'],
        [0.34, '#ABD9E9'], [0.46, '#E0F3F8'], [0.50, '#F7F7F7'],
        [0.56, '#FEE090'], [0.68, '#FDAE61'], [0.80, '#F46D43'],
        [0.92, '#D73027'], [1, '#A50026']
      ];
      return [{
        type: 'heatmap', z: z, x: xCats, y: yCats,
        colorscale: themeHeatmapScale(theme),
        zmin: zMin, zmax: zMax, zmid: 0,
        xgap: 0,
        ygap: 0,
        colorbar: {
          title: { text: params.color_var || 'Z-score', side: 'right', font: { size: 12 } },
          thickness: 18, len: 0.85, outlinewidth: 0,
          tickfont: { size: 10 },
        },
        hovertemplate: '<b>%{y}</b><br>%{x}: <b>%{z:.2f}</b><extra></extra>',
      }];
    },
    buildLayout(params) {
      return {
        title: params.title || '热图',
        xaxis: { title: '', tickangle: -45, side: 'bottom', tickfont: { size: 10 }, showgrid: false },
        yaxis: { title: '', autorange: 'reversed', tickfont: { size: 8 }, showgrid: false },
        margin: { l: 185, r: 86, t: 78, b: 86 },
      };
    },
  },

  correlation_heatmap: {
    id: 'correlation_heatmap', name: '相关性热图', category: 'advanced',
    description: '展示变量间的Pearson相关系数矩阵。',
    icon: 'Corr', exampleDataset: 'correlation_heatmap_example',
    buildTraces(data, params, theme) {
      let vars = params.value_vars || [];
      if (vars.length === 0) {
        vars = Object.keys(data).filter(k => {
          const vals = numeric(data[k] || []);
          return vals.length > 3 && vals.some(v => v !== 0);
        }).slice(0, 60);
      }
      if (vars.length < 2) vars = Object.keys(data).slice(0, 6);
      const n = vars.length;
      const mat = Array(n).fill(0).map(() => Array(n).fill(0));
      for (let i = 0; i < n; i++) {
        const xi = numericSeries(data[vars[i]] || []);
        for (let j = 0; j < n; j++) {
          const xj = numericSeries(data[vars[j]] || []);
          mat[i][j] = pearsonCorr(xi, xj);
        }
      }
      const showText = n <= 22;
      // Rich diverging colorscale for correlation: deep blue → light blue → white → light red → deep red
      const divergingScale = [
        [0, '#053061'], [0.08, '#2166AC'], [0.16, '#4393C3'], [0.24, '#92C5DE'],
        [0.32, '#D1E5F0'], [0.40, '#F7F7F7'], [0.48, '#FDE0EF'],
        [0.56, '#F1B6DA'], [0.68, '#DE77AE'], [0.80, '#C51B7D'],
        [0.90, '#8E0152'], [1, '#4D004B']
      ];
      return [{
        type: 'heatmap', z: mat, x: vars, y: vars, zmin: -1, zmax: 1,
        colorscale: themeCorrelationScale(theme),
        text: mat.map(row => row.map(v => v.toFixed(2))),
        texttemplate: showText ? '%{text}' : '',
        textfont: { size: 9, color: '#111111' },
        hovertemplate: '<b>%{y}</b> × <b>%{x}</b><br>r = %{z:.3f}<extra></extra>',
        colorbar: {
          title: { text: 'r', side: 'right', font: { size: 13 } },
          thickness: 18, len: 0.85, outlinewidth: 0,
          tickvals: [-1, -0.5, 0, 0.5, 1],
          ticktext: ['-1.0', '-0.5', '0', '+0.5', '1.0'],
          tickfont: { size: 10 },
        },
      }];
    },
    buildLayout(params) {
      return {
        title: params.title || '相关性矩阵',
        xaxis: { title: '', tickangle: -55, tickfont: { size: 9 }, side: 'bottom' },
        yaxis: { title: '', tickfont: { size: 9 }, autorange: 'reversed' },
        margin: { l: 140, r: 80, t: 80, b: 140 },
      };
    },
  },

  missingness_heatmap: {
    id: 'missingness_heatmap', name: '缺失值热图', category: 'advanced',
    icon: 'Miss', exampleDataset: 'baseline_table_example',
    buildTraces(data, params, theme) {
      const allCols = Object.keys(data);
      const maxRows = Math.min(50, (data[allCols[0]] || []).length);
      if (maxRows === 0) return fallbackHeatmap();
      const orderedCols = allCols
        .map(c => ({
          name: c,
          rate: (data[c] || []).filter(isMissingCell).length / Math.max((data[c] || []).length, 1),
        }))
        .sort((a, b) => b.rate - a.rate)
        .map(d => d.name);
      const z = [];
      const text = [];
      for (let r = 0; r < maxRows; r++) {
        const row = [];
        const textRow = [];
        orderedCols.forEach(c => {
          const v = data[c] ? data[c][r] : '';
          const miss = isMissingCell(v);
          row.push(miss ? 1 : 0);
          textRow.push(miss ? '缺失' : '完整');
        });
        z.push(row);
        text.push(textRow);
      }
      return [{
        type: 'heatmap', z: z, x: orderedCols, y: Array(maxRows).fill(0).map((_, i) => 'R' + (i + 1)),
        text,
        colorscale: [[0, '#F7FAF8'], [0.49, '#F7FAF8'], [0.5, '#C65D66'], [1, '#C65D66']],
        zmin: 0,
        zmax: 1,
        showscale: true,
        colorbar: {
          title: { text: '状态' },
          tickvals: [0, 1],
          ticktext: ['完整', '缺失'],
          len: 0.62,
        },
        hovertemplate: '%{y} · %{x}: %{text}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return {
        title: params.title || '缺失值热图',
        xaxis: { title: '', tickangle: -38 },
        yaxis: { title: '样本行', autorange: 'reversed' },
      };
    },
  },

  pca: {
    id: 'pca', name: 'PCA散点图', category: 'advanced',
    description: '主成分分析降维可视化，展示样本分布和聚类趋势。',
    icon: 'PCA', exampleDataset: 'baseline_table_example',
    buildTraces(data, params, theme) {
      let vars = params.value_vars || [];
      if (vars.length === 0) {
        vars = Object.keys(data).filter(k => {
          const vals = numeric(data[k] || []);
          return vals.length > 0 && vals.some(v => !isNaN(v));
        }).slice(0, 5);
      }
      if (vars.length < 2) vars = Object.keys(data).slice(0, 2);
      const x = numeric(data[vars[0]] || []);
      const y = numeric(data[vars[1]] || []);
      const groups = params.color_var ? (data[safeName(params.color_var)] || []) : [];
      if (groups.length > 0 && unique(groups).length > 1 && unique(groups).length <= 10) {
        return groupBy(x, y, groups).map((grp, i) => ({
          type: 'scatter', mode: 'markers', name: grp.name,
          x: grp.x, y: grp.y,
          marker: { color: theme.colorway[i % theme.colorway.length], size: 8, opacity: 0.75 },
          hovertemplate: '(%{x:.2f}, %{y:.2f})<extra>' + grp.name + '</extra>',
        }));
      }
      return [{
        type: 'scatter', mode: 'markers',
        x: x, y: y,
        marker: { color: theme.colorway[0], size: 8, opacity: 0.7 },
        hovertemplate: 'PC1: %{x:.2f}, PC2: %{y:.2f}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return { title: params.title || 'PCA (主成分分析)', xaxis: { title: 'Component 1' }, yaxis: { title: 'Component 2' } };
    },
  },

  survival: {
    id: 'survival', name: 'Kaplan-Meier 生存曲线', category: 'advanced',
    description: '生存分析Kaplan-Meier曲线，展示不同组别的生存/事件发生时间差异。',
    icon: 'KM', exampleDataset: 'survival_example',
    buildTraces(data, params, theme) {
      const time = numeric(data[safeName(params.time_var)] || data['time'] || []);
      const event = numeric(data[safeName(params.event_var)] || data['event'] || []);
      const group = data[safeName(params.color_var)] || [];
      const groups = unique(group).length > 0 ? unique(group) : ['All'];
      const traces = [];
      groups.forEach((g, gi) => {
        const indices = group.length > 0
          ? group.map((v, i) => String(v) === String(g) ? i : -1).filter(i => i >= 0)
          : time.map((_, i) => i);
        const tVals = indices.map(i => time[i]).filter(v => !isNaN(v));
        const eVals = indices.map(i => event[i]).filter(v => !isNaN(v));
        const sorted = tVals.map((t, i) => ({ t, e: eVals[i] })).sort((a, b) => a.t - b.t);
        let atRisk = sorted.length;
        let surv = 1;
        const stepsX = [0], stepsY = [1];
        for (let i = 0; i < sorted.length; i++) {
          const { t, e } = sorted[i];
          if (e === 1) {
            surv = surv * (1 - 1 / atRisk);
          }
          atRisk--;
          stepsX.push(t);
          stepsY.push(Math.max(0, surv));
        }
        traces.push({
          type: 'scatter', mode: 'lines+markers', name: String(g),
          x: stepsX, y: stepsY,
          line: { color: theme.colorway[gi % theme.colorway.length], width: 2, shape: 'hv' },
          marker: { size: 3 },
          hovertemplate: 'Time: %{x}, Survival: %{y:.3f}<extra>' + String(g) + '</extra>',
        });
      });
      return traces.length > 0 ? traces : fallbackForest();
    },
    buildLayout(params) {
      return {
        title: params.title || 'Kaplan-Meier 生存曲线',
        xaxis: { title: safeName(params.time_var) || 'Time' },
        yaxis: { title: 'Survival Probability', range: [0, 1.05] },
        hovermode: 'closest',
      };
    },
  },

  roc: {
    id: 'roc', name: 'ROC 曲线', category: 'advanced',
    description: '受试者工作特征曲线，评估二分类模型/标志物的诊断性能，计算AUC。',
    icon: 'ROC', exampleDataset: 'roc_example',
    buildTraces(data, params, theme) {
      const outcome = numeric(data[safeName(params.outcome_var)] || data['outcome'] || []);
      const predictor = numeric(data[safeName(params.predictor_var)] || data['biomarker_a'] || []);
      const pairs = outcome.map((o, i) => ({ o, p: predictor[i] })).filter(d => !isNaN(d.o) && !isNaN(d.p));
      if (pairs.length < 5) return fallbackForest();
      pairs.sort((a, b) => b.p - a.p);
      const totalPos = pairs.filter(d => d.o === 1).length;
      const totalNeg = pairs.filter(d => d.o === 0).length;
      if (totalPos === 0 || totalNeg === 0) return fallbackForest();
      let tp = 0, fp = 0;
      const fprs = [0], tprs = [0];
      for (const d of pairs) {
        if (d.o === 1) tp++; else fp++;
        fprs.push(fp / totalNeg);
        tprs.push(tp / totalPos);
      }
      fprs.push(1); tprs.push(1);
      // AUC via trapezoidal rule
      let auc = 0;
      for (let i = 1; i < fprs.length; i++) {
        auc += (fprs[i] - fprs[i - 1]) * (tprs[i] + tprs[i - 1]) / 2;
      }
      return [
        {
          type: 'scatter', mode: 'lines', name: `ROC (AUC = ${auc.toFixed(3)})`,
          x: fprs, y: tprs,
          line: { color: theme.colorway[0], width: 2.5 },
          fill: 'tozeroy', fillcolor: theme.colorway[0] + '20',
          hovertemplate: 'FPR: %{x:.3f}, TPR: %{y:.3f}<extra></extra>',
        },
        {
          type: 'scatter', mode: 'lines', name: 'Random',
          x: [0, 1], y: [0, 1],
          line: { color: '#999', width: 1, dash: 'dash' },
          showlegend: true, hoverinfo: 'skip',
        },
      ];
    },
    buildLayout(params) {
      return {
        title: params.title || 'ROC 曲线',
        xaxis: { title: '1 - Specificity (FPR)', range: [-0.02, 1.02] },
        yaxis: { title: 'Sensitivity (TPR)', range: [-0.02, 1.02] },
        hovermode: 'closest',
        shapes: [{ type: 'rect', x0: 0, y0: 0, x1: 1, y1: 1, line: { color: '#ccc', width: 1 } }],
      };
    },
  },

  // ═══ Display Charts ═════════════════════════════════════
  raincloud: {
    id: 'raincloud', name: '云雨图', category: 'display',
    description: '结合半小提琴图、箱线图和散点的综合分布可视化。',
    icon: 'Rain', exampleDataset: 'raincloud_example',
    buildTraces(data, params, theme) {
      const groups = unique(data[safeName(params.x_var)] || []);
      const yAll = numeric(data[safeName(params.y_var)] || []);
      const xAll = data[safeName(params.x_var)] || [];
      if (groups.length === 0) {
        return [{ type: 'violin', y: yAll, points: 'all', box: { visible: true }, fillcolor: theme.colorway[0] + '40' }];
      }
      const traces = [];
      groups.forEach((g, i) => {
        const yg = xAll.map((x, j) => String(x) === String(g) ? yAll[j] : null).filter(v => v !== null);
        traces.push({
          type: 'violin', x: Array(yg.length).fill(String(g)), y: yg,
          side: 'positive', points: false, line: { color: theme.colorway[i] },
          fillcolor: theme.colorway[i] + '40', name: String(g),
          meanline: { visible: true }, hoverinfo: 'y',
        });
        // Jittered scatter
        traces.push({
          type: 'scatter', mode: 'markers', name: '', showlegend: false,
          x: Array(yg.length).fill(String(g)),
          y: yg,
          marker: { color: theme.colorway[i], size: 3, opacity: 0.5 }, hoverinfo: 'skip',
        });
      });
      return traces;
    },
    buildLayout(params) {
      return { title: params.title || '云雨图', xaxis: { title: '' }, yaxis: { title: safeName(params.y_var) } };
    },
  },

  beeswarm: {
    id: 'beeswarm', name: '蜂群图', category: 'display',
    description: '散点展示每个观测值，适合中小样本分布展示。',
    icon: 'Bee', exampleDataset: 'raincloud_example',
    buildTraces(data, params, theme) {
      const groups = unique(data[safeName(params.x_var)] || []);
      const yAll = numeric(data[safeName(params.y_var)] || []);
      const xAll = data[safeName(params.x_var)] || [];
      if (groups.length === 0) {
        return [{ type: 'scatter', mode: 'markers', y: yAll, x: yAll.map(() => (Math.random() - 0.5) * 0.5), marker: { color: theme.colorway[0], size: 5 } }];
      }
      return groups.map((g, i) => {
        const yg = xAll.map((x, j) => String(x) === String(g) ? yAll[j] : null).filter(v => v !== null);
        return {
          type: 'scatter', mode: 'markers', name: String(g),
          x: Array(yg.length).fill(String(g)),
          y: yg,
          marker: { color: theme.colorway[i % theme.colorway.length], size: 6, opacity: 0.8 },
          hovertemplate: '%{y:.2f}<extra>' + String(g) + '</extra>',
        };
      });
    },
    buildLayout(params) {
      return { title: params.title || '蜂群图', xaxis: { title: '' }, yaxis: { title: safeName(params.y_var) } };
    },
  },

  // ═══ Display Charts (continued) ═══════════════════════════
  beanplot: {
    id: 'beanplot', name: '豆荚图', category: 'display',
    description: '结合密度曲线和散点的豆荚状分布图，展示各组数据的完整分布形态。',
    icon: 'Bean', exampleDataset: 'beanplot_example',
    buildTraces(data, params, theme) {
      const groups = unique(data[safeName(params.x_var)] || []);
      const yAll = numeric(data[safeName(params.y_var)] || []);
      const xAll = data[safeName(params.x_var)] || [];
      const traces = [];
      if (groups.length === 0) {
        const yVals = yAll.filter(v => !isNaN(v));
        traces.push({
          type: 'violin', y: yVals, points: 'all', jitter: 0.4,
          fillcolor: theme.colorway[0] + '50', line: { color: theme.colorway[0], width: 2 },
          box: { visible: true, fillcolor: theme.colorway[0] + '30', line: { color: theme.colorway[0] } },
          meanline: { visible: true, color: theme.colorway[4] }, name: 'All',
          side: 'both', spanmode: 'soft',
        });
      } else {
        groups.forEach((g, i) => {
          const yg = xAll.map((x, j) => String(x) === String(g) ? yAll[j] : null).filter(v => v !== null && !isNaN(v));
          if (yg.length < 2) return;
          // Density via violin on one side
          traces.push({
            type: 'violin', x: Array(yg.length).fill(String(g)), y: yg,
            side: 'positive', points: false,
            fillcolor: theme.colorway[i % theme.colorway.length] + '60',
            line: { color: theme.colorway[i % theme.colorway.length], width: 2 },
            meanline: { visible: true, color: theme.colorway[4] },
            name: String(g), spanmode: 'soft',
          });
          // Scatter overlay keeps categorical alignment exact.
          traces.push({
            type: 'scatter', mode: 'markers', name: '', showlegend: false,
            x: Array(yg.length).fill(String(g)),
            y: yg,
            marker: { color: theme.colorway[i % theme.colorway.length], size: 3, opacity: 0.5 },
            hoverinfo: 'skip',
          });
        });
      }
      return traces.length > 0 ? traces : [{ type: 'scatter', y: [0], marker: {color: '#ccc'} }];
    },
    buildLayout(params) {
      return { title: params.title || '豆荚图', xaxis: { title: '' }, yaxis: { title: safeName(params.y_var) }, violingap: 0.1, violinmode: 'group' };
    },
  },

  venn: {
    id: 'venn', name: '韦恩图', category: 'display',
    description: '展示2-4个集合之间的交集关系，用圆形重叠区域表示共有元素。',
    icon: 'Venn', exampleDataset: 'venn_example',
    buildTraces(data, params, theme) {
      const selCols = params.value_vars || [];
      let actualCols = selCols.filter(c => c in data);
      if (actualCols.length < 2) {
        const binaryCols = Object.keys(data).filter(k => {
          const vals = data[k] || [];
          const uv = unique(vals);
          return uv.length === 2 || (uv.length <= 3 && uv.some(v => String(v) === '0' || String(v) === '1'));
        });
        actualCols = binaryCols.slice(0, 4);
      }
      if (actualCols.length < 2) return fallbackHeatmap();

      const nSets = Math.min(actualCols.length, 4);
      const nTotal = (data[actualCols[0]] || []).length;

      // Compute membership and counts
      const masks = [];
      for (let i = 0; i < nTotal; i++) {
        masks.push(actualCols.map(c => {
          const v = (data[c] || [])[i];
          return v === 1 || v === '1' || v === true || String(v).toLowerCase() === 'yes' || String(v).toLowerCase() === 'true';
        }));
      }
      const comboCounts = {};
      for (const m of masks) {
        const key = m.map(b => b ? '1' : '0').join('');
        comboCounts[key] = (comboCounts[key] || 0) + 1;
      }
      const setSizes = actualCols.map((_, i) => masks.filter(m => m[i]).length);
      const allZero = actualCols.map(() => '0').join('');
      const totalUnion = nTotal - (comboCounts[allZero] || 0);

      // Store computed data in params for buildLayout
      params._vennData = { actualCols, nSets, nTotal, setSizes, comboCounts, totalUnion };

      // Return invisible placeholder traces (real display is via shapes)
      return [{
        type: 'scatter', mode: 'text+markers',
        x: [0.5], y: [0.5],
        text: [''],
        marker: { opacity: 0 },
        hoverinfo: 'none', showlegend: false,
      }, {
        type: 'scatter', mode: 'markers',
        x: [0, 1], y: [0, 1],
        marker: { opacity: 0 },
        showlegend: false, hoverinfo: 'none',
      }];
    },
    buildLayout(params, theme) {
      const vd = params._vennData || {};
      const actualCols = vd.actualCols || (params.value_vars || []).slice(0, 2);
      const nSets = vd.nSets || Math.min(actualCols.length, 2);
      const setSizes = vd.setSizes || [];
      const comboCounts = vd.comboCounts || {};
      const totalUnion = vd.totalUnion || 0;
      const palette = theme.colorway || ['#2E6F9E', '#D95F59', '#2A9D8F', '#E9A93A'];
      const colors = [palette[1] || '#D95F59', palette[0] || '#2E6F9E', palette[2] || '#2A9D8F', palette[3] || '#E9A93A'];
      const family = theme.fontFamily || "'Arial', 'Noto Sans SC', sans-serif";
      const ink = theme.ink || '#111827';
      const shapes = [];
      const annotations = [];
      const alpha = (hex, a) => {
        const clean = String(hex || '#999999').replace('#', '');
        const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
        const n = parseInt(full, 16);
        if (Number.isNaN(n)) return hex;
        return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
      };
      const count = key => comboCounts[key] || 0;
      const setLabel = (i, fallback) => `${actualCols[i] || fallback}<br><span style="font-size:12px">n=${setSizes[i] || 0}</span>`;
      const labelAnn = (x, y, text, color) => ({
        x, y, text, showarrow: false, xref: 'paper', yref: 'paper',
        font: { family, size: 14, color },
        align: 'center',
      });
      const countAnn = (x, y, key, size = 16) => ({
        x, y, text: String(count(key)), showarrow: false, xref: 'paper', yref: 'paper',
        font: { family, size, color: ink },
        bgcolor: 'rgba(255,255,255,0.72)',
        bordercolor: 'rgba(17,24,39,0.10)',
        borderpad: 3,
        align: 'center',
      });

      if (nSets === 2) {
        shapes.push(
          { type: 'circle', x0: 0.20, y0: 0.28, x1: 0.60, y1: 0.78, fillcolor: alpha(colors[0], 0.22), line: { color: colors[0], width: 2.4 }, layer: 'below' },
          { type: 'circle', x0: 0.40, y0: 0.28, x1: 0.80, y1: 0.78, fillcolor: alpha(colors[1], 0.22), line: { color: colors[1], width: 2.4 }, layer: 'below' },
        );
        annotations.push(
          labelAnn(0.29, 0.82, setLabel(0, 'A'), colors[0]),
          labelAnn(0.71, 0.82, setLabel(1, 'B'), colors[1]),
          countAnn(0.34, 0.53, '10'),
          countAnn(0.50, 0.53, '11', 17),
          countAnn(0.66, 0.53, '01'),
        );
      } else if (nSets === 3) {
        shapes.push(
          { type: 'circle', x0: 0.22, y0: 0.38, x1: 0.59, y1: 0.79, fillcolor: alpha(colors[0], 0.22), line: { color: colors[0], width: 2.3 }, layer: 'below' },
          { type: 'circle', x0: 0.41, y0: 0.38, x1: 0.78, y1: 0.79, fillcolor: alpha(colors[1], 0.22), line: { color: colors[1], width: 2.3 }, layer: 'below' },
          { type: 'circle', x0: 0.315, y0: 0.18, x1: 0.685, y1: 0.59, fillcolor: alpha(colors[2], 0.22), line: { color: colors[2], width: 2.3 }, layer: 'below' },
        );
        annotations.push(
          labelAnn(0.27, 0.82, setLabel(0, 'A'), colors[0]),
          labelAnn(0.73, 0.82, setLabel(1, 'B'), colors[1]),
          labelAnn(0.50, 0.13, setLabel(2, 'C'), colors[2]),
          countAnn(0.34, 0.59, '100'),
          countAnn(0.66, 0.59, '010'),
          countAnn(0.50, 0.30, '001'),
          countAnn(0.50, 0.62, '110'),
          countAnn(0.405, 0.46, '101'),
          countAnn(0.595, 0.46, '011'),
          countAnn(0.50, 0.49, '111', 18),
        );
      } else if (nSets >= 4) {
        shapes.push(
          { type: 'circle', x0: 0.18, y0: 0.42, x1: 0.53, y1: 0.77, fillcolor: alpha(colors[0], 0.18), line: { color: colors[0], width: 2.0 }, layer: 'below' },
          { type: 'circle', x0: 0.47, y0: 0.42, x1: 0.82, y1: 0.77, fillcolor: alpha(colors[1], 0.18), line: { color: colors[1], width: 2.0 }, layer: 'below' },
          { type: 'circle', x0: 0.18, y0: 0.19, x1: 0.53, y1: 0.54, fillcolor: alpha(colors[2], 0.18), line: { color: colors[2], width: 2.0 }, layer: 'below' },
          { type: 'circle', x0: 0.47, y0: 0.19, x1: 0.82, y1: 0.54, fillcolor: alpha(colors[3], 0.18), line: { color: colors[3], width: 2.0 }, layer: 'below' },
        );
        annotations.push(
          labelAnn(0.22, 0.80, setLabel(0, 'A'), colors[0]),
          labelAnn(0.78, 0.80, setLabel(1, 'B'), colors[1]),
          labelAnn(0.22, 0.16, setLabel(2, 'C'), colors[2]),
          labelAnn(0.78, 0.16, setLabel(3, 'D'), colors[3]),
          countAnn(0.34, 0.62, '1000', 13),
          countAnn(0.66, 0.62, '0100', 13),
          countAnn(0.34, 0.35, '0010', 13),
          countAnn(0.66, 0.35, '0001', 13),
          countAnn(0.50, 0.49, '1111', 16),
        );
      }

      annotations.push({
        x: 0.98, y: 1.02,
        text: `Union=${totalUnion} | Sets=${nSets}`,
        showarrow: false,
        xref: 'paper', yref: 'paper',
        xanchor: 'right', yanchor: 'top',
        font: { family, size: 12, color: '#64748B' },
      });

      return {
        title: params.title || 'Venn diagram',
        xaxis: { visible: false, range: [0, 1], fixedrange: true, showgrid: false, zeroline: false },
        yaxis: { visible: false, range: [0, 1], fixedrange: true, showgrid: false, zeroline: false },
        shapes,
        annotations,
        showlegend: false,
        margin: { l: 20, r: 20, t: 80, b: 25 },
        paper_bgcolor: '#ffffff',
        plot_bgcolor: '#ffffff',
      };
    },
  },

  upset: {
    id: 'upset', name: 'UpSet 交集图', category: 'display',
    description: 'UpSet图展示多集合交集规模，比韦恩图更适合展示4个以上集合的复杂交集关系。',
    icon: 'UpSt', exampleDataset: 'upset_example',
    buildTraces(data, params, theme) {
      const selCols = params.value_vars || [];
      let actualCols = selCols.filter(c => c in data);
      if (actualCols.length < 2) {
        const binaryCols = Object.keys(data).filter(k => {
          const vals = data[k] || [];
          const uv = unique(vals);
          return uv.length === 2 || (uv.length <= 3 && uv.some(v => String(v) === '0' || String(v) === '1'));
        });
        actualCols = binaryCols.slice(0, 6);
      }
      if (actualCols.length < 2) return fallbackHeatmap();

      const nTotal = (data[actualCols[0]] || []).length;
      const masks = [];
      for (let i = 0; i < nTotal; i++) {
        masks.push(actualCols.map(c => {
          const v = (data[c] || [])[i];
          return v === 1 || v === '1' || v === true || String(v).toLowerCase() === 'yes' || String(v).toLowerCase() === 'true';
        }));
      }
      const comboMap = {};
      for (const m of masks) {
        const key = m.map(b => b ? '1' : '0').join('');
        comboMap[key] = (comboMap[key] || 0) + 1;
      }
      const sorted = Object.entries(comboMap)
        .filter(([k]) => k.includes('1'))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12);

      const intersectLabels = sorted.map(([k], i) => `C${i + 1}`);
      const intersectSizes = sorted.map(([, v]) => v);
      const intersectMasks = sorted.map(([k]) => k.split('').map(b => b === '1'));
      const setSizes = actualCols.map((_, i) => masks.filter(m => m[i]).length);

      const traces = [];
      const palette = theme.colorway || ['#2E6F9E', '#D95F59', '#2A9D8F'];

      traces.push({
        type: 'bar', x: intersectLabels, y: intersectSizes,
        marker: { color: palette[0], opacity: 0.9, line: { color: '#ffffff', width: 1 } },
        text: intersectSizes,
        textposition: 'outside',
        cliponaxis: false,
        hovertemplate: 'Intersection size: %{y}<extra></extra>',
        name: 'Intersection size', showlegend: false,
        xaxis: 'x', yaxis: 'y',
      });

      const bgX = [];
      const bgY = [];
      const activeX = [];
      const activeY = [];
      intersectMasks.forEach((mask, ii) => {
        const on = [];
        for (let ci = 0; ci < actualCols.length; ci++) {
          bgX.push(intersectLabels[ii]);
          bgY.push(ci + 1);
          if (mask[ci]) {
            activeX.push(intersectLabels[ii]);
            activeY.push(ci + 1);
            on.push(ci + 1);
          }
        }
        if (on.length > 1) {
          traces.push({
            type: 'scatter', mode: 'lines',
            x: [intersectLabels[ii], intersectLabels[ii]],
            y: [Math.min(...on), Math.max(...on)],
            line: { color: '#111827', width: 2.2 },
            showlegend: false, hoverinfo: 'skip',
            xaxis: 'x', yaxis: 'y2',
          });
        }
      });
      traces.push({
        type: 'scatter', mode: 'markers',
        x: bgX, y: bgY,
        marker: { color: 'rgba(148,163,184,0.25)', size: 9, line: { color: '#ffffff', width: 0.6 } },
        showlegend: false, hoverinfo: 'skip',
        xaxis: 'x', yaxis: 'y2',
      });
      traces.push({
        type: 'scatter', mode: 'markers',
        x: activeX, y: activeY,
        marker: { color: '#111827', size: 11.5, line: { color: '#ffffff', width: 0.8 } },
        showlegend: false, hoverinfo: 'skip',
        xaxis: 'x', yaxis: 'y2',
      });

      traces.push({
        type: 'bar', x: setSizes, y: actualCols.map(c => String(c)),
        orientation: 'h',
        marker: { color: actualCols.map((_, i) => palette[i % palette.length]), opacity: 0.86, line: { color: '#ffffff', width: 1 } },
        text: setSizes,
        textposition: 'outside',
        cliponaxis: false,
        name: 'Set size', showlegend: false,
        xaxis: 'x3', yaxis: 'y3',
        hovertemplate: '%{y}: %{x}<extra></extra>',
      });

      params._upsetData = { intersectLabels, actualCols, setSizes };
      return traces;
    },
    buildLayout(params, theme) {
      const ud = params._upsetData || {};
      const nSets = (ud.actualCols || []).length;
      const nIntersections = (ud.intersectLabels || []).length;

      return {
        title: params.title || 'UpSet plot',
        grid: {
          rows: 3, columns: 2,
          pattern: 'independent',
          roworder: 'top to bottom',
        },
        xaxis: { domain: [0, 0.84], anchor: 'y', tickangle: 0, showgrid: false },
        yaxis: { domain: [0.58, 1], anchor: 'x', title: 'Intersection size', rangemode: 'tozero' },
        xaxis2: { domain: [0, 0.84], anchor: 'y2', showticklabels: false, showgrid: false },
        yaxis2: {
          domain: [0.18, 0.50], anchor: 'x2', range: [0.5, nSets + 0.5],
          tickvals: Array.from({length: nSets}, (_, i) => i + 1),
          ticktext: ud.actualCols || [], showgrid: false,
        },
        xaxis3: { domain: [0.88, 1], anchor: 'y3', showgrid: false, title: 'Set size' },
        yaxis3: { domain: [0.18, 0.50], anchor: 'x3', showticklabels: false, autorange: 'reversed' },
        bargap: 0.28,
        showlegend: false,
        margin: { l: 85, r: 70, t: 80, b: 70 },
      };
    },
  },

  dca: {
    id: 'dca', name: '决策曲线分析 (DCA)', category: 'advanced',
    description: '临床决策曲线，评估不同预测模型在不同阈值概率下的净获益，用于比较模型临床效用。',
    icon: 'DCA', exampleDataset: 'dca_example',
    buildTraces(data, params, theme) {
      const outcome = numeric(data[safeName(params.outcome_var)] || data['outcome'] || []);
      const selCols = params.value_vars || [];
      const actualCols = selCols.filter(c => c in data && c !== safeName(params.outcome_var));
      if (actualCols.length === 0) {
        // Auto-detect continuous predictor columns
        actualCols.push(...Object.keys(data).filter(k => {
          const vals = data[k] || [];
          return k !== 'patient_id' && k !== safeName(params.outcome_var) &&
            vals.some(v => v !== '' && v !== null && v !== undefined && !isNaN(Number(v)) && Number(v) < 100);
        }).slice(0, 4));
      }
      if (actualCols.length === 0 || outcome.length === 0) return fallbackForest();

      const thresholds = [];
      for (let i = 0; i <= 100; i++) thresholds.push(i / 100);
      const traces = [];
      const totalN = outcome.length;

      // "Treat all" strategy
      const treatAllNB = thresholds.map(pt => {
        const tp = outcome.filter(o => o === 1).length;
        const fp = outcome.filter(o => o === 0).length;
        return (tp - fp * (pt / (1 - pt || 0.01))) / totalN;
      });
      traces.push({
        type: 'scatter', mode: 'lines', name: 'Treat All',
        x: thresholds, y: treatAllNB,
        line: { color: '#aaa', width: 2, dash: 'dash' },
        hovertemplate: 'Treat All: %{y:.4f}<extra></extra>',
      });

      // "Treat none" (zero line)
      traces.push({
        type: 'scatter', mode: 'lines', name: 'Treat None',
        x: thresholds, y: thresholds.map(() => 0),
        line: { color: '#555', width: 1.5 },
        hovertemplate: 'Treat None: 0<extra></extra>',
      });

      // Each predictor
      actualCols.forEach((col, ci) => {
        const pred = numeric(data[col] || []);
        if (pred.length === 0) return;
        // Normalize predictions to [0, 1] for thresholding
        const pMin = Math.min(...pred), pMax = Math.max(...pred);
        const range = pMax - pMin || 1;
        const predNorm = pred.map(v => (v - pMin) / range);

        const nbCurve = thresholds.map(pt => {
          let tp = 0, fp = 0;
          for (let i = 0; i < totalN; i++) {
            if (predNorm[i] >= pt) {
              if (outcome[i] === 1) tp++;
              else fp++;
            }
          }
          return (tp - fp * (pt / (1 - pt || 0.01))) / totalN;
        });

        traces.push({
          type: 'scatter', mode: 'lines', name: String(col),
          x: thresholds, y: nbCurve,
          line: { color: theme.colorway[ci % theme.colorway.length], width: 2.2 },
          hovertemplate: col + ': %{y:.4f}<extra></extra>',
        });
      });

      return traces;
    },
    buildLayout(params) {
      return {
        title: params.title || '决策曲线分析 (DCA)',
        xaxis: { title: 'Threshold Probability', range: [0, 0.5] },
        yaxis: { title: 'Net Benefit' },
        hovermode: 'closest',
      };
    },
  },

  // ═══ Spatial Charts ═════════════════════════════════════
  china_map: {
    id: 'china_map', name: '中国疾病分布地图', category: 'spatial',
    description: '中国省级疾病指标地理分布，基于省级行政区划的精准填充地图。',
    icon: 'CN', exampleDataset: 'china_map_example',
    buildTraces(data, params, theme) {
      const provRaw = data[safeName(params.province_var)] || data['province'] || [];
      const valsRaw = data[safeName(params.y_var)] || data['incidence'] || [];
      const centroids = loadChinaCentroids();
      const geoKeys = getChinaFeatureKeys(centroids);
      const locMap = {};
      provRaw.forEach((p, i) => {
        const key = normalizeProvinceKey(p);
        const v = Number(valsRaw[i]);
        if (key && Number.isFinite(v)) locMap[key] = v;
      });

      const locations = geoKeys.length ? geoKeys : Object.keys(locMap);
      const zVals = locations.map(k => Object.prototype.hasOwnProperty.call(locMap, k) ? locMap[k] : null);
      const finiteVals = zVals.filter(v => Number.isFinite(Number(v))).map(Number);
      const vMin = finiteVals.length ? Math.min(...finiteVals) : 0;
      const vMax = finiteVals.length ? Math.max(...finiteVals) : 1;
      const zText = locations.map((k, i) => {
        const cn = CHINA_PROVINCE_LABELS[k] || k;
        return Number.isFinite(Number(zVals[i]))
          ? cn + ': ' + fmtNum(zVals[i])
          : cn + ': 无数据';
      });

      const traces = [{
        type: 'choropleth',
        geojson: STATE.chinaGeoJSON || _geoJSONCache,
        locations: locations,
        featureidkey: 'properties.id',
        z: zVals,
        text: zText,
        colorscale: cnsMapScale(theme),
        zmin: vMin,
        zmax: vMax,
        showscale: true,
        marker: {
          line: { color: '#FFFFFF', width: 0.75 },
          opacity: 0.96,
        },
        colorbar: {
          title: { text: safeName(params.y_var) || '指标值', font: { size: 12, color: theme.ink || '#1a1a1a' } },
          thickness: 16,
          len: 0.62,
          x: 1.0,
          y: 0.5,
          xanchor: 'left',
          yanchor: 'middle',
          outlinewidth: 0,
          tickfont: { size: 11, color: theme.ink || '#333' },
          ticks: 'outside',
          ticklen: 4,
          tickwidth: 1,
        },
        hovertemplate: '<b>%{text}</b><extra></extra>',
      }];

      const labelLats = [], labelLons = [], labelTexts = [], labelCN = [];
      locations.forEach((k) => {
        const c = centroids[k];
        if (c) {
          labelLats.push(c[0]);
          labelLons.push(c[1]);
          const cn = CHINA_PROVINCE_LABELS[k] || k;
          labelCN.push(cn);
          labelTexts.push(cn);
        }
      });
      traces.push({
        type: 'scattergeo',
        lat: labelLats, lon: labelLons,
        text: labelTexts,
        mode: 'text',
        showlegend: false,
        hoverinfo: 'skip',
        textfont: {
          family: theme.fontFamily,
          size: 9.5,
          color: '#263238',
        },
        textposition: 'middle center',
      });

      return traces;
    },
    buildLayout(params) {
      return {
        title: params.title || '中国疾病分布地图',
        geo: {
          showframe: false,
          showcoastlines: false,
          showcountries: false,
          showland: false,
          showocean: false,
          bgcolor: 'rgba(0,0,0,0)',
          projection: { type: 'mercator' },
          fitbounds: 'locations',
          center: { lat: 35.2, lon: 104.2 },
          lonaxis: { range: [72, 136.5] },
          lataxis: { range: [16, 55.5] },
          domain: { x: [0.015, 0.94], y: [0.02, 0.965] },
          resolution: 50,
        },
        margin: { l: 8, r: 74, t: 68, b: 8 },
      };
    },
  },

  world_map: {
    id: 'world_map', name: '世界疾病分布地图', category: 'spatial',
    description: '全球各国疾病指标地理分布，填充地图展示跨国差异。',
    icon: 'GL', exampleDataset: 'world_map_example',
    buildTraces(data, params, theme) {
      const country = data[safeName(params.country_var)] || data['country'] || [];
      const vals = (data[safeName(params.y_var)] || data['incidence'] || []).map(v => {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      });
      const worldKeys = getWorldFeatureISO3();
      const locMap = {};
      const nameMap = {};
      country.forEach((c, i) => {
        const iso = normalizeCountryISO(c);
        if (!iso) return;
        const v = Number(vals[i]);
        nameMap[iso] = String(c);
        if (Number.isFinite(v)) locMap[iso] = v;
      });
      const locations = worldKeys.length ? worldKeys : Object.keys(locMap);
      const zVals = locations.map(k => Object.prototype.hasOwnProperty.call(locMap, k) ? locMap[k] : null);
      const text = locations.map((iso) => {
        const label = nameMap[iso] || iso;
        const v = locMap[iso];
        return Number.isFinite(Number(v)) ? label + ': ' + fmtNum(v) : label + ': N/A';
      });
      const labelLats = [], labelLons = [], labelTexts = [];
      const countryCentroids = {
        CHN: [35.0, 104.0], USA: [39.8, -98.6], IND: [21.0, 79.0],
        JPN: [36.2, 138.2], DEU: [51.2, 10.4], BRA: [-10.8, -53.1],
        RUS: [61.5, 96.0], GBR: [55.0, -3.4], FRA: [46.2, 2.2],
        ITA: [42.8, 12.5], CAN: [56.1, -106.3], AUS: [-25.3, 133.8],
        KOR: [36.4, 127.8], IDN: [-2.5, 118.0], NGA: [9.1, 8.7],
        ZAF: [-30.6, 22.9], MEX: [23.6, -102.5], TUR: [39.0, 35.2],
        THA: [15.9, 101.0], VNM: [14.1, 108.3], EGY: [26.8, 30.8],
        PAK: [30.4, 69.4], BGD: [23.7, 90.4], PHL: [12.9, 122.9],
      };
      const labelled = Object.keys(locMap)
        .map(iso => ({ iso, v: Number(locMap[iso]) }))
        .filter(d => countryCentroids[d.iso] && Number.isFinite(d.v))
        .sort((a, b) => b.v - a.v)
        .slice(0, 14);
      labelled.forEach((d) => {
        const coord = countryCentroids[d.iso];
        if (coord && Number.isFinite(d.v)) {
          labelLats.push(coord[0]);
          labelLons.push(coord[1]);
          labelTexts.push(`${nameMap[d.iso] || d.iso}<br>${fmtNum(d.v)}`);
        }
      });
      const finiteVals = zVals.filter(v => Number.isFinite(Number(v))).map(Number);
      const vMin = finiteVals.length ? Math.min(...finiteVals) : 0;
      const vMax = finiteVals.length ? Math.max(...finiteVals) : 1;

      return [{
        type: 'choropleth',
        geojson: STATE.worldGeoJSON || _worldGeoJSONCache,
        locations,
        featureidkey: 'properties.ISO_A3',
        z: zVals,
        text: text,
        colorscale: cnsMapScale(theme),
        zmin: vMin,
        zmax: vMax,
        marker: {
          line: { color: '#FFFFFF', width: 0.65 },
          opacity: 0.96,
        },
        colorbar: {
          title: { text: safeName(params.y_var) || '指标值', font: { size: 12, color: theme.ink || '#1a1a1a' } },
          thickness: 16,
          len: 0.62,
          x: 1.0,
          y: 0.5,
          xanchor: 'left',
          yanchor: 'middle',
          outlinewidth: 0,
          tickfont: { size: 11, color: theme.ink || '#333' },
          ticks: 'outside',
          ticklen: 4,
          tickwidth: 1,
        },
        hovertemplate: '<b>%{text}</b><extra></extra>',
      }, {
        type: 'scattergeo',
        lat: labelLats,
        lon: labelLons,
        text: labelTexts,
        mode: 'text',
        showlegend: false,
        hoverinfo: 'skip',
        textfont: {
          family: theme.fontFamily,
          size: 9.5,
          color: '#263238',
        },
        textposition: 'top center',
      }];
    },
    buildLayout(params) {
      return {
        title: params.title || '世界疾病分布地图',
        geo: {
          showframe: false,
          showland: true,
          showcountries: true,
          showcoastlines: true,
          showocean: true,
          oceancolor: '#F7FAFC',
          landcolor: '#F1F4F2',
          countrycolor: '#D5DEE3',
          coastlinecolor: '#98A6AD',
          coastlinewidth: 0.55,
          projection: { type: 'natural earth', scale: 1.06 },
          bgcolor: 'rgba(0,0,0,0)',
          domain: { x: [0.015, 0.94], y: [0.02, 0.965] },
          resolution: 50,
        },
        margin: { l: 8, r: 76, t: 72, b: 8 },
      };
    },
  },
};

/* ── Fallback generators (when data is insufficient) ────── */
function fallbackForest() {
  const labels = ['Overall', 'Age<60', 'Age>=60', 'Male', 'Female', 'HTN(-)', 'HTN(+)'];
  const or = [0.72, 0.68, 0.78, 0.65, 0.80, 0.66, 0.79];
  const ciL = [0.58, 0.50, 0.60, 0.48, 0.62, 0.49, 0.60];
  const ciU = [0.89, 0.92, 1.02, 0.88, 1.03, 0.89, 1.04];
  return [{
    type: 'scatter', mode: 'markers',
    x: or, y: labels,
    error_x: { type: 'data', symmetric: false, array: ciU.map((u, i) => u - or[i]), arrayminus: or.map((o, i) => o - ciL[i]), color: '#aaa' },
    marker: { color: or.map(o => o < 1 ? '#5F8D4E' : '#B34D3E'), size: 12 },
    hovertemplate: 'OR: %{x:.2f}<extra></extra>',
  }];
}

function fallbackHeatmap() {
  const z = [[1,2,3],[4,5,6],[7,8,9]];
  return [{ type: 'heatmap', z: z, x: ['A','B','C'], y: ['X','Y','Z'], colorscale: [[0, '#F7FAF8'], [0.5, '#5CAEA0'], [1, '#0E7C7B']] }];
}

/* ── Helpers ────────────────────────────────────────────── */
function pearsonCorr(x, y) {
  const len = Math.min(x.length, y.length);
  if (len < 3) return 0;
  let sx = 0, sy = 0, sxy = 0, sx2 = 0, sy2 = 0, n = 0;
  for (let i = 0; i < len; i++) {
    if (isNaN(x[i]) || isNaN(y[i])) continue;
    sx += x[i]; sy += y[i]; sxy += x[i] * y[i]; sx2 += x[i] ** 2; sy2 += y[i] ** 2; n++;
  }
  if (n < 3) return 0;
  const num = n * sxy - sx * sy;
  const den = Math.sqrt((n * sx2 - sx ** 2) * (n * sy2 - sy ** 2));
  return den === 0 ? 0 : num / den;
}

function getChartConfig(chartType) {
  return CHART_CATALOG[chartType] || null;
}
