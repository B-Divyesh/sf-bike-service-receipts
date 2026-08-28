# Adversarial first-read review 3 — Bike Service Receipts

Reviewed 2026-08-28 against <https://bike-service-receipts.sociobot.in> from fresh Chromium contexts at 390 × 844 and 1440 × 900, plus clean clone `871ba4f3c057a177c7a1f1665dc1b5fcf2d548c1`.

## Verdict: FAIL

Three blocking findings remain: demo mode can write a returned license into real storage, and the live privacy/billing copy contains claims that have no matching claim entries or observable tests. Six additional structure and copy findings also remain. A PASS requires zero findings.

## Cold first screen

Before scrolling, both fresh viewports answered the three first-read questions:

- **What it does:** logs bike service work, costs, and reminders.
- **For whom:** cyclists who want each bike’s service history and next reminder together.
- **What to click first:** **Try it with sample data** for the safe preview. **Create bike profile** is the clear real-data alternative.

The exact headline was **“Log bike service and costs”**. The exact support sentence was **“For cyclists who want each bike’s service history and next reminder in one place.”** At 390 px, both actions were visible before scrolling. No first-read clarity blocker was found.

## Findings

### F-3-1 (reopens F-1-4) — BLOCKING — demo mode writes a returned license into real storage

Location: live `/?demo=1&license=DEMO_SENTINEL`; `src/main.ts:598-600` and `615-620`; demo banner.

The banner says **“Demo — sample data, nothing is saved to your records”** and **“Changes stay in a separate demo log.”** In a fresh live browser context, opening the URL above created this real, non-demo key:

```text
sb_license:bike-service-receipts = DEMO_SENTINEL
```

**Reset demo** left that key unchanged. The code calls `acceptReturnedLicense()` before checking `demoMode`, and that function always writes `LICENSE_KEY`, which has no `demo:` prefix. The existing `@claim:demo-isolation` test covers bikes and the demo database, but never supplies a license return parameter or checks all real storage keys.

Why this fails: the visible demo boundary promises isolation, yet a demo URL can mutate a real paid-entitlement credential. A visitor cannot rely on Reset demo to undo everything the demo route changed.

Concrete fix: never process a `license` parameter while `demoMode` is true. Ignore and remove it, or keep any demo-only value in a `demo:` namespace. Add a test that opens `/?demo=1&license=DEMO_SENTINEL`, resets, and leaves the demo; assert every real IndexedDB database and real local/session-storage key is unchanged throughout.

### F-3-2 (reopens F-1-5) — BLOCKING — license-destination claims are unlisted and untested

Locations and exact claims:

- README: **“License verification uses Sociobot.”**
- README: **“The app contacts Sociobot only when a real license needs verification.”**
- Privacy: **“When you verify or restore Plus, the license token is sent to the Sociobot billing API solely to check its validity.”**
- License dialog: **“We store this token on this device and send it only to Sociobot to verify your purchase.”**

No `.factory/claims.json` entry claims the verification destination or the word **only**. `@claim:plus-entitlements` replaces `window.fetch` with a response for every URL and never records the requested URL. `@claim:local-privacy` saves a demo receipt without exercising license verification.

Why this fails: these are privacy promises about where a credential goes. Source inspection shows an intended Sociobot endpoint, but the claims contract requires observable tests rather than trusting implementation text.

Concrete fix: add one `license-verification-destination` claim and a fixture-backed test that triggers explicit real-license restore, records every request, and asserts the only credential request is the documented Sociobot URL. Alternatively remove all four claims.

### F-3-3 (reopens F-1-5) — BLOCKING — unavailable billing behavior is presented as tested fact

Locations: Privacy and Terms.

Exact unlisted claims include **“When you buy Plus, the hosted checkout is operated by Sociobot with Dodo as merchant of record”**, **“Sociobot handles checkout, taxes, receipts, and refunds”**, **“Dodo is the merchant of record”**, and **“A refund or charge reversal revokes the license.”** The live product simultaneously says **“Purchases not open.”** The `plus-entitlements` test confirms only that purchasing is unavailable; it cannot observe checkout, receipts, refunds, or revocation.

Why this fails: a visitor is given operational and legal assurances about a purchase flow that does not exist in the product and is absent from the claims manifest.

Concrete fix: until sales open, replace the passages with **“Purchases are not open. Existing licenses can be restored through Sociobot.”** When sales open, list each relied-on billing behavior and test it with the Sociobot sandbox or recorded contract fixtures.

### F-3-4 — MAJOR — the landing page stops after the first screen

Location: live `/`; `renderWelcome()` at `src/main.ts:195-218`.

After the headline/form and illustration, the page goes directly to the legal note and footer. It has no product preview, no **How it works** section, no plain limitation/privacy section, and no paid-tier section. The rendered landing page has one `h1` and no `h2`.

