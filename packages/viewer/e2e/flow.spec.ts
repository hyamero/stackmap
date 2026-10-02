import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

// Flow playback is motion: these tests opt out of the suite's reduced-motion default (the last one opts back in).
test.use({ contextOptions: { reducedMotion: 'no-preference' } });

const pulses = (page: Page) => page.locator('[data-flow] [data-pulse]');
// Where each pulse is now, sampled twice: a playing flow moves between samples.
const positions = (page: Page) =>
  page.locator('[data-flow] [data-part="head"]').evaluateAll((els) => els.map((el) => `${el.getAttribute('transform')}|${(el as SVGGElement).style.visibility}`).join(';'));

test('P plays the whole flow as pulses along every connection, and stops it', async ({ page }) => {
  await page.goto('/?page=release-delivery');
  await expect(pulses(page)).toHaveCount(0);
  await page.keyboard.press('p');
  await expect(page).toHaveURL(/#play=1$/);
  await expect(page.getByRole('button', { name: 'Play the flow (P)' })).toHaveAttribute('aria-pressed', 'true');
  await expect(pulses(page)).toHaveCount(await page.locator('path[data-edge-id]').count());
  await expect(page.locator('[data-flow] [data-pulse]:not([style*="hidden"])').first()).toBeAttached();
  const before = await positions(page);
  await expect.poll(() => positions(page)).not.toBe(before);
  await page.keyboard.press('p');
  await expect(pulses(page)).toHaveCount(0);
  await expect(page).not.toHaveURL(/play=/);
});

test('while the flow plays, a speed button cycles 1×, 2× and 0.5×, kept in the link', async ({ page }) => {
  await page.goto('/?page=release-delivery');
  const speed = page.getByRole('button', { name: /^Flow speed/ });
  await expect(speed).toHaveCount(0);
  await page.keyboard.press('p');
  await expect(speed).toHaveText('1×');
  await speed.click();
  await expect(speed).toHaveText('2×');
  await expect(page).toHaveURL(/#play=1&speed=2$/);
  await speed.click();
  await expect(speed).toHaveText('0.5×');
  await speed.click();
  await expect(speed).toHaveText('1×');
  await expect(page).toHaveURL(/#play=1$/);
  await page.goto('/?page=release-delivery#play=1&speed=0.5');
  await expect(speed).toHaveText('0.5×');
  const before = await positions(page);
  await expect.poll(() => positions(page)).not.toBe(before);
});

test('a route plays only its own connections; a view plays only what it shows', async ({ page }) => {
  await page.goto('/?page=release-delivery#route=commit~announce&play=1');
  const lit = await page.locator('path[data-edge-id][data-tint]').evaluateAll((els) => els.map((el) => el.getAttribute('data-edge-id')).sort());
  expect(lit.length).toBeGreaterThan(0);
  await expect.poll(() => pulses(page).evaluateAll((els) => els.map((el) => el.getAttribute('data-pulse')).sort())).toEqual(lit);
  // The inspector's step list follows the pulse along the route.
  await expect(page.getByRole('list', { name: 'Route steps' }).locator('li[data-flowing]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await page.getByRole('tab', { name: 'Stop conditions' }).click();
  const shown = await page.locator('path[data-edge-id]:not([data-dim])').count();
  await expect(pulses(page)).toHaveCount(shown);
  expect(shown).toBeLessThan(await page.locator('path[data-edge-id]').count());
});

test('landing pulses light their target: a glow behind the card, a lit trail on the wire', async ({ page }) => {
  await page.goto('/?page=release-delivery#play=1');
  const visible = (part: string) => page.locator(`[data-flow] [data-pulse]:not([style*="hidden"]) [data-part="${part}"]:not([style*="hidden"])`);
  await expect.poll(() => visible('glow').count(), { timeout: 5000 }).toBeGreaterThan(0);
  await expect.poll(() => visible('trail').count(), { timeout: 5000 }).toBeGreaterThan(0);
});

test('a sequence replays its messages one at a time, landing on activation bars', async ({ page }) => {
  await page.goto('/?page=cache-miss#play=1');
  await expect(pulses(page)).toHaveCount(await page.locator('path[data-edge-id]').count());
  const heads = page.locator('[data-flow] [data-pulse]:not([style*="hidden"]) [data-part="head"]:not([style*="hidden"])');
  // Serial: never more than one message's head in flight (an async message carries up to three packets).
  for (let i = 0; i < 10; i++) {
    const flying = await heads.evaluateAll((els) => new Set(els.map((el) => el.closest('[data-pulse]')!.getAttribute('data-pulse'))).size);
    expect(flying).toBeLessThanOrEqual(1);
    await page.waitForTimeout(120);
  }
  expect(await page.locator('[data-flow] [data-part="glow"]').count()).toBeGreaterThan(0);
});

test('presenting keeps the play and speed buttons and the P key', async ({ page }) => {
  await page.goto('/?page=release-delivery');
  await expect(page.locator('.sm-card').first()).toBeVisible();
  await page.keyboard.press('f');
  const bar = page.getByRole('group', { name: 'Presentation' });
  await bar.getByRole('button', { name: 'Play the flow (P)' }).click();
  await expect(pulses(page).first()).toBeAttached();
  await expect(bar.getByRole('button', { name: /^Flow speed/ })).toHaveText('1×');
  await page.keyboard.press('p');
  await expect(pulses(page)).toHaveCount(0);
});

test('exports taken mid-play carry no pulses', async ({ page }) => {
  await page.goto('/?page=sample#play=1');
  await expect(pulses(page).first()).toBeAttached();
  await page.getByRole('button', { name: 'Export' }).click();
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('menuitem', { name: /^SVG/ }).click()]);
  const raw = readFileSync((await dl.path())!, 'utf8');
  expect(raw).toContain('<foreignObject');
  expect(raw).not.toContain('data-pulse');
});

test('reduced motion: nothing plays and the button says why', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?page=release-delivery#play=1');
  await expect(page.getByRole('button', { name: /Play the flow \(off: reduced motion\)/ })).toBeDisabled();
  await page.keyboard.press('p');
  await expect(pulses(page)).toHaveCount(0);
});
