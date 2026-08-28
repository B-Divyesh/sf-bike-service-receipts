# Bike Service Receipts — review 2 handoff

Work order: `bike-service-receipts-review-2`
Role: reviewer
Live URL: <https://bike-service-receipts.sociobot.in>

## What was done

- Performed a fresh first-read review at 390 px and desktop without scrolling.
- Rechecked the one-click demo, its reset action, separate IndexedDB namespace, real-data separation, and request log.
- Read the brief, visual thesis, claim manifest, all earlier review/polish/handoff material, current source, and README.
- Ran `npm ci`, `npm test`, `npm run build`, every command in `.factory/claims.json`, and the complete browser suite from a fresh local clone. The final suite result was 26 passed.
- Crawled the live primary routes and links; checked titles, focus after client navigation and Back, metadata after render, security headers, sitemap/robots, and the unknown-route response with and without JavaScript.
- Wrote `.factory/review-2.md`. No product code was changed.

## Verification commands

```sh
npm ci
npm test
npm run build
npm run test:e2e -- --workers=1
```

Each individual `npm run test:e2e -- --grep @claim:<id> --workers=1` command for all ten IDs in `.factory/claims.json` also passed from the clean clone.

## Known gap

The review verdict is **FAIL** because an unknown deployed URL returns status 404 with `index.html` as its body. With JavaScript disabled it shows root title/metadata and no H1, instead of the designed static 404. This reopens prior finding F-1-6 as F-2-1. See `.factory/review-2.md` for the exact evidence and required deployment/configuration fix.
