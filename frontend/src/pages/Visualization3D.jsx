import { Suspense, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sky, Environment, Text, Html, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import { Eye, Layers, Sun, Moon, RotateCcw } from 'lucide-react'

function Building({ position, width, depth, floors, color, label, onClick, hovered, onHover }) {
  const height = floors * 3
  const meshRef = useRef()

  useFrame((_, dt) => {
    if (!meshRef.current) return
    const target = hovered ? 1.05 : 1
    meshRef.current.scale.y += (target - meshRef.current.scale.y) * 0.1
  })

  return (
    <group position={position} onClick={onClick} onPointerOver={() => onHover(true)} onPointerOut={() => onHover(false)}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, height / 2 + 0.05, 0]} receiveShadow>
        <boxGeometry args={[width, 0.1, depth]} />
        <meshStandardMaterial color={hovered ? '#60a5fa' : '#94a3b8'} />
      </mesh>
      {hovered && label && (
        <Html position={[0, height / 2 + 2, 0]} center>
          <div className="glass px-3 py-2 rounded-xl text-xs text-white whitespace-nowrap pointer-events-none">
            <p className="font-bold">{label}</p>
            <p className="text-slate-300">{floors} קומות · {floors * 4} יח"ד</p>
          </div>
        </Html>
      )}
    </group>
  )
}

function BuildingRow({ buildings, yOffset = 0 }) {
  const [hoveredIdx, setHoveredIdx] = useState(null)
  return (
    <group position={[0, yOffset, 0]}>
      {buildings.map((b, i) => (
        <Building key={i} {...b} hovered={hoveredIdx === i} onHover={(v) => setHoveredIdx(v ? i : null)} onClick={() => {}} />
      ))}
    </group>
  )
}

function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#1a2744" />
      </mesh>
      <Grid args={[200, 200]} cellSize={5} sectionSize={20} sectionColor="#334155" cellColor="#1e293b" fadeDistance={80} position={[0, 0, 0]} />
    </>
  )
}

function Road({ start, end }) {
  const dir = new THREE.Vector3().subVectors(new THREE.Vector3(...end), new THREE.Vector3(...start))
  const len = dir.length()
  const mid = new THREE.Vector3(...start).add(dir.clone().multiplyScalar(0.5))
  const angle = Math.atan2(dir.x, dir.z)
  return (
    <mesh position={[mid.x, 0.01, mid.z]} rotation={[0, angle, 0]} receiveShadow>
      <boxGeometry args={[6, 0.02, len]} />
      <meshStandardMaterial color="#0f172a" />
    </mesh>
  )
}

const BEFORE_BUILDINGS = [
  { position: [-30, 1.5, -10], width: 12, depth: 10, floors: 3, color: '#64748b', label: 'בניין ישן א' },
  { position: [-15, 2, -10], width: 12, depth: 10, floors: 4, color: '#475569', label: 'בניין ישן ב' },
  { position: [0, 1.5, -10], width: 12, depth: 10, floors: 3, color: '#64748b', label: 'בניין ישן ג' },
  { position: [15, 2.5, -10], width: 12, depth: 10, floors: 5, color: '#475569', label: 'בניין ישן ד' },
  { position: [30, 1.5, -10], width: 12, depth: 10, floors: 3, color: '#64748b', label: 'בניין ישן ה' },
  { position: [-25, 1.5, 10], width: 10, depth: 10, floors: 3, color: '#374151', label: 'בניין ישן ו' },
  { position: [-10, 2, 10], width: 10, depth: 10, floors: 4, color: '#374151', label: 'בניין ישן ז' },
  { position: [10, 1.5, 10], width: 10, depth: 10, floors: 3, color: '#374151', label: 'בניין ישן ח' },
]

const AFTER_BUILDINGS = [
  { position: [-35, 10, -15], width: 14, depth: 12, floors: 20, color: '#2563eb', label: 'מגדל א חדש' },
  { position: [-15, 12.5, -15], width: 14, depth: 12, floors: 25, color: '#7c3aed', label: 'מגדל ב חדש' },
  { position: [5, 10, -15], width: 14, depth: 12, floors: 20, color: '#0891b2', label: 'מגדל ג חדש' },
  { position: [25, 15, -15], width: 14, depth: 12, floors: 30, color: '#2563eb', label: 'מגדל ד חדש' },
  { position: [-30, 7.5, 12], width: 12, depth: 12, floors: 15, color: '#0d9488', label: 'בניין מסחרי' },
  { position: [-10, 7.5, 12], width: 12, depth: 12, floors: 15, color: '#0d9488', label: 'בניין מגורים' },
  { position: [15, 7.5, 12], width: 12, depth: 12, floors: 15, color: '#0d9488', label: 'בניין משרדים' },
]

