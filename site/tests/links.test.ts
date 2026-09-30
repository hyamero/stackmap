import { describe, expect, it } from 'vitest';
import { LINKS } from '../components/site/links';

describe('site links', () => {
  it('points the in-site links at routes the spec defines', () => {
    const routes = ['/', '/docs', '/docs/schema', '/examples'];
    for (const l of Object.values(LINKS).filter((l) => l.href.startsWith('/'))) {
      expect(routes.some((r) => l.href === r || l.href.startsWith(`${r}#`))).toBe(true);
    }
  });

  it('points the project links at the public repo and npm', () => {
    expect(LINKS.github.href).toBe('https://github.com/hyamero/stackmap');
    expect(LINKS.npm.href).toBe('https://www.npmjs.com/package/@hyamero/stackmap');
    expect(LINKS.contributing.href).toBe('https://github.com/hyamero/stackmap/blob/main/CONTRIBUTING.md');
  });
});
