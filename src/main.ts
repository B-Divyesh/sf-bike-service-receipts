import './styles.css';
import { getAll, importAllData, inspectStoredData, put, readAllData, remove, removeBikeAndRecords, repairStoredData, validateImport } from './db';
import { ACTIONS, COMPONENTS, dateLabel, latestForComponent, moneyLabel, receiptsCsv, reminderStatus, safeFilename, today, uid } from './domain';
import { createReceiptsPdf } from './pdf';
import type { AppData, Bike, Receipt, Reminder, ViewName } from './types';

const SLUG = 'bike-service-receipts';
const LICENSE_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `sb_license_verdict:${SLUG}`;
const VERIFY_URL = `https://api.sociobot.in/api/v1/products/${SLUG}/verify`;
const SITE_URL = 'https://bike-service-receipts.sociobot.in';
const BUILD_ID = 'polish-2';
const demoMode = location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
const SELECTED_BIKE_KEY = demoMode ? 'demo:selectedBikeId' : 'selectedBikeId';
const app = document.querySelector<HTMLDivElement>('#app')!;

type LicenseVerdict = { valid: boolean; checkedAt: number; reason?: string };
type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

let bikes: Bike[] = [];
let receipts: Receipt[] = [];
let reminders: Reminder[] = [];
let selectedBikeId = localStorage.getItem(SELECTED_BIKE_KEY) ?? '';
let activeView: ViewName = viewFromUrl();
let licensed = demoMode || readVerdict()?.valid === true;
let installEvent: InstallEvent | null = null;
let savedPulse = '';
let stateReady = false;

const SAMPLE_DATA: AppData = {
  version: 1,
  exportedAt: '2026-08-28T09:00:00.000Z',
  bikes: [
    { id: 'demo-commuter', name: 'Fern commuter', kind: 'City / hybrid', year: 2021, color: 'Forest green', odometerKm: 4860, createdAt: '2026-01-04T09:00:00.000Z', updatedAt: '2026-08-21T09:00:00.000Z' },
    { id: 'demo-gravel', name: 'Sunday gravel', kind: 'Gravel', year: 2023, color: 'Copper', odometerKm: 2140, createdAt: '2026-02-10T09:00:00.000Z', updatedAt: '2026-08-12T09:00:00.000Z' },
  ],
  receipts: [
    { id: 'demo-r1', bikeId: 'demo-commuter', component: 'Chain', action: 'Lubricated', servicedAt: '2026-08-21', cost: 320, currency: 'INR', odometerKm: 4860, provider: 'Self-recorded', notes: 'Cleaned after rain and applied dry-weather lube.', createdAt: '2026-08-21T09:00:00.000Z', updatedAt: '2026-08-21T09:00:00.000Z' },
    { id: 'demo-r2', bikeId: 'demo-commuter', component: 'Brakes', action: 'Replaced', servicedAt: '2026-07-02', cost: 1450, currency: 'INR', odometerKm: 4475, provider: 'Park Street Cycles', notes: 'Replaced front pads and checked cable tension.', createdAt: '2026-07-02T11:00:00.000Z', updatedAt: '2026-07-02T11:00:00.000Z' },
    { id: 'demo-r3', bikeId: 'demo-commuter', component: 'Tyres', action: 'Inspected', servicedAt: '2026-05-18', cost: 0, currency: 'INR', odometerKm: 4102, provider: 'Self-recorded', notes: 'Rear tread wearing evenly; no cuts found.', createdAt: '2026-05-18T08:00:00.000Z', updatedAt: '2026-05-18T08:00:00.000Z' },
    { id: 'demo-r4', bikeId: 'demo-gravel', component: 'Drivetrain', action: 'Shop service', servicedAt: '2026-08-12', cost: 2800, currency: 'INR', odometerKm: 2140, provider: 'Ridge Workshop', notes: 'Indexed gears and replaced the shift cable.', createdAt: '2026-08-12T10:00:00.000Z', updatedAt: '2026-08-12T10:00:00.000Z' },
  ],
  reminders: [
    { id: 'demo-n1', bikeId: 'demo-commuter', component: 'Chain', label: 'Clean and lubricate chain', intervalMonths: 1, intervalKm: 300, baselineDate: '2026-08-21', baselineKm: 4860, createdAt: '2026-08-21T09:00:00.000Z', updatedAt: '2026-08-21T09:00:00.000Z' },
    { id: 'demo-n2', bikeId: 'demo-commuter', component: 'Brakes', label: 'Inspect brake pads', intervalMonths: 3, intervalKm: 800, baselineDate: '2026-07-02', baselineKm: 4475, createdAt: '2026-07-02T11:00:00.000Z', updatedAt: '2026-07-02T11:00:00.000Z' },
    { id: 'demo-n3', bikeId: 'demo-gravel', component: 'Drivetrain', label: 'Check gear indexing', intervalMonths: 3, intervalKm: 1000, baselineDate: '2026-08-12', baselineKm: 2140, createdAt: '2026-08-12T10:00:00.000Z', updatedAt: '2026-08-12T10:00:00.000Z' },
  ],
};

function e(value: unknown): string {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!);
}

function icon(name: 'leaf' | 'receipt' | 'clock' | 'archive' | 'plus' | 'bike' | 'download' | 'camera' | 'alert'): string {
  const paths = {
    leaf: '<path d="M20 4C12 4 5 8 4 17c5 2 11 0 14-5-4 2-7 3-11 3 3-4 7-6 13-7V4Z"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6m-6 4h6m-6 4h4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    archive: '<path d="M4 7h16v14H4V7Zm-1-4h18v4H3V3Zm6 8h6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    bike: '<circle cx="6" cy="16" r="4"/><circle cx="18" cy="16" r="4"/><path d="m6 16 4-8 4 8h-8Zm4-8h5l3 8m-6-5h4M8 5h4"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 20h16"/>',
    camera: '<path d="M4 7h4l2-3h4l2 3h4v13H4V7Z"/><circle cx="12" cy="13" r="4"/>',
    alert: '<path d="M12 3 2.5 20h19L12 3Zm0 6v5m0 3h.01"/>',
  };
  return `<svg aria-hidden="true" viewBox="0 0 24 24">${paths[name]}</svg>`;
}

function siteHeader(): string {
  return `<header class="app-header">
    <a class="wordmark" href="/" data-page aria-label="Bike Service Receipts home"><span class="wordmark-mark">${icon('leaf')}</span><span><b>Bike Service</b><small>Receipts</small></span></a>
    <nav class="site-nav" aria-label="Main navigation"><a href="/" data-page>Home</a><a href="/demo" data-demo-link>Demo</a><a href="/privacy" data-page>Privacy</a><a href="/terms" data-page>Terms</a></nav>
  </header>`;
}

function siteFooter(): string {
  return `<footer><p>Log bike service, costs, and reminders on your device.</p><nav aria-label="Footer navigation"><a href="/privacy" data-page>Privacy</a><a href="/terms" data-page>Terms</a><a href="https://hello-factory.sociobot.in" rel="external">Built by Param Factory <span class="visually-hidden">(external site)</span></a></nav><p class="build-id">Build ${BUILD_ID}</p></footer>`;
}

