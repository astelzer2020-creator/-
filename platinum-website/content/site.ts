import { brandName } from "@/lib/content";

export const site = {
  name: brandName,
  tagline: "Built with precision. Managed with accountability.",
  description:
    "Residential renovations, commercial build-outs, and specialty installations delivered by an experienced New York construction team.",
  positioning:
    "PLATINUM builds and transforms high-value spaces across New York with disciplined project management, exacting craftsmanship, and clear accountability from preconstruction through closeout.",
  cta: {
    primary: { label: "Discuss Your Project", href: "/contact" },
    secondary: { label: "View Selected Work", href: "/work" },
  },
  nav: [
    { label: "Work", href: "/work" },
    { label: "Services", href: "/services" },
    { label: "Process", href: "/process" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  footerNav: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
    { label: "Accessibility", href: "/accessibility" },
  ],
} as const;

export type NavItem = { label: string; href: string };
