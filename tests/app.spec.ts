import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

async function seriousAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  return results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''));
}

async function openDemo(page: Page) {
  await page.goto('/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved to your records')).toBeVisible();
  await expect(page.locator('#bike-picker option')).toHaveCount(2);
}

async function openData(page: Page) {
  await page.getByRole('button', { name: 'Data & Plus', exact: true }).click();
}

test('@claim:demo-isolation sample data is one click away and never changes real records', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Name your first bike').fill('My real bicycle');
  await page.getByRole('button', { name: 'Create bike profile' }).click();
  await expect(page.locator('#bike-picker option:checked')).toHaveText('My real bicycle');
  await page.evaluate(() => { localStorage.setItem('real-storage-sentinel', 'keep-local'); sessionStorage.setItem('real-session-sentinel', 'keep-session'); });
  const realStorageBefore = await page.evaluate(() => ({
    local: Object.fromEntries(Object.entries(localStorage).filter(([key]) => !key.startsWith('demo:'))),
    session: Object.fromEntries(Object.entries(sessionStorage).filter(([key]) => !key.startsWith('demo:'))),
    databases: (indexedDB.databases ? undefined : 'unsupported'),
  }));
  const realDatabaseNamesBefore = await page.evaluate(async () => (await indexedDB.databases()).map((item) => item.name).filter((name): name is string => Boolean(name && !name.startsWith('demo:'))).sort());
  await page.goto('/?demo=1&license=DEMO_SENTINEL');
  await expect(page).not.toHaveURL(/license=/);
  await expect(page.locator('#bike-picker option:checked')).toHaveText('Fern commuter');
  expect(await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open('demo:bike-service-receipts', 1); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const count = (store: 'bikes' | 'receipts' | 'reminders') => new Promise<number>((resolve, reject) => { const request = db.transaction(store).objectStore(store).count(); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    return { bikes: await count('bikes'), receipts: await count('receipts'), reminders: await count('reminders') };
  })).toEqual({ bikes: 2, receipts: 4, reminders: 3 });
  await page.locator('#bike-picker').selectOption('demo-gravel');
  await expect.poll(() => page.evaluate(() => ({
    local: Object.fromEntries(Object.entries(localStorage).filter(([key]) => !key.startsWith('demo:'))),
    session: Object.fromEntries(Object.entries(sessionStorage).filter(([key]) => !key.startsWith('demo:'))),
  }))).toEqual({ local: realStorageBefore.local, session: realStorageBefore.session });
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#bike-picker option:checked')).toHaveText('Fern commuter');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page.locator('#bike-picker option:checked')).toHaveText('My real bicycle');
  expect(await page.evaluate(() => ({
    local: Object.fromEntries(Object.entries(localStorage).filter(([key]) => !key.startsWith('demo:'))),
    session: Object.fromEntries(Object.entries(sessionStorage).filter(([key]) => !key.startsWith('demo:'))),
  }))).toEqual({ local: realStorageBefore.local, session: realStorageBefore.session });
  expect(await page.evaluate(async () => (await indexedDB.databases()).map((item) => item.name).filter((name): name is string => Boolean(name && !name.startsWith('demo:'))).sort())).toEqual(realDatabaseNamesBefore);
  await expect(page.locator('#bike-picker option')).toHaveCount(1);
});

test('@claim:service-records logs, searches, and deletes a service receipt', async ({ page }) => {
  await openDemo(page);
  await page.locator('#component').selectOption('Wheels');
  await page.locator('#action').selectOption('Adjusted');
  await page.getByLabel('Cost').fill('650');
  await page.getByLabel('Evidence and notes').fill('Trued the rear wheel after a pothole.');
  await page.getByRole('button', { name: 'Save receipt' }).click();
  await expect(page.locator('#field-note')).toContainText('receipt saved locally');
  await page.getByRole('button', { name: 'History', exact: true }).click();
  await page.getByLabel('Filter this history').fill('pothole');
  const item = page.locator('[data-receipt]').filter({ hasText: 'Wheels · Adjusted' });
  await expect(item).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await item.getByRole('button', { name: /Delete Wheels receipt/ }).click();
  await expect(page.getByText('Wheels · Adjusted')).toHaveCount(0);
});

