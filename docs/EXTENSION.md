# 后续扩展说明

本文档说明如何在当前版本中添加新图表、新示例数据、新主题和新的三线表类型。当前项目的关键约定是：**每个图表类型必须有对应示例数据，并且前端变量槽位要能默认选中一组可运行变量**。

## 添加新图表类型

### 1. 创建示例数据生成函数

在 `app/services/sample_service.py` 中添加函数：

```python
def make_new_chart_example() -> pd.DataFrame:
    n = 100
    return pd.DataFrame({
        "x_value": np.random.normal(0, 1, n),
        "y_value": np.random.normal(0, 1, n),
        "group": np.random.choice(["A", "B"], n),
    })
```

注册到 `EXAMPLE_MAKERS`：

```python
EXAMPLE_MAKERS = {
    # existing examples
    "new_chart_example": make_new_chart_example,
}
```

应用启动时会在缺失时自动生成 `data/examples/new_chart_example.csv`。修改已有示例生成逻辑后，需要重新生成对应 CSV，否则前端下载到的仍是旧数据。

### 2. 添加前端图表配置

在 `app/static/js/plotConfigs.js` 的 `CHART_CATALOG` 中添加：

```javascript
new_chart: {
  id: "new_chart",
  name: "新图表",
  category: "advanced", // basic | advanced | display | spatial
  description: "图表说明文字",
  icon: "New",
  exampleDataset: "new_chart_example",
  buildTraces(data, params, theme) {
    return [{
      type: "scatter",
      mode: "markers",
      x: data[params.x_var] || [],
      y: data[params.y_var] || [],
      marker: {
        color: theme.colorway[0],
        size: 8,
        opacity: theme.opacity,
      },
    }];
  },
  buildLayout(params) {
    return {
      title: params.title || "新图表",
      xaxis: { title: params.x_var || "X" },
      yaxis: { title: params.y_var || "Y" },
    };
  },
},
```

只要 `category` 是现有四类之一，图表会自动出现在对应纵向列表中，不需要额外维护分类数组。

### 3. 添加变量选择槽位

在 `app/static/js/variableSelect.js` 的 `getChartVarSlots()` 中添加：

```javascript
new_chart: [
  { name: "x_var", label: "X 轴变量", optional: false },
  { name: "y_var", label: "Y 轴变量", optional: false },
  { name: "color_var", label: "颜色分组", optional: true },
],
```

### 4. 添加默认变量映射

同一个文件中维护 `CHART_DEFAULT_VARS`：

```javascript
const CHART_DEFAULT_VARS = {
  // existing defaults
  new_chart: { x_var: "x_value", y_var: "y_value", color_var: "group" },
};
```

这一步很重要。用户点击图表后，平台会绑定 `exampleDataset`，用户点击“加载示例”即可得到该图专属数据，再用这里的映射选中变量，确保示例数据和图表生成一一对应。

### 5. 可选：添加后端变量推荐

如果外部系统调用 `/api/chart/variables`，需要在 `app/services/chart_service.py` 的 `get_chart_variables()` 中添加：

```python
"new_chart": {
    "required": {"x": num_cols, "y": num_cols},
    "optional": {"color": cat_cols},
},
```

## 添加新图表主题

在 `app/static/js/chartThemes.js` 的 `CHART_THEMES` 中添加：

```javascript
myNewTheme: {
  name: "我的主题",
  fontFamily: "'Noto Sans SC', 'Microsoft YaHei', sans-serif",
  bgColor: "#ffffff",
  plotBgColor: "#ffffff",
  gridColor: "#e7ecea",
  zeroLineColor: "#dce8e3",
  titleColor: "#142a2e",
  axisColor: "#142a2e",
  axisLineColor: "#dce8e3",
  ink: "#142a2e",
  colorway: ["#0E7C7B", "#B34D3E", "#274C77", "#D59F32", "#665C9E"],
  markerLine: "#ffffff",
  opacity: 0.92,
  titleFontSize: 17,
  axisFontSize: 12,
  tickFontSize: 10,
  legendFontSize: 11,
},
```

在 `app/static/index.html` 的 `#chartThemeSelect` 中添加：

```html
<option value="myNewTheme">我的主题</option>
```