function demoBanner(): string {
  if (!demoMode) return '';
  return `<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved to your records</strong><span>Changes stay in a separate demo log.</span><div><button class="quiet" type="button" id="reset-demo">Reset demo</button><a class="secondary" href="/" id="start-real">Start for real</a></div></aside>`;
}

function setMetadata(title: string, description: string, path: string): void {
  document.title = title;
  const canonicalPath = path === '/demo' ? '/demo' : path;
  const values: Record<string, string> = {
    'meta[name="description"]': description,
    'meta[property="og:title"]': title,
    'meta[property="og:description"]': description,
    'meta[property="og:url"]': `${SITE_URL}${canonicalPath}`,
    'meta[name="twitter:title"]': title,
    'meta[name="twitter:description"]': description,
  };
  for (const [selector, value] of Object.entries(values)) document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', value);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `${SITE_URL}${canonicalPath}`);
}

function finishRouteChange(moveFocus = false): void {
  bindPageLinks();
  bindDemoControls();
  if (moveFocus) focusRouteHeading();
}

function focusRouteHeading(): void {
  const heading = document.querySelector<HTMLElement>('h1');
  if (heading) { heading.tabIndex = -1; heading.focus(); }
  const status = document.querySelector<HTMLElement>('#route-status');
  if (status) status.textContent = `${heading?.textContent?.trim() ?? 'Page'} loaded`;
}

function bindDemoControls(): void {
  document.querySelector('#reset-demo')?.addEventListener('click', async () => { await importAllData(SAMPLE_DATA, 'replace'); selectedBikeId = SAMPLE_DATA.bikes[0]!.id; localStorage.setItem(SELECTED_BIKE_KEY, selectedBikeId); activeView = 'log'; history.replaceState({}, '', '/demo'); await loadState(); render(); announce('Demo reset to the original sample.'); });
  document.querySelector('#start-real')?.addEventListener('click', async (event) => { event.preventDefault(); await importAllData({ version: 1, exportedAt: new Date().toISOString(), bikes: [], receipts: [], reminders: [] }, 'replace'); localStorage.removeItem(SELECTED_BIKE_KEY); location.assign('/'); });
}

function viewFromUrl(): ViewName {
  const value = new URLSearchParams(location.search).get('view');
  return value === 'history' || value === 'schedule' || value === 'data' ? value : 'log';
}

function readVerdict(): LicenseVerdict | null {
  try { return JSON.parse(localStorage.getItem(VERDICT_KEY) ?? 'null') as LicenseVerdict | null; } catch { return null; }
}

function currentBike(): Bike | undefined {
  return bikes.find((bike) => bike.id === selectedBikeId) ?? bikes[0];
}

function announce(message: string, tone: 'ok' | 'error' = 'ok'): void {
  const region = document.querySelector<HTMLElement>('#field-note');
  if (!region) return;
  region.textContent = message;
  region.dataset.tone = tone;
}

function download(blob: Blob, filename: string): void {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1_000);
}

async function loadState(): Promise<void> {
  const data = validateImport(await readAllData());
  ({ bikes, receipts, reminders } = data);
  bikes.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  receipts.sort((a, b) => b.servicedAt.localeCompare(a.servicedAt) || b.createdAt.localeCompare(a.createdAt));
  if (!bikes.some((bike) => bike.id === selectedBikeId)) selectedBikeId = bikes[0]?.id ?? '';
  if (selectedBikeId) localStorage.setItem(SELECTED_BIKE_KEY, selectedBikeId);
  stateReady = true;
}

function shell(content: string): string {
  const bike = currentBike();
  const dueCount = bike ? reminders.filter((r) => r.bikeId === bike.id && reminderStatus(r, bike).kind !== 'later').length : 0;
  return `
    ${siteHeader()}${demoBanner()}
    <main id="main" tabindex="-1">
      <div class="page-heading">
        <div><p class="eyebrow">Personal maintenance log</p><h1>${demoMode ? 'Sample bike service log' : 'Your bike service log'}</h1></div>
        ${bike ? `<label class="bike-picker"><span>Current bike</span><select id="bike-picker">${bikes.map((item) => `<option value="${item.id}" ${item.id === bike.id ? 'selected' : ''}>${e(item.name)}</option>`).join('')}</select></label>` : ''}
      </div>
      <nav class="section-nav" aria-label="Service log sections">
        ${navButton('log', 'receipt', 'Log service')}
        ${navButton('history', 'archive', 'History')}
        ${navButton('schedule', 'clock', `Next up${dueCount ? ` · ${dueCount}` : ''}`)}
        ${navButton('data', 'download', 'Data & Plus')}
      </nav>
      <p id="field-note" class="field-note" role="status" aria-live="polite"></p>
      ${content}
    </main>
    ${siteFooter()}
    <div class="toast" id="update-toast" hidden><span>An updated field guide is ready.</span><button type="button" id="reload-app">Reload</button></div>`;
}

function navButton(view: ViewName, glyph: 'receipt' | 'archive' | 'clock' | 'download', label: string): string {
  return `<button type="button" data-view="${view}" aria-current="${activeView === view ? 'page' : 'false'}">${icon(glyph)}<span>${label}</span></button>`;
}

function render(): void {
  setMetadata(demoMode ? 'Demo — Bike Service Receipts' : 'Service log — Bike Service Receipts', demoMode ? 'Try a separate sample bike service log. Reset it at any time.' : 'Record bike service, costs, odometer readings, and reminders on this device.', demoMode ? '/demo' : '/');
  if (!bikes.length) {
    renderWelcome();
    return;
  }
  const contents: Record<ViewName, () => string> = { log: logView, history: historyView, schedule: scheduleView, data: dataView };
  app.innerHTML = shell(contents[activeView]());
  bindShell();
  ({ log: bindLog, history: bindHistory, schedule: bindSchedule, data: bindData })[activeView]();
}

