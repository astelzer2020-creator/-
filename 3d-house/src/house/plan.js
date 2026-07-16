/**
 * תוכנית הבית — מקור אמת יחיד.
 * כל המידות במטרים. מערכת צירים: X מזרח-מערב, Z דרום-צפון (החזית בכיוון +Z), Y גובה.
 * מהקובץ הזה נגזרים: גיאומטריית הקירות, גופי ההתנגשות, תוכנית הקומה (מיני-מפה),
 * נקודות הסיור המודרך וגרף נקודות המעבר.
 */

export const EXT = { minX: -6, maxX: 6, minZ: -4.5, maxZ: 4.5 };
export const WALL_T = 0.25;   // קיר חוץ
export const INT_T = 0.12;    // קיר פנים
export const GF_CEIL = 2.9;   // גובה תקרת קומת קרקע
export const SLAB_T = 0.15;   // עובי תקרה/רצפה
export const FF_Y = GF_CEIL + SLAB_T; // 3.05 — מפלס רצפת קומה א'
export const FF_CEIL = FF_Y + 2.9;    // 5.95 — תקרת קומה א'
export const EYE = 1.68;      // גובה עיניים
export const DOOR_H = 2.1;

/* ---------- גרם המדרגות (שני מהלכים + פודסט) ---------- */
export const STAIR = {
  // חלל המדרגות: x[-6..-3.3], z[-4.5..1.0]
  run1: { x0: -4.65, x1: -3.3, zStart: 0.8, zEnd: -2.4, h0: 0, h1: FF_Y / 2 },   // יורד בכיוון -Z
  landing: { x0: -6, x1: -3.3, z0: -4.35, z1: -2.4, h: FF_Y / 2 },
  run2: { x0: -6, x1: -4.65, zStart: -2.4, zEnd: 0.8, h0: FF_Y / 2, h1: FF_Y }, // עולה בכיוון +Z
  voidRect: { x0: -6, x1: -3.3, z0: -4.5, z1: 0.8 }, // פתח בתקרת קומת הקרקע
};

/** גובה הקרקע על המדרגות (או null אם מחוץ להן) */
export function stairHeight(x, z) {
  const { run1, landing, run2 } = STAIR;
  if (x >= run1.x0 && x <= run1.x1 && z <= run1.zStart + 0.3 && z >= run1.zEnd) {
    const t = Math.min(1, Math.max(0, (run1.zStart - z) / (run1.zStart - run1.zEnd)));
    return run1.h0 + t * (run1.h1 - run1.h0);
  }
  if (x >= landing.x0 && x <= landing.x1 && z >= landing.z0 && z <= landing.z1) return landing.h;
  if (x >= run2.x0 && x <= run2.x1 && z >= run2.zStart && z <= run2.zEnd + 0.3) {
    const t = Math.min(1, Math.max(0, (z - run2.zStart) / (run2.zEnd - run2.zStart)));
    return run2.h0 + t * (run2.h1 - run2.h0);
  }
  return null;
}

