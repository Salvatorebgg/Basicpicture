from __future__ import annotations

import json
import uuid
from pathlib import Path

import numpy as np
import pandas as pd
from fastapi import Body, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, Response
from fastapi.staticfiles import StaticFiles

from app.config import STATIC_DIR, EXAMPLES_DIR, UPLOADS_DIR, OUTPUTS_DIR
from app.schemas import AnalyzeRequest, ChartRequest, TableRequest, ExportRequest
from app.services.io_service import (
    read_file,
    get_sheet_names,
    save_upload,
    get_example_datasets,
)
from app.services.variable_service import classify_variables, summarize_dataset
from app.services.stats_service import calc_descriptive, calc_group_comparison
from app.services.table_service import (
    build_baseline_table,
    build_descriptive_table,
    build_missing_table,
)
from app.services.interpret_service import generate_interpretation
from app.services.chart_service import get_chart_variables, prepare_chart_data
from app.services.sample_service import EXAMPLE_MAKERS
from app.services.export_service import (
    export_to_csv,
    export_to_excel,
    export_to_html_table,
    export_chart_config,
)
from app.services.publication_chart_service import (
    set_publication_style,
    generate_scatter_plot,
    generate_box_plot,
    generate_bar_plot,
    generate_heatmap,
    generate_line_plot,
    generate_forest_plot,
    generate_survival_plot,
    generate_roc_plot,
    generate_histogram,
    generate_china_map,
    generate_world_map,
)

# Ensure dirs exist
for d in [STATIC_DIR, EXAMPLES_DIR, UPLOADS_DIR, OUTPUTS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Generate example CSV files if missing
for name, maker_fn in EXAMPLE_MAKERS.items():
    dest = EXAMPLES_DIR / f"{name}.csv"
    if not dest.exists():
        try:
            maker_fn().to_csv(dest, index=False, encoding="utf-8-sig")
        except Exception:
            pass

app = FastAPI(
    title="Clinical Chart & Table Platform",
    version="1.2.3",
    description="Interactive clinical basic statistics graphs and three-line table one-click generation platform.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/", response_class=HTMLResponse)
def index() -> HTMLResponse:
    return HTMLResponse(
        (STATIC_DIR / "index.html").read_text(encoding="utf-8"),
        headers={
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            "Pragma": "no-cache",
            "Expires": "0",
        },
    )


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "version": "1.2.3"}


# ── Upload ─────────────────────────────────────────────


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)) -> dict:
    try:
        meta = await save_upload(file)
        df = read_file(meta["path"], meta["filename"])
        var_types = classify_variables(df)
        summary = summarize_dataset(df, var_types)
        sheets = get_sheet_names(meta["path"], meta["filename"])
        preview = df.head(200).fillna("").to_dict(orient="records")
        return {
            "upload_id": meta["upload_id"],
            "filename": meta["filename"],
            "file_type": meta["ext"],
            "sheet_names": sheets if sheets else None,
            "row_count": len(df),
            "col_count": len(df.columns),
            "columns": list(df.columns),
            "dtypes": {c: str(df[c].dtype) for c in df.columns},
            "variable_types": var_types,
            "preview": preview,
            "missing_percent": summary["missing_percent"],
            "summary": summary,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}")


@app.post("/api/read-sheet")
async def read_sheet(
    payload: dict | None = Body(default=None),
    upload_id: str = "",
    sheet_name: str = "",
) -> dict:
    """Read a specific sheet from uploaded Excel file."""
    if payload:
        upload_id = payload.get("upload_id", upload_id)
        sheet_name = payload.get("sheet_name", sheet_name)
    filepath = None
    filename = ""
    for f in UPLOADS_DIR.iterdir():
        if f.stem.startswith(upload_id):
            filepath = str(f)
            filename = f.name.split("_", 1)[1] if "_" in f.name else f.name
            break
    if not filepath:
        raise HTTPException(status_code=404, detail="Upload not found")
    df = read_file(filepath, filename, sheet_name if sheet_name else None)
    var_types = classify_variables(df)
    summary = summarize_dataset(df, var_types)
    return {
        "upload_id": upload_id,
        "sheet_name": sheet_name,
        "row_count": len(df),
        "col_count": len(df.columns),
        "columns": list(df.columns),
        "dtypes": {c: str(df[c].dtype) for c in df.columns},
        "variable_types": var_types,
        "preview": df.head(200).fillna("").to_dict(orient="records"),
        "missing_percent": summary["missing_percent"],
        "summary": summary,
    }


