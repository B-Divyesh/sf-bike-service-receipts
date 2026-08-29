# Adversarial first-read review 4 — Bike Service Receipts

Reviewed 2026-08-29 against <https://bike-service-receipts.sociobot.in> from
new Chromium browser contexts at 390 × 844 and 1440 × 900, and from clean
clone `/tmp/bike-review4-clean-1XQvYZ` at `9572a3c2ebcd5f69d12888ffcd1cf1fc90ca7293`.

## Verdict: FAIL

One blocking claim-contract finding remains. The product is clear on a cold
phone, has a working isolated demo, and passed all listed claim commands, but
a visible quantitative photo-size promise has no `claims.json` entry or
boundary test. A PASS requires zero findings and no untested claim.

## Cold first screen

Before scrolling, both viewports answered all three first-read questions.

- **What it does:** it logs bike service and costs, then shows next reminders.
- **For whom:** cyclists who want each bike's service history in one place.
- **What to click first:** **Try it with sample data** for a safe preview, or
  **Create bike profile** to begin a real log.

The exact headline is **“Log bike service and costs”**. The supporting line,
**“For cyclists who want each bike’s service history and next reminder in one
place.”**, identifies the audience and outcome. At 390 px, both actions and
the three facts are visible before scrolling. No first-screen clarity finding
was found.

## Findings

### F-4-1 — BLOCKING — visible 10 MB photo limit is an unlisted, untested quantitative claim

Location: live demo → **Log service** → **Photo evidence**; source
`src/main.ts:317`.

Exact text: **“Stored only on this device. Maximum source size 10 MB.”**

The claim manifest has no entry for a photo source-size limit. Its
`plus-entitlements` claim tests that a small image is compressed and stored;
it does not assert the advertised 10 MB threshold. The requirement for a
quantitative claim is an observable test of the stated number, not source-code
inspection. A fresh live demo rejected a 10,000,001-byte selected file with
**“Choose a photo smaller than 10 MB.”** and retained the three seeded
receipts, but that manual check is not the required tagged regression test. A
cyclist choosing a photo from a phone is entitled to rely on the limit before
selecting it.

Concrete fix: either remove the numerical limit from customer copy, or add a
claim such as `photo-source-limit` to `.factory/claims.json` with a tagged
test. The test must use the demo, submit a 10,000,001-byte image file, and
assert the useful error **“Choose a photo smaller than 10 MB.”** without
creating a receipt. It should also cover the accepted boundary with a valid
10 MB-or-smaller image where practical.

## Copy audit

Counts treat product names, hyphenated compounds, dates, currencies, and
version labels as one word. Form options, code blocks, URLs, and icon-only
symbols are not sentences. Headings, actions, labels, and useful fragments are
included because they are read as standalone copy. No entry is over 22 words,
uses banned marketing language, relies on a mood/metaphor heading, or uses a
non-result primary action. F-4-1 is the only claim-inventory exception.

### Landing page

