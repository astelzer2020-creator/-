/**
 * הסצנה הראשית — Canvas, חומרים, בית, סביבה, תאורה ובקרים לפי מצב.
 */
import { useMemo, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import House from './House.jsx';
import Exterior from './Exterior.jsx';
import Doors from './Doors.jsx';
import Lighting from './Lighting.jsx';
import InfoPoints from './InfoPoints.jsx';
import OrbitView from './OrbitView.jsx';
import FirstPersonController from './FirstPersonController.jsx';
import { createMaterials, disposeMaterials } from '../utils/materials.js';
import { useTourStore, MODES } from '../stores/tourStore.js';

function SceneContent({ isTouch, quality }) {
  const materials = useMemo(() => createMaterials(), []);
  useEffect(() => () => disposeMaterials(materials), [materials]);

  const mode = useTourStore((s) => s.mode);
  const transition = useTourStore((s) => s.transition);

  const walking = mode === MODES.WALK || transition === 'enter';

  return (
    <>
      <Lighting materials={materials} quality={quality} />
      <House materials={materials} />
      <Doors materials={materials} />
      <Exterior materials={materials} />
      <InfoPoints />
      {walking ? <FirstPersonController isTouch={isTouch} /> : <OrbitView />}
    </>
  );
}

export default function Experience({ caps, onReady }) {
  const [hidden, setHidden] = useState(document.hidden);
  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <Canvas
      shadows={caps.shadows}
      dpr={caps.dpr}
      frameloop={hidden ? 'never' : 'always'}
      camera={{ position: [16, 9, 19], fov: 55, near: 0.08, far: 250 }}
      gl={{ antialias: caps.quality !== 'low', powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          useTourStore.setState({ contextLost: true });
        });
        onReady?.();
      }}
    >
      <SceneContent isTouch={caps.isTouch} quality={caps.quality} />
    </Canvas>
  );
}
