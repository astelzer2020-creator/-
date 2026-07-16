/**
 * תאורה + שמיים, עם מעבר יום/לילה הדרגתי.
 * ביום: שמש עם צללים + שמיים פרוצדורליים. בלילה: ירח קלוש, תאורת פנים וגן.
 */
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Sky, Stars } from '@react-three/drei';
import { useTourStore } from '../stores/tourStore.js';
import { FF_Y } from '../house/plan.js';

// גופי תאורה פנימיים: [x, y, z] — נקודות אור ללא צללים (זולות)
const INTERIOR_LIGHTS = [
  [0, 2.55, 1.5],        // מבואה
  [3.6, 2.55, 2.2],      // סלון
  [3.6, 2.55, -1.7],     // מטבח (מעל האי)
  [-3.6, 2.55, 3.0],     // פינת אוכל
  [-4.6, 2.7, -1.0],     // חלל המדרגות
  [0, FF_Y + 2.55, 0.4], // מסדרון עליון
  [3.4, FF_Y + 2.55, 1.2],  // חדר ראשי
  [-2.3, FF_Y + 2.55, -2.0], // גלריה
];

const DAY = {
  sunPos: new THREE.Vector3(35, 42, 20),
  sunIntensity: 2.6, sunColor: new THREE.Color('#fff2dd'),
  hemi: 0.9, amb: 0.78, exposure: 1.06,
  fog: new THREE.Color('#dfe9ef'), interior: 0,
};
const NIGHT = {
  sunPos: new THREE.Vector3(-25, 18, -30),
  sunIntensity: 0.22, sunColor: new THREE.Color('#7f9cc9'),
  hemi: 0.12, amb: 0.1, exposure: 0.75,
  fog: new THREE.Color('#0a0f1c'), interior: 1,
};

export default function Lighting({ materials, quality }) {
  const night = useTourStore((s) => s.night);
  const sun = useRef();
  const hemi = useRef();
  const amb = useRef();
  const pts = useRef([]);
  const t = useRef(0); // 0 = יום, 1 = לילה
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  const fogObj = useMemo(() => new THREE.Fog(DAY.fog.clone(), 55, 110), []);
  scene.fog = fogObj;

  const skyRef = useRef();
  const starsRef = useRef();
  const sunVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const target = night ? 1 : 0;
    t.current = THREE.MathUtils.damp(t.current, target, 2.2, Math.min(dt, 0.05));
    const k = t.current;

    sunVec.lerpVectors(DAY.sunPos, NIGHT.sunPos, k);
    if (sun.current) {
      sun.current.position.copy(sunVec);
      sun.current.intensity = THREE.MathUtils.lerp(DAY.sunIntensity, NIGHT.sunIntensity, k);
      sun.current.color.lerpColors(DAY.sunColor, NIGHT.sunColor, k);
    }
    if (hemi.current) hemi.current.intensity = THREE.MathUtils.lerp(DAY.hemi, NIGHT.hemi, k);
    if (amb.current) amb.current.intensity = THREE.MathUtils.lerp(DAY.amb, NIGHT.amb, k);
    gl.toneMappingExposure = THREE.MathUtils.lerp(DAY.exposure, NIGHT.exposure, k);
    fogObj.color.lerpColors(DAY.fog, NIGHT.fog, k);

    // שקיעת השמש בשמיים הפרוצדורליים
    if (skyRef.current) {
      const el = THREE.MathUtils.lerp(0.45, -0.12, k); // אלבציה יחסית
      skyRef.current.material.uniforms.sunPosition.value.set(30, el * 100, 18);
    }
    if (starsRef.current) starsRef.current.visible = k > 0.35;

    // תאורת פנים
    const inner = THREE.MathUtils.lerp(0, 1, k);
    for (const p of pts.current) if (p) p.intensity = inner * 14;
    materials.lampshade.emissiveIntensity = inner * 1.5;
    if (materials.glass) {
      materials.glass.emissive = materials.glass.emissive || new THREE.Color(0xffdf9e);
      materials.glass.emissiveIntensity = inner * 0.25;
    }
  });

  const shadowSize = quality === 'low' ? 1024 : 2048;

  return (
    <>
      <Sky ref={skyRef} distance={4000} sunPosition={[30, 45, 18]} turbidity={6} rayleigh={1.2} mieCoefficient={0.004} mieDirectionalG={0.8} />
      <Stars ref={starsRef} radius={200} depth={40} count={2200} factor={4} fade speed={0.6} />
      <directionalLight
        ref={sun}
        position={DAY.sunPos.toArray()}
        intensity={DAY.sunIntensity}
        castShadow
        shadow-mapSize-width={shadowSize}
        shadow-mapSize-height={shadowSize}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={5}
        shadow-camera-far={120}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <hemisphereLight ref={hemi} args={['#cfe4f7', '#57614f', DAY.hemi]} />
      <ambientLight ref={amb} intensity={DAY.amb} color="#e8eef5" />
      {/* גופי תאורה פנימיים */}
      {INTERIOR_LIGHTS.map((p, i) => (
        <group key={i} position={p}>
          <pointLight ref={(el) => (pts.current[i] = el)} intensity={0} distance={7.5} decay={1.9} color="#ffd9a0" />
          <mesh position={[0, 0.28, 0]}>
            <cylinderGeometry args={[0.11, 0.14, 0.18, 12]} />
            <primitive object={materials.lampshade} attach="material" />
          </mesh>
        </group>
      ))}
      {/* מנורת כניסה מעל הדלת */}
      <group position={[0, 2.5, 4.85]}>
        <pointLight ref={(el) => (pts.current[INTERIOR_LIGHTS.length] = el)} intensity={0} distance={7} decay={1.9} color="#ffd9a0" />
        <mesh>
          <boxGeometry args={[0.14, 0.24, 0.14]} />
          <primitive object={materials.lampshade} attach="material" />
        </mesh>
      </group>
    </>
  );
}
