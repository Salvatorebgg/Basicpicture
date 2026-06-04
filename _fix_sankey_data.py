import re

spath = r"D:\BaiduSyncdisk\document\workdocument\task\绔欑偣鎼缓\涓村簥\宸ュ叿\tongjifangan\Basicpicture\app\services\sample_service.py"
with open(spath, "r", encoding="utf-8") as f:
    content = f.read()

# Find and replace the entire sankey function
old_func_start = content.find('def make_sankey_example()')
# Find the start of next function after sankey
next_func = content.find('\ndef make_funnel_example', old_func_start)
old_func = content[old_func_start:next_func]

new_func = """def make_sankey_example():
    \"\"\"Generate rich sankey diagram with strong cross-weaving treatment pathway flows.\"\"\"
    sources = [
        "Screening", "Screening", "Screening",
        "Eligible", "Eligible", "Eligible", "Eligible", "Eligible",
        "Arm-A", "Arm-A", "Arm-A", "Arm-A",
        "Arm-B", "Arm-B", "Arm-B", "Arm-B",
        "Arm-C", "Arm-C", "Arm-C",
        "CR-A", "CR-A", "PR-A", "PR-A", "SD-A", "PD-A",
        "CR-B", "CR-B", "PR-B", "PR-B", "SD-B", "PD-B",
        "CR-C", "CR-C", "PR-C", "PR-C",
        "Survival-A", "Survival-A", "Death-A",
        "Survival-B", "Survival-B", "Death-B",
        "Survival-C", "Survival-C", "Death-C",
        "Recurrence", "Recurrence", "NED",
        "Alive", "Alive", "Deceased",
    ]
    targets = [
        "Eligible", "Screen-Fail", "Pending",
        "Arm-A", "Arm-B", "Arm-C", "Declined", "Lost-FU",
        "CR-A", "PR-A", "SD-A", "PD-A",
        "CR-B", "PR-B", "SD-B", "PD-B",
        "CR-C", "PR-C", "SD-C",
        "Survival-A", "Death-A", "Survival-A", "Death-A", "Survival-A", "Death-A",
        "Survival-B", "Death-B", "Survival-B", "Death-B", "Survival-B", "Death-B",
        "Survival-C", "Death-C", "Survival-C", "Death-C",
        "Alive", "Deceased", "Alive",
        "NED", "Recurrence", "Deceased",
    ]
    values = [
        500, 180, 60,
        220, 190, 140, 35, 25,
        140, 60, 55, 25,
        130, 50, 42, 28,
        95, 40, 35,
        80, 30, 35, 18, 12, 10,
        72, 28, 28, 14, 10, 8,
        50, 22, 22, 12,
        100, 60, 40,
        92, 52, 38,
        64, 38, 26,
        85, 40, 55,
        90, 95, 55,
    ]
    return pd.DataFrame({"source": sources, "target": targets, "value": values})
"""

content = content.replace(old_func, new_func)
with open(spath, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
