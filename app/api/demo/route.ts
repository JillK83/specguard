import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { parseScriptOutput, splitRevisionLog } from '@/lib/parse'

export async function GET(): Promise<Response> {
  const scriptText = readFileSync(join(process.cwd(), 'mock/script_output.real.txt'), 'utf-8')
  const logText = readFileSync(join(process.cwd(), 'mock/revision_log.real.md'), 'utf-8')
  const rows = parseScriptOutput(scriptText)
  const log = splitRevisionLog(logText)
  return NextResponse.json({ rows, log })
}
