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
        <div key={i} className="border border-zinc-200 rounded-lg bg-white p-4">
          {f.tags && (
            <p className="text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wide">{f.tags}</p>
          )}
          <h3 className="text-sm font-semibold text-zinc-900 mb-2">{f.title}</h3>
          <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">{f.body}</p>
        </div>
      ))}
    </div>
  )
}
