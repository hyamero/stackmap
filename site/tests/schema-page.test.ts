import { describe, expect, it } from 'vitest';
import { schemaReference } from '../lib/data/schema-ref';
import { blocks, notePieces, ORDER, PLACEMENTS } from '../lib/schema-page';

describe('schema page', () => {
  it('places every section the schema generates, so a new one cannot go missing from the page', () => {
    for (const s of schemaReference()) expect(PLACEMENTS[s.name], s.name).toBeDefined();
  });

  it('shows every placed section that is not folded into the card-parts prose, in reading order', () => {
    const tables = blocks(schemaReference()).flatMap((b) => (b.kind === 'table' ? [b.section.name] : []));
    const unfolded = Object.entries(PLACEMENTS).filter(([, p]) => !p.folded).map(([name]) => name);
    expect(tables.sort()).toEqual(unfolded.sort());
    expect(ORDER[0]).toBe('Diagram');
  });

  it('writes notes as sentences and points links at the section on this page', () => {
    const groups = schemaReference()[0]!.fields.find((f) => f.key === 'groups')!;
    expect(notePieces(groups)).toEqual([{ text: 'At most 200.' }, { text: ' ' }, { text: 'See ' }, { link: 'groups[]', href: '#groups' }]);
    const card = schemaReference().find((s) => s.name === 'nodes[]')!.fields.find((f) => f.key === 'card')!;
    expect(notePieces(card).find((p) => 'href' in p)).toEqual({ link: 'nodes[].card', href: '#cards' });
  });

  it('keeps inline code as code', () => {
    const kind = schemaReference()[0]!.fields.find((f) => f.key === 'kind')!;
    const pieces = notePieces(kind);
    expect(pieces[0]).toEqual({ text: 'One of ' });
    expect(pieces).toContainEqual({ code: 'architecture' });
  });
});