| Copy | Words | Check |
| --- | ---: | --- |
| Bike Service Receipts | 3 | Clear wordmark |
| Home | 1 | Clear navigation |
| Demo | 1 | Clear navigation |
| Privacy | 1 | Clear navigation |
| Terms | 1 | Clear navigation |
| Private bike maintenance log | 4 | Clear label |
| Log bike service and costs | 6 | Clear job headline |
| For cyclists who want each bike’s service history and next reminder in one place. | 14 | Clear audience and outcome |
| Name your first bike | 4 | Clear form label |
| This is how it will appear on every receipt. | 9 | Useful instruction |
| Type | 1 | Clear form label |
| Create bike profile | 3 | Result-naming action |
| Try it with sample data | 5 | Result-naming demo action |
| Create your own bike profile, or open the demo. | 9 | Explains the actions |
| Works offline after your first visit | 6 | `offline-reload` |
| Stores records on this device | 5 | `local-privacy` |
| Free for one bike; Plus ₹499 once sales open | 9 | `plus-entitlements` |
| Illustration of a commuter bike and the tools recorded in a service receipt. | 13 | Useful image caption |
| Sample service receipt | 3 | Names the preview |
| See the record before you start | 7 | Clear preview heading |
| Open the demo to browse two bikes, four receipts, and reminders already due or planned. | 15 | `demo-isolation` / useful preview |
| Open the demo | 3 | Result-naming action |
| Fern commuter | 2 | Realistic sample bike |
| Recorded 21 Aug 2026 | 4 | Useful sample metadata |
| Chain · lubricated | 2 | Useful sample metadata |
| Cleaned after rain | 4 | Sample receipt title |
| Dry-weather lube applied at 4,860 km. Self-recorded. | 7 | Useful sample detail |
| Cost | 1 | Clear receipt label |
| Next | 1 | Clear receipt label |
| Export | 1 | Clear receipt label |
| CSV, PDF, JSON | 3 | `exports` |
| Three steps | 2 | Clear workflow label |
| How bike service records work | 5 | Clear workflow heading |
| Name your bike | 3 | Verb-led step |
| Start with a bike name, then keep its work together. | 11 | Useful instruction |
| Log the work | 3 | Verb-led step |
| Add the service, date, cost, odometer, notes, and optional photo. | 10 | `service-records` / `plus-entitlements` |
| Check the next reminder | 4 | Verb-led step |
| See date and distance reminders from the service records you entered. | 11 | `reminders` |
| Limits and privacy | 3 | Clear section label |
| What the app does not do | 6 | Clear limits heading |
| Reminders use values you enter. | 5 | `reminders` |
| They do not diagnose problems or certify bike safety. | 9 | `reminders` |
| Browser data can be cleared. | 5 | Useful limitation |
| Export a JSON backup to keep a copy. | 8 | `backup-restore` |
| One-time upgrade | 2 | Clear pricing label |
| Free and Field Guide Plus | 5 | Clear pricing heading |
| Free log | 2 | Clear tier heading |
| One bike, text receipts, default reminders, and every export. | 9 | `free-entitlements` |
| Field Guide Plus · ₹499 once | 5 | `plus-entitlements` |
| Add multiple bikes, compressed photos, and custom reminders when sales open. | 11 | `plus-entitlements` |
| Purchases are not open. | 4 | `plus-entitlements` |
| Existing licenses can be restored through Sociobot. | 7 | `license-verification-destination` |
| By continuing you accept the terms. | 6 | Clear legal notice |
| Read how your data is handled in privacy. | 8 | Clear route help |
| The product illustration was generated with AI. | 7 | Asset provenance, documented in `design.md` |
| Log bike service, costs, and reminders on your device. | 9 | Clear footer one-liner |
| Built by Param Factory | 4 | Clear credit |
| Build polish-3 | 2 | Clear build identifier |

### README

| Copy | Words | Check |
| --- | ---: | --- |
| Bike Service Receipts | 3 | Clear document title |
| Log service, costs, odometer readings, and reminders for each bike. | 10 | `service-records` / `reminders` |
| The app is for cyclists who maintain one or more bikes. | 11 | Clear audience |
| Live product | 2 | Clear label |
| Try it with sample data | 5 | Clear demo action |
| The demo uses separate storage and can be reset at any time. | 12 | `demo-isolation` |
| Bike service features | 3 | Clear section heading |
| Create named bike profiles with type, year, identifier, and odometer. | 10 | `service-records` |
| Record component, action, date, cost, provider, notes, odometer, and an optional photo. | 12 | `service-records` / `plus-entitlements` |
| Search each bike’s service history and delete individual receipts. | 9 | `service-records` |
| Set reminders from the last service date or odometer reading. | 10 | `reminders` |
| Export CSV and PDF histories, or a JSON backup that can be merged or restored. | 15 | `exports` / `backup-restore` |
| Install the app and keep records available offline after the first visit. | 12 | `offline-reload` |
| Use keyboard controls on the light or dark interface, including on a 390 px phone. | 15 | `accessible-layout` |
| Records stay in this browser unless you export them. | 8 | `local-privacy` |
| The app has no analytics, advertising trackers, third-party scripts, or hosted fonts. | 12 | `local-privacy` |
| The free version includes one bike, text receipts, default reminders, and every export. | 13 | `free-entitlements` |
| Field Guide Plus costs ₹499 once sales open. | 8 | `plus-entitlements` |
| It adds multiple bikes, compressed photos, and custom reminders. | 9 | `plus-entitlements` |
| License verification sends a restored token to Sociobot. | 8 | `license-verification-destination` |
| Reminders are records, not mechanical diagnosis or safety certification. | 9 | `reminders` |
| Develop | 1 | Clear developer heading |
| Requirements: Node.js 20 or newer and npm. | 7 | Clear requirement |
| The development server prints its local URL. | 7 | Clear instruction |
| The free app needs no environment variables or backend. | 9 | Clear development limitation |
| Test and build | 3 | Clear verification heading |
| Playwright 1.58.2 runs browser tests against a production preview. | 9 | Clear verification detail |
| The build command checks TypeScript and writes the static site to `dist/`. | 12 | Clear verification detail |
| To inspect the build: | 4 | Clear instruction label |
| Deploy | 1 | Clear deployment heading |
| Deploy the contents of `dist/` to a static host with `staticwebapp.config.json` at its root. | 14 | Clear deployment instruction |
| Data and privacy | 3 | Clear section heading |
| Real records use the IndexedDB database `bike-service-receipts`. | 6 | `local-privacy` |
| Demo records use `demo:bike-service-receipts` and never read the real database. | 10 | `demo-isolation` |
| The optional license token uses `sb_license:bike-service-receipts` in localStorage. | 8 | Useful privacy detail |
| The app sends a restored license token to Sociobot for verification. | 10 | `license-verification-destination` |
| Clearing browser data can remove records, so keep a JSON backup. | 11 | Useful limitation |
| Read the privacy page and terms. | 6 | Clear route help |
| Project files | 2 | Clear section heading |
| Product brief | 2 | Clear file label |
| Visual system and image provenance | 5 | Clear file label |
| Demo contract | 2 | Clear file label |
| Claim tests | 2 | Clear file label |
| Release evidence | 2 | Clear file label |
| License: MIT | 2 | Clear file label |

