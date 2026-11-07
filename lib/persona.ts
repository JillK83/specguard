import { readFileSync } from 'fs'
import { join } from 'path'

export function loadPersonaDocs(): { name: string; content: string }[] {
  const root = process.cwd()
  return [
    {
      name: 'agent-instructions',
      content: readFileSync(join(root, 'agent-prompt.md'), 'utf-8'),
    },
    {
      name: 'product-rules',
      content: readFileSync(join(root, 'product-rules.md'), 'utf-8'),
    },
  ]
}
