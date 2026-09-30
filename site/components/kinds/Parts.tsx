import type { CSSProperties, ReactNode } from 'react';
import { INFRA_TYPES, STATE_TYPES, type DiagramKind, type DiagramNode, type NodeType } from '@stackmap/core';
import { NodeCard } from '@stackmap/viewer/src/card/NodeCard';
import { StepCard } from '@stackmap/viewer/src/card/StepCard';
import { TypeChip } from '@/components/ui/TypeChip';
import type { KindPage } from '@/lib/kinds';

// Each kind's four parts, as small legends. Cards are the viewer's own card components.

const node = (type: NodeType, title: string, subtitle: string, tag?: string): DiagramNode => ({ id: title.toLowerCase(), type, card: { title, subtitle, ...(tag ? { tag } : {}) } });

function Place({ x, y, w, h, scale = 1, children }: { x: number; y: number; w: number; h: number; scale?: number; children: ReactNode }) {
  return (
    <div className="absolute" style={{ left: x, top: y, width: w, height: h, transform: scale === 1 ? undefined : `scale(${scale})`, transformOrigin: '0 0' }}>
      {children}
    </div>
  );
}

const step = (n: DiagramNode, final = false) => <StepCard node={n} final={final} />;

type Line = { d: string; head: string; open?: boolean; dash?: string; stroke?: string; width?: number };

function Lines({ lines, lifelines = [], children }: { lines: Line[]; lifelines?: number[]; children?: ReactNode }) {
  return (
    <svg aria-hidden="true" width="300" height="150" viewBox="0 0 300 150" className="absolute top-0 left-1/2 -translate-x-1/2 overflow-visible">
      {lifelines.map((x) => (
        <line key={x} x1={x} x2={x} y1={10} y2={140} style={{ stroke: 'var(--sm-group-border)', strokeDasharray: '4 4' }} />
      ))}
      {lines.map((l) => (
        <g key={l.d} style={{ stroke: l.stroke ?? 'var(--sm-edge)' }}>
          <path d={l.d} fill="none" strokeWidth={l.width ?? 1.25} strokeDasharray={l.dash} strokeLinecap={l.dash === '1 4' ? 'round' : undefined} />
          <path d={l.head} fill={l.open ? 'none' : (l.stroke ?? 'var(--sm-edge)')} stroke={l.open ? undefined : 'none'} strokeWidth={1.25} strokeLinejoin="round" />
        </g>
      ))}
      {children}
    </svg>
  );
}

function Pill({ x, y, children, text = false }: { x: number; y: number; children: string; text?: boolean }) {
  const style: CSSProperties = { left: `calc(50% + ${x - 150}px)`, top: y };
  return text ? (
    <span className="absolute -translate-1/2 rounded bg-stage px-1.5 text-[11.5px] leading-4 whitespace-nowrap text-fg" style={style}>
      {children}
    </span>
  ) : (
    <span className="absolute -translate-1/2 rounded-full bg-panel px-2 py-0.5 text-[11px] leading-normal whitespace-nowrap text-fg-muted shadow-[inset_0_0_0_1px_var(--sm-panel-border)]" style={style}>
      {children}
    </span>
  );
}

function Chips({ types }: { types: readonly NodeType[] }) {
  return (
    <div className="absolute inset-0 flex flex-wrap content-center items-center justify-center gap-2 p-3.5">
      {types.map((t) => (
        <TypeChip key={t} type={t} small />
      ))}
    </div>
  );
}

