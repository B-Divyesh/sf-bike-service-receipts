# Bike Service Receipts — polish round 2 handoff

Work order: `bike-service-receipts-polish-2`

Role: repair

Live URL: <https://bike-service-receipts.sociobot.in>

Implementation commit: `a5273ac7aac566040cb1689d2a802f522966ce9c`

## Outcome

All findings in `review-1.md` and `review-2.md` are closed. Unknown deployed URLs now return the complete styled static 404 document before JavaScript, rather than a 404 response containing the landing shell. The repair keeps the botanical field-guide identity, explicit SPA routes, isolated demo, local-first data model, claims contract, and PWA deployment class.

The adjacent offline failure mode was also closed: the service worker caches only successful HTML navigation responses, so a missing URL cannot overwrite its cached app shell.

## Exact verification

From fresh clone `/tmp/bike-service-receipts-clean-zivIQr` at the implementation commit:

```sh
npm ci
npm test
npm run build
# Then every exact test command in .factory/claims.json, separately
npm run test:e2e -- --workers=1
```

Results:

- dependency audit: 0 vulnerabilities
- unit tests: 8 passed
- production build: passed; `dist/index.html` present
- claim tests: all 10 commands passed independently, 2 browser projects each
- clean-clone browser suite: 30 passed
- live browser suite: 30 passed with `BASE_URL=https://bike-service-receipts.sociobot.in`
- dedicated live static-404 test: 2 passed with JavaScript disabled
- root verifier: one H1, main landmark, all image alt attributes present, no unlabeled buttons, zero console/page errors
- mobile Lighthouse: Performance 98, Accessibility 100, Best Practices 100, SEO 100; LCP 1.1 s, CLS 0, TBT 170 ms
- payload: JS 53,818 bytes raw / 17.25 KB gzip; CSS 22,259 bytes raw / 5.70 KB gzip; mobile AVIF 29,229 bytes; no fonts
- live headers: hashed JS uses `Cache-Control: public, max-age=31536000, immutable`; CSP, Permissions-Policy, Referrer-Policy, nosniff, and frame restrictions present

## Deployment and cold checks

Deployed through `/opt/fleet/lib/deploy-static.sh bike-service-receipts dist` to Azure Static Web Apps. Deployment ID: `b3dedda3-4d17-4c3c-a390-afd0f67712b2`.

Cold live checks covered `/`, `/?demo=1`, `/demo`, `/privacy`, `/terms`, and `/not-a-real-route`. The unknown route returned HTTP 404 with:

- title `Page not found — Bike Service Receipts`
- H1 `This page is not in the log`
- canonical `https://bike-service-receipts.sociobot.in/404`
- description, Open Graph/Twitter image metadata, and Apple-touch icon
- shared navigation/footer and `Return to the service log`

Evidence is in `.factory/evidence/polish-2-live/`, `.factory/evidence/polish-2-live-404-{desktop,mobile}.png`, `.factory/evidence/polish-2-live-{demo-mobile,privacy-desktop}.png`, `.factory/evidence/lighthouse-live-polish-2.json`, and `.factory/polish-2.md`.

## Known gaps and next steps

No acceptance or review gap remains. Field Guide Plus sales remain intentionally closed and are described that way; existing-license restore is available. No infrastructure, billing, or DNS configuration was changed outside the authorized deployment script.
