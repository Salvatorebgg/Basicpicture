from __future__ import annotations

import pandas as pd
import numpy as np
from app.services.variable_service import classify_variables


def get_chart_variables(df: pd.DataFrame, chart_type: str) -> dict:
    """Return recommended variables for a given chart type."""
    var_types = classify_variables(df)
    all_vars = {c: str(df[c].dtype) for c in df.columns}

    num_cols = var_types["continuous"]
    cat_cols = var_types["categorical"] + var_types["binary"] + var_types["group"]
    date_cols = var_types["date"]
    id_cols = var_types["id"]
    region_cols = var_types["region"]
    outcome_cols = var_types["outcome_candidate"] + var_types["binary"]

    requirements = {
        "scatter": {"required": {"x": num_cols, "y": num_cols}, "optional": {"color": cat_cols}},
        "grouped_scatter": {"required": {"x": num_cols, "y": num_cols, "group": cat_cols}, "optional": {}},
        "bar": {"required": {"x": cat_cols, "y": num_cols}, "optional": {"color": cat_cols}},
        "stacked_bar": {"required": {"x": cat_cols, "y": num_cols, "color": cat_cols}, "optional": {}},
        "line": {"required": {"x": date_cols + num_cols, "y": num_cols}, "optional": {"color": cat_cols}},
        "area": {"required": {"x": date_cols + num_cols, "y": num_cols}, "optional": {"color": cat_cols}},
        "histogram": {"required": {"x": num_cols}, "optional": {"color": cat_cols}},
        "density": {"required": {"x": num_cols}, "optional": {"color": cat_cols}},
        "box": {"required": {"y": num_cols}, "optional": {"x": cat_cols, "color": cat_cols}},
        "violin": {"required": {"y": num_cols}, "optional": {"x": cat_cols, "color": cat_cols}},
        "box_scatter": {"required": {"y": num_cols}, "optional": {"x": cat_cols, "color": cat_cols}},
        "violin_box_scatter": {"required": {"y": num_cols}, "optional": {"x": cat_cols, "color": cat_cols}},
        "error_bar": {"required": {"x": cat_cols, "y": num_cols}, "optional": {"color": cat_cols}},
        "mean_sd": {"required": {"x": cat_cols, "y": num_cols}, "optional": {}},
        "mean_se": {"required": {"x": cat_cols, "y": num_cols}, "optional": {}},
        "median_iqr": {"required": {"x": cat_cols, "y": num_cols}, "optional": {}},
        "dumbbell": {"required": {"x": num_cols + cat_cols, "y_start": num_cols, "y_end": num_cols}, "optional": {}},
        "forest": {"required": {"label": cat_cols, "or": num_cols, "ci_lower": num_cols, "ci_upper": num_cols}, "optional": {}},
        "volcano": {"required": {"x": num_cols, "y": num_cols}, "optional": {"color": cat_cols}},
        "bubble": {"required": {"x": num_cols, "y": num_cols, "size": num_cols}, "optional": {"color": cat_cols}},
        "heatmap": {"required": {"x": cat_cols, "y": cat_cols, "value": num_cols}, "optional": {}},
        "correlation_heatmap": {"required": {"value_vars": num_cols}, "optional": {}},
        "missingness_heatmap": {"required": {}, "optional": {}},
        "venn": {"required": {"set_vars": cat_cols}, "optional": {}},
        "upset": {"required": {"set_vars": cat_cols}, "optional": {}},
        "radar": {"required": {"group": cat_cols, "value_vars": num_cols}, "optional": {}},
        "sankey": {"required": {"source": cat_cols, "target": cat_cols, "value": num_cols}, "optional": {}},
        "funnel": {"required": {"stage": cat_cols, "value": num_cols}, "optional": {}},
        "treemap": {"required": {"x_var": cat_cols, "y_var": num_cols}, "optional": {"color_var": cat_cols}},
        "waterfall": {"required": {"x": cat_cols, "y": num_cols}, "optional": {}},
        "survival": {"required": {"time": num_cols, "event": cat_cols}, "optional": {"group": cat_cols}},
        "roc": {"required": {"outcome": outcome_cols, "predictor": num_cols}, "optional": {}},
        "multi_roc": {"required": {"outcome": outcome_cols, "predictors": num_cols}, "optional": {}},
        "risk_calibration": {"required": {"outcome": outcome_cols, "predictor": num_cols}, "optional": {}},
        "nomogram": {"required": {"predictors": num_cols}, "optional": {"outcome": outcome_cols}},
        "calibration": {"required": {"outcome": outcome_cols, "predictor": num_cols}, "optional": {}},
        "dca": {"required": {"outcome": outcome_cols, "predictor": num_cols}, "optional": {}},
        "pca": {"required": {"value_vars": num_cols}, "optional": {"color": cat_cols}},
        "tsne": {"required": {"value_vars": num_cols}, "optional": {"color": cat_cols}},
        "raincloud": {"required": {"y": num_cols}, "optional": {"x": cat_cols, "color": cat_cols}},
        "bean": {"required": {"y": num_cols}, "optional": {"x": cat_cols, "color": cat_cols}},
        "half_violin": {"required": {"y": num_cols}, "optional": {"x": cat_cols, "color": cat_cols}},
        "beeswarm": {"required": {"y": num_cols}, "optional": {"x": cat_cols, "color": cat_cols}},
        "marginal_scatter": {"required": {"x": num_cols, "y": num_cols}, "optional": {"color": cat_cols}},
        "china_map": {"required": {"province": region_cols, "value": num_cols}, "optional": {}},
        "china_bubble_map": {"required": {"province": region_cols, "value": num_cols, "size": num_cols}, "optional": {}},
        "world_map": {"required": {"country": region_cols, "value": num_cols}, "optional": {}},
        "world_bubble_map": {"required": {"country": region_cols, "value": num_cols, "size": num_cols}, "optional": {}},
        "usa_map": {"required": {"state": region_cols, "value": num_cols}, "optional": {}},
        "europe_map": {"required": {"country": region_cols, "value": num_cols}, "optional": {}},
        "uk_map": {"required": {"region": region_cols, "value": num_cols, "size": num_cols}, "optional": {}},
        "region_bubble_map": {"required": {"province": region_cols, "value": num_cols, "size": num_cols}, "optional": {}},
    }

    req = requirements.get(chart_type, {"required": {}, "optional": {}})
    return {"required_vars": req["required"], "optional_vars": req["optional"], "all_vars": all_vars, "n_total": len(df)}


