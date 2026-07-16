/**
 * עולם התנגשויות: AABB סטטיים + פותר קפסולה (עיגול במישור XZ) עם החלקה לאורך קירות,
 * ודגימת גובה קרקע (רצפות, מדרגות, שטח חוץ).
 */
import { FLOOR_SURFACES, stairHeight, EXT } from '../house/plan.js';

export const PLAYER_RADIUS = 0.28;
export const PLAYER_HEIGHT = 1.85; // מרגליים עד קודקוד
export const STEP_UP = 0.45;       // גובה שאפשר "לטפס" עליו בהליכה (מדרגה)

export class CollisionWorld {
  constructor() {
    this.static = [];   // {minX,maxX,minY,maxY,minZ,maxZ}
    this.dynamic = new Map(); // id -> aabb (דלתות)
  }

  addBox(b) {
    this.static.push({
      minX: b.x - b.sx / 2, maxX: b.x + b.sx / 2,
      minY: b.y - b.sy / 2, maxY: b.y + b.sy / 2,
      minZ: b.z - b.sz / 2, maxZ: b.z + b.sz / 2,
    });
  }

  setDynamic(id, aabb) {
    if (aabb) this.dynamic.set(id, aabb);
    else this.dynamic.delete(id);
  }

  /** גובה הקרקע הגבוה ביותר שנגיש מרגליים בגובה feetY */
  groundHeight(x, z, feetY) {
    let best = 0; // שטח החוץ והקומה התחתונה במפלס 0
    for (const s of FLOOR_SURFACES) {
      if (x >= s.x0 && x <= s.x1 && z >= s.z0 && z <= s.z1) {
        if (s.h <= feetY + STEP_UP && s.h > best) best = s.h;
      }
    }
    const sh = stairHeight(x, z);
    if (sh !== null && sh <= feetY + STEP_UP && sh > best) best = sh;
    return best;
  }

  /**
   * פתרון תנועה אופקית: מזיז את המרכז (x,z) ודוחף אותו החוצה מכל AABB חוסם.
   * קופסה חוסמת רק אם היא חופפת אנכית לגוף מעל גובה המדרגה המותרת.
   */
  resolve(x, z, feetY) {
    const r = PLAYER_RADIUS;
    const head = feetY + PLAYER_HEIGHT;
    const blocked = (b) => b.minY < head - 0.05 && b.maxY > feetY + STEP_UP;
    for (let iter = 0; iter < 3; iter++) {
      let pushed = false;
      const test = (b) => {
        if (!blocked(b)) return;
        const cx = Math.max(b.minX, Math.min(x, b.maxX));
        const cz = Math.max(b.minZ, Math.min(z, b.maxZ));
        const dx = x - cx, dz = z - cz;
        const d2 = dx * dx + dz * dz;
        if (d2 >= r * r) return;
        if (d2 > 1e-9) {
          const d = Math.sqrt(d2), push = (r - d) / d;
          x += dx * push; z += dz * push;
        } else {
          // המרכז בתוך הקופסה — דחיפה דרך הפאה הקרובה
          const exits = [
            [b.maxX - x + r, 1, 0], [x - b.minX + r, -1, 0],
            [b.maxZ - z + r, 0, 1], [z - b.minZ + r, 0, -1],
          ].sort((a, c) => a[0] - c[0])[0];
          x += exits[1] * exits[0]; z += exits[2] * exits[0];
        }
        pushed = true;
      };
      for (const b of this.static) test(b);
      for (const b of this.dynamic.values()) test(b);
      if (!pushed) break;
    }
    return { x, z };
  }
}

/** גבול העולם — לא נותנים למשתמש לברוח מהמגרש */
export const WORLD_BOUND = { minX: -17, maxX: 17, minZ: -14, maxZ: 15.5 };

export function clampToWorld(x, z) {
  return {
    x: Math.min(WORLD_BOUND.maxX, Math.max(WORLD_BOUND.minX, x)),
    z: Math.min(WORLD_BOUND.maxZ, Math.max(WORLD_BOUND.minZ, z)),
  };
}

/** בדיקה אם נקודה בתוך טביעת הרגל של הבית (לניהול תאורה/מפה) */
export function insideHouse(x, z) {
  return x > EXT.minX && x < EXT.maxX && z > EXT.minZ && z < EXT.maxZ;
}
