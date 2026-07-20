# PLATINUM — Premium Construction Brand Website

Production-ready marketing site for the Platinum construction businesses
(New York): residential renovations, commercial build-outs, specialty
installations, and general contracting. Built to the Hebrew master build
brief ("Platinum Website Master Build Brief"), which is the authoritative
product specification.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, React Server Components), strict TypeScript |
| Styling | Tailwind CSS 4 with centralized design tokens (`app/globals.css` `@theme`) |
| Motion | CSS transitions + a ~40-line IntersectionObserver reveal (`components/ui/Reveal.tsx`) — no animation library, `prefers-reduced-motion` respected |
| Content | Typed content layer in `content/` (see "Content & CMS" below) |
| Forms | React 19 Server Action + Zod validation (client and server), honeypot, in-memory rate limiting, truthful success state |
| Fonts | `next/font` — Fraunces (display) + Inter (body), self-hosted at build |
| Deployment | Vercel-ready (also runs on any Node host: `npm run build && npm run start`) |

First Load JS is ~102 kB shared; every page is statically rendered.
Audited at 100/100/100/100 Lighthouse desktop (95–99 perf mobile, 100
a11y/BP/SEO) and zero axe-core WCAG AA violations — see
`docs/LAUNCH-CHECKLIST.md` for the full QA record.

## Quick start

```bash
npm install
cp .env.example .env.local   # then edit values
npm run dev                  # http://localhost:3000

npm run typecheck            # tsc --noEmit (strict)
npm run lint                 # eslint
npm test                     # vitest: schema, rate-limit, content integrity
npm run build && npm start   # production build + serve
```

## Routes (all P0 routes from the brief)

`/` · `/about` · `/services` · `/services/{residential-renovation,commercial-build-outs,specialty-installations,general-contracting}` · `/work` · `/work/category/{residential,commercial,installations}` filters · `/work/[slug]` case studies · `/process` · `/contact` · `/contact/thank-you` · `/privacy` · `/terms` · `/accessibility` · custom 404 · `sitemap.xml` · `robots.txt` — every route statically rendered.

## The verification gate (read this first)

The brief's hard rule: **no business fact may be published without client
approval.** This is implemented as a system, not a convention:

- `content/verified-company-data.json` — every business fact carries
  `status: "verified" | "pending"`. Typed accessors in `lib/content.ts`
  return `null` for pending fields, so components fail safe: the phone
  number, legal entity lines, licensing, testimonials, and counters simply
  do not render until verified.
- Portfolio entries in `content/projects.ts` carry
  `approval: "approved" | "pending"`. Pending entries use clearly
  non-photographic placeholder graphics, show a "Preview — pending
  approval" badge, are excluded from `sitemap.xml`, and carry
  `noindex`. Set `NEXT_PUBLIC_SHOW_PENDING_CONTENT=false` to hide them
  entirely (required in production until approvals arrive).
- The single consolidated approval list is **`docs/APPROVALS.md`**.

## Content & CMS

Content lives in typed modules under `content/`:

- `site.ts` — brand, nav, CTAs
- `services.ts` — the four service pages (inclusions, approach, risks, FAQs, SEO)
- `projects.ts` — portfolio data model per brief §7 (category, services, location label, client type, scope, challenge/approach/outcome, gallery with captions, credits, approval workflow field, SEO)
- `process.ts` — the five process stages and deliverables
- `verified-company-data.json` — the verification gate

This satisfies the brief's allowance for a `content/` source when a managed
CMS is not yet provisioned. The models mirror the brief's Sanity schema
1:1, so migrating is mechanical: create the same types in Sanity, replace
the `content/*` imports with GROQ queries in `lib/`, and keep the
`approval` field as the draft → review → publish workflow. Provisioning
Sanity requires client-owned credentials — tracked in `docs/APPROVALS.md`.

## Lead pipeline

1. `components/forms/LeadForm.tsx` (client) → `app/actions/lead.ts` (server action).
2. Zod validation on both sides; inline, announced (`role="alert"`) errors; submitted values are preserved after a server-side error.
3. Honeypot field silently drops bots; sliding-window rate limit per IP.
4. Delivery: `LEAD_WEBHOOK_URL` (CRM/email webhook) when configured, with fallback persistence to `var/leads/*.json` — the thank-you page is only shown after the lead is durably stored, and a delivery failure logs an ops `ALERT`.
5. `generate_lead` is tracked once per submission on the thank-you page; analytics events are typed in `lib/analytics.ts` and never carry PII. File upload is deliberately deferred to a post-contact secure link until private storage + scanning are provisioned (brief §15 upload requirements).

## Accessibility & performance

- WCAG 2.2 AA patterns: skip link, landmarks, heading hierarchy, labeled
  form fields with `aria-describedby` hints/errors, keyboard-operable
  mobile drawer (Escape closes), visible focus rings, AA contrast on light
  and dark sections, `prefers-reduced-motion` disables all animation.
- Static rendering, self-hosted fonts with `display: swap`, prioritized
  hero media, `next/image` with explicit `sizes`, no third-party scripts,
  no animation framework. Security headers incl. CSP in `next.config.ts`.

## Deploy (Vercel)

1. Import the repo, set the project root to `platinum-website/`.
2. Set env vars from `.env.example` (`NEXT_PUBLIC_SITE_URL` = approved domain, `LEAD_WEBHOOK_URL`, `NEXT_PUBLIC_SHOW_PENDING_CONTENT=false`).
3. Custom domain only after ownership is verified (see `docs/APPROVALS.md`).
4. Follow `docs/LAUNCH-CHECKLIST.md` before pointing DNS.

Rollback: Vercel → Deployments → promote the previous deployment (or
`git revert` + push). Leads are never stored in the repo, so rollback is
content-safe.

## Docs

- `docs/APPROVALS.md` — the single list of facts awaiting client approval
- `docs/CONTENT-GUIDE.md` — how to add projects, services, testimonials
- `docs/LAUNCH-CHECKLIST.md` — gated launch runbook + QA record
