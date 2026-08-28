# Perfection loop round 3

Repaired candidate `871ba4f3c057a177c7a1f1665dc1b5fcf2d548c1` against all
findings in `review-1.md`, `review-2.md`, and `review-3.md`. The application
repair is commit `591bea4`; its catalog-test follow-up is `32a2fd1`.
Deployment `b0874965-19c1-46f4-8d17-98c71e84058b` was cold-checked at
<https://bike-service-receipts.sociobot.in>.

## Finding closure

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Retained full import validation, non-mutating rejection, and damaged-record recovery. | `rejects an incomplete import before writing and recovers a previously damaged database`; clean-clone suite 34/34. |
| F-1-2 | Retained the compact build and measured the deployed mobile path again. | `.factory/evidence/lighthouse-live-polish-3.json`: Performance 100, LCP 997 ms, CLS 0, TBT 0. |
| F-1-3 | Retained CSP, Permissions-Policy, Referrer-Policy, nosniff, frame restriction, and immutable hashed asset caching. | Live `curl -I /assets/index-CimKnQkY.js`: `max-age=31536000, immutable`; root headers checked after deployment. |
| F-1-4 / F-3-1 | Demo URLs now remove `license` before any storage write. The isolation test snapshots every non-demo local/session key and real database, exercises `?demo=1&license=DEMO_SENTINEL`, Reset demo, and Start for real. | `@claim:demo-isolation`; `.factory/evidence/polish-3-live/demo-isolated-mobile.png`; <https://bike-service-receipts.sociobot.in/?demo=1&license=DEMO_SENTINEL>. |
| F-1-5 / F-3-2 | Added the `license-verification-destination` manifest entry and fixture-backed browser test. It restores a real license and asserts the sole credential request is the documented Sociobot verification URL. | `@claim:license-verification-destination`; all 11 manifest commands passed independently in the clean clone. |
| F-3-3 | Removed unsupported checkout, merchant, tax, receipt, refund, and revocation statements. Privacy and Terms now say purchases are not open and existing licenses can be restored through Sociobot. | `@claim:plus-entitlements`, `@claim:license-verification-destination`; `.factory/evidence/polish-3-live/privacy-desktop.png`; `.factory/evidence/polish-3-live/terms-desktop.png`. |
| F-1-6 / F-2-1 | Retained the static 404 override and updated its plain error wording. | `@deployment:static-404 serves the complete missing-page document before JavaScript`; live HTTP 404 body at <https://bike-service-receipts.sociobot.in/not-a-real-route>; `.factory/evidence/polish-3-live/not-found-desktop.png`. |
| F-1-7 | Retained shared skip link, header, nav, footer, legal links, factory credit, and build ID across app, legal, demo, and error routes. | `uses real route titles, shared navigation, focus restoration, and a styled 404`; live 34-test suite. |
| F-1-8 | Retained History API navigation, H1 focus restoration, and polite route announcement. | `uses real route titles, shared navigation, focus restoration, and a styled 404`; live 34-test suite. |
| F-1-9 | Retained route-specific title, descriptions, canonical URLs, OG/Twitter fields, social image, and Apple touch icon. | `@claim:accessible-layout`, `@deployment:static-404`; `.factory/evidence/polish-3-live/verify.json`. |
| F-1-10 | Retained the direct job headline and result actions. | `@claim:accessible-layout`; `.factory/evidence/polish-3-live/welcome-mobile.png`. |
| F-1-11 | Retained literal private-log label and illustration caption. | `@claim:accessible-layout`; `.factory/copy-audit.md`; live welcome screenshot. |
| F-1-12 | Retained the cyclist-specific support sentence and separate first-screen facts. | `.factory/copy-audit.md`; `.factory/evidence/polish-3-live/welcome-mobile.png`. |
| F-1-13 | Retained the short README opening. | `README and catalog use the reviewed plain wording`; `.factory/copy-audit.md`. |
| F-1-14 | Retained plain README wording about reminders, offline use, keyboard paths, and phone layout. | `README and catalog use the reviewed plain wording`; `.factory/copy-audit.md`. |
| F-1-15 | Retained the honest closed-sales state and removed customer-irrelevant registration language. | `@claim:plus-entitlements`; live Terms screenshot. |
| F-3-4 | Added the required field-guide landing sequence: sample receipt preview, three-step workflow, explicit limitations, and free/Plus pricing. | `@claim:accessible-layout`; `.factory/evidence/polish-3-live/welcome-mobile.png`; live root. |
| F-3-5 | Replaced the export first-screen fact with the required price fact. Export formats remain visible in the sample receipt preview. | `@claim:plus-entitlements`, `@claim:exports`; live welcome screenshot. |
| F-3-6 | Renamed the README section to **Bike service features**. | `README and catalog use the reviewed plain wording`; `.factory/copy-audit.md`. |
| F-3-7 | Kept the required action wording and changed the adjacent note to use **demo**, the one product term. | `@claim:accessible-layout`; `.factory/copy-audit.md`; live welcome screenshot. |
| F-3-8 | Rewrote both static and SPA error views as **Error 404 / Bike service page not found / Open Bike Service Receipts**. | Static-404 deployment test; live 404 body check; live error screenshot. |
| F-3-9 | Removed `/404` from the sitemap and added a sitemap regression test. | `sitemap lists only canonical indexable routes`; live sitemap saved at `.factory/evidence/polish-3-live/sitemap.xml`. |

## Verification

- Fresh clone `/tmp/bike-service-receipts-clean-final-13Uo2r`: `npm ci` (0 vulnerabilities), `npm test` (8/8), and `npm run build` passed. The build created `dist/index.html`.
- Every exact command in `.factory/claims.json` passed independently from that clone in desktop Chromium and Pixel 5: 11 claims × 2 projects. The complete local browser suite passed 34/34.
- The same full suite against the deployed URL passed 34/34. It covers demo isolation, receipt save/search/delete, reminders, CSV/PDF/JSON export, import recovery, offline reload, privacy request logging, free/Plus behavior, license request destination, routes, metadata, focus, axe serious/critical checks, reduced motion, and 390 px overflow.
- `verify-url.sh` against production recorded no console/page errors, title, `lang=en`, one H1, a main landmark, no missing image alt, and no unlabeled buttons in `.factory/evidence/polish-3-live/verify.json`.
- Live Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 997 ms, CLS 0, TBT 0.
- Build budget: JavaScript 56.25 KB raw / 17.75 KB gzip; CSS 25.82 KB raw / 6.27 KB gzip. The mobile AVIF hero remains 29 KB.

No review finding remains unresolved.
