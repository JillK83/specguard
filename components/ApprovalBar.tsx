'use client'
import { useState } from 'react'

type ApprovalState = 'pending' | 'approved' | 'rejected'

interface Props {
  state: ApprovalState
  onApprove: () => void
  onReject: (note: string) => void
}

export default function ApprovalBar({ state, onApprove, onReject }: Props) {
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState('')

  if (state === 'approved') {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-emerald-50 dark:bg-emerald-950 border-t border-emerald-300 dark:border-emerald-800 px-4 py-3 flex items-center justify-between">
        <span className="text-base font-medium text-emerald-800 dark:text-emerald-300">Approved ✓</span>
        <span className="text-sm text-emerald-700 dark:text-emerald-400">demo, nothing is sent</span>
      </div>
    )
  }

  if (state === 'rejected') {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-red-50 dark:bg-red-950 border-t border-red-300 dark:border-red-800 px-4 py-3 flex items-center justify-between">
        <span className="text-base font-medium text-red-800 dark:text-red-300">Rejected ✕</span>
        <span className="text-sm text-red-700 dark:text-red-400">demo, nothing is sent</span>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-700 shadow-sm">
      {noteOpen && (
        <div className="px-4 pt-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Rejection note (optional)"
            className="w-full border border-zinc-300 dark:border-zinc-600 rounded px-3 py-2 text-base text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
          />
        </div>
      )}
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        <span className="text-base text-zinc-700 dark:text-zinc-300 truncate">Revision log — pending approval</span>
        <div className="flex items-center gap-2 shrink-0">
          {noteOpen ? (
            <>
              <button
                onClick={() => {
                  setNoteOpen(false)
                  setNote('')
                }}
                className="text-sm text-zinc-700 dark:text-zinc-300 px-3 py-1.5 border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onReject(note)
                  setNoteOpen(false)
                }}
                className="text-sm text-white bg-red-600 dark:bg-red-700 px-3 py-1.5 rounded hover:bg-red-700 dark:hover:bg-red-600"
              >
                Confirm reject
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setNoteOpen(true)}
                className="text-sm text-zinc-700 dark:text-zinc-300 px-3 py-1.5 border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Reject
              </button>
              <button
                onClick={onApprove}
                className="text-sm text-white bg-zinc-800 dark:bg-zinc-200 dark:text-zinc-900 px-3 py-1.5 rounded hover:bg-zinc-700 dark:hover:bg-zinc-300"
              >
                Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
