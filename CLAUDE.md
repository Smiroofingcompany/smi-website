# CLAUDE.md — SMI Roofing Website
# Read this entire file before touching any code. No exceptions.

---

## WHO YOU ARE WORKING FOR

Cory Smith, owner of SMI Roofing (CAS Management Inc.), Russellville, Arkansas.
302 East Parkway Drive, Suite C, Russellville, AR 72801.
Phone: (501) 464-5139
Email: info@smiroof.com
Website: smiroof.com
Google reviews: 231+ at 5.0 stars. 35 years experience. 1,700+ roofs completed.
10-year workmanship warranty. Up to 50-year material warranties.
Revenue goal: $2M+.

Working style: Execute immediately. No permission needed. No handoffs.
Fix every identified issue in the same session. Brutal honesty only.

---

## THE MOST IMPORTANT RULE IN THIS ENTIRE FILE

NEVER deploy via Vercel CLI directly. Ever.

Two CLI deploys wiped the entire site to a single file. The only safe
deployment path is: edit files, commit to GitHub, push to main.
Vercel auto-deploys from GitHub. That is the only workflow.

If you are ever tempted to run `vercel deploy` or `vercel --prod`, stop.
Commit and push to GitHub instead.

---

## REPO AND DEPLOYMENT

GitHub repo: github.com/Smiroofingcompany/smi-website
Branch: main (auto-deploys to smiroof.com via Vercel)
Git config name: SMI Roofing
Git config email: smiroofingcompany@gmail.com

Vercel projectId: prj_Ur8yabvNY8MrzTG1CgQzr39MU7tn
Vercel teamId: team_YEyhFvcZVhdtBmQHYhPqk8yK

Tokens are stored in .env in the repo root. Never commit .env.
Read tokens from .env at the start of each session.

Deployment confirmation: Look for the Vercel build completing in GitHub Actions
or the live URL reflecting the change. DNS telemetry errors in terminal output
are benign and can be ignored.

---

## SITE STRUCTURE

smiroof.com is a 60+ page static HTML site. No framework. No build step.
Pure HTML, CSS, and JavaScript files committed directly to the repo.

Page inventory (95+ HTML files as of April 2026):
- index.html (homepage)
- 5 standalone service pages (residential, metal-roofing, storm-damage,
  roof-repair, roof-inspections, insurance-claims)
- commercial services hub + 8 service pages (TPO, standing seam metal,
  metal panels, EPDM, modified bitumen, built-up, coatings, repair)
- 32 city landing pages (residential) + service-areas hub
- 4 industry vertical pages
- blog index + 35 blog posts (1 original + 34 added April 2026)
- privacy policy + SMS terms
- sitemap.xml + robots.txt

Every page must have:
- Schema markup: RoofingContractor (standalone with @id), FAQPage,
  BreadcrumbList, LocalBusiness (covered by RoofingContractor which
  extends LocalBusiness in schema.org)
- Open Graph meta tags (og:title, og:description, og:image, og:url, og:type)
- Canonical URL
- Nav with both desktop nav-links AND mobile menu (both must be verified
  before any push — the Commercial nav link has been broken before)

As of April 2026: all pages have standalone @id RoofingContractor schema,
canonical tags, and Open Graph tags. 14 city pages rewritten with locally-
specific content (landmarks, employers, weather, nearby area pills) and
city-specific FAQPage schema. 34 new blog posts added across 8 categories.

---

## DESIGN SYSTEM

Theme: Navy and cyan.
Fonts: Outfit (headings), Plus Jakarta Sans (body).
Logo hosted on Cloudinary: res.cloudinary.com/dzypmhsh7

Before generating any new page, extract the CSS variables and design tokens
from the existing index.html. Never guess at colors or font sizes.
Every new page must be visually identical to the existing site.

Background: true dark navy, not blue-gray.
Accent: cyan #00C8F0 used sparingly for CTAs and highlights only.
Max 3 colors in any UI section.

