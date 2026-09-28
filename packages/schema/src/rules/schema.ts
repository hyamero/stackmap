import type { z } from 'zod';
import type { Diagnostic } from '../diagnostics';
import { buildJsonSchema, ID_PATTERN } from '../schema';
import { closest, pointer, toId } from '../util';

const kindOf = (v: unknown) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v);

function valueAt(input: unknown, path: readonly PropertyKey[]): unknown {
  let v = input;
  for (const k of path) v = v !== null && typeof v === 'object' ? (v as Record<PropertyKey, unknown>)[k] : undefined;
  return v;
}

// Every property name the schema knows, for "did you mean" on misspelt keys.
let knownKeys: string[] | undefined;
function allKeys(): string[] {
  if (knownKeys) return knownKeys;
  const keys = new Set<string>();
  const walk = (node: unknown) => {
    if (node === null || typeof node !== 'object') return;
    const props = (node as { properties?: Record<string, unknown> }).properties;
    if (props) for (const k of Object.keys(props)) keys.add(k);
    for (const v of Object.values(node)) walk(v);
  };
  walk(buildJsonSchema());
  return (knownKeys = [...keys]);
}

function fixes(issue: z.core.$ZodIssue, received: unknown): string[] {
  const key = String(issue.path.at(-1) ?? 'value');
  switch (issue.code) {
    case 'invalid_type':
      return received === undefined ? [`add the required "${key}" field (${issue.expected})`] : [`make "${key}" a ${issue.expected}`];
    case 'invalid_value':
      return [`use one of: ${issue.values.map(String).join(', ')}`];
    case 'too_big':
      return issue.origin === 'array' ? [`keep at most ${issue.maximum} items`] : [`shorten "${key}" to at most ${issue.maximum} characters`];
    case 'too_small':
      return issue.origin === 'array' ? [`add at least ${issue.minimum} item(s)`] : [`give "${key}" a non-empty value`];
    case 'invalid_format':
      if (issue.format === 'regex' && issue.pattern === String(ID_PATTERN))
        return [`use a lowercase id such as "${toId(String(received ?? ''))}"`];
      if (key === 'href') return ['use an http(s) URL', 'remove "href"'];
      return [`match ${issue.pattern ?? issue.format}`];
    case 'unrecognized_keys':
      return issue.keys.map((k) => {
        const near = closest(k, allKeys(), 1)[0];
        return near ? `rename "${k}" to "${near}"` : `remove "${k}"`;
      });
    default:
      return ['fix the value to match stackmap.schema.json'];
  }
}

/** Zod issues → diagnostics: `schema/<zod issue code>`, subject = the offending path. */
export function schemaDiagnostics(issues: readonly z.core.$ZodIssue[], input: unknown): Diagnostic[] {
  return issues.map((issue) => {
    const received = valueAt(input, issue.path);
    const { code, path, message, input: _input, ...rest } = issue as z.core.$ZodIssue & { input?: unknown };
    const evidence: Record<string, unknown> = { ...rest };
    // Primitives verbatim; objects and arrays by kind only, so evidence stays small.
    if (code !== 'unrecognized_keys') evidence.received = received !== null && typeof received === 'object' ? kindOf(received) : received ?? 'missing';
    return {
      code: `schema/${code}`,
      severity: 'error',
      subject: pointer(path),
      message: issue.code === 'invalid_type' ? `Expected ${issue.expected}, received ${received === undefined ? 'nothing' : kindOf(received)}` : message,
      evidence,
      allowedFixes: fixes(issue, received),
    } satisfies Diagnostic;
  });
}
