import { LegalPage } from "@/components/sections/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Accessibility Statement",
  description: "Platinum's commitment to an accessible website experience, targeting WCAG 2.2 AA.",
  path: "/accessibility",
});

export default function AccessibilityPage() {
  return (
    <LegalPage title="Accessibility Statement" lastUpdated="July 20, 2026">
      <h2>Our commitment</h2>
      <p>
        We want every visitor to be able to use this website comfortably,
        including people who rely on assistive technology. The site is built
        and tested against the Web Content Accessibility Guidelines (WCAG)
        2.2, Level AA.
      </p>

      <h2>What that includes</h2>
      <ul>
        <li>Full keyboard navigation, including a skip-to-content link and visible focus indicators.</li>
        <li>Semantic structure: landmarks, heading hierarchy, and labeled forms with inline, announced error messages.</li>
        <li>Color contrast meeting AA ratios in both light and dark sections.</li>
        <li>Text that scales to 200% zoom without loss of content or functionality.</li>
        <li>Reduced-motion support: animations are disabled when your system requests it.</li>
        <li>Alternative text for meaningful images.</li>
      </ul>

      <h2>Feedback</h2>
      <p>
        Accessibility is ongoing work. If you encounter a barrier anywhere on
        this site, please tell us through the contact form — include the page
        and the assistive technology you were using, and we will address it.
      </p>
    </LegalPage>
  );
}
