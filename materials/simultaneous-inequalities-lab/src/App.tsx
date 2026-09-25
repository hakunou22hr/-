import{useMemo,useState}from'react'
import{Canvas,useThree}from'@react-three/fiber'
import{OrbitControls,Text}from'@react-three/drei'
import{BookOpen,ChevronLeft,ChevronRight,Eye,EyeOff,Lightbulb,Maximize2,RotateCcw,Sparkles}from'lucide-react'
import{answer,formatInequality,Inequality,inequalityVisual,parseInequality,reading,solve}from'./math'

const problems=[
 {title:'例題',a:'x > 1',b:'x < 5'},
 {title:'類題 1',a:'x ≥ -2',b:'x < 4'}, {title:'類題 2',a:'x > -1',b:'x ≤ 3'},
 {title:'類題 3',a:'x ≥ 2',b:'x > 0'}, {title:'類題 4',a:'x ≤ 4',b:'x < -1'},
 {title:'類題 5',a:'x ≥ 1',b:'x ≤ 1'}, {title:'類題 6',a:'x < -2',b:'x > 3'}]
const parse=(s:string)=>parseInequality(s)!

function Endpoint({value,inclusive,x,y,color,label}:{value:number,inclusive:boolean,x:(v:number)=>number,y:number,color:string,label:string}){return <g transform={`translate(${x(value)} ${y})`} className="endpoint-position"><g className={'endpoint '+(inclusive?'closed':'open')} aria-label={`${value}を${inclusive?'含む':'含まない'}`}><circle className="endpoint-halo" r="18" fill="none" stroke={color}/><circle className="endpoint-dot" r="12" fill={inclusive?color:'#07111f'} stroke={color} strokeWidth="5"/><text className="boundary-label" x="0" y="34" textAnchor="middle" fill={color}>{label}</text></g></g>}
function InequalityRange({q,x,y,color,index}:{q:Inequality,x:(v:number)=>number,y:number,color:string,index:number}){const v=inequalityVisual(q),edge=v.direction==='right'?x(1e4):x(-1e4),boundary=x(v.boundary);return <g className={`inequality-visual direction-${v.direction}`}>
 {v.direction!=='point'&&<line x1={boundary} x2={edge} y1={y} y2={y} stroke={color} className="range directional-range" pathLength="1" style={{transformOrigin:`${boundary}px ${y}px`}}/>}
 {v.direction!=='point'&&<path d={v.direction==='right'?`M ${edge-17} ${y-9} L ${edge} ${y} L ${edge-17} ${y+9}`:`M ${edge+17} ${y-9} L ${edge} ${y} L ${edge+17} ${y+9}`} fill="none" stroke={color} strokeWidth="5" className="arrowhead"/>}
 <Endpoint value={v.boundary} inclusive={v.endpoint==='closed'} x={x} y={y} color={color} label={String(v.boundary)}/>
 <text x="22" y={y-28} fill={color} className="row-title">[{index}] {formatInequality(q)}</text>
 </g>}
function NumberLine({items,step}:{items:Inequality[],step:number}){
 const sol=solve(items),min=Math.min(-5,...items.map(q=>q.value-2)),max=Math.max(7,...items.map(q=>q.value+2));const W=900,pad=58,scale=(v:number)=>pad+(v-min)/(max-min)*(W-pad*2)
 return <div className="chart"><svg viewBox={`0 0 ${W} 330`} role="img" aria-label="3段の数直線">
  <defs><filter id="redGlow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="greenGlow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="goldGlow"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  {[82,168,254].map(y=><line key={y} x1={pad} x2={W-pad} y1={y} y2={y} className="axis"/>)}
  <g className={'range-row '+(step>=0?'show':'hide')} filter="url(#redGlow)"><InequalityRange q={items[0]} x={v=>scale(Math.max(min,Math.min(max,v)))} y={82} color="#ff4d61" index={1}/></g>
  <g className={'range-row '+(step>=1?'show':'hide')} filter="url(#greenGlow)"><InequalityRange q={items[1]} x={v=>scale(Math.max(min,Math.min(max,v)))} y={168} color="#42ef9b" index={2}/></g>
  <g className={'range-row common-row '+(step>=2?'show':'hide')} filter="url(#goldGlow)"><text x="22" y="226" fill="#ffd75a" className="row-title">[3] 共通部分</text>
   {!sol.empty&&!sol.point&&<line x1={scale(sol.lower?.value??min)} x2={scale(sol.upper?.value??max)} y1="254" y2="254" stroke="#ffd75a" className="range common-range" pathLength="1"/>}
   {!sol.empty&&sol.lower&&<Endpoint value={sol.lower.value} inclusive={sol.lower.inclusive} x={scale} y={254} color="#ffd75a" label={String(sol.lower.value)}/>}
   {!sol.empty&&sol.upper&&(!sol.lower||sol.upper.value!==sol.lower.value)&&<Endpoint value={sol.upper.value} inclusive={sol.upper.inclusive} x={scale} y={254} color="#ffd75a" label={String(sol.upper.value)}/>}
   {sol.empty&&<><text x={W/2} y="250" textAnchor="middle" className="empty">共通部分なし</text><text x={W/2} y="273" textAnchor="middle" className="no-solution">解なし</text></>}
  </g>
  {Array.from({length:Math.floor(max)-Math.ceil(min)+1},(_,i)=>i+Math.ceil(min)).map(v=><g key={v}><line x1={scale(v)} x2={scale(v)} y1="294" y2="303" className="tick"/><text x={scale(v)} y="321" textAnchor="middle" className="num">{v}</text></g>)}<line x1={pad} x2={W-pad} y1="298" y2="298" className="base"/><text x={W-pad+12} y="304" className="num">x</text>
 </svg></div>
}

