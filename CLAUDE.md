# CLAUDE.md — SMI Roofing Website
# Claude-specific notes. All shared rules live in AGENTS.md.

@AGENTS.md

---

## WHO YOU ARE WORKING FOR

Cory Smith, owner of SMI Roofing (CAS Management Inc.), Russellville, Arkansas.
302 East Parkway Drive, Suite C, Russellville, AR 72801.
Phone: (501) 464-5139
Email: info@smiroof.com
Website: smiroof.com
Google reviews: 231+ at 5.0 stars. 35 years experience. 1,700+ roofs completed.

Working style: Execute immediately. No permission needed. No handoffs.
Fix every identified issue in the same session. Brutal honesty only.

---

## REPO AND DEPLOYMENT

GitHub repo: github.com/Smiroofingcompany/smi-website
Branch: main (auto-deploys to smiroof.com via Vercel)
Git config name: SMI Roofing
Git config email: smiroofingcompany@gmail.com

Vercel projectId: prj_Ur8yabvNY8MrzTG1CgQzr39MU7tn
Vercel teamId: team_YEyhFvcZVhdtBmQHYhPqk8yK

Tokens are in `.env` in the repo root. Never commit `.env`.
Read tokens from `.env` at the start of each session.

---

## SESSION STARTUP PROTOCOL

Do these steps before writing a single line of code:

1. Pull the latest from GitHub — never work from a stale local copy
2. Audit the current file tree — know what exists before adding anything
3. Check `index.html` for current nav structure (desktop AND mobile)
4. Extract CSS variables from existing pages before generating new ones
5. Identify the session goal and exact files in scope
6. Begin work
7. Update AGENTS.md + CLAUDE.md before the final commit

---

## CRITICAL COMPLIANCE BLOCK — DO NOT EVER TOUCH

The SMS opt-in checkbox on the contact form is A2P 10DLC compliance-required.
Wrapped in:

```
<!-- A2P 10DLC COMPLIANCE BLOCK — DO NOT MODIFY OR REMOVE -->
```

Never remove, move, or alter the checkbox, its label, its ID (`cf_sms_consent`),
or the JS validation. A Twilio campaign registration is currently pending.
Touching this could invalidate the entire registration.

---

## TOOLS AND INTEGRATIONS

CRM: crm.smiroof.com (custom React app, separate repo)
Jobber booking: clienthub.getjobber.com/booking/31b1fe0c-4da6-49e9-ad15-2e9a8cefa5fb
SMS: Twilio (credentials in Vercel env vars — already set)
Photos: SMI Cam (built into the SMI CRM at crm.smiroof.com — replaced CompanyCam). Project photos still need to be added to commercial pages.
Financing: Wisetack
Email: smiroofingcompany@gmail.com (active), info@smiroof.com (not confirmed active)

---

## WHAT IS STILL BROKEN OR INCOMPLETE

Fix these when they come up. Do not wait for a separate session.