function renderWelcome(): void {
  setMetadata('Bike Service Receipts — log service and costs', 'For cyclists who want each bike’s service history and next reminder in one place.', '/');
  app.innerHTML = `
    ${siteHeader()}
    <main id="main" class="welcome">
      <section class="welcome-copy">
        <p class="eyebrow">Private bike maintenance log</p>
        <h1>Log bike service and costs</h1>
        <p class="lede">For cyclists who want each bike’s service history and next reminder in one place.</p>
        <form id="first-bike-form" class="first-bike-form">
          <div class="field"><label for="first-name">Name your first bike <span aria-hidden="true">*</span></label><input id="first-name" name="name" required maxlength="60" autocomplete="off" placeholder="e.g. Green commuter"><small>This is how it will appear on every receipt.</small></div>
          <div class="field"><label for="first-kind">Type</label><select id="first-kind" name="kind"><option>City / hybrid</option><option>Road</option><option>Mountain</option><option>Gravel</option><option>Cargo</option><option>Folding</option><option>E-bike</option><option>Other</option></select></div>
          <div class="welcome-actions"><button class="primary" type="submit">${icon('bike')} Create bike profile</button><a class="secondary" href="/?demo=1" data-demo-link>Try it with sample data</a></div>
          <p class="action-note">Create your own profile, or open a separate sample log.</p>
          <p id="welcome-error" class="form-error" role="alert"></p>
        </form>
        <ul class="trust-list"><li>Works offline after your first visit</li><li>Exports CSV, PDF, and JSON</li><li>Stores records on this device</li></ul>
      </section>
      <figure class="welcome-art">
        <picture><source type="image/avif" srcset="/assets/field-guide-hero-768.avif 768w, /assets/field-guide-hero-1536.avif 1536w" sizes="(max-width: 900px) calc(100vw - 36px), 55vw"><source type="image/webp" srcset="/assets/field-guide-hero-768.webp 768w, /assets/field-guide-hero-1536.webp 1536w" sizes="(max-width: 900px) calc(100vw - 36px), 55vw"><img src="/assets/field-guide-hero-1536.webp" width="1536" height="1024" alt="An illustrated green city bicycle arranged on specimen paper with fern leaves, chain brush, oil bottle, blank receipt slip, and pencil." fetchpriority="high" decoding="async"></picture>
        <figcaption>Illustration of a commuter bike and the tools recorded in a service receipt.</figcaption>
      </figure>
      <p class="welcome-legal">By continuing you accept the <a href="/terms" data-page>terms</a>. Read how your data is handled in <a href="/privacy" data-page>privacy</a>. The product illustration was generated with AI.</p>
    </main>${siteFooter()}`;
  document.querySelector<HTMLFormElement>('#first-bike-form')!.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget as HTMLFormElement);
    try {
      const now = new Date().toISOString();
      const bike: Bike = { id: uid(), name: String(form.get('name')).trim(), kind: String(form.get('kind')), odometerKm: 0, createdAt: now, updatedAt: now };
      if (!bike.name) throw new Error('Enter a bike name to create its profile.');
      await put('bikes', bike);
      selectedBikeId = bike.id;
      await loadState();
      render();
      announce(`${bike.name} is ready. Log its first service receipt.`);
    } catch (error) {
      document.querySelector('#welcome-error')!.textContent = error instanceof Error ? error.message : 'Could not create this bike.';
    }
  });
  finishRouteChange();
}

function bindShell(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((button) => button.addEventListener('click', () => {
    activeView = button.dataset.view as ViewName;
    const url = new URL(location.href); url.searchParams.set('view', activeView); history.pushState({}, '', url);
    render(); focusRouteHeading();
  }));
  document.querySelector<HTMLSelectElement>('#bike-picker')?.addEventListener('change', (event) => {
    selectedBikeId = (event.currentTarget as HTMLSelectElement).value;
    localStorage.setItem(SELECTED_BIKE_KEY, selectedBikeId); render();
  });
  bindDemoControls();
  document.querySelector('#reload-app')?.addEventListener('click', () => location.reload());
  bindPageLinks();
}

function bindPageLinks(): void {
  document.querySelectorAll<HTMLAnchorElement>('[data-page]').forEach((link) => link.addEventListener('click', (event) => {
    if (link.origin !== location.origin) return;
    event.preventDefault();
    if ((demoMode || !stateReady) && link.pathname === '/') { location.assign('/'); return; }
    history.pushState({}, '', link.pathname); renderRoute(true);
  }));
  document.querySelectorAll<HTMLAnchorElement>('[data-demo-link]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    if (!demoMode) location.assign(link.getAttribute('href') ?? '/demo');
    else { history.pushState({}, '', '/demo'); renderRoute(true); }
  }));
}

function bikeDocket(bike: Bike): string {
  const count = receipts.filter((receipt) => receipt.bikeId === bike.id).length;
  return `<aside class="bike-docket" aria-label="Current bike summary">
    <div class="specimen-number">BIKE ${String(bikes.indexOf(bike) + 1).padStart(2, '0')}</div>
    <div><h2>${e(bike.name)}</h2><p>${e(bike.kind)}${bike.year ? ` · ${bike.year}` : ''}${bike.color ? ` · ${e(bike.color)}` : ''}</p></div>
    <dl><div><dt>Odometer</dt><dd>${bike.odometerKm.toLocaleString()} km</dd></div><div><dt>Receipts</dt><dd>${count}</dd></div></dl>
    <button class="quiet" type="button" id="edit-bike">Edit bike</button>
  </aside>`;
}

function logView(): string {
  const bike = currentBike()!;
  const latest = receipts.filter((r) => r.bikeId === bike.id).slice(0, 3);
  return `<div class="log-layout">
    <div>${bikeDocket(bike)}
      <section class="receipt-sheet ${savedPulse ? 'just-saved' : ''}" aria-labelledby="log-title">
        <div class="sheet-heading"><div><p class="eyebrow">New service</p><h2 id="log-title">Log a service receipt</h2></div><span>${dateLabel(today())}</span></div>
        <form id="receipt-form">
          <div class="field-grid two">
            <div class="field"><label for="component">Component <span aria-hidden="true">*</span></label><select id="component" name="component" required>${COMPONENTS.map((item) => `<option>${item}</option>`).join('')}</select></div>
            <div class="field"><label for="action">What was done? <span aria-hidden="true">*</span></label><select id="action" name="action" required>${ACTIONS.map((item) => `<option>${item}</option>`).join('')}</select></div>
          </div>
          <div class="field-grid three">
            <div class="field"><label for="servicedAt">Service date <span aria-hidden="true">*</span></label><input id="servicedAt" name="servicedAt" type="date" value="${today()}" max="${today()}" required></div>
            <div class="field cost-field"><label for="cost">Cost</label><div><select name="currency" aria-label="Currency"><option>INR</option><option>USD</option><option>GBP</option><option>EUR</option><option>AUD</option><option>CAD</option></select><input id="cost" name="cost" inputmode="decimal" type="number" min="0" step="0.01" placeholder="0.00"></div></div>
            <div class="field"><label for="odometer">Odometer (km)</label><input id="odometer" name="odometerKm" inputmode="numeric" type="number" min="0" step="1" value="${bike.odometerKm || ''}" placeholder="${bike.odometerKm}"></div>
          </div>
          <div class="field"><label for="provider">Who did the work?</label><input id="provider" name="provider" maxlength="100" placeholder="You or workshop name" autocomplete="organization"></div>
          <div class="field"><label for="notes">Evidence and notes</label><textarea id="notes" name="notes" maxlength="1000" rows="3" placeholder="Part, size, condition observed, or receipt reference"></textarea></div>
          <div class="evidence-row">
            <div class="field photo-field"><label for="photo">${icon('camera')} Photo evidence <span>${licensed ? 'optional' : 'Plus'}</span></label><input id="photo" name="photo" type="file" accept="image/*" ${licensed ? '' : 'disabled'} aria-describedby="photo-help"><small id="photo-help">${licensed ? 'Stored only on this device. Maximum source size 10 MB.' : 'Text receipts stay free. Plus can attach a compressed photo.'}</small></div>
            <label class="check-field"><input type="checkbox" name="remind" checked><span><b>Set the next reminder</b><small>Uses the default interval for this component. You can edit it later.</small></span></label>
          </div>
          <p id="receipt-error" class="form-error" role="alert"></p>
          <button class="primary full-mobile" type="submit">${icon('receipt')} Save receipt</button>
        </form>
      </section>
    </div>
    <aside class="recent" aria-labelledby="recent-title"><div class="section-heading"><div><p class="eyebrow">Service records</p><h2 id="recent-title">Recent work</h2></div>${latest.length ? '<button class="text-button" type="button" data-go-history>Full history</button>' : ''}</div>
      ${latest.length ? `<ol class="receipt-list compact">${latest.map(receiptItem).join('')}</ol>` : emptyState('receipt', 'No receipts yet', 'The first saved service will appear here with its date, cost, and evidence.')}
    </aside>
  </div>
  ${bikeDialog(bike)}`;
}

