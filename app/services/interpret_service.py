from __future__ import annotations

import numpy as np
import pandas as pd
from app.services.stats_service import _test_normality

CHART_META = {
    "scatter": {"name": "散点图", "purpose": "展示两个连续变量的关系与分布"},
    "grouped_scatter": {"name": "分组散点图", "purpose": "按分组对比两组变量间关系"},
    "line": {"name": "折线图", "purpose": "展示变量随时间或有序类别的变化趋势"},
    "multi_line": {"name": "多组折线图", "purpose": "比较不同组别的趋势差异"},
    "bar": {"name": "柱状图", "purpose": "比较不同类别的数值大小"},
    "stacked_bar": {"name": "堆叠柱状图", "purpose": "展示总量及内部构成"},
    "grouped_bar": {"name": "分组柱状图", "purpose": "并列比较不同组别在各类别的表现"},
    "horizontal_bar": {"name": "水平柱状图", "purpose": "水平方向比较各类别数值"},
    "box": {"name": "箱线图", "purpose": "展示中位数、四分位数及离群值"},
    "violin": {"name": "小提琴图", "purpose": "结合箱线图与密度估计展示分布形态"},
    "box_scatter": {"name": "箱线散点图", "purpose": "叠加原始数据点的箱线图"},
    "violin_box_scatter": {"name": "小提琴箱线散点图", "purpose": "综合密度、分位数与原始数据"},
    "histogram": {"name": "直方图", "purpose": "展示连续变量的频率分布"},
    "density": {"name": "密度图", "purpose": "以平滑曲线展示概率密度分布"},
    "heatmap": {"name": "热力图", "purpose": "以颜色深浅展示矩阵数据的大小差异"},
    "correlation_heatmap": {"name": "相关性热力图", "purpose": "展示变量间相关系数矩阵"},
    "pie": {"name": "饼图", "purpose": "展示各部分占整体的比例"},
    "donut": {"name": "环形图", "purpose": "饼图变体，中心留空突出总量"},
    "area": {"name": "面积图", "purpose": "以填充面积展示变化趋势与累积量"},
    "forest": {"name": "森林图", "purpose": "展示多研究效应量及置信区间"},
    "survival": {"name": "生存曲线", "purpose": "展示不同组别生存概率随时间的变化"},
    "roc": {"name": "ROC曲线", "purpose": "评估诊断试验的区分能力"},
    "multi_roc": {"name": "多模型ROC曲线", "purpose": "比较多模型的区分能力"},
    "volcano": {"name": "火山图", "purpose": "同时展示差异显著性与效应大小"},
    "bubble": {"name": "气泡图", "purpose": "散点图基础上以气泡大小表示第三维"},
    "radar": {"name": "雷达图", "purpose": "多指标并行比较"},
    "waterfall": {"name": "瀑布图", "purpose": "展示初始值经增减至终值的过程"},
    "funnel": {"name": "漏斗图", "purpose": "展示各阶段转化率与流失"},
    "sankey": {"name": "桑基图", "purpose": "展示节点间的流向与数量"},
    "treemap": {"name": "矩形树图", "purpose": "嵌套矩形展示层次数据结构"},
    "lollipop": {"name": "棒棒糖图", "purpose": "点线结合比较类别数值"},
    "dumbbell": {"name": "哑铃图", "purpose": "展示两时间点或条件下的变化"},
    "raincloud": {"name": "雨云图", "purpose": "综合密度曲线、箱线图与散点"},
    "beanplot": {"name": "豆荚图", "purpose": "豆荚形状展示各组完整分布"},
    "beeswarm": {"name": "蜂群图", "purpose": "不重叠排列展示每个数据点"},
    "china_map": {"name": "中国地图", "purpose": "颜色梯度展示各省指标分布"},
    "world_map": {"name": "世界地图", "purpose": "颜色梯度展示各国指标分布"},
    "usa_map": {"name": "美国地图", "purpose": "展示美国各州指标分布"},
    "europe_map": {"name": "欧洲地图", "purpose": "展示欧洲各国指标分布"},
    "uk_map": {"name": "英国地图", "purpose": "展示英国各地区指标分布"},
    "calibration_curve": {"name": "校准曲线", "purpose": "评估预测概率与实际发生率的一致性"},
    "dca": {"name": "决策曲线", "purpose": "评估不同阈值下使用模型的净获益"},
    "nomogram": {"name": "列线图", "purpose": "将回归方程转化为图形化预测工具"},
    "risk_calibration": {"name": "风险校准图", "purpose": "评估风险分层下的校准表现"},
    "pca": {"name": "PCA降维图", "purpose": "主成分展示高维数据低维结构"},
    "population_pyramid": {"name": "人口金字塔", "purpose": "比较两人群各年龄段的数量分布"},
    "paired_line": {"name": "配对连线图", "purpose": "展示同一受试者两时间点的变化轨迹"},
    "venn": {"name": "韦恩图", "purpose": "展示多集合间的交集与并集"},
    "upset": {"name": "UpSet图", "purpose": "矩阵形式展示复杂集合交集"},
    "swimmer": {"name": "游泳图", "purpose": "展示受试者治疗过程与关键事件时间线"},
    "polar_bar": {"name": "极坐标柱状图", "purpose": "环形排列柱体，适合周期数据"},
    "slope": {"name": "斜率图", "purpose": "连接两时间点值，突出变化方向"},
    "bland_altman": {"name": "Bland-Altman图", "purpose": "评估两种测量方法的一致性"},
    "qq_plot": {"name": "QQ图", "purpose": "检验数据是否符合特定理论分布"},
    "cleveland_dot": {"name": "克利夫兰点图", "purpose": "点位置比较类别数值"},
    "ridgeline": {"name": "脊线图", "purpose": "重叠密度曲线比较多组分布"},
    "parallel_coords": {"name": "平行坐标图", "purpose": "展示高维空间中多变量关系"},
    "error_bar": {"name": "误差线图", "purpose": "展示均值与变异范围"},
    "percent_stacked_bar": {"name": "百分比堆叠柱状图", "purpose": "比较各组百分比构成"},
    "china_bubble_map": {"name": "中国气泡地图", "purpose": "气泡大小与颜色展示双变量空间分布"},
    "world_bubble_map": {"name": "世界气泡地图", "purpose": "气泡大小与颜色展示双变量空间分布"},
    "ecdf_plot": {"name": "经验累积分布图", "purpose": "展示累积分布函数"},
    "strip_plot": {"name": "带状散点图", "purpose": "一维散点展示各组分布"},
    "step_plot": {"name": "阶梯图", "purpose": "阶梯方式展示分段函数"},
    "mean_ci_plot": {"name": "均值置信区间图", "purpose": "展示各组均值与置信区间"},
    "pareto_chart": {"name": "帕累托图", "purpose": "降序柱加累积曲线，识别关键因素"},
    "precision_recall": {"name": "PR曲线", "purpose": "评估非平衡数据的分类表现"},
    "lift_chart": {"name": "提升图", "purpose": "评估模型相比随机的提升效果"},
    "time_auc_curve": {"name": "时间AUC曲线", "purpose": "展示不同时间点的区分能力变化"},
    "decision_impact_curve": {"name": "决策影响曲线", "purpose": "展示不同阈值下模型的临床影响"},
    "sunburst_chart": {"name": "旭日图", "purpose": "多层环形展示层次化数据"},
    "waffle_chart": {"name": "华夫饼图", "purpose": "方格矩阵展示百分比构成"},
    "mosaic_plot": {"name": "马赛克图", "purpose": "矩形面积展示分类变量关联"},
    "subgroup_effect_matrix": {"name": "亚组效应矩阵", "purpose": "展示亚组治疗效应方向与一致性"},
    "chord_flow": {"name": "弦图", "purpose": "弧形连接展示节点间流向"},
    "radial_tree": {"name": "放射树图", "purpose": "放射状展示层次结构"},
    "clinical_decile_plot": {"name": "临床十分位图", "purpose": "评估不同风险分层的校准与区分"},
    "method_comparison": {"name": "方法比较图", "purpose": "比较两种测量方法的一致性"},
}


