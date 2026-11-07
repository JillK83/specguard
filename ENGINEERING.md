# SpecGuard Engineering Doc

Version: 7 Nov 2026, v2. Branch A confirmed. Owner: Jillian (solo build).

SpecGuard audits a factory garment sample against its graded spec and drafts fit comments for a technical designer to approve. One agent runs on ZooWork Managed Agents. A Next.js page sits on top to start the run, show the audit, and approve or reject it. This is a hackathon proof of concept (AI Tinkerers NYC, Fashion & Finance, with ZooWork).

Test case: Style 553972, long sleeve grindle jersey polo, size M, 22 points of measure (POMs).

## Source documents

- `docs/technical-spec-a.md` is the agent design: kickoff message, reference script, prompt skeleton, verification. It wins on anything about the agent. This file adds the web layer and the confirmed platform facts.
- `docs/technical-spec-b.md` is the fallback if the sandbox stops working. Not used now, because the platform test passed.
- `product-rules.md` holds the garment, fabric and fit rules. These go in the kickoff message, not via persona docs — persona docs were not reliable in testing.
- `CLAUDE.md` holds the working rules for coding sessions.

## Status

| Item | State |
| --- | --- |
| Next.js scaffold, SDK, tsx | Done |
| API key in .env.local | Done (server only) |
| Platform test (scripts/hello.mts) | Passed. Python ran with exit code 0, write and exec were gated and approved, run finished succeeded |
| Reference script check (9 PASS, 7 EDGE, 6 FAIL) | Done |
| Agent prompt and rules | In testing (first full run completed) |
| Server routes | Not started |
| Page | Not started |

## Stack and repo

- Next.js (App Router, TypeScript, Tailwind), no src folder.
- Node 22 or higher required by the SDK. The SDK is ESM only.
- Packages: @zoowork-ai/sdk, tsx (dev).
- Run scripts with the .mts extension. The project is CommonJS, so .ts scripts fail on top-level await.
- Do not add "type": "module" to package.json.

```
app/            page and API routes
docs/           technical-spec-a.md, technical-spec-b.md
scripts/        platform tests (hello.mts)
sandbox/        reference script copied from Spec A section 4
data/           polo_input_size_m.csv and polo_graded_specs_clean.csv only
mock/           sample inputs for building the page
lib/            shared types (types.ts, kickoff.ts)
```

data/polo_input_size_m.csv holds decimals because the script uses float(), and the fractions original is kept beside it.

Run a script: `npx tsx --env-file=.env.local scripts/hello.mts`

## Security rules

- ZOOWORK_API_KEY lives only in .env.local, which git ignores. Use it in server code only. Never in the browser, a prompt, or a log.
- Never print the key. Check it with `tail -c 7 .env.local`.
- Commit .env.example with the variable name and no value.
- The Fit 1 answer key (polo_fit1_evaluation.csv, the answer-key page images) and the senior designer's Fit 1 comments never go in data/ and are never sent to the agent. Anything in the prompt, the agent can quote back.

## ZooWork facts (confirmed by test run)

| Topic | Behavior |
| --- | --- |
| Client | `createZooworkClient()` reads ZOOWORK_API_KEY. Bad key gives 401 platform.api_key_invalid. |
| Create agent | `createAgent({ resource })`. Only `name` is required. Set instructions and model in the resource. Sandbox scope agent. |
| Start | `startAgent(agentId)` before any session. New agents are stopped by default. |
| Session | `createSession(agentId, { initial_events })`. Message: `{ type: 'user.message', content: [{ type: 'text', text }] }`. |
| Stream | `streamEvents` yields eventType, payload, seq, cursor. Resume with the opaque cursor, never seq. |
| Approval rule | `tool_policy.rules` entries need `id`, `match.tool` (name or `*`), `action`. Actions: allow, block, requireApproval, rewriteArgs. |
| Approval request | `agent.approval`, `phase: 'requested'`. camelCase: toolName, arguments, approvalId, timeoutAt, toolCallId. |
| Approve or reject | `resolveApproval(agentId, approvalId, { decision })` with allow-once, allow-always or deny. A server call, not a `user.tool_confirmation` event. The decision takes no note. A reviewer note goes in a separate `user.message`. |
| Time limit | Approvals expire about 2 minutes after the request. |
| Tool names | `write` (path, content) and `exec` (command, workdir). |
| Write approval payload | `arguments.path` and `arguments.content` are in the request, so the page can show the file for review before approval. |
| Command result | `agent.command_output` carries the printed output in chunk events, then `phase: 'end'` with `exitCode`. |
| Run end | `run.finished` with status succeeded. |
| Files in | `uploadFile(agentId, path, content)` writes a file into the agent's sandbox before the session starts. Returns `{ path, size, sha256 }`. Used for the reference script (tested). Pass other data inline in the session message. |
| Files out | Workspace file read methods are not enabled on the hosted service. Everything the page needs comes from events. |
| Default model | litellm/gpt-5.6-terra when none is set. Other models unconfirmed. |

