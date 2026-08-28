import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('creates a bike, saves a receipt, and survives refresh', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await page.getByLabel('Name your first bike').fill('Fern commuter');
  await page.getByRole('button', { name: /Start this bike/ }).click();
  await expect(page.getByText('Fern commuter', { exact: true }).first()).toBeVisible();

  await page.getByLabel('Component').selectOption('Chain');
  await page.getByLabel('What was done?').selectOption('Lubricated');
  await page.getByLabel('Cost').fill('350');
  await page.getByLabel('Odometer (km)').first().fill('1280');
  await page.getByLabel('Evidence and notes').fill('Wiped clean and applied dry lube.');
  await page.getByRole('button', { name: 'Save receipt' }).click();
  await expect(page.getByRole('status')).toContainText('receipt saved locally');

  await page.reload();
  await page.getByRole('button', { name: 'History' }).click();
  await expect(page.getByText('Chain · Lubricated')).toBeVisible();
  await expect(page.getByText(/₹350|INR\s*350/)).toBeVisible();
  expect(errors).toEqual([]);
});

test('welcome and legal page have no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  let results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy, kept local' })).toBeVisible();
  results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
});

test('installed shell and local records work offline', async ({ page, context }) => {
  await page.goto('/');
  await page.getByLabel('Name your first bike').fill('Offline bike');
  await page.getByRole('button', { name: /Start this bike/ }).click();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Offline bike', { exact: true }).first()).toBeVisible();
  await page.getByLabel('Component').selectOption('Brakes');
  await page.getByLabel('What was done?').selectOption('Adjusted');
  await page.getByRole('button', { name: 'Save receipt' }).click();
  await expect(page.getByRole('status')).toContainText('receipt saved locally');
});
