from __future__ import annotations

import numpy as np
import pandas as pd

N_SAMPLES = 200
SEED = 42

rng = np.random.default_rng(SEED)


def _base_clin_df(n: int = N_SAMPLES) -> pd.DataFrame:
    """Create a base clinical dataframe with common demographic and clinical variables."""
    return pd.DataFrame({
        "patient_id": pd.array([f"P{str(i).zfill(4)}" for i in range(1, n + 1)], dtype=object),
        "age": np.round(rng.normal(58, 12, n)).clip(20, 90).astype(int),
        "sex": pd.array(rng.choice(["Male", "Female"], n, p=[0.48, 0.52]), dtype=object),
        "bmi": np.round(rng.normal(24.5, 3.8, n).clip(15, 42), 1),
        "sbp": np.round(rng.normal(128, 16, n).clip(85, 190), 0).astype(int),
        "dbp": np.round(rng.normal(78, 10, n).clip(50, 120), 0).astype(int),
        "glucose": np.round(rng.normal(5.6, 1.2, n).clip(3.0, 15.0), 2),
        "cholesterol": np.round(rng.normal(5.1, 1.1, n).clip(2.5, 9.0), 2),
        "crp": np.round(rng.lognormal(0.5, 0.8, n).clip(0.1, 50), 2),
        "group": pd.array(rng.choice(["Control", "Treatment A", "Treatment B"], n), dtype=object),
        "province": pd.array(rng.choice(
            ["Beijing", "Shanghai", "Guangdong", "Zhejiang", "Jiangsu", "Sichuan", "Hubei", "Shandong"],
            n,
        ), dtype=object),
        "disease_type": pd.array(rng.choice(["Hypertension", "Diabetes", "CVD", "COPD", "Healthy"], n), dtype=object),
    })


def make_scatter_example() -> pd.DataFrame:
    df = _base_clin_df()
    return df[["patient_id", "age", "bmi", "sbp", "dbp", "glucose", "cholesterol", "sex", "group"]]


def make_bar_example() -> pd.DataFrame:
    df = _base_clin_df(150).copy()
    df["treatment"] = rng.choice(["Drug A", "Drug B", "Drug C", "Placebo"], 150)
    df["response"] = rng.choice(["Complete", "Partial", "None"], 150, p=[0.3, 0.45, 0.25])
    df["value"] = np.round(rng.uniform(10, 90, 150), 1)
    return df[["patient_id", "treatment", "response", "value", "sex", "group"]]


def make_line_example() -> pd.DataFrame:
    line_rng = np.random.default_rng(SEED + 11)
    groups = ["Control", "Standard care", "Intensive therapy", "Combination therapy"]
    weeks = np.array([0, 1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 36, 40, 48, 52])
    group_shift = {
        "Control": 1.8,
        "Standard care": -0.8,
        "Intensive therapy": -2.2,
        "Combination therapy": -3.0,
    }
    group_wave = {
        "Control": 1.1,
        "Standard care": 1.8,
        "Intensive therapy": 2.3,
        "Combination therapy": 2.7,
    }
    records = []
    patient_idx = 1
    for group in groups:
        for _ in range(22):
            baseline = line_rng.normal(137, 9) + (2.5 if group == "Control" else 0)
            slope = group_shift[group] * np.log1p(weeks) / np.log1p(52)
            phase = line_rng.uniform(0, np.pi * 2)
            wave = group_wave[group] * np.sin(weeks / 3.2 + phase)
            local_walk = line_rng.normal(0, 1.05, len(weeks)).cumsum() * 0.42
            visit_noise = line_rng.normal(0, 2.3, len(weeks))
            pulse = np.zeros(len(weeks))
            pulse_idx = line_rng.choice(np.arange(2, len(weeks) - 2), size=3, replace=False)
            pulse[pulse_idx] = line_rng.normal(0, 5.2, len(pulse_idx))
            values = baseline + slope + wave + local_walk + visit_noise + pulse
            for t_idx, (week, val) in enumerate(zip(weeks, values)):
                records.append({
                    "patient_id": f"P{str(patient_idx).zfill(4)}",
                    "time": t_idx,
                    "week": int(week),
                    "sbp": round(float(np.clip(val, 96, 178)), 1),
                    "group": group,
                })
            patient_idx += 1
    return pd.DataFrame(records)


def make_boxplot_example() -> pd.DataFrame:
    df = _base_clin_df(180)
    return df[["patient_id", "age", "bmi", "sbp", "dbp", "glucose", "cholesterol", "crp", "group", "sex", "disease_type"]]


def make_violin_example() -> pd.DataFrame:
    df = _base_clin_df(200)
    df["treatment_response"] = rng.choice(["CR", "PR", "SD", "PD"], 200, p=[0.2, 0.35, 0.3, 0.15])
    return df[["patient_id", "bmi", "sbp", "glucose", "crp", "treatment_response", "group", "sex", "disease_type"]]


def make_dumbbell_example() -> pd.DataFrame:
    df = pd.DataFrame({
        "parameter": ["SBP", "DBP", "Glucose", "Cholesterol", "CRP", "BMI", "HbA1c", "eGFR"],
        "baseline_mean": [135, 82, 6.5, 5.8, 8.2, 26.5, 7.8, 88],
        "followup_mean": [128, 78, 5.8, 5.2, 4.1, 25.1, 6.9, 92],
        "baseline_sd": [15, 10, 1.5, 1.2, 5.0, 3.5, 1.2, 15],
        "followup_sd": [14, 9, 1.3, 1.1, 3.2, 3.0, 1.0, 14],
    })
    return df


def make_forest_example() -> pd.DataFrame:
    return pd.DataFrame({
        "subgroup": ["Overall", "Age < 60", "Age >= 60", "Male", "Female", "BMI < 25", "BMI >= 25", "HTN (-)", "HTN (+)"],
        "n": [520, 260, 260, 250, 270, 280, 240, 300, 220],
        "or": [0.72, 0.68, 0.78, 0.65, 0.80, 0.70, 0.75, 0.66, 0.79],
        "ci_lower": [0.58, 0.50, 0.60, 0.48, 0.62, 0.54, 0.56, 0.49, 0.60],
        "ci_upper": [0.89, 0.92, 1.02, 0.88, 1.03, 0.91, 1.01, 0.89, 1.04],
        "p_value": [0.001, 0.002, 0.04, 0.001, 0.06, 0.003, 0.03, 0.001, 0.09],
    })


