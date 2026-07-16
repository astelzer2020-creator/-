/**
 * חישוב מסלול מצלמה בטוח לסיור המודרך — BFS על גרף נקודות המעבר של הבית,
 * כך שהמצלמה עוברת דרך פתחים ומדרגות ולא דרך קירות.
 */
import { NAV_NODES, NAV_EDGES, ROOM_TO_NODE, ROOMS, DOORS, EYE, FF_Y } from '../house/plan.js';

const adj = new Map();
for (const key of Object.keys(NAV_NODES)) adj.set(key, []);
for (const [a, b] of NAV_EDGES) {
  adj.get(a).push(b);
  adj.get(b).push(a);
}

function nearestNode(x, z, feet) {
  let best = null, bestD = Infinity;
  for (const [id, n] of Object.entries(NAV_NODES)) {
    if (Math.abs(n.y - feet) > 1.7) continue; // צומת בקומה אחרת
    const d = (n.x - x) ** 2 + (n.z - z) ** 2;
    if (d < bestD) { bestD = d; best = id; }
  }
  return best;
}

function bfs(from, to) {
  if (from === to) return [from];
  const prev = new Map([[from, null]]);
  const q = [from];
  while (q.length) {
    const cur = q.shift();
    for (const nb of adj.get(cur)) {
      if (prev.has(nb)) continue;
      prev.set(nb, cur);
      if (nb === to) {
        const path = [nb];
        let p = cur;
        while (p) { path.unshift(p); p = prev.get(p); }
        return path;
      }
      q.push(nb);
    }
  }
  return [from, to]; // לא אמור לקרות — הגרף קשיר
}

/**
 * בונה מסלול מהמיקום הנוכחי אל חדר יעד.
 * מחזיר {points: [[x,y,z]...], yaw, name} — y בגובה עיניים.
 */
export function buildPathToRoom(roomId, from) {
  const room = ROOMS.find((r) => r.id === roomId);
  if (!room) return null;
  const start = nearestNode(from.x, from.z, from.feet);
  const goal = ROOM_TO_NODE[roomId];
  const nodePath = bfs(start, goal);
  const points = [[from.x, from.feet + EYE, from.z]];
  for (const id of nodePath) {
    const n = NAV_NODES[id];
    points.push([n.x, n.y + EYE, n.z]);
  }
  const floorY = room.floor === 0 ? 0 : FF_Y;
  points.push([room.poi.x, floorY + EYE, room.poi.z]);
  // ניקוי נקודות צמודות מדי (מונע פיתולים)
  const clean = [points[0]];
  for (const p of points.slice(1)) {
    const last = clean[clean.length - 1];
    if ((p[0] - last[0]) ** 2 + (p[1] - last[1]) ** 2 + (p[2] - last[2]) ** 2 > 0.36) clean.push(p);
  }
  if (clean.length < 2) clean.push(points[points.length - 1]);
  return { points: clean, yaw: room.poi.yaw, name: room.name, roomId, doors: doorsOnPath(clean) };
}

/** מרחק נקודה מקטע במישור XZ */
function distToSeg(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const len2 = dx * dx + dz * dz || 1e-9;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / len2));
  const cx = ax + dx * t, cz = az + dz * t;
  return Math.hypot(px - cx, pz - cz);
}

/** דלתות שהמסלול חוצה — ייפתחו אוטומטית לפני הטיסה */
function doorsOnPath(points) {
  const ids = [];
  for (const d of DOORS) {
    const cx = d.wallDir === 'x' ? d.c : d.at;
    const cz = d.wallDir === 'x' ? d.at : d.c;
    const cy = d.y0 + EYE;
    for (let i = 0; i < points.length - 1; i++) {
      const [ax, ay, az] = points[i];
      const [bx, by, bz] = points[i + 1];
      if (Math.abs((ay + by) / 2 - cy) > 1.8) continue;
      if (distToSeg(cx, cz, ax, az, bx, bz) < 1.0) { ids.push(d.id); break; }
    }
  }
  return ids;
}
