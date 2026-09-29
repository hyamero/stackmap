import { INFRA_TYPES, isCompactKind, isLaneKind, STATE_TYPES, usesCompactCards, type DiagramDraft, type NodeType } from '@stackmap/core';
import type { Diagnostic } from '../diagnostics';

const error = (code: string, subject: string, message: string, evidence: Record<string, unknown>, allowedFixes: string[]): Diagnostic => ({
  code,
  severity: 'error',
  subject,
  message,
  evidence,
  allowedFixes,
});

// The state a component most often stands for, and back: the fix names a concrete type, not just the list.
const STATE_FOR: Partial<Record<NodeType, NodeType>> = { client: 'start', external: 'neutral', security: 'decision', queue: 'waiting' };
const INFRA_FOR: Partial<Record<NodeType, NodeType>> = { start: 'client', active: 'service', waiting: 'queue', decision: 'security', success: 'service', failure: 'external', neutral: 'external' };

const COMPACT_ONLY_SECTIONS = ['rows', 'stats', 'statsNote', 'footer', 'cta'] as const;

/** Rules that depend on the diagram kind: lanes, phases, compact cards and the node types each kind uses. */
export function kindDiagnostics(d: DiagramDraft): Diagnostic[] {
  const out: Diagnostic[] = [];
  const lanes = isLaneKind(d.kind);
  const compact = usesCompactCards(d);
  const types: readonly NodeType[] = d.kind === 'lifecycle' ? STATE_TYPES : INFRA_TYPES;
  const laneIds = (d.lanes ?? []).map((l) => l.id);

  d.nodes.forEach((n, i) => {
    if (!types.includes(n.type)) {
      const near = (d.kind === 'lifecycle' ? STATE_FOR : INFRA_FOR)[n.type];
      out.push(
        error('semantics/type-for-kind', `/nodes/${i}/type`, `A ${d.kind} diagram has no "${n.type}" nodes`, { type: n.type, kind: d.kind, allowed: types }, [
          ...(near ? [`use "${near}"`] : []),
          `use one of: ${types.join(', ')}`,
        ]),
      );
    }
    if (lanes && n.lane === undefined && d.lanes?.length)
      out.push(error('semantics/missing-lane', `/nodes/${i}`, `Node "${n.id}" has no lane`, { id: n.id, lanes: laneIds }, laneIds.slice(0, 3).map((l) => `set "lane": "${l}"`)));
    if (!lanes && n.lane !== undefined)
      out.push(error('semantics/lane-for-kind', `/nodes/${i}/lane`, `Only workflow and lifecycle nodes sit in lanes`, { kind: d.kind }, ['remove "lane"', ...(d.kind === 'sequence' ? [] : ['use "group" instead'])]));
    if (compact) {
      for (const section of COMPACT_ONLY_SECTIONS) {
        if (n.card[section] !== undefined)
          out.push(
            error('semantics/card-section-for-kind', `/nodes/${i}/card/${section}`, `${isCompactKind(d.kind) ? d.kind : 'Compact'} cards show no ${section}`, { section, kind: d.kind }, [
              `remove "${section}"`,
              'move the detail into an evidence note',
              ...(isCompactKind(d.kind) ? [] : ['remove "density" to use full cards']),
            ]),
          );
      }
    } else if (n.card.tag !== undefined) {
      out.push(error('semantics/tag-for-kind', `/nodes/${i}/card/tag`, 'Only compact cards show a tag', { kind: d.kind }, ['move it into a card row', 'remove "tag"', 'set "density": "compact"']));
    }
  });

  if (isCompactKind(d.kind) && d.density !== undefined)
    out.push({ ...error('semantics/density-ignored', '/density', `${d.kind} cards are always compact`, { kind: d.kind }, ['remove "density"']), severity: 'warning' });

  if (lanes && !d.lanes?.length)
    out.push(error('semantics/missing-lanes', '', `A ${d.kind} diagram needs "lanes"`, { kind: d.kind }, ['add "lanes": [{ "id": …, "label": … }] and set each node\'s "lane"']));
  if (!lanes && d.lanes)
    out.push(error('semantics/lanes-for-kind', '/lanes', 'Only workflow and lifecycle diagrams have lanes', { kind: d.kind }, ['remove "lanes"', ...(d.kind === 'sequence' ? [] : ['use "groups" instead'])]));
  if (lanes) {
    const used = new Set(d.nodes.map((n) => n.lane));
    d.lanes?.forEach((l, i) => {
      if (!used.has(l.id))
        out.push({ ...error('semantics/empty-lane', `/lanes/${i}`, `Lane "${l.id}" has no nodes`, { id: l.id }, [`set "lane": "${l.id}" on its nodes`, 'remove the lane']), severity: 'warning' });
    });
  }

  if ((lanes || d.kind === 'sequence') && d.direction !== undefined)
    out.push({
      ...error('semantics/direction-ignored', '/direction', `${d.kind} diagrams always flow left to right${d.kind === 'sequence' ? ' and top to bottom' : ''}`, { kind: d.kind }, ['remove "direction"']),
      severity: 'warning',
    });

  if (d.kind === 'sequence' && d.groups)
    out.push(error('semantics/groups-for-kind', '/groups', 'Sequence diagrams have no groups', { kind: d.kind }, ['remove "groups"', 'use "phases" to band messages']));
  if (lanes) {
    const laneOf = new Map(d.nodes.map((n) => [n.id, n.lane]));
    d.groups?.forEach((g, i) => {
      if (g.parent !== undefined)
        out.push(error('semantics/nested-group-for-kind', `/groups/${i}/parent`, `Groups in a ${d.kind} diagram don't nest`, { id: g.id }, ['remove "parent"']));
      const members = d.nodes.filter((n) => n.group === g.id);
      const memberLanes = [...new Set(members.map((n) => laneOf.get(n.id)))];
      if (memberLanes.length > 1)
        out.push(
          error('semantics/group-spans-lanes', `/groups/${i}`, `Group "${g.id}" spans lanes ${memberLanes.join(', ')}; a group sits inside one lane`, { id: g.id, lanes: memberLanes }, [
            'split it into one group per lane',
            'move its nodes into one lane',
          ]),
        );
    });
  }

  out.push(...phaseDiagnostics(d));
  return out;
}

