# Adversarial first-read review 1 — Bike Service Receipts

Reviewed 2026-08-28 against `https://bike-service-receipts.sociobot.in`.

## Verdict: FAIL

Fresh Chromium contexts at 390×844 and 1440×1000 showed the same initial
screen. Before scrolling, I understood this as a bicycle-maintenance log for
people who maintain a bike, and inferred that I should name a bike and click
“Start this bike’s field log”. The supporting paragraph, rather than the
headline, made that possible. There was no safe try-out action: the sole
action creates real persistent data.

Exact first-screen text: “PRIVATE · OFFLINE · YOURS”; “Remember every
service. Tend what comes next.”; “Keep evidence-backed maintenance receipts
for each bike—what happened, what it cost, and when to look again. No account
needed.”; and “Start this bike’s field log”.

## Findings

### F-1-1 — BLOCKING — incomplete JSON import persists and prevents later reload (prior finding, confirmed)

Location: Data & Plus import; `src/db.ts:80-90`, `src/main.ts:88-91`.

The earlier verification finding remains live. In a fresh mobile context, I
created “Real bike”, selected this validator-accepted merge file, received
`Cannot read properties of undefined (reading 'localeCompare')`, then
reloaded:

```json
{"version":1,"exportedAt":"x","bikes":[{"id":"poison","name":"Poison"}],"receipts":[],"reminders":[]}
```

The app then showed only “THE FIELD LOG COULD NOT OPEN / Your records were
not changed.” The invalid record had already been written. The validator only
checks ID/name/relationships; `loadState()` later sorts missing
`createdAt`.

Fix: validate all required fields and types before a write transaction, add a
recovery path for already-poisoned data, and test that rejected imports leave
IndexedDB unchanged.

### F-1-2 — BLOCKING — live mobile performance failure has no correction/retest (prior finding, confirmed)

Location: `.factory/verification.md`.

The prior independent live measurement was Performance 86, below the recorded
90 threshold. The current live page serves the same
`index-nxiVHqJA.js`/ `index-vSJobdJG.css` artifact produced by this
checkout, and no corrective deploy or fresh passing result exists. A fresh
Lighthouse attempt in this container could not complete because supplied
Chromium closed its CDP connection; this review does not invent a replacement
score.

Fix: deploy a measured improvement and attach a new fresh mobile Lighthouse
result meeting the acceptance threshold.

### F-1-3 — BLOCKING — deployment cache/security-header finding remains live (prior finding, confirmed)

Location: response headers for the live root and assets.

The live target still returns `Cache-Control: public, must-revalidate,
max-age=30` and sends no `Content-Security-Policy` or
`Permissions-Policy` header. This confirms the earlier deployment finding
is not fixed.

Fix: deploy immutable long-lived caching for hashed assets and the required
response security headers, then record the live header test.

### F-1-4 — BLOCKING — no one-click isolated sample demo

Location: landing screen, `/demo`, `?demo=1`, and `src/main.ts`.

No landing action says “Try it with sample data”. `/demo` is only the SPA
fallback and `?demo=1` is ignored. After creating “Real bike” in normal
mode, opening `?demo=1` displayed that real bike; browser state contained
localStorage `selectedBikeId` and IndexedDB database
`bike-service-receipts`. There was no “Demo — sample data, nothing is
saved” banner and no Reset demo control.

Fix: implement `/demo` and `?demo=1` with realistic seeded bikes,
receipts, costs, odometers, reminders, and exports already visible. Keep it
in a separate `demo:` namespace, never read/write real storage, add Reset
demo/Start for real, document it in `.factory/demo.md`, and test isolation.

### F-1-5 — BLOCKING — every visible claim is unlisted and untested

Location: repository root; `.factory/claims.json` is absent.

There were no listed claim-test commands to run from the clean install.
`npm test` (6/6), `npm run build`, and `npm run test:e2e` (8/8) pass,
but none has an `@claim:` tag or starts with demo data. Each distinct
claim-like sentence in the landing and README audit below is therefore an
unlisted-claim finding, including “No account needed.”, “Works without a
connection”, “Exports CSV, PDF, and JSON”, “No tracking or cloud account”,
the feature list, price/entitlement statements, and data/privacy statements.

Fix: add a claim manifest and one clean-demo `@claim:<id>` observable test
per claim. Test offline reload, actual exports, request origins, storage,
imports, and paid entitlement; remove claims that cannot be tested.

### F-1-6 — BLOCKING — unknown paths silently show the landing page, not a designed 404

Location: `/not-a-real-route`; `src/main.ts:505-509`.

