import { ArrowDownLeft, ArrowUpRight, Copy, PanelRightClose, PanelRightOpen, X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode, type Ref } from 'react';
import { countByType, TYPE_LABELS, type DiagramDraft, type DiagramNode, type Evidence } from '@stackmap/core';
import { focusCard } from '../canvas/SceneLayers';
import { useExplore } from '../explore/ExploreContext';
import { IconButton, PANEL_STYLE } from './ui';

const eyebrow = 'text-[12.5px] font-medium text-fg-muted';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-7">
      <h3 className="text-[13px] font-semibold text-fg">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Legend({ draft }: { draft: DiagramDraft }) {
  return (
    <ul aria-label="Legend" className="space-y-2.5">
      {countByType(draft.nodes).map(([type, count]) => (
        <li key={type} className="flex items-center justify-between text-[13px] text-fg">
          <span className="flex items-center gap-2.5">
            <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: `var(--sm-${type}-accent)` }} />
            {TYPE_LABELS[type]}
          </span>
          <span className="text-fg-muted tabular-nums">{count}</span>
        </li>
      ))}
    </ul>
  );
}

// Each path segment is encoded, so `#`, `?`, `%` or spaces in a file name can't reshape the URL.
const evidenceHref = (base: string, e: Evidence) =>
  `${base.replace(/\/+$/, '')}/${e.file.split('/').filter(Boolean).map(encodeURIComponent).join('/')}${e.line ? `#L${e.line}` : ''}`;

function EvidenceItem({ item, base }: { item: Evidence; base?: string }) {
  const [copied, setCopied] = useState(false);
  const where = `${item.file}${item.line ? `:${item.line}` : ''}`;
  const copy = () => {
    void navigator.clipboard?.writeText(where).then(() => setCopied(true));
  };
  return (
    <li className="text-[13px]">
      <div className="flex items-center justify-between gap-2">
        {base ? (
          <a href={evidenceHref(base, item)} target="_blank" rel="noreferrer" className="truncate font-mono text-[12px] text-fg underline-offset-2 hover:underline" title={where}>
            {where}
          </a>
        ) : (
          <code className="truncate font-mono text-[12px] text-fg" title={where}>
            {where}
          </code>
        )}
        <button type="button" onClick={copy} aria-label={`Copy ${where}`} title={copied ? 'Copied' : 'Copy path'} className="shrink-0 rounded-md p-1 text-fg-muted hover:bg-page hover:text-fg">
          <Copy size={13} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
      {item.note && <p className="mt-0.5 text-[12px] text-fg-muted">{item.note}</p>}
    </li>
  );
}

function Connections({ node }: { node: DiagramNode }) {
  const { draft, graph, dispatch } = useExplore();
  const byId = new Map(draft.nodes.map((n) => [n.id, n]));
  const edgeById = new Map(draft.edges.map((e) => [e.id, e]));
  const list = (ids: string[], dir: 'in' | 'out') =>
    ids.map((eid) => {
      const e = edgeById.get(eid)!;
      const other = byId.get(dir === 'in' ? e.from : e.to)!;
      const Icon = dir === 'in' ? ArrowDownLeft : ArrowUpRight;
      return (
        <li key={eid}>
          <button
            type="button"
            onClick={() => dispatch({ type: 'select', id: other.id, reveal: true })}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] text-fg hover:bg-page"
          >
            <Icon size={14} strokeWidth={1.75} aria-hidden="true" style={{ color: `var(--sm-${other.type}-accent)` }} />
            <span className="sr-only">{dir === 'in' ? 'from' : 'to'} </span>
            <span className="truncate">{other.card.title}</span>
            {e.label && <span className="ml-auto shrink-0 text-[12px] text-fg-muted">{e.label}</span>}
            {e.kind === 'async' && !e.label && <span className="ml-auto shrink-0 text-[12px] text-fg-muted">async</span>}
          </button>
        </li>
      );
    });
  const incoming = graph.in.get(node.id) ?? [];
  const outgoing = graph.out.get(node.id) ?? [];
  if (!incoming.length && !outgoing.length) return <p className="text-[13px] text-fg-muted">No connections.</p>;
  return (
    <ul aria-label="Connections" className="-mx-2 space-y-0.5">
      {list(incoming, 'in')}
      {list(outgoing, 'out')}
    </ul>
  );
}

