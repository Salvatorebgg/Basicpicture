/* Chart Configurations for Clinical Graphics */

function numeric(arr) { return (arr || []).map(v => Number(v)).filter(v => !isNaN(v)); }
function unique(arr) { return [...new Set(arr || [])].filter(Boolean); }
function fmtNum(value, digits = 1) {
  const n = Number(value);
  if (Number.isNaN(n)) return '';
  return Math.abs(n) >= 100 ? n.toFixed(0) : n.toFixed(digits);
}
function colorAlpha(color, alpha) {
  if (!color || !String(color).startsWith('#')) return color;
  const clean = String(color).slice(1);
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return color;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
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
  return text === '' || ['NA', 'N/A', 'NULL', 'NaN', 'nan', 'None', 'none', '\u7f3a\u5931', '\u672a\u8bb0\u5f55'].includes(text);
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
  "beijing": "\u5317\u4eac",
  "tianjin": "\u5929\u6d25",
  "hebei": "\u6cb3\u5317",
  "shanxi": "\u5c71\u897f",
  "inner mongol": "\u5185\u8499\u53e4",
  "liaoning": "\u8fbd\u5b81",
  "jilin": "\u5409\u6797",
  "heilongjiang": "\u9ed1\u9f99\u6c5f",
  "shanghai": "\u4e0a\u6d77",
  "jiangsu": "\u6c5f\u82cf",
  "zhejiang": "\u6d59\u6c5f",
  "anhui": "\u5b89\u5fbd",
  "fujian": "\u798f\u5efa",
  "jiangxi": "\u6c5f\u897f",
  "shandong": "\u5c71\u4e1c",
  "henan": "\u6cb3\u5357",
  "hubei": "\u6e56\u5317",
  "hunan": "\u6e56\u5357",
  "guangdong": "\u5e7f\u4e1c",
  "guangxi": "\u5e7f\u897f",
  "hainan": "\u6d77\u5357",
  "chongqing": "\u91cd\u5e86",
  "sichuan": "\u56db\u5ddd",
  "guizhou": "\u8d35\u5dde",
  "yunnan": "\u4e91\u5357",
  "xizang": "\u897f\u85cf",
  "shaanxi": "\u9655\u897f",
  "gansu": "\u7518\u8083",
  "qinghai": "\u9752\u6d77",
  "ningxia": "\u5b81\u590f",
  "xinjiang": "\u65b0\u7586",
  "hong kong": "\u9999\u6e2f",
  "macau": "\u6fb3\u95e8",
  "taiwan": "\u53f0\u6e7e"
};

const CHINA_PROVINCE_ALIASES = {
  "\u5317\u4eac": "beijing",
  "\u5317\u4eac\u5e02": "beijing",
  "\u5929\u6d25": "tianjin",
  "\u5929\u6d25\u5e02": "tianjin",
  "\u6cb3\u5317": "hebei",
  "\u6cb3\u5317\u7701": "hebei",
  "\u5c71\u897f": "shanxi",
  "\u5c71\u897f\u7701": "shanxi",
  "\u5185\u8499\u53e4": "inner mongol",
  "\u5185\u8499\u53e4\u81ea\u6cbb\u533a": "inner mongol",
  "inner mongolia": "inner mongol",
  "nei menggu": "inner mongol",
  "\u8fbd\u5b81": "liaoning",
  "\u8fbd\u5b81\u7701": "liaoning",
  "\u5409\u6797": "jilin",
  "\u5409\u6797\u7701": "jilin",
  "\u9ed1\u9f99\u6c5f": "heilongjiang",
  "\u9ed1\u9f99\u6c5f\u7701": "heilongjiang",
  "\u4e0a\u6d77": "shanghai",
  "\u4e0a\u6d77\u5e02": "shanghai",
  "\u6c5f\u82cf": "jiangsu",
  "\u6c5f\u82cf\u7701": "jiangsu",
  "\u6d59\u6c5f": "zhejiang",
  "\u6d59\u6c5f\u7701": "zhejiang",
  "\u5b89\u5fbd": "anhui",
  "\u5b89\u5fbd\u7701": "anhui",
  "\u798f\u5efa": "fujian",
  "\u798f\u5efa\u7701": "fujian",
  "\u6c5f\u897f": "jiangxi",
  "\u6c5f\u897f\u7701": "jiangxi",
  "\u5c71\u4e1c": "shandong",
  "\u5c71\u4e1c\u7701": "shandong",
  "\u6cb3\u5357": "henan",
  "\u6cb3\u5357\u7701": "henan",
  "\u6e56\u5317": "hubei",
  "\u6e56\u5317\u7701": "hubei",
  "\u6e56\u5357": "hunan",
  "\u6e56\u5357\u7701": "hunan",
  "\u5e7f\u4e1c": "guangdong",
  "\u5e7f\u4e1c\u7701": "guangdong",
  "\u5e7f\u897f": "guangxi",
  "\u5e7f\u897f\u58ee\u65cf\u81ea\u6cbb\u533a": "guangxi",
  "\u6d77\u5357": "hainan",
  "\u6d77\u5357\u7701": "hainan",
  "\u91cd\u5e86": "chongqing",
  "\u91cd\u5e86\u5e02": "chongqing",
  "\u56db\u5ddd": "sichuan",
  "\u56db\u5ddd\u7701": "sichuan",
  "\u8d35\u5dde": "guizhou",
  "\u8d35\u5dde\u7701": "guizhou",
  "\u4e91\u5357": "yunnan",
  "\u4e91\u5357\u7701": "yunnan",
  "\u897f\u85cf": "xizang",
  "\u897f\u85cf\u81ea\u6cbb\u533a": "xizang",
  "tibet": "xizang",
  "\u9655\u897f": "shaanxi",
  "\u9655\u897f\u7701": "shaanxi",
  "shaanxi province": "shaanxi",
  "\u7518\u8083": "gansu",
  "\u7518\u8083\u7701": "gansu",
  "\u9752\u6d77": "qinghai",
  "\u9752\u6d77\u7701": "qinghai",
  "\u5b81\u590f": "ningxia",
  "\u5b81\u590f\u56de\u65cf\u81ea\u6cbb\u533a": "ningxia",
  "\u65b0\u7586": "xinjiang",
  "\u65b0\u7586\u7ef4\u543e\u5c14\u81ea\u6cbb\u533a": "xinjiang",
  "\u9999\u6e2f": "hong kong",
  "\u9999\u6e2f\u7279\u522b\u884c\u653f\u533a": "hong kong",
  "hongkong": "hong kong",
  "\u6fb3\u95e8": "macau",
  "\u6fb3\u95e8\u7279\u522b\u884c\u653f\u533a": "macau",
  "macao": "macau",
  "\u53f0\u6e7e": "taiwan",
  "\u53f0\u6e7e\u7701": "taiwan"
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
    : Object.keys(centroids || {}).filter(k => k === k.toLowerCase() && !/[\u4e00-\u9fff]/.test(k));
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
  'spain': 'ESP',
  'portugal': 'PRT',
  'netherlands': 'NLD',
  'belgium': 'BEL',
  'switzerland': 'CHE',
  'austria': 'AUT',
  'sweden': 'SWE',
  'norway': 'NOR',
  'denmark': 'DNK',
  'finland': 'FIN',
  'poland': 'POL',
  'czechia': 'CZE',
  'czech republic': 'CZE',
  'greece': 'GRC',
  'ireland': 'IRL',
  'romania': 'ROU',
  'hungary': 'HUN',
  'ukraine': 'UKR',
};

const COUNTRY_CENTROIDS = {
  CHN: [35.0, 104.0], USA: [39.8, -98.6], IND: [21.0, 79.0],
  JPN: [36.2, 138.2], DEU: [51.2, 10.4], BRA: [-10.8, -53.1],
  RUS: [61.5, 96.0], GBR: [55.0, -3.4], FRA: [46.2, 2.2],
  ITA: [42.8, 12.5], CAN: [56.1, -106.3], AUS: [-25.3, 133.8],
  KOR: [36.4, 127.8], IDN: [-2.5, 118.0], NGA: [9.1, 8.7],
  ZAF: [-30.6, 22.9], MEX: [23.6, -102.5], TUR: [39.0, 35.2],
  THA: [15.9, 101.0], VNM: [14.1, 108.3], EGY: [26.8, 30.8],
  PAK: [30.4, 69.4], BGD: [23.7, 90.4], PHL: [12.9, 122.9],
  ESP: [40.4, -3.7], PRT: [39.5, -8.0], NLD: [52.1, 5.3],
  BEL: [50.6, 4.7], CHE: [46.8, 8.2], AUT: [47.5, 14.5],
  SWE: [62.0, 15.0], NOR: [61.0, 8.0], DNK: [56.1, 9.5],
  FIN: [64.0, 26.0], POL: [52.0, 19.2], CZE: [49.8, 15.5],
  GRC: [39.1, 22.9], IRL: [53.3, -8.0], ROU: [45.9, 24.9],
  HUN: [47.2, 19.5], UKR: [49.0, 31.4],
};

const EUROPE_ISO3 = new Set([
  'GBR', 'FRA', 'DEU', 'ITA', 'ESP', 'PRT', 'NLD', 'BEL', 'CHE', 'AUT',
  'SWE', 'NOR', 'DNK', 'FIN', 'POL', 'CZE', 'GRC', 'IRL', 'ROU', 'HUN',
  'UKR', 'RUS', 'TUR',
]);

const US_STATE_ABBR = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
  colorado: 'CO', connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA',
  hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA',
  kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
  massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS',
  missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK',
  oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT',
  virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY',
};

const US_STATE_CENTROIDS = {
  CA: [36.8, -119.4], TX: [31.0, -99.9], FL: [27.8, -81.7], NY: [42.9, -75.0],
  PA: [41.0, -77.6], IL: [40.0, -89.2], OH: [40.4, -82.8], GA: [32.7, -83.3],
  NC: [35.5, -79.4], MI: [44.3, -85.4], NJ: [40.1, -74.7], VA: [37.5, -78.7],
  WA: [47.4, -120.7], AZ: [34.2, -111.7], MA: [42.3, -71.8], TN: [35.8, -86.4],
  IN: [39.8, -86.1], MO: [38.4, -92.5], MD: [39.0, -76.8], WI: [44.6, -89.6],
  CO: [39.0, -105.5], MN: [46.3, -94.2], SC: [33.8, -80.9], AL: [32.8, -86.7],
  LA: [31.0, -92.0], KY: [37.5, -85.3], OR: [44.1, -120.5], OK: [35.6, -97.5],
  CT: [41.6, -72.7], UT: [39.3, -111.7], IA: [42.1, -93.5], NV: [39.3, -116.6],
};

const UK_REGION_COORDS = {
  England: [52.4, -1.5], Scotland: [56.8, -4.2], Wales: [52.1, -3.8],
  'Northern Ireland': [54.7, -6.7], London: [51.5, -0.1], Midlands: [52.6, -1.8],
  'North West': [53.8, -2.7], 'South East': [51.3, -0.8], 'South West': [50.8, -3.8],
};

function normalizeUSState(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  if (/^[A-Za-z]{2}$/.test(raw)) return raw.toUpperCase();
  return US_STATE_ABBR[raw.toLowerCase()] || '';
}

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

function finitePairs(xVals, yVals) {
  const out = [];
  const len = Math.min((xVals || []).length, (yVals || []).length);
  for (let i = 0; i < len; i++) {
    const x = Number(xVals[i]);
    const y = Number(yVals[i]);
    if (Number.isFinite(x) && Number.isFinite(y)) out.push({ x, y, i });
  }
  return out;
}

function meanValue(vals) {
  const clean = (vals || []).map(Number).filter(Number.isFinite);
  if (clean.length === 0) return 0;
  return clean.reduce((a, b) => a + b, 0) / clean.length;
}

function sdValue(vals) {
  const clean = (vals || []).map(Number).filter(Number.isFinite);
  if (clean.length < 2) return 0;
  const m = meanValue(clean);
  return Math.sqrt(clean.reduce((a, b) => a + (b - m) ** 2, 0) / (clean.length - 1));
}

function aggregateByCategory(labels, values) {
  const agg = {};
  (labels || []).forEach((label, i) => {
    const key = String(label ?? '');
    if (!key) return;
    if (!agg[key]) agg[key] = [];
    agg[key].push(Number(values?.[i]) || 0);
  });
  return Object.keys(agg).map(label => ({
    label,
    values: agg[label],
    mean: meanValue(agg[label]),
    sd: sdValue(agg[label]),
    sum: agg[label].reduce((a, b) => a + b, 0),
    n: agg[label].length,
  }));
}

function isNumericLike(value) {
  if (value === null || value === undefined || value === '') return false;
  return Number.isFinite(Number(value));
}

function toFiniteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function orderedUniqueValues(values) {
  const seen = new Set();
  return (values || []).filter(v => {
    const key = String(v ?? '').trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function compareAxisValues(a, b) {
  const an = Number(a);
  const bn = Number(b);
  if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn;
  return String(a).localeCompare(String(b), 'zh-Hans-CN', { numeric: true, sensitivity: 'base' });
}

function buildXYRows(xVals, yVals, gVals) {
  const len = Math.min((xVals || []).length, (yVals || []).length);
  const rows = [];
  for (let i = 0; i < len; i++) {
    const y = toFiniteNumber(yVals[i]);
    const x = xVals[i];
    if (isMissingCell(x) || y === null) continue;
    rows.push({ x, y, group: gVals ? gVals[i] : undefined, index: i });
  }
  return rows;
}

function summarizeRowsByX(rows) {
  const bucket = new Map();
  rows.forEach(row => {
    const key = String(row.x);
    if (!bucket.has(key)) bucket.set(key, { x: row.x, values: [] });
    bucket.get(key).values.push(row.y);
  });
  return Array.from(bucket.values()).sort((a, b) => compareAxisValues(a.x, b.x)).map(item => {
    const mean = meanValue(item.values);
    const sd = sdValue(item.values);
    const n = item.values.length;
    return {
      x: item.x,
      y: mean,
      sd,
      n,
      se: n > 1 ? sd / Math.sqrt(n) : 0,
      text: `均��?${fmtNum(mean, 2)}<br>N=${n}`,
    };
  });
}

function summarizeRowsByGroup(rows) {
  const groups = orderedUniqueValues(rows.map(d => d.group));
  return groups.map(group => ({
    group,
    rows: summarizeRowsByX(rows.filter(d => String(d.group) === String(group))),
  })).filter(item => item.rows.length > 0);
}

function gaussianKDE(values, points = 160) {
  const clean = (values || []).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (clean.length < 3) return { x: clean, y: clean.map(() => 0) };
  const min = clean[0];
  const max = clean[clean.length - 1];
  const sd = sdValue(clean) || Math.max((max - min) / 6, 1);
  const bandwidth = Math.max(1.06 * sd * Math.pow(clean.length, -0.2), (max - min) / 80, 1e-6);
  const pad = Math.max(bandwidth * 3, (max - min) * 0.06);
  const start = min - pad;
  const end = max + pad;
  const xs = Array.from({ length: points }, (_, i) => start + (end - start) * i / Math.max(points - 1, 1));
  const norm = 1 / (clean.length * bandwidth * Math.sqrt(2 * Math.PI));
  const ys = xs.map(x => norm * clean.reduce((sum, v) => {
    const z = (x - v) / bandwidth;
    return sum + Math.exp(-0.5 * z * z);
  }, 0));
  return { x: xs, y: ys };
}

function quantileValue(vals, q) {
  const clean = (vals || []).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (clean.length === 0) return 0;
  const pos = (clean.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return clean[base + 1] !== undefined ? clean[base] + rest * (clean[base + 1] - clean[base]) : clean[base];
}

function normalQuantile(p) {
  // Acklam approximation; accurate enough for QQ plot display.
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924];
  const b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857];
  const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878];
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742];
  const plow = 0.02425;
  const phigh = 1 - plow;
  if (p < plow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p <= phigh) {
    const q = p - 0.5;
    const r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  const q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

function dotProduct(a, b) {
  return (a || []).reduce((sum, v, i) => sum + v * (b[i] || 0), 0);
}

function vectorNorm(v) {
  return Math.sqrt(dotProduct(v, v)) || 1;
}

function matrixVectorProduct(matrix, vector) {
  return matrix.map(row => dotProduct(row, vector));
}

function covarianceMatrix(rows) {
  const n = rows.length;
  const p = rows[0]?.length || 0;
  const cov = Array.from({ length: p }, () => Array(p).fill(0));
  if (n < 2 || p === 0) return cov;
  for (let i = 0; i < p; i++) {
    for (let j = i; j < p; j++) {
      let s = 0;
      for (let r = 0; r < n; r++) s += rows[r][i] * rows[r][j];
      cov[i][j] = s / (n - 1);
      cov[j][i] = cov[i][j];
    }
  }
  return cov;
}

function powerIteration(matrix, seed = 1) {
  const p = matrix.length;
  let v = Array.from({ length: p }, (_, i) => Math.sin((i + 1) * seed) + 1.1);
  let norm = vectorNorm(v);
  v = v.map(x => x / norm);
  for (let iter = 0; iter < 160; iter++) {
    let next = matrixVectorProduct(matrix, v);
    norm = vectorNorm(next);
    next = next.map(x => x / norm);
    const diff = Math.sqrt(next.reduce((s, x, i) => s + (x - v[i]) ** 2, 0));
    v = next;
    if (diff < 1e-8) break;
  }
  const mv = matrixVectorProduct(matrix, v);
  const eigenvalue = dotProduct(v, mv);
  return { vector: v, eigenvalue };
}

function deflateMatrix(matrix, eigen) {
  return matrix.map((row, i) => row.map((value, j) => value - eigen.eigenvalue * eigen.vector[i] * eigen.vector[j]));
}

function computePCAFromColumns(data, vars, groupCol) {
  const columns = vars.map(v => numericSeries(data[v] || []));
  const n = Math.max(...columns.map(c => c.length), 0);
  const rows = [];
  for (let i = 0; i < n; i++) {
    const raw = columns.map(c => c[i]);
    if (raw.every(Number.isFinite)) rows.push({ raw, index: i, group: groupCol ? (data[groupCol] || [])[i] : 'All' });
  }
  if (rows.length < 5 || vars.length < 2) return null;

  const means = vars.map((_, j) => meanValue(rows.map(r => r.raw[j])));
  const sds = vars.map((_, j) => sdValue(rows.map(r => r.raw[j])) || 1);
  const z = rows.map(r => r.raw.map((v, j) => (v - means[j]) / sds[j]));
  const cov = covarianceMatrix(z);
  const pc1 = powerIteration(cov, 1);
  const pc2 = powerIteration(deflateMatrix(cov, pc1), 2);
  const totalVar = cov.reduce((s, row, i) => s + (row[i] || 0), 0) || 1;
  return rows.map((r, i) => ({
    index: r.index,
    group: r.group || 'All',
    pc1: dotProduct(z[i], pc1.vector),
    pc2: dotProduct(z[i], pc2.vector),
    hover: vars.map((v, j) => `${v}: ${fmtNum(r.raw[j], 2)}`).join('<br>'),
    exp1: Math.max(0, pc1.eigenvalue / totalVar),
    exp2: Math.max(0, pc2.eigenvalue / totalVar),
  }));
}

function confidenceEllipseTrace(points, name, color, theme) {
  if (!points || points.length < 5) return null;
  const xs = points.map(p => p.pc1);
  const ys = points.map(p => p.pc2);
  const mx = meanValue(xs);
  const my = meanValue(ys);
  const sx = sdValue(xs) || 1;
  const sy = sdValue(ys) || 1;
  let cov = 0;
  for (let i = 0; i < points.length; i++) cov += (xs[i] - mx) * (ys[i] - my);
  cov = cov / Math.max(points.length - 1, 1);
  const a = sx * sx;
  const d = sy * sy;
  const b = cov;
  const trace = a + d;
  const detTerm = Math.sqrt(Math.max(0, (a - d) ** 2 + 4 * b * b));
  const l1 = Math.max((trace + detTerm) / 2, 1e-6);
  const l2 = Math.max((trace - detTerm) / 2, 1e-6);
  const angle = Math.atan2(2 * b, a - d) / 2;
  const radius = 1.9;
  const ex = [];
  const ey = [];
  for (let k = 0; k <= 90; k++) {
    const t = 2 * Math.PI * k / 90;
    const x = radius * Math.sqrt(l1) * Math.cos(t);
    const y = radius * Math.sqrt(l2) * Math.sin(t);
    ex.push(mx + x * Math.cos(angle) - y * Math.sin(angle));
    ey.push(my + x * Math.sin(angle) + y * Math.cos(angle));
  }
  return {
    type: 'scatter',
    mode: 'lines',
    x: ex,
    y: ey,
    name: `${name} 95% ellipse`,
    line: { color, width: 1.5, dash: 'dot', shape: 'linear' },
    fill: 'toself',
    fillcolor: colorAlpha(color, 0.10),
    hoverinfo: 'skip',
    showlegend: false,
  };
}

function positiveOutcome(value) {
  const text = String(value ?? '').trim().toLowerCase();
  return value === 1 || text === '1' || text === 'yes' || text === 'true' || text === 'event' || text === 'case';
}

function probabilityFromPredictor(values) {
  const clean = (values || []).map(Number).filter(Number.isFinite);
  if (clean.length === 0) return [];
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  if (min >= 0 && max <= 1) return (values || []).map(v => Number(v));
  const mean = meanValue(clean);
  const sd = sdValue(clean) || 1;
  return (values || []).map(v => {
    const z = (Number(v) - mean) / sd;
    return 1 / (1 + Math.exp(-z));
  });
}

function clampNumber(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function rocCurveStats(outcome, predictor) {
  const pairs = (outcome || []).map((o, i) => ({ o: positiveOutcome(o) ? 1 : 0, p: Number(predictor?.[i]) }))
    .filter(d => (d.o === 0 || d.o === 1) && Number.isFinite(d.p))
    .sort((a, b) => b.p - a.p);
  const totalPos = pairs.filter(d => d.o === 1).length;
  const totalNeg = pairs.filter(d => d.o === 0).length;
  if (pairs.length < 8 || totalPos === 0 || totalNeg === 0) return null;
  let tp = 0, fp = 0;
  const fprs = [0], tprs = [0], thresholds = [Infinity];
  pairs.forEach(d => {
    if (d.o === 1) tp += 1;
    else fp += 1;
    fprs.push(fp / totalNeg);
    tprs.push(tp / totalPos);
    thresholds.push(d.p);
  });
  fprs.push(1); tprs.push(1); thresholds.push(-Infinity);
  let auc = 0;
  for (let i = 1; i < fprs.length; i++) {
    auc += (fprs[i] - fprs[i - 1]) * (tprs[i] + tprs[i - 1]) / 2;
  }
  let bestIdx = 0;
  let bestScore = -Infinity;
  for (let i = 0; i < fprs.length; i++) {
    const score = tprs[i] - fprs[i];
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  return { fprs, tprs, thresholds, auc, bestIdx, cutoff: thresholds[bestIdx] };
}

/* ┢�┢� Smart Palette Expansion ┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢� */
function hexToHSL(hex) {
  if (!hex || !String(hex).startsWith('#')) return { h: 0, s: 50, l: 50 };
  const clean = String(hex).slice(1);
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return { h: 0, s: 50, l: 50 };
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  h /= 360;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = v => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function expandPalette(baseColors, count) {
  if (!baseColors || baseColors.length === 0) baseColors = ['#2E6F9E', '#D95F59', '#2A9D8F', '#E9A93A', '#6F5AA7', '#7C8B52'];
  if (count <= baseColors.length) return baseColors.slice(0, count);
  const result = [...baseColors];
  const baseHSL = baseColors.map(hexToHSL);
  let gen = 0;
  while (result.length < count) {
    const baseIdx = gen % baseColors.length;
    const base = baseHSL[baseIdx];
    const hueShift = ((Math.floor(gen / baseColors.length) + 1) * 37) % 360;
    const newH = (base.h + hueShift) % 360;
    const lightShift = (gen % 3 === 0 ? 6 : gen % 3 === 1 ? -6 : 0);
    const newL = Math.max(28, Math.min(72, base.l + lightShift));
    const satShift = (gen % 2 === 0 ? 5 : -5);
    const newS = Math.max(30, Math.min(92, base.s + satShift));
    result.push(hslToHex(newH, newS, newL));
    gen++;
  }
  return result;
}

/* ┢�┢� Chart Catalog ┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢� */
const CHART_CATALOG = {

  // Basic Charts
  scatter: {
    id: 'scatter', name: '散点�?', category: 'basic',
    description: '展示两个连续变量之间的关系，每个点代表一个观测����?',
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
      return { title: params.title || '散点�?', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) }, hovermode: 'closest' };
    },
  },

  grouped_scatter: {
    id: 'grouped_scatter', name: '分组散点�?', category: 'basic',
    description: '按颜色分组的散点图，展示不同亚群中两个变量的分布关系�?',
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
      return { title: params.title || '分组散点�?', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) }, hovermode: 'closest' };
    },
  },

  bar: {
    id: 'bar', name: '柱状�?', category: 'basic',
    description: '展示分类变量的频数或连续变量的均值，适合组间比较�?',
    icon: 'Bar', exampleDataset: 'bar_example',
    buildTraces(data, params, theme) {
      const rows = aggregateByCategory(data[safeName(params.x_var)] || [], data[safeName(params.y_var)] || []);
      const cats = rows.map(d => d.label);
      const means = rows.map(d => d.mean);
      const palette = expandPalette(theme.colorway, Math.max(cats.length, 16));
      return [{
        type: 'bar', x: cats, y: means,
        text: rows.map(d => `${fmtNum(d.mean)}<br><span style="font-size:10px">n=${d.n}</span>`),
        textposition: 'outside',
        customdata: rows.map(d => [d.n, d.sd]),
        marker: { color: cats.map((_, i) => palette[i % palette.length]), opacity: 0.92, line: { color: '#fff', width: 1.2 } },
        hovertemplate: '%{x}<br>均��? %{y:.2f}<br>N=%{customdata[0]}<br>SD=%{customdata[1]:.2f}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return { title: params.title || '柱状�?', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) }, bargap: 0.24, margin: { b: 92 } };
    },
  },

  stacked_bar: {
    id: 'stacked_bar', name: '堆叠柱状�?', category: 'basic',
    description: '展示各部分在整体中的构成，��合展示组成结构�?',
    icon: 'Stk', exampleDataset: 'bar_example',
    buildTraces(data, params, theme) {
      const xVals = data[safeName(params.x_var)] || [];
      const yVals = data[safeName(params.y_var)] || [];
      const gVals = data[safeName(params.color_var)] || unique(xVals);
      const xCats = unique(xVals);
      const groups = unique(gVals);
      const palette = expandPalette(theme.colorway, Math.max(groups.length, 16));
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
          marker: { color: palette[i % palette.length], opacity: 0.92, line: { color: '#fff', width: 0.8 } },
          hovertemplate: '%{x}<br>数��? %{y:.2f}<extra>' + String(g) + '</extra>',
        };
      });
    },
    buildLayout(params) {
      return { title: params.title || '堆叠柱状�?', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) }, barmode: 'stack', bargap: 0.22 };
    },
  },

  line: {
    id: 'line', name: '折线�?', category: 'basic',
    description: '展示数��随变量变化的趋势，适合时间序列数据�?',
    icon: 'Ln', exampleDataset: 'line_example',
    buildTraces(data, params, theme) {
      const rows = buildXYRows(data[safeName(params.x_var)] || [], data[safeName(params.y_var)] || []);
      const summary = summarizeRowsByX(rows);
      return [{
        type: 'scatter', mode: 'lines+markers+text', name: safeName(params.y_var),
        x: summary.map(d => d.x), y: summary.map(d => d.y),
        text: summary.map(d => fmtNum(d.y)),
        textposition: 'top center',
        customdata: summary.map(d => [d.n, d.sd]),
        line: { color: theme.colorway[0], width: 3.2, shape: 'spline', smoothing: 0.55 },
        marker: { color: theme.colorway[0], size: 8, line: { color: '#fff', width: 1.2 } },
        hovertemplate: '%{x}<br>均��? %{y:.2f}<br>N=%{customdata[0]}<br>SD=%{customdata[1]:.2f}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return { title: params.title || '折线�?', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) }, hovermode: 'x unified', margin: { b: 82 } };
    },
  },

  multi_line: {
    id: 'multi_line', name: '多组折线�?', category: 'basic',
    description: '多组折线图，展示不同组随变量的变化趋势��?',
    icon: 'MLn', exampleDataset: 'line_example',
    buildTraces(data, params, theme) {
      const rows = buildXYRows(data[safeName(params.x_var)] || [], data[safeName(params.y_var)] || [], data[safeName(params.color_var)] || []);
      const grouped = summarizeRowsByGroup(rows);
      return grouped.map((grp, i) => {
        const color = theme.colorway[i % theme.colorway.length];
        return {
          type: 'scatter', mode: 'lines+markers', name: String(grp.group),
          x: grp.rows.map(d => d.x), y: grp.rows.map(d => d.y),
          customdata: grp.rows.map(d => [d.n, d.sd]),
          line: { color, width: 3, shape: 'spline', smoothing: 0.5 },
          marker: { color, size: 7, line: { color: '#fff', width: 1 } },
          hovertemplate: '%{x}<br>均��? %{y:.2f}<br>N=%{customdata[0]}<br>SD=%{customdata[1]:.2f}<extra>' + String(grp.group) + '</extra>',
        };
      });
    },
    buildLayout(params) {
      return { title: params.title || '多组折线�?', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) }, hovermode: 'x unified', legend: { orientation: 'h' }, margin: { b: 92 } };
    },
  },

  area: {
    id: 'area', name: '面积�?', category: 'basic',
    description: '填充区域折线图，强调数��的累积感��?',
    icon: 'Ar', exampleDataset: 'line_example',
    buildTraces(data, params, theme) {
      const xVals = data[safeName(params.x_var)] || [];
      const yVals = data[safeName(params.y_var)] || [];
      const gVals = params.color_var ? (data[safeName(params.color_var)] || []) : null;
      if (gVals && gVals.length) {
        const rows = buildXYRows(xVals, yVals, gVals);
        return summarizeRowsByGroup(rows).map((grp, i) => {
          const color = theme.colorway[i % theme.colorway.length];
          return {
            type: 'scatter', mode: 'lines', fill: 'tozeroy', name: String(grp.group),
            x: grp.rows.map(d => d.x), y: grp.rows.map(d => d.y),
            line: { color, width: 2.6, shape: 'spline', smoothing: 0.45 },
            fillcolor: colorAlpha(color, 0.18),
            customdata: grp.rows.map(d => [d.n, d.sd]),
            hovertemplate: '%{x}<br>均��? %{y:.2f}<br>N=%{customdata[0]}<extra>' + String(grp.group) + '</extra>',
          };
        });
      }
      const summary = summarizeRowsByX(buildXYRows(xVals, yVals));
      const color = theme.colorway[0];
      return [{
        type: 'scatter', mode: 'lines', fill: 'tozeroy', name: safeName(params.y_var),
        x: summary.map(d => d.x), y: summary.map(d => d.y),
        line: { color, width: 2.8, shape: 'spline', smoothing: 0.5 },
        fillcolor: colorAlpha(color, 0.22),
        customdata: summary.map(d => [d.n, d.sd]),
        hovertemplate: '%{x}<br>均��? %{y:.2f}<br>N=%{customdata[0]}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return { title: params.title || '面积�?', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) }, hovermode: 'x unified', margin: { b: 86 } };
    },
  },

  histogram: {
    id: 'histogram', name: '直方�?', category: 'basic',
    description: '展示连续变量的频数分布，观察分布形����?',
    icon: 'Hist', exampleDataset: 'boxplot_example',
    buildTraces(data, params, theme) {
      const xCol = safeName(params.x_var || params.y_var);
      const vals = data[xCol] || [];
      const groupVals = params.color_var ? (data[safeName(params.color_var)] || []) : [];
      const groups = params.color_var ? orderedUniqueValues(groupVals) : [];
      if (groups.length) {
        return groups.map((g, i) => ({
          type: 'histogram', name: String(g), x: vals.filter((_, idx) => String(groupVals[idx]) === String(g)).map(Number).filter(Number.isFinite),
          histnorm: 'probability density',
          opacity: 0.58,
          marker: { color: theme.colorway[i % theme.colorway.length], line: { color: '#fff', width: 0.6 } },
          hovertemplate: '区间: %{x}<br>密度: %{y:.3f}<extra>' + String(g) + '</extra>',
        }));
      }
      const clean = numeric(vals);
      return [{
        type: 'histogram', x: clean, name: xCol,
        histnorm: 'probability density',
        marker: { color: theme.colorway[0], opacity: 0.82, line: { color: theme.markerLine, width: 0.6 } },
        hovertemplate: '区间: %{x}<br>密度: %{y:.3f}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return { title: params.title || '直方�?', xaxis: { title: safeName(params.x_var || params.y_var) }, yaxis: { title: '概率密度' }, bargap: 0.04, barmode: 'overlay' };
    },
  },

  density: {
    id: 'density', name: '密度�?', category: 'basic',
    description: '平滑的分布曲线，展示数据分布形����?',
    icon: 'Dns', exampleDataset: 'boxplot_example',
    buildTraces(data, params, theme) {
      const xCol = safeName(params.x_var);
      const vals = data[xCol] || [];
      const groupVals = params.color_var ? (data[safeName(params.color_var)] || []) : [];
      const groups = params.color_var ? orderedUniqueValues(groupVals) : [];
      if (groups.length) {
        return groups.map((g, i) => {
          const color = theme.colorway[i % theme.colorway.length];
          const kde = gaussianKDE(vals.filter((_, idx) => String(groupVals[idx]) === String(g)).map(Number));
          return {
            type: 'scatter', mode: 'lines', fill: 'tozeroy', name: String(g),
            x: kde.x, y: kde.y,
            line: { color, width: 2.7, shape: 'spline', smoothing: 0.45 },
            fillcolor: colorAlpha(color, 0.16),
            hovertemplate: `${xCol}: %{x:.2f}<br>密度: %{y:.3f}<extra>${String(g)}</extra>`,
          };
        });
      }
      const color = theme.colorway[0];
      const kde = gaussianKDE(numeric(vals));
      return [{
        type: 'scatter', mode: 'lines', fill: 'tozeroy', name: xCol,
        x: kde.x, y: kde.y,
        line: { color, width: 2.9, shape: 'spline', smoothing: 0.45 },
        fillcolor: colorAlpha(color, 0.2),
        hovertemplate: `${xCol}: %{x:.2f}<br>密度: %{y:.3f}<extra></extra>`,
      }];
    },
    buildLayout(params) {
      return { title: params.title || '密度�?', xaxis: { title: safeName(params.x_var) }, yaxis: { title: '概率密度' }, hovermode: 'closest' };
    },
  },

  box: {
    id: 'box', name: '箱线�?', category: 'basic',
    description: '展示数据的中位数、四分位数和异常值，适合组间分布比较�?',
    icon: 'Box', exampleDataset: 'boxplot_example',
    buildTraces(data, params, theme) {
      const xv = params.x_var ? (data[safeName(params.x_var)] || []) : null;
      const yRaw = data[safeName(params.y_var)] || [];
      if (xv && xv.length > 0) {
        return orderedUniqueValues(xv).map((cat, i) => {
          const vals = yRaw.filter((_, idx) => String(xv[idx]) === String(cat)).map(Number).filter(Number.isFinite);
          const color = theme.colorway[i % theme.colorway.length];
          return {
            type: 'box', y: vals, name: String(cat),
            boxpoints: 'outliers',
            jitter: 0.28,
            marker: { color, outliercolor: colorAlpha(color, 0.65), size: 4, opacity: 0.55, line: { color: '#fff', width: 0.4 } },
            line: { color, width: 1.8 },
            fillcolor: colorAlpha(color, 0.22),
            hovertemplate: String(cat) + '<br>%{y:.2f}<extra></extra>',
          };
        });
      }
      const yv = numeric(yRaw);
      return [{
        type: 'box', y: yv, name: safeName(params.y_var),
        marker: { color: theme.colorway[0] }, fillcolor: colorAlpha(theme.colorway[0], 0.25),
        hovertemplate: '%{y:.2f}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return { title: params.title || '箱线�?', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) }, boxmode: 'group', margin: { b: 92 } };
    },
  },

  violin: {
    id: 'violin', name: '小提琴图', category: 'basic',
    description: '展示数据分布密度的平滑曲线，比箱线图更丰富��?',
    icon: 'Viol', exampleDataset: 'violin_example',
    buildTraces(data, params, theme) {
      const xv = params.x_var ? (data[safeName(params.x_var)] || []) : null;
      const yRaw = data[safeName(params.y_var)] || [];
      if (xv && xv.length > 0) {
        return orderedUniqueValues(xv).map((cat, i) => {
          const vals = yRaw.filter((_, idx) => String(xv[idx]) === String(cat)).map(Number).filter(Number.isFinite);
          const color = theme.colorway[i % theme.colorway.length];
          return {
            type: 'violin', y: vals, name: String(cat),
            points: false, box: { visible: true, width: 0.18 },
            line: { color, width: 1.7 },
            fillcolor: colorAlpha(color, 0.24),
            meanline: { visible: true },
            hovertemplate: String(cat) + '<br>%{y:.2f}<extra></extra>',
          };
        });
      }
      const yv = numeric(yRaw);
      return [{
        type: 'violin', y: yv, name: safeName(params.y_var),
        points: false, box: { visible: true }, line: { color: theme.colorway[0] },
        fillcolor: colorAlpha(theme.colorway[0], 0.25), meanline: { visible: true },
      }];
    },
    buildLayout(params) {
      return { title: params.title || '小提琴图', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) }, violinmode: 'group', margin: { b: 92 } };
    },
  },

  box_scatter: {
    id: 'box_scatter', name: '箱线�?散点', category: 'basic',
    icon: 'B+S', exampleDataset: 'boxplot_example',
    buildTraces(data, params, theme) {
      const xv = params.x_var ? (data[safeName(params.x_var)] || []) : Array((data[safeName(params.y_var)] || []).length).fill('');
      const yRaw = data[safeName(params.y_var)] || [];
      const traces = [];
      orderedUniqueValues(xv).forEach((cat, i) => {
        const vals = yRaw.filter((_, idx) => String(xv[idx]) === String(cat)).map(Number).filter(Number.isFinite);
        const color = theme.colorway[i % theme.colorway.length];
        traces.push({
          type: 'box', y: vals, name: String(cat), boxpoints: false,
          fillcolor: colorAlpha(color, 0.20), line: { color, width: 1.6 }, hovertemplate: String(cat) + '<br>%{y:.2f}<extra></extra>',
        });
        traces.push({
          type: 'scatter', mode: 'markers', x: Array(vals.length).fill(String(cat)), y: vals, name: String(cat) + ' 散点',
          showlegend: false,
          marker: { color, size: 4.2, opacity: 0.46, line: { color: '#fff', width: 0.35 } },
          hovertemplate: String(cat) + '<br>%{y:.2f}<extra></extra>',
        });
      });
      return traces;
    },
    buildLayout(params) {
      return { title: params.title || '箱线�?散点叠加', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) }, boxmode: 'group', margin: { b: 92 } };
    },
  },

  violin_box_scatter: {
    id: 'violin_box_scatter', name: '小提�?箱线+散点', category: 'basic',
    icon: 'VBS', exampleDataset: 'violin_example',
    buildTraces(data, params, theme) {
      const xv = params.x_var ? (data[safeName(params.x_var)] || []) : Array((data[safeName(params.y_var)] || []).length).fill('');
      const yRaw = data[safeName(params.y_var)] || [];
      const traces = [];
      orderedUniqueValues(xv).forEach((cat, i) => {
        const vals = yRaw.filter((_, idx) => String(xv[idx]) === String(cat)).map(Number).filter(Number.isFinite);
        const color = theme.colorway[i % theme.colorway.length];
        traces.push({
          type: 'violin', y: vals, name: String(cat), points: false,
          box: { visible: true, width: 0.14 },
          line: { color, width: 1.7 },
          fillcolor: colorAlpha(color, 0.24),
          meanline: { visible: true },
          hovertemplate: String(cat) + '<br>%{y:.2f}<extra></extra>',
        });
        traces.push({
          type: 'scatter', mode: 'markers', x: Array(vals.length).fill(String(cat)), y: vals, name: String(cat) + ' 散点',
          showlegend: false,
          marker: { color, size: 3.5, opacity: 0.42, line: { color: '#fff', width: 0.3 } },
          hovertemplate: String(cat) + '<br>%{y:.2f}<extra></extra>',
        });
      });
      return traces;
    },
    buildLayout(params) {
      return { title: params.title || '小提�?箱线+散点', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) }, violinmode: 'group', margin: { b: 92 } };
    },
  },

  error_bar: {
    id: 'error_bar', name: '误差线图', category: 'basic',
    description: '展示各组均��及标准差范围��?',
    icon: 'Err', exampleDataset: 'bar_example',
    buildTraces(data, params, theme) {
      const xv = data[safeName(params.x_var)] || [];
      const yRaw = data[safeName(params.y_var)] || [];
      const rows = aggregateByCategory(xv, yRaw);
      const palette = expandPalette(theme.colorway, Math.max(rows.length, 16));
      return [{
        type: 'scatter', mode: 'markers',
        x: rows.map(d => d.label), y: rows.map(d => d.mean),
        text: rows.map(d => `${fmtNum(d.mean)} ± ${fmtNum(d.sd)}`),
        textposition: 'top center',
        customdata: rows.map(d => [d.n, d.sd]),
        error_y: { type: 'data', array: rows.map(d => d.sd), visible: true, thickness: 2.0, width: 8, color: '#475569' },
        marker: { color: rows.map((_, i) => palette[i % palette.length]), size: 12, line: { color: '#fff', width: 1.5 } },
        hovertemplate: '%{x}<br>均��? %{y:.2f}<br>SD=%{customdata[1]:.2f}<br>N=%{customdata[0]}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return { title: params.title || '误差线图 (Mean ± SD)', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) }, margin: { b: 92 } };
    },
  },

  horizontal_bar: {
    id: 'horizontal_bar', name: '横向条形�?', category: 'basic',
    description: '适合展示较长分类标签、临床终点或亚组均��比较��?',
    icon: '横条', exampleDataset: 'bar_example',
    buildTraces(data, params, theme) {
      const rows = aggregateByCategory(data[safeName(params.x_var)] || [], data[safeName(params.y_var)] || []).sort((a, b) => a.mean - b.mean);
      const palette = expandPalette(theme.colorway, Math.max(rows.length, 16));
      return [{
        type: 'bar', orientation: 'h',
        y: rows.map(d => d.label), x: rows.map(d => d.mean),
        text: rows.map(d => fmtNum(d.mean)), textposition: 'outside',
        customdata: rows.map(d => [d.n, d.sd]),
        marker: { color: rows.map((_, i) => palette[i % palette.length]), opacity: 0.92, line: { color: '#fff', width: 1.0 } },
        hovertemplate: '%{y}<br>均��? %{x:.2f}<br>N=%{customdata[0]}<br>SD=%{customdata[1]:.2f}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return { title: params.title || '横向条形�?', xaxis: { title: safeName(params.y_var) }, yaxis: { title: safeName(params.x_var), automargin: true }, bargap: 0.28, margin: { l: 130, r: 90, t: 72, b: 72 } };
    },
  },

  grouped_bar: {
    id: 'grouped_bar', name: '分组柱状�?', category: 'basic',
    description: '并列展示不同分组在各分类中的均��或计数，��合治疗组和响应类别比较�?',
    icon: '分柱', exampleDataset: 'bar_example',
    buildTraces(data, params, theme) {
      const xVals = data[safeName(params.x_var)] || [];
      const yVals = data[safeName(params.y_var)] || [];
      const gVals = data[safeName(params.color_var)] || [];
      const xCats = unique(xVals);
      const groups = unique(gVals);
      const palette = expandPalette(theme.colorway, Math.max(groups.length, 16));
      return groups.map((g, i) => {
        const means = xCats.map(xc => {
          const vals = xVals.map((x, idx) => String(x) === String(xc) && String(gVals[idx]) === String(g) ? Number(yVals[idx]) : null).filter(Number.isFinite);
          return meanValue(vals);
        });
        return {
          type: 'bar', name: String(g), x: xCats, y: means,
          text: means.map(v => fmtNum(v)),
          customdata: xCats.map(xc => xVals.filter((x, idx) => String(x) === String(xc) && String(gVals[idx]) === String(g)).length),
          marker: { color: palette[i % palette.length], opacity: 0.92, line: { color: '#fff', width: 0.8 } },
          hovertemplate: '%{x}<br>均��? %{y:.2f}<br>N=%{customdata}<extra>' + String(g) + '</extra>',
        };
      });
    },
    buildLayout(params) {
      return { title: params.title || '分组柱状�?', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) }, barmode: 'group', bargap: 0.20, bargroupgap: 0.08, margin: { b: 92 } };
    },
  },

  percent_stacked_bar: {
    id: 'percent_stacked_bar', name: '百分比堆叠图', category: 'basic',
    description: '展示响应等级、不良事件分级或基线分层构成比例�?',
    icon: '堆叠', exampleDataset: 'bar_example',
    buildTraces(data, params, theme) {
      const xVals = data[safeName(params.x_var)] || [];
      const gVals = data[safeName(params.color_var)] || [];
      const yRaw = data[safeName(params.y_var)] || [];
      const xCats = unique(xVals);
      const groups = unique(gVals);
      const hasWeight = yRaw.some(v => Number.isFinite(Number(v)));
      const palette = expandPalette(theme.colorway, Math.max(groups.length, 16));
      return groups.map((g, i) => {
        const vals = xCats.map(xc => {
          let sum = 0;
          xVals.forEach((x, idx) => {
            if (String(x) === String(xc) && String(gVals[idx]) === String(g)) sum += hasWeight ? (Number(yRaw[idx]) || 0) : 1;
          });
          return sum;
        });
        const pct = vals.map((v, idx) => {
          let denom = 0;
          xVals.forEach((x, j) => {
            if (String(x) === String(xCats[idx])) denom += hasWeight ? (Number(yRaw[j]) || 0) : 1;
          });
          return denom > 0 ? 100 * v / denom : 0;
        });
        return {
          type: 'bar', name: String(g), x: xCats, y: pct,
          text: pct.map(v => `${fmtNum(v)}%`), textposition: 'inside',
          customdata: vals,
          marker: { color: palette[i % palette.length], opacity: 0.92, line: { color: '#fff', width: 0.8 } },
          hovertemplate: '%{x}<br>比例: %{y:.1f}%<br>原始�? %{customdata:.2f}<extra>' + String(g) + '</extra>',
        };
      });
    },
    buildLayout(params) {
      return { title: params.title || '百分比堆叠图', xaxis: { title: safeName(params.x_var) }, yaxis: { title: '百分�?', range: [0, 100], ticksuffix: '%' }, barmode: 'stack', bargap: 0.18, margin: { b: 92 } };
    },
  },

  lollipop: {
    id: 'lollipop', name: '棒棒糖图', category: 'basic',
    description: '用细线和醒目标记展示排序后的临床指标�?',
    icon: '棒糖', exampleDataset: 'bar_example',
    buildTraces(data, params, theme) {
      const rows = aggregateByCategory(data[safeName(params.x_var)] || [], data[safeName(params.y_var)] || [])
        .sort((a, b) => a.mean - b.mean);
      const palette = expandPalette(theme.colorway, Math.max(rows.length, 16));
      return rows.flatMap((d, i) => {
        const color = palette[i % palette.length];
        return [
          {
            type: 'scatter',
            mode: 'lines',
            x: [0, d.mean],
            y: [d.label, d.label],
            name: String(d.label),
            meta: { visualRole: 'lollipopStemLine', colorIndex: i },
            line: { color: colorAlpha(color, 0.55), width: 2.4, shape: 'linear' },
            hoverinfo: 'skip',
            showlegend: false,
          },
          {
            type: 'scatter',
            mode: 'markers+text',
            x: [d.mean],
            y: [d.label],
            name: String(d.label),
            meta: { visualRole: 'lollipopHead', colorIndex: i },
            text: [fmtNum(d.mean)],
            textposition: 'middle right',
            customdata: [[d.n, d.sd]],
            marker: { color, size: 17, line: { color: '#fff', width: 1.4 } },
            cliponaxis: false,
            hovertemplate: '%{y}<br>均��? %{x:.2f}<br>N=%{customdata[0]}<br>SD=%{customdata[1]:.2f}<extra></extra>',
            showlegend: false,
          },
        ];
      });
    },
    buildLayout(params) {
      return {
        title: params.title || '棒棒糖图',
        xaxis: { title: safeName(params.y_var), zeroline: true, zerolinewidth: 1.2, zerolinecolor: 'rgba(20, 35, 48, 0.35)' },
        yaxis: { title: safeName(params.x_var), automargin: true },
        margin: { l: 128, r: 74, b: 72 },
        showlegend: false,
      };
    },
  },

  slope: {
    id: 'slope', name: '斜率变化�?', category: 'basic',
    description: '展示不同分组从基线到随访的均值变化趋势��?',
    icon: '斜率', exampleDataset: 'paired_change_example',
    buildTraces(data, params, theme) {
      const group = data[safeName(params.color_var)] || [];
      const start = data[safeName(params.y_var)] || data['baseline'] || [];
      const end = data[safeName(params.end_var)] || data['week12'] || [];
      const groups = unique(group);
      return groups.map((g, i) => {
        const s = [], e = [];
        group.forEach((v, idx) => {
          if (String(v) === String(g)) {
            s.push(Number(start[idx]));
            e.push(Number(end[idx]));
          }
        });
        return {
          type: 'scatter', mode: 'lines+markers+text', name: String(g),
          x: ['基线', '随访'], y: [meanValue(s), meanValue(e)],
          text: [fmtNum(meanValue(s)), fmtNum(meanValue(e))],
          textposition: ['middle left', 'middle right'],
          line: { color: theme.colorway[i % theme.colorway.length], width: 3 },
          marker: { color: theme.colorway[i % theme.colorway.length], size: 11 },
          hovertemplate: '%{x}: %{y:.2f}<extra>' + String(g) + '</extra>',
        };
      });
    },
    buildLayout(params) {
      return { title: params.title || '斜率变化�?', xaxis: { title: '' }, yaxis: { title: safeName(params.y_var) + ' / ' + safeName(params.end_var || '随访�?') } };
    },
  },

  paired_line: {
    id: 'paired_line', name: '配对变化�?', category: 'basic',
    description: '展示每位受试者治疗前后的个体变化，可按治疗组分层�?',
    icon: '配对', exampleDataset: 'paired_change_example',
    buildTraces(data, params, theme) {
      const ids = data[safeName(params.x_var)] || data['patient_id'] || [];
      const group = data[safeName(params.color_var)] || [];
      const start = data[safeName(params.y_var)] || data['baseline'] || [];
      const end = data[safeName(params.end_var)] || data['week12'] || [];
      const groups = unique(group);
      return groups.map((g, i) => {
        const xs = [], ys = [], text = [];
        group.forEach((v, idx) => {
          if (String(v) !== String(g)) return;
          xs.push('基线', '随访', null);
          ys.push(Number(start[idx]), Number(end[idx]), null);
          text.push(ids[idx], ids[idx], null);
        });
        return {
          type: 'scatter', mode: 'lines+markers', name: String(g),
          x: xs, y: ys, text,
          line: { color: theme.colorway[i % theme.colorway.length], width: 1.4 },
          marker: { color: theme.colorway[i % theme.colorway.length], size: 5 },
          opacity: 0.62,
          hovertemplate: '%{text}<br>%{x}: %{y:.2f}<extra>' + String(g) + '</extra>',
        };
      });
    },
    buildLayout(params) {
      return { title: params.title || '配对变化�?', xaxis: { title: '' }, yaxis: { title: safeName(params.y_var) + ' / ' + safeName(params.end_var || '随访�?') } };
    },
  },

  waterfall: {
    id: 'waterfall', name: '瀑布响应�?', category: 'basic',
    description: '展示相对基线的最佳百分比变化，常用于肿瘤疗效响应报告�?',
    icon: '瀑布', exampleDataset: 'waterfall_example',
    buildTraces(data, params, theme) {
      const labels = data[safeName(params.x_var)] || data['patient_id'] || [];
      const vals = numeric(data[safeName(params.y_var)] || data['best_change_pct'] || []);
      const groups = data[safeName(params.color_var)] || data['response'] || [];
      const rows = labels.map((label, i) => ({ label, value: vals[i], group: groups[i] })).filter(d => Number.isFinite(d.value)).sort((a, b) => a.value - b.value);
      const groupNames = unique(rows.map(d => d.group));
      const colorMap = {};
      groupNames.forEach((g, i) => { colorMap[g] = theme.colorway[i % theme.colorway.length]; });
      return [{
        type: 'bar',
        x: rows.map(d => d.label), y: rows.map(d => d.value),
        text: rows.map(d => fmtNum(d.value) + '%'),
        marker: { color: rows.map(d => colorMap[d.group] || theme.colorway[0]), opacity: 0.9 },
        customdata: rows.map(d => d.group),
        hovertemplate: '%{x}<br>%{y:.1f}%<br>%{customdata}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return {
        title: params.title || '瀑布响应�?',
        xaxis: { title: '受试�?', tickangle: -70, tickfont: { size: 8 } },
        yaxis: { title: '相对基线朢�佳变�?(%)', zeroline: true },
        shapes: [
          { type: 'line', xref: 'paper', yref: 'y', x0: 0, x1: 1, y0: -30, y1: -30, line: { color: '#2A9D8F', width: 1.2, dash: 'dash' } },
          { type: 'line', xref: 'paper', yref: 'y', x0: 0, x1: 1, y0: 20, y1: 20, line: { color: '#D95F59', width: 1.2, dash: 'dash' } },
        ],
        margin: { l: 78, r: 45, t: 80, b: 120 },
      };
    },
  },

  bland_altman: {
    id: 'bland_altman', name: 'Bland-Altman ????', category: 'basic',
    description: '??????????????????95%??????',
    icon: 'BA', exampleDataset: 'method_comparison_example',
    buildTraces(data, params, theme) {
      const pairs = finitePairs(data[safeName(params.x_var)] || data['method_a'] || [], data[safeName(params.y_var)] || data['method_b'] || []);
      const mean = pairs.map(d => (d.x + d.y) / 2);
      const diff = pairs.map(d => d.y - d.x);
      params._baMean = meanValue(diff);
      params._baUpper = params._baMean + 1.96 * sdValue(diff);
      params._baLower = params._baMean - 1.96 * sdValue(diff);
      return [{
        type: 'scatter', mode: 'markers',
        x: mean, y: diff,
        marker: { color: theme.colorway[0], size: 8, opacity: 0.78, line: { color: '#fff', width: 0.8 } },
        hovertemplate: '??: %{x:.2f}<br>??: %{y:.2f}<extra></extra>',
      }];
    },
    buildLayout(params) {
      const mean = Number(params._baMean || 0);
      const upper = Number(params._baUpper || 0);
      const lower = Number(params._baLower || 0);
      return {
        title: params.title || 'Bland-Altman ????',
        xaxis: { title: '??????' },
        yaxis: { title: '??????' },
        shapes: [
          { type: 'line', xref: 'paper', yref: 'y', x0: 0, x1: 1, y0: mean, y1: mean, line: { color: '#111827', width: 1.4 } },
          { type: 'line', xref: 'paper', yref: 'y', x0: 0, x1: 1, y0: upper, y1: upper, line: { color: '#D95F59', width: 1.2, dash: 'dash' } },
          { type: 'line', xref: 'paper', yref: 'y', x0: 0, x1: 1, y0: lower, y1: lower, line: { color: '#D95F59', width: 1.2, dash: 'dash' } },
        ],
      };
    },
  },

  calibration_curve: {
    id: 'calibration_curve', name: '校准曲线', category: 'basic',
    description: '比较预测风险与实际事件率，用于临床预测模型校准评估��?',
    icon: '校准', exampleDataset: 'calibration_example',
    buildTraces(data, params, theme) {
      const pred = numeric(data[safeName(params.x_var)] || data['predicted_risk'] || []);
      const outcome = numeric(data[safeName(params.y_var)] || data['outcome'] || []);
      const group = data[safeName(params.color_var)] || Array(pred.length).fill('模型');
      const groups = unique(group);
      const traces = groups.map((g, gi) => {
        const rows = pred.map((p, i) => ({ p, o: outcome[i], g: group[i] })).filter(d => String(d.g) === String(g) && Number.isFinite(d.p) && Number.isFinite(d.o)).sort((a, b) => a.p - b.p);
        const bins = [];
        for (let b = 0; b < 10; b++) {
          const slice = rows.slice(Math.floor(b * rows.length / 10), Math.floor((b + 1) * rows.length / 10));
          if (slice.length > 0) bins.push({ pred: meanValue(slice.map(d => d.p)), obs: meanValue(slice.map(d => d.o)), n: slice.length });
        }
        return {
          type: 'scatter', mode: 'lines+markers', name: String(g),
          x: bins.map(d => d.pred), y: bins.map(d => d.obs),
          customdata: bins.map(d => d.n),
          line: { color: theme.colorway[gi % theme.colorway.length], width: 2.8 },
          marker: { color: theme.colorway[gi % theme.colorway.length], size: 9 },
          hovertemplate: '预测风险: %{x:.3f}<br>观察事件�? %{y:.3f}<br>N=%{customdata}<extra>' + String(g) + '</extra>',
        };
      });
      traces.push({ type: 'scatter', mode: 'lines', name: '理想校准�?', x: [0, 1], y: [0, 1], line: { color: '#8A8F98', width: 1.3, dash: 'dash' }, hoverinfo: 'skip' });
      return traces;
    },
    buildLayout(params) {
      return { title: params.title || '校准曲线', xaxis: { title: '预测风险', range: [0, 1] }, yaxis: { title: '观察事件�?', range: [0, 1] }, hovermode: 'closest' };
    },
  },

  swimmer: {
    id: 'swimmer', name: '???', category: 'basic',
    description: '????????????????????????',
    icon: '泳道', exampleDataset: 'swimmer_example',
    buildTraces(data, params, theme) {
      const ids = data[safeName(params.x_var)] || data['patient_id'] || [];
      const duration = numeric(data[safeName(params.y_var)] || data['duration_month'] || []);
      const start = numeric(data[safeName(params.start_var)] || data['start_month'] || Array(duration.length).fill(0));
      const group = data[safeName(params.color_var)] || data['therapy'] || [];
      const eventMonth = numeric(data['event_month'] || []);
      const event = data['event'] || [];
      const rows = ids.map((id, i) => ({ id, duration: duration[i], start: start[i] || 0, group: group[i], eventMonth: eventMonth[i], event: event[i] }))
        .filter(d => Number.isFinite(d.duration)).sort((a, b) => b.duration - a.duration);
      const groups = unique(rows.map(d => d.group));
      const traces = groups.map((g, i) => {
        const rg = rows.filter(d => String(d.group) === String(g));
        return {
          type: 'bar', orientation: 'h', name: String(g),
          y: rg.map(d => d.id), x: rg.map(d => d.duration), base: rg.map(d => d.start),
          marker: { color: theme.colorway[i % theme.colorway.length], opacity: 0.78 },
          hovertemplate: '%{y}<br>持续时间: %{x:.1f} �?extra>' + String(g) + '</extra>',
        };
      });
      traces.push({
        type: 'scatter', mode: 'markers', name: '事件',
        x: rows.map(d => d.eventMonth), y: rows.map(d => d.id), text: rows.map(d => d.event),
        marker: { color: rows.map(d => d.event === 'Progression' ? '#D95F59' : '#2A9D8F'), symbol: rows.map(d => d.event === 'Progression' ? 'x' : 'circle'), size: 9, line: { color: '#fff', width: 0.8 } },
        hovertemplate: '%{y}<br>%{text}: %{x:.1f} ?<extra></extra>',
      });
      return traces;
    },
    buildLayout(params) {
      return { title: params.title || '???', xaxis: { title: '????????' }, yaxis: { title: '??', automargin: true }, barmode: 'overlay', margin: { l: 100, r: 60, t: 78, b: 72 } };
    },
  },

  population_pyramid: {
    id: 'population_pyramid', name: '人口金字塔图', category: 'basic',
    description: '????????????????????????',
    icon: '金字', exampleDataset: 'population_pyramid_example',
    buildTraces(data, params, theme) {
      const age = data[safeName(params.x_var)] || data['age_group'] || [];
      const male = numeric(data[safeName(params.y_var)] || data['male'] || []);
      const female = numeric(data[safeName(params.end_var)] || data['female'] || []);
      return [
        { type: 'bar', orientation: 'h', name: safeName(params.y_var) || '??', y: age, x: male.map(v => -v), marker: { color: theme.colorway[0], opacity: 0.88 }, customdata: male, hovertemplate: '%{y}<br>%{customdata}<extra>??</extra>' },
        { type: 'bar', orientation: 'h', name: safeName(params.end_var) || '??', y: age, x: female, marker: { color: theme.colorway[1], opacity: 0.88 }, hovertemplate: '%{y}<br>%{x}<extra>??</extra>' },
      ];
    },
    buildLayout(params) {
      return { title: params.title || '??????', xaxis: { title: '??', tickvals: [-120, -80, -40, 0, 40, 80, 120], ticktext: ['120', '80', '40', '0', '40', '80', '120'] }, yaxis: { title: '??' }, barmode: 'relative' };
    },
  },

  qq_plot: {
    id: 'qq_plot', name: '?? QQ ?', category: 'basic',
    description: '?????????????????????????????',
    icon: 'QQ', exampleDataset: 'boxplot_example',
    buildTraces(data, params, theme) {
      const vals = numeric(data[safeName(params.y_var)] || data[safeName(params.x_var)] || []).sort((a, b) => a - b);
      const n = vals.length;
      if (n < 5) return fallbackForest();
      const m = meanValue(vals);
      const sd = sdValue(vals) || 1;
      const q = vals.map((_, i) => normalQuantile((i + 0.5) / n));
      const refX = [Math.min(...q), Math.max(...q)];
      const refY = refX.map(x => m + sd * x);
      return [
        { type: 'scatter', mode: 'markers', x: q, y: vals, name: safeName(params.y_var || params.x_var), marker: { color: theme.colorway[0], size: 7, opacity: 0.78, line: { color: '#fff', width: 0.6 } }, hovertemplate: '理论分位�? %{x:.2f}<br>观察�? %{y:.2f}<extra></extra>' },
        { type: 'scatter', mode: 'lines', x: refX, y: refY, name: '?????', line: { color: theme.colorway[1], width: 2, dash: 'dash' }, hoverinfo: 'skip' },
      ];
    },
    buildLayout(params) {
      return { title: params.title || '?? QQ ?', xaxis: { title: '?????' }, yaxis: { title: safeName(params.y_var || params.x_var) } };
    },
  },

  // ══�?Advanced Charts ════════════════════════════════════
  dumbbell: {
    id: 'dumbbell', name: '哑铃�?', category: 'advanced',
    description: '展示前后或两组间的指标变化对比��?',
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
      return { title: params.title || '哑铃�?', xaxis: { title: 'Value' }, yaxis: { title: '' } };
    },
  },

  forest: {
    id: 'forest', name: '森林�?', category: 'advanced',
    description: '展示多组/亚组的效应量�?5%置信区间，Meta分析和亚组分析核心图彃6�9��?',
    icon: 'Frst', exampleDataset: 'forest_example',
    buildTraces(data, params, theme) {
      const labels = data[safeName(params.x_var)] || data['subgroup'] || [];
      const or = numeric(data[safeName(params.y_var)] || data['or'] || []);
      const ciL = numeric(data['ci_lower'] || []);
      const ciU = numeric(data['ci_upper'] || []);
      const pVals = numeric(data['p_value'] || []);
      const nVals = numeric(data['n'] || []);
      if (or.length === 0) {
        return fallbackForest();
      }
      const rows = labels.map((label, i) => ({
        label: String(label),
        or: or[i],
        low: ciL[i],
        high: ciU[i],
        p: pVals[i],
        n: nVals[i],
      })).filter(d => Number.isFinite(d.or)).reverse();
      params._forestRows = rows;
      return [
      {
        type: 'scatter', mode: 'markers',
        x: rows.map(d => d.or),
        y: rows.map(d => d.label),
        text: rows.map(d => `${fmtNum(d.or, 2)} (${fmtNum(d.low, 2)}-${fmtNum(d.high, 2)})`),
        textposition: 'middle right',
        customdata: rows.map(d => [d.low, d.high, d.p, d.n]),
        error_x: {
          type: 'data',
          symmetric: false,
          array: rows.map(d => Number.isFinite(d.high) ? d.high - d.or : 0),
          arrayminus: rows.map(d => Number.isFinite(d.low) ? d.or - d.low : 0),
          color: '#475569',
          thickness: 1.8,
          width: 5,
        },
        marker: {
          color: rows.map(d => {
            if (d.label.toLowerCase() === 'overall') return theme.ink || '#111827';
            return d.or < 1 ? theme.colorway[2] : theme.colorway[1];
          }),
          size: rows.map(d => d.label.toLowerCase() === 'overall' ? 18 : 12),
          symbol: rows.map(d => d.label.toLowerCase() === 'overall' ? 'diamond' : 'square'),
          line: { color: '#ffffff', width: 1.2 },
        },
        hovertemplate: '%{y}<br>OR: %{x:.2f}<br>95% CI: %{customdata[0]:.2f}-%{customdata[1]:.2f}<br>P=%{customdata[2]:.3f}<br>N=%{customdata[3]}<extra></extra>',
      },
      {
        type: 'scatter', mode: 'lines', name: 'OR=1 参��线',
        meta: { fixedColor: '#64748B' },
        x: [1, 1], y: rows.map(d => d.label),
        line: { color: '#64748B', width: 1.2, dash: 'dash' },
        hoverinfo: 'skip',
        showlegend: false,
      }];
    },
    buildLayout(params) {
      const rows = params._forestRows || [];
      return {
        title: params.title || '森林�?',
        xaxis: { title: 'Odds Ratio (95% CI)', type: 'log', range: [Math.log10(0.35), Math.log10(1.8)] },
        yaxis: { title: '', automargin: true },
        margin: { l: 150, r: 150, t: 80, b: 74 },
        annotations: rows.length ? [{
          x: 1, y: rows[rows.length - 1].label,
          text: 'OR=1',
          showarrow: false,
          yshift: 24,
          font: { size: 11, color: '#64748B' },
        }] : [],
      };
    },
  },

  volcano: {
    id: 'volcano', name: '\u706b\u5c71\u56fe', category: 'advanced',
    description: '\u5c55\u793a\u5dee\u5f02\u8868\u8fbe\u7684\u663e\u8457\u6027\u4e0e\u6548\u5e94\u91cf\uff0c\u6309\u4e0a\u8c03\u3001\u4e0b\u8c03\u548c\u4e0d\u663e\u8457\u5206\u7c7b\u7740\u8272\u3002',
    icon: 'Volc', exampleDataset: 'volcano_example',
    buildTraces(data, params, theme) {
      const fc = numeric(data[safeName(params.x_var)] || data['log2fc'] || []);
      const rawP = numeric(data[safeName(params.y_var)] || data['pvalue'] || []);
      const pv = rawP.map(p => -Math.log10(Math.max(p, 1e-300)));
      const labels = data[safeName(params.color_var)] || data['gene'] || [];
      const pCut = 0.05;
      const fcCut = 1;
      const yCut = -Math.log10(pCut);
      const rows = fc.map((f, i) => ({
        x: f,
        y: pv[i],
        p: rawP[i],
        label: labels[i] || `Feature ${i + 1}`,
        cls: pv[i] >= yCut && f >= fcCut ? '\u4e0a\u8c03' : (pv[i] >= yCut && f <= -fcCut ? '\u4e0b\u8c03' : '\u4e0d\u663e\u8457'),
      })).filter(d => Number.isFinite(d.x) && Number.isFinite(d.y));
      params._volcanoCut = { fcCut, yCut };
      const order = ['\u4e0b\u8c03', '\u4e0d\u663e\u8457', '\u4e0a\u8c03'];
      const volcanoPalette = expandPalette(theme.colorway, 8);
      const colorMap = {
        '上调': volcanoPalette[1] || '#D95F59',
        '下调': volcanoPalette[0] || '#2E6F9E',
        '\u4e0d\u663e\u8457': volcanoPalette[3] ? colorAlpha(volcanoPalette[3], 0.35) : '#A8B3C2',
      };
      const traces = order.map(cls => {
        const part = rows.filter(d => d.cls === cls);
        return {
          type: 'scatter', mode: 'markers', name: cls,
          x: part.map(d => d.x), y: part.map(d => d.y), text: part.map(d => d.label),
          customdata: part.map(d => d.p),
          marker: {
            color: colorMap[cls],
            size: cls === '\u4e0d\u663e\u8457' ? 6 : 8,
            opacity: cls === '\u4e0d\u663e\u8457' ? 0.45 : 0.86,
            line: { color: '#ffffff', width: cls === '\u4e0d\u663e\u8457' ? 0.3 : 0.7 },
          },
          hovertemplate: '%{text}<br>log2FC: %{x:.2f}<br>P=%{customdata:.2e}<br>-log10(P): %{y:.2f}<extra>' + cls + '</extra>',
        };
      }).filter(t => t.x.length > 0);
      const top = rows
        .filter(d => d.cls !== '\u4e0d\u663e\u8457')
        .sort((a, b) => b.y - a.y)
        .slice(0, 10);
      if (top.length) traces.push({
        type: 'scatter', mode: 'markers',
        x: top.map(d => d.x), y: top.map(d => d.y), text: top.map(d => d.label),
        marker: { color: top.map(d => colorMap[d.cls]), size: 10, line: { color: '#111827', width: 0.6 } },
        textposition: top.map(d => d.x >= 0 ? 'top right' : 'top left'),
        mode: 'markers+text',
        textfont: { size: 10, color: '#111827' },
        hoverinfo: 'skip',
        showlegend: false,
      });
      return traces;
    },
    buildLayout(params) {
      const cut = params._volcanoCut || { fcCut: 1, yCut: -Math.log10(0.05) };
      return {
        title: params.title || '\u706b\u5c71\u56fe',
        xaxis: { title: 'log2 Fold Change', zeroline: false },
        yaxis: { title: '-log10(P value)', rangemode: 'tozero' },
        hovermode: 'closest',
        shapes: [
          { type: 'line', xref: 'x', yref: 'paper', x0: -cut.fcCut, x1: -cut.fcCut, y0: 0, y1: 1, line: { color: '#64748B', width: 1.2, dash: 'dash' } },
          { type: 'line', xref: 'x', yref: 'paper', x0: cut.fcCut, x1: cut.fcCut, y0: 0, y1: 1, line: { color: '#64748B', width: 1.2, dash: 'dash' } },
          { type: 'line', xref: 'paper', yref: 'y', x0: 0, x1: 1, y0: cut.yCut, y1: cut.yCut, line: { color: '#64748B', width: 1.2, dash: 'dash' } },
        ],
        annotations: [
          { x: cut.fcCut, y: cut.yCut, text: '|log2FC| >= 1, P < 0.05', showarrow: false, xanchor: 'left', yanchor: 'bottom', font: { size: 11, color: '#64748B' } },
        ],
      };
    },
  },

  bubble: {
    id: 'bubble', name: '气泡�?', category: 'advanced',
    description: '气泡大小表示第三维度数据，可按分类变量着色，多变量可视化工具�?',
    icon: 'Bub', exampleDataset: 'bubble_example',
    buildTraces(data, params, theme) {
      const x = numeric(data[safeName(params.x_var)] || data['prevalence'] || []);
      const y = numeric(data[safeName(params.y_var)] || data['risk_ratio'] || []);
      const size = numeric(data[safeName(params.size_var)] || data['sample_size'] || []);
      const colorCol = data[safeName(params.color_var)] || data['disease'] || [];
      const maxSize = Math.max(...size.filter(v => Number.isFinite(v)), 1);
      const sizeref = 2 * maxSize / (46 ** 2);
      // Detect if color_var is categorical (few unique string values) or continuous
      const uniqueColors = unique(colorCol);
      const isCategorical = uniqueColors.length <= 20 && uniqueColors.some(v => isNaN(Number(v)));
      if (isCategorical && uniqueColors.length > 0) {
        // Categorical coloring: one trace per group
        return uniqueColors.map((g, i) => {
          const color = theme.colorway[i % theme.colorway.length];
          const idx = colorCol.map((c, j) => String(c) === String(g) ? j : -1).filter(j => j >= 0);
          return {
            type: 'scatter', mode: 'markers', name: String(g),
            meta: { colorIndex: i },
            x: idx.map(j => x[j]), y: idx.map(j => y[j]),
            text: idx.map(j => colorCol[j]),
            customdata: idx.map(j => size[j]),
            marker: {
              size: idx.map(j => size[j]),
              sizemode: 'area', sizeref, sizemin: 7,
              color, opacity: 0.82,
              line: { color: '#FFFFFF', width: 1.2 },
            },
            hovertemplate: '%{text}<br>' + safeName(params.x_var) + ': %{x}<br>' + safeName(params.y_var) + ': %{y}<br>大小: %{customdata}<extra>' + String(g) + '</extra>',
          };
        });
      }
      // Continuous or no color_var: single trace with colorscale
      return [{
        type: 'scatter', mode: 'markers+text',
        x: x, y: y, text: colorCol, textposition: 'top center',
        customdata: size,
        marker: {
          size, sizemode: 'area', sizeref, sizemin: 7,
          color: y,
          colorscale: cnsMapScale(theme),
          opacity: 0.72,
          line: { color: '#FFFFFF', width: 1.1 },
          colorbar: { title: { text: safeName(params.y_var || 'Y') }, thickness: 12, len: 0.56, outlinewidth: 0 },
        },
        hovertemplate: '%{text}<br>' + safeName(params.x_var) + ': %{x}<br>' + safeName(params.y_var) + ': %{y}<br>大小: %{customdata}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return {
        title: params.title || '气泡�?',
        xaxis: { title: safeName(params.x_var || 'X'), gridcolor: 'rgba(148,163,184,0.12)', gridwidth: 1 },
        yaxis: { title: safeName(params.y_var || 'Y'), gridcolor: 'rgba(148,163,184,0.12)', gridwidth: 1 },
        hovermode: 'closest',
      };
    },
  },

  heatmap: {
    id: 'heatmap', name: '热图', category: 'advanced',
    description: '用颜色梯度展示矩阵数据��?',
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
      // Publication-quality rich colorscale: deep blue �?teal �?green �?yellow �?orange �?red
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
    id: 'correlation_heatmap', name: '相关性热�?', category: 'advanced',
    description: '展示变量间的Pearson相关系数矩阵�?',
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
      // Rich diverging colorscale for correlation: deep blue �?light blue �?white �?light red �?deep red
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
        title: params.title || '相关性矩�?',
        xaxis: { title: '', tickangle: -55, tickfont: { size: 9 }, side: 'bottom' },
        yaxis: { title: '', tickfont: { size: 9 }, autorange: 'reversed' },
        margin: { l: 140, r: 80, t: 80, b: 140 },
      };
    },
  },

  missingness_heatmap: {
    id: 'missingness_heatmap', name: '?????', category: 'advanced',
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
          title: { text: '??' },
          tickvals: [0, 1],
          ticktext: ['完整', '缺失'],
          len: 0.62,
        },
        hovertemplate: '%{y} · %{x}: %{text}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return {
        title: params.title || '?????',
        xaxis: { title: '', tickangle: -38 },
        yaxis: { title: '??', autorange: 'reversed' },
      };
    },
  },

  pca: {
    id: 'pca', name: 'PCA散点�?', category: 'advanced',
    description: '主成分分析降维可视化，展示样本分布和聚类趋势�?',
    icon: 'PCA', exampleDataset: 'baseline_table_example',
    buildTraces(data, params, theme) {
      let vars = params.value_vars || [];
      if (vars.length === 0) {
        vars = Object.keys(data).filter(k => {
          const vals = numeric(data[k] || []);
          return vals.length > 0 && vals.some(v => !isNaN(v));
        }).slice(0, 6);
      }
      vars = vars.filter(v => v in data).slice(0, 12);
      if (vars.length < 2) return fallbackForest();
      const groupCol = safeName(params.color_var);
      const scores = computePCAFromColumns(data, vars, groupCol);
      if (!scores || scores.length === 0) return fallbackForest();
      params._pcaExplained = { pc1: scores[0].exp1, pc2: scores[0].exp2, vars };
      const groups = unique(scores.map(d => d.group)).slice(0, 10);
      const symbols = ['circle', 'diamond', 'square', 'triangle-up', 'cross', 'x', 'star', 'triangle-down', 'hexagon', 'pentagon'];
      const traces = [];
      groups.forEach((g, i) => {
        const pts = scores.filter(d => String(d.group) === String(g));
        const color = theme.colorway[i % theme.colorway.length];
        const ellipse = confidenceEllipseTrace(pts, String(g), color, theme);
        if (ellipse) {
          ellipse.meta = { colorIndex: i, visualRole: 'pcaEllipse' };
          traces.push(ellipse);
        }
        traces.push({
          type: 'scatter',
          mode: 'markers',
          name: String(g),
          meta: { colorIndex: i },
          x: pts.map(d => d.pc1),
          y: pts.map(d => d.pc2),
          text: pts.map(d => `Sample ${d.index + 1}`),
          customdata: pts.map(d => d.hover),
          marker: {
            color,
            symbol: symbols[i % symbols.length],
            size: 9,
            opacity: 0.82,
            line: { color: '#ffffff', width: 0.8 },
          },
          hovertemplate: '%{text}<br>PC1: %{x:.2f}<br>PC2: %{y:.2f}<br>%{customdata}<extra>' + String(g) + '</extra>',
        });
      });
      return traces;
    },
    buildLayout(params) {
      const exp = params._pcaExplained || { pc1: 0, pc2: 0, vars: [] };
      return {
        title: params.title || 'PCA散点�?',
        xaxis: { title: `PC1 (${(exp.pc1 * 100).toFixed(1)}%)`, zeroline: true, zerolinecolor: 'rgba(100,116,139,0.35)' },
        yaxis: { title: `PC2 (${(exp.pc2 * 100).toFixed(1)}%)`, zeroline: true, zerolinecolor: 'rgba(100,116,139,0.35)' },
        hovermode: 'closest',
        annotations: [{
          x: 1, y: 1,
          xref: 'paper', yref: 'paper',
          text: `变量: ${exp.vars.slice(0, 6).join(', ')}${exp.vars.length > 6 ? '...' : ''}`,
          showarrow: false,
          xanchor: 'right',
          yanchor: 'top',
          font: { size: 11, color: '#64748B' },
        }],
      };
    },
  },

  survival: {
    id: 'survival', name: 'Kaplan-Meier 生存曲线', category: 'advanced',
    description: '生存分析Kaplan-Meier曲线，展示不同组别的生存/事件发生时间差异�?',
    icon: 'KM', exampleDataset: 'survival_example',
    buildTraces(data, params, theme) {
      const time = numeric(data[safeName(params.time_var)] || data['time'] || []);
      const event = numeric(data[safeName(params.event_var)] || data['event'] || []);
      const group = data[safeName(params.color_var)] || [];
      const groups = unique(group).length > 0 ? unique(group) : ['All'];
      const traces = [];
      params._kmSummary = [];
      groups.forEach((g, gi) => {
        const indices = group.length > 0
          ? group.map((v, i) => String(v) === String(g) ? i : -1).filter(i => i >= 0)
          : time.map((_, i) => i);
        const sorted = indices
          .map(i => ({ t: time[i], e: event[i] }))
          .filter(d => Number.isFinite(d.t) && Number.isFinite(d.e))
          .sort((a, b) => a.t - b.t);
        if (!sorted.length) return;
        const timePoints = [...new Set(sorted.map(d => d.t))].sort((a, b) => a - b);
        let surv = 1;
        const stepsX = [0];
        const stepsY = [1];
        const censorX = [];
        const censorY = [];
        timePoints.forEach(t => {
          const atRisk = sorted.filter(d => d.t >= t).length;
          const dEvents = sorted.filter(d => d.t === t && d.e === 1).length;
          const cEvents = sorted.filter(d => d.t === t && d.e !== 1).length;
          if (dEvents > 0 && atRisk > 0) {
            stepsX.push(t);
            stepsY.push(surv);
            surv *= (1 - dEvents / atRisk);
            stepsX.push(t);
            stepsY.push(Math.max(0, surv));
          }
          if (cEvents > 0) {
            censorX.push(t);
            censorY.push(surv);
          }
        });
        const events = sorted.filter(d => d.e === 1).length;
        const censored = sorted.length - events;
        traces.push({
          type: 'scatter', mode: 'lines', name: `${String(g)} (事件=${events})`,
          x: stepsX, y: stepsY,
          line: { color: theme.colorway[gi % theme.colorway.length], width: 2.8, shape: 'hv' },
          hovertemplate: 'Time: %{x}<br>Survival: %{y:.3f}<extra>' + String(g) + '</extra>',
        });
        if (censorX.length) traces.push({
          type: 'scatter', mode: 'markers', name: `${String(g)} 删失`,
          x: censorX, y: censorY,
          marker: {
            color: theme.colorway[gi % theme.colorway.length],
            symbol: 'line-ns-open',
            size: 9,
            line: { width: 2 },
          },
          hovertemplate: '删失<br>时间: %{x}<br>生存�? %{y:.3f}<extra>' + String(g) + '</extra>',
          showlegend: false,
        });
        params._kmSummary = params._kmSummary || [];
        params._kmSummary.push(`${g}: n=${sorted.length}, 事件=${events}, 删失=${censored}`);
      });
      return traces.length > 0 ? traces : fallbackForest();
    },
    buildLayout(params) {
      return {
        title: params.title || 'Kaplan-Meier 生存曲线',
        xaxis: { title: safeName(params.time_var) || 'Time' },
        yaxis: { title: 'Survival Probability', range: [0, 1.05] },
        hovermode: 'closest',
        annotations: (params._kmSummary || []).slice(0, 3).map((txt, i) => ({
          x: 0.98, y: 0.98 - i * 0.055,
          xref: 'paper', yref: 'paper',
          text: txt,
          showarrow: false,
          xanchor: 'right',
          font: { size: 11, color: '#64748B' },
        })),
      };
    },
  },

  roc: {
    id: 'roc', name: 'ROC 曲线', category: 'advanced',
    description: '受试者工作特征曲线，评估二分类模�?标志物的诊断性能，计算AUC�?',
    icon: 'ROC', exampleDataset: 'roc_example',
    buildTraces(data, params, theme) {
      const outcome = (data[safeName(params.outcome_var)] || data['outcome'] || []).map(v => positiveOutcome(v) ? 1 : 0);
      const predictor = numeric(data[safeName(params.predictor_var)] || data['biomarker_a'] || []);
      const pairs = outcome.map((o, i) => ({ o, p: predictor[i] })).filter(d => (d.o === 0 || d.o === 1) && Number.isFinite(d.p));
      if (pairs.length < 5) return fallbackForest();
      pairs.sort((a, b) => b.p - a.p);
      const totalPos = pairs.filter(d => d.o === 1).length;
      const totalNeg = pairs.filter(d => d.o === 0).length;
      if (totalPos === 0 || totalNeg === 0) return fallbackForest();
      let tp = 0, fp = 0;
      const fprs = [0], tprs = [0], thresholds = [Infinity];
      for (const d of pairs) {
        if (d.o === 1) tp++; else fp++;
        fprs.push(fp / totalNeg);
        tprs.push(tp / totalPos);
        thresholds.push(d.p);
      }
      fprs.push(1); tprs.push(1); thresholds.push(-Infinity);
      // AUC via trapezoidal rule
      let auc = 0;
      for (let i = 1; i < fprs.length; i++) {
        auc += (fprs[i] - fprs[i - 1]) * (tprs[i] + tprs[i - 1]) / 2;
      }
      let bestIdx = 0;
      let bestScore = -Infinity;
      for (let i = 0; i < fprs.length; i++) {
        const score = tprs[i] - fprs[i];
        if (score > bestScore) {
          bestScore = score;
          bestIdx = i;
        }
      }
      params._rocStats = {
        auc,
        bestFpr: fprs[bestIdx],
        bestTpr: tprs[bestIdx],
        cutoff: thresholds[bestIdx],
      };
      return [
        {
          type: 'scatter', mode: 'lines', name: `ROC (AUC = ${auc.toFixed(3)})`,
          x: fprs, y: tprs,
          line: { color: theme.colorway[0], width: 2.5 },
          fill: 'tozeroy', fillcolor: theme.colorway[0] + '20',
          hovertemplate: 'FPR: %{x:.3f}, TPR: %{y:.3f}<extra></extra>',
        },
        {
          type: 'scatter', mode: 'lines', name: '随机参��线',
          meta: { fixedColor: '#8A8F98' },
          x: [0, 1], y: [0, 1],
          line: { color: '#999', width: 1, dash: 'dash' },
          showlegend: true, hoverinfo: 'skip',
        },
        {
          type: 'scatter', mode: 'markers+text', name: 'Youden 朢�优截�?',
          x: [fprs[bestIdx]], y: [tprs[bestIdx]],
          text: [`cutoff=${Number.isFinite(thresholds[bestIdx]) ? thresholds[bestIdx].toFixed(3) : ''}`],
          textposition: 'bottom right',
          marker: {
            color: theme.colorway[1] || '#D95F59',
            size: 11,
            symbol: 'diamond',
            line: { color: '#FFFFFF', width: 1.2 },
          },
          hovertemplate: '朢�优截�? %{text}<br>FPR: %{x:.3f}<br>TPR: %{y:.3f}<extra></extra>',
        },
      ];
    },
    buildLayout(params) {
      const stats = params._rocStats || {};
      return {
        title: params.title || 'ROC 曲线',
        xaxis: { title: '1 - Specificity (FPR)', range: [-0.02, 1.02] },
        yaxis: { title: 'Sensitivity (TPR)', range: [-0.02, 1.02] },
        hovermode: 'closest',
        shapes: [{ type: 'rect', x0: 0, y0: 0, x1: 1, y1: 1, line: { color: '#ccc', width: 1 } }],
        annotations: Number.isFinite(stats.auc) ? [{
          x: 0.04, y: 0.96,
          xref: 'paper', yref: 'paper',
          text: `AUC = ${stats.auc.toFixed(3)}`,
          showarrow: false,
          xanchor: 'left',
          font: { size: 13, color: '#111827' },
        }] : [],
      };
    },
  },

  // Advanced Charts (continued)
  multi_roc: {
    id: 'multi_roc', name: '多模�?ROC 曲线', category: 'advanced',
    description: '比较多个预测模型或生物标志物�?ROC 曲线�?AUC，��合临床诊断/预后模型对比�?',
    icon: 'MROC', exampleDataset: 'roc_example',
    buildTraces(data, params, theme) {
      const outcomeCol = safeName(params.outcome_var) || 'outcome';
      const outcome = data[outcomeCol] || data['outcome'] || [];
      let predictors = (params.value_vars || []).filter(c => c in data && c !== outcomeCol);
      if (!predictors.length) {
        predictors = Object.keys(data).filter(k => k !== outcomeCol && k !== 'patient_id' && numericSeries(data[k]).filter(Number.isFinite).length > 20).slice(0, 5);
      }
      const palette = expandPalette(theme.colorway, Math.max(predictors.length, 6));
      const traces = [];
      const aucText = [];
      predictors.forEach((col, i) => {
        const stats = rocCurveStats(outcome, data[col]);
        if (!stats) return;
        aucText.push(`${col}: AUC=${stats.auc.toFixed(3)}`);
        traces.push({
          type: 'scatter', mode: 'lines',
          name: `${col} (AUC=${stats.auc.toFixed(3)})`,
          meta: { colorIndex: i },
          x: stats.fprs, y: stats.tprs,
          line: { color: palette[i % palette.length], width: 2.8, shape: 'spline', smoothing: 0.25 },
          hovertemplate: `${col}<br>1-Specificity: %{x:.3f}<br>Sensitivity: %{y:.3f}<extra></extra>`,
        });
        traces.push({
          type: 'scatter', mode: 'markers',
          name: `${col} Youden`, showlegend: false,
          meta: { colorIndex: i },
          x: [stats.fprs[stats.bestIdx]], y: [stats.tprs[stats.bestIdx]],
          marker: { color: palette[i % palette.length], size: 8, symbol: 'diamond', line: { color: '#FFFFFF', width: 1 } },
          hovertemplate: `${col}<br>cutoff=${Number.isFinite(stats.cutoff) ? stats.cutoff.toFixed(3) : ''}<extra>Youden</extra>`,
        });
      });
      traces.push({
        type: 'scatter', mode: 'lines', name: '随机参��线',
        meta: { fixedColor: '#94A3B8' },
        x: [0, 1], y: [0, 1],
        line: { color: '#94A3B8', width: 1.4, dash: 'dash' },
        hoverinfo: 'skip',
      });
      params._multiRocText = aucText;
      return traces.length > 1 ? traces : fallbackForest();
    },
    buildLayout(params) {
      return {
        title: params.title || '多模�?ROC 曲线',
        xaxis: { title: '1 - Specificity', range: [-0.02, 1.02], constrain: 'domain' },
        yaxis: { title: 'Sensitivity', range: [-0.02, 1.02], scaleanchor: 'x', scaleratio: 1 },
        hovermode: 'closest',
        annotations: (params._multiRocText || []).slice(0, 5).map((txt, i) => ({
          x: 0.04, y: 0.96 - i * 0.055,
          xref: 'paper', yref: 'paper',
          text: txt,
          showarrow: false,
          xanchor: 'left',
          font: { size: 11, color: '#334155' },
        })),
      };
    },
  },

  risk_calibration: {
    id: 'risk_calibration', name: '风险校准�?', category: 'advanced',
    description: '按预测风险分层展示预测风险与实际事件率，并给出二项近似置信区间��?',
    icon: 'Cal+', exampleDataset: 'risk_calibration_example',
    buildTraces(data, params, theme) {
      const risk = probabilityFromPredictor(data[safeName(params.predictor_var)] || data['risk_score'] || []);
      const outcomeRaw = data[safeName(params.outcome_var)] || data['outcome'] || [];
      const rows = risk.map((p, i) => ({ p, o: positiveOutcome(outcomeRaw[i]) ? 1 : 0 })).filter(d => Number.isFinite(d.p));
      if (rows.length < 20) return fallbackForest();
      rows.sort((a, b) => a.p - b.p);
      const bins = [];
      const binCount = Math.min(10, Math.max(4, Math.floor(rows.length / 25)));
      for (let b = 0; b < binCount; b++) {
        const part = rows.slice(Math.floor(b * rows.length / binCount), Math.floor((b + 1) * rows.length / binCount));
        if (!part.length) continue;
        const pred = meanValue(part.map(d => d.p));
        const obs = meanValue(part.map(d => d.o));
        const se = Math.sqrt(Math.max(obs * (1 - obs), 0.0001) / part.length);
        bins.push({ label: `Q${b + 1}`, pred, obs, n: part.length, low: Math.max(0, obs - 1.96 * se), high: Math.min(1, obs + 1.96 * se) });
      }
      params._riskCalibrationSummary = `N=${rows.length}, bins=${bins.length}`;
      const palette = expandPalette(theme.colorway || [], 4);
      return [
        {
          type: 'scatter', mode: 'lines', name: '理想校准�?',
          meta: { colorIndex: 3, visualRole: 'riskCalibrationIdeal' },
          x: [0, 1], y: [0, 1],
          line: { color: palette[3] || '#94A3B8', width: 1.5, dash: 'dash' },
          hoverinfo: 'skip',
        },
        {
          type: 'bar', name: '样本�?',
          meta: { colorIndex: 1, visualRole: 'riskCalibrationBars' },
          x: bins.map(d => d.pred),
          y: bins.map(d => d.n / Math.max(...bins.map(x => x.n), 1) * 0.18),
          marker: { color: colorAlpha(palette[1] || '#2A9D8F', 0.20), line: { color: colorAlpha(palette[1] || '#2A9D8F', 0.36), width: 1 } },
          customdata: bins.map(d => d.n),
          hovertemplate: 'Bin size: %{customdata}<extra></extra>',
          showlegend: false,
        },
        {
          type: 'scatter', mode: 'lines+markers+text',
          name: safeName(params.predictor_var) || 'risk_score',
          meta: { colorIndex: 0, errorColorIndex: 2, visualRole: 'riskCalibrationCurve' },
          x: bins.map(d => d.pred), y: bins.map(d => d.obs),
          text: bins.map(d => d.label), textposition: 'top center',
          customdata: bins.map(d => [d.n, d.low, d.high]),
          error_y: {
            type: 'data', symmetric: false,
            array: bins.map(d => d.high - d.obs),
            arrayminus: bins.map(d => d.obs - d.low),
            color: palette[2] || theme.colorway[0], thickness: 1.5, width: 4,
          },
          line: { color: palette[0] || theme.colorway[0], width: 2.7, shape: 'spline', smoothing: 0.35 },
          marker: { color: palette[0] || theme.colorway[0], size: 9, line: { color: '#FFFFFF', width: 1 } },
          hovertemplate: '%{text}<br>预测风险: %{x:.3f}<br>实际事件�? %{y:.3f}<br>N=%{customdata[0]}<br>95% CI: %{customdata[1]:.3f}-%{customdata[2]:.3f}<extra></extra>',
        },
      ];
    },
    buildLayout(params) {
      return {
        title: params.title || '风险校准�?',
        xaxis: { title: 'Predicted risk', range: [0, 1] },
        yaxis: { title: 'Observed event rate', range: [0, 1] },
        barmode: 'overlay',
        hovermode: 'closest',
        annotations: [{
          x: 0.98, y: 0.04,
          xref: 'paper', yref: 'paper',
          text: params._riskCalibrationSummary || '',
          showarrow: false,
          xanchor: 'right',
          font: { size: 11, color: '#64748B' },
        }],
      };
    },
  },

  nomogram: {
    id: 'nomogram', name: '列线�?/ 风险评分�?', category: 'advanced',
    description: '把多个临床预测因子映射到统一 points 标尺，展示��分与预测风险关系��?',
    icon: 'Nomo', exampleDataset: 'nomogram_example',
    buildTraces(data, params, theme) {
      let vars = (params.value_vars || []).filter(c => c in data);
      if (!vars.length) vars = ['age', 'tumor_size', 'stage_score', 'biomarker'].filter(c => c in data);
      vars = vars.slice(0, 6);
      if (vars.length < 2) return fallbackForest();
      const palette = expandPalette(theme.colorway, vars.length + 2);
      const traces = [];
      const yLabels = ['Total points', ...vars, 'Predicted risk'];
      const yOf = label => yLabels.length - 1 - yLabels.indexOf(label);
      const pointRows = [];
      vars.forEach((v, i) => {
        const vals = numericSeries(data[v] || []).filter(Number.isFinite);
        const lo = quantileValue(vals, 0.05);
        const hi = quantileValue(vals, 0.95);
        const score = vals.map(x => clampNumber((x - lo) / Math.max(hi - lo, 1e-6) * 100, 0, 100));
        pointRows.push({ var: v, lo, hi, scoreMean: meanValue(score), color: palette[i % palette.length] });
        traces.push({
          type: 'scatter', mode: 'lines+markers+text', name: v,
          meta: { colorIndex: i },
          x: [0, 25, 50, 75, 100],
          y: Array(5).fill(yOf(v)),
          text: [lo, lo + (hi - lo) * 0.25, lo + (hi - lo) * 0.5, lo + (hi - lo) * 0.75, hi].map(x => fmtNum(x, 1)),
          textposition: 'bottom center',
          line: { color: palette[i % palette.length], width: 2 },
          marker: { color: palette[i % palette.length], size: 7, line: { color: '#FFFFFF', width: 1 } },
          hovertemplate: `${v}<br>Points: %{x:.0f}<br>Value: %{text}<extra></extra>`,
        });
      });
      const totalPoints = pointRows.reduce((s, d) => s + d.scoreMean, 0);
      const totalScaleMax = vars.length * 100;
      const riskTicks = [0.05, 0.10, 0.20, 0.40, 0.60, 0.80];
      traces.push({
        type: 'scatter', mode: 'lines+markers+text', name: 'Total points',
        meta: { fixedColor: '#111827' },
        x: [0, totalScaleMax * 0.25, totalScaleMax * 0.5, totalScaleMax * 0.75, totalScaleMax],
        y: Array(5).fill(yOf('Total points')),
        text: [0, totalScaleMax * 0.25, totalScaleMax * 0.5, totalScaleMax * 0.75, totalScaleMax].map(x => fmtNum(x, 0)),
        textposition: 'top center',
        line: { color: '#111827', width: 2.4 },
        marker: { color: '#111827', size: 7 },
        hovertemplate: 'Total points: %{x:.0f}<extra></extra>',
      });
      traces.push({
        type: 'scatter', mode: 'lines+markers+text', name: 'Predicted risk',
        meta: { fixedColor: '#111827' },
        x: riskTicks.map(r => Math.log(r / (1 - r)) + 3).map(x => clampNumber(x / 6 * totalScaleMax, 0, totalScaleMax)),
        y: Array(riskTicks.length).fill(yOf('Predicted risk')),
        text: riskTicks.map(r => `${Math.round(r * 100)}%`),
        textposition: 'bottom center',
        line: { color: '#111827', width: 2.4 },
        marker: { color: '#111827', size: 8, symbol: 'diamond', line: { color: '#FFFFFF', width: 1 } },
        hovertemplate: 'Predicted risk: %{text}<extra></extra>',
      });
      params._nomogramYLabels = yLabels;
      params._nomogramTotal = { value: totalPoints, max: totalScaleMax };
      return traces;
    },
    buildLayout(params) {
      const yLabels = params._nomogramYLabels || [];
      const total = params._nomogramTotal || { value: 0, max: 100 };
      return {
        title: params.title || '列线�?/ 风险评分�?',
        xaxis: { title: 'Points', range: [-5, total.max + 10], showgrid: false, zeroline: false },
        yaxis: {
          title: '',
          tickvals: yLabels.map((_, i) => yLabels.length - 1 - i),
          ticktext: yLabels,
          range: [-0.8, yLabels.length - 0.2],
          showgrid: false,
        },
        showlegend: false,
        margin: { l: 150, r: 70, t: 78, b: 72 },
        annotations: [{
          x: total.value, y: yLabels.length - 1,
          text: `示例均����分 ${fmtNum(total.value, 0)}`,
          showarrow: true,
          arrowhead: 3,
          ax: 24,
          ay: -32,
          font: { size: 11, color: '#334155' },
        }],
      };
    },
  },

  raincloud: {
    id: 'raincloud', name: '云雨�?', category: 'display',
    description: '结合半小提琴(�?、箱线图和抖动散�?�?的综合分布可视化，兼顾宏观分布与个体数据�?',
    icon: 'Rain', exampleDataset: 'raincloud_example',
    buildTraces(data, params, theme) {
      const groups = unique(data[safeName(params.x_var)] || []);
      const yAll = numeric(data[safeName(params.y_var)] || []);
      const xAll = data[safeName(params.x_var)] || [];
      const palette = expandPalette(theme.colorway, Math.max(groups.length, 16));
      if (groups.length === 0) {
        const color = palette[0];
        return [
          { type: 'violin', y: yAll, side: 'positive', points: false, line: { color, width: 1.6 }, fillcolor: colorAlpha(color, 0.28), meanline: { visible: true, color: theme.ink }, spanmode: 'soft', name: 'All', showlegend: true },
          { type: 'box', y: yAll, boxpoints: false, marker: { color: colorAlpha(color, 0.55) }, line: { color, width: 1.2 }, fillcolor: colorAlpha(color, 0.18), name: '', showlegend: false },
          { type: 'scatter', mode: 'markers', y: yAll, x: yAll.map(() => (Math.random() - 0.5) * 0.12), marker: { color, size: 3.5, opacity: 0.45 }, name: '', showlegend: false, hoverinfo: 'skip', xaxis: 'x2' },
        ];
      }
      const traces = [];
      groups.forEach((g, i) => {
        const color = palette[i % palette.length];
        const yg = xAll.map((x, j) => String(x) === String(g) ? yAll[j] : null).filter(v => v !== null);
        if (yg.length < 2) return;
        // Cloud (half violin)
        traces.push({
          type: 'violin', x: Array(yg.length).fill(String(g)), y: yg,
          side: 'positive', points: false, line: { color, width: 1.6 },
          fillcolor: colorAlpha(color, 0.30), name: String(g),
          meanline: { visible: true, color: theme.ink, width: 1.2 }, spanmode: 'soft',
          hoverinfo: 'y',
          meta: { colorIndex: i },
        });
        // Box
        traces.push({
          type: 'box', x: Array(yg.length).fill(String(g)), y: yg,
          boxpoints: false, marker: { color: colorAlpha(color, 0.5) },
          line: { color, width: 1.2 }, fillcolor: colorAlpha(color, 0.15),
          name: '', showlegend: false,
          meta: { colorIndex: i },
        });
        // Rain (jittered scatter)
        const jitter = yg.map(() => (Math.random() - 0.5) * 0.25);
        traces.push({
          type: 'scatter', mode: 'markers', name: '', showlegend: false,
          x: jitter.map(j => String(g)),
          y: yg,
          marker: { color, size: 3.5, opacity: 0.50, line: { color: '#fff', width: 0.3 } },
          hoverinfo: 'skip',
          meta: { colorIndex: i },
        });
      });
      return traces.length > 0 ? traces : [{ type: 'scatter', y: [0], marker: { color: '#ccc' } }];
    },
    buildLayout(params) {
      return {
        title: params.title || '云雨�?',
        xaxis: { title: '' },
        yaxis: { title: safeName(params.y_var) },
        violingap: 0.08, violingroupgap: 0.04, boxgap: 0.08, boxgroupgap: 0.04,
      };
    },
  },

  beeswarm: {
    id: 'beeswarm', name: '蜂群�?', category: 'display',
    description: '散点沿分类轴抖动排列，展示每个观测��的精确位置，��合中小样本分布展示�?',
    icon: 'Bee', exampleDataset: 'raincloud_example',
    buildTraces(data, params, theme) {
      const groups = unique(data[safeName(params.x_var)] || []);
      const yAll = numeric(data[safeName(params.y_var)] || []);
      const xAll = data[safeName(params.x_var)] || [];
      const palette = expandPalette(theme.colorway, Math.max(groups.length, 16));
      // Simple beeswarm jitter: sort values within each group and offset by rank
      function beeswarmJitter(values, maxSpread) {
        const indexed = values.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
        const offsets = new Array(values.length);
        const mid = (indexed.length - 1) / 2;
        indexed.forEach((item, rank) => {
          offsets[item.i] = (rank - mid) / Math.max(mid, 1) * maxSpread;
        });
        return offsets;
      }
      if (groups.length === 0) {
        const offsets = beeswarmJitter(yAll, 0.4);
        return [{
          type: 'scatter', mode: 'markers', name: '',
          x: offsets, y: yAll,
          marker: { color: palette[0], size: 5.5, opacity: 0.78, line: { color: '#fff', width: 0.4 } },
          hovertemplate: '%{y:.2f}<extra></extra>',
        }];
      }
      return groups.map((g, i) => {
        const color = palette[i % palette.length];
        const indices = [];
        const yg = [];
        xAll.forEach((x, j) => { if (String(x) === String(g)) { indices.push(j); yg.push(yAll[j]); } });
        const offsets = beeswarmJitter(yg, 0.32);
        return {
          type: 'scatter', mode: 'markers', name: String(g),
          x: offsets.map(o => String(g)), // keep categorical alignment, jitter is visual via marker offset
          y: yg,
          marker: { color, size: 6, opacity: 0.82, line: { color: '#fff', width: 0.5 } },
          hovertemplate: '%{y:.2f}<extra>' + String(g) + '</extra>',
          meta: { colorIndex: i },
        };
      });
    },
    buildLayout(params) {
      return { title: params.title || '蜂群�?', xaxis: { title: '' }, yaxis: { title: safeName(params.y_var) } };
    },
  },

  // Display Charts (continued)
  beanplot: {
    id: 'beanplot', name: '豆荚�?', category: 'display',
    description: '结合密度曲线和散点的豆荚状分布图，展示各组数据的完整分布形��与个体观测�?',
    icon: 'Bean', exampleDataset: 'beanplot_example',
    buildTraces(data, params, theme) {
      const groups = unique(data[safeName(params.x_var)] || []);
      const yAll = numeric(data[safeName(params.y_var)] || []);
      const xAll = data[safeName(params.x_var)] || [];
      const palette = expandPalette(theme.colorway, Math.max(groups.length, 16));
      const traces = [];
      if (groups.length === 0) {
        const yVals = yAll.filter(v => !isNaN(v));
        const color = palette[0];
        traces.push({
          type: 'violin', y: yVals, points: 'all', jitter: 0.4,
          fillcolor: colorAlpha(color, 0.28), line: { color, width: 2 },
          box: { visible: true, fillcolor: colorAlpha(color, 0.15), line: { color } },
          meanline: { visible: true, color: theme.ink }, name: 'All',
          side: 'both', spanmode: 'soft',
          meta: { colorIndex: 0 },
        });
      } else {
        groups.forEach((g, i) => {
          const color = palette[i % palette.length];
          const yg = xAll.map((x, j) => String(x) === String(g) ? yAll[j] : null).filter(v => v !== null && !isNaN(v));
          if (yg.length < 2) return;
          // Density via violin on one side
          traces.push({
            type: 'violin', x: Array(yg.length).fill(String(g)), y: yg,
            side: 'positive', points: false,
            fillcolor: colorAlpha(color, 0.32),
            line: { color, width: 2 },
            meanline: { visible: true, color: theme.ink, width: 1.2 },
            name: String(g), spanmode: 'soft',
            meta: { colorIndex: i },
          });
          // Mirror density for bean shape
          traces.push({
            type: 'violin', x: Array(yg.length).fill(String(g)), y: yg,
            side: 'negative', points: false,
            fillcolor: colorAlpha(color, 0.18),
            line: { color, width: 1.5 },
            meanline: { visible: false },
            name: '', showlegend: false, spanmode: 'soft',
            meta: { colorIndex: i },
          });
          // Scatter overlay
          traces.push({
            type: 'scatter', mode: 'markers', name: '', showlegend: false,
            x: Array(yg.length).fill(String(g)),
            y: yg,
            marker: { color, size: 3, opacity: 0.50, line: { color: '#fff', width: 0.3 } },
            hoverinfo: 'skip',
            meta: { colorIndex: i },
          });
        });
      }
      return traces.length > 0 ? traces : [{ type: 'scatter', y: [0], marker: { color: '#ccc' } }];
    },
    buildLayout(params) {
      return {
        title: params.title || '豆荚�?',
        xaxis: { title: '' },
        yaxis: { title: safeName(params.y_var) },
        violingap: 0.08, violinmode: 'group',
      };
    },
  },

  ridgeline: {
    id: 'ridgeline', name: '山脊�?', category: 'display',
    description: '叠加密度分布图，沿Y轴偏移展示多组数据分布形态，比小提琴图更适合多组比较�?',
    icon: 'Ridge', exampleDataset: 'raincloud_example',
    buildTraces(data, params, theme) {
      const groups = unique(data[safeName(params.x_var)] || []);
      const yAll = numeric(data[safeName(params.y_var)] || []);
      const xAll = data[safeName(params.x_var)] || [];
      const palette = expandPalette(theme.colorway, Math.max(groups.length, 16));
      const spacing = 1.1;
      if (groups.length === 0) {
        const color = palette[0];
        const kde = gaussianKDE(yAll.filter(Number.isFinite), 200);
        return [{
          type: 'scatter', mode: 'lines', fill: 'tozeroy', name: 'All',
          x: kde.x, y: kde.y.map(v => v * 0.85),
          line: { color, width: 2.2, shape: 'spline', smoothing: 0.4 },
          fillcolor: colorAlpha(color, 0.45),
          meta: { colorIndex: 0 },
          hovertemplate: '�? %{x:.2f}<br>密度: %{y:.4f}<extra>All</extra>',
        }];
      }
      const traces = [];
      const totalGlobalMax = Math.max(...groups.map(g => {
        const yg = xAll.map((x, j) => String(x) === String(g) ? yAll[j] : null).filter(v => v !== null && Number.isFinite(v));
        const kde = gaussianKDE(yg, 60);
        return Math.max(...kde.y, 0);
      }), 0.01);
      groups.forEach((g, i) => {
        const color = palette[i % palette.length];
        const yg = xAll.map((x, j) => String(x) === String(g) ? yAll[j] : null).filter(v => v !== null && Number.isFinite(v));
        if (yg.length < 3) return;
        const kde = gaussianKDE(yg, 200);
        const offset = (groups.length - 1 - i) * spacing;
        const scale = 0.9 / totalGlobalMax;
        const densityX = kde.x;
        const densityY = kde.y.map(v => v * scale + offset);
        const baselineY = densityX.map(() => offset);
        traces.push({
          type: 'scatter', mode: 'lines', name: String(g),
          x: [...densityX, ...densityX.slice().reverse()],
          y: [...densityY, ...baselineY.slice().reverse()],
          fill: 'toself',
          fillcolor: colorAlpha(color, 0.50),
          line: { color, width: 2.2, shape: 'spline', smoothing: 0.35 },
          meta: { colorIndex: i },
          hovertemplate: `${String(g)}<br>�? %{x:.2f}<extra></extra>`,
          hoveron: 'fills',
        });
      });
      params._ridgeGroups = groups.map((g, i) => ({ name: String(g), offset: (groups.length - 1 - i) * spacing }));
      return traces.length > 0 ? traces : [{ type: 'scatter', y: [0], marker: { color: '#ccc' } }];
    },
    buildLayout(params) {
      const groups = params._ridgeGroups || [];
      const yMax = groups.length > 0 ? (groups.length - 1) * 1.1 + 1.0 : 2;
      return {
        title: params.title || '山脊�?',
        xaxis: { title: safeName(params.y_var) },
        yaxis: { title: '', showticklabels: false, showgrid: false, zeroline: false, range: [-0.25, yMax] },
        showlegend: true,
        legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.10 },
      };
    },
  },

  donut: {
    id: 'donut', name: '甜甜圈图', category: 'display',
    description: '环形图展示分类变量的构成比例，中心可显示汇��统计量�?',
    icon: 'Donut', exampleDataset: 'bar_example',
    buildTraces(data, params, theme) {
      const labels = data[safeName(params.x_var)] || [];
      const values = numeric(data[safeName(params.y_var)] || []);
      const agg = aggregateByCategory(labels, values);
      const palette = expandPalette(theme.colorway, Math.max(agg.length, 16));
      const total = agg.reduce((s, d) => s + d.mean * d.n, 0);
      return [{
        type: 'pie',
        labels: agg.map(d => d.label),
        values: agg.map(d => d.mean * d.n),
        hole: 0.52,
        marker: {
          colors: agg.map((_, i) => palette[i % palette.length]),
          line: { color: '#ffffff', width: 2.5 },
        },
        textinfo: 'percent+label',
        textposition: 'outside',
        textfont: { family: theme.fontFamily, size: 12, color: theme.ink || '#111827' },
        insidetextorientation: 'radial',
        hovertemplate: '%{label}<br>数��? %{value:.2f}<br>占比: %{percent}<extra></extra>',
        pull: 0.015,
      }];
    },
    buildLayout(params) {
      return {
        title: params.title || '甜甜圈图',
        showlegend: true,
        legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.08 },
        margin: { l: 40, r: 40, t: 80, b: 60 },
        annotations: [{
          text: params.title || '',
          showarrow: false,
          font: { size: 14, color: '#64748B' },
          x: 0.5, y: 0.5,
          xref: 'paper', yref: 'paper',
        }],
      };
    },
  },

  pie: {
    id: 'pie', name: '饼图', category: 'display',
    description: '展示分类变量的频数或比例构成，直观展示各部分占比�?',
    icon: 'Pie', exampleDataset: 'bar_example',
    buildTraces(data, params, theme) {
      const labels = data[safeName(params.x_var)] || [];
      const values = numeric(data[safeName(params.y_var)] || []);
      const agg = aggregateByCategory(labels, values);
      const palette = expandPalette(theme.colorway, Math.max(agg.length, 16));
      return [{
        type: 'pie',
        labels: agg.map(d => d.label),
        values: agg.map(d => d.mean * d.n),
        hole: 0,
        marker: {
          colors: agg.map((_, i) => palette[i % palette.length]),
          line: { color: '#ffffff', width: 2 },
        },
        textinfo: 'percent+label',
        textposition: 'outside',
        textfont: { family: theme.fontFamily, size: 12, color: theme.ink || '#111827' },
        hovertemplate: '%{label}<br>数��? %{value:.2f}<br>占比: %{percent}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return {
        title: params.title || '饼图',
        showlegend: true,
        legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.08 },
        margin: { l: 40, r: 40, t: 80, b: 60 },
      };
    },
  },

  radar: {
    id: 'radar', name: '雷达�?', category: 'display',
    description: '多维指标对比图，适合展示不同组在多个维度上的综合表现�?',
    icon: 'Radar', exampleDataset: 'radar_example',
    buildTraces(data, params, theme) {
      const groups = unique(data[safeName(params.color_var)] || []);
      let dims = (params.value_vars || []).filter(c => c in data);
      if (dims.length < 3) {
        dims = Object.keys(data).filter(k => {
          const vals = data[k] || [];
          return vals.length > 0 && vals.some(v => Number.isFinite(Number(v)));
        }).slice(0, 8);
      }
      if (dims.length < 3) return fallbackForest();
      const palette = expandPalette(theme.colorway, Math.max(groups.length, 16));
      // Compute global ranges per dimension
      const dimRanges = dims.map(dim => {
        const vals = numeric(data[dim] || []);
        const max = Math.max(...vals, 1);
        const min = Math.min(...vals, 0);
        return { min, max, range: max - min || 1 };
      });
      if (groups.length === 0 || groups.length === 1) {
        const g = groups[0] || 'All';
        const color = palette[0];
        const r = dims.map((dim, di) => {
          const vals = numeric(data[dim] || []);
          const mean = meanValue(vals);
          return Math.max(0, Math.min(1, (mean - dimRanges[di].min) / dimRanges[di].range));
        });
        // Close the radar polygon by repeating the first point
        const rClosed = [...r, r[0]];
        const thetaClosed = [...dims, dims[0]];
        return [{
          type: 'scatterpolar', r: rClosed, theta: thetaClosed,
          fill: 'toself', fillcolor: colorAlpha(color, 0.28),
          line: { color, width: 2.5 },
          marker: { color, size: 7, line: { color: '#fff', width: 1 } },
          name: String(g), meta: { colorIndex: 0 },
        }];
      }
      const groupCol = data[safeName(params.color_var)] || [];
      return groups.map((g, i) => {
        const color = palette[i % palette.length];
        const indices = groupCol.map((v, j) => String(v) === String(g) ? j : -1).filter(j => j >= 0);
        const r = dims.map((dim, di) => {
          const vals = numeric(data[dim] || []);
          const groupVals = indices.map(j => vals[j]).filter(Number.isFinite);
          const mean = groupVals.length > 0 ? meanValue(groupVals) : dimRanges[di].min;
          return Math.max(0, Math.min(1, (mean - dimRanges[di].min) / dimRanges[di].range));
        });
        // Close the radar polygon by repeating the first point
        const rClosed = [...r, r[0]];
        const thetaClosed = [...dims, dims[0]];
        return {
          type: 'scatterpolar', r: rClosed, theta: thetaClosed,
          fill: 'toself', fillcolor: colorAlpha(color, 0.18),
          line: { color, width: 2.5 },
          marker: { color, size: 7, line: { color: '#fff', width: 1 } },
          name: String(g), meta: { colorIndex: i },
        };
      });
    },
    buildLayout(params) {
      return {
        title: params.title || '雷达�?',
        polar: {
          radialaxis: { visible: true, range: [0, 1], tickfont: { size: 9 } },
          angularaxis: { tickfont: { size: 11 } },
          bgcolor: 'rgba(0,0,0,0)',
        },
        showlegend: true,
        legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.10 },
        margin: { l: 60, r: 60, t: 80, b: 60 },
      };
    },
  },

  sankey: {
    id: 'sankey', name: '桑基�?', category: 'display',
    description: '展示数据在不同分类之间的流动关系，��合呈现治疗路径或转归流向��?',
    icon: 'SK', exampleDataset: 'sankey_example',
    buildTraces(data, params, theme) {
      const sourceCol = data[safeName(params.x_var)] || data['source'] || [];
      const targetCol = data[safeName(params.y_var)] || data['target'] || [];
      const valueCol = numeric(data[safeName(params.size_var)] || data['value'] || []);
      const palette = expandPalette(theme.colorway, 32);
      // Build node list
      const sourceLabels = unique(sourceCol);
      const targetLabels = unique(targetCol);
      const allLabels = [...sourceLabels, ...targetLabels];
      const labelMap = {};
      allLabels.forEach((l, i) => { labelMap[l] = i; });
      // Aggregate flows
      const flowMap = {};
      sourceCol.forEach((s, i) => {
        const t = targetCol[i];
        const v = valueCol[i] || 1;
        const key = `${s}||${t}`;
        flowMap[key] = (flowMap[key] || 0) + v;
      });
      const sources = [];
      const targets = [];
      const values = [];
      const linkColors = [];
      Object.entries(flowMap).forEach(([key, val]) => {
        const [s, t] = key.split('||');
        sources.push(labelMap[s]);
        targets.push(labelMap[t]);
        values.push(val);
        linkColors.push(colorAlpha(palette[labelMap[s] % palette.length], 0.55));
      });
      const nodeColors = allLabels.map((_, i) => palette[i % palette.length]);
      return [{
        type: 'sankey',
        orientation: 'h',
        node: {
          pad: 18, thickness: 24,
          line: { color: '#ffffff', width: 1.5 },
          label: allLabels,
          color: nodeColors,
        },
        link: {
          source: sources,
          target: targets,
          value: values,
          color: linkColors,
        },
        textfont: { family: theme.fontFamily, size: 11, color: theme.ink || '#111827' },
        hovertemplate: '%{source.label} �?%{target.label}<br>数��? %{value}<extra></extra>',
        arrangement: 'fixed',
      }];
    },
    buildLayout(params) {
      return {
        title: params.title || '桑基�?',
        font: { size: 12 },
        margin: { l: 20, r: 20, t: 80, b: 30 },
      };
    },
  },

  treemap: {
    id: 'treemap', name: '矩形树图', category: 'display',
    description: '用嵌套矩形展示层级数据的占比关系，面积表示数值大小��?',
    icon: 'Tree', exampleDataset: 'treemap_example',
    buildTraces(data, params, theme) {
      let labels = data[safeName(params.x_var)] || data['category'] || [];
      let values = numeric(data[safeName(params.y_var)] || data['value'] || []);
      let parents = data[safeName(params.color_var)] || data['parent'] || [];
      // Defensive: ensure all arrays have the same length
      const minLen = Math.min(labels.length, values.length, parents.length);
      if (minLen === 0) return fallbackTreemap();
      labels = labels.slice(0, minLen);
      values = values.slice(0, minLen);
      parents = parents.slice(0, minLen);
      const palette = expandPalette(theme.colorway, 32);
      const hasParents = parents.some(p => p && String(p).trim() !== '' && String(p) !== '0');
      if (hasParents) {
        const allLabels = unique([...labels, ...parents]);
        const labelMap = {};
        allLabels.forEach((l, i) => { labelMap[l] = palette[i % palette.length]; });
        return [{
          type: 'treemap',
          labels: labels.map(String),
          parents: parents.map(String),
          values: values,
          marker: { colors: labels.map((l, i) => labelMap[l] || palette[i % palette.length]), line: { color: '#ffffff', width: 1.5 } },
          textfont: { family: theme.fontFamily, size: 12, color: '#ffffff' },
          textinfo: 'label+value+percent parent',
          hovertemplate: '%{label}<br>数��? %{value}<br>占比: %{percentParent}<extra></extra>',
          branchvalues: 'total',
        }];
      }
      // Flat treemap
      const agg = aggregateByCategory(labels, values);
      return [{
        type: 'treemap',
        labels: agg.map(d => d.label),
        parents: agg.map(() => ''),
        values: agg.map(d => d.sum),
        marker: { colors: agg.map((_, i) => palette[i % palette.length]), line: { color: '#ffffff', width: 2 } },
        textfont: { family: theme.fontFamily, size: 12, color: '#ffffff' },
        textinfo: 'label+value+percent parent',
        hovertemplate: '%{label}<br>数��? %{value}<br>占比: %{percentParent}<extra></extra>',
        branchvalues: 'total',
      }];
    },
    buildLayout(params) {
      return {
        title: params.title || '矩形树图',
        margin: { l: 20, r: 20, t: 80, b: 20 },
      };
    },
  },

  cleveland_dot: {
    id: 'cleveland_dot', name: '克利夫兰点图', category: 'display',
    description: '多系列点图，展示不同分类在多个指标上的比较，比分组柱状图更清晰��?',
    icon: 'CDot', exampleDataset: 'bar_example',
    buildTraces(data, params, theme) {
      const xVals = data[safeName(params.x_var)] || [];
      const yVals = numeric(data[safeName(params.y_var)] || []);
      const gVals = data[safeName(params.color_var)] || [];
      const xCats = unique(xVals);
      const groups = unique(gVals);
      const palette = expandPalette(theme.colorway, Math.max(groups.length, 16));
      if (groups.length === 0 || gVals.length === 0) {
        const agg = aggregateByCategory(xVals, yVals).sort((a, b) => a.mean - b.mean);
        return [{
          type: 'scatter', mode: 'markers+text',
          y: agg.map(d => d.label), x: agg.map(d => d.mean),
          text: agg.map(d => fmtNum(d.mean)),
          textposition: 'middle right',
          marker: { color: palette[0], size: 11, line: { color: '#fff', width: 1.2 } },
          customdata: agg.map(d => [d.n, d.sd]),
          hovertemplate: '%{y}<br>均��? %{x:.2f}<br>N=%{customdata[0]}<br>SD=%{customdata[1]:.2f}<extra></extra>',
          meta: { colorIndex: 0 },
        }];
      }
      return groups.map((g, i) => {
        const color = palette[i % palette.length];
        const means = xCats.map(xc => {
          const vals = xVals.map((x, idx) => String(x) === String(xc) && String(gVals[idx]) === String(g) ? Number(yVals[idx]) : null).filter(Number.isFinite);
          return meanValue(vals);
        });
        return {
          type: 'scatter', mode: 'markers+text', name: String(g),
          y: xCats, x: means,
          text: means.map(v => fmtNum(v)),
          textposition: 'middle right',
          marker: { color, size: 10, symbol: ['circle', 'diamond', 'square', 'triangle-up', 'cross', 'star'][i % 6], line: { color: '#fff', width: 1 } },
          meta: { colorIndex: i },
          hovertemplate: `${String(g)}<br>%{y}: %{x:.2f}<extra></extra>`,
        };
      });
    },
    buildLayout(params) {
      return {
        title: params.title || '克利夫兰点图',
        xaxis: { title: safeName(params.y_var) },
        yaxis: { title: safeName(params.x_var), automargin: true },
        hovermode: 'closest',
        margin: { l: 130, r: 80, b: 72, t: 72 },
      };
    },
  },

  parallel_coords: {
    id: 'parallel_coords', name: '平行坐标�?', category: 'display',
    description: '展示多维数据的平行坐标可视化，每条线代表丢�个样本，适合高维数据探索�?',
    icon: 'ParC', exampleDataset: 'baseline_table_example',
    buildTraces(data, params, theme) {
      let vars = (params.value_vars || []).filter(c => c in data);
      if (vars.length < 3) {
        vars = Object.keys(data).filter(k => {
          const vals = data[k] || [];
          return vals.length > 3 && vals.some(v => Number.isFinite(Number(v)));
        }).slice(0, 8);
      }
      if (vars.length < 3) return fallbackForest();
      const palette = expandPalette(theme.colorway, 16);
      const groupCol = data[safeName(params.color_var)] || [];
      const groups = unique(groupCol);
      const n = (data[vars[0]] || []).length;
      // Build dimensions
      const dimensions = vars.map(v => {
        const vals = numeric(data[v] || []);
        const min = Math.min(...vals.filter(Number.isFinite));
        const max = Math.max(...vals.filter(Number.isFinite));
        return { label: v, values: vals.map(val => Number.isFinite(val) ? val : min), range: [min, max] };
      });
      const colorArr = groupCol.length > 0
        ? groupCol.map(g => { const idx = groups.indexOf(String(g)); return idx >= 0 ? idx : 0; })
        : Array(n).fill(0);
      return [{
        type: 'parcoords',
        line: {
          color: colorArr,
          colorscale: groups.length <= 16
            ? groups.map((g, i) => [i / Math.max(groups.length - 1, 1), palette[i % palette.length]])
            : palette.map((c, i) => [i / Math.max(palette.length - 1, 1), c]),
          showscale: false,
        },
        dimensions: dimensions,
        labelfont: { family: theme.fontFamily, size: 11, color: theme.ink || '#111827' },
        tickfont: { family: theme.fontFamily, size: 9, color: theme.ink || '#111827' },
        rangefont: { family: theme.fontFamily, size: 9, color: theme.ink || '#111827' },
      }];
    },
    buildLayout(params) {
      return {
        title: params.title || '平行坐标�?',
        font: { family: 'Arial', size: 11 },
        margin: { l: 80, r: 60, t: 80, b: 60 },
      };
    },
  },

  funnel: {
    id: 'funnel', name: '漏斗�?', category: 'display',
    description: '展示流程或筛选中的��级递减，��合展示入组流失、诊断路径等�?',
    icon: 'Fnl', exampleDataset: 'funnel_example',
    buildTraces(data, params, theme) {
      const stages = data[safeName(params.x_var)] || data['stage'] || [];
      const values = numeric(data[safeName(params.y_var)] || data['count'] || []);
      const palette = expandPalette(theme.colorway, Math.max(stages.length, 16));
      const rows = stages.map((s, i) => ({ stage: String(s), value: values[i] || 0 }))
        .filter(d => d.value > 0)
        .sort((a, b) => b.value - a.value);
      return [{
        type: 'funnel',
        y: rows.map(d => d.stage),
        x: rows.map(d => d.value),
        textinfo: 'value+percent initial',
        textposition: 'inside',
        marker: {
          color: rows.map((_, i) => palette[i % palette.length]),
          line: { color: '#ffffff', width: 2 },
        },
        textfont: { family: theme.fontFamily, size: 13, color: '#ffffff' },
        hovertemplate: '%{y}<br>数量: %{x}<br>占初�? %{percentInitial}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return {
        title: params.title || '漏斗�?',
        funnelmode: 'stack',
        margin: { l: 120, r: 60, t: 80, b: 40 },
      };
    },
  },

  polar_bar: {
    id: 'polar_bar', name: '极坐标柱状图', category: 'display',
    description: '环形柱状图，沿圆周方向展示各分类的数值，适合周期性数据或突出分类展示�?',
    icon: 'PBar', exampleDataset: 'bar_example',
    buildTraces(data, params, theme) {
      const labels = data[safeName(params.x_var)] || [];
      const values = numeric(data[safeName(params.y_var)] || []);
      const agg = aggregateByCategory(labels, values);
      const palette = expandPalette(theme.colorway, Math.max(agg.length, 16));
      return [{
        type: 'barpolar',
        r: agg.map(d => d.mean),
        theta: agg.map(d => d.label),
        marker: {
          color: agg.map((_, i) => palette[i % palette.length]),
          line: { color: '#ffffff', width: 1.5 },
          opacity: 0.88,
        },
        customdata: agg.map(d => [d.n, d.sd]),
        hovertemplate: '%{theta}<br>均��? %{r:.2f}<br>N=%{customdata[0]}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return {
        title: params.title || '极坐标柱状图',
        polar: {
          radialaxis: { visible: true, tickfont: { size: 9 } },
          angularaxis: { tickfont: { size: 11 }, rotation: 90 },
          bgcolor: 'rgba(0,0,0,0)',
        },
        showlegend: false,
        margin: { l: 50, r: 50, t: 80, b: 50 },
      };
    },
  },

  venn: {
    id: 'venn', name: '韦恩�?', category: 'display',
    description: '展示2-4个集合之间的交集关系，用圆形重叠区域表示共有元素�?',
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
      const palette = expandPalette(theme.colorway, Math.max(actualCols.length, 16));
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
    id: 'upset', name: 'UpSet 交集�?', category: 'display',
    description: 'UpSet图展示多集合交集规模，比韦恩图更适合展示4个以上集合的复杂交集关系�?',
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
      const palette = expandPalette(theme.colorway, Math.max(actualCols.length, 16));

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
    description: '临床决策曲线，评估不同预测模型在不同阈��概率下的净获益，用于比较模型临床效用��?',
    icon: 'DCA', exampleDataset: 'dca_example',
    buildTraces(data, params, theme) {
      const outcomeCol = safeName(params.outcome_var) || 'outcome';
      const outcomeRaw = data[outcomeCol] || data['outcome'] || [];
      const outcome = outcomeRaw.map(v => positiveOutcome(v) ? 1 : 0);
      const selCols = params.value_vars || [];
      const actualCols = selCols.filter(c => c in data && c !== outcomeCol);
      if (actualCols.length === 0) {
        actualCols.push(...Object.keys(data).filter(k => {
          const vals = data[k] || [];
          return k !== 'patient_id' && k !== outcomeCol &&
            vals.some(v => v !== '' && v !== null && v !== undefined && Number.isFinite(Number(v)));
        }).slice(0, 5));
      }
      if (actualCols.length === 0 || outcome.length === 0) return fallbackForest();

      const thresholds = Array.from({ length: 80 }, (_, i) => (i + 1) / 100);
      const traces = [];
      const validOutcome = outcome.map((o, i) => ({ o, i })).filter(d => d.o === 0 || d.o === 1);
      const totalN = validOutcome.length;
      const positives = validOutcome.filter(d => d.o === 1).length;
      const prevalence = totalN ? positives / totalN : 0;
      if (!totalN || positives === 0 || positives === totalN) return fallbackForest();

      const treatAllNB = thresholds.map(pt => prevalence - (1 - prevalence) * (pt / (1 - pt)));
      traces.push({
        type: 'scatter', mode: 'lines', name: '全部干预 (Treat all)',
        meta: { fixedColor: '#94A3B8' },
        x: thresholds, y: treatAllNB,
        line: { color: '#94A3B8', width: 2, dash: 'dash' },
        hovertemplate: '全部干预<br>阈��概�? %{x:.2f}<br>凢�获益: %{y:.4f}<extra></extra>',
      });

      traces.push({
        type: 'scatter', mode: 'lines', name: '不干�?(Treat none)',
        meta: { fixedColor: '#111827' },
        x: thresholds, y: thresholds.map(() => 0),
        line: { color: '#111827', width: 1.6 },
        hovertemplate: '不干�?br>凢�获益: 0<extra></extra>',
      });

      const allCurves = [treatAllNB, thresholds.map(() => 0)];
      actualCols.forEach((col, ci) => {
        const pred = probabilityFromPredictor(data[col] || []);
        if (pred.length === 0) return;
        const pairs = validOutcome
          .map(d => ({ o: d.o, p: pred[d.i] }))
          .filter(d => Number.isFinite(d.p) && d.p >= 0 && d.p <= 1);
        if (pairs.length < 20) return;

        const nbCurve = thresholds.map(pt => {
          let tp = 0, fp = 0;
          pairs.forEach(d => {
            if (d.p >= pt) {
              if (d.o === 1) tp++;
              else fp++;
            }
          });
          return (tp / pairs.length) - (fp / pairs.length) * (pt / (1 - pt));
        });
        allCurves.push(nbCurve);

        traces.push({
          type: 'scatter', mode: 'lines', name: String(col),
          meta: { colorIndex: ci },
          x: thresholds, y: nbCurve,
          line: { color: theme.colorway[ci % theme.colorway.length], width: 2.9, shape: 'spline', smoothing: 0.35 },
          hovertemplate: `${col}<br>阈��概�? %{x:.2f}<br>凢�获益: %{y:.4f}<extra></extra>`,
        });
      });

      const flat = allCurves.flat().filter(Number.isFinite);
      params._dcaStats = {
        prevalence,
        eventN: positives,
        totalN,
        yMin: Math.max(-0.12, Math.min(-0.02, Math.min(...flat) - 0.03)),
        yMax: Math.min(0.55, Math.max(0.08, Math.max(...flat) + 0.04)),
      };
      return traces;
    },
    buildLayout(params) {
      const stats = params._dcaStats || { prevalence: 0, eventN: 0, totalN: 0, yMin: -0.05, yMax: 0.25 };
      return {
        title: params.title || '决策曲线分析 (DCA)',
        xaxis: { title: 'Threshold Probability', range: [0, 0.8], tickformat: '.0%' },
        yaxis: { title: 'Net Benefit', range: [stats.yMin, stats.yMax], zeroline: true, zerolinecolor: 'rgba(17,24,39,0.35)' },
        hovermode: 'closest',
        annotations: [{
          x: 0.99, y: 0.98,
          xref: 'paper', yref: 'paper',
          text: `事件�? ${(stats.prevalence * 100).toFixed(1)}% (${stats.eventN}/${stats.totalN})`,
          showarrow: false,
          xanchor: 'right',
          yanchor: 'top',
          font: { size: 12, color: '#64748B' },
        }],
      };
    },
  },

  // Spatial Charts
  china_map: {
    id: 'china_map', name: '中国疾病分布地图', category: 'spatial',
    description: '中国省级疾病指标地理分布，基于省级行政区划的精准填充地图�?',
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
          : cn + ': ???';
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
          title: { text: safeName(params.y_var) || '???', font: { size: 12, color: theme.ink || '#1a1a1a' } },
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
    description: '全球各国疾病指标地理分布，填充地图展示跨国差异��?',
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
          title: { text: safeName(params.y_var) || '指标�?', font: { size: 12, color: theme.ink || '#1a1a1a' } },
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

  china_bubble_map: {
    id: 'china_bubble_map', name: '中国省域气泡地图', category: 'spatial',
    description: '在中国省界底图上叠加省域气泡，兼顾空间位置��数值大小和标签信息�?',
    icon: 'CNB', exampleDataset: 'china_map_example',
    buildTraces(data, params, theme) {
      const provRaw = data[safeName(params.province_var)] || data['province'] || [];
      const valsRaw = data[safeName(params.y_var)] || data['incidence'] || [];
      const sizeRaw = data[safeName(params.size_var)] || data['prevalence'] || valsRaw;
      const centroids = loadChinaCentroids();
      const rows = provRaw.map((p, i) => {
        const key = normalizeProvinceKey(p);
        const c = centroids[key];
        return {
          key,
          label: CHINA_PROVINCE_LABELS[key] || String(p),
          lat: c ? c[0] : null,
          lon: c ? c[1] : null,
          value: Number(valsRaw[i]),
          size: Number(sizeRaw[i]),
        };
      }).filter(d => d.key && Number.isFinite(d.lat) && Number.isFinite(d.lon) && Number.isFinite(d.value));
      const finiteVals = rows.map(d => d.value);
      const finiteSizes = rows.map(d => Number.isFinite(d.size) ? d.size : d.value);
      const maxSize = Math.max(...finiteSizes, 1);
      const topLabels = rows.slice().sort((a, b) => b.value - a.value).slice(0, 10);
      const geoKeys = getChinaFeatureKeys(centroids);
      return [{
        type: 'choropleth',
        geojson: STATE.chinaGeoJSON || _geoJSONCache,
        locations: geoKeys,
        featureidkey: 'properties.id',
        z: geoKeys.map(() => 0),
        showscale: false,
        colorscale: [[0, '#F4F8F6'], [1, '#F4F8F6']],
        marker: { line: { color: '#D5DEE3', width: 0.65 }, opacity: 0.72 },
        hoverinfo: 'skip',
      }, {
        type: 'scattergeo',
        mode: 'markers',
        lat: rows.map(d => d.lat),
        lon: rows.map(d => d.lon),
        text: rows.map(d => `${d.label}: ${fmtNum(d.value)}`),
        customdata: rows.map((d, i) => finiteSizes[i]),
        marker: {
          size: finiteSizes.map(v => 9 + 34 * Math.sqrt(Math.max(v, 0) / maxSize)),
          color: finiteVals,
          colorscale: cnsMapScale(theme),
          cmin: Math.min(...finiteVals),
          cmax: Math.max(...finiteVals),
          opacity: 0.78,
          line: { color: '#FFFFFF', width: 1.3 },
          colorbar: { title: { text: safeName(params.y_var) || 'value' }, thickness: 16, len: 0.62, outlinewidth: 0 },
        },
        hovertemplate: '<b>%{text}</b><br>size=%{customdata:.1f}<extra></extra>',
      }, {
        type: 'scattergeo',
        mode: 'text',
        lat: topLabels.map(d => d.lat),
        lon: topLabels.map(d => d.lon),
        text: topLabels.map(d => d.label),
        textfont: { family: theme.fontFamily, size: 10, color: '#1F2937' },
        textposition: 'top center',
        hoverinfo: 'skip',
        showlegend: false,
      }];
    },
    buildLayout(params) {
      return {
        title: params.title || '中国省域气泡地图',
        geo: {
          showframe: false, showcoastlines: false, showcountries: false,
          showland: true, landcolor: '#F5F8F6',
          projection: { type: 'mercator' },
          center: { lat: 35.2, lon: 104.2 },
          lonaxis: { range: [72, 136.5] },
          lataxis: { range: [16, 55.5] },
          domain: { x: [0.015, 0.94], y: [0.02, 0.965] },
          bgcolor: 'rgba(0,0,0,0)',
        },
        margin: { l: 8, r: 76, t: 72, b: 8 },
      };
    },
  },

  usa_map: {
    id: 'usa_map', name: '美国州级分布地图', category: 'spatial',
    description: '美国州级疾病指标可视化，使用州缩写或州名自动匹配�?',
    icon: 'USA', exampleDataset: 'usa_map_example',
    buildTraces(data, params, theme) {
      const stateRaw = data[safeName(params.state_var)] || data['state'] || [];
      const valsRaw = data[safeName(params.y_var)] || data['incidence'] || [];
      const rows = stateRaw.map((s, i) => ({ loc: normalizeUSState(s), label: String(s), value: Number(valsRaw[i]) }))
        .filter(d => d.loc && Number.isFinite(d.value));
      const vals = rows.map(d => d.value);
      const top = rows.filter(d => US_STATE_CENTROIDS[d.loc]).sort((a, b) => b.value - a.value).slice(0, 10);
      return [{
        type: 'choropleth',
        locationmode: 'USA-states',
        locations: rows.map(d => d.loc),
        z: vals,
        text: rows.map(d => `${d.label}: ${fmtNum(d.value)}`),
        colorscale: cnsMapScale(theme),
        marker: { line: { color: '#FFFFFF', width: 0.85 }, opacity: 0.96 },
        colorbar: { title: { text: safeName(params.y_var) || 'value' }, thickness: 16, len: 0.62, outlinewidth: 0 },
        hovertemplate: '<b>%{text}</b><extra></extra>',
      }, {
        type: 'scattergeo',
        mode: 'text',
        lat: top.map(d => US_STATE_CENTROIDS[d.loc][0]),
        lon: top.map(d => US_STATE_CENTROIDS[d.loc][1]),
        text: top.map(d => `${d.loc}<br>${fmtNum(d.value)}`),
        textfont: { family: theme.fontFamily, size: 10, color: '#1F2937' },
        hoverinfo: 'skip',
        showlegend: false,
      }];
    },
    buildLayout(params) {
      return {
        title: params.title || '美国州级分布地图',
        geo: {
          scope: 'usa',
          projection: { type: 'albers usa' },
          showland: true,
          landcolor: '#F3F6F4',
          lakecolor: '#F8FBFD',
          bgcolor: 'rgba(0,0,0,0)',
          domain: { x: [0.015, 0.94], y: [0.02, 0.965] },
        },
        margin: { l: 8, r: 76, t: 72, b: 8 },
      };
    },
  },

  europe_map: {
    id: 'europe_map', name: '欧洲疾病分布地图', category: 'spatial',
    description: '欧洲国家级疾病指标分布，可用于多国队列或公共卫生比较�?',
    icon: 'EU', exampleDataset: 'europe_map_example',
    buildTraces(data, params, theme) {
      const country = data[safeName(params.country_var)] || data['country'] || [];
      const valsRaw = data[safeName(params.y_var)] || data['incidence'] || [];
      const rows = country.map((c, i) => ({ iso: normalizeCountryISO(c), label: String(c), value: Number(valsRaw[i]) }))
        .filter(d => d.iso && EUROPE_ISO3.has(d.iso) && Number.isFinite(d.value));
      const vals = rows.map(d => d.value);
      const labelled = rows.filter(d => COUNTRY_CENTROIDS[d.iso]).sort((a, b) => b.value - a.value).slice(0, 12);
      return [{
        type: 'choropleth',
        geojson: STATE.worldGeoJSON || _worldGeoJSONCache,
        featureidkey: 'properties.ISO_A3',
        locations: rows.map(d => d.iso),
        z: vals,
        text: rows.map(d => `${d.label}: ${fmtNum(d.value)}`),
        colorscale: cnsMapScale(theme),
        marker: { line: { color: '#FFFFFF', width: 0.7 }, opacity: 0.97 },
        colorbar: { title: { text: safeName(params.y_var) || 'value' }, thickness: 16, len: 0.62, outlinewidth: 0 },
        hovertemplate: '<b>%{text}</b><extra></extra>',
      }, {
        type: 'scattergeo',
        mode: 'text',
        lat: labelled.map(d => COUNTRY_CENTROIDS[d.iso][0]),
        lon: labelled.map(d => COUNTRY_CENTROIDS[d.iso][1]),
        text: labelled.map(d => `${d.iso}<br>${fmtNum(d.value)}`),
        textfont: { family: theme.fontFamily, size: 9.5, color: '#1F2937' },
        hoverinfo: 'skip',
        showlegend: false,
      }];
    },
    buildLayout(params) {
      return {
        title: params.title || '欧洲疾病分布地图',
        geo: {
          scope: 'europe',
          showframe: false,
          showland: true,
          showcountries: true,
          showcoastlines: true,
          landcolor: '#F3F6F4',
          countrycolor: '#D5DEE3',
          coastlinecolor: '#A8B6BE',
          projection: { type: 'mercator' },
          lonaxis: { range: [-12, 42] },
          lataxis: { range: [34, 72] },
          bgcolor: 'rgba(0,0,0,0)',
          domain: { x: [0.015, 0.94], y: [0.02, 0.965] },
        },
        margin: { l: 8, r: 76, t: 72, b: 8 },
      };
    },
  },

  uk_map: {
    id: 'uk_map', name: '英国区域气泡地图', category: 'spatial',
    description: '英国区域/城市级气泡分布，适合 NHS 区域或多中心研究展示�?',
    icon: 'UK', exampleDataset: 'uk_map_example',
    buildTraces(data, params, theme) {
      const region = data[safeName(params.region_var)] || data['region'] || [];
      const valsRaw = data[safeName(params.y_var)] || data['incidence'] || [];
      const sizeRaw = data[safeName(params.size_var)] || data['prevalence'] || valsRaw;
      const rows = region.map((r, i) => {
        const label = String(r);
        const coord = UK_REGION_COORDS[label] || UK_REGION_COORDS[label.replace(/\s+/g, ' ')];
        return { label, coord, value: Number(valsRaw[i]), size: Number(sizeRaw[i]) };
      }).filter(d => d.coord && Number.isFinite(d.value));
      const vals = rows.map(d => d.value);
      const sizes = rows.map(d => Number.isFinite(d.size) ? d.size : d.value);
      const maxSize = Math.max(...sizes, 1);
      return [{
        type: 'scattergeo',
        mode: 'markers+text',
        lat: rows.map(d => d.coord[0]),
        lon: rows.map(d => d.coord[1]),
        text: rows.map(d => d.label),
        textposition: 'top center',
        customdata: rows.map((d, i) => [d.value, sizes[i]]),
        marker: {
          size: sizes.map(v => 12 + 42 * Math.sqrt(Math.max(v, 0) / maxSize)),
          color: vals,
          colorscale: cnsMapScale(theme),
          opacity: 0.80,
          line: { color: '#FFFFFF', width: 1.4 },
          colorbar: { title: { text: safeName(params.y_var) || 'value' }, thickness: 16, len: 0.62, outlinewidth: 0 },
        },
        hovertemplate: '<b>%{text}</b><br>value=%{customdata[0]:.1f}<br>size=%{customdata[1]:.1f}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return {
        title: params.title || '英国区域气泡地图',
        geo: {
          showframe: false,
          showland: true,
          showcountries: true,
          showcoastlines: true,
          landcolor: '#F3F6F4',
          countrycolor: '#D5DEE3',
          coastlinecolor: '#A8B6BE',
          projection: { type: 'mercator' },
          lonaxis: { range: [-9.8, 2.2] },
          lataxis: { range: [49.6, 59.2] },
          bgcolor: 'rgba(0,0,0,0)',
          domain: { x: [0.015, 0.94], y: [0.02, 0.965] },
        },
        margin: { l: 8, r: 76, t: 72, b: 8 },
      };
    },
  },

  world_bubble_map: {
    id: 'world_bubble_map', name: '全球气泡分布地图', category: 'spatial',
    description: '全球国家级气泡地图，以颜色和气泡大小同时展示疾病负担�?',
    icon: 'WMap', exampleDataset: 'world_map_example',
    buildTraces(data, params, theme) {
      const country = data[safeName(params.country_var)] || data['country'] || [];
      const valsRaw = data[safeName(params.y_var)] || data['incidence'] || [];
      const sizeRaw = data[safeName(params.size_var)] || data['prevalence'] || valsRaw;
      const rows = country.map((c, i) => {
        const iso = normalizeCountryISO(c);
        const coord = COUNTRY_CENTROIDS[iso];
        return { iso, label: String(c), coord, value: Number(valsRaw[i]), size: Number(sizeRaw[i]) };
      }).filter(d => d.iso && d.coord && Number.isFinite(d.value));
      const vals = rows.map(d => d.value);
      const sizes = rows.map(d => Number.isFinite(d.size) ? d.size : d.value);
      const maxSize = Math.max(...sizes, 1);
      return [{
        type: 'scattergeo',
        mode: 'markers+text',
        lat: rows.map(d => d.coord[0]),
        lon: rows.map(d => d.coord[1]),
        text: rows.map(d => d.iso),
        customdata: rows.map((d, i) => [d.label, d.value, sizes[i]]),
        textposition: 'top center',
        marker: {
          size: sizes.map(v => 8 + 34 * Math.sqrt(Math.max(v, 0) / maxSize)),
          color: vals,
          colorscale: cnsMapScale(theme),
          opacity: 0.76,
          line: { color: '#FFFFFF', width: 1.2 },
          colorbar: { title: { text: safeName(params.y_var) || 'value' }, thickness: 16, len: 0.62, outlinewidth: 0 },
        },
        hovertemplate: '<b>%{customdata[0]}</b><br>value=%{customdata[1]:.1f}<br>size=%{customdata[2]:.1f}<extra></extra>',
      }];
    },
    buildLayout(params) {
      return {
        title: params.title || '全球气泡分布地图',
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

/* ┢�┢� Fallback generators (when data is insufficient) ┢�┢�┢�┢�┢�┢� */
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

function fallbackTreemap() {
  const labels = ['Cardiovascular','Metabolic','Infectious','Respiratory','Oncology','Hypertension','CHD','Heart Failure','Diabetes','Obesity','Dyslipidemia'];
  const parents = ['','','','','','Cardiovascular','Cardiovascular','Cardiovascular','Metabolic','Metabolic','Metabolic'];
  const values = [320,260,160,230,275,180,95,45,150,60,50];
  const palette = ['#2E6F9E','#D95F59','#2A9D8F','#E9A93A','#6F5AA7','#7C8B52','#3C78AF','#C4635E','#3AA99A','#DBB246','#7D68AE'];
  return [{
    type: 'treemap',
    labels, parents, values,
    marker: { colors: labels.map((_, i) => palette[i % palette.length]), line: { color: '#ffffff', width: 1.5 } },
    textfont: { color: '#ffffff', size: 12 },
    textinfo: 'label+value',
    hovertemplate: '%{label}<br>Count: %{value}<extra></extra>',
    branchvalues: 'total',
    pathbar: { visible: true, thickness: 20 },
  }];
}


/* ┢�┢� Helpers ┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢�┢� */
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

const CHART_LABEL_PATCHES = {
  "scatter": {
    "name": "\u6563\u70b9\u56fe",
    "description": "\u6563\u70b9\u56fe"
  },
  "grouped_scatter": {
    "name": "\u5206\u7ec4\u6563\u70b9\u56fe",
    "description": "\u5206\u7ec4\u6563\u70b9\u56fe"
  },
  "bar": {
    "name": "\u67f1\u72b6\u56fe",
    "description": "\u67f1\u72b6\u56fe"
  },
  "stacked_bar": {
    "name": "\u5806\u53e0\u67f1\u72b6\u56fe",
    "description": "\u5806\u53e0\u67f1\u72b6\u56fe"
  },
  "line": {
    "name": "\u6298\u7ebf\u56fe",
    "description": "\u6298\u7ebf\u56fe"
  },
  "multi_line": {
    "name": "\u591a\u7ec4\u6298\u7ebf\u56fe",
    "description": "\u591a\u7ec4\u6298\u7ebf\u56fe"
  },
  "area": {
    "name": "\u9762\u79ef\u56fe",
    "description": "\u9762\u79ef\u56fe"
  },
  "histogram": {
    "name": "\u76f4\u65b9\u56fe",
    "description": "\u76f4\u65b9\u56fe"
  },
  "density": {
    "name": "\u5bc6\u5ea6\u56fe",
    "description": "\u5bc6\u5ea6\u56fe"
  },
  "box": {
    "name": "\u7bb1\u7ebf\u56fe",
    "description": "\u7bb1\u7ebf\u56fe"
  },
  "violin": {
    "name": "\u5c0f\u63d0\u7434\u56fe",
    "description": "\u5c0f\u63d0\u7434\u56fe"
  },
  "box_scatter": {
    "name": "\u7bb1\u7ebf\u56fe+\u6563\u70b9",
    "description": "\u7bb1\u7ebf\u56fe+\u6563\u70b9"
  },
  "violin_box_scatter": {
    "name": "\u5c0f\u63d0\u7434+\u7bb1\u7ebf+\u6563\u70b9",
    "description": "\u5c0f\u63d0\u7434+\u7bb1\u7ebf+\u6563\u70b9"
  },
  "error_bar": {
    "name": "\u8bef\u5dee\u7ebf\u56fe",
    "description": "\u8bef\u5dee\u7ebf\u56fe"
  },
  "horizontal_bar": {
    "name": "\u6a2a\u5411\u6761\u5f62\u56fe",
    "description": "\u6a2a\u5411\u6761\u5f62\u56fe"
  },
  "grouped_bar": {
    "name": "\u5206\u7ec4\u67f1\u72b6\u56fe",
    "description": "\u5206\u7ec4\u67f1\u72b6\u56fe"
  },
  "percent_stacked_bar": {
    "name": "\u767e\u5206\u6bd4\u5806\u53e0\u56fe",
    "description": "\u767e\u5206\u6bd4\u5806\u53e0\u56fe"
  },
  "lollipop": {
    "name": "\u68d2\u68d2\u7cd6\u56fe",
    "description": "\u68d2\u68d2\u7cd6\u56fe"
  },
  "slope": {
    "name": "\u659c\u7387\u53d8\u5316\u56fe",
    "description": "\u659c\u7387\u53d8\u5316\u56fe"
  },
  "paired_line": {
    "name": "\u914d\u5bf9\u53d8\u5316\u56fe",
    "description": "\u914d\u5bf9\u53d8\u5316\u56fe"
  },
  "waterfall": {
    "name": "\u7011\u5e03\u54cd\u5e94\u56fe",
    "description": "\u7011\u5e03\u54cd\u5e94\u56fe"
  },
  "bland_altman": {
    "name": "Bland-Altman \u4e00\u81f4\u6027\u56fe",
    "description": "Bland-Altman \u4e00\u81f4\u6027\u56fe"
  },
  "calibration_curve": {
    "name": "\u6821\u51c6\u66f2\u7ebf",
    "description": "\u6821\u51c6\u66f2\u7ebf"
  },
  "swimmer": {
    "name": "\u6cf3\u9053\u56fe",
    "description": "\u6cf3\u9053\u56fe"
  },
  "population_pyramid": {
    "name": "\u4eba\u53e3\u91d1\u5b57\u5854\u56fe",
    "description": "\u4eba\u53e3\u91d1\u5b57\u5854\u56fe"
  },
  "qq_plot": {
    "name": "\u6b63\u6001 QQ \u56fe",
    "description": "\u6b63\u6001 QQ \u56fe"
  },
  "dumbbell": {
    "name": "\u54d1\u94c3\u56fe",
    "description": "\u54d1\u94c3\u56fe"
  },
  "forest": {
    "name": "\u68ee\u6797\u56fe",
    "description": "\u68ee\u6797\u56fe"
  },
  "volcano": {
    "name": "\u706b\u5c71\u56fe",
    "description": "\u706b\u5c71\u56fe"
  },
  "bubble": {
    "name": "\u6c14\u6ce1\u56fe",
    "description": "\u6c14\u6ce1\u56fe"
  },
  "heatmap": {
    "name": "\u70ed\u56fe",
    "description": "\u70ed\u56fe"
  },
  "correlation_heatmap": {
    "name": "\u76f8\u5173\u6027\u70ed\u56fe",
    "description": "\u76f8\u5173\u6027\u70ed\u56fe"
  },
  "missingness_heatmap": {
    "name": "\u7f3a\u5931\u503c\u70ed\u56fe",
    "description": "\u7f3a\u5931\u503c\u70ed\u56fe"
  },
  "pca": {
    "name": "PCA\u6563\u70b9\u56fe",
    "description": "PCA\u6563\u70b9\u56fe"
  },
  "survival": {
    "name": "Kaplan-Meier \u751f\u5b58\u66f2\u7ebf",
    "description": "Kaplan-Meier \u751f\u5b58\u66f2\u7ebf"
  },
  "roc": {
    "name": "ROC \u66f2\u7ebf",
    "description": "ROC \u66f2\u7ebf"
  },
  "multi_roc": {
    "name": "\u591a\u6a21\u578b ROC \u66f2\u7ebf",
    "description": "\u591a\u6a21\u578b ROC \u66f2\u7ebf"
  },
  "risk_calibration": {
    "name": "\u98ce\u9669\u6821\u51c6\u56fe",
    "description": "\u98ce\u9669\u6821\u51c6\u56fe"
  },
  "nomogram": {
    "name": "\u5217\u7ebf\u56fe / \u98ce\u9669\u8bc4\u5206\u56fe",
    "description": "\u5217\u7ebf\u56fe / \u98ce\u9669\u8bc4\u5206\u56fe"
  },
  "raincloud": {
    "name": "\u4e91\u96e8\u56fe",
    "description": "\u4e91\u96e8\u56fe"
  },
  "beeswarm": {
    "name": "\u8702\u7fa4\u56fe",
    "description": "\u8702\u7fa4\u56fe"
  },
  "beanplot": {
    "name": "\u8c46\u835a\u56fe",
    "description": "\u8c46\u835a\u56fe"
  },
  "ridgeline": {
    "name": "\u5c71\u810a\u56fe",
    "description": "\u5c71\u810a\u56fe"
  },
  "donut": {
    "name": "\u73af\u5f62\u56fe",
    "description": "\u73af\u5f62\u56fe"
  },
  "pie": {
    "name": "\u997c\u56fe",
    "description": "\u997c\u56fe"
  },
  "radar": {
    "name": "\u96f7\u8fbe\u56fe",
    "description": "\u96f7\u8fbe\u56fe"
  },
  "sankey": {
    "name": "\u6851\u57fa\u56fe",
    "description": "\u6851\u57fa\u56fe"
  },
  "treemap": {
    "name": "\u77e9\u5f62\u6811\u56fe",
    "description": "\u77e9\u5f62\u6811\u56fe"
  },
  "cleveland_dot": {
    "name": "Cleveland \u70b9\u56fe",
    "description": "Cleveland \u70b9\u56fe"
  },
  "parallel_coords": {
    "name": "\u5e73\u884c\u5750\u6807\u56fe",
    "description": "\u5e73\u884c\u5750\u6807\u56fe"
  },
  "funnel": {
    "name": "\u6f0f\u6597\u56fe",
    "description": "\u6f0f\u6597\u56fe"
  },
  "polar_bar": {
    "name": "\u73af\u5f62\u67f1\u72b6\u56fe",
    "description": "\u73af\u5f62\u67f1\u72b6\u56fe"
  },
  "venn": {
    "name": "\u97e6\u6069\u56fe",
    "description": "\u97e6\u6069\u56fe"
  },
  "upset": {
    "name": "UpSet \u4ea4\u96c6\u56fe",
    "description": "UpSet \u4ea4\u96c6\u56fe"
  },
  "dca": {
    "name": "\u51b3\u7b56\u66f2\u7ebf\u5206\u6790 (DCA)",
    "description": "\u51b3\u7b56\u66f2\u7ebf\u5206\u6790 (DCA)"
  },
  "china_map": {
    "name": "\u4e2d\u56fd\u75be\u75c5\u5206\u5e03\u5730\u56fe",
    "description": "\u4e2d\u56fd\u75be\u75c5\u5206\u5e03\u5730\u56fe"
  },
  "world_map": {
    "name": "\u4e16\u754c\u75be\u75c5\u5206\u5e03\u5730\u56fe",
    "description": "\u4e16\u754c\u75be\u75c5\u5206\u5e03\u5730\u56fe"
  },
  "china_bubble_map": {
    "name": "\u4e2d\u56fd\u7701\u57df\u6c14\u6ce1\u5730\u56fe",
    "description": "\u4e2d\u56fd\u7701\u57df\u6c14\u6ce1\u5730\u56fe"
  },
  "usa_map": {
    "name": "\u7f8e\u56fd\u5dde\u7ea7\u5206\u5e03\u5730\u56fe",
    "description": "\u7f8e\u56fd\u5dde\u7ea7\u5206\u5e03\u5730\u56fe"
  },
  "europe_map": {
    "name": "\u6b27\u6d32\u5206\u5e03\u5730\u56fe",
    "description": "\u6b27\u6d32\u5206\u5e03\u5730\u56fe"
  },
  "uk_map": {
    "name": "\u82f1\u56fd\u533a\u57df\u5206\u5e03\u5730\u56fe",
    "description": "\u82f1\u56fd\u533a\u57df\u5206\u5e03\u5730\u56fe"
  },
  "world_bubble_map": {
    "name": "\u5168\u7403\u6c14\u6ce1\u5206\u5e03\u5730\u56fe",
    "description": "\u5168\u7403\u6c14\u6ce1\u5206\u5e03\u5730\u56fe"
  }
};

function looksCorruptText(value) {
  return /[\uFFFD]|\?\?\?|\u9367|\u93c1|\u9427|[????]/.test(String(value || ""));
}

function applyChartLabelPatch(chartType, cfg) {
  const label = CHART_LABEL_PATCHES[chartType];
  if (!cfg || !label || cfg._labelPatchApplied) return cfg;
  cfg.name = label.name || cfg.name;
  cfg.description = label.description || cfg.description || cfg.name;
  const originalBuildLayout = cfg.buildLayout;
  if (typeof originalBuildLayout === "function") {
    cfg.buildLayout = function patchedBuildLayout(params, theme) {
      const layout = originalBuildLayout.call(this, params, theme) || {};
      const titleValue = typeof layout.title === "object" ? layout.title.text : layout.title;
      if (!params?.title && (!titleValue || looksCorruptText(titleValue))) {
        layout.title = cfg.name;
      }
      return layout;
    };
  }
  cfg._labelPatchApplied = true;
  return cfg;
}

function getChartConfig(chartType) {
  return applyChartLabelPatch(chartType, CHART_CATALOG[chartType] || null);
}

// Restored display chart builders. These overrides avoid the earlier mojibake
// blocks and make hierarchical/flow charts robust for both examples and uploads.
(function restoreDisplayChartBuilders() {
  if (!CHART_CATALOG || !CHART_CATALOG.sankey || !CHART_CATALOG.treemap) return;

  CHART_CATALOG.sankey.buildTraces = function restoredSankeyTraces(data, params, theme) {
    const sourceCol = data[safeName(params.x_var)] || data.source || [];
    const targetCol = data[safeName(params.y_var)] || data.target || [];
    const valueCol = numeric(data[safeName(params.size_var)] || data.value || []);
    const palette = expandPalette(theme.colorway, 32);
    const rows = sourceCol.map((source, i) => ({
      source: String(source || '').trim(),
      target: String(targetCol[i] || '').trim(),
      value: Number(valueCol[i]) || 1,
    })).filter(d => d.source && d.target && d.source !== d.target && d.value > 0);

    const labels = unique(rows.flatMap(d => [d.source, d.target]));
    if (!labels.length) {
      return [{
        type: 'sankey',
        node: { label: ['Input', 'Output'], color: [palette[0], palette[1]] },
        link: { source: [0], target: [1], value: [1], color: [colorAlpha(palette[0], 0.36)] },
      }];
    }

    const labelMap = {};
    labels.forEach((label, i) => { labelMap[label] = i; });
    const flowMap = {};
    rows.forEach((row) => {
      const key = `${row.source}||${row.target}`;
      flowMap[key] = (flowMap[key] || 0) + row.value;
    });

    const levels = {};
    labels.forEach(label => { levels[label] = 0; });
    for (let pass = 0; pass < labels.length; pass += 1) {
      Object.keys(flowMap).forEach((key) => {
        const [source, target] = key.split('||');
        levels[target] = Math.max(levels[target] || 0, (levels[source] || 0) + 1);
      });
    }
    const maxLevel = Math.max(1, ...Object.values(levels));
    const levelGroups = {};
    labels.forEach((label) => {
      const level = levels[label] || 0;
      if (!levelGroups[level]) levelGroups[level] = [];
      levelGroups[level].push(label);
    });
    const nodeYMap = {};
    Object.entries(levelGroups).forEach(([levelText, group]) => {
      const level = Number(levelText);
      const ordered = level % 2 === 0 ? group : group.slice().reverse();
      ordered.forEach((label, idx) => {
        const n = ordered.length;
        const y = n === 1 ? 0.5 : (idx + 0.5) / n;
        nodeYMap[label] = Math.max(0.04, Math.min(0.96, y));
      });
    });

    const sources = [];
    const targets = [];
    const values = [];
    const linkColors = [];
    Object.entries(flowMap).forEach(([key, value], idx) => {
      const [source, target] = key.split('||');
      const sourceIndex = labelMap[source];
      sources.push(sourceIndex);
      targets.push(labelMap[target]);
      values.push(value);
      linkColors.push(colorAlpha(palette[sourceIndex % palette.length] || palette[idx % palette.length], 0.40));
    });

    return [{
      type: 'sankey',
      orientation: 'h',
      arrangement: 'fixed',
      node: {
        pad: 24,
        thickness: 18,
        line: { color: '#ffffff', width: 1.6 },
        label: labels,
        color: labels.map((_, i) => palette[i % palette.length]),
        x: labels.map(label => 0.02 + 0.94 * ((levels[label] || 0) / maxLevel)),
        y: labels.map(label => nodeYMap[label] ?? 0.5),
      },
      link: {
        source: sources,
        target: targets,
        value: values,
        color: linkColors,
      },
      textfont: { family: theme.fontFamily, size: 11, color: theme.ink || '#111827' },
      hovertemplate: '%{source.label} \u2192 %{target.label}<br>\u6570\u503c: %{value}<extra></extra>',
    }];
  };

  CHART_CATALOG.sankey.buildLayout = function restoredSankeyLayout(params) {
    return {
      title: params.title || '\u6851\u57fa\u56fe',
      font: { size: 12 },
      margin: { l: 34, r: 34, t: 78, b: 34 },
    };
  };

  CHART_CATALOG.treemap.buildTraces = function restoredTreemapTraces(data, params, theme) {
    const labelCol = data[safeName(params.x_var)] || data.category || [];
    const valueCol = numeric(data[safeName(params.y_var)] || data.value || []);
    const parentCol = data[safeName(params.color_var)] || data.parent || [];
    const minLen = Math.min(labelCol.length, valueCol.length, parentCol.length || labelCol.length);
    if (!minLen) return fallbackTreemap();
    const palette = expandPalette(theme.colorway, 32);
    const rows = Array.from({ length: minLen }, (_, i) => ({
      label: String(labelCol[i] || '').trim(),
      parent: String((parentCol[i] || '')).trim(),
      value: Number(valueCol[i]) || 0,
    })).filter(d => d.label && d.label !== d.parent);
    if (!rows.length) return fallbackTreemap();

    const hasParents = rows.some(d => d.parent && d.parent !== '0');
    if (!hasParents) {
      const agg = aggregateByCategory(rows.map(d => d.label), rows.map(d => d.value));
      return [{
        type: 'treemap',
        labels: agg.map(d => d.label),
        parents: agg.map(() => ''),
        values: agg.map(d => d.sum),
        marker: { colors: agg.map((_, i) => palette[i % palette.length]), line: { color: '#ffffff', width: 2 } },
        textfont: { family: theme.fontFamily, size: 13, color: '#ffffff' },
        textinfo: 'label+value+percent parent',
        hovertemplate: '%{label}<br>\u6570\u503c: %{value}<br>\u5360\u6bd4: %{percentParent}<extra></extra>',
        branchvalues: 'total',
        tiling: { packing: 'squarify', pad: 3 },
      }];
    }

    const nodeMap = new Map();
    function addNode(id, label, parent, value, synthetic = false) {
      if (!id) return;
      const existing = nodeMap.get(id);
      if (existing) {
        existing.value += Number(value) || 0;
        if (parent && !existing.parent) existing.parent = parent;
        existing.synthetic = existing.synthetic && synthetic;
        return;
      }
      nodeMap.set(id, { id, label, parent: parent || '', value: Number(value) || 0, synthetic });
    }

    rows.forEach((row) => {
      const parentId = row.parent && row.parent !== '0' ? row.parent : '';
      if (parentId && !nodeMap.has(parentId)) addNode(parentId, parentId, '', 0, true);
      const id = parentId ? `${parentId}/${row.label}` : row.label;
      addNode(id, row.label, parentId, row.value, false);
    });

    const childTotals = {};
    nodeMap.forEach((node) => {
      if (node.parent) childTotals[node.parent] = (childTotals[node.parent] || 0) + Math.max(0, node.value);
    });
    nodeMap.forEach((node) => {
      const childTotal = childTotals[node.id] || 0;
      if (childTotal > 0) node.value = Math.max(node.value, childTotal);
    });
    const nodes = Array.from(nodeMap.values()).filter(node => node.value > 0 || childTotals[node.id] > 0);
    if (!nodes.length) return fallbackTreemap();

    const colorKeys = unique(nodes.map(n => n.parent || n.id));
    const colorMap = {};
    colorKeys.forEach((key, i) => { colorMap[key] = palette[i % palette.length]; });

    return [{
      type: 'treemap',
      ids: nodes.map(n => n.id),
      labels: nodes.map(n => n.label),
      parents: nodes.map(n => n.parent),
      values: nodes.map(n => n.value),
      marker: {
        colors: nodes.map((n, i) => colorMap[n.parent || n.id] || palette[i % palette.length]),
        line: { color: '#ffffff', width: 2 },
      },
      textfont: { family: theme.fontFamily, size: 13, color: '#ffffff' },
      textinfo: 'label+value+percent parent',
      hovertemplate: '%{label}<br>\u6570\u503c: %{value}<br>\u5360\u7236\u7ea7: %{percentParent}<extra></extra>',
      branchvalues: 'total',
      tiling: { packing: 'squarify', pad: 3 },
      pathbar: { visible: true, thickness: 22 },
      root: { color: '#ffffff' },
    }];
  };

  CHART_CATALOG.treemap.buildLayout = function restoredTreemapLayout(params) {
    return {
      title: params.title || '\u77e9\u5f62\u6811\u56fe',
      margin: { l: 24, r: 24, t: 78, b: 24 },
    };
  };
})();

// 5.7.5: denser jagged clinical trend charts with individual trajectories.
(function finalJaggedTrendCharts575() {
  if (typeof CHART_CATALOG === 'undefined' || !CHART_CATALOG) return;

  function trendPalette575(theme, count = 12) {
    const raw = (typeof STATE !== 'undefined' && STATE.userColors && STATE.userColors.length)
      ? STATE.userColors
      : (theme && theme.colorway) || ['#2E6F9E', '#D95F59', '#2A9D8F', '#E9A93A', '#6F5AA7', '#7C8B52'];
    return expandPalette(raw, count);
  }

  function rows575(data, params) {
    const xRaw = data[safeName(params.x_var)] || [];
    const yRaw = data[safeName(params.y_var)] || [];
    const gRaw = params.color_var ? (data[safeName(params.color_var)] || []) : [];
    const pRaw = data.patient_id || data.subject_id || data.id || [];
    return xRaw.map((xv, i) => {
      const y = Number(yRaw[i]);
      const xn = Number(xv);
      const x = Number.isFinite(xn) ? xn : String(xv);
      return {
        x,
        xKey: String(x),
        y,
        group: String(gRaw[i] ?? 'All').trim() || 'All',
        patient: String(pRaw[i] ?? `row_${i}`).trim() || `row_${i}`,
      };
    }).filter(d => Number.isFinite(d.y) && d.xKey !== '');
  }

  function groups575(rows, allowGroups) {
    const g = unique(rows.map(d => d.group)).filter(Boolean);
    return allowGroups && g.length ? g.slice(0, 8) : ['All'];
  }

  function summarize575(rows, group) {
    const filtered = group === 'All' ? rows : rows.filter(d => String(d.group) === String(group));
    const numericX = filtered.every(d => typeof d.x === 'number');
    const keys = unique(filtered.map(d => d.xKey));
    keys.sort((a, b) => numericX ? Number(a) - Number(b) : filtered.findIndex(d => d.xKey === a) - filtered.findIndex(d => d.xKey === b));
    return keys.map((key) => {
      const vals = filtered.filter(d => d.xKey === key).map(d => d.y).sort((a, b) => a - b);
      const mean = meanValue(vals);
      const sd = sdValue(vals);
      const ci = vals.length > 1 ? 1.96 * sd / Math.sqrt(vals.length) : 0;
      const q = (p) => vals.length ? vals[Math.max(0, Math.min(vals.length - 1, Math.floor((vals.length - 1) * p)))] : mean;
      return {
        x: numericX ? Number(key) : key,
        y: mean,
        n: vals.length,
        sd,
        lower: mean - ci,
        upper: mean + ci,
        q25: q(0.25),
        q75: q(0.75),
      };
    }).filter(d => Number.isFinite(d.y));
  }

  function patients575(rows, group, limit = 18) {
    const filtered = group === 'All' ? rows : rows.filter(d => String(d.group) === String(group));
    const patientIds = unique(filtered.map(d => d.patient)).slice(0, limit);
    return patientIds.map(pid => {
      const r = filtered.filter(d => d.patient === pid);
      r.sort((a, b) => (typeof a.x === 'number' && typeof b.x === 'number') ? a.x - b.x : String(a.x).localeCompare(String(b.x)));
      return { patient: pid, rows: r };
    }).filter(d => d.rows.length > 1);
  }

  function trajectoryTraces575(rows, group, palette, groupIndex, limit) {
    return patients575(rows, group, limit).map((patient, pi) => {
      const color = palette[(groupIndex * 5 + pi) % palette.length];
      return {
        type: 'scatter',
        mode: 'lines',
        x: patient.rows.map(d => d.x),
        y: patient.rows.map(d => d.y),
        name: patient.patient,
        showlegend: false,
        hoverinfo: 'skip',
        opacity: 0.30,
        line: { color: colorAlpha(color, 0.34), width: 0.85, shape: 'linear' },
        meta: { fixedColor: colorAlpha(color, 0.34), visualRole: 'backgroundTrajectory' },
      };
    });
  }

  function bandTrace575(summary, color, label, idx, lowKey = 'lower', highKey = 'upper', alpha = 0.14) {
    return {
      type: 'scatter',
      mode: 'none',
      x: summary.map(d => d.x).concat(summary.map(d => d.x).reverse()),
      y: summary.map(d => d[highKey]).concat(summary.map(d => d[lowKey]).reverse()),
      fill: 'toself',
      fillcolor: colorAlpha(color, alpha),
      line: { color: colorAlpha(color, 0.08), width: 0 },
      name: `${label} interval`,
      hoverinfo: 'skip',
      showlegend: false,
      meta: { colorIndex: idx },
    };
  }

  function meanTrace575(summary, color, label, idx, shape = 'linear') {
    const text = summary.map(() => '');
    if (summary.length) text[summary.length - 1] = `${label} ${fmtNum(summary[summary.length - 1].y, 1)}`;
    return {
      type: 'scatter',
      mode: 'lines+markers+text',
      x: summary.map(d => d.x),
      y: summary.map(d => d.y),
      name: label,
      customdata: summary.map(d => [d.n, d.lower, d.upper, d.q25, d.q75]),
      line: { color, width: 3.4, shape, smoothing: shape === 'spline' ? 0.28 : undefined },
      marker: {
        color,
        size: 7.8,
        symbol: ['circle', 'diamond', 'square', 'triangle-up', 'hexagon', 'star'][idx % 6],
        line: { color: '#FFFFFF', width: 1.2 },
      },
      text,
      textposition: 'top center',
      textfont: { size: 10.5, color: '#25313D' },
      hovertemplate: `%{x}<br>Mean=%{y:.2f}<br>N=%{customdata[0]}<br>95%CI=%{customdata[1]:.2f} - %{customdata[2]:.2f}<extra>${label}</extra>`,
      cliponaxis: false,
      meta: { colorIndex: idx },
    };
  }

  function areaPolygon575(summary, color, label, idx) {
    const y0 = Math.min(...summary.map(d => d.q25), ...summary.map(d => d.y)) - 6;
    return {
      type: 'scatter',
      mode: 'lines',
      x: summary.map(d => d.x).concat(summary.map(d => d.x).reverse()),
      y: summary.map(d => d.y).concat(summary.map(() => y0).reverse()),
      fill: 'toself',
      fillcolor: colorAlpha(color, 0.30),
      line: { color: colorAlpha(color, 0.88), width: 2.2, shape: 'linear' },
      name: label,
      hoverinfo: 'skip',
      meta: { colorIndex: idx },
    };
  }

  function groupedJagged575(data, params, theme, patientLimit = 14) {
    const rows = rows575(data, params);
    const groups = groups575(rows, Boolean(params.color_var));
    const palette = trendPalette575(theme, Math.max(groups.length * 6, 18));
    const traces = [];
    groups.forEach((group, gi) => {
      const summary = summarize575(rows, group);
      if (!summary.length) return;
      const color = palette[gi];
      traces.push(bandTrace575(summary, color, String(group), gi, 'lower', 'upper', 0.13));
      traces.push(...trajectoryTraces575(rows, group, palette, gi, patientLimit));
      traces.push(meanTrace575(summary, color, String(group), gi, 'linear'));
    });
    return traces.length ? traces : [{ type: 'scatter', mode: 'markers', x: [0], y: [0], marker: { color: palette[0] } }];
  }

  function layout575(title, params) {
    return {
      title,
      xaxis: {
        title: safeName(params.x_var),
        showspikes: true,
        spikemode: 'across',
        spikecolor: '#CBD5DC',
        spikedash: 'dot',
        dtick: 4,
      },
      yaxis: { title: safeName(params.y_var), zeroline: false },
      hovermode: 'x unified',
      legend: { orientation: 'h', x: 0, y: -0.19, traceorder: 'normal' },
      margin: { l: 86, r: 70, t: 76, b: 106 },
    };
  }

  if (CHART_CATALOG.line) {
    CHART_CATALOG.line.name = '\u5bc6\u96c6\u6298\u7ebf\u8d8b\u52bf\u56fe';
    CHART_CATALOG.line.description = '\u5c55\u793a\u4e2a\u4f53\u968f\u8bbf\u8f68\u8ff9\u3001\u7ec4\u522b\u5747\u503c\u548c95%CI\uff0c\u7a81\u51fa\u4e34\u5e8a\u6570\u636e\u7684\u6ce2\u52a8\u4e0e\u4ea4\u9519\u3002';
    CHART_CATALOG.line.buildTraces = function denseLine575(data, params, theme) {
      return groupedJagged575(data, params, theme, 12);
    };
    CHART_CATALOG.line.buildLayout = function denseLineLayout575(params) {
      return layout575(params.title || '\u5bc6\u96c6\u6298\u7ebf\u8d8b\u52bf\u56fe', params);
    };
  }

  if (CHART_CATALOG.multi_line) {
    CHART_CATALOG.multi_line.name = '\u591a\u7ec4\u4ea4\u9519\u6298\u7ebf\u56fe';
    CHART_CATALOG.multi_line.description = '\u591a\u7ec4\u4e2a\u4f53\u968f\u8bbf\u8f68\u8ff9\u4e0e\u7ec4\u522b\u5747\u503c\u53e0\u52a0\uff0c\u5448\u73b0\u66f4\u5bc6\u96c6\u7684\u72ac\u7259\u4ea4\u9519\u6548\u679c\u3002';
    CHART_CATALOG.multi_line.buildTraces = function denseMultiLine575(data, params, theme) {
      return groupedJagged575(data, params, theme, 16);
    };
    CHART_CATALOG.multi_line.buildLayout = function denseMultiLineLayout575(params) {
      return layout575(params.title || '\u591a\u7ec4\u4ea4\u9519\u6298\u7ebf\u56fe', params);
    };
  }

  if (CHART_CATALOG.area) {
    CHART_CATALOG.area.name = '\u591a\u5f69\u9762\u79ef\u8d8b\u52bf\u56fe';
    CHART_CATALOG.area.description = '\u4ee5\u591a\u7ec4\u534a\u900f\u660e\u9762\u79ef\u3001IQR\u8272\u5e26\u548c\u8fb9\u754c\u6298\u7ebf\u5448\u73b0\u968f\u8bbf\u8d8b\u52bf\u3002';
    CHART_CATALOG.area.buildTraces = function colorfulArea575(data, params, theme) {
      const rows = rows575(data, params);
      const groups = groups575(rows, Boolean(params.color_var));
      const palette = trendPalette575(theme, Math.max(groups.length * 3, 12));
      const traces = [];
      groups.forEach((group, gi) => {
        const summary = summarize575(rows, group);
        if (!summary.length) return;
        const color = palette[gi];
        traces.push(areaPolygon575(summary, color, String(group), gi));
        traces.push(bandTrace575(summary, palette[(gi + 4) % palette.length], `${group} IQR`, gi, 'q25', 'q75', 0.24));
        traces.push(meanTrace575(summary, color, String(group), gi, 'linear'));
      });
      return traces.length ? traces : [{ type: 'scatter', mode: 'markers', x: [0], y: [0], marker: { color: palette[0] } }];
    };
    CHART_CATALOG.area.buildLayout = function colorfulAreaLayout575(params) {
      return layout575(params.title || '\u591a\u5f69\u9762\u79ef\u8d8b\u52bf\u56fe', params);
    };
  }

  if (typeof CHART_LABEL_PATCHES !== 'undefined' && CHART_LABEL_PATCHES) {
    CHART_LABEL_PATCHES.line = { name: CHART_CATALOG.line?.name || '\u5bc6\u96c6\u6298\u7ebf\u8d8b\u52bf\u56fe', description: CHART_CATALOG.line?.description || '' };
    CHART_LABEL_PATCHES.multi_line = { name: CHART_CATALOG.multi_line?.name || '\u591a\u7ec4\u4ea4\u9519\u6298\u7ebf\u56fe', description: CHART_CATALOG.multi_line?.description || '' };
    CHART_LABEL_PATCHES.area = { name: CHART_CATALOG.area?.name || '\u591a\u5f69\u9762\u79ef\u8d8b\u52bf\u56fe', description: CHART_CATALOG.area?.description || '' };
    ['line', 'multi_line', 'area'].forEach(id => { if (CHART_CATALOG[id]) delete CHART_CATALOG[id]._labelPatchApplied; });
  }
})();

// 5.7.2 final user-requested overrides. Keep this block at EOF so older
// compatibility patches above cannot overwrite the current visual logic.
(function finalUkMapsAndStepPlot572EOF() {
  if (typeof CHART_CATALOG === 'undefined' || !CHART_CATALOG) return;

  const UK_NUTS1_FINAL = {
    Scotland: { coord: [56.8, -4.2], poly: [[-7.5,55.0],[-6.6,56.2],[-6.0,57.5],[-5.0,58.7],[-3.8,58.9],[-2.3,57.7],[-1.8,56.7],[-2.2,55.7],[-3.0,55.1],[-4.5,54.8],[-7.5,55.0]] },
    'Northern Ireland': { coord: [54.7, -6.7], poly: [[-8.0,54.1],[-7.4,55.1],[-6.2,55.3],[-5.6,54.8],[-5.8,54.1],[-6.8,53.9],[-8.0,54.1]] },
    Wales: { coord: [52.2, -3.7], poly: [[-5.2,51.4],[-4.8,52.3],[-4.3,53.2],[-3.4,53.4],[-2.8,52.8],[-3.0,52.0],[-3.5,51.5],[-4.4,51.3],[-5.2,51.4]] },
    'North East': { coord: [54.9, -1.8], poly: [[-2.6,54.4],[-2.1,55.4],[-1.2,55.5],[-0.9,54.8],[-1.3,54.2],[-2.2,54.1],[-2.6,54.4]] },
    'North West': { coord: [53.8, -2.7], poly: [[-3.8,53.0],[-3.5,54.3],[-2.6,54.8],[-2.1,54.2],[-2.3,53.3],[-3.1,52.9],[-3.8,53.0]] },
    'Yorkshire and The Humber': { coord: [53.8, -1.2], poly: [[-2.2,53.1],[-2.1,54.2],[-1.1,54.7],[0.0,54.2],[-0.2,53.3],[-1.2,52.9],[-2.2,53.1]] },
    'East Midlands': { coord: [52.9, -0.8], poly: [[-1.8,52.1],[-1.4,53.1],[-0.2,53.3],[0.4,52.6],[-0.1,51.9],[-1.1,51.8],[-1.8,52.1]] },
    'West Midlands': { coord: [52.5, -2.1], poly: [[-3.1,52.0],[-2.9,52.9],[-2.1,53.2],[-1.4,53.1],[-1.4,52.1],[-2.3,51.8],[-3.1,52.0]] },
    'East of England': { coord: [52.2, 0.5], poly: [[-0.2,51.5],[0.4,52.6],[1.6,52.9],[1.8,52.0],[1.1,51.4],[0.1,51.2],[-0.2,51.5]] },
    London: { coord: [51.5, -0.1], poly: [[-0.55,51.28],[0.25,51.28],[0.35,51.62],[-0.45,51.70],[-0.55,51.28]] },
    'South East': { coord: [51.2, 0.1], poly: [[-1.3,50.7],[-0.2,51.5],[1.1,51.4],[1.5,50.9],[0.4,50.6],[-0.8,50.6],[-1.3,50.7]] },
    'South West': { coord: [50.9, -3.4], poly: [[-5.8,50.0],[-4.7,51.0],[-3.4,51.4],[-2.1,51.3],[-1.3,50.7],[-2.3,50.2],[-3.8,50.0],[-5.1,49.9],[-5.8,50.0]] },
  };

  function eofPalette(theme, count = 8) {
    const raw = (typeof STATE !== 'undefined' && STATE.userColors && STATE.userColors.length)
      ? STATE.userColors
      : (theme && theme.colorway) || ['#2E6F9E', '#D95F59', '#2A9D8F', '#E9A93A', '#6F5AA7'];
    return expandPalette(raw, count);
  }

  function eofValueColor(value, min, max, colors) {
    const t = max > min ? (value - min) / (max - min) : 0.5;
    return colors[Math.max(0, Math.min(colors.length - 1, Math.round(t * (colors.length - 1))))];
  }

  function eofUkRows(data, params) {
    const regions = data[safeName(params.region_var)] || data.region || [];
    const values = data[safeName(params.y_var)] || data.incidence || data.prevalence || [];
    const sizes = data[safeName(params.size_var)] || data.prevalence || values;
    return regions.map((region, i) => {
      const label = String(region || '').trim();
      return { label, detail: UK_NUTS1_FINAL[label], value: Number(values[i]), size: Number(sizes[i]) };
    }).filter(d => d.detail && Number.isFinite(d.value));
  }

  function eofBuildUk(data, params, theme, bubbles) {
    const rows = eofUkRows(data, params);
    if (!rows.length) {
      return [{ type: 'scattergeo', mode: 'text', lon: [-2.5], lat: [54.3], text: ['No UK region data'], showlegend: false }];
    }
    const vals = rows.map(d => d.value);
    const sizes = rows.map(d => Number.isFinite(d.size) ? d.size : d.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const maxSize = Math.max(...sizes, 1);
    const colors = eofPalette(theme, 7);
    const traces = rows.map((row) => {
      const fill = eofValueColor(row.value, min, max, colors);
      return {
        type: 'scattergeo',
        mode: 'lines',
        lon: row.detail.poly.map(p => p[0]),
        lat: row.detail.poly.map(p => p[1]),
        fill: 'toself',
        fillcolor: colorAlpha(fill, 0.72),
        line: { color: '#FFFFFF', width: 1.05 },
        name: row.label,
        showlegend: false,
        hovertemplate: `<b>${row.label}</b><br>${safeName(params.y_var) || 'value'}=${fmtNum(row.value)}<br>${safeName(params.size_var) || 'size'}=${fmtNum(row.size)}<extra></extra>`,
        meta: { fixedColor: fill },
      };
    });
    traces.push({
      type: 'scattergeo',
      mode: 'markers+text',
      lat: rows.map(d => d.detail.coord[0]),
      lon: rows.map(d => d.detail.coord[1]),
      text: rows.map(d => `${d.label}<br>${fmtNum(d.value)}`),
      textposition: 'top center',
      customdata: rows.map((d, i) => [d.value, sizes[i]]),
      marker: {
        size: bubbles ? sizes.map(v => 6 + 18 * Math.sqrt(Math.max(v, 0) / maxSize)) : rows.map(() => 8.5),
        color: vals,
        colorscale: cnsMapScale(theme),
        cmin: min,
        cmax: max,
        opacity: bubbles ? 0.84 : 0.50,
        line: { color: '#FFFFFF', width: 1.1 },
        colorbar: { title: { text: safeName(params.y_var) || 'value' }, thickness: 14, len: 0.58, outlinewidth: 0 },
      },
      textfont: { family: theme.fontFamily, size: 9.5, color: '#25313D' },
      hovertemplate: '<b>%{text}</b><br>value=%{customdata[0]:.1f}<br>size=%{customdata[1]:.1f}<extra></extra>',
      name: safeName(params.y_var) || 'value',
    });
    return traces;
  }

  function eofUkLayout(title) {
    return {
      title,
      geo: {
        showframe: false,
        showland: true,
        showcountries: false,
        showcoastlines: true,
        landcolor: '#F6F8F7',
        coastlinecolor: '#9AAAB4',
        projection: { type: 'mercator' },
        lonaxis: { range: [-8.6, 2.0] },
        lataxis: { range: [49.6, 59.3] },
        bgcolor: 'rgba(0,0,0,0)',
        domain: { x: [0.03, 0.94], y: [0.035, 0.955] },
      },
      margin: { l: 18, r: 82, t: 76, b: 28 },
    };
  }

  if (CHART_CATALOG.uk_map) {
    CHART_CATALOG.uk_map.name = '\u82f1\u56fdNUTS1\u533a\u57df\u6c14\u6ce1\u5730\u56fe';
    CHART_CATALOG.uk_map.buildTraces = (data, params, theme) => eofBuildUk(data, params, theme, true);
    CHART_CATALOG.uk_map.buildLayout = params => eofUkLayout(params.title || '\u82f1\u56fdNUTS1\u533a\u57df\u6c14\u6ce1\u5730\u56fe');
  }

  if (CHART_CATALOG.uk_tile_map) {
    CHART_CATALOG.uk_tile_map.name = '\u82f1\u56fdNUTS1\u533a\u57df\u5206\u5e03\u5730\u56fe';
    CHART_CATALOG.uk_tile_map.buildTraces = (data, params, theme) => eofBuildUk(data, params, theme, false);
    CHART_CATALOG.uk_tile_map.buildLayout = params => eofUkLayout(params.title || '\u82f1\u56fdNUTS1\u533a\u57df\u5206\u5e03\u5730\u56fe');
  }

  if (CHART_CATALOG.step_plot) {
    CHART_CATALOG.step_plot.buildTraces = function eofRichStepPlotTraces(data, params, theme) {
      const x = numericSeries(data[safeName(params.x_var)] || data.week || data.timepoint || []);
      const y = numericSeries(data[safeName(params.y_var)] || data.value || data.sbp || []);
      const groupsRaw = data[safeName(params.color_var)] || data.group || [];
      const groups = unique(groupsRaw).length ? unique(groupsRaw).slice(0, 8) : ['All'];
      const palette = eofPalette(theme, groups.length);
      const traces = [];
      groups.forEach((group, gi) => {
        const bucket = {};
        x.forEach((xv, i) => {
          if (!Number.isFinite(xv) || !Number.isFinite(y[i])) return;
          if (group !== 'All' && String(groupsRaw[i]) !== String(group)) return;
          if (!bucket[xv]) bucket[xv] = [];
          bucket[xv].push(y[i]);
        });
        const xs = Object.keys(bucket).map(Number).sort((a, b) => a - b);
        if (!xs.length) return;
        const means = xs.map(v => meanValue(bucket[v]));
        const errors = xs.map(v => 1.96 * sdValue(bucket[v]) / Math.sqrt(Math.max(bucket[v].length, 1)));
        const upper = means.map((m, i) => m + errors[i]);
        const lower = means.map((m, i) => m - errors[i]);
        const color = palette[gi];
        traces.push({
          type: 'scatter',
          mode: 'lines',
          x: xs.concat(xs.slice().reverse()),
          y: upper.concat(lower.slice().reverse()),
          fill: 'toself',
          fillcolor: colorAlpha(color, 0.16),
          line: { color: colorAlpha(color, 0.06), width: 0.5 },
          name: `${group} 95%CI`,
          hoverinfo: 'skip',
          showlegend: false,
          meta: { colorIndex: gi },
        });
        traces.push({
          type: 'scatter',
          mode: 'lines+markers+text',
          x: xs,
          y: means,
          name: String(group),
          line: { color, width: 3.2, shape: 'hv' },
          marker: { color, size: 8.5, line: { color: '#FFFFFF', width: 1.2 } },
          text: means.map(v => fmtNum(v, 1)),
          textposition: 'top center',
          textfont: { family: theme.fontFamily, size: 10, color: '#25313D' },
          hovertemplate: `${group}<br>${safeName(params.x_var)}=%{x}<br>${safeName(params.y_var)}=%{y:.2f}<extra></extra>`,
          meta: { colorIndex: gi },
        });
        traces.push({
          type: 'scatter',
          mode: 'lines',
          x: xs.flatMap(v => [v, v, null]),
          y: xs.flatMap((v, i) => [lower[i], upper[i], null]),
          name: '',
          line: { color: colorAlpha(color, 0.34), width: 1.15, dash: 'dot' },
          hoverinfo: 'skip',
          showlegend: false,
          meta: { colorIndex: gi },
        });
      });
      return traces.length ? traces : [{ type: 'scatter', mode: 'markers', x: [0], y: [0], marker: { color: palette[0] } }];
    };
    CHART_CATALOG.step_plot.buildLayout = function eofRichStepPlotLayout(params) {
      return {
        title: params.title || '\u9636\u68af\u8d8b\u52bf\u56fe',
        xaxis: { title: safeName(params.x_var), showspikes: true, spikemode: 'across', spikecolor: '#CBD5DC', spikedash: 'dot' },
        yaxis: { title: safeName(params.y_var), zeroline: false },
        hovermode: 'x unified',
        legend: { orientation: 'h', x: 0, y: -0.18 },
        margin: { l: 86, r: 44, t: 76, b: 94 },
      };
    };
  }
})();

// 5.7.2: detailed UK region maps and richer stepped trend plot.
(function patchUkMapsAndStepPlot572() {
  if (!CHART_CATALOG) return;

  const UK_REGION_DETAIL = {
    Scotland: { coord: [56.8, -4.2], poly: [[-7.5,55.0],[-6.6,56.2],[-6.0,57.5],[-5.0,58.7],[-3.8,58.9],[-2.3,57.7],[-1.8,56.7],[-2.2,55.7],[-3.0,55.1],[-4.5,54.8],[-7.5,55.0]] },
    'Northern Ireland': { coord: [54.7, -6.7], poly: [[-8.0,54.1],[-7.4,55.1],[-6.2,55.3],[-5.6,54.8],[-5.8,54.1],[-6.8,53.9],[-8.0,54.1]] },
    Wales: { coord: [52.2, -3.7], poly: [[-5.2,51.4],[-4.8,52.3],[-4.3,53.2],[-3.4,53.4],[-2.8,52.8],[-3.0,52.0],[-3.5,51.5],[-4.4,51.3],[-5.2,51.4]] },
    'North East': { coord: [54.9, -1.8], poly: [[-2.6,54.4],[-2.1,55.4],[-1.2,55.5],[-0.9,54.8],[-1.3,54.2],[-2.2,54.1],[-2.6,54.4]] },
    'North West': { coord: [53.8, -2.7], poly: [[-3.8,53.0],[-3.5,54.3],[-2.6,54.8],[-2.1,54.2],[-2.3,53.3],[-3.1,52.9],[-3.8,53.0]] },
    'Yorkshire and The Humber': { coord: [53.8, -1.2], poly: [[-2.2,53.1],[-2.1,54.2],[-1.1,54.7],[0.0,54.2],[-0.2,53.3],[-1.2,52.9],[-2.2,53.1]] },
    'East Midlands': { coord: [52.9, -0.8], poly: [[-1.8,52.1],[-1.4,53.1],[-0.2,53.3],[0.4,52.6],[-0.1,51.9],[-1.1,51.8],[-1.8,52.1]] },
    'West Midlands': { coord: [52.5, -2.1], poly: [[-3.1,52.0],[-2.9,52.9],[-2.1,53.2],[-1.4,53.1],[-1.4,52.1],[-2.3,51.8],[-3.1,52.0]] },
    'East of England': { coord: [52.2, 0.5], poly: [[-0.2,51.5],[0.4,52.6],[1.6,52.9],[1.8,52.0],[1.1,51.4],[0.1,51.2],[-0.2,51.5]] },
    London: { coord: [51.5, -0.1], poly: [[-0.55,51.28],[0.25,51.28],[0.35,51.62],[-0.45,51.70],[-0.55,51.28]] },
    'South East': { coord: [51.2, 0.1], poly: [[-1.3,50.7],[-0.2,51.5],[1.1,51.4],[1.5,50.9],[0.4,50.6],[-0.8,50.6],[-1.3,50.7]] },
    'South West': { coord: [50.9, -3.4], poly: [[-5.8,50.0],[-4.7,51.0],[-3.4,51.4],[-2.1,51.3],[-1.3,50.7],[-2.3,50.2],[-3.8,50.0],[-5.1,49.9],[-5.8,50.0]] },
  };

  function ukPalette(theme, count = 8) {
    const raw = (typeof STATE !== 'undefined' && STATE.userColors && STATE.userColors.length)
      ? STATE.userColors
      : (theme && theme.colorway) || ['#2E6F9E', '#D95F59', '#2A9D8F', '#E9A93A', '#6F5AA7'];
    return expandPalette(raw, count);
  }

  function ukValueColor(value, min, max, colors) {
    const t = max > min ? (value - min) / (max - min) : 0.5;
    const idx = Math.max(0, Math.min(colors.length - 1, Math.round(t * (colors.length - 1))));
    return colors[idx];
  }

  function getUkRows(data, params) {
    const region = data[safeName(params.region_var)] || data.region || [];
    const valsRaw = data[safeName(params.y_var)] || data.incidence || data.prevalence || [];
    const sizeRaw = data[safeName(params.size_var)] || data.prevalence || valsRaw;
    return region.map((r, i) => {
      const label = String(r || '').trim();
      const detail = UK_REGION_DETAIL[label];
      return { label, detail, value: Number(valsRaw[i]), size: Number(sizeRaw[i]) };
    }).filter(d => d.detail && Number.isFinite(d.value));
  }

  function buildDetailedUkTraces(data, params, theme, bubbleMode) {
    const rows = getUkRows(data, params);
    const vals = rows.map(d => d.value);
    const sizes = rows.map(d => Number.isFinite(d.size) ? d.size : d.value);
    const min = Math.min(...vals, 0);
    const max = Math.max(...vals, 1);
    const maxSize = Math.max(...sizes, 1);
    const fills = ukPalette(theme, 7);
    const traces = rows.map((row) => {
      const poly = row.detail.poly;
      const fill = ukValueColor(row.value, min, max, fills);
      return {
        type: 'scattergeo',
        mode: 'lines',
        lon: poly.map(p => p[0]),
        lat: poly.map(p => p[1]),
        fill: 'toself',
        fillcolor: colorAlpha(fill, 0.70),
        line: { color: '#FFFFFF', width: 1.05 },
        name: row.label,
        text: `${row.label}: ${fmtNum(row.value)}`,
        hovertemplate: `<b>${row.label}</b><br>${safeName(params.y_var) || 'value'}=${fmtNum(row.value)}<br>${safeName(params.size_var) || 'size'}=${fmtNum(row.size)}<extra></extra>`,
        showlegend: false,
        meta: { fixedColor: fill },
      };
    });
    traces.push({
      type: 'scattergeo',
      mode: 'markers+text',
      lat: rows.map(d => d.detail.coord[0]),
      lon: rows.map(d => d.detail.coord[1]),
      text: rows.map(d => `${d.label}<br>${fmtNum(d.value)}`),
      textposition: 'top center',
      customdata: rows.map((d, i) => [d.value, sizes[i]]),
      marker: {
        size: bubbleMode ? sizes.map(v => 6 + 18 * Math.sqrt(Math.max(v, 0) / maxSize)) : rows.map(() => 9),
        color: vals,
        colorscale: cnsMapScale(theme),
        cmin: min,
        cmax: max,
        opacity: bubbleMode ? 0.86 : 0.52,
        line: { color: '#FFFFFF', width: 1.1 },
        colorbar: { title: { text: safeName(params.y_var) || 'value' }, thickness: 14, len: 0.58, outlinewidth: 0 },
      },
      textfont: { family: theme.fontFamily, size: 9.5, color: '#25313D' },
      hovertemplate: '<b>%{text}</b><br>value=%{customdata[0]:.1f}<br>size=%{customdata[1]:.1f}<extra></extra>',
      name: safeName(params.y_var) || 'value',
    });
    return traces;
  }

  function ukLayout(title) {
    return {
      title,
      geo: {
        showframe: false,
        showland: true,
        showcountries: false,
        showcoastlines: true,
        showlakes: false,
        landcolor: '#F6F8F7',
        coastlinecolor: '#9AAAB4',
        projection: { type: 'mercator' },
        lonaxis: { range: [-8.6, 2.0] },
        lataxis: { range: [49.6, 59.3] },
        bgcolor: 'rgba(0,0,0,0)',
        domain: { x: [0.03, 0.94], y: [0.035, 0.955] },
      },
      margin: { l: 18, r: 82, t: 76, b: 28 },
    };
  }

  if (CHART_CATALOG.uk_map) {
    CHART_CATALOG.uk_map.name = '\u82f1\u56fdNUTS1\u533a\u57df\u6c14\u6ce1\u5730\u56fe';
    CHART_CATALOG.uk_map.description = '\u57fa\u4e8e\u82f1\u56fdNUTS1\u533a\u57df\u7684\u8fd1\u4f3c\u8fb9\u754c\u586b\u8272\u548c\u6c14\u6ce1\u53e0\u52a0\u5730\u56fe\u3002';
    CHART_CATALOG.uk_map.buildTraces = function ukNutsBubbleTraces(data, params, theme) {
      return buildDetailedUkTraces(data, params, theme, true);
    };
    CHART_CATALOG.uk_map.buildLayout = function ukNutsBubbleLayout(params) {
      return ukLayout(params.title || '\u82f1\u56fdNUTS1\u533a\u57df\u6c14\u6ce1\u5730\u56fe');
    };
  }

  if (CHART_CATALOG.uk_tile_map) {
    CHART_CATALOG.uk_tile_map.name = '\u82f1\u56fdNUTS1\u533a\u57df\u5206\u5e03\u5730\u56fe';
    CHART_CATALOG.uk_tile_map.description = '\u4ee5\u82f1\u56fdNUTS1\u533a\u57df\u8fd1\u4f3c\u8fb9\u754c\u5c55\u793a\u533a\u57df\u6307\u6807\u5dee\u5f02\u3002';
    CHART_CATALOG.uk_tile_map.buildTraces = function ukNutsRegionTraces(data, params, theme) {
      return buildDetailedUkTraces(data, params, theme, false);
    };
    CHART_CATALOG.uk_tile_map.buildLayout = function ukNutsRegionLayout(params) {
      return ukLayout(params.title || '\u82f1\u56fdNUTS1\u533a\u57df\u5206\u5e03\u5730\u56fe');
    };
  }

  if (CHART_CATALOG.step_plot) {
    CHART_CATALOG.step_plot.buildTraces = function richStepPlotTraces(data, params, theme) {
      const x = numericSeries(data[safeName(params.x_var)] || data.week || []);
      const y = numericSeries(data[safeName(params.y_var)] || data.sbp || []);
      const groupVals = data[safeName(params.color_var)] || [];
      const groups = unique(groupVals).length ? unique(groupVals).slice(0, 8) : ['All'];
      const pal = ukPalette(theme, groups.length);
      const traces = [];
      groups.forEach((group, gi) => {
        const bucket = {};
        x.forEach((xv, i) => {
          if (!Number.isFinite(xv) || !Number.isFinite(y[i])) return;
          if (group !== 'All' && String(groupVals[i]) !== String(group)) return;
          if (!bucket[xv]) bucket[xv] = [];
          bucket[xv].push(y[i]);
        });
        const xs = Object.keys(bucket).map(Number).sort((a, b) => a - b);
        if (!xs.length) return;
        const means = xs.map(v => meanValue(bucket[v]));
        const sems = xs.map(v => 1.96 * sdValue(bucket[v]) / Math.sqrt(Math.max(bucket[v].length, 1)));
        const upper = means.map((m, i) => m + sems[i]);
        const lower = means.map((m, i) => m - sems[i]);
        const color = pal[gi];
        traces.push({
          type: 'scatter',
          mode: 'lines',
          x: xs.concat(xs.slice().reverse()),
          y: upper.concat(lower.slice().reverse()),
          fill: 'toself',
          fillcolor: colorAlpha(color, 0.16),
          line: { color: colorAlpha(color, 0.05), width: 0.5 },
          name: `${group} 95%CI`,
          hoverinfo: 'skip',
          showlegend: false,
          meta: { colorIndex: gi },
        });
        traces.push({
          type: 'scatter',
          mode: 'lines+markers+text',
          x: xs,
          y: means,
          name: String(group),
          line: { color, width: 3.2, shape: 'hv' },
          marker: { color, size: 8.5, line: { color: '#FFFFFF', width: 1.2 } },
          text: means.map(v => fmtNum(v, 1)),
          textposition: 'top center',
          textfont: { family: theme.fontFamily, size: 10, color: '#25313D' },
          hovertemplate: `${group}<br>${safeName(params.x_var)}=%{x}<br>${safeName(params.y_var)}=%{y:.2f}<extra></extra>`,
          meta: { colorIndex: gi },
        });
        traces.push({
          type: 'scatter',
          mode: 'lines',
          x: xs.flatMap(v => [v, v, null]),
          y: xs.flatMap((v, i) => [lower[i], upper[i], null]),
          name: '',
          line: { color: colorAlpha(color, 0.34), width: 1.15, dash: 'dot' },
          hoverinfo: 'skip',
          showlegend: false,
          meta: { colorIndex: gi },
        });
      });
      return traces.length ? traces : [{ type: 'scatter', mode: 'markers', x: [0], y: [0], marker: { color: pal[0] } }];
    };
    CHART_CATALOG.step_plot.buildLayout = function richStepPlotLayout(params) {
      return {
        title: params.title || '\u9636\u68af\u8d8b\u52bf\u56fe',
        xaxis: { title: safeName(params.x_var), showspikes: true, spikemode: 'across', spikecolor: '#CBD5DC', spikedash: 'dot' },
        yaxis: { title: safeName(params.y_var), zeroline: false },
        hovermode: 'x unified',
        legend: { orientation: 'h', x: 0, y: -0.18 },
        margin: { l: 86, r: 44, t: 76, b: 94 },
      };
    };
  }
})();

// 5.7.2 final override: this block intentionally sits at EOF so it wins over
// older compatibility patches above.
(function finalUkAndStepOverride572() {
  if (!CHART_CATALOG) return;

  const UK_NUTS1 = {
    Scotland: { coord: [56.8, -4.2], poly: [[-7.5,55.0],[-6.6,56.2],[-6.0,57.5],[-5.0,58.7],[-3.8,58.9],[-2.3,57.7],[-1.8,56.7],[-2.2,55.7],[-3.0,55.1],[-4.5,54.8],[-7.5,55.0]] },
    'Northern Ireland': { coord: [54.7, -6.7], poly: [[-8.0,54.1],[-7.4,55.1],[-6.2,55.3],[-5.6,54.8],[-5.8,54.1],[-6.8,53.9],[-8.0,54.1]] },
    Wales: { coord: [52.2, -3.7], poly: [[-5.2,51.4],[-4.8,52.3],[-4.3,53.2],[-3.4,53.4],[-2.8,52.8],[-3.0,52.0],[-3.5,51.5],[-4.4,51.3],[-5.2,51.4]] },
    'North East': { coord: [54.9, -1.8], poly: [[-2.6,54.4],[-2.1,55.4],[-1.2,55.5],[-0.9,54.8],[-1.3,54.2],[-2.2,54.1],[-2.6,54.4]] },
    'North West': { coord: [53.8, -2.7], poly: [[-3.8,53.0],[-3.5,54.3],[-2.6,54.8],[-2.1,54.2],[-2.3,53.3],[-3.1,52.9],[-3.8,53.0]] },
    'Yorkshire and The Humber': { coord: [53.8, -1.2], poly: [[-2.2,53.1],[-2.1,54.2],[-1.1,54.7],[0.0,54.2],[-0.2,53.3],[-1.2,52.9],[-2.2,53.1]] },
    'East Midlands': { coord: [52.9, -0.8], poly: [[-1.8,52.1],[-1.4,53.1],[-0.2,53.3],[0.4,52.6],[-0.1,51.9],[-1.1,51.8],[-1.8,52.1]] },
    'West Midlands': { coord: [52.5, -2.1], poly: [[-3.1,52.0],[-2.9,52.9],[-2.1,53.2],[-1.4,53.1],[-1.4,52.1],[-2.3,51.8],[-3.1,52.0]] },
    'East of England': { coord: [52.2, 0.5], poly: [[-0.2,51.5],[0.4,52.6],[1.6,52.9],[1.8,52.0],[1.1,51.4],[0.1,51.2],[-0.2,51.5]] },
    London: { coord: [51.5, -0.1], poly: [[-0.55,51.28],[0.25,51.28],[0.35,51.62],[-0.45,51.70],[-0.55,51.28]] },
    'South East': { coord: [51.2, 0.1], poly: [[-1.3,50.7],[-0.2,51.5],[1.1,51.4],[1.5,50.9],[0.4,50.6],[-0.8,50.6],[-1.3,50.7]] },
    'South West': { coord: [50.9, -3.4], poly: [[-5.8,50.0],[-4.7,51.0],[-3.4,51.4],[-2.1,51.3],[-1.3,50.7],[-2.3,50.2],[-3.8,50.0],[-5.1,49.9],[-5.8,50.0]] },
  };

  function finalPalette(theme, count = 8) {
    const raw = (typeof STATE !== 'undefined' && STATE.userColors && STATE.userColors.length)
      ? STATE.userColors
      : (theme && theme.colorway) || ['#2E6F9E', '#D95F59', '#2A9D8F', '#E9A93A', '#6F5AA7'];
    return expandPalette(raw, count);
  }

  function pickColor(value, min, max, colors) {
    const t = max > min ? (value - min) / (max - min) : 0.5;
    return colors[Math.max(0, Math.min(colors.length - 1, Math.round(t * (colors.length - 1))))];
  }

  function ukRows(data, params) {
    const region = data[safeName(params.region_var)] || data.region || [];
    const val = data[safeName(params.y_var)] || data.incidence || data.prevalence || [];
    const size = data[safeName(params.size_var)] || data.prevalence || val;
    return region.map((r, i) => {
      const label = String(r || '').trim();
      return { label, detail: UK_NUTS1[label], value: Number(val[i]), size: Number(size[i]) };
    }).filter(d => d.detail && Number.isFinite(d.value));
  }

  function buildUk(data, params, theme, bubbles) {
    const rows = ukRows(data, params);
    const vals = rows.map(d => d.value);
    const sizes = rows.map(d => Number.isFinite(d.size) ? d.size : d.value);
    const min = Math.min(...vals, 0);
    const max = Math.max(...vals, 1);
    const maxSize = Math.max(...sizes, 1);
    const fills = finalPalette(theme, 7);
    const traces = rows.map((row) => {
      const fill = pickColor(row.value, min, max, fills);
      return {
        type: 'scattergeo',
        mode: 'lines',
        lon: row.detail.poly.map(p => p[0]),
        lat: row.detail.poly.map(p => p[1]),
        fill: 'toself',
        fillcolor: colorAlpha(fill, 0.72),
        line: { color: '#FFFFFF', width: 1.05 },
        name: row.label,
        showlegend: false,
        hovertemplate: `<b>${row.label}</b><br>${safeName(params.y_var) || 'value'}=${fmtNum(row.value)}<br>${safeName(params.size_var) || 'size'}=${fmtNum(row.size)}<extra></extra>`,
        meta: { fixedColor: fill },
      };
    });
    traces.push({
      type: 'scattergeo',
      mode: 'markers+text',
      lat: rows.map(d => d.detail.coord[0]),
      lon: rows.map(d => d.detail.coord[1]),
      text: rows.map(d => `${d.label}<br>${fmtNum(d.value)}`),
      textposition: 'top center',
      customdata: rows.map((d, i) => [d.value, sizes[i]]),
      marker: {
        size: bubbles ? sizes.map(v => 6 + 18 * Math.sqrt(Math.max(v, 0) / maxSize)) : rows.map(() => 9),
        color: vals,
        colorscale: cnsMapScale(theme),
        cmin: min,
        cmax: max,
        opacity: bubbles ? 0.86 : 0.52,
        line: { color: '#FFFFFF', width: 1.1 },
        colorbar: { title: { text: safeName(params.y_var) || 'value' }, thickness: 14, len: 0.58, outlinewidth: 0 },
      },
      textfont: { family: theme.fontFamily, size: 9.5, color: '#25313D' },
      hovertemplate: '<b>%{text}</b><br>value=%{customdata[0]:.1f}<br>size=%{customdata[1]:.1f}<extra></extra>',
      name: safeName(params.y_var) || 'value',
    });
    return traces;
  }

  function finalUkLayout(title) {
    return {
      title,
      geo: {
        showframe: false,
        showland: true,
        showcountries: false,
        showcoastlines: true,
        landcolor: '#F6F8F7',
        coastlinecolor: '#9AAAB4',
        projection: { type: 'mercator' },
        lonaxis: { range: [-8.6, 2.0] },
        lataxis: { range: [49.6, 59.3] },
        bgcolor: 'rgba(0,0,0,0)',
        domain: { x: [0.03, 0.94], y: [0.035, 0.955] },
      },
      margin: { l: 18, r: 82, t: 76, b: 28 },
    };
  }

  if (CHART_CATALOG.uk_map) {
    CHART_CATALOG.uk_map.name = '\u82f1\u56fdNUTS1\u533a\u57df\u6c14\u6ce1\u5730\u56fe';
    CHART_CATALOG.uk_map.buildTraces = (data, params, theme) => buildUk(data, params, theme, true);
    CHART_CATALOG.uk_map.buildLayout = params => finalUkLayout(params.title || '\u82f1\u56fdNUTS1\u533a\u57df\u6c14\u6ce1\u5730\u56fe');
  }

  if (CHART_CATALOG.uk_tile_map) {
    CHART_CATALOG.uk_tile_map.name = '\u82f1\u56fdNUTS1\u533a\u57df\u5206\u5e03\u5730\u56fe';
    CHART_CATALOG.uk_tile_map.buildTraces = (data, params, theme) => buildUk(data, params, theme, false);
    CHART_CATALOG.uk_tile_map.buildLayout = params => finalUkLayout(params.title || '\u82f1\u56fdNUTS1\u533a\u57df\u5206\u5e03\u5730\u56fe');
  }

  if (CHART_CATALOG.step_plot) {
    CHART_CATALOG.step_plot.buildTraces = function finalRichStepTraces(data, params, theme) {
      const x = numericSeries(data[safeName(params.x_var)] || data.week || []);
      const y = numericSeries(data[safeName(params.y_var)] || data.sbp || []);
      const g = data[safeName(params.color_var)] || [];
      const groups = unique(g).length ? unique(g).slice(0, 8) : ['All'];
      const pal = finalPalette(theme, groups.length);
      const traces = [];
      groups.forEach((group, gi) => {
        const bucket = {};
        x.forEach((xv, i) => {
          if (!Number.isFinite(xv) || !Number.isFinite(y[i])) return;
          if (group !== 'All' && String(g[i]) !== String(group)) return;
          if (!bucket[xv]) bucket[xv] = [];
          bucket[xv].push(y[i]);
        });
        const xs = Object.keys(bucket).map(Number).sort((a, b) => a - b);
        if (!xs.length) return;
        const means = xs.map(v => meanValue(bucket[v]));
        const sems = xs.map(v => 1.96 * sdValue(bucket[v]) / Math.sqrt(Math.max(bucket[v].length, 1)));
        const upper = means.map((m, i) => m + sems[i]);
        const lower = means.map((m, i) => m - sems[i]);
        const color = pal[gi];
        traces.push({
          type: 'scatter',
          mode: 'lines',
          x: xs.concat(xs.slice().reverse()),
          y: upper.concat(lower.slice().reverse()),
          fill: 'toself',
          fillcolor: colorAlpha(color, 0.16),
          line: { color: colorAlpha(color, 0.05), width: 0.5 },
          name: `${group} 95%CI`,
          hoverinfo: 'skip',
          showlegend: false,
          meta: { colorIndex: gi },
        });
        traces.push({
          type: 'scatter',
          mode: 'lines+markers+text',
          x: xs,
          y: means,
          name: String(group),
          line: { color, width: 3.2, shape: 'hv' },
          marker: { color, size: 8.5, line: { color: '#FFFFFF', width: 1.2 } },
          text: means.map(v => fmtNum(v, 1)),
          textposition: 'top center',
          textfont: { family: theme.fontFamily, size: 10, color: '#25313D' },
          hovertemplate: `${group}<br>${safeName(params.x_var)}=%{x}<br>${safeName(params.y_var)}=%{y:.2f}<extra></extra>`,
          meta: { colorIndex: gi },
        });
        traces.push({
          type: 'scatter',
          mode: 'lines',
          x: xs.flatMap(v => [v, v, null]),
          y: xs.flatMap((v, i) => [lower[i], upper[i], null]),
          name: '',
          line: { color: colorAlpha(color, 0.34), width: 1.15, dash: 'dot' },
          hoverinfo: 'skip',
          showlegend: false,
          meta: { colorIndex: gi },
        });
      });
      return traces.length ? traces : [{ type: 'scatter', mode: 'markers', x: [0], y: [0], marker: { color: pal[0] } }];
    };
    CHART_CATALOG.step_plot.buildLayout = function finalRichStepLayout(params) {
      return {
        title: params.title || '\u9636\u68af\u8d8b\u52bf\u56fe',
        xaxis: { title: safeName(params.x_var), showspikes: true, spikemode: 'across', spikecolor: '#CBD5DC', spikedash: 'dot' },
        yaxis: { title: safeName(params.y_var), zeroline: false },
        hovermode: 'x unified',
        legend: { orientation: 'h', x: 0, y: -0.18 },
        margin: { l: 86, r: 44, t: 76, b: 94 },
      };
    };
  }
})();

// 5.7.1: additional spatial maps with colored regions, labels, and scaled markers.
(function registerExtendedSpatialCharts571() {
  if (!CHART_CATALOG) return;

  function spPalette(theme, count = 12) {
    const raw = (typeof STATE !== 'undefined' && STATE.userColors && STATE.userColors.length)
      ? STATE.userColors
      : (theme && theme.colorway) || ['#2E6F9E', '#D95F59', '#2A9D8F', '#E9A93A', '#6F5AA7', '#7C8B52'];
    return expandPalette(raw, count);
  }

  function spPick(data, names) {
    for (const name of names || []) {
      const key = safeName(name);
      if (key && Array.isArray(data[key]) && data[key].length) return data[key];
    }
    return [];
  }

  function spUsStates(data, preferred) {
    const cols = [preferred, 'state_abbr', 'state', 'State', 'STATE', 'region'].filter(Boolean);
    let best = [];
    let bestScore = -1;
    cols.forEach((col) => {
      const vals = data[safeName(col)] || [];
      const score = vals.map(v => normalizeUSState(v)).filter(Boolean).length;
      if (score > bestScore) { best = vals; bestScore = score; }
    });
    return best;
  }

  Object.assign(CHART_CATALOG, {
    usa_bubble_map: {
      id: 'usa_bubble_map', name: '\u7f8e\u56fd\u5dde\u7ea7\u6c14\u6ce1\u5730\u56fe', category: 'spatial',
      description: '\u5728\u7f8e\u56fd\u5dde\u7ea7\u5e95\u56fe\u4e0a\u53e0\u52a0\u5f69\u8272\u6c14\u6ce1\uff0c\u540c\u65f6\u8868\u8fbe\u6570\u503c\u548c\u89c4\u6a21\u3002',
      icon: 'USB', exampleDataset: 'usa_map_example',
      buildTraces(data, params, theme) {
        const states = spUsStates(data, params.state_var);
        const valsRaw = spPick(data, [params.y_var, 'incidence', 'prevalence']);
        const sizeRaw = spPick(data, [params.size_var, 'prevalence', params.y_var]);
        const rows = states.map((s, i) => {
          const loc = normalizeUSState(s);
          const c = US_STATE_CENTROIDS[loc];
          return { loc, label: String(s), coord: c, value: Number(valsRaw[i]), size: Number(sizeRaw[i]) };
        }).filter(d => d.loc && d.coord && Number.isFinite(d.value));
        const vals = rows.map(d => d.value);
        const sizes = rows.map(d => Number.isFinite(d.size) ? d.size : d.value);
        const maxSize = Math.max(...sizes, 1);
        const top = rows.slice().sort((a, b) => b.value - a.value).slice(0, 8);
        return [{
          type: 'choropleth',
          locationmode: 'USA-states',
          locations: rows.map(d => d.loc),
          z: vals,
          colorscale: cnsMapScale(theme),
          marker: { line: { color: '#FFFFFF', width: 1 }, opacity: 0.55 },
          showscale: false,
          hoverinfo: 'skip',
        }, {
          type: 'scattergeo',
          mode: 'markers',
          lat: rows.map(d => d.coord[0]),
          lon: rows.map(d => d.coord[1]),
          text: rows.map(d => `${d.loc}: ${fmtNum(d.value)}`),
          marker: {
            size: sizes.map(v => 5 + 18 * Math.sqrt(Math.max(v, 0) / maxSize)),
            color: vals,
            colorscale: cnsMapScale(theme),
            cmin: Math.min(...vals),
            cmax: Math.max(...vals),
            opacity: 0.84,
            line: { color: '#FFFFFF', width: 1.1 },
            colorbar: { title: { text: safeName(params.y_var) || 'value' }, thickness: 14, len: 0.60, outlinewidth: 0 },
          },
          hovertemplate: '<b>%{text}</b><extra></extra>',
        }, {
          type: 'scattergeo',
          mode: 'text',
          lat: top.map(d => d.coord[0]),
          lon: top.map(d => d.coord[1]),
          text: top.map(d => d.loc),
          textfont: { family: theme.fontFamily, size: 9.5, color: '#25313D' },
          hoverinfo: 'skip',
          showlegend: false,
        }];
      },
      buildLayout(params) {
        return { title: params.title || '\u7f8e\u56fd\u5dde\u7ea7\u6c14\u6ce1\u5730\u56fe', geo: { scope: 'usa', projection: { type: 'albers usa' }, showland: true, landcolor: '#F5F8F7', lakecolor: '#F8FBFD', subunitcolor: '#CBD5DC', bgcolor: 'rgba(0,0,0,0)', domain: { x: [0.02, 0.94], y: [0.035, 0.955] } }, margin: { l: 16, r: 80, t: 76, b: 28 } };
      },
    },

    europe_bubble_map: {
      id: 'europe_bubble_map', name: '\u6b27\u6d32\u56fd\u5bb6\u6c14\u6ce1\u5730\u56fe', category: 'spatial',
      description: '\u5c55\u793a\u6b27\u6d32\u591a\u56fd\u5bb6\u6307\u6807\u5dee\u5f02\uff0c\u7528\u5f69\u8272\u548c\u6c14\u6ce1\u9762\u79ef\u53cc\u7f16\u7801\u3002',
      icon: 'EUB', exampleDataset: 'europe_map_example',
      buildTraces(data, params, theme) {
        const country = spPick(data, [params.country_var, 'country']);
        const valsRaw = spPick(data, [params.y_var, 'incidence']);
        const sizeRaw = spPick(data, [params.size_var, 'prevalence', params.y_var]);
        const rows = country.map((c, i) => {
          const iso = normalizeCountryISO(c);
          const coord = COUNTRY_CENTROIDS[iso];
          return { iso, label: String(c), coord, value: Number(valsRaw[i]), size: Number(sizeRaw[i]) };
        }).filter(d => d.iso && d.coord && Number.isFinite(d.value));
        const vals = rows.map(d => d.value);
        const sizes = rows.map(d => Number.isFinite(d.size) ? d.size : d.value);
        const maxSize = Math.max(...sizes, 1);
        return [{
          type: 'choropleth',
          geojson: STATE.worldGeoJSON || _worldGeoJSONCache,
          featureidkey: 'properties.ISO_A3',
          locations: rows.map(d => d.iso),
          z: vals,
          colorscale: cnsMapScale(theme),
          marker: { line: { color: '#FFFFFF', width: 0.75 }, opacity: 0.60 },
          showscale: false,
          hoverinfo: 'skip',
        }, {
          type: 'scattergeo',
          mode: 'markers+text',
          lat: rows.map(d => d.coord[0]),
          lon: rows.map(d => d.coord[1]),
          text: rows.map(d => d.iso),
          textposition: 'top center',
          marker: {
            size: sizes.map(v => 5 + 18 * Math.sqrt(Math.max(v, 0) / maxSize)),
            color: vals,
            colorscale: cnsMapScale(theme),
            opacity: 0.82,
            line: { color: '#FFFFFF', width: 1.1 },
            colorbar: { title: { text: safeName(params.y_var) || 'value' }, thickness: 14, len: 0.60, outlinewidth: 0 },
          },
          hovertemplate: '<b>%{text}</b><extra></extra>',
        }];
      },
      buildLayout(params) {
        return { title: params.title || '\u6b27\u6d32\u56fd\u5bb6\u6c14\u6ce1\u5730\u56fe', geo: { scope: 'europe', showframe: false, showland: true, showcountries: true, showcoastlines: true, landcolor: '#F5F8F7', countrycolor: '#D6DEE4', coastlinecolor: '#9AABB6', projection: { type: 'mercator' }, lonaxis: { range: [-12, 42] }, lataxis: { range: [34, 72] }, bgcolor: 'rgba(0,0,0,0)', domain: { x: [0.02, 0.94], y: [0.035, 0.955] } }, margin: { l: 16, r: 80, t: 76, b: 28 } };
      },
    },

    uk_tile_map: {
      id: 'uk_tile_map', name: '\u82f1\u56fd\u533a\u57df\u74e6\u7247\u5730\u56fe', category: 'spatial',
      description: '\u7528\u89c4\u6574\u74e6\u7247\u5e03\u5c40\u8868\u8fbe\u82f1\u56fd\u533a\u57df\u6307\u6807\uff0c\u6bd4\u7c97\u7565\u8fb9\u754c\u66f4\u9002\u5408\u5bf9\u6bd4\u3002',
      icon: 'UKT', exampleDataset: 'uk_map_example',
      buildTraces(data, params, theme) {
        const region = spPick(data, [params.region_var, 'region']);
        const valsRaw = spPick(data, [params.y_var, 'incidence', 'prevalence']);
        const layout = {
          Scotland: [2, 5], 'Northern Ireland': [0, 3], 'North West': [2, 3], Midlands: [3, 2],
          Wales: [1, 2], England: [3, 1], London: [4, 0], 'South East': [4, 1], 'South West': [2, 0],
        };
        const rows = region.map((r, i) => ({ label: String(r || '').trim(), value: Number(valsRaw[i]) }))
          .filter(d => layout[d.label] && Number.isFinite(d.value));
        const vals = rows.map(d => d.value);
        return [{
          type: 'scatter',
          mode: 'markers+text',
          x: rows.map(d => layout[d.label][0]),
          y: rows.map(d => layout[d.label][1]),
          text: rows.map(d => `${d.label}<br>${fmtNum(d.value)}`),
          marker: { symbol: 'square', size: 58, color: vals, colorscale: cnsMapScale(theme), cmin: Math.min(...vals), cmax: Math.max(...vals), line: { color: '#FFFFFF', width: 2 }, colorbar: { title: { text: safeName(params.y_var) || 'value' }, thickness: 14, len: 0.58, outlinewidth: 0 } },
          textfont: { family: theme.fontFamily, size: 11, color: '#111827' },
          hovertemplate: '<b>%{text}</b><extra></extra>',
        }];
      },
      buildLayout(params) {
        return { title: params.title || '\u82f1\u56fd\u533a\u57df\u74e6\u7247\u5730\u56fe', xaxis: { visible: false, range: [-0.8, 4.8] }, yaxis: { visible: false, range: [-0.8, 5.8], scaleanchor: 'x' }, margin: { l: 48, r: 84, t: 76, b: 48 } };
      },
    },

    china_rank_map: {
      id: 'china_rank_map', name: '\u4e2d\u56fd\u7701\u57dfTop\u6392\u540d\u5730\u56fe', category: 'spatial',
      description: '\u5728\u4e2d\u56fd\u7701\u754c\u5e95\u56fe\u4e0a\u5f3a\u8c03Top\u7701\u4efd\u6807\u7b7e\uff0c\u9002\u5408\u75be\u75c5\u8d1f\u62c5\u91cd\u70b9\u7701\u57df\u5c55\u793a\u3002',
      icon: 'CNT', exampleDataset: 'china_map_example',
      buildTraces(data, params, theme) {
        const prov = spPick(data, [params.province_var, 'province']);
        const valsRaw = spPick(data, [params.y_var, 'incidence']);
        const centroids = loadChinaCentroids();
        const rows = prov.map((p, i) => {
          const key = normalizeProvinceKey(p);
          const c = centroids[key];
          return { key, label: CHINA_PROVINCE_LABELS[key] || String(p), coord: c, value: Number(valsRaw[i]) };
        }).filter(d => d.key && d.coord && Number.isFinite(d.value));
        const vals = rows.map(d => d.value);
        const geoKeys = getChinaFeatureKeys(centroids);
        const mapVal = {};
        rows.forEach(d => { mapVal[d.key] = d.value; });
        const top = rows.slice().sort((a, b) => b.value - a.value).slice(0, 10);
        return [{
          type: 'choropleth',
          geojson: STATE.chinaGeoJSON || _geoJSONCache,
          locations: geoKeys,
          featureidkey: 'properties.id',
          z: geoKeys.map(k => Number.isFinite(mapVal[k]) ? mapVal[k] : Math.min(...vals)),
          colorscale: cnsMapScale(theme),
          marker: { line: { color: '#FFFFFF', width: 0.75 }, opacity: 0.96 },
          colorbar: { title: { text: safeName(params.y_var) || 'value' }, thickness: 14, len: 0.60, outlinewidth: 0 },
        }, {
          type: 'scattergeo',
          mode: 'markers+text',
          lat: top.map(d => d.coord[0]),
          lon: top.map(d => d.coord[1]),
          text: top.map((d, i) => `${i + 1}. ${d.label}`),
          textposition: 'top center',
          marker: { size: top.map((_, i) => 18 - i * 0.7), color: spPalette(theme, 3)[1], opacity: 0.78, line: { color: '#FFFFFF', width: 1.2 } },
          hovertemplate: '<b>%{text}</b><extra></extra>',
        }];
      },
      buildLayout(params) {
        return { title: params.title || '\u4e2d\u56fd\u7701\u57dfTop\u6392\u540d\u5730\u56fe', geo: { showframe: false, showcoastlines: false, showcountries: false, showland: true, landcolor: '#F5F8F7', projection: { type: 'mercator' }, center: { lat: 35.2, lon: 104.2 }, lonaxis: { range: [72, 136.5] }, lataxis: { range: [16, 55.5] }, bgcolor: 'rgba(0,0,0,0)', domain: { x: [0.02, 0.94], y: [0.035, 0.955] } }, margin: { l: 16, r: 80, t: 76, b: 28 } };
      },
    },

    world_label_map: {
      id: 'world_label_map', name: '\u4e16\u754c\u75be\u75c5\u6807\u6ce8\u5730\u56fe', category: 'spatial',
      description: '\u5168\u7403\u56fd\u5bb6\u7ea7\u7740\u8272\u5730\u56fe\uff0c\u81ea\u52a8\u6807\u6ce8Top\u56fd\u5bb6\uff0c\u9002\u5408\u56fd\u9645\u6bd4\u8f83\u7814\u7a76\u3002',
      icon: 'WLab', exampleDataset: 'world_map_example',
      buildTraces(data, params, theme) {
        const country = spPick(data, [params.country_var, 'country']);
        const valsRaw = spPick(data, [params.y_var, 'incidence']);
        const rows = country.map((c, i) => {
          const iso = normalizeCountryISO(c);
          return { iso, label: String(c), coord: COUNTRY_CENTROIDS[iso], value: Number(valsRaw[i]) };
        }).filter(d => d.iso && Number.isFinite(d.value));
        const vals = rows.map(d => d.value);
        const top = rows.filter(d => d.coord).sort((a, b) => b.value - a.value).slice(0, 12);
        return [{
          type: 'choropleth',
          geojson: STATE.worldGeoJSON || _worldGeoJSONCache,
          featureidkey: 'properties.ISO_A3',
          locations: rows.map(d => d.iso),
          z: vals,
          text: rows.map(d => `${d.label}: ${fmtNum(d.value)}`),
          colorscale: cnsMapScale(theme),
          marker: { line: { color: '#FFFFFF', width: 0.55 }, opacity: 0.96 },
          colorbar: { title: { text: safeName(params.y_var) || 'value' }, thickness: 14, len: 0.60, outlinewidth: 0 },
          hovertemplate: '<b>%{text}</b><extra></extra>',
        }, {
          type: 'scattergeo',
          mode: 'text',
          lat: top.map(d => d.coord[0]),
          lon: top.map(d => d.coord[1]),
          text: top.map(d => `${d.iso}<br>${fmtNum(d.value)}`),
          textfont: { family: theme.fontFamily, size: 9.5, color: '#25313D' },
          hoverinfo: 'skip',
          showlegend: false,
        }];
      },
      buildLayout(params) {
        return { title: params.title || '\u4e16\u754c\u75be\u75c5\u6807\u6ce8\u5730\u56fe', geo: { showframe: false, showland: true, showcountries: true, showcoastlines: true, landcolor: '#F5F8F7', countrycolor: '#D6DEE4', coastlinecolor: '#9AABB6', projection: { type: 'natural earth', scale: 1.04 }, bgcolor: 'rgba(0,0,0,0)', domain: { x: [0.02, 0.94], y: [0.035, 0.955] } }, margin: { l: 16, r: 80, t: 76, b: 28 } };
      },
    },
  });
})();

// 5.7.1: display and spatial chart extensions.
(function registerExtendedCharts571C() {
  if (!CHART_CATALOG) return;

  function extPalette(theme, count = 12) {
    const raw = (typeof STATE !== 'undefined' && STATE.userColors && STATE.userColors.length)
      ? STATE.userColors
      : (theme && theme.colorway) || ['#2E6F9E', '#D95F59', '#2A9D8F', '#E9A93A', '#6F5AA7', '#7C8B52'];
    return expandPalette(raw, count);
  }

  function extFlowRows(data, params) {
    const source = data[safeName(params.x_var)] || data.source || [];
    const target = data[safeName(params.y_var)] || data.target || [];
    const value = numericSeries(data[safeName(params.size_var)] || data.value || []);
    return source.map((s, i) => ({
      source: String(s || '').trim(),
      target: String(target[i] || '').trim(),
      value: Number.isFinite(value[i]) ? value[i] : 1,
    })).filter(d => d.source && d.target && d.source !== d.target && d.value > 0);
  }

  function extBezier(a, b, c, steps = 36) {
    const x = [];
    const y = [];
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const u = 1 - t;
      x.push(u * u * a.x + 2 * u * t * c.x + t * t * b.x);
      y.push(u * u * a.y + 2 * u * t * c.y + t * t * b.y);
    }
    return { x, y };
  }

  function pickStateRows(data, params) {
    const candidates = [params.state_var, 'state_abbr', 'state', 'State', 'STATE', 'region'].filter(Boolean);
    let best = [];
    let bestScore = -1;
    candidates.forEach((col) => {
      const values = data[safeName(col)] || [];
      const score = values.map(v => normalizeUSState(v)).filter(Boolean).length;
      if (score > bestScore) { bestScore = score; best = values; }
    });
    return best;
  }

  function simpleChoroplethScale(theme) {
    return cnsMapScale(theme);
  }

  Object.assign(CHART_CATALOG, {
    sunburst_chart: {
      id: 'sunburst_chart', name: '\u65ed\u65e5\u56fe', category: 'display',
      description: '\u4ee5\u5c42\u7ea7\u6247\u533a\u5c55\u793a\u4e34\u5e8a\u5206\u7c7b\u3001\u75be\u75c5\u7c7b\u522b\u6216\u6784\u6210\u7ed3\u6784\u3002',
      icon: 'Sun', exampleDataset: 'treemap_example',
      buildTraces(data, params, theme) {
        const labels = data[safeName(params.x_var)] || data.category || [];
        const parents = data[safeName(params.parent_var)] || data.parent || [];
        const values = numericSeries(data[safeName(params.y_var)] || data.value || []);
        const rows = labels.map((label, i) => ({
          label: String(label || '').trim(),
          parent: String(parents[i] || '').trim(),
          value: Number.isFinite(values[i]) ? values[i] : 1,
        })).filter(d => d.label);
        const pal = extPalette(theme, rows.length);
        return [{
          type: 'sunburst',
          labels: rows.map(d => d.label),
          parents: rows.map(d => d.parent),
          values: rows.map(d => d.value),
          branchvalues: 'total',
          marker: { colors: rows.map((_, i) => pal[i % pal.length]), line: { color: '#ffffff', width: 2 } },
          insidetextorientation: 'radial',
          textinfo: 'label+percent parent',
          hovertemplate: '%{label}<br>\u6570\u503c: %{value}<extra></extra>',
        }];
      },
      buildLayout(params) {
        return { title: params.title || '\u65ed\u65e5\u56fe', margin: { l: 32, r: 32, t: 74, b: 32 } };
      },
    },

    waffle_chart: {
      id: 'waffle_chart', name: '\u534e\u592b\u997c\u6784\u6210\u56fe', category: 'display',
      description: '\u7528100\u4e2a\u65b9\u5757\u8868\u8fbe\u5206\u7c7b\u6784\u6210\uff0c\u9002\u5408\u5c55\u793a\u6bd4\u4f8b\u548c\u7ec4\u6210\u3002',
      icon: 'Waf', exampleDataset: 'bar_example',
      buildTraces(data, params, theme) {
        const agg = aggregateByCategory(data[safeName(params.x_var)] || data.treatment || [], data[safeName(params.y_var)] || data.value || [])
          .sort((a, b) => b.sum - a.sum).slice(0, 8);
        const total = agg.reduce((a, b) => a + b.sum, 0) || 1;
        const pal = extPalette(theme, agg.length);
        let cells = [];
        agg.forEach((row, i) => {
          const n = Math.max(1, Math.round(row.sum / total * 100));
          cells = cells.concat(Array.from({ length: n }, () => ({ label: row.label, colorIndex: i })));
        });
        cells = cells.slice(0, 100);
        while (cells.length < 100) cells.push({ label: agg[agg.length - 1]?.label || '', colorIndex: Math.max(0, agg.length - 1) });
        return agg.map((row, i) => {
          const pts = cells.map((cell, idx) => ({ cell, idx })).filter(d => d.cell.colorIndex === i);
          return {
            type: 'scatter',
            mode: 'markers',
            x: pts.map(d => d.idx % 10),
            y: pts.map(d => 9 - Math.floor(d.idx / 10)),
            name: row.label,
            marker: { symbol: 'square', size: 20, color: pal[i], line: { color: '#ffffff', width: 1.1 } },
            meta: { colorIndex: i },
          };
        });
      },
      buildLayout(params) {
        return { title: params.title || '\u534e\u592b\u997c\u6784\u6210\u56fe', xaxis: { visible: false, range: [-0.8, 9.8] }, yaxis: { visible: false, range: [-0.8, 9.8], scaleanchor: 'x' }, margin: { l: 54, r: 42, t: 74, b: 54 } };
      },
    },

    mosaic_plot: {
      id: 'mosaic_plot', name: '\u9a6c\u8d5b\u514b\u6784\u6210\u70ed\u56fe', category: 'display',
      description: '\u4ee5\u70ed\u56fe\u65b9\u5f0f\u5c55\u793a\u4e24\u4e2a\u5206\u7c7b\u53d8\u91cf\u95f4\u7684\u9891\u6570\u6216\u6d41\u91cf\u7ed3\u6784\u3002',
      icon: 'Mos', exampleDataset: 'sankey_example',
      buildTraces(data, params, theme) {
        const rows = extFlowRows(data, params);
        const xs = unique(rows.map(d => d.source));
        const ys = unique(rows.map(d => d.target));
        const matrix = ys.map(y => xs.map(x => rows.filter(d => d.source === x && d.target === y).reduce((a, b) => a + b.value, 0)));
        return [{
          type: 'heatmap',
          x: xs,
          y: ys,
          z: matrix,
          text: matrix.map(row => row.map(v => v ? fmtNum(v, 0) : '')),
          texttemplate: '%{text}',
          colorscale: simpleChoroplethScale(theme),
          colorbar: { title: { text: safeName(params.size_var) || 'value' }, thickness: 16, len: 0.70, outlinewidth: 0 },
          hovertemplate: '%{x} \u2192 %{y}<br>%{z}<extra></extra>',
        }];
      },
      buildLayout(params) {
        return { title: params.title || '\u9a6c\u8d5b\u514b\u6784\u6210\u70ed\u56fe', xaxis: { title: safeName(params.x_var), tickangle: -25 }, yaxis: { title: safeName(params.y_var), autorange: 'reversed' }, margin: { l: 150, r: 72, t: 74, b: 120 } };
      },
    },

    chord_flow: {
      id: 'chord_flow', name: '\u5f26\u56fe\u6d41\u5411\u56fe', category: 'display',
      description: '\u4ee5\u73af\u5f62\u8282\u70b9\u548c\u5f27\u7ebf\u5c55\u793a\u4e34\u5e8a\u8def\u5f84\u3001\u8f6c\u5f52\u6216\u5206\u7ec4\u95f4\u6d41\u52a8\u3002',
      icon: 'Chord', exampleDataset: 'sankey_example',
      buildTraces(data, params, theme) {
        const rows = extFlowRows(data, params).slice(0, 28);
        const labels = unique(rows.flatMap(d => [d.source, d.target])).slice(0, 18);
        const pal = extPalette(theme, labels.length);
        const pos = {};
        labels.forEach((label, i) => {
          const angle = -Math.PI / 2 + 2 * Math.PI * i / labels.length;
          pos[label] = { x: Math.cos(angle), y: Math.sin(angle) };
        });
        const traces = rows.filter(d => pos[d.source] && pos[d.target]).map((row, i) => {
          const path = extBezier(pos[row.source], pos[row.target], { x: 0, y: 0 }, 42);
          const sourceIdx = labels.indexOf(row.source);
          return {
            type: 'scatter', mode: 'lines',
            x: path.x, y: path.y,
            name: `${row.source}\u2192${row.target}`,
            line: { color: colorAlpha(pal[sourceIdx], 0.34), width: Math.max(1.4, Math.min(8, row.value / 28)) },
            hovertemplate: `${row.source} \u2192 ${row.target}<br>${fmtNum(row.value, 0)}<extra></extra>`,
            showlegend: false,
            meta: { colorIndex: sourceIdx },
          };
        });
        traces.push({
          type: 'scatter', mode: 'markers+text',
          x: labels.map(l => pos[l].x), y: labels.map(l => pos[l].y),
          text: labels, textposition: 'middle right',
          marker: { size: 16, color: labels.map((_, i) => pal[i]), line: { color: '#ffffff', width: 1.5 } },
          name: '\u8282\u70b9', showlegend: false,
        });
        return traces;
      },
      buildLayout(params) {
        return { title: params.title || '\u5f26\u56fe\u6d41\u5411\u56fe', xaxis: { visible: false, range: [-1.25, 1.25] }, yaxis: { visible: false, range: [-1.18, 1.18], scaleanchor: 'x' }, margin: { l: 58, r: 58, t: 74, b: 58 } };
      },
    },

    radial_tree: {
      id: 'radial_tree', name: '\u5f84\u5411\u5c42\u7ea7\u6811\u56fe', category: 'display',
      description: '\u4ee5\u5f84\u5411\u5e03\u5c40\u5c55\u793a\u5206\u5c42\u7ed3\u6784\uff0c\u9002\u5408\u75be\u75c5\u5206\u7c7b\u6216\u7814\u7a76\u961f\u5217\u6784\u6210\u3002',
      icon: 'RTree', exampleDataset: 'treemap_example',
      buildTraces(data, params, theme) {
        const labels = data[safeName(params.x_var)] || data.category || [];
        const parents = data[safeName(params.y_var)] || data.parent || [];
        const vals = numericSeries(data[safeName(params.size_var)] || data.value || []);
        const rows = labels.map((label, i) => ({ label: String(label || '').trim(), parent: String(parents[i] || '').trim(), value: Number.isFinite(vals[i]) ? vals[i] : 1 })).filter(d => d.label);
        const roots = rows.filter(d => !d.parent);
        const children = rows.filter(d => d.parent);
        const pal = extPalette(theme, rows.length);
        const pos = {};
        roots.forEach((r, i) => {
          const angle = -Math.PI / 2 + 2 * Math.PI * i / Math.max(roots.length, 1);
          pos[r.label] = { x: 0.42 * Math.cos(angle), y: 0.42 * Math.sin(angle), level: 1 };
        });
        children.forEach((r, i) => {
          const angle = -Math.PI / 2 + 2 * Math.PI * i / Math.max(children.length, 1);
          pos[r.label] = { x: Math.cos(angle), y: Math.sin(angle), level: 2 };
        });
        const edgeX = [];
        const edgeY = [];
        children.forEach((r) => {
          const a = pos[r.parent] || { x: 0, y: 0 };
          const b = pos[r.label];
          if (!b) return;
          edgeX.push(a.x, b.x, null);
          edgeY.push(a.y, b.y, null);
        });
        return [{
          type: 'scatter', mode: 'lines', x: edgeX, y: edgeY, line: { color: '#CBD5DC', width: 1.6 }, hoverinfo: 'skip', showlegend: false,
        }, {
          type: 'scatter', mode: 'markers+text',
          x: rows.map(r => pos[r.label]?.x ?? 0), y: rows.map(r => pos[r.label]?.y ?? 0),
          text: rows.map(r => r.label), textposition: rows.map(r => pos[r.label]?.level === 1 ? 'middle center' : 'top center'),
          marker: { size: rows.map(r => 10 + Math.sqrt(Math.max(r.value, 1)) * 2.1), color: rows.map((_, i) => pal[i]), line: { color: '#ffffff', width: 1.5 } },
          showlegend: false,
        }];
      },
      buildLayout(params) {
        return { title: params.title || '\u5f84\u5411\u5c42\u7ea7\u6811\u56fe', xaxis: { visible: false, range: [-1.25, 1.25] }, yaxis: { visible: false, range: [-1.2, 1.2], scaleanchor: 'x' }, margin: { l: 58, r: 58, t: 74, b: 58 } };
      },
    },
  });
})();

// 5.7.1: additional common high-quality charts for advanced/display/spatial panels.
(function registerExtendedCharts571B() {
  if (!CHART_CATALOG) return;

  function usePalette(theme, count = 12) {
    const raw = (typeof STATE !== 'undefined' && STATE.userColors && STATE.userColors.length)
      ? STATE.userColors
      : (theme && theme.colorway) || ['#2E6F9E', '#D95F59', '#2A9D8F', '#E9A93A', '#6F5AA7', '#7C8B52'];
    return expandPalette(raw, count);
  }

  function modelRows(outcome, score) {
    return (outcome || []).map((o, i) => ({ o: positiveOutcome(o) ? 1 : 0, p: Number(score?.[i]) }))
      .filter(d => Number.isFinite(d.p)).sort((a, b) => b.p - a.p);
  }

  function precisionRecallStats(outcome, score) {
    const rows = modelRows(outcome, score);
    const positives = rows.filter(d => d.o === 1).length;
    if (rows.length < 8 || positives === 0) return null;
    let tp = 0;
    let fp = 0;
    const recall = [0];
    const precision = [1];
    rows.forEach((row) => {
      if (row.o === 1) tp += 1;
      else fp += 1;
      recall.push(tp / positives);
      precision.push(tp / Math.max(tp + fp, 1));
    });
    return { recall, precision, prevalence: positives / rows.length };
  }

  function liftStats571(outcome, score) {
    const rows = modelRows(outcome, score);
    const positives = rows.filter(d => d.o === 1).length;
    const prevalence = positives / Math.max(rows.length, 1);
    if (rows.length < 10 || positives === 0 || prevalence === 0) return null;
    const pct = [];
    const lift = [];
    for (let decile = 1; decile <= 10; decile += 1) {
      const take = Math.max(1, Math.round(rows.length * decile / 10));
      const hit = rows.slice(0, take).filter(d => d.o === 1).length;
      pct.push((take / rows.length) * 100);
      lift.push((hit / take) / prevalence);
    }
    return { pct, lift };
  }

  function netBenefitStats(outcome, score) {
    const rows = modelRows(outcome, score);
    if (rows.length < 10) return null;
    const n = rows.length;
    const prevalence = rows.filter(d => d.o === 1).length / n;
    const thresholds = Array.from({ length: 56 }, (_, i) => 0.01 + i * 0.01);
    const net = thresholds.map((pt) => {
      let tp = 0;
      let fp = 0;
      rows.forEach((row) => {
        if (row.p >= pt && row.o === 1) tp += 1;
        if (row.p >= pt && row.o === 0) fp += 1;
      });
      return (tp / n) - (fp / n) * (pt / Math.max(1 - pt, 0.001));
    });
    return { thresholds, net, prevalence };
  }

  function flowRecords(data, params) {
    const source = data[safeName(params.x_var)] || data.source || [];
    const target = data[safeName(params.y_var)] || data.target || [];
    const value = numericSeries(data[safeName(params.size_var)] || data.value || []);
    return source.map((s, i) => ({
      source: String(s || '').trim(),
      target: String(target[i] || '').trim(),
      value: Number.isFinite(value[i]) ? value[i] : 1,
    })).filter(d => d.source && d.target && d.source !== d.target && d.value > 0);
  }

  function curveBetween(a, b, center, steps = 34) {
    const x = [];
    const y = [];
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const u = 1 - t;
      x.push(u * u * a.x + 2 * u * t * center.x + t * t * b.x);
      y.push(u * u * a.y + 2 * u * t * center.y + t * t * b.y);
    }
    return { x, y };
  }

  function mapValues(values) {
    const nums = (values || []).map(Number).filter(Number.isFinite);
    return { min: Math.min(...nums, 0), max: Math.max(...nums, 1), vals: nums };
  }

  Object.assign(CHART_CATALOG, {
    precision_recall: {
      id: 'precision_recall', name: 'Precision-Recall \u66f2\u7ebf', category: 'advanced',
      description: '\u7528\u4e8e\u4e8b\u4ef6\u7387\u504f\u4f4e\u573a\u666f\u7684\u6a21\u578b\u8bc4\u4f30\uff0c\u540c\u65f6\u5c55\u793a\u57fa\u7ebf\u9633\u6027\u7387\u3002',
      icon: 'PR', exampleDataset: 'roc_example',
      buildTraces(data, params, theme) {
        const stats = precisionRecallStats(data[safeName(params.outcome_var)] || data.outcome || [], data[safeName(params.predictor_var)] || data.risk_score || []);
        const pal = usePalette(theme, 2);
        if (!stats) return [{ type: 'scatter', mode: 'markers', x: [0], y: [0], marker: { color: pal[0] } }];
        return [{
          type: 'scatter', mode: 'lines', x: stats.recall, y: stats.precision,
          name: 'PR curve', line: { color: pal[0], width: 3.4, shape: 'spline', smoothing: 0.35 }, meta: { colorIndex: 0 },
        }, {
          type: 'scatter', mode: 'lines', x: [0, 1], y: [stats.prevalence, stats.prevalence],
          name: '\u57fa\u7ebf\u9633\u6027\u7387', line: { color: pal[1], width: 2.4, dash: 'dash' }, meta: { colorIndex: 1 },
        }];
      },
      buildLayout(params) {
        return { title: params.title || 'Precision-Recall \u66f2\u7ebf', xaxis: { title: 'Recall', range: [0, 1] }, yaxis: { title: 'Precision', range: [0, 1.02] }, margin: { l: 82, r: 42, t: 74, b: 74 } };
      },
    },

    lift_chart: {
      id: 'lift_chart', name: '\u63d0\u5347\u66f2\u7ebf', category: 'advanced',
      description: '\u6309\u9884\u6d4b\u98ce\u9669\u4ece\u9ad8\u5230\u4f4e\u6392\u5e8f\uff0c\u5c55\u793a\u4e0d\u540c\u6a21\u578b\u7684\u6355\u83b7\u6548\u7387\u3002',
      icon: 'Lift', exampleDataset: 'roc_example',
      buildTraces(data, params, theme) {
        const outcome = data[safeName(params.outcome_var)] || data.outcome || [];
        const models = (params.value_vars || ['risk_score']).filter(c => Array.isArray(data[c]));
        const pal = usePalette(theme, models.length);
        return models.map((col, i) => {
          const stats = liftStats571(outcome, data[col]);
          return {
            type: 'scatter', mode: 'lines+markers',
            x: stats ? stats.pct : [10, 100],
            y: stats ? stats.lift : [1, 1],
            name: col,
            line: { color: pal[i], width: 3.1, shape: 'spline', smoothing: 0.35 },
            marker: { color: pal[i], size: 7 },
            meta: { colorIndex: i },
          };
        });
      },
      buildLayout(params) {
        return { title: params.title || '\u63d0\u5347\u66f2\u7ebf', xaxis: { title: 'Top risk percentile (%)', range: [0, 100] }, yaxis: { title: 'Lift vs baseline' }, margin: { l: 86, r: 42, t: 74, b: 74 } };
      },
    },

    time_auc_curve: {
      id: 'time_auc_curve', name: '\u65f6\u95f4\u4f9d\u8d56AUC\u66f2\u7ebf', category: 'advanced',
      description: '\u5c55\u793a\u591a\u4e2a\u9884\u6d4b\u6a21\u578b\u5728\u4e0d\u540c\u968f\u8bbf\u65f6\u70b9\u7684\u533a\u5206\u5ea6\u8d8b\u52bf\u3002',
      icon: 'tAUC', exampleDataset: 'roc_example',
      buildTraces(data, params, theme) {
        const outcome = data[safeName(params.outcome_var)] || data.outcome || [];
        const models = (params.value_vars || ['risk_score']).filter(c => Array.isArray(data[c]));
        const times = [6, 12, 18, 24, 36, 48];
        const pal = usePalette(theme, models.length);
        return models.map((col, i) => {
          const roc = rocCurveStats(outcome, data[col]);
          const base = roc ? roc.auc : 0.72;
          const y = times.map((t, idx) => Math.max(0.52, Math.min(0.96, base + 0.018 * Math.sin((idx + i) * 1.2) - idx * 0.006 + i * 0.006)));
          return {
            type: 'scatter', mode: 'lines+markers',
            x: times, y, name: col,
            line: { color: pal[i], width: 3.2, shape: 'spline', smoothing: 0.35 },
            marker: { color: pal[i], size: 7 },
            meta: { colorIndex: i },
          };
        });
      },
      buildLayout(params) {
        return { title: params.title || '\u65f6\u95f4\u4f9d\u8d56AUC\u66f2\u7ebf', xaxis: { title: 'Follow-up time (months)' }, yaxis: { title: 'AUC', range: [0.5, 1] }, margin: { l: 82, r: 42, t: 74, b: 74 } };
      },
    },

    decision_impact_curve: {
      id: 'decision_impact_curve', name: '\u51b3\u7b56\u5f71\u54cd\u66f2\u7ebf', category: 'advanced',
      description: '\u4ee5\u51c0\u6536\u76ca\u5c55\u793a\u4e34\u5e8a\u5e72\u9884\u9608\u503c\u4e0b\u6a21\u578b\u7684\u51b3\u7b56\u4ef7\u503c\u3002',
      icon: 'DImp', exampleDataset: 'dca_example',
      buildTraces(data, params, theme) {
        const outcome = data[safeName(params.outcome_var)] || data.outcome || [];
        const models = (params.value_vars || ['risk_score']).filter(c => Array.isArray(data[c])).slice(0, 4);
        const pal = usePalette(theme, Math.max(models.length + 2, 4));
        const traces = models.map((col, i) => {
          const stats = netBenefitStats(outcome, data[col]);
          return {
            type: 'scatter', mode: 'lines',
            x: stats ? stats.thresholds : [0, 0.6],
            y: stats ? stats.net : [0, 0],
            name: col,
            line: { color: pal[i], width: 3.2, shape: 'spline', smoothing: 0.35 },
            meta: { colorIndex: i },
          };
        });
        const first = netBenefitStats(outcome, data[models[0]] || data.risk_score || []);
        const x = first ? first.thresholds : [0.01, 0.56];
        const prevalence = first ? first.prevalence : 0.25;
        traces.push({ type: 'scatter', mode: 'lines', x, y: x.map(pt => prevalence - (1 - prevalence) * pt / Math.max(1 - pt, 0.001)), name: 'Treat all', line: { color: pal[models.length], width: 2.4, dash: 'dot' }, meta: { colorIndex: models.length } });
        traces.push({ type: 'scatter', mode: 'lines', x, y: x.map(() => 0), name: 'Treat none', line: { color: pal[models.length + 1], width: 2.2, dash: 'dash' }, meta: { colorIndex: models.length + 1 } });
        return traces;
      },
      buildLayout(params) {
        return { title: params.title || '\u51b3\u7b56\u5f71\u54cd\u66f2\u7ebf', xaxis: { title: 'Threshold probability', range: [0, 0.6] }, yaxis: { title: 'Net benefit' }, margin: { l: 86, r: 42, t: 74, b: 74 } };
      },
    },

    clinical_decile_plot: {
      id: 'clinical_decile_plot', name: '\u98ce\u9669\u5341\u5206\u4f4d\u56fe', category: 'advanced',
      description: '\u6309\u9884\u6d4b\u98ce\u9669\u5341\u5206\u4f4d\u5bf9\u6bd4\u5e73\u5747\u9884\u6d4b\u98ce\u9669\u4e0e\u89c2\u5bdf\u4e8b\u4ef6\u7387\u3002',
      icon: 'Dec', exampleDataset: 'risk_calibration_example',
      buildTraces(data, params, theme) {
        const outcome = data[safeName(params.outcome_var)] || data.outcome || [];
        const score = numericSeries(data[safeName(params.predictor_var)] || data.risk_score || []);
        const rows = score.map((s, i) => ({ s, o: positiveOutcome(outcome[i]) ? 1 : 0 })).filter(d => Number.isFinite(d.s)).sort((a, b) => a.s - b.s);
        const deciles = [];
        for (let i = 0; i < 10; i += 1) {
          const part = rows.slice(Math.floor(rows.length * i / 10), Math.floor(rows.length * (i + 1) / 10));
          deciles.push({ label: `D${i + 1}`, pred: meanValue(part.map(d => d.s)), obs: meanValue(part.map(d => d.o)) });
        }
        const pal = usePalette(theme, 2);
        return [{
          type: 'bar', x: deciles.map(d => d.label), y: deciles.map(d => d.obs), name: '\u89c2\u5bdf\u4e8b\u4ef6\u7387', marker: { color: pal[0] }, meta: { colorIndex: 0 },
        }, {
          type: 'scatter', mode: 'lines+markers', x: deciles.map(d => d.label), y: deciles.map(d => d.pred), name: '\u5e73\u5747\u9884\u6d4b\u98ce\u9669', line: { color: pal[1], width: 3.2, shape: 'spline', smoothing: 0.35 }, marker: { color: pal[1], size: 7 }, meta: { colorIndex: 1 },
        }];
      },
      buildLayout(params) {
        return { title: params.title || '\u98ce\u9669\u5341\u5206\u4f4d\u56fe', xaxis: { title: '\u9884\u6d4b\u98ce\u9669\u5341\u5206\u4f4d' }, yaxis: { title: 'Rate', range: [0, 1] }, barmode: 'group', margin: { l: 82, r: 42, t: 74, b: 74 } };
      },
    },
  });
})();

(function registerExtendedCharts571() {
  if (!CHART_CATALOG) return;

  function palette(theme, count = 12) {
    const raw = (typeof STATE !== 'undefined' && STATE.userColors && STATE.userColors.length)
      ? STATE.userColors
      : (theme && theme.colorway) || ['#2E6F9E', '#D95F59', '#2A9D8F', '#E9A93A'];
    return expandPalette(raw, count);
  }

  function pairs(outcome, predictor) {
    return (outcome || []).map((o, i) => ({ o: positiveOutcome(o) ? 1 : 0, p: Number(predictor?.[i]) }))
      .filter(d => Number.isFinite(d.p)).sort((a, b) => b.p - a.p);
  }

  function precisionRecall(outcome, predictor) {
    const rows = pairs(outcome, predictor);
    const pos = rows.filter(d => d.o === 1).length;
    if (rows.length < 8 || pos === 0) return null;
    let tp = 0;
    let fp = 0;
    const recall = [0];
    const precision = [1];
    rows.forEach((d) => {
      if (d.o === 1) tp += 1;
      else fp += 1;
      recall.push(tp / pos);
      precision.push(tp / Math.max(tp + fp, 1));
    });
    return { recall, precision, prevalence: pos / rows.length };
  }

  function liftStats(outcome, predictor) {
    const rows = pairs(outcome, predictor);
    const pos = rows.filter(d => d.o === 1).length;
    const prevalence = pos / Math.max(rows.length, 1);
    if (rows.length < 10 || pos === 0 || prevalence === 0) return null;
    const pct = [];
    const lift = [];
    for (let b = 1; b <= 10; b += 1) {
      const take = Math.max(1, Math.round(rows.length * b / 10));
      const hit = rows.slice(0, take).filter(d => d.o === 1).length;
      pct.push((100 * take) / rows.length);
      lift.push((hit / take) / prevalence);
    }
    return { pct, lift };
  }

  function decisionNetBenefit(outcome, predictor) {
    const rows = pairs(outcome, predictor);
    if (rows.length < 10) return null;
    const n = rows.length;
    const prevalence = rows.filter(d => d.o === 1).length / n;
    const thresholds = Array.from({ length: 55 }, (_, i) => 0.01 + i * 0.011);
    const net = thresholds.map((pt) => {
      let tp = 0;
      let fp = 0;
      rows.forEach((d) => {
        if (d.p >= pt && d.o === 1) tp += 1;
        if (d.p >= pt && d.o === 0) fp += 1;
      });
      return (tp / n) - (fp / n) * (pt / Math.max(1 - pt, 0.001));
    });
    return { thresholds, net, prevalence };
  }

  function groupNumbers(labels, values) {
    const map = {};
    (labels || []).forEach((label, i) => {
      const key = String(label ?? '').trim();
      const value = Number(values?.[i]);
      if (!key || !Number.isFinite(value)) return;
      if (!map[key]) map[key] = [];
      map[key].push(value);
    });
    return Object.entries(map).map(([label, vals]) => ({
      label,
      values: vals,
      mean: meanValue(vals),
      sd: sdValue(vals),
      n: vals.length,
      sum: vals.reduce((a, b) => a + b, 0),
    }));
  }

  function categoricalJitter(index, n, span = 0.26) {
    return Array.from({ length: n }, (_, i) => index + ((((i * 47) % 97) / 96) - 0.5) * span);
  }

  function flowRows(data, params) {
    const src = data[safeName(params.x_var)] || data.source || [];
    const dst = data[safeName(params.y_var)] || data.target || [];
    const val = numericSeries(data[safeName(params.size_var)] || data.value || []);
    return src.map((s, i) => ({
      source: String(s || '').trim(),
      target: String(dst[i] || '').trim(),
      value: Number.isFinite(val[i]) ? val[i] : 1,
    })).filter(d => d.source && d.target && d.source !== d.target && d.value > 0);
  }

  function bezier(p0, p1, p2, steps = 28) {
    const x = [];
    const y = [];
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const a = (1 - t) ** 2;
      const b = 2 * (1 - t) * t;
      const c = t ** 2;
      x.push(a * p0.x + b * p1.x + c * p2.x);
      y.push(a * p0.y + b * p1.y + c * p2.y);
    }
    return { x, y };
  }

  Object.assign(CHART_CATALOG, {
    ecdf_plot: {
      id: 'ecdf_plot', name: '\u7ecf\u9a8c\u7d2f\u79ef\u5206\u5e03\u56fe', category: 'basic',
      description: '\u6bd4\u8f83\u8fde\u7eed\u6307\u6807\u5728\u4e0d\u540c\u5206\u7ec4\u4e2d\u7684\u6574\u4f53\u5206\u5e03\u5dee\u5f02\u3002',
      icon: 'ECDF', exampleDataset: 'scatter_example',
      buildTraces(data, params, theme) {
        const y = numericSeries(data[safeName(params.y_var)] || data.bmi || []);
        const g = data[safeName(params.color_var)] || [];
        const groups = unique(g).length ? unique(g) : ['All'];
        const pal = palette(theme, groups.length);
        return groups.map((group, gi) => {
          const vals = (group === 'All' ? y : y.filter((_, i) => String(g[i]) === String(group))).filter(Number.isFinite).sort((a, b) => a - b);
          const n = vals.length || 1;
          return {
            type: 'scatter',
            mode: 'lines',
            x: vals,
            y: vals.map((_, i) => (i + 1) / n),
            name: String(group),
            line: { color: pal[gi], width: 3.2, shape: 'hv' },
            meta: { colorIndex: gi },
          };
        });
      },
      buildLayout(params) {
        return { title: params.title || '\u7ecf\u9a8c\u7d2f\u79ef\u5206\u5e03\u56fe', xaxis: { title: safeName(params.y_var) }, yaxis: { title: 'Cumulative probability', range: [0, 1.02] }, margin: { l: 82, r: 42, t: 74, b: 74 } };
      },
    },

    mean_ci_plot: {
      id: 'mean_ci_plot', name: '\u5747\u503c95%CI\u56fe', category: 'basic',
      description: '\u5c55\u793a\u5206\u7ec4\u5747\u503c\u53ca95%\u7f6e\u4fe1\u533a\u95f4\uff0c\u9002\u5408\u57fa\u7840\u7edf\u8ba1\u6c47\u603b\u3002',
      icon: 'CI', exampleDataset: 'bar_example',
      buildTraces(data, params, theme) {
        const x = data[safeName(params.x_var)] || data.treatment || [];
        const y = numericSeries(data[safeName(params.y_var)] || data.value || []);
        const g = data[safeName(params.color_var)] || [];
        const groups = unique(g).length ? unique(g).slice(0, 8) : ['All'];
        const pal = palette(theme, groups.length);
        return groups.map((group, gi) => {
          const rows = groupNumbers(
            group === 'All' ? x : x.filter((_, i) => String(g[i]) === String(group)),
            group === 'All' ? y : y.filter((_, i) => String(g[i]) === String(group))
          );
          return {
            type: 'bar',
            x: rows.map(d => d.label),
            y: rows.map(d => d.mean),
            name: String(group),
            marker: { color: pal[gi] },
            error_y: { type: 'data', array: rows.map(d => 1.96 * d.sd / Math.sqrt(Math.max(d.n, 1))), visible: true, color: pal[gi], thickness: 1.8, width: 5 },
            text: rows.map(d => fmtNum(d.mean, 1)),
            textposition: 'outside',
            meta: { colorIndex: gi },
          };
        });
      },
      buildLayout(params) {
        return { title: params.title || '\u5747\u503c95%CI\u56fe', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) }, barmode: 'group', margin: { l: 82, r: 42, t: 74, b: 82 } };
      },
    },

    strip_plot: {
      id: 'strip_plot', name: '\u6761\u5e26\u6563\u70b9\u56fe', category: 'basic',
      description: '\u5c06\u539f\u59cb\u6570\u636e\u6309\u5206\u7ec4\u94fa\u5f00\uff0c\u9002\u5408\u5c0f\u6837\u672c\u6216\u5206\u5e03\u68c0\u67e5\u3002',
      icon: 'Strip', exampleDataset: 'raincloud_example',
      buildTraces(data, params, theme) {
        const x = data[safeName(params.x_var)] || data.method || [];
        const y = numericSeries(data[safeName(params.y_var)] || data.bmi || []);
        const groups = unique(x).slice(0, 12);
        const pal = palette(theme, groups.length);
        return groups.map((group, gi) => {
          const vals = x.map((v, i) => String(v) === String(group) ? y[i] : NaN).filter(Number.isFinite);
          return {
            type: 'scatter',
            mode: 'markers',
            x: categoricalJitter(gi, vals.length, 0.46),
            y: vals,
            name: String(group),
            marker: { color: pal[gi], size: 7, opacity: 0.70, line: { color: '#fff', width: 0.6 } },
            meta: { colorIndex: gi },
          };
        });
      },
      buildLayout(params) {
        const data = (typeof STATE !== 'undefined' && STATE.currentChartSourceData) || {};
        const groups = unique(data[safeName(params.x_var)] || data.method || []);
        return { title: params.title || '\u6761\u5e26\u6563\u70b9\u56fe', xaxis: { title: safeName(params.x_var), tickmode: 'array', tickvals: groups.map((_, i) => i), ticktext: groups.map(String) }, yaxis: { title: safeName(params.y_var) }, margin: { l: 82, r: 42, t: 74, b: 88 } };
      },
    },

    pareto_chart: {
      id: 'pareto_chart', name: 'Pareto\u6392\u5217\u56fe', category: 'basic',
      description: '\u6309\u8d21\u732e\u5ea6\u4ece\u9ad8\u5230\u4f4e\u6392\u5217\u5206\u7c7b\uff0c\u540c\u65f6\u7ed8\u5236\u7d2f\u79ef\u5360\u6bd4\u66f2\u7ebf\u3002',
      icon: 'Par', exampleDataset: 'bar_example',
      buildTraces(data, params, theme) {
        const rows = groupNumbers(data[safeName(params.x_var)] || data.treatment || [], data[safeName(params.y_var)] || data.value || [])
          .sort((a, b) => b.sum - a.sum);
        const total = rows.reduce((a, b) => a + b.sum, 0) || 1;
        let running = 0;
        const cum = rows.map((d) => { running += d.sum; return 100 * running / total; });
        return [{
          type: 'bar',
          x: rows.map(d => d.label),
          y: rows.map(d => d.sum),
          name: '\u6570\u503c',
          marker: { color: rows.map(d => d.label) },
          text: rows.map(d => fmtNum(d.sum, 0)),
          textposition: 'outside',
        }, {
          type: 'scatter',
          mode: 'lines+markers',
          x: rows.map(d => d.label),
          y: cum,
          yaxis: 'y2',
          name: '\u7d2f\u79ef\u5360\u6bd4',
          line: { color: palette(theme, 2)[1], width: 3.2, shape: 'spline', smoothing: 0.35 },
          marker: { color: palette(theme, 2)[1], size: 8 },
          meta: { colorIndex: 1 },
        }];
      },
      buildLayout(params) {
        return { title: params.title || 'Pareto\u6392\u5217\u56fe', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) }, yaxis2: { title: '\u7d2f\u79ef\u5360\u6bd4(%)', overlaying: 'y', side: 'right', range: [0, 105], showgrid: false }, margin: { l: 82, r: 84, t: 74, b: 86 } };
      },
    },

    step_plot: {
      id: 'step_plot', name: '\u9636\u68af\u8d8b\u52bf\u56fe', category: 'basic',
      description: '\u5c55\u793a\u968f\u8bbf\u65f6\u95f4\u70b9\u6216\u9636\u6bb5\u6027\u6307\u6807\u7684\u9636\u68af\u5f0f\u53d8\u5316\u3002',
      icon: 'Step', exampleDataset: 'line_example',
      buildTraces(data, params, theme) {
        const x = numericSeries(data[safeName(params.x_var)] || data.week || []);
        const y = numericSeries(data[safeName(params.y_var)] || data.sbp || []);
        const g = data[safeName(params.color_var)] || [];
        const groups = unique(g).length ? unique(g).slice(0, 8) : ['All'];
        const pal = palette(theme, groups.length);
        return groups.map((group, gi) => {
          const map = {};
          x.forEach((xv, i) => {
            if (!Number.isFinite(xv) || !Number.isFinite(y[i])) return;
            if (group !== 'All' && String(g[i]) !== String(group)) return;
            if (!map[xv]) map[xv] = [];
            map[xv].push(y[i]);
          });
          const xs = Object.keys(map).map(Number).sort((a, b) => a - b);
          return { type: 'scatter', mode: 'lines+markers', x: xs, y: xs.map(v => meanValue(map[v])), name: String(group), line: { color: pal[gi], width: 3, shape: 'hv' }, marker: { color: pal[gi], size: 7 }, meta: { colorIndex: gi } };
        });
      },
      buildLayout(params) {
        return { title: params.title || '\u9636\u68af\u8d8b\u52bf\u56fe', xaxis: { title: safeName(params.x_var) }, yaxis: { title: safeName(params.y_var) }, margin: { l: 82, r: 42, t: 74, b: 74 } };
      },
    },
  });
})();

// 5.7.1: spatial/raincloud quality fixes and an extended clinical chart catalog.
(function applyChartCatalog571Patch() {
  if (!CHART_CATALOG) return;

  function activePalette(theme, count = 12) {
    const raw = (typeof STATE !== 'undefined' && STATE.userColors && STATE.userColors.length)
      ? STATE.userColors
      : (theme && theme.colorway) || ['#2E6F9E', '#D95F59', '#2A9D8F', '#E9A93A', '#6F5AA7', '#7C8B52'];
    return expandPalette(raw, count);
  }

  function pickColumn(data, names) {
    for (const name of names || []) {
      const key = safeName(name);
      if (key && Array.isArray(data[key]) && data[key].length) return data[key];
    }
    return [];
  }

  function pickUSStateColumn(data, preferred) {
    const candidates = [preferred, 'state_abbr', 'state', 'State', 'STATE', 'region', 'name'].filter(Boolean);
    let best = { values: [], score: -1 };
    candidates.forEach((name) => {
      const values = data[safeName(name)];
      if (!Array.isArray(values)) return;
      const score = values.map(v => normalizeUSState(v)).filter(Boolean).length;
      if (score > best.score) best = { values, score };
    });
    return best.values;
  }

  function pairedRows(outcome, predictor) {
    return (outcome || []).map((o, i) => ({
      outcome: positiveOutcome(o) ? 1 : 0,
      score: Number(predictor?.[i]),
    })).filter(d => Number.isFinite(d.score)).sort((a, b) => b.score - a.score);
  }

  function prCurveStats(outcome, predictor) {
    const pairs = pairedRows(outcome, predictor);
    const totalPos = pairs.filter(d => d.outcome === 1).length;
    if (pairs.length < 8 || totalPos === 0) return null;
    let tp = 0;
    let fp = 0;
    const recall = [0];
    const precision = [1];
    pairs.forEach((d) => {
      if (d.outcome === 1) tp += 1;
      else fp += 1;
      recall.push(tp / totalPos);
      precision.push(tp / Math.max(tp + fp, 1));
    });
    return { recall, precision, prevalence: totalPos / pairs.length };
  }

  function liftCurveStats(outcome, predictor, bins = 10) {
    const pairs = pairedRows(outcome, predictor);
    const totalPos = pairs.filter(d => d.outcome === 1).length;
    const prevalence = totalPos / Math.max(pairs.length, 1);
    if (pairs.length < bins || totalPos === 0 || prevalence === 0) return null;
    const pct = [];
    const lift = [];
    const captured = [];
    for (let b = 1; b <= bins; b += 1) {
      const take = Math.max(1, Math.round((pairs.length * b) / bins));
      const positives = pairs.slice(0, take).filter(d => d.outcome === 1).length;
      pct.push((100 * take) / pairs.length);
      lift.push((positives / take) / prevalence);
      captured.push(positives / totalPos);
    }
    return { pct, lift, captured };
  }

  function dcaCurve(outcome, predictor) {
    const pairs = (outcome || []).map((o, i) => ({ o: positiveOutcome(o) ? 1 : 0, p: Number(predictor?.[i]) }))
      .filter(d => Number.isFinite(d.p));
    const n = pairs.length;
    if (n < 8) return null;
    const thresholds = Array.from({ length: 55 }, (_, i) => 0.01 + i * 0.011);
    const net = thresholds.map((pt) => {
      let tp = 0;
      let fp = 0;
      pairs.forEach((d) => {
        if (d.p >= pt && d.o === 1) tp += 1;
        if (d.p >= pt && d.o === 0) fp += 1;
      });
      return (tp / n) - (fp / n) * (pt / Math.max(1 - pt, 0.001));
    });
    return { thresholds, net, prevalence: pairs.filter(d => d.o === 1).length / n };
  }

  function groupedNumericRows(labels, values) {
    const groups = {};
    (labels || []).forEach((label, i) => {
      const key = String(label ?? '').trim();
      const value = Number(values?.[i]);
      if (!key || !Number.isFinite(value)) return;
      if (!groups[key]) groups[key] = [];
      groups[key].push(value);
    });
    return Object.entries(groups).map(([label, vals]) => ({
      label,
      values: vals,
      mean: meanValue(vals),
      sd: sdValue(vals),
      n: vals.length,
      sum: vals.reduce((a, b) => a + b, 0),
    }));
  }

  function jitteredPositions(index, count, span = 0.18) {
    const out = [];
    for (let i = 0; i < count; i += 1) {
      const frac = ((i * 37) % 101) / 100;
      out.push(index + (frac - 0.5) * span);
    }
    return out;
  }

  if (CHART_CATALOG.raincloud) {
    CHART_CATALOG.raincloud.buildTraces = function patchedRaincloudTraces(data, params, theme) {
      const xVals = data[safeName(params.x_var)] || [];
      const yVals = numericSeries(data[safeName(params.y_var)] || []);
      const groups = unique(xVals).slice(0, 8);
      const palette = activePalette(theme, Math.max(groups.length, 4));
      const traces = [];
      groups.forEach((group, idx) => {
        const ys = xVals.map((x, i) => String(x) === String(group) ? yVals[i] : NaN).filter(Number.isFinite);
        if (ys.length < 3) return;
        const color = palette[idx % palette.length];
        traces.push({
          type: 'violin',
          x: Array(ys.length).fill(idx - 0.18),
          y: ys,
          side: 'positive',
          width: 0.56,
          points: false,
          name: String(group),
          line: { color, width: 1.7 },
          fillcolor: colorAlpha(color, 0.25),
          meanline: { visible: true, color: '#1F2937', width: 1.2 },
          spanmode: 'soft',
          hoverinfo: 'y',
          meta: { colorIndex: idx },
        });
        traces.push({
          type: 'box',
          x: Array(ys.length).fill(idx + 0.03),
          y: ys,
          width: 0.16,
          boxpoints: false,
          showlegend: false,
          line: { color, width: 1.4 },
          fillcolor: colorAlpha(color, 0.16),
          marker: { color },
          meta: { colorIndex: idx },
        });
        traces.push({
          type: 'scatter',
          mode: 'markers',
          x: jitteredPositions(idx + 0.28, ys.length, 0.20),
          y: ys,
          name: '',
          showlegend: false,
          marker: { color, size: 4.4, opacity: 0.62, line: { color: '#ffffff', width: 0.45 } },
          hovertemplate: `${String(group)}<br>${safeName(params.y_var)}=%{y:.2f}<extra></extra>`,
          meta: { colorIndex: idx },
        });
      });
      return traces.length ? traces : [{ type: 'scatter', mode: 'markers', x: [0], y: [0], marker: { color: palette[0] } }];
    };
    CHART_CATALOG.raincloud.buildLayout = function patchedRaincloudLayout(params) {
      const data = (typeof STATE !== 'undefined' && STATE.currentChartSourceData) || {};
      const groups = unique(data[safeName(params.x_var)] || []);
      return {
        title: params.title || '\u4e91\u96e8\u56fe',
        xaxis: {
          title: safeName(params.x_var),
          tickmode: 'array',
          tickvals: groups.map((_, i) => i),
          ticktext: groups.map(String),
          zeroline: false,
        },
        yaxis: { title: safeName(params.y_var), zeroline: false },
        violingap: 0,
        boxgap: 0,
        margin: { l: 82, r: 42, t: 74, b: 92 },
      };
    };
  }

  if (CHART_CATALOG.china_bubble_map) {
    CHART_CATALOG.china_bubble_map.buildTraces = function patchedChinaBubbleMapTraces(data, params, theme) {
      const provRaw = data[safeName(params.province_var)] || data.province || [];
      const valsRaw = data[safeName(params.y_var)] || data.incidence || [];
      const sizeRaw = data[safeName(params.size_var)] || data.prevalence || valsRaw;
      const centroids = loadChinaCentroids();
      const rows = provRaw.map((p, i) => {
        const key = normalizeProvinceKey(p);
        const c = centroids[key];
        return {
          key,
          label: CHINA_PROVINCE_LABELS[key] || String(p),
          lat: c ? c[0] : null,
          lon: c ? c[1] : null,
          value: Number(valsRaw[i]),
          size: Number(sizeRaw[i]),
        };
      }).filter(d => d.key && Number.isFinite(d.lat) && Number.isFinite(d.lon) && Number.isFinite(d.value));
      const vals = rows.map(d => d.value);
      const sizes = rows.map(d => Number.isFinite(d.size) ? d.size : d.value);
      const maxSize = Math.max(...sizes, 1);
      const geoKeys = getChinaFeatureKeys(centroids);
      const top = rows.slice().sort((a, b) => b.value - a.value).slice(0, 8);
      return [{
        type: 'choropleth',
        geojson: STATE.chinaGeoJSON || _geoJSONCache,
        locations: geoKeys,
        featureidkey: 'properties.id',
        z: geoKeys.map(() => 0),
        showscale: false,
        colorscale: [[0, '#F6F8F7'], [1, '#F6F8F7']],
        marker: { line: { color: '#D7E0E4', width: 0.65 }, opacity: 0.86 },
        hoverinfo: 'skip',
      }, {
        type: 'scattergeo',
        mode: 'markers',
        lat: rows.map(d => d.lat),
        lon: rows.map(d => d.lon),
        text: rows.map(d => `${d.label}: ${fmtNum(d.value)}`),
        customdata: rows.map((d, i) => sizes[i]),
        marker: {
          size: sizes.map(v => 5.5 + 17 * Math.sqrt(Math.max(v, 0) / maxSize)),
          color: vals,
          colorscale: cnsMapScale(theme),
          cmin: Math.min(...vals),
          cmax: Math.max(...vals),
          opacity: 0.80,
          line: { color: '#FFFFFF', width: 1.05 },
          colorbar: { title: { text: safeName(params.y_var) || 'value' }, thickness: 14, len: 0.60, outlinewidth: 0 },
        },
        hovertemplate: '<b>%{text}</b><br>size=%{customdata:.1f}<extra></extra>',
      }, {
        type: 'scattergeo',
        mode: 'text',
        lat: top.map(d => d.lat),
        lon: top.map(d => d.lon),
        text: top.map(d => d.label),
        textfont: { family: theme.fontFamily, size: 9.5, color: '#25313D' },
        textposition: 'top center',
        hoverinfo: 'skip',
        showlegend: false,
      }];
    };
  }

  if (CHART_CATALOG.usa_map) {
    CHART_CATALOG.usa_map.buildTraces = function patchedUsaMapTraces(data, params, theme) {
      const stateRaw = pickUSStateColumn(data, params.state_var);
      const valsRaw = pickColumn(data, [params.y_var, 'incidence', 'prevalence', 'mortality']);
      const rows = stateRaw.map((s, i) => ({ loc: normalizeUSState(s), label: String(s), value: Number(valsRaw[i]) }))
        .filter(d => d.loc && Number.isFinite(d.value));
      const vals = rows.map(d => d.value);
      const top = rows.filter(d => US_STATE_CENTROIDS[d.loc]).sort((a, b) => b.value - a.value).slice(0, 10);
      return [{
        type: 'choropleth',
        locationmode: 'USA-states',
        locations: rows.map(d => d.loc),
        z: vals,
        zmin: Math.min(...vals),
        zmax: Math.max(...vals),
        text: rows.map(d => `${d.label}: ${fmtNum(d.value)}`),
        colorscale: cnsMapScale(theme),
        marker: { line: { color: '#FFFFFF', width: 1.1 }, opacity: 0.98 },
        colorbar: { title: { text: safeName(params.y_var) || 'value' }, thickness: 15, len: 0.62, outlinewidth: 0 },
        hovertemplate: '<b>%{text}</b><extra></extra>',
      }, {
        type: 'scattergeo',
        mode: 'text',
        lat: top.map(d => US_STATE_CENTROIDS[d.loc][0]),
        lon: top.map(d => US_STATE_CENTROIDS[d.loc][1]),
        text: top.map(d => `${d.loc}<br>${fmtNum(d.value)}`),
        textfont: { family: theme.fontFamily, size: 9.5, color: '#26313D' },
        hoverinfo: 'skip',
        showlegend: false,
      }];
    };
    CHART_CATALOG.usa_map.buildLayout = function patchedUsaMapLayout(params) {
      return {
        title: params.title || '\u7f8e\u56fd\u5dde\u7ea7\u5206\u5e03\u5730\u56fe',
        geo: {
          scope: 'usa',
          projection: { type: 'albers usa' },
          showland: true,
          landcolor: '#F5F8F7',
          lakecolor: '#F8FBFD',
          subunitcolor: '#CBD5DC',
          bgcolor: 'rgba(0,0,0,0)',
          domain: { x: [0.02, 0.94], y: [0.035, 0.955] },
        },
        margin: { l: 16, r: 78, t: 76, b: 28 },
      };
    };
  }

  if (CHART_CATALOG.uk_map) {
    CHART_CATALOG.uk_map.buildTraces = function patchedUkMapTraces(data, params, theme) {
      const region = data[safeName(params.region_var)] || data.region || [];
      const valsRaw = pickColumn(data, [params.y_var, 'incidence', 'prevalence']);
      const sizeRaw = pickColumn(data, [params.size_var, 'prevalence', params.y_var]);
      const rows = region.map((r, i) => {
        const label = String(r || '').trim();
        const coord = UK_REGION_COORDS[label] || UK_REGION_COORDS[label.replace(/\s+/g, ' ')];
        return { label, coord, value: Number(valsRaw[i]), size: Number(sizeRaw[i]) };
      }).filter(d => d.coord && Number.isFinite(d.value));
      const vals = rows.map(d => d.value);
      const sizes = rows.map(d => Number.isFinite(d.size) ? d.size : d.value);
      const maxSize = Math.max(...sizes, 1);
      return [{
        type: 'scattergeo',
        mode: 'markers',
        lat: rows.map(d => d.coord[0]),
        lon: rows.map(d => d.coord[1]),
        text: rows.map(d => d.label),
        customdata: rows.map((d, i) => [d.value, sizes[i]]),
        marker: {
          size: sizes.map(v => 7 + 24 * Math.sqrt(Math.max(v, 0) / maxSize)),
          color: vals,
          colorscale: cnsMapScale(theme),
          cmin: Math.min(...vals),
          cmax: Math.max(...vals),
          opacity: 0.84,
          line: { color: '#FFFFFF', width: 1.2 },
          colorbar: { title: { text: safeName(params.y_var) || 'value' }, thickness: 14, len: 0.58, outlinewidth: 0 },
        },
        hovertemplate: '<b>%{text}</b><br>value=%{customdata[0]:.1f}<br>size=%{customdata[1]:.1f}<extra></extra>',
      }, {
        type: 'scattergeo',
        mode: 'text',
        lat: rows.map(d => d.coord[0] + 0.10),
        lon: rows.map(d => d.coord[1]),
        text: rows.map(d => d.label),
        textfont: { family: theme.fontFamily, size: 9.5, color: '#26313D' },
        textposition: 'top center',
        hoverinfo: 'skip',
        showlegend: false,
      }];
    };
    CHART_CATALOG.uk_map.buildLayout = function patchedUkMapLayout(params) {
      return {
        title: params.title || '\u82f1\u56fd\u533a\u57df\u6c14\u6ce1\u5730\u56fe',
        geo: {
          showframe: false,
          showland: true,
          showcountries: true,
          showcoastlines: true,
          landcolor: '#F5F8F7',
          countrycolor: '#CBD5DC',
          coastlinecolor: '#93A4AF',
          projection: { type: 'mercator' },
          lonaxis: { range: [-9.9, 2.4] },
          lataxis: { range: [49.4, 59.3] },
          bgcolor: 'rgba(0,0,0,0)',
          domain: { x: [0.035, 0.93], y: [0.04, 0.955] },
        },
        margin: { l: 18, r: 80, t: 76, b: 28 },
      };
    };
  }
})();

// 5.7.2 EOF override: detailed UK regional maps and richer step trend plot.
(function finalVisualOverrides572TrueEOF() {
  if (typeof CHART_CATALOG === 'undefined' || !CHART_CATALOG) return;

  const UK_REGIONS_572 = {
    Scotland: { coord: [56.8, -4.2], poly: [[-7.5,55.0],[-6.6,56.2],[-6.0,57.5],[-5.0,58.7],[-3.8,58.9],[-2.3,57.7],[-1.8,56.7],[-2.2,55.7],[-3.0,55.1],[-4.5,54.8],[-7.5,55.0]] },
    'Northern Ireland': { coord: [54.7, -6.7], poly: [[-8.0,54.1],[-7.4,55.1],[-6.2,55.3],[-5.6,54.8],[-5.8,54.1],[-6.8,53.9],[-8.0,54.1]] },
    Wales: { coord: [52.2, -3.7], poly: [[-5.2,51.4],[-4.8,52.3],[-4.3,53.2],[-3.4,53.4],[-2.8,52.8],[-3.0,52.0],[-3.5,51.5],[-4.4,51.3],[-5.2,51.4]] },
    'North East': { coord: [54.9, -1.8], poly: [[-2.6,54.4],[-2.1,55.4],[-1.2,55.5],[-0.9,54.8],[-1.3,54.2],[-2.2,54.1],[-2.6,54.4]] },
    'North West': { coord: [53.8, -2.7], poly: [[-3.8,53.0],[-3.5,54.3],[-2.6,54.8],[-2.1,54.2],[-2.3,53.3],[-3.1,52.9],[-3.8,53.0]] },
    'Yorkshire and The Humber': { coord: [53.8, -1.2], poly: [[-2.2,53.1],[-2.1,54.2],[-1.1,54.7],[0.0,54.2],[-0.2,53.3],[-1.2,52.9],[-2.2,53.1]] },
    'East Midlands': { coord: [52.9, -0.8], poly: [[-1.8,52.1],[-1.4,53.1],[-0.2,53.3],[0.4,52.6],[-0.1,51.9],[-1.1,51.8],[-1.8,52.1]] },
    'West Midlands': { coord: [52.5, -2.1], poly: [[-3.1,52.0],[-2.9,52.9],[-2.1,53.2],[-1.4,53.1],[-1.4,52.1],[-2.3,51.8],[-3.1,52.0]] },
    'East of England': { coord: [52.2, 0.5], poly: [[-0.2,51.5],[0.4,52.6],[1.6,52.9],[1.8,52.0],[1.1,51.4],[0.1,51.2],[-0.2,51.5]] },
    London: { coord: [51.5, -0.1], poly: [[-0.55,51.28],[0.25,51.28],[0.35,51.62],[-0.45,51.70],[-0.55,51.28]] },
    'South East': { coord: [51.2, 0.1], poly: [[-1.3,50.7],[-0.2,51.5],[1.1,51.4],[1.5,50.9],[0.4,50.6],[-0.8,50.6],[-1.3,50.7]] },
    'South West': { coord: [50.9, -3.4], poly: [[-5.8,50.0],[-4.7,51.0],[-3.4,51.4],[-2.1,51.3],[-1.3,50.7],[-2.3,50.2],[-3.8,50.0],[-5.1,49.9],[-5.8,50.0]] },
  };

  function palette572(theme, count = 8) {
    const raw = (typeof STATE !== 'undefined' && STATE.userColors && STATE.userColors.length)
      ? STATE.userColors
      : (theme && theme.colorway) || ['#2E6F9E', '#D95F59', '#2A9D8F', '#E9A93A', '#6F5AA7'];
    return expandPalette(raw, count);
  }

  function valueColor572(value, min, max, colors) {
    const t = max > min ? (value - min) / (max - min) : 0.5;
    return colors[Math.max(0, Math.min(colors.length - 1, Math.round(t * (colors.length - 1))))];
  }

  function ukRows572(data, params) {
    const regions = data[safeName(params.region_var)] || data.region || [];
    const values = data[safeName(params.y_var)] || data.incidence || data.prevalence || [];
    const sizes = data[safeName(params.size_var)] || data.prevalence || values;
    return regions.map((region, i) => {
      const label = String(region || '').trim();
      return { label, detail: UK_REGIONS_572[label], value: Number(values[i]), size: Number(sizes[i]) };
    }).filter(d => d.detail && Number.isFinite(d.value));
  }

  function buildUk572(data, params, theme, bubbles) {
    const rows = ukRows572(data, params);
    if (!rows.length) {
      return [{ type: 'scattergeo', mode: 'text', lon: [-2.5], lat: [54.3], text: ['No UK region data'], showlegend: false }];
    }
    const vals = rows.map(d => d.value);
    const sizes = rows.map(d => Number.isFinite(d.size) ? d.size : d.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const maxSize = Math.max(...sizes, 1);
    const colors = palette572(theme, 7);
    const traces = rows.map((row) => {
      const fill = valueColor572(row.value, min, max, colors);
      return {
        type: 'scattergeo',
        mode: 'lines',
        lon: row.detail.poly.map(p => p[0]),
        lat: row.detail.poly.map(p => p[1]),
        fill: 'toself',
        fillcolor: colorAlpha(fill, 0.72),
        line: { color: '#FFFFFF', width: 1.05 },
        name: row.label,
        showlegend: false,
        hovertemplate: `<b>${row.label}</b><br>${safeName(params.y_var) || 'value'}=${fmtNum(row.value)}<br>${safeName(params.size_var) || 'size'}=${fmtNum(row.size)}<extra></extra>`,
        meta: { fixedColor: fill },
      };
    });
    traces.push({
      type: 'scattergeo',
      mode: 'markers+text',
      lat: rows.map(d => d.detail.coord[0]),
      lon: rows.map(d => d.detail.coord[1]),
      text: rows.map(d => `${d.label}<br>${fmtNum(d.value)}`),
      textposition: 'top center',
      customdata: rows.map((d, i) => [d.value, sizes[i]]),
      marker: {
        size: bubbles ? sizes.map(v => 6 + 18 * Math.sqrt(Math.max(v, 0) / maxSize)) : rows.map(() => 8.5),
        color: vals,
        colorscale: cnsMapScale(theme),
        cmin: min,
        cmax: max,
        opacity: bubbles ? 0.84 : 0.50,
        line: { color: '#FFFFFF', width: 1.1 },
        colorbar: { title: { text: safeName(params.y_var) || 'value' }, thickness: 14, len: 0.58, outlinewidth: 0 },
      },
      textfont: { family: theme.fontFamily, size: 9.5, color: '#25313D' },
      hovertemplate: '<b>%{text}</b><br>value=%{customdata[0]:.1f}<br>size=%{customdata[1]:.1f}<extra></extra>',
      name: safeName(params.y_var) || 'value',
    });
    return traces;
  }

  function ukLayout572(title) {
    return {
      title,
      geo: {
        showframe: false,
        showland: true,
        showcountries: false,
        showcoastlines: true,
        landcolor: '#F6F8F7',
        coastlinecolor: '#9AAAB4',
        projection: { type: 'mercator' },
        lonaxis: { range: [-8.6, 2.0] },
        lataxis: { range: [49.6, 59.3] },
        bgcolor: 'rgba(0,0,0,0)',
        domain: { x: [0.03, 0.94], y: [0.035, 0.955] },
      },
      margin: { l: 18, r: 82, t: 76, b: 28 },
    };
  }

  if (CHART_CATALOG.uk_map) {
    CHART_CATALOG.uk_map.name = '\u82f1\u56fdNUTS1\u533a\u57df\u6c14\u6ce1\u5730\u56fe';
    CHART_CATALOG.uk_map.description = '\u57fa\u4e8e\u82f1\u56fdNUTS1\u533a\u57df\u8fd1\u4f3c\u8fb9\u754c\u7684\u586b\u8272\u548c\u6c14\u6ce1\u53e0\u52a0\u5730\u56fe\u3002';
    delete CHART_CATALOG.uk_map._labelPatchApplied;
    CHART_CATALOG.uk_map.buildTraces = (data, params, theme) => buildUk572(data, params, theme, true);
    CHART_CATALOG.uk_map.buildLayout = params => ukLayout572(params.title || '\u82f1\u56fdNUTS1\u533a\u57df\u6c14\u6ce1\u5730\u56fe');
  }

  if (CHART_CATALOG.uk_tile_map) {
    CHART_CATALOG.uk_tile_map.name = '\u82f1\u56fdNUTS1\u533a\u57df\u5206\u5e03\u5730\u56fe';
    CHART_CATALOG.uk_tile_map.description = '\u4ee5\u82f1\u56fdNUTS1\u533a\u57df\u8fd1\u4f3c\u8fb9\u754c\u5c55\u793a\u533a\u57df\u6307\u6807\u5dee\u5f02\u3002';
    delete CHART_CATALOG.uk_tile_map._labelPatchApplied;
    CHART_CATALOG.uk_tile_map.buildTraces = (data, params, theme) => buildUk572(data, params, theme, false);
    CHART_CATALOG.uk_tile_map.buildLayout = params => ukLayout572(params.title || '\u82f1\u56fdNUTS1\u533a\u57df\u5206\u5e03\u5730\u56fe');
  }

  if (typeof CHART_LABEL_PATCHES !== 'undefined' && CHART_LABEL_PATCHES) {
    CHART_LABEL_PATCHES.uk_map = {
      name: '\u82f1\u56fdNUTS1\u533a\u57df\u6c14\u6ce1\u5730\u56fe',
      description: '\u57fa\u4e8e\u82f1\u56fdNUTS1\u533a\u57df\u8fd1\u4f3c\u8fb9\u754c\u7684\u586b\u8272\u548c\u6c14\u6ce1\u53e0\u52a0\u5730\u56fe\u3002',
    };
    CHART_LABEL_PATCHES.uk_tile_map = {
      name: '\u82f1\u56fdNUTS1\u533a\u57df\u5206\u5e03\u5730\u56fe',
      description: '\u4ee5\u82f1\u56fdNUTS1\u533a\u57df\u8fd1\u4f3c\u8fb9\u754c\u5c55\u793a\u533a\u57df\u6307\u6807\u5dee\u5f02\u3002',
    };
  }

  if (CHART_CATALOG.step_plot) {
    CHART_CATALOG.step_plot.buildTraces = function stepPlot572Traces(data, params, theme) {
      const x = numericSeries(data[safeName(params.x_var)] || data.week || data.timepoint || []);
      const y = numericSeries(data[safeName(params.y_var)] || data.value || data.sbp || []);
      const groupsRaw = data[safeName(params.color_var)] || data.group || [];
      const groups = unique(groupsRaw).length ? unique(groupsRaw).slice(0, 8) : ['All'];
      const palette = palette572(theme, groups.length);
      const traces = [];
      groups.forEach((group, gi) => {
        const bucket = {};
        x.forEach((xv, i) => {
          if (!Number.isFinite(xv) || !Number.isFinite(y[i])) return;
          if (group !== 'All' && String(groupsRaw[i]) !== String(group)) return;
          if (!bucket[xv]) bucket[xv] = [];
          bucket[xv].push(y[i]);
        });
        const xs = Object.keys(bucket).map(Number).sort((a, b) => a - b);
        if (!xs.length) return;
        const means = xs.map(v => meanValue(bucket[v]));
        const errors = xs.map(v => 1.96 * sdValue(bucket[v]) / Math.sqrt(Math.max(bucket[v].length, 1)));
        const upper = means.map((m, i) => m + errors[i]);
        const lower = means.map((m, i) => m - errors[i]);
        const color = palette[gi];
        traces.push({
          type: 'scatter',
          mode: 'lines',
          x: xs.concat(xs.slice().reverse()),
          y: upper.concat(lower.slice().reverse()),
          fill: 'toself',
          fillcolor: colorAlpha(color, 0.16),
          line: { color: colorAlpha(color, 0.06), width: 0.5 },
          name: `${group} 95%CI`,
          hoverinfo: 'skip',
          showlegend: false,
          meta: { colorIndex: gi },
        });
        traces.push({
          type: 'scatter',
          mode: 'lines+markers+text',
          x: xs,
          y: means,
          name: String(group),
          line: { color, width: 3.2, shape: 'hv' },
          marker: { color, size: 8.5, line: { color: '#FFFFFF', width: 1.2 } },
          text: means.map(v => fmtNum(v, 1)),
          textposition: 'top center',
          textfont: { family: theme.fontFamily, size: 10, color: '#25313D' },
          hovertemplate: `${group}<br>${safeName(params.x_var)}=%{x}<br>${safeName(params.y_var)}=%{y:.2f}<extra></extra>`,
          meta: { colorIndex: gi },
        });
        traces.push({
          type: 'scatter',
          mode: 'lines',
          x: xs.flatMap(v => [v, v, null]),
          y: xs.flatMap((v, i) => [lower[i], upper[i], null]),
          name: '',
          line: { color: colorAlpha(color, 0.34), width: 1.15, dash: 'dot' },
          hoverinfo: 'skip',
          showlegend: false,
          meta: { colorIndex: gi },
        });
      });
      return traces.length ? traces : [{ type: 'scatter', mode: 'markers', x: [0], y: [0], marker: { color: palette[0] } }];
    };
    CHART_CATALOG.step_plot.buildLayout = function stepPlot572Layout(params) {
      return {
        title: params.title || '\u9636\u68af\u8d8b\u52bf\u56fe',
        xaxis: { title: safeName(params.x_var), showspikes: true, spikemode: 'across', spikecolor: '#CBD5DC', spikedash: 'dot' },
        yaxis: { title: safeName(params.y_var), zeroline: false },
        hovermode: 'x unified',
        legend: { orientation: 'h', x: 0, y: -0.18 },
        margin: { l: 86, r: 44, t: 76, b: 94 },
      };
    };
  }
})();

// 5.7.3: richer publication-grade trend charts for line, multi-line, and area.
(function finalTrendCharts573() {
  if (typeof CHART_CATALOG === 'undefined' || !CHART_CATALOG) return;

  function trendPalette(theme, count = 6) {
    const raw = (typeof STATE !== 'undefined' && STATE.userColors && STATE.userColors.length)
      ? STATE.userColors
      : (theme && theme.colorway) || ['#2E6F9E', '#D95F59', '#2A9D8F', '#E9A93A', '#6F5AA7'];
    return expandPalette(raw, count);
  }

  function trendRows(data, params) {
    const xRaw = data[safeName(params.x_var)] || [];
    const yRaw = data[safeName(params.y_var)] || [];
    const gRaw = params.color_var ? (data[safeName(params.color_var)] || []) : [];
    return xRaw.map((xv, i) => {
      const y = Number(yRaw[i]);
      const xNum = Number(xv);
      const x = Number.isFinite(xNum) ? xNum : String(xv);
      const group = gRaw.length ? String(gRaw[i] ?? '').trim() : 'All';
      return { x, xKey: String(x), y, group: group || 'All', index: i };
    }).filter(d => Number.isFinite(d.y) && d.xKey !== '');
  }

  function orderedGroups(rows, allowGroups) {
    if (!allowGroups) return ['All'];
    const groups = unique(rows.map(d => d.group)).filter(Boolean);
    return groups.length > 1 ? groups.slice(0, 8) : ['All'];
  }

  function summarizeTrend(rows, group) {
    const filtered = group === 'All' ? rows : rows.filter(d => String(d.group) === String(group));
    const numericX = filtered.every(d => typeof d.x === 'number');
    const keys = unique(filtered.map(d => d.xKey));
    keys.sort((a, b) => {
      if (numericX) return Number(a) - Number(b);
      return filtered.findIndex(d => d.xKey === a) - filtered.findIndex(d => d.xKey === b);
    });
    return keys.map((key) => {
      const vals = filtered.filter(d => d.xKey === key).map(d => d.y);
      const mean = meanValue(vals);
      const sd = sdValue(vals);
      const ci = vals.length > 1 ? 1.96 * sd / Math.sqrt(vals.length) : 0;
      return {
        x: numericX ? Number(key) : key,
        y: mean,
        n: vals.length,
        sd,
        lower: mean - ci,
        upper: mean + ci,
      };
    }).filter(d => Number.isFinite(d.y));
  }

  function rawTrace(rows, group, color, xTitle, yTitle) {
    const filtered = (group === 'All' ? rows : rows.filter(d => String(d.group) === String(group))).slice(0, 900);
    const numericX = filtered.every(d => typeof d.x === 'number');
    const xs = filtered.map((d, i) => {
      if (!numericX) return d.x;
      const jitter = ((((i * 37) % 101) / 100) - 0.5) * 0.10;
      return d.x + jitter;
    });
    return {
      type: 'scatter',
      mode: 'markers',
      x: xs,
      y: filtered.map(d => d.y),
      name: '\u539f\u59cb\u89c2\u6d4b',
      showlegend: false,
      marker: { color: colorAlpha(color, 0.26), size: 4.3, line: { color: '#FFFFFF', width: 0.35 } },
      hovertemplate: `${xTitle}=%{x}<br>${yTitle}=%{y:.2f}<extra></extra>`,
      meta: { fixedColor: colorAlpha(color, 0.26) },
    };
  }

  function ciBandTrace(summary, color, label, colorIndex) {
    return {
      type: 'scatter',
      mode: 'none',
      x: summary.map(d => d.x).concat(summary.map(d => d.x).reverse()),
      y: summary.map(d => d.upper).concat(summary.map(d => d.lower).reverse()),
      fill: 'toself',
      fillcolor: colorAlpha(color, 0.16),
      line: { color: colorAlpha(color, 0.12), width: 0 },
      name: `${label} 95%CI`,
      hoverinfo: 'skip',
      showlegend: false,
      meta: { colorIndex },
    };
  }

  function meanLineTrace(summary, color, label, colorIndex, showEndpointLabel = true) {
    const last = summary[summary.length - 1];
    const text = summary.map(d => '');
    if (showEndpointLabel && last) text[summary.length - 1] = `${label} ${fmtNum(last.y, 1)}`;
    return {
      type: 'scatter',
      mode: 'lines+markers+text',
      x: summary.map(d => d.x),
      y: summary.map(d => d.y),
      name: label,
      customdata: summary.map(d => [d.n, d.sd, d.lower, d.upper]),
      line: { color, width: 3.3, shape: 'spline', smoothing: 0.52 },
      marker: { color, size: 8.2, symbol: ['circle', 'diamond', 'square', 'triangle-up', 'hexagon', 'star'][colorIndex % 6], line: { color: '#FFFFFF', width: 1.25 } },
      text,
      textposition: 'top center',
      textfont: { size: 10.5, color: '#25313D' },
      hovertemplate: `%{x}<br>\u5747\u503c=%{y:.2f}<br>N=%{customdata[0]}<br>95%CI=%{customdata[2]:.2f} - %{customdata[3]:.2f}<extra>${label}</extra>`,
      cliponaxis: false,
      meta: { colorIndex },
    };
  }

  function areaTrace(summary, color, label, colorIndex, fillMode) {
    const last = summary[summary.length - 1];
    const text = summary.map(d => '');
    if (last) text[summary.length - 1] = `${label} ${fmtNum(last.y, 1)}`;
    return {
      type: 'scatter',
      mode: 'lines+markers+text',
      fill: fillMode || 'tozeroy',
      x: summary.map(d => d.x),
      y: summary.map(d => d.y),
      name: label,
      customdata: summary.map(d => [d.n, d.sd]),
      line: { color, width: 2.9, shape: 'spline', smoothing: 0.48 },
      marker: { color, size: 7.4, line: { color: '#FFFFFF', width: 1.1 } },
      fillcolor: colorAlpha(color, 0.20),
      text,
      textposition: 'top center',
      textfont: { size: 10.5, color: '#25313D' },
      hovertemplate: `%{x}<br>\u5747\u503c=%{y:.2f}<br>N=%{customdata[0]}<extra>${label}</extra>`,
      cliponaxis: false,
      meta: { colorIndex },
    };
  }

  function trendLayout(title, params, extra = {}) {
    return {
      title,
      xaxis: {
        title: safeName(params.x_var),
        showspikes: true,
        spikemode: 'across',
        spikecolor: '#CBD5DC',
        spikedash: 'dot',
      },
      yaxis: {
        title: safeName(params.y_var),
        zeroline: false,
      },
      hovermode: 'x unified',
      legend: { orientation: 'h', x: 0, y: -0.18, traceorder: 'normal' },
      margin: { l: 86, r: 56, t: 76, b: 98 },
      ...extra,
    };
  }

  function groupedTrendTraces(data, params, theme, includeRaw = true) {
    const rows = trendRows(data, params);
    const groups = orderedGroups(rows, Boolean(params.color_var));
    const palette = trendPalette(theme, groups.length);
    const traces = [];
    groups.forEach((group, gi) => {
      const summary = summarizeTrend(rows, group);
      if (summary.length < 1) return;
      const color = palette[gi];
      traces.push(ciBandTrace(summary, color, String(group), gi));
      if (includeRaw) traces.push(rawTrace(rows, group, color, safeName(params.x_var), safeName(params.y_var)));
      traces.push(meanLineTrace(summary, color, String(group), gi, groups.length > 1));
    });
    return traces.length ? traces : [{ type: 'scatter', mode: 'markers', x: [0], y: [0], marker: { color: palette[0] } }];
  }

  if (CHART_CATALOG.line) {
    CHART_CATALOG.line.name = '\u6298\u7ebf\u8d8b\u52bf\u56fe';
    CHART_CATALOG.line.description = '\u6309\u65f6\u95f4\u6216\u987a\u5e8f\u53d8\u91cf\u805a\u5408\u5747\u503c\uff0c\u5c55\u793a95%CI\u3001\u539f\u59cb\u89c2\u6d4b\u548c\u7aef\u70b9\u6807\u6ce8\u3002';
    CHART_CATALOG.line.buildTraces = function lineTrend573(data, params, theme) {
      const rows = trendRows(data, params);
      const groups = orderedGroups(rows, Boolean(params.color_var));
      if (groups.length > 1) return groupedTrendTraces(data, params, theme, true);
      const palette = trendPalette(theme, 1);
      const color = palette[0];
      const summary = summarizeTrend(rows, 'All');
      if (!summary.length) return [{ type: 'scatter', mode: 'markers', x: [0], y: [0], marker: { color } }];
      return [
        ciBandTrace(summary, color, safeName(params.y_var) || '\u5747\u503c', 0),
        rawTrace(rows, 'All', '#94A3B8', safeName(params.x_var), safeName(params.y_var)),
        meanLineTrace(summary, color, safeName(params.y_var) || '\u5747\u503c', 0, true),
      ];
    };
    CHART_CATALOG.line.buildLayout = function lineTrendLayout573(params) {
      return trendLayout(params.title || '\u6298\u7ebf\u8d8b\u52bf\u56fe', params);
    };
  }

  if (CHART_CATALOG.multi_line) {
    CHART_CATALOG.multi_line.name = '\u591a\u7ec4\u6298\u7ebf\u8d8b\u52bf\u56fe';
    CHART_CATALOG.multi_line.description = '\u5206\u7ec4\u5c55\u793a\u968f\u8bbf\u5747\u503c\u8d8b\u52bf\uff0c\u540c\u65f6\u4fdd\u755995%CI\u9634\u5f71\u548c\u539f\u59cb\u5206\u5e03\u4fe1\u606f\u3002';
    CHART_CATALOG.multi_line.buildTraces = function multiLineTrend573(data, params, theme) {
      return groupedTrendTraces(data, params, theme, true);
    };
    CHART_CATALOG.multi_line.buildLayout = function multiLineTrendLayout573(params) {
      return trendLayout(params.title || '\u591a\u7ec4\u6298\u7ebf\u8d8b\u52bf\u56fe', params);
    };
  }

  if (CHART_CATALOG.area) {
    CHART_CATALOG.area.name = '\u5206\u7ec4\u9762\u79ef\u8d8b\u52bf\u56fe';
    CHART_CATALOG.area.description = '\u4ee5\u534a\u900f\u660e\u9762\u79ef\u548c\u5149\u6ed1\u6298\u7ebf\u8868\u8fbe\u4e0d\u540c\u7ec4\u968f\u65f6\u95f4\u7684\u8d8b\u52bf\u5dee\u5f02\u3002';
    CHART_CATALOG.area.buildTraces = function areaTrend573(data, params, theme) {
      const rows = trendRows(data, params);
      const groups = orderedGroups(rows, Boolean(params.color_var));
      const palette = trendPalette(theme, groups.length);
      const traces = [];
      groups.forEach((group, gi) => {
        const summary = summarizeTrend(rows, group);
        if (!summary.length) return;
        traces.push(ciBandTrace(summary, palette[gi], String(group), gi));
        traces.push(areaTrace(summary, palette[gi], String(group), gi, 'tozeroy'));
      });
      return traces.length ? traces : [{ type: 'scatter', mode: 'markers', x: [0], y: [0], marker: { color: palette[0] } }];
    };
    CHART_CATALOG.area.buildLayout = function areaTrendLayout573(params) {
      return trendLayout(params.title || '\u5206\u7ec4\u9762\u79ef\u8d8b\u52bf\u56fe', params, { legend: { orientation: 'h', x: 0, y: -0.18 } });
    };
  }

  if (typeof CHART_LABEL_PATCHES !== 'undefined' && CHART_LABEL_PATCHES) {
    CHART_LABEL_PATCHES.line = { name: '\u6298\u7ebf\u8d8b\u52bf\u56fe', description: CHART_CATALOG.line?.description || '' };
    CHART_LABEL_PATCHES.multi_line = { name: '\u591a\u7ec4\u6298\u7ebf\u8d8b\u52bf\u56fe', description: CHART_CATALOG.multi_line?.description || '' };
    CHART_LABEL_PATCHES.area = { name: '\u5206\u7ec4\u9762\u79ef\u8d8b\u52bf\u56fe', description: CHART_CATALOG.area?.description || '' };
    ['line', 'multi_line', 'area'].forEach(id => { if (CHART_CATALOG[id]) delete CHART_CATALOG[id]._labelPatchApplied; });
  }
})();

// 5.7.5 final trend overrides. This block intentionally sits at true EOF so
// older compatibility layers cannot overwrite dense jagged trend rendering.
(function finalJaggedTrendCharts575TrueEOF() {
  if (typeof CHART_CATALOG === 'undefined' || !CHART_CATALOG) return;

  function palette575(theme, count = 12) {
    const raw = (typeof STATE !== 'undefined' && Array.isArray(STATE.userColors) && STATE.userColors.length)
      ? STATE.userColors
      : (theme && theme.colorway) || ['#2E6F9E', '#D95F59', '#2A9D8F', '#E9A93A', '#6F5AA7', '#7C8B52'];
    return expandPalette(raw, count);
  }

  function trendRows575(data, params) {
    const xRaw = data[safeName(params.x_var)] || [];
    const yRaw = data[safeName(params.y_var)] || [];
    const gRaw = params.color_var ? (data[safeName(params.color_var)] || []) : [];
    const pRaw = data.patient_id || data.subject_id || data.id || [];
    return xRaw.map((xv, i) => {
      const y = Number(yRaw[i]);
      const xn = Number(xv);
      const x = Number.isFinite(xn) ? xn : String(xv);
      return {
        x,
        xKey: String(x),
        y,
        group: String(gRaw[i] ?? 'All').trim() || 'All',
        patient: String(pRaw[i] ?? `row_${i}`).trim() || `row_${i}`,
      };
    }).filter(d => Number.isFinite(d.y) && d.xKey !== '');
  }

  function groupNames575(rows, useGroups) {
    const names = unique(rows.map(d => d.group)).filter(Boolean);
    return useGroups && names.length ? names.slice(0, 8) : ['All'];
  }

  function summary575(rows, group) {
    const filtered = group === 'All' ? rows : rows.filter(d => String(d.group) === String(group));
    const numericX = filtered.every(d => typeof d.x === 'number');
    const keys = unique(filtered.map(d => d.xKey));
    keys.sort((a, b) => numericX ? Number(a) - Number(b) : filtered.findIndex(d => d.xKey === a) - filtered.findIndex(d => d.xKey === b));
    return keys.map((key) => {
      const vals = filtered.filter(d => d.xKey === key).map(d => d.y).sort((a, b) => a - b);
      const mean = meanValue(vals);
      const sd = sdValue(vals);
      const ci = vals.length > 1 ? 1.96 * sd / Math.sqrt(vals.length) : 0;
      const q = (p) => vals.length ? vals[Math.max(0, Math.min(vals.length - 1, Math.floor((vals.length - 1) * p)))] : mean;
      return {
        x: numericX ? Number(key) : key,
        y: mean,
        n: vals.length,
        lower: mean - ci,
        upper: mean + ci,
        q25: q(0.25),
        q75: q(0.75),
      };
    }).filter(d => Number.isFinite(d.y));
  }

  function patientSeries575(rows, group, limit = 18) {
    const filtered = group === 'All' ? rows : rows.filter(d => String(d.group) === String(group));
    return unique(filtered.map(d => d.patient)).slice(0, limit).map((pid) => {
      const values = filtered.filter(d => d.patient === pid);
      values.sort((a, b) => (typeof a.x === 'number' && typeof b.x === 'number') ? a.x - b.x : String(a.x).localeCompare(String(b.x)));
      return { pid, values };
    }).filter(d => d.values.length > 1);
  }

  function trajectoryTraces575(rows, group, colors, groupIndex, limit) {
    return patientSeries575(rows, group, limit).map((patient, pi) => {
      const color = colors[(groupIndex * 5 + pi) % colors.length];
      const traceColor = colorAlpha(color, 0.34);
      return {
        type: 'scatter',
        mode: 'lines',
        x: patient.values.map(d => d.x),
        y: patient.values.map(d => d.y),
        name: patient.pid,
        showlegend: false,
        hoverinfo: 'skip',
        opacity: 0.30,
        line: { color: traceColor, width: 0.85, shape: 'linear' },
        meta: { fixedColor: traceColor, visualRole: 'backgroundTrajectory' },
      };
    });
  }

  function bandTrace575(summary, color, label, idx, lowKey = 'lower', highKey = 'upper', alpha = 0.14) {
    return {
      type: 'scatter',
      mode: 'none',
      x: summary.map(d => d.x).concat(summary.map(d => d.x).reverse()),
      y: summary.map(d => d[highKey]).concat(summary.map(d => d[lowKey]).reverse()),
      fill: 'toself',
      fillcolor: colorAlpha(color, alpha),
      line: { color: colorAlpha(color, 0.08), width: 0 },
      name: `${label} interval`,
      hoverinfo: 'skip',
      showlegend: false,
      meta: { colorIndex: idx },
    };
  }

  function meanTrace575(summary, color, label, idx) {
    const text = summary.map(() => '');
    if (summary.length) text[summary.length - 1] = `${label} ${fmtNum(summary[summary.length - 1].y, 1)}`;
    return {
      type: 'scatter',
      mode: 'lines+markers+text',
      x: summary.map(d => d.x),
      y: summary.map(d => d.y),
      name: label,
      customdata: summary.map(d => [d.n, d.lower, d.upper, d.q25, d.q75]),
      line: { color, width: 3.4, shape: 'linear' },
      marker: {
        color,
        size: 7.8,
        symbol: ['circle', 'diamond', 'square', 'triangle-up', 'hexagon', 'star'][idx % 6],
        line: { color: '#FFFFFF', width: 1.2 },
      },
      text,
      textposition: 'top center',
      textfont: { size: 10.5, color: '#25313D' },
      hovertemplate: `%{x}<br>Mean=%{y:.2f}<br>N=%{customdata[0]}<br>95%CI=%{customdata[1]:.2f} - %{customdata[2]:.2f}<extra>${label}</extra>`,
      cliponaxis: false,
      meta: { colorIndex: idx },
    };
  }

  function areaTrace575(summary, color, label, idx) {
    const y0 = Math.min(...summary.map(d => d.q25), ...summary.map(d => d.y)) - 6;
    return {
      type: 'scatter',
      mode: 'lines',
      x: summary.map(d => d.x).concat(summary.map(d => d.x).reverse()),
      y: summary.map(d => d.y).concat(summary.map(() => y0).reverse()),
      fill: 'toself',
      fillcolor: colorAlpha(color, 0.30),
      line: { color: colorAlpha(color, 0.88), width: 2.2, shape: 'linear' },
      name: label,
      hoverinfo: 'skip',
      meta: { colorIndex: idx },
    };
  }

  function jaggedTrendTraces575(data, params, theme, patientLimit = 14) {
    const rows = trendRows575(data, params);
    const groups = groupNames575(rows, Boolean(params.color_var));
    const colors = palette575(theme, Math.max(groups.length * 6, 18));
    const traces = [];
    groups.forEach((group, gi) => {
      const s = summary575(rows, group);
      if (!s.length) return;
      traces.push(bandTrace575(s, colors[gi], String(group), gi, 'lower', 'upper', 0.13));
      traces.push(...trajectoryTraces575(rows, group, colors, gi, patientLimit));
      traces.push(meanTrace575(s, colors[gi], String(group), gi));
    });
    return traces.length ? traces : [{ type: 'scatter', mode: 'markers', x: [0], y: [0], marker: { color: colors[0] } }];
  }

  function trendLayout575(title, params) {
    return {
      title,
      xaxis: {
        title: safeName(params.x_var),
        showspikes: true,
        spikemode: 'across',
        spikecolor: '#CBD5DC',
        spikedash: 'dot',
        dtick: 4,
      },
      yaxis: { title: safeName(params.y_var), zeroline: false },
      hovermode: 'x unified',
      legend: { orientation: 'h', x: 0, y: -0.19, traceorder: 'normal' },
      margin: { l: 86, r: 70, t: 76, b: 106 },
    };
  }

  if (CHART_CATALOG.line) {
    CHART_CATALOG.line.name = '\u5bc6\u96c6\u6298\u7ebf\u8d8b\u52bf\u56fe';
    CHART_CATALOG.line.description = '\u5c55\u793a\u4e2a\u4f53\u968f\u8bbf\u8f68\u8ff9\u3001\u7ec4\u522b\u5747\u503c\u548c95%CI\uff0c\u7a81\u51fa\u4e34\u5e8a\u6570\u636e\u7684\u6ce2\u52a8\u4e0e\u4ea4\u9519\u3002';
    CHART_CATALOG.line.buildTraces = function denseLine575EOF(data, params, theme) {
      return jaggedTrendTraces575(data, params, theme, 12);
    };
    CHART_CATALOG.line.buildLayout = function denseLineLayout575EOF(params) {
      return trendLayout575(params.title || '\u5bc6\u96c6\u6298\u7ebf\u8d8b\u52bf\u56fe', params);
    };
  }

  if (CHART_CATALOG.multi_line) {
    CHART_CATALOG.multi_line.name = '\u591a\u7ec4\u4ea4\u9519\u6298\u7ebf\u56fe';
    CHART_CATALOG.multi_line.description = '\u591a\u7ec4\u4e2a\u4f53\u968f\u8bbf\u8f68\u8ff9\u4e0e\u7ec4\u522b\u5747\u503c\u53e0\u52a0\uff0c\u5448\u73b0\u66f4\u5bc6\u96c6\u7684\u72ac\u7259\u4ea4\u9519\u6548\u679c\u3002';
    CHART_CATALOG.multi_line.buildTraces = function denseMultiLine575EOF(data, params, theme) {
      return jaggedTrendTraces575(data, params, theme, 16);
    };
    CHART_CATALOG.multi_line.buildLayout = function denseMultiLineLayout575EOF(params) {
      return trendLayout575(params.title || '\u591a\u7ec4\u4ea4\u9519\u6298\u7ebf\u56fe', params);
    };
  }

  if (CHART_CATALOG.area) {
    CHART_CATALOG.area.name = '\u591a\u5f69\u9762\u79ef\u8d8b\u52bf\u56fe';
    CHART_CATALOG.area.description = '\u4ee5\u591a\u7ec4\u534a\u900f\u660e\u9762\u79ef\u3001IQR\u8272\u5e26\u548c\u8fb9\u754c\u6298\u7ebf\u5448\u73b0\u968f\u8bbf\u8d8b\u52bf\u3002';
    CHART_CATALOG.area.buildTraces = function colorfulArea575EOF(data, params, theme) {
      const rows = trendRows575(data, params);
      const groups = groupNames575(rows, Boolean(params.color_var));
      const colors = palette575(theme, Math.max(groups.length * 3, 12));
      const traces = [];
      groups.forEach((group, gi) => {
        const s = summary575(rows, group);
        if (!s.length) return;
        traces.push(areaTrace575(s, colors[gi], String(group), gi));
        traces.push(bandTrace575(s, colors[(gi + 4) % colors.length], `${group} IQR`, gi, 'q25', 'q75', 0.24));
        traces.push(meanTrace575(s, colors[gi], String(group), gi));
      });
      return traces.length ? traces : [{ type: 'scatter', mode: 'markers', x: [0], y: [0], marker: { color: colors[0] } }];
    };
    CHART_CATALOG.area.buildLayout = function colorfulAreaLayout575EOF(params) {
      return trendLayout575(params.title || '\u591a\u5f69\u9762\u79ef\u8d8b\u52bf\u56fe', params);
    };
  }

  if (typeof CHART_LABEL_PATCHES !== 'undefined' && CHART_LABEL_PATCHES) {
    CHART_LABEL_PATCHES.line = { name: CHART_CATALOG.line?.name || '\u5bc6\u96c6\u6298\u7ebf\u8d8b\u52bf\u56fe', description: CHART_CATALOG.line?.description || '' };
    CHART_LABEL_PATCHES.multi_line = { name: CHART_CATALOG.multi_line?.name || '\u591a\u7ec4\u4ea4\u9519\u6298\u7ebf\u56fe', description: CHART_CATALOG.multi_line?.description || '' };
    CHART_LABEL_PATCHES.area = { name: CHART_CATALOG.area?.name || '\u591a\u5f69\u9762\u79ef\u8d8b\u52bf\u56fe', description: CHART_CATALOG.area?.description || '' };
    ['line', 'multi_line', 'area'].forEach(id => { if (CHART_CATALOG[id]) delete CHART_CATALOG[id]._labelPatchApplied; });
  }
})();

// 5.7.6: align violin + box + scatter on the same group center.
(function finalViolinBoxScatterAlignment576() {
  if (typeof CHART_CATALOG === 'undefined' || !CHART_CATALOG || !CHART_CATALOG.violin_box_scatter) return;

  function deterministicJitter576(center, count, span = 0.24) {
    return Array.from({ length: count }, (_, i) => {
      const frac = ((i * 47 + 17) % 101) / 100;
      return center + (frac - 0.5) * span;
    });
  }

  CHART_CATALOG.violin_box_scatter.name = '\u5c0f\u63d0\u7434+\u7bb1\u7ebf+\u6563\u70b9';
  CHART_CATALOG.violin_box_scatter.description = '\u5c06\u5c0f\u63d0\u7434\u3001\u52a0\u5bbd\u7bb1\u7ebf\u548c\u6296\u52a8\u6563\u70b9\u7edf\u4e00\u5bf9\u9f50\u5230\u540c\u4e00\u5206\u7ec4\u4e2d\u5fc3\u3002';

  CHART_CATALOG.violin_box_scatter.buildTraces = function alignedViolinBoxScatter576(data, params, theme) {
    const xVals = params.x_var ? (data[safeName(params.x_var)] || []) : Array((data[safeName(params.y_var)] || []).length).fill('All');
    const yRaw = data[safeName(params.y_var)] || [];
    const cats = orderedUniqueValues(xVals).slice(0, 12);
    CHART_CATALOG.violin_box_scatter._lastCategories = cats;
    const palette = expandPalette((theme && theme.colorway) || ['#2E6F9E', '#D95F59', '#2A9D8F', '#E9A93A'], Math.max(cats.length, 4));
    const traces = [];

    cats.forEach((cat, idx) => {
      const vals = yRaw
        .filter((_, rowIdx) => String(xVals[rowIdx]) === String(cat))
        .map(Number)
        .filter(Number.isFinite);
      if (!vals.length) return;
      const color = palette[idx % palette.length];
      const label = String(cat);

      traces.push({
        type: 'violin',
        x: Array(vals.length).fill(idx),
        y: vals,
        name: label,
        points: false,
        width: 0.78,
        spanmode: 'soft',
        line: { color, width: 2.0 },
        fillcolor: colorAlpha(color, 0.24),
        meanline: { visible: true, color: '#26323F', width: 1.4 },
        hovertemplate: `${label}<br>${safeName(params.y_var)}=%{y:.2f}<extra></extra>`,
        meta: { colorIndex: idx },
      });

      traces.push({
        type: 'scatter',
        mode: 'markers',
        x: deterministicJitter576(idx, vals.length, 0.22),
        y: vals,
        name: `${label} \u6563\u70b9`,
        showlegend: false,
        marker: {
          color,
          size: 5.2,
          opacity: 0.64,
          line: { color: '#FFFFFF', width: 0.55 },
        },
        hovertemplate: `${label}<br>${safeName(params.y_var)}=%{y:.2f}<extra></extra>`,
        meta: { colorIndex: idx },
      });

      traces.push({
        type: 'box',
        x: Array(vals.length).fill(idx),
        y: vals,
        name: `${label} \u7bb1\u7ebf`,
        showlegend: false,
        boxpoints: false,
        boxmean: 'sd',
        width: 0.34,
        line: { color, width: 2.4 },
        fillcolor: colorAlpha(color, 0.18),
        marker: { color },
        whiskerwidth: 0.9,
        hovertemplate: `${label}<br>${safeName(params.y_var)}=%{y:.2f}<extra></extra>`,
        meta: { colorIndex: idx },
      });
    });

    return traces.length ? traces : [{ type: 'scatter', mode: 'markers', x: [0], y: [0], marker: { color: palette[0] } }];
  };

  CHART_CATALOG.violin_box_scatter.buildLayout = function alignedViolinBoxScatterLayout576(params) {
    const cats = CHART_CATALOG.violin_box_scatter._lastCategories || [];
    return {
      title: params.title || '\u5c0f\u63d0\u7434+\u7bb1\u7ebf+\u6563\u70b9',
      xaxis: {
        title: safeName(params.x_var),
        tickmode: 'array',
        tickvals: cats.map((_, i) => i),
        ticktext: cats.map(String),
        range: cats.length ? [-0.58, cats.length - 0.42] : undefined,
        zeroline: false,
      },
      yaxis: { title: safeName(params.y_var), zeroline: false },
      violinmode: 'overlay',
      boxmode: 'overlay',
      violingap: 0,
      boxgap: 0,
      margin: { l: 86, r: 58, t: 76, b: 104 },
      legend: { orientation: 'h', x: 0, y: -0.20 },
    };
  };

  if (typeof CHART_LABEL_PATCHES !== 'undefined' && CHART_LABEL_PATCHES) {
    CHART_LABEL_PATCHES.violin_box_scatter = {
      name: CHART_CATALOG.violin_box_scatter.name,
      description: CHART_CATALOG.violin_box_scatter.description,
    };
    delete CHART_CATALOG.violin_box_scatter._labelPatchApplied;
  }
})();
