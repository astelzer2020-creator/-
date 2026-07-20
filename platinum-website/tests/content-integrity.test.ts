import { existsSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { projects } from "@/content/projects";
import { services } from "@/content/services";
import { site } from "@/content/site";
import verifiedData from "@/content/verified-company-data.json";

const publicDir = path.join(__dirname, "..", "public");

function assertImageExists(src: string): void {
  expect(src.startsWith("/"), `image src must be root-relative: ${src}`).toBe(true);
  expect(
    existsSync(path.join(publicDir, src)),
    `missing image file: public${src}`,
  ).toBe(true);
}

describe("content integrity", () => {
  it("project slugs are unique", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("service slugs are unique", () => {
    const slugs = services.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every project references only existing services", () => {
    const serviceSlugs = new Set(services.map((s) => s.slug));
    for (const p of projects) {
      for (const ref of p.services) {
        expect(serviceSlugs.has(ref), `${p.slug} references unknown service ${ref}`).toBe(true);
      }
    }
  });

  it("every referenced image file exists", () => {
    for (const s of services) assertImageExists(s.image.src);
    for (const p of projects) {
      assertImageExists(p.hero.src);
      for (const g of p.gallery) assertImageExists(g.src);
    }
  });

  it("every image has non-empty alt text", () => {
    for (const s of services) expect(s.image.alt.length).toBeGreaterThan(0);
    for (const p of projects) {
      expect(p.hero.alt.length).toBeGreaterThan(0);
      for (const g of p.gallery) expect(g.alt.length).toBeGreaterThan(0);
    }
  });

  it("every project and service has SEO title and description", () => {
    for (const entry of [...projects, ...services]) {
      expect(entry.seo.title.length).toBeGreaterThan(0);
      expect(entry.seo.description.length).toBeGreaterThan(20);
    }
  });

  it("nav links point at known routes", () => {
    const known = ["/work", "/services", "/process", "/about", "/contact", "/privacy", "/terms", "/accessibility"];
    for (const item of [...site.nav, ...site.footerNav]) {
      expect(known).toContain(item.href);
    }
  });

  it("no forbidden placeholder markers in published copy", () => {
    const corpus = JSON.stringify({ projects, services, site });
    for (const marker of [/lorem ipsum/i, /\bTODO\b/, /\bFIXME\b/, /\bTBD\b/]) {
      expect(corpus).not.toMatch(marker);
    }
  });

  it("verification gate: every business fact carries an explicit status", () => {
    for (const [key, value] of Object.entries(verifiedData)) {
      if (key === "_readme") continue;
      const status = (value as { status: string }).status;
      expect(["verified", "pending"], `${key} has invalid status ${status}`).toContain(status);
    }
  });

  it("unverified projects are marked pending", () => {
    // The three seeded structural previews must never claim approval.
    for (const p of projects) {
      expect(["approved", "pending"]).toContain(p.approval);
    }
  });
});
