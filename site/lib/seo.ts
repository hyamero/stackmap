import type { MetadataRoute } from 'next';
import { DIAGRAM_KINDS } from '@stackmap/core';
import { EXAMPLES, exampleHref } from './catalog';
import { kindHref } from './docs-nav';

type Env = Record<string, string | undefined>;

export const SITE_NAME = 'stackmap';
export const DESCRIPTION = 'Interactive system diagrams your coding agent writes, as one offline HTML file.';
export const REPO = 'https://github.com/hyamero/stackmap';

// Next merges metadata shallowly: a page that sets openGraph replaces the layout's, and with it the root's
// opengraph-image file, so pages spread this and it names the image (and its alt.txt) again.
export const OPEN_GRAPH = {
  type: 'website' as const,
  siteName: SITE_NAME,
  locale: 'en_US',
  images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: 'stackmap: every layer of your stack, on one map. The viewer, open on a Commerce API diagram with a route lit' }],
};

/** Every static page; the sitemap test fails when a page.tsx is added without its route here. */
export const ROUTES = ['/', '/docs', '/docs/viewer', '/docs/cli', '/docs/schema', '/docs/brands', '/examples'] as const;

// Vercel sets the production domain on every deployment, previews included, so canonical and OG URLs
// never point at a preview. It follows a custom domain once one is attached.
export function siteUrl(env: Env = process.env): URL {
  return new URL(`https://${env.VERCEL_PROJECT_PRODUCTION_URL ?? 'stackmap-site-hyameros-projects.vercel.app'}`);
}

export function robotsFor(env: Env = process.env): MetadataRoute.Robots {
  if (env.VERCEL_ENV !== 'production') return { rules: { userAgent: '*', disallow: '/' } };
  return { rules: { userAgent: '*', allow: '/' }, sitemap: new URL('/sitemap.xml', siteUrl(env)).href };
}

export function sitemapFor(base: URL = siteUrl()): MetadataRoute.Sitemap {
  return [...ROUTES, ...DIAGRAM_KINDS.map(kindHref), ...EXAMPLES.map(exampleHref)].map((route) => ({ url: new URL(route, base).href }));
}

export function softwareApplication(base: URL, version: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    description: DESCRIPTION,
    url: base.href,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'macOS, Linux, Windows',
    softwareVersion: version,
    license: 'https://opensource.org/licenses/MIT',
    codeRepository: REPO,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
}
