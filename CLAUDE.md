# SpecGuard

Hackathon build for the AI Tinkerers NYC Fashion & Finance Hackathon. SpecGuard is a first-pass tech pack and fit auditor that runs on ZooWork Managed Agents. Test case: Style 553972, English Laundry LS polo, grindle jersey, Size M, 22 points of measure. Owner: Jillian, a technical designer by background.

## What it does

One agent, one session per audit. It takes a graded spec, the TD's measurements, and simulated factory measurements. Exact variance math comes from a Python script, not from the model. The agent groups related misses, ranks likely causes with the check that would settle each, says what measurements cannot show, and drafts numbered fit comments plus a flag table. A final write of the revision log needs human approval. The agent never states a cause as fact.

## Rules

- Never print, log, or store ZOOWORK_API_KEY. It lives in my terminal environment only. Keep it out of the agent's sandbox and out of any file.
- ZooWork is a Developer Preview. Read the quickstart in full before writing any ZooWork code. Do not write it from memory.
- Show me a plan and wait for approval before the first request that creates or starts an agent.
- Do not open the answer-key folder or polo_fit1_evaluation.csv. Never put answer-key content, revised specs, or fit comments into the agent's prompt.
- Pass data inline in the session message as text. Do not seed files into the workspace from outside.
- Math is in decimals, written output is in fractions (sixteenths or finer). All units are inches.
- Exactly at tolerance counts as PASS but is flagged EDGE.

## Build branch

Branch A is confirmed. The platform test passed (python3 ran, write and exec were gated and approved, run finished succeeded).

## Layout

- docs/ : technical specs
- prompts/product-rules.md : pasted into the agent's instructions
- data/ : polo_input_size_m.csv, polo_graded_specs_clean.csv
- answer-key/ : off limits to you and to the agent
- visual-reference/ : photo stretch only
