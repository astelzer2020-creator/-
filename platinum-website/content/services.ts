export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface Service {
  slug: string;
  title: string;
  shortTitle: string;
  /** One-line outcome promise shown on cards. */
  promise: string;
  /** Who this service is for. */
  audience: string;
  /** Opening copy for the detail page. */
  opening: string;
  openingSupport: string;
  /** What's included. */
  inclusions: string[];
  /** How we work on this service type. */
  approach: string[];
  /** Risks we actively manage. */
  risksManaged: string[];
  /** Honest scope boundaries to prevent unfit leads. */
  scopeNotes: string[];
  faqs: ServiceFaq[];
  cta: { label: string; href: string };
  image: { src: string; alt: string };
  seo: { title: string; description: string };
}

export const services: Service[] = [
  {
    slug: "residential-renovation",
    title: "Residential Renovation",
    shortTitle: "Residential",
    promise:
      "Renovations designed around how you live — and built around the realities of the property.",
    audience:
      "Owners of high-value apartments, brownstones, and houses planning a significant renovation — full-home, kitchen and bath, or a combined scope.",
    opening:
      "Renovations designed around how you live—and built around the realities of the property.",
    openingSupport:
      "We coordinate the details that determine whether a renovation feels controlled or chaotic: existing conditions, long-lead selections, building requirements, trade sequencing, protection, inspections, and finish quality.",
    inclusions: [
      "Scope clarification and preconstruction planning before work begins",
      "Coordination with your architect, designer, and building management",
      "Trade sequencing, site protection, and daily site management",
      "Long-lead procurement tracking for fixtures, millwork, and finishes",
      "Quality-control walk-throughs, punch list, and documented closeout",
    ],
    approach: [
      "One accountable point of contact from the first walkthrough to the final one.",
      "Decisions are documented so selections, changes, and approvals never live in someone's memory.",
      "Occupied-property discipline: protection, containment, scheduled quiet hours, and respectful crews.",
    ],
    risksManaged: [
      "Scope creep and untracked change orders",
      "Long-lead items discovered too late to hold the schedule",
      "Building and DOB requirements addressed after the fact instead of up front",
      "Finish quality that only gets inspected at the end, when correction is most expensive",
    ],
    scopeNotes: [
      "We take on renovations where planning, coordination, and finish quality genuinely matter — not rush patch jobs.",
      "Pricing is provided after a scope conversation and site review; we do not publish fixed rates because no two properties carry the same conditions.",
    ],
    faqs: [
      {
        question: "Can you work while we live in the home?",
        answer:
          "Often, yes — with a phasing plan, dust containment, and agreed working hours. Whether it is advisable depends on the scope; we will tell you honestly during the fit conversation.",
      },
      {
        question: "Do you work with our architect or designer?",
        answer:
          "Yes. We regularly build from architects' and designers' drawings and treat protecting the design intent as part of our job, flagging field conditions before they become compromises.",
      },
      {
        question: "How do you handle changes mid-project?",
        answer:
          "Every change is scoped, priced, and approved in writing before it is built, and logged so the running impact on budget and schedule stays visible.",
      },
    ],
    cta: { label: "Discuss Your Renovation", href: "/contact?type=residential" },
    image: {
      src: "/images/service-residential.svg",
      alt: "Placeholder graphic representing residential renovation — awaiting approved project photography",
    },
    seo: {
      title: "Residential Renovation in New York",
      description:
        "High-end residential renovations in New York with disciplined preconstruction, trade coordination, and documented quality control from planning through closeout.",
    },
  },
  {
    slug: "commercial-build-outs",
    title: "Commercial Build-Outs",
    shortTitle: "Commercial",
    promise:
      "Commercial spaces delivered with clear phasing, disciplined coordination, and attention to the details your customers and team experience every day.",
    audience:
      "Business owners, developers, and property managers building out offices, retail, and hospitality spaces — including work in active, occupied buildings.",
    opening:
      "Commercial spaces delivered with clear phasing, disciplined coordination, and attention to the details your customers and team will experience every day.",
    openingSupport:
      "From preconstruction and procurement through build-out and closeout, Platinum keeps stakeholders informed and the work moving.",
    inclusions: [
      "Preconstruction planning, phasing, and milestone scheduling",
      "Coordination with landlords, building management, and tenants",
      "Off-hours and restricted-hours work planning where the building requires it",
      "Progress reporting and decision tracking for all stakeholders",
      "Organized closeout: documents, inspections, training, and turnover",
    ],
    approach: [
      "Phasing plans built around business continuity — downtime is treated as a cost, not an afterthought.",
      "A communication cadence agreed at kickoff: who is updated, how often, and in what format.",
      "Closeout treated as a deliverable: documentation and turnover your operations team can actually use.",
    ],
    risksManaged: [
      "Schedule slip that pushes back opening or occupancy dates",
      "Uncoordinated trades in buildings with strict access rules",
      "Missing closeout documents that delay sign-off and occupancy",
      "Surprises for stakeholders who found out too late",
    ],
    scopeNotes: [
      "Commercial capability statements on this page describe our delivery discipline; specific building types and reference projects are published only once approved for release.",
    ],
    faqs: [
      {
        question: "Can you work in an occupied or operating building?",
        answer:
          "Yes — with the building's rules built into the plan: protection, access windows, noise restrictions, and coordination with management. That planning happens in preconstruction, not after complaints.",
      },
      {
        question: "How do you report progress?",
        answer:
          "On a cadence agreed at kickoff — typically scheduled updates covering progress, upcoming decisions, and schedule status, plus a tracked decision log.",
      },
      {
        question: "What does closeout include?",
        answer:
          "A punch list driven to zero, closeout documents, warranties, as-applicable inspections, and a turnover walkthrough with your team.",
      },
    ],
    cta: { label: "Request a Capabilities Call", href: "/contact?type=commercial" },
    image: {
      src: "/images/service-commercial.svg",
      alt: "Placeholder graphic representing commercial build-outs — awaiting approved project photography",
    },
    seo: {
      title: "Commercial Build-Outs in New York",
      description:
        "Office, retail, and hospitality build-outs in New York with clear phasing, stakeholder reporting, and disciplined closeout — planned around business continuity.",
    },
  },
  {
    slug: "specialty-installations",
    title: "Specialty Installations",
    shortTitle: "Installations",
    promise:
      "Precise installation of kitchens, millwork, cladding, and fixtures — where tolerances, sequencing, and finish quality decide the result.",
    audience:
      "Owners, designers, and general contractors who need demanding installations executed exactly: kitchens, custom millwork, wall cladding, and specified fixtures.",
    opening:
      "Installation is where design intent survives or dies.",
    openingSupport:
      "Kitchens, custom millwork, cladding, and fixtures demand exact measurement, careful sequencing, and finish-level care. We install as if the punch list happens every day — because on our sites, it does.",
    inclusions: [
      "Field verification and measurement before fabrication deadlines",
      "Receiving, inspection, and protected staging of high-value components",
      "Precision installation with documented tolerances and alignment",
      "Coordination with fabricators, vendors, and other trades",
      "Final adjustment, hardware tuning, and finish-quality inspection",
    ],
    approach: [
      "Measure and verify before anything is fabricated — field conditions overrule assumptions.",
      "Protect first: high-value components are staged, covered, and handled with a plan.",
      "Details are checked at eye level and touch level, not from across the room.",
    ],
    risksManaged: [
      "Fabrication based on drawings instead of field conditions",
      "Damage to delivered components before installation",
      "Misalignment and reveal inconsistencies that read as cheap work",
      "Installations sequenced before the site is ready for them",
    ],
    scopeNotes: [
      "The specific installation categories we publish are limited to scopes the company has verified experience in; this list is refined with the client before launch.",
    ],
    faqs: [
      {
        question: "Do you install products we purchased directly?",
        answer:
          "Case by case. We review the product, site conditions, and manufacturer requirements first, and we are honest about what warranty responsibility we can and cannot take on.",
      },
      {
        question: "Can you work as an installation partner for other contractors?",
        answer:
          "Yes — with clear scope boundaries, agreed schedules, and defined quality standards documented before we start.",
      },
    ],
    cta: { label: "Send Scope / Plans", href: "/contact?type=installations" },
    image: {
      src: "/images/service-installations.svg",
      alt: "Placeholder graphic representing specialty installations — awaiting approved project photography",
    },
    seo: {
      title: "Specialty Installations in New York",
      description:
        "Precision installation of kitchens, custom millwork, cladding, and fixtures in New York — field-verified measurement, protected handling, and finish-level quality control.",
    },
  },
  {
    slug: "general-contracting",
    title: "General Contracting",
    shortTitle: "Contracting",
    promise:
      "One accountable team managing preconstruction, trades, quality, and closeout — so complex work stays controlled.",
    audience:
      "Owners and stakeholders who need a single accountable contractor to plan, coordinate, and deliver a multi-trade project.",
    opening:
      "Complex construction becomes manageable when scope, communication, and craftsmanship are treated with equal discipline.",
    openingSupport:
      "Platinum brings owners, designers, trades, and vendors into one accountable process—from early planning and procurement through installation, quality control, and closeout.",
    inclusions: [
      "Preconstruction: scope clarification, estimating, and milestone planning",
      "Procurement strategy and long-lead tracking",
      "Trade contracting, sequencing, and daily site management",
      "Quality control, inspections, and change management",
      "Closeout package: punch list, documents, training, and follow-up",
    ],
    approach: [
      "Scope clarity before price: we would rather ask more questions up front than manage confusion later.",
      "A single decision log for the project — every approval, selection, and change, dated and visible.",
      "Quality control as a routine, not an event: walk-throughs during the work, not only at the end.",
    ],
    risksManaged: [
      "Gaps between trades that no one owns until they become defects",
      "Estimates built on undefined scope",
      "Schedules with no relationship to procurement reality",
      "Closeout that drags on for months after 'substantial completion'",
    ],
    scopeNotes: [
      "Licensing and insurance details are published on this site only from approved documents — see the credentials section once client verification is complete.",
    ],
    faqs: [
      {
        question: "At what stage should we bring you in?",
        answer:
          "Earlier than you think. Preconstruction input during design saves more money than any bid negotiation afterward — constructability, sequencing, and procurement all improve when the builder is at the table early.",
      },
      {
        question: "How do you price projects?",
        answer:
          "Against a clarified scope, after a site review. We present what is included, what is excluded, and which allowances carry risk — in writing.",
      },
    ],
    cta: { label: "Start a Project Conversation", href: "/contact?type=general-contracting" },
    image: {
      src: "/images/service-contracting.svg",
      alt: "Placeholder graphic representing general contracting — awaiting approved project photography",
    },
    seo: {
      title: "General Contracting in New York",
      description:
        "General contracting in New York with disciplined preconstruction, procurement tracking, trade coordination, documented quality control, and organized closeout.",
    },
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
