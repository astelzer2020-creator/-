import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/contact/thank-you"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