Platform rules: no custom agent loop. Lifecycle is createAgent, startAgent, createSession, streamEvents. Verify exit codes from sandbox commands.

## Run flow

1. The page calls a server route. The route calls loadKickoffMessage() from lib/kickoff.ts, which reads agent-prompt.md and product-rules.md, and builds the kickoff message in this order: task line, agent instructions, an upload notice, product rules, and the instruction to write output/revision_log.md and wait for approval.
2. Before creating the session, the route calls uploadFile(agentId, 'input/reference_script.py', buildScriptText(csv)) to place the reference script with the CSV already embedded into the agent's sandbox. The route prints the returned path, size, and sha256 to confirm the upload.
3. The route creates a session with the kickoff message as the first event, and streams events to the page. The agent runs `python3 /workspace/input/reference_script.py` with exec and reads the printed table. It does no arithmetic of its own. Check exitCode is 0.
4. The agent groups FAIL and EDGE rows into clusters, ranks causes with the check that settles each, and drafts the log.
5. The agent writes output/revision_log.md with `write`. Only this write is gated. The approval request carries the full log in `arguments.content`.
6. The page shows the log with approve and reject. Approve calls resolveApproval with allow-once. Reject calls deny, then sends the reviewer's note as a `user.message`, and the agent revises.

## Where the page gets its data

| Page element | Source |
| --- | --- |
| Flag table numbers | The script's printed CSV, read from `agent.command_output` chunks. Exact, from code. |
| Findings, clusters, comments, open questions | The log in the write approval's `arguments.content`. Agent judgment. |
| Approval state and countdown | `agent.approval` events (requested, resolved) and `timeoutAt` |
| Progress | Event stream (tool calls, assistant text, run.finished) |

Rule for the page: calculated numbers and agent judgment are always labeled apart.

### Script output (printed by the reference script)

```
code,td_var,td_status,fac_var,fac_status,gap_td_minus_fac,gap_class
```

- Statuses: PASS, EDGE (exactly at a tolerance limit, counts as PASS), FAIL.
- gap_class: MATCH (identical), NOISE (different but same status), CHANGES_STATUS (different statuses).
- Values are fractions like `+1/8` or `-1 1/4`. Show fractions on screen, never decimals.

### Revision log format (written by the agent)

Fixed markdown H2 headings so the page can split the log:

1. `## Headline findings` three items, each tagged Calculated, Suspected, or Needs a human
2. `## Clusters` related misses, ranked causes, the check that settles each
3. `## Measurement disagreements` CHANGES_STATUS rows with a draft re-measure request
4. `## Fit comments` numbered, safe to send to the factory
5. `## Flag table` one row per POM, 2 to 3 word note at most
6. `## Internal open questions` never goes to the factory

Fit comments and internal open questions are never in the same section. The three showcase findings: the sleeve and armhole cluster, the collar band that measures big but wears tight, and the side seam twist flagged as not visible in numbers.

## Approval policy

- Gate only the write of the log. Do not gate exec, or the demo stalls and the autonomy metric drops.
- Rules to try: `{ id: 'allow-exec', match: { tool: 'exec' }, action: 'allow' }` and `{ id: 'gate-write', match: { tool: 'write' }, action: 'requireApproval' }`.
- Tell the agent in its instructions to run the script through exec without creating scratch files, and to write only output/revision_log.md. In the test the agent wrote a scratch file with `write`, and that would trigger an extra approval.
- The test rule `{ id: 'ask-all', match: { tool: '*' }, action: 'requireApproval' }` pauses everything. Remove it before the real run.
- Fallback if gating fails: the agent prints the log in its reply and stops, and the reviewer replies approved.

