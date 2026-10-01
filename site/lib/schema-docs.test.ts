import { describe, expect, it } from 'vitest';
import { validateDiagram } from '@stackmap/schema';
import { SAMPLES } from './schema-docs';

const base = () => ({ kind: 'architecture', title: 'Sample', nodes: [{ id: 'n', type: 'service', card: { title: 'n' } }], edges: [] as unknown[] });

/** The sample dropped into a minimal diagram where it belongs. */
function placed(anchor: string, sample: (typeof SAMPLES)[string]) {
  const d: Record<string, unknown> & ReturnType<typeof base> = base();
  if (sample.place === 'array') d[anchor] = sample.value;
  else if (sample.place === 'card') d.nodes[0]!.card = sample.value as { title: string };
  else if (sample.place === 'node') Object.assign(d.nodes[0]!, { evidence: sample.value });
  else if (sample.place === 'source') d.source = sample.value;
  return d;
}

describe('schema page samples', () => {
  it.each(Object.entries(SAMPLES))('%s is valid against the real schema', (anchor, sample) => {
    const schema = validateDiagram(placed(anchor, sample)).diagnostics.filter((d) => d.code.startsWith('schema/'));
    expect(schema).toEqual([]);
  });
});
