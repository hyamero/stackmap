import { expect, test } from '@playwright/test';

test('R picks a route between two cards, lights it, lists it and deep-links it', async ({ page }) => {
  await page.goto('/?page=release-delivery');
  // The shortcuts are bound in an effect after the first render; a key pressed before it lands nowhere.
  await expect(page.locator('.sm-card').first()).toBeVisible();
  await page.keyboard.press('r');
  await expect(page.getByRole('status').filter({ hasText: 'Pick where the route starts' })).toBeVisible();
  await page.locator('.sm-card[data-card-id="commit"]').click();
  await expect(page.getByRole('status').filter({ hasText: 'Now pick where it ends' })).toBeVisible();
  await page.locator('.sm-card[data-card-id="announce"]').click();
  await expect(page).toHaveURL(/#route=commit~announce$/);
  const steps = page.getByRole('list', { name: 'Route steps' });
  await expect(steps.getByRole('listitem')).toHaveCount(8);
  await expect(steps).toContainText('merge');
  await expect(page.locator('.sm-card[data-card-id="failed"]')).toHaveAttribute('data-emphasis', 'dim');
  await expect(page.locator('.sm-card[data-card-id="commit"]')).toHaveAttribute('data-emphasis', 'focus');
  await expect(page.locator('path[data-edge-id="e2"]')).toHaveAttribute('data-tint', 'client');
  await page.keyboard.press('Escape');
  await expect(page.locator('.sm-card[data-card-id="failed"]')).toHaveAttribute('data-emphasis', 'normal');
  await expect(page).not.toHaveURL(/route=/);
});

test('a route runs the other way when only that direction exists, and says when none does', async ({ page }) => {
  await page.goto('/?page=release-delivery#route=announce~commit');
  await expect(page.getByRole('complementary', { name: 'Inspector' })).toContainText('running the other way');
  await page.goto('/?page=release-delivery#route=failed~announce');
  await expect(page.getByRole('complementary', { name: 'Inspector' })).toContainText('No directed connections lead from one to the other');
  await expect(page.locator('.sm-card[data-card-id="deploy"]')).toHaveAttribute('data-emphasis', 'dim');
});

test('M toggles the radar, which mirrors what the explorer dims', async ({ page }) => {
  await page.goto('/?page=release-delivery');
  await expect(page.locator('.sm-card').first()).toBeVisible();
  await page.keyboard.press('m');
  const radar = page.getByRole('img', { name: 'Minimap' });
  await expect(radar).toBeVisible();
  await expect(radar.locator('[data-minimap-edge]')).toHaveCount(10);
  await page.getByRole('tab', { name: 'Stop conditions' }).click();
  await expect(radar.locator('rect.sm-minimap-card[data-dim]')).toHaveCount(5);
  await page.keyboard.press('m');
  await expect(radar).toBeHidden();
});

test('F presents: chrome hidden, one step per view, arrows step, Esc ends', async ({ page }) => {
  await page.goto('/?page=release-delivery');
  await expect(page.locator('.sm-card').first()).toBeVisible();
  await page.keyboard.press('f');
  const bar = page.getByRole('group', { name: 'Presentation' });
  await expect(bar).toContainText('Overview');
  await expect(bar).toContainText('1 / 3');
  await expect(page.getByRole('heading', { level: 1 })).toBeHidden();
  await expect(page.getByRole('complementary', { name: 'Inspector' })).toBeHidden();
  await page.keyboard.press('ArrowRight');
  await expect(bar).toContainText('Happy path');
  await expect(bar).toContainText('2 / 3');
  await expect(page.locator('.sm-card[data-card-id="failed"]')).toHaveAttribute('data-emphasis', 'dim');
  await page.keyboard.press('End');
  await expect(bar).toContainText('Stop conditions');
  await page.keyboard.press('Escape');
  await expect(bar).toBeHidden();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('Esc cancels route picking even with focus on the Route button', async ({ page }) => {
  await page.goto('/?page=release-delivery');
  await page.getByRole('button', { name: 'Route between two nodes (R)' }).click();
  await expect(page.getByText('Pick where the route starts')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByText('Pick where the route starts')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Route between two nodes (R)' })).toHaveAttribute('aria-pressed', 'false');
});

test('a route in a sequence lights only the messages on its way, in time', async ({ page }) => {
  await page.goto('/?page=cache-miss#route=user~db');
  for (const id of ['open', 'get', 'query']) await expect(page.locator(`path[data-edge-id="${id}"]`)).toHaveAttribute('data-tint', /.+/);
  for (const id of ['render', 'json', 'emit', 'set']) await expect(page.locator(`path[data-edge-id="${id}"]`)).toHaveAttribute('data-dim', 'true');
  await expect(page.locator('.sm-card[data-card-id="trace"]')).toHaveAttribute('data-emphasis', 'dim');
});

test('in a presentation, Space presses the focused button and M leaves the radar alone', async ({ page }) => {
  await page.goto('/?page=release-delivery');
  await expect(page.locator('.sm-card').first()).toBeVisible();
  await page.keyboard.press('f');
  const bar = page.getByRole('group', { name: 'Presentation' });
  await expect(page.getByRole('button', { name: 'Previous step' })).toBeDisabled();
  await page.keyboard.press('ArrowRight');
  await page.getByRole('button', { name: 'Previous step' }).focus();
  await page.keyboard.press(' ');
  await expect(bar).toContainText('1 / 3');
  await page.keyboard.press('m');
  await page.getByRole('button', { name: 'End presentation (Esc)' }).focus();
  await page.keyboard.press(' ');
  await expect(bar).toBeHidden();
  await expect(page.getByRole('img', { name: 'Minimap' })).toBeHidden();
});
