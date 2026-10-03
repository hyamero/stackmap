import { readdirSync, readFileSync } from 'node:fs';
import type { DiagramDraft } from '@stackmap/core';
import { GALLERY } from '@stackmap/core/gallery';
import { commerceApi, groupedPlatform } from '@stackmap/core/samples';
import { STRESS } from './stress';

const read = (dir: URL) =>
  readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => [f, JSON.parse(readFileSync(new URL(f, dir), 'utf8')) as DiagramDraft] as const);

/**
 * Everything stackmap ships a picture of (the samples, the archify gallery, the skill's examples and the site's
 * gallery) plus the stress set, sequences aside: those lay out on their own and draw no ports.
 */
export const CORPUS: (readonly [string, DiagramDraft])[] = [
  ['commerceApi', commerceApi] as const,
  ['groupedPlatform', groupedPlatform] as const,
  ...Object.entries(GALLERY).map(([name, d]) => [name, d] as const),
  ...read(new URL('../../../skill/examples/', import.meta.url)),
  ...read(new URL('../../../site/content/examples/', import.meta.url)),
  ...Object.entries(STRESS).map(([name, d]) => [`stress ${name}`, d] as const),
].filter(([, d]) => d.kind !== 'sequence');
