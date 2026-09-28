import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildJsonSchema } from '../src/schema';
import { renderSchemaDoc } from '../src/schema-doc';
import { validateDiagram } from '../src/validate';

const skill = (p: string) => readFileSync(new URL(`../../../skill/${p}`, import.meta.url), 'utf8');

describe('skill references', () => {
  it('schema.md is generated from the Zod source (run `bun run schema:emit`)', () => {
    expect(skill('references/schema.md')).toBe(renderSchemaDoc());
  });

  it('the skill ships the current JSON Schema', () => {
    expect(JSON.parse(skill('references/stackmap.schema.json'))).toEqual(buildJsonSchema());
  });

  it('documents every object, its limits and the brand allowlist', () => {
    const doc = renderSchemaDoc();
    for (const heading of ['## Diagram', '## nodes[]', '## nodes[].card', '## nodes[].card.rows[]', '## edges[]', '## groups[]', '## views[]', '## nodes[].evidence[]'])
      expect(doc).toContain(heading);
    expect(doc).toMatch(/\| `stats` \| array \| no \| .*at most 3/);
    expect(doc).toMatch(/\| `label` \| string \| no \| .*at most 24 characters/);
    expect(doc).toContain('`postgresql`');
  });

  it.each(readdirSync(new URL('../../../skill/examples/', import.meta.url)).filter((f) => f.endsWith('.json')))(
    'example %s validates with no diagnostics',
    (f) => {
      expect(validateDiagram(JSON.parse(skill(`examples/${f}`))).diagnostics).toEqual([]);
    },
  );
});
