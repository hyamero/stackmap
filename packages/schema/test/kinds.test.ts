import { describe, expect, it } from 'vitest';
import { validateDiagram } from '../src/validate';

const workflow = (over: Record<string, unknown> = {}) => ({
  kind: 'workflow',
  title: 'Release',
  lanes: [
    { id: 'dev', label: 'Developer' },
    { id: 'ci', label: 'CI' },
  ],
  nodes: [
    { id: 'commit', type: 'client', lane: 'dev', card: { title: 'Commit' } },
    { id: 'build', type: 'service', lane: 'ci', card: { title: 'Build', tag: 'reproducible' } },
  ],
  edges: [{ id: 'e1', from: 'commit', to: 'build', tone: 'main' }],
  ...over,
});
const codes = (input: unknown) => validateDiagram(input).diagnostics.map((d) => `${d.severity}:${d.code}@${d.subject}`);

describe('kind rules', () => {
  it('accepts a workflow with lanes, phases, tags, tones and notes', () => {
    const d = workflow({
      phases: [
        { id: 'change', label: 'Change', nodes: ['commit'] },
        { id: 'verify', label: 'Verify', nodes: ['build'] },
      ],
      notes: [{ title: 'Happy path', items: ['Every change is built once'] }],
    });
    expect(validateDiagram(d)).toMatchObject({ ok: true, diagnostics: [] });
  });

  it('requires lanes and a lane per node in lane kinds', () => {
    expect(codes(workflow({ lanes: undefined, nodes: [{ id: 'a', type: 'service', card: { title: 'A' } }], edges: [] }))).toEqual(['error:semantics/missing-lanes@']);
    const noLane = workflow({ nodes: [{ id: 'a', type: 'service', card: { title: 'A' } }, { id: 'b', type: 'service', lane: 'dev', card: { title: 'B' } }], edges: [{ id: 'e', from: 'a', to: 'b' }] });
    expect(codes(noLane)).toEqual(['error:semantics/missing-lane@/nodes/0', 'warning:semantics/empty-lane@/lanes/1']);
    expect(validateDiagram(noLane).diagnostics[0]!.allowedFixes).toEqual(['set "lane": "dev"', 'set "lane": "ci"']);
  });

  it('reports unknown lanes with the closest id', () => {
    const d = workflow({ nodes: [{ id: 'commit', type: 'client', lane: 'devs', card: { title: 'Commit' } }, { id: 'build', type: 'service', lane: 'ci', card: { title: 'Build' } }] });
    const [diag] = validateDiagram(d).diagnostics;
    expect(diag).toMatchObject({ code: 'refs/unknown-lane', subject: '/nodes/0/lane', allowedFixes: ['use "dev"', 'add lane "devs"'] });
  });

  it('keeps lanes, tags and phases out of the kinds that have none', () => {
    const arch = {
      kind: 'architecture',
      title: 'T',
      lanes: [{ id: 'l', label: 'L' }],
      phases: [{ id: 'p', label: 'P', nodes: ['a'] }],
      nodes: [{ id: 'a', type: 'service', lane: 'l', card: { title: 'A', tag: 'x' } }],
      edges: [],
    };
    expect(codes(arch)).toEqual([
      'error:semantics/lane-for-kind@/nodes/0/lane',
      'error:semantics/tag-for-kind@/nodes/0/card/tag',
      'error:semantics/lanes-for-kind@/lanes',
    ]);
  });

  it('lifecycle nodes are states; other kinds use component types', () => {
    const life = workflow({ kind: 'lifecycle', nodes: [{ id: 'commit', type: 'client', lane: 'dev', card: { title: 'Queued' } }, { id: 'build', type: 'active', lane: 'ci', card: { title: 'Running' } }] });
    const [diag] = validateDiagram(life).diagnostics;
    expect(diag).toMatchObject({ code: 'semantics/type-for-kind', subject: '/nodes/0/type', allowedFixes: ['use "start"', 'use one of: start, active, waiting, decision, success, failure, neutral'] });
    expect(codes(workflow({ nodes: [{ id: 'commit', type: 'success', lane: 'dev', card: { title: 'C' } }, { id: 'build', type: 'service', lane: 'ci', card: { title: 'B' } }] }))).toEqual([
      'error:semantics/type-for-kind@/nodes/0/type',
    ]);
  });

  it('compact cards reject full-card sections', () => {
    const d = workflow({ nodes: [{ id: 'commit', type: 'client', lane: 'dev', card: { title: 'C', rows: [{ label: 'k', value: 'v' }], cta: { label: 'Open' } } }, { id: 'build', type: 'service', lane: 'ci', card: { title: 'B' } }] });
    expect(codes(d)).toEqual(['error:semantics/card-section-for-kind@/nodes/0/card/rows', 'error:semantics/card-section-for-kind@/nodes/0/card/cta']);
  });

  it('checks phase members, overlaps and order', () => {
    expect(codes(workflow({ phases: [{ id: 'p', label: 'P', edges: ['e1'] }] }))).toEqual(['error:semantics/phase-members@/phases/0/edges', 'error:semantics/phase-members@/phases/0']);
    expect(codes(workflow({ phases: [{ id: 'p', label: 'P', nodes: ['commit'] }, { id: 'q', label: 'Q', nodes: ['commit', 'build'] }] }))).toEqual([
      'error:semantics/phase-overlap@/phases/1/nodes/0',
    ]);
    expect(codes(workflow({ phases: [{ id: 'p', label: 'P', nodes: ['build'] }, { id: 'q', label: 'Q', nodes: ['commit'] }] }))).toEqual(['warning:semantics/phase-order@/edges/0']);
    expect(codes(workflow({ phases: [{ id: 'p', label: 'P', nodes: ['ghost'] }] }))[0]).toBe('error:refs/unknown-phase-node@/phases/0/nodes/0');
  });

  it('a group in a lane kind sits in one lane and does not nest', () => {
    const d = workflow({
      groups: [{ id: 'g', label: 'G' }, { id: 'h', label: 'H', parent: 'g' }],
      nodes: [
        { id: 'commit', type: 'client', lane: 'dev', group: 'g', card: { title: 'C' } },
        { id: 'build', type: 'service', lane: 'ci', group: 'g', card: { title: 'B' } },
      ],
    });
    expect(codes(d)).toEqual(['warning:semantics/empty-group@/groups/1', 'error:semantics/group-spans-lanes@/groups/0', 'error:semantics/nested-group-for-kind@/groups/1/parent']);
  });

  it('architecture and dataflow take stage phases of ungrouped nodes, and compact cards on request', () => {
    const flow = {
      kind: 'dataflow',
      title: 'T',
      density: 'compact',
      groups: [{ id: 'g', label: 'G' }],
      phases: [{ id: 'src', label: 'Sources', nodes: ['a', 'b'] }],
      nodes: [
        { id: 'a', type: 'client', card: { title: 'A', tag: 'SDK' } },
        { id: 'b', type: 'service', group: 'g', card: { title: 'B' } },
        { id: 'c', type: 'database', card: { title: 'C', rows: [{ label: 'k', value: 'v' }] } },
      ],
      edges: [
        { id: 'e1', from: 'a', to: 'b' },
        { id: 'e2', from: 'b', to: 'c' },
      ],
    };
    expect(codes(flow)).toEqual(['error:semantics/card-section-for-kind@/nodes/2/card/rows', 'error:semantics/phase-member-in-group@/nodes/1/group', 'warning:semantics/unphased-node@/nodes/2']);
    expect(codes({ ...flow, kind: 'workflow', lanes: [{ id: 'l', label: 'L' }], groups: undefined, phases: undefined, nodes: flow.nodes.map((n) => ({ ...n, group: undefined, lane: 'l', card: { title: n.card.title } })) })).toEqual([
      'warning:semantics/density-ignored@/density',
    ]);
  });

  it('warns that lane kinds ignore direction', () => {
    expect(codes(workflow({ direction: 'DOWN' }))).toEqual(['warning:semantics/direction-ignored@/direction']);
  });

  it('measures compact cards against the compact budget', () => {
    const d = workflow({ nodes: [{ id: 'commit', type: 'client', lane: 'dev', card: { title: 'Production deployment approval' } }, { id: 'build', type: 'service', lane: 'ci', card: { title: 'B' } }] });
    const [diag] = validateDiagram(d).diagnostics;
    expect(diag).toMatchObject({ code: 'card-fit/overflow', subject: '/nodes/0/card/title', evidence: { maxWidth: 114 } });
    expect(diag!.allowedFixes).toContain('move the detail into an evidence note');
  });
});