Direct navigation to the unknown URL returned the landing title and H1
“Remember every service. Tend what comes next.” There is no missing-page
message or return action. Only Privacy and Terms have route handling.

Fix: provide a product-styled 404 route/document with a home action, configure
the host response override, and test direct navigation and reload.

### F-1-7 — MAJOR — welcome/legal routes lack the standard header/footer and navigation

Location: `renderWelcome()` and `renderLegal()` in `src/main.ts`.

The welcome route has no wordmark/header/nav or complete footer. Legal routes
also lack the skip link and the required product one-liner, “Built by Param
Factory”, and version/build ID. A cold visitor has no Demo or product-section
navigation.

Fix: use one header, skip link, Home/Demo/Privacy/Terms nav, and complete
footer across landing, app, demo, legal, and 404 routes.

### F-1-8 — MAJOR — SPA navigation leaves focus on body

Location: landing Privacy link and `renderLegal()`.

Clicking “privacy” changed title and URL but left focus on `BODY`, not the
new H1. Back returned to the welcome screen but no route-change live
announcement exists.

Fix: focus the new H1 (with `tabindex="-1"`) and announce route changes
after link, back, and forward navigation; add a keyboard regression test.

### F-1-9 — MINOR — required metadata is incomplete

Location: live `<head>` / `index.html`.

Root has a good title, description, lang, one H1, main, and SVG favicon, but
there is no canonical URL, Open Graph/Twitter metadata or 1200×630 image, or
apple-touch icon. Privacy and Terms retain root meta description.

Fix: add canonical, OG/Twitter title/description/image and apple-touch icon;
update route metadata on navigation.

### F-1-10 — MAJOR — first-screen headline and button do not name the job/result

Location: “Remember every service.”, “Tend what comes next.”, and “Start this
bike’s field log”.

The H1 is a mood/metaphor heading, not a bike service-record job. “Field log”
is product lore and the button does not name the result.

Fix: H1 “Log bike service and costs”; support line “For cyclists who want each
bike’s service history and next reminder in one place.”; button “Create bike
profile”; add the sample-demo action from F-1-4 beside it.

### F-1-11 — MINOR — decorative labels carry no action or product information

Location: “PRIVATE · OFFLINE · YOURS” and “Plate I · A service history starts
with one observation.”

These are a slogan and a metaphor, not useful first-read copy.

Fix: “Private bike maintenance log” and “Illustration of a commuter bike and
the tools recorded in a service receipt.”

### F-1-12 — MINOR — landing support copy is dense and omits the audience

Location: “Keep evidence-backed maintenance receipts for each bike—what
happened, what it cost, and when to look again. No account needed.”

It packs several concepts into one sentence and never says “cyclists”.

Fix: “For cyclists who maintain one or more bikes. Record the service, cost,
and date, then see the next reminder.”

### F-1-13 — MINOR — README opening sentence exceeds 22 words

Location: README: “It records what happened to each bike, when it happened,
what it cost, the odometer reading, supporting notes or a photo, and the rule
behind the next reminder.” (28 words).

Fix: “Record the service, date, cost, odometer, notes, and optional photo for
each bike. Set the next reminder from the service you logged.”

### F-1-14 — MINOR — README uses unexplained jargon

Location: “Rule-based … backed by”, “PWA shell and IndexedDB”, and “botanical
field-guide treatment”.

Fix: “Reminders based on the last service date or odometer reading.” “Install
the app and keep records available offline.” “A light and dark interface that
works with keyboard controls and on a 390 px phone.”

### F-1-15 — MINOR — README exposes internal factory process

Location: “the factory registers the product separately.”

This tells a customer nothing useful.

Fix: “Checkout and license verification use Sociobot.” If unavailable, state
the customer-visible availability rather than internal process.

## Copy audit

Counts treat a hyphenated compound as one word. All testable claims listed
below are unlisted under F-1-5.

### Landing

| Copy | Words | Check |
| --- | ---: | --- |
| Private · offline · yours | 3 | F-1-11; privacy/offline claims |
| Remember every service. | 3 | F-1-10 |
| Tend what comes next. | 5 | F-1-10 |
| Keep evidence-backed maintenance receipts for each bike—what happened, what it cost, and when to look again. | 16 | F-1-12 |
| No account needed. | 3 | claim |
| Name your first bike | 4 | clear label |
| This is how it will appear on every receipt. | 10 | clear help |
| Type | 1 | clear label |
| Start this bike’s field log | 6 | F-1-10 |
| Works without a connection | 4 | claim |
| Exports CSV, PDF, and JSON | 5 | claim |
| No tracking or cloud account | 5 | claim |
| Plate I · A service history starts with one observation. | 10 | F-1-11 |
| By continuing you accept the terms. | 5 | clear legal notice |
| See how your local data is handled in privacy. | 10 | clear route help |
| The field-guide illustration was generated with AI for this product. | 10 | useful provenance; use “product illustration” consistently |

