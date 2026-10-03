import type { DiagramDraft, DiagramEdge, DiagramNode, NodeType } from '@stackmap/core';

// Made-up diagrams for the shapes that strain a layout: a hub with many labelled calls, a client that both calls and
// receives the reply, cycles, heavy fan-in, nested groups, two-way pairs, a mesh, self-loops, stages and compact cards.

const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ label: `Fact ${i + 1}`, value: `value ${i + 1}` }));
const node = (id: string, type: NodeType = 'service', extra: Partial<DiagramNode> = {}, rowCount = 2): DiagramNode => ({
  id,
  type,
  card: { title: id, subtitle: `${type} node`, rows: rows(rowCount) },
  ...extra,
});
const edge = (from: string, to: string, extra: Partial<DiagramEdge> = {}): DiagramEdge => ({ id: `${from}-${to}`, from, to, ...extra });

const hubNodes = (): DiagramNode[] => [
  node('handler', 'service', { group: 'api' }, 3),
  node('finisher', 'service', { group: 'api' }),
  node('effort', 'service', { group: 'api' }),
  node('pin', 'service', { group: 'api' }, 3),
  node('classifier', 'service', { group: 'router' }, 4),
  node('fallback', 'service', { group: 'router' }, 3),
  node('resolver', 'service', { group: 'router' }, 4),
  node('gate', 'security', { group: 'router' }, 4),
  node('allowlist', 'database', { group: 'store' }),
  node('conversation', 'database', { group: 'store' }, 3),
  node('feed', 'client', { group: 'browser' }),
  node('picker', 'client', { group: 'browser' }, 3),
  node('model', 'external', { group: 'vendor' }, 3),
  node('judge', 'external', { group: 'vendor' }, 3),
  node('catalog', 'external', { group: 'vendor' }),
];
const hubEdges = (): DiagramEdge[] => [
  edge('picker', 'handler', { label: 'send turn', tone: 'main' }),
  edge('handler', 'conversation', { label: 'reads state' }),
  edge('handler', 'allowlist', { label: 'reads' }),
  edge('handler', 'classifier', { label: 'classify turn', tone: 'main' }),
  edge('handler', 'catalog', { label: 'discover models' }),
  edge('handler', 'model', { label: 'stream turn', tone: 'main' }),
  edge('handler', 'resolver', { label: 'intent + depth' }),
  edge('handler', 'gate', { label: 'backstop', tone: 'security' }),
  edge('handler', 'finisher', { label: 'on finish' }),
  edge('handler', 'pin', { label: 'pin if warm' }),
  edge('handler', 'effort'),
  edge('handler', 'feed', { label: 'stream + metadata', kind: 'return' }),
  edge('classifier', 'fallback', { label: 'fallback', tone: 'error' }),
  edge('classifier', 'judge', { label: 'evaluate()' }),
  edge('resolver', 'gate', { label: 'per candidate' }),
  edge('finisher', 'conversation', { label: 'writes pin' }),
];
const hubGroups = [
  { id: 'api', label: 'POST /api/turn' },
  { id: 'router', label: 'Router' },
  { id: 'store', label: 'Database' },
  { id: 'browser', label: 'Browser' },
  { id: 'vendor', label: 'Model gateway' },
];

