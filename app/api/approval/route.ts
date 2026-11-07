import { getClient } from '@/lib/zoowork'

interface ApprovalBody {
  agentId: string
  approvalId: string
  decision: 'allow-once' | 'deny'
  sessionId?: string
  note?: string
}

export async function POST(request: Request): Promise<Response> {
  let body: ApprovalBody
  try {
    body = (await request.json()) as ApprovalBody
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { agentId, approvalId, decision, sessionId, note } = body

  if (!agentId || typeof agentId !== 'string') {
    return Response.json({ error: 'agentId required' }, { status: 400 })
  }
  if (!approvalId || typeof approvalId !== 'string') {
    return Response.json({ error: 'approvalId required' }, { status: 400 })
  }
  if (decision !== 'allow-once' && decision !== 'deny') {
    return Response.json({ error: 'decision must be allow-once or deny' }, { status: 400 })
  }

  const zc = getClient()
  try {
    await zc.resolveApproval(agentId, approvalId, { decision })

    if (decision === 'deny' && note && typeof note === 'string' && sessionId && typeof sessionId === 'string') {
      await zc.postEvents(agentId, sessionId, [
        { type: 'user.message', content: note },
      ])
    }

    return Response.json({ ok: true })
  } catch (err: unknown) {
    const e = err as Record<string, unknown>
    return Response.json(
      { error: 'Failed to resolve approval', type: e['type'] ?? 'unknown' },
      { status: 500 }
    )
  }
}
