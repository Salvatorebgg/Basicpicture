# 二次集成说明

## 架构概述

本平台采用 FastAPI + 原生前端 SPA 的轻量架构：

- **后端**：Python FastAPI，负责上传、读取、变量识别、统计计算、三线表和导出。
- **前端**：HTML / CSS / JavaScript，无前端框架依赖。
- **图表**：本地 Plotly.js，图表配置集中在 `app/static/js/plotConfigs.js`，渲染后统一经过 CNS 出版级后处理。
- **地图资产**：中国省界和世界国界使用 `app/static/china_provinces.geojson`、`app/static/world_countries.geojson`，前端预览和后端出版级导出均走本地资产。
- **数据链路**：先选图表，再加载对应示例或上传当前图数据；图表渲染通过 `/api/dataset/data` 获取完整列式数据。

## 推荐集成方式

### 方式一：独立部署

```bash
python run.py
```

默认访问：

```text
http://127.0.0.1:8866
```

主站可以用 iframe 或普通链接集成：

```html
<iframe src="http://127.0.0.1:8866" width="100%" height="860"></iframe>
<a href="http://127.0.0.1:8866" target="_blank" rel="noreferrer">打开临床图表平台</a>
```

如果默认端口被旧服务占用，可指定新端口：

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8871
```

### 方式二：挂载到 FastAPI 主应用

```python
import sys
from fastapi import FastAPI

sys.path.insert(0, "/path/to/Basicpicture")
from app.main import app as chart_app

main_app = FastAPI()
main_app.mount("/charts", chart_app)
```

访问：

```text
http://your-site.com/charts
```

### 方式三：只调用 API

上传文件：

```javascript
const formData = new FormData();
formData.append("file", file);

const uploadResp = await fetch("http://127.0.0.1:8866/api/upload", {
  method: "POST",
  body: formData,
});
const upload = await uploadResp.json();
```

读取完整列式数据用于自定义图表：

```javascript
const dataResp = await fetch("http://127.0.0.1:8866/api/dataset/data", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    upload_id: upload.upload_id,
    sheet_name: upload.sheet_names?.[0] || null,
  }),
});
const dataset = await dataResp.json();

// dataset.data 是列式结构：{ age: [...], bmi: [...], group: [...] }
```

使用示例数据：

```javascript
const dataResp = await fetch("http://127.0.0.1:8866/api/dataset/data", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    use_demo: true,
    dataset_name: "scatter_example",
  }),
});
const dataset = await dataResp.json();
```

生成基线资料表：

```javascript
const tableResp = await fetch("http://127.0.0.1:8866/api/table/baseline", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    upload_id: upload.upload_id,
    group_var: "group",
    variables: ["age", "sex", "bmi"],
    decimal_places: 2,
    p_digits: 3,
  }),
});
const table = await tableResp.json();
```

### 方式四：复用前端图表配置

如果主项目已有自己的前端，只想复用图表类型：

1. 引入 Plotly.js。
2. 复制或打包 `app/static/js/chartThemes.js`。
3. 复制或打包 `app/static/js/plotConfigs.js`。
4. 用 `/api/dataset/data` 获取完整列式数据。
5. 调用对应图表配置的 `buildTraces(data, params, theme)` 和 `buildLayout(params, theme)`。
6. 使用 `Plotly.newPlot(container, traces, layout, options)` 渲染。

最小示例：

```javascript
const config = CHART_CATALOG.scatter;
const theme = CHART_THEMES.clinicalTheme;
const params = { x_var: "age", y_var: "bmi", color_var: "group" };

const traces = config.buildTraces(dataset.data, params, theme);
const layout = config.buildLayout(params, theme);
Plotly.newPlot("chart", traces, layout, { responsive: true, displaylogo: false });
```

## 关键接口

| 端点 | 用途 |
|---|---|
| `/api/upload` | 上传文件并返回预览、变量类型和摘要 |
| `/api/read-sheet` | 切换 Excel 工作表 |
| `/api/examples` | 获取示例数据列表 |
| `/api/examples/{name}` | 获取示例预览和变量类型 |
| `/api/dataset/data` | 获取完整列式数据，推荐图表渲染使用 |
| `/api/chart/variables` | 获取后端变量推荐 |
| `/api/table/baseline` | 生成基线三线表 |
| `/api/table/descriptive` | 生成描述统计表 |
| `/api/table/missing` | 生成缺失统计表 |

## CORS 配置

默认允许任意来源调用，方便本地集成。生产环境建议限制来源：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 生产部署

### Uvicorn

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8866
```

### Gunicorn + Uvicorn Worker

```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8866
```

### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name charts.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8866;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 200M;
    }
}
```

### Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8866
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8866"]
```

## 数据和会话隔离

上传文件保存在 `data/uploads/`，文件名前缀使用 UUID。生产环境建议：

- 定时清理 `data/uploads/` 和 `outputs/`。
- 在外层应用中绑定用户身份和 `upload_id`。
- 对上传大小、并发请求和导出频率做限制。
- 如需长期保存结果，使用数据库记录上传、分析参数和导出文件路径。

## 注意事项

- 前端默认加载本地 `app/static/vendor/plotly.min.js`，避免 CDN 失败导致图表渲染或 PNG/SVG 导出不可用。
- 地图预览和导出不应依赖外部底图服务；部署时请同时保留 `china_provinces.geojson` 和 `world_countries.geojson`。
- 图表区 PNG/SVG 使用 `Plotly.toImage` 导出当前画布；CSV 优先导出当前图表所选变量对应的完整源数据。
- “出版级导出”优先调用 `/api/export/chart/publication` 生成 matplotlib/seaborn/geopandas PNG/SVG/PDF；后端暂未覆盖的图表自动回落到前端 Plotly 高分辨率 PNG/SVG 导出，避免按钮失效。
- 图表生成推荐使用 `/api/dataset/data`，不要直接用 `/api/examples/{name}` 的 `preview` 字段，因为 preview 只包含前 10 行。
- 新增图表时必须同时维护示例数据、`exampleDataset` 和默认变量映射，确保用户点击图表即可得到可运行示例。
