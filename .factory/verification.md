# Independent verification — FAIL

Verified 2026-08-28 against candidate `151a9b707004a6e2229200f9c0c3700d42ffabac`.

Live target: <https://bike-service-receipts.sociobot.in>

## Outcome

**FAIL.** The production artifact is the tested candidate, but JSON import can
permanently leave the local app unable to open after accepting an incomplete
backup. This violates the local-first data-ownership contract and the stated
requirement that import validate before writing. The live mobile Lighthouse
performance score also missed the required minimum.

## Blocking defects

### High — accepted incomplete JSON backup poisons local storage and bricks the app

`validateImport` accepts a backup containing only a bike `id` and `name`; it
does not validate the required `Bike` fields such as `createdAt`, `updatedAt`,
`kind`, and `odometerKm`. The import is written before `loadState()` sorts by
`createdAt`. Consequently the UI first reports the raw error, then on reload
shows the fatal screen:

```
Cannot read properties of undefined (reading 'localeCompare')
```

Reproduction on the exact production build (`http://127.0.0.1:4174`) in a
fresh browser profile:

1. Create a normal bike, open **Data & Plus**, and select this JSON as a merge:

   ```json
   {"version":1,"exportedAt":"x","bikes":[{"id":"poison","name":"Poison"}],"receipts":[],"reminders":[]}
   ```

2. The application accepts it and reports
   `Cannot read properties of undefined (reading 'localeCompare')`.
3. Reload. The only UI is **The field log could not open** / **Your records
   were not changed**. Existing local records remain inaccessible through the
   app. The malformed record has already been persisted, so the reported
   recovery path does not recover it.

This is not an artificial malformed JSON parse failure: it satisfies the
current validator's public version/id/name/relationship checks. It is a
recoverability and persistence-boundary failure for the product's advertised
backup/import feature.

### Medium — live mobile Lighthouse performance misses the contract

Fresh Lighthouse 13.4.1 run against the live HTTPS URL, using Chromium 145 and
the mobile preset, scored: Performance **86**, Accessibility 100, Best
Practices 100, SEO 100. The performance acceptance bar is at least 90.

Measured metrics: FCP 1.0 s, LCP 1.2 s, CLS 0, TBT 570 ms, interactive 1.8 s.

### Low — production asset caching is not immutable

The live hashed JS, CSS, service worker, manifest, and image assets all return
`Cache-Control: public, must-revalidate, max-age=30`, rather than the required
long-lived immutable policy for hashed assets. This weakens repeat-load and
offline-cache efficiency. The deployment also does not return a Content-
Security-Policy or Permissions-Policy header; this was recorded as a response
policy observation, not relied on for the failure above.

## What passed

### Clean candidate and repository gates

- Clean checkout was already exactly `151a9b707004a6e2229200f9c0c3700d42ffabac`.
- `npm ci` completed: 60 packages audited, 0 vulnerabilities.
- `npm test` passed: 6/6 tests.
- `npm run build` passed (includes `tsc --noEmit`) and produced `dist/`.
  There is no separate lint script in `package.json`.
- `npm run test:e2e` passed: 8/8 Playwright tests across desktop Chromium and
  Pixel 5 (`test-results/.last-run.json` reports `passed`).
- Production bundle budgets pass: JS 45.64 kB / 15.09 kB gzip and CSS 20.23 kB
  / 5.27 kB gzip. No font payload. The 768px AVIF hero is 32 kB on disk.

### Independent end-to-end browser checks

On the production build, a fresh desktop Chromium session created a bike,
saved a zero-cost/zero-odometer Chain/Lubricated receipt with notes, created
the default reminder, filtered history, downloaded CSV/PDF/JSON, rejected
syntactically invalid JSON with an actionable error, and retained the bike
after an offline reload. Download names were
`bike-service-receipts-2026-08-28.{csv,pdf,json}`.

At exactly 390×844 on both the local production build and the live site, the
page had no horizontal overflow and the four bottom navigation targets measured
95×63 CSS px. Keyboard focus was visible (`3px` solid outline); the skip link,
buttons, and form controls were reachable. Reduced motion computed to `0.01ms`
for the receipt animation. Axe found no serious or critical WCAG 2 A/AA issues
on the tested welcome, logged-in, dark, and live mobile states. No page errors
or console errors were observed.

### Privacy, PWA, and deployment identity

- Fresh free-mode browser traffic made no cross-origin requests; source review
  confirms the only optional outbound request is Sociobot license verification
  after a license token exists. No CDN fonts/scripts, analytics, location, or
  ride-import requests were found.
- Live HTTPS PWA registration and controller succeeded. After one controlled
  navigation, an offline reload retained the locally-created `Live PWA` bike;
  the app continued from its cached shell. The update-available client handler
  was exercised by delivering an `APP_UPDATED` message to the controlled page,
  which revealed the reload toast. A real two-version SW activation could not
  be induced from a single immutable deployment; the worker source was also
  inspected and contains `skipWaiting` and `clientsClaim`.
- `lang=en`, one `h1`, one `main`, title, manifest, privacy route, terms route,
  and meaningful image alt text were present.
- Live `index.html`, main JS, CSS, `sw.js`, and manifest SHA-256 values exactly
  matched the fresh `dist/` output. For example, the main bundle was
  `643f309971bf59947accd7d90c7923e3b2bbf48cb309a9533198ce7a9e3fd5b8` on
  both sides. The deployment is therefore not a stale or different artifact.

## Retest criteria

1. Reject incomplete/type-invalid backup records before opening an IndexedDB
   write transaction, or validate into a new transaction and ensure no partial
   mutation on failure.
2. Provide an in-app recovery path for any already-poisoned local data (without
   silently losing valid records).
3. Re-run the malformed-backup reproduction, normal merge and replace restore,
   complete clean-profile regression suite, and live mobile Lighthouse.
4. Correct immutable caching for hashed static assets and recheck deployment
   response policies.
