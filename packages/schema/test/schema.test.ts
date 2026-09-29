import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, expectTypeOf, it } from 'vitest';
import type { z } from 'zod';
import type { DiagramDraft } from '@stackmap/core';
import { commerceApi, groupedPlatform } from '@stackmap/core/samples';
import { buildJsonSchema, DiagramDraftSchema } from '../src/schema';

type Inferred = z.infer<typeof DiagramDraftSchema>;
const node = (over: Record<string, unknown> = {}) => ({ id: 'a', type: 'service', card: { title: 'a' }, ...over });
const draft = (over: Record<string, unknown> = {}) => ({ kind: 'architecture', title: 'T', nodes: [node()], edges: [], ...over });
const parses = (input: unknown) => DiagramDraftSchema.safeParse(input).success;

describe('DiagramDraftSchema', () => {
  it('infers exactly the core DiagramDraft shape (plus $schema)', () => {
    expectTypeOf<Inferred>().toExtend<DiagramDraft & { $schema?: string }>();
    expectTypeOf<DiagramDraft & { $schema?: string }>().toExtend<Inferred>();
  });

  it('accepts both samples and a minimal diagram', () => {
    expect(parses(commerceApi)).toBe(true);
    expect(parses(groupedPlatform)).toBe(true);
    expect(parses(draft({ $schema: './stackmap.schema.json' }))).toBe(true);
  });

  it('accepts node evidence and a source URL for evidence links', () => {
    const evidence = [{ file: 'src/orders/api.ts', line: 42, note: 'route table' }, { file: 'infra/db.tf' }];
    expect(parses(draft({ source: { url: 'https://github.com/acme/shop/blob/main' }, nodes: [node({ evidence })] }))).toBe(true);
  });

  it.each([
    ['evidence with line 0', draft({ nodes: [node({ evidence: [{ file: 'a.ts', line: 0 }] })] })],
    ['evidence with a fractional line', draft({ nodes: [node({ evidence: [{ file: 'a.ts', line: 1.5 }] })] })],
    ['more than 8 evidence items', draft({ nodes: [node({ evidence: Array(9).fill({ file: 'a.ts' }) })] })],
    ['a non-http source URL', draft({ source: { url: 'file:///etc' } })],
    ['an uppercase id', draft({ nodes: [node({ id: 'Orders' })] })],
    ['an id starting with a dash', draft({ nodes: [node({ id: '-a' })] })],
    ['an unknown node type', draft({ nodes: [node({ type: 'lambda' })] })],
    ['more than 3 stats', draft({ nodes: [node({ card: { title: 'a', stats: Array(4).fill({ value: '1', label: 'x' }) } })] })],
    ['more than 6 rows', draft({ nodes: [node({ card: { title: 'a', rows: Array(7).fill({ label: 'k', value: 'v' }) } })] })],
    ['an edge label over 24 chars', draft({ edges: [{ id: 'e', from: 'a', to: 'a', label: 'x'.repeat(25) }] })],
    ['a javascript: CTA link', draft({ nodes: [node({ card: { title: 'a', cta: { label: 'Go', href: 'javascript:alert(1)' } } })] })],
    ['a typo key', draft({ nodes: [node({ card: { title: 'a', subtitel: 'x' } })] })],
    ['an empty title', draft({ nodes: [node({ card: { title: '' } })] })],
    ['no nodes', draft({ nodes: [] })],
    ['a non-object', 'diagram'],
  ])('rejects %s', (_name, input) => {
    expect(parses(input)).toBe(false);
  });
});

describe('stackmap.schema.json', () => {
  const committed = JSON.parse(readFileSync(new URL('../stackmap.schema.json', import.meta.url), 'utf8'));

  it('is up to date with the Zod source (run `bun run schema:emit`)', () => {
    expect(committed).toEqual(buildJsonSchema());
  });

  it('agrees with Zod on the samples and on the limits it can express', () => {
    const validate = new Ajv2020({ strict: false }).compile(committed);
    expect(validate(commerceApi)).toBe(true);
    expect(validate(groupedPlatform)).toBe(true);
    expect(validate(draft({ nodes: [node({ id: 'Bad' })] }))).toBe(false);
    expect(validate(draft({ nodes: [node({ card: { title: 'a', cta: { label: 'Go', href: 'javascript:x' } } })] }))).toBe(false);
    expect(validate(draft({ nodes: [node({ card: { title: 'a', stats: Array(4).fill({ value: '1', label: 'x' }) } })] }))).toBe(false);
  });
});
