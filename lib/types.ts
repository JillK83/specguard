export type PomStatus = 'PASS' | 'EDGE' | 'FAIL';

export type GapClass = 'MATCH' | 'NOISE' | 'CHANGES_STATUS';

export interface ScriptOutputRow {
  code: string;
  td_var: string;
  td_status: PomStatus;
  fac_var: string;
  fac_status: PomStatus;
  gap_td_minus_fac: string;
  gap_class: GapClass;
}

export interface RevisionLog {
  headlineFindings: string;
  clusters: string;
  measurementDisagreements: string;
  fitComments: string;
  flagTable: string;
  internalOpenQuestions: string;
}

export interface WriteApprovalArguments {
  path: string;
  content: string;
}

export interface WriteApprovalPayload {
  phase: 'requested' | 'resolved';
  toolName: string;
  arguments: WriteApprovalArguments;
  approvalId: string;
  timeoutAt: string;
  toolCallId: string;
}

export interface FitCommentGroup {
  heading: string;
  comments: string[];
}

export interface ParsedRevisionLog {
  headlineFindings?: string;
  clusters?: string;
  measurementDisagreements?: {
    raw: string;
    rows: string[][];
  };
  fitComments?: {
    raw: string;
    groups: FitCommentGroup[];
  };
  flagTable?: {
    raw: string;
    rows: string[][];
  };
  internalOpenQuestions?: string;
  missing: string[];
}
