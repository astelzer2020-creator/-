/**
 * הסביבה: קרקע, שביל, חניה, עצים (instancing), שיחים, גדר, תאורת גן.
 */
import { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { PATH, DRIVEWAY, TREES, BUSHES, BOLLARDS, PROPERTY, GATE } from '../house/exterior.js';

const tmp = new THREE.Object3D();

function Instanced({ geometry, material, transforms, castShadow = true }) {
  const ref = useRef();
  useLayoutEffect(() => {
    transforms.forEach((t, i) => {
      tmp.position.set(t.x, t.y, t.z);
      tmp.scale.set(t.sx, t.sy, t.sz);
      tmp.rotation.set(0, t.ry || 0, 0);
      tmp.updateMatrix();
      ref.current.setMatrixAt(i, tmp.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [transforms]);
  return (
    <instancedMesh ref={ref} args={[geometry, material, transforms.length]} castShadow={castShadow} receiveShadow frustumCulled={false} />
  );
}

export default function Exterior({ materials }) {
  const geo = useMemo(() => ({
    trunk: new THREE.CylinderGeometry(0.16, 0.24, 2.4, 10),
    crown: new THREE.SphereGeometry(1, 12, 9),
    bush: new THREE.SphereGeometry(0.5, 10, 8),
    post: new THREE.BoxGeometry(0.08, 1.5, 0.08),
    rail: new THREE.BoxGeometry(1, 0.06, 0.04),
    bollard: new THREE.CylinderGeometry(0.06, 0.08, 0.8, 10),
  }), []);

  const trunks = useMemo(() => TREES.map(([x, z, s]) => ({ x, y: 1.2 * s, z, sx: s, sy: s, sz: s })), []);
  const crowns = useMemo(() => TREES.flatMap(([x, z, s]) => [
    { x, y: 3.0 * s, z, sx: 1.9 * s, sy: 2.1 * s, sz: 1.9 * s },
    { x: x + 0.5 * s, y: 2.4 * s, z: z + 0.3 * s, sx: 1.2 * s, sy: 1.3 * s, sz: 1.2 * s },
  ]), []);
  const bushes = useMemo(() => BUSHES.map(([x, z, s]) => ({ x, y: 0.35 * s, z, sx: 1.4 * s, sy: 0.9 * s, sz: 1.4 * s })), []);
  const bollards = useMemo(() => BOLLARDS.map(([x, z]) => ({ x, y: 0.4, z, sx: 1, sy: 1, sz: 1 })), []);

  // גדר: עמודים + שני פסים אופקיים לכל צלע (בלי צלע השער באמצע)
  const { posts, rails } = useMemo(() => {
    const posts = [], rails = [];
    const P = PROPERTY;
    const side = (x0, z0, x1, z1, skip) => {
      const len = Math.hypot(x1 - x0, z1 - z0);
      const n = Math.round(len / 2.2);
      for (let i = 0; i <= n; i++) {
        const x = x0 + ((x1 - x0) * i) / n, z = z0 + ((z1 - z0) * i) / n;
        if (skip && x > GATE.x0 - 0.4 && x < GATE.x1 + 0.4) continue;
        posts.push({ x, y: 0.75, z, sx: 1, sy: 1, sz: 1 });
      }
      const ry = Math.abs(x1 - x0) > Math.abs(z1 - z0) ? 0 : Math.PI / 2;
      for (const y of [0.55, 1.25]) {
        if (skip) {
          rails.push({ x: (x0 + GATE.x0) / 2, y, z: z0, sx: GATE.x0 - x0, sy: 1, sz: 1, ry });
          rails.push({ x: (GATE.x1 + x1) / 2, y, z: z0, sx: x1 - GATE.x1, sy: 1, sz: 1, ry });
        } else {
          rails.push({ x: (x0 + x1) / 2, y, z: (z0 + z1) / 2, sx: len, sy: 1, sz: 1, ry });
        }
      }
    };
    side(P.minX, P.maxZ, P.maxX, P.maxZ, true);   // חזית עם שער
    side(P.minX, P.minZ, P.maxX, P.minZ, false);
    side(P.minX, P.minZ, P.minX, P.maxZ, false);
    side(P.maxX, P.minZ, P.maxX, P.maxZ, false);
    return { posts, rails };
  }, []);

  return (
    <group>
      {/* קרקע */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.02} receiveShadow>
        <planeGeometry args={[90, 90]} />
        <primitive object={materials.grass} attach="material" />
      </mesh>
      {/* שביל כניסה */}
      <mesh position={[(PATH.x0 + PATH.x1) / 2, 0.005, (PATH.z0 + PATH.z1) / 2]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[PATH.x1 - PATH.x0, PATH.z1 - PATH.z0]} />
        <primitive object={materials.path} attach="material" />
      </mesh>
      {/* חניה */}
      <mesh position={[(DRIVEWAY.x0 + DRIVEWAY.x1) / 2, 0.004, (DRIVEWAY.z0 + DRIVEWAY.z1) / 2]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[DRIVEWAY.x1 - DRIVEWAY.x0, DRIVEWAY.z1 - DRIVEWAY.z0]} />
        <primitive object={materials.path} attach="material" />
      </mesh>

      <Instanced geometry={geo.trunk} material={materials.trunk} transforms={trunks} />
      <Instanced geometry={geo.crown} material={materials.leaves} transforms={crowns} />
      <Instanced geometry={geo.bush} material={materials.leaves} transforms={bushes} castShadow={false} />
      <Instanced geometry={geo.post} material={materials.fence} transforms={posts} castShadow={false} />
      <Instanced geometry={geo.rail} material={materials.fence} transforms={rails} castShadow={false} />
      <Instanced geometry={geo.bollard} material={materials.metal} transforms={bollards} castShadow={false} />
    </group>
  );
}
