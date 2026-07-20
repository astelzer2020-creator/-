import { LegalPage } from "@/components/sections/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of Use",
  description: "Terms governing the use of the Platinum website.",
  path: "/terms",
});

/*
 * Baseline terms. REQUIRES CLIENT APPROVAL: attorney review before
 * launch; the governing legal entity name must be inserted once the
 * entity structure is verified (docs/APPROVALS.md).
 */
export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" lastUpdated="July 20, 2026">
      <h2>Use of this website</h2>
      <p>
        This website presents information about Platinum&rsquo;s construction
        services. Content is provided for general information and does not
        constitute a binding offer, quotation, or professional advice for any
        specific project.
      </p>

      <h2>No engagement without agreement</h2>
      <p>
        Submitting an inquiry does not create a client relationship or any
        obligation on either side. Services are engaged only through a signed
        written agreement that defines scope, price, and terms for a specific
        project.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The content, design, and branding of this website may not be
        reproduced or used commercially without written permission. Project
        imagery and credits, where shown, remain the property of their
        respective owners.
      </p>

      <h2>Accuracy</h2>
      <p>
        We work to keep the information on this site accurate and current.
        Project availability, service scope, and service areas are confirmed
        individually during the consultation process.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Platinum is not liable for
        damages arising from the use of this website or reliance on its
        general content. Nothing in these terms limits liability that cannot
        be limited under applicable law.
      </p>
    </LegalPage>
  );
}