Why this fails: the first screen is clear, but a first-time visitor cannot verify the workflow, learn that reminders are not safety checks, or discover the free/₹499 boundary without entering the app or reading legal pages.

Concrete fix: retain the botanical field-guide identity and add the required sequence: a live sample preview; **How bike service records work** with three verb-led steps; **What the app does not do** with the safety/local-backup limits; and **Free and Field Guide Plus** with ₹499 once, included features, and the honest closed-sales state.

### F-3-5 — MINOR — the first-screen fact list omits price

Location: landing facts: **“Works offline after your first visit”**, **“Exports CSV, PDF, and JSON”**, and **“Stores records on this device.”**

The required first-screen facts are privacy, offline use, and price. Export replaces price even though the product has a paid tier.

Concrete fix: replace the export fact with **“Free for one bike; Plus ₹499 once sales open.”** Keep export details in the product preview or How it works section.

### F-3-6 — MINOR — the README heading does not name its section

Location: `README.md:9`, heading **“What it does.”**

The phrase has no subject and would fit any product README. It does not identify the section when headings are read out of context.

Concrete fix: rewrite it as **“Bike service features.”**

### F-3-7 — MINOR — the isolated sample has three names

Location: landing/nav copy: **“Try it with sample data”**, **“open a separate sample log”**, and **“Demo.”**

The same concept changes from sample data to sample log to demo. This makes the action note less direct and breaks the repository’s own terminology rule that the isolated sample is called **demo**.

Concrete fix: keep the required action **“Try it with sample data”** and rewrite the note to **“Create your own bike profile, or open the demo.”** Use **demo** elsewhere for the isolated mode.

### F-3-8 — MINOR — the 404 headline uses product metaphor instead of naming the error

Location: live unknown route and `public/404.html:30`: **“Missing record · 404”** / **“This page is not in the log.”**

“In the log” is field-guide lore. The heading does not directly name the missing-page state as required by the plain-words rule.

Concrete fix: use eyebrow **“Error 404”**, H1 **“Bike service page not found”**, and action **“Open Bike Service Receipts.”**

### F-3-9 — MINOR — the sitemap advertises a URL that intentionally returns 404

Location: `public/sitemap.xml:7`, `https://bike-service-receipts.sociobot.in/404`.

The sitemap lists `/404`, but that URL returns HTTP 404. Sitemaps should contain canonical indexable pages, not error documents.

Concrete fix: remove `/404` from `sitemap.xml`; retain the static error response and `noindex` metadata.

## Copy audit

Counts treat hyphenated terms, code identifiers, version numbers, and URLs as one word. Form options and code blocks are not sentences. Headings, labels, actions, and useful fragments are included so the required contextual checks are explicit. No item exceeds 22 words, and no banned marketing adjective appears.

### Landing page

| Text | Words | Result |
| --- | ---: | --- |
| Bike Service Receipts | 3 | Clear wordmark |
| Home | 1 | Clear navigation |
| Demo | 1 | Clear navigation; terminology checked in F-3-7 |
| Privacy | 1 | Clear navigation |
| Terms | 1 | Clear navigation |
| Private bike maintenance log | 4 | Clear label |
| Log bike service and costs | 5 | Clear job headline |
| For cyclists who want each bike’s service history and next reminder in one place. | 14 | Clear audience and outcome |
| Name your first bike | 4 | Clear label |
| This is how it will appear on every receipt. | 9 | Useful help |
| Type | 1 | Clear label |
| Create bike profile | 3 | Result-naming verb |
| Try it with sample data | 5 | Required demo action |
| Create your own profile, or open a separate sample log. | 10 | F-3-7; use “demo” consistently |
| Works offline after your first visit | 6 | Listed claim `offline-reload` |
| Exports CSV, PDF, and JSON | 5 | Listed claim `exports`; F-3-5 placement |
| Stores records on this device | 5 | Listed claim `local-privacy` |
| Illustration of a commuter bike and the tools recorded in a service receipt. | 13 | Useful caption |
| By continuing you accept the terms. | 6 | Clear legal notice |
| Read how your data is handled in privacy. | 8 | Clear route help |
| The product illustration was generated with AI. | 7 | Useful provenance |
| Log bike service, costs, and reminders on your device. | 9 | Clear footer summary |
| Built by Param Factory | 4 | Clear credit |
| Build polish-2 | 2 | Clear build identifier |

All landing buttons name a result or use the required demo wording.

### README

