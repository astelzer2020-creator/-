/**
 * ניהול מצב מרכזי של הסיור — מצב תצוגה, יום/לילה, דלתות, איכות, מיקום המשתמש.
 */
import { create } from 'zustand';
import { DOORS, EYE } from '../house/plan.js';
import { buildPathToRoom } from '../utils/cameraPaths.js';
import { playerState } from '../utils/input.js';

let autopilotSeq = 0;

export const MODES = {
  EXTERIOR: 'exterior', // תצוגת Orbit חיצונית
  WALK: 'walk',         // סיור חופשי בגוף ראשון
};

const doorState = {};
for (const d of DOORS) doorState[d.id] = { open: false, angle: 0 };

export const useTourStore = create((set, get) => ({
  mode: MODES.EXTERIOR,
  night: false,
  muted: false,
  quality: 'auto',            // 'low' | 'high' | 'auto'
  showMap: true,
  showHelp: false,
  seenHelp: false,
  transition: null,           // 'enter' — אנימציית מעבר לתחילת הסיור
  pointerLocked: false,
  pendingGuided: null,        // חדר יעד שממתין לסיום מעבר הכניסה
  autopilot: null,            // {id, points: [[x,y,z]..], yaw, name} — טיסה מודרכת
  guidedOpen: false,          // חלונית בחירת חדר
  infoPoint: null,            // נקודת מידע פתוחה
  doors: doorState,
  nearDoor: null,             // id הדלת שאפשר להפעיל כעת
  nearInfo: null,
  // מיקום/מבט עדכניים (לצורך המיני-מפה) — מתעדכן בקצב נמוך
  player: { x: 0, z: 9.5, y: 0, yaw: 0, floor: 0 },

  startTour: () => set({ transition: 'enter', guidedOpen: false, infoPoint: null }),
  finishEnter: () => set({ mode: MODES.WALK, transition: null }),
  /** בקשת סיור מודרך לחדר — כולל כניסה אוטומטית אם אנחנו עדיין בחוץ */
  requestGuided: (roomId) => {
    const s = get();
    if (s.mode === MODES.EXTERIOR) {
      set({ transition: 'enter', pendingGuided: roomId, guidedOpen: false, infoPoint: null });
    } else {
      s.startGuidedTo(roomId);
    }
  },
  startGuidedTo: (roomId) => {
    const path = buildPathToRoom(roomId, { x: playerState.x, z: playerState.z, feet: playerState.feet });
    if (!path) return;
    set((s) => {
      // פתיחת הדלתות שהמסלול חוצה, כדי שהמצלמה לא תעבור דרך דלת סגורה
      const doors = { ...s.doors };
      for (const id of path.doors) doors[id] = { ...doors[id], open: true };
      return { autopilot: { id: ++autopilotSeq, ...path }, doors, pendingGuided: null, guidedOpen: false, infoPoint: null };
    });
  },
  exitToExterior: () => set({ mode: MODES.EXTERIOR, transition: null, autopilot: null, guidedOpen: false, infoPoint: null, nearDoor: null, nearInfo: null }),
  setNight: (night) => set({ night }),
  toggleNight: () => set((s) => ({ night: !s.night })),
  toggleMuted: () => set((s) => ({ muted: !s.muted })),
  setQuality: (quality) => set({ quality }),
  toggleMap: () => set((s) => ({ showMap: !s.showMap })),
  setShowHelp: (showHelp) => set((s) => ({ showHelp, seenHelp: s.seenHelp || !showHelp })),
  setGuidedOpen: (guidedOpen) => set({ guidedOpen }),
  setAutopilot: (autopilot) => set({ autopilot, guidedOpen: false }),
  setInfoPoint: (infoPoint) => set({ infoPoint }),
  setNearDoor: (nearDoor) => { if (get().nearDoor !== nearDoor) set({ nearDoor }); },
  setNearInfo: (nearInfo) => { if (get().nearInfo !== nearInfo) set({ nearInfo }); },
  setDoor: (id, open) => set((s) => ({ doors: { ...s.doors, [id]: { ...s.doors[id], open } } })),
  toggleDoor: (id) => set((s) => ({ doors: { ...s.doors, [id]: { ...s.doors[id], open: !s.doors[id].open } } })),
  setPlayer: (player) => set({ player }),
  /** איפוס מיקום — חזרה לתחילת השביל */
  resetPosition: () => {
    playerState.x = WALK_START.x;
    playerState.z = WALK_START.z;
    playerState.feet = 0;
    playerState.yaw = WALK_START.yaw;
    playerState.pitch = 0;
    set({ autopilot: null, infoPoint: null });
  },
}));

/** מיקום ההתחלה של ההליכה (על השביל, מול הדלת) */
/* מוסכמה: yaw=0 מביט לכיוון -Z (אל הבית מהשביל); קדימה = (-sin(yaw), -cos(yaw)) */
export const WALK_START = { x: 0, y: EYE, z: 8.6, yaw: 0 };
