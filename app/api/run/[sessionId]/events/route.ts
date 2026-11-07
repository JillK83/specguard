import { getClient } from '@/lib/zoowork'
import { isRunFinished } from '@zoowork-ai/sdk'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
): Promise<Response> {
  const { sessionId } = await params
  const { searchParams } = new URL(request.url)
  const agentId = searchParams.get('agentId')
  const cursorParam = searchParams.get('cursor')

  if (!agentId) {
    return Response.json({ error: 'agentId query parameter required' }, { status: 400 })
  }

  const zc = getClient()
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const opts: { cursor?: string; signal: AbortSignal } = { signal: request.signal }
        if (cursorParam) opts.cursor = cursorParam

        for await (const ev of zc.streamEvents(agentId, sessionId, opts)) {
          const data = JSON.stringify({
            eventType: ev.eventType,
            payload: ev.payload,
            seq: ev.seq,
            cursor: ev.cursor,
          })
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))

          if (isRunFinished(ev) && ev.payload['status'] !== 'awaiting_approval') {
            break
          }
        }
      } catch (err: unknown) {
        const name = err instanceof Error ? err.name : ''
        if (name !== 'AbortError') {
          const msg = err instanceof Error ? err.message : 'stream error'
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`))
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
