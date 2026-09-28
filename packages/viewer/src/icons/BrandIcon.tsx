import {
  siApachekafka,
  siCloudflare,
  siDocker,
  siElasticsearch,
  siGithub,
  siGraphql,
  siKubernetes,
  siMongodb,
  siMysql,
  siNextdotjs,
  siNginx,
  siNodedotjs,
  siPostgresql,
  siRabbitmq,
  siRedis,
  siSqlite,
  siStripe,
  siSupabase,
  siVercel,
} from 'simple-icons';

// M0 allowlist; expanded to ~150 CC0 marks in M3. Named imports keep the rest of simple-icons out of the bundle.
const BRANDS: Record<string, { title: string; path: string }> = Object.fromEntries(
  [
    siApachekafka,
    siCloudflare,
    siDocker,
    siElasticsearch,
    siGithub,
    siGraphql,
    siKubernetes,
    siMongodb,
    siMysql,
    siNextdotjs,
    siNginx,
    siNodedotjs,
    siPostgresql,
    siRabbitmq,
    siRedis,
    siSqlite,
    siStripe,
    siSupabase,
    siVercel,
  ].map((icon) => [icon.slug, { title: icon.title, path: icon.path }]),
);

/** Sorted, for the parity test against core's BRAND_SLUGS. */
export const BRANDED_SLUGS: string[] = Object.keys(BRANDS).sort();

export const hasBrand = (slug: string): boolean => Object.hasOwn(BRANDS, slug);

export function BrandIcon({ slug, size }: { slug: string; size: number }) {
  if (!hasBrand(slug)) return null;
  const icon = BRANDS[slug]!;
  return (
    <svg role="img" aria-label={icon.title} data-icon="brand" viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d={icon.path} />
    </svg>
  );
}
