import { describe, expect, it } from 'vitest';
import { search, type SearchEntry } from './search';

const e = (title: string, context: string, kind: SearchEntry['kind'], words = '', suggested?: true): SearchEntry => ({ title, context, href: '/x', kind, words, suggested });

const INDEX = [
  e('Quick start', 'Quick start · Get started', 'page', 'install', true),
  e('serve', 'The CLI', 'section', 'live reload port'),
  e('stackmap serve', 'The CLI · Live viewer that reloads on save', 'command'),
  e('brand', 'Schema · Cards', 'field', 'brand string Simple-icons slug'),
  e('Brand slugs', 'Brand slugs · Reference', 'page', 'logos'),
  e('title', 'Schema · Cards', 'field', 'title string Card title'),
];

describe('docs search', () => {
  it('suggests pages before anything is typed', () => {
    expect(search(INDEX, '  ').map((r) => r.title)).toEqual(['Quick start']);
  });

  it('puts the exact title first, then titles that start with the query, then the rest', () => {
    expect(search(INDEX, 'serve').map((r) => r.title)).toEqual(['serve', 'stackmap serve']);
    expect(search(INDEX, 'brand').map((r) => r.title)).toEqual(['brand', 'Brand slugs']);
  });

  it('needs every word, from the title, context or extra words', () => {
    expect(search(INDEX, 'reload port').map((r) => r.title)).toEqual(['serve']);
    expect(search(INDEX, 'nothing here')).toEqual([]);
  });

  it('never matches a field by the page it is on', () => {
    expect(search(INDEX, 'cards').map((r) => r.kind)).not.toContain('field');
  });
});
