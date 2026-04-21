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

SMTP vars must be set before internal notification emails will send.

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

---

## LAST UPDATED

April 21, 2026 — Claude
