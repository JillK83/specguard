import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { buildKickoffMessage } from '../lib/kickoff'

const root = process.cwd()

// First 4 lines of the real CSV (header + 3 rows) so the mock always uses the real headers.
const placeholderCsv = readFileSync(join(root, 'data', 'polo_input_size_m.csv'), 'utf-8')
  .split('\n')
  .slice(0, 4)
  .join('\n')

const msg = buildKickoffMessage(placeholderCsv)
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
