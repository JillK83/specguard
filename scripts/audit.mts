import { isRunFinished } from '@zoowork-ai/sdk'
import { mkdirSync, appendFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { createInterface } from 'readline'
import { getClient, ensureAgent, uploadScript, startSession } from '../lib/zoowork.js'

const RUNS_DIR = join(process.cwd(), 'runs')
const TIMEOUT_MS = 5 * 60 * 1000
const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

function ensureRunsDir(): void {
  mkdirSync(RUNS_DIR, { recursive: true })
}

function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

function truncate(s: string, max = 300): string {
  return s.length > max ? s.slice(0, max) + '…' : s
}

ensureRunsDir()

const zc = getClient()

console.log('Creating or reusing agent...')
const agentId = await ensureAgent(zc)
console.log('Agent:', agentId)

console.log('Uploading reference script...')
try {
  await uploadScript(agentId, zc)
} catch (err: unknown) {
  const e = err as Record<string, unknown>
  console.error('uploadFile failed:')
  console.error(`  status : ${e['status'] ?? '?'}`)
  console.error(`  type   : ${e['type'] ?? '?'}`)
  console.error(`  message: ${e['message'] ?? '?'}`)
  process.exit(1)
}

const session = await startSession(agentId, zc)
console.log('Session:', session.session_id)

const scriptOutputPath = join(RUNS_DIR, `script_output.${timestamp}.txt`)

const ac = new AbortController()
const timer = setTimeout(() => {
  console.error('\nTIMEOUT: 5 minutes elapsed.')
  ac.abort()
}, TIMEOUT_MS)

try {
  for await (const ev of zc.streamEvents(agentId, session.session_id, { signal: ac.signal })) {
    const raw = JSON.stringify(ev.payload)
    console.log(`[${ev.eventType}] ${truncate(raw)}`)

    if (ev.eventType === 'agent.command_output') {
      if (ev.payload['phase'] === 'delta') {
        const chunk = ev.payload['chunk']
        if (typeof chunk === 'string') {
          appendFileSync(scriptOutputPath, chunk)
        }
      } else if (ev.payload['phase'] === 'end') {
        console.log(`[exec] exit code: ${ev.payload['exitCode'] ?? '?'}`)
      }
    }

    if (ev.eventType === 'agent.approval' && ev.payload['phase'] === 'requested') {
      const toolName =
        typeof ev.payload['toolName'] === 'string' ? ev.payload['toolName'] : '(unknown)'
      const approvalId =
        typeof ev.payload['approvalId'] === 'string' ? ev.payload['approvalId'] : ''
      const args =
        ev.payload['arguments'] !== null && typeof ev.payload['arguments'] === 'object'
          ? (ev.payload['arguments'] as Record<string, unknown>)
          : {}

      if (toolName !== 'write') {
        console.log('\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
        console.log(`WARNING: approval for unexpected tool: ${toolName}`)
        console.log('arguments:', JSON.stringify(args, null, 2))
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n')
      }

      console.log(`\n[APPROVAL] tool: ${toolName}`)
      if (args['path'] !== undefined) console.log(`path: ${args['path']}`)

      if (typeof args['content'] === 'string') {
        const lines = args['content'].split('\n')
        console.log('\n--- first 40 lines ---')
        console.log(lines.slice(0, 40).join('\n'))
        if (lines.length > 40) console.log(`... (${lines.length - 40} more lines)`)
        console.log('--- end preview ---\n')

        const logPath = join(RUNS_DIR, `revision_log.${timestamp}.md`)
        writeFileSync(logPath, args['content'])
        console.log(`Full log saved: ${logPath}`)
      }

      if (!approvalId) {
        console.error('No approvalId in payload — cannot resolve.')
        continue
      }

      const answer = await ask('approve? (y/n): ')
      if (answer.toLowerCase() === 'y') {
        await zc.resolveApproval(agentId, approvalId, { decision: 'allow-once' })
        console.log('Approved.')
      } else {
        await zc.resolveApproval(agentId, approvalId, { decision: 'deny' })
        const note = await ask('Rejection note: ')
        if (note) {
          await zc.postEvents(agentId, session.session_id, [
            { type: 'user.message', content: note },
          ])
          console.log('Rejection note sent. Agent will revise.')
        }
      }
    }

    if (isRunFinished(ev) && ev.payload['status'] !== 'awaiting_approval') {
      console.log(`\nRun finished: ${ev.payload['status']}`)
      break
    }
  }
} catch (err: unknown) {
  const name = err instanceof Error ? err.name : ''
  if (name === 'AbortError') {
    console.error('Stream aborted (timeout).')
  } else {
    throw err
  }
} finally {
  clearTimeout(timer)
}
