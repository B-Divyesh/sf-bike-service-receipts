# Adversarial first-read review 5 — Bike Service Receipts

Reviewed 2026-08-29 against <https://bike-service-receipts.sociobot.in> from
fresh Chromium contexts at 390 × 844 and 1440 × 900, plus a clean checkout at
`09d49e7ad3f8fb4f478ea83c3fc7558419ece038`.

## Verdict: PASS

There are no findings. The cold first screen names the job, audience, and
first action; the one-click demo is visibly separate and seeded; every listed
claim test passes; and the live deployment, routes, metadata, links,
accessibility, and privacy behavior match the product contract.

## Cold first screen

Before scrolling, both viewports answered all three questions.

| Question | Answer from the first screen |
| --- | --- |
| What does it do? | It logs bike service and costs, and keeps the next reminder with each bike. |
| For whom? | “For cyclists who want each bike’s service history and next reminder in one place.” |
| What should I click first? | “Try it with sample data” for the safe preview, or “Create bike profile” for a personal record. |

The exact H1 is **“Log bike service and costs”**. At 390 px, the demo action
(354 × 45 px), real-data action, and all three facts are visible without
scrolling. The same controls are visible on desktop. No console errors
occurred during either cold load.

## Copy audit

Counts treat hyphenated compounds, dates, currencies, product names, and
version labels as one word. The inventory includes all meaningful landing and
README copy; select options, URLs, code blocks, and repeated icon glyphs are
not sentences. No sentence exceeds 22 words. No banned marketing term,
unexplained jargon, mood heading, inconsistent product term, or non-result
button was found. The product uses **bike**, **service receipt**,
**reminder**, **records**, **demo**, and **JSON backup** consistently.

### Landing page

| Copy | Words | Check |
| --- | ---: | --- |
| Bike Service Receipts | 3 | Clear wordmark |
| Home | 1 | Clear navigation |
| Demo | 1 | Clear navigation |
| Privacy | 1 | Clear navigation |
| Terms | 1 | Clear navigation |
| Private bike maintenance log | 4 | Concrete label |
| Log bike service and costs | 6 | Job-first H1 |
| For cyclists who want each bike’s service history and next reminder in one place. | 14 | Names audience and outcome |
| Name your first bike | 4 | Clear field label |
| This is how it will appear on every receipt. | 9 | Useful instruction |
| Type | 1 | Clear field label |
| Create bike profile | 3 | Result-naming action |
| Try it with sample data | 5 | Result-naming demo action |
| Create your own bike profile, or open the demo. | 9 | Explains the choice |
| Works offline after your first visit | 6 | Claim `offline-reload` |
| Stores records on this device | 5 | Claim `local-privacy` |
| Free for one bike; Plus ₹499 once sales open | 9 | Claim `plus-entitlements` |
| Illustration of a commuter bike and the tools recorded in a service receipt. | 13 | Useful caption |
| Sample service receipt | 3 | Preview label |
| See the record before you start | 7 | Clear preview heading |
| Open the demo to browse two bikes, four receipts, and reminders already due or planned. | 15 | Claim `demo-isolation` |
| Open the demo | 3 | Result-naming action |
| Fern commuter | 2 | Realistic sample bike |
| Recorded 21 Aug 2026 | 4 | Useful sample metadata |
| Chain · lubricated | 2 | Useful sample metadata |
| Cleaned after rain | 4 | Sample receipt title |
| Dry-weather lube applied at 4,860 km. Self-recorded. | 7 | Useful sample detail |
| Cost | 1 | Clear label |
| Next | 1 | Clear label |
| Export | 1 | Clear label |
| CSV, PDF, JSON | 3 | Claim `exports` |
| Three steps | 2 | Workflow label |
| How bike service records work | 5 | Concrete workflow heading |
| Name your bike | 3 | Verb-led step |
| Start with a bike name, then keep its work together. | 11 | Useful instruction |
| Log the work | 3 | Verb-led step |
| Add the service, date, cost, odometer, notes, and optional photo. | 10 | Claim `service-records` |
| Check the next reminder | 4 | Verb-led step |
| See date and distance reminders from the service records you entered. | 11 | Claim `reminders` |
| Limits and privacy | 3 | Clear section label |
| What the app does not do | 6 | Concrete limits heading |
| Reminders use values you enter. They do not diagnose problems or certify bike safety. | 14 | Claim `reminders` |
| Browser data can be cleared. Export a JSON backup to keep a copy. | 13 | Useful limitation and action |
| One-time upgrade | 2 | Clear pricing label |
| Free and Field Guide Plus | 5 | Concrete pricing heading |
| Free log | 2 | Clear tier heading |
| One bike, text receipts, default reminders, and every export. | 9 | Claim `free-entitlements` |
| Field Guide Plus · ₹499 once | 5 | Claim `plus-entitlements` |
| Add multiple bikes, compressed photos, and custom reminders when sales open. | 11 | Claim `plus-entitlements` |
| Purchases are not open. Existing licenses can be restored through Sociobot. | 11 | Claims `plus-entitlements`, `license-verification-destination` |
| By continuing you accept the terms. | 6 | Clear legal notice |
| Read how your data is handled in privacy. | 8 | Clear route help |
| The product illustration was generated with AI. | 7 | Asset provenance; source and prompt are documented in `design.md` |
| Log bike service, costs, and reminders on your device. | 9 | Concrete footer line |
| Built by Param Factory | 4 | Clear external credit |
| Build polish-4 | 2 | Build identifier |

