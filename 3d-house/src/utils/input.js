/**
 * מצב קלט ושחקן משותף (מחוץ ל-React — נקרא בכל פריים בלי רינדורים מיותרים).
 */
export const input = {
  forward: 0,   // -1..1 (מקלדת או ג'ויסטיק)
  strafe: 0,
  lookX: 0,     // דלתא סיבוב שנצברה מהעכבר/מגע (נצרכת בכל פריים)
  lookY: 0,
  run: false,
  interact: false, // נלחץ הפעם (נצרך פעם אחת)
};

export const playerState = {
  x: 0, y: 0, z: 9.5, yaw: 0, pitch: 0, feet: 0,
};

export function consumeLook() {
  const dx = input.lookX, dy = input.lookY;
  input.lookX = 0; input.lookY = 0;
  return [dx, dy];
}

export function consumeInteract() {
  const v = input.interact;
  input.interact = false;
  return v;
}
