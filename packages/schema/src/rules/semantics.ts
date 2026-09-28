import type { DiagramDraft } from '@stackmap/core';
import type { Diagnostic } from '../diagnostics';

function duplicates(items: { id: string }[] | undefined, collection: string): Diagnostic[] {
  const first = new Map<string, number>();
  const out: Diagnostic[] = [];
  items?.forEach(({ id }, i) => {
    const at = first.get(id);
    if (at === undefined) return void first.set(id, i);
    out.push({
      code: 'semantics/duplicate-id',
      severity: 'error',
      subject: `/${collection}/${i}/id`,
      message: `Duplicate ${collection.slice(0, -1)} id "${id}"`,
      evidence: { id, first: `/${collection}/${at}/id` },
      allowedFixes: [`rename to a unique id, e.g. "${id}-${i + 1}"`, 'remove the duplicate'],
    });
  });
  return out;
}

/** Tarjan's strongly connected components; returns components with more than one node, in discovery order. */
function cycles(nodes: string[], edges: [string, string][]): string[][] {
  const adj = new Map(nodes.map((n) => [n, [] as string[]]));
  for (const [a, b] of edges) if (a !== b && adj.has(a) && adj.has(b)) adj.get(a)!.push(b);
  let index = 0;
  const idx = new Map<string, number>();
  const low = new Map<string, number>();
  const stack: string[] = [];
  const on = new Set<string>();
  const out: string[][] = [];
  const visit = (v: string) => {
    idx.set(v, index);
    low.set(v, index++);
    stack.push(v);
    on.add(v);
    for (const w of adj.get(v)!) {
      if (!idx.has(w)) {
        visit(w);
        low.set(v, Math.min(low.get(v)!, low.get(w)!));
      } else if (on.has(w)) low.set(v, Math.min(low.get(v)!, idx.get(w)!));
    }
    if (low.get(v) === idx.get(v)) {
      const comp: string[] = [];
      let w: string;
      do {
        w = stack.pop()!;
        on.delete(w);
        comp.push(w);
      } while (w !== v);
      if (comp.length > 1) out.push(comp.sort((a, b) => nodes.indexOf(a) - nodes.indexOf(b)));
    }
  };
  for (const n of nodes) if (!idx.has(n)) visit(n);
  return out;
}

/** Duplicate ids, orphans, self-loops, dataflow cycles, empty views and groups. */
export function semanticsDiagnostics(d: DiagramDraft): Diagnostic[] {
  const out: Diagnostic[] = [
    ...duplicates(d.nodes, 'nodes'),
    ...duplicates(d.edges, 'edges'),
    ...duplicates(d.groups, 'groups'),
    ...duplicates(d.views, 'views'),
  ];

  const linked = new Set(d.edges.flatMap((e) => [e.from, e.to]));
  if (d.nodes.length > 1) {
    d.nodes.forEach((n, i) => {
      if (!linked.has(n.id))
        out.push({
          code: 'semantics/orphan-node',
          severity: 'warning',
          subject: `/nodes/${i}`,
          message: `Node "${n.id}" has no connections`,
          evidence: { id: n.id },
          allowedFixes: [`add an edge to or from "${n.id}"`, 'remove the node'],
        });
    });
  }

  d.edges.forEach((e, i) => {
    if (e.from === e.to)
      out.push({
        code: 'semantics/self-loop',
        severity: 'warning',
        subject: `/edges/${i}`,
        message: `Edge "${e.id}" connects "${e.from}" to itself`,
        evidence: { id: e.id, node: e.from },
        allowedFixes: ['remove the edge', 'describe the loop in a card row instead'],
      });
  });

  if (d.kind === 'dataflow') {
    for (const comp of cycles(d.nodes.map((n) => n.id), d.edges.map((e) => [e.from, e.to]))) {
      const members = new Set(comp);
      const i = d.edges.findIndex((e) => members.has(e.from) && members.has(e.to) && e.from !== e.to);
      out.push({
        code: 'semantics/dataflow-cycle',
        severity: 'warning',
        subject: `/edges/${i}`,
        message: `Data flows in a cycle through: ${comp.join(', ')}`,
        evidence: { nodes: comp },
        allowedFixes: ['remove or reverse the edge that feeds back', 'mark the feedback edge "kind": "async"'],
      });
    }
  }

  d.views?.forEach((v, i) => {
    if (v.nodes.length === 0)
      out.push({
        code: 'semantics/empty-view',
        severity: 'error',
        subject: `/views/${i}/nodes`,
        message: `View "${v.id}" focuses no nodes`,
        evidence: { id: v.id },
        allowedFixes: ['list the node ids this view focuses', 'remove the view'],
      });
  });

  const used = new Set([...d.nodes.map((n) => n.group), ...(d.groups ?? []).map((g) => g.parent)]);
  d.groups?.forEach((g, i) => {
    if (!used.has(g.id))
      out.push({
        code: 'semantics/empty-group',
        severity: 'warning',
        subject: `/groups/${i}`,
        message: `Group "${g.id}" contains no nodes or groups`,
        evidence: { id: g.id },
        allowedFixes: [`set "group": "${g.id}" on its nodes`, 'remove the group'],
      });
  });

  return out;
}