def generate_interpretation(
    df: pd.DataFrame,
    chart_type: str,
    chart_params: dict | None = None,
) -> dict:
    chart_params = chart_params or {}
    meta = CHART_META.get(chart_type, {"name": chart_type, "purpose": "数据可视化展示"})

    n_rows = len(df)
    n_cols = len(df.columns)
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()
    missing_total = int(df.isnull().sum().sum())
    missing_rate = round(missing_total / (n_rows * n_cols) * 100, 2) if n_rows > 0 else 0

    # Sample size assessment
    if n_rows >= 100:
        sample_label, sample_note = "充足", f"n={n_rows}"
    elif n_rows >= 30:
        sample_label, sample_note = "可接受", f"n={n_rows}，建议报告统计效力"
    elif n_rows > 0:
        sample_label, sample_note = "偏小", f"n={n_rows}，统计效力不足"
    else:
        sample_label, sample_note = "无数据", "无有效数据行"

    # Missing data
    if missing_rate <= 1:
        missing_label, missing_note = "优", f"缺失 {missing_rate:.1f}%"
    elif missing_rate <= 5:
        missing_label, missing_note = "良", f"缺失 {missing_rate:.1f}%"
    elif missing_rate <= 15:
        missing_label, missing_note = "中", f"缺失 {missing_rate:.1f}%，需关注"
    else:
        missing_label, missing_note = "差", f"缺失 {missing_rate:.1f}%，偏倚风险高"

    # Outliers
    outlier_info = _outlier_summary(df, num_cols)

    # Distribution normality
    dist_info = _normality_summary(df, num_cols)

    quality = {
        "sample": {"label": sample_label, "note": sample_note},
        "missing": {"label": missing_label, "note": missing_note},
        "outliers": outlier_info,
        "normality": dist_info,
    }

    # Chart-specific insights
    insights = _chart_insights(df, chart_type, chart_params)

    # Publication readiness
    pub = _publication_check(n_rows, missing_rate, outlier_info, num_cols, chart_type)
    quality_scores = _quality_scores(quality)
    visual_guide = _visual_guide(df, chart_type, chart_params, meta, num_cols, cat_cols)
    report = _report_blocks(
        df=df,
        chart_type=chart_type,
        chart_params=chart_params,
        meta=meta,
        quality=quality,
        quality_scores=quality_scores,
        insights=insights,
        publication=pub,
        missing_rate=missing_rate,
        num_cols=num_cols,
        cat_cols=cat_cols,
    )

    return {
        "chart_type": chart_type,
        "chart_name": meta["name"],
        "chart_purpose": meta["purpose"],
        "data_profile": {
            "n": n_rows,
            "variables": n_cols,
            "numeric": len(num_cols),
            "categorical": len(cat_cols),
            "missing_total": missing_total,
            "missing_pct": missing_rate,
        },
        "quality": quality,
        "quality_scores": quality_scores,
        "visual_guide": visual_guide,
        "insights": insights,
        "publication": pub,
        "report": report,
    }


