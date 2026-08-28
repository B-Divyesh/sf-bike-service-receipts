# Perfection loop round 1

Reviewed against candidate `151a9b707004a6e2229200f9c0c3700d42ffabac`
and the cumulative report at `ce8ea468cd504811d0521ed78975c48ccfbbb541`.
`review-1.md` is the only review/polish report present before this document.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Imports now validate every required bike, receipt, and reminder field before a write transaction. Damaged databases open a recovery view that exports raw data and removes only invalid records. | `rejects an incomplete import before writing and recovers a previously damaged database`; `.factory/evidence/live-recovery-mobile.png`; live `/?demo=1&view=data` import rejection. |
| F-1-2 | Reduced the initial bundle, redeployed, and measured the production URL on a mobile Lighthouse profile. | `.factory/evidence/lighthouse-live-final.json`: Performance 99, LCP 1.1 s, CLS 0. |
| F-1-3 | Added immutable caching for hashed assets plus CSP, Permissions-Policy, Referrer-Policy, nosniff, and frame restrictions in the static host configuration. | Live `curl -I` checks; `/assets/index-E3uuyiGa.js` returns `cache-control: public, max-age=31536000, immutable`; root returns CSP and Permissions-Policy. |
| F-1-4 | Added `?demo=1` and `/demo`, a separate `demo:bike-service-receipts` database, realistic seeded service history, persistent banner, reset, and Start for real. | `@claim:demo-isolation`; `.factory/demo.md`; `.factory/evidence/live-demo-mobile.png`; <https://bike-service-receipts.sociobot.in/?demo=1>. |
| F-1-5 | Added `.factory/claims.json` with exactly one tagged observable test for each of 10 claims. Removed or rewrote unsupported copy. | All 10 manifest commands passed separately from the clean checkout; full suite 26/26. |
| F-1-6 | Added a product-styled app 404, static 404 document, and host response override that preserves HTTP 404. | `uses real route titles, shared navigation, focus restoration, and a styled 404`; `.factory/evidence/live-not-found-mobile.png`; <https://bike-service-receipts.sociobot.in/not-a-real-route> returns 404. |
| F-1-7 | One skip link, header, Home/Demo/Privacy/Terms navigation, footer one-liner, factory credit, and build ID now wrap landing, app, demo, legal, recovery, and 404 views. | Routing test; live crawl of `/`, `/demo`, `/privacy`, `/terms`, and unknown route. |
| F-1-8 | History navigation now renders the route, focuses its H1, and announces the loaded page in a polite live region; back/forward use the same route handler. | Routing test asserts H1 focus and announcement after Privacy and back navigation. |
| F-1-9 | Added route-specific descriptions, canonical links, Open Graph and Twitter fields, a product-art 1200×630 social image, and Apple touch icon. | Routing and `@claim:accessible-layout` tests; live head inspection; `public/assets/social-preview.jpg` is 1200×630. |
| F-1-10 | Replaced the metaphor headline and action with “Log bike service and costs” and “Create bike profile”; placed “Try it with sample data” beside it. | `@claim:accessible-layout`; `.factory/evidence/live-welcome-mobile.png`; live `/`. |
| F-1-11 | Replaced decorative lore with “Private bike maintenance log” and a literal description of the illustration. | `@claim:accessible-layout`; `.factory/copy-audit.md`; live `/`. |
| F-1-12 | Replaced the dense support paragraph with the required cyclist-specific sentence and kept each first-screen fact separate. | `@claim:accessible-layout`; `.factory/copy-audit.md`; live `/`. |
| F-1-13 | Split the README opening into short concrete sentences. | `README and catalog use the reviewed plain wording`; `.factory/copy-audit.md`. |
| F-1-14 | Replaced unexplained implementation and visual jargon with plain statements about reminders, offline use, keyboard controls, and phone layout. | README/catalog wording test; `.factory/copy-audit.md`. |
| F-1-15 | Removed internal registration language. Since the live Sociobot checkout reports no enabled product, the UI now says “Purchases not open” and offers existing-license restore without a dead link. | `@claim:plus-entitlements`; live `/?demo=1&view=data`; direct checkout probe returned 404 before the unavailable action was removed. |

## Final evidence

- Clean checkout: `npm ci`, 8 unit tests, production build, and 26 browser
  tests passed. Every claim command passed independently.
- Live browser run: 26 tests passed against
  <https://bike-service-receipts.sociobot.in>.
- Accessibility: axe found no serious or critical issues on the first screen,
  demo, Privacy, and 404 in both browser projects; final Lighthouse
  Accessibility is 100.
- Offline: `@claim:offline-reload` loaded the controlled PWA shell offline and
  saved a new sample receipt.
- Privacy: `@claim:local-privacy` observed no cross-origin request during the
  demo flow and found only the `demo:` database.
- Catalog description is verb-first and 95 characters.
