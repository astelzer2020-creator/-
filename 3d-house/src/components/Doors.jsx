/**
 * דלתות אינטראקטיביות: אנימציית פתיחה סביב ציר, כיוון פתיחה מתרחק מהמשתמש,
 * ועדכון גוף התנגשות דינמי בכל שינוי זווית.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DOORS } from '../house/plan.js';
import { useTourStore } from '../stores/tourStore.js';
import { world } from '../utils/world.js';
import { playerState } from '../utils/input.js';
import { sounds } from '../utils/audio.js';

const OPEN_ANGLE = 1.8; // ~103°

function Door({ def, materials }) {
  const pivot = useRef();
  const state = useRef({ angle: 0, sign: 0, wasOpen: false });
  const open = useTourStore((s) => s.doors[def.id].open);

  const alongX = def.wallDir === 'x';
  // ציר בקצה הפתח
  const hx = alongX ? def.c - def.w / 2 : def.at;
  const hz = alongX ? def.at : def.c - def.w / 2;

  useFrame((_, dt) => {
    const st = state.current;
    if (open !== st.wasOpen) {
      st.wasOpen = open;
      if (open) {
        // בחירת כיוון פתיחה — מתרחק מהצד שבו עומד המשתמש
        st.sign = alongX
          ? (playerState.z > def.at ? 1 : -1)
          : (playerState.x > def.at ? -1 : 1);
        sounds.doorOpen();
      } else {
        sounds.doorClose();
      }
    }
    const target = open ? OPEN_ANGLE * (st.sign || 1) : 0;
    const prev = st.angle;
    st.angle = THREE.MathUtils.damp(st.angle, target, 6, Math.min(dt, 0.05));
    if (pivot.current) pivot.current.rotation.y = st.angle;

    if (Math.abs(st.angle - prev) > 0.0005 || !st.initialized) {
      st.initialized = true;
      // AABB מהציר עד קצה הכנף בזווית הנוכחית
      const a = st.angle;
      const tipX = alongX ? hx + def.w * Math.cos(a) : hx + def.w * Math.sin(a);
      const tipZ = alongX ? hz - def.w * Math.sin(a) : hz + def.w * Math.cos(a);
      const pad = 0.055;
      world.setDynamic(def.id, {
        minX: Math.min(hx, tipX) - pad, maxX: Math.max(hx, tipX) + pad,
        minY: def.y0, maxY: def.y0 + def.h,
        minZ: Math.min(hz, tipZ) - pad, maxZ: Math.max(hz, tipZ) + pad,
      });
    }
  });

  const leafMat = def.main ? materials.woodDark : materials.doorLeaf;
  return (
    <group position={[hx, def.y0, hz]}>
      <group ref={pivot}>
        {/* כנף הדלת — נמתחת מהציר */}
        <mesh
          position={alongX ? [def.w / 2, def.h / 2, 0] : [0, def.h / 2, def.w / 2]}
          castShadow
        >
          <boxGeometry args={alongX ? [def.w - 0.04, def.h - 0.03, def.t] : [def.t, def.h - 0.03, def.w - 0.04]} />
          <primitive object={leafMat} attach="material" />
        </mesh>
        {/* ידית */}
        <mesh position={alongX ? [def.w - 0.12, 1.02, def.t / 2 + 0.03] : [def.t / 2 + 0.03, 1.02, def.w - 0.12]}>
          <boxGeometry args={alongX ? [0.14, 0.03, 0.03] : [0.03, 0.03, 0.14]} />
          <primitive object={materials.metal} attach="material" />
        </mesh>
        <mesh position={alongX ? [def.w - 0.12, 1.02, -def.t / 2 - 0.03] : [-def.t / 2 - 0.03, 1.02, def.w - 0.12]}>
          <boxGeometry args={alongX ? [0.14, 0.03, 0.03] : [0.03, 0.03, 0.14]} />
          <primitive object={materials.metal} attach="material" />
        </mesh>
      </group>
      {/* משקוף */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={alongX ? [def.w / 2 + s * (def.w / 2 + 0.03), def.h / 2, 0] : [0, def.h / 2, def.w / 2 + s * (def.w / 2 + 0.03)]}
        >
          <boxGeometry args={alongX ? [0.07, def.h + 0.06, def.t + 0.12] : [def.t + 0.12, def.h + 0.06, 0.07]} />
          <primitive object={materials.frame} attach="material" />
        </mesh>
      ))}
      <mesh position={alongX ? [def.w / 2, def.h + 0.045, 0] : [0, def.h + 0.045, def.w / 2]}>
        <boxGeometry args={alongX ? [def.w + 0.12, 0.08, def.t + 0.12] : [def.t + 0.12, 0.08, def.w + 0.12]} />
        <primitive object={materials.frame} attach="material" />
      </mesh>
    </group>
  );
}

export default function Doors({ materials }) {
  return DOORS.map((def) => <Door key={def.id} def={def} materials={materials} />);
}
