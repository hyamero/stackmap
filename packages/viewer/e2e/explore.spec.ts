import { expect, test, type Page } from '@playwright/test';

// M3 explorer: selection, inspector, trace, search, lens, views, deep links, keyboard.
const viewportOf = (page: Page) =>
  page.evaluate(() => {
    const m = new DOMMatrix(getComputedStyle(document.querySelector('.sm-viewport')!).transform);
    return { x: m.e, y: m.f, k: m.a };
  });
const card = (page: Page, id: string) => page.locator(`.sm-card[data-card-id="${id}"]`);
const emphasisOf = (page: Page) =>
  page.$$eval('.sm-card', (els) => Object.fromEntries(els.map((e) => [e.getAttribute('data-card-id'), e.getAttribute('data-emphasis')])));
const inspector = (page: Page) => page.getByRole('complementary', { name: 'Inspector' });
const settle = (page: Page) => page.waitForTimeout(250);

test.beforeEach(async ({ page }) => {
  await page.goto('/?page=sample');
  await expect(page.locator('.sm-card')).toHaveCount(6);
  await settle(page);
});

test('clicking a card selects it: inspector shows its data, connections and evidence', async ({ page }) => {
  await card(page, 'orders').click();
  await expect(card(page, 'orders')).toHaveAttribute('aria-pressed', 'true');
  const panel = inspector(page);
  await expect(panel.getByRole('heading', { level: 2, name: 'Orders' })).toBeVisible();
  await expect(panel.getByText('Read replicas', { exact: true })).toBeVisible();
  await expect(panel.getByRole('list', { name: 'Connections' }).getByRole('button')).toHaveCount(3);
  const link = panel.getByRole('link', { name: 'infra/orders/postgres.tf:12' });
  await expect(link).toHaveAttribute('href', 'https://github.com/hyamero/stackmap/blob/main/infra/orders/postgres.tf#L12');
  await expect(panel.getByText('Primary + 2 read replicas')).toBeVisible();
  // Its direct edges take the source (service) tint.
  await expect(page.locator('path[data-edge-id="e-1-orders"]')).toHaveAttribute('data-tint', 'service');
  await expect(page.locator('path[data-edge-id="e-edge-1"]')).not.toHaveAttribute('data-tint', /.+/);
});

test('a connection in the inspector selects that node', async ({ page }) => {
  await card(page, 'orders').click();
  await inspector(page).getByRole('button', { name: /commerce-api-2/ }).click();
  await expect(card(page, 'commerce-api-2')).toHaveAttribute('aria-pressed', 'true');
});

test('clicking empty canvas or pressing Escape clears the selection; dragging does not', async ({ page }) => {
  await card(page, 'orders').click();
  const stage = page.locator('.sm-stage');
  const box = (await stage.boundingBox())!;
  // Drag across empty canvas: pans, keeps the selection.
  await page.mouse.move(box.x + box.width - 60, box.y + box.height - 120);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 160, box.y + box.height - 160, { steps: 5 });
  await page.mouse.up();
  await expect(card(page, 'orders')).toHaveAttribute('aria-pressed', 'true');
  // Drag that starts on a card: no selection change either.
  const c = (await card(page, 'sessions').boundingBox())!;
  await page.mouse.move(c.x + 40, c.y + 20);
  await page.mouse.down();
  await page.mouse.move(c.x - 60, c.y + 60, { steps: 5 });
  await page.mouse.up();
  await expect(card(page, 'orders')).toHaveAttribute('aria-pressed', 'true');
  // A real click on empty canvas clears. (d3-zoom swallows clicks for one tick after a drag.)
  await page.waitForTimeout(50);
  await page.mouse.click(box.x + box.width - 40, box.y + box.height - 100);
  await expect(card(page, 'orders')).toHaveAttribute('aria-pressed', 'false');
  await card(page, 'orders').click();
  await page.keyboard.press('Escape');
  await expect(card(page, 'orders')).toHaveAttribute('aria-pressed', 'false');
});

test('trace dims everything outside the selection’s upstream and downstream', async ({ page }) => {
  await card(page, 'commerce-api-1').click();
  await page.getByRole('button', { name: /Trace upstream/ }).click();
  const e = await emphasisOf(page);
  expect(e).toEqual({ edge: 'normal', 'commerce-api-1': 'focus', 'commerce-api-2': 'dim', 'commerce-api-3': 'dim', orders: 'normal', sessions: 'normal' });
  await expect(page.locator('path[data-edge-id="e-edge-1"]')).toHaveAttribute('data-tint', 'gateway');
  await expect(page.locator('path[data-edge-id="e-2-orders"]')).toHaveAttribute('data-dim', 'true');
});

test('"/" opens search; Enter selects the first match and centres it', async ({ page }) => {
  await page.locator('body').press('/');
  const box = page.getByRole('combobox', { name: 'Search nodes' });
  await expect(box).toBeFocused();
  await box.fill('sess');
  await expect(page.getByRole('option')).toHaveText([/Sessions/]);
  expect((await emphasisOf(page)).orders).toBe('dim');
  await box.press('Enter');
  await expect(box).toBeHidden();
  await expect(card(page, 'sessions')).toHaveAttribute('aria-pressed', 'true');
  await settle(page);
  const stage = (await page.locator('.sm-stage').boundingBox())!;
  const c = (await card(page, 'sessions').boundingBox())!;
  expect(Math.abs(c.x + c.width / 2 - (stage.x + stage.width / 2))).toBeLessThan(2);
});

