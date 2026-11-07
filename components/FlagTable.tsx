'use client'
import { useState } from 'react'
import type { ScriptOutputRow, PomStatus } from '@/lib/types'

function statusLabel(s: PomStatus): string {
  if (s === 'FAIL') return 'FAIL ✕'
  if (s === 'EDGE') return 'EDGE ~'
  return 'PASS ✓'
}

function statusClass(s: PomStatus): string {
  if (s === 'FAIL')
    return 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900 px-1.5 py-0.5 rounded text-sm font-medium whitespace-nowrap'
  if (s === 'EDGE')
    return 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-900 px-1.5 py-0.5 rounded text-sm font-medium whitespace-nowrap'
  return 'text-emerald-700 dark:text-emerald-400 text-sm font-medium whitespace-nowrap'
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
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between flex-wrap gap-2">
        <div>
          <span className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Flag table</span>
          <span className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">Calculated by script</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
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
            className="text-sm text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            {copied ? 'Copied ✓' : 'Copy table'}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
              <th className="px-3 py-2 text-left text-zinc-700 dark:text-zinc-300 font-medium">Code</th>
              <th className="px-3 py-2 text-left text-zinc-700 dark:text-zinc-300 font-medium">TD variance</th>
              <th className="px-3 py-2 text-left text-zinc-700 dark:text-zinc-300 font-medium">TD status</th>
              <th className="px-3 py-2 text-left text-zinc-700 dark:text-zinc-300 font-medium">Factory variance</th>
              <th className="px-3 py-2 text-left text-zinc-700 dark:text-zinc-300 font-medium">Factory status</th>
              <th className="px-3 py-2 text-left text-zinc-700 dark:text-zinc-300 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((row) => {
              const dim = isDim(row)
              return (
                <tr
                  key={row.code}
                  className="border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                >
                  <td className={`px-3 py-2 font-mono ${dim ? 'text-zinc-500 dark:text-zinc-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
                    {row.code}
                  </td>
                  <td className={`px-3 py-2 font-mono ${dim ? 'text-zinc-500 dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-200'}`}>
                    {row.td_var}
                  </td>
                  <td className="px-3 py-2">
                    <span className={statusClass(row.td_status)}>{statusLabel(row.td_status)}</span>
                  </td>
                  <td className={`px-3 py-2 font-mono ${dim ? 'text-zinc-500 dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-200'}`}>
                    {row.fac_var}
                  </td>
                  <td className="px-3 py-2">
                    <span className={statusClass(row.fac_status)}>{statusLabel(row.fac_status)}</span>
                  </td>
                  <td className={`px-3 py-2 ${dim ? 'text-zinc-500 dark:text-zinc-500' : 'text-zinc-600 dark:text-zinc-400'}`}>
                    {noteMap.get(row.code) ?? ''}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
