import { brandName } from "@/lib/content";

export const site = {
  name: brandName,
  description:
    "Residential renovations, commercial build-outs, and specialty installations delivered by an experienced New York construction team.",
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
