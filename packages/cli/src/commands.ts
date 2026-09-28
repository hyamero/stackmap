import { createHash } from 'node:crypto';
import { extname } from 'node:path';
import { layoutDiagram } from '@stackmap/layout';
import { validateDiagram, type Diagnostic, type ValidationResult } from '@stackmap/schema';
import { embedDiagram } from './embed';
import { formatDiagnostic, summary } from './format';
import { CliError, readText, writeAtomic } from './io';
import { locateJsonError } from './json-error';

export interface CommandResult {
  code: 0 | 1 | 2;
  stdout: string;
  stderr: string;
}

function validateFile(path: string): ValidationResult {
  const text = readText(path);
  let input: unknown;
  try {
    input = JSON.parse(text);
  } catch {
    const { line, column, expected } = locateJsonError(text);
    const diagnostic: Diagnostic = {
      code: 'schema/invalid-json',
      severity: 'error',
      subject: '',
      message: `Not valid JSON at line ${line}, column ${column}: expected ${expected}`,
      evidence: { line, column, expected },
      allowedFixes: [`fix the JSON syntax at line ${line}, column ${column}`],
    };
    return { ok: false, diagnostics: [diagnostic] };
  }
  return validateDiagram(input);
}

const usageError = (e: unknown): CommandResult => {
  if (e instanceof CliError) return { code: 2, stdout: '', stderr: `stackmap: ${e.message}\n` };
  throw e;
};

const report = (diagnostics: Diagnostic[]) => diagnostics.map((d) => `${formatDiagnostic(d)}\n`).join('');

export async function validateCommand(path: string, { json }: { json: boolean }): Promise<CommandResult> {
  try {
    const { ok, diagnostics } = validateFile(path);
    const stdout = json ? `${JSON.stringify({ ok, diagnostics }, null, 2)}\n` : `${report(diagnostics)}${summary(diagnostics)}\n`;
    return { code: ok ? 0 : 1, stdout, stderr: '' };
  } catch (e) {
    return usageError(e);
  }
}

export async function deliverCommand(path: string, { template, out }: { template: string; out?: string }): Promise<CommandResult> {
  try {
    const { ok, diagram, diagnostics } = validateFile(path);
    if (!ok || !diagram) return { code: 1, stdout: `${report(diagnostics)}${summary(diagnostics)}\n`, stderr: '' };
    const html = embedDiagram(template, await layoutDiagram(diagram));
    const target = out ?? path.slice(0, path.length - extname(path).length) + '.html';
    writeAtomic(target, html);
    const bytes = Buffer.byteLength(html);
    const sha = createHash('sha256').update(html).digest('hex');
    return { code: 0, stdout: `delivered ${target} · sha256 ${sha} · ${bytes} bytes\n`, stderr: report(diagnostics) };
  } catch (e) {
    return usageError(e);
  }
}
