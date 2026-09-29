import type { DiagramDraft, DiagramNode } from '../types';

const api = (i: number): DiagramNode => ({
  id: `commerce-api-${i}`,
  type: 'service',
  card: {
    title: `commerce-api-${i}`,
    subtitle: `API · Instance ${i}`,
    rows: [{ label: '2 vCPU · 2 GB', value: ':3000', mono: true }],
    footer: { left: { text: 'EU West', icon: 'region' }, right: { text: 'Stateless' } },
  },
});

// Mirrors docs/design/refs/dark-topology.png so the spike can be compared side by side.
export const commerceApi: DiagramDraft = {
  kind: 'architecture',
  title: 'Commerce API',
  subtitle: 'Production topology',
  source: { url: 'https://github.com/hyamero/stackmap/blob/main' },
  direction: 'RIGHT',
  nodes: [
    {
      id: 'edge',
      type: 'gateway',
      card: {
        title: 'OpenShip Edge',
        subtitle: 'Public routing',
        rows: [{ label: 'Load balancing', value: 'Round robin' }],
        footer: { left: { text: 'EU West', icon: 'region' }, right: { text: 'HTTPS', icon: 'secure' } },
      },
    },
    api(1),
    api(2),
    api(3),
    {
      id: 'orders',
      evidence: [
        { file: 'infra/orders/postgres.tf', line: 12, note: 'Primary + 2 read replicas' },
        { file: 'services/api/src/db.ts', line: 8 },
      ],
      type: 'database',
      card: {
        title: 'Orders',
        subtitle: 'PostgreSQL cluster',
        brand: 'postgresql',
        stats: [
          { value: '1', label: 'Primary' },
          { value: '2', label: 'Read replicas' },
        ],
        statsNote: '2 replication links',
        footer: { left: { text: 'EU West', icon: 'region' }, right: { text: '3 members', icon: 'members' } },
        cta: { label: 'Open cluster', href: 'https://console.example.com/clusters/orders' },
      },
    },
    {
      id: 'sessions',
      type: 'cache',
      card: {
        title: 'Sessions',
        subtitle: 'Redis cluster',
        brand: 'redis',
        stats: [
          { value: '3', label: 'Primary shards' },
          { value: '3', label: 'Replicas' },
        ],
        statsNote: '3 replication links',
        footer: { left: { text: 'EU West', icon: 'region' }, right: { text: '6 members', icon: 'members' } },
        cta: { label: 'Open cluster', href: 'https://console.example.com/clusters/sessions' },
      },
    },
  ],
  edges: [
    { id: 'e-edge-1', from: 'edge', to: 'commerce-api-1' },
    { id: 'e-edge-2', from: 'edge', to: 'commerce-api-2' },
    { id: 'e-edge-3', from: 'edge', to: 'commerce-api-3' },
    { id: 'e-1-orders', from: 'commerce-api-1', to: 'orders' },
    { id: 'e-2-orders', from: 'commerce-api-2', to: 'orders' },
    { id: 'e-3-orders', from: 'commerce-api-3', to: 'orders' },
    { id: 'e-1-sessions', from: 'commerce-api-1', to: 'sessions' },
    { id: 'e-2-sessions', from: 'commerce-api-2', to: 'sessions' },
    { id: 'e-3-sessions', from: 'commerce-api-3', to: 'sessions' },
  ],
  views: [
    { id: 'data', label: 'Data tier', caption: 'Where state lives', nodes: ['orders', 'sessions'] },
  ],
};

// Exercises groups, async edges, labels and every remaining node type.
export const groupedPlatform: DiagramDraft = {
  kind: 'architecture',
  title: 'Platform',
  subtitle: 'Grouped tiers',
  direction: 'DOWN',
  groups: [
    { id: 'edge-tier', label: 'Edge' },
    { id: 'app-tier', label: 'App tier' },
    { id: 'data-tier', label: 'Data tier' },
  ],
  nodes: [
    { id: 'web', type: 'client', card: { title: 'Web app', subtitle: 'Next.js', brand: 'nextdotjs' } },
    { id: 'gw', type: 'gateway', group: 'edge-tier', card: { title: 'API Gateway', subtitle: 'nginx', brand: 'nginx' } },
    { id: 'auth', type: 'security', group: 'edge-tier', card: { title: 'Auth', subtitle: 'OIDC provider' } },
    { id: 'orders-svc', type: 'service', group: 'app-tier', card: { title: 'orders', subtitle: 'Service' } },
    { id: 'billing-svc', type: 'service', group: 'app-tier', card: { title: 'billing', subtitle: 'Service' } },
    { id: 'jobs', type: 'queue', group: 'app-tier', card: { title: 'jobs', subtitle: 'RabbitMQ', brand: 'rabbitmq' } },
    { id: 'db', type: 'database', group: 'data-tier', card: { title: 'postgres', subtitle: 'PostgreSQL', brand: 'postgresql' } },
    { id: 'kv', type: 'cache', group: 'data-tier', card: { title: 'redis', subtitle: 'Redis', brand: 'redis' } },
    { id: 'blobs', type: 'storage', group: 'data-tier', card: { title: 'assets', subtitle: 'Object storage' } },
    { id: 'stripe', type: 'external', card: { title: 'Stripe', subtitle: 'Payments API', brand: 'stripe' } },
  ],
  edges: [
    { id: 'e1', from: 'web', to: 'gw', label: 'HTTPS' },
    { id: 'e2', from: 'gw', to: 'auth' },
    { id: 'e3', from: 'gw', to: 'orders-svc' },
    { id: 'e4', from: 'gw', to: 'billing-svc' },
    { id: 'e5', from: 'orders-svc', to: 'jobs', kind: 'async', label: 'enqueue' },
    { id: 'e6', from: 'orders-svc', to: 'db' },
    { id: 'e7', from: 'orders-svc', to: 'kv' },
    { id: 'e8', from: 'billing-svc', to: 'db' },
    { id: 'e9', from: 'billing-svc', to: 'stripe' },
    { id: 'e10', from: 'jobs', to: 'blobs', kind: 'async' },
  ],
};
export * from './gallery';