def make_volcano_example() -> pd.DataFrame:
    n = 600
    genes = [f"GENE{i}" for i in range(1, n + 1)]
    log2fc = rng.normal(0, 0.45, n)
    up_idx = rng.choice(np.arange(n), size=55, replace=False)
    remaining = np.setdiff1d(np.arange(n), up_idx)
    down_idx = rng.choice(remaining, size=55, replace=False)
    log2fc[up_idx] = rng.normal(1.65, 0.38, len(up_idx))
    log2fc[down_idx] = rng.normal(-1.55, 0.36, len(down_idx))
    signal = np.abs(log2fc)
    neg_log10_p = 0.45 + 1.55 * signal + rng.normal(0, 0.45, n)
    neg_log10_p += np.where(np.isin(np.arange(n), np.r_[up_idx, down_idx]), rng.uniform(0.8, 2.4, n), 0)
    neg_log10_p = np.clip(neg_log10_p, 0.02, 8.5)
    pvalue = np.clip(np.power(10, -neg_log10_p), 1e-8, 0.99)
    return pd.DataFrame({
        "gene": genes,
        "log2fc": np.round(log2fc, 3),
        "pvalue": np.round(pvalue, 8),
        "neg_log10_p": np.round(neg_log10_p, 3),
    })


def make_bubble_example() -> pd.DataFrame:
    return pd.DataFrame({
        "disease": ["Hypertension", "Diabetes", "CVD", "Stroke", "COPD", "CKD", "Cancer", "Depression"],
        "prevalence": [28.5, 12.3, 8.7, 5.2, 7.8, 10.5, 4.2, 15.6],
        "sample_size": [1520, 890, 670, 430, 580, 780, 320, 1100],
        "region": ["Urban", "Urban", "Rural", "Rural", "Rural", "Urban", "Urban", "Rural"],
        "risk_ratio": [1.2, 1.5, 2.1, 1.8, 0.9, 1.3, 0.7, 1.6],
    })


def make_heatmap_example() -> pd.DataFrame:
    """Generate a rich, publication-quality heatmap dataset with 80+ indicators and 24 timepoints."""
    indicators = [
        # Cardiovascular
        "SBP", "DBP", "MAP", "Heart Rate", "Pulse Pressure", "PPG Amplitude", "QT Interval", "PR Interval",
        # Metabolic
        "Glucose", "HbA1c", "Insulin", "HOMA-IR", "C-Peptide", "Glucagon", "Leptin", "Adiponectin",
        # Lipids
        "Total Cholesterol", "LDL-C", "HDL-C", "VLDL-C", "Triglycerides", "ApoB", "ApoA-I", "Lp(a)", "Non-HDL-C", "Remnant Chol",
        # Inflammation
        "CRP", "IL-6", "IL-10", "TNF-α", "IL-1β", "IL-8", "MCP-1", "Ferritin", "Procalcitonin", "ESR",
        # Liver
        "ALT", "AST", "GGT", "ALP", "Albumin", "Total Bilirubin", "Direct Bilirubin", "Indirect Bilirubin",
        # Kidney
        "Creatinine", "BUN", "Uric Acid", "Cystatin C", "eGFR", "NGAL", "KIM-1", "β2-MG",
        # Hematology
        "WBC", "RBC", "Hemoglobin", "Platelets", "Neutrophils", "Lymphocytes", "Monocytes", "Eosinophils", "Basophils", "RDW", "MCV",
        # Body Composition
        "BMI", "Waist Circumference", "Hip Circumference", "WHR", "Body Fat %", "Visceral Fat", "Muscle Mass", "Bone Mass",
        # Pulmonary
        "FEV1", "FVC", "FEV1/FVC", "PEF", "FEF25-75", "SpO2", "VO2max", "Respiratory Rate",
        # Coagulation
        "PT", "INR", "aPTT", "Fibrinogen", "D-Dimer", "Plateletcrit", "MPV",
        # Electrolytes
        "Sodium", "Potassium", "Chloride", "Calcium", "Phosphorus", "Magnesium", "Bicarbonate", "Anion Gap",
        # Thyroid
        "TSH", "FT3", "FT4", "T3", "T4", "Anti-TPO", "Anti-TG",
        # Tumor Markers
        "AFP", "CEA", "CA19-9", "CA125", "CA15-3", "PSA", "NSE", "CYFRA21-1",
        # Cardiac
        "cTnI", "cTnT", "BNP", "NT-proBNP", "CK-MB", "Myoglobin",
        # Vitamins
        "Vit D", "Vit B12", "Folate", "Vit C", "Vit E",
    ]

    timepoints = [
        "Baseline", "Day 1", "Day 3", "Day 5", "Week 1", "Week 2", "Week 3", "Week 4",
        "Week 6", "Week 8", "Week 10", "Week 12", "Week 14", "Week 16", "Week 20",
        "Week 24", "Week 28", "Week 32", "Week 36", "Week 40", "Week 44", "Week 48", "Week 52", "Week 56",
    ]

    baselines = {
        "SBP": 138, "DBP": 86, "MAP": 103, "Heart Rate": 76, "Pulse Pressure": 52, "PPG Amplitude": 1.2, "QT Interval": 395, "PR Interval": 162,
        "Glucose": 6.8, "HbA1c": 7.5, "Insulin": 18.5, "HOMA-IR": 4.2, "C-Peptide": 2.8, "Glucagon": 45, "Leptin": 18, "Adiponectin": 8.5,
        "Total Cholesterol": 5.8, "LDL-C": 3.6, "HDL-C": 1.2, "VLDL-C": 0.9, "Triglycerides": 2.1, "ApoB": 1.1, "ApoA-I": 1.5, "Lp(a)": 35, "Non-HDL-C": 4.6, "Remnant Chol": 0.7,
        "CRP": 4.8, "IL-6": 3.2, "IL-10": 5.5, "TNF-α": 8.5, "IL-1β": 2.4, "IL-8": 12, "MCP-1": 180, "Ferritin": 180, "Procalcitonin": 0.08, "ESR": 18,
        "ALT": 32, "AST": 28, "GGT": 38, "ALP": 72, "Albumin": 42, "Total Bilirubin": 12, "Direct Bilirubin": 4.2, "Indirect Bilirubin": 7.8,
        "Creatinine": 88, "BUN": 5.8, "Uric Acid": 380, "Cystatin C": 0.95, "eGFR": 82, "NGAL": 45, "KIM-1": 0.85, "β2-MG": 1.9,
        "WBC": 7.2, "RBC": 4.8, "Hemoglobin": 140, "Platelets": 245, "Neutrophils": 4.2, "Lymphocytes": 2.1, "Monocytes": 0.55, "Eosinophils": 0.18, "Basophils": 0.04, "RDW": 13.5, "MCV": 88,
        "BMI": 27.5, "Waist Circumference": 94, "Hip Circumference": 102, "WHR": 0.92, "Body Fat %": 32, "Visceral Fat": 12.5, "Muscle Mass": 48, "Bone Mass": 2.8,
        "FEV1": 2.8, "FVC": 3.6, "FEV1/FVC": 0.78, "PEF": 6.5, "FEF25-75": 2.9, "SpO2": 97, "VO2max": 28, "Respiratory Rate": 16,
        "PT": 12.5, "INR": 1.05, "aPTT": 32, "Fibrinogen": 3.2, "D-Dimer": 0.35, "Plateletcrit": 0.25, "MPV": 10.5,
        "Sodium": 140, "Potassium": 4.2, "Chloride": 102, "Calcium": 2.35, "Phosphorus": 1.1, "Magnesium": 0.85, "Bicarbonate": 25, "Anion Gap": 12,
        "TSH": 2.5, "FT3": 4.8, "FT4": 15.5, "T3": 1.8, "T4": 95, "Anti-TPO": 15, "Anti-TG": 20,
        "AFP": 4.5, "CEA": 2.8, "CA19-9": 12, "CA125": 15, "CA15-3": 11, "PSA": 1.2, "NSE": 12.5, "CYFRA21-1": 1.8,
        "cTnI": 0.02, "cTnT": 0.01, "BNP": 28, "NT-proBNP": 65, "CK-MB": 12, "Myoglobin": 35,
        "Vit D": 45, "Vit B12": 350, "Folate": 12, "Vit C": 55, "Vit E": 12,
    }

    trends = {
        "SBP": -1.5, "DBP": -1.0, "MAP": -1.2, "Heart Rate": -0.4, "Pulse Pressure": -0.5, "PPG Amplitude": 0.02, "QT Interval": -1.2, "PR Interval": -0.3,
        "Glucose": -0.2, "HbA1c": -0.15, "Insulin": -0.6, "HOMA-IR": -0.18, "C-Peptide": -0.08, "Glucagon": -0.8, "Leptin": -0.25, "Adiponectin": 0.15,
        "Total Cholesterol": -0.18, "LDL-C": -0.15, "HDL-C": 0.03, "VLDL-C": -0.04, "Triglycerides": -0.08, "ApoB": -0.03, "ApoA-I": 0.02, "Lp(a)": -0.8, "Non-HDL-C": -0.15, "Remnant Chol": -0.04,
        "CRP": -0.25, "IL-6": -0.12, "IL-10": 0.15, "TNF-α": -0.2, "IL-1β": -0.08, "IL-8": -0.4, "MCP-1": -5, "Ferritin": -3.5, "Procalcitonin": -0.005, "ESR": -0.35,
        "ALT": -0.6, "AST": -0.4, "GGT": -0.8, "ALP": -0.5, "Albumin": 0.1, "Total Bilirubin": -0.2, "Direct Bilirubin": -0.06, "Indirect Bilirubin": -0.14,
        "Creatinine": -0.2, "BUN": -0.05, "Uric Acid": -5, "Cystatin C": -0.01, "eGFR": 0.4, "NGAL": -1.2, "KIM-1": -0.02, "β2-MG": -0.03,
        "WBC": -0.05, "RBC": 0.01, "Hemoglobin": 0.3, "Platelets": -1.0, "Neutrophils": -0.04, "Lymphocytes": 0.02, "Monocytes": 0.005, "Eosinophils": 0.002, "Basophils": 0.001, "RDW": -0.05, "MCV": 0.02,
        "BMI": -0.12, "Waist Circumference": -0.3, "Hip Circumference": -0.2, "WHR": -0.005, "Body Fat %": -0.2, "Visceral Fat": -0.15, "Muscle Mass": 0.25, "Bone Mass": 0.01,
        "FEV1": 0.02, "FVC": 0.015, "FEV1/FVC": 0.003, "PEF": 0.04, "FEF25-75": 0.015, "SpO2": 0.05, "VO2max": 0.3, "Respiratory Rate": -0.1,
        "PT": -0.02, "INR": -0.002, "aPTT": -0.1, "Fibrinogen": -0.04, "D-Dimer": -0.015, "Plateletcrit": -0.002, "MPV": 0.01,
        "Sodium": 0.02, "Potassium": -0.01, "Chloride": 0.01, "Calcium": 0.003, "Phosphorus": -0.005, "Magnesium": 0.001, "Bicarbonate": 0.02, "Anion Gap": -0.02,
        "TSH": -0.02, "FT3": 0.02, "FT4": 0.05, "T3": 0.008, "T4": 0.2, "Anti-TPO": -0.2, "Anti-TG": -0.3,
        "AFP": -0.02, "CEA": -0.01, "CA19-9": -0.05, "CA125": -0.06, "CA15-3": -0.04, "PSA": -0.01, "NSE": -0.05, "CYFRA21-1": -0.01,
        "cTnI": -0.001, "cTnT": -0.0005, "BNP": -0.3, "NT-proBNP": -0.8, "CK-MB": -0.08, "Myoglobin": -0.15,
        "Vit D": 0.3, "Vit B12": 0.8, "Folate": 0.05, "Vit C": 0.2, "Vit E": 0.05,
    }

    data = []
    for ind in indicators:
        base = baselines[ind]
        trend_rate = trends.get(ind, 0)
        for t_idx, tp in enumerate(timepoints):
            noise = rng.normal(0, abs(base) * 0.022)
            val = base + trend_rate * t_idx + noise
            data.append({"indicator": ind, "timepoint": tp, "value": round(val, 2)})
    return pd.DataFrame(data)


