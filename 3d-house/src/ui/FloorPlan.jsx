/**
 * תוכנית קומה דו־ממדית (Canvas) — חדרים, קירות, מדרגות, מיקום המשתמש וכיוון המבט.
 * מפה דו־ממדית זולה — בלי רינדור סצנה נוספת.
 */
import { useRef, useEffect } from 'react';
import { ROOMS, WALLS, STAIR, EXT, GF_CEIL, FF_Y } from '../house/plan.js';
import { useTourStore } from '../stores/tourStore.js';

const SCALE = 9;               // פיקסלים למטר
const PAD = 10;
const W = Math.round((EXT.maxX - EXT.minX) * SCALE + PAD * 2);
const H = Math.round((EXT.maxZ - EXT.minZ) * SCALE + PAD * 2);

const mx = (x) => PAD + (x - EXT.minX) * SCALE;
const mz = (z) => PAD + (z - EXT.minZ) * SCALE;

function drawFloor(ctx, floor) {
  ctx.clearRect(0, 0, W, H);
  // רקע הבית
  ctx.fillStyle = 'rgba(238,235,228,0.92)';
  ctx.fillRect(mx(EXT.minX), mz(EXT.minZ), (EXT.maxX - EXT.minX) * SCALE, (EXT.maxZ - EXT.minZ) * SCALE);

  // חדרים
  for (const r of ROOMS) {
    if (r.floor !== floor) continue;
    ctx.fillStyle = 'rgba(196,206,196,0.35)';
    ctx.fillRect(mx(r.rect.x0), mz(r.rect.z0), (r.rect.x1 - r.rect.x0) * SCALE, (r.rect.z1 - r.rect.z0) * SCALE);
  }

  // פיר המדרגות
  const v = STAIR.voidRect;
  ctx.fillStyle = floor === 1 ? 'rgba(90,100,110,0.25)' : 'rgba(150,140,120,0.3)';
  ctx.fillRect(mx(v.x0), mz(v.z0), (v.x1 - v.x0) * SCALE, (v.z1 - v.z0) * SCALE);
  // קווי מדרגות
  ctx.strokeStyle = 'rgba(80,80,80,0.5)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 8; i++) {
    const z = STAIR.run1.zStart + ((STAIR.run1.zEnd - STAIR.run1.zStart) * i) / 8;
    ctx.beginPath();
    ctx.moveTo(mx(STAIR.run1.x0), mz(z));
    ctx.lineTo(mx(STAIR.run1.x1), mz(z));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(mx(STAIR.run2.x0), mz(z));
    ctx.lineTo(mx(STAIR.run2.x1), mz(z));
    ctx.stroke();
  }

  // קירות
  ctx.strokeStyle = '#2e3238';
  for (const w of WALLS) {
    const inFloor = floor === 0 ? w.y0 < GF_CEIL - 0.1 : w.y1 > FF_Y + 0.1;
    if (!inFloor) continue;
    ctx.lineWidth = w.ext ? 3 : 1.6;
    const segs = [];
    let cursor = w.from;
    // פתחים ששייכים לקומה המוצגת (לפי גובה תחתית הפתח)
    const relevant = [...w.openings]
      .filter((o) => (floor === 0 ? o.y0 < 2.4 : o.y0 >= FF_Y - 0.5))
      .sort((a, b) => a.c - b.c);
    for (const o of relevant) {
      segs.push([cursor, o.c - o.w / 2]);
      cursor = o.c + o.w / 2;
    }
    segs.push([cursor, w.to]);
    for (const [a, b] of segs) {
      if (b - a < 0.05) continue;
      ctx.beginPath();
      if (w.dir === 'x') {
        ctx.moveTo(mx(a), mz(w.at));
        ctx.lineTo(mx(b), mz(w.at));
      } else {
        ctx.moveTo(mx(w.at), mz(a));
        ctx.lineTo(mx(w.at), mz(b));
      }
      ctx.stroke();
    }
  }
}

export default function FloorPlan() {
  const bgRef = useRef();
  const fgRef = useRef();
  const floorRef = useRef(-1);
  const labelRef = useRef();

  useEffect(() => {
    const bg = bgRef.current.getContext('2d');
    const fg = fgRef.current.getContext('2d');
    let raf;
    let acc = 0, last = performance.now();
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      acc += now - last; last = now;
      if (acc < 66) return; // ~15fps מספיק למפה
      acc = 0;
      const { player } = useTourStore.getState();
      if (player.floor !== floorRef.current) {
        floorRef.current = player.floor;
        drawFloor(bg, player.floor);
        if (labelRef.current) labelRef.current.textContent = player.floor === 0 ? 'קומת קרקע' : 'קומה עליונה';
      }
      fg.clearRect(0, 0, W, H);
      // המשתמש: חץ כיוון
      const px = mx(player.x), pz = mz(player.z);
      const yaw = player.yaw;
      const dx = -Math.sin(yaw), dz = -Math.cos(yaw);
      fg.save();
      fg.translate(px, pz);
      fg.rotate(Math.atan2(dx, -dz));
      fg.fillStyle = '#2f7bd6';
      fg.beginPath();
      fg.moveTo(0, -7);
      fg.lineTo(4.6, 4.5);
      fg.lineTo(0, 2);
      fg.lineTo(-4.6, 4.5);
      fg.closePath();
      fg.fill();
      fg.restore();
      fg.strokeStyle = 'rgba(47,123,214,0.5)';
      fg.beginPath();
      fg.arc(px, pz, 8.5, 0, Math.PI * 2);
      fg.stroke();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="floorplan" aria-label="תוכנית קומה">
      <div className="floorplan-title" ref={labelRef}>קומת קרקע</div>
      <div className="floorplan-canvas" style={{ width: W, height: H }}>
        <canvas ref={bgRef} width={W} height={H} />
        <canvas ref={fgRef} width={W} height={H} />
      </div>
    </div>
  );
}
