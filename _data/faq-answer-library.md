# FAQ Answer Library

This library is the reusable draft source for future FAQ blocks. It lives in
`_data/faq-answer-library.json` because the site has no CMS or build step.

## Publishing Workflow

1. Pick the service category and draft that matches the page intent.
2. Replace every `{token}` with real page-specific detail.
3. Add at least one local fact before publishing, such as city, county, nearby
   areas, roof type, weather exposure, property type, or SMI proof.
4. Add the localized FAQ to the visible page.
5. Run `node scripts/sync-faq-schema.mjs --write` so FAQPage JSON-LD exactly
   matches the visible FAQ text.
6. Run `npm run validate:faq-library` before commit.

Do not publish any draft answer exactly as written. The point is faster rollout
without city-name-swap duplicate answers.
