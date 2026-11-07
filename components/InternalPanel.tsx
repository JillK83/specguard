import MarkdownBody from './MarkdownBody'

export default function InternalPanel({ text }: { text: string }) {
  return (
    <div className="border border-amber-200 rounded-lg bg-amber-50">
      <div className="px-4 py-3 border-b border-amber-200 flex items-center gap-2">
        <span className="text-sm font-semibold text-amber-900">Internal open questions</span>
        <span className="text-xs text-amber-600">Internal, not for the factory</span>
      </div>
      <div className="px-4 py-3">
        <MarkdownBody>{text}</MarkdownBody>
      </div>
    </div>
  )
}
