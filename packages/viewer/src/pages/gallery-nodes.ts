import { cardTextSlots, measureText, NODE_TYPES, TYPE_LABELS, type CardData, type DiagramNode, type NodeType } from '@stackmap/core';

const BRAND: Partial<Record<NodeType, string>> = {
  client: 'nextdotjs',
  gateway: 'nginx',
  database: 'postgresql',
  cache: 'redis',
  queue: 'rabbitmq',
  external: 'stripe',
};

const bare = (type: NodeType): DiagramNode => ({ id: `bare-${type}`, type, card: { title: TYPE_LABELS[type] } });

const rich = (type: NodeType): DiagramNode => {
  const clustered = type === 'database' || type === 'cache';
  return {
    id: `rich-${type}`,
    type,
    card: {
      title: `${type}-primary`,
      subtitle: `${TYPE_LABELS[type]} · Instance 1`,
      brand: BRAND[type],
      rows: clustered ? undefined : [{ label: '2 vCPU · 2 GB', value: ':3000', mono: true }],
      stats: clustered
        ? [
            { value: '1', label: 'Primary' },
            { value: '2', label: 'Read replicas' },
          ]
        : undefined,
      statsNote: clustered ? '2 replication links' : undefined,
      footer: { left: { text: 'EU West', icon: 'region' }, right: { text: clustered ? '3 members' : 'Stateless' } },
      cta: clustered ? { label: 'Open cluster' } : undefined,
    },
  };
};

const stress: DiagramNode = {
  id: 'stress',
  type: 'service',
  card: {
    title: 'a-very-long-service-name-that-will-never-fit',
    subtitle: 'An equally long subtitle that must truncate cleanly',
    rows: [
      { label: 'Connection string', value: 'postgres://orders.internal:5432/orders_production', mono: true },
      { label: 'Region', value: 'EU West' },
      { label: 'Replicas', value: '12' },
    ],
    stats: [
      { value: '12', label: 'Primary shards' },
      { value: '24', label: 'Replicas' },
      { value: '3', label: 'Zones' },
    ],
    footer: { left: { text: 'eu-west-1a, eu-west-1b, eu-west-1c', icon: 'region' }, right: { text: 'HTTPS', icon: 'secure' } },
    cta: { label: 'Open the extremely detailed cluster dashboard' },
  },
};

// Every slot filled with text ~2px under (fits) and ~2px over (truncates) its budget, so the browser test
// that pins cardTextSlots to the rendered card has cases on both sides of each boundary.
// No spaces: trailing whitespace collapses in the browser and would skew the edge cases.
const FILLER = 'Boundary-text-for-budget-checks-abcdefghijklmnopqrstuvwxyz-0123456789-'.repeat(4);
const template: CardData = {
  title: FILLER,
  subtitle: FILLER,
  rows: [{ label: FILLER, value: ':3000', mono: true }, { label: 'Region', value: FILLER }],
  stats: [{ value: '1234567890', label: FILLER }, { value: '2', label: FILLER }],
  statsNote: FILLER,
  footer: { left: { text: FILLER, icon: 'region' }, right: { text: FILLER } },
  cta: { label: FILLER },
};

/** Longest prefix at least 2px under each budget (`under`), or shortest prefix at least 2px over it. */
function fitTo(card: CardData, side: 'under' | 'over'): CardData {
  const out = structuredClone(card) as unknown as Record<string, unknown>;
  for (const slot of cardTextSlots(card)) {
    const width = (n: number) => measureText(slot.text.slice(0, n), slot.face, slot.size);
    let n = 1;
    if (side === 'under') while (n < slot.text.length && width(n + 1) <= slot.maxWidth - 2) n++;
    else while (n < slot.text.length && width(n) < slot.maxWidth + 2) n++;
    const keys = slot.path.slice(1).split('/');
    let target = out as Record<string, unknown>;
    for (const k of keys.slice(0, -1)) target = target[k] as Record<string, unknown>;
    target[keys.at(-1)!] = slot.text.slice(0, n);
  }
  return out as unknown as CardData;
}

const boundary: DiagramNode[] = [
  { id: 'boundary-under', type: 'database', card: fitTo(template, 'under') },
  { id: 'boundary-over', type: 'cache', card: fitTo(template, 'over') },
];

export const GALLERY_SECTIONS: [string, DiagramNode[]][] = [
  ['Bare', NODE_TYPES.map(bare)],
  ['Rich', NODE_TYPES.map(rich)],
  ['Stress', [stress]],
  ['Boundary', boundary],
];