- SMTP env vars not set in Vercel — internal email notifications not sending. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS to enable. (Session 9 fixed the LEAD_NOTIFY_TO fallback-recipient typo in /api/contact.js — was `…@gmaill.com`, double-L — so once SMTP is live, lead emails route to Cory's inbox even if LEAD_NOTIFY_TO is left unset.)
- Commercial project photos: the hub + 8 commercial SERVICE pages now show real SMI /assets/ photos (session 8). Still wanted from Cory via SMI Cam in the CRM — true flat-membrane photos for TPO/EPDM/mod-bit/BUR/coatings (those pages currently share the commercial-building, crew, and field-inspection shots), and project photos for the 13 commercial CITY pages still missing them
- LSA profile has wrong phone number and website URL
- info@smiroof.com and cory@smiroof.com not confirmed active
- Directory listings (GAF, Owens Corning, BBB, Angi, HomeAdvisor, Chamber)
  — Cory must claim these manually with his login
- Google Business Profile: needs 1-2 posts/week using SMI Cam photos from the CRM
- Google Search Console: submit sitemap.xml to queue all new URLs
- Twilio A2P campaign registration outcome still pending

---

## ON THE HORIZON

Do not start without explicit instruction from Cory.

- 9th commercial service page: commercial roof inspections / preventive maintenance (a preventive-maintenance BLOG post now exists at /blog/commercial-roof-maintenance-arkansas/ as of session 7; the standalone commercial service PAGE is still to be built)
- GBP post content calendar: 4 weeks of draft posts
- Blog expansion: additional local market posts for NW Arkansas cities
- Replace placeholder /assets/ photos with real SMI Cam project photos from the CRM
- Add SMI Cam project photos (from the CRM) to the 13 commercial city pages still missing them (P0 from 2026-04-17 audit — Pottsville, Rogers, Springdale, Bentonville, Fayetteville, Siloam Springs, Little Rock, North Little Rock, Maumelle/Sherwood, Searcy, Conway, Bryant, Benton). Van Buren, Jacksonville, Cabot are templates.
- Fix Google Business Profile service-area settings so prospects searching "SMI Roofing [city]" from door-knock towns see local presence, not just Russellville HQ
- Submit updated sitemap.xml to Google Search Console and request indexing on top 10 city pages
- Consider extracting shared inline CSS into /assets/site.css — would cut repeat page weight ~30% but breaks the "no build step" model; confirm with Cory before doing
- Footer consistency (found 2026-06-03): blog, cost, and comparison pages (~70 files) use a footer "Residential" column that omits "Repairs & Inspections" (`/roof-repair/`), which the money- and city-page footers include. Adding it would give `/roof-repair/` ~70 more sitewide inbound links and make footers uniform. Left undone this session because it touches many files and the task scope was contextual links only — confirm with Cory before doing, and keep it to the single existing link (not a new link block).
- Localize the remaining 26 non-priority residential city pages (found 2026-06-03, session 6): the 15 priority cities now have unique local coverage blocks + city-specific weather sentences + residential↔commercial cross-links, but the other 26 (alma, arkadelphia, atkins, beebe, benton, booneville, bryant, cabot, dover, el-dorado, glenwood, gurdon, hartford, hope, hot-springs, jacksonville, jonesboro, london, malvern, maumelle-sherwood, mena, nashville, pottsville, searcy, siloam-springs, vilonia) still carry the generic "coverage proof" meta-boilerplate, the shared 3-variant weather sentence, and no commercial cross-link. Same safe pattern applies — but write only verified local facts (county, real landmarks/neighborhoods, nearby towns); do not invent. Reusable codemod pattern is documented in the change log.

---

## COMPETITORS (FOR SEO CONTEXT)

Griffin's Roofing: Will Griffin, 3 brands from a home address. Weak.
Miller Roofing: GAF Master Elite, 35 years, 109 reviews at 4.5. Legitimate.
BRS Inc.: Ghost company names, broken website. Not a real threat.
Freedom Roofing: Minimal digital presence.

SMI's moat: 231 reviews at 5.0, 35 years, 1,700+ roofs. Lead with this everywhere.

---

## SYNC RULE (CLAUDE-SPECIFIC)

Shared rules live in `AGENTS.md`. Do not duplicate them here.
When updating shared rules, edit `AGENTS.md` first, then commit both files.
Claude-specific content (session protocol, Cory's context, integrations,
broken items, competitors) stays here only.

---

## INSTRUCTION FILE CHANGE LOG

Every edit to either instruction file must be logged here AND in AGENTS.md.
Format: `YYYY-MM-DD | Agent | File(s) | What changed`

| Date | Agent | File(s) | Change |
|------|-------|---------|--------|
| 2026-04-05 | Claude | CLAUDE.md | Initial session — 26 commercial city pages, cost FAQs, blog cross-links, sitemap |
| 2026-04-05 | Claude | CLAUDE.md | Built /api/contact.js, set Twilio env vars |
| 2026-04-06 | Claude | CLAUDE.md | Self-hosted all assets in /assets/, removed Cloudinary |
| 2026-04-06 | Claude | CLAUDE.md | Hero video on 58 city pages, fade-in glitch fix |
| 2026-04-07 | Claude | AGENTS.md | Created AGENTS.md as sanitized mirror |
| 2026-04-07 | Claude | AGENTS.md + CLAUDE.md | Sync rule, change log, attribution convention |
| 2026-04-07 | Claude | AGENTS.md + CLAUDE.md | Restructured: AGENTS.md is source of truth, CLAUDE.md imports via @AGENTS.md |
| 2026-04-17 | Claude | AGENTS.md + CLAUDE.md | Full site audit pass (P0-P2 #1-20): localized footer/legal/hero banner 58 city pages, Nearby + Related Blog on 32 residential, neighborhoods on top 10, Russellville expansion, sitemap dates, schema fixes, image compression, contact form microcopy |
| 2026-04-21 | Claude | AGENTS.md + CLAUDE.md | Installed Meta (Facebook) Pixel ID 2124552908380703 in `<head>` of all 120 HTML files — fires PageView on every page sitewide |
| 2026-06-01 | Claude | AGENTS.md + CLAUDE.md | Image loading audit: added loading="lazy" + intrinsic width/height to 2869 img tags across 558 HTML files; added fetchpriority="high" to LCP images; added scripts/update-image-attrs.mjs |
| 2026-06-01 | Claude | AGENTS.md + CLAUDE.md | Schema SEO pass: added Service schema (serviceType, areaServed, hasOfferCatalog) to all 41 service-areas/ city pages; added hasOfferCatalog (7 services) to homepage Organization node; extended scripts/sync-service-schema.mjs to manage residential city pages; Service count 379→420; all validations pass |
| 2026-06-01 | Claude | AGENTS.md + CLAUDE.md | Conversion CTA pass: strengthened final CTA copy on homepage, storm-damage, insurance-claims, metal-roofs, commercial-roofing; updated mobile sticky bar labels from "Call/Form" → "Call Now/Free Inspection" across all 561 pages sitewide |
| 2026-06-01 | Claude | vercel.json + AGENTS.md + CLAUDE.md | Cache-header fix: clean-URL HTML pages (`/` and `/:path*/`) now send `no-cache, no-store, must-revalidate` + `Pragma: no-cache`. Prior rule only matched `/(.*).html`, so clean canonical URLs were edge/proxy-cached and could replay stale CTA HTML to public fetchers (this was the cause of the "old CTA still showing" reports). Diagnosed via public no-query curl + independent WebFetch; public output confirmed byte-identical to repo, alias confirmed on newest commit. |
| 2026-06-01 | Claude | AGENTS.md + CLAUDE.md | Internal link audit + strengthening pass: 18 contextual body links added across 7 files. /roof-inspections/ gained 4 inbound links (homepage, storm-damage, roof-repair, blog cost post); /metal-roofs/ gained 3; /residential-roofing/ gained 2; /storm-damage/ and /insurance-claims/ gained links from roof-repair FAQ; /commercial-roofing/tpo-roofing/ and /commercial-roofing/commercial-roof-repair/ each gained 2-3 inbound links from commercial blog posts. |
| 2026-06-03 | Claude | 15 HTML files + AGENTS.md + CLAUDE.md | Contextual internal-link pass #2: fixed 9 broken blog sidebar links (`/blog/file-roofing-insurance-claim/` → `…-arkansas/`, missing suffix); added 13 contextual body links across 8 pages (homepage, roof-replacement-cost-2026 blog, signs-you-need-new-roof, how-long-does-roof-last, hail-storm-roof-damage, emergency-roof-tarping, TPO, commercial-roof-repair). Targeted the two under-linked money pages: /roof-repair/ contextual inbound 89→93 (homepage + cost blog + signs + tarping), /roof-inspections/ 56→59; plus /metal-roofs/ +1, /residential-roofing/ +1, reciprocal blog↔commercial links, /commercial-roofing-cost/ fed from both commercial money pages. Varied anchors, no footer dumps. Site-wide: 0 broken internal links; predeploy/FAQ/PAA/breadcrumb/blogposting validations all pass. |
| 2026-06-03 | Claude | 30 city pages + sitemap.xml + AGENTS.md + CLAUDE.md | Local city-content pass #1 (15 priority cities): audit found the residential coverage section carried the SAME meta-boilerplate ("The map stays near the bottom as coverage proof…") on all 41 pages and zero neighborhood content sitewide, plus a promise weather sentence templated into only 3 regional variants (7 River Valley cities shared one verbatim). Rewrote the coverage block on the 15 priority residential pages with real local content — county, geography/landmarks, real neighborhoods, nearby towns, local roof/storm concerns, service fit + contextual links to /roof-repair/, /residential-roofing/, /storm-damage/, /insurance-claims/; made each promise weather sentence city-specific (3→15 unique). Added bidirectional residential↔commercial city cross-links for all 15 (none existed). Commercial pages were already richly localized (real employers, all requested building types) so they were left as-is apart from the new residential cross-link in the closing CTA. Bumped sitemap lastmod on the 45 affected entries. Codemod via /tmp scripts (not committed); A2P + nav + JSON-LD untouched. |
| 2026-06-03 | Claude | 6 new + 3 existing blog posts + blog/index.html + sitemap.xml + scripts/validate-schema-release.mjs + AGENTS.md + CLAUDE.md | High-intent AEO blog expansion (priority topics audit). Created 6 posts: roof-repair-vs-replacement-arkansas (residential repair-vs-replace — commercial version already existed), how-long-does-roof-replacement-take-arkansas (timeline, distinct from what-happens-during process post), what-does-a-roof-inspection-include (general checklist vs storm-season post), what-roof-damage-insurance-covers-arkansas (coverage matrix vs denial/filing posts), commercial-flat-roof-repair-arkansas (leak response — fills gap, matches /commercial-roofing/commercial-roof-repair/ service page), commercial-roof-maintenance-arkansas (preventive program — clear gap). Each: Quick-Answer lead (≤40 words), question H2s, FAQ accordion→FAQPage schema, BlogPosting/BreadcrumbList/RoofingContractor JSON-LD, service-page links, CTA. Improved 3 covered topics: Quick Answer added to hail-storm-roof-damage + emergency-roof-tarping; service links added to metal-roof-vs-shingles; dateModified + sitemap lastmod bumped on all 3. Did NOT duplicate already-covered topics (metal-vs-shingles, what-happens-during). Index cards + 6 sitemap URLs added; BlogPosting floor 38→44. predeploy/faq-library/paa-refresh pass; 0 broken links. |
| 2026-06-03 | Claude | 9 commercial pages + sitemap.xml + AGENTS.md + CLAUDE.md | Commercial conversion pass (session 8). Audited the 9 priority commercial pages: all used video heroes + pure-text bodies with ZERO real project photos. Injected a reusable "Commercial Proof" section (scoped CSS in the head style block + HTML inserted before the FAQ) on the hub + 8 service pages — a real SMI /assets/ photo (smi-commercial-steel-roofing on standing-seam + metal-panel; smi-commercial-aerial-roof on hub/tpo/coatings; smi-storm-roof-inspection on repair + mod-bit; smi-two-roofers-jobsite on epdm; smi-active-roof-documentation-aerial on built-up — each with descriptive alt + intrinsic w/h + loading=lazy + decoding=async) paired with a 6-point proof grid (photo documentation, leak/storm response, jobsite coordination, scheduling around operations, written budget, maintenance/warranty) + contextual sibling/repair/cost links. Strengthened every final CTA to commercial-specific copy (repair page leads with "Get a Commercial Roof Repair Plan" / "Call SMI for Roof Leaks"; others "Schedule a Commercial Assessment"; all add a 24/7 leak line + tel:+15014645139; #free-estimate kept on hub, data-open-inspection-form on service pages). Codemod via /tmp/inject-comm-proof.mjs (not committed; idempotent; asserts each replacement). A2P/nav/footer/api untouched; predeploy/faq-library/paa-refresh pass; 0 broken links; rendering verified desktop + mobile in preview. STILL TO DO: true flat-membrane project photos for TPO/EPDM/mod-bit/BUR/coatings (they currently share the commercial-building/crew/inspection shots — honest but not membrane-specific); 13 commercial CITY pages still need SMI Cam photos. |
| 2026-06-03 | Claude | api/contact.js + assets/instant-inspection-widget.js + 43 HTML (homepage, 41 residential city forms, commercial hub) + AGENTS.md + CLAUDE.md | Lead-capture audit + safe fixes (session 9). Fixed a clear bug in /api/contact.js — the `LEAD_NOTIFY_TO` fallback recipient was misspelled with a double-L domain (`…@gmaill.com`), so internal lead-notification emails would bounce to a non-existent address whenever SMTP is configured but LEAD_NOTIFY_TO is unset; corrected to `…@gmail.com` (recipient string only — Twilio + SMTP transport logic untouched). Replaced the conflicting form-success promise ("We will contact you within 24 hours" — the form said 24h while the Twilio confirmation SMS says ~1h) with "We'll review your request and call you with a clear next step. For urgent leaks, call (501) 464-5139." across homepage + 41 residential city forms + commercial hub via an asserted exact-string codemod (/tmp, not committed); the A2P consent block was captured and verified byte-identical before/after on all 43 files. Aligned the instant-inspection widget success copy to the same voice (phrased apostrophe-free because it lives inside a single-quoted JS string). Fixed a homepage-only retry-button-label inconsistency (error path restored "Get My Free Inspection →" vs the initial "Request Free Inspection"; the 41 city pages already restored correctly). Aligned the commercial-hub form intro subhead off the now-orphaned "24 hours" promise. A2P block, nav (desktop+mobile), footer, and the /api/contact field contract (name/phone/email/service/message/smsConsent/page) all untouched; `node --check` passes on both JS files; predeploy/faq-library/paa-refresh all pass; 0 broken internal links; scope = exactly 45 code files. STILL NEEDS CORY (manual, in Vercel): set SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS to turn on internal lead-notification emails; optionally set LEAD_NOTIFY_TO (recipient override) and CRM_API_TOKEN (CRM auth). Did NOT add the "Photos and inspection notes…" microcopy line — neither form has a photo/notes field, so it would imply a capability that isn't there; flagged for inspection landing pages instead. |
| 2026-06-05 | Claude | DELETED 31 out-of-state pages (dfw/ fort-worth/ houston/ san-antonio/ nashville-tn/ + the all-Texas Spanish es/) + scripts/generate-spanish-texas-pages.mjs; MODIFIED vercel.json, sitemap.xml, areas-we-serve, insurance-claims, site-map, scripts/generate-state-farm-claim-pages.mjs + AGENTS.md + CLAUDE.md | Session 10 — full-site audit + out-of-state cleanup. A 14-agent audit (adversarially verified) found the site had been built by copying TX competitor Hargrove Roofing, dragging in 31 out-of-state pages: DFW / Fort Worth / Houston / San Antonio (TX), Nashville (TN) — each with a /state-farm-roof-claim/ subpage — PLUS an entire Spanish /es/ section containing ONLY those Texas cities. All 31 were in sitemap.xml and linked from 3 legitimate AR pages incl. the /insurance-claims/ money page and the /areas-we-serve/ nav hub ("Primary Metro Growth Markets" + "Texas Roofing Pages in Spanish" sections). Removed all 31 pages, stripped their 31 sitemap <loc> blocks, cleaned every internal link (areas-we-serve Texas/Spanish sections + meta/FAQ-schema/placeholder copy; 5 TX/TN links in insurance-claims; 31 site-map items), added 6 prefix 301s to vercel.json (→ /areas-we-serve/) so dead URLs consolidate instead of 404, deleted the pure-Texas Spanish generator, and emptied the TX/TN fallback maps in the State Farm generator (AR generation intact). KEPT Nashville, AR (/nashville/ + /service-areas/nashville-ar/) — only Nashville-TN removed. Verified via asserted codemod: 588→557 HTML, 586→555 sitemap URLs, 0 residual Texas links, 0 broken internal links, schema-release/faq-library/paa-refresh all pass. Audit also surfaced (in progress / pending): the 404-page top-level /[city]/ hub system cannibalizes the richer /service-areas/ pages — Cory chose to KEEP /service-areas/ as canonical residential and consolidate the hubs into it; NO analytics/GA4/call tracking exists sitewide (only Meta Pixel PageView); Wisetack financing appears on only 1 page; the 4 /industries/ pages are orphaned; no dedicated commercial roof-inspection/PM page. |
| 2026-06-05 | Claude | DELETED 41 top-level /[city]/ hub directories (404 pages) + MODIFIED vercel.json, sitemap.xml, 19 linking files, site-map/index.html, 7 money-page Service schemas + AGENTS.md + CLAUDE.md | Session 10 — city-page consolidation (Cory's call: keep /service-areas/ as canonical residential). The audit found a 404-page top-level /[city]/ "City Hub" system (41 hubs + 6 service subpages each + a /state-farm-roof-claim/ doorway + neighborhood pages) duplicating and cannibalizing the richer /service-areas/[city]-ar/ pages — identical H1s, both self-canonical, both in the sitemap; Russellville alone had ~20 competing URLs; neighborhood pages were 85-93% boilerplate and had leaked AI meta-commentary into live copy. Consolidated the whole hub system INTO /service-areas/: repointed 933 internal links (359 relative + 574 absolute) across 19 files to the /service-areas/[city]-ar/ twin, removed the 404 hub <loc> blocks from sitemap.xml (555→151), deleted all 41 hub directories, added 82 per-city 301 redirects to vercel.json (/[city]/ and /[city]/:path* → /service-areas/[city]-ar/), re-synced the 7 money-page Service schemas (sync-service-schema --write), and regenerated site-map/index.html. Verified: 557→153 HTML files, 151 sitemap URLs, 0 broken internal links, 0 residual hub references, all 7 schema/faq/paa validators pass, redirects confirmed. /service-areas/ (41) + /commercial-roofing/ (27 city + 8 service + hub) untouched. STILL PENDING (next priorities from the audit): install GA4 + call tracking + form-submit conversion events (site has NONE — only a Meta Pixel PageView, so Cory can't see what drives calls); add Wisetack financing to the residential money pages (currently on only 1 page); link the 4 orphaned /industries/ pages from the commercial hub/nav + add city-level areaServed to the 8 commercial service pages; build commercial roof-inspection/PM + 24/7 emergency-leak + agricultural/poultry pages; localize remaining boilerplate city pages. |
| 2026-06-05 | Claude | commercial-roofing/index.html + 8 commercial service pages + AGENTS.md + CLAUDE.md | Session 10 — commercial linking + geo-targeting (commercial-first priority). Fixed the orphaned /industries/ pages: added a linked "Industries We Serve — Commercial Roofing by Building Type" section to the commercial hub (warehouse-industrial, retail-office, healthcare-education, church-government) — they had only 1 inbound link (site-map) and now also link from the authoritative hub. Added city-level areaServed (10 priority commercial cities — Russellville, Conway, Little Rock, North Little Rock, Fort Smith, Fayetteville, Springdale, Rogers, Bentonville, Benton + Arkansas state) to the Service schema on all 8 commercial service-type pages (TPO, standing-seam-metal, metal-panel, EPDM, modified-bitumen, built-up, coatings, commercial-roof-repair) — previously areaServed=State only, so material+city queries had no geo signal. Done via JSON-LD parse (Service node only; RoofingContractor areaServed untouched). Verified: 0 broken links; schema-release/service-schema/faq-library validators pass. STILL TO BUILD (commercial, next): the 3 missing high-intent pages — commercial roof inspection / preventive-maintenance, 24/7 emergency commercial leak, agricultural/poultry/metal-building. ALSO PENDING: GA4 + CallRail call tracking + form-lead events (Cory opted in; awaiting his GA4 G- id + CallRail account); Wisetack financing on residential money pages (awaiting apply link). |
| 2026-06-05 | Claude | NEW pages: commercial-roofing/commercial-roof-inspections/, commercial-roofing/emergency-roof-repair/, industries/agricultural-poultry-roofing/ + commercial-roofing/index.html + sitemap.xml + site-map/index.html + AGENTS.md + CLAUDE.md | Session 10 — built the 3 missing high-intent commercial pages (commercial-first, Cory approved). (1) Commercial Roof Inspections & Preventive Maintenance — the long-flagged "9th commercial service page" (inspections, infrared moisture scanning, condition assessments, PM program; targets "commercial roof inspection / preventive maintenance Arkansas"). (2) 24/7 Emergency Commercial Roof Leak Repair — leak containment, same-day dry-in, storm response; deliberately DISTINCT from commercial-roof-repair (emergency intent) and cross-linked to avoid cannibalization. (3) Agricultural & Poultry Building Roofing (under /industries/) — poultry houses, barns, ag metal buildings, coatings; large AR market. Each cloned byte-for-byte from an existing template via /tmp/build_comm_pages.py (commercial pages off commercial-roof-repair; ag page off warehouse-industrial-roofing) so nav (desktop+mobile), footer, CSS, Meta Pixel, and the inspection-widget hook are IDENTICAL to live pages; content hand-authored and truthful (no fabricated clients/jobs/guarantees/certs); full Service + FAQPage + BreadcrumbList + RoofingContractor JSON-LD with FAQPage rebuilt from the same data so the visible accordion == schema (caught + fixed an &mdash; entity mismatch); 10-city areaServed; standard CTAs + sticky call bar. Linked all 3 from the commercial hub (2 new comm-service-cards + the agricultural card in the new Industries section); added to sitemap.xml; regenerated site-map. Verified: 153→156 HTML, 151→154 sitemap URLs, 0 broken links, schema-release/faq-library/paa-refresh all pass, nav/footer/CSS byte-identical to template, interactive elements present. |
| 2026-06-05 | Claude | 8 commercial service pages (sidebar interlink) + 26 residential service-areas city pages (localized) + sitemap.xml + AGENTS.md + CLAUDE.md | Session 10 — commercial + residential depth pass. COMMERCIAL: interlinked the 2 new commercial pages (commercial-roof-inspections, emergency-roof-repair) into the sidebar of all 8 existing commercial service pages, so each new page now has 12 inbound links (was 1); confirmed the 4 /industries/ pages were ALREADY substantive (1,225-1,560 words + FAQPage schema — the earlier audit undercounted them) so no expansion was needed; main remaining commercial gap is real SMI Cam project photos (Cory). RESIDENTIAL: localized the 26 city pages still running generic META-boilerplate (the "map stays near the bottom as coverage proof" / "[City] has its own local roofing page" text — commentary about the webpage, not the city). Replaced eyebrow/headline/lede/note with real, web-research-VERIFIED local content (county, region, real nearby towns, highways, verified landmarks/employers) via a 2-stage workflow (research → adversarial fact-check against sources). The fact-checker caught + corrected real errors — e.g. Booneville's Highway 23 falsely called "the Pig Trail" (that byway is 50+ mi north), Beebe's distance to Searcy overstated, Hot Springs/Bryant/Malvern location errors. Each localized lede now carries contextual links to /roof-repair/ /residential-roofing/ /storm-damage/ /insurance-claims/; kept the already-local "Serving [City], AR [ZIP]" h3. NO fabrication (verified facts only); the 6 cities that timed out in batch 1 were re-run and reshaped to the city-first house style. Bumped sitemap lastmod on the 26. Verified: 0 broken links; schema-release/faq-library/paa-refresh pass; coverage boilerplate now 0/41 (was 26). PENDING (needs Cory): GA4 + CallRail (he opted in — awaiting G- id + account); SMI Cam commercial project photos. |
| 2026-06-05 | Claude | NEW: commercial-roofing/dover-ar/, commercial-roofing/london-ar/ + service-areas/{russellville,dover,london}-ar/ + commercial-roofing/index.html + sitemap.xml + site-map/index.html + AGENTS.md + CLAUDE.md | Session 10 — home-base depth (Cory's focus: Russellville + Pottsville + Dardanelle + Dover + London). Built the 2 MISSING commercial city pages — Dover and London (both had residential but NO commercial page, so SMI was invisible for "commercial roofing Dover/London"). Cloned byte-for-byte from commercial-roofing/dardanelle-ar (nav desktop+mobile, footer, CSS, Meta Pixel, inspection-widget hook identical), localized with verified Pope County facts, rebuilt Service/FAQPage/BreadcrumbList JSON-LD from data (visible FAQ == schema), ran sync-city/service/breadcrumb/gallery scripts. Linked both from the commercial hub city grid + added residential→commercial cross-links on the Dover/London residential pages. Enriched the Russellville residential coverage lede with Arkansas Nuclear One + ATU as the River Valley's largest employers (its one real local omission; commercial Russellville already covered them). ALL new content adversarially fact-checked against web sources BEFORE deploy — caught + fixed 3 errors: Dover "original" Pope County seat → "former" (Norristown was the original; Dover was the 2nd seat, 1841-1887); London "~12 miles" → "~9 miles" from Russellville; removed a NON-EXISTENT "London School District" (London Elementary is part of the Russellville School District). Did NOT touch Pottsville commercial — verified it ALREADY has strong local proof (US-64, fast-growing Pottsville School District, Tractor Supply, River Valley Agri-Business); the 5 residential coverage ledes were already well-localized from prior rounds. Verified: 156→158 HTML, 156 sitemap URLs, 29 commercial city pages, 0 broken links, all schema/faq/paa + sync validators pass. |

---

## LAST UPDATED

June 5, 2026 (session 10) — Claude

---

## END-OF-SESSION UPDATE INSTRUCTIONS (PERMANENT — DO NOT REMOVE)

Before the final commit of every session, update BOTH files.

**AGENTS.md (shared rules — source of truth):**
- Add a row to INSTRUCTION FILE CHANGE LOG: `YYYY-MM-DD | Claude | Files | What changed`
- Update LAST UPDATED line
- Update any shared rules that changed (deployment, coding, structure, SEO, protected files)

**CLAUDE.md (Claude-specific notes):**
- Add a matching row to INSTRUCTION FILE CHANGE LOG
- Update LAST UPDATED line
- Update broken/incomplete list, on the horizon, integrations, or session context
- Do NOT duplicate shared rules from AGENTS.md here

**Commit both together:**
`chore: update AGENTS.md + CLAUDE.md`

Never close a session without updating both files.

The file should always answer: what is this project, what is the current state,
and what are the rules. Trim anything that doesn't serve those three questions.

This block is permanent. Never remove it during pruning. Preserve it verbatim.
