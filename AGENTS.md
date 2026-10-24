# Southern Star Coin Laundry website: project notes for AI agents

This file is the shared memory between the AI assistants that work on this site
(Claude Code and OpenAI Codex, taking turns). Read all of it before changing
anything, and follow the start and end checklists so nothing is lost between
sessions.

**Only one agent works at a time.** Finish, push and log your work before the
other one starts.

## Start-of-session checklist

1. `git remote -v` must show `https://github.com/iphaminh/laundry-service-website`.
   If it shows `phuocviet`, run
   `git remote set-url origin https://github.com/iphaminh/laundry-service-website.git`.
2. `git fetch --all --prune`, then `git checkout main && git pull --ff-only`.
3. `git status` must be clean.
4. Check for unfinished work: `git branch -a --no-merged origin/main` and any open
   pull requests on GitHub.
5. Read the last entry of the **Session log** at the bottom of this file. It says
   what was done, where it is (branch or PR), and what is next.

## End-of-session checklist

1. Run the stale-value check and preview the pages (see "How to work on it").
2. Update **Status**, **Open items** and the **Session log** in this file.
3. Commit and push everything, this file included. Never leave work uncommitted.
4. The Session log entry must name the branch, the PR link if any, whether the
   change is merged and live, and what the next agent should do.

## People

- **MT**: the shop owner. Business facts and decisions come from her.
- **Site owner**: GitHub `iphaminh`. Manages the site for MT, and owns the GitHub
  repo and the Vercel account. Ask them before anything that costs money or
  changes ownership, billing, domains or DNS.
- The previous maintainer (GitHub `phuocviet`) has handed everything over and is
  no longer involved.

## What this is

A small static marketing site for a laundromat and dry cleaner in North York,
Toronto. Plain HTML, one stylesheet and one small script: no framework, no
build step, no backend, no jQuery or Bootstrap. It was rebuilt from scratch in
Oct 2026 (design inspired by a Behance laundry landing page, adapted to our
facts) and no longer uses the old DRYME / HTML Codex template, so the old
"Designed by HTML Codex" credit rule no longer applies. If any HTML Codex file
is ever brought back, its credit must come back with it.

## Hosting and deployment

| Thing | Value |
|---|---|
| Repo | `github.com/iphaminh/laundry-service-website` (public) |
| Production branch | `main`. Every push to `main` deploys to production automatically. Branches get Vercel preview deployments. |
| Vercel team | "iphaminh's projects" (Pro), team id `team_hiD7sIxXqfuItkb733M7Df9A` |
| Vercel project | `sscoinlaundry`, project id `prj_eHs2iNMqaPTQRRnhCHc1OpoAdAqy`, framework preset "Other", root `./` |
| Live URL (current primary) | https://sscoinlaundry.vercel.app |
| Other addresses | `southern-star-coin-laundry.vercel.app` 308-redirects to the primary. `sscoinlaundry-theta.vercel.app` is Vercel's auto-assigned alias and can't be removed. |

- Do **not** create another Vercel project for this repo. One already exists.
- `.vercelignore` keeps `AGENTS.md`, `CLAUDE.md`, `.claude/` and `tools/` off the
  live site.
- The `.vercel.app` addresses are what customers and the Google listing use today.
  Keep them working.
- The old remote branch `midfall-theme` is already merged into `main`. It's safe
  to ignore or delete.

## Confirmed business facts (source of truth)

Confirmed by MT. If the site disagrees with this list, the list wins. Change it
only with new confirmation from MT.

- **Name:** Southern Star Coin Laundry
- **Address:** Unit 10, 3685 Keele Street, North York, ON M3J 3H6
- **Phone:** 437-423-3962 (`tel:+14374233962`)
- **Email:** southernstarcoinlaundry@gmail.com
- **Google Maps listing:** https://maps.app.goo.gl/hLKiNmSBhVdrMN4HA (about 4.2 stars from about 100 reviews as of Oct 2026)
- **Store hours:** open every day, 5 AM to 11 PM. Holiday hours may differ.
- **Attendant & pickup hours** (copied from the Google listing):
  - Mon, Wed, Thu, Fri: 10 AM to 5 PM, and 7 to 11 PM
  - Tue: 7 to 11 PM only
  - Sat: 9 AM to 11 PM
  - Sun: 10 AM to 11 PM
