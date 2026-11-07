import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { buildKickoffMessage } from '../lib/kickoff'

const root = process.cwd()

// Short placeholder CSV — shows the layout, not real data.
const placeholderCsv = `code,description,spec,tol_minus,tol_plus,td_measured,factory_measured
NK01,Neck width,17,1/4,1/4,17 1/8,17 1/4
CL04,Collar band width,1 1/2,1/4,1/4,2,1 5/8
AH01,Armhole straight,9 1/2,1/4,1/4,9 1/4,9 3/8`

const rulesText = readFileSync(join(root, 'product-rules.md'), 'utf-8')
const msg = buildKickoffMessage(placeholderCsv, rulesText)
writeFileSync(join(root, 'mock', 'kickoff_message.txt'), msg, 'utf-8')
console.log('Written: mock/kickoff_message.txt')

// Build approval.json from revision_log.md so content stays in sync.
const logContent = readFileSync(join(root, 'mock', 'revision_log.md'), 'utf-8')
const approval = {
  phase: 'requested',
  toolName: 'write',
  arguments: {
    path: 'output/revision_log.md',
    content: logContent,
  },
  approvalId: 'appr_mock_001',
  timeoutAt: '2026-11-07T14:02:00Z',
  toolCallId: 'tc_mock_001',
}
writeFileSync(join(root, 'mock', 'approval.json'), JSON.stringify(approval, null, 2), 'utf-8')
console.log('Written: mock/approval.json')
