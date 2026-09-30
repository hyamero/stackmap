import type { Metadata } from 'next';
import { Landing } from '@/components/landing/Landing';
import { CHECKOUT, DEMO } from '@/lib/diagrams';
import { SITE } from '@/lib/site-data';
import { OPEN_GRAPH, siteUrl, softwareApplication } from '@/lib/seo';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { ...OPEN_GRAPH, url: '/' },
};

// Escaping `<` keeps a string in the data from closing the script tag early.
const jsonLd = JSON.stringify(softwareApplication(siteUrl(), SITE.version)).replace(/</g, '\\u003c');

export default function Home() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <Landing demo={DEMO} checkout={CHECKOUT} />
    </main>
  );
}
