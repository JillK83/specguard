'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function MarkdownBody({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="text-base text-zinc-700 dark:text-zinc-300 mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-zinc-800 dark:text-zinc-200">{children}</strong>,
        li: ({ children }) => <li className="text-base text-zinc-700 dark:text-zinc-300 mb-0.5">{children}</li>,
        ul: ({ children }) => <ul className="list-disc pl-5 mb-2 last:mb-0">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 last:mb-0">{children}</ol>,
        h3: ({ children }) => (
          <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mt-3 mb-1 first:mt-0">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mt-2 mb-1">{children}</h4>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto mb-2">
            <table className="w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-zinc-50 dark:bg-zinc-800">{children}</thead>,
        th: ({ children }) => (
          <th className="text-left px-2 py-1.5 border border-zinc-200 dark:border-zinc-700 font-medium text-zinc-700 dark:text-zinc-300">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-2 py-1.5 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">{children}</td>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  )
}
