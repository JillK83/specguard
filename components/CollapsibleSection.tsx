'use client'
import { useState } from 'react'

interface Props {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export default function CollapsibleSection({ title, children, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
      <button
        className="w-full text-left px-4 py-3 flex items-center justify-between text-base font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{title}</span>
        <span className="text-zinc-500 dark:text-zinc-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  )
}
