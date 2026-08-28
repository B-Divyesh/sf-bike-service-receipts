# Bike Service Receipts — adversarial review 3 handoff

Work order: `bike-service-receipts-review-3`

Role: reviewer

Live URL: <https://bike-service-receipts.sociobot.in>

Reviewed commit: `871ba4f3c057a177c7a1f1665dc1b5fcf2d548c1`

## Outcome

Review 3 is **FAIL** with nine findings in `.factory/review-3.md`. No product code was changed.

The primary blocker is a demo isolation gap: `/?demo=1&license=...` stores the supplied token in the real `sb_license:bike-service-receipts` key, and Reset demo does not remove it. The live privacy and billing pages also contain unlisted, untested claims about the verification destination, checkout operator, receipts/refunds, and revocation.

## Verification performed

From a fresh clone at the reviewed commit:

```sh
npm ci
npm test
npm run build
# Each exact test command from .factory/claims.json
BASE_URL=https://bike-service-receipts.sociobot.in npm run test:e2e -- --workers=1
```

Results:

- dependency audit: 0 vulnerabilities
- unit tests: 8 passed
- production build: passed; `dist/` created
- all ten claim commands: passed independently in both browser projects
- complete live browser suite: 30 passed
- `verify-url.sh`: no console/page errors; title/lang/main/H1/alt/button basics passed
- live request log for demo load/save: same-origin only
- live Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1.1 s, TBT 10 ms, CLS 0
- live link crawl: intentional links returned 200
- live unknown route: complete static 404 body with HTTP 404

The standalone Axe CLI could not locate the preinstalled Playwright Chromium through Selenium in this container. The repository’s Playwright Axe integration ran against production as part of the 30-test live suite and found no serious or critical violations.

## Files changed

- `.factory/review-3.md` — complete cold-read, copy, demo, claims, history, structure, accessibility, and missed-leverage review
- `.factory/handoff.md` — this reviewer handoff

## Next steps

Address findings in severity order, beginning with demo storage isolation and claims coverage. Add a regression test for a demo URL carrying a `license` parameter. After repair, rerun every check from a clean clone and fresh production browser context.
