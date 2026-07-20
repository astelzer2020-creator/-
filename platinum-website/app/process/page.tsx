import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/sections/PageHeader";
import { ConversionBlock } from "@/components/sections/ConversionBlock";
import { Reveal } from "@/components/ui/Reveal";
import { processSteps, processHeadline, processSupport } from "@/content/process";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Our Process",
  description:
    "How Platinum runs construction projects in New York: Discovery, Preconstruction, Mobilization, Build & Control, and Closeout — with documented deliverables at every stage.",
  path: "/process",
});

export default function ProcessPage() {
  return (
    <>
      <PageHeader eyebrow="Process" title={processHeadline} lead={processSupport} />
      <section className="py-14 lg:py-20">
        <Container>
          <ol className="space-y-0">
            {processSteps.map((step, i) => (
              <li
                key={step.number}
                className={`border-ink/10 py-12 ${i > 0 ? "border-t" : ""}`}
              >
                <Reveal>
                  <div className="grid gap-6 lg:grid-cols-[120px_1fr_280px] lg:gap-12">
                    <p className="font-display text-5xl text-bronze-dark">{step.number}</p>
                    <div>
                      <h2 className="font-display text-h3 text-ink">{step.title}</h2>
                      <p className="mt-3 max-w-xl text-slate">{step.clientExplanation}</p>
                      <p className="mt-3 max-w-xl text-slate">{step.detail}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-eyebrow text-bronze-dark">
                        What you receive
                      </p>
                      <p className="mt-2 text-sm text-ink">{step.deliverable}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </Container>
      </section>
      <ConversionBlock />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Process", path: "/process" },
            ]),
          ),
        }}
      />
    </>
  );
}