def _quality_scores(quality: dict) -> list[dict]:
    labels = {
        "sample": "样本量",
        "missing": "完整性",
        "outliers": "离群值",
        "normality": "分布形态",
    }
    return [
        {
            "key": key,
            "label": labels[key],
            "status": item.get("label", "—"),
            "score": _label_score(item.get("label", "—")),
            "note": item.get("note", ""),
            "tone": _label_tone(item.get("label", "—")),
        }
        for key, item in quality.items()
    ]


def _label_score(label: str) -> int:
    score_map = {
        "充足": 96,
        "优": 96,
        "良": 84,
        "可接受": 72,
        "中": 60,
        "偏小": 42,
        "差": 26,
        "无数据": 0,
        "—": 50,
    }
    return score_map.get(label, 50)


def _label_tone(label: str) -> str:
    if label in ("充足", "优", "良"):
        return "ok"
    if label in ("可接受", "中", "偏小"):
        return "warn"
    if label in ("差", "无数据"):
        return "err"
    return "neutral"


def _visual_guide(df, chart_type, params, meta, num_cols, cat_cols):
    kind = _visual_kind(chart_type)
    roles = _selected_roles(params, num_cols, cat_cols)
    guide_by_kind = {
        "relationship": (
            "读图重点：方向、强度与离散程度",
            "趋势线方向提示变量关系，点云越贴近趋势线表示关系越稳定。",
            "散点图只能支持相关性判断，不能直接推断因果关系。",
        ),
        "distribution": (
            "读图重点：中心、离散与尾部",
            "中位数、四分位范围与密度形态可反映组内差异和偏态。",
            "分布明显偏斜时，均值容易受极端值影响。",
        ),
        "ranking": (
            "读图重点：组间排序与差距",
            "柱高或点位差异展示各类别大小，差距越大越值得进一步解释。",
            "类别过多时应优先突出主要组别，避免视觉拥挤。",
        ),
        "trend": (
            "读图重点：趋势、拐点与组间分离",
            "斜率反映变化速度，曲线分离提示不同组别的变化模式不同。",
            "时间序列可能存在自相关或季节性，需在模型中处理。",
        ),
        "interval": (
            "读图重点：效应方向与置信区间",
            "点估计表示效应大小，横线展示不确定性范围。",
            "置信区间跨越无效线时，单项结果通常不能认为有统计学意义。",
        ),
        "matrix": (
            "读图重点：颜色深浅与模式聚集",
            "颜色块展示数值大小或相关强度，相邻块形成的结构提示变量群。",
            "色阶需要保持连续且标注清晰，避免夸大微小差异。",
        ),
        "spatial": (
            "读图重点：空间聚集与区域异质性",
            "颜色或气泡大小提示地区差异，连续高值区域值得结合临床背景解释。",
            "地图展示的是空间分布，不应忽略人口基数和测量口径差异。",
        ),
        "flow": (
            "读图重点：路径、流量与损耗节点",
            "线宽或面积越大代表流量越高，分叉处可观察结构变化。",
            "流向图强调构成与转移，不代表统计显著性。",
        ),
        "diagnostic": (
            "读图重点：模型性能与临床阈值",
            "曲线越接近理想参照，模型区分、校准或净获益越好。",
            "模型图应报告置信区间、阈值区间和验证数据来源。",
        ),
    }
    title, signal, caution = guide_by_kind.get(kind, (
        "读图重点：结构、异常与可解释性",
        "先识别主体模式，再关注异常点和局部偏离。",
        "图形发现应结合研究设计和统计检验共同判断。",
    ))
    return {
        "kind": kind,
        "title": title,
        "signal": signal,
        "caution": caution,
        "chart_purpose": meta.get("purpose", ""),
        "roles": roles,
        "sample_label": f"{len(df)} 条观测 · {len(num_cols)} 个数值变量 · {len(cat_cols)} 个分类变量",
    }


