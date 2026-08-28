# Adversarial first-read review 2

Reviewed 2026-08-28 against <https://bike-service-receipts.sociobot.in> from fresh Chromium contexts at 390 × 844 and 1440 × 900, plus a clean local clone at `02681482d2e35193336abd0dc006da6ba9b5a5b4`.

## Verdict: FAIL

One structural finding remains. All other checks below were performed again; this is not a diff-only review.

### F-2-1 (reopens F-1-6) — BLOCKING — unknown URLs serve the landing document before JavaScript, not the designed 404

Location: live `https://bike-service-receipts.sociobot.in/not-a-real-route`; `public/staticwebapp.config.json`; `public/404.html`.

`GET /not-a-real-route` correctly returns HTTP 404, but its response body is the root `index.html`, not `404.html`. In a fresh browser with JavaScript disabled, the page has title **“Bike Service Receipts — log service and costs”**, the root canonical URL and root Open Graph data, and no `<h1>`. It therefore communicates neither that the address is invalid nor how to return. The later JavaScript-rendered 404 is not a substitute for the static 404 that the configuration and prior repair claim to provide. It also leaves crawlers and visitors with blocked JavaScript with landing-page metadata on an error response.

Why this fails first-read and route quality: a mistyped or shared stale URL must immediately identify itself as missing. Serving the product landing document with a 404 status is misleading and makes the existing designed `404.html` unreachable for the case it was created for.

Concrete fix: change the Static Web Apps fallback/route precedence so an unknown path is rewritten to `/404.html` while retaining status 404. Keep valid SPA routes (`/`, `/demo`, `/privacy`, `/terms`) on `index.html`. Add the same description, canonical, Open Graph/Twitter, and Apple-touch metadata to `404.html`; then add a deployment test which fetches an unknown route with JavaScript disabled and asserts status 404, `Page not found — Bike Service Receipts`, the missing-page `<h1>`, canonical `/404`, and the return link. Re-run the test against the deployed URL, not only the Vite preview.

## Cold first screen

Before scrolling, on both phone and desktop, the product was understandable:

- It records bike service work, costs, odometer readings, and upcoming reminders.
- It is for cyclists maintaining one or more bikes.
- The first useful action is either **Try it with sample data** to inspect a separate sample log or **Create bike profile** to start a personal log.

The exact supporting line, **“For cyclists who want each bike’s service history and next reminder in one place.”**, supplies the audience and result. The adjacent action note, **“Create your own profile, or open a separate sample log.”**, explains the choice. No first-screen clarity finding.

## Copy audit

Counts treat hyphenated compounds, product names, version numbers, and URLs as one word. Navigation labels, input options, code blocks, URLs, and file-link labels are not sentences; the useful headings and labels are included where they carry copy. No item exceeds 22 words, uses a banned marketing adjective, relies on a mood/metaphor heading, or uses a non-result primary button. Therefore there are no copy findings or rewrites to propose.

### Landing page

| Text | Words | Result |
| --- | ---: | --- |
| Bike Service Receipts | 3 | Clear product wordmark |
| Home | 1 | Clear navigation |
| Demo | 1 | Clear navigation |
| Privacy | 1 | Clear navigation |
| Terms | 1 | Clear navigation |
| Private bike maintenance log | 4 | Clear label |
| Log bike service and costs | 6 | Clear job headline |
| For cyclists who want each bike’s service history and next reminder in one place. | 14 | Clear audience and outcome |
| Name your first bike | 4 | Clear form label |
| This is how it will appear on every receipt. | 9 | Useful help |
| Type | 1 | Clear form label |
| Create bike profile | 3 | Result-naming verb |
| Try it with sample data | 5 | Result-naming verb |
| Create your own profile, or open a separate sample log. | 10 | Explains the actions |
| Works offline after your first visit | 6 | Claim `offline-reload` |
| Exports CSV, PDF, and JSON | 5 | Claim `exports` |
| Stores records on this device | 5 | Claim `local-privacy` |
| Illustration of a commuter bike and the tools recorded in a service receipt. | 13 | Useful figure caption |
| By continuing you accept the terms. | 6 | Clear legal notice |
| Read how your data is handled in privacy. | 8 | Clear route help |
| The product illustration was generated with AI. | 7 | Asset provenance; corroborated in `design.md` |
| Log bike service, costs, and reminders on your device. | 9 | Clear footer one-liner |
| Built by Param Factory | 4 | Clear external credit |

