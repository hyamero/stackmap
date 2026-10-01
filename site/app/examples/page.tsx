import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DIAGRAM_KINDS, type DiagramKind } from '@stackmap/core';
import { ExampleCard } from '@/components/examples/ExampleCard';
import { ExampleGrid } from '@/components/examples/ExampleGrid';
import { Cmd } from '@/components/ui/Cmd';
import { EXAMPLES, id } from '@/lib/catalog';
import { KIND_PAGES } from '@/lib/kinds';
import { OPEN_GRAPH } from '@/lib/seo';
import { SITE } from '@/lib/site-data';
import { spell } from '@/lib/words';

export const metadata: Metadata = {
  title: 'Examples',
  description: 'Sixteen diagrams laid out by stackmap across its five kinds, five of them written by coding agents. Open any of them in the viewer.',
  alternates: { canonical: '/examples' },
  openGraph: { ...OPEN_GRAPH, url: '/examples' },
};

const agents = EXAMPLES.filter((e) => e.prompt).length;
const LEDES = Object.fromEntries(DIAGRAM_KINDS.map((k) => [k, KIND_PAGES[k].lede])) as Record<DiagramKind, string>;

export default function ExamplesPage() {
  return (
    <main className="gal" id="top">
      <div className="wrap">
        <header className="g-head">
          <h1 className="g-h1">Examples</h1>
          <p className="g-lede">
            {spell(EXAMPLES.length, true)} diagrams laid out by stackmap: {spell(EXAMPLES.length - agents)} across the {spell(DIAGRAM_KINDS.length)} kinds, and{' '}
            {spell(agents)} that coding agents wrote from a plain request in the skill’s eval runs. Open one to explore it in the viewer.
          </p>
        </header>
        <ExampleGrid ledes={LEDES} items={EXAMPLES.map((e) => ({ id: id(e), kind: e.kind, agent: !!e.prompt, card: <ExampleCard entry={e} /> }))} />
        <section className="g-cta" aria-labelledby="g-cta-h">
          <div>
            <h2 className="g-cta-h" id="g-cta-h">
              Make one of your own.
            </h2>
            <p>Install the skill, then ask your coding agent for a diagram of your codebase, your system or a process.</p>
          </div>
          <div className="g-cta-a">
            <Cmd command={SITE.install.skill} label="Copy the install command" />
            <Link className="pill-l" href="/docs">
              <span>Read the quick start</span>
              <ArrowRight size={14} strokeWidth={1.75} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
