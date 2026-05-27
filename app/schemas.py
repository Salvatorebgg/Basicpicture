from __future__ import annotations

from pydantic import BaseModel, Field


class UploadResponse(BaseModel):
    upload_id: str
    filename: str
    file_type: str
    sheet_names: list[str] | None = None
    row_count: int
    col_count: int
    columns: list[str]
    dtypes: dict[str, str]
    variable_types: dict[str, list[str]]
    preview: list[dict]
    missing_percent: float
    summary: dict


class AnalyzeRequest(BaseModel):
    upload_id: str | None = None
    sheet_name: str | None = None
    use_demo: bool = False
    dataset_name: str | None = None


class ChartRequest(BaseModel):
    upload_id: str | None = None
    sheet_name: str | None = None
    use_demo: bool = False
    dataset_name: str | None = None
    chart_type: str
    x_var: str | None = None
    y_var: str | None = None
    color_var: str | None = None
    facet_var: str | None = None
    size_var: str | None = None
    group_var: str | None = None
    time_var: str | None = None
    event_var: str | None = None
    outcome_var: str | None = None
    predictor_var: str | None = None
    province_var: str | None = None
    country_var: str | None = None
    value_vars: list[str] | None = None
    chart_theme: str = "clinicalLightTheme"
    title: str | None = None
    extra_params: dict | None = Field(default_factory=dict)


class TableRequest(BaseModel):
    upload_id: str | None = None
    sheet_name: str | None = None
    use_demo: bool = False
    dataset_name: str | None = None
    table_type: str = "baseline"
    group_var: str | None = None
    variables: list[str] | None = None
    decimal_places: int = 2
    p_digits: int = 3


class ExportRequest(BaseModel):
    upload_id: str | None = None
    format: str = "png"  # png, svg, csv, json
    chart_data: dict | None = None
    table_data: list[dict] | None = None