# ── Data Info ──────────────────────────────────────────


@app.get("/api/examples")
def list_examples() -> list[dict]:
    return get_example_datasets()


@app.get("/api/examples/{name}")
def get_example(name: str) -> dict:
    filepath = EXAMPLES_DIR / f"{name}.csv"
    if not filepath.exists():
        raise HTTPException(status_code=404, detail=f"Example dataset '{name}' not found")
    df = pd.read_csv(filepath)
    var_types = classify_variables(df)
    summary = summarize_dataset(df, var_types)
    return {
        "name": name,
        "filename": f"{name}.csv",
        "row_count": len(df),
        "col_count": len(df.columns),
        "columns": list(df.columns),
        "dtypes": {c: str(df[c].dtype) for c in df.columns},
        "variable_types": var_types,
        "preview": df.head(200).fillna("").to_dict(orient="records"),
        "missing_percent": summary["missing_percent"],
        "summary": summary,
    }


@app.post("/api/dataset/data")
def dataset_data(req: dict) -> dict:
    """Return the full active dataset in column-oriented form for chart rendering."""
    df = _get_df_simple(req)
    df_copy = df.copy()
    var_types = classify_variables(df_copy)
    summary = summarize_dataset(df_copy, var_types)
    return {
        "name": req.get("dataset_name") or req.get("upload_id") or "active_dataset",
        "row_count": len(df),
        "col_count": len(df.columns),
        "columns": list(df.columns),
        "dtypes": {c: str(df[c].dtype) for c in df.columns},
        "variable_types": var_types,
        "summary": summary,
        "data": _df_to_column_data(df),
    }


@app.get("/api/examples/{name}/download")
def download_example(name: str) -> FileResponse:
    filepath = EXAMPLES_DIR / f"{name}.csv"
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Example not found")
    return FileResponse(filepath, media_type="text/csv", filename=f"{name}.csv")


@app.get("/api/examples/download-all")
def download_all_examples() -> FileResponse:
    import zipfile
    zip_path = OUTPUTS_DIR / "all_examples.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for fp in sorted(EXAMPLES_DIR.glob("*.csv")):
            zf.write(fp, fp.name)
    return FileResponse(zip_path, media_type="application/zip", filename="all_examples.zip")


@app.get("/api/variable-types/{name}")
def get_variable_types(name: str = "") -> dict:
    """Get variable type classification for example or uploaded data."""
    filepath = EXAMPLES_DIR / f"{name}.csv"
    if not filepath.exists():
        raise HTTPException(status_code=404, detail=f"Example '{name}' not found")
    df = pd.read_csv(filepath)
    var_types = classify_variables(df)
    return {"name": name, "variable_types": var_types, "dtypes": {c: str(df[c].dtype) for c in df.columns}}


# ── Statistics ─────────────────────────────────────────


@app.post("/api/stats/descriptive")
def descriptive_stats(req: AnalyzeRequest) -> dict:
    df = _get_df(req)
    stats = {}
    for col in df.columns:
        s = calc_descriptive(df, col)
        if s["n"] > 0:
            stats[col] = s
    var_types = classify_variables(df)
    return {"variables": stats, "summary": summarize_dataset(df, var_types)}


@app.post("/api/stats/compare")
def compare_groups(req: dict) -> dict:
    """Compare variables across groups. Requires: upload_id/use_demo, var, group_var."""
    df = _get_df_simple(req)
    var = req.get("var", "")
    group_var = req.get("group_var", "")
    if not var or not group_var:
        raise HTTPException(status_code=400, detail="var and group_var are required")
    return calc_group_comparison(df, var, group_var)


