'use client'
import { useState } from 'react'
import type { FitCommentGroup } from '@/lib/types'

interface Props {
  groups: FitCommentGroup[]
}

export default function FitCommentsPanel({ groups }: Props) {
  const [copied, setCopied] = useState(false)

  function copyComments() {
    const lines: string[] = []
    for (const g of groups) {
      if (g.heading) lines.push(`\n${g.heading}`)
      lines.push(...g.comments)
    }
    navigator.clipboard.writeText(lines.join('\n').trimStart()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="border border-zinc-200 rounded-lg bg-white">
      <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between gap-2">
        <div>
          <span className="text-sm font-semibold text-zinc-800">Fit comments</span>
          <span className="ml-2 text-xs text-zinc-400">Draft for the factory, pending approval</span>
        </div>
        <button
          onClick={copyComments}
          className="shrink-0 text-xs text-zinc-600 border border-zinc-200 rounded px-2 py-1 hover:bg-zinc-50"
        >
          {copied ? 'Copied ✓' : 'Copy comments'}
        </button>
      </div>
      <div className="px-4 py-4 space-y-4">
        {groups.map((g, i) => (
          <div key={i}>
            {g.heading && (
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">{g.heading}</p>
            )}
            <ol className="space-y-1.5">
              {g.comments.map((c, j) => (
                <li key={j} className="text-sm text-zinc-700 leading-relaxed">
                  {c}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  )
}
