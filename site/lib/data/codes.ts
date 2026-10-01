import { readdirSync, readFileSync } from 'node:fs';
import type { Family } from '../reference';

export type Codes = Record<Family, string[]>;

const RULES = new URL('../../../packages/schema/src/rules/', import.meta.url);
const COMMANDS = new URL('../../../packages/cli/src/commands.ts', import.meta.url);
const RULE_ORDER = ['refs.ts', 'semantics.ts', 'kinds.ts', 'card-fit.ts'];

/**
 * Every code `validate` can report, read from the rules' source, so the docs list can't drift from it. Schema
 * codes are zod's issue codes, named where the rules give each one its fixes, plus the CLI's own invalid-json.
 */
export function diagnosticCodes(): Codes {
  const codes: Codes = { schema: [], refs: [], semantics: [], 'card-fit': [] };
  const add = (code: string) => {
    const family = code.slice(0, code.indexOf('/')) as Family;
    if (codes[family] && !codes[family].includes(code)) codes[family].push(code);
  };
  for (const m of readFileSync(COMMANDS, 'utf8').matchAll(/code: '(schema\/[a-z_-]+)'/g)) add(m[1]!);
  const schema = readFileSync(new URL('schema.ts', RULES), 'utf8');
  for (const m of schema.matchAll(/case '([a-z_]+)':/g)) add(`schema/${m[1]}`);
  // The general rules before the per-kind ones, as the rules run.
  const files = readdirSync(RULES).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts') && f !== 'schema.ts');
  for (const file of [...RULE_ORDER.filter((f) => files.includes(f)), ...files.filter((f) => !RULE_ORDER.includes(f))]) {
    for (const m of readFileSync(new URL(file, RULES), 'utf8').matchAll(/'((?:refs|semantics|card-fit)\/[a-z-]+)'/g)) add(m[1]!);
  }
  return codes;
}