# ── Charts ─────────────────────────────────────────────


@app.post("/api/chart/variables")
def chart_variables(req: ChartRequest) -> dict:
    df = _get_df_simple(req.dict() if hasattr(req, "dict") else req)
    return get_chart_variables(df, req.chart_type)


@app.post("/api/chart/data")
def chart_data(req: ChartRequest) -> dict:
    df = _get_df_simple(req.dict() if hasattr(req, "dict") else req)
    return prepare_chart_data(df, req.chart_type, req.dict())


# ── Tables ─────────────────────────────────────────────


@app.post("/api/table/baseline")
def baseline_table(req: TableRequest) -> dict:
    df = _get_df(req)
    group_var = req.group_var
    if not group_var or group_var not in df.columns:
        cat_cols = [c for c in df.columns if df[c].nunique() <= 10 and df[c].nunique() >= 2]
        if cat_cols:
            group_var = cat_cols[0]
        else:
            raise HTTPException(status_code=400, detail="No suitable group variable found")
    return build_baseline_table(df, group_var, req.variables, req.decimal_places, req.p_digits)


@app.post("/api/table/descriptive")
def descriptive_table(req: TableRequest) -> dict:
    df = _get_df(req)
    return build_descriptive_table(df, req.variables, req.decimal_places)


@app.post("/api/table/missing")
def missing_table(req: TableRequest) -> dict:
    df = _get_df(req)
    return build_missing_table(df)


# ── Interpretation ─────────────────────────────────────


@app.post("/api/interpret")
def interpret_chart(req: dict = Body(...)) -> dict:
    """Generate quality assessment and interpretation for a chart.

    Accepts chart_type, chart_params, and data source info.
    Returns structured interpretation with quality assessment.
    """
    df = _get_df_simple(req)
    chart_type = req.get("chart_type", "")
    chart_params = req.get("chart_params") or {}
    result = generate_interpretation(df, chart_type, chart_params)
    return _sanitize_for_json(result)


# ── Export ─────────────────────────────────────────────


