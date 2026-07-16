/**
 * בקרי מגע: ג'ויסטיק וירטואלי (שמאל), גרירת מבט (ימין), כפתור אינטראקציה.
 */
import { useRef, useEffect } from 'react';
import { input } from '../utils/input.js';
import { useTourStore } from '../stores/tourStore.js';
import { INFO_POINTS } from '../house/plan.js';
import { sounds } from '../utils/audio.js';

const JOY_RADIUS = 52;
const LOOK_SENS = 0.0052;

export default function MobileControls() {
  const zoneL = useRef();
  const zoneR = useRef();
  const base = useRef();
  const thumb = useRef();
  const nearDoor = useTourStore((s) => s.nearDoor);
  const nearInfo = useTourStore((s) => s.nearInfo);
  const doors = useTourStore((s) => s.doors);

  /* ג'ויסטיק — צד שמאל */
  useEffect(() => {
    const el = zoneL.current;
    let id = null, ox = 0, oy = 0;
    const setThumb = (dx, dy) => {
      if (thumb.current) thumb.current.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    const start = (e) => {
      const t = e.changedTouches[0];
      id = t.identifier; ox = t.clientX; oy = t.clientY;
      if (base.current) {
        base.current.style.display = 'block';
        base.current.style.left = `${ox - JOY_RADIUS}px`;
        base.current.style.top = `${oy - JOY_RADIUS}px`;
      }
      e.preventDefault();
    };
    const move = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier !== id) continue;
        let dx = t.clientX - ox, dy = t.clientY - oy;
        const d = Math.hypot(dx, dy);
        if (d > JOY_RADIUS) { dx *= JOY_RADIUS / d; dy *= JOY_RADIUS / d; }
        setThumb(dx, dy);
        input.forward = -dy / JOY_RADIUS;
        input.strafe = dx / JOY_RADIUS;
        input.run = d > JOY_RADIUS * 0.92;
        e.preventDefault();
      }
    };
    const end = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier !== id) continue;
        id = null;
        input.forward = 0; input.strafe = 0; input.run = false;
        setThumb(0, 0);
        if (base.current) base.current.style.display = 'none';
      }
    };
    el.addEventListener('touchstart', start, { passive: false });
    el.addEventListener('touchmove', move, { passive: false });
    el.addEventListener('touchend', end);
    el.addEventListener('touchcancel', end);
    return () => {
      el.removeEventListener('touchstart', start);
      el.removeEventListener('touchmove', move);
      el.removeEventListener('touchend', end);
      el.removeEventListener('touchcancel', end);
      input.forward = 0; input.strafe = 0; input.run = false;
    };
  }, []);

  /* מבט — צד ימין */
  useEffect(() => {
    const el = zoneR.current;
    let id = null, lx = 0, ly = 0;
    const start = (e) => {
      const t = e.changedTouches[0];
      id = t.identifier; lx = t.clientX; ly = t.clientY;
      e.preventDefault();
    };
    const move = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier !== id) continue;
        input.lookX -= (t.clientX - lx) * LOOK_SENS;
        input.lookY -= (t.clientY - ly) * LOOK_SENS;
        lx = t.clientX; ly = t.clientY;
        e.preventDefault();
      }
    };
    const end = (e) => {
      for (const t of e.changedTouches) if (t.identifier === id) id = null;
    };
    el.addEventListener('touchstart', start, { passive: false });
    el.addEventListener('touchmove', move, { passive: false });
    el.addEventListener('touchend', end);
    el.addEventListener('touchcancel', end);
    return () => {
      el.removeEventListener('touchstart', start);
      el.removeEventListener('touchmove', move);
      el.removeEventListener('touchend', end);
      el.removeEventListener('touchcancel', end);
    };
  }, []);

  const interactLabel = nearDoor
    ? (doors[nearDoor]?.open ? 'סגור דלת' : 'פתח דלת')
    : nearInfo ? 'מידע' : null;

  return (
    <>
      <div ref={zoneL} className="touch-zone left" aria-hidden="true" />
      <div ref={zoneR} className="touch-zone right" aria-hidden="true" />
      <div ref={base} className="joy-base" aria-hidden="true">
        <div ref={thumb} className="joy-thumb" />
      </div>
      {interactLabel && (
        <button
          type="button"
          className="ui-btn interact-btn"
          aria-label={interactLabel}
          onClick={() => {
            sounds.click();
            const s = useTourStore.getState();
            if (s.nearDoor) s.toggleDoor(s.nearDoor);
            else if (s.nearInfo) s.setInfoPoint(INFO_POINTS.find((p) => p.id === s.nearInfo));
          }}
        >
          {interactLabel}
        </button>
      )}
    </>
  );
}
