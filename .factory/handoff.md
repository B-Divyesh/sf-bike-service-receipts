# Bike Service Receipts — polish round 1 handoff

Work order: `bike-service-receipts-polish-1`

Artifact: static offline-first PWA

Live URL: <https://bike-service-receipts.sociobot.in>

## Status

Complete and deployed. Every finding in `review-1.md` is mapped to its repair
and evidence in [polish-1.md](polish-1.md). No review finding remains open in
the repository or deployed artifact.

## What changed

- Rewrote the first screen around the job: log bike service, costs, and
  reminders. Added the one-click sample action and reviewed plain wording.
- Added an isolated `demo:bike-service-receipts` database, separate demo
  selection state, four realistic receipts, three reminders, reset, and a
  route-persistent demo banner. Leaving demo deletes its data and returns to
  untouched real records.
- Added strict validation for every imported field before any transaction.
  A recovery screen can export the raw damaged database and remove invalid
  records while retaining valid ones.
- Added the complete claim contract in `claims.json`. Each listed claim has
  one observable `@claim:` browser test that begins from sample data.
- Added route-specific titles and metadata, canonical and social metadata,
  a 1200×630 social image, Apple touch icon, shared navigation/footer,
  route announcements, focus restoration, and styled application and host
  404 responses.
- Added long-lived immutable hashed-asset caching and CSP,
  Permissions-Policy, Referrer-Policy, nosniff, and frame restrictions.
- Replaced the unavailable Sociobot checkout with an honest disabled
  “Purchases not open” state. Existing Sociobot licenses can still be pasted
  and verified; entitlement tests use a recorded response and spend nothing.
- Updated README, demo documentation, copy audit, catalog description,
  design provenance, privacy, and terms.

## Verification

Clean checkout verification uses:

```sh
npm ci
npm test
npm run build
npm run test:e2e -- --workers=1
```

Each command in `.factory/claims.json` was also run separately from the clean
checkout. Results:

- Unit tests: 8 passed.
- Browser/accessibility/integration tests: 26 passed across desktop Chromium
  and Pixel 5 projects.
- All 10 claim commands passed independently.
- Build: `dist/index.html` exists; initial JS is 53.82 KB raw / 17.25 KB gzip;
  CSS is 22.26 KB raw / 5.70 KB gzip.
- Live URL verifier: zero console or page errors; `lang=en`; one H1; one main;
  no missing alt text or unnamed buttons.
- Final live mobile Lighthouse: Performance 99, Accessibility 100,
  Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.1 s, TBT 110 ms, CLS 0.
- Live routes: `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown
  path returns the designed page with HTTP 404.
- The deployed JS SHA-256 matches the local build:
  `377e61d98d9d9b274abaaf92c0f1a009ccb753cee60517743f358c6102d5c585`.

Evidence is under `.factory/evidence/`, including the mobile recovery screen,
live route screenshots, URL verifier JSON, and final Lighthouse JSON.

## Deployment

The production artifact was deployed with:

```sh
/opt/fleet/lib/deploy-static.sh bike-service-receipts dist
```

Deployment ID: `54c89277-a5fb-4e81-88d0-9bbda007f16b`.

## Known limitations

There are no unresolved acceptance findings. The configured live Sociobot
checkout endpoint currently reports that the factory product is unavailable,
so new purchases are not offered. This is represented truthfully in the UI;
restore and verification for existing licenses remain available. Enabling new
sales requires product registration outside this repository and is not an
application defect or an authorized infrastructure change for this work order.
