import { expect, test, type Page } from '@playwright/test';

// Screenshots are review artifacts for the M0 sign-off, not assertions; docs/ is git-ignored.
const OUT = '../../docs/design/spike';

type Clip = { x: number; y: number; width: number; height: number };

const tokenRgb = (page: Page, name: string) =>
  page.evaluate((v) => {
    const hex = getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  }, name);

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

for (const theme of ['light', 'dark'] as const) {
  test.describe(theme, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('stackmap:theme', t), theme);
    });

    test('sample diagram', async ({ page }) => {
      await page.goto('/?page=sample');
      await expect(page.locator('.react-flow__node-card')).toHaveCount(6);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `${OUT}/sample-${theme}.png` });
    });

    test('grouped diagram', async ({ page }) => {
      await page.goto('/?page=grouped');
      await expect(page.locator('.react-flow__node-card')).toHaveCount(10);
      await expect(page.locator('.react-flow__node-frame')).toHaveCount(3);
      await page.evaluate(() => document.fonts.ready);
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
      await expect(page.locator('.react-flow__edge-path')).toHaveCount(9);
      const unresolved = await page.$$eval('.react-flow__edge-path', (paths) =>
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
        const handle = (await page.locator(`[data-id="${target}"] .react-flow__handle[data-handleid="in"]`).boundingBox())!;
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

    test('edges inside a group are drawn above its frame', async ({ page }) => {
      await page.goto('/?page=grouped');
      await expect(page.locator('.react-flow__node-frame')).toHaveCount(3);
      const [edgeRgb, fillRgb] = [await tokenRgb(page, '--sm-edge'), await tokenRgb(page, '--sm-group-fill')];
      // gw→auth and orders→jobs (async, dashed) both run entirely inside their group.
      for (const id of ['e2', 'e5']) {
        const mid = await page.locator(`.react-flow__edge-path[id="${id}"]`).evaluate((p: SVGPathElement) => {
          const pt = p.getPointAtLength(p.getTotalLength() / 2).matrixTransform(p.getScreenCTM()!);
          return { x: pt.x, y: pt.y };
        });
        const m = await inkMask(page, { x: mid.x - 6, y: mid.y - 3, width: 12, height: 6 }, edgeRgb, fillRgb);
        let inked = 0;
        for (let y = 0; y < m.height; y++) for (let x = 0; x < m.width; x++) if (m.inked(x, y)) inked++;
        expect(inked, `${id} visible at its midpoint`).toBeGreaterThan(0);
      }

      // Labels sit on their edge: the line must stop at the pill, not strike through it.
      const pill = (await page.getByText('HTTPS', { exact: true }).boundingBox())!;
      const m = await inkMask(page, { x: pill.x + 1.5, y: pill.y + pill.height / 2 - 1, width: 2.5, height: 2 }, edgeRgb, await tokenRgb(page, '--sm-panel'));
      let inked = 0;
      for (let y = 0; y < m.height; y++) for (let x = 0; x < m.width; x++) if (m.inked(x, y)) inked++;
      expect(inked, 'edge ink inside the HTTPS label pill').toBe(0);
    });

    test('handle dots are drawn only where an edge attaches', async ({ page }) => {
      await page.goto('/?page=sample');
      await expect(page.locator('.react-flow__edge-path')).toHaveCount(9);
      await expect(page.locator('[data-id="edge"] .react-flow__handle[data-handleid="in"]')).toHaveCount(0);
      await expect(page.locator('[data-id="orders"] .react-flow__handle[data-handleid="out"]')).toHaveCount(0);
      await expect(page.locator('[data-id="sessions"] .react-flow__handle[data-handleid="out"]')).toHaveCount(0);
      // edge:out, three API in+out, orders:in, sessions:in
      await expect(page.locator('.react-flow__handle')).toHaveCount(9);
    });

    test('Geist renders, and edges come from the baked routes', async ({ page }) => {
      await page.goto('/?page=sample');
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.fonts.check("500 13px 'Geist'"))).toBe(true);
      expect(await page.evaluate(() => document.fonts.check("400 12px 'Geist Mono'"))).toBe(true);
      await expect(page.locator('.react-flow__edge-path')).toHaveCount(9);
      expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(theme);
    });
  });
}
