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
Toronto. It is plain HTML, CSS and JS (Bootstrap 4 + jQuery) built on the free
**DRYME template by HTML Codex**. There is no build step, framework or backend.

**License rule:** the free template requires the footer credit
"Designed by HTML Codex" with its link. Never remove it.

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
- `.vercelignore` keeps `AGENTS.md` and `CLAUDE.md` off the live site.
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

- **Pages:** `index.html`, `about.html`, `service.html`, `pricing.html`, `contact.html`.
- **Repeated on every page:** the top bar (phone, hours, directions), the navbar,
  and the footer (contact info, hours, quick links, Google Maps button, HTML Codex
  credit). Edit all five pages when you change any of them.

**Prices and terms appear in many places.** When a price or term changes, update
every one:
- `pricing.html`: the Wash & Fold box, the full dry-cleaning item list, and the
  "Effective Jun 01, 2026 / H.S.T." lines (two places).
- `index.html`:
  - the hero paragraph (1-day, same-day add-on, 2km, 20 lbs)
  - the scrolling banner (both copies of the item set)
  - the "What We Offer" cards (Pickup & Delivery "Free within 2km · min. 20 lbs",
    Alterations "Ask in store for pricing")
  - the Wash & Fold popup `#washFoldModal`
  - the "Why Choose Us" tiles
  - the dry-cleaning price tabs, which copy the pricing.html list item for item
  - the "Effective Jun 01, 2026" lines (two places)
  - the June 2026 price-announcement popup `#priceAnnouncementModal`, which shows
    item prices and auto-opens every 12 hours (localStorage key `priceNoticeShown`)
- `service.html`: the one-line summaries under the service cards.
- `about.html`: the "Why Choose Us" tiles.
- `contact.html`: the "Questions or want to book a pickup?" paragraph (delivery terms).
- Every page: the `<meta name="description">`.

**Hours:**
- `contact.html`: the `#hours` section (Store Hours card and attendant table) and
  its meta description.
- The top bar and footer on every page, and the homepage banner.
- The JSON-LD `openingHoursSpecification` in `index.html` (`05:00` to `23:00`).

**Services** (Alterations, ATM): the homepage banner, the `index.html` "What We
Offer" cards, and the `service.html` cards plus its ATM line.

**Reviews:** the testimonial carousel in `index.html` and `service.html` holds four
real Google reviews (first name + last initial, original wording, trimmed only by
whole sentences), each labelled "Google review", plus a "Read more reviews on
Google" button.

**Structured data:** a schema.org `DryCleaningOrLaundry` JSON-LD block in the
`index.html` `<head>` (address, phone, email, hours, geo, `url`). Update `url` when
the primary domain changes.

**Styles:**
- `css/style.css` is the compiled template CSS **plus** hand-added pricing rules at
  the end ("PRICING SECTION — NEW DESIGN", around line 9574 onward). Those rules are
  not in `scss/`.
- `index.html` has one inline `<style>` block: the seasonal hero and banner styles,
  plus a copy of the pricing rules. To change pricing styles, edit both
  `css/style.css` and that block.
- `pricing.html` has no inline style; it uses `css/style.css`.
- `css/style.min.css` is stale and unused. Do not switch to it, and do not rebuild
  `css/style.css` from `scss/`; that would wipe the hand-added rules.

**Libraries:** in `lib/`. jQuery, Bootstrap JS and Font Awesome load from CDNs.

**Unused leftovers, kept on purpose for now** (ask the site owner before deleting;
the Mid-Autumn images may be reused each year):
- `img/` files: `SOUTHERN_STAR.png`, `banner_free_shipping.jpg`,
  `carousel-1.jpg`, `carousel-2.jpg`, `clothes_13354565.png`, `free_shipping.png`,
  `hanger_8244646.png`, `icon-southernstar.ico`, `laundromat_img.jpg`,
  `mid_autumn.png`, `trung_thu_banner.png`
- the `.mid-autumn-*` and `.hover-effect` CSS in `index.html`

## How to work on it

- **Preview:** `python3 -m http.server 8000` in the repo root, then open
  http://localhost:8000. Check phone width (about 375 px) as well as desktop.
- **Stale-value check:** this must return nothing:
  `grep -n -i -e '1\.65' -e '/lbs' -e 'hieuthuong' -e 'yahoo' -e '3 days' -e 'delivered by thursday' *.html`
- **Before committing:** make sure every opened HTML tag is closed.
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

## Status (as of 2026-10-09)

- Done and live:
  - correct prices, delivery rules and email
  - call, email and directions buttons in place of a broken PHP form
  - store and attendant hours
  - Alterations and ATM
  - real Google reviews
  - working links
  - page titles, meta descriptions and JSON-LD
  - template blog pages, PHP mail script and testimonial stock images removed
    (other unused images are listed above)
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
     - update the JSON-LD `url`
     - the site owner updates the website link on MT's Google Business Profile
2. **Waiting on MT:**
   - self-serve washer and dryer prices (to add a price list)
   - the same-day add-on price
   - whether "Organic Solvents", "Progressive Cleaning System" and "Non-Toxic"
     (on `index.html` and `about.html`) are true. If not, remove them; green claims
     need proof under Canadian advertising law.
   - whether to keep or remove the June 2026 price-announcement popup
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
6. **Ads (later):** an ad's final URL must be the primary domain, never one that
   redirects. Target a radius around the shop and use "Presence" location targeting.
7. **Repo visibility:** the repo is public. The site owner could make it private;
   Vercel deploys keep working either way.

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
