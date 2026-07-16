/**
 * נקודות מידע — סמנים עדינים מהבהבים; התוכן נפתח בחלונית ה-UI.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { INFO_POINTS } from '../house/plan.js';
import { useTourStore, MODES } from '../stores/tourStore.js';

export default function InfoPoints() {
  const group = useRef();
  const mode = useTourStore((s) => s.mode);
  const nearInfo = useTourStore((s) => s.nearInfo);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.children.forEach((child, i) => {
      const pulse = 1 + Math.sin(t * 2.4 + i) * 0.12;
      child.scale.setScalar(pulse);
      child.children[0].material.opacity = nearInfo === INFO_POINTS[i].id ? 0.95 : 0.55;
    });
  });

  if (mode !== MODES.WALK) return null;

  return (
    <group ref={group}>
      {INFO_POINTS.map((p) => (
        <group key={p.id} position={p.pos}>
          <mesh>
            <sphereGeometry args={[0.032, 12, 10]} />
            <meshBasicMaterial color="#eaf3ff" transparent opacity={0.55} />
          </mesh>
          <mesh>
            <torusGeometry args={[0.062, 0.006, 8, 28]} />
            <meshBasicMaterial color="#9fc2e8" transparent opacity={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
