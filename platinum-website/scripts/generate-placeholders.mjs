/**
 * Generates brand-palette placeholder graphics for every image slot.
 * These are deliberately abstract/architectural line compositions —
 * clearly NOT photographs — so nothing can be mistaken for real
 * Platinum project work before client-approved photography arrives.
 *
 * Run: node scripts/generate-placeholders.mjs
 */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "images");
mkdirSync(outDir, { recursive: true });

const C = {
  obsidian: "#111416",
  ink: "#182128",
  platinum: "#D7D8D4",
  ivory: "#F6F3EC",
  bronze: "#A47C48",
  slate: "#596168",
};

// Deterministic pseudo-random so output is stable across runs.
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

function composition(w, h, seed, dark) {
  const r = rng(seed);
  const bg = dark ? C.obsidian : C.ivory;
  const line = dark ? C.platinum : C.ink;
  const parts = [];
  parts.push(`<rect width="${w}" height="${h}" fill="${bg}"/>`);

  // Horizon band
  const horizon = h * (0.55 + r() * 0.2);
  parts.push(
    `<rect x="0" y="${horizon}" width="${w}" height="${h - horizon}" fill="${dark ? C.ink : C.platinum}" opacity="0.45"/>`,
  );

  // Vertical structural lines
  const cols = 5 + Math.floor(r() * 4);
  for (let i = 0; i < cols; i++) {
    const x = w * (0.08 + (0.84 * i) / (cols - 1)) + (r() - 0.5) * w * 0.03;
    const y1 = h * (0.12 + r() * 0.25);
    parts.push(
      `<line x1="${x}" y1="${y1}" x2="${x}" y2="${horizon}" stroke="${line}" stroke-width="${1 + r() * 1.5}" opacity="${0.25 + r() * 0.3}"/>`,
    );
  }

  // Rectangular volumes
  const vols = 3 + Math.floor(r() * 3);
  for (let i = 0; i < vols; i++) {
    const rw = w * (0.1 + r() * 0.22);
    const rh = h * (0.15 + r() * 0.35);
    const x = w * 0.06 + r() * (w * 0.82 - rw);
    parts.push(
      `<rect x="${x}" y="${horizon - rh}" width="${rw}" height="${rh}" fill="none" stroke="${line}" stroke-width="1.4" opacity="${0.4 + r() * 0.3}"/>`,
    );
  }

  // Single bronze accent (5-8% rule)
  const aw = w * (0.05 + r() * 0.06);
  const ah = h * (0.18 + r() * 0.2);
  const ax = w * 0.15 + r() * w * 0.6;
  parts.push(
    `<rect x="${ax}" y="${horizon - ah}" width="${aw}" height="${ah}" fill="${C.bronze}" opacity="0.85"/>`,
  );

  return parts.join("\n  ");
}

function svg(w, h, seed, { dark = false, label = "Placeholder — awaiting approved photography" } = {}) {
  const textColor = dark ? C.platinum : C.slate;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">
  ${composition(w, h, seed, dark)}
  <text x="${w / 2}" y="${h - h * 0.045}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.max(11, Math.round(w * 0.014))}" letter-spacing="2" fill="${textColor}" opacity="0.75">${label.toUpperCase()}</text>
</svg>
`;
}

const files = [
  ["hero-home.svg", 1600, 1000, 7, { dark: true }],
  ["hero-home-mobile.svg", 800, 1000, 11, { dark: true }],
  ["about-hero.svg", 1600, 900, 23, { dark: false }],
  ["service-residential.svg", 1200, 900, 31, {}],
  ["service-commercial.svg", 1200, 900, 43, {}],
  ["service-installations.svg", 1200, 900, 59, {}],
  ["service-contracting.svg", 1200, 900, 71, {}],
  ["project-prewar-hero.svg", 1600, 1000, 83, { dark: true }],
  ["project-prewar-1.svg", 1200, 900, 89, {}],
  ["project-prewar-2.svg", 1200, 900, 97, {}],
  ["project-prewar-3.svg", 1200, 900, 101, {}],
  ["project-workplace-hero.svg", 1600, 1000, 103, { dark: true }],
  ["project-workplace-1.svg", 1200, 900, 107, {}],
  ["project-workplace-2.svg", 1200, 900, 109, {}],
  ["project-workplace-3.svg", 1200, 900, 113, {}],
  ["project-millwork-hero.svg", 1600, 1000, 127, { dark: true }],
  ["project-millwork-1.svg", 1200, 900, 131, {}],
  ["project-millwork-2.svg", 1200, 900, 137, {}],
  ["project-millwork-3.svg", 1200, 900, 139, {}],
];

for (const [name, w, h, seed, opts] of files) {
  writeFileSync(join(outDir, name), svg(w, h, seed, opts));
  console.log("wrote", name);
}

// OG default image
const og = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" role="img" aria-label="PLATINUM">
  ${composition(1200, 630, 151, true)}
  <rect width="1200" height="630" fill="${C.obsidian}" opacity="0.55"/>
  <text x="600" y="290" text-anchor="middle" font-family="Georgia, serif" font-size="86" letter-spacing="14" fill="${C.ivory}">PLATINUM</text>
  <text x="600" y="360" text-anchor="middle" font-family="Georgia, serif" font-size="26" letter-spacing="3" fill="${C.platinum}">Built with precision. Managed with accountability.</text>
</svg>
`;
writeFileSync(join(outDir, "og-default.svg"), og);
console.log("wrote og-default.svg");