### README

| Text | Words | Result |
| --- | ---: | --- |
| Bike Service Receipts | 3 | Clear document title |
| Log service, costs, odometer readings, and reminders for each bike. | 10 | Claim `service-records` / `reminders` |
| The app is for cyclists who maintain one or more bikes. | 11 | Clear audience |
| Live product | 2 | Clear label |
| Try it with sample data | 5 | Clear demo action |
| The demo uses separate storage and can be reset at any time. | 12 | Claim `demo-isolation` |
| What it does | 4 | Clear heading |
| Create named bike profiles with type, year, identifier, and odometer. | 10 | Claim `service-records` |
| Record component, action, date, cost, provider, notes, odometer, and an optional photo. | 12 | Claim `service-records` / `plus-entitlements` |
| Search each bike’s service history and delete individual receipts. | 9 | Claim `service-records` |
| Set reminders from the last service date or odometer reading. | 10 | Claim `reminders` |
| Export CSV and PDF histories, or a JSON backup that can be merged or restored. | 15 | Claim `exports` / `backup-restore` |
| Install the app and keep records available offline after the first visit. | 12 | Claim `offline-reload` |
| Use keyboard controls on the light or dark interface, including on a 390 px phone. | 15 | Claim `accessible-layout` |
| Records stay in this browser unless you export them. | 8 | Claim `local-privacy` |
| The app has no analytics, advertising trackers, third-party scripts, or hosted fonts. | 12 | Claim `local-privacy` |
| The free version includes one bike, text receipts, default reminders, and every export. | 13 | Claim `free-entitlements` |
| Field Guide Plus will cost ₹499 once sales open. | 8 | Claim `plus-entitlements` |
| It adds multiple bikes, compressed photos, and custom reminders. | 9 | Claim `plus-entitlements` |
| License verification uses Sociobot. | 4 | Claim `plus-entitlements` |
| Reminders are records, not mechanical diagnosis or safety certification. | 9 | Useful limitation |
| Develop | 1 | Clear heading |
| Requirements: Node.js 20 or newer and npm. | 7 | Clear developer requirement |
| The development server prints its local URL. | 7 | Clear instruction |
| The free app needs no environment variables or backend. | 9 | Clear developer limitation |
| Test and build | 3 | Clear heading |
| Playwright 1.58.2 runs browser tests against a production preview. | 9 | Clear verification instruction |
| The build command checks TypeScript and writes the static site to `dist/`. | 12 | Clear verification instruction |
| To inspect the build: | 4 | Clear instruction label |
| Data and privacy | 3 | Clear heading |
| Real records use the IndexedDB database `bike-service-receipts`. | 6 | Claim `local-privacy` |
| Demo records use `demo:bike-service-receipts` and never read the real database. | 10 | Claim `demo-isolation` |
| The optional license token uses `sb_license:bike-service-receipts` in localStorage. | 8 | Useful privacy detail |
| The app contacts Sociobot only when a real license needs verification. | 10 | Claim `local-privacy` / `plus-entitlements` |
| Clearing browser data can remove records, so keep a JSON backup. | 11 | Useful limitation |
| Read the privacy page and terms. | 6 | Clear route help |
| Project files | 2 | Clear heading |

Terminology is consistent: **bike**, **service receipt**, **reminder**, **records**, **demo**, and **JSON backup** retain the same meaning in the landing page and README.

## Demo and sandbox

Pass, except for the separate 404 finding above.

- `/?demo=1` is one click from the first screen and opened a used product view immediately: two named sample bikes, four seeded receipts overall, recorded costs/odometers, and reminders.
- The persistent banner reads **“Demo — sample data, nothing is saved to your records”** and includes **Reset demo** and **Start for real**.
- In a fresh mobile context the only storage database was `demo:bike-service-receipts`; localStorage contained only `demo:selectedBikeId`. No real database was opened.
- Reset restored the sample bike selection and sample database. The clean-clone `@claim:demo-isolation` test also created a real bike, reset the demo, and confirmed the real bike remained unchanged.
- The request log during demo load and save contained only same-origin HTML, JavaScript, CSS, and asset requests. No console errors occurred on root or demo load.