## 添加新的三线表类型

### 1. 后端表格函数

在 `app/services/table_service.py` 中添加：

```python
def build_my_table(df: pd.DataFrame, variables: list[str] | None = None) -> dict:
    rows = []
    # 计算逻辑
    return {
        "columns": ["Variable", "Value"],
        "rows": rows,
        "n_total": len(df),
    }
```

### 2. FastAPI 路由

在 `app/main.py` 中添加：

```python
@app.post("/api/table/my-table")
def my_table(req: TableRequest) -> dict:
    df = _get_df(req)
    return build_my_table(df, req.variables)
```

### 3. 前端入口

在 `app/static/index.html` 中添加表类型按钮：

```html
<button class="inner-tab" data-tt="my-table">我的表格</button>
```

在 `app/static/js/tableGenerator.js` 中添加 endpoint 分支，并在 `renderTable()` 中补充标题。

## 添加新数据格式

编辑 `app/services/io_service.py`：

1. 在 `SUPPORTED_EXTENSIONS` 中添加后缀。
2. 在 `read_file()` 中添加读取逻辑。
3. 返回前调用 `normalize_dataframe(df)`，保持缺失值、空行和列名处理一致。

示例：添加 SAS `.sas7bdat`：

```python
import pyreadstat

SUPPORTED_EXTENSIONS.add(".sas7bdat")

elif ext == ".sas7bdat":
    df, _ = pyreadstat.read_sas7bdat(filepath)
    return normalize_dataframe(df)
```

同时更新 `requirements.txt`：

```text
pyreadstat>=1.2.0
```

## 本地 Plotly 与导出

当前前端已通过本地文件引入 Plotly.js：

```html
<script src="/static/vendor/plotly.min.js"></script>
```

升级 Plotly 时直接替换 `app/static/vendor/plotly.min.js`，然后确认浏览器控制台中 `window.Plotly` 存在。

图表区 PNG/SVG 导出依赖 `Plotly.toImage`，CSV 导出优先使用当前图表所选变量对应的完整列式源数据。新增图表时，如需特殊导出字段，请确保 `collectChartParams()` 中能收集到对应变量名。

空间图应优先使用本地边界资产。中国图使用 `app/static/china_provinces.geojson`，世界图使用 `app/static/world_countries.geojson`；如替换资产，需要同步检查前端 `featureidkey` 和后端 `publication_chart_service.py` 中的字段映射。

“出版级导出”按钮会先判断当前图表是否在 `SERVER_PUBLICATION_CHARTS` 中。支持的图表走 `/api/export/chart/publication`，由 `publication_chart_service.py` 通过 matplotlib/seaborn/geopandas 生成 PNG/SVG/PDF；不支持的图表只显示 PNG/SVG，并自动使用前端 Plotly 高分辨率导出作为兜底。

## UI 扩展规则

- 图表选择列表默认单列纵向排列，新增图表无需改 CSS。
- 单个图表卡片应提供 `name`、`description` 和 `exampleDataset`，方便用户理解。
- 摘要卡片使用 `.compact-summary`，避免数量增加后纵向过长。
- 不要让图表生成依赖 `STATE.previewRows`；预览只用于展示，生成应使用完整数据接口。
- 新图表会自动经过 `polishTracesForPublication()` 和 `polishLayoutForPublication()` 统一美化；只有特殊图形布局才需要在 `plotConfigs.js` 中单独覆盖。
- 如果某个新图表需要真正的 PDF 出版级导出，需要同时扩展 `publication_chart_service.py`、`/api/export/chart/publication` 和前端 `SERVER_PUBLICATION_CHARTS`。

## 验证命令

每次新增图表或接口后建议运行：

```bash
python tests\smoke.py
python -m compileall app
node --check app\static\js\plotConfigs.js
node --check app\static\js\variableSelect.js
node --check app\static\js\charts.js
node --check app\static\js\tableGenerator.js
```

也可以启动临时端口验证新接口：

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8871
```

```bash
curl -X POST http://127.0.0.1:8871/api/dataset/data \
  -H "Content-Type: application/json" \
  -d "{\"use_demo\": true, \"dataset_name\": \"scatter_example\"}"
```
