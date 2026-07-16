/**
 * בניית גיאומטריית הבית מתוך התוכנית (plan.js).
 * הפלט: רשימות קופסאות לפי חומר (למיזוג ל-BufferGeometry אחת לכל חומר),
 * רשימת חלונות, ורשימת גופי התנגשות (AABB).
 */
import {
  EXT, WALL_T, GF_CEIL, SLAB_T, FF_Y, FF_CEIL, WALLS, DOORS, STAIR, PORCH, ROOMS,
} from './plan.js';

/** קופסה: מרכז + מידות. mat: שם חומר. collide: האם נכנסת לעולם ההתנגשויות */
function B(x, y, z, sx, sy, sz, mat, collide = true) {
  return { x, y, z, sx, sy, sz, mat, collide };
}

/** ממיר קטע לאורך קיר לקופסה בעולם */
function wallBox(wall, from, to, y0, y1, mat, collide = true) {
  const len = to - from, mid = (from + to) / 2, h = y1 - y0, cy = (y0 + y1) / 2;
  if (len <= 0.001 || h <= 0.001) return null;
  return wall.dir === 'x'
    ? B(mid, cy, wall.at, len, h, wall.t, mat, collide)
    : B(wall.at, cy, mid, wall.t, h, len, mat, collide);
}

export function buildHouse() {
  const boxes = [];
  const windows = []; // {wall, c, w, y0, y1} — לזיגוג ומסגרות
  const add = (b) => { if (b) boxes.push(b); };

  /* ---------- קירות ----------
   * חיתוך דו־ממדי: מפצלים את הקיר לפרוסות אנכיות בגבולות הפתחים, ובכל פרוסה
   * ממלאים את הרווחים שבין הפתחים לגובה. תומך גם בפתחים "מוערמים"
   * (למשל חלון קומה א' בדיוק מעל דלת הכניסה).
   */
  for (const wall of WALLS) {
    const mat = wall.ext ? 'extWall' : 'intWall';
    for (const o of wall.openings) if (o.kind === 'window') windows.push({ wall, ...o });
    const edges = new Set([wall.from, wall.to]);
    for (const o of wall.openings) {
      edges.add(Math.max(wall.from, o.c - o.w / 2));
      edges.add(Math.min(wall.to, o.c + o.w / 2));
    }
    const xs = [...edges].sort((a, b) => a - b);
    for (let i = 0; i < xs.length - 1; i++) {
      const a = xs[i], b = xs[i + 1];
      if (b - a < 0.004) continue;
      const mid = (a + b) / 2;
      // פתחים שחוצים את הפרוסה — ממוינים לפי גובה
      const holes = wall.openings
        .filter((o) => mid > o.c - o.w / 2 && mid < o.c + o.w / 2)
        .sort((p, q) => p.y0 - q.y0);
      let y = wall.y0;
      for (const h of holes) {
        add(wallBox(wall, a, b, y, Math.max(y, h.y0), mat));
        y = Math.max(y, h.y1);
      }
      add(wallBox(wall, a, b, y, wall.y1, mat));
    }
  }

  /* ---------- זיגוג ומסגרות חלונות ---------- */
  for (const w of windows) {
    const wall = w.wall, h = w.y1 - w.y0, cy = (w.y0 + w.y1) / 2;
    const paneT = 0.04, frameT = Math.min(wall.t + 0.06, 0.3), f = 0.07;
    const horiz = wall.dir === 'x';
    const px = horiz ? w.c : wall.at, pz = horiz ? wall.at : w.c;
    // זכוכית (עם התנגשות — אי אפשר לעבור דרך חלון)
    add(horiz ? B(px, cy, pz, w.w, h, paneT, 'glass') : B(px, cy, pz, paneT, h, w.w, 'glass'));
    // מסגרת: שני ניצבים + עליון + תחתון + אדן
    const sides = [[-(w.w - f) / 2, 0, f, h], [(w.w - f) / 2, 0, f, h], [0, (h - f) / 2, w.w, f], [0, -(h - f) / 2, w.w, f], [0, 0, f * 0.6, h]];
    for (const [du, dv, su, sv] of sides) {
      add(horiz
        ? B(px + du, cy + dv, pz, su, sv, frameT, 'frame', false)
        : B(px, cy + dv, pz + du, frameT, sv, su, 'frame', false));
    }
    if (wall.ext && w.y0 > 0.2) { // אדן חיצוני
      const out = wall.id === 'ext-n' || wall.id === 'ext-w' ? -1 : 1;
      add(horiz
        ? B(px, w.y0 - 0.04, pz + out * (wall.t / 2 + 0.06), w.w + 0.16, 0.08, 0.24, 'stone', false)
        : B(px + out * (wall.t / 2 + 0.06), w.y0 - 0.04, pz, 0.24, 0.08, w.w + 0.16, 'stone', false));
    }
  }

  /* ---------- רצפות, תקרות וגגות ביניים ---------- */
  const fp = EXT; // טביעת רגל
  const fpW = fp.maxX - fp.minX, fpD = fp.maxZ - fp.minZ, fpCX = (fp.minX + fp.maxX) / 2, fpCZ = (fp.minZ + fp.maxZ) / 2;
  // פלטת קרקע (מעט רחבה יותר — סוקל)
  add(B(fpCX, -0.11, fpCZ, fpW + 0.5, 0.22, fpD + 0.5, 'stone'));
  // מרפסת כניסה
  add(B((PORCH.x0 + PORCH.x1) / 2, -0.06, (PORCH.z0 + PORCH.z1) / 2, PORCH.x1 - PORCH.x0, 0.12, PORCH.z1 - PORCH.z0, 'stone'));
  // עמודי גגון כניסה + גגון
  add(B(-1.35, 1.3, 6.0, 0.16, 2.6, 0.16, 'woodDark'));
  add(B(1.35, 1.3, 6.0, 0.16, 2.6, 0.16, 'woodDark'));
  add(B(0, 2.72, 5.55, 3.4, 0.14, 2.0, 'roofFlat', false));

  // תקרת קומת קרקע = רצפת קומה א' (שני מלבנים, בלי פיר המדרגות)
  const slabY = (GF_CEIL + FF_Y) / 2;
  add(B((-3.3 + 6) / 2, slabY, 0, 9.3, SLAB_T, 9, 'slab'));
  add(B((-6 + -3.3) / 2, slabY, (0.8 + 4.5) / 2, 2.7, SLAB_T, 3.7, 'slab'));
  // תקרת קומה א'
  add(B(fpCX, FF_CEIL + SLAB_T / 2, fpCZ, fpW, SLAB_T, fpD, 'slab'));

  // רצפות בגמר לפי חדר (עץ / אריחים) — ללא התנגשות (דקורטיבי)
  const tileRooms = new Set(['wc', 'kitchen', 'ensuite', 'bath2']);
  for (const r of ROOMS) {
    if (r.id === 'stairs') continue;
    const y = (r.floor === 0 ? 0 : FF_Y) + 0.012;
    const mat = tileRooms.has(r.id) ? 'floorTile' : 'floorWood';
    add(B((r.rect.x0 + r.rect.x1) / 2, y, (r.rect.z0 + r.rect.z1) / 2,
      r.rect.x1 - r.rect.x0, 0.024, r.rect.z1 - r.rect.z0, mat, false));
  }
  // רצפת עץ לקומת הקרקע בפיר (מבואת המדרגות בלבד — x[-3.3..-1.3] כלול ב"stairs" בחדרֿים; נוסיף גמר)
  add(B(-2.3, 0.012, -1.45, 2.0, 0.024, 6.1, 'floorWood', false));
  add(B(-4.65, 0.012, 1.2, 2.7, 0.024, 0.8, 'floorWood', false));

  /* ---------- מדרגות ---------- */
  buildStairs(add);

  /* ---------- גג ---------- */
  buildRoof(add);

  return { boxes, windows };
}