### README

| Copy | Words | Check |
| --- | ---: | --- |
| Bike Service Receipts | 3 | Document title |
| Log service, costs, odometer readings, and reminders for each bike. | 10 | Claims `service-records`, `reminders` |
| The app is for cyclists who maintain one or more bikes. | 11 | Names audience |
| Live product | 2 | Clear label |
| Try it with sample data | 5 | Clear demo action |
| The demo uses separate storage and can be reset at any time. | 12 | Claim `demo-isolation` |
| Bike service features | 3 | Concrete heading |
| Create named bike profiles with type, year, identifier, and odometer. | 10 | Claim `service-records` |
| Record component, action, date, cost, provider, notes, odometer, and an optional photo. | 12 | Claim `service-records` |
| Attach a source photo up to 10 MB with Field Guide Plus; the app stores a compressed copy. | 18 | Claims `photo-source-limit`, `plus-entitlements` |
| Search each bike’s service history and delete individual receipts. | 9 | Claim `service-records` |
| Set reminders from the last service date or odometer reading. | 10 | Claim `reminders` |
| Export CSV and PDF histories, or a JSON backup that can be merged or restored. | 15 | Claims `exports`, `backup-restore` |
| Install the app and keep records available offline after the first visit. | 12 | Claim `offline-reload` |
| Use keyboard controls on the light or dark interface, including on a 390 px phone. | 15 | Claim `accessible-layout` |
| Records stay in this browser unless you export them. | 8 | Claim `local-privacy` |
| The app has no analytics, advertising trackers, third-party scripts, or hosted fonts. | 12 | Claim `local-privacy` |
| The free version includes one bike, text receipts, default reminders, and every export. | 13 | Claim `free-entitlements` |
| Field Guide Plus costs ₹499 once sales open. | 8 | Claim `plus-entitlements` |
| It adds multiple bikes, compressed photos, and custom reminders. | 9 | Claim `plus-entitlements` |
| License verification sends a restored token to Sociobot. | 8 | Claim `license-verification-destination` |
| Reminders are records, not mechanical diagnosis or safety certification. | 9 | Claim `reminders` |
| Develop | 1 | Clear developer heading |
| Requirements: Node.js 20 or newer and npm. | 7 | Clear requirement |
| The development server prints its local URL. | 7 | Clear instruction |
| The free app needs no environment variables or backend. | 9 | Clear local-development scope |
| Test and build | 3 | Clear heading |
| Playwright 1.58.2 runs browser tests against a production preview. | 9 | Clear test instruction |
| The build command checks TypeScript and writes the static site to `dist/`. | 12 | Clear build result |
| Every customer-facing claim has one tagged browser test listed in `.factory/claims.json`. | 11 | Verified below |
| To inspect the build: | 4 | Clear instruction label |
| Deploy | 1 | Clear heading |
| Deploy the contents of `dist/` to a static host with `staticwebapp.config.json` at its root. | 14 | Clear deployment instruction |
| Data and privacy | 3 | Concrete heading |
| Real records use the IndexedDB database `bike-service-receipts`. | 6 | Claim `local-privacy` |
| Demo records use `demo:bike-service-receipts` and never read the real database. | 10 | Claim `demo-isolation` |
| The optional license token uses `sb_license:bike-service-receipts` in localStorage. | 8 | Useful privacy detail |
| The app sends a restored license token to Sociobot for verification. | 10 | Claim `license-verification-destination` |
| Clearing browser data can remove records, so keep a JSON backup. | 11 | Useful limitation |
| Read the privacy page and terms. | 6 | Clear route help |
| Project files | 2 | Clear heading |
| Product brief | 2 | Clear file label |
| Visual system and image provenance | 5 | Clear file label |
| Demo contract | 2 | Clear file label |
| Claim tests | 2 | Clear file label |
| Release evidence | 2 | Clear file label |
| License: MIT | 2 | Clear file label |

