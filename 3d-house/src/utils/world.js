/**
 * עולם ההתנגשויות המשותף — נבנה פעם אחת מנתוני התוכנית.
 */
import { CollisionWorld } from './collisions.js';
import { buildHouse } from '../house/geometry.js';
import { FURNITURE } from '../house/furniture.js';
import { exteriorColliders } from '../house/exterior.js';

export const world = new CollisionWorld();

let built = null;
/** בונה (פעם אחת) את גיאומטריית הבית ואת גופי ההתנגשות הסטטיים */
export function getHouseData() {
  if (built) return built;
  built = buildHouse();
  for (const b of built.boxes) if (b.collide !== false) world.addBox(b);
  for (const f of FURNITURE) if (f.collide !== false) world.addBox(f);
  for (const b of exteriorColliders()) world.addBox(b);
  return built;
}
