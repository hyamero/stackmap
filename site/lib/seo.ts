import type { MetadataRoute } from 'next';

type Env = Record<string, string | undefined>;

export const SITE_NAME = 'stackmap';
export const DESCRIPTION = 'Interactive system diagrams your coding agent writes, as one offline HTML file.';
export const REPO = 'https://github.com/hyamero/stackmap';

// Next merges metadata shallowly: a page that sets openGraph replaces the layout's, so pages spread this.
export const OPEN_GRAPH = { type: 'website', siteName: SITE_NAME, locale: 'en_US' } as const;

/** Every static page; the sitemap test fails when a page.tsx is added without its route here. */
export const ROUTES = ['/', '/docs', '/docs/schema'] as const;

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
  return ROUTES.map((route) => ({ url: new URL(route, base).href }));
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
