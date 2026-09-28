import { describe, expect, it } from 'vitest';
import type { DiagramDraft } from '@stackmap/core';
import { emphasis, searchMatches } from './emphasis';
import { buildGraph } from './graph';
import { INITIAL } from './state';

const draft: DiagramDraft = {
  kind: 'architecture',
  title: 'T',
  nodes: [
    { id: 'web', type: 'client', card: { title: 'Web app', subtitle: 'Next.js' } },
    { id: 'api', type: 'service', card: { title: 'Orders API' } },
    { id: 'db', type: 'database', card: { title: 'postgres' } },
    { id: 'mail', type: 'external', card: { title: 'Mailer' } },
  ],
  edges: [
    { id: 'e1', from: 'web', to: 'api' },
    { id: 'e2', from: 'api', to: 'db' },
    { id: 'e3', from: 'api', to: 'mail' },
  ],
  views: [{ id: 'data', label: 'Data', nodes: ['api', 'db'] }],
};
const graph = buildGraph(draft.nodes.map((n) => n.id), draft.edges);
const run = (over: Partial<typeof INITIAL>) => emphasis(draft, graph, { ...INITIAL, ...over });

describe('emphasis', () => {
  it('is inactive and all-normal by default', () => {
    const e = run({});
    expect(e.active).toBe(false);
    expect([...e.nodes.values()]).toEqual(['normal', 'normal', 'normal', 'normal']);
    expect([...e.edges.values()].every((x) => !x.dim && x.tint === null)).toBe(true);
  });

  it('selection focuses the node and tints its direct edges with the source type', () => {
    const e = run({ selected: 'db' });
    expect(e.nodes.get('db')).toBe('focus');
    expect(e.nodes.get('web')).toBe('normal');
    expect(e.edges.get('e2')).toEqual({ dim: false, tint: 'service' });
    expect(e.edges.get('e1')).toEqual({ dim: false, tint: null });
  });

  it('trace dims everything outside the selection’s upstream and downstream', () => {
    const e = run({ selected: 'db', trace: true });
    expect(e.nodes.get('web')).toBe('normal');
    expect(e.nodes.get('mail')).toBe('dim');
    expect(e.edges.get('e1')).toEqual({ dim: false, tint: 'client' });
    expect(e.edges.get('e3')).toEqual({ dim: true, tint: null });
  });

  it('view, lens and search each dim what they exclude, and compose', () => {
    expect(run({ view: 'data' }).nodes.get('web')).toBe('dim');
    expect(run({ hiddenTypes: new Set(['database']) }).nodes.get('db')).toBe('dim');
    const s = run({ query: 'next' });
    expect([...s.nodes.entries()].filter(([, v]) => v !== 'dim').map(([k]) => k)).toEqual(['web']);
    expect(run({ view: 'data', hiddenTypes: new Set(['service']) }).nodes.get('api')).toBe('dim');
  });

  it('never dims the selected node', () => {
    expect(run({ selected: 'web', view: 'data' }).nodes.get('web')).toBe('focus');
  });

  it('an open but empty search dims nothing', () => {
    expect(run({ query: '   ' }).active).toBe(false);
  });
});

describe('searchMatches', () => {
  it('matches title, subtitle, id and type label; title prefixes first', () => {
    expect(searchMatches(draft, 'p').map((n) => n.id)).toEqual(['db', 'web', 'api']);
    expect(searchMatches(draft, 'ORDERS').map((n) => n.id)).toEqual(['api']);
    expect(searchMatches(draft, 'database').map((n) => n.id)).toEqual(['db']);
    expect(searchMatches(draft, '.*').map((n) => n.id)).toEqual([]);
    expect(searchMatches(draft, '  ')).toEqual([]);
  });
});
