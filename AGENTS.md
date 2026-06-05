# AGENTS.md — SMI Roofing Website
# SOURCE OF TRUTH for all shared rules.
# CLAUDE.md imports this file with @AGENTS.md and adds Claude-specific notes.
# Codex reads this file directly.

---

## PROJECT PURPOSE

Marketing website for SMI Roofing, a residential and commercial roofing
company in Russellville, Arkansas. The site generates leads through SEO,
local landing pages, and a contact form. Goal is to rank #1 for roofing
keywords across all Arkansas metro areas and drive $2M+ in annual revenue.

---

## STACK

- **Frontend:** Static HTML, CSS, vanilla JavaScript. No framework. No build step.
- **Hosting:** Vercel (auto-deploys from GitHub `main` branch)
- **Serverless:** `/api/contact.js` — Node.js Vercel function (Twilio SMS, SMTP email, CRM POST)
- **Dependencies:** `nodemailer` only (in serverless function)
- **Assets:** Self-hosted in `/assets/` — no external CDN, no Cloudinary
- **Fonts:** Google Fonts — Outfit (headings), Plus Jakarta Sans (body)
- **Schema:** JSON-LD — RoofingContractor, FAQPage, BreadcrumbList on every page

---

## RUN / BUILD / TEST

There is no build step. Static HTML served directly by Vercel.

```bash
# Local preview
npx serve .
# or
python3 -m http.server 8000

# Install serverless function dependency
npm install

# Deploy — NEVER use Vercel CLI. Push to GitHub only.
git add <files>
git commit -m "description"
git push origin main
# Vercel auto-deploys from main. That is the only safe deploy path.
```

---

## FILE STRUCTURE

```
/
├── index.html                          # Homepage (has drone video hero)
├── api/contact.js                      # Serverless lead capture handler
├── package.json                        # nodemailer dependency
├── sitemap.xml                         # Update whenever pages are added/removed
├── robots.txt
├── assets/                             # ALL images and video — self-hosted
│   ├── logo.png                        # Nav logo — used on every page
│   ├── hero-video.mp4                  # Drone footage — autoplay on all city pages
│   ├── hero-poster.jpg                 # Video fallback (1920px DJI drone shot)
│   ├── og-image.jpg                    # Open Graph share image (1200px)
│   ├── commercial.jpg
│   ├── residential.jpg
│   ├── truck.jpg
│   ├── team.jpg
│   ├── aerial.jpg
│   ├── construction.jpg
│   ├── completed.jpg
│   └── crew.jpg
├── residential-roofing/
├── metal-roofing/
├── storm-damage/
├── roof-repair/
├── roof-inspections/
├── insurance-claims/
├── commercial-roofing/
│   ├── index.html                      # Hub page
│   ├── tpo-roofing/
│   ├── standing-seam-metal-roofing/
│   ├── metal-panel-systems/
│   ├── epdm-roofing/
│   ├── modified-bitumen-roofing/
│   ├── built-up-roofing/
│   ├── roof-coatings-restoration/
│   ├── commercial-roof-repair/
│   └── [city]-ar/                      # 26 commercial city pages
├── service-areas/
│   ├── index.html                      # Hub page
│   └── [city]-ar/                      # 32 residential city pages
├── industries/                         # 4 vertical pages
├── blog/
│   ├── index.html
│   └── [35 blog post directories]/
├── privacy-policy/
├── sms-terms/
├── AGENTS.md                           # Source of truth — shared rules
└── CLAUDE.md                           # Claude-specific notes, imports @AGENTS.md
```

---

## DEPLOYMENT RULES

1. **NEVER run `vercel deploy` or `vercel --prod`.** Two CLI deploys previously
   wiped the entire site to a single file. GitHub push only.
2. **Pull before every session.** Never work from a stale local copy.
3. **Never push a partial file set.** Every page that existed before must exist after.
4. **Verify nav before every push** — desktop AND mobile menu, both must have
   all links including Commercial.
5. **Verify the A2P compliance block is intact** before every push.
6. **Update `sitemap.xml`** whenever pages are added or removed.
7. **Confirm the Vercel build succeeds** before considering work complete.

---

## CODING RULES

