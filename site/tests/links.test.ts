import { describe, expect, it } from 'vitest';
import { LINKS } from '../components/site/links';
import { ROUTES } from '../lib/seo';

describe('site links', () => {
  it('points the in-site links at pages the site has', () => {
    for (const l of Object.values(LINKS).filter((l) => l.href.startsWith('/'))) {
      expect(ROUTES.some((r) => l.href === r || l.href.startsWith(`${r}#`)), l.href).toBe(true);
    }
  });

  it('points the project links at the public repo and npm', () => {
    expect(LINKS.github.href).toBe('https://github.com/omsimos/stackmap');
    expect(LINKS.npm.href).toBe('https://www.npmjs.com/package/@omsimos/stackmap');
    expect(LINKS.contributing.href).toBe('https://github.com/omsimos/stackmap/blob/main/CONTRIBUTING.md');
  });
});
