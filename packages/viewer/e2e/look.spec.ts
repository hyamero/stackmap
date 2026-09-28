import { expect, test } from '@playwright/test';

// Screenshots are review artifacts for the M0 sign-off, not assertions; docs/ is git-ignored.
const OUT = '../../docs/design/spike';

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
