import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

// Flow playback is motion: these tests opt out of the suite's reduced-motion default (the last one opts back in).
test.use({ contextOptions: { reducedMotion: 'no-preference' } });

const pulses = (page: Page) => page.locator('[data-flow] [data-pulse]');
// Where each pulse is now, sampled twice: a playing flow moves between samples.
const positions = (page: Page) => pulses(page).evaluateAll((els) => els.map((el) => `${el.getAttribute('transform')}|${(el as SVGGElement).style.visibility}`).join(';'));

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

test('a route plays only its own connections; a view plays only what it shows', async ({ page }) => {
  await page.goto('/?page=release-delivery#route=commit~announce&play=1');
  const lit = await page.locator('path[data-edge-id][data-tint]').evaluateAll((els) => els.map((el) => el.getAttribute('data-edge-id')).sort());
  expect(lit.length).toBeGreaterThan(0);
  await expect.poll(() => pulses(page).evaluateAll((els) => els.map((el) => el.getAttribute('data-pulse')).sort())).toEqual(lit);
  await page.keyboard.press('Escape');
  await page.getByRole('tab', { name: 'Stop conditions' }).click();
  const shown = await page.locator('path[data-edge-id]:not([data-dim])').count();
  await expect(pulses(page)).toHaveCount(shown);
  expect(shown).toBeLessThan(await page.locator('path[data-edge-id]').count());
});

test('presenting keeps the play button and the P key', async ({ page }) => {
  await page.goto('/?page=release-delivery');
  await page.keyboard.press('f');
  const bar = page.getByRole('group', { name: 'Presentation' });
  await bar.getByRole('button', { name: 'Play the flow (P)' }).click();
  await expect(pulses(page).first()).toBeAttached();
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
