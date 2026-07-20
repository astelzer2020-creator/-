import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow, SectionIntro } from "@/components/ui/SectionIntro";
import { ProjectCard } from "@/components/work/ProjectCard";
import { getProject, projects, relatedProjects } from "@/content/projects";
import { getService } from "@/content/services";
import { showPendingContent } from "@/lib/content";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const meta = pageMetadata({
    title: project.seo.title,
    description: project.seo.description,
    path: `/work/${project.slug}`,
  });
  // Pending case studies stay out of the index until approved.
  return project.approval === "pending"
    ? { ...meta, robots: { index: false, follow: true } }
    : meta;
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  if (project.approval === "pending" && !showPendingContent) notFound();

  const related = relatedProjects(project).filter(
    (p) => p.approval === "approved" || showPendingContent,
  );

  const facts: [string, string][] = [
    ["Client type", project.clientType],
    ["Location", project.location],
    ["Category", project.category],
    ["Scope", project.scope],
  ];

  return (
    <>
      <article>
        <header className="relative flex min-h-[60svh] items-end bg-obsidian">
          <Image
            src={project.hero.src}
            alt={project.hero.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-90"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent"
            aria-hidden="true"
          />
          <Container className="relative pb-14 pt-40">
            <Eyebrow onDark>
              {project.category} · {project.location}
            </Eyebrow>
            <h1 className="max-w-3xl font-display text-hero text-ivory">
              {project.title}
            </h1>
            {project.approval === "pending" ? (
              <p className="mt-5 inline-block bg-ivory/10 px-3 py-1.5 text-sm text-platinum">
                Structural preview — pending client-approved details and photography
              </p>
            ) : null}
          </Container>
        </header>

        <section className="border-b border-ink/10 py-10">
          <Container>
            <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-medium uppercase tracking-eyebrow text-bronze-dark">
                    {label}
                  </dt>
                  <dd className="mt-1.5 text-sm text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>

        <section className="py-14 lg:py-20">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
              <div className="max-w-2xl space-y-10">
                <div>
                  <h2 className="font-display text-h3 text-ink">The brief</h2>
                  <p className="mt-3 text-slate">{project.summary}</p>
                </div>
                <div>
                  <h2 className="font-display text-h3 text-ink">Constraints &amp; challenge</h2>
                  <p className="mt-3 text-slate">{project.challenge}</p>
                </div>
                <div>
                  <h2 className="font-display text-h3 text-ink">The approach</h2>
                  <p className="mt-3 text-slate">{project.approach}</p>
                </div>
                <div>
                  <h2 className="font-display text-h3 text-ink">The outcome</h2>
                  <p className="mt-3 text-slate">{project.outcome}</p>
                </div>
              </div>
              <aside>
                <h2 className="text-xs font-medium uppercase tracking-eyebrow text-bronze-dark">
                  Services on this project
                </h2>
                <ul className="mt-4 space-y-2 text-sm">
                  {project.services.map((s) => {
                    const service = getService(s);
                    return service ? (
                      <li key={s}>
                        <Link
                          href={`/services/${service.slug}`}
                          className="text-ink underline decoration-bronze underline-offset-4 hover:text-bronze-dark"
                        >
                          {service.title}
                        </Link>
                      </li>
                    ) : null;
                  })}
                </ul>
                {project.credits.length > 0 ? (
                  <>
                    <h2 className="mt-8 text-xs font-medium uppercase tracking-eyebrow text-bronze-dark">
                      Credits
                    </h2>
                    <ul className="mt-4 space-y-1 text-sm text-slate">
                      {project.credits.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </aside>
            </div>
          </Container>
        </section>

        {/* Gallery ordered as a story: conditions, process, detail, space */}
        <section aria-label="Project gallery" className="pb-14 lg:pb-20">
          <Container>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {project.gallery.map((image) => (
                <figure key={image.src}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-platinum">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  {image.caption ? (
                    <figcaption className="mt-2 text-xs text-slate">{image.caption}</figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          </Container>
        </section>
      </article>

      {related.length > 0 ? (
        <section className="border-t border-ink/10 py-14 lg:py-20" aria-labelledby="related-heading">
          <Container>
            <SectionIntro eyebrow="Related work" title="More projects" />
            <div className="mt-10 grid gap-10 sm:grid-cols-2">
              {related.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="bg-obsidian py-16">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <h2 className="max-w-xl font-display text-h3 text-ivory">
              Planning something similar?
            </h2>
            <ButtonLink href="/contact" variant="primary-on-dark">
              Discuss Your Project
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
              { name: "Work", path: "/work" },
              { name: project.title, path: `/work/${project.slug}` },
            ]),
          ),
        }}
      />
    </>
  );
}