---

## CRITICAL COMPLIANCE BLOCK — DO NOT EVER TOUCH

The SMS opt-in checkbox on the contact form is A2P 10DLC compliance-required.
It is wrapped in this comment block:

<!-- A2P 10DLC COMPLIANCE BLOCK — DO NOT MODIFY OR REMOVE -->

Never remove it. Never move it. Never alter the checkbox, its label text,
its ID (cf_sms_consent), or the JavaScript validation that blocks form
submission when unchecked.

Four prior Twilio campaign registrations were rejected because the form
had SMS consent as static text only with no checkbox. The fix was a proper
unchecked TCPA-compliant checkbox with adjacent consent language and
JavaScript validation. A fifth resubmission is currently pending.
Touching this block could invalidate the entire campaign registration.

---

## KNOWN FAILURE MODES — READ BEFORE EVERY SESSION

1. Pages disappearing on deploy. This happens when a deploy does not include
   all existing files. Every push must include the complete file tree.
   Never push only changed files via a partial commit. Pull first,
   edit, commit all, push.

2. Commercial nav link breaking. The desktop nav and mobile menu are separate
   code blocks. Both must include the Commercial link. Always verify both
   before pushing any homepage or nav changes.

3. Live site and GitHub repo going out of sync. Never assume GitHub reflects
   what is live or vice versa. Always pull the latest from GitHub at the
   start of every session and cross-reference with the live site if needed.

4. Vercel file content API. The v8 API returns base64-encoded JSON in the
   format {"data":"..."}. Must decode before writing to disk.
   The v6 endpoint cannot be used for file content retrieval.

5. CSS and design drift. Always extract design tokens from existing files
   before writing new pages. Never generate new pages from memory.

---

## SESSION STARTUP PROTOCOL

Every session must begin with these steps before writing a single line:

1. Pull the latest from GitHub. Never work from a stale local copy.
2. Audit the current file tree. Know what exists before adding anything.
3. Check index.html for the current nav structure (both desktop and mobile).
4. Extract CSS variables from the existing stylesheet before generating
   any new pages.
5. Identify what the session goal is and confirm the exact files in scope.
6. Only then begin writing code.

---

## SEO REQUIREMENTS

Every city landing page must include unique local content. Reference specific
employers, landmarks, and neighborhoods for that city. Do not generate
generic content that could apply to any city.

Priority keyword categories to own:
- Residential roofing + city name (all Arkansas markets)
- Commercial roofing + city name
- Standing seam metal roofing (major opportunity, competitors are weak here)
- Storm damage roof repair
- Roof replacement cost Arkansas

Schema required on every page: RoofingContractor, FAQPage, BreadcrumbList,
LocalBusiness. No exceptions.

Sitemap: smiroof.com/sitemap.xml. Update it whenever new pages are added
and submit new URLs to Google Search Console.

---

## CONTACT FORM

Handler: `/api/contact` Vercel serverless function (built April 2026).
- POSTs lead JSON to `crm.smiroof.com/api/leads`
- Sends Twilio SMS to opted-in leads (first name + 1-hour callback message)
- Sends internal notification email to info@smiroof.com via SMTP
- Returns `{success:true}` JSON for no-reload thank-you

Required env vars (set in Vercel dashboard, not in .env):
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `CRM_API_TOKEN` (optional — for authenticated CRM requests)

Do not break the A2P compliance checkbox (see above).

---

## TOOLS AND INTEGRATIONS

CRM: crm.smiroof.com (custom React app, separate repo)
Jobber booking link: clienthub.getjobber.com/booking/31b1fe0c-4da6-49e9-ad15-2e9a8cefa5fb
SMS: Twilio / SimpleTexting (Twilio account data must be pasted in-session by Cory)
Photos: CompanyCam (commercial project photos still need to be added to live pages)
Financing: Wisetack
Business email: smiroofingcompany@gmail.com (confirmed active)
Domain emails: info@smiroof.com and cory@smiroof.com (not confirmed active)