def _visual_kind(chart_type: str) -> str:
    relationship = {"scatter", "grouped_scatter", "bubble", "pca", "bland_altman", "method_comparison"}
    distribution = {"box", "violin", "box_scatter", "violin_box_scatter", "histogram", "density", "raincloud", "beanplot", "beeswarm", "strip_plot", "ridgeline", "qq_plot"}
    ranking = {"bar", "horizontal_bar", "grouped_bar", "stacked_bar", "percent_stacked_bar", "lollipop", "cleveland_dot", "error_bar", "pareto_chart", "polar_bar", "population_pyramid", "waffle_chart", "mosaic_plot"}
    trend = {"line", "multi_line", "area", "survival", "slope", "paired_line", "step_plot", "ecdf_plot", "swimmer", "waterfall"}
    interval = {"forest", "dumbbell", "mean_ci_plot", "subgroup_effect_matrix"}
    matrix = {"heatmap", "correlation_heatmap", "upset", "parallel_coords"}
    spatial = {"china_map", "world_map", "usa_map", "europe_map", "uk_map", "china_bubble_map", "world_bubble_map"}
    flow = {"sankey", "treemap", "funnel", "sunburst_chart", "chord_flow", "radial_tree", "venn"}
    diagnostic = {"roc", "multi_roc", "precision_recall", "lift_chart", "time_auc_curve", "calibration_curve", "risk_calibration", "dca", "decision_impact_curve", "nomogram", "clinical_decile_plot"}
    if chart_type in relationship:
        return "relationship"
    if chart_type in distribution:
        return "distribution"
    if chart_type in ranking:
        return "ranking"
    if chart_type in trend:
        return "trend"
    if chart_type in interval:
        return "interval"
    if chart_type in matrix:
        return "matrix"
    if chart_type in spatial:
        return "spatial"
    if chart_type in flow:
        return "flow"
    if chart_type in diagnostic:
        return "diagnostic"
    return "generic"


def _selected_roles(params: dict, num_cols: list[str], cat_cols: list[str]) -> list[dict]:
    candidates = [
        ("x_var", "X 轴"),
        ("y_var", "Y 轴"),
        ("time_var", "时间"),
        ("event_var", "结局"),
        ("outcome_var", "结局"),
        ("predictor_var", "预测因子"),
        ("color_var", "分组"),
        ("group_var", "分组"),
        ("value_var", "数值"),
        ("map_value_var", "地图数值"),
        ("province_var", "地区"),
        ("country_var", "国家"),
    ]
    roles = []
    seen = set()
    for key, label in candidates:
        value = params.get(key)
        if value and value not in seen:
            roles.append({"label": label, "value": str(value)})
            seen.add(value)
    if not roles:
        for col in num_cols[:2]:
            roles.append({"label": "数值变量", "value": str(col)})
        for col in cat_cols[:1]:
            roles.append({"label": "分类变量", "value": str(col)})
    return roles[:4]


