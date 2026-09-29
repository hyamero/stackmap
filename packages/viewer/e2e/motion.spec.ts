import { expect, test, type Page } from '@playwright/test';

// Motion is opt-in here; every other spec runs with reduced motion (see playwright.config.ts).
test.use({ contextOptions: { reducedMotion: 'no-preference' } });

const running = (page: Page) => page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
const settled = (page: Page) => expect.poll(() => running(page), { timeout: 5000 }).toBe(0);

test('the intro plays, then leaves no inline trace behind', async ({ page }) => {
  await page.goto('/?page=grouped');
  await expect.poll(() => running(page)).toBeGreaterThan(0);
  await settled(page);
  // Wait out the JS-driven edge draw as well as the WAAPI tweens.
  await expect(page.locator('.sm-edge-path[data-drawing]')).toHaveCount(0);
  const leftovers = await page.evaluate(() => ({
    cards: [...document.querySelectorAll<HTMLElement>('.sm-card')].filter((c) => c.style.opacity || c.style.transform).length,
    frames: [...document.querySelectorAll<HTMLElement>('[data-frame-id]')].filter((f) => f.style.opacity).length,
    drawn: [...document.querySelectorAll('.sm-edge-path')].filter((p) => ['pathLength', 'stroke-dasharray', 'stroke-dashoffset', 'draw'].some((a) => p.hasAttribute(a))).length,
    async: [...document.querySelectorAll<SVGPathElement>('.sm-edge-path')].filter((p) => /^5(px)?,? 4(px)?$/.test(p.style.strokeDasharray)).length,
  }));
  expect(leftovers).toEqual({ cards: 0, frames: 0, drawn: 0, async: 2 });
});

test('after the intro, emphasis is still CSS: tracing dims to 0.22', async ({ page }) => {
  await page.goto('/?page=sample');
  await settled(page);
  await page.locator('.sm-card[data-card-id="orders"]').click();
  await page.getByRole('button', { name: /^Trace/ }).click();
  const dimmed = page.locator('.sm-card[data-card-id="sessions"]');
  await expect(dimmed).toHaveAttribute('data-emphasis', 'dim');
  await expect.poll(() => dimmed.evaluate((el) => getComputedStyle(el).opacity)).toBe('0.22');
});

test('popovers opened by pointer grow in; search opened with "/" appears at once', async ({ page }) => {
  await page.goto('/?page=sample');
  await settled(page);
  await page.getByRole('button', { name: 'Filter by type' }).click();
  const lens = page.getByRole('group', { name: 'Show node types' });
  await expect.poll(() => lens.evaluate((el) => el.getAnimations().length)).toBeGreaterThan(0);
  await settled(page);
  await page.keyboard.press('Escape');
  await page.locator('body').click({ position: { x: 5, y: 5 } });
  await page.keyboard.press('/');
  const search = page.getByRole('combobox', { name: 'Search nodes' });
  await expect(search).toBeFocused();
  expect(await search.evaluate((el) => el.parentElement!.getAnimations().length)).toBe(0);
});

test('reduced motion: nothing animates', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('http://localhost:4173/?page=grouped');
  await expect(page.locator('.sm-card').first()).toBeVisible();
  expect(await running(page)).toBe(0);
  await context.close();
});
