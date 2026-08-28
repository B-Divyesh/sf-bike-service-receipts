# Perfection loop round 2

Repaired candidate `02681482d2e35193336abd0dc006da6ba9b5a5b4` against the cumulative review at `2deb565d442d05726861945da7520668dc934802`. This round re-read `review-1.md`, `polish-1.md`, `review-2.md`, the brief, design thesis, claim manifest, demo contract, copy audit, and prior verification. Implementation commit: `a5273ac7aac566040cb1689d2a802f522966ce9c`.

## Finding closure

| Finding | Change made or retained | Evidence: test, screenshot, and live check |
| --- | --- | --- |
| F-1-1 | Retained complete field/type validation before imports write, rejection without mutation, and recovery that removes only damaged records. | `rejects an incomplete import before writing and recovers a previously damaged database` passed in the clean clone and live suite; `.factory/evidence/live-recovery-mobile.png`; live demo/data flow at <https://bike-service-receipts.sociobot.in/?demo=1&view=data>. |
| F-1-2 | Retained the compact production bundle and measured the new deployment again. | `npm run build`; `.factory/evidence/lighthouse-live-polish-2.json`: Performance 98, LCP 1.1 s, CLS 0, TBT 170 ms; `.factory/evidence/polish-2-live/screenshot-mobile.png`; live root. |
| F-1-3 | Retained long-lived immutable hashed assets and response security policy. | Live `curl -I /assets/index-DOdTU8GJ.js`: `max-age=31536000, immutable`, CSP, Permissions-Policy, Referrer-Policy, nosniff; `.factory/evidence/polish-2-live/screenshot-desktop.png`; live root and asset URL. |
| F-1-4 | Retained one-click `?demo=1` and `/demo`, separate demo IndexedDB/localStorage, seeded records, persistent banner, Reset demo, and Start for real. | `@claim:demo-isolation` passed independently in the clean clone and in the live 30-test suite; `.factory/evidence/polish-2-live-demo-mobile.png`; <https://bike-service-receipts.sociobot.in/?demo=1>. |
| F-1-5 | Retained `.factory/claims.json` with ten distinct observable claim tests. Each exact manifest command passed separately from the clean clone on desktop and mobile. | All `@claim:*` tests below; `.factory/evidence/polish-2-live-demo-mobile.png`; the same claim suite passed against the live demo URL. |
| F-1-6 | Completed the prior 404 repair by removing the catch-all SPA fallback. Unknown requests now reach the 404 response override and receive `404.html` with status 404. | `@deployment:static-404 serves the complete missing-page document before JavaScript` and `static host sends only known app routes to the SPA shell`; `.factory/evidence/polish-2-live-404-mobile.png`; <https://bike-service-receipts.sociobot.in/not-a-real-route>. |
| F-1-7 | Retained the shared skip link, header, Home/Demo/Privacy/Terms navigation, full footer, factory credit, and build ID across all views; static 404 now reports build `polish-2`. | `uses real route titles, shared navigation, focus restoration, and a styled 404`; `.factory/evidence/polish-2-live-privacy-desktop.png`; live `/`, `/demo`, `/privacy`, `/terms`, and unknown route. |
| F-1-8 | Retained History API navigation, H1 focus, polite route announcement, and back/forward restoration. | `uses real route titles, shared navigation, focus restoration, and a styled 404`; `.factory/evidence/polish-2-live-privacy-desktop.png`; <https://bike-service-receipts.sociobot.in/privacy>. |
| F-1-9 | Retained route metadata and added the full description, canonical `/404`, Open Graph/Twitter fields, social image dimensions, and Apple-touch icon to the static 404 document. | `@deployment:static-404 serves the complete missing-page document before JavaScript` plus `@claim:accessible-layout`; `.factory/evidence/polish-2-live-404-desktop.png`; live unknown URL with JavaScript disabled. |
| F-1-10 | Retained the job headline “Log bike service and costs,” the result action “Create bike profile,” and adjacent sample action. | `@claim:accessible-layout`; `.factory/evidence/polish-2-live/screenshot-mobile.png`; <https://bike-service-receipts.sociobot.in/>. |
| F-1-11 | Retained the literal label “Private bike maintenance log” and informative illustration caption. | `@claim:accessible-layout`; `.factory/evidence/polish-2-live/screenshot-mobile.png`; live root. |
| F-1-12 | Retained the cyclist-specific 14-word support sentence and three separate facts. | `README and catalog use the reviewed plain wording` plus `@claim:accessible-layout`; `.factory/evidence/polish-2-live/screenshot-mobile.png`; live root. |
| F-1-13 | Retained the short two-sentence README opening. | `README and catalog use the reviewed plain wording`; `.factory/evidence/polish-2-live/screenshot-desktop.png`; live root wording matches the README terminology. |
| F-1-14 | Retained plain descriptions of reminders, offline use, keyboard support, and phone layout. | `README and catalog use the reviewed plain wording` and `@claim:accessible-layout`; `.factory/evidence/polish-2-live-demo-mobile.png`; live demo at 390 px. |
| F-1-15 | Retained the customer-facing “Purchases not open” state and existing-license restore; no internal factory-registration wording remains. | `@claim:plus-entitlements` and `README and catalog use the reviewed plain wording`; `.factory/evidence/polish-2-live-demo-mobile.png`; live demo Data & Plus view. |
| F-2-1 | Removed `navigationFallback`, kept explicit SPA rewrites for only `/`, `/demo`, `/privacy`, and `/terms`, and routed the wildcard 404 through `responseOverrides` to the complete static document. The service worker now caches only successful HTML navigation responses, so a 404 cannot replace the offline shell. | Live HTTP 404 body assertions in `@deployment:static-404`; strengthened `@claim:offline-reload` visits a 404 and then reopens `/demo` offline; `.factory/evidence/polish-2-live-404-desktop.png`; live unknown URL returned 404 with the missing-page title, H1, canonical, and return link before JavaScript. |

