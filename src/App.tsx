import { Canvas, useLoader, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere } from '@react-three/drei'
import { useRef, useState } from 'react'
import { TextureLoader, Mesh, Vector3, DirectionalLight } from 'three'
import moonTexture from './textures/8k_moon.jpg'
import starsTexture from './textures/8k_stars.jpg'
import './App.css'

const LUNAR_PHASES = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent'
]

function Skybox() {
  const stars = useLoader(TextureLoader, starsTexture)
  
  return (
    <Sphere args={[100, 32, 32]}>
      <meshBasicMaterial
        map={stars}
        side={1}
      />
    </Sphere>
  )
}

function MoonSphere({ phase }: { phase: number }) {
  const sphereRef = useRef<Mesh>(null)
  const texture = useLoader(TextureLoader, moonTexture)

  useFrame((state, delta) => {
    if (sphereRef.current) {
      // Rotate around Y axis (vertical axis)
      sphereRef.current.rotation.y += delta * 0.1
    }
  })

  // Calculate lighting based on phase (0-1)
  // Adjust the angle to match Earth's perspective of lunar phases
  const phaseAngle = (phase - 0.25) * Math.PI * 2 // Start from the right side
  const lightPosition = new Vector3(
    Math.cos(phaseAngle) * 10,
    0,
    Math.sin(phaseAngle) * 10
  )

  // Calculate lighting intensity based on phase
  const getLightIntensity = (phase: number) => {
    // Full moon (0.5) should have maximum intensity
    // New moon (0 or 1) should have minimum intensity
    const distanceFromFull = Math.abs(phase - 0.5) * 2
    // Further reduced maximum brightness for full moon
    return Math.pow(1 - distanceFromFull, 2) * 2.5
  }

  return (
    <>
      {/* Main directional light for sharp terminator line */}
      <directionalLight 
        position={lightPosition} 
        intensity={getLightIntensity(phase)}
        color="#ffffff"
      />
      {/* Subtle fill light from the opposite direction */}
      <directionalLight
        position={[-lightPosition.x, 0, -lightPosition.z]}
        intensity={0.03}
        color="#ffffff"
      />
      {/* Very low ambient light for minimal visibility in shadow */}
      <ambientLight intensity={0.015} />
      <Sphere ref={sphereRef} args={[1, 64, 64]}>
        <meshStandardMaterial
          map={texture}
          metalness={0.0}
          roughness={1}
          envMapIntensity={0.03}
          emissive="#000000"
          emissiveIntensity={0}
        />
      </Sphere>
    </>
  )
}

function PhaseControls({ phase, setPhase }: { phase: number, setPhase: (phase: number) => void }) {
  // Show "New Moon" when phase is 1, otherwise show the current phase
  const displayPhase = phase === 1 ? "New Moon" : LUNAR_PHASES[Math.floor(phase * 8)]

  return (
    <div className="phase-controls">
      <h2>{displayPhase}</h2>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={phase}
        onChange={(e) => setPhase(parseFloat(e.target.value))}
      />
    </div>
  )
}

function App() {
  const [phase, setPhase] = useState(0.5) // Start with full moon

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: '#000' }}
      >
        <Skybox />
        <MoonSphere phase={phase} />
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
      </Canvas>
      <PhaseControls phase={phase} setPhase={setPhase} />
    </div>
  )
}

export default App
