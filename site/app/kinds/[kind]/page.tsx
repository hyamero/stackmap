import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DIAGRAM_KINDS, KIND_LABELS, type DiagramKind } from '@stackmap/core';
import { NextLink } from '@/components/docs/DocsShell';
import { Ask, Code } from '@/components/docs/prose';
import { Gallery } from '@/components/examples/Gallery';
import { galleryProps } from '@/components/examples/gallery-props';
import { Parts } from '@/components/kinds/Parts';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { kindEntries, SKILL_EXAMPLE } from '@/lib/catalog';
import { SOURCES } from '@/lib/diagrams';
import { KIND_PAGES } from '@/lib/kinds';
import { OPEN_GRAPH } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return DIAGRAM_KINDS.map((kind) => ({ kind }));
}

const isKind = (k: string): k is DiagramKind => (DIAGRAM_KINDS as readonly string[]).includes(k);

export async function generateMetadata({ params }: PageProps<'/kinds/[kind]'>): Promise<Metadata> {
  const { kind } = await params;
  if (!isKind(kind)) return {};
  return {
    title: `${KIND_LABELS[kind]} diagrams`,
    description: KIND_PAGES[kind].lede,
    alternates: { canonical: `/kinds/${kind}` },
    openGraph: { ...OPEN_GRAPH, url: `/kinds/${kind}` },
  };
}

export default async function KindPage({ params }: PageProps<'/kinds/[kind]'>) {
  const { kind } = await params;
  if (!isKind(kind)) notFound();
  const page = KIND_PAGES[kind];
  const { items, thumbs } = galleryProps(kindEntries(kind));
  const file = `${SKILL_EXAMPLE[kind]}.json`;
  const next = DIAGRAM_KINDS[(DIAGRAM_KINDS.indexOf(kind) + 1) % DIAGRAM_KINDS.length]!;
  return (
    <main data-theme="light" className="bg-page text-fg">
      <div className="mx-auto max-w-[1440px] px-5 pt-28 pb-28 md:px-10 xl:px-24">
        <p className="text-sm text-fg-muted">
          <Link href="/examples" className="text-fg-muted no-underline hover:text-fg">
            Examples
          </Link>{' '}
          › {KIND_LABELS[kind]}
        </p>
        <h1 className="mt-3 text-mega">{KIND_LABELS[kind]}.</h1>
        <div className="mt-5 grid gap-6 md:grid-cols-2 md:gap-12">
          <p className="text-lede">{page.lede}</p>
          <p className="text-base leading-[1.65] text-fg-muted">{page.use}</p>
        </div>
        <Gallery items={items} thumbs={thumbs} />
        <Parts kind={kind} page={page} />
        <div className="mt-28 grid items-start gap-8 lg:grid-cols-[400px_minmax(0,1fr)] lg:gap-12">
          <div>
            <h2 className="text-[32px] leading-[1.1] font-semibold tracking-[-0.035em] md:text-[40px]">The JSON your agent writes.</h2>
            <p className="mt-4 text-base leading-[1.65] text-fg-muted">
              From the skill’s own example, <Code>{file}</Code>. Ask for one like it:
            </p>
            <Ask>{page.ask}</Ask>
          </div>
          <CodeBlock file={file} code={SOURCES.skill[SKILL_EXAMPLE[kind]]!} maxLines={40} />
        </div>
        <NextLink href={`/kinds/${next}`} eyebrow="Next kind" label={KIND_LABELS[next]} />
      </div>
    </main>
  );
}