@app.post("/api/export/chart/publication")
async def export_publication_chart(req: dict = Body(...)) -> Response:
    """Export high-quality publication chart (PNG/SVG/PDF)."""
    chart_type = req.get("chart_type", "scatter")
    format_type = req.get("format", "png")  # png, svg, pdf
    style = _normalize_publication_style(req.get("style", "cns"))
    title = req.get("title", "")
    user_colors = req.get("colors") or None
    user_marker_size = req.get("marker_size")
    user_line_width = req.get("line_width")

    # Pre-configure publication style with user customizations
    set_publication_style(style, colors=user_colors,
                          marker_size=user_marker_size, line_width=user_line_width)

    # Get data
    df = _get_df_simple(req)

    # Extract parameters
    x_var = req.get("x_var", "")
    y_var = req.get("y_var", "")
    color_var = req.get("color_var")
    value_vars = req.get("value_vars", [])

    try:
        # Generate chart based on type
        if chart_type in ["scatter", "grouped_scatter"]:
            if not x_var or not y_var:
                raise HTTPException(status_code=400, detail="x_var and y_var required")
            png_bytes, svg_bytes, pdf_bytes = generate_scatter_plot(
                df, x_var, y_var, color_var, title, style
            )
        elif chart_type in ["box", "violin", "box_scatter", "violin_box_scatter"]:
            if not y_var:
                raise HTTPException(status_code=400, detail="y_var required")
            png_bytes, svg_bytes, pdf_bytes = generate_box_plot(
                df, y_var, x_var, color_var, title, style
            )
        elif chart_type in ["bar", "stacked_bar", "error_bar"]:
            if not x_var or not y_var:
                raise HTTPException(status_code=400, detail="x_var and y_var required")
            png_bytes, svg_bytes, pdf_bytes = generate_bar_plot(
                df, x_var, y_var, color_var, title, style
            )
        elif chart_type in ["heatmap", "correlation_heatmap"]:
            png_bytes, svg_bytes, pdf_bytes = generate_heatmap(
                df, value_vars, title, style, correlation=True
            )
        elif chart_type in ["line", "multi_line", "area"]:
            if not x_var or not y_var:
                raise HTTPException(status_code=400, detail="x_var and y_var required")
            png_bytes, svg_bytes, pdf_bytes = generate_line_plot(
                df, x_var, y_var, color_var, title, style
            )
        elif chart_type == "histogram":
            if not x_var and not y_var:
                raise HTTPException(status_code=400, detail="x_var or y_var required")
            png_bytes, svg_bytes, pdf_bytes = generate_histogram(
                df, x_var or y_var, color_var, title, style
            )
        elif chart_type == "forest":
            ci_lower = req.get("ci_lower_var", "")
            ci_upper = req.get("ci_upper_var", "")
            if not x_var or not y_var or not ci_lower or not ci_upper:
                raise HTTPException(status_code=400, detail="x_var, y_var, ci_lower_var, ci_upper_var required")
            png_bytes, svg_bytes, pdf_bytes = generate_forest_plot(
                df, x_var, y_var, ci_lower, ci_upper, title, style
            )
        elif chart_type == "survival":
            time_var = req.get("time_var", "")
            event_var = req.get("event_var", "")
            if not time_var or not event_var:
                raise HTTPException(status_code=400, detail="time_var and event_var required")
            png_bytes, svg_bytes, pdf_bytes = generate_survival_plot(
                df, time_var, event_var, color_var, title, style
            )
        elif chart_type == "roc":
            outcome_var = req.get("outcome_var", "")
            predictor_var = req.get("predictor_var", "")
            if not outcome_var or not predictor_var:
                raise HTTPException(status_code=400, detail="outcome_var and predictor_var required")
            png_bytes, svg_bytes, pdf_bytes = generate_roc_plot(
                df, outcome_var, predictor_var, title, style
            )
        elif chart_type == "china_map":
            province_var = req.get("province_var", x_var or "")
            map_value_var = req.get("map_value_var", req.get("y_var", ""))
            if not province_var or not map_value_var:
                raise HTTPException(status_code=400, detail="province_var and value variable required")
            png_bytes, svg_bytes, pdf_bytes = generate_china_map(
                df, province_var, map_value_var, title, style
            )
        elif chart_type == "world_map":
            country_var = req.get("country_var", x_var or "")
            map_value_var = req.get("map_value_var", req.get("y_var", ""))
            if not country_var or not map_value_var:
                raise HTTPException(status_code=400, detail="country_var and value variable required")
            png_bytes, svg_bytes, pdf_bytes = generate_world_map(
                df, country_var, map_value_var, title, style
            )
        elif chart_type in ["donut", "pie"]:
            if not x_var or not y_var:
                raise HTTPException(status_code=400, detail="x_var and y_var required")
            png_bytes, svg_bytes, pdf_bytes = generate_bar_plot(
                df, x_var, y_var, color_var, title, style
            )
        elif chart_type in ["ridgeline", "raincloud", "beanplot", "beeswarm"]:
            if not y_var:
                raise HTTPException(status_code=400, detail="y_var required")
            png_bytes, svg_bytes, pdf_bytes = generate_box_plot(
                df, y_var, x_var, color_var, title, style
            )
        elif chart_type in ["radar", "sankey", "treemap", "cleveland_dot",
                            "parallel_coords", "funnel", "polar_bar",
                            "volcano", "bubble", "pca", "dca", "dumbbell",
                            "bland_altman", "calibration_curve", "swimmer",
                            "population_pyramid", "qq_plot", "slope", "paired_line",
                            "waterfall", "missingness_heatmap", "venn", "upset"]:
            # Fallback: these chart types use the frontend Plotly renderer for export
            raise HTTPException(
                status_code=400,
                detail=f"Chart type '{chart_type}' is best exported via the frontend Plotly renderer. Use the browser download button for PNG/SVG."
            )
        else:
            raise HTTPException(status_code=400, detail=f"Chart type '{chart_type}' not supported for publication export")

        # Return requested format
        if format_type == "svg":
            return Response(content=svg_bytes, media_type="image/svg+xml")
        elif format_type == "pdf":
            return Response(content=pdf_bytes, media_type="application/pdf")
        else:  # png
            return Response(content=png_bytes, media_type="image/png")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chart generation failed: {str(e)}")