## Demo and sandbox verification

Pass, apart from F-4-1's separate photo-limit claim gap.

- Clicking **Try it with sample data** once opened `/?demo=1` straight into a
  used log: Fern commuter and Sunday gravel, four seeded receipts, recorded
  costs and odometers, and three reminders.
- The persistent banner reads **“Demo — sample data, nothing is saved to your
  records”** and provides **Reset demo** and **Start for real**.
- In a fresh context opened at `/?demo=1&license=DEMO_SENTINEL`, the URL shed
  the license parameter before storage access. Storage contained only
  `demo:selectedBikeId` and IndexedDB `demo:bike-service-receipts`; it had no
  real local/session key or real database. Reset retained that separation.
- The clean-clone `@claim:demo-isolation` command additionally created a real
  bike, edited/reset the demo, left it, and confirmed all real data and
  non-demo storage sentinels were unchanged.
- The fresh-context request log during demo load/reset contained only
  `https://bike-service-receipts.sociobot.in` requests (HTML, JS, and CSS).
  The listed privacy test separately saved a demo receipt and passed its
  same-origin request and demo-database assertions.

## Claims and clean-clone verification

`.factory/claims.json` was read before testing. In the clean clone, `npm ci`
completed with zero vulnerabilities; `npm test` passed 8/8; and `npm run
build` passed, creating `dist/` (56.25 kB raw / 17.75 kB gzip JavaScript).
Each exact manifest command was run independently and passed in both Chromium
desktop and Pixel 5 projects. The complete live suite was then run with
`BASE_URL=https://bike-service-receipts.sociobot.in npx playwright test
--workers=2` and passed 34/34.

| Claim id | Result | Observable check |
| --- | --- | --- |
| `demo-isolation` | Pass | Real records/storage survive demo license URL, edits, reset, and exit |
| `service-records` | Pass | Saves, finds, and deletes a receipt |
| `reminders` | Pass | Shows safety wording and seeded/custom date and odometer reminders |
| `exports` | Pass | Downloads and inspects CSV, PDF, and JSON sample output |
| `backup-restore` | Pass | Merges, replaces, and reloads a valid backup |
| `offline-reload` | Pass | Reloads and saves the controlled demo offline after first visit |
| `local-privacy` | Pass | Uses demo IndexedDB only and logs no cross-origin save request |
| `plus-entitlements` | Pass | Stores compressed photo, supports extra bike/custom rules, and shows closed sales |
| `free-entitlements` | Pass | Enforces free limits while retaining exports |
| `license-verification-destination` | Pass | Fixture restore makes the sole credential request to Sociobot verification |
| `accessible-layout` | Pass | Axe serious/critical scan, focus, reduced motion, and 390 px overflow checks |

