import { BRANDS } from './brands.gen';

// Curated infra/dev marks, CC0 only (Q21), generated from simple-icons by scripts/gen-brand-icons.ts.
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