test('@claim:reminders creates date and odometer reminders from service work', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('button', { name: /Next up/ }).click();
  await expect(page.getByText('Clean and lubricate chain')).toBeVisible();
  await expect(page.getByText('A reminder is not a safety check.')).toBeVisible();
  await page.getByRole('button', { name: /Add reminder/i }).click();
  await page.getByLabel('Note label').fill('Inspect wheel bearings');
  await page.getByLabel('Every (months)').fill('8');
  await page.getByLabel('Every (km)').fill('2400');
  await page.getByRole('button', { name: 'Save reminder' }).click();
  await expect(page.getByText('Inspect wheel bearings')).toBeVisible();
  await expect(page.getByText(/7,260 km/)).toBeVisible();
});

test('@claim:exports downloads CSV, PDF, and JSON containing the sample records', async ({ page }) => {
  await openDemo(page);
  await openData(page);
  const csvEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const csv = await csvEvent;
  expect(csv.suggestedFilename()).toMatch(/bike-service-receipts-.*\.csv/);
  expect(await readFile((await csv.path())!, 'utf8')).toContain('Fern commuter,Chain,Lubricated');
  const pdfEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF' }).click();
  const pdf = await pdfEvent;
  expect((await readFile((await pdf.path())!)).subarray(0, 8).toString()).toBe('%PDF-1.4');
  const jsonEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Back up JSON' }).click();
  const backup = JSON.parse(await readFile((await (await jsonEvent).path())!, 'utf8'));
  expect(backup).toMatchObject({ version: 1 });
  expect(backup.bikes).toHaveLength(2);
  expect(backup.receipts).toHaveLength(4);
});

test('@claim:backup-restore merges a valid JSON backup without replacing sample records', async ({ page }) => {
  await openDemo(page);
  await openData(page);
  const now = '2026-08-28T12:00:00.000Z';
  const backup = { version: 1, exportedAt: now, bikes: [{ id: 'imported-bike', name: 'Touring bike', kind: 'Touring', odometerKm: 900, createdAt: now, updatedAt: now }], receipts: [], reminders: [] };
  await page.locator('#import-json').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await expect(page.locator('#field-note')).toContainText('Backup merged');
  await expect(page.locator('#bike-picker option')).toHaveCount(3);
  await page.reload();
  await expect(page.locator('#bike-picker option')).toHaveCount(3);
  await page.locator('#import-mode').selectOption('replace');
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('#import-json').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await expect(page.locator('#field-note')).toContainText('Backup restored');
  await expect(page.locator('#bike-picker option')).toHaveCount(1);
  await expect(page.locator('#bike-picker option:checked')).toHaveText('Touring bike');
});

test('@claim:offline-reload reloads the demo and saves a receipt without a connection', async ({ page, context }) => {
  await openDemo(page);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  // Exercise one controlled online navigation before cutting the connection.
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#bike-picker option:checked')).toHaveText('Fern commuter');
  await page.locator('#component').selectOption('Brakes');
  await page.locator('#action').selectOption('Inspected');
  await page.getByRole('button', { name: 'Save receipt' }).click();
  await expect(page.locator('#field-note')).toContainText('receipt saved locally');
  await context.setOffline(false);
  const notFound = await page.goto('/not-a-real-route');
  if (process.env.BASE_URL) expect(notFound?.status()).toBe(404);
  await context.setOffline(true);
  await page.goto('/demo');
  await expect(page.locator('#bike-picker option:checked')).toHaveText('Fern commuter');
});