| Text | Words | Result |
| --- | ---: | --- |
| Bike Service Receipts | 3 | Clear title |
| Log service, costs, odometer readings, and reminders for each bike. | 10 | Listed claims `service-records` / `reminders` |
| The app is for cyclists who maintain one or more bikes. | 11 | Clear audience |
| Live product | 2 | Clear label |
| Try it with sample data | 5 | Clear demo action |
| The demo uses separate storage and can be reset at any time. | 12 | Listed claim `demo-isolation`; F-3-1 shows incomplete coverage |
| What it does | 3 | F-3-6; generic heading |
| Create named bike profiles with type, year, identifier, and odometer. | 10 | Listed claim `service-records` |
| Record component, action, date, cost, provider, notes, odometer, and an optional photo. | 12 | Listed claims `service-records` / `plus-entitlements` |
| Search each bike’s service history and delete individual receipts. | 9 | Listed claim `service-records` |
| Set reminders from the last service date or odometer reading. | 10 | Listed claim `reminders` |
| Export CSV and PDF histories, or a JSON backup that can be merged or restored. | 15 | Listed claims `exports` / `backup-restore` |
| Install the app and keep records available offline after the first visit. | 12 | Listed claim `offline-reload` |
| Use keyboard controls on the light or dark interface, including on a 390 px phone. | 15 | Listed claim `accessible-layout` |
| Records stay in this browser unless you export them. | 8 | Listed claim `local-privacy` |
| The app has no analytics, advertising trackers, third-party scripts, or hosted fonts. | 12 | Listed claim `local-privacy` |
| The free version includes one bike, text receipts, default reminders, and every export. | 13 | Listed claim `free-entitlements` |
| Field Guide Plus will cost ₹499 once sales open. | 9 | Listed claim `plus-entitlements` |
| It adds multiple bikes, compressed photos, and custom reminders. | 9 | Listed claim `plus-entitlements` |
| License verification uses Sociobot. | 4 | F-3-2; unlisted destination claim |
| Reminders are records, not mechanical diagnosis or safety certification. | 9 | Useful limitation |
| Develop | 1 | Recognizable developer section |
| Requirements: Node.js 20 or newer and npm. | 7 | Clear requirement |
| The development server prints its local URL. | 7 | Clear instruction |
| The free app needs no environment variables or backend. | 9 | Clear development limitation |
| Test and build | 3 | Clear heading |
| Playwright 1.58.2 runs browser tests against a production preview. | 9 | Clear verification detail |
| The build command checks TypeScript and writes the static site to `dist/`. | 12 | Clear verification detail |
| To inspect the build: | 4 | Clear instruction label |
| Data and privacy | 3 | Clear heading |
| Real records use the IndexedDB database `bike-service-receipts`. | 7 | Useful storage detail |
| Demo records use `demo:bike-service-receipts` and never read the real database. | 10 | Listed claim `demo-isolation` |
| The optional license token uses `sb_license:bike-service-receipts` in localStorage. | 8 | Useful storage detail |
| The app contacts Sociobot only when a real license needs verification. | 11 | F-3-2; unlisted destination/exclusivity claim |
| Clearing browser data can remove records, so keep a JSON backup. | 11 | Useful warning |
| Read the privacy page and terms. | 6 | Clear route help |
| Project files | 2 | Clear heading |
| Product brief | 2 | Clear file label |
| Visual system and image provenance | 5 | Clear file label |
| Demo contract | 2 | Clear file label |
| Claim tests | 2 | Clear file label |
| Release evidence | 2 | Clear file label |
| License: MIT | 2 | Clear file label |

Terminology is otherwise stable: **bike**, **service receipt**, **reminder**, **records**, and **JSON backup** retain one meaning.

## Demo and sandbox verification

The main demo path otherwise works:

- One click from the live first screen opened `/?demo=1` with two named bikes, four realistic receipts, costs, odometers, providers, notes, and reminders already visible.
- The persistent banner, **Reset demo**, and **Start for real** were present.
- The clean-clone isolation test created a real bike, edited/reset demo data, and confirmed that bike survived.
- Reset restored the seeded selection/data; Start for real cleared the demo records before opening the real log.
- A request log covering demo load and receipt save contained only same-origin requests.
- The live offline claim test reloaded and saved a receipt without a connection.

F-3-1 is the exception that prevents the sandbox from passing.

## Claims and test evidence

From fresh clone `/tmp/bike-review3-clean-QyH11w` at `871ba4f3c057a177c7a1f1665dc1b5fcf2d548c1`:

- `npm ci`: passed, 0 vulnerabilities.
- `npm test`: 8/8 passed.
- `npm run build`: passed and produced `dist/`.
- Every exact command in `.factory/claims.json`: passed independently in desktop Chromium and Pixel 5 projects.
- Complete live suite with `BASE_URL=https://bike-service-receipts.sociobot.in`: 30/30 passed.

