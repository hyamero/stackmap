/** Components: every kind except lifecycle. */
export const INFRA_TYPES = [
  'client',
  'service',
  'gateway',
  'database',
  'cache',
  'queue',
  'storage',
  'external',
  'security',
] as const;
export type InfraType = (typeof INFRA_TYPES)[number];

/** Lifecycle states. */
export const STATE_TYPES = ['start', 'active', 'waiting', 'decision', 'success', 'failure', 'neutral'] as const;
export type StateType = (typeof STATE_TYPES)[number];

export const NODE_TYPES = [...INFRA_TYPES, ...STATE_TYPES] as const;
export type NodeType = (typeof NODE_TYPES)[number];

export const DIAGRAM_KINDS = ['architecture', 'dataflow', 'workflow', 'lifecycle', 'sequence'] as const;
export type DiagramKind = (typeof DIAGRAM_KINDS)[number];

/** Kinds drawn as swimlanes: nodes sit in `lanes`, columns follow the flow. */
export const LANE_KINDS = ['workflow', 'lifecycle'] as const;
/** Kinds whose nodes render as compact step/state/participant cards. */
export const COMPACT_KINDS = ['workflow', 'lifecycle', 'sequence'] as const;
export const isLaneKind = (k: DiagramKind): k is (typeof LANE_KINDS)[number] => (LANE_KINDS as readonly string[]).includes(k);
export const isCompactKind = (k: DiagramKind): k is (typeof COMPACT_KINDS)[number] => (COMPACT_KINDS as readonly string[]).includes(k);
/** Whether the diagram's nodes render as compact cards: always in compact kinds, on request (`density`) elsewhere. */
export const usesCompactCards = (d: { kind: DiagramKind; density?: 'compact' }) => isCompactKind(d.kind) || d.density === 'compact';

export type FooterIcon = 'region' | 'secure' | 'members';

export interface CardRow {
  label: string;
  value: string;
  mono?: boolean;
}

export interface CardStat {
  value: string;
  label: string;
}

export interface FooterItem {
  text: string;
  icon?: FooterIcon;
}

export interface CardData {
  title: string;
  subtitle?: string;
  /** simple-icons slug, e.g. "postgresql" */
  brand?: string;
  rows?: CardRow[];
  stats?: CardStat[];
  /** only rendered when stats are present */
  statsNote?: string;
  footer?: { left?: FooterItem; right?: FooterItem };
  cta?: { label: string; href?: string };
  /** compact cards only (workflow, lifecycle, sequence): a short pill such as "human gate" */
  tag?: string;
}

/** Where in the codebase a node comes from; shown in the inspector, never on the card. */
export interface Evidence {
  /** repo-relative path */
  file: string;
  line?: number;
  note?: string;
}

export interface DiagramNode {
  id: string;
  type: NodeType;
  group?: string;
  /** workflow and lifecycle: the lane the node sits in */
  lane?: string;
  card: CardData;
  evidence?: Evidence[];
}

export interface DiagramEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  /** async renders dashed; return (a reply, a roll back) renders dotted and muted */
  kind?: EdgeKind;
  /** main = the happy path; security and error borrow those tints */
  tone?: EdgeTone;
}

export type EdgeKind = 'sync' | 'async' | 'return';
export type EdgeTone = 'main' | 'security' | 'error';

export interface DiagramGroup {
  id: string;
  label: string;
  parent?: string;
  /** a trust boundary: outline in the security tint */
  tone?: 'security';
}

export interface DiagramLane {
  id: string;
  label: string;
  /** failure and recovery paths */
  tone?: 'exception';
}

/**
 * Ordered stages. Lane kinds: a header over the columns `nodes` occupy. Architecture and dataflow: a band around
 * `nodes`, in flow order. Sequence: a time band around the messages `edges`.
 */
export interface DiagramPhase {
  id: string;
  label: string;
  nodes?: string[];
  edges?: string[];
}

/** A takeaway about the diagram, listed in the inspector. */
export interface DiagramNote {
  title: string;
  items: string[];
}

export interface DiagramView {
  id: string;
  label: string;
  caption?: string;
  nodes: string[];
}

export type Direction = 'RIGHT' | 'DOWN';

export interface DiagramDraft {
  kind: DiagramKind;
  /** architecture and dataflow: compact cards (title, subtitle, brand, tag) for wide or summary diagrams */
  density?: 'compact';
  title: string;
  subtitle?: string;
  direction?: Direction;
  /** base URL evidence files are linked under, e.g. "https://github.com/acme/shop/blob/main" */
  source?: { url: string };
  groups?: DiagramGroup[];
  lanes?: DiagramLane[];
  phases?: DiagramPhase[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  views?: DiagramView[];
  notes?: DiagramNote[];
}

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Absolute coordinates, produced by @stackmap/layout. */
export interface LaidOutDiagram {
  draft: DiagramDraft;
  nodes: Record<string, Rect>;
  groups: Record<string, Rect>;
  edges: Record<string, Point[]>;
  bounds: { width: number; height: number };
  /** lane kinds: full-width lane bands */
  lanes?: Record<string, Rect>;
  /** lane kinds: header bands; sequence: time bands */
  phases?: Record<string, Rect>;
  /** where an edge's label sits, when the layout places it (else the route's midpoint) */
  labels?: Record<string, Point>;
  sequence?: SequenceLayout;
}

export interface SequenceLayout {
  /** per participant: the lifeline's x and vertical extent */
  lifelines: Record<string, { x: number; top: number; bottom: number }>;
  /** activation bars; depth > 0 is nested (self-calls) */
  activations: { participant: string; rect: Rect; depth: number }[];
}
