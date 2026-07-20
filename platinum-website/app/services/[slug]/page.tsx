import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow, SectionIntro } from "@/components/ui/SectionIntro";
import { Reveal } from "@/components/ui/Reveal";
import { FaqList } from "@/components/sections/FaqList";
import { ProjectCard } from "@/components/work/ProjectCard";
import { services, getService } from "@/content/services";
import { projects } from "@/content/projects";
import { showPendingContent } from "@/lib/content";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return pageMetadata({
    title: service.seo.title,
    description: service.seo.description,
    path: `/services/${service.slug}`,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const relatedWork = projects
    .filter(
      (p) =>
        p.services.includes(service.slug) &&
        (p.approval === "approved" || showPendingContent),
    )
    .slice(0, 2);

  return (
    <>
      <section className="border-b border-ink/10 pb-14 pt-16 lg:pb-20 lg:pt-24">
        <Container>
          <div className="grid items-end gap-10 lg:grid-cols-2">
            <div>
              <Eyebrow>Services / {service.shortTitle}</Eyebrow>
              <h1 className="font-display text-hero text-ink">{service.title}</h1>
              <p className="mt-6 text-lead text-slate">{service.opening}</p>
              <p className="mt-4 max-w-xl text-slate">{service.openingSupport}</p>
              <ButtonLink href={service.cta.href} className="mt-8">
                {service.cta.label}
              </ButtonLink>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden bg-platinum">
              <Image
                src={service.image.src}
                alt={service.image.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14 lg:py-20" aria-labelledby="who-heading">
        <Container>
          <div className="grid gap-12 lg:grid-cols-3">
            <Reveal>
              <div>
                <h2 id="who-heading" className="font-display text-h3 text-ink">
                  Who this is for
                </h2>
                <p className="mt-4 text-slate">{service.audience}</p>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div>
                <h2 className="font-display text-h3 text-ink">What&rsquo;s included</h2>
                <ul className="mt-4 space-y-3 text-slate">
                  {service.inclusions.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-bronze" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={160}>
              <div>
                <h2 className="font-display text-h3 text-ink">Risks we manage</h2>
                <ul className="mt-4 space-y-3 text-slate">
                  {service.risksManaged.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-bronze" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="bg-ink py-14 lg:py-20" aria-labelledby="approach-heading">
        <Container>
          <SectionIntro eyebrow="How we work" title="The approach" onDark />
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {service.approach.map((item, i) => (
              <Reveal key={item} delay={i * 80}>
                <p className="border-l-2 border-bronze pl-5 text-platinum">{item}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {relatedWork.length > 0 ? (
        <section className="py-14 lg:py-20" aria-labelledby="related-work-heading">
          <Container>
            <SectionIntro eyebrow="Related work" title="Projects in this scope" />
            <div className="mt-10 grid gap-10 sm:grid-cols-2">
              {relatedWork.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="py-14 lg:py-20" aria-labelledby="faq-heading">
        <Container>
          <div className="max-w-3xl">
            <SectionIntro eyebrow="Questions" title="Asked before hiring us" />
            <div className="mt-10">
              <FaqList faqs={service.faqs} />
            </div>
            {service.scopeNotes.length > 0 ? (
              <div className="mt-8 space-y-2 text-sm text-slate">
                {service.scopeNotes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      <section className="bg-obsidian py-16 lg:py-20">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <h2 className="max-w-xl font-display text-h3 text-ivory">
              Ready to talk through a {service.shortTitle.toLowerCase()} project?
            </h2>
            <ButtonLink href={service.cta.href} variant="primary-on-dark">
              {service.cta.label}
            </ButtonLink>
          </div>
        </Container>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Services", path: "/services" },
              { name: service.title, path: `/services/${service.slug}` },
            ]),
          ),
        }}
      />
    </>
  );
}
