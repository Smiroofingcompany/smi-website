# Schema Release Validation

Run this checklist before pushing schema, template, navigation, sitemap, or page-generation changes to `main`.

## 1. Local Release Gate

```bash
git pull --ff-only origin main
npm run validate:schema-release
```

The release gate validates:

- BlogPosting schema on every blog post
- City RoofingContractor schema on city hubs
- Service schema on service hubs and city-service pages
- BreadcrumbList schema against visible breadcrumbs
- Review and AggregateRating schema against visible review proof
- FAQPage schema against visible FAQ blocks
- Every JSON-LD block parses as valid JSON
- Release-level schema coverage includes Organization, WebSite, BlogPosting, Service, FAQPage, BreadcrumbList, and RoofingContractor

If the command fails, fix the schema issue before pushing.

## 2. Google Rich Results Test

Use the Google Rich Results Test for changed pages or the representative release URLs printed by `npm run validate:schema-release`.

- Before push: use code mode when the changed page is not live yet.
- After Vercel deploy: use URL mode on the live URL.
- Confirm there are no critical structured data errors.

Tool: https://search.google.com/test/rich-results

## 3. Schema.org Validator

Use the Schema.org Validator for the same URLs or rendered HTML snippets.

- Confirm the JSON-LD graph is readable.
- Confirm expected types appear on the page.
- Fix parser errors or invalid nesting before release sign-off.

Tool: https://validator.schema.org/

## 4. Google Search Console Enhancements

After Vercel deploys from `main`, check Search Console for the `smiroof.com` property.

- Open Enhancements / rich result reports.
- Confirm no new invalid items appeared after the release.
- Use URL Inspection on the changed URLs when a page does not appear in the report yet.
- If Google reports a schema issue, fix it in code, push through GitHub, and use validation in Search Console after the fix is live.

Tool: https://search.google.com/search-console

## Representative URL Set

Use these for schema releases unless the changed URLs are more specific:

- https://smiroof.com/
- https://smiroof.com/russellville/
- https://smiroof.com/russellville/roof-repair/
- https://smiroof.com/roof-repair/
- https://smiroof.com/blog/how-to-choose-roofing-contractor-arkansas/