def make_venn_example() -> pd.DataFrame:
    df = _base_clin_df(100).copy()
    df["hypertension"] = rng.choice([1, 0], 100, p=[0.4, 0.6])
    df["diabetes"] = rng.choice([1, 0], 100, p=[0.25, 0.75])
    df["dyslipidemia"] = rng.choice([1, 0], 100, p=[0.35, 0.65])
    df["obesity"] = rng.choice([1, 0], 100, p=[0.3, 0.7])
    return df[["patient_id", "hypertension", "diabetes", "dyslipidemia", "obesity"]]


def make_upset_example() -> pd.DataFrame:
    return make_venn_example()


def make_raincloud_example() -> pd.DataFrame:
    df = _base_clin_df(200)
    df["method"] = rng.choice(["Method A", "Method B", "Method C", "Method D"], 200)
    return df[["patient_id", "method", "bmi", "sbp", "glucose", "crp", "age"]]


def make_beanplot_example() -> pd.DataFrame:
    return make_raincloud_example()


def make_china_map_example() -> pd.DataFrame:
    records = [
        ("Beijing", 52.8), ("Tianjin", 44.1), ("Hebei", 47.6), ("Shanxi", 41.3),
        ("Inner Mongol", 35.4), ("Liaoning", 46.2), ("Jilin", 38.8), ("Heilongjiang", 40.5),
        ("Shanghai", 55.6), ("Jiangsu", 58.9), ("Zhejiang", 54.7), ("Anhui", 43.2),
        ("Fujian", 42.4), ("Jiangxi", 39.1), ("Shandong", 51.8), ("Henan", 48.5),
        ("Hubei", 45.9), ("Hunan", 44.6), ("Guangdong", 61.4), ("Guangxi", 36.7),
        ("Hainan", 31.5), ("Chongqing", 46.8), ("Sichuan", 43.7), ("Guizhou", 34.2),
        ("Yunnan", 32.9), ("Xizang", 18.6), ("Shaanxi", 40.2), ("Gansu", 29.8),
        ("Qinghai", 24.3), ("Ningxia", 30.1), ("Xinjiang", 28.5), ("Taiwan", 49.8),
        ("Hong Kong", 57.4), ("Macau", 50.6),
    ]
    provinces = [p for p, _ in records]
    incidence = np.array([v for _, v in records])
    prevalence = incidence * 0.44 + np.linspace(1.2, 4.8, len(records))
    mortality = incidence * 0.072 + np.linspace(0.15, 1.05, len(records))
    risk_level = pd.cut(
        incidence,
        bins=[0, 32, 43, 53, 100],
        labels=["Low", "Medium", "High", "Very High"],
        include_lowest=True,
    ).astype(str)
    return pd.DataFrame({
        "province": provinces,
        "incidence": np.round(incidence, 1),
        "prevalence": np.round(prevalence, 1),
        "mortality": np.round(mortality, 2),
        "risk_level": risk_level,
    })


