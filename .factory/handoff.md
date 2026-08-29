# Bike Service Receipts — polish round 4 handoff

Work order: `bike-service-receipts-polish-4`
Role: repair
Live URL: <https://bike-service-receipts.sociobot.in>
Implementation commit: `b745551`
Deployment: `06e33265-c73f-4b4b-bec2-7e8cd9a76f4c`

## Completed

- Closed review-4 finding F-4-1 with a dedicated `photo-source-limit` claim.
  The browser test rejects a 10,000,001-byte image without writing a receipt
  or reminder, then accepts a valid image at exactly 10,000,000 bytes.
- Re-audited and retained every repair from reviews 1–3: complete import
  validation and recovery, the isolated seeded demo, all claim tests,
  first-screen copy, complete landing sequence, route focus, metadata, legal
  routes, static 404, mobile layout, security headers, and offline behavior.
- Updated the runtime/static build labels and service-worker cache to
  `polish-4` so installed clients receive the repaired artifact.
- Updated the README, copy audit, and 84-character verb-first catalog sentence.
- Preserved the botanical field-guide palette, typography, paper texture,
  receipt layout, original illustration, interaction grammar, and offline PWA
  deployment class.
- Wrote the finding-by-finding closure and evidence map in
  `.factory/polish-4.md`.

## How to run

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run preview
```

Each exact claim command is in `.factory/claims.json`. The direct demo URL is
<https://bike-service-receipts.sociobot.in/?demo=1>.

## Verification evidence

Clean clone `/tmp/bike-polish4-clean-0YPwmE` at `b745551`:

- `npm ci`: 60 packages audited, zero vulnerabilities.
- `npm test`: 8/8 unit tests passed.
- `npm run build`: passed; `dist/index.html` exists.
- All 12 exact claim commands: 2/2 each, one desktop and one Pixel 5 run.
- Full Playwright suite: 36/36 passed.

Production after deployment:

- Full Playwright suite: 36/36 passed against the live HTTPS URL.
- Demo isolation: real local/session keys and IndexedDB survived a demo
  credential URL, edit, reset, and exit unchanged.
- Privacy: a demo save used only `demo:bike-service-receipts` and made no
  cross-origin request.
- Offline: the controlled demo reloaded and saved a receipt without a
  connection after its first visit.
- Accessibility: Playwright Axe found no serious/critical issue across root,
  demo, Privacy, and 404 in desktop and mobile projects. Reduced motion,
  keyboard focus, 390 px overflow, labels, landmarks, headings, and alts pass.
- URL verifier: zero console/page errors, `lang=en`, one H1, one main, zero
  missing alts, zero unlabeled buttons. See
  `.factory/evidence/polish-4-live/verify.json`.
- Routes and links: root, demo, Privacy, and Terms return 200 with distinct
  titles/metadata and no console errors; every discovered link returns 200.
  The unknown path returns the complete static 404 document. See
  `.factory/evidence/polish-4-live/route-link-audit.json`.
- Live asset integrity: `index-DcZof83_.js` matches local and production
  SHA-256 `0d4034ad71d26d9168c131e86814f4f6146a37afa72934bf3d5f55614ae0ec02`.
- Headers: root sends CSP, Permissions-Policy, Referrer-Policy, nosniff, and
  frame protection; hashed assets use one-year immutable caching. See
  `root-headers.txt` and `asset-headers.txt` in the live evidence directory.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 1.0 s, LCP 1.2 s, TBT 60 ms, CLS 0, 66 KiB transferred. See
  `.factory/evidence/lighthouse-live-polish-4.json`.
- Budgets: JavaScript 56,259 bytes raw / 17,638 gzip; CSS 25,817 bytes raw /
  6,284 gzip; mobile AVIF hero 29,229 bytes.

Key screenshots:

- Cold mobile landing: `.factory/evidence/polish-4-live/welcome-mobile.png`
- Isolated demo: `.factory/evidence/polish-4-live/demo-isolated-mobile.png`
- Photo limit error: `.factory/evidence/polish-4-live/photo-limit-error-mobile.png`
- Import recovery: `.factory/evidence/polish-4-live/recovery-mobile.png`
- Privacy and Terms: `.factory/evidence/polish-4-live/privacy-desktop.png` and
  `.factory/evidence/polish-4-live/terms-desktop.png`
- Static 404: `.factory/evidence/polish-4-live/not-found-desktop.png`

## Known gaps and next steps

No acceptance, functional, accessibility, privacy, offline, or deployment gap
remains. Purchases are intentionally closed and the UI states this. If sales
open later, register the product through Sociobot and add claim tests for the
live checkout contract before changing that copy.
