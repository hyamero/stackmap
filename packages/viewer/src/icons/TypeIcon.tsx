import {
  AppWindow,
  Database,
  Globe,
  HardDrive,
  ListOrdered,
  Monitor,
  Network,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { NodeType } from '@stackmap/core';

const ICONS: Record<NodeType, LucideIcon> = {
  client: Monitor,
  service: AppWindow,
  gateway: Network,
  database: Database,
  cache: Zap,
  queue: ListOrdered,
  storage: HardDrive,
  external: Globe,
  security: ShieldCheck,
};

export function TypeIcon({ type, size }: { type: NodeType; size: number }) {
  const Icon = ICONS[type];
  return <Icon size={size} strokeWidth={1.75} aria-hidden="true" data-icon="type" />;
}
