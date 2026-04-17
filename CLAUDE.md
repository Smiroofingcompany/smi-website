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
Photos: CompanyCam (project photos still need to be added to commercial pages)
Financing: Wisetack
Email: smiroofingcompany@gmail.com (active), info@smiroof.com (not confirmed active)

---

## WHAT IS STILL BROKEN OR INCOMPLETE

Fix these when they come up. Do not wait for a separate session.

- SMTP env vars not set in Vercel — internal email notifications not sending
- Commercial project photos not on live pages yet (Cory provides via CompanyCam)
- LSA profile has wrong phone number and website URL
- info@smiroof.com and cory@smiroof.com not confirmed active
- Directory listings (GAF, Owens Corning, BBB, Angi, HomeAdvisor, Chamber)
  — Cory must claim these manually with his login
- Google Business Profile: needs 1-2 posts/week using CompanyCam photos
- Google Search Console: submit sitemap.xml to queue all new URLs
- Twilio A2P campaign registration outcome still pending

---

## ON THE HORIZON

Do not start without explicit instruction from Cory.

- 9th commercial service page: commercial roof inspections / preventive maintenance
- GBP post content calendar: 4 weeks of draft posts
- Blog expansion: additional local market posts for NW Arkansas cities
- Replace placeholder /assets/ photos with real CompanyCam project photos
- Add CompanyCam project photos to the 13 commercial city pages still missing them (P0 from 2026-04-17 audit — Pottsville, Rogers, Springdale, Bentonville, Fayetteville, Siloam Springs, Little Rock, North Little Rock, Maumelle/Sherwood, Searcy, Conway, Bryant, Benton). Van Buren, Jacksonville, Cabot are templates.
- Fix Google Business Profile service-area settings so prospects searching "SMI Roofing [city]" from door-knock towns see local presence, not just Russellville HQ
- Submit updated sitemap.xml to Google Search Console and request indexing on top 10 city pages
- Consider extracting shared inline CSS into /assets/site.css — would cut repeat page weight ~30% but breaks the "no build step" model; confirm with Cory before doing

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

---

## LAST UPDATED

April 17, 2026 — Claude

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
