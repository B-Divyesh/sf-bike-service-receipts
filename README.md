# Bike Service Receipts

Log service, costs, odometer readings, and reminders for each bike. The app is for cyclists who maintain one or more bikes.

Live product: <https://bike-service-receipts.sociobot.in>

[Try it with sample data](https://bike-service-receipts.sociobot.in/?demo=1). The demo uses separate storage and can be reset at any time.

## What it does

- Create named bike profiles with type, year, identifier, and odometer.
- Record component, action, date, cost, provider, notes, odometer, and an optional photo.
- Search each bike’s service history and delete individual receipts.
- Set reminders from the last service date or odometer reading.
- Export CSV and PDF histories, or a JSON backup that can be merged or restored.
- Install the app and keep records available offline after the first visit.
- Use keyboard controls on the light or dark interface, including on a 390 px phone.

Records stay in this browser unless you export them. The app has no analytics, advertising trackers, third-party scripts, or hosted fonts.

The free version includes one bike, text receipts, default reminders, and every export. Field Guide Plus costs ₹499 once. It adds multiple bikes, compressed photos, and custom reminder intervals. Checkout and license verification use Sociobot.

Reminders are records, not mechanical diagnosis or safety certification.

## Develop

Requirements: Node.js 20 or newer and npm.

```sh
npm ci
npm run dev
```

The development server prints its local URL. The free app needs no environment variables or backend.

## Test and build

```sh
npm test
npm run build
npm run test:e2e
```

Playwright 1.58.2 runs browser tests against a production preview. The build command checks TypeScript and writes the static site to `dist/`.

To inspect the build:

```sh
npm run preview
```

## Data and privacy

Real records use the IndexedDB database `bike-service-receipts`. Demo records use `demo:bike-service-receipts` and never read the real database.

The optional license token uses `sb_license:bike-service-receipts` in localStorage.

The app contacts Sociobot only when a real license needs verification. Clearing browser data can remove records, so keep a JSON backup.

Read the [privacy page](https://bike-service-receipts.sociobot.in/privacy) and [terms](https://bike-service-receipts.sociobot.in/terms).

## Project files

- Product brief: [`.factory/brief.json`](.factory/brief.json)
- Visual system and image provenance: [`.factory/design.md`](.factory/design.md)
- Demo contract: [`.factory/demo.md`](.factory/demo.md)
- Claim tests: [`.factory/claims.json`](.factory/claims.json)
- Release evidence: [`.factory/handoff.md`](.factory/handoff.md)
- License: [MIT](LICENSE)
