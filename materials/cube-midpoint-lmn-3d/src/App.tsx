import { Canvas, useThree } from '@react-three/fiber'
import { Billboard, Html, Line, OrbitControls } from '@react-three/drei'
import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'

type PointName = 'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'L'|'M'|'N'
type TriangleName = 'LFM'|'LGN'|'MGN'|'LMN'
const raw: Record<PointName, [number,number,number]> = {
  E:[0,0,0],F:[6,0,0],G:[6,6,0],H:[0,6,0],A:[0,0,6],B:[6,0,6],C:[6,6,6],D:[0,6,6],
  L:[3,0,0],M:[6,3,0],N:[6,6,3],
}
// Mathematics uses z vertically; Three.js uses y vertically.
const p = (name: PointName) => new THREE.Vector3(raw[name][0]-3, raw[name][2]-3, raw[name][1]-3)
const cubeEdges: [PointName,PointName][] = [['E','F'],['F','G'],['G','H'],['H','E'],['A','B'],['B','C'],['C','D'],['D','A'],['E','A'],['F','B'],['G','C'],['H','D']]
const triangles: Record<TriangleName, PointName[]> = {LFM:['L','F','M'],LGN:['L','G','N'],MGN:['M','G','N'],LMN:['L','M','N']}

function Label({name, muted=false}:{name:PointName,muted?:boolean}) {
  return <Billboard position={p(name)}><Html center distanceFactor={11}><span className={`point-label ${muted?'muted':''}`}>{name}</span></Html></Billboard>
}
function GlowLine({a,b,color,width=4}:{a:PointName,b:PointName,color:string,width?:number}) {
  return <group><Line points={[p(a),p(b)]} color={color} lineWidth={width+7} transparent opacity={.13}/><Line points={[p(a),p(b)]} color={color} lineWidth={width}/></group>
}
function Triangle({names, color='#ffc843', opacity=.22}:{names:PointName[],color?:string,opacity?:number}) {
  const geometry=useMemo(()=>{
    const g=new THREE.BufferGeometry().setFromPoints(names.map(n=>p(n)))
    g.setIndex([0,1,2]);g.computeVertexNormals();return g
  },[names.join('')])
  return <mesh geometry={geometry}><meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false}/></mesh>
}
function AngleArc() {
  const pts=useMemo(()=>{
    const m=p('M'),u=p('L').sub(m).normalize(),w=p('N').sub(m).normalize()
    const angle=Math.acos(THREE.MathUtils.clamp(u.dot(w),-1,1))
    const v=w.clone().sub(u.clone().multiplyScalar(Math.cos(angle))).normalize()
    return Array.from({length:33},(_,i)=>m.clone().add(u.clone().multiplyScalar(Math.cos(angle*i/32)*1.25)).add(v.clone().multiplyScalar(Math.sin(angle*i/32)*1.25)))
  },[])
  return <group><Line points={pts} color="#4dff9a" lineWidth={12} transparent opacity={.15}/><Line points={pts} color="#4dff9a" lineWidth={5}/></group>
}
function IntroMeasures() {
  return <group>
    <GlowLine a="E" b="F" color="#ffffff" width={3}/><GlowLine a="F" b="G" color="#ffffff" width={3}/><GlowLine a="G" b="C" color="#ffffff" width={3}/>
    {(['L','M','N'] as PointName[]).map((n,i)=><mesh key={n} position={p(n)}><sphereGeometry args={[.14,20,20]}/><meshBasicMaterial color={['#ff596d','#66baff','#ffd15c'][i]}/></mesh>)}
    {([['L','EL = LF = 3'],['M','FM = MG = 3'],['N','GN = NC = 3']] as [PointName,string][]).map(([n,text])=><Html key={n} position={p(n).add(new THREE.Vector3(0,.45,0))} center distanceFactor={10}><span className="measure">{text}</span></Html>)}
  </group>
}
function CameraReset({token}:{token:number}) { const {camera}=useThree(); useEffect(()=>{camera.position.set(10,8,11);camera.lookAt(0,0,0)},[camera,token]);return null }

