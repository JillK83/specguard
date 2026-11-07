'use client'
import { useState, useEffect } from 'react'
import type { ScriptOutputRow, ParsedRevisionLog } from '@/lib/types'
import HeadlineFindings from '@/components/HeadlineFindings'
import FlagTable from '@/components/FlagTable'
import FitCommentsPanel from '@/components/FitCommentsPanel'
import InternalPanel from '@/components/InternalPanel'
import CollapsibleSection from '@/components/CollapsibleSection'
import ApprovalBar from '@/components/ApprovalBar'
import Fit1Reference from '@/components/Fit1Reference'
import MarkdownBody from '@/components/MarkdownBody'

interface DemoData {
  rows: ScriptOutputRow[]
  log: ParsedRevisionLog
}

type ApprovalState = 'pending' | 'approved' | 'rejected'

export default function Home() {
  const [data, setData] = useState<DemoData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [approval, setApproval] = useState<ApprovalState>('pending')

  useEffect(() => {
    fetch('/api/demo')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<DemoData>
      })
      .then((d) => setData(d))
      .catch((e: unknown) => setLoadError(String(e)))
  }, [])

  const noteMap = new Map<string, string>()
  if (data?.log.flagTable) {
    for (const row of data.log.flagTable.rows) {
      if (row[0] !== undefined && row[5] !== undefined) noteMap.set(row[0], row[5])
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">SpecGuard</h1>
            <p className="text-base text-zinc-700 dark:text-zinc-300">Style 553972 LS Polo, Size M</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">Factory column is simulated and illustrative</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-1 rounded font-medium">
              Saved run, recorded 7 Nov 2:19 PM
            </span>
            <button
              disabled
              title="Live mode coming"
              className="text-sm text-zinc-500 dark:text-zinc-500 border border-zinc-300 dark:border-zinc-600 rounded px-3 py-1.5 cursor-not-allowed select-none"
            >
              Run audit (live)
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5 space-y-4">
        {!data && !loadError && (
          <p className="text-base text-zinc-600 dark:text-zinc-400 py-10 text-center">Loading…</p>
        )}
        {loadError && (
          <p className="text-base text-red-600 dark:text-red-400 py-10 text-center">Failed to load: {loadError}</p>
        )}

        {data && (
          <>
            {data.log.headlineFindings && (
              <HeadlineFindings text={data.log.headlineFindings} />
            )}

            <FlagTable rows={data.rows} noteMap={noteMap} />

            {data.log.fitComments && (
              <FitCommentsPanel groups={data.log.fitComments.groups} />
            )}

            {data.log.internalOpenQuestions && (
              <InternalPanel text={data.log.internalOpenQuestions} />
            )}

            {data.log.clusters && (
              <CollapsibleSection title="Clusters">
                <MarkdownBody>{data.log.clusters}</MarkdownBody>
              </CollapsibleSection>
            )}

            {data.log.measurementDisagreements && (
              <CollapsibleSection title="Measurement disagreements">
                <MarkdownBody>{data.log.measurementDisagreements.raw}</MarkdownBody>
              </CollapsibleSection>
            )}

            <Fit1Reference />
          </>
        )}
      </main>

      <ApprovalBar
        state={approval}
        onApprove={() => setApproval('approved')}
        onReject={() => setApproval('rejected')}
      />
    </div>
  )
}
