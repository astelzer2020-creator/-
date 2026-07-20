import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-platinum">
        <Image
          src={project.hero.src}
          alt={project.hero.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        {project.approval === "pending" ? (
          <span className="absolute left-3 top-3 bg-obsidian/80 px-2.5 py-1 text-[11px] uppercase tracking-eyebrow text-platinum">
            Preview — pending approval
          </span>
        ) : null}
      </div>
      <div className="pt-5">
        <p className="text-xs uppercase tracking-eyebrow text-bronze-dark">
          {project.category} · {project.location}
        </p>
        <h3 className="mt-2 font-display text-h3 text-ink">
          <Link
            href={`/work/${project.slug}`}
            className="after:absolute after:inset-0 after:content-[''] group-hover:text-bronze-dark"
          >
            {project.title}
          </Link>
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate">{project.scope}</p>
      </div>
    </article>
  );
}