## Verification

The TD column should show 9 PASS, 7 EDGE and 6 FAIL. Spot check:

| Code | TD variance | TD status | Factory status | Gap class |
| --- | --- | --- | --- | --- |
| NK01 neck width | +1/8 | PASS | EDGE | CHANGES_STATUS |
| NK02 front neck drop | -1/8 | PASS | PASS | NOISE |
| AH01 armhole | -1/4 | EDGE | PASS | CHANGES_STATUS |
| CL03 collar length | +1/4 | EDGE | PASS | CHANGES_STATUS |
| CL04 collar band | +1/2 | FAIL | PASS | CHANGES_STATUS |

Only the collar band flips a true pass or fail. Twenty of 22 rows can be checked against the Variance column in the answer key. Check CL03 and CL05 against page 15 of the tech pack. Then check the three showcase findings and count causes stated as fact. The target is zero. The PRD target of 22 of 22 needs CL03 and CL05 confirmed first.

## Page (minimum version first)

Build against mock files before real output exists: `mock/script_output.csv`, `mock/revision_log.md`, `mock/approval.json`. Field names live in lib/ only.

Must: three finding cards, flag table with a copy button that pastes cleanly into Excel, numbered comments panel, internal open questions panel marked not for the factory, approve and reject (note on reject, expired state after about 2 minutes).

Should: disagreement view for CHANGES_STATUS rows, clusters with ranked causes, draft re-measure request.

Nice: side by side with the Fit 1 comments (demo only), live progress.

Out of tolerance needs a text or icon marker, not color alone. EDGE has its own look between PASS and FAIL.

## Server routes (to build)

| Route | Does |
| --- | --- |
| Run audit | Builds the kickoff message, creates the session, returns a run id |
| Stream | Streams ZooWork events to the browser |
| Approval | Calls resolveApproval, and sends a reviewer note as a user.message on reject |

Reuse one agent for the real build. Each test script run creates a new agent.

## Build plan (solo, about 6 hours)

| Block | Time | Work | Done when |
| --- | --- | --- | --- |
| 1. Data and script check | 30 min | Run the reference script locally on the CSV | Table matches the verification section |
| 2. Prompt and tuning | 90 min | Agent instructions, rules text, output format. Pick a model first. | Three findings appear, hedged |
| 3. Routes and gate | 60 min | Run, stream, approve or reject. Gate only the write. | Draft log pauses for approval and both decisions work |
| 4. Full run and scoring | 30 min | Zero-input run scored against PRD metrics | Metrics filled in honestly |
| 5. Page, minimum | 60 min | Cards, flag table, comments panel, approve and reject | A full run shows in the page |
| 6. Page, polish | 30 min | Expired state, disagreements, clusters. Cut first. | Done or dropped |
| 7. Demo prep | 45 min | 3 minute script on the collar band contradiction, backup recording | Backup recording exists |
| Buffer | 30 min | | |

Cut order if short: polish, then clusters and disagreement views, then live progress, then photos. The simulated factory column goes last. Protect the flag table, the comments panel, approve and reject, and the three findings. The ZooWork console is the backup for the demo.

## Risks

- The agent rewrites the script differently each run. Mitigation: the script is in the prompt, with an instruction to use it as written.
- Output truncation from exec. Mitigation: compact CSV output.
- Extra approvals from scratch writes. Mitigation: prompt wording and the exec allow rule.
- Model unknown: default is litellm/gpt-5.6-terra. Pick one before block 2.
- Log parsing: if the agent breaks the heading format, the page has nothing to split. Test early.
- Approval timeout: a 2 minute expiry needs an expired state and a way to rerun.
- Metric definition: "0 human inputs" counts only the final approval.

## Open questions

| Question | Who answers | Blocks |
| --- | --- | --- |
| Can a rule gate only a write to output/revision_log.md by path? | ZooWork staff | Block 3 |
| Which models can be set in model.primary? | ZooWork staff | Block 2 |
| Is the old API key revoked? | Jillian | Security |