function Band({ x, w, label, header = false, lane = false, exception = false }: { x: number; w: number; label: ReactNode; header?: boolean; lane?: boolean; exception?: boolean }) {
  if (header) {
    return (
      <div className="absolute top-[18px] flex h-10 justify-center" style={{ left: x, width: w }}>
        <span className="mt-1.5 text-[13px] font-medium text-fg">{label}</span>
        <i className="absolute inset-x-0 bottom-2 h-px bg-[var(--sm-group-border)]" />
      </div>
    );
  }
  if (lane) {
    return (
      <div
        className={`absolute inset-x-3 rounded-2xl bg-[var(--sm-group-fill)] ${exception ? 'border border-dashed border-[var(--sm-group-border)]' : 'shadow-[inset_0_0_0_1px_var(--sm-panel-border)]'}`}
        style={{ top: x, height: w }}
      >
        <span className="flex w-40 items-start gap-1.5 px-4 pt-4 text-[12.5px] leading-[18px] font-medium text-fg-muted">{label}</span>
      </div>
    );
  }
  return (
    <div className="absolute top-4 h-[118px] rounded-[18px] border border-dashed border-[var(--sm-group-border)] bg-[var(--sm-group-fill)]" style={{ left: x, width: w }}>
      <span className="flex h-11 items-center justify-center px-5 text-[12.5px] font-medium text-fg-muted">{label}</span>
    </div>
  );
}

const arrow = (y: number, extra: Partial<Line> = {}): Line => ({ d: `M 24 ${y} H 276`, head: `M265 ${y - 3} L272 ${y} L265 ${y + 3} Z`, ...extra });
const centred = (children: ReactNode) => <div className="absolute top-0 left-1/2 h-full w-[300px] -translate-x-1/2">{children}</div>;

const VISUALS: Record<DiagramKind, ReactNode[]> = {
  architecture: [
    <Chips key="t" types={INFRA_TYPES} />,
    centred(
      <>
        <div className="absolute top-4 left-[18px] h-[118px] w-[264px] rounded-[18px] border border-dashed border-[var(--sm-group-border)] bg-[var(--sm-group-fill)]">
          <span className="flex h-10 items-center px-5 text-[12.5px] font-medium text-fg-muted">Data tier</span>
        </div>
        <Place x={36} y={58} w={280} h={64} scale={0.8}>
          <NodeCard node={{ id: 'db', type: 'database', card: { title: 'Orders DB', subtitle: 'PostgreSQL', brand: 'postgresql' } }} />
        </Place>
      </>,
    ),
    <Lines key="l" lines={[arrow(40), arrow(76, { dash: '5 4' }), arrow(112, { stroke: 'var(--sm-text)', width: 1.75 })]} />,
    <div key="v" className="absolute inset-0 flex gap-[22px] px-5 pt-[22px] text-[13.5px]">
      <span className="pb-2 text-fg shadow-[inset_0_-2px_0_var(--sm-text)]">Overview</span>
      <span className="text-fg-muted">Checkout path</span>
      <span className="text-fg-muted">Data tier</span>
    </div>,
  ],
  dataflow: [
    centred(
      <>
        <Band x={14} w={130} label="Ingest" />
        <Band x={156} w={130} label="Store" />
      </>,
    ),
    <Lines key="d" lines={[arrow(75)]} />,
    <Lines key="a" lines={[arrow(75, { dash: '5 4' })]} />,
    centred(<Place x={62} y={45} w={176} h={60}>{step(node('queue', 'Kafka', 'Event stream'))}</Place>),
  ],
  workflow: [
    centred(
      <>
        <Band x={14} w={56} label="Developer" lane />
        <Band x={80} w={56} label="CI" lane />
      </>,
    ),
    centred(
      <>
        <Band x={16} w={128} label="Change" header />
        <Band x={156} w={128} label="Verify" header />
      </>,
    ),
    centred(<Band x={40} w={72} label="Failure and rollback" lane exception />),
    centred(<Place x={62} y={33} w={176} h={84}>{step(node('security', 'Approve', 'Release owner', 'human gate'))}</Place>),
  ],
  lifecycle: [
    <Chips key="s" types={STATE_TYPES} />,
    centred(
      <>
        <svg aria-hidden="true" width="300" height="150" className="absolute inset-0" style={{ color: 'var(--sm-start-accent)' }}>
          <line x1="64" y1="75" x2="82" y2="75" stroke="currentColor" strokeWidth="1.5" />
          <path d="M75 72 L82 75 L75 78 Z" fill="currentColor" />
          <circle cx="62" cy="75" r="5" fill="currentColor" />
        </svg>
        <Place x={86} y={45} w={176} h={60}>{step(node('start', 'Queued', 'Accepted'))}</Place>
      </>,
    ),
    centred(<Place x={62} y={45} w={176} h={60}>{step(node('success', 'Completed', 'Final response'), true)}</Place>),
    <Lines key="r" lines={[{ d: 'M 40 100 H 250 Q 262 100 262 88 V 60 Q 262 48 250 48 H 50', head: 'M 57 45 L 50 48 L 57 51', open: true, dash: '1 4' }]} />,
  ],
  sequence: [
    centred(
      <>
        <svg aria-hidden="true" width="300" height="150" className="absolute inset-0">
          {[83, 228].map((x) => (
            <line key={x} x1={x} x2={x} y1={64} y2={150} style={{ stroke: 'var(--sm-group-border)', strokeDasharray: '4 4' }} />
          ))}
        </svg>
        <Place x={20} y={20} w={376} h={60} scale={0.72}>
          <div className="flex gap-6">
            <div className="relative h-[60px] w-44">{step(node('client', 'Browser', 'Dashboard'))}</div>
            <div className="relative h-[60px] w-44">{step(node('service', 'API', 'FastAPI'))}</div>
          </div>
        </Place>
      </>,
    ),
    <Lines key="m" lifelines={[50, 250]} lines={[{ d: 'M 50 60 H 250', head: 'M239 57 L246 60 L239 63 Z' }]} />,
    <Lines key="r" lifelines={[50, 250]} lines={[{ d: 'M 250 84 H 50', head: 'M 61 81 L 54 84 L 61 87', open: true, dash: '1 4' }]} />,
    centred(
      <svg aria-hidden="true" width="300" height="150" className="absolute inset-0" style={{ color: 'var(--sm-service-accent)' }}>
        <line x1="150" x2="150" y1="10" y2="140" style={{ stroke: 'var(--sm-group-border)', strokeDasharray: '4 4' }} />
        <rect x="145" y="34" width="10" height="84" rx="2" fill="currentColor" fillOpacity="0.16" stroke="currentColor" />
        <rect x="150" y="56" width="10" height="40" rx="2" fill="currentColor" fillOpacity="0.16" stroke="currentColor" />
      </svg>,
    ),
  ],
};

