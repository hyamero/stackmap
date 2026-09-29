import { writeFileSync } from 'node:fs';
import { GALLERY } from '@stackmap/core/samples';
import { layoutDiagram } from './src/index';
const out = process.argv[2]!;
for (const [name, d] of Object.entries(GALLERY)) {
  if (!['workflow', 'lifecycle'].includes(d.kind)) continue;
  const l = await layoutDiagram(d);
  const el: string[] = [];
  for (const [id, r] of Object.entries(l.lanes ?? {})) el.push(`<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" rx="14" fill="#f6f6f4" stroke="#ccc"/><text x="${r.x + 16}" y="${r.y + 22}" font-size="12" fill="#777">${d.lanes!.find((x) => x.id === id)!.label}</text>`);
  for (const [id, r] of Object.entries(l.phases ?? {})) el.push(`<line x1="${r.x}" x2="${r.x + r.width}" y1="${r.y + r.height - 6}" y2="${r.y + r.height - 6}" stroke="#bbb"/><text x="${r.x + r.width / 2}" y="${r.y + 20}" text-anchor="middle" font-size="12">${d.phases!.find((x) => x.id === id)!.label}</text>`);
  for (const [id, r] of Object.entries(l.groups)) el.push(`<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" rx="12" fill="none" stroke="#999" stroke-dasharray="4 3"/><text x="${r.x + 10}" y="${r.y + 18}" font-size="11" fill="#777">${d.groups!.find((x) => x.id === id)!.label}</text>`);
  for (const e of d.edges) { const p = l.edges[e.id]; if (!p) continue; const c = e.tone === 'error' ? '#c4432f' : e.tone === 'security' ? '#b83c74' : e.tone === 'main' ? '#161616' : '#8a8a86'; el.push(`<polyline points="${p.map((q) => `${q.x},${q.y}`).join(' ')}" fill="none" stroke="${c}" stroke-width="${e.tone === 'main' ? 2 : 1.25}" ${e.kind === 'async' ? 'stroke-dasharray="5 4"' : e.kind === 'return' ? 'stroke-dasharray="2 3"' : ''} marker-end="url(#a)"/>`); }
  for (const n of d.nodes) { const r = l.nodes[n.id]!; el.push(`<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" rx="12" fill="#e8ebfa" stroke="#aab"/><text x="${r.x + 12}" y="${r.y + 26}" font-size="13">${n.card.title}</text><text x="${r.x + 12}" y="${r.y + 44}" font-size="11" fill="#666">${n.type}</text>`); }
  for (const e of d.edges) { const p = l.labels?.[e.id]; if (p && e.label) el.push(`<rect x="${p.x - e.label.length * 3.3 - 8}" y="${p.y - 10}" width="${e.label.length * 6.6 + 16}" height="20" rx="10" fill="#fff" stroke="#ddd"/><text x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-size="11" fill="#555">${e.label}</text>`); }
  writeFileSync(`${out}/${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${l.bounds.width}" height="${l.bounds.height}" font-family="sans-serif"><defs><marker id="a" viewBox="0 0 7 6" markerWidth="7" markerHeight="6" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#555"/></marker></defs><rect width="100%" height="100%" fill="#fff"/>${el.join('')}</svg>`);
  console.log(name, l.bounds);
}