- **Wash & Fold:** $1.80/lb. Fold only: $1.00/lb. Minimum 10 lbs.
- **Turnaround:** ready in 1 day. Same-day is an add-on "fast service"; its price is **not known yet**.
- **Pickup & delivery:** free within 2km, minimum 20 lbs. The site writes it as "2km".
- **Services:** dry cleaning, wash & fold, pickup & delivery, alterations ("ask in store for pricing"), ATM on site.
- **Dry-cleaning price list:** the item list on `pricing.html`, effective Jun 1, 2026. HST applies to all prices.
- **Social:** no Instagram. A Facebook page exists but still carries another business's name, so do not link it until it is renamed.

## Where things are in the code

- **Pages:** `index.html` (the landing page, all sections), `pricing.html` (full
  price list), `contact.html` (hours, map, pickup request). `about.html` and
  `service.html` are tiny `noindex` redirects to `index.html#about` and
  `index.html#services`, kept so old links and Google results still work.
- **Styles:** `css/site.css` only. Look: "warm paper & ink" (Oct 2026). Tokens
  are on `:root` at the top: `--paper`, `--manila`, `--ink`, `--butter` (the
  only supporting tint), `--night` (dark bands, footer) and `--action`
  (persimmon, the ONLY filled button colour). Persimmon is never text, and a
  filled persimmon button on a light background must keep its 2px ink border
  (it is only 2.8:1 against paper). No soft shadows: hairlines, ink rules and a
  zero-blur ink offset on the Call buttons and the hours card only. Section
  backgrounds carry a faint grain (`img/grain.webp`); cards and fields don't.
  On desktop the hero shows the washer in a round "porthole"; on phones the
  photo/video sits full-bleed under a neutral ink overlay. Every `:hover` rule
  must sit inside `@media (hover: hover) and (pointer: fine)` so taps on phones
  don't leave stuck colours; presses use `:active`.
- **Fonts:** self-hosted in `fonts/` (Besley for headings, prices and figures;
  Schibsted Grotesk for everything else), latin subsets from
  `@fontsource-variable` 5.3.0, SIL OFL 1.1 (licences next to the files).
  Both are preloaded in each page `<head>`; no Google Fonts.
- **Script:** `js/site.js` (no dependencies): mobile menu, sticky-header shadow,
  pricing tabs, reviews prev/next, and the pickup form, which opens the
  customer's email app with a pre-filled message to the shop email. Everything
  still works with JavaScript off (all price tabs show, the form is a plain
  form, FAQ uses native `<details>`).
