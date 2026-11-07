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
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-2">
        <div>
          <span className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Fit comments</span>
          <span className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">Draft for the factory, pending approval</span>
        </div>
        <button
          onClick={copyComments}
          className="shrink-0 text-sm text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        >
          {copied ? 'Copied ✓' : 'Copy comments'}
        </button>
      </div>
      <div className="px-4 py-4 space-y-4">
        {groups.map((g, i) => (
          <div key={i}>
            {g.heading && (
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-400 uppercase tracking-wide mb-2">{g.heading}</p>
            )}
            <ol className="space-y-1.5">
              {g.comments.map((c, j) => (
                <li key={j} className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
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