test('@claim:local-privacy keeps the demo local and makes no cross-origin requests', async ({ page }) => {
  const crossOrigin: string[] = [];
  const productOrigin = new URL(process.env.BASE_URL ?? 'http://127.0.0.1:4173').origin;
  page.on('request', (request) => { if (new URL(request.url()).origin !== productOrigin) crossOrigin.push(request.url()); });
  await openDemo(page);
  await page.getByLabel('Evidence and notes').fill('Private note stored in the demo database.');
  await page.getByRole('button', { name: 'Save receipt' }).click();
  const databases = await page.evaluate(async () => (await indexedDB.databases()).map((item) => item.name));
  expect(databases).toContain('demo:bike-service-receipts');
  expect(databases).not.toContain('bike-service-receipts');
  expect(crossOrigin).toEqual([]);
});

test('@claim:plus-entitlements enables multiple bikes, photos, and custom reminder intervals', async ({ page }) => {
  await openDemo(page);
  const photo = await readFile('public/assets/icon-192.png');
  await page.locator('#photo').setInputFiles({ name: 'service.png', mimeType: 'image/png', buffer: photo });
  await page.getByRole('button', { name: 'Save receipt' }).click();
  await expect(page.locator('#field-note')).toContainText('receipt saved locally');
  expect(await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open('demo:bike-service-receipts', 1); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const records = await new Promise<Array<{ photo?: string }>>((resolve, reject) => { const request = db.transaction('receipts').objectStore('receipts').getAll(); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    return records.some((item) => item.photo?.startsWith('data:image/webp'));
  })).toBe(true);
  await openData(page);
  await expect(page.getByRole('heading', { name: 'Field Guide Plus is unlocked' })).toBeVisible();
  await page.getByRole('button', { name: /Add another bike/ }).click();
  await page.getByLabel('Bike name').fill('Demo cargo bike');
  await page.getByRole('button', { name: 'Save bike' }).click();
  await expect(page.locator('#bike-picker option')).toHaveCount(3);
  await page.getByRole('button', { name: /Next up/ }).click();
  await page.getByRole('button', { name: /Add reminder/i }).click();
  await expect(page.getByLabel('Every (months)')).toBeEnabled();
  await page.getByRole('button', { name: 'Close reminder form' }).click();
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.getByLabel('Name your first bike').fill('License test bike');
  await page.getByRole('button', { name: 'Create bike profile' }).click();
  await page.getByRole('button', { name: 'Data & Plus', exact: true }).click();
  await expect(page.getByText('One-time purchase · ₹499')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Purchases not open' })).toBeDisabled();
  await expect(page.getByText('Existing licenses can still be restored.')).toBeVisible();
});

test('@claim:photo-source-limit accepts 10 MB photos and rejects larger photos without saving', async ({ page }) => {
  const storedCounts = () => page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('demo:bike-service-receipts', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const count = (store: 'receipts' | 'reminders') => new Promise<number>((resolve, reject) => {
      const request = db.transaction(store).objectStore(store).count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const result = { receipts: await count('receipts'), reminders: await count('reminders') };
    db.close();
    return result;
  });

  await openDemo(page);
  await expect(page.locator('#photo-help')).toHaveText('Stored only on this device. Maximum source size 10 MB.');
  expect(await storedCounts()).toEqual({ receipts: 4, reminders: 3 });

  await page.locator('#photo').setInputFiles({
    name: 'too-large.png',
    mimeType: 'image/png',
    buffer: Buffer.alloc(10_000_001),
  });
  await page.getByRole('button', { name: 'Save receipt' }).click();
  await expect(page.locator('#receipt-error')).toHaveText('Choose a photo smaller than 10 MB.');
  expect(await storedCounts()).toEqual({ receipts: 4, reminders: 3 });

  const source = await readFile('public/assets/icon-192.png');
  const boundaryPhoto = Buffer.concat([source, Buffer.alloc(10_000_000 - source.length)]);
  expect(boundaryPhoto.byteLength).toBe(10_000_000);
  await page.locator('#photo').setInputFiles({
    name: 'ten-megabytes.png',
    mimeType: 'image/png',
    buffer: boundaryPhoto,
  });
  await page.getByRole('button', { name: 'Save receipt' }).click();
  await expect(page.locator('#field-note')).toContainText('receipt saved locally');
  expect(await storedCounts()).toEqual({ receipts: 5, reminders: 3 });
});

test('@claim:license-verification-destination sends a restored token only to Sociobot verification', async ({ browser }) => {
  const verificationUrl = 'https://api.sociobot.in/api/v1/products/bike-service-receipts/verify?license=fixture-license-token';
  const credentialRequests: string[] = [];
  const context = await browser.newContext({ baseURL: process.env.BASE_URL ?? 'http://127.0.0.1:4173', serviceWorkers: 'block' });
  const page = await context.newPage();
  page.on('request', (request) => { if (request.url().includes('license=')) credentialRequests.push(request.url()); });
  await context.route('**/api/v1/products/bike-service-receipts/verify*', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: '{"valid":true,"reason":"ok","expires_at":null}',
    });
  });
  await page.goto('/');
  await page.getByLabel('Name your first bike').fill('License test bike');
  await page.getByRole('button', { name: 'Create bike profile' }).click();
  await page.getByRole('button', { name: 'Data & Plus', exact: true }).click();
  await page.getByRole('button', { name: 'Have a license?' }).click();
  await page.getByLabel('License token').fill('fixture-license-token');
  await page.getByRole('button', { name: 'Verify and restore' }).click();
  await expect(page.getByRole('heading', { name: 'Field Guide Plus is unlocked' })).toBeVisible();
  expect(credentialRequests).toEqual([verificationUrl]);
  await context.close();
});