def _report_blocks(
    df,
    chart_type,
    chart_params,
    meta,
    quality,
    quality_scores,
    insights,
    publication,
    missing_rate,
    num_cols,
    cat_cols,
):
    n_rows = len(df)
    avg_quality = round(sum(item["score"] for item in quality_scores) / max(len(quality_scores), 1))
    primary_observation = (insights.get("observations") or [None])[0]
    headline = f"{meta.get('name', chart_type)}已完成质量审查"
    if primary_observation:
        headline = f"主要发现：{primary_observation}"

    subheadline = (
        f"纳入 {n_rows} 条观测、{len(df.columns)} 个变量；"
        f"数据完整性为{quality['missing']['label']}，整体质量评分约 {avg_quality}/100。"
    )
    clinical_note = insights.get("clinical_note") or _default_clinical_note(chart_type, meta)
    limitations = _limitations(n_rows, missing_rate, quality, chart_type)
    next_steps = _next_steps(publication, limitations, chart_type)
    method_notes = _method_notes(chart_type, insights)
    strengths = publication.get("strengths") or _quality_strengths(quality, n_rows, missing_rate)
    role_text = _role_text(chart_params, num_cols, cat_cols)
    caption = (
        f"本图用于{meta.get('purpose', '展示数据特征')}。"
        f"数据包含 {n_rows} 条观测和 {len(df.columns)} 个变量"
        f"{role_text}。{primary_observation or '图形可用于识别总体模式、异常值及潜在分组差异。'}"
    )
    return {
        "headline": headline,
        "subheadline": subheadline,
        "clinical_note": clinical_note,
        "caption": caption,
        "limitations": limitations[:5],
        "next_steps": next_steps[:5],
        "method_notes": method_notes[:5],
        "strengths": strengths[:5],
        "quality_score": avg_quality,
    }


def _role_text(params: dict, num_cols: list[str], cat_cols: list[str]) -> str:
    roles = _selected_roles(params, num_cols, cat_cols)
    if not roles:
        return ""
    role_pairs = "，".join(f"{r['label']}为 {r['value']}" for r in roles[:3])
    return f"，其中{role_pairs}"


def _default_clinical_note(chart_type: str, meta: dict) -> str:
    if chart_type in ("scatter", "grouped_scatter", "bubble"):
        return "若变量关系稳定，可作为后续回归建模或亚组分析的依据；仍需控制潜在混杂因素。"
    if chart_type in ("box", "violin", "raincloud", "beanplot", "beeswarm"):
        return "分布差异可提示人群异质性，建议结合效应量与组间检验确认临床意义。"
    if chart_type in ("bar", "grouped_bar", "stacked_bar", "horizontal_bar", "lollipop"):
        return "类别差异适合用于呈现主要人群特征或结局比例，解释时应关注绝对差值和样本构成。"
    if chart_type in ("line", "multi_line", "area", "survival"):
        return "趋势变化可反映随访过程或时间效应，建议报告关键时间点和组间分离程度。"
    if chart_type in ("roc", "multi_roc", "calibration_curve", "risk_calibration", "dca", "nomogram"):
        return "模型类图形应同时解释统计性能与临床可用阈值，避免只报告单一指标。"
    if chart_type in ("forest", "subgroup_effect_matrix"):
        return "效应方向和置信区间共同决定解释强度，亚组结果应关注一致性而非单点显著。"
    if chart_type in ("china_map", "world_map", "usa_map", "europe_map", "uk_map"):
        return "空间差异可能提示地区资源、暴露或病例结构不同，需结合标准化率和地区背景解释。"
    return f"该图适合用于{meta.get('purpose', '展示数据模式')}，建议将图形发现与研究设计、统计检验共同解释。"


def _limitations(n_rows: int, missing_rate: float, quality: dict, chart_type: str) -> list[str]:
    limitations = []
    if n_rows < 30:
        limitations.append("样本量低于 30，推断稳定性有限，宜定位为探索性结果。")
    elif n_rows < 60:
        limitations.append("样本量处于临界范围，建议补充效能说明或置信区间。")
    if missing_rate > 5:
        limitations.append("缺失比例超过 5%，需要说明缺失机制和处理方法。")
    if quality["outliers"].get("label") in ("中", "差"):
        limitations.append("存在较多离群值，需核实录入错误并进行敏感性分析。")
    if quality["normality"].get("label") == "差":
        limitations.append("多数数值变量偏离正态，均值比较和参数检验需谨慎。")
    if chart_type in ("scatter", "grouped_scatter", "correlation_heatmap"):
        limitations.append("相关关系不能证明因果，需结合研究设计或多变量模型。")
    if not limitations:
        limitations.append("未发现明显数据质量限制，仍建议在正文说明样本来源和变量定义。")
    return limitations