function emptyState(glyph: 'receipt' | 'clock' | 'archive', title: string, text: string): string {
  return `<div class="empty-state">${icon(glyph)}<h3>${title}</h3><p>${text}</p></div>`;
}

function receiptItem(receipt: Receipt): string {
  return `<li class="receipt-item" data-receipt="${receipt.id}">
    <div class="receipt-date"><b>${dateLabel(receipt.servicedAt)}</b><span>${receipt.odometerKm === null ? 'No odometer' : `${receipt.odometerKm.toLocaleString()} km`}</span></div>
    <div class="receipt-action"><span class="component-mark">${e(receipt.component.slice(0, 2).toUpperCase())}</span><div><h3>${e(receipt.component)} · ${e(receipt.action)}</h3><p>${receipt.provider ? e(receipt.provider) : 'Self-recorded'} · ${moneyLabel(receipt.cost, receipt.currency)}</p>${receipt.notes ? `<p class="receipt-notes">${e(receipt.notes)}</p>` : ''}</div></div>
    ${receipt.photo ? `<img class="receipt-photo" src="${e(receipt.photo)}" alt="Photo evidence attached to ${e(receipt.component)} service on ${e(dateLabel(receipt.servicedAt))}." width="112" height="84" loading="lazy">` : ''}
    <div class="receipt-actions"><button type="button" class="icon-button" data-pdf="${receipt.id}" aria-label="Export this receipt as PDF">${icon('download')}</button><button type="button" class="icon-button danger-icon" data-delete-receipt="${receipt.id}" aria-label="Delete ${e(receipt.component)} receipt from ${e(dateLabel(receipt.servicedAt))}">×</button></div>
  </li>`;
}

function bikeDialog(bike?: Bike): string {
  const editing = Boolean(bike);
  return `<dialog id="bike-dialog"><form method="dialog" class="dialog-sheet" id="bike-form"><div class="dialog-heading"><div><p class="eyebrow">Bike details</p><h2>${editing ? 'Edit this bike' : 'Add another bike'}</h2></div><button class="close-button" type="button" data-close-dialog aria-label="Close bike form">×</button></div>
    <input type="hidden" name="id" value="${bike?.id ?? ''}">
    <div class="field"><label for="bike-name">Bike name <span aria-hidden="true">*</span></label><input id="bike-name" name="name" required maxlength="60" value="${e(bike?.name ?? '')}"></div>
    <div class="field-grid two"><div class="field"><label for="bike-kind">Type</label><select id="bike-kind" name="kind">${['City / hybrid','Road','Mountain','Gravel','Cargo','Folding','E-bike','Other'].map((item) => `<option ${bike?.kind === item ? 'selected' : ''}>${item}</option>`).join('')}</select></div><div class="field"><label for="bike-km">Odometer (km)</label><input id="bike-km" name="odometerKm" type="number" min="0" step="1" value="${bike?.odometerKm ?? 0}"></div></div>
    <div class="field-grid two"><div class="field"><label for="bike-year">Year</label><input id="bike-year" name="year" type="number" min="1900" max="2100" value="${bike?.year ?? ''}"></div><div class="field"><label for="bike-color">Color / identifier</label><input id="bike-color" name="color" maxlength="40" value="${e(bike?.color ?? '')}"></div></div>
    <p id="bike-error" class="form-error" role="alert"></p><div class="dialog-actions">${editing ? '<button class="danger-text" type="button" id="delete-bike">Delete bike</button>' : '<span></span>'}<button class="primary" value="save">Save bike</button></div>
  </form></dialog>`;
}

async function imageData(file: File): Promise<string> {
  if (file.size > 10_000_000) throw new Error('Choose a photo smaller than 10 MB.');
  const image = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas'); canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
  canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height); image.close();
  return canvas.toDataURL('image/webp', 0.76);
}

function defaultInterval(component: string): { months: number | null; km: number | null } {
  const intervals: Record<string, [number | null, number | null]> = { Chain: [1, 300], Brakes: [3, 800], Tyres: [2, 500], Drivetrain: [3, 1000], Wheels: [6, 2000], Suspension: [12, 3000], Bearings: [12, 4000], Other: [6, null] };
  const value = intervals[component] ?? [6, null]; return { months: value[0], km: value[1] };
}

function bindLog(): void {
  const bike = currentBike()!;
  const form = document.querySelector<HTMLFormElement>('#receipt-form')!;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    button.disabled = true; button.textContent = 'Pressing receipt…';
    const data = new FormData(form);
    try {
      const now = new Date().toISOString();
      const odometerText = String(data.get('odometerKm') ?? '');
      const costText = String(data.get('cost') ?? '');
      const photoFile = data.get('photo');
      const receipt: Receipt = {
        id: uid(), bikeId: bike.id, component: String(data.get('component')), action: String(data.get('action')),
        servicedAt: String(data.get('servicedAt')), cost: costText === '' ? null : Number(costText), currency: String(data.get('currency')),
        odometerKm: odometerText === '' ? null : Number(odometerText), provider: String(data.get('provider')).trim(), notes: String(data.get('notes')).trim(),
        photo: licensed && photoFile instanceof File && photoFile.size ? await imageData(photoFile) : undefined, createdAt: now, updatedAt: now,
      };
      if (!receipt.component || !receipt.action || !receipt.servicedAt) throw new Error('Component, action, and service date are required.');
      if (receipt.cost !== null && (!Number.isFinite(receipt.cost) || receipt.cost < 0)) throw new Error('Enter a valid cost or leave it blank.');
      await put('receipts', receipt);
      if (receipt.odometerKm !== null && receipt.odometerKm > bike.odometerKm) await put('bikes', { ...bike, odometerKm: receipt.odometerKm, updatedAt: now });
      if (data.get('remind')) {
        const prior = reminders.find((item) => item.bikeId === bike.id && item.component === receipt.component);
        const interval = prior ? { months: prior.intervalMonths, km: prior.intervalKm } : defaultInterval(receipt.component);
        const reminder: Reminder = { id: prior?.id ?? uid(), bikeId: bike.id, component: receipt.component, label: `${receipt.component} check`, intervalMonths: interval.months, intervalKm: interval.km, baselineDate: receipt.servicedAt, baselineKm: receipt.odometerKm, createdAt: prior?.createdAt ?? now, updatedAt: now };
        await put('reminders', reminder);
      }
      savedPulse = receipt.id; await loadState(); render(); announce(`${receipt.component} receipt saved locally. Next reminder updated.`); savedPulse = '';
    } catch (error) {
      button.disabled = false; button.innerHTML = `${icon('receipt')} Save receipt`;
      const target = document.querySelector('#receipt-error')!; target.textContent = error instanceof Error ? error.message : 'Could not save this receipt.';
    }
  });
  document.querySelector('[data-go-history]')?.addEventListener('click', () => { activeView = 'history'; render(); });
  bindBikeDialog(bike);
  bindReceiptActions();
}

