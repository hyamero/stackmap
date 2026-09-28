import type { Diagnostic } from '@stackmap/schema';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function formatDiagnostic(d: Diagnostic): string {
  const lines = [`${d.severity}  ${d.code}  ${d.subject || '(root)'}`, `  ${d.message}`];
  for (const fix of d.allowedFixes) lines.push(`  fix: ${fix}`);
  return lines.join('\n');
}

export function summary(diagnostics: Diagnostic[]): string {
  const errors = diagnostics.filter((d) => d.severity === 'error').length;
  const warnings = diagnostics.length - errors;
  if (errors) return `✗ ${plural(errors, 'error')}${warnings ? `, ${plural(warnings, 'warning')}` : ''}`;
  return warnings ? `✓ valid with ${plural(warnings, 'warning')}` : '✓ valid: no diagnostics';
}
