import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/SectionIntro";
import { LeadConversionPing } from "@/components/forms/LeadConversionPing";
import { verifiedPhone } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = {
  ...pageMetadata({
    title: "Thank You",
    description: "Your project details have been received.",
    path: "/contact/thank-you",
  }),
  robots: { index: false, follow: true },
};

export default function ThankYouPage() {
  return (
    <section className="py-24 lg:py-32">
      <LeadConversionPing />
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>Request received</Eyebrow>
          <h1 className="font-display text-h2 text-ink">
            Thank you. Your project details have been received.
          </h1>
          <p className="mt-5 text-lead text-slate">
            A member of the Platinum team will review them and respond within
            one business day.
            {/* Response window pending client SLA approval — see docs/APPROVALS.md */}
          </p>
          {verifiedPhone ? (
            <p className="mt-4 text-slate">
              Need to reach us sooner? Call or text{" "}
              <a
                href={`tel:${verifiedPhone.replace(/[^+\d]/g, "")}`}
                className="font-medium text-ink underline underline-offset-2"
              >
                {verifiedPhone}
              </a>
              .
            </p>
          ) : null}
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <ButtonLink href="/work" variant="secondary">
              View Selected Work
            </ButtonLink>
            <ButtonLink href="/process" variant="ghost">
              See how we run projects
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
