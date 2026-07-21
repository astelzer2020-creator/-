/**
 * THE single taba (תב"ע) column mapping: Hebrew file header → canonical English field.
 *
 * This table supersedes the three inconsistent legacy copies
 * (`backend/node/routes/import.js`, `frontend/src/pages/DataImport.jsx`,
 * `mobile/src/screens/ImportScreen.jsx` — CODEBASE_AUDIT finding) and is their superset.
 * Legacy field names `landArea`, `buildCost`, `salePrice` are renamed here to the
 * canonical glossary names `lotArea`, `buildCostPerSqm`, `salePricePerSqm`
 * (docs/CODING_STANDARDS.md — the glossary in packages/shared is the source of truth).
 *
 * Keys are stored in NORMALIZED form (see {@link normalizeTabaHeader}): gershayim and
 * curly quotes are canonicalized to ASCII `"` — never removed.
 */
export const TABA_COLUMN_MAP = {
  "מספר תיק": "caseNumber",
  כתובת: "address",
  עיר: "city",
  שכונה: "neighborhood",
  גוש: "block",
  חלקה: "parcel",
  "סוג בניין": "buildingType",
  "שנת בנייה": "buildYear",
  "קומות קיים": "existingFloors",
  "קומות מוצע": "proposedFloors",
  'יח"ד קיים': "existingUnits",
  'יח"ד מוצע': "proposedUnits",
  "שטח מגרש": "lotArea",
  // Legacy synonym used by all three prototype copies and the sample CSV.
  "שטח קרקע": "lotArea",
  "שווי קרקע": "landValue",
  "עלות בנייה": "buildCostPerSqm",
  "מחיר מכירה": "salePricePerSqm",
  "סוג תוכנית": "planType",
  סטטוס: "status",
} as const satisfies Record<string, string>;

/** A Hebrew header (normalized form) recognized by the taba import mapping. */
export type HebrewTabaHeader = keyof typeof TABA_COLUMN_MAP;

/** A canonical English field name produced by the taba import mapping. */
export type TabaField = (typeof TABA_COLUMN_MAP)[HebrewTabaHeader];

/**
 * Normalizes a raw file header for mapping lookup.
 *
 * - Strips a leading UTF-8 BOM and trims/collapses whitespace.
 * - Canonicalizes Hebrew gershayim (U+05F4) and curly double quotes to ASCII `"`,
 *   and geresh (U+05F3) / curly apostrophes to ASCII `'`.
 *
 * The quote character is PRESERVED, never stripped: the legacy mobile importer
 * deleted `"` from headers (`mobile/src/screens/ImportScreen.jsx:23`,
 * CODEBASE_AUDIT), which broke the יח"ד columns — unit counts were silently
 * dropped on import. Stripping gershayim is therefore forbidden here.
 */
export function normalizeTabaHeader(raw: string): string {
  return raw
    .replace(/^\uFEFF/, "")
    .replace(/[״“”]/g, '"')
    .replace(/[׳‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Maps a raw Hebrew header to its canonical English field, or `null` when the
 * header is not part of the taba glossary (callers surface unknown columns to
 * the user — never silently drop them).
 */
export function mapTabaHeader(raw: string): TabaField | null {
  const lookup: Record<string, TabaField> = TABA_COLUMN_MAP;
  return lookup[normalizeTabaHeader(raw)] ?? null;
}
