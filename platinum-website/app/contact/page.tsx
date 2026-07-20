import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/sections/PageHeader";
import { LeadForm } from "@/components/forms/LeadForm";
import { verifiedPhone, verifiedEmail } from "@/lib/content";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Start a project conversation with Platinum. Tell us what you are building in New York and we will confirm fit and the right next step.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Start a project conversation"
        lead="A short form is enough to begin. We review every inquiry personally, confirm whether we are the right fit, and propose a clear next step."
      />
      <section className="py-14 lg:py-20">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1fr_320px]">
            <div className="relative max-w-2xl">
              <LeadForm />
            </div>
            <aside className="space-y-8 text-sm leading-relaxed text-slate">
              <div>
                <h2 className="mb-2 text-xs font-medium uppercase tracking-eyebrow text-bronze-dark">
                  What happens next
                </h2>
                <ol className="list-decimal space-y-2 pl-4">
                  <li>We review your project details.</li>
                  <li>A member of the team responds to confirm fit and next steps.</li>
                  <li>If it is a match, we schedule a consultation and site review.</li>
                </ol>
              </div>
              {/* Call/Text actions appear only after the phone number and
                  routing are verified (brief §1). */}
              {verifiedPhone ? (
                <div>
                  <h2 className="mb-2 text-xs font-medium uppercase tracking-eyebrow text-bronze-dark">
                    Prefer to talk?
                  </h2>
                  <p>
                    Call or text{" "}
                    <a
                      href={`tel:${verifiedPhone.replace(/[^+\d]/g, "")}`}
                      className="font-medium text-ink underline underline-offset-2"
                    >
                      {verifiedPhone}
                    </a>
                  </p>
                </div>
              ) : null}
              {verifiedEmail ? (
                <div>
                  <h2 className="mb-2 text-xs font-medium uppercase tracking-eyebrow text-bronze-dark">
                    Email
                  </h2>
                  <a href={`mailto:${verifiedEmail}`} className="text-ink underline underline-offset-2">
                    {verifiedEmail}
                  </a>
                </div>
              ) : null}
              <div>
                <h2 className="mb-2 text-xs font-medium uppercase tracking-eyebrow text-bronze-dark">
                  Service area
                </h2>
                <p>
                  New York. Specific boroughs and neighborhoods are confirmed
                  during the fit conversation.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Contact", path: "/contact" },
            ]),
          ),
        }}
      />
    </>
  );
}