### README

| Copy | Words | Check |
| --- | ---: | --- |
| Bike Service Receipts | 3 | repository title |
| Bike Service Receipts is a private, offline-first maintenance log for everyday cyclists. | 12 | claim |
| It records what happened to each bike, when it happened, what it cost, the odometer reading, supporting notes or a photo, and the rule behind the next reminder. | 28 | F-1-13 |
| What v1 includes | 3 | clear heading |
| Named bike profiles with type, year, identifier, and current odometer | 10 | claim |
| Fast service receipts with component, action, date, cost/currency, provider, notes, odometer, and optional compressed photo | 16 | “Fast” unmeasured; claim |
| Per-bike recent work, searchable full history, and explicit deletion | 9 | claim |
| Rule-based month and mileage reminders backed by the most recent receipt | 11 | F-1-14 |
| CSV and PDF history exports plus full-fidelity JSON backup/merge/restore | 9 | “full-fidelity” jargon; claim |
| Installable PWA shell and IndexedDB records that continue to work offline | 11 | F-1-14 |
| Light/dark botanical field-guide treatment, keyboard paths, reduced motion, and 390 px mobile layout | 14 | F-1-14 |
| Local-only data by default, with no account, analytics, third-party scripts, or hosted fonts | 13 | claim |
| The free version supports one bike, unlimited text receipts, default reminder rules, and every export. | 14 | claim |
| Field Guide Plus is a ₹499 one-time license that adds unlimited bikes, compressed photo evidence, and custom reminder intervals. | 19 | claim |
| Checkout and license verification use only the Sociobot billing API; the factory registers the product separately. | 14 | F-1-15 |
| Reminders are informational records, not mechanical diagnosis or safety certification. | 10 | useful limitation |
| Requirements: Node.js 20+ and npm. | 5 | clear developer requirement |
| Vite prints the local development URL. | 6 | developer statement |
| No environment variables or backend are required for the free/local product. | 10 | claim |
| The exact production build command is npm run build. | 9 | clear instruction |
| It type-checks the application and writes the static deployment to ./dist, with dist/index.html at its root. | 17 | clear instruction |
| End-to-end tests use Playwright 1.58.2 and start a production preview automatically; the factory image already provides its Chromium build. | 21 | replace “factory image” with “supplied environment” |
| To inspect the build manually: | 6 | clear instruction fragment |
| Bike, receipt, reminder, and photo data is stored in IndexedDB named bike-service-receipts. | 11 | privacy claim |
| The optional license token is stored under sb_license:bike-service-receipts in localStorage, and its verdict is rechecked at most daily. | 17 | privacy claim |
| The only runtime network request beyond loading the app is license verification when a token exists. | 15 | network/privacy claim |
| JSON export is the complete device backup. | 7 | claim |
| CSV and PDF are human-readable receipt histories. | 7 | claim |
| Clearing browser site data or uninstalling without a JSON backup can remove local records. | 12 | useful limitation |
| See /privacy and /terms for details. | 6 | clear route help |

## Demo, claims, history, and structure result

Demo: **failed**. No entry point, sample, banner, reset, or isolation exists.
The fresh free welcome flow made only same-origin requests, but that is not a
complete privacy/offline claim test and it cannot prove demo isolation.

Claims: **failed**. No `.factory/claims.json` exists. From a clean dependency
install, `npm test` passed 6 tests, build produced `dist/`, and e2e passed
8 tests; no listed claim command existed.

History: no earlier `review-*.md` or `polish-*.md` exists. I read the
earlier handoff and verification reports. Their import, performance, and
deployment-header findings are F-1-1 through F-1-3 above and remain open.

Structure: robots and sitemap exist, and the visual identity is distinct rather
than a generic SaaS template. The sitemap omits demo/404; welcome/legal
skeleton, route focus, metadata, and 404 fail as described above.

## Missed leverage

The brief does not call for AI; adding decorative AI would not help. The
obvious missing leverage is a demo whose realistic sample can itself be
exported to CSV/PDF/JSON, so a visitor can prove the core job without risking
personal data.

## What would make this perfect

Repair and recover from invalid imports; deliver an isolated seeded demo;
write and run claim tests for every remaining promise; replace the
mood-first onboarding copy with job/result language; complete navigation,
404, metadata, focus, and headers; then retest the deployed site, including a
fresh mobile Lighthouse measurement. Only then is it safe, clear, and honest
for a first-time visitor.
