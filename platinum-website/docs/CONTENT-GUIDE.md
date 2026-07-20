# Content Guide

How to add or change content without touching component code. All content
lives under `content/`; after editing, run `npm run typecheck` — the types
catch missing fields — then commit. The site rebuilds statically.

## Add a project / case study

Edit `content/projects.ts` and append a `Project` object:

1. `slug` — unique, human, no keyword stuffing (`park-slope-townhouse`).
2. `category` — `Residential` | `Commercial` | `Installations` (drives the /work filters).
3. `services` — service slugs this project proves (drives "Related work" on service pages).
4. `location` — the **client-approved public label only** (e.g. "Brooklyn"), never a street address.
5. `clientType` — e.g. Private Residence / Workplace / Retail; no client names without written approval.
6. `summary / challenge / approach / outcome` — real copy, short and scannable.
7. `hero` + `gallery` — put approved images in `public/images/`; gallery ordered as a story (conditions → process → details → full space). Every image needs honest `alt` text and, where relevant, a caption with credits.
8. `credits` — approved architect/designer/fabricator credits.
9. `approval` — **must be `"approved"` only after written client sign-off.** Anything `"pending"` is badged, noindexed, kept out of the sitemap, and hidden entirely when `NEXT_PUBLIC_SHOW_PENDING_CONTENT=false`.
10. `seo` — unique title/description; preview with a crawler tool before release.

Deleting or renaming a slug? Add a 301 in `next.config.ts` (`redirects()`)
— never leave an old URL dead.

## Add a testimonial

Only client-approved text. In `content/verified-company-data.json`, set
`testimonials.status` to `"verified"` and add entries to
`testimonials.value`:

```json
{ "quote": "…", "attribution": "M.R., Homeowner, Brooklyn", "project": "park-slope-townhouse" }
```

The home-page Proof section renders automatically once at least one
verified testimonial exists. The attribution must match the exposure level
the client approved (initials vs. full name).

## Verify a business fact

Open `content/verified-company-data.json`, replace the `value` with the
approved data, change `status` to `"verified"`, and remove the item from
`docs/APPROVALS.md`. Examples: once `phone` is verified, Call/Text actions
appear in the footer, contact page, and thank-you page automatically;
once `legalEntities` / `licensing` are verified, the footer and About
credentials render them.

## Edit services / process copy

- `content/services.ts` — each service's audience, inclusions, approach,
  risks, FAQs, and scope notes. Keep FAQs unique per service (no SEO
  copy-paste between pages).
- `content/process.ts` — the five stages and their deliverables.

## Images

- Approved originals stay outside the repo (client asset library); export
  web sizes into `public/images/`.
- Keep ratios consistent: hero 16:9/3:2, cards 4:3, mobile feature 4:5.
- Alt text describes the space/action; never repeat keywords mechanically.
- Stock or temporary imagery must never be presented as Platinum's work.
