import type { DiagramDraft } from '@stackmap/core';
import type { ValidationResult } from './diagnostics';
import { cardFitDiagnostics } from './rules/card-fit';
import { kindDiagnostics } from './rules/kinds';
import { refsDiagnostics } from './rules/refs';
import { schemaDiagnostics } from './rules/schema';
import { semanticsDiagnostics } from './rules/semantics';
import { DiagramDraftSchema } from './schema';

/**
 * Schema first: the other families need a typed diagram, so schema errors are returned alone. Otherwise
 * refs, semantics (general, then kind rules) and card-fit all run, in that order, each in document order.
 */
export function validateDiagram(input: unknown): ValidationResult {
  const parsed = DiagramDraftSchema.safeParse(input);
  if (!parsed.success) return { ok: false, diagnostics: schemaDiagnostics(parsed.error.issues, input) };
  const { $schema: _, ...diagram } = parsed.data;
  const d: DiagramDraft = diagram;
  const diagnostics = [...refsDiagnostics(d), ...semanticsDiagnostics(d), ...kindDiagnostics(d), ...cardFitDiagnostics(d)];
  return { ok: !diagnostics.some((x) => x.severity === 'error'), diagram: d, diagnostics };
}
