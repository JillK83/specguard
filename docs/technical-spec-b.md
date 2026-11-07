# SpecGuard Technical Spec B — Fallback (No Sandbox Python)

**Status: Not in use.** Branch A is confirmed. Use this only if the ZooWork sandbox stops running Python.

---

## Fallback approach

If `exec` stops running Python in the sandbox, the math cannot come from the agent. Fallback: run the reference script locally before starting the agent, pass the computed output inline in the kickoff message.

**Changes from Branch A:**

1. Run `sandbox/reference_script.py` locally on `data/polo_input_size_m.csv` before calling the server route.
2. Write the script output to a temp file (not committed).
3. The server route reads the pre-computed CSV and embeds it in the kickoff message under `SCRIPT OUTPUT (CSV)` instead of `SPEC AND MEASUREMENTS (CSV)`.
4. Remove the exec instruction from the kickoff message. The agent works from the provided output directly.
5. The approval gate on `write` stays the same.

**Tradeoffs:**
- The agent never runs the script itself, so the autonomy metric drops.
- The ZooWork console backup is more important for the demo.
- The page build and approval flow are identical.
