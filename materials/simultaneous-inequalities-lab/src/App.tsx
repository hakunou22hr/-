import{useMemo,useRef,useState}from'react'
import{Canvas,useThree}from'@react-three/fiber'
import{OrbitControls,Text}from'@react-three/drei'
import{BookOpen,ChevronLeft,ChevronRight,Eye,EyeOff,Lightbulb,Maximize2,RotateCcw,Sparkles}from'lucide-react'
import*as THREE from'three'
import{answer,contains,formatInequality,Inequality,parseInequality,reading,solve}from'./math'

const problems=[
 {title:'例題',a:'x > 1',b:'x < 5'},
 {title:'類題 1',a:'x ≥ -2',b:'x < 4'}, {title:'類題 2',a:'x > -1',b:'x ≤ 3'},
 {title:'類題 3',a:'x ≥ 2',b:'x > 0'}, {title:'類題 4',a:'x ≤ 4',b:'x < -1'},
 {title:'類題 5',a:'x ≥ 1',b:'x ≤ 1'}, {title:'類題 6',a:'x < -2',b:'x > 3'}]
const parse=(s:string)=>parseInequality(s)!

function endpoint(q:Inequality,x:(v:number)=>number,y:number,color:string,key:string){const filled=q.op.includes('=');return <g key={key} className="endpoint" transform={`translate(${x(q.value)} ${y})`}><circle r="9" fill={filled?color:'#07111f'} stroke={color} strokeWidth="4"/><circle className="pulse" r="14" fill="none" stroke={color}/></g>}
function NumberLine({items,step}:{items:Inequality[],step:number}){
 const sol=solve(items),min=Math.min(-5,...items.map(q=>q.value-2)),max=Math.max(7,...items.map(q=>q.value+2));const W=900,pad=58,scale=(v:number)=>pad+(v-min)/(max-min)*(W-pad*2)
 const rows=[{name:'不等式 1',y:82,color:'#ff4d61',qs:[items[0]]},{name:'不等式 2',y:168,color:'#42ef9b',qs:[items[1]]},{name:'共通部分',y:254,color:'#ffd75a',qs:items}]
 return <div className="chart"><svg viewBox={`0 0 ${W} 330`} role="img" aria-label="3段の数直線">
  <defs>{rows.map(r=><filter id={'glow'+r.y} key={r.y}><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>)}</defs>
  {rows.map((r,ri)=>{const visible=step>=ri;let xs:number[]=[];for(let i=0;i<=500;i++){const v=min+(max-min)*i/500;if(r.qs.every(q=>contains(q,v)))xs.push(v)}const empty=!xs.length&&!sol.point;const lo=xs.length?scale(xs[0]):0,hi=xs.length?scale(xs.at(-1)!):0;return <g key={r.name} className={'range-row '+(visible?'show':'hide')}>
   <text x="18" y={r.y-27} fill={r.color} className="row-title">{r.name}</text><line x1={pad} x2={W-pad} y1={r.y} y2={r.y} className="axis"/>
   {!empty&&!sol.point&&<><line x1={lo} x2={hi} y1={r.y} y2={r.y} stroke={r.color} className="range" filter={`url(#glow${r.y})`}/><path d={`M ${hi-12} ${r.y-7} L ${hi} ${r.y} L ${hi-12} ${r.y+7}`} fill="none" stroke={r.color} strokeWidth="4"/></>}
   {ri<2&&endpoint(items[ri],scale,r.y,r.color,r.name)}
   {ri===2&&!sol.empty&&sol.lower&&endpoint({op:sol.lower.inclusive?'>=':'>',value:sol.lower.value},scale,r.y,r.color,'low')}
   {ri===2&&!sol.empty&&sol.upper&&(!sol.lower||sol.upper.value!==sol.lower.value)&&endpoint({op:sol.upper.inclusive?'<=':'<',value:sol.upper.value},scale,r.y,r.color,'high')}
   {ri===2&&sol.empty&&<text x={W/2} y={r.y+8} textAnchor="middle" className="empty">重なる部分がありません</text>}
  </g>})}
  {Array.from({length:Math.floor(max)-Math.ceil(min)+1},(_,i)=>i+Math.ceil(min)).map(v=><g key={v}><line x1={scale(v)} x2={scale(v)} y1="294" y2="303" className="tick"/><text x={scale(v)} y="321" textAnchor="middle" className="num">{v}</text></g>)}<line x1={pad} x2={W-pad} y1="298" y2="298" className="base"/><text x={W-pad+12} y="304" className="num">x</text>
 </svg></div>
}