@app.post("/api/export/table-csv")
def export_table_csv(req: ExportRequest) -> FileResponse:
    data = req.table_data or []
    dest = export_to_csv(data, "table_export")
    return FileResponse(dest, media_type="text/csv", filename="table_export.csv")


@app.post("/api/export/table-excel")
def export_table_excel(req: ExportRequest) -> FileResponse:
    data = req.table_data or []
    dest = export_to_excel(data, "table_export")
    return FileResponse(dest, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename="table_export.xlsx")


@app.post("/api/export/table-html")
def export_table_html(req: ExportRequest) -> Response:
    data = req.table_data or []
    html = export_to_html_table(data)
    return Response(content=html, media_type="text/html")


@app.post("/api/export/chart-config")
def export_chart_config_endpoint(req: ExportRequest) -> FileResponse:
    data = req.chart_data or {}
    dest = export_chart_config(data, "chart_config")
    return FileResponse(dest, media_type="application/json", filename="chart_config.json")


# ── Helpers ────────────────────────────────────────────


def _get_df(req: AnalyzeRequest | TableRequest) -> pd.DataFrame:
    """Resolve DataFrame from request (upload or demo)."""
    if req.use_demo or not req.upload_id:
        ds = req.dataset_name or "baseline_table_example"
        filepath = EXAMPLES_DIR / f"{ds}.csv"
        if not filepath.exists():
            filepath = next(EXAMPLES_DIR.glob("*.csv"))
        return pd.read_csv(filepath)

    upload_id = req.upload_id
    filepath = None
    filename = ""
    for f in UPLOADS_DIR.iterdir():
        if f.stem.startswith(upload_id):
            filepath = str(f)
            filename = f.name.split("_", 1)[1] if "_" in f.name else f.name
            break
    if not filepath:
        raise HTTPException(status_code=404, detail="Upload not found")
    return read_file(filepath, filename, req.sheet_name if hasattr(req, "sheet_name") else None)


def _normalize_publication_style(style: str | None) -> str:
    value = str(style or "cns").lower()
    if "nature" in value:
        return "nature"
    return "cns"


def _get_df_simple(req: dict) -> pd.DataFrame:
    """Resolve DataFrame from a plain dict request."""
    if req.get("use_demo") or not req.get("upload_id"):
        ds = req.get("dataset_name") or "baseline_table_example"
        filepath = EXAMPLES_DIR / f"{ds}.csv"
        if not filepath.exists():
            filepath = next(EXAMPLES_DIR.glob("*.csv"))
        return pd.read_csv(filepath)

    upload_id = req.get("upload_id", "")
    filepath = None
    filename = ""
    for f in UPLOADS_DIR.iterdir():
        if f.stem.startswith(upload_id):
            filepath = str(f)
            filename = f.name.split("_", 1)[1] if "_" in f.name else f.name
            break
    if not filepath:
        raise HTTPException(status_code=404, detail="Upload not found")
    return read_file(filepath, filename, req.get("sheet_name"))


def _json_value(value):
    if value is None:
        return None
    try:
        if pd.isna(value):
            return None
    except Exception:
        pass
    if isinstance(value, (pd.Timestamp, pd.Timedelta)):
        return str(value)
    if isinstance(value, np.generic):
        return value.item()
    return value


def _df_to_column_data(df: pd.DataFrame) -> dict[str, list]:
    return {str(col): [_json_value(v) for v in df[col].tolist()] for col in df.columns}


def _sanitize_for_json(obj):
    """Recursively convert numpy/pandas types to native Python for JSON serialization."""
    if isinstance(obj, dict):
        return {str(k): _sanitize_for_json(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_sanitize_for_json(v) for v in obj]
    if isinstance(obj, np.generic):
        return obj.item()
    if isinstance(obj, (np.bool_, bool)):
        return bool(obj)
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        return float(obj)
    return obj
