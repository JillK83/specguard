import { createZooworkClient, type AgentResource, type ZooworkClient } from '@zoowork-ai/sdk'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { buildScriptText, loadCsvText, loadKickoffMessage } from './kickoff.js'

const RUNS_DIR = join(process.cwd(), 'runs')

export function getClient(): ZooworkClient {
  return createZooworkClient()
}

export function agentResource(): AgentResource {
  const resource: AgentResource = {
    name: 'specguard',
    sandbox: { scope: 'agent' },
    tool_policy: {
      rules: [
        { id: 'allow-exec', match: { tool: 'exec' }, action: 'allow' },
        { id: 'gate-write', match: { tool: 'write' }, action: 'requireApproval' },
      ],
    },
  }
  const modelEnv = process.env['SPECGUARD_MODEL']
  if (modelEnv) {
    resource.model = { primary: modelEnv }
  }
  return resource
}

export async function ensureAgent(zc: ZooworkClient): Promise<string> {
  const agentJsonPath = join(RUNS_DIR, 'agent.json')
  try {
    const cached = JSON.parse(readFileSync(agentJsonPath, 'utf-8')) as Record<string, unknown>
    if (typeof cached['agentId'] === 'string') return cached['agentId']
  } catch {
    // not cached yet
  }

  const resource = agentResource()
  const agent = await zc.createAgent({ resource })
  await zc.startAgent(agent.agent_id)
  await zc.waitUntilRunning(agent.agent_id)

  mkdirSync(RUNS_DIR, { recursive: true })
  writeFileSync(agentJsonPath, JSON.stringify({ agentId: agent.agent_id }))
  return agent.agent_id
}

export async function uploadScript(agentId: string, zc: ZooworkClient): Promise<void> {
  const result = await zc.uploadFile(agentId, 'input/reference_script.py', buildScriptText(loadCsvText()))
  console.log(`Uploaded: path=${result.path} size=${result.size} sha256=${result.sha256}`)
}

export async function startSession(agentId: string, zc: ZooworkClient): Promise<{ session_id: string }> {
  return await zc.createSession(agentId, {
    initial_events: [{ type: 'user.message', content: loadKickoffMessage() }],
  })
}