- **Images and video:**
  - Real photo: `img/laundromat_img.jpg` (MT's dryers, 640×480) on the
    Self-serve service card and behind the booking band.
  - AI-generated (Higgsfield, Oct 2026), illustrative only: hero washer still
    `hero-washer-{1920,1280,960}.{webp,jpg}`, hero loop video
    `hero-loop-{1280,854}.{mp4,webm}` (8 s, silent, seamless), service card
    photos `svc-{washfold,dryclean,pickup,alterations}`, the How-it-works photo
    `how-folding` (mirrored so the hours card doesn't cover her face), and the
    1200×630 share image `og-cover.jpg`. Never present an AI image as "our shop"
    or "our staff"; alt texts describe the scene only.
  - The hero video only loads after the page, never with reduced motion or Data
    Saver, pauses off-screen, and has a pause button (`js/site.js` §6). The
    still photo is the first paint and the fallback.
  - Icons are inline SVG. The logo is a porthole (ink disc, butter star; inverted
    in the footer) drawn inline on every page; the favicon is the same mark as
    an inline SVG data URL.
- **Repeated on every page:** the header (logo, nav, Call button) and the footer
  (contact details, hours, quick links). Edit all three content pages (and the
  two redirects' `<head>` if titles change) when you change them.

**Prices and terms appear in several places.** When a price or term changes,
update every one, then run the SEO sync (below):
- `pricing.html`: the Wash & Fold / Fold only box, the full dry-cleaning list
  (5 tabs), and the "Effective Jun 01, 2026 · HST" lines.
- `index.html`: the hero summary and checklist, the "Why us" cards, the stats
  band, the service cards, the "How it works" steps, the 3 pricing cards and the
  line under them, the FAQ answers.
- `contact.html`: the intro, the contact card and the booking note.
- `llms.txt`, the JSON-LD and the meta descriptions are generated by the SEO
  sync from the pages, so don't hand-edit them.

**Hours:** store hours (5 AM – 11 PM daily) appear in the hero chip, "Why us",
the stats band, the FAQ, the contact page, the footer and the JSON-LD. The
attendant & pickup hours table is in `index.html` (How it works + booking band)
and `contact.html#hours`.

**Reviews:** `index.html#reviews` holds the four real Google reviews (first name
+ last initial, original wording, trimmed only by whole sentences), each
labelled "Google review", plus "Read more reviews on Google". Never mark them up
as schema.org `Review`/`AggregateRating` (Google forbids self-serving markup of
third-party reviews).

**SEO, answer engines and AI search (GEO):**
- Each indexable page has a unique title (≤ 60 chars), description (140–160),
  canonical, Open Graph and Twitter tags, and one H1 with the page's main phrase.
- JSON-LD in each `<head>`: `index.html` has WebSite + DryCleaningOrLaundry
  (address, geo, phone, email, hours, price list) + FAQPage; `pricing.html` and
  `contact.html` have BreadcrumbList + the business. Only store hours are marked
  up as opening hours; attendant hours are text.
- The hero paragraph on `index.html` is an "answer-first" summary written to be
  quoted by AI assistants. Keep it factual and about three sentences.
- `robots.txt` allows all crawlers, AI crawlers included; `sitemap.xml` lists the
  three indexable pages; `llms.txt` is a plain summary for AI crawlers.
- **Keep them in sync:** run `python3 tools/seo/build_seo.py` after changing the
  FAQ, any price, the hero summary or the address. It regenerates the head tags,
  JSON-LD, sitemap and `llms.txt` from the visible page text and is safe to
  re-run. `tools/seo/verify_seo.js` checks the result (see `tools/seo/README.md`).
- When the primary domain changes, edit `SITE` in `tools/seo/build_seo.py` and
  re-run it (canonical, og:url, JSON-LD `url`/`@id`, sitemap, robots, llms.txt
  all follow).

**Unused leftovers, kept on purpose for now** (ask the site owner before deleting;
the Mid-Autumn images may be reused each year): the old `img/` files
(`SOUTHERN_STAR.png`, `about.jpg`, `banner_free_shipping.jpg`, `carousel-*.jpg`,
`clothes*.png`, `delivery-truck_*.png`, `free_shipping.png`, `hanger_*.png`,
`icon-southernstar*.ico`, `mid_autumn.png`, `trung_thu_banner.png`,
`washing-machine_*.png`). Note `about.jpg`, `carousel-1.jpg` and `carousel-2.jpg`
came with the old HTML Codex template: don't use them on the new site without
restoring that template's credit.

## How to work on it

- **Preview:** `python3 -m http.server 8000` in the repo root, then open
  http://localhost:8000. Check phone width (about 375 px) as well as desktop.
- **Stale-value check:** this must return nothing:
  `grep -n -i -e '1\.65' -e '/lbs' -e 'hieuthuong' -e 'yahoo' -e '3 days' -e 'delivered by thursday' *.html`
- **Before committing:** make sure every opened HTML tag is closed, and if you
  changed prices, FAQ, hours or the summary, run `python3 tools/seo/build_seo.py`.
- **Commits:** small, with clear messages. Push to `main` only when the change is
  ready to go live, since `main` is production. For anything uncertain, push a
  branch, open a PR, and let the site owner check the Vercel preview first. Log
  the branch and PR in the Session log.
- **Never commit** card numbers, passwords, API keys or anyone's personal details.
  The repo is public. Never write MT's legal name, citizenship, home address or
  personal contacts here; domain registrant details come from the site owner at
  purchase time.
- **Don't invent business facts** (prices, hours, claims, reviews). Ask the site
  owner, who checks with MT.

## Design skills (optional helpers)

`.claude/skills/` holds three UI skills copied from
https://github.com/emilkowalski/skills (MIT license; see
`.claude/skills/LICENSE-emilkowalski-skills.txt`). They were copied unchanged
from commit `e8a175d` after a safety review: text only, no scripts.

- `mobile-native`: makes the site feel right on phones (tap highlights, sticky
  hover, input zoom, safe areas, the 100vh bug). Most customers visit on a phone.
- `break-ui`: stress-tests a page with worst-case content (long names, long
  prices, empty states) and reports what breaks.
- `emil-design-eng`: general UI polish and animation judgement.

Claude Code loads them automatically from `.claude/skills/`; Codex can read the
same `SKILL.md` files as guides. They are advice for the agent, not part of the
website, and `.vercelignore` keeps `.claude/` off the live site. The business
facts in this file always win over a design suggestion.

## Status (as of 2026-10-23)

- Live on `main` (old template site): correct prices, delivery rules, email,
  hours, Alterations and ATM, real Google reviews, SEO tags and JSON-LD.
- **New site built, not live:** a full rebuild (phone-first, SEO + AI-search
  work, AI photos and a hero video, "Warm Paper & Ink" look) is on branch
  `redesign`, waiting for the site owner to check the Vercel preview. See the
  last Session log entry.
- Branch `mobile-fixes` (phone fixes to the old site) is superseded by
  `redesign`; don't merge both.
- Ownership: the repo, the Vercel project and the `.vercel.app` addresses all
  belong to the site owner. The previous maintainer's Vercel project is deleted.

## Open items

1. **Domain (in progress).** MT chose `southernstarlaundry.com` as the main domain.
   Plan: also buy `southernstarlaundry.ca` and 308-redirect it to `.com`. Both were
   available at Vercel for $11.25 and $16.99 USD/year (Oct 2026).
   - **Decision pending:** buy on Vercel (billed to the Vercel team's default card,
     renewals included) or in MT's own Namecheap account with her card
     (recommended, so she owns and pays for the domains). If Namecheap, set its
     nameservers to `ns1.vercel-dns.com` and `ns2.vercel-dns.com` so DNS is
     managed in Vercel.
   - **After purchase:**
     - add both domains to the Vercel project and make `.com` the primary
     - 308-redirect `.ca`, `www.southernstarlaundry.com`, `sscoinlaundry.vercel.app`
       **and** `southern-star-coin-laundry.vercel.app` straight to the `.com`, so no
       address goes through two redirects
     - change `SITE` in `tools/seo/build_seo.py` and re-run it (updates
       canonical, og:url, JSON-LD, sitemap, robots and llms.txt)
     - submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools
     - the site owner updates the website link on MT's Google Business Profile
2. **Waiting on MT:**
   - self-serve washer and dryer prices (to add a price list)
   - the same-day add-on price
   - whether "Organic Solvents", "Progressive Cleaning System" and "Non-Toxic"
     are true. The new site leaves them out; add them back only with MT's
     confirmation (green claims need proof under Canadian advertising law).
   - the June 2026 price-announcement popup is not in the new site. Ask MT
     whether she wants a price notice back.
   - "Skirt (Pleated) · Beads +$4.24" on the price list: every other beads
     add-on ends in 5 ($4.25). Typo for $4.25? The site keeps $4.24 until MT says.
3. **MT's Google listing:** shorten the business name to just "Southern Star Coin
   Laundry" (Google's rules forbid extra keywords in the name) and list the services
   and categories instead.
4. **Domain email (later):** for example `info@southernstarlaundry.com`. Vercel does
   not provide email. Options: Hostinger Email (the site owner has an account),
   Zoho Mail (free plan), or Google Workspace. Add the MX records in Vercel DNS.
5. **Local SEO and AI search:** claim Yelp, Bing Places and Apple Business Connect
   listings; rename the Facebook page and then link it; keep collecting Google
   reviews. Research (Oct 2026) found .ca vs .com barely matters; the Google
   Business Profile, reviews and directory listings drive local and AI visibility.
   Google Business Profile: categories laundromat + dry cleaner, services, hours,
   photos, website = the canonical URL. Use the identical name, address and phone
   everywhere. Submit `sitemap.xml` to Google Search Console and Bing Webmaster
   Tools once the site is live.
6. **Ads (later):** an ad's final URL must be the primary domain, never one that
   redirects. Target a radius around the shop and use "Presence" location targeting.
7. **Repo visibility:** the repo is public. The site owner could make it private;
   Vercel deploys keep working either way.
8. **Real-phone check of the new site** (emulation can't show these): on an
   iPhone and an Android phone, check buttons and cards return to normal after a
   tap, presses show feedback, the menu opens/closes and scrolls in landscape,
   the reviews row swipes, the Google map on `contact.html` pans with two fingers
   and the Directions button is easy to reach, the notch padding in landscape,
   and that "Send request by email" opens the mail app with the details filled in.
9. **Photos (done, could be better).** AI photos and the hero video are on the
   `redesign` branch (see "Images and video" above). Real photos or a 10-second
   phone video of MT's shop would be more authentic; swap them in when she has
   them (same file names and sizes, or update the markup). Higgsfield source
   jobs (to regenerate or re-download): hero still `3d14ab9c-7151-41de-8590-35345ca1f7fe`,
   hero video `32026bab-223c-4ba7-808e-2285daed1db6`, wash & fold
   `41571db2-ac08-4a7b-8637-9fe4f96fad58`, dry cleaning
   `546361f6-c4ab-4a88-bd48-5cf231ac14a6`, pickup `dcecc032-6081-41a1-a3eb-1361d691bd67`,
   alterations `75bf1b73-fa5f-43d5-8f37-66cee4c114d8`, folding
   `05073782-306b-4bc3-a9b7-fd8b9f9fea18`. The site owner's Higgsfield account
   is on a 3-day Plus trial started Oct 23 that renews at $49/month unless they
   cancel; ask before spending credits. The cloud environment must allow
   `d8j0ntlcm91z4.cloudfront.net` to download Higgsfield files.

## Session log

Newest entry last. Each entry: date, agent, what changed, where it is (branch, PR,
merged/live), and what is next.

- **2026-10-07 to 10-09, Claude Code.**
  - Reviewed the site and made 6 commits, merged in PR #4 (on the repo before its
    transfer) and live: prices, delivery, email, links, hours, Alterations and ATM,
    real reviews, SEO tags, cleanup.
  - Helped transfer the repo from `phuocviet` to `iphaminh`, created the Vercel
    project `sscoinlaundry`, and attached `sscoinlaundry.vercel.app` and
    `southern-star-coin-laundry.vercel.app`.
  - Added this file, `CLAUDE.md` and `.vercelignore`, pushed directly to `main`
    (docs only, no visible site change).
  - Next: the domain purchase (open item 1), then MT's answers (item 2).
- **2026-10-23, Claude Code.**
  - Added the `mobile-native`, `break-ui` and `emil-design-eng` skills to
    `.claude/skills/` (from emilkowalski/skills, MIT) and `.claude/` to
    `.vercelignore`. Pushed to `main`; no visible site change.
  - Open question: MT may want a different Gmail address as the main business
    email. The site keeps `southernstarcoinlaundry@gmail.com` until the site
    owner confirms.
  - Next: the email decision, then the domain purchase (open item 1).
- **2026-10-23 (later), Claude Code.**
  - Ran the `mobile-native` skill on all five pages (Playwright, Chromium only, in
    iPhone 13 / Pixel 5 / 320 px profiles) and fixed what it found. No business
    facts changed.
    - `index.html`: the hero stacks to one column below 992 px (it was a fixed
      2-column grid that clipped text at 320 px and pushed the sun off every
      phone); the services banner loops seamlessly on every width; the "What We
      Offer" cards lift on mouse hover only (inline `onmouseover` removed); the
      price popup lost `data-backdrop="static"` and scrolls inside, so "Got it"
      is on screen on short phones; dead `.hover-effect` and marquee JS removed
      (also from `pricing.html`).
    - Pricing rules, both copies: cards no longer force a 300 px column (no
      sideways scroll at 320 px), the price block wraps under long item names,
      and notes, labels and the badge are 12–12.5 px in darker colours (WCAG AA).
    - `css/style.css`: Bootstrap `:hover` rules gated to mouse pointers, focus
      rings only for keyboard focus, and the new "MOBILE-NATIVE FIXES" block.
      `theme-color` meta on every page. `js/main.js`: a passive `touchstart`
      listener (iOS press feedback) and the review carousel slowed to 10 s (off
      under reduced motion).
  - Verified in emulation: no horizontal overflow at 280–1280 px on any page,
    desktop hover unchanged at 1280 px. Real-phone behaviour is open item 8.
  - Where: branch `mobile-fixes`, pushed for a Vercel preview. Not merged and not
    live. Merge it into `main` once the site owner has checked the preview on a
    phone.
  - Next: check the preview on a phone (item 8) and merge `mobile-fixes` into
    `main`; then MT's popup decision (item 2), the email decision, and the domain
    purchase (item 1).
- **2026-10-23 (evening), Claude Code.**
  - The site owner asked for a full rebuild inspired by a Behance laundry landing
    page ("WashNow247", screenshots supplied), with our own facts, a trendier
    colour scheme, photos, and strong SEO / AI-search work.
  - Built from scratch with a multi-agent workflow: core page, secondary pages,
    four reviews (content accuracy, mobile-native, break-ui, design critique;
    46 findings, 41 fixed, 5 skipped with reasons), a colour pass and an SEO pass.
    - Pages: `index.html` (hero with answer-first summary, why us, stats,
      services, about + how pickup works, pricing cards, reviews, pickup request,
      FAQ), `pricing.html` (full list, verbatim from the old site), `contact.html`
      (hours, map, form); `about.html`/`service.html` redirect.
    - Colours: deep teal + aqua with coral Call buttons; every text pair checked
      ≥ WCAG AA by script.
    - SEO/GEO: per-page titles/descriptions/canonicals/OG, JSON-LD (business,
      prices, FAQ, breadcrumbs), `robots.txt`, `sitemap.xml`, `llms.txt`, and the
      sync tools in `tools/seo/` (101 checks pass).
    - Removed the old template code (`lib/`, `scss/`, `css/style*.css`,
      `js/main.js`, the HTML Codex `LICENSE.txt`) and the footer credit, since no
      template code or image is used any more. Unused images kept (see above).
  - Verified in Chromium: no sideways scroll at 280–1280 px on every page and
    tab, no console errors, one H1 per page, JSON-LD valid, no-JS fallbacks work.
  - Where: branch `redesign`, pushed for a Vercel preview. Not merged, not live.
  - Next: the site owner checks the preview (and on a phone, item 8); add photos
    once credits are in (item 9); then merge `redesign` into `main` (it replaces
    `mobile-fixes`). After going live, do item 5.
- **2026-10-23 (night), Claude Code.**
  - Added AI-generated photos and a hero background video (Higgsfield trial,
    24.5 credits): 6 photos at high/2k (gpt_image_2_5) and an 8 s 1080p
    image-to-video loop (kling4_0) with matching first and last frames.
  - `index.html`: hero video with still-photo fallback and pause button; photos
    on 5 of the 6 service cards (Self-serve keeps the real shop photo, ATM keeps
    its icon); new How-it-works photo; hero still preloaded. `css/site.css`:
    hero layers (photo, video, overlay lighter on the right), photo cards,
    pause button. `js/site.js` §6 loads the right size and format (MP4, else
    WebM). Share image is now `img/og-cover.jpg` 1200×630 (SEO sync re-run).
  - Verified in Chromium: video plays, pauses, resumes, stops off-screen, stays
    off with reduced motion and without JS; all images load; no sideways scroll
    at 320–1440 px; white hero text ≥ 7.5:1 over every video frame (desktop) and
    ≥ 9.5:1 (phone); 101 SEO checks pass. Headless Chromium plays the WebM;
    real Safari/Chrome use the MP4.
  - Where: branch `redesign`, pushed for a Vercel preview. Not merged, not live.
  - Next: the site owner reviews the preview (photos, video, phone check, item
    8), then merge `redesign` into `main`. Decide on the Higgsfield trial before
    it renews (~Oct 26).
- **2026-10-24, Claude Code.**
  - The site owner said the teal/turquoise colours looked like a bought template
    and asked for a 2026-trend restyle plus removing the ATM card.
  - Multi-agent workflow: 2 researchers (2026 colour/type trends with sources:
    Pantone Cloud Dancer, Pinterest Palette 2026 persimmon, warm neutrals,
    laundromat brands escaping "bluish white"; template tells), 3 directions
    rendered on the real pages (A Warm Paper & Ink, B Linen & cobalt
    colour-block, C Neighbourhood signage), 2 judges (customer fit, craft) →
    A won 15.7 vs 13.1 vs 8.4, then implementation and an independent review.
  - Result: paper `#F7F3EB` / manila base, ink `#211A16`, one persimmon `#FF5C34`
    action colour (ink label + 2px ink border), butter `#F4CF5D` accent,
    charcoal dark bands; Besley (headings) + Schibsted Grotesk (text),
    self-hosted in `fonts/` (Google Fonts removed); desktop hero shows the
    washer video in a round "porthole"; new porthole star logo and favicon;
    faint paper grain on section backgrounds; template tells removed (glass
    cards, gradients, pastel icon circles, repeated eyebrows, floating rating
    card). ATM service card and footer link removed (ATM stays in the FAQ and
    JSON-LD); services grid is 2 wide + 3 on desktop.
  - Verified: 0 contrast failures on all text (white hero text ≥ 6.8:1 over
    every video frame on phones, ≥ 9.75:1 on desktop), no sideways scroll
    280–1440 px, 0 tap targets under 44 px, every :hover gated, no-JS and
    reduced-motion OK, 101 SEO checks pass.
  - Where: branch `redesign`, pushed for a Vercel preview. Not merged, not live.
  - Next: the site owner reviews the preview on a phone (item 8); then merge
    `redesign` into `main`. Higgsfield trial renews ~Oct 26 unless cancelled.
