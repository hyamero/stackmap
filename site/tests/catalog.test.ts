import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GALLERY } from '@stackmap/core/gallery';
import { DIAGRAM_KINDS } from '@stackmap/core';
import { EXAMPLES, id, SKILL_EXAMPLE } from '../lib/catalog';

const kindOf = (dir: string, file: string) => (JSON.parse(readFileSync(new URL(`${dir}${file}`, import.meta.url), 'utf8')) as { kind: string }).kind;
const jsonStems = (dir: string) =>
  readdirSync(new URL(dir, import.meta.url))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));

describe('example catalog', () => {
  it('holds the sixteen diagrams the page promises: every gallery sample and every agent-written example', () => {
    expect(EXAMPLES).toHaveLength(16);
    expect(EXAMPLES.filter((e) => e.source === 'gallery').map((e) => e.key).sort()).toEqual(Object.keys(GALLERY).sort());
    expect(EXAMPLES.filter((e) => e.source === 'examples').map((e) => e.key).sort()).toEqual(jsonStems('../content/examples/').sort());
    expect(new Set(EXAMPLES.map(id)).size).toBe(16);
  });

  it('files each diagram under the kind it declares', () => {
    for (const e of EXAMPLES) {
      const kind = e.source === 'gallery' ? GALLERY[e.key as keyof typeof GALLERY].kind : kindOf('../content/examples/', `${e.key}.json`);
      expect(e.kind, e.key).toBe(kind);
    }
  });

  it('carries the eval request for exactly the agent-written examples', () => {
    for (const e of EXAMPLES) expect(!!e.prompt, e.key).toBe(e.source === 'examples');
  });

  it('names a skill example of the right kind for every kind', () => {
    expect(Object.keys(SKILL_EXAMPLE).sort()).toEqual([...DIAGRAM_KINDS].sort());
    for (const [kind, file] of Object.entries(SKILL_EXAMPLE)) expect(kindOf('../../skill/examples/', `${file}.json`)).toBe(kind);
  });
});
