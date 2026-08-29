# Bike Service Receipts — review 4 handoff

Work order: `bike-service-receipts-review-4`
Role: reviewer
Live URL: <https://bike-service-receipts.sociobot.in>

## Completed

- Conducted a fresh cold mobile/desktop review and wrote `.factory/review-4.md`.
- Read the brief, visual thesis, demo and claim contracts, every earlier review,
  polish report, verification report, and prior handoff. No product code was
  changed in this work order.
- Closed every finding from review rounds 1–3. The detailed finding-by-finding
  mapping is in `.factory/polish-3.md`.
- Made demo license returns safe: `?demo=1&license=...` strips the parameter
  and cannot write real local/session storage or the real IndexedDB namespace.
- Added the real Sociobot license-destination claim test and removed unsupported
  billing, merchant, refund, and revocation promises while purchases are closed.
- Completed the landing flow with a sample receipt, workflow, limitations, and
  exact free/Plus pricing; updated the price fact, README heading, demo wording,
  404 copy, sitemap, service-worker version, catalog sentence, and copy audit.
- Preserved the botanical field-guide visual system and original art.

## Verification

Review 4 clean clone at `9572a3c2ebcd5f69d12888ffcd1cf1fc90ca7293`:

- `npm ci` completed with zero vulnerabilities; `npm test` passed 8/8; and
  `npm run build` created `dist/`.
- All 11 exact claim-manifest commands passed independently in desktop
  Chromium and Pixel 5 projects.
- `BASE_URL=https://bike-service-receipts.sociobot.in npx playwright test
  --workers=2` passed 34/34.
- Fresh demo request logging found only same-origin requests. The demo
  license-return URL used only `demo:` local storage/IndexedDB, and Reset kept
  that isolation. Valid routes and all discovered links returned 200; an
  unknown route returned the designed static 404 with HTTP 404.

Fresh clone `/tmp/bike-service-receipts-clean-final-13Uo2r` at `32a2fd1`:

```sh
npm ci                         # 0 vulnerabilities
npm test                       # 8 passed
npm run build                  # dist/index.html created
# each exact command in .factory/claims.json
npx playwright test --workers=2 # 34 passed
```

All 11 claim commands passed independently in both Chromium desktop and Pixel
5 projects: demo isolation, service records, reminders, exports, backup
restore, offline reload, local privacy, Plus, free tier, license destination,
and accessible layout. The full clean-clone browser suite passed 34/34.

Production checks after deploy:

- `BASE_URL=https://bike-service-receipts.sociobot.in npx playwright test --workers=2`: 34/34 passed.
- `/opt/fleet/lib/verify-url.sh`: no console/page errors; title, language, one
  H1, main landmark, image alts, and button names passed. Evidence:
  `.factory/evidence/polish-3-live/verify.json`.
- Playwright Axe integration found no serious or critical findings across root,
  demo, privacy, and 404 in both browser projects.
- Offline test reloaded the controlled demo and saved a receipt after the first
  visit. Privacy test recorded no cross-origin request while saving demo data.
  License test intercepted a recorded valid response and asserted the only
  credential request was the Sociobot verification URL.
- Live 404: HTTP 404 with the static error title, canonical, H1, and return
  action before JavaScript. Screenshot:
  `.factory/evidence/polish-3-live/not-found-desktop.png`.
- Live headers: root has CSP, Permissions-Policy, Referrer-Policy, nosniff, and
  frame restriction. `/assets/index-CimKnQkY.js` has one-year immutable cache.
- Lighthouse mobile run: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; LCP 997 ms, CLS 0, TBT 0. Evidence:
  `.factory/evidence/lighthouse-live-polish-3.json`.
- Build budget: JS 56.25 KB raw / 17.75 KB gzip; CSS 25.82 KB raw / 6.27 KB
  gzip; mobile AVIF hero 29 KB.

## Evidence

- Landing cold mobile: `.factory/evidence/polish-3-live/welcome-mobile.png`
- Demo with discarded license parameter: `.factory/evidence/polish-3-live/demo-isolated-mobile.png`
- Privacy and Terms: `.factory/evidence/polish-3-live/privacy-desktop.png`,
  `.factory/evidence/polish-3-live/terms-desktop.png`
- Static 404 body: `.factory/evidence/polish-3-live/unknown.html`
- Production sitemap: `.factory/evidence/polish-3-live/sitemap.xml`

## Known gaps

Review 4 is **FAIL** on F-4-1: the visible photo help says **“Maximum source
size 10 MB”**, but this quantitative promise has no `.factory/claims.json`
entry or boundary test. Add and pass the specified `photo-source-limit` test,
or remove the numerical promise, before a PASS review. Purchases remain
deliberately closed; the UI and legal copy say so while existing Sociobot
licenses remain restorable.
