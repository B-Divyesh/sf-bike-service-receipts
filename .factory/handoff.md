# Bike Service Receipts — review-1 handoff

Work order: `bike-service-receipts-review-1`. This was a review-only task:
product source was not modified.

## Outcome

`FAIL`. The complete report is [`review-1.md`](review-1.md). It reproduces
the accepted incomplete-JSON import defect on the live target and finds the
required demo, claim manifest/tests, and designed 404 route missing. It also
confirms the earlier live cache/security-header and performance findings are
not resolved.

## Verification performed

- Fresh live Chromium contexts at 390×844 and 1440×1000.
- Fresh demo probe: after a normal record was created, `?demo=1` exposed the
  same IndexedDB/localStorage state and no demo banner/reset.
- Fresh live malformed-import probe: the documented validator-accepted JSON
  persisted and the next reload reached the fatal screen.
- Live headers, route/focus behaviour, metadata, request origins, and source
  paths inspected.
- `npm ci`; `npm test` (6 passed); `npm run build` (passed and produced
  `dist/`); and `npm run test:e2e` (8 passed).

There is no `.factory/claims.json`, so no claim-specific command could be
run. A new Lighthouse run could not complete in this container because the
provided Chromium closed its CDP connection; the prior live score of 86 remains
the only recorded score and no correction is deployed.

## Remaining work

Resolve every finding in `review-1.md`, prioritising import validation and
recovery, isolated sample demo, claim contract, routing/404, and deployment
retest.

---

# Historical builder handoff

## Verifier outcome (2026-08-28): **FAIL**

Independent verification of candidate `151a9b707004a6e2229200f9c0c3700d42ffabac`
and <https://bike-service-receipts.sociobot.in> found a high-severity JSON
import persistence defect: an incomplete but validator-accepted backup is
written to IndexedDB and causes the app to fail on every later reload. The
live mobile Lighthouse performance score was also 86, below the required 90.
The complete evidence, exact reproduction, passing checks, deployment identity
hashes, and retest criteria are in [`.factory/verification.md`](verification.md).

Do not release this candidate until the verification report's blocking defect
is corrected and independently retested. The builder handoff below is retained
as historical implementation context; its PASS-like verification claims are
superseded by this verifier result.

---

Work order: `bike-service-receipts-build-1`

Completed: 2026-08-28

Artifact: static offline-first PWA (`dist/`)

## What shipped

- A complete local-first maintenance log for one or more bicycles, persisted in IndexedDB with no account.
- Bike profiles with name, type, year, color/identifier, and current odometer.
- Service receipts with component/action, date, cost and currency, odometer, provider, notes, and optional locally compressed photo evidence.
- Per-bike recent work and full searchable/scrollable history with individual PDF export and confirmed deletion.
- Rule-based month/mileage reminders, automatically rebased when a matching service receipt is saved, with due-soon/now states and clear non-diagnostic safety copy.
- Portable all-history CSV and PDF exports plus complete JSON backup, validated merge, and confirmed replace restore.
- Free tier: one bike, unlimited text receipts, default rules, and all exports. Field Guide Plus (₹499 one-time): unlimited bikes, photo evidence, and custom rules.
- Sociobot paid-unlock contract: hosted checkout link, return-token capture/URL cleanup, daily cached verification, optimistic offline cached verdict, revocation handling, and paste-to-restore.
- `/privacy` and `/terms` routes covering local data, billing, refunds, disclaimers, and user controls.
- Installable PWA manifest, 192/512 maskable-ready icons, versioned service-worker caches, generated-build-asset precache, offline fallback, API network-first handling, asset cache-first handling, and update toast.
- Product-specific botanical field-guide system in `.factory/design.md`, including light/dark palettes, type, spacing, motion, and asset provenance.
- Original generated bicycle field plate in AVIF/WebP responsive sizes. Reviewed for branding/text artifacts and bicycle geometry; mobile AVIF is 29 KB and full AVIF is 117 KB.

## Verification

Run from a clean checkout:

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Results at handoff:

- `npm test`: 6/6 unit tests passed (reminder logic, CSV escaping, real PDF output, backup validation).
- `npm run build`: passed with Vite 7.3.6; output has `dist/index.html` at its root.
- Production payload: 45.64 KB JS / 15.09 KB gzip; 20.23 KB CSS / 5.27 KB gzip; no runtime font payload.
- `npm run test:e2e`: 8/8 passed across desktop Chromium and Pixel 5 profiles. Covered create/save/refresh, logged-in and first-run axe scans, direct privacy route, paid return-token verification, and offline reload plus offline saving.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 /tmp/bsr-evidence-final`: HTTP 200, load 626 ms, zero console/page errors, title and `lang=en`, one h1, main landmark, zero missing alt text, zero unlabeled buttons.
- Lighthouse mobile on the production preview: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.6 s, TBT 0 ms, CLS 0, Speed Index 1.1 s.
- `npm audit`: 0 vulnerabilities.
- Manual visual inspection completed at 390×844 and 1440×1000 in light mode. The mobile field sheet, fixed safe-area navigation, hero crop, and desktop two-column cover were checked.

## Deployment

Use exactly:

```sh
npm run build
```

Deploy `./dist` as a static SPA with fallback routes to `index.html`. Do not change billing providers or add secrets in this repository. The factory still needs to register `bike-service-receipts` and its return URL with the Sociobot billing engine; the app deliberately contains the slug, not a provider/product ID.

## Known gaps and next steps

- Reminders are visible in the app; v1 does not request OS notification permission or run background alarms. This avoids unreliable/surprising notification behavior and preserves the brief’s informational-only posture.
- The real purchase redirect and revocation lifecycle cannot be end-to-end charged until the factory registers the product. The browser suite stubs the documented Sociobot verification response and exercises token storage and URL stripping.
- Records are device-local by design. Users must make a JSON backup before clearing browser data or moving devices; this is stated in-product and in the privacy page.
