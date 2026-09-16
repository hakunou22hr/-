import { Html, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { generateOrderedTriples, generateUnorderedTriples, sumOf, toUnorderedRepresentative, type DiceTriple } from './diceMath'

export type ViewName = 'front' | 'top' | 'angle'
type Props = { ordered: boolean; sums: number[]; current: DiceTriple | null; showAll: boolean; view: ViewName; resetKey: number }

const keyOf = (t: DiceTriple) => t.join('-')

function Camera({ view, resetKey }: { view: ViewName; resetKey: number }) {
  const { camera } = useThree()
  useEffect(() => {
    const positions = { front: [0, 3, 13], top: [0, 14, .01], angle: [10, 9, 11] } as const
    camera.position.set(...positions[view]); camera.lookAt(0, 2, 0)
  }, [camera, view, resetKey])
  return <OrbitControls makeDefault target={[0, 2, 0]} enablePan={false} minDistance={7} maxDistance={22} />
}

function Point({ triple, active, muted, color, label }: { triple: DiceTriple; active: boolean; muted: boolean; color: string; label: boolean }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => { if (ref.current && active) ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 3) * .1) })
  const [hover, setHover] = useState(false)
  const [x,y,z] = triple
  return <group position={[x-3.5,z*.72-.35,y-3.5]}>
    <mesh ref={ref} onPointerOver={(e) => { e.stopPropagation(); setHover(true) }} onPointerOut={() => setHover(false)}>
      <boxGeometry args={[.53,.53,.53]} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={active ? 2.5 : .18} transparent opacity={muted ? .08 : active ? .82 : .27} roughness={.12} metalness={.05} transmission={.25} />
    </mesh>
    {(label || hover) && <Html center distanceFactor={9}><span className={`point-label ${active ? 'hot' : ''}`}>({triple.join(',')})<b>和={sumOf(triple)}</b><small>代表 {`{${toUnorderedRepresentative(triple).join(',')}}`}</small></span></Html>}
  </group>
}

function World({ ordered, sums, current, showAll }: Omit<Props,'view'|'resetKey'>) {
  const triples = useMemo(() => ordered ? generateOrderedTriples() : generateUnorderedTriples(), [ordered])
  const currentKey = current && keyOf(current)
  return <>
    <ambientLight intensity={.65}/><directionalLight position={[4,10,5]} intensity={1.3}/><pointLight position={[-5,5,4]} color="#6ce9ff" intensity={35}/>
    <gridHelper args={[6,6,'#59809e','#29435e']} position={[0,0,0]} />
    {triples.map((triple) => {
      const sum = sumOf(triple); const matching = sums.includes(sum)
      const representativeKey = keyOf(toUnorderedRepresentative(triple)); const selected = currentKey === representativeKey
      const visibleMatch = matching && (showAll || selected)
      return <Point key={keyOf(triple)} triple={triple} active={visibleMatch} muted={sums.length > 0 && !visibleMatch} color={sum === 14 ? '#ff7b82' : visibleMatch ? '#48e4c2' : '#8ad8ff'} label={visibleMatch && (!ordered || keyOf(triple) === representativeKey)} />
    })}
    {['x：1個目','z：3個目','y：2個目'].map((text,i) => <Html key={text} position={i===0?[3.8,0,0]:i===1?[0,4.6,0]:[0,0,3.8]} center><span className="axis-label">{text}</span></Html>)}
  </>
}

export default function DiceScene(props: Props) {
  return <Canvas dpr={[1,1.5]} camera={{ position:[10,9,11], fov:45 }} gl={{ antialias:true }}><color attach="background" args={['#101c30']} /><fog attach="fog" args={['#101c30',14,25]}/><World {...props}/><Camera view={props.view} resetKey={props.resetKey}/></Canvas>
}
