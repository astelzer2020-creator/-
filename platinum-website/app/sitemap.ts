import type { MetadataRoute } from "next";
import { services } from "@/content/services";
import { projects } from "@/content/projects";
import { siteUrl } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/work",
    "/process",
    "/contact",
    "/privacy",
    "/terms",
    "/accessibility",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const serviceRoutes = services.map((s) => ({
    url: `${siteUrl}/services/${s.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Only approved case studies enter the sitemap.
  const projectRoutes = projects
    .filter((p) => p.approval === "approved")
    .map((p) => ({
      url: `${siteUrl}/work/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  return [...staticRoutes, ...serviceRoutes, ...projectRoutes];
}
