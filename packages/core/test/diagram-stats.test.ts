import { describe, expect, it } from 'vitest';
import { countByType, TYPE_LABELS } from '../src/diagram-stats';
import { NODE_TYPES, type DiagramNode } from '../src/types';

const n = (id: string, type: DiagramNode['type']): DiagramNode => ({ id, type, card: { title: id } });

describe('countByType', () => {
  it('counts in canonical type order and omits zeroes', () => {
    const nodes = [n('a', 'database'), n('b', 'service'), n('c', 'service'), n('d', 'client')];
    expect(countByType(nodes)).toEqual([
      ['client', 1],
      ['service', 2],
      ['database', 1],
    ]);
  });

  it('has a label for every type', () => {
    for (const type of NODE_TYPES) expect(TYPE_LABELS[type]).toMatch(/^[A-Z]/);
  });
});
