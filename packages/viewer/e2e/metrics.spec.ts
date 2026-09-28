import { expect, test } from '@playwright/test';
import { cardTextSlots, measureText, type FontFace } from '@stackmap/core';
import { boundaryNodes } from '../src/pages/boundary-nodes';
import { GALLERY_SECTIONS } from '../src/pages/gallery-nodes';

// Browser ground truth for the headless card-fit measure (M1): the generated table must match what
// Chromium renders, including kerning, within a small conservative margin.
const CORPUS = [
  'commerce-api-1',
  'API · Instance 1',
  'PostgreSQL cluster',
  'OpenShip Edge',
  'Load balancing',
  'Round robin',
  '2 replication links',
  'Open cluster',
  'Primary shards',
  'AVATAR Wolf, Tv. “quoted” — dash…',
  'The quick brown fox jumps over the lazy dog',
  'WAVE Type LTA 1234567890',
];
const FACES: { face: FontFace; css: string; sizes: number[] }[] = [
  { face: 'sans400', css: "400 {s}px 'Geist'", sizes: [11, 11.5, 12] },
  { face: 'sans500', css: "500 {s}px 'Geist'", sizes: [13, 13.5] },
  { face: 'sans500tnum', css: "500 {s}px 'Geist'", sizes: [15] },
  { face: 'mono400', css: "400 {s}px 'Geist Mono'", sizes: [12] },
];

test('headless text measure matches the browser within a conservative margin', async ({ page }) => {
  await page.goto('/?page=gallery');
  await page.evaluate(() => document.fonts.ready);
  const worst: string[] = [];
  for (const { face, css, sizes } of FACES) {
    for (const size of sizes) {
      const font = css.replace('{s}', String(size));
      const browser = await page.evaluate(
        ({ font, tnum, corpus }) => {
          const span = document.createElement('span');
          span.style.font = font;
          span.style.whiteSpace = 'pre';
          span.style.position = 'absolute';
          if (tnum) span.style.fontVariantNumeric = 'tabular-nums';
          document.body.append(span);
          const widths = corpus.map((t) => ((span.textContent = t), span.getBoundingClientRect().width));
          span.remove();
          return widths;
        },
        { font, tnum: face === 'sans500tnum', corpus: CORPUS },
      );
      CORPUS.forEach((text, i) => {
        const ours = measureText(text, face, size);
        const real = browser[i]!;
        // Never narrower than the browser (would hide an overflow), and never more than 2% + 0.5px wider.
        if (ours < real - 0.25 || ours > real * 1.02 + 0.5) worst.push(`${face} ${size}px "${text}": ours ${ours.toFixed(2)} vs ${real.toFixed(2)}`);
      });
    }
  }
  expect(worst).toEqual([]);
});

test('a card slot truncates exactly when its measured text exceeds its budget', async ({ page }) => {
  await page.goto('/?page=gallery');
  await page.evaluate(() => document.fonts.ready);
  const rendered = await page.$$eval('[data-testid="node-card"]', (cards) =>
    Object.fromEntries(
      cards.map((card) => [
        card.getAttribute('data-node-id')!,
        [...card.querySelectorAll<HTMLElement>('span[title], div[title]')].map((el) => ({
          text: el.getAttribute('title')!,
          truncated: el.scrollWidth > el.clientWidth,
        })),
      ]),
    ),
  );
  const mismatches: string[] = [];
  let checked = 0;
  for (const [, nodes] of [...GALLERY_SECTIONS, ['Boundary', boundaryNodes()] as const]) {
    for (const node of nodes) {
      const slots = cardTextSlots(node.card);
      const dom = rendered[node.id]!;
      expect(dom.map((d) => d.text), node.id).toEqual(slots.map((s) => s.text));
      slots.forEach((slot, i) => {
        const width = measureText(slot.text, slot.face, slot.size);
        if (Math.abs(width - slot.maxWidth) < 1) return; // scrollWidth is integer-rounded
        checked++;
        if (width > slot.maxWidth !== dom[i]!.truncated)
          mismatches.push(`${node.id}${slot.path}: measured ${width.toFixed(1)} / budget ${slot.maxWidth.toFixed(1)}, truncated=${dom[i]!.truncated}`);
      });
    }
  }
  expect(mismatches).toEqual([]);
  expect(checked).toBeGreaterThan(60);
});

test('text outside the Latin subset is never measured narrower than it renders', async ({ page }) => {
  await page.goto('/?page=gallery');
  await page.evaluate(() => document.fonts.ready);
  const corpus = ['🚀🚀🚀 deploy', '✅ healthy', '🇩🇪 Frankfurt', '支付服务', '注文サービス', '결제 서비스', 'naïve café', 'Zürich — Ørsted'];
  const real = await page.evaluate((corpus) => {
    const span = document.createElement('span');
    span.style.cssText = "font:500 13.5px 'Geist';white-space:pre;position:absolute";
    document.body.append(span);
    const w = corpus.map((t) => ((span.textContent = t), span.getBoundingClientRect().width));
    span.remove();
    return w;
  }, corpus);
  const under = corpus.filter((t, i) => measureText(t, 'sans500', 13.5) < real[i]! - 0.25);
  expect(under).toEqual([]);
});
