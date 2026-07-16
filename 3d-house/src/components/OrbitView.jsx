/**
 * תצוגה חיצונית — מצלמת Orbit סביב הבית עם גבולות זום וזווית.
 */
import { OrbitControls } from '@react-three/drei';

export default function OrbitView() {
  return (
    <OrbitControls
      target={[0, 2.6, 0]}
      enableDamping
      dampingFactor={0.08}
      minDistance={9}
      maxDistance={34}
      maxPolarAngle={Math.PI / 2 - 0.06}
      minPolarAngle={0.15}
      enablePan={false}
      makeDefault
    />
  );
}
