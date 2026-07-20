import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow, SectionIntro } from "@/components/ui/SectionIntro";
import { ProjectCard } from "@/components/work/ProjectCard";
import { ConversionBlock } from "@/components/sections/ConversionBlock";
import { site } from "@/content/site";
import { services } from "@/content/services";
import { projects } from "@/content/projects";
import { processSteps, processHeadline, processSupport } from "@/content/process";
import { showPendingContent, verifiedTestimonials } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Construction, Build-Outs & Specialty Installations in New York",
  description: site.description,
  path: "/",
});

export default function HomePage() {
  const visibleProjects = projects
    .filter((p) => p.approval === "approved" || showPendingContent)
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);

  const featured = visibleProjects[0];

  return (
    <>
      {/* 01 — Hero. Single strong message, no carousel (brief §5). */}
      <section className="relative flex min-h-[82svh] items-end bg-obsidian lg:min-h-[88svh]">
        <picture className="absolute inset-0">
          <source media="(max-width: 640px)" srcSet="/images/hero-home-mobile.svg" />
          <img
            src="/images/hero-home.svg"
            alt=""
            className="h-full w-full object-cover opacity-90"
            fetchPriority="high"
          />
        </picture>
        <div
          className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent"
          aria-hidden="true"
        />
        <Container className="relative pb-16 pt-40 lg:pb-24">
          <div className="max-w-3xl">
            <h1 className="font-display text-hero text-ivory">
              Built with precision.
              <br />
              Managed with accountability.
            </h1>
            <p className="mt-6 max-w-xl text-lead text-platinum">
              {site.description}
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href={site.cta.primary.href} variant="primary-on-dark">
                {site.cta.primary.label}
              </ButtonLink>
              <ButtonLink
                href={site.cta.secondary.href}
                variant="secondary"
                className="!border-platinum/40 !text-platinum hover:!border-ivory hover:!bg-ivory hover:!text-ink"
              >
                {site.cta.secondary.label}
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      {/*
        02 — Trust strip: intentionally omitted until verified facts
        (service area, licensing, partners) are approved. The brief is
        explicit: no counters or claims without data (§5.02).
      */}

      {/* 03 — Selected Work */}
      {visibleProjects.length > 0 ? (
        <section aria-labelledby="work-heading" className="py-20 lg:py-28">
          <Container>
            <div data-reveal>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <SectionIntro
                  eyebrow="Selected Work"
                  title="Projects that show the standard"
                  lead="Case studies are structured around the problem, the approach, and the outcome — not just finished photos."
                />
                <ButtonLink href="/work" variant="ghost">
                  View all work
                </ButtonLink>
              </div>
            </div>
            <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProjects.map((project, i) => (
                <div key={project.slug} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* 04 — Positioning */}
      <section aria-labelledby="positioning-heading" className="bg-ink py-20 lg:py-28">
        <Container>
          <div data-reveal>
            <div className="max-w-3xl">
              <Eyebrow onDark>Why Platinum</Eyebrow>
              <h2 id="positioning-heading" className="font-display text-h2 text-ivory">
                Complex construction becomes manageable when scope,
                communication, and craftsmanship are treated with equal
                discipline.
              </h2>
              <p className="mt-6 text-lead text-platinum">
                Platinum brings owners, designers, trades, and vendors into one
                accountable process—from early planning and procurement through
                installation, quality control, and closeout.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 05 — Services */}
      <section aria-labelledby="services-heading" className="py-20 lg:py-28">
        <Container>
          <div data-reveal>
            <SectionIntro
              eyebrow="Services"
              title="Four ways we take responsibility"
              lead="Each service is a defined scope of accountability — who it serves, what is included, and how the work is controlled."
            />
          </div>
          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            {services.map((service, i) => (
              <div key={service.slug} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
                <article className="group relative flex flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden bg-platinum">
                    <Image
                      src={service.image.src}
                      alt={service.image.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <h3 className="mt-5 font-display text-h3 text-ink">
                    <Link
                      href={`/services/${service.slug}`}
                      className="after:absolute after:inset-0 after:content-[''] group-hover:text-bronze-dark"
                    >
                      {service.title}
                    </Link>
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-slate">
                    {service.promise}
                  </p>
                </article>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 06 — Featured case study */}
      {featured ? (
        <section aria-labelledby="featured-heading" className="bg-platinum/40 py-20 lg:py-28">
          <Container>
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div data-reveal>
                <div className="relative aspect-[3/2] overflow-hidden bg-platinum">
                  <Image
                    src={featured.hero.src}
                    alt={featured.hero.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div data-reveal style={{ transitionDelay: "100ms" }}>
                <Eyebrow>Featured case study</Eyebrow>
                <h2 id="featured-heading" className="font-display text-h2 text-ink">
                  {featured.title}
                </h2>
                <dl className="mt-6 space-y-4">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-eyebrow text-bronze-dark">
                      The challenge
                    </dt>
                    <dd className="mt-1 text-slate">{featured.challenge}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-eyebrow text-bronze-dark">
                      The approach
                    </dt>
                    <dd className="mt-1 text-slate">{featured.approach}</dd>
                  </div>
                </dl>
                <ButtonLink href={`/work/${featured.slug}`} variant="ghost" className="mt-8">
                  Read the full case study
                </ButtonLink>
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {/* 07 — Process */}
      <section aria-labelledby="process-heading" className="py-20 lg:py-28">
        <Container>
          <div data-reveal>
            <SectionIntro
              eyebrow="Process"
              title={processHeadline}
              lead={processSupport}
            />
          </div>
          <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
            {processSteps.map((step, i) => (
              <li key={step.number}>
                <div data-reveal style={{ transitionDelay: `${i * 60}ms` }}>
                  <p className="font-display text-3xl text-bronze-dark">{step.number}</p>
                  <h3 className="mt-3 font-medium text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate">
                    {step.clientExplanation}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div data-reveal>
            <ButtonLink href="/process" variant="ghost" className="mt-10">
              See the full process
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/*
        08 — Proof: renders only client-approved testimonials.
        Currently empty by design (brief §1) — no invented quotes.
      */}
      {verifiedTestimonials.length > 0 ? (
        <section aria-labelledby="proof-heading" className="bg-ink py-20 lg:py-28">
          <Container>
            <SectionIntro eyebrow="What clients say" title="Proof, in their words" onDark />
            <div className="mt-12 grid gap-10 md:grid-cols-2">
              {verifiedTestimonials.map((t) => (
                <blockquote key={t.quote} className="border-l-2 border-bronze pl-6">
                  <p className="text-lead text-platinum">&ldquo;{t.quote}&rdquo;</p>
                  <footer className="mt-4 text-sm text-platinum/70">{t.attribution}</footer>
                </blockquote>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* 09 — Leadership / accountability. Principal-led framing; name,
          title, bio and photo publish only after client verification. */}
      <section aria-labelledby="leadership-heading" className="border-t border-ink/10 py-20 lg:py-24">
        <Container>
          <div data-reveal>
            <div className="max-w-2xl">
              <Eyebrow>Accountability</Eyebrow>
              <h2 id="leadership-heading" className="font-display text-h2 text-ink">
                A principal-led team, on site and reachable.
              </h2>
              <p className="mt-5 text-lead text-slate">
                On a Platinum project, you always know who is responsible: one
                point of contact who walks the site, tracks the decisions, and
                answers for the result — from the first conversation through the
                final walk-through.
              </p>
              <ButtonLink href="/about" variant="ghost" className="mt-7">
                About the company
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      {/* 10 — Conversion block */}
      <ConversionBlock />
    </>
  );
}