1. **No frameworks.** Pure HTML, CSS, vanilla JS only.

2. **No external image hosts.** All images go in `/assets/` with root-relative
   paths (`/assets/filename.jpg`). Never use Cloudinary, S3, Imgur, or any CDN.
   Cloudinary was disabled April 2026 and broke the entire site — self-hosting
   is now a hard rule.

3. **Extract design tokens from existing pages** before writing new ones.
   Never guess colors or fonts.
   - `--cyan: #00C8F0`
   - `--navy: #0a1628`
   - `--navy-light: #111f36`
   - `--navy-mid: #162440`
   - Headings: `Outfit` / Body: `Plus Jakarta Sans`

4. **Every page requires:**
   - `<title>` and `<meta name="description">`
   - Open Graph: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
   - `<link rel="canonical">`
   - Schema JSON-LD: `RoofingContractor` (with `@id`), `FAQPage`, `BreadcrumbList`
   - Desktop nav AND mobile menu — both complete with all links

5. **City pages must have unique local content.** Reference real employers,
   landmarks, neighborhoods, county names. No generic filler.

6. **All 32 residential city pages** must include the cost FAQ:
   "How much does a roof replacement cost in [City]?" in both FAQPage schema
   and the HTML accordion.

7. **All 35 blog posts** must have topic-specific related article links in the
   sidebar, grouped by cluster (cost, insurance, materials, commercial, storm, process).

8. **Hero video** — all 58 city pages use `/assets/hero-video.mp4` with fade-in
   on the `playing` event (opacity:0 → opacity:1 at 0.5s). No poster image.
   Homepage uses the standard `poster` + `autoplay` pattern — do not change it.

9. **CSS goes inline** in each page's `<style>` block. No external stylesheets.

---

## PROTECTED FILES AND AREAS

**Never modify these without explicit instruction from Cory:**

### 1. A2P Compliance Block
The SMS consent checkbox in `index.html` is wrapped in:
```
<!-- A2P 10DLC COMPLIANCE BLOCK — DO NOT MODIFY OR REMOVE -->
```
Never alter the checkbox, its label, its ID (`cf_sms_consent`), or its
validation JS. A Twilio campaign registration is pending. Touching this
invalidates the registration.

### 2. `/api/contact.js`
Handles all lead capture, Twilio SMS, and internal email. Any change risks
breaking lead flow. Test before modifying.

### 3. Navigation (both blocks)
Desktop nav links and mobile menu are separate HTML blocks. Both must stay
in sync. The Commercial link has broken before from partial edits.

### 4. `/assets/` directory
All site images and video. Deleting or renaming files breaks pages sitewide.

### 5. `sitemap.xml`
Must be updated when pages are added or removed.

### 6. `AGENTS.md` and `CLAUDE.md`
Both are protected instruction files. Changes must be logged (see CHANGE LOG).

---

## ENVIRONMENT VARIABLES

Set in Vercel dashboard only. Never in code. Never committed to the repo.

| Variable | Purpose | Status |
|----------|---------|--------|
| `TWILIO_ACCOUNT_SID` | Twilio API auth | ✅ Set |
| `TWILIO_AUTH_TOKEN` | Twilio API auth | ✅ Set |
| `TWILIO_FROM_NUMBER` | SMS sender number | ✅ Set |
| `SMTP_HOST` | Email server host | ❌ Not set |
| `SMTP_PORT` | Email server port | ❌ Not set |
| `SMTP_USER` | Email login | ❌ Not set |
| `SMTP_PASS` | Email password | ❌ Not set |
| `CRM_API_TOKEN` | CRM auth (optional) | ❌ Not set |
| `LEAD_NOTIFY_TO` | Internal lead-email recipient (optional; falls back to a hardcoded address) | ❌ Not set |

SMTP vars must be set before internal notification emails will send. The
`LEAD_NOTIFY_TO` fallback-recipient typo in `/api/contact.js` was corrected
June 2026; if `LEAD_NOTIFY_TO` is left unset, lead emails route to the
corrected fallback address once SMTP is live.

---

## SEO RULES

- Every city landing page: unique local content — real employers, landmarks,
  county names, neighborhoods. No generic filler.
