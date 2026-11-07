'use client'
import { useState, useEffect } from 'react'

export default function Fit1Reference() {
  const [open, setOpen] = useState(false)
  const [panelHidden, setPanelHidden] = useState(false)

  useEffect(() => {
    function tryLoad(src: string): Promise<void> {
      return new Promise((resolve, reject) => {
        const img = new window.Image()
        img.onload = () => resolve()
        img.onerror = () => reject()
        img.src = src
      })
    }
    Promise.all([tryLoad('/demo/fit1-comments.png'), tryLoad('/demo/fit1-photo.png')]).catch(() =>
      setPanelHidden(true),
    )
  }, [])

  if (panelHidden) return null

  return (
    <div className="border border-zinc-200 rounded-lg bg-white">
      <button
        className="w-full text-left px-4 py-3 flex items-center justify-between text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        onClick={() => setOpen((o) => !o)}
      >
        <span>
          Fit 1 reference{' '}
          <span className="font-normal text-zinc-400">(senior designer, demo only)</span>
        </span>
        <span className="text-zinc-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <figure className="flex-1 min-w-0">
              <img
                src="/demo/fit1-comments.png"
                alt="Comments from the real fit session"
                className="w-full rounded border border-zinc-100"
              />
              <figcaption className="text-xs text-zinc-400 mt-1">
                Comments from the real fit session
              </figcaption>
            </figure>
            <figure className="flex-1 min-w-0">
              <img
                src="/demo/fit1-photo.png"
                alt="Fit photo from the real fit session"
                className="w-full rounded border border-zinc-100"
              />
              <figcaption className="text-xs text-zinc-400 mt-1">
                Fit photo from the real fit session
              </figcaption>
            </figure>
          </div>
        </div>
      )}
    </div>
  )
}
