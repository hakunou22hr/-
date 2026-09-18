import {Canvas, useFrame, useThree} from '@react-three/fiber'
import {Html, OrbitControls, PerspectiveCamera} from '@react-three/drei'
import {useEffect, useMemo, useRef} from 'react'
import * as THREE from 'three'
import {diagonalKey, diagonals, isAdjacent, oneEdgeTriangles, sharedEdgeCount, sharedPolygonEdge, triangles, type Pair, type Triple} from './math'

const names='ABCDEFGHIJKL'
type Mode='diag'|'tri'|'edge'
type Props={n:number,mode:Mode,current:Pair|Triple|null,activePair:Pair|null,activeTriangleVertices:number[],showAll:boolean,completedDiagonalKeys:Set<string>,manual:boolean,base:Pair|null,tilt:boolean,cameraReset:number,onVertex:(x:number)=>void,onEdge:(x:number)=>void}

export const TRIANGLE_GOLD={main:'#FFD54A',core:'#FFF4B0',glow:'#FFB300',fill:'#FFC107'} as const
export const SHARED_EDGE_ORANGE={main:'#FF6B3D',core:'#FFF4B0',glow:'#FF8A00'} as const

export function createTriangleRenderData(vertices:number[],points:THREE.Vector3[]){
  if(vertices.length!==3)return{triangle:null,key:null,edges:[] as Pair[],shapePoints:[] as [number,number][]}
  const triangle=[...vertices].sort((a,b)=>a-b) as Triple
  return{triangle,key:triangle.join('-'),edges:[[triangle[0],triangle[1]],[triangle[1],triangle[2]],[triangle[2],triangle[0]]] as Pair[],shapePoints:triangle.map(i=>[points[i].x,-points[i].z] as [number,number])}
}

function Segment({a,b,y,color,radius,opacity=1,glow=false,glowColor=color,coreColor,glowScale=2.7,glowOpacity=.18,emissiveIntensity=2.5,onClick}:{a:THREE.Vector3,b:THREE.Vector3,y:number,color:string,radius:number,opacity?:number,glow?:boolean,glowColor?:string,coreColor?:string,glowScale?:number,glowOpacity?:number,emissiveIntensity?:number,onClick?:()=>void}){
  const data=useMemo(()=>{const start=a.clone();start.y=y;const end=b.clone();end.y=y;const delta=end.clone().sub(start);return{mid:start.clone().add(end).multiplyScalar(.5),length:delta.length(),rotation:new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize())}},[a,b,y])
  return <group position={data.mid} quaternion={data.rotation} onClick={e=>{if(onClick){e.stopPropagation();onClick()}}}>
    {glow&&<mesh><cylinderGeometry args={[radius*glowScale,radius*glowScale,data.length,12]}/><meshBasicMaterial color={glowColor} transparent opacity={glowOpacity} depthWrite={false} blending={THREE.AdditiveBlending}/></mesh>}
    <mesh castShadow><cylinderGeometry args={[radius,radius,data.length,16]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow?emissiveIntensity:.18} transparent opacity={opacity} depthTest={!glow}/></mesh>
    {coreColor&&<mesh><cylinderGeometry args={[radius*.38,radius*.38,data.length*1.002,16]}/><meshBasicMaterial color={coreColor} transparent opacity={.96} depthWrite={false}/></mesh>}
  </group>
}

function CameraRig({tilt,reset}:{tilt:boolean,reset:number}){
  const controls=useRef<any>(null);const {camera}=useThree()
  useEffect(()=>{const p=tilt?new THREE.Vector3(4.6,5.1,5.2):new THREE.Vector3(0,3.8,6.6);camera.position.copy(p);camera.zoom=1;camera.updateProjectionMatrix();controls.current?.target.set(0,0,0);controls.current?.update()},[tilt,reset,camera])
  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={.08} minDistance={4.5} maxDistance={11} maxPolarAngle={Math.PI*.48}/>
}

