import { expect, test } from '@playwright/test';

// Pixel baselines for the look (M0 sign-off): font rasterisation differs per OS, so baselines exist for
// Linux only (CI, or `bun run visual:update`, which runs Playwright's Linux image in Docker).
test.skip(process.platform !== 'linux' && !process.env.VISUAL, 'visual baselines are Linux-only');

const PAGES = {
  sample: '/?page=sample',
  grouped: '/?page=grouped',
  gallery: '/?page=gallery',
  workflow: '/?page=release-delivery',
  lifecycle: '/?page=agent-run',
  stages: '/?page=product-analytics',
} as const;

for (const theme of ['light', 'dark'] as const) {
  for (const [name, url] of Object.entries(PAGES)) {
    test(`${name} · ${theme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      await page.goto(url);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(200);
      await expect(page).toHaveScreenshot(`${name}-${theme}.png`, { maxDiffPixelRatio: 0.002 });
    });
  }
}
