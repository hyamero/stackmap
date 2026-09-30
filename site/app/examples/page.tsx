import type { Metadata } from 'next';
import { DIAGRAM_KINDS, KIND_LABELS } from '@stackmap/core';
import { Gallery, type Filter } from '@/components/examples/Gallery';
import { galleryProps } from '@/components/examples/gallery-props';
import { EXAMPLES } from '@/lib/catalog';
import { OPEN_GRAPH } from '@/lib/seo';
import { spell } from '@/lib/words';

export const metadata: Metadata = {
  title: 'Examples',
  description: 'Sixteen diagrams laid out by stackmap across its five kinds, five of them written by coding agents. Open any of them in the viewer.',
  alternates: { canonical: '/examples' },
  openGraph: { ...OPEN_GRAPH, url: '/examples' },
};

const FILTERS: Filter[] = [
  { id: 'all', label: 'All' },
  ...DIAGRAM_KINDS.map((k) => ({ id: k, label: KIND_LABELS[k], kind: KIND_LABELS[k] })),
  { id: 'agent', label: 'Written by an agent', agent: true },
];

const agents = EXAMPLES.filter((e) => e.prompt).length;

export default function ExamplesPage() {
  const { items, thumbs } = galleryProps(EXAMPLES);
  return (
    <main data-theme="light" className="bg-page text-fg">
      <div className="mx-auto max-w-[1440px] px-5 pt-28 pb-28 md:px-10 lg:pt-[120px] xl:px-24">
        <h1 className="text-mega">Examples.</h1>
        <p className="mt-6 max-w-[780px] text-lede text-fg-muted">
          {spell(EXAMPLES.length, true)} diagrams laid out by stackmap: {spell(EXAMPLES.length - agents)} across the {spell(DIAGRAM_KINDS.length)} kinds, and{' '}
          {spell(agents)} that coding agents wrote from a plain request in the skill’s eval runs. Pick one to open it in the viewer.
        </p>
        <Gallery items={items} thumbs={thumbs} filters={FILTERS} />
      </div>
    </main>
  );
}
