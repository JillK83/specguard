'use client'
import { useState, useEffect } from 'react'

const IMAGES = [
  {
    src: '/demo/fit1-photo.png',
    alt: 'Fit photos from the real fit session',
    caption: 'Fit photos from the real fit session',
  },
  {
    src: '/demo/fit1-photo-2.png',
    alt: 'Fit photos from the real fit session',
    caption: 'Fit photos from the real fit session',
  },
  {
    src: '/demo/fit1-comments.png',
    alt: 'Comments from the real fit session',
    caption: 'Comments from the real fit session',
  },
]

export default function Fit1Reference() {
  const [open, setOpen] = useState(false)
  const [ok, setOk] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(IMAGES.map((img) => [img.src, true])),
  )
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    let pending = IMAGES.length
    function done() {
      pending -= 1
      if (pending === 0) setResolved(true)
    }
    for (const { src } of IMAGES) {
      const el = new window.Image()
      el.onload = () => done()
      el.onerror = () => {
        setOk((prev) => ({ ...prev, [src]: false }))
        done()
      }
      el.src = src
    }
  }, [])

  const visible = IMAGES.filter((img) => ok[img.src])

  if (resolved && visible.length === 0) return null

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
      <button
        className="w-full text-left px-4 py-3 flex items-center justify-between text-base font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        onClick={() => setOpen((o) => !o)}
      >
        <span>
          Fit 1 reference{' '}
          <span className="font-normal text-zinc-500 dark:text-zinc-400">(senior designer, demo only)</span>
        </span>
        <span className="text-zinc-500 dark:text-zinc-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>
      {open && visible.length > 0 && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {visible.map((f) => (
              <figure key={f.src} className="min-w-0">
                <a href={f.src} target="_blank" rel="noopener noreferrer" className="block">
                  <img
                    src={f.src}
                    alt={f.alt}
                    className="w-full rounded border border-zinc-200 dark:border-zinc-700 hover:opacity-90 transition-opacity"
                  />
                </a>
                <figcaption className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{f.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
