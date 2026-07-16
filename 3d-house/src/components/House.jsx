/**
 * הבית + הריהוט — כל הקופסאות ממוזגות לגיאומטריה אחת לכל חומר (draw call אחד לחומר).
 */
import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { getHouseData } from '../utils/world.js';
import { FURNITURE } from '../house/furniture.js';

const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);
const UNIT_CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 18);
const UNIT_SPH = new THREE.SphereGeometry(0.5, 14, 10);

function unitGeo(shape) {
  return shape === 'cyl' ? UNIT_CYL : shape === 'sphere' ? UNIT_SPH : UNIT_BOX;
}

export default function House({ materials }) {
  const merged = useMemo(() => {
    const { boxes } = getHouseData();
    const byMat = new Map();
    const push = (item) => {
      if (!item.mat) return; // גופי התנגשות בלתי-נראים
      const g = unitGeo(item.shape).clone();
      const m = new THREE.Matrix4()
        .makeTranslation(item.x, item.y, item.z)
        .multiply(new THREE.Matrix4().makeScale(item.sx, item.sy, item.sz));
      g.applyMatrix4(m);
      if (!byMat.has(item.mat)) byMat.set(item.mat, []);
      byMat.get(item.mat).push(g);
    };
    boxes.forEach(push);
    FURNITURE.forEach(push);
    const out = [];
    for (const [mat, geos] of byMat) {
      const merged = mergeGeometries(geos, false);
      geos.forEach((g) => g.dispose());
      out.push({ mat, geometry: merged });
    }
    return out;
  }, []);

  useEffect(() => () => merged.forEach(({ geometry }) => geometry.dispose()), [merged]);

  return (
    <group>
      {merged.map(({ mat, geometry }) => (
        <mesh
          key={mat}
          geometry={geometry}
          material={materials[mat]}
          castShadow={mat !== 'glass' && mat !== 'rug'}
          receiveShadow
        />
      ))}
    </group>
  );
}
