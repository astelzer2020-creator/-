/**
 * Measurement layer (master brief, section 13).
 *
 * Events are defined centrally so names and allowed parameters stay
 * consistent and PII never leaks into analytics. Until an analytics
 * provider is approved and configured (REQUIRES CLIENT APPROVAL —
 * account ownership), events are console-logged in development and
 * dropped in production.
 */

type AnalyticsEvent =
  | { name: "view_project"; params: { project_slug: string; category: string } }
  | { name: "select_service"; params: { service_slug: string; source_section: string } }
  | { name: "click_call" | "click_text"; params: { page_path: string; placement: string } }
  | { name: "form_start"; params: { form_id: string; page_path: string } }
  | { name: "form_submit"; params: { form_id: string; project_type: string } }
  | { name: "generate_lead"; params: { lead_type: string; source: string } }
  | { name: "upload_plans"; params: { file_type: string; size_bucket: string } };

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  // Wire the approved provider here (GA4 gtag / Plausible / etc.).
  // Parameters are restricted to the typed allowlist above — never PII.
  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event.name, event.params);
  }
}