- Schema required on every page: `RoofingContractor`, `FAQPage`, `BreadcrumbList`
- Update `sitemap.xml` whenever pages are added. Submit to Google Search Console.
- Priority keywords: residential/commercial roofing + city name (AR),
  standing seam metal roofing, storm damage roof repair, roof replacement cost AR

---

## WHAT SUCCESS LOOKS LIKE

- Every page loads with no broken images, no missing assets, no console errors
- Hero video plays smoothly on all 58 city pages with no flash or glitch
- Homepage video plays with poster fallback — no changes needed
- Logo renders in nav on every page
- Desktop nav and mobile menu both work with all links present
- Contact form submits and returns thank-you state (Twilio SMS fires on consent)
- Schema validates in Google Rich Results Test
- New city pages rank for "[service] [city] AR" within 60 days of indexing
- Sitemap is accurate and submitted to Google Search Console
- Zero external image or CDN dependencies

---

## COMMON TASKS

**Add a new city page:**
1. Copy an existing city page of the same type (residential or commercial)
2. Replace all city-specific content — title, meta, schema areaServed, body, FAQs
3. Add unique local content (employers, landmarks, county)
4. Add cost FAQ to residential pages
5. Add URL to `sitemap.xml`
6. Verify nav works on the new page
7. Commit all files and push

**Add a new blog post:**
1. Create `/blog/[slug]/index.html` from an existing post as template
2. Add topic-specific related links in sidebar
3. Add URL to `sitemap.xml`
4. Update `/blog/index.html` to list the new post
5. Commit and push

**Add a new image:**
1. Add the file to `/assets/`
2. Reference with root-relative path: `/assets/filename.jpg`
3. Never use an external image URL

---

## SYNC RULE

`AGENTS.md` is the source of truth for all shared rules.
`CLAUDE.md` imports it with `@AGENTS.md` and adds only Claude-specific notes.

- **Shared rule changes** (deployment, coding, protected files, SEO, structure)
  → edit `AGENTS.md` first, then update `CLAUDE.md` to reflect if needed
