import MarkdownBody from './MarkdownBody'

export default function InternalPanel({ text }: { text: string }) {
  return (
    <div className="border border-amber-300 dark:border-amber-800 rounded-lg bg-amber-50 dark:bg-amber-950">
      <div className="px-4 py-3 border-b border-amber-300 dark:border-amber-800 flex items-center gap-2">
        <span className="text-base font-semibold text-amber-900 dark:text-amber-200">Internal open questions</span>
        <span className="text-sm text-amber-800 dark:text-amber-400">Internal, not for the factory</span>
      </div>
      <div className="px-4 py-3">
        <MarkdownBody>{text}</MarkdownBody>
      </div>
    </div>
  )
}
