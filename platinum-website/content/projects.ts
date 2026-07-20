/**
 * Portfolio content model (master brief, section 7).
 *
 * IMPORTANT — verification gate: every entry below is a STRUCTURAL
 * PREVIEW seeded so the portfolio system (cards, filters, case-study
 * layout, related work, SEO) can be built and reviewed end-to-end.
 * Each is marked approval: "pending" and uses clearly non-photographic
 * placeholder graphics. Nothing here may be presented publicly as a
 * completed Platinum project until the client supplies real projects
 * with imagery, rights, credits, and written approval.
 *
 * Production gating: set NEXT_PUBLIC_SHOW_PENDING_CONTENT=false to
 * hide all pending entries. See docs/APPROVALS.md.
 */

export type ProjectCategory = "Residential" | "Commercial" | "Installations";

export interface ProjectImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  services: string[]; // service slugs
  /** Public location label — granularity must be client-approved. */
  location: string;
  clientType: string;
  scope: string;
  featured: boolean;
  order: number;
  approval: "approved" | "pending";
  summary: string;
  challenge: string;
  approach: string;
  outcome: string;
  hero: ProjectImage;
  gallery: ProjectImage[];
  credits: string[];
  seo: { title: string; description: string };
}

const placeholderNote =
  "Structural preview — awaiting client-approved project details and photography";

export const projects: Project[] = [
  {
    slug: "prewar-apartment-renovation",
    title: "Prewar Apartment, Reconsidered",
    category: "Residential",
    services: ["residential-renovation", "specialty-installations"],
    location: "New York",
    clientType: "Private Residence",
    scope:
      "Full renovation of an occupied prewar apartment: kitchen, baths, custom millwork, and finish restoration.",
    featured: true,
    order: 1,
    approval: "pending",
    summary:
      "A structural preview of how a full prewar renovation case study will read: existing-conditions honesty, building coordination, and finish-level quality control.",
    challenge:
      "Prewar buildings hide their history behind plaster: undocumented conditions, board and building requirements, and residents on every side of the work. The renovation had to hold design intent against field reality without letting the schedule drift.",
    approach:
      "Preconstruction opened walls where risk was highest before pricing was finalized. Long-lead selections were locked early, building requirements were mapped into the schedule, and protection and quiet-hours discipline kept neighbor relations workable.",
    outcome:
      "This section will present the verified outcome — scope delivered, schedule performance, and the details that matter at eye level — once the client approves a real project for publication.",
    hero: {
      src: "/images/project-prewar-hero.svg",
      alt: placeholderNote,
    },
    gallery: [
      { src: "/images/project-prewar-1.svg", alt: placeholderNote, caption: "Existing conditions and protection (placeholder)" },
      { src: "/images/project-prewar-2.svg", alt: placeholderNote, caption: "Millwork and finish detail (placeholder)" },
      { src: "/images/project-prewar-3.svg", alt: placeholderNote, caption: "Completed space (placeholder)" },
    ],
    credits: ["Architect / designer credits pending approval"],
    seo: {
      title: "Prewar Apartment Renovation — Case Study Preview",
      description:
        "Structural preview of a Platinum residential case study: preconstruction, occupied-building coordination, and finish-level quality control in New York.",
    },
  },
  {
    slug: "workplace-build-out",
    title: "A Workplace Built Around Continuity",
    category: "Commercial",
    services: ["commercial-build-outs", "general-contracting"],
    location: "New York",
    clientType: "Workplace",
    scope:
      "Phased office build-out in an operating building: demolition, systems coordination, finishes, and closeout.",
    featured: true,
    order: 2,
    approval: "pending",
    summary:
      "A structural preview of a commercial case study: phasing around business hours, stakeholder reporting, and a closeout package the operations team could use on day one.",
    challenge:
      "The building stayed open and the tenant's business could not stop. Access windows, noise restrictions, and freight scheduling shaped everything — the plan had to absorb the building's rules instead of fighting them.",
    approach:
      "Work was phased around access windows agreed with building management. A fixed reporting cadence kept the owner, landlord, and design team aligned on progress and upcoming decisions, with every change logged and priced before execution.",
    outcome:
      "The verified outcome — turnover date, phasing performance, and closeout documentation — will be published here once the client approves a real project for release.",
    hero: {
      src: "/images/project-workplace-hero.svg",
      alt: placeholderNote,
    },
    gallery: [
      { src: "/images/project-workplace-1.svg", alt: placeholderNote, caption: "Phasing and site logistics (placeholder)" },
      { src: "/images/project-workplace-2.svg", alt: placeholderNote, caption: "Systems coordination (placeholder)" },
      { src: "/images/project-workplace-3.svg", alt: placeholderNote, caption: "Completed workplace (placeholder)" },
    ],
    credits: ["Landlord / design team credits pending approval"],
    seo: {
      title: "Workplace Build-Out — Case Study Preview",
      description:
        "Structural preview of a Platinum commercial case study: phased build-out in an operating New York building with disciplined reporting and closeout.",
    },
  },
  {
    slug: "custom-millwork-installation",
    title: "Millwork That Meets the Drawing",
    category: "Installations",
    services: ["specialty-installations"],
    location: "New York",
    clientType: "Private Residence",
    scope:
      "Field verification, receiving, and precision installation of custom kitchen and library millwork.",
    featured: true,
    order: 3,
    approval: "pending",
    summary:
      "A structural preview of an installation case study: field-verified measurement, protected handling, and tolerances held to the drawing.",
    challenge:
      "Custom millwork forgives nothing. Walls that are out of plumb, floors that are out of level, and reveals specified in millimeters — the installation had to reconcile fabrication precision with field reality.",
    approach:
      "Every plane was measured and mapped before fabrication sign-off. Components were received, inspected, and staged under protection. Installation proceeded datum-first, with alignment checked at each stage rather than corrected at the end.",
    outcome:
      "The verified outcome — alignment, reveal consistency, and the client's assessment — will be published once a real installation project is approved for release.",
    hero: {
      src: "/images/project-millwork-hero.svg",
      alt: placeholderNote,
    },
    gallery: [
      { src: "/images/project-millwork-1.svg", alt: placeholderNote, caption: "Field measurement and datum layout (placeholder)" },
      { src: "/images/project-millwork-2.svg", alt: placeholderNote, caption: "Protected staging (placeholder)" },
      { src: "/images/project-millwork-3.svg", alt: placeholderNote, caption: "Installed millwork detail (placeholder)" },
    ],
    credits: ["Fabricator / designer credits pending approval"],
    seo: {
      title: "Custom Millwork Installation — Case Study Preview",
      description:
        "Structural preview of a Platinum installation case study: field-verified measurement and precision millwork installation in New York.",
    },
  },
];

export const projectCategories: ProjectCategory[] = [
  "Residential",
  "Commercial",
  "Installations",
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function relatedProjects(current: Project, limit = 2): Project[] {
  return projects
    .filter(
      (p) =>
        p.slug !== current.slug &&
        (p.category === current.category ||
          p.services.some((s) => current.services.includes(s))),
    )
    .slice(0, limit);
}