F-4-1 is not represented in this manifest or table, so the inventory is not
complete despite every listed command passing.

## Earlier findings checked again

Every prior review, polish report, verification report, and the prior handoff
was read. The checks below use the live site and current code/test suite, not
the previous “fixed” labels.

| Earlier finding | Current result |
| --- | --- |
| F-1-1 | Fixed: malformed import rejection and damaged-record recovery test pass. |
| F-1-2 | Fixed: current deployment has the compact 17.75 kB gzip JS build; live suite is clean. |
| F-1-3 | Fixed: live root sends CSP, Permissions-Policy, Referrer-Policy, nosniff, and frame protection; hashed JS is immutable for one year. |
| F-1-4 | Fixed: one-click demo, separate namespaces, banner, reset, and real-data preservation verified. |
| F-1-5 | Fixed for the prior inventory: all 11 listed claims pass; F-4-1 identifies the remaining unlisted claim. |
| F-1-6 / F-2-1 | Fixed: unknown live URL returns HTTP 404 with the complete static error document before JavaScript. |
| F-1-7 | Fixed: root, demo, legal pages, and static 404 have the shared skip link, header, footer, credit, and build ID. |
| F-1-8 | Fixed: live route test confirms H1 focus and polite announcement after navigation and Back. |
| F-1-9 | Fixed: each checked route has route title, description, canonical, OG/Twitter image, favicon, and Apple touch icon. |
| F-1-10 | Fixed: job headline and result-naming actions are visible cold. |
| F-1-11 | Fixed: landing labels/caption now give concrete information. |
| F-1-12 | Fixed: the 14-word cyclist-specific support line is visible cold. |
| F-1-13 | Fixed: README opening is two short concrete sentences. |
| F-1-14 | Fixed: cited README wording is plain and concrete. |
| F-1-15 | Fixed: sales are honestly closed; no internal factory-registration copy remains. |
| F-3-1 | Fixed: demo license-return parameter is discarded before real storage access. |
| F-3-2 | Fixed: the Sociobot license-destination claim has its own fixture-backed request test. |
| F-3-3 | Fixed: unsupported checkout/merchant/refund/revocation copy is absent while sales are closed. |
| F-3-4 | Fixed: landing has sample preview, three steps, limits/privacy, and free/Plus sections. |
| F-3-5 | Fixed: first-screen facts include the price boundary. |
| F-3-6 | Fixed: README uses **Bike service features**. |
| F-3-7 | Fixed: adjacent action copy consistently calls the isolated sample the **demo**. |
| F-3-8 | Fixed: static error page says **Error 404** and **Bike service page not found**. |
| F-3-9 | Fixed: sitemap lists only canonical indexable routes. |

## Structure, accessibility, and links

- `/`, `/demo`, `/privacy`, and `/terms` returned 200; an unknown path returned
  the 2,631-byte designed `404.html` with HTTP 404.
- The root, demo, legal routes, and 404 have one H1, a main landmark, expected
  route title pattern, description, canonical, OG/Twitter metadata, favicon,
  and Apple-touch icon. `robots.txt`, sitemap, manifest, and host headers are
  present.
- The live route test confirmed deep links, Back focus restoration, route
  announcements, and the designed static 404. No console error occurred on
  cold root, demo, or manual fresh demo verification.
- Crawling all links from root, demo, Privacy, and Terms returned 200 for
  internal targets and the Param Factory external link. There are no dead
  links.
- The live accessibility claim run found no Axe serious/critical issue and no
  horizontal overflow on the Pixel 5 project. The botanical field-guide paper,
  specimen illustration, receipt-sheet layout, and pressed-leaf controls are
  visibly product-specific rather than a generic SaaS template.

## Missed leverage

No additional feature finding. The brief's obvious portable-data need is
already met by CSV/PDF export and JSON merge/restore. Sync would change the
local-first privacy boundary. Model assistance is not necessary for this
record-keeping job, and no runtime provider key is embedded.

## What would make this perfect

Close F-4-1 by listing and boundary-testing the visible 10 MB photo limit (or
by removing the numerical promise), then repeat this complete cold-context,
demo-storage, request-log, claim, route, link, and accessibility review. With
no unlisted quantitative promise remaining, this can pass.
