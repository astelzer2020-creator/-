/**
 * Hebrew i18n resources for the pilot journey surfaces (login → projects →
 * scenario form → results). All user-facing strings go through these keys
 * (docs/CODING_STANDARDS.md rule 5) — no hard-coded Hebrew in components.
 */
export const he = {
  "nav.projects": "פרויקטים",
  "nav.scenarios": "תרחישים",
  "nav.reports": "דוחות",
  "nav.logout": "התנתקות",

  "auth.login.title": "התחברות",
  "auth.login.email": "אימייל",
  "auth.login.password": "סיסמה",
  "auth.login.submit": "התחברות",
  "auth.login.invalidCredentials": "אימייל או סיסמה שגויים",

  "projects.title": "פרויקטים",
  "projects.new": "פרויקט חדש",
  "projects.import": "ייבוא קובץ תב״ע",
  "projects.fields.name": "שם הפרויקט",
  "projects.fields.caseNumber": "מספר תיק",
  "projects.fields.address": "כתובת",
  "projects.fields.city": "עיר",
  "projects.fields.neighborhood": "שכונה",
  "projects.fields.planType": "סוג תוכנית",
  "projects.fields.status": "סטטוס",
  "projects.fields.existingUnits": "יח״ד קיים",
  "projects.fields.proposedUnits": "יח״ד מוצע",
  "projects.fields.existingFloors": "קומות קיים",
  "projects.fields.proposedFloors": "קומות מוצע",
  "projects.fields.lotArea": "שטח מגרש (מ״ר)",
  "projects.empty": "אין עדיין פרויקטים. ייבאו קובץ תב״ע או צרו פרויקט חדש.",

  "scenario.form.title": "הגדרת תרחיש",
  "scenario.form.name": "שם התרחיש",
  "scenario.form.apartmentMix": "תמהיל דירות",
  "scenario.form.mixLabel": "סוג דירה",
  "scenario.form.units": "מספר יח״ד",
  "scenario.form.areaSqm": "שטח ממוצע (מ״ר)",
  "scenario.form.salePricePerSqm": "מחיר מכירה (₪ למ״ר)",
  "scenario.form.costItems": "סעיפי עלות",
  "scenario.form.costLabel": "סעיף",
  "scenario.form.costAmount": "סכום (₪)",
  "scenario.form.discountRate": "שיעור היוון (שבר עשרוני, לדוגמה 0.07)",
  "scenario.form.save": "שמירת תרחיש",
  "scenario.form.simulate": "הרצת סימולציה",

  "results.title": "תוצאות היתכנות",
  "results.irr": "שיעור תשואה פנימי (IRR)",
  "results.irrUndefined": "לא קיים IRR לתרחיש זה",
  "results.npv": "ערך נוכחי נקי (NPV)",
  "results.profit": "רווח יזמי",
  "results.roiOnCost": "תשואה על העלות",
  "results.paybackYears": "תקופת החזר (שנים)",
  "results.paybackNever": "אין החזר בתקופת התחזית",
  "results.sensitivity": "ניתוח רגישות",
  "results.sensitivity.priceAxis": "שינוי מחיר מכירה",
  "results.sensitivity.costAxis": "שינוי עלות בנייה",

  "states.loading": "טוען…",
  "states.empty": "אין נתונים להצגה",
  "states.error": "אירעה שגיאה. נסו שוב.",
  "states.retry": "ניסיון חוזר",
  "states.analyticsUnavailable": "שירות החישוב אינו זמין כעת. נסו שוב בעוד רגע.",

  "validation.required": "שדה חובה",
  "validation.invalidNumber": "יש להזין מספר תקין",
  "validation.positiveNumber": "יש להזין מספר גדול מאפס",
  "validation.invalidEmail": "כתובת אימייל לא תקינה",
  "validation.passwordLength": "הסיסמה חייבת להכיל לפחות 8 תווים",
  "validation.rateFraction": "שיעור ההיוון חייב להיות שבר עשרוני בין 0 ל‑1",
} as const;

/** Type-safe union of every i18n key. `en.ts` must mirror it exactly. */
export type I18nKey = keyof typeof he;
