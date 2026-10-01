import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DIAGRAM_KINDS } from '@stackmap/core';

const draft = (kind: string) => JSON.parse(readFileSync(new URL(`../content/checkout/${kind}.json`, import.meta.url), 'utf8')) as { kind: string };

describe('checkout', () => {
  // The landing's #kinds draws one checkout as every kind.
  it('has one checkout per kind', () => {
    for (const kind of DIAGRAM_KINDS) expect(draft(kind).kind).toBe(kind);
  });
});
