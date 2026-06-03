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

- SMTP env vars not set in Vercel — internal email notifications not sending
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

---

## LAST UPDATED

June 3, 2026 (session 8) — Claude

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
