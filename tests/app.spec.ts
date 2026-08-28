import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('creates a bike, saves a receipt, and survives refresh', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await page.getByLabel('Name your first bike').fill('Fern commuter');
  await page.getByRole('button', { name: /Start this bike/ }).click();
  await expect(page.locator('#bike-picker')).toHaveValue(/.+/);
  await expect(page.locator('#bike-picker option:checked')).toHaveText('Fern commuter');

  await page.locator('#component').selectOption('Chain');
  await page.locator('#action').selectOption('Lubricated');
  await page.getByLabel('Cost').fill('350');
  await page.getByLabel('Odometer (km)').first().fill('1280');
  await page.getByLabel('Evidence and notes').fill('Wiped clean and applied dry lube.');
  await page.getByRole('button', { name: 'Save receipt' }).click();
  await expect(page.getByRole('status')).toContainText('receipt saved locally');

  await page.reload();
  await page.getByRole('button', { name: 'History', exact: true }).click();
  await expect(page.getByText('Chain · Lubricated')).toBeVisible();
  await expect(page.getByText(/₹350|INR\s*350/)).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  expect(errors).toEqual([]);
});

test('welcome and legal page have no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  let results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  await page.emulateMedia({ colorScheme: 'dark' });
  results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy, kept local' })).toBeVisible();
  results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
});

test('restores a returned Plus license without exposing it in the URL', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/bike-service-receipts/verify**', async (route) => {
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }) });
  });
  await page.goto('/?license=test-license-token');
  await expect(page).not.toHaveURL(/license=/);
  await page.getByLabel('Name your first bike').fill('Licensed bike');
  await page.getByRole('button', { name: /Start this bike/ }).click();
  await page.getByRole('button', { name: 'Data & Plus', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Field Guide Plus is unlocked' })).toBeVisible();
});

test('installed shell and local records work offline', async ({ page, context }) => {
  await page.goto('/');
  await page.getByLabel('Name your first bike').fill('Offline bike');
  await page.getByRole('button', { name: /Start this bike/ }).click();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
  });
  // Exercise one controlled navigation before cutting the connection, as an
  // installed PWA does when it is launched after its initial installation.
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#bike-picker option:checked')).toHaveText('Offline bike');
  await page.locator('#component').selectOption('Brakes');
  await page.locator('#action').selectOption('Adjusted');
  await page.getByRole('button', { name: 'Save receipt' }).click();
  await expect(page.getByRole('status')).toContainText('receipt saved locally');
});
