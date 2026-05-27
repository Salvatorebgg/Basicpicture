"""Smoke test for Clinical Chart Platform core services."""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import pandas as pd
from app.services.sample_service import EXAMPLE_MAKERS
from app.services.variable_service import classify_variables, summarize_dataset
from app.services.stats_service import calc_descriptive, calc_group_comparison, format_p_value
from app.services.table_service import build_baseline_table, build_descriptive_table, build_missing_table
from app.services.io_service import get_example_datasets


def test_sample_generation():
    """All registered example datasets should generate without errors."""
    for name, fn in EXAMPLE_MAKERS.items():
        df = fn()
        for col in df.columns:
            if isinstance(df[col].dtype, pd.StringDtype) or str(df[col].dtype) == "string":
                df[col] = df[col].astype(object)
        assert len(df) > 0, f"{name}: empty dataframe"
        assert len(df.columns) > 0, f"{name}: no columns"


def test_variable_classification():
    """Variable classification should return valid results."""
    df = pd.read_csv(ROOT / "data" / "examples" / "baseline_table_example.csv")
    types = classify_variables(df)
    summary = summarize_dataset(df)
    assert summary["sample_size"] > 0
    assert summary["variable_count"] > 0
    assert "continuous" in types
    assert "categorical" in types


def test_stats_service():
    """Statistical calculations should work."""
    df = pd.read_csv(ROOT / "data" / "examples" / "baseline_table_example.csv")
    stats = calc_descriptive(df, "age")
    assert stats["type"] == "continuous"
    assert stats["mean"] > 0

    comp = calc_group_comparison(df, "age", "group")
    assert "method" in comp
    assert comp["p_value"] is not None

    formatted = format_p_value(0.0003)
    assert formatted == "<0.001"


def test_table_service():
    """Table generators should produce valid results."""
    df = pd.read_csv(ROOT / "data" / "examples" / "baseline_table_example.csv")
    baseline = build_baseline_table(df, "group")
    assert len(baseline["rows"]) > 0
    assert len(baseline["columns"]) > 0
    assert len(baseline["groups"]) >= 2

    desc = build_descriptive_table(df)
    assert len(desc["rows"]) > 0

    missing = build_missing_table(df)
    assert len(missing["rows"]) > 0


def test_io_service():
    """Example dataset listing should work."""
    examples = get_example_datasets()
    assert len(examples) == len(EXAMPLE_MAKERS), (
        f"Expected {len(EXAMPLE_MAKERS)} examples, got {len(examples)}"
    )


if __name__ == "__main__":
    print("Running smoke tests...")
    test_sample_generation()
    print("  [PASS] Sample generation")
    test_variable_classification()
    print("  [PASS] Variable classification")
    test_stats_service()
    print("  [PASS] Stats service")
    test_table_service()
    print("  [PASS] Table service")
    test_io_service()
    print("  [PASS] IO service")
    print("All smoke tests passed!")