The behavioral statements on the landing and README map to the manifest
entries above. Developer instructions, legal notices, build instructions, and
the documented asset-provenance disclosure are not customer-facing behavior
claims. No unlisted customer-facing claim was found.

## Demo and sandbox

Pass.

- A single click from the landing action opened `/?demo=1` directly in a used
  service log, with Fern commuter and Sunday gravel, four receipts, costs,
  odometers, and three reminders.
- The visible banner says **“Demo — sample data, nothing is saved to your
  records”** and provides **Reset demo** and **Start for real**.
- A fresh direct demo context had only `demo:bike-service-receipts` and
  `demo:selectedBikeId`. Its request log contained only the product origin.
- Reset restored the sample. Start for real exited the demo. The isolated
  claim test additionally preserved real records, local/session sentinels,
  and real database contents through demo edit, reset, and exit.
- The direct-demo offline claim reloads the controlled app and saves a receipt
  after `context.setOffline(true)`.

## Claims and verification

Clean checkout: `/tmp/bike-review5-clean-EManv7` at the reviewed commit.

- `npm ci`: passed; 60 packages audited, zero vulnerabilities.
- `npm test`: passed, 8/8.
- `npm run build`: passed; `dist/` was created. The initial JavaScript is
  56.26 kB raw / 17.76 kB gzip, below the 200 kB product limit.
- Every exact command in `.factory/claims.json` ran from that clean checkout
  in both configured projects (desktop Chromium and Pixel 5) and passed.
- `BASE_URL=https://bike-service-receipts.sociobot.in npx playwright test
  --workers=2`: passed, 36/36. Playwright’s final run record is `passed` with
  no failed tests.

| Claim id | Result | Observable verification |
| --- | --- | --- |
| `demo-isolation` | Pass | Real records and storage survive demo entry, edit, reset, and exit. |
| `service-records` | Pass | A receipt saves, searches, and deletes. |
| `reminders` | Pass | Seeded and custom date/odometer reminders show the safety wording. |
| `exports` | Pass | CSV, PDF, and JSON downloads contain the sample records. |
| `backup-restore` | Pass | Valid JSON merges, replaces, and survives reload. |
| `offline-reload` | Pass | Controlled demo reloads and saves offline after first visit. |
| `local-privacy` | Pass | Demo IndexedDB only; save flow has no cross-origin request. |
| `plus-entitlements` | Pass | Demo photo compression, extra bike, custom reminder, and closed-sale state work. |
| `photo-source-limit` | Pass | 10,000,001 bytes rejects without a write; exactly 10,000,000 bytes saves. |
| `free-entitlements` | Pass | One-bike/default-rule limits retain free exports. |
| `license-verification-destination` | Pass | Fixture restore sends the credential only to the documented Sociobot URL. |
| `accessible-layout` | Pass | Axe serious/critical scan, focus, reduced motion, and 390 px overflow checks pass. |

## Earlier findings rechecked