function Scene({step,flat,reset}:{step:number,flat:TriangleName|null,reset:number}) {
  const flatNames=flat?triangles[flat]:null
  const transform=useMemo(()=>{
    if(!flatNames)return {q:new THREE.Quaternion(),c:new THREE.Vector3()}
    const vs=flatNames.map(p),c=vs.reduce((a,v)=>a.add(v),new THREE.Vector3()).multiplyScalar(1/3)
    const normal=vs[1].clone().sub(vs[0]).cross(vs[2].clone().sub(vs[0])).normalize()
    return {q:new THREE.Quaternion().setFromUnitVectors(normal,new THREE.Vector3(0,0,1)),c}
  },[flat])
  return <>
    <color attach="background" args={['#07111f']}/><ambientLight intensity={1.1}/><pointLight position={[5,9,8]} intensity={35}/>
    <CameraReset token={reset}/>
    <group quaternion={flat?transform.q:undefined} position={flat?transform.c.clone().applyQuaternion(transform.q).multiplyScalar(-1):undefined}>
      {!flat && <>
        {cubeEdges.map(([a,b])=><Line key={a+b} points={[p(a),p(b)]} color="#5c7897" lineWidth={1.4} transparent opacity={.72}/>)}
        {(['A','B','C','D','E','F','G','H'] as PointName[]).map(n=><Label name={n} muted key={n}/>)}
      </>}
      {(flatNames??(['L','M','N'] as PointName[])).map(n=><Label name={n} key={n}/>)}
      {!flat && step===0 && <IntroMeasures/>}
      {flat && <><Triangle names={flatNames!} opacity={flat==='LMN'?.32:.16}/>{flatNames!.map((n,i)=><GlowLine key={n} a={n} b={flatNames![(i+1)%3]} color={flat==='LMN'?'#ffc843':'#9fbbd2'} width={3}/>)}</>}
      {(!flat||flat==='LMN') && step>=3 && <><Triangle names={triangles.LMN} opacity={.32}/>{triangles.LMN.map((n,i)=><GlowLine key={n} a={n} b={triangles.LMN[(i+1)%3]} color="#ffc843" width={4}/>)}</>}
      {(!flat||flat==='LMN') && step>=1 && <><GlowLine a="L" b="M" color="#ff3f5f" width={6}/><GlowLine a="L" b="N" color="#2f8fff" width={6}/></>}
      {(!flat||flat==='LMN') && step>=2 && <AngleArc/>}
    </group>
    <OrbitControls makeDefault enableDamping dampingFactor={.08} minDistance={5} maxDistance={25}/>
  </>
}

const stepData=[
  {title:'中点＝3',body:<><b>1辺 6</b> の半分は <strong>3</strong>。L・M・Nはそれぞれの辺の中央です。</>},
  {title:'LM・LN',body:<><span className="red">LM = 3√2</span><span className="blue">LN = 3√6</span><span>MN = 3√2</span></>},
  {title:'∠LMN',body:<><span>余弦定理より</span><strong>∠LMN = 120°</strong></>},
  {title:'△LMNの面積',body:<><span>S = <span className="frac"><i>1</i><i>2</i></span>・LM・MN・sin 120°</span><strong>S = <span className="frac"><i>9√3</i><i>2</i></span></strong></>},
]

export default function App(){
  const[step,setStep]=useState(0),[flat,setFlat]=useState<TriangleName|null>(null),[picker,setPicker]=useState(false),[reset,setReset]=useState(0)
  return <main>
    <header><a href="../../" className="back">← 教材一覧</a><div><small>MATHEMATICS A · SPATIAL GEOMETRY</small><h1>立方体の中点を結ぶ三角形<span>｜3D探究</span></h1></div><div className="side">一辺 <b>6</b></div></header>
    <section className="workspace">
      <div className="stage">
        <Canvas camera={{position:[10,8,11],fov:42}} dpr={[1,2]}><Scene step={step} flat={flat} reset={reset}/></Canvas>
        {step===0&&!flat&&<div className="intro-callout"><b>EF = 6</b><i>→</i><strong>中点まで 3</strong></div>}
        <div className="hint">↻ ドラッグで回転　⌕ ホイール / ピンチで拡大</div>
        <div className="view-tools">
          <button className={picker?'active':''} onClick={()=>setPicker(v=>!v)}>▱ 平面を取り出す</button>
          <button onClick={()=>{setFlat(null);setPicker(false);setReset(v=>v+1)}}>⟳ 立方体に戻す</button>
          {picker&&<div className="picker" aria-label="取り出す平面">{(Object.keys(triangles) as TriangleName[]).map(t=><button className={flat===t?'selected':''} onClick={()=>setFlat(t)} key={t}>△{t}</button>)}</div>}
        </div>
        {flat&&<div className="flat-badge">正面表示　△{flat}</div>}
      </div>
      <aside>
        <div className="question"><small>QUESTION</small><p>一辺6の立方体で、EF・FG・GCの中点を L・M・N とする。</p><ol><li>LM、LNの長さ</li><li>∠LMN</li><li>△LMNの面積</li></ol></div>
        <nav className="steps" aria-label="探究ステップ">{stepData.map((s,i)=><button key={s.title} className={step===i?'current':step>i?'done':''} onClick={()=>{setStep(i);setFlat(null)}}><span>{step>i?'✓':i}</span><div><small>STEP {i}</small>{s.title}</div></button>)}</nav>
        <article className={`answer step-${step}`}><small>STEP {step}</small><h2>{stepData[step].title}</h2><div className="answer-body">{stepData[step].body}</div></article>
        <div className="pager"><button disabled={step===0} onClick={()=>setStep(s=>s-1)}>← 戻る</button><button disabled={step===3} onClick={()=>setStep(s=>s+1)}>次へ →</button></div>
      </aside>
    </section>
  </main>
}
