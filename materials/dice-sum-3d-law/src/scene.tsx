import { Edges, Html, OrbitControls } from '@react-three/drei'
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

type PointProps = { triple: DiceTriple; active: boolean; muted: boolean; color: string; label: boolean; eventSum?: 7 | 14 }
function Point({ triple, active, muted, color, label, eventSum }: PointProps) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => { if (ref.current) ref.current.scale.setScalar(active ? 1 + Math.sin(clock.elapsedTime * 3) * .09 : 1) })
  const [hover, setHover] = useState(false)
  const [x,y,z] = triple
  return <group ref={ref} position={[x-3.5,z*.72-.35,y-3.5]}>
    {active && <>
      <mesh scale={1.75}><sphereGeometry args={[.42,20,20]}/><meshBasicMaterial color={color} transparent opacity={.18} depthWrite={false} blending={THREE.AdditiveBlending}/></mesh>
      {/* The vertical beam makes the third die (the z/height component) especially easy to follow. */}
      <mesh position={[0,-z*.36+.18,0]}><cylinderGeometry args={[.09,.22,z*.72-.18,16]}/><meshBasicMaterial color={color} transparent opacity={.24} depthWrite={false} blending={THREE.AdditiveBlending}/></mesh>
      <pointLight color={color} intensity={9} distance={2.8}/>
    </>}
    <mesh onPointerOver={(e) => { e.stopPropagation(); setHover(true) }} onPointerOut={() => setHover(false)}>
      <boxGeometry args={[.53,.53,.53]} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={active ? 5 : .12} transparent opacity={muted ? .045 : active ? .98 : .22} roughness={.08} metalness={active ? .28 : .05} transmission={active ? 0 : .25} />
      {active && <Edges color={color} threshold={1} scale={1.1}/>}
    </mesh>
    {(label || hover) && <Html center distanceFactor={active ? 7.5 : 9}><span className={`point-label ${eventSum ? `sum-${eventSum}` : ''} ${active ? 'hot' : ''}`}>({triple.join(',')})<b>和 = {sumOf(triple)}</b><small>代表 {`{${toUnorderedRepresentative(triple).join(',')}}`}</small></span></Html>}
  </group>
}

function World({ ordered, sums, current, showAll }: Omit<Props,'view'|'resetKey'>) {
  const triples = useMemo(() => ordered ? generateOrderedTriples() : generateUnorderedTriples(), [ordered])
  const currentKey = current && keyOf(current)
  return <>
    <ambientLight intensity={.55}/><directionalLight position={[4,10,5]} intensity={1.2}/><pointLight position={[-5,5,4]} color="#6ce9ff" intensity={25}/>
    <gridHelper args={[6,6,'#59809e','#29435e']} position={[0,0,0]} />
    {triples.map((triple) => {
      const sum = sumOf(triple); const matching = sums.includes(sum)
      const representativeKey = keyOf(toUnorderedRepresentative(triple)); const selected = currentKey === representativeKey
      const visibleMatch = matching && (showAll || selected)
      const eventSum = sum === 7 ? 7 : sum === 14 ? 14 : undefined
      const eventColor = eventSum === 7 ? '#ffbf24' : eventSum === 14 ? '#ff3b30' : '#8ad8ff'
      return <Point key={keyOf(triple)} triple={triple} active={visibleMatch} muted={sums.length > 0 && !visibleMatch} color={eventColor} eventSum={eventSum} label={visibleMatch && (!ordered || keyOf(triple) === representativeKey)} />
    })}
    {['x：1個目','z：3個目','y：2個目'].map((text,i) => <Html key={text} position={i===0?[3.8,0,0]:i===1?[0,4.6,0]:[0,0,3.8]} center><span className="axis-label">{text}</span></Html>)}
  </>
}

export default function DiceScene(props: Props) {
  return <Canvas dpr={[1,1.5]} camera={{ position:[10,9,11], fov:45 }} gl={{ antialias:true }}><color attach="background" args={['#101c30']} /><fog attach="fog" args={['#101c30',14,25]}/><World {...props}/><Camera view={props.view} resetKey={props.resetKey}/></Canvas>
}
