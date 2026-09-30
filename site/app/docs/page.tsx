import type { Metadata } from 'next';
import { BRAND_SLUGS, INFRA_TYPES, STATE_TYPES } from '@stackmap/core';
import { FitDiagram } from '@/components/diagram/FitDiagram';
import { DocsShell, NextLink } from '@/components/docs/DocsShell';
import { Ask, Code, docs } from '@/components/docs/prose';
import { CodeBlock, Command } from '@/components/ui/CodeBlock';
import { TypeChip } from '@/components/ui/TypeChip';
import { spell } from '@/lib/words';
import { SOURCES, stillOf } from '@/lib/diagrams';
import { OPEN_GRAPH } from '@/lib/seo';
import { SITE } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Quick start',
  description: 'Install the stackmap skill, ask your coding agent for a diagram, and open the one HTML file it delivers.',
  alternates: { canonical: '/docs' },
  openGraph: { ...OPEN_GRAPH, url: '/docs' },
};

const TOC = [
  { id: 'quick-start', label: 'Quick start' },
  { id: 'json', label: 'What the agent writes' },
  { id: 'cli', label: 'The CLI' },
];

const CLI = [
  { usage: 'validate diagram.json', flags: '[--json]', does: 'Lists every problem with a code, its evidence and the allowed fixes, including card text that won’t fit.' },
  { usage: 'deliver diagram.json', flags: '[-o out.html]', does: 'Validates, lays out and writes one offline HTML file. The same JSON always gives the same file, byte for byte.' },
  {
    usage: 'serve diagram.json',
    flags: '[--port 4400]',
    does: 'A live viewer that reloads on every save. It binds 127.0.0.1 only, keeps the last good version when a save is invalid, and keeps your camera and selection across reloads.',
  },
];

const EXIT_CODES = [
  { code: 0, meaning: 'OK. Warnings are allowed.' },
  { code: 1, meaning: 'The diagram has errors.' },
  { code: 2, meaning: 'A usage, file or internal error. Never a stack trace.' },
];

// The agent's file pins the schema to the installed CLI, so the example does too.
const json = SOURCES.quickStart.replace('{\n', `{\n  "$schema": "https://unpkg.com/@hyamero/stackmap@${SITE.version}/dist/stackmap.schema.json",\n`);

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="relative pl-14">
      <span className="absolute top-0 left-0 grid size-7 place-items-center rounded-full bg-page font-mono text-[12.5px] shadow-[inset_0_0_0_1.5px_var(--sm-text)]">{n}</span>
      <h2 className="mt-0.5 text-[19px] leading-[1.35] font-semibold tracking-[-0.015em]">{title}</h2>
      {children}
    </li>
  );
}

function Transcript() {
  const { broken, clean } = SITE.repair;
  const { file, sha256, bytes } = SITE.receipt;
  const prompt = (cmd: string) => (
    <span className="block">
      <b className="font-semibold text-[#ededec]">stackmap</b> · <span className="text-[#ededec]">{cmd} .stackmap/commerce-api/diagram.json</span>
    </span>
  );
  const line = (l: string, i: number) => {
    const tone = l.startsWith('error') || l.startsWith('✗') ? 'text-[#f0806e]' : l.startsWith('✓') ? 'text-[#a6d97a]' : '';
    return (
      <span key={i} className={`block ${tone}`}>
        {l}
      </span>
    );
  };
  return (
    <div data-theme="dark" className="mt-5 overflow-hidden rounded-[14px] bg-page text-fg-muted shadow-[inset_0_0_0_1px_var(--sm-panel-border)]">
      <div className="flex h-[42px] items-center px-[18px] font-mono text-[12.5px] shadow-[inset_0_-1px_0_var(--sm-panel-border)]">A repair round, as the agent sees it</div>
      <pre tabIndex={0} className="m-0 overflow-x-auto px-5 pt-4 pb-[18px] font-mono text-code leading-[1.75] focus-visible:-outline-offset-2">
        {prompt('validate')}
        {broken.map(line)}
        <span className="block"> </span>
        {prompt('validate')}
        {clean.map(line)}
        <span className="block"> </span>
        {prompt('deliver')}
        <span className="block">
          delivered <span className="text-[#8fa6f2]">{file}</span> · sha256 {sha256.slice(0, 12)}… · {bytes} bytes
        </span>
      </pre>
    </div>
  );
}