function NodeDetail({ node, toggle }: { node: DiagramNode; toggle: ReactNode }) {
  const { draft, dispatch } = useExplore();
  const { card } = node;
  return (
    <>
      <div className="flex items-center justify-between">
        <div className={`${eyebrow} flex items-center gap-2`}>
          <span aria-hidden="true" className="size-2 rounded-full" style={{ background: `var(--sm-${node.type}-accent)` }} />
          {TYPE_LABELS[node.type]}
        </div>
        <div className="flex">
          <IconButton
            label="Clear selection (Esc)"
            onClick={() => {
              dispatch({ type: 'clear' });
              focusCard(node.id); // back where the keyboard user came from
            }}
          >
            <X size={16} strokeWidth={1.75} />
          </IconButton>
          {toggle}
        </div>
      </div>
      <h2 className="mt-1 text-[18px] font-semibold tracking-tight break-words text-fg">{card.title}</h2>
      {card.subtitle && <p className="mt-1 text-[13px] break-words text-fg-muted">{card.subtitle}</p>}
      {(card.rows?.length || card.stats?.length || card.footer) && (
        <Section title="Details">
          <dl className="space-y-2 text-[13px]">
            {card.rows?.map((r, i) => (
              <div key={`r${i}`} className="flex justify-between gap-4">
                <dt className="text-fg-muted">{r.label}</dt>
                <dd className={`text-right break-all text-fg ${r.mono ? 'font-mono text-[12px]' : ''}`}>{r.value}</dd>
              </div>
            ))}
            {card.stats?.map((s, i) => (
              <div key={`s${i}`} className="flex justify-between gap-4">
                <dt className="text-fg-muted">{s.label}</dt>
                <dd className="text-fg tabular-nums">{s.value}</dd>
              </div>
            ))}
            {card.stats?.length && card.statsNote ? <p className="text-fg-muted">{card.statsNote}</p> : null}
            {[card.footer?.left, card.footer?.right].map((f, i) => (f ? <p key={`f${i}`} className="text-fg-muted">{f.text}</p> : null))}
          </dl>
          {card.cta?.href && (
            <a href={card.cta.href} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-fg hover:underline">
              {card.cta.label}
              <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
            </a>
          )}
        </Section>
      )}
      <Section title="Connections">
        <Connections node={node} />
      </Section>
      {!!node.evidence?.length && (
        <Section title="Evidence">
          <ul className="space-y-2.5">
            {node.evidence.map((e, i) => (
              <EvidenceItem key={i} item={e} base={draft.source?.url} />
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}

function Toggle({ collapsed, onToggle, ref }: { collapsed: boolean; onToggle: () => void; ref: Ref<HTMLButtonElement> }) {
  return (
    <IconButton ref={ref} label={collapsed ? 'Show inspector' : 'Hide inspector'} expanded={!collapsed} onClick={onToggle}>
      {collapsed ? <PanelRightOpen size={17} strokeWidth={1.75} /> : <PanelRightClose size={17} strokeWidth={1.75} />}
    </IconButton>
  );
}

export function Inspector({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { draft, state } = useExplore();
  const selected = state.selected ? draft.nodes.find((n) => n.id === state.selected) : undefined;
  // The toggle re-renders as its counterpart; keep keyboard focus on it across the switch.
  const toggleRef = useRef<HTMLButtonElement>(null);
  const toggled = useRef(false);
  useEffect(() => {
    if (toggled.current) toggleRef.current?.focus();
    toggled.current = false;
  }, [collapsed]);
  const toggle = (
    <Toggle
      ref={toggleRef}
      collapsed={collapsed}
      onToggle={() => {
        toggled.current = true;
        onToggle();
      }}
    />
  );
  if (collapsed) {
    return (
      <aside aria-label="Inspector" className="shrink-0 rounded-[20px] bg-panel p-1.5" style={PANEL_STYLE}>
        {toggle}
      </aside>
    );
  }
  return (
    <aside aria-label="Inspector" className="relative w-[300px] shrink-0 overflow-y-auto rounded-[20px] bg-panel p-5" style={PANEL_STYLE}>
      {selected ? (
        <NodeDetail node={selected} toggle={toggle} />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className={eyebrow}>Diagram</div>
            {toggle}
          </div>
          <h2 className="mt-1 text-[18px] font-semibold tracking-tight text-fg">{draft.title}</h2>
          {draft.subtitle && <p className="mt-1 text-[13px] text-fg-muted">{draft.subtitle}</p>}
          <Section title="Legend">
            <Legend draft={draft} />
          </Section>
          <p className="mt-8 text-[12px] leading-5 text-fg-muted">
            Select a card to see its details and connections. Press <kbd className="font-mono">/</kbd> to search.
          </p>
        </>
      )}
    </aside>
  );
}
