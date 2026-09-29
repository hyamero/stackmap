import type { CardData } from './types';

// Every section has a fixed height so layout (Node, no DOM) and the rendered card agree exactly.
export const CARD = {
  width: 280,
  header: 64,
  row: 28,
  rowsPad: 8,
  statsTiles: 60,
  statsNote: 30,
  statsGap: 12,
  footer: 40,
  cta: 48,
  radius: 14,
} as const;

/** Step, state and participant cards (workflow, lifecycle, sequence): title, subtitle, brand, tag. */
export const COMPACT = {
  width: 176,
  header: 60,
  tagRow: 24,
  radius: 12,
} as const;

export type CardVariant = 'full' | 'compact';

export function cardSize(card: CardData, variant: CardVariant = 'full'): { width: number; height: number } {
  if (variant === 'compact') return { width: COMPACT.width, height: COMPACT.header + (card.tag ? COMPACT.tagRow : 0) };
  let height = CARD.header;
  if (card.rows?.length) height += CARD.rowsPad * 2 + card.rows.length * CARD.row;
  if (card.stats?.length) {
    height += CARD.statsTiles + (card.statsNote ? CARD.statsNote : 0) + CARD.statsGap;
  }
  if (card.footer) height += CARD.footer;
  if (card.cta) height += CARD.cta;
  return { width: CARD.width, height };
}
