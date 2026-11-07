'use client'
import { useState } from 'react'
import type { ScriptOutputRow, PomStatus } from '@/lib/types'

function statusLabel(s: PomStatus): string {
  if (s === 'FAIL') return 'FAIL ✕'
  if (s === 'EDGE') return 'EDGE ~'
  return 'PASS ✓'
}

function statusClass(s: PomStatus): string {
  if (s === 'FAIL') return 'text-red-700 bg-red-50 px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap'
  if (s === 'EDGE') return 'text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap'
  return 'text-emerald-700 text-xs font-medium whitespace-nowrap'
}

function isDim(row: ScriptOutputRow): boolean {
  return row.gap_class === 'MATCH' && row.td_status === 'PASS' && row.fac_status === 'PASS'
}

interface Props {
  rows: ScriptOutputRow[]
  noteMap: Map<string, string>
}

export default function FlagTable({ rows, noteMap }: Props) {
  const [showChangedOnly, setShowChangedOnly] = useState(false)
  const [copied, setCopied] = useState(false)

  const displayed = showChangedOnly ? rows.filter((r) => r.gap_class !== 'MATCH') : rows

  function copyTable() {
    const header = ['Code', 'TD variance', 'TD status', 'Factory variance', 'Factory status', 'Note'].join('\t')
    const dataRows = rows.map((r) =>
      [r.code, r.td_var, r.td_status, r.fac_var, r.fac_status, noteMap.get(r.code) ?? ''].join('\t'),
    )
    navigator.clipboard.writeText([header, ...dataRows].join('\n')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="border border-zinc-200 rounded-lg bg-white">
      <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between flex-wrap gap-2">
        <div>
          <span className="text-sm font-semibold text-zinc-800">Flag table</span>
          <span className="ml-2 text-xs text-zinc-400">Calculated by script</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-zinc-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showChangedOnly}
              onChange={(e) => setShowChangedOnly(e.target.checked)}
              className="rounded"
            />
            Show changed rows only
          </label>
          <button
            onClick={copyTable}
            className="text-xs text-zinc-600 border border-zinc-200 rounded px-2 py-1 hover:bg-zinc-50"
          >
            {copied ? 'Copied ✓' : 'Copy table'}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="px-3 py-2 text-left text-zinc-500 font-medium">Code</th>
              <th className="px-3 py-2 text-left text-zinc-500 font-medium">TD variance</th>
              <th className="px-3 py-2 text-left text-zinc-500 font-medium">TD status</th>
              <th className="px-3 py-2 text-left text-zinc-500 font-medium">Factory variance</th>
              <th className="px-3 py-2 text-left text-zinc-500 font-medium">Factory status</th>
              <th className="px-3 py-2 text-left text-zinc-500 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((row) => (
              <tr
                key={row.code}
                className={`border-b border-zinc-50 last:border-0 ${isDim(row) ? 'opacity-35' : ''}`}
              >
                <td className="px-3 py-1.5 font-mono text-zinc-700">{row.code}</td>
                <td className="px-3 py-1.5 font-mono text-zinc-800">{row.td_var}</td>
                <td className="px-3 py-1.5">
                  <span className={statusClass(row.td_status)}>{statusLabel(row.td_status)}</span>
                </td>
                <td className="px-3 py-1.5 font-mono text-zinc-800">{row.fac_var}</td>
                <td className="px-3 py-1.5">
                  <span className={statusClass(row.fac_status)}>{statusLabel(row.fac_status)}</span>
                </td>
                <td className="px-3 py-1.5 text-zinc-500">{noteMap.get(row.code) ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