function bindBikeDialog(bike?: Bike): void {
  const dialog = document.querySelector<HTMLDialogElement>('#bike-dialog')!;
  document.querySelector('#edit-bike')?.addEventListener('click', () => dialog.showModal());
  document.querySelector('#add-bike')?.addEventListener('click', () => dialog.showModal());
  dialog.querySelector('[data-close-dialog]')?.addEventListener('click', () => dialog.close());
  const form = dialog.querySelector<HTMLFormElement>('#bike-form')!;
  form.addEventListener('submit', async (event) => {
    const submitter = (event as SubmitEvent).submitter as HTMLButtonElement | null;
    if (submitter?.value !== 'save') return;
    event.preventDefault(); const data = new FormData(form); const now = new Date().toISOString();
    try {
      const next: Bike = { id: String(data.get('id')) || uid(), name: String(data.get('name')).trim(), kind: String(data.get('kind')), odometerKm: Number(data.get('odometerKm')) || 0, year: data.get('year') ? Number(data.get('year')) : undefined, color: String(data.get('color')).trim() || undefined, createdAt: bike?.createdAt ?? now, updatedAt: now };
      if (!next.name) throw new Error('Give this bike a name.');
      await put('bikes', next); selectedBikeId = next.id; dialog.close(); await loadState(); render(); announce(`${next.name} was saved.`);
    } catch (error) { dialog.querySelector('#bike-error')!.textContent = error instanceof Error ? error.message : 'Could not save this bike.'; }
  });
  dialog.querySelector('#delete-bike')?.addEventListener('click', async () => {
    if (!bike || !confirm(`Delete ${bike.name} and all of its receipts and reminders? This cannot be undone.`)) return;
    await removeBikeAndRecords(bike.id); dialog.close(); await loadState(); render(); if (bikes.length) announce(`${bike.name} and its records were deleted.`);
  });
}

function historyView(): string {
  const bike = currentBike()!;
  const list = receipts.filter((item) => item.bikeId === bike.id);
  return `<section class="view-section" aria-labelledby="history-title"><div class="section-heading history-heading"><div><p class="eyebrow">Full service record</p><h2 id="history-title">Service history</h2><p>${list.length} ${list.length === 1 ? 'receipt' : 'receipts'} for ${e(bike.name)}</p></div><div class="button-row"><button type="button" class="secondary" id="export-bike-pdf">${icon('download')} Export PDF</button></div></div>
    <div class="history-tools"><label for="history-search">Filter this history</label><input id="history-search" type="search" placeholder="Search action, component, shop, or note"><span id="history-count" aria-live="polite"></span></div>
    ${list.length ? `<ol class="receipt-list" id="history-list">${list.map(receiptItem).join('')}</ol>` : `${emptyState('archive', 'A clear page', 'Log a service receipt and it will form a chronological, portable history for this bike.')}<button class="primary" type="button" data-view="log">Log first service</button>`}
  </section>`;
}

function bindReceiptActions(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-pdf]').forEach((button) => button.addEventListener('click', () => {
    const receipt = receipts.find((item) => item.id === button.dataset.pdf); if (!receipt) return;
    const bike = bikes.find((item) => item.id === receipt.bikeId)!;
    download(createReceiptsPdf([receipt], [bike]), `${safeFilename(bike.name)}-${receipt.servicedAt}-receipt.pdf`); announce('PDF receipt exported.');
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-delete-receipt]').forEach((button) => button.addEventListener('click', async () => {
    const receipt = receipts.find((item) => item.id === button.dataset.deleteReceipt); if (!receipt || !confirm(`Delete the ${receipt.component} receipt from ${dateLabel(receipt.servicedAt)}? This cannot be undone.`)) return;
    await remove('receipts', receipt.id); await loadState(); render(); announce('Receipt deleted.');
  }));
}

function bindHistory(): void {
  const bike = currentBike()!;
  bindReceiptActions();
  document.querySelector('#export-bike-pdf')?.addEventListener('click', () => {
    const items = receipts.filter((receipt) => receipt.bikeId === bike.id); download(createReceiptsPdf(items, [bike]), `${safeFilename(bike.name)}-service-history.pdf`); announce(`${bike.name} PDF history exported.`);
  });
  const search = document.querySelector<HTMLInputElement>('#history-search');
  search?.addEventListener('input', () => {
    const query = search.value.trim().toLowerCase(); let shown = 0;
    document.querySelectorAll<HTMLElement>('#history-list .receipt-item').forEach((item) => { const visible = item.innerText.toLowerCase().includes(query); item.hidden = !visible; if (visible) shown += 1; });
    document.querySelector('#history-count')!.textContent = query ? `${shown} matching receipts` : '';
  });
}

function scheduleView(): string {
  const bike = currentBike()!;
  const list = reminders.filter((item) => item.bikeId === bike.id).sort((a, b) => {
    const rank = { overdue: 0, soon: 1, later: 2 }; return rank[reminderStatus(a, bike).kind] - rank[reminderStatus(b, bike).kind];
  });
  return `<section class="view-section" aria-labelledby="schedule-title"><div class="section-heading"><div><p class="eyebrow">Reminder schedule</p><h2 id="schedule-title">What comes next</h2><p>Based only on the intervals and odometer you record.</p></div><button class="secondary" type="button" id="new-reminder">${icon('plus')} Add reminder</button></div>
    <div class="safety-note">${icon('alert')}<p><b>A reminder is not a safety check.</b> Conditions, use, and manufacturer guidance vary. Inspect your bike and consult a qualified mechanic when unsure.</p></div>
    ${list.length ? `<ol class="reminder-list">${list.map((reminder) => reminderItem(reminder, bike)).join('')}</ol>` : emptyState('clock', 'Nothing scheduled yet', 'Save a receipt with “Set the next reminder” selected, or add a reminder here.')}
  </section>${reminderDialog()}`;
}

function reminderItem(reminder: Reminder, bike: Bike): string {
  const status = reminderStatus(reminder, bike);
  const last = latestForComponent(receipts, bike.id, reminder.component);
  return `<li class="reminder-item status-${status.kind}"><div class="status-stamp"><span>${status.label}</span></div><div><p class="eyebrow">${e(reminder.component)}</p><h3>${e(reminder.label)}</h3><p class="due-detail">${e(status.detail)}</p><p class="last-evidence">${last ? `Last evidence: ${dateLabel(last.servicedAt)} · ${e(last.action)}` : `Baseline: ${dateLabel(reminder.baselineDate)}`}</p></div><div class="reminder-actions"><button class="quiet" type="button" data-edit-reminder="${reminder.id}">Edit rule</button><button class="danger-text" type="button" data-delete-reminder="${reminder.id}">Delete</button></div></li>`;
}

