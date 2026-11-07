import { getClient, ensureAgent, uploadScript, startSession } from '@/lib/zoowork'

export async function POST(): Promise<Response> {
  const zc = getClient()
  try {
    const agentId = await ensureAgent(zc)
    await uploadScript(agentId, zc)
    const session = await startSession(agentId, zc)
    return Response.json({ agentId, sessionId: session.session_id })
  } catch (err: unknown) {
    const e = err as Record<string, unknown>
    return Response.json(
      { error: 'Failed to start audit run', type: e['type'] ?? 'unknown' },
      { status: 500 }
    )
  }
}
