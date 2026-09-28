import { describe, expect, it } from 'vitest';
import { CARD, cardSize } from '../src/card-metrics';

describe('cardSize', () => {
  it('bare card is header only', () => {
    expect(cardSize({ title: 'api' })).toEqual({ width: CARD.width, height: CARD.header });
  });

  it('adds rows with block padding', () => {
    const rows = [{ label: 'a', value: '1' }, { label: 'b', value: '2' }];
    expect(cardSize({ title: 'x', rows }).height).toBe(CARD.header + CARD.rowsPad * 2 + 2 * CARD.row);
  });

  it('ignores statsNote without stats', () => {
    expect(cardSize({ title: 'x', statsNote: 'orphan' }).height).toBe(CARD.header);
  });

  it('adds stats, note, footer and cta', () => {
    const size = cardSize({
      title: 'Orders',
      stats: [{ value: '1', label: 'Primary' }],
      statsNote: '2 replication links',
      footer: { left: { text: 'EU West', icon: 'region' } },
      cta: { label: 'Open cluster' },
    });
    expect(size.height).toBe(
      CARD.header + CARD.statsTiles + CARD.statsNote + CARD.statsGap + CARD.footer + CARD.cta,
    );
  });

  it('treats empty arrays as absent', () => {
    expect(cardSize({ title: 'x', rows: [], stats: [] }).height).toBe(CARD.header);
  });
});
