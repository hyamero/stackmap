import { expect, test, type Page } from '@playwright/test';

const inspector = (page: Page) => page.getByRole('complementary', { name: 'Inspector' });
const header = (page: Page) => page.getByRole('banner');
const tool = (page: Page, name: string | RegExp) => page.getByRole('button', { name });
const zoom = async (page: Page) => Number((await page.locator('span.tabular-nums', { hasText: /^\d+%$/ }).textContent())!.replace('%', ''));

test('Z leaves only the canvas, which still works, and Z again brings everything back', async ({ page }) => {
  await page.goto('/?page=release-delivery');
  await expect(page.locator('.sm-card').first()).toBeVisible();
  const before = (await page.locator('#sm-diagram').boundingBox())!;
  const fitted = await zoom(page);
  await page.keyboard.press('z');
  // The bigger stage frames the diagram again.
  await expect.poll(() => zoom(page)).toBeGreaterThan(fitted);
  await expect(header(page)).toHaveCount(0);
  await expect(inspector(page)).toHaveCount(0);
  await expect(tool(page, 'Leave focus (Z)')).toHaveAttribute('aria-pressed', 'true');
  const after = (await page.locator('#sm-diagram').boundingBox())!;
  expect(after.width).toBeGreaterThan(before.width);
  expect(after.height).toBeGreaterThan(before.height);
  // Selecting still works; its details wait until focus ends.
  await page.locator('.sm-card[data-card-id="deploy"]').click();
  await expect(page).toHaveURL(/#node=deploy$/);
  await expect(inspector(page)).toHaveCount(0);
  await page.keyboard.press('z');
  await expect(header(page)).toBeVisible();
  await expect(inspector(page)).toContainText('Deploy');
});

test('the toolbar button enters focus, and the URL never keeps it', async ({ page }) => {
  await page.goto('/?page=release-delivery');
  await tool(page, 'Focus on the canvas (Z)').click();
  await expect(header(page)).toHaveCount(0);
  await expect(page).not.toHaveURL(/focus/);
  await tool(page, 'Leave focus (Z)').click();
  await expect(header(page)).toBeVisible();
});

test('H hides the toolbar outside focus too', async ({ page }) => {
  await page.goto('/?page=release-delivery');
  await expect(page.locator('.sm-card').first()).toBeVisible();
  await page.keyboard.press('h');
  await expect(tool(page, 'Focus on the canvas (Z)')).toHaveCount(0);
  await expect(header(page)).toBeVisible();
  await page.keyboard.press('h');
  await expect(tool(page, 'Focus on the canvas (Z)')).toBeVisible();
});

test('in focus, H hides the toolbar and shows the way back; leaving focus restores it', async ({ page }) => {
  await page.goto('/?page=release-delivery');
  await expect(page.locator('.sm-card').first()).toBeVisible();
  await page.keyboard.press('z');
  await page.keyboard.press('h');
  await expect(tool(page, 'Leave focus (Z)')).toHaveCount(0);
  await expect(tool(page, /^Play the flow/)).toHaveCount(0);
  const back = tool(page, 'Show the toolbar (H)');
  await expect(back).toBeVisible();
  await back.click();
  await expect(tool(page, /^Play the flow/)).toBeVisible();
  await tool(page, 'Hide the toolbar (H)').click();
  await expect(tool(page, /^Play the flow/)).toHaveCount(0);
  await page.keyboard.press('z');
  await expect(header(page)).toBeVisible();
  await expect(tool(page, /^Play the flow/)).toBeVisible();
});

test('Z and H are ignored while typing in search', async ({ page }) => {
  await page.goto('/?page=release-delivery');
  await expect(page.locator('.sm-card').first()).toBeVisible();
  await page.keyboard.press('/');
  await page.keyboard.type('zh');
  await expect(header(page)).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Search nodes' })).toHaveValue('zh');
});