test('@claim:free-entitlements keeps one bike, text receipts, default reminders, and exports free', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.getByLabel('Name your first bike').fill('Free bike');
  await page.getByRole('button', { name: 'Create bike profile' }).click();
  await expect(page.locator('#photo')).toBeDisabled();
  await page.getByRole('button', { name: 'Data & Plus', exact: true }).click();
  await expect(page.getByRole('button', { name: /Add another bike/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeEnabled();
  await page.getByRole('button', { name: /Next up/ }).click();
  await page.getByRole('button', { name: /Add reminder/i }).click();
  await expect(page.getByText(/default 1 month \/ 300 km rule/)).toBeVisible();
});

test('rejects an incomplete import before writing and recovers a previously damaged database', async ({ page }) => {
  await openDemo(page);
  await openData(page);
  const poison = { version: 1, exportedAt: 'x', bikes: [{ id: 'poison', name: 'Poison' }], receipts: [], reminders: [] };
  await page.locator('#import-json').setInputFiles({ name: 'poison.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(poison)) });
  await expect(page.getByRole('alert')).toContainText('bike record is incomplete');
  await page.reload();
  await expect(page.locator('#bike-picker option')).toHaveCount(2);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.getByLabel('Name your first bike').fill('Recoverable bike');
  await page.getByRole('button', { name: 'Create bike profile' }).click();
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open('bike-service-receipts', 1); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    await new Promise<void>((resolve, reject) => { const transaction = db.transaction('bikes', 'readwrite'); transaction.objectStore('bikes').put({ id: 'poison', name: 'Poison' }); transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); });
  });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Recover your valid bike records' })).toBeVisible();
  await page.getByRole('button', { name: 'Remove damaged records' }).click();
  await expect(page.locator('#bike-picker option:checked')).toHaveText('Recoverable bike');
});

test('uses real route titles, shared navigation, focus restoration, and a styled 404', async ({ page }) => {
  await openDemo(page);
  await expect(page).toHaveTitle('Demo — Bike Service Receipts');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://bike-service-receipts.sociobot.in/demo');
  await page.getByRole('link', { name: 'Privacy', exact: true }).first().click();
  await expect(page).toHaveTitle('Privacy — Bike Service Receipts');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /stores local records/);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('#route-status')).toContainText('Privacy, kept local loaded');
  await expect(page.getByRole('link', { name: 'Built by Param Factory (external site)' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Sample bike service log' })).toBeFocused();
  const response = await page.goto('/not-a-real-route');
  if (process.env.BASE_URL) expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle('Page not found — Bike Service Receipts');
  await expect(page.getByRole('heading', { name: 'Bike service page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Bike Service Receipts' })).toBeVisible();
});

test('@deployment:static-404 serves the complete missing-page document before JavaScript', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: process.env.BASE_URL ?? 'http://127.0.0.1:4173',
  });
  const page = await context.newPage();
  const target = process.env.BASE_URL ? '/not-a-real-route' : '/404.html';
  const response = await page.goto(target);
  expect(response).not.toBeNull();
  if (process.env.BASE_URL) expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle('Page not found — Bike Service Receipts');
  await expect(page.locator('h1')).toHaveText('Bike service page not found');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://bike-service-receipts.sociobot.in/404');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'This Bike Service Receipts page does not exist. Return to the service log.');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Page not found — Bike Service Receipts');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/assets/apple-touch-icon.png');
  await expect(page.getByRole('link', { name: 'Open Bike Service Receipts' })).toHaveAttribute('href', '/');
  await context.close();
});

