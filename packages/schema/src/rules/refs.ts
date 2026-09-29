import { BRAND_SLUGS, isBrandSlug, type DiagramDraft } from '@stackmap/core';
import type { Diagnostic } from '../diagnostics';
import { closest } from '../util';

function unknownRef(code: string, subject: string, kind: string, id: string, known: string[], extraFix: string): Diagnostic {
  const near = closest(id, known);
  return {
    code,
    severity: 'error',
    subject,
    message: `Unknown ${kind} "${id}"`,
    evidence: { id, closest: near },
    allowedFixes: [...near.map((n) => `use "${n}"`), extraFix],
  };
}

/** Dangling references, group parent cycles and unknown brands. */
export function refsDiagnostics(d: DiagramDraft): Diagnostic[] {
  const out: Diagnostic[] = [];
  const nodeIds = d.nodes.map((n) => n.id);
  const nodeSet = new Set(nodeIds);
  const groups = d.groups ?? [];
  const groupIds = groups.map((g) => g.id);
  const groupSet = new Set(groupIds);

  groups.forEach((g, i) => {
    if (g.parent !== undefined && !groupSet.has(g.parent))
      out.push(unknownRef('refs/unknown-group', `/groups/${i}/parent`, 'group', g.parent, groupIds, `remove "parent" or add group "${g.parent}"`));
  });

  // Walk each parent chain; a chain that revisits a group is a cycle. Report each cycle once, at its
  // first group in document order.
  const parentOf = new Map(groups.map((g) => [g.id, g.parent]));
  const reported = new Set<string>();
  groups.forEach((g, i) => {
    const seen: string[] = [];
    let cur: string | undefined = g.id;
    while (cur !== undefined && groupSet.has(cur) && !seen.includes(cur)) {
      seen.push(cur);
      cur = parentOf.get(cur);
    }
    if (cur === undefined || !seen.includes(cur)) return;
    const cycle = seen.slice(seen.indexOf(cur));
    if (cycle[0] !== g.id) return; // g only leads into a cycle
    const key = [...cycle].sort().join(',');
    if (reported.has(key)) return;
    reported.add(key);
    out.push({
      code: 'refs/group-cycle',
      severity: 'error',
      subject: `/groups/${i}/parent`,
      message: `Group parents form a cycle: ${[...cycle, cycle[0]].join(' → ')}`,
      evidence: { cycle },
      allowedFixes: [`remove "parent" from one of: ${cycle.join(', ')}`],
    });
  });

  d.nodes.forEach((n, i) => {
    if (n.group !== undefined && !groupSet.has(n.group))
      out.push(unknownRef('refs/unknown-group', `/nodes/${i}/group`, 'group', n.group, groupIds, `remove "group" or add group "${n.group}"`));
    const brand = n.card.brand;
    if (brand !== undefined && !isBrandSlug(brand)) {
      const near = closest(brand, BRAND_SLUGS);
      out.push({
        code: 'refs/unknown-brand',
        severity: 'warning',
        subject: `/nodes/${i}/card/brand`,
        message: `No icon for brand "${brand}"; the ${n.type} icon is shown instead`,
        evidence: { brand, closest: near },
        allowedFixes: [...near.map((b) => `use "${b}"`), 'remove "brand"'],
      });
    }
  });

  d.edges.forEach((e, i) => {
    for (const end of ['from', 'to'] as const) {
      if (!nodeSet.has(e[end]))
        out.push(unknownRef('refs/unknown-node', `/edges/${i}/${end}`, 'node', e[end], nodeIds, `add node "${e[end]}" or remove the edge`));
    }
  });

  d.views?.forEach((v, i) => {
    v.nodes.forEach((id, j) => {
      if (!nodeSet.has(id))
        out.push(unknownRef('refs/unknown-view-node', `/views/${i}/nodes/${j}`, 'node', id, nodeIds, `remove "${id}" from the view`));
    });
  });

  return out;
}
