import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/sections/PageHeader";
import { ConversionBlock } from "@/components/sections/ConversionBlock";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow, SectionIntro } from "@/components/ui/SectionIntro";
import { verifiedLicensing } from "@/lib/content";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Platinum is a principal-led New York construction team focused on residential renovations, commercial build-outs, and specialty installations — built on documented accountability.",
  path: "/about",
});

const principles = [
  {
    title: "Decisions are documented",
    body: "Selections, changes, and approvals live in a decision log — not in memory or scattered text threads. When a question comes up in month three, the answer has a date on it.",
  },
  {
    title: "Quality is inspected during the work",
    body: "Walk-throughs happen while correction is still cheap. The punch list is a routine, not a final-week surprise, and finish quality is checked at eye level and touch level.",
  },
  {
    title: "Scope honesty over easy promises",
    body: "We would rather clarify scope and exclusions before pricing than manage disappointment after. If we are not the right fit for a project, we say so in the first conversation.",
  },
  {
    title: "Closeout means finished",
    body: "Documentation, warranties, training, and a turnover walk-through — then follow-up after handover. A project is not done when the last trade leaves; it is done when you have everything you need.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Responsibility is the product"
        lead="Platinum exists for owners, architects, and businesses that need complex work managed with the same care that goes into the finishes. We take on projects where planning, coordination, and quality genuinely matter — and we take responsibility for the result."
      />

      <section className="py-14 lg:py-20">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <div className="relative aspect-[16/10] overflow-hidden bg-platinum">
                <Image
                  src="/images/about-hero.svg"
                  alt="Placeholder graphic — awaiting approved company photography"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={100}>
              <Eyebrow>The work we want</Eyebrow>
              <h2 className="font-display text-h2 text-ink">
                Built for projects where the details carry the value.
              </h2>
              <p className="mt-5 text-slate">
                Renovations in occupied prewar buildings. Build-outs in
                operating properties. Installations specified to the
                millimeter. This is work where the difference between managed
                and unmanaged shows up in the schedule, the budget, and the
                finish — and it is the work Platinum is organized around.
              </p>
              <p className="mt-4 text-slate">
                The team is led by its principal, on site and reachable — one
                accountable point of contact from the first conversation
                through the final walk-through.
                {/* Founder name, title, bio and portrait publish after the
                    client content interview and approval (docs/APPROVALS.md). */}
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="bg-ink py-14 lg:py-20" aria-labelledby="principles-heading">
        <Container>
          <SectionIntro
            eyebrow="Operating principles"
            title="How accountability actually behaves"
            lead="Values are cheap to claim. These are the behaviors clients can hold us to."
            onDark
          />
          <div className="mt-12 grid gap-10 md:grid-cols-2">
            {principles.map((p, i) => (
              <Reveal key={p.title} delay={i * 60}>
                <div className="border-l-2 border-bronze pl-6">
                  <h3 className="font-display text-h3 text-ivory">{p.title}</h3>
                  <p className="mt-3 text-platinum/85">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Credentials render only from approved documents (brief §1, §6). */}
      {verifiedLicensing.length > 0 ? (
        <section className="py-14 lg:py-20" aria-labelledby="credentials-heading">
          <Container>
            <SectionIntro eyebrow="Credentials" title="Licensing & insurance" />
            <ul className="mt-8 space-y-2 text-slate">
              {verifiedLicensing.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <ConversionBlock />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "About", path: "/about" },
            ]),
          ),
        }}
      />
    </>
  );
}