def _next_steps(publication: dict, limitations: list[str], chart_type: str) -> list[dict]:
    steps = []
    for tip in publication.get("tips", []):
        steps.append({"priority": "建议", "title": tip, "detail": "用于提升图形的期刊呈现质量。"})
    if publication.get("issues"):
        for issue in publication["issues"]:
            steps.append({"priority": "必要", "title": f"处理{issue}", "detail": "该问题会影响结果可信度或审稿解释。"})
    if chart_type in ("scatter", "grouped_scatter"):
        steps.append({"priority": "建议", "title": "补充回归线或置信带", "detail": "让趋势方向、离散程度和不确定性同时可见。"})
    elif chart_type in ("box", "violin", "raincloud"):
        steps.append({"priority": "建议", "title": "报告组间检验和效应量", "detail": "避免仅凭视觉差异判断统计学意义。"})
    elif chart_type in ("roc", "multi_roc"):
        steps.append({"priority": "必要", "title": "补充 AUC 95%CI", "detail": "诊断模型图形通常需要区间估计和最佳截断点。"})
    if not steps:
        steps.append({"priority": "可选", "title": "补充图注中的样本定义", "detail": "让读者明确纳入对象、变量单位和统计口径。"})
    return steps[:5]


def _method_notes(chart_type: str, insights: dict) -> list[str]:
    notes = list(insights.get("stats_notes") or [])
    if chart_type in ("scatter", "grouped_scatter"):
        notes.append("连续变量关系可补充 Pearson 或 Spearman 相关，并根据分布选择方法。")
    elif chart_type in ("bar", "grouped_bar", "stacked_bar"):
        notes.append("分类比较可根据设计选择卡方检验、Fisher 精确检验或趋势检验。")
    elif chart_type in ("box", "violin", "raincloud", "beanplot"):
        notes.append("多组连续变量比较可报告 ANOVA/Kruskal-Wallis 及事后比较。")
    elif chart_type in ("line", "multi_line", "area"):
        notes.append("重复测量或时间序列建议考虑混合效应模型或自相关结构。")
    elif chart_type in ("forest", "subgroup_effect_matrix"):
        notes.append("森林图需明确效应量类型、置信区间、权重和无效线。")
    elif chart_type in ("roc", "multi_roc", "precision_recall"):
        notes.append("模型评估需区分训练集、验证集和外部验证集表现。")
    if not notes:
        notes.append("图形结论应与预设统计分析计划保持一致。")
    return list(dict.fromkeys(notes))


def _quality_strengths(quality: dict, n_rows: int, missing_rate: float) -> list[str]:
    strengths = []
    if n_rows >= 100:
        strengths.append("样本量充足，适合进行稳定的图形展示。")
    if missing_rate <= 1:
        strengths.append("缺失率很低，完整性对图形解释影响较小。")
    if quality["outliers"].get("label") in ("优", "良"):
        strengths.append("离群值负担较低，主体趋势更容易识别。")
    if quality["normality"].get("label") in ("良", "中"):
        strengths.append("分布形态可支持常规描述，并可按需补充稳健方法。")
    if not strengths:
        strengths.append("已完成基础质量审查，可据此确定后续改进重点。")
    return strengths


def _outlier_summary(df, num_cols):
    if not num_cols:
        return {"label": "—", "note": "无数值变量"}

    total = 0
    detail = []
    for col in num_cols[:20]:
        s = df[col].dropna()
        if len(s) < 4:
            continue
        q1, q3 = s.quantile(0.25), s.quantile(0.75)
        iqr = q3 - q1
        if iqr == 0:
            continue
        lower, upper = q1 - 1.5 * iqr, q3 + 3.0 * iqr
        n = int(((s < lower) | (s > upper)).sum())
        if n > 0:
            total += n
            detail.append({"var": col, "n": n})

    pct = round(total / max(len(df), 1) * 100, 1)
    if total == 0:
        return {"label": "优", "note": "未检出离群值", "detail": []}
    elif pct <= 2:
        return {"label": "良", "note": f"{total} 个离群值 ({pct}%)", "detail": detail[:5]}
    elif pct <= 5:
        return {"label": "中", "note": f"{total} 个离群值 ({pct}%)，建议核实", "detail": detail[:5]}
    else:
        return {"label": "差", "note": f"{total} 个离群值 ({pct}%)，建议稳健方法", "detail": detail[:5]}