const LABELS: Partial<Record<DiagramKind, ReactNode[]>> = {
  architecture: [null, null, <>{[['call', 40], ['async', 76], ['main path', 112]].map(([t, y]) => <Pill key={t} x={150} y={y as number}>{t as string}</Pill>)}</>, null],
  dataflow: [null, <Pill key="label-p" x={150} y={75}>rows → events</Pill>, <Pill key="label-s" x={150} y={75}>stream</Pill>, null],
  lifecycle: [null, null, null, <Pill key="label-r" x={150} y={100}>retry</Pill>],
  sequence: [null, <Pill key="label-g" x={150} y={48} text>GET /dashboard</Pill>, <Pill key="label-j" x={150} y={72} text>200 + JSON</Pill>, null],
};

export function Parts({ kind, page }: { kind: DiagramKind; page: KindPage }) {
  return (
    <ul className="m-0 mt-28 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-4">
      {page.parts.map((p, i) => (
        <li key={p.title}>
          <div aria-hidden="true" className="relative h-[150px] overflow-hidden rounded-2xl bg-stage shadow-[inset_0_0_0_1px_var(--sm-panel-border)]">
            {VISUALS[kind][i]}
            {LABELS[kind]?.[i]}
          </div>
          <h3 className="mt-4 text-[17px] font-semibold tracking-[-0.015em]">{p.title}</h3>
          <p className="mt-1.5 text-sm leading-[1.55] text-fg-muted">{p.text}</p>
        </li>
      ))}
    </ul>
  );
}
