import { readFileSync } from 'fs'
import { join } from 'path'

const SCRIPT_PLACEHOLDER = "csv_text = '''PASTE CSV HERE'''"

export function buildScriptText(csvText: string): string {
  const root = process.cwd()
  let template: string
  try {
    template = readFileSync(join(root, 'sandbox', 'reference_script.template.py'), 'utf-8')
  } catch {
    throw new Error('Missing required file: sandbox/reference_script.template.py')
  }
  if (!template.includes(SCRIPT_PLACEHOLDER)) {
    throw new Error(
      `sandbox/reference_script.template.py is missing the placeholder line: ${SCRIPT_PLACEHOLDER}`
    )
  }
  const normalizedCsv = csvText.replace(/\r\n/g, '\n').trim()
  return template.replace(SCRIPT_PLACEHOLDER, `csv_text = '''${normalizedCsv}'''`)
}

export function buildKickoffMessage(agentPrompt: string, productRules: string, fitNotes?: string): string {
  const parts = [
    'TASK: Style 553972 LS Polo, Size M, all units inches.',
    '',
    'AGENT INSTRUCTIONS',
    agentPrompt.trim(),
    '',
    'The reference script has already been uploaded to /workspace/input/reference_script.py with the CSV inside it. Run it with exec using exactly: python3 /workspace/input/reference_script.py. Do not open, edit, retype or copy it.',
    '',
    'PRODUCT RULES',
    productRules.trim(),
  ]
  if (fitNotes && fitNotes.trim()) {
    parts.push('', 'FIT SESSION NOTES (reported by the designer)', fitNotes.trim())
  }
  parts.push('', 'Run the audit. Write the log to output/revision_log.md and wait for approval before continuing.')
  return parts.join('\n')
}

export function loadCsvText(): string {
  const root = process.cwd()
  try {
    return readFileSync(join(root, 'data', 'polo_input_size_m.csv'), 'utf-8')
  } catch {
    throw new Error('Missing required file: data/polo_input_size_m.csv')
  }
}

export function loadKickoffMessage(): string {
  const root = process.cwd()

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

  let fitNotes: string | undefined
  try {
    fitNotes = readFileSync(join(root, 'data', 'fit_notes.md'), 'utf-8')
  } catch {
    // optional — omit if not present
  }

  return buildKickoffMessage(agentPrompt, productRules, fitNotes)
}
