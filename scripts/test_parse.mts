import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { parseScriptOutput, splitRevisionLog } from '../lib/parse.js'

const ROOT = process.cwd()

function check(label: string, pass: boolean, detail?: string): void {
  if (pass) {
    console.log(`PASS  ${label}`)
  } else {
    console.log(`FAIL  ${label}${detail ? ` — ${detail}` : ''}`)
  }
}

// --- parseScriptOutput: mock/script_output.csv ---

const csvText = readFileSync(join(ROOT, 'mock', 'script_output.csv'), 'utf-8')
const csvRows = parseScriptOutput(csvText)

check('script_output.csv: 22 rows', csvRows.length === 22, `got ${csvRows.length}`)

const tdPassCount = csvRows.filter(r => r.td_status === 'PASS').length
const tdEdgeCount = csvRows.filter(r => r.td_status === 'EDGE').length
const tdFailCount = csvRows.filter(r => r.td_status === 'FAIL').length

check('script_output.csv: 9 TD PASS', tdPassCount === 9, `got ${tdPassCount}`)
check('script_output.csv: 7 TD EDGE', tdEdgeCount === 7, `got ${tdEdgeCount}`)
check('script_output.csv: 6 TD FAIL', tdFailCount === 6, `got ${tdFailCount}`)

// --- parseScriptOutput: mock/script_output.real.txt (if present) ---

const realTxtPath = join(ROOT, 'mock', 'script_output.real.txt')
if (existsSync(realTxtPath)) {
  const realTxt = readFileSync(realTxtPath, 'utf-8')
  const realRows = parseScriptOutput(realTxt)
  check('script_output.real.txt: 22 rows', realRows.length === 22, `got ${realRows.length}`)
  const rPass = realRows.filter(r => r.td_status === 'PASS').length
  const rEdge = realRows.filter(r => r.td_status === 'EDGE').length
  const rFail = realRows.filter(r => r.td_status === 'FAIL').length
  check('script_output.real.txt: 9 TD PASS', rPass === 9, `got ${rPass}`)
  check('script_output.real.txt: 7 TD EDGE', rEdge === 7, `got ${rEdge}`)
  check('script_output.real.txt: 6 TD FAIL', rFail === 6, `got ${rFail}`)
} else {
  console.log('SKIP  script_output.real.txt: not present')
}

// --- splitRevisionLog: mock/revision_log.md ---

const mockLog = readFileSync(join(ROOT, 'mock', 'revision_log.md'), 'utf-8')
const mockParsed = splitRevisionLog(mockLog)

check(
  'revision_log.md: 6 sections found',
  mockParsed.missing.length === 0,
  `missing: ${mockParsed.missing.join(', ') || 'none'}`
)

// --- splitRevisionLog: mock/revision_log.real.md ---

const realLogPath = join(ROOT, 'mock', 'revision_log.real.md')
if (existsSync(realLogPath)) {
  const realLog = readFileSync(realLogPath, 'utf-8')
  const realParsed = splitRevisionLog(realLog)

  check(
    'revision_log.real.md: 6 sections found',
    realParsed.missing.length === 0,
    `missing: ${realParsed.missing.join(', ') || 'none'}`
  )

  const groups = realParsed.fitComments?.groups ?? []
  const groupNames = groups.map(g => g.heading)
  const expectedGroups = ['Sleeve and armhole', 'Neck and collar', 'Body', 'Construction']

  check(
    'revision_log.real.md: Fit comments has 4 groups',
    groups.length === 4,
    `got ${groups.length}: ${groupNames.join(', ')}`
  )
  for (const name of expectedGroups) {
    check(
      `revision_log.real.md: group "${name}" present`,
      groupNames.includes(name),
      `found: ${groupNames.join(', ')}`
    )
  }

  const totalComments = groups.reduce((n, g) => n + g.comments.length, 0)
  check('revision_log.real.md: 6 fit comments total', totalComments === 6, `got ${totalComments}`)

  const flagRows = realParsed.flagTable?.rows ?? []
  check('revision_log.real.md: 22 flag table rows', flagRows.length === 22, `got ${flagRows.length}`)
} else {
  console.log('SKIP  revision_log.real.md: not present')
}
