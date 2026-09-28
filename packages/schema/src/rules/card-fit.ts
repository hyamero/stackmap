import { cardTextSlots, measureText, type DiagramDraft } from '@stackmap/core';
import type { Diagnostic } from '../diagnostics';

const round = (n: number) => Math.round(n * 10) / 10;

/** Text that the card would truncate with an ellipsis, measured headlessly with Geist metrics. */
export function cardFitDiagnostics(d: DiagramDraft): Diagnostic[] {
  const out: Diagnostic[] = [];
  d.nodes.forEach((n, i) => {
    for (const slot of cardTextSlots(n.card)) {
      const width = measureText(slot.text, slot.face, slot.size);
      if (width <= slot.maxWidth) continue;
      const chars = [...slot.text];
      let maxChars = 0;
      while (maxChars < chars.length && measureText(chars.slice(0, maxChars + 1).join(''), slot.face, slot.size) <= slot.maxWidth) maxChars++;
      const header = slot.path === '/title' || slot.path === '/subtitle';
      out.push({
        code: 'card-fit/overflow',
        severity: 'error',
        subject: `/nodes/${i}/card${slot.path}`,
        message: `"${slot.text}" is ${round(width)}px wide; this slot fits ${round(slot.maxWidth)}px (~${maxChars} characters)`,
        evidence: { text: slot.text, width: round(width), maxWidth: round(slot.maxWidth), maxChars },
        allowedFixes: [`shorten to at most ${maxChars} characters`, ...(header ? ['move the detail into a card row'] : [])],
      });
    }
  });
  return out;
}
