import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DIAGRAM_KINDS } from '@stackmap/core';
import { SLOT_COUNT, SLOTS } from '../lib/checkout';

const draft = (kind: string) => JSON.parse(readFileSync(new URL(`../content/checkout/${kind}.json`, import.meta.url), 'utf8')) as { kind: string; nodes: { id: string }[] };

describe('checkout slots', () => {
  it('has one checkout per kind', () => {
    for (const kind of DIAGRAM_KINDS) expect(draft(kind).kind).toBe(kind);
  });

  it('puts every node of every kind in exactly one slot', () => {
    for (const kind of DIAGRAM_KINDS) {
      const slots = SLOTS[kind];
      expect(slots).toHaveLength(SLOT_COUNT);
      expect(slots.filter(Boolean).sort()).toEqual(draft(kind).nodes.map((n) => n.id).sort());
    }
  });
});
