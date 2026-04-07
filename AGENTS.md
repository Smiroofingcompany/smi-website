# AGENTS.md — SMI Roofing Website
# Sanitized reference for any AI agent or developer working on this codebase.
# No credentials. No tokens. No internal business data.

---

## PROJECT PURPOSE

Marketing website for SMI Roofing, a residential and commercial roofing
company in Russellville, Arkansas. The site generates leads through SEO,
local landing pages, and a contact form. Goal is to rank #1 for roofing
keywords across all Arkansas metro areas.

---

## STACK

- **Frontend:** Static HTML, CSS, vanilla JavaScript. No framework. No build step.
- **Hosting:** Vercel (auto-deploys from GitHub `main` branch)
- **Serverless:** `/api/contact.js` — Node.js Vercel function (Twilio SMS, SMTP email, CRM POST)
- **Dependencies:** `nodemailer` (only npm package — used in serverless function)
- **Assets:** Self-hosted in `/assets/` (images, video). No external CDN.
- **Fonts:** Google Fonts (Outfit, Plus Jakarta Sans)
- **Schema:** JSON-LD (RoofingContractor, FAQPage, BreadcrumbList)

---

## RUN / BUILD / TEST

There is no build step. The site is static HTML served directly by Vercel.

```bash
# Local preview — any static server works
npx serve .
# or
python3 -m http.server 8000

# Install serverless function dependencies
npm install

# Deploy — NEVER use Vercel CLI. Push to GitHub only.
git add <files>
git commit -m "description"
git push origin main
# Vercel auto-deploys from main.
```

---

## FILE STRUCTURE

```
/
├── index.html                          # Homepage
├── api/contact.js                      # Serverless form handler
├── package.json                        # nodemailer dependency
├── assets/                             # All images and video (self-hosted)
│   ├── logo.png
│   ├── hero-video.mp4
│   ├── hero-poster.jpg
│   ├── og-image.jpg
│   └── [section images].jpg
├── residential-roofing/index.html
├── metal-roofing/index.html
├── storm-damage/index.html
├── roof-repair/index.html
├── roof-inspections/index.html
├── insurance-claims/index.html
├── commercial-roofing/
│   ├── index.html                      # Hub page
│   ├── tpo-roofing/index.html
│   ├── standing-seam-metal-roofing/index.html
│   ├── [6 more service pages]
│   └── [city]-ar/index.html            # 26 commercial city pages
├── service-areas/
│   ├── index.html                      # Hub page
│   └── [city]-ar/index.html            # 32 residential city pages
├── industries/
│   └── [4 vertical pages]
├── blog/
│   ├── index.html
│   └── [35 blog post directories]
├── privacy-policy/index.html
├── sms-terms/index.html
├── sitemap.xml
├── robots.txt
├── CLAUDE.md                           # Full project instructions (internal)
└── AGENTS.md                           # This file
```

---

## PROTECTED FILES AND AREAS

**DO NOT modify these without explicit instruction:**

1. **A2P Compliance Block** — The SMS consent checkbox in `index.html` is
   wrapped in `<!-- A2P 10DLC COMPLIANCE BLOCK -->`. Never alter the checkbox,
   its label, its ID (`cf_sms_consent`), or its validation JavaScript.
   Regulatory compliance depends on it.

2. **`/api/contact.js`** — The serverless function handles lead capture, SMS,
   and email. Changes risk breaking lead flow. Test thoroughly before modifying.

3. **Navigation** — Desktop nav links AND mobile menu are separate HTML blocks.
   Both must stay in sync. The Commercial link has broken before from partial edits.

4. **`/assets/` directory** — All site images and video. Deleting or renaming
   files here breaks pages across the entire site.

5. **`sitemap.xml`** — Must be updated when pages are added or removed.

---

## CODING RULES

1. **No frameworks.** Pure HTML, CSS, vanilla JS only.

