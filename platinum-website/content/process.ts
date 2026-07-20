export interface ProcessStep {
  number: string;
  title: string;
  clientExplanation: string;
  deliverable: string;
  detail: string;
}

export const processHeadline = "A clearer path from first conversation to final walk-through.";
export const processSupport =
  "Every project is different. The controls that keep it moving should not be.";

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Discovery",
    clientExplanation:
      "We start with goals, scope, site conditions, and fit — an honest conversation about what you are building and whether we are the right team for it.",
    deliverable: "Fit conversation + document checklist",
    detail:
      "You describe the project and what a successful outcome looks like. We ask the questions that surface real scope: existing conditions, building requirements, timeline drivers, and decision-makers. If we are not the right fit, we say so.",
  },
  {
    number: "02",
    title: "Preconstruction",
    clientExplanation:
      "Planning, estimating, scheduling, procurement strategy, and permits — the discipline that decides whether the build stays controlled.",
    deliverable: "Scope clarification / proposal / milestone plan",
    detail:
      "Scope is clarified in writing. Long-lead items are identified early. The estimate reflects a defined scope — including what is excluded — and the milestone plan reflects procurement reality, not optimism.",
  },
  {
    number: "03",
    title: "Mobilization",
    clientExplanation:
      "Logistics, protection, safety, and communication — set up before the first trade arrives.",
    deliverable: "Site plan + kickoff",
    detail:
      "Protection is installed, access and staging are planned, safety requirements are in place, and everyone knows the communication cadence: who is updated, how often, and who decides what.",
  },
  {
    number: "04",
    title: "Build & Control",
    clientExplanation:
      "Execution, trade coordination, quality control, and change management — with decisions documented as we go.",
    deliverable: "Scheduled updates, inspections, decision log",
    detail:
      "Trades are sequenced and supervised. Quality is inspected during the work, when correction is cheap. Changes are scoped, priced, and approved in writing before they are built — and logged so the running picture stays honest.",
  },
  {
    number: "05",
    title: "Closeout",
    clientExplanation:
      "Punch list, documents, training, and warranty — finished means finished.",
    deliverable: "Closeout package + follow-up",
    detail:
      "The punch list is driven to zero. You receive documentation, warranties, and a turnover walkthrough — and we follow up after handover rather than disappearing.",
  },
];