def make_world_map_example() -> pd.DataFrame:
    records = [
        ("China", 78.5, "WPRO"), ("United States", 96.4, "AMRO"), ("India", 69.2, "SEARO"),
        ("Japan", 58.8, "WPRO"), ("Germany", 71.5, "EURO"), ("Brazil", 82.1, "AMRO"),
        ("Russia", 74.6, "EURO"), ("United Kingdom", 67.8, "EURO"), ("France", 63.5, "EURO"),
        ("Italy", 61.2, "EURO"), ("Canada", 54.6, "AMRO"), ("Australia", 49.9, "WPRO"),
        ("Korea, South", 64.1, "WPRO"), ("Indonesia", 57.6, "SEARO"), ("Nigeria", 88.3, "AFRO"),
        ("South Africa", 84.5, "AFRO"), ("Mexico", 79.8, "AMRO"), ("Turkey", 73.3, "EURO"),
        ("Thailand", 55.9, "SEARO"), ("Vietnam", 52.7, "WPRO"), ("Egypt", 77.2, "EMRO"),
        ("Pakistan", 80.5, "EMRO"), ("Bangladesh", 72.6, "SEARO"), ("Philippines", 68.4, "WPRO"),
    ]
    countries = [r[0] for r in records]
    incidence = np.array([r[1] for r in records])
    return pd.DataFrame({
        "country": countries,
        "incidence": np.round(incidence, 1),
        "prevalence": np.round(incidence * 0.38 + np.linspace(2.0, 7.5, len(records)), 1),
        "mortality": np.round(incidence * 0.058 + np.linspace(0.2, 1.4, len(records)), 2),
        "who_region": [r[2] for r in records],
    })


def make_usa_map_example() -> pd.DataFrame:
    records = [
        ("California", "CA", 92.4), ("Texas", "TX", 88.1), ("Florida", "FL", 84.7),
        ("New York", "NY", 79.6), ("Pennsylvania", "PA", 72.5), ("Illinois", "IL", 70.8),
        ("Ohio", "OH", 69.4), ("Georgia", "GA", 82.3), ("North Carolina", "NC", 76.1),
        ("Michigan", "MI", 68.8), ("New Jersey", "NJ", 74.2), ("Virginia", "VA", 66.9),
        ("Washington", "WA", 61.4), ("Arizona", "AZ", 78.5), ("Massachusetts", "MA", 59.8),
        ("Tennessee", "TN", 86.6), ("Indiana", "IN", 71.2), ("Missouri", "MO", 73.5),
        ("Maryland", "MD", 64.7), ("Wisconsin", "WI", 58.9), ("Colorado", "CO", 55.2),
        ("Minnesota", "MN", 53.6), ("South Carolina", "SC", 83.2), ("Alabama", "AL", 87.5),
        ("Louisiana", "LA", 90.1), ("Kentucky", "KY", 80.4), ("Oregon", "OR", 57.7),
        ("Oklahoma", "OK", 85.3), ("Connecticut", "CT", 56.8), ("Utah", "UT", 49.4),
    ]
    incidence = np.array([r[2] for r in records])
    return pd.DataFrame({
        "state": [r[0] for r in records],
        "state_abbr": [r[1] for r in records],
        "incidence": np.round(incidence, 1),
        "prevalence": np.round(incidence * 0.42 + rng.normal(3.0, 1.1, len(records)), 1),
        "mortality": np.round(incidence * 0.052 + rng.normal(0.6, 0.18, len(records)), 2),
        "region": rng.choice(["West", "South", "Midwest", "Northeast"], len(records)),
    })


def make_europe_map_example() -> pd.DataFrame:
    records = [
        ("United Kingdom", 67.8), ("France", 63.5), ("Germany", 71.5), ("Italy", 61.2),
        ("Spain", 64.9), ("Portugal", 58.1), ("Netherlands", 62.7), ("Belgium", 66.4),
        ("Switzerland", 52.8), ("Austria", 56.5), ("Sweden", 48.2), ("Norway", 44.9),
        ("Denmark", 50.3), ("Finland", 47.1), ("Poland", 69.6), ("Czechia", 65.7),
        ("Greece", 72.4), ("Ireland", 55.6), ("Romania", 78.2), ("Hungary", 74.9),
        ("Ukraine", 80.6), ("Turkey", 73.3),
    ]
    incidence = np.array([r[1] for r in records])
    return pd.DataFrame({
        "country": [r[0] for r in records],
        "incidence": np.round(incidence, 1),
        "prevalence": np.round(incidence * 0.39 + rng.normal(4.5, 1.0, len(records)), 1),
        "mortality": np.round(incidence * 0.049 + rng.normal(0.7, 0.15, len(records)), 2),
        "health_system": rng.choice(["Tax-funded", "Insurance", "Mixed"], len(records)),
    })


def make_uk_map_example() -> pd.DataFrame:
    records = [
        ("England", 68.3), ("Scotland", 61.6), ("Wales", 65.1), ("Northern Ireland", 63.8),
        ("London", 58.9), ("Midlands", 70.2), ("North West", 72.6), ("South East", 56.8),
        ("South West", 54.5),
    ]
    incidence = np.array([r[1] for r in records])
    return pd.DataFrame({
        "region": [r[0] for r in records],
        "incidence": np.round(incidence, 1),
        "prevalence": np.round(incidence * 0.44 + rng.normal(2.4, 0.8, len(records)), 1),
        "mortality": np.round(incidence * 0.045 + rng.normal(0.5, 0.10, len(records)), 2),
        "care_network": rng.choice(["North", "Central", "South", "Devolved"], len(records)),
    })


def make_survival_example() -> pd.DataFrame:
    n = 300
    group = rng.choice(["Control", "Treatment"], n, p=[0.48, 0.52])
    stage = rng.choice(["I", "II", "III", "IV"], n, p=[0.2, 0.3, 0.35, 0.15])
    stage_hazard = pd.Series(stage).map({"I": 0.65, "II": 0.9, "III": 1.25, "IV": 1.75}).to_numpy()
    treatment_factor = np.where(group == "Treatment", 0.62, 1.0)
    event_time = rng.exponential(38 / (stage_hazard * treatment_factor), n)
    censor_time = rng.uniform(18, 72, n)
    observed_time = np.minimum(event_time, censor_time).clip(1, 72)
    event = (event_time <= censor_time).astype(int)
    return pd.DataFrame({
        "patient_id": [f"P{str(i).zfill(4)}" for i in range(1, n + 1)],
        "time": np.round(observed_time, 1),
        "event": event,
        "group": group,
        "age": np.round(rng.normal(60, 11, n)).clip(30, 85).astype(int),
        "sex": rng.choice(["Male", "Female"], n),
        "stage": stage,
    })


