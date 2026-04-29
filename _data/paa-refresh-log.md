# People Also Ask Refresh Log

`_data/paa-refresh-log.json` is the batch-control record for M035.

Before publishing a new FAQ batch:

1. Search each city/service pair and capture current People Also Ask or related
   search questions.
2. Record the refresh in `_data/paa-refresh-log.json`.
3. Map each selected question to a draft in `_data/faq-answer-library.json`.
4. Localize the answer before publishing it on a page.
5. Run `node scripts/sync-faq-schema.mjs --write`.
6. Run `npm run validate:paa-refresh` and `npm run validate:faq-library`.

The refresh log is intentionally short-lived. If the log gets stale, the
validator fails so the next page batch cannot reuse old search-demand data
without making that choice visible.