export default function Visualization3D() {
  const [mode, setMode] = useState('before') // 'before' | 'after' | 'split'
  const [dayNight, setDayNight] = useState('day')
  const controlsRef = useRef()

  const resetCamera = () => controlsRef.current?.reset()

  return (
    <div className="h-screen flex flex-col">
      <div className="p-6 pb-0">
        <h1 className="text-3xl font-bold gradient-text">תצוגה תלת-מימד</h1>
        <p className="text-slate-400 mt-1">השוואה ויזואלית לפני ואחרי פרויקט התחדשות עירונית</p>
      </div>

      <div className="flex items-center gap-3 px-6 py-4">
        {[
          { key: 'before', label: 'לפני' },
          { key: 'after', label: 'אחרי' },
          { key: 'split', label: 'השוואה' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${mode === key ? 'bg-blue-600 text-white' : 'glass text-slate-400 hover:text-white'}`}
          >
            {label}
          </button>
        ))}
        <div className="mr-auto flex gap-2">
          <button onClick={() => setDayNight(d => d === 'day' ? 'night' : 'day')}
            className="glass p-2 rounded-xl text-slate-400 hover:text-white transition-colors">
            {dayNight === 'day' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={resetCamera} className="glass p-2 rounded-xl text-slate-400 hover:text-white transition-colors">
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        {mode === 'split' ? (
          <div className="flex h-full gap-1">
            {[{ buildings: BEFORE_BUILDINGS, label: 'לפני' }, { buildings: AFTER_BUILDINGS, label: 'אחרי' }].map(({ buildings, label }) => (
              <div key={label} className="flex-1 relative">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 glass px-4 py-1 rounded-full text-sm font-semibold text-white">{label}</div>
                <Canvas shadows camera={{ position: [0, 40, 80], fov: 50 }}>
                  <Scene buildings={buildings} dayNight={dayNight} />
                  <OrbitControls makeDefault />
                </Canvas>
              </div>
            ))}
          </div>
        ) : (
          <Canvas shadows camera={{ position: [0, 50, 100], fov: 50 }}>
            <Scene buildings={mode === 'before' ? BEFORE_BUILDINGS : AFTER_BUILDINGS} dayNight={dayNight} />
            <OrbitControls ref={controlsRef} makeDefault />
          </Canvas>
        )}

        <div className="absolute bottom-4 left-4 glass rounded-xl p-3 text-xs space-y-1">
          <p className="text-slate-400 font-semibold mb-2">מקרא</p>
          {[
            { color: '#64748b', label: 'בניין ישן' },
            { color: '#2563eb', label: 'מגדל מגורים' },
            { color: '#7c3aed', label: 'מגדל יוקרה' },
            { color: '#0d9488', label: 'בניין מסחרי' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
              <span className="text-slate-300">{label}</span>
            </div>
          ))}
        </div>

        <div className="absolute bottom-4 right-4 glass rounded-xl p-3 text-xs">
          <p className="text-slate-400 mb-1">השוואה</p>
          <div className="space-y-1">
            <p className="text-white">יחידות לפני: <span className="text-slate-400">~{BEFORE_BUILDINGS.reduce((s, b) => s + b.floors * 4, 0)}</span></p>
            <p className="text-white">יחידות אחרי: <span className="text-green-400">~{AFTER_BUILDINGS.reduce((s, b) => s + b.floors * 4, 0)}</span></p>
            <p className="text-white">גידול: <span className="text-blue-400">
              {Math.round((AFTER_BUILDINGS.reduce((s, b) => s + b.floors * 4, 0) / BEFORE_BUILDINGS.reduce((s, b) => s + b.floors * 4, 0) - 1) * 100)}%
            </span></p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Scene({ buildings, dayNight }) {
  return (
    <>
      <ambientLight intensity={dayNight === 'day' ? 0.6 : 0.1} />
      <directionalLight position={[50, 80, 30]} intensity={dayNight === 'day' ? 1.5 : 0.1} castShadow shadow-mapSize={[2048, 2048]} />
      {dayNight === 'night' && (
        <>
          <pointLight position={[-30, 20, -10]} intensity={2} color="#4488ff" distance={80} />
          <pointLight position={[20, 25, 10]} intensity={2} color="#8844ff" distance={80} />
          <pointLight position={[0, 15, 0]} intensity={1} color="#ffaa44" distance={60} />
        </>
      )}
      <Sky sunPosition={dayNight === 'day' ? [100, 20, 100] : [-100, -20, -100]} turbidity={dayNight === 'day' ? 4 : 0.1} />
      <Ground />
      <Road start={[-80, 0, -25]} end={[80, 0, -25]} />
      <Road start={[-80, 0, 25]} end={[80, 0, 25]} />
      <Road start={[-50, 0, -50]} end={[-50, 0, 50]} />
      <Road start={[50, 0, -50]} end={[50, 0, 50]} />
      <Suspense fallback={null}>
        <BuildingRow buildings={buildings} />
      </Suspense>
    </>
  )
}
