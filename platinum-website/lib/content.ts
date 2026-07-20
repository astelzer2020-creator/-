import verifiedData from "@/content/verified-company-data.json";

/**
 * Verification gate (master brief, section 1).
 *
 * Every business fact carries a status. Anything "pending" is
 * REQUIRES CLIENT APPROVAL and must not be rendered on the live
 * site as fact. Use the typed accessors below — they return `null`
 * for unverified fields so components fail safe.
 */

export type VerificationStatus = "verified" | "pending";

interface VerifiedField<T> {
  value: T;
  status: VerificationStatus;
  note?: string;
}

function field<T>(raw: { value: unknown; status: string }): VerifiedField<T> {
  return {
    value: raw.value as T,
    status: raw.status === "verified" ? "verified" : "pending",
  };
}

const data = verifiedData as unknown as Record<
  string,
  { value: unknown; status: string; note?: string }
>;

function verifiedOrNull<T>(key: string): T | null {
  const raw = data[key];
  if (!raw) return null;
  const f = field<T>(raw);
  return f.status === "verified" ? f.value : null;
}

/** Public brand name — verified working label. */
export const brandName: string =
  verifiedOrNull<string>("publicBrandName") ?? "PLATINUM";

/** Verified phone, or null when Call/Text actions must stay hidden. */
export const verifiedPhone: string | null = verifiedOrNull<string>("phone");

/** Verified public email, or null. */
export const verifiedEmail: string | null = (() => {
  const v = verifiedOrNull<string>("email");
  return v && v.length > 0 ? v : null;
})();

/** Verified legal entity names for the footer, or empty list. */
export const verifiedLegalEntities: string[] =
  verifiedOrNull<string[]>("legalEntities") ?? [];

/** Verified license/credential lines, or empty list. */
export const verifiedLicensing: string[] =
  verifiedOrNull<string[]>("licensing") ?? [];

export interface Testimonial {
  quote: string;
  attribution: string;
  project?: string;
}

/** Only client-approved testimonials; empty until approvals arrive. */
export const verifiedTestimonials: Testimonial[] =
  verifiedOrNull<Testimonial[]>("testimonials") ?? [];

/**
 * Whether portfolio entries still pending client approval are shown.
 * Preview/staging convenience only — production must set
 * NEXT_PUBLIC_SHOW_PENDING_CONTENT=false until approvals arrive.
 */
export const showPendingContent: boolean =
  process.env.NEXT_PUBLIC_SHOW_PENDING_CONTENT !== "false";

/** Canonical site URL for metadata, sitemap and JSON-LD. */
export const siteUrl: string =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
