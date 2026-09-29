import { expect, test, type Page } from '@playwright/test';

// Screenshots are review artifacts for the look sign-off, not assertions; docs/ is git-ignored.
const OUT = '../../docs/design/spike';

type Clip = { x: number; y: number; width: number; height: number };

const tokenRgb = (page: Page, name: string) =>
  page.evaluate((v) => {
    const hex = getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  }, name);

const viewportOf = (page: Page) =>
  page.evaluate(() => {
    const m = new DOMMatrix(getComputedStyle(document.querySelector('.sm-viewport')!).transform);
    return { x: m.e, y: m.f, k: m.a };
  });

/** Screenshot a region and, per device pixel, report whether it is closer to `ink` than to `paper`. */
async function inkMask(page: Page, clip: Clip, ink: number[], paper: number[]) {
  const png = await page.screenshot({ clip });
  const { width, height, data } = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement('canvas');
    [c.width, c.height] = [img.width, img.height];
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    return { width: c.width, height: c.height, data: [...ctx.getImageData(0, 0, c.width, c.height).data] };
  }, png.toString('base64'));
  const d = (i: number, rgb: number[]) => Math.hypot(data[i]! - rgb[0]!, data[i + 1]! - rgb[1]!, data[i + 2]! - rgb[2]!);
  const inked = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    return d(i, ink) < d(i, paper);
  };
  return { width, height, pxPerCss: width / clip.width, inked };
}

