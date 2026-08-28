# Bike Service Receipts

Bike Service Receipts is a private, offline-first maintenance log for everyday cyclists. It records what happened to each bike, when it happened, what it cost, the odometer reading, supporting notes or a photo, and the rule behind the next reminder.

Live product: <https://bike-service-receipts.sociobot.in>

## What v1 includes

- Named bike profiles with type, year, identifier, and current odometer
- Fast service receipts with component, action, date, cost/currency, provider, notes, odometer, and optional compressed photo
- Per-bike recent work, searchable full history, and explicit deletion
- Rule-based month and mileage reminders backed by the most recent receipt
- CSV and PDF history exports plus full-fidelity JSON backup/merge/restore
- Installable PWA shell and IndexedDB records that continue to work offline
- Light/dark botanical field-guide treatment, keyboard paths, reduced motion, and 390 px mobile layout
- Local-only data by default, with no account, analytics, third-party scripts, or hosted fonts

The free version supports one bike, unlimited text receipts, default reminder rules, and every export. Field Guide Plus is a ₹499 one-time license that adds unlimited bikes, compressed photo evidence, and custom reminder intervals. Checkout and license verification use only the Sociobot billing API; the factory registers the product separately.

Reminders are informational records, not mechanical diagnosis or safety certification.

## Develop

Requirements: Node.js 20+ and npm.

```sh
npm ci
npm run dev
```

Vite prints the local development URL. No environment variables or backend are required for the free/local product.

## Test and build

```sh
npm test
npm run build
npm run test:e2e
```

The exact production build command is `npm run build`. It type-checks the application and writes the static deployment to `./dist`, with `dist/index.html` at its root. End-to-end tests use Playwright 1.58.2 and start a production preview automatically; the factory image already provides its Chromium build.

To inspect the build manually:

```sh
npm run preview
```

## Data and privacy model

Bike, receipt, reminder, and photo data is stored in IndexedDB named `bike-service-receipts`. The optional license token is stored under `sb_license:bike-service-receipts` in localStorage, and its verdict is rechecked at most daily. The only runtime network request beyond loading the app is license verification when a token exists.

JSON export is the complete device backup. CSV and PDF are human-readable receipt histories. Clearing browser site data or uninstalling without a JSON backup can remove local records.

See [`/privacy`](https://bike-service-receipts.sociobot.in/privacy) and [`/terms`](https://bike-service-receipts.sociobot.in/terms).

## Project notes

- Product brief: [`.factory/brief.json`](.factory/brief.json)
- Visual system and generated-image provenance: [`.factory/design.md`](.factory/design.md)
- Build handoff and verification: [`.factory/handoff.md`](.factory/handoff.md)
- License: [MIT](LICENSE)
