import { expect, test } from '@playwright/test';

test('a workflow draws its lanes, phase headers, groups and compact cards', async ({ page }) => {
  await page.goto('/?page=release-delivery');
  await expect(page.locator('[data-lane-id]')).toHaveCount(6);
  await expect(page.locator('[data-lane-id="exceptions"]')).toHaveAttribute('data-tone', 'exception');
  await expect(page.locator('[data-phase-id]')).toHaveCount(3);
  await expect(page.locator('[data-frame-id="recovery"]')).toHaveAttribute('data-tone', 'security');
  await expect(page.locator('[data-testid="step-card"]')).toHaveCount(10);
  await expect(page.locator('[data-testid="node-card"]')).toHaveCount(0);
  await expect(page.getByText('Workflow', { exact: true })).toBeVisible();
  // Notes and the connection styles the diagram uses.
  const inspector = page.getByRole('complementary', { name: 'Inspector' });
  await expect(inspector.getByRole('heading', { name: 'Notes' })).toBeVisible();
  await expect(inspector.getByRole('list', { name: 'Connection styles' })).toContainText('Main pathFailure pathReply or return');
});

test('edge tones and kinds reach the SVG, and a selection tints over them', async ({ page }) => {
  await page.goto('/?page=release-delivery');
  await expect(page.locator('path[data-edge-id="e8"]')).toHaveAttribute('data-tone', 'error');
  await expect(page.locator('path[data-edge-id="e10"]')).toHaveAttribute('data-kind', 'return');
  await page.locator('.sm-card[data-card-id="rollback"]').click();
  await expect(page.locator('path[data-edge-id="e10"]')).toHaveAttribute('data-tint', 'queue');
  // Dots sit where routes meet cards, and dim with their card: "failed" is neither up- nor downstream of rollback.
  await page.getByRole('button', { name: /Trace/ }).click();
  await expect(page.locator('[data-handle-of="failed"][data-dim]').first()).toBeAttached();
});

test('a lifecycle marks its start state and its end states', async ({ page }) => {
  await page.goto('/?page=agent-run');
  await expect(page.locator('[data-start-mark="queued"]')).toBeAttached();
  await expect(page.locator('[data-testid="step-card"][data-final]')).toHaveCount(3);
  await expect(page.getByText('Lifecycle', { exact: true })).toBeVisible();
});

test('a staged dataflow draws its stages as bands', async ({ page }) => {
  await page.goto('/?page=product-analytics');
  await expect(page.locator('[data-phase-id]')).toHaveCount(5);
  await expect(page.locator('[data-testid="step-card"]')).toHaveCount(10);
});

test('a sequence draws lifelines, activation bars and time bands, and selecting lights its messages', async ({ page }) => {
  await page.goto('/?page=cache-miss');
  await expect(page.locator('[data-lifeline]')).toHaveCount(7);
  await expect(page.locator('[data-activation="api"]')).toHaveCount(1);
  await expect(page.locator('[data-phase-id]')).toHaveCount(3);
  await expect(page.getByText('Sequence', { exact: true })).toBeVisible();
  await page.locator('.sm-card[data-card-id="redis"]').click();
  await expect(page.locator('path[data-edge-id="read"]')).toHaveAttribute('data-tint', 'service');
  await expect(page.locator('path[data-edge-id="miss"]')).toHaveAttribute('data-tint', 'cache');
  await page.getByRole('tab', { name: 'Fallback' }).click();
  await expect(page.locator('[data-lifeline="user"]')).toHaveAttribute('data-dim', 'true');
});