function Camera({preset,zoom}:{preset:string,zoom:number}){const{camera}=useThree();useMemo(()=>{const pos=preset==='front'?[0,2,10]:preset==='top'?[0,10,.01]:[8,6,9];camera.position.set(...pos as[number,number,number]);camera.zoom=zoom;camera.updateProjectionMatrix();camera.lookAt(0,0,0)},[camera,preset,zoom]);return null}
function Bar({q,y,color}:{q:Inequality,y:number,color:string}){const start=q.op.startsWith('>')?q.value:-6,end=q.op.startsWith('<')?q.value:6;return <group><mesh position={[(start+end)/2,y,0]}><boxGeometry args={[Math.max(.08,end-start),.22,1.15]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.45} transparent opacity={.72}/></mesh><mesh position={[q.value,y,0]}><sphereGeometry args={[.17,24,24]}/><meshStandardMaterial color={q.op.includes('=')?color:'#091423'} emissive={color} emissiveIntensity={2}/></mesh></group>}
function Scene3D({items,preset,zoom}:{items:Inequality[],preset:string,zoom:number}){const s=solve(items);let start=s.lower?.value??-6,end=s.upper?.value??6;return <Canvas camera={{position:[8,6,9],fov:42}}><color attach="background" args={['#07101c']}/><fog attach="fog" args={['#07101c',12,24]}/><ambientLight intensity={.65}/><pointLight position={[1,6,3]} intensity={30} color="#ffe6a0"/><gridHelper args={[14,14,'#25486b','#142a40']} position={[0,-1,0]}/><Bar q={items[0]} y={2} color="#ff4057"/><Bar q={items[1]} y={.4} color="#32e991"/>{!s.empty&&<mesh position={[(start+end)/2,-1,0]}><boxGeometry args={[s.point?.22:Math.max(.08,end-start),.34,1.4]}/><meshStandardMaterial color="#ffd449" emissive="#ffb300" emissiveIntensity={1.4} metalness={.55} roughness={.2}/></mesh>}<Text position={[-5.8,2.55,0]} fontSize={.34} color="#ff8190">不等式 1</Text><Text position={[-5.8,.95,0]} fontSize={.34} color="#70f4b3">不等式 2</Text><Text position={[-5.8,-.45,0]} fontSize={.34} color="#ffe079">共通部分</Text><Camera preset={preset} zoom={zoom}/><OrbitControls makeDefault enablePan={false}/></Canvas>}