def _normality_summary(df, num_cols):
    if not num_cols:
        return {"label": "—", "note": "无数值变量", "detail": []}

    normal = 0
    detail = []
    for col in num_cols[:10]:
        s = df[col].dropna()
        if len(s) < 8:
            continue
        ok = _test_normality(s)
        sk = float(s.skew())
        if ok:
            normal += 1
        detail.append({"var": col, "normal": bool(ok), "skew": round(sk, 2)})

    total = len(detail)
    if total == 0:
        return {"label": "—", "note": "样本量不足", "detail": []}

    ratio = normal / total
    if ratio >= 0.8:
        return {"label": "良", "note": f"{normal}/{total} 变量近似正态", "detail": detail}
    elif ratio >= 0.5:
        return {"label": "中", "note": f"{normal}/{total} 变量正态，建议非参数检验", "detail": detail}
    else:
        return {"label": "差", "note": f"仅 {normal}/{total} 正态，推荐非参数方法", "detail": detail}


def _chart_insights(df, chart_type, params):
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()
    n = len(df)

    observations = []
    stats_notes = []
    clinical_note = ""

    # Variable summaries
    for col in num_cols[:3]:
        s = df[col].dropna()
        if len(s):
            observations.append(
                f"{col}: mean={s.mean():.2f}, median={s.median():.2f}, "
                f"SD={s.std():.2f}, range [{s.min():.2f}–{s.max():.2f}]"
            )

    # Chart-specific
    if chart_type in ("scatter", "grouped_scatter"):
        x = params.get("x_var", num_cols[0] if num_cols else "")
        y = params.get("y_var", num_cols[1] if len(num_cols) > 1 else "")
        if x and y and x in df.columns and y in df.columns:
            r = df[[x, y]].corr().iloc[0, 1]
            strength = "强" if abs(r) > 0.7 else "中等" if abs(r) > 0.4 else "弱"
            direction = "正" if r > 0 else "负"
            observations.insert(0, f"{x} 与 {y}: r = {r:.3f}（{strength}{direction}相关）")
            stats_notes.append("相关 ≠ 因果；可能存在混杂因素")

    elif chart_type in ("box", "violin", "box_scatter", "violin_box_scatter", "raincloud", "beanplot", "beeswarm"):
        x_var = params.get("x_var", "")
        y_var = params.get("y_var", num_cols[0] if num_cols else "")
        if x_var and x_var in df.columns:
            groups = sorted(df[x_var].dropna().unique())
            for g in groups[:6]:
                gd = df.loc[df[x_var] == g, y_var].dropna() if y_var in df.columns else pd.Series()
                if len(gd):
                    observations.append(
                        f"{g}: n={len(gd)}, med={gd.median():.2f}, IQR [{gd.quantile(0.25):.2f}–{gd.quantile(0.75):.2f}]"
                    )
            stats_notes.append("组间差异显著性需经 Kruskal-Wallis 或 ANOVA 检验确认")

    elif chart_type in ("bar", "horizontal_bar", "lollipop", "cleveland_dot"):
        if num_cols:
            c = num_cols[0]
            observations.append(f"极差: {df[c].max() - df[c].min():.2f}, CV: {df[c].std() / max(abs(df[c].mean()), 0.001) * 100:.1f}%")

    elif chart_type in ("stacked_bar", "grouped_bar", "percent_stacked_bar"):
        observations.append("各组别构成差异可能反映不同的数据产生机制")

    elif chart_type in ("line", "multi_line", "area"):
        stats_notes.append("注意时序数据的自相关性及季节性影响")

    elif chart_type == "histogram":
        if num_cols:
            s = df[num_cols[0]].dropna()
            sk = float(s.skew())
            desc = "右偏" if sk > 0.5 else "左偏" if sk < -0.5 else "近似对称"
            observations.append(f"偏度 = {sk:.2f}（{desc}）")

    elif chart_type == "correlation_heatmap":
        if len(num_cols) >= 2:
            cm = df[num_cols[:10]].corr()
            strong = []
            for i in range(len(cm.columns)):
                for j in range(i + 1, len(cm.columns)):
                    if abs(cm.iloc[i, j]) > 0.7:
                        strong.append(f"{cm.columns[i]} × {cm.columns[j]}: r={cm.iloc[i, j]:.2f}")
            if strong:
                observations.append("强相关 (|r|>0.7): " + "; ".join(strong[:5]))

    elif chart_type == "forest":
        clinical_note = "置信区间跨越无效线（OR=1 / MD=0）表示效应不显著"

    elif chart_type == "survival":
        clinical_note = "曲线分离程度反映干预对预后的影响强度"

    elif chart_type in ("roc", "multi_roc"):
        stats_notes.append("AUC: <0.6 低, 0.6–0.7 有限, 0.7–0.8 可接受, 0.8–0.9 良好, >0.9 优秀")
        clinical_note = "报告 AUC 及 95%CI，附最佳截断值的灵敏度与特异度"

    elif chart_type == "volcano":
        observations.append("关注远离原点且位于顶部（高显著性）的点——最有意义的差异变量")

    elif chart_type in ("china_map", "world_map", "usa_map", "europe_map", "uk_map"):
        observations.append("注意地理聚集性和空间异质性，可能反映环境或人群特征")

    elif chart_type == "bland_altman":
        stats_notes.append("95% LoA 内点比例越高，方法一致性越好")

    elif chart_type == "calibration_curve":
        clinical_note = "校准良好 = 预测风险与实际发生率一致，临床决策更可靠"

    elif chart_type == "dca":
        clinical_note = "模型曲线高于'全治'和'不治'参照线时，该阈值区间内使用模型有净获益"

    elif chart_type == "nomogram":
        clinical_note = "可依据患者各项指标直接在列线图上读取风险概率"

    elif chart_type == "pca":
        observations.append("观察 PC1/PC2 空间中样本分离程度，分离明显则组间差异显著")

    # Generic fallback
    if not observations:
        observations.append(f"共 {n} 条观测，{len(df.columns)} 个变量（数值 {len(num_cols)}，分类 {len(cat_cols)}）")

    if n < 30:
        stats_notes.append("n<30，推荐精确检验或非参数方法")
    if missing_rate := (df.isnull().sum().sum() / max(n * len(df.columns), 1) * 100):
        if missing_rate > 5:
            stats_notes.append("缺失 > 5%，需说明缺失处理方式")

    return {
        "observations": observations[:8],
        "stats_notes": stats_notes[:4],
        "clinical_note": clinical_note,
    }