/* ---------- חדרים (למיני-מפה, לתוויות ולסיור המודרך) ---------- */
export const ROOMS = [
  { id: 'hall',    name: 'מבואה',          floor: 0, rect: { x0: -1.3, x1: 1.3, z0: -3.1, z1: 4.5 }, poi: { x: 0, z: 2.6, yaw: 0.1 } },
  { id: 'living',  name: 'סלון',            floor: 0, rect: { x0: 1.3, x1: 6, z0: 0, z1: 4.5 },      poi: { x: 3.4, z: 1.6, yaw: -2.0 } },
  { id: 'kitchen', name: 'מטבח',            floor: 0, rect: { x0: 1.3, x1: 6, z0: -4.5, z1: 0 },     poi: { x: 3.2, z: -1.4, yaw: -0.28 } },
  { id: 'dining',  name: 'פינת אוכל',       floor: 0, rect: { x0: -6, x1: -1.3, z0: 1.6, z1: 4.5 },  poi: { x: -3.6, z: 2.2, yaw: Math.PI } },
  { id: 'wc',      name: 'שירותי אורחים',   floor: 0, rect: { x0: -1.3, x1: 1.3, z0: -4.5, z1: -3.1 }, poi: { x: 0, z: -3.7, yaw: 0 } },
  { id: 'stairs',  name: 'מדרגות',          floor: 0, rect: { x0: -6, x1: -1.3, z0: -4.5, z1: 1.6 }, poi: { x: -2.3, z: -0.6, yaw: Math.PI * 0.5 } },
  { id: 'corridor2', name: 'מסדרון עליון',  floor: 1, rect: { x0: -1.3, x1: 1.3, z0: -2.7, z1: 4.5 }, poi: { x: 0, z: -0.6, yaw: 0 } },
  { id: 'gallery', name: 'פינת משפחה',      floor: 1, rect: { x0: -3.3, x1: -1.3, z0: -4.5, z1: 1.0 }, poi: { x: -2.2, z: -1.6, yaw: 0.05 } },
  { id: 'master',  name: 'חדר שינה ראשי',   floor: 1, rect: { x0: 1.3, x1: 6, z0: -0.2, z1: 4.5 },   poi: { x: 2.9, z: 1.6, yaw: -0.6 } },
  { id: 'ensuite', name: 'רחצה הורים',      floor: 1, rect: { x0: 4.1, x1: 6, z0: 2.8, z1: 4.5 },    poi: { x: 4.9, z: 3.5, yaw: -2.05 } },
  { id: 'bed2',    name: 'חדר שינה 2',      floor: 1, rect: { x0: 1.3, x1: 6, z0: -4.5, z1: -0.5 },  poi: { x: 3.4, z: -2.4, yaw: -1.5 } },
  { id: 'bed3',    name: 'חדר שינה 3',      floor: 1, rect: { x0: -4.5, x1: -1.3, z0: 1.6, z1: 4.5 }, poi: { x: -2.9, z: 3.0, yaw: 2.3 } },
  { id: 'bath2',   name: 'חדר רחצה',        floor: 1, rect: { x0: -1.3, x1: 1.3, z0: -4.5, z1: -2.7 }, poi: { x: 0, z: -3.5, yaw: -0.5 } },
  { id: 'reading', name: 'פינת קריאה',      floor: 1, rect: { x0: -6, x1: -4.5, z0: 1.0, z1: 4.5 },  poi: { x: -5.2, z: 2.8, yaw: 1.25 } },
];

/* ---------- קירות ----------
 * dir 'x': הקיר נמתח לאורך ציר X במישור z=at. dir 'z': לאורך Z במישור x=at.
 * openings: {c: מרכז לאורך הקיר, w: רוחב, y0, y1, kind: 'door'|'window'|'open'}
 */
const win = (c, w, y0 = 0.9, y1 = 2.3) => ({ c, w, y0, y1, kind: 'window' });
const winF = (c, w, y0 = 3.95, y1 = 5.35) => ({ c, w, y0, y1, kind: 'window' });
const door = (c, w = 0.86) => ({ c, w, y0: 0, y1: DOOR_H, kind: 'door' });
const open = (c, w, y1 = 2.4) => ({ c, w, y0: 0, y1, kind: 'open' });
const openF = (c, w, y1 = FF_Y + 2.4) => ({ c, w, y0: FF_Y, y1, kind: 'open' });
const doorF = (c, w = 0.86) => ({ c, w, y0: FF_Y, y1: FF_Y + DOOR_H, kind: 'door' });

