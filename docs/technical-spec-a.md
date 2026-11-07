# SpecGuard Technical Spec A — Agent Design (Branch A)

This file is the source of truth for the agent. It wins on anything about the agent. ENGINEERING.md covers the web layer and confirmed platform facts.

Style 553972, English Laundry LS Polo, Grindle Jersey, Size M, 22 POMs.

---

## 1. Agent setup

**Model:** To be confirmed with ZooWork staff (default is litellm/gpt-5.6-terra).

**Sandbox:** `scope: 'agent'` so exec and write run in the agent's workspace.

**Approval rules:**

```json
[
  { "id": "allow-exec", "match": { "tool": "exec" }, "action": "allow" },
  { "id": "gate-write", "match": { "tool": "write" }, "action": "requireApproval" }
]
```

Gate only the write of the log. Do not gate exec — it stalls the demo and drops the autonomy metric. The agent must write only `output/revision_log.md`. Warn it in the instructions not to create scratch files with `write`.

---

## 2. Agent instructions (prompt skeleton)

Paste the following into the agent's `instructions` field. The product rules are passed in the kickoff message, not here.

```
You are a technical design assistant auditing a garment sample against its graded spec.

You have access to exec and write.

REFERENCE SCRIPT
Paste the polo_input_size_m.csv data into the DATA constant below, then run the script
with exec. Check that the exit code is 0. Do not modify the script logic. Do not use
write to create scratch files — use exec only. All arithmetic comes from the script,
never from you.

[paste Section 4 script here verbatim]

OUTPUT FORMAT
Write your findings to output/revision_log.md using exactly these six H2 headings, in order:

## Headline findings
## Clusters
## Measurement disagreements
## Fit comments
## Flag table
## Internal open questions

Rules:
- Tag every statement: [Calculated] for script output, [Suspected] for hypotheses, [Needs a human] for anything measurements cannot show.
- Never state a cause as fact. Say what you see, what you suspect, and what a person must verify.
- Fit comments and internal open questions must be in separate sections. Fit comments are safe to send to the factory. Internal open questions are not.
- Flag table: one row per POM, 2 to 3 word note at most.
- Headline findings: exactly three items.
```

---

## 3. Kickoff message layout

This is what `lib/kickoff.ts → buildKickoffMessage()` constructs. The route calls `loadKickoffMessage()`.

```
TASK: Audit Style 553972 LS Polo, Size M. All units inches.

SPEC AND MEASUREMENTS (CSV)
[polo_input_size_m.csv content]

PRODUCT RULES
[product-rules.md content]

Run the reference script from your instructions using exec. Check that the exit code is 0. Using only the script output, group FAIL and EDGE rows into clusters, rank likely causes with the check that would settle each, and draft the revision log. Write the completed log to output/revision_log.md and wait for approval before continuing.
```

---

## 4. Reference script

Paste this into the agent's instructions (section 2 above). The agent substitutes the CSV into the DATA constant and runs it with exec.

```python
#!/usr/bin/env python3
"""SpecGuard reference script. Paste polo_input_size_m.csv content into DATA."""

import csv
from fractions import Fraction
from io import StringIO

# ── PASTE CSV CONTENT HERE ───────────────────────────────────────────────────
DATA = """\
code,description,spec,tol_minus,tol_plus,td_measured,factory_measured
"""
# ─────────────────────────────────────────────────────────────────────────────


def parse_frac(s: str) -> Fraction:
    s = s.strip()
    if not s or s == "0":
        return Fraction(0)
    parts = s.split()
    if len(parts) == 2:
        whole = int(parts[0])
        frac = Fraction(parts[1])
        return Fraction(whole) + (frac if whole >= 0 else -frac)
    return Fraction(parts[0])


def fmt_frac(f: Fraction) -> str:
    if f == 0:
        return "0"
    sign = "+" if f > 0 else "-"
    f_abs = abs(f)
    whole = int(f_abs)
    remainder = f_abs - whole
    if whole and remainder:
        return f"{sign}{whole} {remainder}"
    if whole:
        return f"{sign}{whole}"
    return f"{sign}{remainder}"


def pom_status(var: Fraction, tol_m: Fraction, tol_p: Fraction) -> str:
    if var > tol_p or var < -tol_m:
        return "FAIL"
    if var == tol_p or var == -tol_m:
        return "EDGE"
    return "PASS"


reader = csv.DictReader(StringIO(DATA.strip()))
print("code,td_var,td_status,fac_var,fac_status,gap_td_minus_fac,gap_class")
for row in reader:
    spec = parse_frac(row["spec"])
    tol_m = parse_frac(row["tol_minus"])
    tol_p = parse_frac(row["tol_plus"])
    td = parse_frac(row["td_measured"])
    fac = parse_frac(row["factory_measured"])

    td_var = td - spec
    fac_var = fac - spec
    gap = td_var - fac_var

    td_st = pom_status(td_var, tol_m, tol_p)
    fac_st = pom_status(fac_var, tol_m, tol_p)

    if gap == 0:
        gc = "MATCH"
    elif td_st == fac_st:
        gc = "NOISE"
    else:
        gc = "CHANGES_STATUS"

    print(f"{row['code']},{fmt_frac(td_var)},{td_st},{fmt_frac(fac_var)},{fac_st},{fmt_frac(gap)},{gc}")
```

Input CSV column order: `code, description, spec, tol_minus, tol_plus, td_measured, factory_measured`. All measurement values are fraction strings (`"9 1/2"`, `"1/8"`, `"17"`).

---

## 5. Verification

The TD column should show **9 PASS, 7 EDGE, 6 FAIL**.

| Code | TD variance | TD status | Factory status | Gap class |
|------|-------------|-----------|----------------|-----------|
| NK01 neck width | +1/8 | PASS | EDGE | CHANGES_STATUS |
| NK02 front neck drop | -1/8 | PASS | PASS | NOISE |
| AH01 armhole | -1/4 | EDGE | PASS | CHANGES_STATUS |
| CL03 collar length | +1/4 | EDGE | PASS | CHANGES_STATUS |
| CL04 collar band | +1/2 | FAIL | PASS | CHANGES_STATUS |

Only CL04 flips a true pass/fail. Twenty of 22 rows can be checked against the answer key Variance column. CL03 and CL05 need page 15 of the tech pack. Count causes stated as fact — target is zero.