## Claims and clean-clone verification

Read `.factory/claims.json` before testing. In a fresh clone, `npm ci`, `npm test` (8 passed), and `npm run build` (created `dist/`) all passed. Each exact manifest command was run separately; all passed for desktop Chromium and Pixel 5. The final clean-clone browser suite also passed 26/26 tests.

| Claim id | Result | Observable check |
| --- | --- | --- |
| `demo-isolation` | Pass | Real records survive demo reset and separate storage is used |
| `service-records` | Pass | Save, search, and delete a receipt |
| `reminders` | Pass | Seeded and custom date/odometer reminders appear |
| `exports` | Pass | CSV sample row, PDF header, and JSON sample contents download |
| `backup-restore` | Pass | Valid backup merges, replaces, and survives reload |
| `offline-reload` | Pass | Controlled demo reloads and saves while offline after first load |
| `local-privacy` | Pass | Only the demo database and no cross-origin request during save |
| `plus-entitlements` | Pass | Demo photo, extra bike, custom intervals, and honest unavailable purchase state |
| `free-entitlements` | Pass | One-bike/free reminders limits and free exports |
| `accessible-layout` | Pass | Axe serious/critical scan, focus, reduced motion, and 390 px overflow checks |

The live landing and README promises map to these entries as shown in the copy tables. No unlisted product claim was found. The illustration provenance is documented with source prompt and generation record in `.factory/design.md`; it is not a promise about application behavior.

## History verification

Read `review-1.md`, `polish-1.md`, and the prior handoff. Each earlier finding was checked on the live site and in the code:

| Earlier finding | Result of this review |
| --- | --- |
| F-1-1 import validation and recovery | Fixed: clean-clone recovery/import test passes; validation and recovery code are present. |
| F-1-2 performance payload | Fixed in code: production initial JS is 17.25 KB gzip; no new regression observed. |
| F-1-3 caching and security headers | Fixed: live root sends CSP, Permissions-Policy, Referrer-Policy, nosniff, and immutable asset caching. |
| F-1-4 demo | Fixed: rechecked independently above. |
| F-1-5 claim contract | Fixed: manifest has ten tagged claims and every command passes. |
| F-1-6 designed 404 | **Not fully fixed; reopened as F-2-1.** Client-side rendering works, but the HTTP 404 body is still the landing document. |
| F-1-7 shared navigation/footer | Fixed: present on landing, demo, Privacy, Terms, and the static `/404` page. |
| F-1-8 route focus and announcement | Fixed: clicking Privacy focused its H1; browser Back focused `Sample bike service log`. |
| F-1-9 route metadata | Fixed for JavaScript-rendered routes; the static unknown-route response remains covered by F-2-1. |
| F-1-10 through F-1-12 first-screen wording | Fixed: checked from cold phone and desktop views. |
| F-1-13 through F-1-15 README wording and honest sales state | Fixed: current README is plain and the UI says purchases are not open. |

## Structure, links, and visual identity

Valid routes `/`, `/demo`, `/privacy`, `/terms`, and `/404` loaded with one H1 after render, expected titles, shared header/footer, and working skip links. All first-party links crawled to 200 responses; the Param Factory external link returned 200. `robots.txt` and the sitemap are present. Root metadata includes description, canonical, Open Graph/Twitter data, SVG favicon, Apple touch icon, language, and palette theme color. The botanical field-guide surface is distinct from a generic SaaS template and is implemented consistently at 390 px and desktop.

The only exception is the actual unknown-URL response described in F-2-1. It prevents a PASS.

## Missed leverage

No finding. The brief already implies and supplies the valuable import/export path: CSV/PDF/JSON export and JSON merge/restore. It does not call for model assistance; adding decorative AI would not improve the core record-keeping job. No provider key is embedded in the client.

## What would make this perfect

Make the deployed unknown-route response serve the complete static 404 document with correct 404 metadata before JavaScript runs, and lock it with a live deployment regression test. Then this review can pass.