function phaseDiagnostics(d: DiagramDraft): Diagnostic[] {
  const out: Diagnostic[] = [];
  if (!d.phases) return out;
  const lanes = isLaneKind(d.kind);
  const byNodes = d.kind !== 'sequence';
  const want = byNodes ? 'nodes' : 'edges';
  const other = byNodes ? 'edges' : 'nodes';
  const owner = new Map<string, number>();
  d.phases.forEach((p, i) => {
    if (p[other] !== undefined)
      out.push(error('semantics/phase-members', `/phases/${i}/${other}`, `${d.kind} phases list ${want}, not ${other}`, { kind: d.kind }, [`replace "${other}" with the "${want}" this phase spans`]));
    const members = p[want];
    if (!members?.length) {
      out.push(error('semantics/phase-members', `/phases/${i}`, `Phase "${p.id}" lists no ${want}`, { id: p.id }, [`list the ${want} this phase spans in "${want}"`, 'remove the phase']));
      return;
    }
    members.forEach((m, j) => {
      const first = owner.get(m);
      if (first !== undefined && first !== i)
        out.push(error('semantics/phase-overlap', `/phases/${i}/${want}/${j}`, `"${m}" is already in phase "${d.phases![first]!.id}"`, { id: m, phase: d.phases![first]!.id }, [`remove "${m}" from one of the two phases`]));
      else owner.set(m, i);
    });
  });

  if (byNodes && !lanes) {
    // Stages are laid out as ELK partitions of the top level: a grouped node can't take part.
    d.nodes.forEach((n, i) => {
      if (n.group !== undefined && owner.has(n.id))
        out.push(error('semantics/phase-member-in-group', `/nodes/${i}/group`, `Node "${n.id}" is in a phase and a group; phases hold ungrouped nodes`, { id: n.id }, ['remove "group"', `remove "${n.id}" from its phase`]));
      else if (!owner.has(n.id) && n.group === undefined)
        out.push({ ...error('semantics/unphased-node', `/nodes/${i}`, `Node "${n.id}" is in no phase; it is placed in its first predecessor's`, { id: n.id }, ['add it to a phase\'s "nodes"']), severity: 'warning' });
    });
  }

  if (byNodes) {
    // An edge from a later phase into an earlier one is laid out as a back edge; say so, it's usually a mistake.
    d.edges.forEach((e, i) => {
      const a = owner.get(e.from);
      const b = owner.get(e.to);
      if (a !== undefined && b !== undefined && b < a && e.kind !== 'return')
        out.push({
          ...error('semantics/phase-order', `/edges/${i}`, `Edge "${e.id}" runs from phase "${d.phases![a]!.id}" back into "${d.phases![b]!.id}"`, { id: e.id }, [
            'mark it "kind": "return" if it loops back on purpose',
            'reorder the phases',
          ]),
          severity: 'warning',
        });
    });
  }
  return out;
}
