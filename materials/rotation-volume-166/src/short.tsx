import React,{useEffect,useRef,useState,useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import katex from 'katex';import 'katex/dist/katex.min.css';
import {World} from './World';import {shortPose,shortScenes} from './short-model';import {R,r} from './model';import './short.css';
const render=new URLSearchParams(location.search).has('render');
const videoPath='../../media/rotation-volume-166/rotation-volume-166-instagram-30s.mp4?v=short1';
const M=React.memo(({tex}:{tex:string})=>{const html=useMemo(()=>katex.renderToString(tex,{displayMode:true,throwOnError:false}),[tex]);return <div className="short-math" dangerouslySetInnerHTML={{__html:html}}/>});
function RenderFilm(){const host=useRef<HTMLDivElement>(null),world=useRef<World|null>(null);const[time,setTime]=useState(0),[ready,setReady]=useState(false),[error,setError]=useState('');const pose=shortPose(time),i=time===30?5:shortScenes.findIndex(s=>time<s.end);
useEffect(()=>{let w:World;try{w=new World(host.current!,()=>{});world.current=w;setReady(true)}catch(e){setError(String(e));return}return()=>w.dispose()},[]);
useEffect(()=>{if(ready)world.current?.set(pose,true,i===3)},[time,ready]);
useEffect(()=>{(window as unknown as {rotation166Short:unknown}).rotation166Short={setTime,getState:()=>({time,ready,scene:i,sourceTime:pose.time,angle:pose.angle,cut:pose.cut})}},[time,ready]);
return <main className="short-frame"><div className="short-visual" ref={host}/><div className="short-heading"><p>数学Ⅲ · 例題166 <span>0{i+1} / 06</span></p><h1>{shortScenes[i].title}</h1></div>{error&&<div className="error">{error}</div>}
<div className={'short-equations '+(i===5?'final-answer':'')}>
{i===0&&<><div className="cyan"><M tex="y=-x^2+4x"/></div><div className="gold"><M tex="y=x\qquad(0\leqq x\leqq3)"/></div></>}
{i===1&&<><div className="angle">{(pose.angle/Math.PI*180).toFixed(0)}<small>°</small></div><div className="formula-note">x 軸のまわりに1回転</div></>}
{i===2&&<><div className="gold"><M tex="r(x)=x"/></div><div className="formula-note">内側の円すいの半径</div></>}
{i===3&&<><div className="radius-row"><span>外半径 R = {R(pose.cut).toFixed(2)}</span><span>内半径 r = {r(pose.cut).toFixed(2)}</span></div><M tex="S(x)=\pi\{R(x)^2-r(x)^2\}"/></>}
{i===4&&<><M tex="\Delta V\approx S(x)\Delta x"/><div className="gold"><M tex="V=\int_0^3 S(x)\,dx"/></div></>}
{i===5&&<><div className="formula-note">求める体積</div><div className="short-answer"><M tex="V=\frac{108}{5}\pi"/></div></>}
</div><p className="short-caption">{shortScenes[i].caption}</p><p className="short-cta">{time>=27?'90秒の本編・3D探究へ':'回転 → 空洞 → 円環 → 積分'}</p></main>}
function Player(){const ref=useRef<HTMLVideoElement>(null),[status,setStatus]=useState('再生ボタンで30秒の縦版が始まります。');return <main className="player"><a href="./">← 90秒本編・3D探究へ</a><h1>回転体の体積 · Instagram 30秒</h1><p>縦9:16 / 1080×1920 / 音声なし・字幕付き</p><video ref={ref} controls playsInline preload="metadata" poster="../../media/rotation-volume-166/instagram-poster.jpg" onError={()=>setStatus('動画を読み込めませんでした。ページを再読み込みしてください。')}><source src={videoPath} type="video/mp4"/></video><button onClick={async()=>{try{await ref.current?.play();setStatus('再生中')}catch{setStatus('動画内の再生ボタンを押してください。')}}}>▶ 30秒を再生</button><p role="status">{status}</p><a href={videoPath} download="回転体の体積_インスタ30秒.mp4">MP4を保存 ↓</a></main>}
createRoot(document.getElementById('root')!).render(render?<RenderFilm/>:<Player/>);