function reminderDialog(reminder?: Reminder): string {
  const bike = currentBike()!;
  return `<dialog id="reminder-dialog"><form method="dialog" class="dialog-sheet" id="reminder-form"><div class="dialog-heading"><div><p class="eyebrow">Reminder rule</p><h2>${reminder ? 'Edit reminder' : 'Add a reminder'}</h2></div><button class="close-button" type="button" data-close-dialog aria-label="Close reminder form">×</button></div><input type="hidden" name="id" value="${reminder?.id ?? ''}">
    <div class="field-grid two"><div class="field"><label for="reminder-component">Component</label><select id="reminder-component" name="component">${COMPONENTS.map((item) => `<option ${reminder?.component === item ? 'selected' : ''}>${item}</option>`).join('')}</select></div><div class="field"><label for="reminder-label">Note label</label><input id="reminder-label" name="label" required maxlength="80" value="${e(reminder?.label ?? 'Chain check')}"></div></div>
    <div class="field-grid two"><div class="field"><label for="baseline-date">Start from date</label><input id="baseline-date" name="baselineDate" type="date" required max="${today()}" value="${reminder?.baselineDate ?? today()}"></div><div class="field"><label for="baseline-km">Start odometer (km)</label><input id="baseline-km" name="baselineKm" type="number" min="0" step="1" value="${reminder?.baselineKm ?? bike.odometerKm}"></div></div>
    <fieldset ${licensed ? '' : 'disabled'}><legend>Repeat interval ${licensed ? '' : '<span class="plus-mark">Plus</span>'}</legend><div class="field-grid two"><div class="field"><label for="interval-months">Every (months)</label><input id="interval-months" name="intervalMonths" type="number" min="1" max="120" value="${reminder?.intervalMonths ?? 1}"></div><div class="field"><label for="interval-km">Every (km)</label><input id="interval-km" name="intervalKm" type="number" min="1" step="1" value="${reminder?.intervalKm ?? 300}"></div></div></fieldset>
    ${licensed ? '' : '<p class="upgrade-inline">Free reminders use the default 1 month / 300 km rule. Plus lets you customize both intervals.</p>'}
    <p id="reminder-error" class="form-error" role="alert"></p><div class="dialog-actions"><span></span><button class="primary" value="save">Save reminder</button></div></form></dialog>`;
}

function bindSchedule(): void {
  let editing: Reminder | undefined;
  const open = (reminder?: Reminder) => {
    editing = reminder; const old = document.querySelector('#reminder-dialog')!; old.outerHTML = reminderDialog(reminder); bindDialog(); document.querySelector<HTMLDialogElement>('#reminder-dialog')!.showModal();
  };
  const bindDialog = () => {
    const dialog = document.querySelector<HTMLDialogElement>('#reminder-dialog')!; const form = dialog.querySelector<HTMLFormElement>('#reminder-form')!;
    dialog.querySelector('[data-close-dialog]')?.addEventListener('click', () => dialog.close());
    form.addEventListener('submit', async (event) => {
      const submitter = (event as SubmitEvent).submitter as HTMLButtonElement | null; if (submitter?.value !== 'save') return;
      event.preventDefault(); const data = new FormData(form); const now = new Date().toISOString();
      try {
        const intervalMonths = licensed ? Number(data.get('intervalMonths')) || null : 1; const intervalKm = licensed ? Number(data.get('intervalKm')) || null : 300;
        if (!intervalMonths && !intervalKm) throw new Error('Set a month or odometer interval.');
        const next: Reminder = { id: String(data.get('id')) || uid(), bikeId: currentBike()!.id, component: String(data.get('component')), label: String(data.get('label')).trim(), baselineDate: String(data.get('baselineDate')), baselineKm: data.get('baselineKm') === '' ? null : Number(data.get('baselineKm')), intervalMonths, intervalKm, createdAt: editing?.createdAt ?? now, updatedAt: now };
        if (!next.label) throw new Error('Give this reminder a label.'); await put('reminders', next); dialog.close(); await loadState(); render(); announce('Reminder saved.');
      } catch (error) { form.querySelector('#reminder-error')!.textContent = error instanceof Error ? error.message : 'Could not save this rule.'; }
    });
  };
  bindDialog(); document.querySelector('#new-reminder')?.addEventListener('click', () => open());
  document.querySelectorAll<HTMLButtonElement>('[data-edit-reminder]').forEach((button) => button.addEventListener('click', () => open(reminders.find((item) => item.id === button.dataset.editReminder))));
  document.querySelectorAll<HTMLButtonElement>('[data-delete-reminder]').forEach((button) => button.addEventListener('click', async () => { const item = reminders.find((r) => r.id === button.dataset.deleteReminder); if (!item || !confirm(`Delete the “${item.label}” reminder?`)) return; await remove('reminders', item.id); await loadState(); render(); announce('Reminder deleted.'); }));
}

function dataView(): string {
  return `<section class="view-section" aria-labelledby="data-title"><div class="section-heading"><div><p class="eyebrow">Backup and export</p><h2 id="data-title">Your data & Field Guide Plus</h2><p>Back up the service log or take readable records to a shop or buyer.</p></div></div>
    <div class="data-grid"><section class="data-section" aria-labelledby="exports-title"><h3 id="exports-title">Carry your records</h3><p>Exports never leave this browser unless you choose where to save or send them.</p><div class="export-actions"><button class="secondary" type="button" id="export-csv">${icon('download')} Export CSV</button><button class="secondary" type="button" id="export-pdf">${icon('download')} Export PDF</button><button class="secondary" type="button" id="export-json">${icon('download')} Back up JSON</button></div><hr><h3>Restore a backup</h3><p>Merge adds and updates matching records. Replace first clears this device’s log.</p><div class="import-row"><select id="import-mode" aria-label="Import behavior"><option value="merge">Merge with this log</option><option value="replace">Replace this log</option></select><label class="file-button">Choose JSON<input id="import-json" type="file" accept="application/json,.json"></label></div><p id="import-error" class="form-error" role="alert"></p></section>
      <section class="data-section install-section" aria-labelledby="device-title"><h3 id="device-title">This device</h3><dl class="device-list"><div><dt>Storage</dt><dd>IndexedDB on this device</dd></div><div><dt>Connection</dt><dd>${navigator.onLine ? 'Online; app remains offline-ready' : 'Offline; local features available'}</dd></div><div><dt>Backups</dt><dd>${receipts.length} receipts ready to export</dd></div></dl><button class="quiet" id="install-app" type="button" ${installEvent ? '' : 'disabled'}>${installEvent ? 'Install this app' : 'App install available from your browser menu'}</button><button class="quiet" id="add-bike" type="button" ${!licensed && bikes.length >= 1 ? 'disabled' : ''}>${icon('plus')} Add another bike</button>${!licensed && bikes.length >= 1 ? '<small>Plus unlocks multiple bikes. Your current bike remains fully usable.</small>' : ''}</section>
    </div>
    ${plusSection()}
  </section>${bikeDialog()}`;
}