export default function App(){
 const[index,setIndex]=useState(0),[mode,setMode]=useState<'2d'|'3d'>('2d'),[step,setStep]=useState(0),[reveal,setReveal]=useState(false),[custom,setCustom]=useState(false),[inputs,setInputs]=useState<[string,string]>(['x > 1','x < 5']),[errors,setErrors]=useState(''),[preset,setPreset]=useState('angle'),[zoom,setZoom]=useState(1)
 const current=problems[index];const items=custom?[parseInequality(inputs[0]),parseInequality(inputs[1])]:[parse(current.a),parse(current.b)];const valid=items.every(Boolean);const qs=valid?items as Inequality[]:[parse(current.a),parse(current.b)];const sol=solve(qs)
 const choose=(i:number)=>{setIndex(i);setCustom(false);setStep(0);setReveal(false)}
 const tryInputs=()=>{if(!valid)setErrors('「x >= -2」の形で入力してください。');else{setErrors('');setStep(2);setReveal(true)}}
 const steps=['1本目の範囲を見る','2本目も重ねる','共通部分を発見','答えを式で書く']
 return <main><header><div className="brand"><span className="brandmark">∩</span><div><p>MATH I · EXPLORATION LAB</p><h1>連立不等式を<span>見える化</span>しよう</h1><h2>2つの不等式の共通部分を、2Dと3Dで発見する</h2></div></div><div className="legend"><span><i className="red"/>不等式1</span><span><i className="green"/>不等式2</span><span><i className="gold"/>共通部分</span></div></header>
 <div className="layout"><aside className="control panel"><div className="eyebrow">MISSION 01</div><div className="tabs"><button className={!custom?'on':''} onClick={()=>setCustom(false)}>選択式</button><button className={custom?'on':''} onClick={()=>setCustom(true)}>入力して試す</button></div>
  {!custom?<><label>問題を選ぶ</label><select value={index} onChange={e=>choose(+e.target.value)}>{problems.map((p,i)=><option value={i} key={p.title}>{p.title}</option>)}</select><div className="problem"><small>{current.title}</small><strong>{formatInequality(qs[0])}</strong><strong>{formatInequality(qs[1])}</strong></div></>:<div className="inputbox"><label>不等式を2本入力</label><input value={inputs[0]} onChange={e=>setInputs([e.target.value,inputs[1]])}/><input value={inputs[1]} onChange={e=>setInputs([inputs[0],e.target.value])}/><button className="primary" onClick={tryInputs}>グラフに反映</button><small className="error">{errors}</small></div>}
  <label>表示モード</label><div className="viewtoggle"><button className={mode==='2d'?'on':''} onClick={()=>setMode('2d')}>2D 表示</button><button className={mode==='3d'?'on':''} onClick={()=>setMode('3d')}>3D 表示</button></div>
  <div className="teacher"><span>教師用</span><button onClick={()=>{setIndex(0);setCustom(false)}}>例題</button><button onClick={()=>choose(1)}>類題へ</button></div>
  <button className="reset" onClick={()=>{setStep(0);setReveal(false);setPreset('angle');setZoom(1)}}><RotateCcw size={16}/>リセット</button>
 </aside>
 <section className="stage panel"><div className="stagehead"><div><span className="status"><Sparkles size={14}/> VISUAL STAGE</span><h3>{step<3?steps[step]:'答えを確認しよう'}</h3></div><div className="stepdots">{steps.map((s,i)=><button key={s} className={i<=step?'active':''} onClick={()=>setStep(i)}>{i+1}</button>)}</div></div>
  <div className={'visual '+mode}>{mode==='2d'?<NumberLine items={qs} step={step}/>:<Scene3D items={qs} preset={preset} zoom={zoom}/>}</div>
  {mode==='3d'&&<div className="camera"><button onClick={()=>setPreset('front')}>正面</button><button onClick={()=>setPreset('top')}>上から見る</button><button onClick={()=>setPreset('angle')}>斜め</button><button onClick={()=>setPreset('angle')}><RotateCcw size={14}/>回転リセット</button><button onClick={()=>setZoom(z=>Math.min(1.6,z+.15))}>＋ 拡大</button><button onClick={()=>setZoom(z=>Math.max(.6,z-.15))}>− 縮小</button></div>}
  <div className="stagefoot"><button disabled={step===0} onClick={()=>setStep(s=>s-1)}><ChevronLeft/>戻る</button><span>STEP {step+1} / 4</span><button className="primary" onClick={()=>step<3?setStep(s=>s+1):setReveal(true)}>次へ<ChevronRight/></button></div>
 </section>
 <aside className="guide panel"><div className="guidehead"><BookOpen/><div><small>LEARNING GUIDE</small><h3>考え方のナビ</h3></div></div><div className="question"><Lightbulb/><div><small>いま考えること</small><strong>{step===0?`${qs[0].value} は含むのかな？`:step===1?`${qs[1].value} は含むのかな？`:step===2?'どこが共通しているかな？':'式ではどう書けるかな？'}</strong></div></div>
  <div className="readings"><h4>不等式の読み方</h4><p><i className="red"/><span><b>{formatInequality(qs[0])}</b>{reading(qs[0])}。{qs[0].op.includes('=')?'● は端の数を含みます。':'○ は端の数を含みません。'}</span></p><p><i className="green"/><span><b>{formatInequality(qs[1])}</b>{reading(qs[1])}。{qs[1].op.includes('=')?'● は端の数を含みます。':'○ は端の数を含みません。'}</span></p></div>
  <div className="hint"><b>共通部分とは？</b><p>赤と緑の両方を同時に満たす、重なった範囲です。</p></div>
  <button className="answerBtn" onClick={()=>setReveal(v=>!v)}>{reveal?<EyeOff/>:<Eye/>}{reveal?'答えを隠す':'答えを見る・解説を見る'}</button>
  {reveal&&<div className="answer"><small>FINAL ANSWER</small><strong>{answer(sol)}</strong><p>{sol.empty?'2つの範囲は重ならないため、解はありません。':sol.point?'端点を両方とも含み、共通するのはこの1点だけです。':'金色に光る場所が、2つを同時に満たす範囲です。'}</p></div>}
  <div className="problemnav"><button onClick={()=>choose((index+problems.length-1)%problems.length)}><ChevronLeft/>前の問題</button><button onClick={()=>choose((index+1)%problems.length)}>次の問題<ChevronRight/></button></div>
 </aside></div><footer><span>○ 含まない</span><span>● 含む</span><span><Maximize2 size={14}/> 3Dはドラッグ・ピンチ操作できます</span></footer></main>
}
