import { NODE_TYPES, TYPE_LABELS, type DiagramNode, type NodeType } from '@stackmap/core';

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

export const GALLERY_SECTIONS: [string, DiagramNode[]][] = [
  ['Bare', NODE_TYPES.map(bare)],
  ['Rich', NODE_TYPES.map(rich)],
  ['Stress', [stress]],
];