test.describe('accessibility', () => {
  test('cards are named for assistive tech and nothing suggests editing', async ({ page }) => {
    await page.goto('/?page=sample');
    await expect(page.getByRole('region', { name: 'Diagram canvas' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Orders, Database' })).toBeVisible();
    const aria = await page.$$eval('.sm-stage [aria-label], .sm-stage [aria-describedby]', (els) =>
      els.map((e) => `${e.getAttribute('aria-label') ?? ''} ${e.getAttribute('aria-describedby') ?? ''}`.toLowerCase()).join(' '),
    );
    for (const word of ['move', 'delete', 'remove', 'drag']) expect(aria, `aria text mentions "${word}"`).not.toContain(word);
  });
});

test.describe('interaction', () => {
  test('zoom bar zooms in and out, and fit restores the initial view', async ({ page }) => {
    await page.goto('/?page=sample');
    await expect(page.locator('.sm-card')).toHaveCount(6);
    const initial = (await viewportOf(page)).k;
    await page.getByRole('button', { name: 'Zoom in' }).click();
    await expect.poll(async () => (await viewportOf(page)).k).toBeCloseTo(initial * 1.2, 2);
    await page.getByRole('button', { name: 'Zoom out' }).click();
    await expect.poll(async () => (await viewportOf(page)).k).toBeCloseTo(initial, 2);
    await page.getByRole('button', { name: 'Zoom in' }).click();
    await page.getByRole('button', { name: 'Fit to screen' }).click();
    await expect.poll(async () => (await viewportOf(page)).k).toBeCloseTo(initial, 2);
    await expect(page.getByText(`${Math.round(initial * 100)}%`, { exact: true })).toBeVisible();
  });

  test('wheel zooms and dragging pans; nothing moves the cards themselves', async ({ page }) => {
    await page.goto('/?page=sample');
    const stage = (await page.locator('.sm-stage').boundingBox())!;
    const card = page.locator('.sm-card[data-card-id="orders"]');
    const cardStyleBefore = await card.getAttribute('style');
    const before = await viewportOf(page);
    await page.mouse.move(stage.x + stage.width / 2, stage.y + stage.height / 2);
    await page.mouse.wheel(0, -300);
    await expect.poll(async () => (await viewportOf(page)).k).toBeGreaterThan(before.k);

    const mid = await viewportOf(page);
    await page.mouse.move(stage.x + 200, stage.y + 300);
    await page.mouse.down();
    await page.mouse.move(stage.x + 320, stage.y + 360, { steps: 6 });
    await page.mouse.up();
    const after = await viewportOf(page);
    expect(Math.abs(after.x - mid.x - 120)).toBeLessThan(2);
    expect(Math.abs(after.y - mid.y - 60)).toBeLessThan(2);
    expect(await card.getAttribute('style')).toBe(cardStyleBefore);
  });

  test("overlays don't pan or zoom the canvas", async ({ page }) => {
    await page.goto('/?page=sample');
    const before = await viewportOf(page);
    const bar = (await page.getByRole('button', { name: 'Zoom in' }).boundingBox())!;
    await page.mouse.move(bar.x + bar.width / 2, bar.y + bar.height / 2);
    await page.mouse.wheel(0, -300);
    const toolbar = (await page.getByRole('button', { name: 'Search nodes' }).boundingBox())!;
    await page.mouse.move(toolbar.x + 4, toolbar.y + 4);
    await page.mouse.down();
    await page.mouse.move(toolbar.x + 120, toolbar.y + 80, { steps: 6 });
    await page.mouse.up();
    expect(await viewportOf(page)).toEqual(before);
  });

  for (const sample of ['sample', 'grouped']) {
    test(`the fitted ${sample} diagram clears the overlays`, async ({ page }) => {
      await page.goto(`/?page=${sample}`);
      await expect(page.locator('.sm-card').first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const boxes = async (sel: string) => (await page.locator(sel).all()).map((l) => l.boundingBox());
      const panels = (await Promise.all(await boxes('.sm-panel'))).filter((b) => b !== null);
      const cards = await Promise.all(await boxes('.sm-card, .sm-frame'));
      expect(panels.length).toBeGreaterThanOrEqual(2);
      for (const c of cards) {
        for (const p of panels) {
          const overlap = c!.x < p.x + p.width && p.x < c!.x + c!.width && c!.y < p.y + p.height && p.y < c!.y + c!.height;
          expect(overlap, `card at ${c!.x},${c!.y} under a panel`).toBe(false);
        }
      }
    });
  }

  test('theme toggle flips the theme and survives a reload', async ({ page }) => {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('seeded')) {
        localStorage.setItem('stackmap:theme', 'light');
        sessionStorage.setItem('seeded', '1');
      }
    });
    await page.goto('/?page=sample');
    await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark');
    await page.reload();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark');
  });
});

for (const theme of ['light', 'dark'] as const) {
  test.describe(theme, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('stackmap:theme', t), theme);
    });

    test('sample diagram', async ({ page }) => {
      await page.goto('/?page=sample');
      await expect(page.locator('.sm-card')).toHaveCount(6);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `${OUT}/sample-${theme}.png` });
    });

    test('grouped diagram', async ({ page }) => {
      await page.goto('/?page=grouped');
      await expect(page.locator('.sm-card')).toHaveCount(10);
      await expect(page.locator('.sm-frame')).toHaveCount(3);
      await page.evaluate(() => document.fonts.ready);
      expect((await viewportOf(page)).k, 'fit zoom').toBeGreaterThanOrEqual(0.6);
      await page.screenshot({ path: `${OUT}/grouped-${theme}.png` });
    });

    test('gallery cards never overflow their fixed height', async ({ page }) => {
      await page.goto('/?page=gallery');
      await page.evaluate(() => document.fonts.ready);
      const overflowing = await page.$$eval('[data-testid="node-card"]', (cards) =>
        cards
          .filter((c) => c.scrollHeight > c.clientHeight + 1 || c.scrollWidth > c.clientWidth + 1)
          .map((c) => c.getAttribute('data-node-id')),
      );
      expect(overflowing).toEqual([]);
      await page.screenshot({ path: `${OUT}/gallery-${theme}.png`, fullPage: true });
    });

    test('every edge ends in an arrowhead drawn just before its target handle', async ({ page }) => {
      await page.goto('/?page=sample');
      await expect(page.locator('.sm-edge-path')).toHaveCount(9);
      const unresolved = await page.$$eval('.sm-edge-path', (paths) =>
        paths
          .map((p) => {
            const id = /^url\((['"]?)#(.+)\1\)$/.exec(p.getAttribute('marker-end') ?? '')?.[2];
            return id && document.getElementById(id)?.tagName === 'marker' ? null : p.getAttribute('marker-end');
          })
          .filter((m) => m !== null),
      );
      expect(unresolved).toEqual([]);

      const [edgeRgb, stageRgb] = [await tokenRgb(page, '--sm-edge'), await tokenRgb(page, '--sm-stage')];
      for (const target of ['commerce-api-1', 'commerce-api-2', 'commerce-api-3', 'orders', 'sessions']) {
        const handle = (await page.locator(`[data-card-id="${target}"] .sm-handle[data-handle="in"]`).boundingBox())!;
        const cy = handle.y + handle.height / 2;
        // Strip left of the dot: a bare 1.25px line has no edge-coloured pixels 1px+ off its axis, an arrowhead does.
        const m = await inkMask(page, { x: handle.x - 10, y: cy - 4, width: 10, height: 8 }, edgeRgb, stageRgb);
        let columns = 0;
        for (let x = 0; x < m.width; x++) {
          let above = false;
          let below = false;
          for (let y = 0; y < m.height; y++) {
            const off = (y + 0.5) / m.pxPerCss - 4;
            if (Math.abs(off) >= 1 && m.inked(x, y)) off < 0 ? (above = true) : (below = true);
          }
          if (above && below) columns++;
        }
        expect(columns / m.pxPerCss, `${target} arrowhead visible length (css px)`).toBeGreaterThanOrEqual(2);
      }
    });

    test('edges inside a group are drawn above its frame, labels above their line', async ({ page }) => {
      await page.goto('/?page=grouped');
      await expect(page.locator('.sm-frame')).toHaveCount(3);
      const [edgeRgb, fillRgb] = [await tokenRgb(page, '--sm-edge'), await tokenRgb(page, '--sm-group-fill')];
      for (const id of ['e2', 'e5']) {
        const mid = await page.locator(`.sm-edge-path[data-edge-id="${id}"]`).evaluate((p: SVGPathElement) => {
          const pt = p.getPointAtLength(p.getTotalLength() / 2).matrixTransform(p.getScreenCTM()!);
          return { x: pt.x, y: pt.y };
        });
        const m = await inkMask(page, { x: mid.x - 6, y: mid.y - 3, width: 12, height: 6 }, edgeRgb, fillRgb);
        let inked = 0;
        for (let y = 0; y < m.height; y++) for (let x = 0; x < m.width; x++) if (m.inked(x, y)) inked++;
        expect(inked, `${id} visible at its midpoint`).toBeGreaterThan(0);
      }
      const pill = (await page.getByText('HTTPS', { exact: true }).boundingBox())!;
      const m = await inkMask(
        page,
        { x: pill.x + 1.5, y: pill.y + pill.height / 2 - 1, width: 2.5, height: 2 },
        edgeRgb,
        await tokenRgb(page, '--sm-panel'),
      );
      let inked = 0;
      for (let y = 0; y < m.height; y++) for (let x = 0; x < m.width; x++) if (m.inked(x, y)) inked++;
      expect(inked, 'edge ink inside the HTTPS label pill').toBe(0);
    });

    test('handle dots are drawn only where an edge attaches', async ({ page }) => {
      await page.goto('/?page=sample');
      await expect(page.locator('[data-card-id="edge"] .sm-handle[data-handle="in"]')).toHaveCount(0);
      await expect(page.locator('[data-card-id="orders"] .sm-handle[data-handle="out"]')).toHaveCount(0);
      await expect(page.locator('[data-card-id="sessions"] .sm-handle[data-handle="out"]')).toHaveCount(0);
      // edge:out, three API in+out, orders:in, sessions:in
      await expect(page.locator('.sm-handle')).toHaveCount(9);
    });

    test('minimap shows every card and a clearly visible visible-area box; clicking recentres', async ({ page }) => {
      await page.goto('/?page=sample');
      await page.getByRole('button', { name: 'Toggle minimap' }).click();
      const map = page.getByRole('img', { name: 'Minimap' });
      await expect(map).toBeVisible();
      await expect(map.locator('rect.sm-minimap-card')).toHaveCount(6);
      const view = map.locator('rect.sm-minimap-viewport');
      await expect(view).toHaveCount(1);
      // The box strokes in --sm-text, which is AA on the panel in both themes (tokens.test.ts).
      expect(await view.evaluate((r) => (r as SVGRectElement).style.stroke)).toBe('var(--sm-text)');
      // At the fitted zoom the visible area is larger than the content; the box must still fit inside the map.
      const [mapBox, viewBox] = [(await map.boundingBox())!, (await view.boundingBox())!];
      expect(viewBox.x).toBeGreaterThanOrEqual(mapBox.x - 1);
      expect(viewBox.y).toBeGreaterThanOrEqual(mapBox.y - 1);
      expect(viewBox.x + viewBox.width).toBeLessThanOrEqual(mapBox.x + mapBox.width + 1);
      expect(viewBox.y + viewBox.height).toBeLessThanOrEqual(mapBox.y + mapBox.height + 1);
      await page.screenshot({ path: `${OUT}/minimap-${theme}.png` });
      const before = await viewportOf(page);
      await map.click({ position: { x: 8, y: 8 } });
      await expect.poll(async () => (await viewportOf(page)).x).not.toBe(before.x);
      await page.getByRole('button', { name: 'Toggle minimap' }).click();
      await expect(map).toHaveCount(0);
    });

    test('Geist renders, and edges come from the baked routes', async ({ page }) => {
      await page.goto('/?page=sample');
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.fonts.check("500 13px 'Geist'"))).toBe(true);
      expect(await page.evaluate(() => document.fonts.check("400 12px 'Geist Mono'"))).toBe(true);
      await expect(page.locator('.sm-edge-path')).toHaveCount(9);
      expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(theme);
    });
  });
}
