import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DIAGRAM_KINDS } from '@stackmap/core';
import { ROUTES, robotsFor, siteUrl, sitemapFor, softwareApplication } from './seo';

const site = fileURLToPath(new URL('..', import.meta.url));
const read = (path: string) => readFileSync(join(site, path));

/** Every route with a page.tsx, skipping dynamic segments and route groups' names. */
function pageRoutes(dir = join(site, 'app')): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const path = join(dir, e.name);
    if (e.isDirectory()) return e.name.startsWith('[') ? [] : pageRoutes(path);
    if (e.name !== 'page.tsx') return [];
    const segments = relative(join(site, 'app'), dir).split(sep).filter((s) => s && !s.startsWith('('));
    return [`/${segments.join('/')}`];
  });
}

describe('siteUrl', () => {
  it('uses the production domain Vercel reports', () => {
    expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'stackmap.dev' }).href).toBe('https://stackmap.dev/');
  });

  it('falls back to the project domain outside Vercel', () => {
    expect(siteUrl({}).href).toBe('https://stackmap-site-hyameros-projects.vercel.app/');
  });
});

describe('robots', () => {
  it('lets crawlers in on production and points them at the sitemap', () => {
    const r = robotsFor({ VERCEL_ENV: 'production', VERCEL_PROJECT_PRODUCTION_URL: 'stackmap.dev' });
    expect(r.rules).toEqual({ userAgent: '*', allow: '/' });
    expect(r.sitemap).toBe('https://stackmap.dev/sitemap.xml');
  });

  it('keeps previews and local builds out of the index', () => {
    for (const env of [{ VERCEL_ENV: 'preview' }, {}]) {
      expect(robotsFor(env).rules).toEqual({ userAgent: '*', disallow: '/' });
    }
  });
});

describe('sitemap', () => {
  it('lists exactly the static pages the app has', () => {
    expect([...ROUTES].sort()).toEqual(pageRoutes().sort());
  });

  it('uses absolute URLs', () => {
    const urls = sitemapFor(new URL('https://stackmap.dev')).map((e) => e.url);
    expect(urls).toContain('https://stackmap.dev/');
    for (const u of urls) expect(u).toMatch(/^https:\/\/stackmap\.dev\//);
  });

  it('lists a docs page for each kind of diagram and a page for each example', () => {
    const urls = sitemapFor(new URL('https://stackmap.dev')).map((e) => e.url);
    for (const kind of DIAGRAM_KINDS) expect(urls).toContain(`https://stackmap.dev/docs/${kind}`);
    expect(urls).toContain('https://stackmap.dev/examples/food-delivery');
    expect(urls).toContain('https://stackmap.dev/examples/web-app');
  });
});

describe('structured data', () => {
  it('describes the CLI as MIT-licensed software at the current version', () => {
    const ld = softwareApplication(new URL('https://stackmap.dev'), '1.2.3');
    expect(ld).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'stackmap',
      softwareVersion: '1.2.3',
      license: 'https://opensource.org/licenses/MIT',
      url: 'https://stackmap.dev/',
    });
  });
});

describe('brand files', () => {
  // The app/ and public/ copies exist because Next only serves icons from there; assets/brand is the source.
  const copies: [string, string][] = [
    ['app/icon.svg', 'stackmap-favicon.svg'],
    ['app/apple-icon.png', 'stackmap-apple-touch-icon-180.png'],
    ['app/opengraph-image.png', 'stackmap-social-card.png'],
    ['app/twitter-image.png', 'stackmap-social-card.png'],
    ['public/brand/stackmap-app-icon-512.png', 'stackmap-app-icon-512.png'],
  ];

  it.each(copies)('%s matches assets/brand/%s', (copy, source) => {
    expect(read(copy).equals(read(`../assets/brand/${source}`))).toBe(true);
  });

  it('packs the 16 and 32 px favicons into favicon.ico', () => {
    const ico = read('app/favicon.ico');
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt16LE(4)).toBe(2);
    expect([ico[6], ico[22]]).toEqual([16, 32]);
  });
});
