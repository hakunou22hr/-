import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useRef } from 'react'
import type { Mesh } from 'three'
import { CENTER, LEFT, RIGHT, distanceFromCenter, type Verdict } from './math'

const color = { inside: '#3cf49b', boundary: '#ffe55b', outside: '#ff4664' }

function Scene({ x, state, pulse }: { x: number; state: Verdict; pulse: number }) {
  const orb = useRef<Mesh>(null)
  const zone = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    if (orb.current) orb.current.position.y = .42 + Math.sin(clock.elapsedTime * 3) * .06
    if (zone.current) {
      const boost = state === 'inside' ? .94 + Math.sin(clock.elapsedTime * 4 + pulse) * .04 : .8
      ;(zone.current.material as { opacity: number }).opacity = boost * .3
    }
  })
  return <>
    <ambientLight intensity={.55}/><pointLight position={[CENTER, 5, 2]} color="#62eaff" intensity={35}/><pointLight position={[0, 3, -2]} color="#ffd867" intensity={22}/>
    <gridHelper args={[18, 18, '#174062', '#102944']} position={[0,-.03,0]}/>
    <mesh ref={zone} position={[CENTER,.13,0]}><boxGeometry args={[6,.25,3]}/><meshStandardMaterial color="#ffc928" emissive="#9d6200" emissiveIntensity={1.7} transparent opacity={.28}/></mesh>
    {[LEFT,RIGHT].map((n,i)=><group position={[n,1,0]} key={n}><mesh><boxGeometry args={[.06,2,3]}/><meshStandardMaterial color="#ff365d" emissive="#ff163f" emissiveIntensity={2} transparent opacity={.4}/></mesh><Text position={[0,1.3,0]} fontSize={.28} color="#ff9bad">{i?'3−√2':'−3−√2'}</Text></group>)}
    <mesh position={[CENTER,.27,0]}><sphereGeometry args={[.18,24,24]}/><meshStandardMaterial color="#3fe8ff" emissive="#18b9ff" emissiveIntensity={3}/></mesh>
    <Text position={[CENTER,.75,0]} fontSize={.28} color="#8ff4ff">中心 −√2</Text>
    <mesh position={[(x+CENTER)/2,.18,0]}><boxGeometry args={[Math.max(distanceFromCenter(x),.02),.055,.08]}/><meshStandardMaterial color="#78eaff" emissive="#38cfff" emissiveIntensity={2}/></mesh>
    <mesh ref={orb} position={[x,.42,0]}><sphereGeometry args={[.28,32,32]}/><meshStandardMaterial color={color[state]} emissive={color[state]} emissiveIntensity={2.4}/></mesh>
    <Text position={[x,1,0]} fontSize={.32} color={color[state]}>x = {x.toFixed(2)}</Text>
  </>
}

export default function Scene3D(props: { x:number; state:Verdict; pulse:number }) {
  return <div className="canvas"><Canvas camera={{position:[5,5,8],fov:46}} dpr={[1,1.6]}><Scene {...props}/><OrbitControls makeDefault minDistance={5} maxDistance={18} target={[CENTER,0,0]}/></Canvas><div className="orbit-note">↻ ドラッグで回転　⌕ ホイール / ピンチで拡大</div></div>
}
