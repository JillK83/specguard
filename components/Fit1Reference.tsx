'use client'
import { useState, useEffect } from 'react'

export default function Fit1Reference() {
  const [open, setOpen] = useState(false)
  const [commentsOk, setCommentsOk] = useState(true)
  const [photoOk, setPhotoOk] = useState(true)
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    let pending = 2
    function done() {
      pending -= 1
      if (pending === 0) setResolved(true)
    }
    function tryLoad(src: string, onOk: () => void, onFail: () => void) {
      const img = new window.Image()
      img.onload = () => { onOk(); done() }
      img.onerror = () => { onFail(); done() }
      img.src = src
    }
    tryLoad('/demo/fit1-comments.png', () => setCommentsOk(true), () => setCommentsOk(false))
    tryLoad('/demo/fit1-photo.png', () => setPhotoOk(true), () => setPhotoOk(false))
  }, [])

  // Hide panel only once both results are known and both failed
  if (resolved && !commentsOk && !photoOk) return null

  const figures: { src: string; alt: string; caption: string }[] = []
  if (commentsOk) {
    figures.push({
      src: '/demo/fit1-comments.png',
      alt: 'Comments from the real fit session',
      caption: 'Comments from the real fit session',
    })
  }
  if (photoOk) {
    figures.push({
      src: '/demo/fit1-photo.png',
      alt: 'Fit photo from the real fit session',
      caption: 'Fit photo from the real fit session',
    })
  }

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
      {open && figures.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {figures.map((f) => (
              <figure key={f.src} className="flex-1 min-w-0">
                <img
                  src={f.src}
                  alt={f.alt}
                  className="w-full rounded border border-zinc-100"
                />
                <figcaption className="text-xs text-zinc-400 mt-1">{f.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
