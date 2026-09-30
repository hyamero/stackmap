import type { Metadata } from 'next';
import { Fragment } from 'react';
import { BRAND_SLUGS } from '@stackmap/core';
import schema from '@/generated/schema.json';
import { DocsShell, NextLink } from '@/components/docs/DocsShell';
import { Code, docs } from '@/components/docs/prose';
import type { SchemaField, SchemaSection } from '@/lib/data/schema-ref';
import { blocks, notePieces, type Placement } from '@/lib/schema-page';
import { OPEN_GRAPH } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Schema reference',
  description: 'Every field of the diagram JSON your coding agent writes: nodes, cards, connections, groups, lanes, phases, views and notes.',
  alternates: { canonical: '/docs/schema' },
  openGraph: { ...OPEN_GRAPH, url: '/docs/schema' },
};

const BLOCKS = blocks(schema as SchemaSection[]);

const TOC = [
  ...BLOCKS.flatMap((b) => (b.kind === 'table' && b.section.name !== 'source' ? [{ id: b.placement.anchor, label: b.placement.title }] : [])),
  { id: 'brands', label: 'Brand slugs' },
];

function Notes({ field }: { field: SchemaField }) {
  return notePieces(field).map((p, i) =>
    'code' in p ? (
      <Code key={i}>{p.code}</Code>
    ) : 'href' in p ? (
      <a key={i} href={p.href} className="text-fg underline decoration-fg-muted decoration-1 underline-offset-[3px] hover:decoration-fg">
        {p.link}
      </a>
    ) : (
      <Fragment key={i}>{p.text}</Fragment>
    ),
  );
}

function Table({ section, placement }: { section: SchemaSection; placement: Placement }) {
  const H = placement.level === 2 ? 'h2' : 'h3';
  return (
    <>
      <H id={placement.anchor} className={placement.level === 2 ? docs.h2 : docs.h3}>
        {placement.title}
      </H>
      {placement.anchor === 'source' && (
        <p className={docs.muted}>
          Set <Code>source.url</Code> on the diagram and every evidence entry links to <Code>&lt;url&gt;/&lt;file&gt;#L&lt;line&gt;</Code>.
        </p>
      )}
      <div tabIndex={0} className="-mx-5 overflow-x-auto px-5 focus-visible:-outline-offset-2 md:mx-0 md:px-0">
        <table className="mt-[18px] w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr>
              {['Field', 'Type', 'Req.', 'Notes'].map((h) => (
                <th key={h} scope="col" className="pr-3 pb-2.5 text-left text-[12.5px] font-medium text-fg-muted shadow-[inset_0_-1px_0_var(--sm-panel-border)]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_td]:py-[11px] [&_td]:pr-3 [&_td]:align-top [&_td]:leading-[1.55] [&_td]:shadow-[inset_0_-1px_0_var(--sm-divider)]">
            {section.fields.map((f) => (
              <tr key={f.key}>
                <td className="w-[150px] font-mono text-code text-fg">{f.key}</td>
                <td className="w-[84px] text-fg-muted">{f.type}</td>
                <td className={`w-12 ${f.required ? 'text-fg' : 'text-fg-muted'}`}>{f.required ? 'yes' : 'no'}</td>
                <td className="text-fg-muted">
                  <Notes field={f} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function SchemaPage() {
  return (
    <DocsShell current="/docs/schema#schema" toc={TOC} source="packages/schema/src/schema.ts">
      <p className={docs.crumb}>Docs › Reference</p>
      <h1 id="schema" className={docs.h1}>
        Schema reference.
      </h1>
      <p className={docs.lede}>The diagram your agent writes. Layout is computed by stackmap, so there are never coordinates. Objects are strict: unknown keys are errors.</p>
      <p className={docs.muted}>
        Ids, and references to them, use <Code>a-z</Code>, <Code>0-9</Code>, <Code>-</Code> and <Code>_</Code>, starting with a letter or digit. Machine-readable:{' '}
        <Code>stackmap.schema.json</Code>.
      </p>
      {BLOCKS.map((b) =>
        b.kind === 'table' ? (
          <Table key={b.section.name} section={b.section} placement={b.placement} />
        ) : (
          <Fragment key="card-parts">
            <h3 id="card-parts" className={docs.h3}>
              Card parts
            </h3>
            <p className={docs.muted}>
              Rows are key and value pairs, <Code>mono</Code> for ports and paths. Stats are a value and a label, at most three. The footer takes a left and a right
              item, each a text and an optional icon (<Code>region</Code>, <Code>secure</Code>, <Code>members</Code>). A call to action takes a label and an http(s)
              link.
            </p>
          </Fragment>
        ),
      )}
      <h2 id="brands" className={docs.h2}>
        Brand slugs
      </h2>
      <p className={docs.muted}>
        Values allowed in <Code>nodes[].card.brand</Code>, all Simple Icons (CC0). Anything else is a warning and the card shows its type icon. The logo only sits in
        the icon tile; the type still sets the colour.
      </p>
      <ul className="m-0 mt-[18px] flex list-none flex-wrap gap-1.5 p-0">
        {BRAND_SLUGS.map((s) => (
          <li key={s}>
            <code className="inline-flex h-[26px] items-center rounded-lg bg-panel px-[9px] font-mono text-xs text-fg-muted shadow-[inset_0_0_0_1px_var(--sm-panel-border)]">{s}</code>
          </li>
        ))}
      </ul>
      <NextLink href="/examples" label="Examples" />
    </DocsShell>
  );
}
