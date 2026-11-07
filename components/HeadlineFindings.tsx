interface FindingBlock {
  title: string
  body: string
  tags: string
}

function parseFindings(text: string): FindingBlock[] {
  const blocks: FindingBlock[] = []
  const lines = text.split('\n')
  let current: { title: string; bodyLines: string[]; tags: string } | null = null

  for (const line of lines) {
    const titleMatch = line.match(/^\*\*(.+?)\*\*\s*$/)
    if (titleMatch && !titleMatch[1].startsWith('Tags:')) {
      if (current) {
        blocks.push({ title: current.title, body: current.bodyLines.join('\n').trim(), tags: current.tags })
      }
      current = { title: titleMatch[1], bodyLines: [], tags: '' }
      continue
    }
    const tagsMatch = line.match(/^\*\*Tags:\s*(.+?)\*\*/)
    if (tagsMatch) {
      if (current) current.tags = tagsMatch[1]
      continue
    }
    if (current && line.trim()) {
      current.bodyLines.push(line.trim())
    }
  }
  if (current) {
    blocks.push({ title: current.title, body: current.bodyLines.join('\n').trim(), tags: current.tags })
  }
  return blocks
}

export default function HeadlineFindings({ text }: { text: string }) {
  const findings = parseFindings(text)
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {findings.map((f, i) => (
        <div key={i} className="border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 p-4">
          {f.tags && (
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1 uppercase tracking-wide">{f.tags}</p>
          )}
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{f.title}</h3>
          <p className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">{f.body}</p>
        </div>
      ))}
    </div>
  )
}
