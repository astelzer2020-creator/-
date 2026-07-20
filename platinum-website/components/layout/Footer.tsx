import Link from "next/link";
import { site } from "@/content/site";
import {
  verifiedLegalEntities,
  verifiedLicensing,
  verifiedPhone,
  verifiedEmail,
} from "@/lib/content";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-obsidian text-platinum">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <p className="font-display text-xl font-semibold tracking-[0.18em] text-ivory">
              {site.name}
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-platinum/80">
              {site.description}
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8">
            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-eyebrow text-bronze-light">
                Explore
              </p>
              <ul className="space-y-3 text-sm">
                {site.nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-ivory">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-eyebrow text-bronze-light">
                Legal
              </p>
              <ul className="space-y-3 text-sm">
                {site.footerNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-ivory">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-eyebrow text-bronze-light">
              Start a conversation
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/contact" className="underline decoration-bronze underline-offset-4 hover:text-ivory">
                  Request a Consultation
                </Link>
              </li>
              {/* Call/Text actions render only once the phone number and
                  routing are verified (brief §1) — see docs/APPROVALS.md. */}
              {verifiedPhone ? (
                <li>
                  <a href={`tel:${verifiedPhone.replace(/[^+\d]/g, "")}`} className="hover:text-ivory">
                    {verifiedPhone}
                  </a>
                </li>
              ) : null}
              {verifiedEmail ? (
                <li>
                  <a href={`mailto:${verifiedEmail}`} className="hover:text-ivory">
                    {verifiedEmail}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-platinum/15 pt-8 text-xs leading-relaxed text-platinum/60">
          {/* Legal entity + licensing lines appear only after verification. */}
          {verifiedLegalEntities.length > 0 ? (
            <p>{verifiedLegalEntities.join(" · ")}</p>
          ) : null}
          {verifiedLicensing.length > 0 ? (
            <p className="mt-1">{verifiedLicensing.join(" · ")}</p>
          ) : null}
          <p className="mt-1">
            © {year} {site.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
