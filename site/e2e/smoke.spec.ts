import { expect, test, type Page } from '@playwright/test';

const ROUTES = ['/', '/docs', '/docs/schema', '/examples', '/kinds/architecture', '/kinds/dataflow', '/kinds/workflow', '/kinds/lifecycle', '/kinds/sequence'];

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

for (const route of ROUTES) {
  test(`${route} renders with no console errors`, async ({ page }) => {
    const errors = collectErrors(page);
    const res = await page.goto(route);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });

  test(`${route} shares with a title, description and image`, async ({ page }) => {
    await page.goto(route);
    for (const p of ['og:title', 'og:description', 'og:url', 'og:image']) await expect(page.locator(`meta[property="${p}"]`), p).toHaveAttribute('content', /\S/);
    const image = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect((await page.request.get(new URL(image!).pathname)).status()).toBe(200);
  });

  test(`${route} never scrolls sideways on a 320px phone`, async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 }, reducedMotion: 'reduce' });
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    await page.close();
  });

  test(`${route} never skips a heading level`, async ({ page }) => {
    await page.goto(route);
    // Headings the reader can reach: the other composition's copy is display:none on the landing.
    const levels = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll((hs) =>
      hs.filter((h) => h.getClientRects().length || h.closest('.sr-only, .sr')).map((h) => Number(h.tagName[1])),
    );
    levels.forEach((l, i) => expect(l, `heading ${i} after h${levels[i - 1]}`).toBeLessThanOrEqual((levels[i - 1] ?? 0) + 1));
  });
}

test('an unknown address gets the 404 page, kept out of the index', async ({ page }) => {
  const res = await page.goto('/no/such/page');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1, name: 'Off the map.' })).toBeVisible();
  await expect(page).toHaveTitle(/^Page not found · stackmap$/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await page.getByRole('navigation', { name: 'Ways back' }).getByRole('link', { name: /Examples/ }).click();
  await expect(page).toHaveURL(/\/examples$/);
});

test('with reduced motion every landing scene is its resting frame, nothing pinned', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.lp-d')).not.toHaveClass(/live/);
  expect(await page.locator('.pin-spacer').count()).toBe(0);
  await expect(page.getByRole('heading', { level: 1, name: /Every layer of your stack/ }).first()).toBeVisible();
  // The composed frames need no scrolling through a pin: each scene is one frame tall.
  for (const scene of await page.locator('.lp-d [data-scene]').all()) expect((await scene.boundingBox())!.height).toBeLessThanOrEqual(900);
  await expect(page.locator('.lp-d #kinds .kl2')).toHaveCSS('opacity', '1');
});

test('with motion allowed the scenes pin and scrub', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('.lp-d')).toHaveClass(/live/);
  expect(await page.locator('.lp-d .pin-spacer').count()).toBeGreaterThanOrEqual(6);
  await page.close();
});

test('the phone composition takes over below 768px', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.lp-m')).toBeVisible();
  await expect(page.locator('.lp-d')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.close();
});

test('the example viewer selects a card and shows it in the inspector', async ({ page }) => {
  await page.goto('/examples');
  await page.getByRole('button', { name: /Open in the viewer/ }).click();
  const card = page.locator('.sm-card').first();
  await expect(card).toBeVisible();
  const title = (await card.getAttribute('aria-label'))!.split(',')[0]!;
  await card.click();
  await expect(page.getByRole('complementary', { name: 'Inspector' }).getByRole('heading', { name: title })).toBeVisible();
});

test('the docs copy button confirms', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/docs');
  await page.getByRole('button', { name: 'Copy the install command' }).click();
  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('npx skills add hyamero/stackmap');
});

test('on a phone the nav menu opens the site links and closes on Escape', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('/docs');
  const menu = page.getByRole('button', { name: 'Menu' });
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  const links = page.getByRole('navigation', { name: 'Site menu' });
  await expect(links.getByRole('link', { name: 'Examples' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
  await menu.click();
  await links.getByRole('link', { name: 'Examples' }).click();
  await expect(page).toHaveURL(/\/examples$/);
  await expect(page.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false');
  await page.close();
});

test('each kind plays its flow while it holds', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('.lp-d')).toHaveClass(/live/);
  const visible = page.locator('.lp-d #kinds .kl0 [data-pulse]:not([style*="hidden"])');
  expect(await visible.count()).toBe(0);
  // A little way into the first kind's hold, its opening pulses are on the wire.
  await page.evaluate(() => {
    const spacer = document.querySelector('.lp-d [data-scene="kinds"]')!.closest('.pin-spacer') as HTMLElement;
    const top = spacer.getBoundingClientRect().top + scrollY;
    scrollTo(0, top + (spacer.offsetHeight - innerHeight) * 0.02);
  });
  await expect.poll(() => visible.count()).toBeGreaterThan(0);
  await page.close();
});

test('the landing viewer keeps its own button colours', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('.lp-d')).toHaveClass(/live/);
  await page.evaluate(() => {
    const spacer = document.querySelector('.lp-d [data-scene="viewer"]')!.closest('.pin-spacer') as HTMLElement;
    scrollTo(0, spacer.getBoundingClientRect().top + scrollY + (spacer.offsetHeight - innerHeight) * 0.9);
  });
  const exportButton = page.locator('.lp-d .vreal button[aria-haspopup="menu"]');
  await expect(exportButton).toBeVisible();
  const [fg, bg] = await exportButton.evaluate((el) => [getComputedStyle(el).color, getComputedStyle(el).backgroundColor]);
  expect(fg).not.toBe(bg);
  await page.close();
});
