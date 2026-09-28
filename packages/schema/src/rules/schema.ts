import type { z } from 'zod';
import type { Diagnostic } from '../diagnostics';
import { buildJsonSchema, HTTP_URL, ID_PATTERN, VISIBLE_TEXT } from '../schema';
import { closest, pointer, toId } from '../util';

const kindOf = (v: unknown) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v);

function valueAt(input: unknown, path: readonly PropertyKey[]): unknown {
  let v = input;
  for (const k of path) v = v !== null && typeof v === 'object' ? (v as Record<PropertyKey, unknown>)[k] : undefined;
  return v;
}

type JsonSchemaNode = { properties?: Record<string, JsonSchemaNode>; items?: JsonSchemaNode };
let jsonSchema: JsonSchemaNode | undefined;

/** Property names allowed on the object at `path`, read from the emitted JSON Schema. */
function keysAt(path: readonly PropertyKey[]): string[] {
  let node: JsonSchemaNode | undefined = (jsonSchema ??= buildJsonSchema() as JsonSchemaNode);
  for (const key of path) node = typeof key === 'number' ? node?.items : node?.properties?.[String(key)];
  return Object.keys(node?.properties ?? {});
}

const article = (t: string) => (/^[aeiou]/.test(t) ? `an ${t}` : `a ${t}`);

/** "the diagram", "item 2 of \"nodes\"" or "\"title\"" — how a fix names the value at `path`. */
function name(path: readonly PropertyKey[]): string {
  const last = path.at(-1);
  if (last === undefined) return 'the diagram';
  return typeof last === 'number' ? `item ${last} of "${String(path.at(-2))}"` : `"${String(last)}"`;
}

function fixes(issue: z.core.$ZodIssue, received: unknown): string[] {
  const key = String(issue.path.at(-1) ?? 'value');
  switch (issue.code) {
    case 'invalid_type':
      return received === undefined && issue.path.length > 0
        ? [`add the required "${key}" field (${issue.expected})`]
        : [`make ${name(issue.path)} ${article(issue.expected)}`];
    case 'invalid_value':
      return [`use one of: ${issue.values.map(String).join(', ')}`];
    case 'too_big':
      return issue.origin === 'array' ? [`keep at most ${issue.maximum} items`] : [`shorten "${key}" to at most ${issue.maximum} characters`];
    case 'too_small':
      return issue.origin === 'array' ? [`add at least ${issue.minimum} item(s)`] : [`give "${key}" a non-empty value`];
    case 'invalid_format':
      if (issue.format === 'regex' && issue.pattern === String(ID_PATTERN))
        return [`use a lowercase id such as "${toId(String(received ?? ''))}"`];
      if (issue.format === 'regex' && issue.pattern === String(VISIBLE_TEXT)) return [`give "${key}" visible text`];
      if (issue.format === 'regex' && issue.pattern === String(HTTP_URL)) return ['use an http(s) URL', `remove "${key}"`];
      return [`match ${issue.pattern ?? issue.format}`];
    case 'unrecognized_keys': {
      const allowed = keysAt(issue.path);
      return issue.keys.map((k) => {
        const near = closest(k, allowed, 1)[0];
        return near ? `rename "${k}" to "${near}"` : `remove "${k}" (not valid here; allowed: ${allowed.join(', ')})`;
      });
    }
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
    if (code !== 'unrecognized_keys') evidence.received = received !== null && typeof received === 'object' ? kindOf(received) : received === undefined ? 'missing' : received;
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
