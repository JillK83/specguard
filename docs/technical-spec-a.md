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

Paste this into the agent's instructions (section 2 above). The agent substitutes the polo_input_size_m.csv content into `csv_text` and runs it with exec.

```python
import csv, io
from math import gcd

def frac(x):
    s = round(abs(x) * 16)
    if s == 0:
        return '0'
    sign = '-' if x < 0 else '+'
    whole, rem = divmod(s, 16)
    if rem == 0:
        return sign + str(whole)
    g = gcd(rem, 16)
    f = str(rem // g) + '/' + str(16 // g)
    return sign + (str(whole) + ' ' + f if whole else f)

def status(v, tm, tp):
    e = 1e-9
    if v > tp + e or v < -tm - e:
        return 'FAIL'
    if abs(v - tp) < e or abs(v + tm) < e:
        return 'EDGE'
    return 'PASS'

def run(csv_text):
    rows = csv.DictReader(io.StringIO(csv_text))
    print('code,td_var,td_status,fac_var,fac_status,gap_td_minus_fac,gap_class')
    for r in rows:
        spec = float(r['Spec_M_Original'])
        tm, tp = float(r['Tol_Minus']), float(r['Tol_Plus'])
        td, fac = float(r['TD_Measured']), float(r['Factory_Measured'])
        tv, fv = td - spec, fac - spec
        ts, fs = status(tv, tm, tp), status(fv, tm, tp)
        gap = td - fac
        if abs(gap) < 1e-9:
            cls = 'MATCH'
        elif ts != fs:
            cls = 'CHANGES_STATUS'
        else:
            cls = 'NOISE'
        print(','.join([r['POM_Code'], frac(tv), ts, frac(fv), fs, frac(gap), cls]))

csv_text = '''PASTE CSV HERE'''
run(csv_text)
```

Input CSV uses the real polo_input_size_m.csv headers: `POM_Code`, `Spec_M_Original`, `Tol_Minus`, `Tol_Plus`, `TD_Measured`, `Factory_Measured`. All measurement values are decimals. The sandbox copy (`sandbox/reference_script.py`) reads from disk for local testing; the agent version has the CSV pasted into `csv_text`.

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