def make_roc_example() -> pd.DataFrame:
    n = 320
    age = rng.normal(61, 10, n).clip(35, 86)
    bmi = rng.normal(26.5, 4.2, n).clip(17, 42)
    inflammation = rng.normal(0, 1, n)
    lipid = rng.normal(0, 1, n)
    renal = rng.normal(0, 1, n)
    latent = -0.85 + 0.035 * (age - 60) + 0.08 * (bmi - 25) + 0.85 * inflammation + 0.45 * lipid + 0.35 * renal
    true_prob = 1 / (1 + np.exp(-latent))
    outcome = rng.binomial(1, true_prob, n)
    logit = np.log(np.clip(true_prob, 0.005, 0.995) / np.clip(1 - true_prob, 0.005, 0.995))
    risk_score = 1 / (1 + np.exp(-(logit + rng.normal(0, 0.45, n))))
    biomarker_a = 1 / (1 + np.exp(-(0.90 * logit + rng.normal(0, 0.75, n))))
    biomarker_b = 1 / (1 + np.exp(-(0.70 * logit + rng.normal(0, 0.95, n))))
    biomarker_c = 1 / (1 + np.exp(-(0.45 * logit + rng.normal(0, 1.20, n))))
    return pd.DataFrame({
        "patient_id": [f"P{str(i).zfill(4)}" for i in range(1, n + 1)],
        "outcome": outcome,
        "age": np.round(age, 1),
        "bmi": np.round(bmi, 1),
        "biomarker_a": np.round(biomarker_a, 3),
        "biomarker_b": np.round(biomarker_b, 3),
        "biomarker_c": np.round(biomarker_c, 3),
        "risk_score": np.round(risk_score, 3),
        "true_risk": np.round(true_prob, 3),
    })


def make_dca_example() -> pd.DataFrame:
    return make_roc_example()


def make_risk_calibration_example() -> pd.DataFrame:
    return make_roc_example()


def make_nomogram_example() -> pd.DataFrame:
    n = 260
    age = rng.normal(62, 10, n).clip(32, 88)
    tumor_size = rng.gamma(2.2, 1.3, n).clip(0.4, 9.5)
    stage_score = rng.choice([1, 2, 3, 4], n, p=[0.22, 0.34, 0.30, 0.14])
    biomarker = rng.normal(3.2, 1.1, n).clip(0.4, 7.8)
    inflammation = rng.normal(0, 1, n)
    linear = -4.2 + 0.035 * age + 0.28 * tumor_size + 0.58 * stage_score + 0.42 * biomarker + 0.45 * inflammation
    predicted_risk = 1 / (1 + np.exp(-linear))
    outcome = rng.binomial(1, predicted_risk, n)
    return pd.DataFrame({
        "patient_id": [f"P{str(i).zfill(4)}" for i in range(1, n + 1)],
        "age": np.round(age, 1),
        "tumor_size": np.round(tumor_size, 2),
        "stage_score": stage_score,
        "biomarker": np.round(biomarker, 2),
        "inflammation_index": np.round(inflammation, 2),
        "predicted_risk": np.round(predicted_risk, 3),
        "outcome": outcome,
    })


def make_baseline_table_example() -> pd.DataFrame:
    df = _base_clin_df(300)
    df["education"] = rng.choice(["Primary", "Secondary", "Tertiary"], 300, p=[0.3, 0.45, 0.25])
    df["smoking"] = rng.choice(["Never", "Former", "Current"], 300, p=[0.5, 0.25, 0.25])
    df["outcome"] = rng.choice([0, 1], 300, p=[0.65, 0.35])
    df["survival_time"] = np.round(rng.exponential(40, 300), 1)
    df["event"] = rng.choice([0, 1], 300, p=[0.6, 0.4])
    df["treatment"] = rng.choice(["Standard", "Experimental"], 300)
    missing_plan = {
        "bmi": 0.08,
        "glucose": 0.10,
        "cholesterol": 0.06,
        "crp": 0.12,
        "education": 0.05,
        "smoking": 0.07,
        "survival_time": 0.04,
        "province": 0.03,
    }
    for col, rate in missing_plan.items():
        n_missing = max(1, int(len(df) * rate))
        missing_idx = rng.choice(df.index.to_numpy(), size=n_missing, replace=False)
        df.loc[missing_idx, col] = np.nan
    return df[[
        "patient_id", "age", "sex", "bmi", "sbp", "dbp", "glucose", "cholesterol",
        "crp", "group", "treatment", "province", "disease_type", "education",
        "smoking", "outcome", "survival_time", "event"
    ]]


