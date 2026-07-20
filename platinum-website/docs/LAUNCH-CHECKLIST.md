# Launch Checklist & QA Record

## Production audit performed (July 20, 2026 — this build)

- [x] `npm run typecheck` — clean (TS strict, `noUncheckedIndexedAccess`)
- [x] `npm run lint` — clean
- [x] `npm test` — 23/23 unit + content-integrity tests pass (lead schema, rate limiter, unique slugs, image files exist, alt text, SEO fields, no placeholder markers, verification-gate statuses)
- [x] `npm run build` — 26 routes, no errors; every route static/SSG; First Load JS ~102 kB shared
- [x] Full crawl (Playwright): all 23 discovered internal links return 200; custom 404 serves for unknown URLs; zero console/page errors on every route; no Lorem Ipsum/TODO/FIXME markers in rendered copy
- [x] SEO: title, meta description, canonical, OG/Twitter tags, single h1, `lang` attribute on all 21 crawled pages; Organization + BreadcrumbList JSON-LD; sitemap.xml (incl. category pages), robots.txt
- [x] Accessibility: **axe-core WCAG 2.x A/AA — zero violations** on 18 routes × mobile + desktop (after fixing bronze-on-dark and bronze-on-platinum contrast and /work heading order); keyboard drawer, skip link, labeled forms, reduced-motion verified by construction and Lighthouse a11y 100
- [x] Responsive: zero horizontal overflow at 320/360/390/412/430/768/1024/1280/1440/1920/2560/3840 px across 13 routes
- [x] Lighthouse (production build): desktop **100/100/100/100** on all 8 key pages; mobile perf 95–99, a11y 100, best-practices 100, SEO 100 (case-study SEO 69 is solely the intentional `noindex` on unapproved previews — resolves when real projects are approved)
- [x] Performance: FCP 0.8–1.2 s, TBT ≤ 210 ms, CLS ≤ 0.03 on simulated Slow 4G; total page weight ~253 KB
- [x] Lead form end-to-end (production build, Playwright): invalid submit → inline `role="alert"` errors **with user input preserved**; valid submit → redirect to /contact/thank-you; lead persisted to `var/leads/`; `?type=` preselect verified for all four service CTAs (webhook path code-reviewed, needs `LEAD_WEBHOOK_URL` to exercise)
- [x] Honeypot drops bot submissions; rate limiter returns a friendly error after 5 submissions/10 min/IP
- [x] Security headers verified on responses (CSP, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy)
- [x] Pending portfolio entries: badge shown, `noindex`, excluded from sitemap, hidden when `NEXT_PUBLIC_SHOW_PENDING_CONTENT=false`
- [x] Unused code removed (Reveal client component replaced by inline scroll-reveal driver, dead exports pruned); no unused dependencies

## Before production DNS (gated on docs/APPROVALS.md items 1–8)

- [ ] Replace structural-preview projects with client-approved case studies and photography
- [ ] `NEXT_PUBLIC_SITE_URL` set to the approved domain; re-crawl for canonical/indexability
- [ ] `NEXT_PUBLIC_SHOW_PENDING_CONTENT=false` in the production environment
- [ ] `LEAD_WEBHOOK_URL` pointed at the approved CRM/email destination; send a test lead in production and confirm receipt by a human
- [ ] Simulate webhook failure (bad URL in staging) and confirm the ops ALERT log fires and the user still gets a truthful state
- [ ] Attorney-approved Privacy/Terms/Accessibility text swapped in
- [ ] Redirect map from the old site (platinumconstructionny.com audit) implemented in `next.config.ts` `redirects()`
- [ ] Lighthouse mobile ≥ 95 on `/`, a service page, `/work`, a case study, `/contact` — run against the production URL; document any exception with reason and fix plan
- [ ] Cross-browser pass: Safari iOS/macOS, Chrome, Edge, Firefox (two current majors); viewports 320/360/390/412/430/768/1024/1280/1440/1920; Slow 4G + CPU throttle; touch targets; orientation change; safe areas
- [ ] Screen reader smoke test (VoiceOver + NVDA): navigation, form completion, error announcement; 200% zoom; keyboard-only pass
- [ ] Analytics provider wired in `lib/analytics.ts` with client-owned account; verify no PII in events; consent banner if legally required
- [ ] Google Search Console verified, sitemap submitted; Google Business Profile NAP matches site exactly
- [ ] Uptime monitor + error tracking + form-delivery alert configured
- [ ] Backup/rollback drill: promote previous Vercel deployment once, document the steps
- [ ] Launch sign-off recorded by someone other than the developer

## Post-launch

- [ ] Week-1 review of Core Web Vitals field data (LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.10)
- [ ] First real leads traced end-to-end into the CRM with source attribution
- [ ] Content cadence: publish approved case studies as they clear approval
