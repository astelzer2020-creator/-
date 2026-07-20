import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/sections/PageHeader";
import { ConversionBlock } from "@/components/sections/ConversionBlock";
import { ProjectCard } from "@/components/work/ProjectCard";
import { projects, projectCategories } from "@/content/projects";
import { showPendingContent } from "@/lib/content";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Selected Work",
  description:
    "Selected construction projects by Platinum in New York — residential renovations, commercial build-outs, and specialty installations, presented as full case studies.",
  path: "/work",
});

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const activeCategory = projectCategories.find((c) => c === category);

  const visible = projects
    .filter((p) => p.approval === "approved" || showPendingContent)
    .filter((p) => !activeCategory || p.category === activeCategory)
    .sort((a, b) => a.order - b.order);

  const filterLink = (label: string, href: string, active: boolean) => (
    <Link
      key={label}
      href={href}
      aria-current={active ? "true" : undefined}
      className={`border px-4 py-2 text-sm transition-colors ${
        active
          ? "border-ink bg-ink text-ivory"
          : "border-ink/25 text-ink hover:border-ink"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <>
      <PageHeader
        eyebrow="Selected Work"
        title="The work, with its context"
        lead="Every project here is structured as a case study: the brief, the constraints, the approach, and the outcome. Photography without context is decoration — this is proof."
      />
      <section className="py-12 lg:py-16">
        <Container>
          {showPendingContent && visible.some((p) => p.approval === "pending") ? (
            <p className="mb-8 max-w-2xl border-l-2 border-bronze bg-platinum/30 px-4 py-3 text-sm text-slate">
              Entries marked <strong>Preview</strong> are structural previews of
              the case-study system, shown with placeholder graphics. They will
              be replaced with client-approved projects, photography, and
              verified details before launch.
            </p>
          ) : null}

          <nav aria-label="Filter projects by category" className="flex flex-wrap gap-3">
            {filterLink("All", "/work", !activeCategory)}
            {projectCategories.map((c) =>
              filterLink(c, `/work?category=${encodeURIComponent(c)}`, activeCategory === c),
            )}
          </nav>

          {visible.length > 0 ? (
            <div className="mt-12 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          ) : (
            <div className="mt-16 max-w-xl">
              <h2 className="font-display text-h3 text-ink">
                No projects published in this category yet.
              </h2>
              <p className="mt-4 text-slate">
                Approved case studies are added as clients release them. In the
                meantime, we are glad to discuss relevant experience directly.
              </p>
              <Link
                href="/contact"
                className="mt-6 inline-block text-sm font-medium text-bronze-dark underline decoration-bronze underline-offset-4"
              >
                Start a conversation
              </Link>
            </div>
          )}
        </Container>
      </section>
      <ConversionBlock />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Work", path: "/work" },
            ]),
          ),
        }}
      />
    </>
  );
}