def make_correlation_heatmap_example() -> pd.DataFrame:
    """Generate a comprehensive 48-variable clinical dataset with realistic correlations."""
    n = 500
    # Core drivers
    age = rng.normal(58, 12, n).clip(25, 85)
    bmi = 18 + 0.12 * age + rng.normal(0, 3, n)
    sex_score = rng.choice([-1, 1], n, p=[0.48, 0.52])

    # Cardiovascular
    sbp = 80 + 0.7 * age + 0.5 * bmi + rng.normal(0, 10, n)
    dbp = 50 + 0.3 * age + 0.4 * bmi + rng.normal(0, 7, n)
    map_val = (sbp + 2 * dbp) / 3 + rng.normal(0, 2, n)
    heart_rate = 80 - 0.1 * age + 0.2 * bmi + rng.normal(0, 8, n)
    pp = sbp - dbp + rng.normal(0, 3, n)

    # Metabolic
    glucose = 3.5 + 0.02 * age + 0.08 * bmi + rng.normal(0, 0.8, n)
    hba1c = 4.5 + 0.5 * glucose + rng.normal(0, 0.4, n)
    insulin = 5 + 0.8 * bmi + 0.3 * glucose + rng.normal(0, 3, n)
    homa_ir = (glucose * insulin) / 22.5 + rng.normal(0, 0.3, n)
    c_peptide = 1.5 + 0.15 * insulin + rng.normal(0, 0.4, n)

    # Lipids
    cholesterol = 3.5 + 0.015 * age + 0.06 * bmi + rng.normal(0, 0.8, n)
    ldl = 0.55 * cholesterol + rng.normal(0, 0.4, n)
    hdl = 2.0 - 0.02 * bmi - 0.1 * sex_score + rng.normal(0, 0.3, n)
    vldl = 0.2 + 0.02 * bmi + rng.normal(0, 0.15, n)
    tg = 0.5 + 0.04 * bmi + 0.1 * glucose + rng.normal(0, 0.5, n)
    apob = 0.5 + 0.18 * ldl + 0.05 * tg + rng.normal(0, 0.08, n)
    lpa = 20 + 0.05 * age + rng.normal(0, 12, n)
    non_hdl = cholesterol - hdl + rng.normal(0, 0.1, n)

    # Inflammation
    crp = np.exp(0.02 * bmi + 0.01 * age + rng.normal(-1, 0.6, n))
    il6 = 1.0 + 0.05 * crp + 0.01 * bmi + rng.normal(0, 0.8, n)
    il10 = 4.0 + 0.02 * crp + rng.normal(0, 0.6, n)
    tnf = 3 + 0.03 * crp + 0.02 * age + rng.normal(0, 1.5, n)
    il1b = 0.8 + 0.04 * crp + rng.normal(0, 0.5, n)
    il8 = 8 + 0.08 * crp + rng.normal(0, 3, n)
    esr = 5 + 0.15 * age + 0.2 * crp + rng.normal(0, 4, n)
    ferritin = 120 + 2.5 * crp + 0.8 * age + rng.normal(0, 40, n)

    # Liver
    alt = 15 + 0.5 * bmi + rng.normal(0, 8, n)
    ast = 12 + 0.4 * bmi + 0.3 * alt + rng.normal(0, 5, n)
    ggt = 20 + 0.6 * bmi + 0.2 * alt + rng.normal(0, 10, n)
    alp = 60 + 0.1 * age + rng.normal(0, 12, n)
    albumin = 48 - 0.08 * age - 0.05 * crp + rng.normal(0, 3, n)
    tbil = 10 + 0.05 * alt + rng.normal(0, 3, n)
    dbil = 0.35 * tbil + rng.normal(0, 0.8, n)

    # Kidney
    creatinine = 60 + 0.3 * age - 0.1 * bmi + rng.normal(0, 12, n)
    bun = 3 + 0.04 * age + 0.01 * creatinine + rng.normal(0, 1.2, n)
    uric_acid = 250 + 2.5 * bmi + 0.5 * creatinine + rng.normal(0, 40, n)
    egfr = 140 - 0.8 * age - 0.2 * creatinine + rng.normal(0, 10, n)
    cystatin_c = 0.5 + 0.008 * creatinine + rng.normal(0, 0.12, n)

    # Hematology
    wbc = 6 + 0.02 * age + 0.05 * crp + rng.normal(0, 1.2, n)
    rbc = 4.8 - 0.01 * age + rng.normal(0, 0.4, n)
    hgb = 145 - 0.3 * age - 5 * sex_score + rng.normal(0, 12, n)
    plt = 250 - 0.5 * age + rng.normal(0, 40, n)
    neut = 0.55 * wbc + rng.normal(0, 0.5, n)
    lymph = 0.3 * wbc + rng.normal(0, 0.4, n)

    # Body composition
    waist = 60 + 1.1 * bmi + rng.normal(0, 4, n)
    whr = 0.75 + 0.006 * bmi + rng.normal(0, 0.04, n)
    body_fat = 18 + 0.6 * bmi - 5 * sex_score + rng.normal(0, 4, n)

    # Coagulation
    pt = 11.5 + 0.02 * age + rng.normal(0, 0.6, n)
    inr = pt / 11 + rng.normal(0, 0.08, n)
    aptt = 30 + 0.05 * age + rng.normal(0, 2.5, n)
    fibrinogen = 2.8 + 0.03 * crp + rng.normal(0, 0.4, n)
    d_dimer = 0.2 + 0.005 * age + 0.01 * crp + rng.normal(0, 0.15, n)

    # Electrolytes
    sodium = 140 + 0.02 * age + rng.normal(0, 2, n)
    potassium = 4.2 - 0.002 * creatinine + rng.normal(0, 0.3, n)
    calcium = 2.35 - 0.002 * age + rng.normal(0, 0.1, n)

    return pd.DataFrame({
        "Age": np.round(age, 1),
        "BMI": np.round(bmi.clip(16, 42), 1),
        "SBP": np.round(sbp.clip(85, 200), 0).astype(int),
        "DBP": np.round(dbp.clip(50, 130), 0).astype(int),
        "MAP": np.round(map_val.clip(60, 140), 0).astype(int),
        "Heart Rate": np.round(heart_rate.clip(50, 110), 0).astype(int),
        "Pulse Pressure": np.round(pp.clip(20, 100), 0).astype(int),
        "Glucose": np.round(glucose.clip(3, 15), 2),
        "HbA1c": np.round(hba1c.clip(4, 12), 2),
        "Insulin": np.round(insulin.clip(2, 50), 1),
        "HOMA-IR": np.round(homa_ir.clip(0.5, 12), 2),
        "C-Peptide": np.round(c_peptide.clip(0.5, 6), 2),
        "Total Chol": np.round(cholesterol.clip(2.5, 9), 2),
        "LDL-C": np.round(ldl.clip(0.8, 5.5), 2),
        "HDL-C": np.round(hdl.clip(0.5, 3), 2),
        "VLDL-C": np.round(vldl.clip(0.1, 1.5), 2),
        "Triglycerides": np.round(tg.clip(0.4, 8), 2),
        "ApoB": np.round(apob.clip(0.3, 2), 2),
        "Lp(a)": np.round(lpa.clip(5, 120), 1),
        "Non-HDL-C": np.round(non_hdl.clip(1.5, 7), 2),
        "CRP": np.round(crp.clip(0.1, 60), 2),
        "IL-6": np.round(il6.clip(0.1, 18), 2),
        "IL-10": np.round(il10.clip(1, 12), 2),
        "TNF-α": np.round(tnf.clip(1, 25), 2),
        "IL-1β": np.round(il1b.clip(0.1, 8), 2),
        "IL-8": np.round(il8.clip(2, 35), 2),
        "ESR": np.round(esr.clip(1, 60), 1),
        "Ferritin": np.round(ferritin.clip(10, 500), 1),
        "ALT": np.round(alt.clip(5, 100), 1),
        "AST": np.round(ast.clip(5, 80), 1),
        "GGT": np.round(ggt.clip(8, 120), 1),
        "ALP": np.round(alp.clip(30, 150), 1),
        "Albumin": np.round(albumin.clip(30, 55), 1),
        "Total Bilirubin": np.round(tbil.clip(3, 30), 1),
        "Direct Bilirubin": np.round(dbil.clip(0.5, 12), 1),
        "Creatinine": np.round(creatinine.clip(40, 180), 1),
        "BUN": np.round(bun.clip(2, 15), 2),
        "Uric Acid": np.round(uric_acid.clip(150, 600), 0).astype(int),
        "eGFR": np.round(egfr.clip(15, 130), 1),
        "Cystatin C": np.round(cystatin_c.clip(0.4, 2.5), 2),
        "WBC": np.round(wbc.clip(3, 15), 2),
        "RBC": np.round(rbc.clip(3.5, 6.5), 2),
        "Hemoglobin": np.round(hgb.clip(90, 180), 0).astype(int),
        "Platelets": np.round(plt.clip(100, 450), 0).astype(int),
        "Neutrophils": np.round(neut.clip(1.5, 10), 2),
        "Lymphocytes": np.round(lymph.clip(0.5, 5), 2),
        "Waist": np.round(waist.clip(60, 140), 1),
        "WHR": np.round(whr.clip(0.7, 1.1), 2),
        "Body Fat %": np.round(body_fat.clip(10, 45), 1),
        "PT": np.round(pt.clip(9, 16), 1),
        "INR": np.round(inr.clip(0.8, 1.5), 2),
        "aPTT": np.round(aptt.clip(22, 45), 1),
        "Fibrinogen": np.round(fibrinogen.clip(1.5, 5.5), 2),
        "D-Dimer": np.round(d_dimer.clip(0.1, 2.5), 2),
        "Sodium": np.round(sodium.clip(130, 150), 1),
        "Potassium": np.round(potassium.clip(3, 6), 2),
        "Calcium": np.round(calcium.clip(2, 2.7), 2),
    })


