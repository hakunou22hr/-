import {Canvas} from '@react-three/fiber'
import {Grid,Line,OrbitControls} from '@react-three/drei'
import {useState} from 'react'
import {orderedTriangle,value} from './math'

function supportsWebGL(){
  try{
    const c=document.createElement('canvas')
    return !!(c.getContext('webgl2')||c.getContext('webgl'))
  }catch{return false}
}

function Marker({p,color,label}:{p:[number,number,number],color:string,label:string}){
  return <group position={p} userData={{label}}>
    <mesh>
      <sphereGeometry args={[.16,20,20]}/>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3}/>
    </mesh>
  </group>
}

export default function ThreeD(){
  const[webgl]=useState(()=>supportsWebGL())
  if(!webgl)return <div className="runtime-fallback">
    <h3>この端末では3D表示を開始できませんでした</h3>
    <p>画面全体を停止せず、上のタブから「円を動かす」などの2D教材を利用できます。</p>
  </div>

  const tri=orderedTriangle()
  const lifted=tri.map(p=>[p.x,value(p)/3,p.y] as [number,number,number])

  return <div className="three">
    <Canvas camera={{position:[8,8,10],fov:48}}>
      <color attach="background" args={['#071522']}/>
      <ambientLight intensity={1.2}/>
      <pointLight position={[5,10,5]} intensity={30}/>
      <Grid args={[14,14]} cellColor="#24445e" sectionColor="#507595"/>
      {Array.from({length:22},(_,i)=>{
        const rad=i*.27
        return <Line key={i} points={Array.from({length:49},(_,j)=>{
          const t=j*Math.PI*2/48
          return [rad*Math.cos(t),rad*rad/3,rad*Math.sin(t)] as [number,number,number]
        })} color="#315c7b" transparent opacity={.6}/>
      })}
      <mesh>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[new Float32Array(lifted.flat()),3]}/>
        </bufferGeometry>
        <meshBasicMaterial color="#ffd65c" transparent opacity={.6} side={2}/>
      </mesh>
      <Line points={[...lifted,lifted[0]]} color="#ffe477" lineWidth={4}/>
      <Marker p={[.8,16/15,1.6]} color="#53f28f" label="H z=16/5"/>
      <Marker p={[2,20/3,4]} color="#ff5570" label="A z=20"/>
      <OrbitControls makeDefault minDistance={5} maxDistance={25}/>
    </Canvas>
    <div className="three-legend">
      <span className="legend-h">● H　z=16/5（最小）</span>
      <span className="legend-a">● A　z=20（最大）</span>
    </div>
    <p>ドラッグ：回転　／　ホイール・ピンチ：拡大縮小</p>
  </div>
}