test('static host sends only known app routes to the SPA shell', async () => {
  const config = JSON.parse(await readFile('public/staticwebapp.config.json', 'utf8')) as {
    routes: Array<{ route: string; rewrite?: string; statusCode?: number }>;
    navigationFallback?: unknown;
    responseOverrides: Record<string, { rewrite: string }>;
  };
  expect(config.navigationFallback).toBeUndefined();
  for (const route of ['/', '/demo', '/privacy', '/terms']) {
    expect(config.routes).toContainEqual(expect.objectContaining({ route, rewrite: '/index.html' }));
  }
  expect(config.routes).toContainEqual({ route: '/*', statusCode: 404 });
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html' });
});

test('sitemap lists only canonical indexable routes', async () => {
  const sitemap = await readFile('public/sitemap.xml', 'utf8');
  for (const path of ['/', '/demo', '/privacy', '/terms']) expect(sitemap).toContain(`https://bike-service-receipts.sociobot.in${path}`);
  expect(sitemap).not.toContain('/404');
});

test('@claim:accessible-layout first screen, demo, legal, and 404 pass accessibility and mobile layout checks', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Log bike service and costs' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
  await expect(page.getByText('Private bike maintenance log')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'How bike service records work' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What the app does not do' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Free and Field Guide Plus' })).toBeVisible();
  await expect(page.getByText('Free for one bike; Plus ₹499 once sales open')).toBeVisible();
  await expect(page.getByText('Illustration of a commuter bike and the tools recorded in a service receipt.')).toBeVisible();
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-preview\.jpg$/);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/assets/apple-touch-icon.png');
  expect(await seriousAxeViolations(page)).toEqual([]);
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  expect(await seriousAxeViolations(page)).toEqual([]);
  await openDemo(page);
  expect(await seriousAxeViolations(page)).toEqual([]);
  await page.goto('/privacy');
  expect(await seriousAxeViolations(page)).toEqual([]);
  await page.goto('/404');
  expect(await seriousAxeViolations(page)).toEqual([]);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await page.screenshot({ path: testInfo.outputPath('route-accessibility.png'), fullPage: true });
});

test('README and catalog use the reviewed plain wording', async () => {
  const readme = await readFile('README.md', 'utf8');
  const catalog = (await readFile('.factory/catalog-description.txt', 'utf8')).trim();
  expect(readme).toContain('Log service, costs, odometer readings, and reminders for each bike.');
  expect(readme).toContain('Set reminders from the last service date or odometer reading.');
  expect(readme).toContain('License verification sends a restored token to Sociobot.');
  expect(readme).toContain('## Bike service features');
  expect(readme).not.toMatch(/PWA shell|IndexedDB records|botanical field-guide treatment|factory registers/i);
  expect(catalog.length).toBeLessThanOrEqual(120);
  expect(catalog).toMatch(/^Record\b/);
});