def make_publication_heatmap_example() -> pd.DataFrame:
    """Dense normalized biomarker matrix designed to fill the heatmap canvas."""
    modules = {
        "Inflammation": ["CRP", "IL6", "IL8", "TNFA", "IL1B", "MCP1", "Ferritin", "ESR"],
        "Metabolic": ["Glucose", "HbA1c", "Insulin", "HOMA_IR", "Leptin", "Adiponectin", "C_Peptide", "FFA"],
        "Lipid": ["TC", "LDL_C", "HDL_C", "TG", "ApoB", "ApoA1", "Lp_a", "Non_HDL_C"],
        "Renal": ["Creatinine", "BUN", "Uric_Acid", "Cystatin_C", "eGFR", "NGAL", "KIM1", "Albuminuria"],
        "Cardiac": ["cTnI", "cTnT", "BNP", "NT_proBNP", "CK_MB", "Myoglobin", "QTc", "Heart_Rate"],
        "Body": ["BMI", "Waist", "WHR", "Body_Fat", "Visceral_Fat", "Muscle_Mass", "VO2max", "SpO2"],
    }
    timepoints = [f"T{str(i + 1).zfill(2)}" for i in range(36)]
    module_phase = {
        "Inflammation": 0.0,
        "Metabolic": 0.8,
        "Lipid": 1.6,
        "Renal": 2.4,
        "Cardiac": 3.2,
        "Body": 4.0,
    }
    module_shift = {
        "Inflammation": 0.35,
        "Metabolic": -0.15,
        "Lipid": 0.10,
        "Renal": -0.35,
        "Cardiac": 0.20,
        "Body": -0.05,
    }

    records = []
    x = np.linspace(0, 2 * np.pi, len(timepoints))
    positions = np.arange(len(timepoints))
    for module_index, (module, indicators) in enumerate(modules.items()):
        for indicator_index, indicator in enumerate(indicators):
            row_index = module_index * len(indicators) + indicator_index
            phase = module_phase[module] + indicator_index * 0.37
            amplitude = 1.0 + 0.22 * np.sin(indicator_index)
            smooth_wave = amplitude * np.sin(x + phase)
            secondary_wave = 0.55 * np.cos(2.0 * x - phase / 2)
            module_band = module_shift[module] + 0.18 * np.sin(module_index + x / 2)
            focal_peak = 1.35 * np.exp(-((positions - (6 + module_index * 5)) ** 2) / 18)
            focal_dip = -1.10 * np.exp(-((positions - (25 - module_index * 2)) ** 2) / 22)
            noise = rng.normal(0, 0.13, len(timepoints))
            values = smooth_wave + secondary_wave + module_band + focal_peak + focal_dip + noise
            values = (values - values.mean()) / max(values.std(ddof=0), 1e-6)
            values = np.clip(values, -2.6, 2.6)
            for timepoint, value in zip(timepoints, values):
                records.append({
                    "indicator": f"{module} | {indicator}",
                    "timepoint": timepoint,
                    "module": module,
                    "value": round(float(value), 3),
                    "row_order": row_index + 1,
                })
    return pd.DataFrame(records)


def make_paired_change_example() -> pd.DataFrame:
    n = 96
    groups = rng.choice(["Control", "Treatment A", "Treatment B"], n, p=[0.34, 0.36, 0.30])
    baseline = rng.normal(7.6, 0.9, n)
    effect = np.select(
        [groups == "Control", groups == "Treatment A", groups == "Treatment B"],
        [rng.normal(-0.25, 0.35, n), rng.normal(-0.85, 0.38, n), rng.normal(-1.15, 0.42, n)],
        default=rng.normal(-0.5, 0.4, n),
    )
    week12 = baseline + effect
    return pd.DataFrame({
        "patient_id": [f"P{str(i).zfill(3)}" for i in range(1, n + 1)],
        "group": groups,
        "baseline": np.round(baseline.clip(5.0, 10.5), 2),
        "week12": np.round(week12.clip(4.2, 10.5), 2),
        "change": np.round(week12 - baseline, 2),
    })


def make_waterfall_example() -> pd.DataFrame:
    n = 74
    therapy = rng.choice(["IO combo", "Targeted", "Chemotherapy"], n, p=[0.36, 0.34, 0.30])
    response = rng.normal(-18, 24, n)
    response += np.select(
        [therapy == "IO combo", therapy == "Targeted", therapy == "Chemotherapy"],
        [-8, -4, 6],
        default=0,
    )
    response = np.round(response.clip(-78, 52), 1)
    category = np.where(response <= -30, "Partial response", np.where(response >= 20, "Progressive disease", "Stable disease"))
    return pd.DataFrame({
        "patient_id": [f"T{str(i).zfill(3)}" for i in range(1, n + 1)],
        "best_change_pct": response,
        "response": category,
        "therapy": therapy,
    })


def make_method_comparison_example() -> pd.DataFrame:
    n = 160
    true_val = rng.normal(8.5, 2.2, n).clip(2, 18)
    method_a = true_val + rng.normal(0, 0.55, n)
    method_b = true_val + rng.normal(0.28, 0.75, n)
    group = rng.choice(["Ward", "ICU", "Outpatient"], n, p=[0.42, 0.22, 0.36])
    return pd.DataFrame({
        "sample_id": [f"S{str(i).zfill(3)}" for i in range(1, n + 1)],
        "method_a": np.round(method_a, 2),
        "method_b": np.round(method_b, 2),
        "group": group,
    })


def make_calibration_example() -> pd.DataFrame:
    n = 650
    risk_score = rng.beta(2.2, 5.2, n)
    logits = -2.2 + 5.2 * risk_score + rng.normal(0, 0.22, n)
    event_prob = 1 / (1 + np.exp(-logits))
    outcome = rng.binomial(1, event_prob, n)
    model = rng.choice(["Model A", "Model B"], n, p=[0.5, 0.5])
    predicted = np.where(model == "Model A", risk_score, np.clip(risk_score * 0.88 + 0.04, 0.01, 0.95))
    return pd.DataFrame({
        "patient_id": [f"C{str(i).zfill(4)}" for i in range(1, n + 1)],
        "predicted_risk": np.round(predicted, 4),
        "outcome": outcome,
        "model": model,
    })


