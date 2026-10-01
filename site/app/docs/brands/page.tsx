import type { Metadata } from 'next';
import { Check } from 'lucide-react';
import { BRAND_SLUGS } from '@stackmap/core';
import { BRANDS } from '@stackmap/viewer/src/icons/brands.gen';
import { BrandGrid } from '@/components/docs/BrandGrid';
import { DocsShell } from '@/components/docs/DocsShell';
import { C, DocHead, P } from '@/components/docs/prose';
import { OPEN_GRAPH } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Brand slugs',
  description: 'Every logo a stackmap card can show: the Simple Icons slugs nodes[].card.brand accepts.',
  alternates: { canonical: '/docs/brands' },
  openGraph: { ...OPEN_GRAPH, url: '/docs/brands' },
};

export default function BrandsPage() {
  return (
    <DocsShell href="/docs/brands">
      <DocHead
        crumb="Reference"
        title="Brand slugs"
        lede={
          <>
            The values <C>nodes[].card.brand</C> accepts, all {BRAND_SLUGS.length} from Simple Icons (CC0). Anything else is a warning, and the card shows its type icon
            instead.
          </>
        }
      />
      <P muted>The logo only sits in the icon tile; the node’s type still sets the colour. Click a slug to copy it.</P>
      <BrandGrid total={BRAND_SLUGS.length}>
        {BRAND_SLUGS.map((slug) => {
          const b = BRANDS[slug]!;
          return (
            <li key={slug} id={slug} className="br" data-slug={slug} data-hay={`${slug} ${b.title.toLowerCase()}`}>
              <button type="button" className="br-b" aria-label={`Copy ${slug} (${b.title})`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={b.path} />
                </svg>
                <span className="br-t">
                  <span className="mono">{slug}</span>
                  <span className="br-n2">{b.title}</span>
                </span>
                <span className="br-ok" aria-hidden="true">
                  <Check size={12} strokeWidth={2.5} />
                </span>
              </button>
            </li>
          );
        })}
      </BrandGrid>
    </DocsShell>
  );
}
