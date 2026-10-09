import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import fontData from './e-font.json'
import {
  compound,
  convergencePoints,
  graphPoints,
  logA,
  secant,
  derivative,
  limitExperiment,
  type Parameters,
  type Vec3,
} from './model'
const cyan = '#69d7dc',
  gold = '#e8bc73',
  red = '#ee8a93'
type Props = {
  chapter: number
  p: Parameters
  time: number
  movie: boolean
  flat: boolean
  reveal: boolean
  highlight: string
  effects: boolean
  node: string
}
function Pulse({
  position,
  color = gold,
  time,
  effects,
}: {
  position: Vec3
  color?: string
  time: number
  effects: boolean
}) {
  const pulse = effects ? 1 + 0.16 * Math.sin(time * 4) : 1
  return (
    <group position={position}>
      <mesh scale={pulse}>
        <sphereGeometry args={[0.07, 16, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
      </mesh>
      <mesh scale={pulse}>
        <sphereGeometry args={[0.17, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} depthWrite={false} />
      </mesh>
    </group>
  )
}
function Camera({
  movie,
  flat,
  time,
  chapter,
}: {
  movie: boolean
  flat: boolean
  time: number
  chapter: number
}) {
  const { camera } = useThree()
  const controls = useRef<any>(null)
  useEffect(() => {
    camera.position.set(flat ? 2 : 7, flat ? 1.2 : 4, flat ? 12 : 11)
    controls.current?.target.set(2, 1.2, 0)
    controls.current?.update()
  }, [flat, movie, camera])
  useFrame(() => {
    if (movie) {
      const z = chapter === 3 ? 8.8 : 12
      camera.position.set(3.1 + Math.sin(time * 0.1) * 2.2, 2.6 + Math.cos(time * 0.13) * 1.1, z)
      camera.lookAt(2.6, 1.4, 0)
      camera.updateMatrixWorld(true)
    }
  })
  return (
    <OrbitControls
      ref={controls}
      enabled={!movie}
      enableRotate={!flat}
      enableDamping
      minDistance={3}
      maxDistance={28}
      target={[2, 1.2, 0]}
    />
  )
}
function World(props: Props) {
  const { chapter, p, time, movie, flat, reveal, highlight, effects, node } = props
  const line = useMemo(() => graphPoints(p.a), [p.a]),
    inverse = useMemo(() => graphPoints(p.a, true), [p.a])
  const eg = useMemo(() => {
    const font = new FontLoader().parse(fontData)
    const g = new TextGeometry('e', {
      font,
      size: 2.4,
      depth: 0.28,
      curveSegments: 20,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 3,
    })
    g.center()
    return g
  }, [])
  useEffect(() => () => eg.dispose(), [eg])
  const axisProgress = movie && chapter === 2 ? Math.min(1, Math.max(0.01, (time - 36) / 2)) : 1
  const traceProgress = movie && chapter === 2 ? Math.min(1, Math.max(0.01, (time - 36) / 3)) : 1
  const drawnLine = line.slice(0, Math.max(2, Math.round(line.length * traceProgress))),
    drawnInverse = inverse.slice(0, Math.max(2, Math.round(inverse.length * traceProgress)))
  const h = p.h,
    x = p.x,
    y = logA(x, p.a),
    valid = x + h > 0 && h !== 0,
    s = secant(x, h, p.a),
    d = derivative(x, p.a),
    glow = (id: string) => (highlight === id ? 5 : 2)
  const boxes = Array.from({ length: 36 }, (_, i) => {
    const u = i / 35
    const v = Math.exp(Math.log1p(1 / p.n) * p.n * u)
    return {
      x: -2 + (i % 9) * 0.75,
      z: -1 - Math.floor(i / 9) * 0.9,
      h: v * (0.3 + (i % 5) * 0.12),
    }
  })
  return (
    <>
      <color attach="background" args={['#080e18']} />
      <fog attach="fog" args={['#080e18', 20, 45]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 7, 6]} intensity={2.5} color="#d6e9f4" />
      <pointLight position={[2, 4, 3]} intensity={55} color={gold} />
      <pointLight position={[-3, 1, 2]} intensity={40} color={cyan} />
      <Camera {...{ movie, flat, time, chapter }} />
      <gridHelper
        args={[26, 26, '#283c4b', '#14232f']}
        position={[2, -1.5, -2]}
        rotation={[0, 0, 0]}
      />
      {chapter === 0 && (
        <group>
          {boxes.map((b, i) => (
            <group key={i} position={[b.x, -1.5, b.z]}>
              <mesh position={[0, b.h / 2, 0]}>
                <boxGeometry args={[0.42, b.h, 0.48]} />
                <meshStandardMaterial
                  metalness={0.5}
                  roughness={0.25}
                  color={i % 3 === 0 ? gold : '#2c5968'}
                  emissive={i % 3 === 0 ? gold : cyan}
                  emissiveIntensity={0.15}
                />
              </mesh>
              <Pulse position={[0, b.h + 0.05, 0]} time={time + i} effects={effects} />
            </group>
          ))}
          <Line
            points={Array.from({ length: 100 }, (_, i) => {
              const u = i / 99
              return [-2 + u * 7, Math.exp(p.n * Math.log1p(1 / p.n) * u) - 1.5, 1] as Vec3
            })}
            color={cyan}
            lineWidth={3}
          />
        </group>
      )}
      {chapter === 1 && (
        <>
          <Line
            points={[
              [0, 0, 0],
              [6, 0, 0],
            ]}
            color="#758a9a"
            lineWidth={2}
          />
          <Line
            points={convergencePoints().map((v) => (flat ? ([v[0], v[1], 0] as Vec3) : v))}
            color={cyan}
            lineWidth={3}
          />
          <Line
            points={convergencePoints(true).map((v) => (flat ? ([v[0], v[1], 0] as Vec3) : v))}
            color={red}
            lineWidth={3}
          />
          {[1, -1].map((sign) => {
            const q = sign * Math.abs(h)
            return (
              <Pulse
                key={sign}
                position={[
                  -Math.log10(Math.abs(q)) - 1,
                  (limitExperiment(q) - 2.5) * 10,
                  flat ? 0 : sign * 0.55,
                ]}
                color={sign > 0 ? cyan : red}
                time={time}
                effects={effects}
              />
            )
          })}
          {reveal && (
            <Line
              points={[
                [0, (Math.E - 2.5) * 10, 0],
                [6, (Math.E - 2.5) * 10, 0],
              ]}
              color={gold}
              dashed
              dashSize={0.1}
              gapSize={0.1}
            />
          )}
        </>
      )}
      {chapter >= 2 && line.length > 1 && (
        <>
          <Html position={[7, 0, 0]} center>
            <span className="axis-label">x</span>
          </Html>
          <Html position={[0, 5, 0]} center>
            <span className="axis-label">y</span>
          </Html>
          {!flat && (
            <Html position={[0, 0, -3]} center>
              <span className="axis-label">z</span>
            </Html>
          )}
          <Html position={[1, -0.3, 0]} center>
            <span className="axis-label">1</span>
          </Html>
          <Html position={[-0.3, 1, 0]} center>
            <span className="axis-label">1</span>
          </Html>
          <Line
            points={[
              [-1, 0, 0],
              [7 * axisProgress, 0, 0],
            ]}
            color={chapter === 2 ? cyan : '#8195a5'}
            lineWidth={1.5}
          />
          <Line
            points={[
              [0, -3, 0],
              [0, 5 * axisProgress, 0],
            ]}
            color={chapter === 2 ? cyan : '#8195a5'}
            lineWidth={1.5}
          />
          {!flat && (
            <Line
              points={[
                [0, 0, -3 * axisProgress],
                [0, 0, 3 * axisProgress],
              ]}
              color="#334858"
              dashed
              dashSize={0.15}
              gapSize={0.15}
            />
          )}
          <Line points={drawnLine} color={cyan} lineWidth={highlight === 'curve' ? 5 : 3} />
          {(chapter === 2 || node === 'exp') && (
            <>
              <Line points={drawnInverse} color={gold} lineWidth={3} />
              <Line
                points={[
                  [-1, -1, 0],
                  [5, 5, 0],
                ]}
                color="#6a7c8e"
                dashed
                dashSize={0.1}
                gapSize={0.1}
              />
            </>
          )}
          {chapter >= 3 && (
            <>
              <Pulse position={[x, y, 0]} time={time} effects={effects} />
              {valid && node !== 'integral' && (
                <>
                  <Pulse
                    position={[x + h, logA(x + h, p.a), 0]}
                    time={time + 0.5}
                    effects={effects}
                    color={red}
                  />
                  <Line
                    points={[
                      [Math.max(0.08, x - 1), y + s * (Math.max(0.08, x - 1) - x), 0],
                      [x + 1.3, y + s * 1.3, 0],
                    ]}
                    color={red}
                    lineWidth={highlight === 'h' ? 5 : 2}
                  />
                  <Line
                    points={[
                      [x, y, 0],
                      [x + h, y, 0],
                      [x + h, logA(x + h, p.a), 0],
                    ]}
                    color="#b59c9f"
                    dashed
                    dashSize={0.08}
                    gapSize={0.06}
                  />
                </>
              )}
              <Line
                points={[
                  [Math.max(0.08, x - 1), y + d * (Math.max(0.08, x - 1) - x), 0.01],
                  [x + 1.4, y + d * 1.4, 0.01],
                ]}
                color={gold}
                lineWidth={highlight === 'slope' ? 5 : 3}
              />
            </>
          )}
          {chapter === 5 && node === 'integral' && (
            <group>
              {Array.from({ length: 36 }, (_, i) => {
                const q = 1 + ((x - 1) * (i + 0.5)) / 36,
                  height = 1 / q
                return (
                  <mesh key={i} position={[q, height / 2, -0.08]}>
                    <boxGeometry args={[Math.max(0.01, Math.abs(x - 1) / 36), height, 0.05]} />
                    <meshStandardMaterial color={x >= 1 ? gold : red} transparent opacity={0.5} />
                  </mesh>
                )
              })}
              <Line
                points={Array.from({ length: 100 }, (_, i) => {
                  const q = 0.2 + (i / 99) * 5.8
                  return [q, 1 / q, -0.08] as Vec3
                })}
                color={red}
                lineWidth={3}
              />
            </group>
          )}
        </>
      )}
      {chapter === 4 && reveal && (!movie || p.a === Math.E) && (
        <mesh
          geometry={eg}
          position={[4, 2.7, 0.8]}
          rotation={[0, -0.15 + Math.sin(time * 0.2) * 0.08, 0]}
          scale={effects ? 1 + 0.035 * Math.sin(time * 3) : 1}
        >
          <meshStandardMaterial
            color={gold}
            emissive={gold}
            emissiveIntensity={glow('e') * 0.25}
            metalness={0.8}
            roughness={0.22}
          />
        </mesh>
      )}
      <points rotation={[0, 0, effects ? time * 0.015 : 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from({ length: 56 }, (_, i) => {
                  const angle = i * 2.399
                  return [
                    Math.cos(angle) * (3 + i * 0.045) + 2,
                    Math.sin(angle) * (2 + i * 0.035) + 1,
                    -2 - (i % 5),
                  ]
                }).flat(),
              ),
              3,
            ]}
          />
        </bufferGeometry>
        <pointsMaterial color={cyan} size={0.025} transparent opacity={0.5} sizeAttenuation />
      </points>
    </>
  )
}
export function Scene(props: Props) {
  return (
    <Canvas
      frameloop={props.movie ? 'demand' : 'always'}
      dpr={props.movie ? 0.75 : [1, 1.5]}
      camera={{ fov: 42, near: 0.1, far: 100, position: [7, 4, 11] }}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
    >
      <World {...props} />
    </Canvas>
  )
}
