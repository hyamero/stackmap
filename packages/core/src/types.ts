export const NODE_TYPES = [
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
export type NodeType = (typeof NODE_TYPES)[number];

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
}

export interface DiagramNode {
  id: string;
  type: NodeType;
  group?: string;
  card: CardData;
}

export interface DiagramEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  kind?: 'sync' | 'async';
}

export interface DiagramGroup {
  id: string;
  label: string;
  parent?: string;
}

export interface DiagramView {
  id: string;
  label: string;
  caption?: string;
  nodes: string[];
}

export type Direction = 'RIGHT' | 'DOWN';

export interface DiagramDraft {
  kind: 'architecture' | 'dataflow';
  title: string;
  subtitle?: string;
  direction?: Direction;
  groups?: DiagramGroup[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  views?: DiagramView[];
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
}
