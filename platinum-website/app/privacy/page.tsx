import { LegalPage } from "@/components/sections/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Platinum collects, uses, and protects information submitted through this website.",
  path: "/privacy",
});

/*
 * Baseline policy describing what this site actually does today.
 * REQUIRES CLIENT APPROVAL: attorney review before launch, plus updates
 * if analytics, marketing pixels, or a CRM integration are added.
 */
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="July 20, 2026">
      <h2>What we collect</h2>
      <p>
        When you submit the contact form, we collect the information you
        provide: your name, email address, phone number, project type,
        project location, timing preferences, and your message. We do not
        require an account and we do not collect payment information through
        this website.
      </p>

      <h2>How we use it</h2>
      <p>
        Submitted information is used for one purpose: reviewing and
        responding to your inquiry. We do not sell your information, and we do
        not add you to marketing lists without your separate, explicit
        consent.
      </p>

      <h2>Cookies and analytics</h2>
      <p>
        This site is built to operate with a minimum of cookies. Essential
        functionality does not require tracking cookies. If usage analytics
        are enabled, they are configured so that the contents of form
        submissions are never sent to analytics providers.
      </p>

      <h2>Retention</h2>
      <p>
        Inquiry records are retained for as long as needed to evaluate and
        service the potential project, and are deleted upon verified request
        where no legal obligation requires retention.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>You may request a copy of the information you submitted.</li>
        <li>You may request correction or deletion of your information.</li>
        <li>You may withdraw consent to further contact at any time.</li>
      </ul>
      <p>
        To make any of these requests, use the contact form on this site and
        we will respond through the details you provide.
      </p>

      <h2>Security</h2>
      <p>
        Form submissions are validated and transmitted over encrypted
        connections. Access to inquiry records is limited to the team members
        who respond to them.
      </p>
    </LegalPage>
  );
}