function buildStairs(add) {
  const { run1, landing, run2 } = STAIR;
  const N = 8;
  // מהלך 1 (יורד בכיוון -Z מגובה 0 ל-1.525)
  for (let i = 0; i < N; i++) {
    const z0 = run1.zStart + (run1.zEnd - run1.zStart) * (i / N);
    const z1 = run1.zStart + (run1.zEnd - run1.zStart) * ((i + 1) / N);
    const h = run1.h0 + (run1.h1 - run1.h0) * ((i + 1) / N);
    add(B((run1.x0 + run1.x1) / 2, h - 0.025, (z0 + z1) / 2, run1.x1 - run1.x0, 0.05, Math.abs(z1 - z0) + 0.02, 'woodLight', false));
    add(B((run1.x0 + run1.x1) / 2, h - 0.12, (z0 + z1) / 2 - 0.02, run1.x1 - run1.x0 - 0.06, 0.14, Math.abs(z1 - z0) - 0.05, 'woodDark', false));
  }
  // פודסט
  add(B((landing.x0 + landing.x1) / 2, landing.h - 0.09, (landing.z0 + landing.z1) / 2,
    landing.x1 - landing.x0, 0.18, landing.z1 - landing.z0, 'woodLight', false));
  // מהלך 2 (עולה בכיוון +Z מ-1.525 ל-3.05)
  for (let i = 0; i < N; i++) {
    const z0 = run2.zStart + (run2.zEnd - run2.zStart) * (i / N);
    const z1 = run2.zStart + (run2.zEnd - run2.zStart) * ((i + 1) / N);
    const h = run2.h0 + (run2.h1 - run2.h0) * ((i + 1) / N);
    add(B((run2.x0 + run2.x1) / 2, h - 0.025, (z0 + z1) / 2, run2.x1 - run2.x0, 0.05, Math.abs(z1 - z0) + 0.02, 'woodLight', false));
    add(B((run2.x0 + run2.x1) / 2, h - 0.12, (z0 + z1) / 2 + 0.02, run2.x1 - run2.x0 - 0.06, 0.14, Math.abs(z1 - z0) - 0.05, 'woodDark', false));
  }

  /* חסימות מתחת למדרגות (מדורג, כדי לא לחסום את העולים) */
  const underRun = (run, dirSign) => {
    for (let s = 0; s < 4; s++) {
      const t0 = s / 4, t1 = (s + 1) / 4;
      const z0 = run.zStart + (run.zEnd - run.zStart) * t0;
      const z1 = run.zStart + (run.zEnd - run.zStart) * t1;
      const minH = run.h0 + (run.h1 - run.h0) * Math.min(t0, t1);
      const top = minH - 0.3;
      if (top < 0.3) continue;
      add(B((run.x0 + run.x1) / 2, top / 2, (z0 + z1) / 2, run.x1 - run.x0, top, Math.abs(z1 - z0), 'woodDark'));
    }
  };
  underRun(run1, -1);
  underRun(run2, 1);
  // מתחת לפודסט — ארון אחסון סגור
  add(B((landing.x0 + landing.x1) / 2, (landing.h - 0.18) / 2, (landing.z0 + landing.z1) / 2,
    landing.x1 - landing.x0, landing.h - 0.18, landing.z1 - landing.z0, 'woodDark'));

  /* מחיצת אמצע בין שני המהלכים */
  add(B(-4.65, (FF_Y + 0.9) / 2, (run1.zStart + run1.zEnd) / 2, 0.08, FF_Y + 0.9, Math.abs(run1.zStart - run1.zEnd), 'intWall'));

  /* מעקה לאורך הצד הפתוח (x=-3.3): קומת קרקע לאורך המהלך + שפת הגלריה למעלה */
  buildRailing(add, run1);
}

