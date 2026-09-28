import { NODE_TYPES, type DiagramNode, type NodeType } from './types';

export const TYPE_LABELS: Record<NodeType, string> = {
  client: 'Client',
  service: 'Service',
  gateway: 'Gateway',
  database: 'Database',
  cache: 'Cache',
  queue: 'Queue',
  storage: 'Storage',
  external: 'External',
  security: 'Security',
};

export function countByType(nodes: DiagramNode[]): [NodeType, number][] {
  const counts = new Map<NodeType, number>();
  for (const n of nodes) counts.set(n.type, (counts.get(n.type) ?? 0) + 1);
  return NODE_TYPES.filter((t) => counts.has(t)).map((t) => [t, counts.get(t)!]);
}
