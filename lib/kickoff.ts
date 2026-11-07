import { readFileSync } from 'fs';
import { join } from 'path';

export function buildKickoffMessage(csvText: string, rulesText: string): string {
  return [
    'TASK: Audit Style 553972 LS Polo, Size M. All units inches.',
    '',
    'SPEC AND MEASUREMENTS (CSV)',
    csvText.trim(),
    '',
    'PRODUCT RULES',
    rulesText.trim(),
    '',
    'Run the reference script from your instructions using exec. Check that the exit code is 0.' +
      ' Using only the script output, group FAIL and EDGE rows into clusters, rank likely causes' +
      ' with the check that would settle each, and draft the revision log.' +
      ' Write the completed log to output/revision_log.md and wait for approval before continuing.',
  ].join('\n');
}

export function loadKickoffMessage(): string {
  const csvPath = join(process.cwd(), 'data', 'polo_input_size_m.csv');
  let csvText: string;
  try {
    csvText = readFileSync(csvPath, 'utf-8');
  } catch {
    throw new Error('Missing required file: data/polo_input_size_m.csv');
  }
  const rulesText = readFileSync(join(process.cwd(), 'product-rules.md'), 'utf-8');
  return buildKickoffMessage(csvText, rulesText);
}