function buildRailing(add, run1) {
  // עמוד תחתון + מאחז משופע לאורך מהלך 1
  const railX = -3.3;
  const steps = 7;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const z = run1.zStart + (run1.zEnd - run1.zStart) * t;
    const h = run1.h0 + (run1.h1 - run1.h0) * t;
    add(B(railX, h + 0.48, z, 0.05, 0.96, 0.05, 'metal', false));
  }
  // מאחז יד משופע — קופסה מסובבת תיווצר בנפרד (כאן מקורב בשלושה מקטעים אופקיים)
  for (let s = 0; s < 4; s++) {
    const t0 = s / 4, t1 = (s + 1) / 4;
    const z0 = run1.zStart + (run1.zEnd - run1.zStart) * t0;
    const z1 = run1.zStart + (run1.zEnd - run1.zStart) * t1;
    const h = run1.h0 + (run1.h1 - run1.h0) * (t0 + t1) / 2 + 0.96;
    add(B(railX, h, (z0 + z1) / 2, 0.07, 0.06, Math.abs(z1 - z0) + 0.02, 'woodDark', false));
  }
  // מעקה הגלריה בקומה א' לאורך הפיר (x=-3.3, z[-4.5..0.8])
  const z0 = -4.5, z1 = 0.8;
  add(B(railX, FF_Y + 0.93, (z0 + z1) / 2, 0.07, 0.06, z1 - z0, 'woodDark', false));
  const n = Math.round((z1 - z0) / 0.33);
  for (let i = 0; i <= n; i++) {
    add(B(railX, FF_Y + 0.46, z0 + ((z1 - z0) * i) / n, 0.035, 0.9, 0.035, 'metal', false));
  }
  // מעקה קצר בשפת הפיר הצפונית (z=0.8, x[-4.65..-3.3])
  add(B(-3.975, FF_Y + 0.93, 0.8, 1.35, 0.06, 0.07, 'woodDark', false));
  for (let i = 0; i <= 4; i++) {
    add(B(-4.65 + (1.35 * i) / 4, FF_Y + 0.46, 0.8, 0.035, 0.9, 0.035, 'metal', false));
  }
  // גופי התנגשות בלתי-נראים למעקות (קופסאות מלאות)
  add({ x: railX, y: (FF_Y + 1.0) / 2, z: (run1.zStart + -4.5) / 2, sx: 0.1, sy: FF_Y + 1.0, sz: run1.zStart - -4.5, mat: null, collide: true });
  add({ x: -3.975, y: FF_Y + 0.5, z: 0.8, sx: 1.35, sy: 1.0, sz: 0.1, mat: null, collide: true });
}

function buildRoof(add) {
  // גג שטוח מודרני עם מעקה — מתאים לשפה האדריכלית ופשוט לחישוב
  const o = 0.55; // זיז
  add(B(0, FF_CEIL + SLAB_T + 0.12, 0, 12 + o * 2, 0.24, 9 + o * 2, 'roofFlat', false));
  // רצועת קופינג היקפית
  const y = FF_CEIL + SLAB_T + 0.42;
  add(B(0, y, 4.5 + o, 12 + o * 2, 0.42, 0.12, 'extWall', false));
  add(B(0, y, -4.5 - o, 12 + o * 2, 0.42, 0.12, 'extWall', false));
  add(B(6 + o, y, 0, 0.12, 0.42, 9 + o * 2, 'extWall', false));
  add(B(-6 - o, y, 0, 0.12, 0.42, 9 + o * 2, 'extWall', false));
  // מסתור מערכות
  add(B(-3.5, FF_CEIL + SLAB_T + 0.75, -2.0, 2.2, 1.0, 1.6, 'metal', false));
}
