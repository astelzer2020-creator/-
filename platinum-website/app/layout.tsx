import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/content/site";
import { siteUrl } from "@/lib/content";
import { organizationJsonLd } from "@/lib/seo";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

// Body font loads without preload so it never competes with the LCP
// image for bandwidth on slow connections; the size-adjusted fallback
// keeps CLS at zero during the swap.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — Construction, Build-Outs & Specialty Installations in New York`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    siteName: site.name,
    locale: "en_US",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#111416",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="flex min-h-svh flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-ivory"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        {/* Scroll-reveal driver — replaces a React client component so
            static sections carry zero hydration cost. See globals.css. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var d=document;d.documentElement.classList.add('js');var e=d.querySelectorAll('[data-reveal]');if(!('IntersectionObserver' in window)){e.forEach(function(n){n.classList.add('is-visible')});return}var o=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('is-visible');o.unobserve(x.target)}})},{rootMargin:'0px 0px -10% 0px',threshold:0.1});e.forEach(function(n){o.observe(n)})})();",
          }}
        />
      </body>
    </html>
  );
}