## Claim evidence

Every exact `test` command in `.factory/claims.json` ran separately from fresh clone `/tmp/bike-service-receipts-clean-zivIQr` at `a5273ac7aac566040cb1689d2a802f522966ce9c`. Each produced two passes, one per browser project.

| Claim id | Observable result |
| --- | --- |
| `demo-isolation` | Real records survived demo edits/reset; demo storage stayed separate. |
| `service-records` | A receipt was saved, found by note text, and deleted. |
| `reminders` | Seeded and custom date/odometer reminders appeared. |
| `exports` | CSV, PDF, and JSON downloads contained the seeded records. |
| `backup-restore` | Complete JSON merged, replaced, and survived reload. |
| `offline-reload` | The controlled demo saved offline and reopened after an online 404 visit. |
| `local-privacy` | The save opened only `demo:bike-service-receipts` and made no cross-origin request. |
| `plus-entitlements` | Multiple bikes, compressed photo storage, custom rules, honest closed sales, and license restore worked. |
| `free-entitlements` | One-bike limit, text receipts, default reminders, and all exports remained available. |
| `accessible-layout` | Axe found no serious/critical issue; focus, dark/reduced-motion state, and 390 px overflow checks passed. |

## Final verification

- Clean clone: `npm ci` reported zero vulnerabilities; `npm test` passed 8/8; `npm run build` produced `dist/index.html`; every claim command passed independently; full browser suite passed 30/30.
- Live deployment: Azure Static Web Apps deployment `b3dedda3-4d17-4c3c-a390-afd0f67712b2`; full live browser suite passed 30/30.
- Cold 404: HTTP 404, 2,633-byte `404.html` body, correct no-JavaScript metadata/H1/link, and dedicated test 2/2.
- Accessibility/browser smoke: `.factory/evidence/polish-2-live/verify.json` records one H1, main landmark, no missing alt text, no unlabeled buttons, and zero console/page errors on root.
- Lighthouse mobile: 98 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1.1 s, CLS 0, TBT 170 ms.
- Budgets: initial JS 53,818 bytes raw / 17.25 KB gzip; CSS 22,259 bytes raw / 5.70 KB gzip; mobile AVIF hero 29,229 bytes; no font payload.
- Catalog: `.factory/catalog-description.txt` is verb-first, 85 characters, and covered in `.factory/copy-audit.md`.

No review finding remains unresolved.