| Claim id | Result | Observable evidence |
| --- | --- | --- |
| `demo-isolation` | Pass, but incomplete scope | Real bike survived demo edit/reset; does not cover F-3-1 |
| `service-records` | Pass | Save, search, and delete receipt |
| `reminders` | Pass | Seeded and custom date/odometer reminders |
| `exports` | Pass | CSV, PDF, and JSON contents |
| `backup-restore` | Pass | Merge, replace, and reload |
| `offline-reload` | Pass | Offline reload and receipt save |
| `local-privacy` | Pass for tested demo save | Demo DB and same-origin requests only; does not cover F-3-2 |
| `plus-entitlements` | Pass for listed scope | Photo, second bike, custom interval, closed checkout, fixture license |
| `free-entitlements` | Pass | One-bike limit, text receipts, reminders, exports |
| `accessible-layout` | Pass | Axe serious/critical, focus, reduced motion, 390 px overflow |

No listed command failed. F-3-2 and F-3-3 are unlisted claims, so the claim inventory is not complete.

## Earlier-finding verification

Every earlier review, polish report, verification report, and prior handoff was read. Each finding was checked against production and source, not accepted from its status label.

| Earlier finding | Review 3 result |
| --- | --- |
| F-1-1 import validation/recovery | Fixed: malformed import/recovery test passes; validation and repair paths remain in code. |
| F-1-2 mobile performance | Fixed: fresh live Lighthouse scored Performance 100; LCP 1.1 s, TBT 10 ms, CLS 0. Initial JS is 17.14 KB gzip. |
| F-1-3 caching/security headers | Fixed: live hashed JS is immutable for one year; CSP, Permissions-Policy, Referrer-Policy, nosniff, and frame restrictions are present. |
| F-1-4 demo isolation | **Half-fixed; reopened as blocking F-3-1.** Bike records are isolated, but a demo license-return URL writes a real key. |
| F-1-5 claims manifest | **Half-fixed; reopened as blocking F-3-2 and F-3-3.** Ten commands pass, but live provider/billing claims are absent. |
| F-1-6 designed 404 | Fixed: unknown live URL returns the complete styled document with HTTP 404 before JavaScript. |
| F-1-7 shared header/footer | Fixed on root, demo, Privacy, Terms, and static 404. |
| F-1-8 route focus/announcement | Fixed: live suite confirms H1 focus and announcement after navigation and Back. |
| F-1-9 metadata | Fixed: route titles/descriptions/canonicals, OG/Twitter image, SVG favicon, and Apple touch icon are present. |
| F-1-10 headline/action | Fixed: direct job headline and result-naming actions are visible. |
| F-1-11 decorative first-screen lore | Fixed on landing. F-3-8 is a separate remaining 404 metaphor. |
| F-1-12 audience/support copy | Fixed: 14-word audience/outcome sentence is visible. |
| F-1-13 long README opening | Fixed: two short sentences. |
| F-1-14 README jargon | Fixed for the cited phrases. |
| F-1-15 internal factory/sales wording | Fixed in the app: purchasing is honestly disabled. F-3-3 covers separate untested legal claims. |
| F-2-1 static 404 body | Fixed: live unknown URL returns HTTP 404 with missing-page title, H1, canonical, and return link without JavaScript. |

## Structure, accessibility, links, and identity

Root, demo, Privacy, Terms, and the unknown route have route-appropriate titles, descriptions, canonicals, one H1, ordered headings, shared header/footer, skip link, and focus handling. Deep links and Back pass the live suite. `robots.txt`, manifest, icons, social preview, response security headers, and reduced-motion styles are present. The link crawl returned 200 for every intentional page/link; the 404 sitemap entry is separately recorded as F-3-9.

`verify-url.sh` found one H1, `lang=en`, a main landmark, no missing image alt text, no unlabeled buttons, and no console/page errors. The Playwright Axe checks found no serious or critical issue. Fresh live Lighthouse scored 100 for Performance, Accessibility, Best Practices, and SEO.

The paper, pressed-leaf shapes, field-record typography, specimen illustration, and receipt sheets form a distinct botanical field-guide identity rather than a generic SaaS template. F-3-4 concerns missing information architecture, not the visual surface.

## Missed leverage

No additional feature finding. The brief’s obvious portable-data need is already met with CSV/PDF export and JSON merge/restore. Cross-device sync would conflict with the current local-first/privacy boundary unless made explicit and optional. Model assistance would not improve the core record-keeping job, and no provider or Azure key is embedded.

## What would make this perfect

Close all nine findings: make every demo entry path incapable of writing real keys, list and test or remove every license/billing claim, complete the required landing-page sequence and price fact, apply the three concrete copy rewrites, and remove the 404 URL from the sitemap. Then repeat the cold mobile/desktop, storage-key, request-log, offline, route, link, claims, Axe, and Lighthouse checks from a fresh context.