- **Claude-specific notes** (session protocol, Cory's preferences, internal context)
  → edit `CLAUDE.md` only
- Both files must be committed together in the same commit
- Commit message format: `chore: update AGENTS.md + CLAUDE.md`

---

## INSTRUCTION FILE CHANGE LOG

Every edit to either instruction file must be logged here AND in CLAUDE.md.
Format: `YYYY-MM-DD | Agent | File(s) | What changed`

| Date | Agent | File(s) | Change |
|------|-------|---------|--------|
| 2026-04-05 | Claude | CLAUDE.md | Initial session — built 26 commercial city pages, cost FAQs, blog cross-links, sitemap |
| 2026-04-05 | Claude | CLAUDE.md | Built /api/contact.js, set Twilio env vars |
| 2026-04-06 | Claude | CLAUDE.md | Self-hosted all assets in /assets/, removed Cloudinary |
| 2026-04-06 | Claude | CLAUDE.md | Hero video added to 58 city pages, fade-in fix applied |
| 2026-04-07 | Claude | AGENTS.md | Created AGENTS.md as sanitized mirror |
| 2026-04-07 | Claude | AGENTS.md + CLAUDE.md | Added sync rule, change log, attribution convention |
| 2026-04-07 | Claude | AGENTS.md + CLAUDE.md | Restructured: AGENTS.md is now source of truth, CLAUDE.md imports via @AGENTS.md |
| 2026-04-17 | Claude | AGENTS.md + CLAUDE.md | Full site audit pass: localized footer/legal/hero banner on all 58 city pages, Nearby + Related Blog blocks on 32 residential pages, neighborhoods on top 10 cities, Russellville home-base content + FAQ schema expansion, sitemap lastmod regen, schema containedInPlace normalization, image compression ~35%, contact form microcopy |
| 2026-04-21 | Claude | AGENTS.md + CLAUDE.md | Installed Meta (Facebook) Pixel ID 2124552908380703 in `<head>` of all 120 HTML files — fires PageView on every page sitewide |
| 2026-06-01 | Claude | AGENTS.md + CLAUDE.md | Image loading audit: added loading="lazy" + intrinsic width/height to 2869 img tags across 558 HTML files; added fetchpriority="high" to LCP images (hero-poster.jpg, smi-luxury-roof-finished.jpg); added scripts/update-image-attrs.mjs |
| 2026-06-01 | Claude | AGENTS.md + CLAUDE.md | Schema SEO pass: added Service schema (serviceType, areaServed, hasOfferCatalog) to all 41 service-areas/ city pages; added hasOfferCatalog (7 services) to homepage Organization node; extended scripts/sync-service-schema.mjs to manage residential city pages; Service count 379→420; all validations pass |
| 2026-06-01 | Claude | AGENTS.md + CLAUDE.md | Conversion CTA pass: strengthened final CTA copy on homepage, storm-damage, insurance-claims, metal-roofs, commercial-roofing; updated mobile sticky bar labels from "Call/Form" → "Call Now/Free Inspection" across all 561 pages sitewide |
| 2026-06-01 | Claude | vercel.json + AGENTS.md + CLAUDE.md | Cache-header fix: clean-URL HTML pages (`/` and `/:path*/`) now send `Cache-Control: no-cache, no-store, must-revalidate` + `Pragma: no-cache`. The prior rule only matched `/(.*).html`, so clean canonical URLs fell through to Vercel's default `public, max-age=0` and were edge/proxy-cached — letting stale CTA HTML replay to public fetchers. Diagnosed via public no-query curl (5 fetch methods) + independent WebFetch; confirmed public == repo and alias on newest commit. |
| 2026-06-01 | Claude | AGENTS.md + CLAUDE.md | Internal link audit + strengthening pass: added 18 contextual body links across 7 files. /roof-inspections/ gained 4 inbound links, /metal-roofs/ gained 3, /residential-roofing/ gained 2, /storm-damage/ and /insurance-claims/ gained links from roof-repair page, /commercial-roofing/tpo-roofing/ and /commercial-roofing/commercial-roof-repair/ each gained 2-3 inbound links from commercial blog posts. All links contextual — no footer dumps. |
| 2026-06-03 | Claude | 15 HTML files + AGENTS.md + CLAUDE.md | Contextual internal-link pass #2: fixed 9 broken blog sidebar links (`/blog/file-roofing-insurance-claim/` → `…-arkansas/`); added 13 contextual body links across 8 pages (homepage, roof-replacement-cost-2026 blog, signs-you-need-new-roof, how-long-does-roof-last, hail-storm-roof-damage, emergency-roof-tarping, TPO, commercial-roof-repair). /roof-repair/ contextual inbound 89→93, /roof-inspections/ 56→59, /metal-roofs/ +1, /residential-roofing/ +1; added reciprocal blog↔commercial links and /commercial-roofing-cost/ links from the two commercial money pages. Varied anchors, no footer dumps. Whole-site audit: 0 broken internal links; all schema/FAQ/PAA validations pass. |
| 2026-06-03 | Claude | 30 city pages + sitemap.xml + AGENTS.md + CLAUDE.md | Local city-content pass (15 priority cities — Russellville, Dardanelle, Conway, Little Rock, North Little Rock, Fort Smith, Fayetteville, Springdale, Rogers, Bentonville, Van Buren, Clarksville, Morrilton, Greenbrier, Ozark): replaced the generic "coverage" meta-boilerplate (was byte-identical on all 41 residential pages) with unique local blocks — county, geography/landmarks, real neighborhoods, nearby towns, local roof/storm concerns, service fit + contextual service links; de-duplicated the regionally-shared promise weather sentence (3 shared variants → 15 city-specific); added bidirectional residential↔commercial city cross-links (none existed before); bumped sitemap lastmod on the 45 affected URL entries. No fabricated jobs/clients/certs/partnerships. A2P block + nav + JSON-LD untouched; predeploy/faq-library/paa-refresh all pass. |
| 2026-06-03 | Claude | 6 new + 3 existing blog posts + blog/index.html + sitemap.xml + scripts/validate-schema-release.mjs + AGENTS.md + CLAUDE.md | High-intent AEO blog expansion. Created 6 posts (roof-repair-vs-replacement-arkansas, how-long-does-roof-replacement-take-arkansas, what-does-a-roof-inspection-include, what-roof-damage-insurance-covers-arkansas, commercial-flat-roof-repair-arkansas, commercial-roof-maintenance-arkansas) — each with a ~40-word Quick Answer lead, question-based H2s, a visible FAQ accordion synced to FAQPage schema, plus BlogPosting/BreadcrumbList/RoofingContractor JSON-LD, contextual service-page links, and a CTA. Improved 3 existing posts: added Quick Answer to hail-storm-roof-damage + emergency-roof-tarping; added body service links to metal-roof-vs-shingles; bumped dateModified + sitemap lastmod on all 3. Added cards to blog/index.html, 6 URLs to sitemap.xml, raised BlogPosting schema floor 38→44. No fabricated claims; A2P/nav/footer/api untouched. Schema synced via sync-faq/breadcrumb/blogposting; predeploy/faq-library/paa-refresh all pass; 0 broken internal links. |
| 2026-06-03 | Claude | 9 commercial pages + sitemap.xml + AGENTS.md + CLAUDE.md | Commercial conversion pass: added a "Commercial Proof" section to the commercial hub + 8 service pages (TPO, commercial-roof-repair, roof-coatings-restoration, standing-seam-metal, metal-panel-systems, EPDM, modified-bitumen, built-up). Each pairs a real SMI /assets/ project photo (descriptive alt, intrinsic width/height, loading=lazy, decoding=async — steel-building shot on the metal pages, commercial aerial on hub/membrane pages, field hail-inspection shot on repair + mod-bit, SMI crew+truck on EPDM, drone documentation on BUR) with a 6-point proof grid covering photo documentation, fast leak/storm response, jobsite coordination, scheduling around operations, written budget clarity, and maintenance/warranty — plus 2-3 contextual links to sibling commercial pages + repair + cost. Strengthened the final CTA on all 9 to commercial-specific copy (Schedule a Commercial Assessment; repair page → Get a Commercial Roof Repair Plan / Call SMI for Roof Leaks; 24/7 leak line; tel:+15014645139), keeping #free-estimate on the hub and data-open-inspection-form on service pages. No fabricated clients/jobs/warranties/certs; A2P block, nav (desktop+mobile), footer, and /api/contact.js untouched. Bumped sitemap lastmod on the 9 URLs. predeploy/faq-library/paa-refresh all pass; 0 broken internal links; desktop+mobile layout verified in preview. |
| 2026-06-03 | Claude | api/contact.js + assets/instant-inspection-widget.js + 43 HTML + AGENTS.md + CLAUDE.md | Lead-capture audit + safe fixes. Fixed a clear bug in `/api/contact.js`: the `LEAD_NOTIFY_TO` fallback recipient address had a double-L domain typo, which would bounce internal lead-notification emails to a non-existent address whenever SMTP is configured but `LEAD_NOTIFY_TO` is unset — corrected the domain (recipient string only; Twilio and SMTP transport logic untouched). Replaced the conflicting form-success promise ("contact you within 24 hours" on the form vs ~1 hour in the Twilio SMS) with clearer copy ("We'll review your request and call you with a clear next step. For urgent leaks, call …") across the homepage + 41 residential city forms + the commercial hub, via an asserted exact-string codemod that verified the A2P consent block byte-identical before/after on all 43 files. Aligned the instant-inspection widget's success message to the same voice (apostrophe-free for JS-string safety). Fixed a homepage-only retry-button-label inconsistency. Added an optional `LEAD_NOTIFY_TO` row to the env-var table. A2P block, nav (desktop+mobile), footer, and the `/api/contact` field contract untouched; `node --check` passes on both JS files; predeploy/faq-library/paa-refresh all pass; 0 broken internal links; scope = 45 code files. Cory must still set `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS` in Vercel to enable internal lead emails (optionally `LEAD_NOTIFY_TO` and `CRM_API_TOKEN`). |
| 2026-06-05 | Claude | −31 out-of-state HTML pages + scripts/generate-spanish-texas-pages.mjs; vercel.json + sitemap.xml + areas-we-serve + insurance-claims + site-map + scripts/generate-state-farm-claim-pages.mjs + AGENTS.md + CLAUDE.md | Out-of-state cleanup (session 10). A full-site audit found the site had been partly built by copying TX competitor Hargrove Roofing, leaving 31 out-of-state pages: Texas (DFW, Fort Worth, Houston, San Antonio) + Nashville TN, each with a /state-farm-roof-claim/ subpage, plus an all-Texas Spanish /es/ section. All 31 were in sitemap.xml and linked from 3 real AR pages (areas-we-serve nav hub, insurance-claims money page, site-map). Deleted all 31 pages, removed their 31 sitemap entries, stripped every internal link to them (incl. the "Primary Metro Growth Markets" + "Texas Roofing Pages in Spanish" sections in areas-we-serve and the TX meta/FAQ-schema/placeholder copy), and added six prefix 301 redirects in vercel.json so the dead URLs consolidate to /areas-we-serve/. Deleted the pure-Texas Spanish generator and emptied the TX/TN fallback maps in the State Farm generator (Arkansas generation intact). Kept Nashville, AR (/nashville/ + /service-areas/nashville-ar/). Verified: 557 HTML files / 555 sitemap URLs, 0 residual out-of-state links, 0 broken internal links, schema-release/faq-library/paa-refresh all pass. (Audit also flagged for follow-up: a 404-page /[city]/ hub system cannibalizing the /service-areas/ city pages — owner chose to keep /service-areas/ as canonical; no analytics/call tracking sitewide; Wisetack financing on only 1 page; orphaned /industries/ pages.) |
| 2026-06-05 | Claude | −41 /[city]/ hub directories (404 pages) + vercel.json + sitemap.xml + 19 linking files + site-map/index.html + 7 Service schemas + AGENTS.md + CLAUDE.md | City-page consolidation (session 10). Resolved the keyword cannibalization: the top-level /[city]/ "City Hub" system (404 thin/duplicate pages) competed with the richer /service-areas/[city]-ar/ residential pages for every city. Per owner decision, kept /service-areas/ as the canonical residential system and consolidated the hubs into it — repointed 933 internal links to the /service-areas/[city]-ar/ twins, removed 404 hub URLs from sitemap.xml (555→151), deleted all 41 hub directories, added 82 per-city 301 redirects to vercel.json (/[city]/ + /[city]/:path* → /service-areas/[city]-ar/), re-synced 7 money-page Service schemas, and regenerated the HTML site-map. Verified: 153 HTML files, 151 sitemap URLs, 0 broken internal links, 0 residual hub references, all schema/FAQ/PAA validators pass. /service-areas/ and /commercial-roofing/ untouched. |
| 2026-06-05 | Claude | commercial-roofing/index.html + 8 commercial service pages + AGENTS.md + CLAUDE.md | Commercial linking + geo-targeting (session 10). Linked the 4 previously-orphaned /industries/ pages from the commercial hub via a new "Industries We Serve" section (they had only the site-map as an inbound link); added city-level areaServed (10 priority cities + Arkansas) to the Service schema on all 8 commercial service-type pages (was state-only, so material+city queries had no geo signal). JSON-LD Service node only (RoofingContractor untouched); 0 broken links; schema/service/faq validators pass. |
| 2026-06-05 | Claude | +3 new commercial pages (commercial-roofing/commercial-roof-inspections, commercial-roofing/emergency-roof-repair, industries/agricultural-poultry-roofing) + commercial-roofing/index.html + sitemap.xml + site-map/index.html + AGENTS.md + CLAUDE.md | Built the 3 missing high-intent commercial pages (session 10): commercial roof inspection / preventive-maintenance, 24/7 emergency commercial leak repair, and agricultural/poultry building roofing. Each cloned from an existing template so nav (desktop+mobile), footer, CSS, Meta Pixel, and the inspection-widget hook are byte-identical to live pages; content hand-authored and truthful (no fabricated clients/jobs/guarantees); full Service/FAQPage/BreadcrumbList/RoofingContractor JSON-LD with the FAQPage rebuilt to match the visible accordion; 10-city areaServed. Linked all 3 from the commercial hub and added to the sitemap; site-map regenerated. Verified: 156 HTML / 154 sitemap URLs, 0 broken links, all schema/FAQ/PAA validators pass, nav/footer/CSS byte-identical to template. |

---

## LAST UPDATED

June 5, 2026 (session 10) — Claude
