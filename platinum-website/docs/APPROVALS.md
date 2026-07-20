# REQUIRES CLIENT APPROVAL — Consolidated List

The single approval list required by the master brief (§0, §1). Nothing
below may be published as fact until the client confirms it. Each item
maps to a `pending` field in `content/verified-company-data.json`; flipping
a field to `"verified"` (with the approved value) is what makes the site
render it.

## Blocking launch (must be resolved before production DNS)

| # | Item | What is needed | Where it lands |
|---|---|---|---|
| 1 | Legal entities & footer presentation | Verified spelling, DBA, ownership of Platinum Installations Inc. / Platinum TNT LLC / Platinum Construction, and how they may be shown | Footer, Terms of Use |
| 2 | Phone number & routing | Confirm (718) 677-1050 receives calls/SMS, hours, who answers | Header/footer/contact Call & Text actions (currently hidden) |
| 3 | Service area | Boroughs/areas actually licensed and served | Contact page, local SEO, JSON-LD |
| 4 | Domain | Ownership/availability check incl. audit of platinumconstructionny.com (existing site, content, SEO, redirects) — no purchase/transfer without explicit approval | `NEXT_PUBLIC_SITE_URL`, canonical URLs, redirect map |
| 5 | Lead recipient & SLA | Who receives leads (email/CRM → `LEAD_WEBHOOK_URL`), response-time promise | Lead delivery, thank-you page copy |
| 6 | Attorney review of legal pages | Privacy, Terms, Accessibility statements | `/privacy`, `/terms`, `/accessibility` |
| 7 | Real projects (10–15 candidates) | Per project: image ownership/rights, permitted location granularity, scope, year, credits, written publication approval | `content/projects.ts` — replaces the three structural previews; then set `NEXT_PUBLIC_SHOW_PENDING_CONTENT=false` obsolete by real `approved` entries |
| 8 | Photography | Approved architectural photography incl. hero imagery (desktop + 4:5/3:4 mobile crops) | All placeholder SVGs under `public/images/` |

## Needed soon (not DNS-blocking)

| # | Item | What is needed | Where it lands |
|---|---|---|---|
| 9 | Founder profile | Preferred spelling (Boruch/Baruch), title, bio from content interview, approved portrait | About page, home Leadership block |
| 10 | Licensing & insurance | License numbers/insurance from approved documents, display per legal requirements | About credentials section, footer |
| 11 | Business address decision | Office address vs. service-area-only vs. mailing address | Contact page, JSON-LD, Google Business Profile NAP |
| 12 | Testimonials | Approved text + attribution level per client | Home Proof section (renders automatically once added as `verified`) |
| 13 | Awards / associations / press | Documentation for any claim | Trust strip (currently omitted by design) |
| 14 | Public email address | If one should be published | Footer, contact page |
| 15 | Brand lockup | Choice among 2–3 logotype options (to be presented); favicon currently a neutral "P" monogram | Header, footer, favicon, OG image |
| 16 | Analytics account | Client-owned GA4/Plausible + consent requirements | `lib/analytics.ts` wiring, cookie banner if required |
| 17 | Sanity (or chosen CMS) project | Client-owned account/credentials for the managed CMS migration | Replaces `content/` modules per README |
| 18 | Social profiles | Only active, owned profiles | Footer |
| 19 | Hero video (optional) | Licensed clips + poster frames, mobile/desktop versions | Home hero (image-only today by design) |

## Decisions taken autonomously (flagged for review, not blocking)

- **Umbrella brand**: site is built as one PLATINUM brand per the brief's
  recommendation; sub-entities appear only after legal verification.
- **File upload**: deferred to a post-contact secure link instead of a
  public upload field, until private storage + malware scanning are
  provisioned (brief §15). Revisit when infrastructure is approved.
- **Trust strip & counters**: omitted entirely rather than shown empty —
  the brief forbids unverified numbers.
- **Placeholder imagery**: abstract brand-palette SVG compositions labeled
  "Placeholder — awaiting approved photography"; deliberately impossible
  to mistake for real project photos.