test('search tolerates regex characters and whitespace', async ({ page }) => {
  await page.getByRole('button', { name: /Search nodes/ }).click();
  const box = page.getByRole('combobox', { name: 'Search nodes' });
  for (const q of ['.*', '(', '   ', '[a-z]+']) {
    await box.fill(q);
    await expect(page.locator('.sm-card')).toHaveCount(6);
  }
  await box.fill('.*');
  await expect(page.getByText('No matching nodes')).toBeVisible();
});

test('the type lens dims unchecked types and can be restored', async ({ page }) => {
  await page.getByRole('button', { name: 'Filter by type' }).click();
  await page.getByRole('checkbox', { name: /Service/ }).uncheck();
  const e = await emphasisOf(page);
  expect(e['commerce-api-1']).toBe('dim');
  expect(e.orders).toBe('normal');
  await expect(page.getByRole('button', { name: 'Filter by type' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('checkbox', { name: /Service/ }).check();
  expect((await emphasisOf(page))['commerce-api-1']).toBe('normal');
});

test('a view tab dims non-members, shows its caption and fits its members', async ({ page }) => {
  const before = await viewportOf(page);
  await page.getByRole('tab', { name: 'Data tier' }).click();
  await expect(page.getByText('Where state lives')).toBeVisible();
  const e = await emphasisOf(page);
  expect([e.orders, e.sessions, e['commerce-api-1']]).toEqual(['normal', 'normal', 'dim']);
  await settle(page);
  expect((await viewportOf(page)).k).toBeGreaterThan(before.k);
  await page.getByRole('tab', { name: 'Overview' }).click();
  await settle(page);
  expect(await viewportOf(page)).toEqual(before);
});

test('state is mirrored in the hash and restored from a deep link', async ({ page }) => {
  await page.getByRole('tab', { name: 'Data tier' }).click();
  await card(page, 'orders').click();
  await page.getByRole('button', { name: 'Filter by type' }).click();
  await page.getByRole('checkbox', { name: /Cache/ }).uncheck();
  expect(new URL(page.url()).hash).toBe('#view=data&node=orders&lens=cache');
  await page.reload();
  await expect(card(page, 'orders')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('tab', { name: 'Data tier' })).toHaveAttribute('aria-selected', 'true');
  expect((await emphasisOf(page)).sessions).toBe('dim');
});

test('a deep link with unknown ids is ignored and the viewer still renders', async ({ page }) => {
  await page.goto('/?page=sample#view=nope&node=ghost&lens=lambda');
  await expect(page.locator('.sm-card')).toHaveCount(6);
  expect(Object.values(await emphasisOf(page)).every((v) => v === 'normal')).toBe(true);
  await expect(page.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
});

test('keyboard only: tab to a card, arrow between cards, Enter selects, Escape clears', async ({ page }) => {
  await card(page, 'edge').focus();
  await page.keyboard.press('ArrowRight');
  await expect(card(page, 'commerce-api-2')).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(card(page, 'commerce-api-1')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(card(page, 'commerce-api-1')).toHaveAttribute('aria-pressed', 'true');
  await expect(inspector(page).getByRole('heading', { level: 2, name: 'commerce-api-1' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(card(page, 'commerce-api-1')).toHaveAttribute('aria-pressed', 'false');
  // Every card is reachable with Tab.
  const ids = new Set<string>();
  await page.locator('.sm-stage').focus();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    ids.add((await page.evaluate(() => document.activeElement?.getAttribute('data-card-id'))) ?? '');
  }
  expect([...ids].sort()).toEqual(['commerce-api-1', 'commerce-api-2', 'commerce-api-3', 'edge', 'orders', 'sessions']);
});

test('focusing an off-screen card pans it into view', async ({ page }) => {
  await page.getByRole('button', { name: 'Zoom in' }).click();
  await page.getByRole('button', { name: 'Zoom in' }).click();
  await page.getByRole('button', { name: 'Zoom in' }).click();
  await settle(page);
  await card(page, 'sessions').focus();
  await settle(page);
  const stage = (await page.locator('.sm-stage').boundingBox())!;
  const c = (await card(page, 'sessions').boundingBox())!;
  expect(c.x).toBeGreaterThanOrEqual(stage.x);
  expect(c.y).toBeGreaterThanOrEqual(stage.y);
  expect(c.x + c.width).toBeLessThanOrEqual(stage.x + stage.width);
  expect(c.y + c.height).toBeLessThanOrEqual(stage.y + stage.height);
});

test('the focused stage pans with arrows and zooms with + / - / 0', async ({ page }) => {
  const start = await viewportOf(page);
  await page.locator('.sm-stage').focus();
  await page.keyboard.press('ArrowRight');
  await settle(page);
  expect((await viewportOf(page)).x).toBeLessThan(start.x);
  await page.keyboard.press('+');
  await settle(page);
  expect((await viewportOf(page)).k).toBeGreaterThan(start.k);
  await page.keyboard.press('0');
  await settle(page);
  expect(await viewportOf(page)).toEqual(start);
});

test('the inspector starts collapsed on a narrow window and can be opened', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.reload();
  await expect(inspector(page).getByRole('button', { name: 'Show inspector' })).toBeVisible();
  await inspector(page).getByRole('button', { name: 'Show inspector' }).click();
  await expect(inspector(page).getByRole('list', { name: 'Legend' })).toBeVisible();
});

test('with reduced motion the camera jumps instead of animating', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.locator('.sm-card')).toHaveCount(6);
  const before = await viewportOf(page);
  await page.getByRole('button', { name: 'Zoom in' }).click();
  await page.waitForTimeout(20);
  expect((await viewportOf(page)).k).toBeCloseTo(before.k * 1.2, 3);
});