Each earlier finding was verified against the live deployment and current
source/tests rather than accepted from a prior status label.

| Earlier id | Current result |
| --- | --- |
| F-1-1 | Fixed: complete validation rejects malformed imports before write; damaged-record recovery test passes. |
| F-1-2 | Fixed: compact 17.76 kB gzip JS build and current live suite show no performance regression. |
| F-1-3 | Fixed: live root and immutable hashed asset headers include CSP, Permissions-Policy, Referrer-Policy, nosniff, and frame protection. |
| F-1-4 | Fixed: one-click seeded demo, separate namespace, banner, reset, and exit are confirmed. |
| F-1-5 | Fixed: all 12 behavioral claims are listed and tagged tests pass. |
| F-1-6 | Fixed: unknown live URL returns the designed static 404 document with HTTP 404. |
| F-1-7 | Fixed: root, demo, legal pages, and 404 share skip link, header, footer, product line, credit, and build id. |
| F-1-8 | Fixed: route test confirms H1 focus and polite announcement after navigation and Back. |
| F-1-9 | Fixed: checked routes have route-specific title, description, canonical, OG/Twitter fields, favicon, and Apple touch icon. |
| F-1-10 | Fixed: cold H1 names the job and both actions name their results. |
| F-1-11 | Fixed: first-screen label and image caption provide concrete information. |
| F-1-12 | Fixed: the 14-word support line names cyclists and outcome. |
| F-1-13 | Fixed: README begins with two short, concrete sentences. |
| F-1-14 | Fixed: the cited README descriptions are plain and specific. |
| F-1-15 | Fixed: sales remain honestly closed; internal factory-registration language is absent. |
| F-2-1 | Fixed: JavaScript-disabled live 404 has the missing-page title, H1, canonical, metadata, and return action. |
| F-3-1 | Fixed: demo URLs discard `license` before real storage access; isolation test covers the license URL. |
| F-3-2 | Fixed: the Sociobot license-destination statement has a dedicated fixture-backed request test. |
| F-3-3 | Fixed: unsupported merchant, tax, receipt, refund, and revocation promises remain absent while sales are closed. |
| F-3-4 | Fixed: landing includes product preview, three-step workflow, limits/privacy, and pricing sections. |
| F-3-5 | Fixed: first-screen facts include free scope and ₹499 price boundary. |
| F-3-6 | Fixed: README heading is “Bike service features.” |
| F-3-7 | Fixed: the isolated sample is consistently called the demo. |
| F-3-8 | Fixed: 404 names the error and page type directly. |
| F-3-9 | Fixed: sitemap contains only `/`, `/demo`, `/privacy`, and `/terms`. |
| F-4-1 | Fixed: visible 10 MB photo limit has the `photo-source-limit` boundary claim test. |

## Structure, links, and visual identity

Pass.

- `/`, `/demo`, `/privacy`, and `/terms` returned 200. Each had one H1,
  `<main>`, its route title, description, canonical, and Open Graph title.
  `/not-a-real-route` returned 404 with **“Bike service page not found”** and
  correct 404 metadata before JavaScript.
- The live link crawl returned 200 for every intended destination: Home,
  Demo, Privacy, Terms, and the marked external Param Factory link. Sitemap,
  robots, manifest, favicon, and social image are present.
- Cold loads and the complete live browser suite reported no console errors.
  Keyboard/focus, responsive layout, route history, and reduced-motion checks
  pass through the accessibility claim.
- The specimen-paper palette, inked bicycle illustration, receipt sheets,
  serif/sans pairing, field labels, and restrained paper motion are a distinct
  botanical field-guide identity. They are not a generic SaaS card template
  and match `.factory/design.md` and its original-asset provenance.

## Missed leverage

No finding. The brief’s expected portable-data workflow is already present:
CSV/PDF export and JSON backup/merge/restore. Sync would weaken the stated
local-first boundary unless separately designed and consented to. AI does not
improve the core record-keeping job here, and no decorative or key-embedding
AI feature is present.

## What would make this perfect

Nothing remains to change for this review. Keep the tagged claim tests and
isolated demo checks running whenever copy, storage, routes, billing, or
deployment configuration changes.