def _publication_check(n_rows, missing_rate, outlier_info, num_cols, chart_type):
    score = 100
    issues = []
    tips = []
    strengths = []

    if n_rows < 30:
        score -= 20
        issues.append("样本量偏小")
        tips.append("增大样本量或标记为探索性分析")
    elif n_rows < 60:
        score -= 10
        tips.append("建议报告统计效力分析")
    else:
        strengths.append("样本量满足常规图形展示需求")

    if missing_rate > 10:
        score -= 15
        issues.append("缺失率较高")
        tips.append("详细说明缺失处理（多重插补/完全案例）")
    elif missing_rate > 5:
        score -= 8
        tips.append("说明缺失值处理方法")
    else:
        strengths.append("缺失比例较低，图形完整性较好")

    ol_pct = outlier_info.get("detail", [])
    if outlier_info.get("label") in ("中", "差"):
        score -= 10
        issues.append("离群值偏多")
        tips.append("核实离群值来源，可做敏感性分析")
    else:
        strengths.append("离群值风险较低")

    type_tips = {
        "pie": "类别 > 5 时建议改用柱状图",
        "bar": "Y 轴宜从 0 起，避免视觉误导",
        "forest": "标注效应指标类型及无效线位置",
        "survival": "建议标注风险集数与删失事件",
        "roc": "建议补充 AUC 95%CI 及最佳截断值",
        "calibration_curve": "建议补充 Hosmer-Lemeshow 检验",
        "dca": "标注模型优于参照线的阈值区间",
    }
    if chart_type in type_tips:
        tips.append(type_tips[chart_type])

    if score >= 90:
        level = "符合出版要求"
        grade = "A"
    elif score >= 70:
        level = "基本达标"
        grade = "B"
    else:
        level = "建议改进"
        grade = "C"

    return {
        "score": max(0, score),
        "grade": grade,
        "level": level,
        "issues": issues,
        "tips": tips,
        "strengths": strengths,
    }
