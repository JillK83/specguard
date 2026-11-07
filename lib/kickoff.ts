import { readFileSync } from 'fs'
import { join } from 'path'

const CSV_PLACEHOLDER = "csv_text = '''PASTE CSV HERE'''"

export function buildKickoffMessage(csvText: string, agentPrompt: string, productRules: string): string {
  if (!agentPrompt.includes(CSV_PLACEHOLDER)) {
    throw new Error(
      `agent-prompt.md is missing the placeholder line: ${CSV_PLACEHOLDER}`
    )
  }

  const normalizedCsv = csvText.replace(/\r\n/g, '\n')
  const promptWithCsv = agentPrompt.replace(
    CSV_PLACEHOLDER,
    `csv_text = '''\n${normalizedCsv.trim()}\n'''`
  )

  return [
    'TASK: Style 553972 LS Polo, Size M, all units inches.',
    '',
    'AGENT INSTRUCTIONS',
    promptWithCsv.trim(),
    '',
    'PRODUCT RULES',
    productRules.trim(),
    '',
    'SPEC AND MEASUREMENTS (CSV)',
    normalizedCsv.trim(),
    '',
    'Run the audit. Write the log to output/revision_log.md and wait for approval before continuing.',
  ].join('\n')
}

export function loadKickoffMessage(): string {
  const root = process.cwd()

  let csvText: string
  try {
    csvText = readFileSync(join(root, 'data', 'polo_input_size_m.csv'), 'utf-8')
  } catch {
    throw new Error('Missing required file: data/polo_input_size_m.csv')
  }

  let agentPrompt: string
  try {
    agentPrompt = readFileSync(join(root, 'agent-prompt.md'), 'utf-8')
  } catch {
    throw new Error('Missing required file: agent-prompt.md')
  }

  let productRules: string
  try {
    productRules = readFileSync(join(root, 'product-rules.md'), 'utf-8')
  } catch {
    throw new Error('Missing required file: product-rules.md')
  }

  return buildKickoffMessage(csvText, agentPrompt, productRules)
}