function plusSection(): string {
  if (licensed) return `<section class="plus-section unlocked" aria-labelledby="plus-title"><div class="pressed-leaf">${icon('leaf')}</div><div><p class="eyebrow">License active</p><h3 id="plus-title">Field Guide Plus is unlocked</h3><p>Multiple bikes, photo evidence, and custom reminder intervals are ready on this device.</p></div><button class="quiet" type="button" id="recheck-license">Check license</button></section>`;
  return `<section class="plus-section" aria-labelledby="plus-title"><div class="pressed-leaf">${icon('leaf')}</div><div><p class="eyebrow">One-time purchase · ₹499</p><h3 id="plus-title">Add photos and more bikes</h3><p>Field Guide Plus adds multiple bikes, compressed photo evidence, and custom month or odometer reminders. Text receipts and every export stay free.</p><ul><li>No subscription</li><li>No cloud account</li><li>Restore a license on another device</li></ul></div><div class="plus-actions"><button class="primary" type="button" disabled aria-describedby="sales-status">Purchases not open</button><small id="sales-status">Existing licenses can still be restored.</small><button class="text-button" type="button" id="show-license">Have a license?</button></div></section>
    <dialog id="license-dialog"><form method="dialog" class="dialog-sheet" id="license-form"><div class="dialog-heading"><div><p class="eyebrow">Restore purchase</p><h2>Paste your license</h2></div><button class="close-button" type="button" data-close-dialog aria-label="Close license form">×</button></div><div class="field"><label for="license-token">License token</label><textarea id="license-token" rows="3" required autocomplete="off" spellcheck="false"></textarea><small>We store this token on this device and send it only to Sociobot to verify your purchase.</small></div><p id="license-error" class="form-error" role="alert"></p><div class="dialog-actions"><span></span><button class="primary" value="verify">Verify and restore</button></div></form></dialog>`;
}

async function exportJson(): Promise<void> {
  const data = await readAllData(); download(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `bike-service-receipts-${today()}.json`);
}

function bindData(): void {
  document.querySelector('#export-csv')?.addEventListener('click', () => { download(new Blob([receiptsCsv(receipts, bikes)], { type: 'text/csv;charset=utf-8' }), `bike-service-receipts-${today()}.csv`); announce('CSV history exported.'); });
  document.querySelector('#export-pdf')?.addEventListener('click', () => { download(createReceiptsPdf(receipts, bikes), `bike-service-receipts-${today()}.pdf`); announce('PDF service log exported.'); });
  document.querySelector('#export-json')?.addEventListener('click', async () => { await exportJson(); announce('Complete JSON backup exported.'); });
  document.querySelector<HTMLInputElement>('#import-json')?.addEventListener('change', async (event) => {
    const input = event.currentTarget as HTMLInputElement; const file = input.files?.[0]; if (!file) return;
    const mode = (document.querySelector<HTMLSelectElement>('#import-mode')!.value) as 'merge' | 'replace';
    if (mode === 'replace' && !confirm('Replace this device’s entire service log with the selected backup? Export a backup first if you may need these records.')) { input.value = ''; return; }
    try { const data = validateImport(JSON.parse(await file.text())); await importAllData(data, mode); await loadState(); render(); announce(`Backup ${mode === 'merge' ? 'merged' : 'restored'}: ${data.bikes.length} bikes and ${data.receipts.length} receipts.`); }
    catch (error) { document.querySelector('#import-error')!.textContent = error instanceof Error ? error.message : 'Could not read this backup.'; input.value = ''; }
  });
  document.querySelector('#install-app')?.addEventListener('click', async () => { if (!installEvent) return; await installEvent.prompt(); const choice = await installEvent.userChoice; announce(choice.outcome === 'accepted' ? 'App installed.' : 'Install dismissed. You can try again from the browser menu.'); installEvent = null; });
  bindBikeDialog();
  const licenseDialog = document.querySelector<HTMLDialogElement>('#license-dialog');
  document.querySelector('#show-license')?.addEventListener('click', () => licenseDialog?.showModal());
  licenseDialog?.querySelector('[data-close-dialog]')?.addEventListener('click', () => licenseDialog.close());
  licenseDialog?.querySelector<HTMLFormElement>('#license-form')?.addEventListener('submit', async (event) => {
    const submitter = (event as SubmitEvent).submitter as HTMLButtonElement | null; if (submitter?.value !== 'verify') return; event.preventDefault();
    const token = licenseDialog.querySelector<HTMLTextAreaElement>('#license-token')!.value.trim();
    try { if (!token) throw new Error('Paste the complete license token.'); localStorage.setItem(LICENSE_KEY, token); const result = await verifyLicense(true); if (!result) throw new Error('That license is not active for Bike Service Receipts.'); licenseDialog.close(); render(); announce('Field Guide Plus restored on this device.'); }
    catch (error) { licenseDialog.querySelector('#license-error')!.textContent = error instanceof Error ? error.message : 'Could not verify this license.'; }
  });
  document.querySelector('#recheck-license')?.addEventListener('click', async () => { const valid = await verifyLicense(true); render(); announce(valid ? 'License is active.' : 'License is no longer active.', valid ? 'ok' : 'error'); });
}

function legalContent(pathname: string): string {
  if (pathname === '/privacy') return `<p class="eyebrow">Effective 28 August 2026</p><h1>Privacy, kept local</h1><p class="lede">Bike Service Receipts is designed so your maintenance history does not need an account or our database.</p><h2>What stays on your device</h2><p>Bike profiles, receipts, notes, odometer readings, reminders, and attached photos are stored in your browser’s IndexedDB. The Plus license token and its cached verification result are stored in localStorage. Removing site data removes this local copy, so keep JSON backups.</p><h2>When data leaves</h2><p>Nothing is uploaded by the free app. When you verify or restore Plus, the license token is sent to the Sociobot billing API solely to check its validity. When you buy Plus, the hosted checkout is operated by Sociobot with Dodo as merchant of record; their checkout privacy terms apply. Files you export go only where you choose.</p><h2>Tracking and permissions</h2><p>There are no analytics, advertising trackers, third-party fonts, location requests, ride imports, or background photo uploads. The service worker caches app files for offline use.</p><h2>Your controls</h2><p>Export JSON for a complete portable backup, CSV or PDF for readable history, and clear this site’s storage from your browser to erase local data.</p>`;
  return `<p class="eyebrow">Effective 28 August 2026</p><h1>Terms for the service log</h1><p class="lede">Use Bike Service Receipts as your private record of work done, not as a safety check.</p><h2>The service</h2><p>The free app provides one bike profile, text service receipts, default reminders, and every export.</p><p>Field Guide Plus will cost ₹499 once sales open. It adds multiple bikes, photo evidence, and custom reminder intervals.</p><h2>Purchases and refunds</h2><p>Sociobot handles checkout, taxes, receipts, and refunds. Dodo is the merchant of record.</p><p>A refund or charge reversal revokes the license. The free app and your exports remain usable.</p><h2>Your responsibility</h2><p>Reminders are estimates based on values you enter. They do not inspect a bicycle, identify faults, or certify safety.</p><p>Inspect before riding. Use a qualified mechanic when uncertain.</p><h2>Local data and availability</h2><p>You are responsible for backups. Device settings, private browsing, or uninstalling can clear browser storage.</p><p>The software is provided “as is” without warranties, to the extent permitted by law.</p><h2>Fair use</h2><p>Do not misuse the billing API, bypass a paid feature, or use the app unlawfully. You own the maintenance data you create.</p>`;
}

