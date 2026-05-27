from __future__ import annotations

import numpy as np
import pandas as pd
from scipy import stats


def calc_descriptive(df: pd.DataFrame, col: str, group_col: str | None = None) -> dict:
    """Calculate descriptive statistics for a variable, optionally by group."""
    series = df[col].dropna()
    is_numeric = pd.api.types.is_numeric_dtype(series)

    if not is_numeric:
        counts = series.value_counts()
        pcts = series.value_counts(normalize=True) * 100
        return {
            "type": "categorical",
            "n": len(series),
            "missing": df[col].isnull().sum(),
            "unique": series.nunique(),
            "top_categories": [{"name": str(k), "count": int(v), "pct": round(float(pcts.get(k, 0)), 2)} for k, v in counts.head(10).items()],
        }

    stats_result = {
        "type": "continuous",
        "n": int(len(series)),
        "missing": int(df[col].isnull().sum()),
        "mean": round(float(series.mean()), 3),
        "std": round(float(series.std()), 3),
        "median": round(float(series.median()), 3),
        "q1": round(float(series.quantile(0.25)), 3),
        "q3": round(float(series.quantile(0.75)), 3),
        "min": round(float(series.min()), 3),
        "max": round(float(series.max()), 3),
        "skewness": round(float(series.skew()), 3),
        "kurtosis": round(float(series.kurtosis()), 3),
        "is_normal": _test_normality(series),
    }

    if group_col and group_col in df.columns:
        groups = df[group_col].dropna().unique()
        group_stats = {}
        for g in groups:
            g_series = df.loc[df[group_col] == g, col].dropna()
            if len(g_series) > 0:
                group_stats[str(g)] = {
                    "n": int(len(g_series)),
                    "mean": round(float(g_series.mean()), 3),
                    "std": round(float(g_series.std()), 3),
                    "median": round(float(g_series.median()), 3),
                    "q1": round(float(g_series.quantile(0.25)), 3),
                    "q3": round(float(g_series.quantile(0.75)), 3),
                }
        stats_result["by_group"] = group_stats

    return stats_result


def calc_group_comparison(df: pd.DataFrame, var: str, group_col: str) -> dict:
    """Compare variable across groups, return p-value."""
    groups = df[group_col].dropna().unique()
    if len(groups) < 2:
        return {"method": "N/A", "p_value": None, "statistic": None, "note": "少于2组，无法比较"}

    group_data = {str(g): df.loc[df[group_col] == g, var].dropna().values for g in groups}
    group_data = {k: v for k, v in group_data.items() if len(v) > 0}
    if len(group_data) < 2:
        return {"method": "N/A", "p_value": None, "statistic": None, "note": "有效组不足2个"}

    series = df[var].dropna()
    is_numeric = pd.api.types.is_numeric_dtype(series)

    try:
        if is_numeric:
            if len(group_data) == 2:
                a, b = list(group_data.values())
                if len(a) >= 3 and len(b) >= 3 and _test_normality(series):
                    t_stat, p_val = stats.ttest_ind(a, b, equal_var=False)
                    return {"method": "Welch's t-test", "p_value": round(float(p_val), 4), "statistic": round(float(t_stat), 4)}
                else:
                    u_stat, p_val = stats.mannwhitneyu(a, b, alternative="two-sided")
                    return {"method": "Mann-Whitney U", "p_value": round(float(p_val), 4), "statistic": round(float(u_stat), 4)}
            else:
                data_list = list(group_data.values())
                if all(len(d) >= 3 for d in data_list) and _test_normality(series):
                    f_stat, p_val = stats.f_oneway(*data_list)
                    return {"method": "One-way ANOVA", "p_value": round(float(p_val), 4), "statistic": round(float(f_stat), 4)}
                else:
                    h_stat, p_val = stats.kruskal(*data_list)
                    return {"method": "Kruskal-Wallis", "p_value": round(float(p_val), 4), "statistic": round(float(h_stat), 4)}
        else:
            contingency = pd.crosstab(df[var], df[group_col])
            if contingency.shape[0] >= 2 and contingency.shape[1] >= 2:
                chi2, p_val, dof, _ = stats.chi2_contingency(contingency)
                return {"method": "Chi-square", "p_value": round(float(p_val), 4), "statistic": round(float(chi2), 4)}
            else:
                return {"method": "Fisher's exact", "p_value": None, "statistic": None, "note": "使用Fisher精确检验（需手动确认）"}
    except Exception as e:
        return {"method": "N/A", "p_value": None, "statistic": None, "note": str(e)}


def _test_normality(series: pd.Series, alpha: float = 0.05) -> bool:
    """Shapiro-Wilk test for normality. Returns True if normal."""
    sample = series.dropna().sample(n=min(len(series), 5000), random_state=42)
    if len(sample) < 3:
        return False
    if len(sample) > 5000:
        sample = sample.sample(n=5000, random_state=42)
    try:
        _, p = stats.shapiro(sample)
        return p > alpha
    except Exception:
        return False


def format_p_value(p: float | None, digits: int = 3) -> str:
    """Format p-value for medical tables."""
    if p is None:
        return "—"
    if p < 0.001:
        return "<0.001"
    return f"{p:.{digits}f}"