function Camera({preset,zoom}:{preset:string,zoom:number}){const{camera}=useThree();useMemo(()=>{const pos=preset==='front'?[0,2,10]:preset==='top'?[0,10,.01]:[8,6,9];camera.position.set(...pos as[number,number,number]);camera.zoom=zoom;camera.updateProjectionMatrix();camera.lookAt(0,0,0)},[camera,preset,zoom]);return null}
function Endpoint3D({q,y,color}:{q:Inequality,y:number,color:string}){const v=inequalityVisual(q);return v.endpoint==='open'?<mesh position={[q.value,y,0]} rotation={[0,Math.PI/2,0]}><torusGeometry args={[.22,.065,18,42]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5}/></mesh>:<mesh position={[q.value,y,0]}><sphereGeometry args={[.23,28,28]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5}/></mesh>}
function Bar({q,y,color}:{q:Inequality,y:number,color:string}){const v=inequalityVisual(q),start=v.direction==='right'?q.value:-6,end=v.direction==='left'?q.value:6;return <group>{v.direction!=='point'&&<mesh position={[(start+end)/2,y,0]}><boxGeometry args={[Math.max(.08,end-start),.22,1.15]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.45} transparent opacity={.72}/></mesh>}<Endpoint3D q={q} y={y} color={color}/></group>}
function Scene3D({items,preset,zoom}:{items:Inequality[],preset:string,zoom:number}){const s=solve(items);let start=s.lower?.value??-6,end=s.upper?.value??6;const lower=s.lower?{op:(s.lower.inclusive?'>=':'>') as Inequality['op'],value:s.lower.value}:null,upper=s.upper?{op:(s.upper.inclusive?'<=':'<') as Inequality['op'],value:s.upper.value}:null;return <Canvas camera={{position:[8,6,9],fov:42}}><color attach="background" args={['#07101c']}/><fog attach="fog" args={['#07101c',12,24]}/><ambientLight intensity={.65}/><pointLight position={[1,6,3]} intensity={30} color="#ffe6a0"/><gridHelper args={[14,14,'#25486b','#142a40']} position={[0,-1,0]}/><Bar q={items[0]} y={2} color="#ff4057"/><Bar q={items[1]} y={.4} color="#32e991"/>{!s.empty&&<group><mesh position={[(start+end)/2,-1,0]}><boxGeometry args={[s.point?.08:Math.max(.08,end-start),.34,1.4]}/><meshStandardMaterial color="#ffd449" emissive="#ffb300" emissiveIntensity={1.4} metalness={.55} roughness={.2}/></mesh>{lower&&<Endpoint3D q={lower} y={-1} color="#ffd449"/>}{upper&&upper.value!==lower?.value&&<Endpoint3D q={upper} y={-1} color="#ffd449"/>}</group>}<Text position={[-5.8,2.55,0]} fontSize={.34} color="#ff8190">不等式 1</Text><Text position={[-5.8,.95,0]} fontSize={.34} color="#70f4b3">不等式 2</Text><Text position={[-5.8,-.45,0]} fontSize={.34} color="#ffe079">共通部分</Text>{s.empty&&<Text position={[0,-1,0]} fontSize={.48} color="#ffd449">共通部分なし・解なし</Text>}<Camera preset={preset} zoom={zoom}/><OrbitControls makeDefault enablePan={false}/></Canvas>}

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
  <div className="readings"><h4>不等式の読み方</h4>{qs.map((q,i)=>{const visual=inequalityVisual(q),side=visual.direction==='right'?'右':'左';return <p key={i}><i className={i?'green':'red'}/><span><b>{formatInequality(q)}</b>{reading(q)}ので、{q.value}は{visual.endpoint==='closed'?'含む':'含まない'}。{q.value}に{visual.endpoint==='closed'?'●':'○'}を置き、{side}側を表します。</span></p>})}</div>
  <div className="hint"><b>共通部分とは？</b><p>赤と緑の両方を同時に満たす、重なった範囲です。</p></div>
  <button className="answerBtn" onClick={()=>setReveal(v=>!v)}>{reveal?<EyeOff/>:<Eye/>}{reveal?'答えを隠す':'答えを見る・解説を見る'}</button>
  {reveal&&<div className="answer"><small>FINAL ANSWER</small><strong>{answer(sol)}</strong><p>{sol.empty?'2つの範囲は重ならないため、解はありません。':sol.point?'端点を両方とも含み、共通するのはこの1点だけです。':'金色に光る場所が、2つを同時に満たす範囲です。'}</p></div>}
  <div className="problemnav"><button onClick={()=>choose((index+problems.length-1)%problems.length)}><ChevronLeft/>前の問題</button><button onClick={()=>choose((index+1)%problems.length)}>次の問題<ChevronRight/></button></div>
 </aside></div><footer><span>○ 含まない</span><span>● 含む</span><span><Maximize2 size={14}/> 3Dはドラッグ・ピンチ操作できます</span></footer></main>
}
