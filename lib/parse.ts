import type { ScriptOutputRow, PomStatus, GapClass, ParsedRevisionLog, FitCommentGroup } from './types'

const SCRIPT_HEADER = 'code,td_var,td_status,fac_var,fac_status,gap_td_minus_fac,gap_class'

const VALID_STATUSES = new Set<string>(['PASS', 'EDGE', 'FAIL'])
const VALID_GAP_CLASSES = new Set<string>(['MATCH', 'NOISE', 'CHANGES_STATUS'])

export function parseScriptOutput(text: string): ScriptOutputRow[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n')

  let headerIdx = -1
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim() === SCRIPT_HEADER) {
      headerIdx = i
      break
    }
  }
  if (headerIdx === -1) return []

  const rows: ScriptOutputRow[] = []
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const cols = line.split(',')
    if (cols.length !== 7) continue
    const [code, td_var, td_status_raw, fac_var, fac_status_raw, gap_td_minus_fac, gap_class_raw] = cols
    if (!VALID_STATUSES.has(td_status_raw) || !VALID_STATUSES.has(fac_status_raw)) continue
    if (!VALID_GAP_CLASSES.has(gap_class_raw)) continue
    rows.push({
      code,
      td_var,
      td_status: td_status_raw as PomStatus,
      fac_var,
      fac_status: fac_status_raw as PomStatus,
      gap_td_minus_fac,
      gap_class: gap_class_raw as GapClass,
    })
  }
  return rows
}

const H2_HEADINGS = [
  'Headline findings',
  'Clusters',
  'Measurement disagreements',
  'Fit comments',
  'Flag table',
  'Internal open questions',
] as const

type SectionName = (typeof H2_HEADINGS)[number]

function parseTableRows(sectionText: string): string[][] {
  const rows: string[][] = []
  let pastSeparator = false
  for (const line of sectionText.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) continue
    const cells = trimmed
      .slice(1, -1)
      .split('|')
      .map((c) => c.trim())
    const isSeparator = cells.every((c) => /^[-: ]+$/.test(c))
    if (isSeparator) {
      pastSeparator = true
      continue
    }
    if (pastSeparator) {
      rows.push(cells)
    }
  }
  return rows
}

function parseFitCommentGroups(sectionText: string): FitCommentGroup[] {
  const groups: FitCommentGroup[] = []
  let currentGroup: FitCommentGroup | null = null

  for (const line of sectionText.split('\n')) {
    const h3Match = line.match(/^###\s+(.+)/)
    if (h3Match) {
      if (currentGroup) groups.push(currentGroup)
      currentGroup = { heading: h3Match[1].trim(), comments: [] }
      continue
    }
    const commentMatch = line.match(/^\d+\.\s+(.+)/)
    if (commentMatch) {
      if (!currentGroup) {
        currentGroup = { heading: '', comments: [] }
      }
      currentGroup.comments.push(line.trim())
    }
  }
  if (currentGroup) groups.push(currentGroup)
  return groups
}

export function splitRevisionLog(markdown: string): ParsedRevisionLog {
  const normalized = markdown.replace(/\r\n/g, '\n')
  const missing: string[] = []

  const sectionTexts = new Map<SectionName, string>()

  for (let i = 0; i < H2_HEADINGS.length; i++) {
    const heading = H2_HEADINGS[i]
    const marker = `## ${heading}`
    const start = normalized.indexOf(marker)
    if (start === -1) {
      missing.push(heading)
      continue
    }
    const contentStart = start + marker.length

    let end = normalized.length
    for (let j = i + 1; j < H2_HEADINGS.length; j++) {
      const nextMarker = `## ${H2_HEADINGS[j]}`
      const nextPos = normalized.indexOf(nextMarker, contentStart)
      if (nextPos !== -1 && nextPos < end) {
        end = nextPos
        break
      }
    }
    sectionTexts.set(heading, normalized.slice(contentStart, end).trim())
  }

  const result: ParsedRevisionLog = { missing }

  const hf = sectionTexts.get('Headline findings')
  if (hf !== undefined) result.headlineFindings = hf

  const cl = sectionTexts.get('Clusters')
  if (cl !== undefined) result.clusters = cl

  const md = sectionTexts.get('Measurement disagreements')
  if (md !== undefined) {
    result.measurementDisagreements = { raw: md, rows: parseTableRows(md) }
  }

  const fc = sectionTexts.get('Fit comments')
  if (fc !== undefined) {
    result.fitComments = { raw: fc, groups: parseFitCommentGroups(fc) }
  }

  const ft = sectionTexts.get('Flag table')
  if (ft !== undefined) {
    result.flagTable = { raw: ft, rows: parseTableRows(ft) }
  }

  const iq = sectionTexts.get('Internal open questions')
  if (iq !== undefined) result.internalOpenQuestions = iq

  return result
}
