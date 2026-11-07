import { createZooworkClient } from '@zoowork-ai/sdk'

// --- 1. Client + agent + session setup ---

const zc = createZooworkClient()
// API key is read from ZOOWORK_API_KEY; never logged here.

// tool_policy is typed as Record<string, unknown> — the SDK does not name the built-in
// sandbox tool names for file writes or shell commands. The rule vocabulary (match.tool,
// decision) is described only in comments. Using plausible names; verify against
// the deployment's tool manifest before expecting approvals to fire.
const agent = await zc.createAgent({
  resource: {
    name: 'specguard-hello',
    sandbox: { scope: 'agent' },
    tool_policy: {
      rules: [
        { id: 'ask-all', match: { tool: '*' }, action: 'requireApproval' },
      ],
    },
  },
})
console.log('Agent:', agent.agent_id)

await zc.startAgent(agent.agent_id)
await zc.waitUntilRunning(agent.agent_id)
console.log('Agent running.')

// --- 2. First message bundled with session creation ---

const session = await zc.createSession(agent.agent_id, {
  initial_events: [{ type: 'user.message', content: "This is a platform test. Using your sandbox: (1) write and run a Python script that prints 'hello from sandbox' and report the exit code, (2) write /workspace/hello.txt containing 'ok', then (3) list /workspace. Tell me about any step that fails." }],
})
console.log('Session:', session.session_id)

// --- 3–5. Stream, handle approvals, stop on run.finished ---

const ac = new AbortController()
const timer = setTimeout(() => ac.abort(), 3 * 60 * 1000)

try {
  for await (const ev of zc.streamEvents(agent.agent_id, session.session_id, { signal: ac.signal })) {
    if (ev.eventType === 'agent.approval') {
      console.log(`[${ev.eventType}] ${JSON.stringify(ev.payload, null, 2)}`)
    } else {
      const raw = JSON.stringify(ev.payload)
      const display = raw.length > 300 ? raw.slice(0, 300) + '…' : raw
      console.log(`[${ev.eventType}] ${display}`)
    }

    // 4. Approval requested: print full payload, resolve allow-once, print record.
    if (ev.eventType === 'agent.approval' && ev.payload['phase'] === 'requested') {
      console.log('\nApproval requested — full payload:')
      console.log(JSON.stringify(ev.payload, null, 2))

      const approvalId = ev.payload['approvalId'] as string
      const record = await zc.resolveApproval(agent.agent_id, approvalId, {
        decision: 'allow-once',
      })
      console.log('\nApproval resolved:')
      console.log(JSON.stringify(record, null, 2))
    }

    // 5. Stop when run.finished and not still waiting on an approval.
    if (ev.eventType === 'run.finished' && ev.payload['status'] !== 'awaiting_approval') {
      break
    }
  }
} finally {
  clearTimeout(timer)
}