function renderLegal(pathname: string, moveFocus = false): void {
  const path = pathname === '/privacy' ? '/privacy' : '/terms';
  const title = `${path === '/privacy' ? 'Privacy' : 'Terms'} — Bike Service Receipts`;
  setMetadata(title, path === '/privacy' ? 'How Bike Service Receipts stores local records and verifies an optional license.' : 'Terms for using Bike Service Receipts and its one-time Plus license.', path);
  app.innerHTML = `${siteHeader()}${demoBanner()}<main id="main" class="legal-page">${legalContent(path)}</main>${siteFooter()}`;
  finishRouteChange(moveFocus);
}

function renderNotFound(moveFocus = false): void {
  setMetadata('Page not found — Bike Service Receipts', 'This Bike Service Receipts page does not exist. Return to the service log.', '/404');
  app.innerHTML = `${siteHeader()}${demoBanner()}<main id="main" class="not-found"><p class="eyebrow">Missing record · 404</p><h1>This page is not in the log</h1><p>The address does not match a bike service page.</p><a class="primary" href="/" data-page>Return to the service log</a></main>${siteFooter()}`;
  finishRouteChange(moveFocus);
}

function renderRoute(moveFocus = false): void {
  if (location.pathname === '/privacy' || location.pathname === '/terms') { renderLegal(location.pathname, moveFocus); return; }
  if (location.pathname !== '/' && location.pathname !== '/demo') { renderNotFound(moveFocus); return; }
  activeView = viewFromUrl();
  render();
  if (moveFocus) finishRouteChange(true);
}

function renderRecovery(error: unknown): void {
  setMetadata('Repair local records — Bike Service Receipts', 'Recover valid bike records after a damaged import.', '/');
  app.innerHTML = `${siteHeader()}<main id="main" class="fatal"><p class="eyebrow">Local records need repair</p><h1>Recover your valid bike records</h1><p>A damaged record stopped the log from opening. Download the raw data first, then remove only invalid records.</p><p class="form-error">${e(error instanceof Error ? error.message : 'A local record is incomplete.')}</p><div class="recovery-actions"><button class="secondary" id="download-raw" type="button">Download raw recovery file</button><button class="primary" id="repair-data" type="button">Remove damaged records</button></div><p id="recovery-note" role="status" aria-live="polite"></p></main>${siteFooter()}`;
  document.querySelector('#download-raw')?.addEventListener('click', async () => { const data = await readAllData(); download(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `bike-service-receipts-recovery-${today()}.json`); });
  document.querySelector('#repair-data')?.addEventListener('click', async () => {
    const result = await repairStoredData();
    document.querySelector('#recovery-note')!.textContent = `${result.removed} damaged record${result.removed === 1 ? '' : 's'} removed. Opening the valid records now.`;
    await loadState(); renderRoute(); announce('Valid local records recovered.');
  });
  finishRouteChange();
}

async function verifyLicense(force = false): Promise<boolean> {
  const token = localStorage.getItem(LICENSE_KEY); if (!token) { licensed = false; return false; }
  const cached = readVerdict();
  if (!force && cached && Date.now() - cached.checkedAt < 86_400_000) { licensed = cached.valid; return cached.valid; }
  try {
    const response = await fetch(`${VERIFY_URL}?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification service is unavailable.');
    const result = await response.json() as { valid: boolean; reason?: string };
    const verdict: LicenseVerdict = { valid: result.valid, checkedAt: Date.now(), reason: result.reason }; localStorage.setItem(VERDICT_KEY, JSON.stringify(verdict)); licensed = result.valid;
    return result.valid;
  } catch (error) {
    if (cached?.valid) { licensed = true; return true; }
    if (force) throw new Error(navigator.onLine ? 'Could not reach license verification. Try again shortly.' : 'Connect once to verify this license on this device.');
    return false;
  }
}

function acceptReturnedLicense(): void {
  const url = new URL(location.href); const token = url.searchParams.get('license'); if (!token) return;
  localStorage.setItem(LICENSE_KEY, token); url.searchParams.delete('license'); history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function registerPwa(): void {
  if (!('serviceWorker' in navigator)) return;
  const hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('message', (event) => { if (hadController && event.data?.type === 'APP_UPDATED' && sessionStorage.getItem('sw-version') !== event.data.version) { sessionStorage.setItem('sw-version', event.data.version); const toast = document.querySelector<HTMLElement>('#update-toast'); if (toast) toast.hidden = false; } });
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
}

window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); installEvent = event as InstallEvent; if (activeView === 'data') render(); });
window.addEventListener('online', () => { const badge = document.querySelector('#connection-status'); if (badge) badge.textContent = 'Ready offline'; announce('Connection restored. Local records were available throughout.'); });
window.addEventListener('offline', () => { const badge = document.querySelector('#connection-status'); if (badge) badge.textContent = 'Working offline'; announce('You are offline. Receipts still save on this device.'); });
window.addEventListener('popstate', () => renderRoute(true));

async function start(): Promise<void> {
  acceptReturnedLicense(); registerPwa();
  if (location.pathname === '/privacy' || location.pathname === '/terms' || (location.pathname !== '/' && location.pathname !== '/demo')) { renderRoute(); return; }
  try {
    if (demoMode) {
      const existing = await getAll<Bike>('bikes');
      if (!existing.length) await importAllData(SAMPLE_DATA, 'replace');
      selectedBikeId ||= SAMPLE_DATA.bikes[0]!.id;
    }
    await loadState(); renderRoute();
    if (!demoMode) { const licenseBeforeCheck = licensed; void verifyLicense().then((wasValid) => { if (wasValid !== licenseBeforeCheck) renderRoute(); }); }
  } catch (error) {
    try { const recovery = await inspectStoredData(); if (recovery.removed > 0) renderRecovery(error); else throw error; }
    catch { app.innerHTML = `${siteHeader()}<main id="main" class="fatal"><p class="eyebrow">The service log could not open</p><h1>Check browser storage</h1><p>${e(error instanceof Error ? error.message : 'Local storage is unavailable in this browser.')}</p><button class="primary" id="retry-open" type="button">Try again</button><p>Private browsing or blocked storage can prevent a local log from opening.</p></main>${siteFooter()}`; document.querySelector('#retry-open')?.addEventListener('click', () => location.reload()); finishRouteChange(); }
  }
}

void start();
