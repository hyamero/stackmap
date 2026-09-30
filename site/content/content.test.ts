import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validateDiagram } from '@stackmap/schema';

const dir = (sub: string) => new URL(`./${sub}/`, import.meta.url);
const read = (sub: string, file: string) => JSON.parse(readFileSync(new URL(file, dir(sub)), 'utf8')) as Record<string, unknown>;
const files = (sub: string) => readdirSync(dir(sub)).filter((f) => f.endsWith('.json')).sort();

const EXAMPLES = ['bookshop.json', 'food-delivery.json', 'ml-feature-platform.json', 'production-vpc.json', 'repo-architecture.json'];

describe('site content', () => {
  it('has the five agent-written examples', () => {
    expect(files('examples')).toEqual(EXAMPLES);
  });

  for (const [sub, file] of [...EXAMPLES.map((f) => ['examples', f]), ['demo', 'commerce-api.json'], ['docs', 'quick-start.json'], ...files('checkout').map((f) => ['checkout', f])] as const) {
    it(`${sub}/${file} validates with no diagnostics`, () => {
      const result = validateDiagram(read(sub, file));
      expect(result.diagnostics).toEqual([]);
      expect(result.ok).toBe(true);
    });

    it(`${sub}/${file} has no $schema pin`, () => {
      expect(read(sub, file)).not.toHaveProperty('$schema');
    });
  }

  it('the demo is the landing page diagram: 11 nodes, 11 connections, two views', () => {
    const demo = read('demo', 'commerce-api.json') as { nodes: unknown[]; edges: unknown[]; views: { id: string }[] };
    expect(demo.nodes).toHaveLength(11);
    expect(demo.edges).toHaveLength(11);
    expect(demo.views.map((v) => v.id)).toEqual(['checkout', 'data']);
  });
});