export const STRESS: Record<string, DiagramDraft> = {
  // A request handler that calls nearly everything, inside groups, with its reply going back to the client group.
  'hub-down': { kind: 'architecture', title: 'Hub, top-down', direction: 'DOWN', groups: hubGroups, nodes: hubNodes(), edges: hubEdges() },
  'hub-right': { kind: 'architecture', title: 'Hub, left to right', direction: 'RIGHT', groups: hubGroups, nodes: hubNodes(), edges: hubEdges() },

  // Many callers into a few shared stores, some labelled, one async.
  'fan-in': {
    kind: 'architecture',
    title: 'Fan-in',
    direction: 'DOWN',
    nodes: [
      node('web', 'client'),
      node('lb', 'gateway'),
      ...['orders', 'billing', 'search', 'users', 'catalog'].map((s) => node(s)),
      node('db', 'database', {}, 3),
      node('cache', 'cache'),
      node('bus', 'queue'),
    ],
    edges: [
      edge('web', 'lb', { label: 'HTTPS', tone: 'main' }),
      ...['orders', 'billing', 'search', 'users', 'catalog'].map((s) => edge('lb', s)),
      ...['orders', 'billing', 'users', 'catalog'].map((s) => edge(s, 'db')),
      edge('search', 'cache', { label: 'warm reads' }),
      edge('orders', 'cache'),
      edge('users', 'cache'),
      edge('orders', 'bus', { kind: 'async', label: 'order.created' }),
      edge('billing', 'bus', { kind: 'async' }),
    ],
  },

  // A retry loop and a reply, left to right, no groups.
  cycle: {
    kind: 'architecture',
    title: 'Cycle',
    direction: 'RIGHT',
    nodes: [node('client', 'client'), node('api'), node('worker'), node('queue', 'queue'), node('store', 'database')],
    edges: [
      edge('client', 'api', { label: 'submit', tone: 'main' }),
      edge('api', 'queue', { label: 'enqueue', kind: 'async' }),
      edge('queue', 'worker', { kind: 'async' }),
      edge('worker', 'store', { label: 'write' }),
      edge('worker', 'queue', { label: 'retry', tone: 'error' }),
      edge('api', 'client', { label: '202 + job id', kind: 'return' }),
    ],
  },

  // Nested groups with edges crossing every boundary.
  nested: {
    kind: 'architecture',
    title: 'Nested groups',
    direction: 'DOWN',
    groups: [
      { id: 'cloud', label: 'Cloud account' },
      { id: 'vpc', label: 'VPC', parent: 'cloud' },
      { id: 'public', label: 'Public subnet', parent: 'vpc' },
      { id: 'private', label: 'Private subnet', parent: 'vpc' },
      { id: 'saas', label: 'Third parties' },
    ],
    nodes: [
      node('browser', 'client'),
      node('cdn', 'gateway', { group: 'cloud' }),
      node('alb', 'gateway', { group: 'public' }),
      node('app', 'service', { group: 'private' }, 3),
      node('jobs', 'service', { group: 'private' }),
      node('rds', 'database', { group: 'private' }),
      node('s3', 'storage', { group: 'cloud' }),
      node('stripe', 'external', { group: 'saas' }),
      node('mail', 'external', { group: 'saas' }),
    ],
    edges: [
      edge('browser', 'cdn', { label: 'HTTPS', tone: 'main' }),
      edge('cdn', 'alb', { tone: 'main' }),
      edge('cdn', 's3', { label: 'static assets' }),
      edge('alb', 'app', { tone: 'main' }),
      edge('app', 'rds', { label: 'SQL' }),
      edge('app', 'jobs', { kind: 'async', label: 'enqueue' }),
      edge('jobs', 'rds'),
      edge('jobs', 's3', { label: 'exports' }),
      edge('app', 'stripe', { label: 'charge', tone: 'security' }),
      edge('jobs', 'mail', { label: 'send receipt' }),
      edge('stripe', 'app', { label: 'webhook', kind: 'async' }),
    ],
  },

  // Two-way pairs: a call each way between the same cards, plus a reply.
  'two-way': {
    kind: 'architecture',
    title: 'Two-way pairs',
    direction: 'RIGHT',
    nodes: [node('a'), node('b'), node('c', 'database'), node('d', 'external')],
    edges: [
      edge('a', 'b', { label: 'request' }),
      edge('b', 'a', { label: 'callback', kind: 'async' }),
      edge('b', 'c', { label: 'reads, writes' }),
      edge('b', 'd', { label: 'verify' }),
      edge('d', 'b', { label: 'result', kind: 'return' }),
    ],
  },

  // Services calling each other in a partial mesh.
  mesh: {
    kind: 'architecture',
    title: 'Mesh',
    direction: 'DOWN',
    nodes: ['gateway', 'auth', 'users', 'orders', 'payments', 'inventory', 'notify'].map((s, i) => node(s, i === 0 ? 'gateway' : i === 1 ? 'security' : 'service')),
    edges: [
      edge('gateway', 'auth', { tone: 'security', label: 'verify token' }),
      edge('gateway', 'users'),
      edge('gateway', 'orders', { tone: 'main' }),
      edge('orders', 'users', { label: 'lookup' }),
      edge('orders', 'payments', { tone: 'main', label: 'charge' }),
      edge('orders', 'inventory', { label: 'reserve' }),
      edge('payments', 'notify', { kind: 'async' }),
      edge('inventory', 'notify', { kind: 'async' }),
      edge('users', 'auth'),
      edge('payments', 'orders', { label: 'settled', kind: 'async' }),
    ],
  },

  // A card that calls itself, among ordinary edges.
  'self-loop': {
    kind: 'architecture',
    title: 'Self-loop',
    direction: 'RIGHT',
    nodes: [node('scheduler'), node('worker'), node('db', 'database')],
    edges: [edge('scheduler', 'scheduler', { label: 'tick' }), edge('scheduler', 'worker', { label: 'dispatch' }), edge('worker', 'db')],
  },

  // A staged pipeline with compact cards and a branch that rejoins.
  'staged-compact': {
    kind: 'dataflow',
    title: 'Staged pipeline',
    density: 'compact',
    phases: [
      { id: 'src', label: 'Sources', nodes: ['app-db', 'events'] },
      { id: 'ingest', label: 'Ingest', nodes: ['cdc', 'collector'] },
      { id: 'process', label: 'Process', nodes: ['stream', 'batch'] },
      { id: 'serve', label: 'Serve', nodes: ['warehouse', 'dash'] },
    ],
    nodes: [
      node('app-db', 'database'),
      node('events', 'client'),
      node('cdc', 'service'),
      node('collector', 'gateway'),
      node('stream', 'queue'),
      node('batch', 'service'),
      node('warehouse', 'storage'),
      node('dash', 'client'),
    ],
    edges: [
      edge('app-db', 'cdc', { label: 'binlog' }),
      edge('events', 'collector', { label: 'HTTP batches' }),
      edge('cdc', 'stream'),
      edge('collector', 'stream'),
      edge('stream', 'batch', { label: 'hourly' }),
      edge('stream', 'warehouse', { label: 'append', tone: 'main' }),
      edge('batch', 'warehouse', { label: 'compacted' }),
      edge('warehouse', 'dash', { label: 'SQL' }),
    ],
  },

  // The smallest layouts: one card, one edge.
  single: { kind: 'architecture', title: 'Single', nodes: [node('only')], edges: [] },
  pair: { kind: 'architecture', title: 'Pair', direction: 'DOWN', nodes: [node('a', 'client'), node('b')], edges: [edge('a', 'b', { label: 'calls' })] },
};
