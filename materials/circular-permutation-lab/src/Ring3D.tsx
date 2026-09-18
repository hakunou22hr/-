import { Html, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Component, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import * as THREE from 'three'

type Ring3DProps = {
  items: number[]
  angle: number
  flipped: boolean
  fixed: boolean
  colors: string[]
  pulse: number
  resetView: number
  onReady: () => void
  onFailure: () => void
}

class WebGLErrorBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('3D表示の初期化に失敗しました。', error)
    this.props.onFailure()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

function Jewelry({ items, angle, flipped, fixed, colors, pulse }: Omit<Ring3DProps, 'resetView' | 'onReady' | 'onFailure'>) {
  const group = useRef<THREE.Group>(null)
  const pulseStarted = useRef(0)

  useEffect(() => {
    pulseStarted.current = performance.now()
  }, [pulse])

  useFrame(() => {
    if (!group.current) return
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -THREE.MathUtils.degToRad(angle), 0.12)
    // Rotate the jewelry about the screen's vertical axis. Html labels are
    // camera-facing sprites, so the digits remain readable rather than mirrored.
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, flipped ? Math.PI : 0, 0.1)
    const elapsed = performance.now() - pulseStarted.current
    const flash = elapsed < 700 ? 1 + Math.sin(elapsed / 700 * Math.PI) * 0.12 : 1
    group.current.scale.setScalar(flash)
  })

  return (
    <group ref={group}>
      <mesh>
        <torusGeometry args={[2.45, 0.11, 24, 128]} />
        <meshStandardMaterial color="#17668d" emissive="#16bde8" emissiveIntensity={1.1} metalness={0.6} roughness={0.25} />
      </mesh>
      {items.map((number, index) => {
        const baseAngle = index * Math.PI * 2 / items.length
        const x = Math.sin(baseAngle) * 2.45
        const y = Math.cos(baseAngle) * 2.45
        return (
          <group position={[x, y, 0]} key={`${number}-${index}`}>
            <mesh castShadow>
              <dodecahedronGeometry args={[0.52, 0]} />
              <meshStandardMaterial
                color={colors[number - 1]}
                emissive={colors[number - 1]}
                emissiveIntensity={fixed && number === 1 ? 1.5 : 0.65}
                metalness={0.22}
                roughness={0.2}
              />
            </mesh>
            <Html center sprite distanceFactor={7} zIndexRange={[20, 0]}>
              <span className={`gem-label-3d ${fixed && number === 1 ? 'locked' : ''}`}>{number}</span>
            </Html>
          </group>
        )
      })}
    </group>
  )
}

function CameraControls({ resetView }: { resetView: number }) {
  const controls = useRef<any>(null)
  useEffect(() => {
    if (!controls.current) return
    controls.current.reset()
    controls.current.update()
  }, [resetView])
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={4.5}
      maxDistance={12}
      target={[0, 0, 0]}
    />
  )
}

function SceneReady({ onReady }: { onReady: () => void }) {
  const ready = useRef(onReady)
  useEffect(() => ready.current(), [])
  return null
}

export function Ring3D(props: Ring3DProps) {
  return (
    <WebGLErrorBoundary onFailure={props.onFailure}>
      <Canvas
        className="ring-canvas"
        camera={{ position: [0.7, 3.8, 7.2], fov: 43, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ camera, gl }) => {
          camera.lookAt(0, 0, 0)
          gl.setClearColor('#07111f', 0)
        }}
      >
        <SceneReady onReady={props.onReady} />
        <ambientLight intensity={1.25} />
        <directionalLight position={[4, 6, 7]} intensity={2.2} />
        <pointLight position={[-4, -2, 4]} color="#28ccff" intensity={18} distance={14} />
        <Jewelry {...props} />
        <CameraControls resetView={props.resetView} />
      </Canvas>
    </WebGLErrorBoundary>
  )
}