def prepare_chart_data(df: pd.DataFrame, chart_type: str, params: dict) -> dict:
    """Prepare data for chart rendering."""
    if chart_type == "correlation_heatmap":
        value_vars = params.get("value_vars", [])
        if not value_vars:
            value_vars = list(df.select_dtypes(include=[np.number]).columns[:10])
        corr_df = df[value_vars].corr().round(3)
        return {
            "type": "correlation_heatmap",
            "data": {
                "z": corr_df.values.tolist(),
                "x": list(corr_df.columns),
                "y": list(corr_df.index),
            }
        }

    if chart_type == "missingness_heatmap":
        missing = df.isnull().astype(int)
        return {
            "type": "missingness_heatmap",
            "data": {
                "z": missing.values[:100].tolist(),
                "x": list(missing.columns),
                "y": [str(i) for i in range(min(100, len(missing)))],
            }
        }

    x_var = params.get("x_var", "")
    y_var = params.get("y_var", "")
    color_var = params.get("color_var", "")
    group_var = params.get("group_var", "")
    size_var = params.get("size_var", "")
    facet_var = params.get("facet_var", "")
    time_var = params.get("time_var", "")
    event_var = params.get("event_var", "")
    value_vars = params.get("value_vars", [])

    # Default selection if not specified
    num_cols = list(df.select_dtypes(include=[np.number]).columns)
    cat_cols = [c for c in df.columns if df[c].nunique() < 30]

    trace_data = []
    plot_data = {}
    for col in [x_var, y_var, color_var, group_var, size_var, facet_var, time_var, event_var]:
        if col and col in df.columns:
            plot_data[col] = df[col].tolist()

    for v in (value_vars or []):
        if v in df.columns:
            plot_data[v] = df[v].tolist()

    return {
        "type": chart_type,
        "trace_data": trace_data,
        "plot_data": plot_data,
        "n": len(df),
    }