export const WALLS = [
  /* --- קירות חוץ (גובה מלא, שתי קומות) --- */
  { id: 'ext-s', dir: 'x', at: EXT.maxZ, from: EXT.minX, to: EXT.maxX, t: WALL_T, y0: 0, y1: FF_CEIL, ext: true,
    openings: [
      { c: 0, w: 1.12, y0: 0, y1: 2.25, kind: 'door' },        // דלת כניסה
      win(3.6, 1.8), win(-3.6, 1.8),
      winF(3.0, 1.6), winF(-2.9, 1.3), winF(0, 1.1), winF(-5.25, 1.0),
    ] },
  { id: 'ext-n', dir: 'x', at: EXT.minZ, from: EXT.minX, to: EXT.maxX, t: WALL_T, y0: 0, y1: FF_CEIL, ext: true,
    openings: [
      win(3.6, 2.0, 1.05, 2.3), win(0, 0.6, 1.6, 2.3),
      { c: -4.65, w: 1.5, y0: 2.3, y1: 4.4, kind: 'window' },  // חלון מעל פודסט המדרגות
      winF(3.6, 1.7), winF(0, 0.6, 4.6, 5.3), winF(-2.3, 1.2),
    ] },
  { id: 'ext-e', dir: 'z', at: EXT.maxX, from: EXT.minZ, to: EXT.maxZ, t: WALL_T, y0: 0, y1: FF_CEIL, ext: true,
    openings: [
      win(2.2, 1.8), win(-2.2, 1.6, 1.05, 2.3),
      winF(1.2, 1.6), winF(3.65, 0.8, 4.3, 5.2), winF(-2.4, 1.6),
    ] },
  { id: 'ext-w', dir: 'z', at: EXT.minX, from: EXT.minZ, to: EXT.maxZ, t: WALL_T, y0: 0, y1: FF_CEIL, ext: true,
    openings: [
      win(2.8, 1.8),
      { c: -1.0, w: 1.2, y0: 1.5, y1: 4.4, kind: 'window' },   // חלון גבוה בחלל המדרגות
      winF(2.8, 1.4),
    ] },

  /* --- קומת קרקע: קירות פנים (0..GF_CEIL) --- */
  // קיר מזרחי של המבואה — פתחים לסלון ולמטבח
  { id: 'hall-e', dir: 'z', at: 1.3, from: -4.5, to: 4.5, t: INT_T, y0: 0, y1: GF_CEIL,
    openings: [open(2.4, 1.8), open(-1.75, 1.5)] },
  // קיר מערבי של המבואה — פתח לפינת האוכל ופתח רחב למבואת המדרגות
  { id: 'hall-w', dir: 'z', at: -1.3, from: -4.5, to: 4.5, t: INT_T, y0: 0, y1: GF_CEIL,
    openings: [open(2.85, 1.7), open(-1.2, 3.2, 2.55)] },
  // שירותי אורחים
  { id: 'wc-front', dir: 'x', at: -3.1, from: -1.3, to: 1.3, t: INT_T, y0: 0, y1: GF_CEIL,
    openings: [door(-0.3)] },
  // הפרדה חלקית סלון/מטבח
  { id: 'liv-kit', dir: 'x', at: 0, from: 1.3, to: 6, t: INT_T, y0: 0, y1: GF_CEIL,
    openings: [open(4.35, 2.5)] },
  // קיר בין פינת האוכל לחלל המדרגות
  { id: 'din-stair', dir: 'x', at: 1.6, from: -6, to: -1.3, t: INT_T, y0: 0, y1: GF_CEIL, openings: [] },

  /* --- קומה א': קירות פנים (FF_Y..FF_CEIL) --- */
  // קיר מזרחי של המסדרון — דלתות לחדר ראשי ולחדר 2
  { id: 'cor2-e', dir: 'z', at: 1.3, from: -4.5, to: 4.5, t: INT_T, y0: FF_Y, y1: FF_CEIL,
    openings: [doorF(1.2), doorF(-1.5)] },
  // קיר מערבי של המסדרון — פתוח לגלריה, דלת לחדר 3 היא בקיר אחר
  { id: 'cor2-w', dir: 'z', at: -1.3, from: -4.5, to: 1.6, t: INT_T, y0: FF_Y, y1: FF_CEIL,
    openings: [openF(-1.0, 2.8, FF_Y + 2.55)] },
  // חדר רחצה משפחתי
  { id: 'bath2-front', dir: 'x', at: -2.7, from: -1.3, to: 1.3, t: INT_T, y0: FF_Y, y1: FF_CEIL,
    openings: [doorF(-0.3)] },
  // הפרדה בין חדר ראשי לחדר 2
  { id: 'mas-bed2', dir: 'x', at: -0.35, from: 1.3, to: 6, t: INT_T, y0: FF_Y, y1: FF_CEIL, openings: [] },
  // חדר רחצה הורים
  { id: 'ens-s', dir: 'x', at: 2.8, from: 4.1, to: 6, t: INT_T, y0: FF_Y, y1: FF_CEIL,
    openings: [doorF(4.72, 0.8)] },
  { id: 'ens-w', dir: 'z', at: 4.1, from: 2.8, to: 4.5, t: INT_T, y0: FF_Y, y1: FF_CEIL, openings: [] },
  // חדר שינה 3 — קיר דרומי עם דלת, קיר מערבי
  { id: 'bed3-s', dir: 'x', at: 1.6, from: -4.5, to: -1.3, t: INT_T, y0: FF_Y, y1: FF_CEIL,
    openings: [doorF(-2.4)] },
  { id: 'bed3-w', dir: 'z', at: -4.5, from: 1.6, to: 4.5, t: INT_T, y0: FF_Y, y1: FF_CEIL, openings: [] },
];

