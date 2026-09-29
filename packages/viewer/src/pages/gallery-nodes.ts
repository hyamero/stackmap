import { INFRA_TYPES, NODE_TYPES, TYPE_LABELS, type DiagramNode, type NodeType } from '@stackmap/core';

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
      cta: clustered ? { label: 'Open cluster', href: `https://console.example.com/clusters/${type}` } : undefined,
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

// Full cards only ever carry component types; lifecycle states are always compact.
export const GALLERY_SECTIONS: [string, DiagramNode[]][] = [
  ['Bare', INFRA_TYPES.map(bare)],
  ['Rich', INFRA_TYPES.map(rich)],
  ['Stress', [stress]],
];

const TAGS: Partial<Record<NodeType, string>> = { security: 'human gate', decision: 'gate', waiting: 'pause', failure: 'terminal' };
const step = (type: NodeType): DiagramNode => ({
  id: `step-${type}`,
  type,
  card: { title: TYPE_LABELS[type], subtitle: 'Step subtitle', ...(TAGS[type] ? { tag: TAGS[type] } : {}) },
});

/** Compact cards (workflow steps, lifecycle states, participants), every type, with and without a tag. */
export const COMPACT_SECTIONS: [string, DiagramNode[]][] = [
  ['Compact', NODE_TYPES.map(step)],
  ['Compact stress', [{ id: 'step-stress', type: 'service', card: { title: 'a-very-long-step-name', subtitle: 'An equally long subtitle here', tag: 'a tag that is far too long' } }]],
];