def make_swimmer_example() -> pd.DataFrame:
    n = 48
    therapy = rng.choice(["Arm A", "Arm B", "Arm C"], n, p=[0.38, 0.34, 0.28])
    duration = rng.gamma(4.2, 3.4, n).clip(3, 34)
    start = rng.uniform(0, 4, n)
    event_time = start + duration * rng.uniform(0.45, 0.95, n)
    response = rng.choice(["CR", "PR", "SD", "PD"], n, p=[0.16, 0.38, 0.32, 0.14])
    event = np.where(response == "PD", "Progression", rng.choice(["Ongoing", "Censored"], n, p=[0.72, 0.28]))
    return pd.DataFrame({
        "patient_id": [f"P{str(i).zfill(2)}" for i in range(1, n + 1)],
        "therapy": therapy,
        "start_month": np.round(start, 1),
        "duration_month": np.round(duration, 1),
        "event_month": np.round(event_time, 1),
        "response": response,
        "event": event,
    })


def make_population_pyramid_example() -> pd.DataFrame:
    age_groups = ["18-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80+"]
    male = np.array([42, 55, 72, 88, 96, 74, 38])
    female = np.array([48, 62, 76, 92, 104, 86, 52])
    return pd.DataFrame({
        "age_group": age_groups,
        "male": male,
        "female": female,
        "total": male + female,
    })


def make_radar_example() -> pd.DataFrame:
    """Generate radar chart example with multiple clinical dimensions for 3 groups."""
    groups = ["Control", "Treatment A", "Treatment B"]
    dimensions = ["SBP", "DBP", "Glucose", "BMI", "Cholesterol", "CRP", "Heart Rate", "eGFR"]
    records = []
    for g in groups:
        base_map = {
            "Control": [138, 86, 6.8, 27.5, 5.8, 8.2, 78, 72],
            "Treatment A": [128, 79, 5.9, 25.8, 5.1, 4.5, 72, 85],
            "Treatment B": [131, 81, 6.2, 26.3, 5.4, 5.8, 74, 80],
        }
        bases = base_map[g]
        for _ in range(60):
            row = {"group": g}
            for j, dim in enumerate(dimensions):
                row[dim] = round(bases[j] + rng.normal(0, bases[j] * 0.08), 2)
            records.append(row)
    return pd.DataFrame(records)


def make_sankey_example() -> pd.DataFrame:
    """Generate sankey diagram example showing patient treatment pathway flows."""
    sources = [
        "Screened", "Screened", "Screened",
        "Eligible", "Eligible", "Eligible", "Eligible",
        "Randomized A", "Randomized A", "Randomized B", "Randomized B", "Randomized B",
        "Completed A", "Completed A", "Completed A", "Completed B", "Completed B", "Completed B",
        "Discontinued", "Discontinued", "Discontinued",
        "Follow-up", "Follow-up",
        "Adverse Event", "Adverse Event",
        "Lost", "Lost",
        "Withdrawal", "Withdrawal",
    ]
    targets = [
        "Eligible", "Excluded", "Pending Review",
        "Randomized A", "Randomized B", "Declined", "Lost to Follow-up",
        "Completed A", "Discontinued A", "Completed B", "Discontinued B", "Crossover",
        "Follow-up", "Adverse Event", "Withdrawal",
        "Follow-up", "Adverse Event", "Withdrawal",
        "Lost", "Withdrawal", "Protocol Deviation",
        "Remission", "Relapse",
        "Mild", "Severe",
        "Unreachable", "Declined Further",
        "Personal Reason", "Moved Away",
    ]
    values = [
        420, 180, 45,
        210, 210, 35, 20,
        185, 25, 178, 22, 10,
        140, 28, 17,
        132, 30, 16,
        18, 12, 5,
        98, 42,
        38, 20,
        22, 16,
        18, 11,
    ]
    return pd.DataFrame({"source": sources, "target": targets, "value": values})


def make_treemap_example() -> pd.DataFrame:
    """Generate treemap example with hierarchical clinical categories."""
    categories = [
        "Cardiovascular", "Metabolic", "Infectious", "Respiratory", "Oncology",
        "Hypertension", "CHD", "Heart Failure",
        "Diabetes", "Obesity", "Dyslipidemia",
        "Pneumonia", "Influenza",
        "COPD", "Asthma",
        "Lung Cancer", "Breast Cancer",
    ]
    parents = [
        "", "", "", "", "",
        "Cardiovascular", "Cardiovascular", "Cardiovascular",
        "Metabolic", "Metabolic", "Metabolic",
        "Infectious", "Infectious",
        "Respiratory", "Respiratory",
        "Oncology", "Oncology",
    ]
    values = [
        647, 613, 160, 230, 275,
        320, 185, 142,
        260, 198, 155,
        88, 72,
        134, 96,
        110, 165,
    ]
    return pd.DataFrame({"category": categories, "parent": parents, "value": values})


def make_funnel_example() -> pd.DataFrame:
    """Generate funnel chart example showing clinical trial enrollment cascade."""
    stages = ["Identified", "Contacted", "Screened", "Eligible", "Consented", "Randomized", "Completed", "Per-Protocol"]
    counts = [1200, 980, 720, 520, 420, 360, 310, 285]
    return pd.DataFrame({"stage": stages, "count": counts})


EXAMPLE_MAKERS = {
    "scatter_example": make_scatter_example,
    "bar_example": make_bar_example,
    "line_example": make_line_example,
    "boxplot_example": make_boxplot_example,
    "violin_example": make_violin_example,
    "dumbbell_example": make_dumbbell_example,
    "forest_example": make_forest_example,
    "volcano_example": make_volcano_example,
    "bubble_example": make_bubble_example,
    "heatmap_example": make_publication_heatmap_example,
    "correlation_heatmap_example": make_correlation_heatmap_example,
    "venn_example": make_venn_example,
    "upset_example": make_upset_example,
    "raincloud_example": make_raincloud_example,
    "beanplot_example": make_beanplot_example,
    "china_map_example": make_china_map_example,
    "world_map_example": make_world_map_example,
    "usa_map_example": make_usa_map_example,
    "europe_map_example": make_europe_map_example,
    "uk_map_example": make_uk_map_example,
    "survival_example": make_survival_example,
    "roc_example": make_roc_example,
    "dca_example": make_dca_example,
    "risk_calibration_example": make_risk_calibration_example,
    "nomogram_example": make_nomogram_example,
    "paired_change_example": make_paired_change_example,
    "waterfall_example": make_waterfall_example,
    "method_comparison_example": make_method_comparison_example,
    "calibration_example": make_calibration_example,
    "swimmer_example": make_swimmer_example,
    "population_pyramid_example": make_population_pyramid_example,
    "baseline_table_example": make_baseline_table_example,
    "radar_example": make_radar_example,
    "sankey_example": make_sankey_example,
    "treemap_example": make_treemap_example,
    "funnel_example": make_funnel_example,
}