export default function DocsPage() {
  return (
    <DocsShell current="/docs#quick-start" toc={TOC} source="site/app/docs/page.tsx">
      <p className={docs.crumb}>Docs › Get started</p>
      <h1 id="quick-start" className={docs.h1}>
        Quick start.
      </h1>
      <p className={docs.lede}>Install the skill, ask your coding agent for a diagram, and open the file it delivers.</p>
      <ol className="relative m-0 mt-10 flex list-none flex-col gap-10 p-0 before:absolute before:top-3.5 before:bottom-5 before:left-[13px] before:w-[1.5px] before:bg-fg">
        <Step n={1} title="Install the skill into your agent.">
          <Command command={SITE.install.skill} label="Copy the install command" className="mt-4 w-full" />
          <p className={docs.muted}>It installs into Claude Code, Cursor, Codex and the other agents that skills supports.</p>
        </Step>
        <Step n={2} title="Ask for a diagram.">
          <Ask>Make an architecture diagram of this repository, backed by evidence from the code.</Ask>
          <p className={docs.muted}>
            The agent writes <Code>.stackmap/&lt;name&gt;/diagram.json</Code>, validates it, repairs what the diagnostics name, and delivers{' '}
            <Code>.stackmap/&lt;name&gt;/diagram.html</Code>.
          </p>
        </Step>
        <Step n={3} title="Open the file.">
          <p className={docs.p}>
            Open <Code>diagram.html</Code> in any browser. There is no server, no account and nothing to install. To change the diagram, ask again: the agent edits
            the JSON and delivers it again. The viewer itself is read-only.
          </p>
        </Step>
      </ol>

      <h2 id="json" className={docs.h2}>
        What the agent writes.
      </h2>
      <p className={docs.p}>
        One small typed JSON file. The agent names the nodes, connections, groups and views; stackmap validates it and lays it out. There are no coordinates to write.
      </p>
      <CodeBlock file=".stackmap/bookshop/diagram.json" code={json} copy className="mt-5" />
      <figure className="m-0 mt-5 overflow-hidden rounded-2xl bg-panel shadow-[inset_0_0_0_1px_var(--sm-panel-border)]">
        <div className="flex h-10 items-center gap-2.5 px-3.5 text-[12.5px] text-fg-muted shadow-[inset_0_-1px_0_var(--sm-panel-border)]">
          {[0, 1, 2].map((i) => (
            <i key={i} aria-hidden="true" className="size-[9px] rounded-full shadow-[inset_0_0_0_1.5px_var(--sm-panel-border)]" />
          ))}
          <code className="ml-1.5 truncate font-mono">file:///…/.stackmap/bookshop/diagram.html</code>
        </div>
        <FitDiagram still={stillOf('quickStart')} width={680} height={400} />
        <figcaption className="sr-only">The same JSON, laid out by stackmap.</figcaption>
      </figure>
      <div className="mt-7 flex flex-col gap-[18px]">
        <div>
          <h3 className="text-base font-semibold">Nodes</h3>
          <p className="mt-1.5 text-[15px] leading-[1.65] text-fg-muted">
            {spell(INFRA_TYPES.length, true)} types set the colour, and lifecycles have {spell(STATE_TYPES.length)} state types of their own. Cards can add rows, stats, a
            footer, a link and one of {BRAND_SLUGS.length} Simple Icons logos.
          </p>
          <div className="mt-3.5 flex flex-wrap gap-2">
            {INFRA_TYPES.map((t) => (
              <TypeChip key={t} type={t} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold">Connections</h3>
          <p className="mt-1.5 text-[15px] leading-[1.65] text-fg-muted">
            Plain for a call, <Code>async</Code> for queues and events, <Code>return</Code> for a reply or a roll back, with a <Code>tone</Code> for the main path,
            security crossings and failure paths.
          </p>
        </div>
        <div>
          <h3 className="text-base font-semibold">No coordinates</h3>
          <p className="mt-1.5 text-[15px] leading-[1.65] text-fg-muted">stackmap lays everything out: ELK for architecture and dataflow, and its own layout for lanes and sequences.</p>
        </div>
      </div>

      <h2 id="cli" className={docs.h2}>
        The CLI.
      </h2>
      <p className={docs.p}>The skill runs the CLI for you, and it works on its own too, with Node 22.12 or later.</p>
      <div className="mt-6 flex flex-col overflow-hidden rounded-[14px] shadow-[inset_0_0_0_1px_var(--sm-panel-border)]">
        {CLI.map((c, i) => (
          <div key={c.usage} className={`grid gap-2 bg-panel px-5 py-[18px] md:grid-cols-[260px_minmax(0,1fr)] md:gap-6 ${i ? 'shadow-[inset_0_1px_0_var(--sm-panel-border)]' : ''}`}>
            <code className="font-mono text-code leading-[1.6] text-fg">
              {c.usage} <span className="text-fg-muted">{c.flags}</span>
            </code>
            <p className="m-0 text-[14.5px] leading-[1.6] text-fg-muted">{c.does}</p>
          </div>
        ))}
      </div>
      <Transcript />
      <dl className="m-0 mt-5 grid gap-3 sm:grid-cols-3">
        {EXIT_CODES.map((e) => (
          <div key={e.code} className="rounded-[14px] bg-panel px-[18px] py-4 shadow-[inset_0_0_0_1px_var(--sm-panel-border)]">
            <dt className="font-mono text-[22px] font-medium">{e.code}</dt>
            <dd className="m-0 mt-1.5 text-[13.5px] leading-normal text-fg-muted">{e.meaning}</dd>
          </div>
        ))}
      </dl>
      <NextLink href="/docs/schema" label="Schema reference" />
    </DocsShell>
  );
}
