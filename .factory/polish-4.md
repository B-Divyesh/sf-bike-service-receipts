# Perfection loop round 4

Repaired candidate `9572a3c2ebcd5f69d12888ffcd1cf1fc90ca7293`
against the cumulative report at
`ff1e1fc9f773a202fd62ea68ab89209302c3ee0a`. Every finding in
`review-1.md` through `review-4.md` and every earlier polish report was read
and checked again. The implementation repair is commit `b745551`; static
deployment `06e33265-c73f-4b4b-bec2-7e8cd9a76f4c` was cold-checked at
<https://bike-service-receipts.sociobot.in>.

## Finding closure

| Finding | Change made or retained | Evidence: test, screenshot, and live URL check |
| --- | --- | --- |
| F-1-1 | Retained complete import validation before writes, non-mutating rejection, and removal of only damaged stored records. | `rejects an incomplete import before writing and recovers a previously damaged database`; `.factory/evidence/polish-4-live/recovery-mobile.png`; production data/recovery flow at `/?demo=1&view=data`. |
| F-1-2 | Retained the compact bundle and measured the round-4 deployment with a cold mobile Lighthouse run. | `.factory/evidence/lighthouse-live-polish-4.json`: Performance 100, LCP 1.2 s, TBT 60 ms, CLS 0; `.factory/evidence/polish-4-live/welcome-mobile.png`; live root. |
| F-1-3 | Retained CSP, Permissions-Policy, Referrer-Policy, nosniff, frame protection, and immutable hashed-asset caching. | Deployment header checks in `.factory/evidence/polish-4-live/root-headers.txt` and `asset-headers.txt`; `.factory/evidence/polish-4-live/welcome-mobile.png`; the live `index-DcZof83_.js` is immutable for one year and matches the local SHA-256 exactly. |
| F-1-4 | Retained one-click `?demo=1` and `/demo`, seeded records, separate storage, the persistent demo banner, Reset demo, and Start for real. | `@claim:demo-isolation`; `.factory/evidence/polish-4-live/demo-isolated-mobile.png`; live `/?demo=1&license=DEMO_SENTINEL` removes the credential parameter without touching real storage. |
| F-1-5 | Expanded the claim manifest to 12 entries. Every visible behavioral claim now has exactly one tagged observable test. | All 12 exact `.factory/claims.json` commands passed independently in the clean clone and within the 36/36 live suite; `.factory/evidence/polish-4-live/photo-limit-error-mobile.png`; live demo. |
| F-1-6 | Retained the styled application and static 404 documents with the host response override. | `@deployment:static-404 serves the complete missing-page document before JavaScript`; `.factory/evidence/polish-4-live/not-found-desktop.png`; `/not-a-real-route` returns HTTP 404 and the 2,631-byte error document. |
| F-1-7 | Retained one shared skip link, header, Home/Demo/Privacy/Terms navigation, complete footer, factory credit, and round-4 build ID. | `uses real route titles, shared navigation, focus restoration, and a styled 404`; `.factory/evidence/polish-4-live/privacy-desktop.png`; live root, demo, Privacy, Terms, and 404. |
| F-1-8 | Retained History API navigation, H1 focus on navigation and Back, and the polite route announcement. | Route/focus test above; `.factory/evidence/polish-4-live/privacy-desktop.png`; live `/privacy` and browser Back in the production suite. |
| F-1-9 | Retained route-specific title, description, canonical, Open Graph/Twitter fields, social image, favicon, and Apple touch icon. | `@claim:accessible-layout`, `@deployment:static-404`, and `.factory/evidence/polish-4-live/route-link-audit.json`; `.factory/evidence/polish-4-live/privacy-desktop.png`; all five live route checks. |
| F-1-10 | Retained the job-first H1 “Log bike service and costs” and result actions “Create bike profile” and “Try it with sample data.” | `@claim:accessible-layout`; `.factory/evidence/polish-4-live/welcome-mobile.png`; live root cold at 390 px. |
| F-1-11 | Retained the literal private-log label and informative commuter-bike illustration caption. | `@claim:accessible-layout`; `.factory/evidence/polish-4-live/welcome-mobile.png`; live root. |
| F-1-12 | Retained the short cyclist-specific audience and outcome sentence, with separate offline, privacy, and price facts. | `@claim:accessible-layout`; `.factory/copy-audit.md`; `.factory/evidence/polish-4-live/welcome-mobile.png`; live root. |
| F-1-13 | Retained the short two-sentence README opening and concrete feature wording. | `README and catalog use the reviewed plain wording`; `.factory/copy-audit.md`; the same product terms are visible in `.factory/evidence/polish-4-live/welcome-mobile.png` and live root. |
| F-1-14 | Retained plain descriptions of reminders, offline use, keyboard support, and the 390 px layout. | README/catalog test and `@claim:accessible-layout`; `.factory/evidence/polish-4-live/demo-isolated-mobile.png`; live demo at 390 px. |
| F-1-15 | Retained customer-facing closed-sales wording and existing-license restore without internal registration language. | `@claim:plus-entitlements`; `.factory/evidence/polish-4-live/terms-desktop.png`; live `/terms` and demo Data & Plus. |
| F-2-1 | Retained explicit rewrites only for known SPA routes and the complete no-JavaScript 404 override. | Static-host configuration and deployment 404 tests; `.factory/evidence/polish-4-live/unknown.html` and `not-found-desktop.png`; live unknown path returned 404 before JavaScript. |
| F-3-1 | Retained early removal of a demo URL’s `license` parameter and exhaustive real-key/database snapshots through reset and exit. | `@claim:demo-isolation`; `.factory/evidence/polish-4-live/demo-isolated-mobile.png`; live demo credential URL. |
| F-3-2 | Retained the fixture-backed test that asserts the only credential request is the documented Sociobot verification URL. | `@claim:license-verification-destination`; `.factory/evidence/polish-4-live/privacy-desktop.png`; live `/privacy` copy. |
| F-3-3 | Retained the removal of unsupported merchant, tax, receipt, refund, and revocation promises while purchasing is closed. | `@claim:plus-entitlements` and `@claim:license-verification-destination`; live `privacy-desktop.png` and `terms-desktop.png`; `/privacy` and `/terms`. |
| F-3-4 | Retained the product preview, three-step workflow, limits/privacy section, and free/Plus pricing in the botanical landing sequence. | `@claim:accessible-layout`; `.factory/evidence/polish-4-live/welcome-mobile.png`; live root. |
| F-3-5 | Retained the required first-screen offline, local-storage, and exact price facts. | `@claim:offline-reload`, `@claim:local-privacy`, and `@claim:plus-entitlements`; `.factory/evidence/polish-4-live/welcome-mobile.png`; live root. |
| F-3-6 | Retained the README heading “Bike service features.” | `README and catalog use the reviewed plain wording`; `.factory/copy-audit.md`; `.factory/evidence/polish-4-live/welcome-mobile.png`; live root uses the same bike-service terminology. |
| F-3-7 | Retained “demo” as the single term around the required “Try it with sample data” action. | `@claim:accessible-layout`; `.factory/evidence/polish-4-live/welcome-mobile.png`; live root and `/demo`. |
| F-3-8 | Retained direct static and SPA wording: “Error 404,” “Bike service page not found,” and “Open Bike Service Receipts.” | Both 404 tests; `.factory/evidence/polish-4-live/not-found-desktop.png`; live unknown URL. |
| F-3-9 | Retained a sitemap containing only `/`, `/demo`, `/privacy`, and `/terms`. | `sitemap lists only canonical indexable routes`; `.factory/evidence/polish-4-live/route-link-audit.json` and `.factory/evidence/polish-4-live/welcome-mobile.png`; live `/sitemap.xml`. |
| F-4-1 | Added `photo-source-limit` to `.factory/claims.json`. Its demo test rejects 10,000,001 bytes with the promised error and no receipt/reminder write, then accepts a valid image padded to exactly 10,000,000 bytes and saves one receipt. The source limit is a shared constant. | `@claim:photo-source-limit` passed independently in both clean-clone projects and in the live suite; `.factory/evidence/polish-4-live/photo-limit-error-mobile.png`; live `/?demo=1` service form. |

