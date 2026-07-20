# Launch Checklist & QA Record

## QA already performed (July 20, 2026 — this build)

- [x] `npm run typecheck` — clean (TS strict, `noUncheckedIndexedAccess`)
- [x] `npm run lint` — clean
- [x] `npm run build` — 23 routes, no errors; First Load JS ~103–121 kB
- [x] All P0 routes return 200 directly and on refresh; custom 404 serves with Work/Contact paths
- [x] Lead form end-to-end (production build, Playwright): invalid submit → inline `role="alert"` errors **with user input preserved**; valid submit → redirect to /contact/thank-you; lead persisted to `var/leads/` (webhook path code-reviewed, needs `LEAD_WEBHOOK_URL` to exercise)
- [x] Honeypot drops bot submissions; rate limiter returns a friendly error after 5 submissions/10 min/IP
- [x] Visual review at 1440px and 390px on home, work, case study, services, service detail, process, about, contact — no horizontal overflow, no console errors, no page errors
- [x] `sitemap.xml`, `robots.txt` (thank-you disallowed), canonical URLs, OG/Twitter metadata, Organization + BreadcrumbList JSON-LD
- [x] Security headers verified on responses (CSP, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy)
- [x] Pending portfolio entries: badge shown, `noindex`, excluded from sitemap, hidden when `NEXT_PUBLIC_SHOW_PENDING_CONTENT=false`

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