---

## WHAT IS STILL BROKEN OR INCOMPLETE

Fix these when they come up. Do not wait for a separate session.

- Confirm Twilio A2P SMS campaign registration outcome after checkbox fix
- Set TWILIO_* and SMTP_* env vars in Vercel dashboard (contact form won't
  send SMS or email until these are set)
- Add commercial project photos to all commercial pages (Cory provides photos)
- Correct LSA profile: wrong phone number and website URL on Local Services Ads
- Domain email setup: info@smiroof.com and cory@smiroof.com not confirmed active
- Content automation pipeline: blog posts, GBP updates, social publishing
- Manufacturer certifications: GAF, Duro-Last, Elevate/Firestone, Carlisle,
  Johns Manville, CertainTeed directory listings and backlinks
- Update sitemap.xml to include 34 new blog posts and verify all city pages listed

---

## ON THE HORIZON

These are identified but not yet built. Do not start without explicit instruction.

- 26 commercial city landing pages missing. Requires dedicated
  content-generation session. Each page needs unique local content,
  RoofingContractor schema, FAQPage schema, BreadcrumbList, and
  LocalBusiness schema.
- 9th commercial service page. The 8 existing pages are: TPO, standing
  seam metal, metal panel systems, EPDM, modified bitumen, built-up
  roofing, roof coatings/restoration, and commercial roof repair. The
  most logical 9th page is commercial roof inspections / preventive
  maintenance programs. Needs clarification from Cory before building.

---

## STRUCTURAL INTEGRITY RULES

These apply to every session, every edit, every push:

1. Pull before you touch anything.
2. Edit only the files explicitly in scope for the task.
3. Verify nav (desktop AND mobile) before every push.
4. Verify the A2P compliance block is intact before every push.
5. Never push a partial file set. All files must be committed together.
6. Never deploy via CLI. GitHub push only.
7. After pushing, confirm the Vercel build succeeded before closing the session.
8. If a page existed before the session, it must exist after the session.
   Disappearing pages are unacceptable and have happened before.

---

## COMPETITORS (FOR SEO CONTEXT)

Griffin's Roofing: Will Griffin, operates 3 brands from a home address. Weak.
Miller Roofing: GAF Master Elite, 35 years, 109 reviews at 4.5. Legitimate.
BRS Inc.: Ghost company names, broken website. Not a real threat.
Freedom Roofing: Minimal digital presence.

SMI's moat: 231 reviews at 5.0, 35 years, 1,700+ roofs. Lead with this everywhere.

---

## LAST UPDATED

April 2026. Update this file whenever the site structure, deployment setup,
or compliance requirements change.

---

## END-OF-SESSION UPDATE INSTRUCTIONS (PERMANENT — DO NOT REMOVE)

At the end of every session, before the final commit, update this CLAUDE.md
file. Follow these rules exactly.

Add: anything new that was built, any new patterns or decisions established,
any new known issues discovered, any new files that are now protected or
critical.

Move: anything from "on the horizon" that is now live should move to
"current state" with a one-line description of how it works.

Remove: completed one-time tasks that don't need to be remembered, decisions
that are fully implemented and are now just how things work, anything that is
no longer accurate, anything redundant or obvious.

Trim: if any section is longer than it needs to be to orient a developer in
under 2 minutes, cut it down. The goal is a lean, accurate, current document.
Not an archive. Not a changelog.

The file should always answer exactly three questions: what is this project,
what is the current state right now, and what are the rules. Anything that
does not serve one of those three questions gets removed.

Commit the updated CLAUDE.md as the final commit of every session with the
message "chore: update CLAUDE.md". Never close a session without doing this.

This update instruction is permanent and must never be removed during pruning.
When updating this file, always preserve this entire end-of-session block
verbatim at the bottom of the file no matter what else gets trimmed.
