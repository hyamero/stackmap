import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { DIAGRAM_KINDS, KIND_LABELS, type DiagramKind, type NodeType } from '@stackmap/core';
import { DocsShell } from '@/components/docs/DocsShell';
import { LinkedFigure } from '@/components/docs/LinkedFigure';
import { Ask, C, DocHead, H2, H3, Inline, P, Table } from '@/components/docs/prose';
import { ExampleCard } from '@/components/examples/ExampleCard';
import { Parts } from '@/components/kinds/Parts';
import { LINKS } from '@/components/site/links';
import { JsonCode } from '@/components/ui/Code';
import { TypeChip } from '@/components/ui/TypeChip';
import { EXAMPLES, id, SKILL_EXAMPLE } from '@/lib/catalog';
import { SOURCES, stillOf } from '@/lib/diagrams';
import { kindHref } from '@/lib/docs-nav';
import { jsonOwners } from '@/lib/json-lines';
import { KIND_PAGES } from '@/lib/kinds';
import { OPEN_GRAPH } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return DIAGRAM_KINDS.map((kind) => ({ kind }));
}

const isKind = (k: string): k is DiagramKind => (DIAGRAM_KINDS as readonly string[]).includes(k);

export async function generateMetadata({ params }: PageProps<'/docs/[kind]'>): Promise<Metadata> {
  const { kind } = await params;
  if (!isKind(kind)) return {};
  return {
    title: `${KIND_LABELS[kind]} diagrams`,
    description: KIND_PAGES[kind].lede,
    alternates: { canonical: kindHref(kind) },
    openGraph: { ...OPEN_GRAPH, url: kindHref(kind) },
  };
}

export default async function KindPage({ params }: PageProps<'/docs/[kind]'>) {
  const { kind } = await params;
  if (!isKind(kind)) notFound();
  const page = KIND_PAGES[kind];
  const key = SKILL_EXAMPLE[kind];
  const code = SOURCES.skill[key]!.trimEnd();
  const label = KIND_LABELS[kind];
  return (
    <DocsShell href={kindHref(kind)}>
      <DocHead crumb="Diagram kinds" title={label} lede={page.lede} />
      <P>
        <Inline text={page.use} />
      </P>

      <H2 id="example">An example</H2>
      <P muted>
        The skill’s own example, <C>{key}.json</C>, laid out by stackmap.
      </P>
      <LinkedFigure
        split={page.split}
        still={stillOf(`skill/${key}`)}
        url={`file:///…/.stackmap/${key.split('.')[0]}/diagram.html`}
        code={<JsonCode file={`${key}.json`} code={code} owners={jsonOwners(code)} />}
      />

      <H2 id="parts">Its parts</H2>
      <Parts kind={kind} page={page} />

      <H2 id="rules">Rules</H2>
      <P muted>
        From the{' '}
        <a href={LINKS.authoring.href} target="_blank" rel="noreferrer">
          authoring contract
        </a>{' '}
        the skill gives your agent. <C>stackmap validate</C> enforces the hard ones and names the fix.
      </P>
      <ul className="d-ul">
        {page.rules.map((r) => (
          <li key={r} className="d-li">
            <Inline text={r} />
          </li>
        ))}
      </ul>
      {page.types && (
        <div className="kind-types">
          <H3>{page.types.title}</H3>
          <Table
            head={['Type', 'Use it for']}
            rows={Object.entries(page.types.uses).map(([t, use]) => [<TypeChip key={t} type={t as NodeType} small />, use])}
          />
        </div>
      )}

      <H2 id="ask">Ask for one</H2>
      <Ask text={page.ask} className="kind-ask" />
      <P muted>Your agent picks the kind that answers the question; naming it is the surest way to get it.</P>

      <H2 id="examples">Examples</H2>
      <ul className="g-grid kind-grid">
        {EXAMPLES.filter((e) => e.kind === kind).map((e) => (
          <li key={id(e)} className="ex-li">
            <ExampleCard entry={e} />
          </li>
        ))}
      </ul>
      <P muted>
        <Link className="g-doc" href={`/examples?kind=${kind}`}>
          <span>See {label.toLowerCase()} examples in the gallery</span>
          <ArrowRight size={14} strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </P>
    </DocsShell>
  );
}