/* ---------- דלתות (כנפיים אינטראקטיביות) ----------
 * hinge: נקודת הציר; dir הקיר קובע את מישור הדלת.
 * swing: +1/-1 — לאיזה צד הכנף נפתחת (סביב ציר Y, יחסית לכיוון הקיר).
 */
export const DOORS = [
  { id: 'front',   name: 'דלת כניסה', wallDir: 'x', at: EXT.maxZ, c: 0, w: 1.12, y0: 0, h: 2.25, t: 0.09, main: true },
  { id: 'wc',      name: 'שירותי אורחים', wallDir: 'x', at: -3.1, c: -0.3, w: 0.86, y0: 0, h: DOOR_H, t: 0.05 },
  { id: 'master',  name: 'חדר שינה ראשי', wallDir: 'z', at: 1.3, c: 1.2, w: 0.86, y0: FF_Y, h: DOOR_H, t: 0.05 },
  { id: 'bed2',    name: 'חדר שינה 2', wallDir: 'z', at: 1.3, c: -1.5, w: 0.86, y0: FF_Y, h: DOOR_H, t: 0.05 },
  { id: 'bed3',    name: 'חדר שינה 3', wallDir: 'x', at: 1.6, c: -2.4, w: 0.86, y0: FF_Y, h: DOOR_H, t: 0.05 },
  { id: 'bath2',   name: 'חדר רחצה', wallDir: 'x', at: -2.7, c: -0.3, w: 0.86, y0: FF_Y, h: DOOR_H, t: 0.05 },
  { id: 'ensuite', name: 'רחצה הורים', wallDir: 'x', at: 2.8, c: 4.72, w: 0.8, y0: FF_Y, h: DOOR_H, t: 0.05 },
];

/* ---------- רצפות (משטחי הליכה) ----------
 * rects שבהם קיים משטח בגובה h. סדר הבדיקה: הגבוה ביותר שמתחת לרגליים+מדרגה.
 */
export const FLOOR_SURFACES = [
  // קומת קרקע — כל טביעת הרגל
  { x0: EXT.minX, x1: EXT.maxX, z0: EXT.minZ, z1: EXT.maxZ, h: 0 },
  // קומה א' — הכל פרט לפיר המדרגות
  { x0: -3.3, x1: 6, z0: -4.5, z1: 4.5, h: FF_Y },      // מזרחית לפיר
  { x0: -6, x1: -3.3, z0: 0.8, z1: 4.5, h: FF_Y },      // צפונית לפיר (אזור ההגעה)
];

/* ---------- מרפסת כניסה חיצונית ---------- */
export const PORCH = { x0: -1.5, x1: 1.5, z0: 4.5, z1: 6.2, h: 0 };

