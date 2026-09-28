import { describe, expect, it } from 'vitest';
import type { DiagramDraft } from '@stackmap/core';
import { commerceApi, groupedPlatform } from '@stackmap/core/samples';
import { validateDiagram, type Diagnostic } from '../src';

const node = (id: string, over: Partial<DiagramDraft['nodes'][number]> = {}) => ({ id, type: 'service' as const, card: { title: id }, ...over });
const base = (over: Partial<DiagramDraft> = {}): DiagramDraft => ({
  kind: 'architecture',
  title: 'T',
  nodes: [node('a'), node('b')],
  edges: [{ id: 'ab', from: 'a', to: 'b' }],
  ...over,
});
const diags = (input: unknown) => validateDiagram(input).diagnostics;
const only = (input: unknown, code: string) => diags(input).filter((d) => d.code === code);

describe('validateDiagram', () => {
  it.each([
    ['commerce API', commerceApi],
    ['grouped platform', groupedPlatform],
  ])('the %s sample validates with no diagnostics', (_n, sample) => {
    expect(validateDiagram(sample)).toEqual({ ok: true, diagram: sample, diagnostics: [] });
  });

  it('strips $schema from the typed diagram', () => {
    const r = validateDiagram({ $schema: './stackmap.schema.json', ...base() });
    expect(r.ok).toBe(true);
    expect(r.diagram).toEqual(base());
  });

  describe('schema', () => {
    it.each([null, [], 'diagram', 42, undefined])('reports a non-object root (%s) once, without throwing', (input) => {
      const r = validateDiagram(input);
      expect(r.ok).toBe(false);
      expect(r.diagram).toBeUndefined();
      expect(r.diagnostics).toHaveLength(1);
      expect(r.diagnostics[0]).toMatchObject({ code: 'schema/invalid_type', subject: '', evidence: { expected: 'object' } });
    });

    it('a missing required field says to add it', () => {
      const { edges: _, ...noEdges } = base();
      expect(diags(noEdges)).toEqual<Diagnostic[]>([
        {
          code: 'schema/invalid_type',
          severity: 'error',
          subject: '/edges',
          message: 'Expected array, received nothing',
          evidence: { expected: 'array', received: 'missing' },
          allowedFixes: ['add the required "edges" field (array)'],
        },
      ]);
    });

    it('a bad id suggests a valid one', () => {
      const [d] = diags(base({ nodes: [node('Orders API'), node('b')], edges: [] }));
      expect(d).toMatchObject({ code: 'schema/invalid_format', subject: '/nodes/0/id', allowedFixes: ['use a lowercase id such as "orders-api"'] });
    });

    it('an unknown type lists the allowed types', () => {
      const [d] = diags(base({ nodes: [node('a', { type: 'lambda' as never })] }));
      expect(d).toMatchObject({ code: 'schema/invalid_value', subject: '/nodes/0/type' });
      expect(d!.allowedFixes[0]).toMatch(/^use one of: client, service, gateway/);
    });

    it('a misspelt key suggests the right one', () => {
      const [d] = diags(base({ nodes: [node('a', { card: { title: 'a', subtitel: 'x' } as never })] }));
      expect(d).toMatchObject({ code: 'schema/unrecognized_keys', subject: '/nodes/0/card', evidence: { keys: ['subtitel'] }, allowedFixes: ['rename "subtitel" to "subtitle"'] });
    });

    it('limits say how far to cut', () => {
      const stats = Array.from({ length: 4 }, (_, i) => ({ value: String(i), label: 'x' }));
      expect(diags(base({ nodes: [node('a', { card: { title: 'a', stats } })] }))[0]).toMatchObject({
        code: 'schema/too_big',
        subject: '/nodes/0/card/stats',
        allowedFixes: ['keep at most 3 items'],
      });
      expect(diags(base({ edges: [{ id: 'ab', from: 'a', to: 'b', label: 'x'.repeat(25) }] }))[0]).toMatchObject({
        code: 'schema/too_big',
        subject: '/edges/0/label',
        allowedFixes: ['shorten "label" to at most 24 characters'],
      });
    });

    it('rejects a non-http CTA link', () => {
      const [d] = diags(base({ nodes: [node('a', { card: { title: 'a', cta: { label: 'Go', href: 'javascript:alert(1)' } } })] }));
      expect(d).toMatchObject({ code: 'schema/invalid_format', subject: '/nodes/0/card/cta/href', allowedFixes: ['use an http(s) URL', 'remove "href"'] });
    });

    it('returns only schema diagnostics when the schema fails', () => {
      // Dangling edge + orphan would be reported too if later families ran.
      const r = validateDiagram({ ...base({ edges: [{ id: 'ax', from: 'a', to: 'x' }] }), title: '' });
      expect(r.diagnostics.map((d) => d.code)).toEqual(['schema/too_small']);
    });
  });

  describe('refs', () => {
    it('a dangling edge end names the closest node ids', () => {
      expect(only(base({ nodes: [node('orders'), node('b')], edges: [{ id: 'e', from: 'order', to: 'b' }] }), 'refs/unknown-node')).toEqual<Diagnostic[]>([
        {
          code: 'refs/unknown-node',
          severity: 'error',
          subject: '/edges/0/from',
          message: 'Unknown node "order"',
          evidence: { id: 'order', closest: ['orders'] },
          allowedFixes: ['use "orders"', 'add node "order" or remove the edge'],
        },
      ]);
    });

    it('unknown groups on nodes and group parents', () => {
      const d = base({ groups: [{ id: 'app', label: 'App', parent: 'missing' }], nodes: [node('a', { group: 'ap' }), node('b', { group: 'app' })] });
      expect(only(d, 'refs/unknown-group').map((x) => [x.subject, x.evidence])).toEqual([
        ['/groups/0/parent', { id: 'missing', closest: [] }],
        ['/nodes/0/group', { id: 'ap', closest: ['app'] }],
      ]);
    });

    it('unknown view members', () => {
      const d = base({ views: [{ id: 'v', label: 'V', nodes: ['a', 'zz'] }] });
      expect(only(d, 'refs/unknown-view-node')).toMatchObject([{ subject: '/views/0/nodes/1', evidence: { id: 'zz' } }]);
    });

    it('reports each group parent cycle once and terminates', () => {
      const d = base({
        groups: [
          { id: 'x', label: 'X', parent: 'y' },
          { id: 'y', label: 'Y', parent: 'x' },
          { id: 'self', label: 'S', parent: 'self' },
          { id: 'into', label: 'I', parent: 'x' },
        ],
        nodes: [node('a', { group: 'x' }), node('b', { group: 'self' })],
      });
      expect(only(d, 'refs/group-cycle').map((x) => [x.subject, x.evidence])).toEqual([
        ['/groups/0/parent', { cycle: ['x', 'y'] }],
        ['/groups/2/parent', { cycle: ['self'] }],
      ]);
    });

    it('an unknown brand is a warning with the nearest slugs', () => {
      const r = validateDiagram(base({ nodes: [node('a', { card: { title: 'a', brand: 'postgres' } }), node('b')] }));
      expect(r.ok).toBe(true);
      expect(r.diagnostics).toMatchObject([
        { code: 'refs/unknown-brand', severity: 'warning', subject: '/nodes/0/card/brand', evidence: { closest: ['postgresql'] }, allowedFixes: ['use "postgresql"', 'remove "brand"'] },
      ]);
    });
  });

  describe('semantics', () => {
    it('duplicate ids point at the first occurrence', () => {
      const d = base({ nodes: [node('a'), node('b'), node('a')], edges: [{ id: 'ab', from: 'a', to: 'b' }, { id: 'ab', from: 'b', to: 'a' }] });
      expect(only(d, 'semantics/duplicate-id').map((x) => [x.subject, x.evidence])).toEqual([
        ['/nodes/2/id', { id: 'a', first: '/nodes/0/id' }],
        ['/edges/1/id', { id: 'ab', first: '/edges/0/id' }],
      ]);
    });

    it('an unconnected node is an orphan, except in a one-node diagram', () => {
      expect(only(base({ nodes: [node('a'), node('b'), node('c')] }), 'semantics/orphan-node')).toMatchObject([{ subject: '/nodes/2', severity: 'warning' }]);
      expect(diags(base({ nodes: [node('a')], edges: [] }))).toEqual([]);
    });

    it('a self-loop is a warning', () => {
      expect(only(base({ edges: [{ id: 'ab', from: 'a', to: 'b' }, { id: 'aa', from: 'a', to: 'a' }] }), 'semantics/self-loop')).toMatchObject([
        { subject: '/edges/1', severity: 'warning' },
      ]);
    });

    it('cycles warn in dataflow diagrams only', () => {
      const edges = [
        { id: 'ab', from: 'a', to: 'b' },
        { id: 'bc', from: 'b', to: 'c' },
        { id: 'ca', from: 'c', to: 'a' },
      ];
      const nodes = [node('a'), node('b'), node('c')];
      expect(only(base({ kind: 'dataflow', nodes, edges }), 'semantics/dataflow-cycle')).toMatchObject([
        { subject: '/edges/0', severity: 'warning', evidence: { nodes: ['a', 'b', 'c'] } },
      ]);
      expect(only(base({ nodes, edges }), 'semantics/dataflow-cycle')).toEqual([]);
    });

    it('an empty view is an error, an empty group a warning', () => {
      const r = validateDiagram(base({ views: [{ id: 'v', label: 'V', nodes: [] }], groups: [{ id: 'g', label: 'G' }] }));
      expect(r.ok).toBe(false);
      expect(r.diagnostics.map((x) => [x.code, x.severity, x.subject])).toEqual([
        ['semantics/empty-view', 'error', '/views/0/nodes'],
        ['semantics/empty-group', 'warning', '/groups/0'],
      ]);
    });

    it('a group holding only a child group is not empty', () => {
      const d = base({ groups: [{ id: 'outer', label: 'O' }, { id: 'inner', label: 'I', parent: 'outer' }], nodes: [node('a', { group: 'inner' }), node('b')] });
      expect(only(d, 'semantics/empty-group')).toEqual([]);
    });
  });

  describe('card-fit', () => {
    it('reports an overflowing title with its character budget', () => {
      const title = 'a-very-long-service-name-that-will-never-fit';
      const [d] = only(base({ nodes: [node('a', { card: { title } }), node('b')] }), 'card-fit/overflow');
      expect(d).toMatchObject({ severity: 'error', subject: '/nodes/0/card/title', evidence: { text: title, maxWidth: 200 } });
      const { maxChars, width } = d!.evidence as { maxChars: number; width: number };
      expect(width).toBeGreaterThan(200);
      expect(maxChars).toBeGreaterThan(20);
      expect(maxChars).toBeLessThan(title.length);
      expect(d!.allowedFixes).toEqual([`shorten to at most ${maxChars} characters`, 'move the detail into a card row']);
    });

    it('covers every slot, not just the header', () => {
      const long = 'x'.repeat(80);
      const card = {
        title: 'a',
        rows: [{ label: 'k', value: long }],
        stats: [{ value: '1', label: long }],
        statsNote: long,
        footer: { left: { text: long, icon: 'region' as const } },
        cta: { label: long },
      };
      expect(only(base({ nodes: [node('a', { card }), node('b')] }), 'card-fit/overflow').map((x) => x.subject)).toEqual([
        '/nodes/0/card/rows/0/value',
        '/nodes/0/card/stats/0/label',
        '/nodes/0/card/statsNote',
        '/nodes/0/card/footer/left/text',
        '/nodes/0/card/cta/label',
      ]);
    });

    it('measures non-Latin text conservatively instead of crashing', () => {
      const [d] = only(base({ nodes: [node('a', { card: { title: '注文サービス本番環境クラスター東京' } }), node('b')] }), 'card-fit/overflow');
      expect(d).toMatchObject({ subject: '/nodes/0/card/title', evidence: { maxChars: 14 } });
    });
  });
});
