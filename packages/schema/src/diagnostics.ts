import type { DiagramDraft } from '@stackmap/core';

export type Severity = 'error' | 'warning';

/** One repairable finding. The agent loop repairs only what a diagnostic names, using `allowedFixes`. */
export interface Diagnostic {
  /** `<family>/<rule>`: schema · refs · semantics · card-fit */
  code: string;
  severity: Severity;
  /** JSON pointer into the diagram, e.g. "/nodes/3/card/title" */
  subject: string;
  message: string;
  evidence: Record<string, unknown>;
  allowedFixes: string[];
}

export interface ValidationResult {
  /** No errors (warnings allowed). */
  ok: boolean;
  /** The typed diagram, present whenever the input passed the schema. */
  diagram?: DiagramDraft;
  diagnostics: Diagnostic[];
}