2. **No external image hosts.** All images go in `/assets/` with root-relative
   paths (`/assets/filename.jpg`). No Cloudinary, no Imgur, no CDNs.

3. **Design tokens must be extracted from existing pages** before writing new
   ones. Never guess colors or fonts. Key values:
   - `--cyan: #00C8F0`
   - `--navy: #0a1628`
   - `--navy-light: #111f36`
   - `--navy-mid: #162440`
   - Headings: `Outfit` / Body: `Plus Jakarta Sans`

4. **Every page requires:**
   - `<title>` and `<meta name="description">`
   - Open Graph tags: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
   - `<link rel="canonical">`
   - Schema JSON-LD: `RoofingContractor`, `FAQPage`, `BreadcrumbList`
   - Desktop nav AND mobile menu with all links (including Commercial)

5. **City pages must have unique local content.** Reference real employers,
   landmarks, neighborhoods, and county names. No generic filler.

6. **Blog posts must have topic-specific sidebar links** — related articles
   grouped by cluster (cost, insurance, materials, commercial, storm, process).

7. **CSS goes inline** in each page's `<style>` block. No external stylesheets.

---

## DEPLOYMENT RULES

1. **NEVER run `vercel deploy` or `vercel --prod`.** Two CLI deploys previously
   wiped the entire site. The only safe path is `git push origin main`.
   Vercel auto-deploys from GitHub.

2. **Pull before every session.** Never work from a stale local copy.

3. **Never push a partial file set.** If a page existed before your edit, it
   must exist after. Disappearing pages have happened before.

4. **Verify nav before every push** — both desktop AND mobile menu.

5. **Verify the A2P compliance block is intact** before every push.

6. **Update `sitemap.xml`** whenever pages are added or removed.

7. **Confirm the Vercel build succeeds** before considering work complete.

---

## WHAT SUCCESS LOOKS LIKE

- Every page loads with no broken images, no missing assets, no console errors
- Video hero plays smoothly on homepage and all 58 city pages
- Logo renders in nav on every page
- Desktop nav and mobile menu both work with all links
- Contact form submits successfully and returns thank-you state
- Schema validates in Google's Rich Results Test
- New city pages rank for "[service] [city] AR" within 60 days
- Sitemap is accurate and complete
- No external dependencies that can break the site if a third party goes down

---

## ENVIRONMENT VARIABLES

The serverless function (`/api/contact.js`) requires these env vars set in the
Vercel dashboard (never in code, never in `.env` committed to the repo):

| Variable | Purpose | Status |
|----------|---------|--------|
| `TWILIO_ACCOUNT_SID` | Twilio API auth | Set |
| `TWILIO_AUTH_TOKEN` | Twilio API auth | Set |
| `TWILIO_FROM_NUMBER` | SMS sender number | Set |
| `SMTP_HOST` | Email server | Not set |
| `SMTP_PORT` | Email server port | Not set |
| `SMTP_USER` | Email login | Not set |
| `SMTP_PASS` | Email password | Not set |
| `CRM_API_TOKEN` | CRM auth (optional) | Not set |

---

## COMMON TASKS

**Add a new city page:**
1. Copy an existing city page from the same type (residential or commercial)
2. Replace all city-specific content (title, meta, schema, body, FAQs)
3. Add unique local content (employers, landmarks, county)
4. Add cost FAQ to residential pages
5. Add the URL to `sitemap.xml`
6. Verify nav works on the new page
7. Commit all files together and push

**Add a new blog post:**
1. Create directory at `/blog/[slug]/index.html`
2. Use existing blog post as template
3. Add topic-specific related links in sidebar
4. Add the URL to `sitemap.xml`
5. Update `/blog/index.html` to include the new post
6. Commit and push

**Add a new image:**
1. Add the file to `/assets/`
2. Reference it with root-relative path: `/assets/filename.jpg`
3. Never use external image URLs

---

## LAST UPDATED

April 7, 2026.
