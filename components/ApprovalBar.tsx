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
      <div className="fixed bottom-0 left-0 right-0 bg-emerald-50 border-t border-emerald-200 px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-medium text-emerald-800">Approved ✓</span>
        <span className="text-xs text-emerald-600">demo, nothing is sent</span>
      </div>
    )
  }

  if (state === 'rejected') {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-red-50 border-t border-red-200 px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-medium text-red-800">Rejected ✕</span>
        <span className="text-xs text-red-600">demo, nothing is sent</span>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 shadow-sm">
      {noteOpen && (
        <div className="px-4 pt-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Rejection note (optional)"
            className="w-full border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-zinc-300"
          />
        </div>
      )}
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        <span className="text-sm text-zinc-500 truncate">Revision log — pending approval</span>
        <div className="flex items-center gap-2 shrink-0">
          {noteOpen ? (
            <>
              <button
                onClick={() => {
                  setNoteOpen(false)
                  setNote('')
                }}
                className="text-xs text-zinc-500 px-3 py-1.5 border border-zinc-200 rounded hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onReject(note)
                  setNoteOpen(false)
                }}
                className="text-xs text-white bg-red-600 px-3 py-1.5 rounded hover:bg-red-700"
              >
                Confirm reject
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setNoteOpen(true)}
                className="text-xs text-zinc-600 px-3 py-1.5 border border-zinc-200 rounded hover:bg-zinc-50"
              >
                Reject
              </button>
              <button
                onClick={onApprove}
                className="text-xs text-white bg-zinc-800 px-3 py-1.5 rounded hover:bg-zinc-900"
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
