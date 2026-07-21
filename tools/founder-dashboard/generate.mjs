#!/usr/bin/env node
/**
 * Atlas Founder Control Center generator (ATL-021, DL-013).
 *
 * CORE PRINCIPLE: the dashboard is GENERATED, never hand-maintained. Every value is
 *   (a) parsed from a coordination/docs file,
 *   (b) computed from git, or
 *   (c) rendered explicitly as "n/a — source not yet in repo" naming the future source file.
 * The ONLY hand-maintained content in this script is presentation-only mapping
 * (e.g. risk-ID -> category, agent-id -> display name) and n/a placeholder text.
 *
 * Determinism: "last updated" comes from `git log -1 --format=%cs -- docs/coordination`
 * (never wall clock), so re-running on the same commit is byte-identical. CI relies on this
 * (freshness gate in .github/workflows/ci.yml).
 *
 * Zero npm dependencies — node:fs / node:path / node:child_process only. Plain Node ESM.
 * Parsing is tolerant: any section that cannot be parsed renders a visible
 * "⚠ parse failed: <file>" marker instead of throwing.
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const warnings = [];

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function parseFailed(source, detail) {
  const msg = `⚠ parse failed: ${source}${detail ? ` (${detail})` : ""}`;
  if (!warnings.includes(msg)) warnings.push(msg);
  return msg;
}

function read(rel) {
  try {
    return fs.readFileSync(path.join(ROOT, rel), "utf8");
  } catch {
    parseFailed(rel, "file missing or unreadable");
    return null;
  }
}

function git(args) {
  try {
    return execSync(`git ${args}`, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

/** Strip markdown emphasis/backticks for clean rendering of parsed fragments. */
function clean(s) {
  return String(s ?? "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(s, n) {
  return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;
}

function countFiles(relDir, ext = ".md") {
  try {
    return fs
      .readdirSync(path.join(ROOT, relDir))
      .filter((f) => f.endsWith(ext)).length;
  } catch {
    parseFailed(relDir, "directory missing");
    return null;
  }
}

// ---------------------------------------------------------------------------
// Source files
// ---------------------------------------------------------------------------

const SRC = {
  workboard: "docs/coordination/AGENT_WORKBOARD.md",
  mission: "docs/coordination/CURRENT_MISSION.md",
  risks: "docs/coordination/RISK_REGISTER.md",
  decisions: "docs/coordination/DECISION_LOG.md",
  masterRoadmap: "docs/coordination/MASTER_ROADMAP.md",
  roadmap: "docs/ROADMAP.md",
  qaPlan: "docs/pilot/QA_PLAN.md",
  journey: "docs/pilot/FIRST_VALUE_JOURNEY.md",
  pipeline: "docs/growth/PIPELINE.md",
};

const files = Object.fromEntries(Object.entries(SRC).map(([k, v]) => [k, read(v)]));

// ---------------------------------------------------------------------------
// Workboard parsing
// ---------------------------------------------------------------------------

/** Unified status vocabulary + legacy mapping from the workboard header (ADR-0010). */
function normalizeStatus(raw) {
  const s = clean(raw).split("·")[0].trim().toLowerCase();
  if (s.startsWith("in progress") || s.startsWith("in-progress")) return "IN PROGRESS";
  if (s.startsWith("in review")) return "IN REVIEW";
  if (s.startsWith("ready")) return "READY";
  if (s.startsWith("blocked")) return "BLOCKED";
  if (s.startsWith("backlog")) return "BACKLOG";
  if (s.startsWith("done")) return "IMPLEMENTED"; // legacy: done -> IMPLEMENTED
  if (s.startsWith("implemented")) return "IMPLEMENTED";
  if (s.startsWith("verified")) return "VERIFIED";
  if (s.startsWith("closed")) return "CLOSED";
  return null;
}

const DONE_STATUSES = new Set(["IMPLEMENTED", "VERIFIED", "CLOSED"]);

/** All `### ATL-xxx — title` task blocks (canonical per-task record). */
function parseWorkboardTasks(md) {
  if (!md) return [];
  const tasks = [];
  const blocks = md.split(/^### /m).slice(1);
  for (const block of blocks) {
    const header = block.split("\n", 1)[0];
    const idMatch = header.match(/^([A-Z]+-\d+(?:-[A-Z]+)*)\s+—\s*(.*)$/);
    if (!idMatch) continue;
    const owner = block.match(/\*\*Owner:\*\*\s*([^·\n]+)/);
    const priority = block.match(/\*\*Priority:\*\*\s*(P\d)/);
    const statusRaw = block.match(/\*\*Status:\*\*\s*([^\n]+)/);
    const status = statusRaw ? normalizeStatus(statusRaw[1]) : null;
    if (!status) parseFailed(SRC.workboard, `status of ${idMatch[1]}`);
    tasks.push({
      id: idMatch[1],
      title: clean(idMatch[2]),
      owner: owner ? clean(owner[1]) : parseFailed(SRC.workboard, `owner of ${idMatch[1]}`),
      priority: priority ? priority[1] : null,
      status,
      statusRaw: statusRaw ? clean(statusRaw[1]) : "",
    });
  }
  if (tasks.length === 0) parseFailed(SRC.workboard, "no task blocks found");
  return tasks;
}

/** Sprint header + sprint-table rows (the `| ATL-… |` table under `## Sprint-…`). */
function parseSprint(md) {
  if (!md) return { header: parseFailed(SRC.workboard), rows: [] };
  const headerMatch = md.match(/^## (Sprint-\d[^\n]*)/m);
  const header = headerMatch ? clean(headerMatch[1]) : parseFailed(SRC.workboard, "sprint header");
  const section = headerMatch
    ? md.slice(headerMatch.index).split(/^---$/m)[0]
    : "";
  const rows = [];
  for (const line of section.split("\n")) {
    const m = line.match(/^\|\s*(ATL-[\w-]+)\s*\|/);
    if (!m) continue;
    const cells = line.split("|").map((c) => clean(c));
    // | Task | Owner | Reviewer | Approver | Pri | Effort | Status | Goal |
    if (cells.length < 9) {
      parseFailed(SRC.workboard, `sprint row ${m[1]}`);
      continue;
    }
    rows.push({
      id: cells[1],
      owner: cells[2],
      priority: cells[5],
      status: normalizeStatus(cells[7]),
      goal: cells[8],
    });
  }
  if (rows.length === 0) parseFailed(SRC.workboard, "sprint table rows");
  return { header, rows };
}

const tasks = parseWorkboardTasks(files.workboard);
const sprint = parseSprint(files.workboard);

// ---------------------------------------------------------------------------
// EXECUTIVE
// ---------------------------------------------------------------------------

function parseMilestones(md, source) {
  if (!md) return [];
  const out = [];
  for (const block of md.split(/^### /m).slice(1)) {
    const header = block.split("\n", 1)[0];
    const m = header.match(/^(M\d)\s+—\s*(.*)$/);
    if (!m) continue;
    const status = block.match(/\*\*Status:\*\*\s*([^\n]+)/);
    out.push({
      id: m[1],
      name: clean(m[2]),
      status: status ? clean(status[1]) : parseFailed(source, `${m[1]} status`),
      statusShort: status ? clean(status[1]).split("(")[0].trim().replace(/[.;]$/, "") : "?",
    });
  }
  if (out.length === 0) parseFailed(source, "no milestone sections");
  return out;
}

const milestones = parseMilestones(files.masterRoadmap, SRC.masterRoadmap);

/** Blocked-on-Founder items from CURRENT_MISSION.md standing constraints. */
function parseFounderBlockers(md) {
  if (!md) return null;
  const m = md.match(/Blocked-on-Founder items:\s*([\s\S]*?)(?=\n\d+\.|\n##|\n*$)/);
  if (!m) return null;
  return m[1]
    .split(/,(?![^()]*\))/) // top-level commas only (not inside parentheses)
    .map((s) => clean(s).replace(/\.$/, ""))
    .filter(Boolean);
}

const founderBlockers = parseFounderBlockers(files.mission);
if (!founderBlockers) parseFailed(SRC.mission, "Blocked-on-Founder items");

const productionScore = (() => {
  // Preferred source: QA_PLAN.md. Today the score is only published in the QA verification
  // evidence lines on the workboard ("M0 production-readiness 8/10"), so fall back there
  // and label whichever source actually provided it.
  const re = /production-readiness\s+(?:score\s+)?(\d+\s*\/\s*10)/i;
  for (const [src, text] of [
    [SRC.qaPlan, files.qaPlan],
    [SRC.workboard, files.workboard],
  ]) {
    const m = text && text.match(re);
    if (m) return `${m[1].replace(/\s/g, "")} (production-readiness, ${src})`;
  }
  return parseFailed(`${SRC.qaPlan} / ${SRC.workboard}`, "production-readiness score");
})();

const sprintDone = sprint.rows.filter((r) => DONE_STATUSES.has(r.status)).length;
const sprintStatusCounts = {};
for (const r of sprint.rows) {
  const key = r.status ?? "UNPARSED";
  sprintStatusCounts[key] = (sprintStatusCounts[key] ?? 0) + 1;
}

// IMPORTANT (CI freshness gate): never embed HEAD's sha — the commit that carries the
// regenerated dashboard would change HEAD, so CI regeneration could never match the committed
// file. Instead stamp the last commit that touched anything EXCEPT the dashboard outputs.
// Workflow: commit source changes first, then regenerate and commit the dashboard (CI reminds
// you via the freshness gate if you forget).
const srcCommit =
  git('log -1 --format=%h -- . ":(exclude)FOUNDER_DASHBOARD.md" ":(exclude)FOUNDER_DASHBOARD.html"') ||
  parseFailed("git", "source commit");
const latestTag = git("describe --tags --abbrev=0");
const currentVersion = latestTag
  ? `${latestTag} @ ${srcCommit}`
  : `pre-release @ ${srcCommit} (last source commit; no git tags yet)`;

const coordLastUpdated =
  git("log -1 --format=%cs -- docs/coordination") || parseFailed("git", "log docs/coordination");

const m1 = milestones.find((m) => m.id === "M1");
const m2 = milestones.find((m) => m.id === "M2");
const m3 = milestones.find((m) => m.id === "M3");
const pilotReady =
  m3 && /verified|done/i.test(m3.statusShort) && (founderBlockers ?? []).length === 0;
const pilotReadiness = pilotReady
  ? "Ready per MASTER_ROADMAP.md milestone states"
  : `Not ready — M1 ${m1 ? m1.statusShort : "?"}, M2 ${m2 ? m2.statusShort : "?"}, M3 ${
      m3 ? m3.statusShort : "?"
    }; ${founderBlockers ? founderBlockers.length : "?"} Founder decision(s) pending`;

const pilotDateGates = [
  ...(founderBlockers ?? ["(founder-blocker list unparsed)"]),
  m1 ? `M1 ${m1.statusShort}` : "M1 status unparsed",
  m2 ? `M2 ${m2.statusShort}` : "M2 status unparsed",
];
const estimatedPilotDate = `not yet schedulable — gated on: ${pilotDateGates.join("; ")}`;

// ---------------------------------------------------------------------------
// TEAM
// ---------------------------------------------------------------------------

// Presentation-only mapping (allowed per DL-013): agent id -> display name.
const AGENTS = [
  ["atlas-ceo", "CEO"],
  ["atlas-cto", "CTO"],
  ["atlas-product", "Product"],
  ["atlas-growth", "Growth"],
  ["atlas-qa", "QA"],
];

const team = AGENTS.map(([agentId, name]) => {
  const sprintTasks = sprint.rows.filter((r) => r.owner.includes(agentId));
  const all = tasks.filter((t) => typeof t.owner === "string" && t.owner.includes(agentId));
  const status = sprintTasks.some((t) => t.status === "IN PROGRESS")
    ? "Active"
    : sprintTasks.some((t) => t.status === "READY")
      ? "Ready"
      : "Waiting";
  return {
    name,
    current: sprintTasks.length
      ? sprintTasks.map((t) => `${t.id} (${t.status ?? "?"})`).join(", ")
      : "— none in sprint",
    status,
    blocked: all.filter((t) => t.status === "BLOCKED").length,
    waiting: all.filter((t) => t.status === "BACKLOG").length,
    completed: all.filter((t) => DONE_STATUSES.has(t.status)).length,
    total: all.length,
  };
});

const workerTasks = tasks.filter(
  (t) => typeof t.owner === "string" && /execution worker/i.test(t.owner),
);

// ---------------------------------------------------------------------------
// ENGINEERING
// ---------------------------------------------------------------------------

const openByPriority = {};
for (const pri of ["P0", "P1", "P2", "P3"]) {
  const open = tasks.filter((t) => t.priority === pri && !DONE_STATUSES.has(t.status));
  if (pri === "P3" && open.length === 0) continue;
  openByPriority[pri] = open.map((t) => t.id);
}

/** Latest toolchain evidence from QA_PLAN.md "M0 Verification Results" table. */
function parseBuildEvidence(md) {
  if (!md) return null;
  const heading = md.match(/## M0 Verification Results \(([^,)]+),\s*(\d{4}-\d{2}-\d{2})\)/);
  if (!heading) return null;
  const section = md.slice(heading.index);
  const wanted = ["pnpm lint", "pnpm typecheck", "pnpm test", "uv run pytest"];
  const results = [];
  for (const line of section.split("\n")) {
    const m = line.match(/^\|\s*\d+\s*\|\s*`([^`]+)`[^|]*\|\s*([A-Z-]+)\s*\|/);
    if (m && wanted.some((w) => m[1].startsWith(w))) results.push(`${m[1]} ${m[2]}`);
  }
  if (results.length === 0) return null;
  return { evidenceTask: heading[1], evidenceDate: heading[2], results };
}

const buildEvidence = parseBuildEvidence(files.qaPlan);
if (!buildEvidence) parseFailed(SRC.qaPlan, "M0 verification command table");
const buildStatus = buildEvidence
  ? `${buildEvidence.results.join(" · ")} — QA evidence of ${buildEvidence.evidenceDate} (${buildEvidence.evidenceTask}). Live check: run \`pnpm test\`.`
  : parseFailed(SRC.qaPlan);

/** Security posture: R-09 row + QA-M0-2 defect line, both parsed. */
function parseSecurity() {
  const r09 = riskRows().find((r) => r.id === "R-09");
  const qaM02 =
    files.qaPlan && files.qaPlan.match(/\|\s*QA-M0-2\s*\|\s*(S\d)\s*\|\s*([^|]+)\|/);
  if (!r09 && !qaM02) return parseFailed(`${SRC.risks} + ${SRC.qaPlan}`, "R-09 / QA-M0-2");
  const parts = [];
  if (qaM02) parts.push(`secrets-scan decorative (QA-M0-2, ${qaM02[1]}): ${truncate(clean(qaM02[2]), 90)}`);
  if (r09) {
    const dl = r09.mitigation.match(/DL-\d+/);
    parts.push(
      `R-09 ${r09.status} (${r09.severity}/${r09.probability}) — Founder decision pending${dl ? ` (${dl[0]})` : ""}`,
    );
  }
  return parts.join(" · ");
}

// ---------------------------------------------------------------------------
// PRODUCT
// ---------------------------------------------------------------------------

function parseJourney(md) {
  if (!md) return null;
  const stepRows = md.match(/^\|\s*\d+\s*\|/gm) ?? [];
  const def = md.match(/\*\*Definition of first value:\*\*\s*\*?"([^"]+)"/);
  // Only count the §1 step table (steps are numbered 0..N in the first table).
  const section1 = md.split(/^## 2\./m)[0];
  const steps = (section1.match(/^\|\s*\d+\s*\|/gm) ?? []).length;
  return {
    steps: steps || stepRows.length,
    definition: def ? clean(def[1]) : null,
  };
}

function parseActivationMetrics(md) {
  if (!md) return null;
  const section = md.split(/^## 4\./m)[1];
  if (!section) return null;
  const rows = section
    .split("\n")
    .filter((l) => /^\|\s*[^|-]/.test(l) && !/^\|\s*Metric/i.test(l) && !/^\|-+/.test(l))
    .filter((l) => l.split("|").length >= 5);
  if (rows.length === 0) return null;
  const manualOnly = rows.filter((l) => /manual only/i.test(l)).length;
  const m1Able = rows.filter((l) => /instrumentable in m1/i.test(l)).length;
  return { total: rows.length, manualOnly, m1Able, m2: rows.length - manualOnly - m1Able };
}

function parseRoadmapChecklists(md) {
  if (!md) return [];
  const out = [];
  for (const block of md.split(/^## /m).slice(1)) {
    const header = block.split("\n", 1)[0];
    const m = header.match(/^(M\d)\s+—\s*(.*)$/);
    if (!m) continue;
    const done = (block.match(/^- \[x\]/gm) ?? []).length;
    const open = (block.match(/^- \[ \]/gm) ?? []).length;
    out.push({
      id: m[1],
      name: clean(m[2]).replace(/←.*$/, "").trim(),
      done,
      total: done + open,
    });
  }
  if (out.length === 0) parseFailed(SRC.roadmap, "milestone checklists");
  return out;
}

/** UX status derived from the actual contents of apps/web (not hand-entered). */
function deriveUxStatus() {
  const webSrc = path.join(ROOT, "apps", "web", "src");
  let uiFiles = [];
  try {
    const walk = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name === "node_modules") continue;
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(tsx|jsx)$/.test(e.name)) uiFiles.push(p);
      }
    };
    walk(webSrc);
  } catch {
    return "n/a — apps/web/src not found";
  }
  if (uiFiles.length === 0) {
    return "pre-build — no UI components exist in apps/web/src (placeholder module only; app shell lands in M1 per docs/ROADMAP.md)";
  }
  return `${uiFiles.length} UI component file(s) present in apps/web/src`;
}

const journey = parseJourney(files.journey);
if (!journey) parseFailed(SRC.journey);
const activation = parseActivationMetrics(files.journey);
if (!activation) parseFailed(SRC.journey, "§4 activation metrics table");
const roadmapChecklists = parseRoadmapChecklists(files.roadmap);

const atl013 = tasks.find((t) => t.id === "ATL-013");
const atl011 = tasks.find((t) => t.id === "ATL-011");

// ---------------------------------------------------------------------------
// BUSINESS
// ---------------------------------------------------------------------------

function docStatusLine(rel) {
  const md = read(rel);
  if (!md) return null;
  const m = md.match(/\*\*Status:\*\*\s*([^\n·]+)/);
  const title = md.match(/^# (.+)$/m);
  return {
    file: rel,
    title: title ? clean(title[1]) : rel,
    status: m ? clean(m[1]) : parseFailed(rel, "Status line"),
    gated: /honesty gate|GATE \(binding\)/i.test(md),
  };
}

function parsePipeline(md) {
  if (!md) return null;
  const status = md.match(/\*\*Status:\*\*\s*([^\n·]+)/);
  // Target-count table in §4: | Stage | Target count | Rationale |
  const section = md.split(/^## 4\./m)[1] ?? "";
  const targets = [];
  for (const line of section.split("\n")) {
    const m = line.match(/^\|\s*([A-Za-z][^|]*?)\s*\|\s*(\d+[^|]*?)\s*\|/);
    if (m && !/^Stage$/i.test(m[1].trim())) targets.push(`${clean(m[1])} ${clean(m[2])}`);
  }
  // Live prospects: the doc defines stages/targets; a live prospect would appear as a named
  // company entry — detect any "| <Stage n>" tracking rows beyond the definitions (none today).
  const hasProspectLog = /##[^\n]*prospect log/i.test(md);
  return {
    status: status ? clean(status[1]) : null,
    targets,
    liveProspects: hasProspectLog ? null : 0,
  };
}

function parseDecision(id) {
  if (!files.decisions) return null;
  const line = files.decisions.split("\n").find((l) => l.startsWith(`| ${id} `));
  if (!line) return null;
  const cells = line.split("|").map((c) => clean(c));
  // | ID | Date | Decision | Reason | Alternatives | Risk | Owner | Revisit condition |
  if (cells.length < 9) return null;
  return { id: cells[1], date: cells[2], decision: cells[3], revisit: cells[8] };
}

const pipeline = parsePipeline(files.pipeline);
if (!pipeline) parseFailed(SRC.pipeline);
const dl005 = parseDecision("DL-005");
if (!dl005) parseFailed(SRC.decisions, "DL-005 row");

const growthDocs = (() => {
  try {
    return fs
      .readdirSync(path.join(ROOT, "docs", "growth"))
      .filter((f) => f.endsWith(".md"))
      .sort()
      .map((f) => docStatusLine(`docs/growth/${f}`))
      .filter(Boolean);
  } catch {
    parseFailed("docs/growth", "directory missing");
    return [];
  }
})();

const demoDoc = growthDocs.find((d) => d.file.endsWith("DEMO_OUTLINE.md"));

const docCounts = {
  strategy: countFiles("docs"),
  adrs: countFiles("docs/adr"),
  pilot: countFiles("docs/pilot"),
  coordination: countFiles("docs/coordination"),
  growth: countFiles("docs/growth"),
};

// ---------------------------------------------------------------------------
// RISKS
// ---------------------------------------------------------------------------

// Presentation-only mapping (allowed per DL-013): risk id -> primary category.
// Each risk lives in exactly one group; unknown IDs land in "Uncategorized" so the
// dashboard can never silently hide a new risk.
const RISK_CATEGORY = {
  "R-01": "Technical",
  "R-02": "Technical",
  "R-03": "Technical",
  "R-04": "Product",
  "R-05": "Business",
  "R-06": "Security",
  "R-07": "Process",
  "R-08": "Business",
  "R-09": "Security",
};
const RISK_CATEGORY_ORDER = ["Technical", "Security", "Product", "Business", "Process", "Uncategorized"];
const SEVERITY_ORDER = { High: 0, Medium: 1, Low: 2 };

let riskCache = null;
function riskRows() {
  if (riskCache) return riskCache;
  riskCache = [];
  if (!files.risks) return riskCache;
  for (const line of files.risks.split("\n")) {
    const m = line.match(/^\|\s*(R-\d+)\s*\|/);
    if (!m) continue;
    const cells = line.split("|").map((c) => clean(c));
    // | ID | Description | Severity | Probability | Impact | Owner | Mitigation | Status |
    if (cells.length < 10) {
      parseFailed(SRC.risks, `row ${m[1]}`);
      continue;
    }
    riskCache.push({
      id: cells[1],
      description: cells[2],
      severity: cells[3],
      probability: cells[4],
      impact: cells[5],
      owner: cells[6],
      mitigation: cells[7],
      status: cells[8],
      category: RISK_CATEGORY[cells[1]] ?? "Uncategorized",
    });
  }
  if (riskCache.length === 0) parseFailed(SRC.risks, "no risk rows");
  return riskCache;
}

const risks = riskRows();
const riskGroups = RISK_CATEGORY_ORDER.map((cat) => ({
  category: cat,
  risks: risks
    .filter((r) => r.category === cat)
    .sort(
      (a, b) =>
        (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9) ||
        a.id.localeCompare(b.id),
    ),
})).filter((g) => g.risks.length > 0);

const securityLine = parseSecurity();

// ---------------------------------------------------------------------------
// Assemble the data model
// ---------------------------------------------------------------------------

const naCoverage =
  "n/a — placeholder suites until M1; coverage floors defined in docs/TESTING_STRATEGY.md (source not yet in repo: real test suites land with M1 code)";
const naPerformance =
  "n/a pre-M1 — source not yet in repo (performance evidence lands with the M1 staging deploy per docs/ROADMAP.md)";

const model = {
  generated: {
    coordLastUpdated,
    commit: srcCommit,
  },
  executive: {
    sprint: sprint.header,
    progress: `${sprintDone} of ${sprint.rows.length} sprint tasks at IMPLEMENTED/VERIFIED`,
    statusCounts: Object.entries(sprintStatusCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · "),
    productionScore,
    pilotReadiness,
    currentVersion,
    estimatedPilotDate,
    founderBlockers: founderBlockers ?? [],
  },
  team,
  workerTasks,
  engineering: {
    openByPriority,
    buildStatus,
    coverage: naCoverage,
    performance: naPerformance,
    security: securityLine,
  },
  product: {
    journey: journey
      ? `${SRC.journey} exists — ${journey.steps}-step first-value journey mapped${
          journey.definition ? ` ("${journey.definition}")` : ""
        }`
      : parseFailed(SRC.journey),
    onboarding: atl013
      ? `ATL-013 (${atl013.title}): ${atl013.status}`
      : parseFailed(SRC.workboard, "ATL-013"),
    activation: activation
      ? `${activation.total} activation metrics dispositioned (${SRC.journey} §4): ${activation.m1Able} instrumentable in M1, ${activation.m2} in M2, ${activation.manualOnly} manual-only. Instrumentation spec ATL-011: ${
          atl011 ? atl011.status : "?"
        }${atl011 && /frozen/i.test(atl011.statusRaw) ? " (frozen, DL-012)" : ""}`
      : parseFailed(SRC.journey, "§4"),
    features: roadmapChecklists,
    ux: deriveUxStatus(),
  },
  business: {
    pilotCustomers: pipeline
      ? `${pipeline.liveProspects ?? "?"} live prospects — ${SRC.pipeline} is plan-stage (status: ${
          pipeline.status ?? "?"
        }); no prospect log section exists yet. Stage targets: ${pipeline.targets.join(", ") || "—"}`
      : parseFailed(SRC.pipeline),
    pricing: dl005
      ? `HYPOTHESIS (DL-005, ${dl005.date}): ${truncate(dl005.decision, 180)} — revisit: ${dl005.revisit}`
      : parseFailed(SRC.decisions, "DL-005"),
    demo: demoDoc
      ? `${demoDoc.status}${demoDoc.gated ? " — gated: no live demo until QA verification + ATL-006 capability matrix (binding gate in the doc)" : ""}`
      : parseFailed("docs/growth/DEMO_OUTLINE.md"),
    salesMaterial: growthDocs,
    documentation: `${docCounts.strategy ?? "?"} strategy/docs files (docs/*.md) · ${docCounts.adrs ?? "?"} ADRs · ${docCounts.pilot ?? "?"} pilot docs · ${docCounts.coordination ?? "?"} coordination files · ${docCounts.growth ?? "?"} growth docs`,
  },
  riskGroups,
};

// ---------------------------------------------------------------------------
// Render — Markdown
// ---------------------------------------------------------------------------

function renderMarkdown(d) {
  const L = [];
  L.push("<!-- GENERATED FILE — do not edit by hand. Regenerate with `pnpm dashboard`");
  L.push("     (tools/founder-dashboard/generate.mjs). CI enforces freshness (DL-013). -->");
  L.push("");
  L.push("# Atlas — Founder Control Center");
  L.push("");
  L.push(
    `_Generated from repo sources at commit \`${d.generated.commit}\` · coordination data as of **${d.generated.coordLastUpdated}** (last \`docs/coordination\` commit) · ATL-021 / DL-013_`,
  );
  L.push("");
  if (warnings.length) {
    L.push("## ⚠ Parse warnings");
    L.push("");
    for (const w of warnings) L.push(`- ${w}`);
    L.push("");
  }

  L.push("## 1. EXECUTIVE");
  L.push("");
  L.push("| Item | Value |");
  L.push("|---|---|");
  L.push(`| Current sprint | ${d.executive.sprint} |`);
  L.push(`| Sprint progress | ${d.executive.progress} (${d.executive.statusCounts}) |`);
  L.push(`| Production score | ${d.executive.productionScore} |`);
  L.push(`| Pilot readiness | ${d.executive.pilotReadiness} |`);
  L.push(`| Current version | ${d.executive.currentVersion} |`);
  L.push(`| Estimated pilot date | ${d.executive.estimatedPilotDate} |`);
  L.push("");
  if (d.executive.founderBlockers.length) {
    L.push("**Founder decisions pending:**");
    L.push("");
    for (const b of d.executive.founderBlockers) L.push(`- ${b}`);
    L.push("");
  }

  L.push("## 2. TEAM");
  L.push("");
  L.push("| Agent | Sprint task(s) | Status | Blocked | Backlog (frozen) | Completed | Total on board |");
  L.push("|---|---|---|---|---|---|---|");
  for (const t of d.team) {
    L.push(
      `| ${t.name} | ${t.current} | ${t.status} | ${t.blocked} | ${t.waiting} | ${t.completed} | ${t.total} |`,
    );
  }
  L.push("");
  if (d.workerTasks.length) {
    L.push(
      `_Execution-worker tasks (not agent-owned): ${d.workerTasks
        .map((t) => `${t.id} (${t.owner.split("(")[0].trim()}, ${t.status})`)
        .join(", ")}._`,
    );
    L.push("");
  }

  L.push("## 3. ENGINEERING");
  L.push("");
  L.push("| Item | Value |");
  L.push("|---|---|");
  for (const [pri, ids] of Object.entries(d.engineering.openByPriority)) {
    L.push(`| Open ${pri} tasks | ${ids.length}${ids.length ? ` — ${ids.join(", ")}` : ""} |`);
  }
  L.push(`| Build & tests | ${d.engineering.buildStatus} |`);
  L.push(`| Coverage | ${d.engineering.coverage} |`);
  L.push(`| Performance | ${d.engineering.performance} |`);
  L.push(`| Security | ${d.engineering.security} |`);
  L.push("");

  L.push("## 4. PRODUCT");
  L.push("");
  L.push("| Item | Value |");
  L.push("|---|---|");
  L.push(`| Customer journey | ${d.product.journey} |`);
  L.push(`| Onboarding | ${d.product.onboarding} |`);
  L.push(`| Activation | ${d.product.activation} |`);
  L.push(
    `| Feature completion | ${
      d.product.features.length
        ? d.product.features
            .map((f) => `${f.id}: ${f.done}/${f.total}${f.total === 0 ? " (directional, no checklist)" : ""}`)
            .join(" · ")
        : parseFailed(SRC.roadmap)
    } (docs/ROADMAP.md checklists) |`,
  );
  L.push(`| UX status | ${d.product.ux} |`);
  L.push("");

  L.push("## 5. BUSINESS");
  L.push("");
  L.push("| Item | Value |");
  L.push("|---|---|");
  L.push(`| Pilot customers | ${d.business.pilotCustomers} |`);
  L.push(`| Pricing | ${d.business.pricing} |`);
  L.push(`| Demo status | ${d.business.demo} |`);
  L.push(
    `| Sales material | ${d.business.salesMaterial
      .map((s) => `${s.file.replace("docs/growth/", "")}: ${s.status}${s.gated ? " [claims-gated]" : ""}`)
      .join(" · ")} |`,
  );
  L.push(`| Documentation | ${d.business.documentation} |`);
  L.push("");

  L.push("## 6. RISKS");
  L.push("");
  L.push(`_Source: ${SRC.risks} (every row rendered; category mapping is presentation-only)._`);
  L.push("");
  for (const g of d.riskGroups) {
    L.push(`### ${g.category}`);
    L.push("");
    L.push("| ID | Severity / Probability | Status | Mitigation (summary) |");
    L.push("|---|---|---|---|");
    for (const r of g.risks) {
      L.push(
        `| ${r.id} | ${r.severity} / ${r.probability} | ${r.status} | ${truncate(r.mitigation, 140)} |`,
      );
    }
    L.push("");
  }

  L.push("---");
  L.push("");
  L.push(
    "_Every value above is parsed from a repo file, computed from git, or explicitly marked n/a with its future source. Regenerate: `pnpm dashboard`._",
  );
  L.push("");
  return L.join("\n");
}

// ---------------------------------------------------------------------------
// Render — HTML (single self-contained file, inline CSS only)
// ---------------------------------------------------------------------------

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function kvTable(rows) {
  return `<table>${rows
    .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`)
    .join("")}</table>`;
}

function renderHtml(d) {
  const warnBlock = warnings.length
    ? `<div class="warn"><strong>Parse warnings</strong><ul>${warnings
        .map((w) => `<li>${esc(w)}</li>`)
        .join("")}</ul></div>`
    : "";

  const teamRows = d.team
    .map(
      (t) =>
        `<tr><td><strong>${esc(t.name)}</strong></td><td>${esc(t.current)}</td><td><span class="badge b-${t.status.toLowerCase()}">${esc(t.status)}</span></td><td class="num">${t.blocked}</td><td class="num">${t.waiting}</td><td class="num">${t.completed}</td><td class="num">${t.total}</td></tr>`,
    )
    .join("");

  const engRows = [
    ...Object.entries(d.engineering.openByPriority).map(([pri, ids]) => [
      `Open ${pri} tasks`,
      `${ids.length}${ids.length ? ` — ${ids.join(", ")}` : ""}`,
    ]),
    ["Build & tests", d.engineering.buildStatus.replace(/`/g, "")],
    ["Coverage", d.engineering.coverage],
    ["Performance", d.engineering.performance],
    ["Security", d.engineering.security],
  ];

  const featureLine = d.product.features.length
    ? d.product.features
        .map((f) => `${f.id}: ${f.done}/${f.total}${f.total === 0 ? " (directional)" : ""}`)
        .join(" · ")
    : "⚠ parse failed: docs/ROADMAP.md";

  const riskBlocks = d.riskGroups
    .map(
      (g) => `<h3>${esc(g.category)}</h3>
<table><tr><th>ID</th><th>Severity / Probability</th><th>Status</th><th>Mitigation (summary)</th></tr>${g.risks
        .map(
          (r) =>
            `<tr><td>${esc(r.id)}</td><td>${esc(`${r.severity} / ${r.probability}`)}</td><td>${esc(r.status)}</td><td>${esc(truncate(r.mitigation, 140))}</td></tr>`,
        )
        .join("")}</table>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Atlas — Founder Control Center</title>
<!-- GENERATED FILE — do not edit by hand. Regenerate with \`pnpm dashboard\` (DL-013). -->
<style>
:root { color-scheme: light dark;
  --bg:#ffffff; --fg:#1a1d21; --muted:#5c6570; --line:#d7dce2; --card:#f6f8fa;
  --accent:#0b5cad; --warnbg:#fff4e0; --warnline:#e0a030; }
@media (prefers-color-scheme: dark) { :root {
  --bg:#14171a; --fg:#e6e9ec; --muted:#9aa4ae; --line:#333a41; --card:#1d2126;
  --accent:#6ab0f3; --warnbg:#3a2f14; --warnline:#c79b3a; } }
* { box-sizing: border-box; }
body { margin:0; padding:2rem 1.25rem 4rem; background:var(--bg); color:var(--fg);
  font:15px/1.55 system-ui, "Segoe UI", Arial, "Noto Sans Hebrew", sans-serif; }
main { max-width: 68rem; margin: 0 auto; }
h1 { font-size:1.6rem; margin:0 0 .25rem; }
h2 { font-size:1.15rem; margin:2rem 0 .6rem; padding-block-end:.3rem;
  border-block-end:1px solid var(--line); }
h3 { font-size:.95rem; margin:1rem 0 .4rem; color:var(--muted);
  text-transform:uppercase; letter-spacing:.04em; }
.meta { color:var(--muted); font-size:.85rem; margin-block-end:1rem; }
table { border-collapse:collapse; width:100%; margin:.4rem 0 1rem; background:var(--card);
  border:1px solid var(--line); font-size:.9rem; }
th, td { text-align:start; vertical-align:top; padding:.45rem .6rem;
  border-block-start:1px solid var(--line); }
tr:first-child th, tr:first-child td { border-block-start:none; }
th { color:var(--muted); font-weight:600; white-space:nowrap; width:1%; min-width:11rem; }
table tr > th:only-of-type { background:transparent; }
td.num { text-align:end; font-variant-numeric:tabular-nums; }
.badge { display:inline-block; padding:.05rem .5rem; border-radius:.75rem; font-size:.8rem;
  border:1px solid var(--line); }
.b-active { border-color:var(--accent); color:var(--accent); }
.warn { background:var(--warnbg); border:1px solid var(--warnline); border-radius:.4rem;
  padding:.6rem .9rem; margin:1rem 0; }
.foot { color:var(--muted); font-size:.8rem; margin-block-start:2rem;
  border-block-start:1px solid var(--line); padding-block-start:.75rem; }
ul { margin:.3rem 0 .8rem; padding-inline-start:1.3rem; }
</style>
</head>
<body>
<main>
<h1>Atlas — Founder Control Center</h1>
<p class="meta">Generated from repo sources at commit <code>${esc(d.generated.commit)}</code> ·
coordination data as of <strong>${esc(d.generated.coordLastUpdated)}</strong>
(last <code>docs/coordination</code> commit) · ATL-021 / DL-013 · generated, never hand-maintained.</p>
${warnBlock}
<h2>1. Executive</h2>
${kvTable([
    ["Current sprint", d.executive.sprint],
    ["Sprint progress", `${d.executive.progress} (${d.executive.statusCounts})`],
    ["Production score", d.executive.productionScore],
    ["Pilot readiness", d.executive.pilotReadiness],
    ["Current version", d.executive.currentVersion],
    ["Estimated pilot date", d.executive.estimatedPilotDate],
  ])}
${
    d.executive.founderBlockers.length
      ? `<p><strong>Founder decisions pending:</strong></p><ul>${d.executive.founderBlockers
          .map((b) => `<li>${esc(b)}</li>`)
          .join("")}</ul>`
      : ""
  }
<h2>2. Team</h2>
<table>
<tr><th>Agent</th><th>Sprint task(s)</th><th>Status</th><th>Blocked</th><th>Backlog (frozen)</th><th>Completed</th><th>Total</th></tr>
${teamRows}
</table>
${
    d.workerTasks.length
      ? `<p class="meta">Execution-worker tasks (not agent-owned): ${esc(
          d.workerTasks
            .map((t) => `${t.id} (${t.owner.split("(")[0].trim()}, ${t.status})`)
            .join(", "),
        )}.</p>`
      : ""
  }
<h2>3. Engineering</h2>
${kvTable(engRows)}
<h2>4. Product</h2>
${kvTable([
    ["Customer journey", d.product.journey],
    ["Onboarding", d.product.onboarding],
    ["Activation", d.product.activation],
    ["Feature completion", `${featureLine} (docs/ROADMAP.md checklists)`],
    ["UX status", d.product.ux],
  ])}
<h2>5. Business</h2>
${kvTable([
    ["Pilot customers", d.business.pilotCustomers],
    ["Pricing", d.business.pricing],
    ["Demo status", d.business.demo],
    [
      "Sales material",
      d.business.salesMaterial
        .map((s) => `${s.file.replace("docs/growth/", "")}: ${s.status}${s.gated ? " [claims-gated]" : ""}`)
        .join(" · "),
    ],
    ["Documentation", d.business.documentation],
  ])}
<h2>6. Risks</h2>
<p class="meta">Source: ${esc(SRC.risks)} — every row rendered; grouping is presentation-only.</p>
${riskBlocks}
<p class="foot">Every value on this page is parsed from a repo file, computed from git, or explicitly
marked n/a with its future source file. Regenerate with <code>pnpm dashboard</code>
(tools/founder-dashboard/generate.mjs). CI fails if coordination files change without regeneration.</p>
</main>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Write outputs
// ---------------------------------------------------------------------------

const mdOut = renderMarkdown(model);
const htmlOut = renderHtml(model);
fs.writeFileSync(path.join(ROOT, "FOUNDER_DASHBOARD.md"), mdOut);
fs.writeFileSync(path.join(ROOT, "FOUNDER_DASHBOARD.html"), htmlOut);
console.log(
  `founder-dashboard: wrote FOUNDER_DASHBOARD.md + FOUNDER_DASHBOARD.html (data as of ${coordLastUpdated}, source commit ${srcCommit})${
    warnings.length ? ` — ${warnings.length} parse warning(s)` : ""
  }`,
);