/* ---------- גרף נקודות מעבר לסיור המודרך ---------- */
export const NAV_NODES = {
  outside:   { x: 0, z: 9.5, y: 0 },
  porch:     { x: 0, z: 5.4, y: 0 },
  hallFront: { x: 0, z: 3.0, y: 0 },
  hallMid:   { x: 0, z: 0.0, y: 0 },
  hallBack:  { x: 0, z: -2.4, y: 0 },
  living:    { x: 3.4, z: 1.6, y: 0 },
  kitchen:   { x: 3.2, z: -1.4, y: 0 },
  dining:    { x: -3.6, z: 2.6, y: 0 },
  wc:        { x: 0, z: -3.7, y: 0 },
  lobby:     { x: -2.3, z: -0.6, y: 0 },
  stairBase: { x: -3.95, z: 1.15, y: 0 },
  stairMid:  { x: -4.65, z: -3.4, y: FF_Y / 2 },
  stairTop:  { x: -5.3, z: 1.2, y: FF_Y },
  landing2:  { x: -5.2, z: 2.0, y: FF_Y },
  pass2:     { x: -2.9, z: 1.3, y: FF_Y },
  cor2Front: { x: 0, z: 1.3, y: FF_Y },
  cor2Mid:   { x: 0, z: -0.6, y: FF_Y },
  cor2Back:  { x: 0, z: -2.2, y: FF_Y },
  gallery:   { x: -2.2, z: -2.2, y: FF_Y },
  master:    { x: 2.9, z: 1.6, y: FF_Y },
  ensuite:   { x: 4.9, z: 3.5, y: FF_Y },
  bed2:      { x: 3.4, z: -2.4, y: FF_Y },
  bed3:      { x: -2.9, z: 3.0, y: FF_Y },
  bath2:     { x: 0, z: -3.5, y: FF_Y },
  reading:   { x: -5.2, z: 2.8, y: FF_Y },
};

export const NAV_EDGES = [
  ['outside', 'porch'], ['porch', 'hallFront'],
  ['hallFront', 'hallMid'], ['hallMid', 'hallBack'],
  ['hallFront', 'living'], ['hallMid', 'kitchen'], ['hallFront', 'dining'],
  ['hallBack', 'wc'], ['hallMid', 'lobby'], ['lobby', 'stairBase'],
  ['stairBase', 'stairMid'], ['stairMid', 'stairTop'], ['stairTop', 'landing2'],
  ['landing2', 'reading'], ['landing2', 'pass2'], ['pass2', 'cor2Front'], ['pass2', 'bed3'],
  ['cor2Front', 'cor2Mid'], ['cor2Mid', 'cor2Back'],
  ['cor2Front', 'master'], ['master', 'ensuite'],
  ['cor2Mid', 'bed2'], ['cor2Back', 'bath2'], ['cor2Back', 'gallery'],
];

/** POI של חדר → מזהה צומת בגרף */
export const ROOM_TO_NODE = {
  hall: 'hallFront', living: 'living', kitchen: 'kitchen', dining: 'dining', wc: 'wc',
  stairs: 'lobby', corridor2: 'cor2Mid', gallery: 'gallery', master: 'master',
  ensuite: 'ensuite', bed2: 'bed2', bed3: 'bed3', bath2: 'bath2', reading: 'reading',
};

/* ---------- נקודות מידע ---------- */
export const INFO_POINTS = [
  { id: 'entry', pos: [1.0, 1.5, 3.8], title: 'וילה ברוש', text: 'בית מגורים דו־קומתי בשטח בנוי של כ־210 מ"ר. שלד בטון, חיפוי אבן וטיח מינרלי, נגרות אלון טבעי.' },
  { id: 'living', pos: [4.7, 1.5, 3.2], title: 'הסלון', text: 'סלון בגובה 2.9 מ׳ עם חלונות דרומיים רחבים, רצפת אלון מולבן וספת פינה תפורה לפי מידה.' },
  { id: 'kitchen', pos: [5.0, 1.4, -2.0], title: 'המטבח', text: 'מטבח בסגנון נורדי עם אי עבודה מאבן קיסר, ארונות פורניר אגוז וגימור מט נטול טביעות אצבע.' },
  { id: 'stairs', pos: [-3.6, 1.6, 0.4], title: 'גרם המדרגות', text: 'מדרגות אלון על שלד פלדה סמוי, 16 מדרגות בשני מהלכים עם פודסט וחלון תאורה כפול.' },
  { id: 'master', pos: [4.2, FF_Y + 1.5, 1.0], title: 'חדר השינה הראשי', text: 'סוויטת הורים עם חדר רחצה צמוד, ארון קיר לכל אורך הקיר הדרומי וחלון פינתי לנוף הגן.' },
  { id: 'garden', pos: [3.2, 1.4, 7.2], title: 'הגן', text: 'גינה היקפית של 380 מ"ר עם השקיה חכמה, עצי זית וברוש, ושביל בטון אדריכלי מוחלק.' },
];
