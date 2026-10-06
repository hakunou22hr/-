import React, {useEffect,useRef,useState} from 'react'
import {createRoot} from 'react-dom/client'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {values,tangent} from './math'
import './style.css'
const colors=['#68caff','#ffa463','#61e6ae','#c2a0ff']
const labels=['予想','動かして実験','差を考える','微分する','増減を判断','基準点を調べる','証明','発展']
const questions=['なぜ x>0 なら指数関数のグラフが直線より上になるのだろう？','x を 0 から右へ動かすと、2本のグラフの差はどうなる？','「差」が正であることを調べるには？','差のグラフの接線は、どちらへ傾く？','導関数が正なら、分かるのは「値が正」？ それとも「増加」？','なぜ f(0) を調べるのだろう？','増加と基準点をつないで、結論を導こう。','x<0 でも成り立つ？ この直線はどこから来た？']
const chain=['x>0','e^x>1','e^x-1>0',"f'(x)>0",'f\\text{ は }[0,\\infty)\\text{ で増加}','f(0)=e^0-(1+0)=0','f(x)>f(0)=0','e^x-(1+x)>0','e^x>1+x']
const playback=['2つの高さを比較','差を光として第2層へ','差の関数を再構成','接線の傾きを見る','傾きを第3層へ','正の導関数に注目','増加を第2層へ伝える','基準点 0 から正へ','第1層に戻り、不等式を結論']
function M({s}:{s:string}){return <span className="math" dangerouslySetInnerHTML={{__html:katex.renderToString(s,{throwOnError:false})}}/>}
const funcs=[(t:number)=>Math.exp(t),(t:number)=>1+t,(t:number)=>values(t).gap,(t:number)=>values(t).slope]
const X=(x:number)=>60+(x+3)*680/7
function Graph({kind,x,show,tan,phase,contact}:{kind:number,x:number,show:boolean[],tan:boolean,phase:number,contact?:number}){
 const v=values(x); const max=Math.max(5,kind===0?v.exp+1:kind===1?v.gap+1:v.slope+1); const Y=(y:number)=>285-(y+3)*245/(max+3)
 const curve=(fn:(t:number)=>number)=>Array.from({length:281},(_,i)=>{const t=-3+i/40;return `${i?'L':'M'}${X(t)},${Y(fn(t))}`}).join(' ')
 const indices=kind===0?[0,1]:[kind+1]; const ys=kind===0?[v.exp,v.line]:[kind===1?v.gap:v.slope]
 return <svg viewBox="0 0 800 330" role="img" aria-label={kind===0?'指数関数と直線の比較':kind===1?'差の関数と接線':'導関数のグラフ'}>
 <defs><clipPath id={'clip'+kind}><rect x="60" y="25" width="680" height="260"/></clipPath><filter id={'glow'+kind}><feGaussianBlur stdDeviation="3"/></filter></defs>
 {kind===2&&<rect x={X(0)} y="25" width={X(4)-X(0)} height={Y(0)-25} fill="#61e6ae" opacity=".07"/>}
 {Array.from({length:8},(_,i)=>i-3).map(t=><g key={t}><line x1={X(t)} x2={X(t)} y1="25" y2="285" stroke="#23374d"/><text x={X(t)} y="308" textAnchor="middle">{t}</text></g>)}
 {[0,1,2,3,4].map(i=>{let y=i*max/4;return <g key={i}><line x1="60" x2="740" y1={Y(y)} y2={Y(y)} stroke="#23374d"/><text x="48" y={Y(y)+5} textAnchor="end">{y.toFixed(1)}</text></g>})}
 <line x1="60" x2="740" y1={Y(0)} y2={Y(0)} stroke="#9aafc3"/><line x1={X(0)} x2={X(0)} y1="25" y2="285" stroke="#9aafc3"/><text x="760" y={Y(0)}>x</text>
 <g clipPath={`url(#clip${kind})`}>
 <line x1={X(x)} x2={X(x)} y1="25" y2="285" stroke="#e7edf5" strokeDasharray="4 6" opacity=".35"/>
 {kind===0&&contact!==undefined&&<path d={curve(t=>1+(contact/3)*t)} stroke="#f4d48b" strokeWidth="3" fill="none" style={{transition:'all 1s ease'}}/>}
 {kind===0&&phase===1&&<line x1={X(x)+18} x2={X(x)+18} stroke="#f4d48b" strokeWidth="5"><animate attributeName="y1" values={`${Y(v.line)};${Y(0)}`} dur="1.8s" fill="freeze"/><animate attributeName="y2" values={`${Y(v.exp)};${Y(v.gap)}`} dur="1.8s" fill="freeze"/></line>}
 {indices.map(i=>show[i]&&<path key={i} d={curve(funcs[i])} stroke={colors[i]} strokeWidth="3" fill="none"/>)}
 {kind===0&&show[4]&&<><line className={phase===1?'transfer':''} x1={X(x)} x2={X(x)} y1={Y(v.exp)} y2={Y(v.line)} stroke="#61e6ae" strokeWidth={6+Math.min(v.gap,8)} opacity=".25"/><line x1={X(x)} x2={X(x)} y1={Y(v.exp)} y2={Y(v.line)} stroke="#61e6ae" strokeWidth="3"/></>}
 {kind===1&&tan&&<path d={curve(t=>tangent(x,t))} stroke={x<0?'#ff7f91':'#61e6ae'} strokeWidth="2" strokeDasharray="8 5" fill="none"/>}
 {ys.map((y,i)=>show[indices[i]]&&<g key={i}><circle cx={X(x)} cy={Y(y)} r="12" fill={colors[indices[i]]} opacity=".3" filter={`url(#glow${kind})`}/><circle cx={X(x)} cy={Y(y)} r="5" fill={colors[indices[i]]}/><text x={X(x)+9} y={Y(y)-12} fill={colors[indices[i]]}>{kind===0?(i?'Q':'P'):kind===1?'R':'S'}</text></g>)}
 <circle className="pulse" cx={X(0)} cy={Y(kind===0?1:0)} r="11" fill="none" stroke="#f4d48b"/><circle cx={X(0)} cy={Y(kind===0?1:0)} r="4" fill="#f4d48b"/>
 </g><text x="64" y="20">{kind===0?'第1層 · 2つの関数':kind===1?'第2層 · 差の関数':'第3層 · 導関数'}</text><text x="510" y="326">x = {x.toFixed(2)} · 縦軸は自動調整</text>
 </svg>
}
function Layers({x,phase,front,reset,show,onFail}:{x:number,phase:number,front:number,reset:number,show:boolean[],onFail:()=>void}){
 const host=useRef<HTMLDivElement>(null); const sceneRef=useRef<{update:(x:number,phase:number,show:boolean[])=>void,front:()=>void,reset:()=>void}|undefined>(undefined)
 useEffect(()=>{
 let renderer:THREE.WebGLRenderer|undefined,controls:OrbitControls|undefined,frame=0,observer:ResizeObserver|undefined; const disposables: Array<{dispose:()=>void}>=[]
 try{
 const el=host.current!;renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));el.appendChild(renderer.domElement)
 const scene=new THREE.Scene(); const camera=new THREE.PerspectiveCamera(42,1,.1,100);camera.position.set(8,6,10);controls=new OrbitControls(camera,renderer.domElement); controls.target.set(.5,2,-3);controls.enableDamping=true;controls.minDistance=7;controls.maxDistance=35
 const geoLine=(pts:THREE.Vector3[],color:string,opacity=1)=>{const g=new THREE.BufferGeometry().setFromPoints(pts);const m=new THREE.LineBasicMaterial({color,transparent:true,opacity});disposables.push(g,m);return new THREE.Line(g,m)}
 const dynamic=new THREE.Group();scene.add(dynamic);const curveObjects:THREE.Line[]=[]
 const lightGeo=new THREE.SphereGeometry(.13,16,16),lightMat=new THREE.MeshBasicMaterial({color:'#f4d48b'});disposables.push(lightGeo,lightMat);const light=new THREE.Mesh(lightGeo,lightMat);scene.add(light);let currentX=x,currentPhase=phase,phaseTime=performance.now();
 const height=(y:number)=>y*.12
 for(let layer=0;layer<3;layer++){
 const z=-layer*3;const g=new THREE.PlaneGeometry(7,7);const m=new THREE.MeshBasicMaterial({color:'#264660',transparent:true,opacity:.13,side:THREE.DoubleSide,depthWrite:false});disposables.push(g,m);const plane=new THREE.Mesh(g,m);plane.position.set(.5,3,z);scene.add(plane)
 for(let t=-3;t<=4;t++)scene.add(geoLine([new THREE.Vector3(t,-.4,z),new THREE.Vector3(t,6.6,z)],'#47627a',.4))
 for(let y=0;y<=50;y+=10)scene.add(geoLine([new THREE.Vector3(-3,height(y),z),new THREE.Vector3(4,height(y),z)],'#47627a',.4))
 scene.add(geoLine([new THREE.Vector3(0,-.4,z),new THREE.Vector3(0,6.6,z)],'#f4d48b',.6))
 const originGeo=new THREE.SphereGeometry(.09,16,16),originMat=new THREE.MeshBasicMaterial({color:'#f4d48b'});disposables.push(originGeo,originMat);const origin=new THREE.Mesh(originGeo,originMat);origin.position.set(0,height(layer===0?1:0),z);scene.add(origin)
 const ids=layer===0?[0,1]:[layer+1];ids.forEach(i=>{const curve=geoLine(Array.from({length:281},(_,j)=>{let t=-3+j/40;return new THREE.Vector3(t,height(funcs[i](t)),z)}),colors[i]);curveObjects[i]=curve;scene.add(curve)})
 const canvas=document.createElement('canvas');canvas.width=800;canvas.height=100;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#e4eef8';ctx.font='30px sans-serif';ctx.fillText(['第1層：指数関数と直線','第2層：差の関数 f','第3層：導関数 f′'][layer],12,60);const tex=new THREE.CanvasTexture(canvas);const sm=new THREE.SpriteMaterial({map:tex,transparent:true});disposables.push(tex,sm);const sprite=new THREE.Sprite(sm);sprite.position.set(.5,7,z);sprite.scale.set(7,.875,1);scene.add(sprite)
 }
 const update=(t:number,p:number,visible:boolean[])=>{curveObjects.forEach((curve,i)=>{curve.visible=visible[i]})
 dynamic.children.slice().forEach(o=>{dynamic.remove(o);if(o instanceof THREE.Line||o instanceof THREE.Mesh){o.geometry.dispose();(o.material as THREE.Material).dispose()}})
 if(p!==currentPhase)phaseTime=performance.now();currentX=t;currentPhase=p;const v=values(t);const zs=[0,-3,-6];const yy=[v.exp,v.gap,v.slope];
 zs.forEach((z,l)=>{if(!visible[l===0?0:l+1])return;const g=new THREE.SphereGeometry(.08,12,12);const m=new THREE.MeshBasicMaterial({color:l===0?colors[0]:colors[l+1]});const dot=new THREE.Mesh(g,m);dot.position.set(t,height(yy[l]),z);dynamic.add(dot)})
 const add=(pts:THREE.Vector3[],c:string)=>{const g=new THREE.BufferGeometry().setFromPoints(pts);const m=new THREE.LineBasicMaterial({color:c});dynamic.add(new THREE.Line(g,m))}
 if(visible[1]){const g=new THREE.SphereGeometry(.08,12,12);const m=new THREE.MeshBasicMaterial({color:colors[1]});const q=new THREE.Mesh(g,m);q.position.set(t,height(v.line),0);dynamic.add(q)}
 if(visible[4])add([new THREE.Vector3(t,height(v.line),0),new THREE.Vector3(t,height(v.exp),0)],colors[2]);add(zs.map(z=>new THREE.Vector3(t,0,z)),'#f4d48b');add(zs.map((z,l)=>new THREE.Vector3(t,height(yy[l]),z)),p===1||p===4||p===6?'#f4d48b':'#688da3')
 if(p>=3&&visible[5])add([-3,4].map(a=>new THREE.Vector3(a,height(tangent(t,a)),-3)),t<0?'#ff7f91':colors[2])
 };sceneRef.current={update,front:()=>{camera.position.set(.5,3,11);controls!.target.set(.5,3,-3)},reset:()=>{camera.position.set(8,6,10);controls!.target.set(.5,2,-3)}};update(x,phase,show)
 observer=new ResizeObserver(()=>{const w=el.clientWidth,h=el.clientHeight;renderer!.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()});observer.observe(el)
 const lost=(e:Event)=>{e.preventDefault();onFail()};renderer.domElement.addEventListener('webglcontextlost',lost)
 const draw=()=>{frame=requestAnimationFrame(draw);controls!.update();const t=(performance.now()-phaseTime)%1800/1800;const v=values(currentX);const paths:Record<number,[number,number,number,number]>={1:[0,-3,v.gap,v.gap],4:[-3,-6,v.slope,v.slope],6:[-6,-3,v.slope,v.gap],8:[-3,0,v.gap,v.exp]};const path=paths[currentPhase];light.visible=!!path;if(path)light.position.set(currentX,height(path[2]+(path[3]-path[2])*t),path[0]+(path[1]-path[0])*t);renderer!.render(scene,camera)};draw()
 return()=>{cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();update(0,0,show);dynamic.children.forEach(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Line){o.geometry.dispose();(o.material as THREE.Material).dispose()}});disposables.forEach(d=>d.dispose());renderer?.dispose();renderer?.domElement.removeEventListener('webglcontextlost',lost);renderer?.domElement.remove();sceneRef.current=undefined}
 }catch{cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();disposables.forEach(d=>d.dispose());renderer?.dispose();renderer?.domElement.remove();onFail()}
 },[])
 useEffect(()=>sceneRef.current?.update(x,phase,show),[x,phase,show]);useEffect(()=>{if(front)sceneRef.current?.front()},[front]);useEffect(()=>{if(reset)sceneRef.current?.reset()},[reset])
 return <div className="three" ref={host} aria-label="回転・ズームできる3D証明レイヤー"/>
}
const knowledge:Record<string,[string,string]>= {'指数関数':['指数関数','e^0=1,\\quad e^x>0,\\quad (e^x)\'=e^x>0'],'微分':['微分は変化の速さを調べる操作','f\'(a)=\\lim_{h\\to0}\\frac{f(a+h)-f(a)}h'],'導関数':['各点の接線の傾きを表す関数',"f'(x)=e^x-1"],'増加・減少':['導関数の符号は値の符号ではなく増減を示す',"f'>0\\Rightarrow f\\text{ は増加},\\quad f'<0\\Rightarrow f\\text{ は減少}"],'接線':['点と傾きから接線を決める',"y-f(a)=f'(a)(x-a)"],'不等式':['2つの量の大小を比べる','A>B\\iff A-B>0'],'関数の差':['差を1つの関数として調べる','f(x)=e^x-(1+x)'],'極値':['左で減少、右で増加なら極小',"f'(x)<0\\ (x<0),\\quad f'(x)>0\\ (x>0)"],'凸性':['下に凸：接線よりグラフが上側にある',"(e^x)''=e^x>0"],'対数関数':['log は自然対数。指数関数の逆関数で単調増加','\\log(e^x)=x,\\quad (\\log x)\'=\\frac1x']}
function App(){
 const [x,setX]=useState(0),[step,setStep]=useState(0),[mode,setMode]=useState(false),[failed,setFailed]=useState(false),[show,setShow]=useState([true,true,false,false,true,false]),[card,setCard]=useState(0),[playing,setPlaying]=useState(false),[phase,setPhase]=useState(-1),[speed,setSpeed]=useState(1),[front,setFront]=useState(0),[reset,setReset]=useState(0),[prediction,setPrediction]=useState(''),[negative,setNegative]=useState(''),[experiment,setExperiment]=useState(false),[tangentStep,setTangentStep]=useState(0),[topic,setTopic]=useState<string|null>(null),[map,setMap]=useState(false),[teacher,setTeacher]=useState(false),[answer,setAnswer]=useState('')
 const v=values(x)
 useEffect(()=>{const close=(e:KeyboardEvent)=>{if(e.key==='Escape'){setMap(false);setTopic(null)}};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[])
 const go=(s:number)=>{setStep(s);setPlaying(false);setShow([true,true,s>=2,s>=3,true,s>=3]);if(s===5)setX(0)}
 useEffect(()=>{if(!playing)return;const id=window.setInterval(()=>{setPhase(p=>{if(p>=8){setPlaying(false);return p}return p+1});setX(t=>Math.min(1,t+.15))},1800/speed);return()=>clearInterval(id)},[playing,speed])
 const start=()=>{setStep(6);setShow([true,true,true,true,true,true]);setX(1);setPhase(0);setCard(0);setPlaying(true)}
 useEffect(()=>{if(phase>=0)setCard(phase+1)},[phase])
 const restart=()=>{go(0);setX(0);setPhase(-1);setCard(0);setPrediction('');setNegative('');setExperiment(false);setTangentStep(0);setAnswer('')}
 return <main><header><a href="../../">← 教材ライブラリ</a><div className="header-actions"><button onClick={()=>setMap(true)}>関連する知識</button><button onClick={()=>setTeacher(!teacher)}>教師用表示</button></div></header>
 <div className="title"><span className="eyebrow">数学Ⅲ / 微分法とその応用</span><h1>微分法で不等式を証明する</h1><p><M s="e^x>1+x"/> を、グラフ・導関数・接線から探究する</p></div>
 <nav aria-label="学習段階">{labels.map((l,i)=><button key={l} aria-current={i===step?'step':undefined} className={i===step?'selected':''} onClick={()=>go(i)}><small>STEP {i+1}</small>{l}</button>)}</nav>
 <h2>{step===0?<span>なぜ <M s="x>0"/> なら <M s="e^x>1+x"/> になるのだろう？</span>:questions[step]}</h2>
 <div className="layout"><section className="visual"><div className="toolbar"><div><button className={!mode?'selected':''} onClick={()=>setMode(false)}>2D</button><button className={mode?'selected':''} onClick={()=>{setMode(true);setShow([true,true,true,true,true,true])}}>3D</button></div><div><button onClick={()=>{setFront(n=>n+1)}} disabled={!mode}>正面表示</button><button onClick={()=>{setX(0);setReset(n=>n+1)}}>グラフリセット</button></div></div>
 {mode&&!failed?<><Layers x={x} phase={phase>=0?phase:step>=3?3:-1} show={show} front={front} reset={reset} onFail={()=>{setFailed(true);setMode(false)}}/><p className="caption">奥行き z は変数ではなく「証明の階層」。横軸 x、縦軸 y（全層同じ縮尺）。ドラッグで回転、ピンチ／ホイールでズーム。</p><p className="caption">第1層：比較 → 第2層：差 → 第3層：傾き。金の線は同じ x を貫きます。</p></>:<>{failed&&<p role="status" className="notice">この端末では3D表示を利用できません。2D表示で学習できます。</p>}<Graph kind={0} x={x} show={show} tan={false} phase={phase} contact={step===7?tangentStep:undefined}/>{show[2]&&<Graph kind={1} x={x} show={show} tan={show[5]} phase={phase}/>} {show[3]&&<Graph kind={2} x={x} show={show} tan={false} phase={phase}/>}</>}
 <div className="slider"><label htmlFor="x">同じ x で比較 <strong>x = {x.toFixed(2)}</strong></label><input id="x" type="range" min="-3" max="4" step=".01" value={x} onChange={e=>{setX(Number(e.target.value));if(negative)setExperiment(true)}}/><div className="presets">{[-3,-1,0,1,2,4].map(t=><button key={t} onClick={()=>{setX(t);if(negative)setExperiment(true)}}>x = {t}</button>)}</div></div>
 <div className="numbers">{['e^x','1+x','f(x)=e^x-(1+x)',"f'(x)=e^x-1"].slice(0,step>=3?4:3).map((s,i)=><div key={s} style={{borderColor:colors[i]}}><M s={s}/><strong>{[v.exp,v.line,v.gap,v.slope][i].toFixed(4)}</strong></div>)}</div>
 <details><summary>表示・凡例</summary><div className="checks">{['e^x','1+x','f(x)',"f'(x)",'差','接線'].map((s,i)=><label key={s}><input type="checkbox" checked={show[i]} onChange={()=>setShow(a=>a.map((b,j)=>j===i?!b:b))}/><M s={s}/></label>)}</div><p>青：指数関数　橙：直線　金：基準点・結論　緑：正・増加　赤：負・減少　紫：導関数</p></details>
 </section><aside><span className="eyebrow">STEP {step+1} · {labels[step]}</span>
 {step===0&&<><h3>まず、予想してみよう</h3><p>右へ進むと、2本のグラフの間はどうなる？</p>{['広がる','狭くなる','分からない'].map(a=><button className={prediction===a?'selected':''} key={a} onClick={()=>setPrediction(a)}>{a}</button>)}{prediction&&<p>予想を選びました。スライダーで確かめよう。</p>}</>}
 {step===1&&<><h3>まず動かしてみよう</h3><p>P と Q は同じ x 座標。縦の光の長さが2つの値の差です。</p><M s="P=(x,e^x),\quad Q=(x,1+x)"/><p>x = 0 と x = 1 を比べてみよう。グラフの観察だけで、すべての x について証明できるだろうか？</p></>}
 {x===0&&<div className="zero"><M s="e^0=1,\quad 1+0=1"/><p>2点が (0,1) で一致。ここが境界になるのだろうか？</p>{step>=2&&<M s="f(0)=0"/>}</div>}
 {step===2&&<><h3>差を、新しい関数にする</h3><button onClick={()=>{setPhase(1);setShow(a=>a.map((b,i)=>i===2?true:b))}}>差を取り出す</button><div className="flow"><M s="e^x>1+x"/><b>↓</b><M s="e^x-(1+x)>0"/><b className={phase===1?'transfer':''}>↓</b><M s="f(x)>0"/></div><p>第1層の縦の距離を、第2層では x 軸からの高さに移します。</p><p>軸の上：正 / 軸上：0 / 軸の下：負</p></>}
 {step===3&&<><h3>接線の傾きを見る</h3><M s="f'(x)=e^x-1"/><p style={{color:x<0?'#ff7f91':x>0?'#61e6ae':'#f4d48b'}}>いまの傾き：{v.slope.toFixed(4)} · {x<0?'右下がり':x>0?'右上がり':'水平'}</p><p>R の接線の傾きが、同じ x にある S の高さです。</p></>}
 {step===4&&<><h3>「正」と「増加」を区別しよう</h3><M s="f'(x)>0\ \Rightarrow\ \text{接線が右上がり}\ \Rightarrow\ f\text{ は増加}"/><p>導関数が正なら、何が言える？</p>{['関数の値が正','関数が増加'].map(a=><button key={a} onClick={()=>setAnswer(a)}>{a}</button>)}{answer&&<p role="status">{answer==='関数が増加'?'その通り。値が正かどうかには、基準点が必要。':'傾きが正でも、値が負の関数はある。例えば h(x)=x−10 は増加するが h(1)=−9。'}</p>}<button onClick={()=>setTopic('増加・減少')}>増減との関係 ↗</button></>}
 {step===5&&<><h3>出発点の高さを調べる</h3><M s="f(0)=e^0-(1+0)=1-1=0"/><p>「増加する」ことと「0 から出発する」ことを組み合わせる。</p><M s="x>0\ \Rightarrow\ f(x)>f(0)=0"/><button onClick={()=>setX(1)}>0 から右へ動かす</button></>}
 {step===6&&<><h3>論理の鎖をつなごう</h3><p>グラフは発見を助ける。証明はすべての x&gt;0 について、理由をつなぎます。</p><button onClick={()=>setCard(n=>Math.min(9,n+1))}>証明を表示 · 次の理由</button><div className={card===9?'chain complete':'chain'}>{chain.slice(0,card).map((s,i)=><React.Fragment key={s}>{i>0&&<b>↓</b>}<div><small>{i+1}</small><M s={s}/></div></React.Fragment>)}</div>{card===9&&<p className="gold">証明完成</p>}</>}
 {step===7&&<><h3>さらに探究</h3><p>x&lt;0 でも本当に成り立つ？ 予想を選び、左へ動かしてみよう。</p>{['成り立つ','成り立たない','分からない'].map(a=><button key={a} className={negative===a?'selected':''} onClick={()=>{setNegative(a);setExperiment(false)}}>{a}</button>)}{negative&&experiment&&x<0&&<div className="notice"><M s="x<0\Rightarrow f'(x)<0"/><p>左から 0 へ進むと f は減少して 0 に近づく。だから左側の値は f(0) より大きい。</p><M s="f(x)>f(0)=0"/><div className="complete"><M s="e^x\ge1+x"/><p>すべての実数 x。等号成立：x=0</p><p>微分 → 増減 → 不等式</p><p>不等式は、式だけでなく関数の動きを見ることで証明できる。</p></div></div>}
 <details><summary>なぜこの直線？ 接線としての理解</summary><p>接点を (0,1) に固定し、傾きを 1 へ合わせます。</p><div className="tangent-demo"><div style={{transform:`rotate(${tangentStep===3?-35:-tangentStep*8}deg)`}}/><span>● (0,1)</span></div>{['e^0=1',"(e^x)'=e^x,\\quad y'(0)=1",'y-1=1(x-0)','y=x+1'].slice(0,tangentStep+1).map(s=><p key={s}><M s={s}/></p>)}<button onClick={()=>setTangentStep(n=>Math.min(3,n+1))}>接線の計算を進める</button><button onClick={()=>{setX(0);setTangentStep(0)}}>もう一度</button></details>
 <details><summary>さらに知りたい：下に凸</summary><M s="y''=e^x>0"/><p>傾きが次第に大きくなる「下に凸」のグラフ。x=0 の接線よりグラフは上側にあります。スライダーで左右の位置関係を確かめよう。</p><button onClick={()=>setTopic('凸性')}>下に凸 ↗</button></details>
 <details><summary>発展問題：対数の不等式</summary><M s="x>0\text{ のとき }x>\log(1+x)"/><p>log は自然対数です。</p><h4>方法 A · 前の結果を使う</h4><M s="e^x>1+x>0\Rightarrow\log(e^x)>\log(1+x)"/><p>対数関数が単調増加だから</p><M s="x>\log(1+x)"/><h4>方法 B · 差を微分する</h4><M s="g(x)=x-\log(1+x),\quad g(0)=0"/><M s="g'(x)=1-\frac1{1+x}=\frac{x}{1+x}>0\ (x>0)"/><M s="g(x)>g(0)=0"/><p>どちらが分かりやすい？ 前の結果を利用すると短いのはなぜ？ 導関数を使わずに説明する方法も考えてみよう。</p></details></>}
 <div className="knowledge-links">{['指数関数','関数の差','導関数','接線'].map(t=><button key={t} onClick={()=>setTopic(t)}>{t} ↗</button>)}</div>
 </aside></div>
 <section className="player"><div><button onClick={start}>証明を再生 / 自動再生</button><button disabled={phase<0} onClick={()=>setPlaying(p=>!p)}>{playing?'一時停止':'再開'}</button><button onClick={start}>最初から再生</button><label>速度 <select value={speed} onChange={e=>setSpeed(Number(e.target.value))}>{[.5,1,1.5,2].map(n=><option key={n} value={n}>{n}倍</option>)}</select></label></div><p aria-live="polite">{phase>=0?`${phase+1}/9 · ${playback[phase]}`:'3層をつないで、証明の流れをたどろう。'}</p></section>
 {teacher&&<section className="teacher"><h3>教師用表示</h3><p>今日の発問：{questions[step]}</p><p>予想される回答：「右へ動くと差が広がる」「接線が右上がりになる」。観察から一般的な理由へ促す。</p><p>重要な誤答：「f′(x)&gt;0 だから f(x)&gt;0」。反例 h(x)=x−10 を示す。</p><p>押さえるポイント：導関数が正 → 増加 → f(0)=0 → x&gt;0 で f(x)&gt;0。負の側では左から右への減少と、基準点との大小を区別する。</p></section>}
 <footer><button onClick={restart}>最初から</button><button disabled={step===0} onClick={()=>go(step-1)}>前へ</button><span>{labels[step]}</span><button disabled={step===7} onClick={()=>go(step+1)}>次へ · {labels[Math.min(7,step+1)]}</button><button onClick={()=>go(7)}>探究問題</button></footer>
 {(map||topic)&&<div className="overlay" onClick={()=>{setMap(false);setTopic(null)}}><section role="dialog" aria-modal="true" aria-label="知識リンク" className="modal" onClick={e=>e.stopPropagation()}><button autoFocus className="close" onClick={()=>{setMap(false);setTopic(null)}}>閉じる ×</button>{map&&<><h3>関連する知識</h3><div className="map"><div className="center"><M s="e^x>1+x"/></div>{Object.keys(knowledge).map(t=><button className={topic===t?'selected':''} key={t} onClick={()=>setTopic(t)}>{t}</button>)}</div><p>指数関数 ↔ 対数関数 / 微分 → 導関数 → 増減 → 極値 / 関数の差 → 不等式 / 接線 → 凸性</p></>}{topic&&<><h3>{topic}</h3><p>{knowledge[topic][0]}</p><M s={knowledge[topic][1]}/>{topic==='増加・減少'&&<svg viewBox="0 0 300 80"><path d="M20 65 L130 15 M170 15 L280 65" stroke="#61e6ae" strokeWidth="3"/><path d="M170 15 L280 65" stroke="#ff7f91" strokeWidth="3"/><text x="30" y="78">正 → 増加</text><text x="190" y="78">負 → 減少</text></svg>}</>}</section></div>}
 </main>
}
createRoot(document.getElementById('root')!).render(<App/>);
