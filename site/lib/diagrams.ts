import type { LaidOutDiagram } from '@stackmap/core';
import diagrams from '@/generated/diagrams.json';
import sources from '@/generated/sources.json';
import still from '@/generated/static.json';
import type { Entry } from './catalog';
import type { SiteDiagrams, SiteSources } from './data/diagrams';
import type { StaticDiagram } from './data/static-html';

// Server-only: pages pass single diagrams down, so a client island never ships the whole file.
const DIAGRAMS = diagrams as unknown as SiteDiagrams;
export const SOURCES: SiteSources = sources;

export function diagramOf(e: Pick<Entry, 'source' | 'key'>): LaidOutDiagram {
  const d = DIAGRAMS[e.source][e.key];
  if (!d) throw new Error(`no laid-out diagram for ${e.source}/${e.key}; run \`bun run data\``);
  return d;
}

export const QUICK_START: LaidOutDiagram = DIAGRAMS.quickStart;
export const DEMO: LaidOutDiagram = DIAGRAMS.demo;
export const CHECKOUT: Record<string, LaidOutDiagram> = DIAGRAMS.checkout;

const STILL = still as Record<string, StaticDiagram>;

/** A diagram pre-rendered at build time: `demo`, `quickStart`, or `<source>/<key>` (gallery, examples, skill, checkout). */
export function stillOf(key: string): StaticDiagram {
  const d = STILL[key];
  if (!d) throw new Error(`no pre-rendered diagram ${key}; run \`bun run data\``);
  return d;
}