## Verification

- Clean clone `/tmp/bike-polish4-clean-0YPwmE` at `b745551`: `npm ci`
  reported zero vulnerabilities; `npm test` passed 8/8; `npm run build`
  created `dist/index.html`.
- Every exact claim command ran separately from that clean clone. All 12
  claims passed in desktop Chromium and Pixel 5, including the new two-sided
  photo boundary. The final clean-clone suite passed 36/36.
- The deployed suite passed 36/36. It covers demo isolation, service records,
  reminders, exports, backup/restore, offline reload, request privacy, free and
  Plus behavior, photo size, license destination, recovery, routing, focus,
  metadata, 404 behavior, sitemap, Axe, reduced motion, and mobile overflow.
- `/opt/fleet/lib/verify-url.sh` reported zero console/page errors, `lang=en`,
  one H1, a main landmark, no missing alt text, and no unlabeled button.
  Evidence: `.factory/evidence/polish-4-live/verify.json`.
- Live route/link audit found zero console errors on valid routes and 200 for
  every discovered intentional link. The error route returned its intentional
  404 response with complete metadata.
- Lighthouse mobile: 100 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; FCP 1.0 s, LCP 1.2 s, TBT 60 ms, CLS 0, 66 KiB transferred.
- Build budgets: JavaScript 56,259 bytes raw / 17,638 gzip; CSS 25,817 bytes
  raw / 6,284 gzip; mobile AVIF hero 29,229 bytes.
- The catalog sentence is verb-first and 84 characters.

No finding of any severity remains unresolved.