function Scene(p:Props){
  const pts=useMemo(()=>Array.from({length:p.n},(_,i)=>{const a=-Math.PI/2+i*2*Math.PI/p.n;return new THREE.Vector3(2.25*Math.cos(a),0,2.25*Math.sin(a))}),[p.n])
  const act=new Set([...(p.activePair||[]),...p.activeTriangleVertices])
  const all=p.mode==='diag'?diagonals(p.n):p.mode==='tri'?triangles(p.n):oneEdgeTriangles(p.n)
  const completed=p.mode==='diag'?diagonals(p.n).filter(pair=>p.completedDiagonalKeys.has(diagonalKey(...pair))&&(!p.activePair||diagonalKey(...pair)!==diagonalKey(...p.activePair))):[]
  const visible=p.showAll?all:p.mode==='diag'?[...completed,...(p.activePair?[p.activePair]:[])]:p.current?[p.current]:[]
  const triangleData=useMemo(()=>createTriangleRenderData(p.activeTriangleVertices,pts),[p.activeTriangleVertices,pts])
  const tri=triangleData.triangle;const triangleKey=triangleData.key;const triangleEdges=triangleData.edges
  const validEdgeTriangle=p.mode==='edge'&&!!tri&&sharedEdgeCount(tri,p.n)===1
  const sharedEdge=validEdgeTriangle&&tri?sharedPolygonEdge(tri,p.n):null
  const isSharedEdge=(a:number,b:number)=>!!sharedEdge&&diagonalKey(a,b)===diagonalKey(...sharedEdge)
  const goldTriangle=p.mode==='tri'||validEdgeTriangle
  const triShape=useMemo(()=>{if(!triangleData.shapePoints.length)return undefined;const shape=new THREE.Shape();triangleData.shapePoints.forEach(([x,y],i)=>i===0?shape.moveTo(x,y):shape.lineTo(x,y));shape.closePath();return shape},[triangleData])
  const pulse=useRef<THREE.Group>(null);const trianglePulse=useRef<THREE.Group>(null);useFrame(({clock})=>{if(pulse.current)pulse.current.scale.setScalar(1+Math.sin(clock.elapsedTime*4)*.025);if(trianglePulse.current)trianglePulse.current.scale.setScalar(1+(1-Math.cos(clock.elapsedTime*1.5))*.015)})
  return <>
    <PerspectiveCamera makeDefault fov={43} near={.1} far={100}/><CameraRig tilt={p.tilt} reset={p.cameraReset}/>
    <ambientLight intensity={.75}/><directionalLight position={[4,8,5]} intensity={2.2} castShadow shadow-mapSize={[1024,1024]}/><pointLight position={[-4,3,-3]} color="#3feaff" intensity={20}/>
    <gridHelper args={[18,18,'#1c6680','#153247']} position={[0,-.5,0]}/>
    <mesh position={[0,-.34,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[5.9,5.9]}/><shadowMaterial transparent opacity={.32}/></mesh>
    <mesh position={[0,-.17,0]} receiveShadow castShadow><cylinderGeometry args={[2.85,2.85,.2,64]}/><meshPhysicalMaterial color="#10283a" transparent opacity={.72} roughness={.32} metalness={.25} transmission={.08}/></mesh>
    <mesh position={[0,-.055,0]}><cylinderGeometry args={[2.66,2.66,.035,64]}/><meshBasicMaterial color="#45e6f2" transparent opacity={.12}/></mesh>
    {pts.map((q,i)=>{const r=pts[(i+1)%p.n];const selected=!!p.activePair&&isAdjacent(p.activePair[0],p.activePair[1],p.n)&&p.activePair.includes(i)&&p.activePair.includes((i+1)%p.n);return <Segment key={'s'+i} a={q} b={r} y={.08} color={selected?'#fff36b':'#b6cad6'} radius={selected?.055:.026} glow={selected} onClick={p.manual?()=>p.onEdge(i):undefined}/>})}
    {visible.filter(x=>x.length===2).map(line=>{const pair=line as Pair;const active=!!p.activePair&&diagonalKey(...pair)===diagonalKey(...p.activePair);return <group ref={active?pulse:undefined} key={`d-${pair[0]}-${pair[1]}`}><Segment a={pts[pair[0]]} b={pts[pair[1]]} y={active ? .28 : .19} color={active?'#6ff7ff':'#45dce9'} radius={active ? .047 : .018} opacity={active?1:(p.showAll ? .32 : .72)} glow={active}/></group>})}
    <group ref={goldTriangle&&tri?trianglePulse:undefined}>
      {triangleEdges.map(([a,b])=>{const shared=isSharedEdge(a,b);return <Segment key={`triangle-edge-${triangleKey}-${a}-${b}`} a={pts[a]} b={pts[b]} y={shared ? .275 : .25} color={shared?SHARED_EDGE_ORANGE.main:goldTriangle?TRIANGLE_GOLD.main:'#6ff7ff'} glowColor={shared?SHARED_EDGE_ORANGE.glow:goldTriangle?TRIANGLE_GOLD.glow:undefined} coreColor={goldTriangle?(shared?SHARED_EDGE_ORANGE.core:TRIANGLE_GOLD.core):undefined} radius={shared ? .068 : goldTriangle ? .048 : .032} opacity={goldTriangle?1:.92} glow glowScale={shared?3.5:2.7} glowOpacity={shared ? .3 : .18} emissiveIntensity={shared?3.8:2.5}/>})}
      {tri&&triShape&&<>{goldTriangle&&<mesh key={`triangle-glow-${triangleKey}`} position={[0,.215,0]} rotation={[-Math.PI/2,0,0]} scale={1.025}><shapeGeometry args={[triShape]}/><meshBasicMaterial color={TRIANGLE_GOLD.glow} transparent opacity={.1} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending}/></mesh>}<mesh key={`triangle-fill-${triangleKey}`} position={[0,.22,0]} rotation={[-Math.PI/2,0,0]}><shapeGeometry args={[triShape]}/><meshBasicMaterial color={goldTriangle?TRIANGLE_GOLD.fill:sharedEdgeCount([...tri].sort((a,b)=>a-b)as Triple,p.n)!==1&&p.mode==='edge'?'#ff5578':'#49efff'} transparent opacity={goldTriangle ? .3 : .27} side={THREE.DoubleSide} depthWrite={false}/></mesh></>}
    </group>
    {pts.map((q,i)=>{const active=act.has(i);const triangleActive=goldTriangle&&p.activeTriangleVertices.includes(i);const sharedVertex=triangleActive&&!!sharedEdge?.includes(i);return <group key={i} position={[q.x,active ? .31 : .16,q.z]} onClick={e=>{e.stopPropagation();p.onVertex(i)}}>
      {active&&<mesh><sphereGeometry args={[sharedVertex ? .285 : triangleActive ? .255 : .22,20,20]}/><meshBasicMaterial color={sharedVertex?SHARED_EDGE_ORANGE.glow:triangleActive?TRIANGLE_GOLD.glow:'#53f3ff'} transparent opacity={sharedVertex ? .32 : triangleActive ? .25 : .18} depthWrite={false} blending={triangleActive?THREE.AdditiveBlending:THREE.NormalBlending}/></mesh>}
      <mesh castShadow><sphereGeometry args={[triangleActive ? .135 : active ? .115 : .08,24,24]}/><meshStandardMaterial color={triangleActive?TRIANGLE_GOLD.core:'#f4fcff'} emissive={triangleActive?TRIANGLE_GOLD.main:active?'#45e6f2':'#213b4b'} emissiveIntensity={active?3:.4}/></mesh>
      <Html center position={[q.x*.08,.22,q.z*.08]} className={'vertex-label '+(active?'active ':'')+(triangleActive?'triangle-active':'')} distanceFactor={7} occlude={false}>{names[i]}</Html>
    </group>})}
  </>
}

export default function Polygon3D(props:Props){return <div className="three-canvas" role="img" aria-label={`空間に浮かぶ正${props.n}角形`}><Canvas shadows dpr={[1,2]} gl={{antialias:true,alpha:true}}><Scene {...props}/></Canvas><div className="orbit-note">左ドラッグ：回転 · ホイール：拡大縮小 · 右ドラッグ：移動</div></div>}
