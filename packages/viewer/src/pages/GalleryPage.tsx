import { NODE_TYPES, TYPE_LABELS, type DiagramNode, type NodeType } from '@stackmap/core';
import { NodeCard } from '../card/NodeCard';
import type { ThemeChoice } from '../theme/theme';

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

export function GalleryPage({ theme, onToggleTheme }: { theme: ThemeChoice; onToggleTheme: () => void }) {
  return (
    <div className="min-h-full bg-page px-10 py-8 font-sans text-fg">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-[28px] font-semibold tracking-tight">Card gallery</h1>
        <button
          type="button"
          onClick={onToggleTheme}
          className="rounded-full bg-primary px-4 py-2 text-[14px] font-medium text-primary-fg"
        >
          {theme === 'dark' ? 'Light' : 'Dark'} theme
        </button>
      </header>
      {[
        ['Bare', NODE_TYPES.map(bare)],
        ['Rich', NODE_TYPES.map(rich)],
        ['Stress', [stress]],
      ].map(([label, nodes]) => (
        <section key={label as string} className="mb-10">
          <h2 className="mb-4 text-[11px] font-medium tracking-[0.12em] text-fg-muted uppercase">{label as string}</h2>
          <div className="grid grid-cols-[repeat(auto-fill,280px)] items-start gap-6">
            {(nodes as DiagramNode[]).map((n) => (
              <NodeCard key={n.id} node={n} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
