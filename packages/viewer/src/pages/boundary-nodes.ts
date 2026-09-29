import { cardTextSlots, measureText, type CardData, type DiagramNode } from '@stackmap/core';

// Every slot filled with text ~2px under (fits) and ~2px over (truncates) its budget, so the browser test
// that pins cardTextSlots to the rendered card has cases on both sides of each boundary.
// No spaces: trailing whitespace collapses in the browser and would skew the edge cases.
const FILLER = /* @__PURE__ */ 'Boundary-text-for-budget-checks-abcdefghijklmnopqrstuvwxyz-0123456789-'.repeat(4);
const template: CardData = {
  title: FILLER,
  subtitle: FILLER,
  rows: [{ label: FILLER, value: ':3000', mono: true }, { label: 'Region', value: FILLER }],
  stats: [{ value: '1234567890', label: FILLER }, { value: '2', label: FILLER }],
  statsNote: FILLER,
  footer: { left: { text: FILLER, icon: 'region' }, right: { text: FILLER } },
  cta: { label: FILLER },
};

/** Longest prefix at least 2px under each budget (`under`), or shortest prefix at least 2px over it. */
function fitTo(card: CardData, side: 'under' | 'over'): CardData {
  const out = structuredClone(card) as unknown as Record<string, unknown>;
  for (const slot of cardTextSlots(card)) {
    const width = (n: number) => measureText(slot.text.slice(0, n), slot.face, slot.size);
    let n = 1;
    if (side === 'under') while (n < slot.text.length && width(n + 1) <= slot.maxWidth - 2) n++;
    else while (n < slot.text.length && width(n) < slot.maxWidth + 2) n++;
    const keys = slot.path.slice(1).split('/');
    let target = out as Record<string, unknown>;
    for (const k of keys.slice(0, -1)) target = target[k] as Record<string, unknown>;
    target[keys.at(-1)!] = slot.text.slice(0, n);
  }
  return out as unknown as CardData;
}

// A function, so a production build that never calls it drops this module and the metrics table with it.
export const boundaryNodes = (): DiagramNode[] => [
  { id: 'boundary-under', type: 'database', card: fitTo(template, 'under') },
  { id: 'boundary-over', type: 'cache', card: fitTo(template, 'over') },
];
