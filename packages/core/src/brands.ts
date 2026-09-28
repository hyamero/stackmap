/**
 * simple-icons slugs the viewer can draw in a card's icon tile. The validator checks `card.brand` against
 * this list; the viewer's icon map must match it exactly (enforced by a viewer test).
 */
export const BRAND_SLUGS = [
  'apachekafka',
  'cloudflare',
  'docker',
  'elasticsearch',
  'github',
  'graphql',
  'kubernetes',
  'mongodb',
  'mysql',
  'nextdotjs',
  'nginx',
  'nodedotjs',
  'postgresql',
  'rabbitmq',
  'redis',
  'sqlite',
  'stripe',
  'supabase',
  'vercel',
] as const;

export type BrandSlug = (typeof BRAND_SLUGS)[number];

const SLUGS: ReadonlySet<string> = new Set(BRAND_SLUGS);
export const isBrandSlug = (s: string): s is BrandSlug => SLUGS.has(s);
