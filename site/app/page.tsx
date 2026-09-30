import type { Metadata } from 'next';
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
    <main className="mx-auto max-w-5xl px-6 py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <h1 className="text-hero">
        Every layer of your stack, <span className="text-accent">on one map.</span>
      </h1>
      <p className="text-lede mt-6 text-fg-muted">Interactive system diagrams your coding agent writes, as one offline HTML file.</p>
      <section data-theme="dark" className="mt-16 rounded-2xl bg-page p-10 text-fg">
        <p className="text-section">No coordinates. stackmap lays it out.</p>
        <code className="text-code font-mono">npx skills add hyamero/stackmap</code>
      </section>
    </main>
  );
}
