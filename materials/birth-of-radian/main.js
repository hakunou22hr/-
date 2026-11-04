import './style.css';
import * as T from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import katex from 'katex';
const $=s=>document.querySelector(s),clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
const params=new URLSearchParams(location.search);let portrait=params.has('portrait'),duration=portrait?30:90,playing=false,time=0,last=0;
document.body.classList.toggle('portrait',portrait);if(portrait)document.querySelector('.intro small').textContent='数学Ⅱ · 三角関数と弧度法　 /　30 SEC';document.body.classList.toggle('export',params.has('export'));
const chapters=[['半径の誕生',0],['1ラジアンの誕生',12],['半円に半径を巻く',30],['πの出現',52],['180° = π rad',72]];
$('#chapters').innerHTML=chapters.map(([s,t],i)=>`<button data-t="${t}"><b>0${i+1} / ${String(t).padStart(2,'0')} SEC</b>${s}</button>`).join('');
$('#previews').innerHTML=[6,20,42,62,82].map(t=>`<a href="?t=${t}"><img src="./previews/${t}.jpg" alt="${t}秒のシーン"><span>${t} SEC</span></a>`).join('');
let scene,camera,renderer,composer,bloom,hero,back,stars,starBase,rings=[],bands=[],radius,ray,outline,angle,origin,pi,light,dissolve;
const blue=0x37bbff,gold=0xffc75e,green=0x56f5ab,red=0xff6478,R=2.35,N=160;
function line(color,count=N+1){let g=new T.BufferGeometry(),thick=count===241?.008:.026,vs=new Float32Array(count*8*3),ix=[];for(let i=0;i<count-1;i++)for(let j=0;j<8;j++){let a=i*8+j,b=i*8+(j+1)%8,c=a+8,d=b+8;ix.push(a,b,c,b,d,c)}g.setAttribute('position',new T.BufferAttribute(vs,3));g.setIndex(ix);let m=new T.MeshBasicMaterial({color,transparent:true,opacity:1});m.color.multiplyScalar(count===241?1.3:2.2);let l=new T.Mesh(g,m);l.userData.count=count;l.userData.thick=thick;l.frustumCulled=false;return l}
function coords(l,fn,count=l.userData.count){let a=l.geometry.attributes.position;for(let i=0;i<count;i++){let u=i/(count-1),p=fn(u),q=fn(Math.min(1,u+.0001)),v=fn(Math.max(0,u-.0001)),dx=q[0]-v[0],dy=q[1]-v[1],n=Math.hypot(dx,dy)||1;for(let j=0;j<8;j++){let ang=j/8*Math.PI*2,r=l.userData.thick;a.setXYZ(i*8+j,p[0]-dy/n*r*Math.cos(ang),p[1]+dx/n*r*Math.cos(ang),(p[2]||0)+r*Math.sin(ang))}}a.needsUpdate=true;}
function arc(l,start,end,r=R){coords(l,u=>[r*Math.cos(mix(start,end,u)),r*Math.sin(mix(start,end,u)),0])}
// Arc-length parameter s: wrapped prefix follows circle; remaining length follows its tangent.
// Both derivatives have norm R and agree at the contact point; total length is preserved.
export function bendPoint(u,k,start=0,length=1){const s=u*length,w=k*length,v=Math.min(s,w),tail=Math.max(0,s-w),a=start+v;return [R*(Math.cos(a)-tail*Math.sin(a)),R*(Math.sin(a)+tail*Math.cos(a)),0]}

function setup(){
scene=new T.Scene();scene.background=new T.Color('#020711');scene.fog=new T.FogExp2('#020711',.026);camera=new T.PerspectiveCamera(42,16/9,.1,120);renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setClearColor('#020711');$('#stage').appendChild(renderer.domElement);
composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));bloom=new UnrealBloomPass(new T.Vector2(1000,600),.8,.5,.28);composer.addPass(bloom);
scene.add(new T.AmbientLight(0x327daa,1));light=new T.PointLight(blue,25,25);scene.add(light);
hero=new T.Group();hero.position.y=-.55;scene.add(hero);back=new T.Group();scene.add(back);
for(let i=0;i<18;i++){let r=3.6+i*.22;let ring=line(i%3?0x176b95:gold,241);coords(ring,u=>[r*Math.cos(u*Math.PI*2),r*Math.sin(u*Math.PI*2),0],241);ring.material.opacity=i%3?.25:.36;ring.rotation.set(i%5===0?.8:.3,.12,0);ring.position.z=-2-i*.14;back.add(ring);rings.push(ring)}
const tick=new T.BufferGeometry(),tp=[];for(let j=0;j<240;j++){let a=j/240*Math.PI*2,r=5.6;tp.push(r*Math.cos(a),r*Math.sin(a),-2,(r+(j%5?.06:.22))*Math.cos(a),(r+(j%5?.06:.22))*Math.sin(a),-2)}tick.setAttribute('position',new T.Float32BufferAttribute(tp,3));back.add(new T.LineSegments(tick,new T.LineBasicMaterial({color:0x59c9f5,transparent:true,opacity:.3})));
let data=new Float32Array(1800*3);for(let i=0;i<1800;i++){let z=Math.sin(i*147.31)*43758.5453;let q=z-Math.floor(z);let a=i*2.399963,r=3+q*15;data[i*3]=Math.cos(a)*r;data[i*3+1]=Math.sin(a)*r;data[i*3+2]=-2-(i%71)/5}starBase=data.slice();let sg=new T.BufferGeometry();sg.setAttribute('position',new T.BufferAttribute(data,3));stars=new T.Points(sg,new T.PointsMaterial({color:0x77d5ff,size:.04,transparent:true,opacity:.72,blending:T.AdditiveBlending,depthWrite:false}));scene.add(stars);
outline=line(gold);hero.add(outline);radius=line(blue);hero.add(radius);ray=line(gold);hero.add(ray);angle=line(gold);hero.add(angle);
for(let i=0;i<4;i++){let b=line([blue,green,gold,red][i]);hero.add(b);bands.push(b);let glow=line([blue,green,gold,red][i]);glow.material.opacity=.12;hero.add(glow);b.userData.glow=glow}
origin=new T.Mesh(new T.SphereGeometry(.045,16,16),new T.MeshBasicMaterial({color:0xffffff}));hero.add(origin);let lc=document.createElement('canvas');lc.width=128;lc.height=128;let lx=lc.getContext('2d');lx.fillStyle='#c2e8ff';lx.font='60px Georgia';lx.fillText('O',30,80);let label=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(lc),transparent:true}));label.scale.set(.36,.36,.36);label.position.set(-.16,-.18,.1);hero.add(label);origin.userData.label=label;origin.material.transparent=true;
// Extruded pi glyph: a solid beveled shape, lit inside the scene.
let sh=new T.Shape();sh.moveTo(-.9,.55);sh.bezierCurveTo(-.7,.9,-.35,.9,.95,.85);sh.lineTo(.88,.55);sh.lineTo(.58,.55);sh.bezierCurveTo(.48,-.3,.35,-.75,.65,-.65);sh.lineTo(.8,-.52);sh.lineTo(.91,-.65);sh.bezierCurveTo(.42,-1.15,.07,-.85,.18,-.27);sh.lineTo(.3,.55);sh.lineTo(-.2,.55);sh.bezierCurveTo(-.25,-.1,-.38,-.65,-.65,-.9);sh.lineTo(-.96,-.86);sh.bezierCurveTo(-.66,-.46,-.6,.1,-.53,.55);sh.lineTo(-.9,.55);let pg=new T.ExtrudeGeometry(sh,{depth:.16,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:3,steps:1,curveSegments:24});pi=new T.Mesh(pg,new T.MeshStandardMaterial({color:gold,metalness:.65,roughness:.22,emissive:gold,emissiveIntensity:.4,transparent:true}));pi.position.set(0,.9,.4);hero.add(pi);
let dg=new T.BufferGeometry();dg.setAttribute('position',new T.BufferAttribute(new Float32Array(220*3),3));dissolve=new T.Points(dg,new T.PointsMaterial({color:blue,size:.04,blending:T.AdditiveBlending,transparent:true,depthWrite:false}));hero.add(dissolve);

new ResizeObserver(resize).observe($('#film'));resize();
}
function resize(){let w=$('#film').clientWidth,h=$('#film').clientHeight;renderer.setSize(w,h);composer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()}
function mapTime(t){if(!portrait)return t;if(t<9)return 12+t*2;if(t<19)return 30+(t-9)*2.2;if(t<24)return 52+(t-19)*4;return 72+(t-24)*2.6}
let formulaKey='';
function renderAt(raw){time=Math.max(0,Math.min(duration,raw));const t=mapTime(time);let idx=t<12?0:t<30?1:t<52?2:t<72?3:4;
$('#scene').textContent=`0${idx+1} — ${chapters[idx][0]}`;document.querySelectorAll('#chapters button').forEach((b,i)=>b.classList.toggle('active',i===idx));
let f='',caption='',theta=0,k=0;
if(idx===0){caption=t<4?'暗闇に、ひとつの点 O。':t<8?'中心から伸びる、長さ1の半径。':'同じ距離を保って、円が生まれる。';f=t>4?'r = 1':'';theta=0}
if(idx===1){k=ease((t-16)/9);theta=k;caption=t<16?'半径と同じ長さの光を、もう一本。':t<25?'長さを変えずに、円周へ曲げる。':'弧の長さが半径に等しい。この角が、1ラジアン。';f=t<25?'s=r\\theta': '1\\,\\mathrm{rad}=\\frac{180^\\circ}{\\pi}\\approx57.3^\\circ'}
if(idx===2){theta=Math.min(Math.PI,Math.max(0,(t-31)/5.4));caption=theta<3?'半径と同じ長さを、ひとつずつ巻いていく。':theta<Math.PI?'3本では、半円に少し届かない。':'あと約0.14159本。半円には、正確にπ本分。';f=theta<3?'1+1+1': '3+(\\pi-3)=\\pi\\approx3.14159'}
if(idx===3){theta=Math.PI;caption=t<58?'半円の弧長は、半径のπ倍。':t<65?'角度は、弧長と半径の比で決まる。':'半径によらない、角度の単位。';f=t<58?'L=\\pi r':t<63?'\\theta=\\frac{L}{r}=\\frac{\\pi r}{r}': '\\theta=\\pi\\,\\mathrm{rad}'}
if(idx===4){theta=mix(Math.PI,Math.PI*2,ease((t-85)/2.5));caption=t<85?'半回転を、πラジアンと呼ぶ。':'一周なら、2πラジアン。';f=t<85?'180^\\circ=\\pi\\,\\mathrm{rad}':'360^\\circ=2\\pi\\,\\mathrm{rad}'}
if(f!==formulaKey){$('#equation').innerHTML=katex.renderToString(f,{throwOnError:false});formulaKey=f}$('#caption').textContent=caption;
$('#seek').max=duration;$('#seek').value=time;$('#clock').textContent=fmt(time);$('#timecode').textContent=`${fmt(time)} / ${fmt(duration)}`;
if(!renderer)return;
const fade=1-ease((t-88)/2);hero.rotation.set(0,0,0);hero.position.y=-.55;
if(idx===4){let q=ease((t-72)/5)*(1-ease((t-77)/3));hero.rotation.y=q*.9;hero.rotation.x=q*.35}
let pos=new T.Vector3(0,1,10.7),look=new T.Vector3(0,.1,0),fov=42;
if(idx===0){pos.set(mix(.2,1.2,ease(t/12)),mix(.2,.7,ease(t/12)),mix(10.5,8.6,ease(t/12)));look.x=.3*ease(t/12)}
if(idx===1){pos.set(.75*Math.sin((t-12)*.16),.8,9.9);look.set(.35+.25*Math.cos(k),.2+.15*Math.sin(k),0)}
if(idx===2){pos.set(-.7,2.7,10.1);look.set(0,.35,0)}
if(idx===3){pos.set(.3*(1-ease((t-58)/8)),mix(1.5,.3,ease((t-52)/12)),mix(10,12,ease((t-56)/12)))}
if(idx===4){pos.set(0,.3,11.3);look.set(0,.15,0)}
if(portrait){pos.multiplyScalar(1.45);fov=48;look.set(0,.25,0)}camera.position.copy(pos);camera.fov=fov;camera.lookAt(look);camera.updateProjectionMatrix();
let grow=ease((t-2)/3);radius.visible=t>2;radius.material.opacity=(idx===3?1-ease((t-60)/4):.9)*fade;coords(radius,u=>[R*u*grow,0,0]);origin.scale.setScalar(ease(t/2));origin.material.opacity=fade;origin.userData.label.material.opacity=fade;
arc(outline,0,Math.PI*2*ease((t-5)/6));outline.material.opacity=(idx===0?.6:.18)*fade;
ray.visible=idx>0;coords(ray,u=>[R*u*Math.cos(theta),R*u*Math.sin(theta),.015]);ray.material.opacity=.8*fade;
arc(angle,0,theta,.42);angle.visible=idx>0;angle.material.opacity=.8*fade;
for(let i=0;i<4;i++){let b=bands[i];b.visible=idx>0;let len=i===3?Math.PI-3:1,start=i;let curve=0;
if(idx===1){b.visible=i===0;curve=k;start=0}
else if(idx===2){curve=ease((t-31-i*5.4)/3.6);b.visible=t>=31+i*5.4}
else if(idx>2){curve=1;if(idx===4&&t>85&&i===0){arc(b,0,theta);b.material.opacity=fade;continue}}
coords(b,u=>{let p=bendPoint(u,curve,start,len);if(idx===1&&t<16){const q=ease((t-12)/4),a=q*Math.PI/2;return [R*q+R*u*Math.cos(a),R*u*Math.sin(a),0]}return p});b.material.color.setHex(idx===1&&k>.99?gold:[blue,green,gold,red][i]).multiplyScalar(2.2);b.material.opacity=fade;let g=b.userData.glow;g.visible=b.visible;g.geometry.copy(b.geometry);g.material.opacity=.15*fade;
}
// For scene 3 the radial endpoint follows the very same band curvature, not a separate clock.
if(idx===2){let j=Math.min(3,Math.max(0,Math.floor((t-31)/5.4)));let len=j===3?Math.PI-3:1;let q=ease((t-31-j*5.4)/3.6);theta=t<31?0:j+q*len;coords(ray,u=>[R*u*Math.cos(theta),R*u*Math.sin(theta),.015]);arc(angle,0,theta,.42)}
pi.visible=idx===3&&t>=60;pi.scale.setScalar(.75+1.05*ease((t-60)/5));pi.material.opacity=ease((t-60)/3)*(1-ease((t-69)/3));pi.rotation.y=.25*Math.sin(t*.4);let dp=dissolve.geometry.attributes.position,dis=ease((t-60)/4);dissolve.visible=idx===3;dissolve.material.opacity=Math.sin(dis*Math.PI);for(let i=0;i<220;i++){let u=i/219;dp.setXYZ(i,R*u*(1-dis)+Math.sin(i*2.4)*dis*.7,dis*(.6+Math.cos(i*3.7)*.6),Math.sin(i)*dis*.5)}dp.needsUpdate=true;
let convergence=ease((t-59)/6)*(1-ease((t-67)/5));let a=stars.geometry.attributes.position;for(let i=0;i<a.count;i++){let j=i*3,shrink=1-convergence*.84;a.setXYZ(i,starBase[j]*shrink,starBase[j+1]*shrink,starBase[j+2]+Math.sin(t*.15+i)*.22)}a.needsUpdate=true;stars.rotation.z=t*.012;stars.material.opacity=.7*fade;
for(let i=0;i<rings.length;i++){let l=rings[i];l.rotation.z=t*(i%2?-.025:.018)+theta*.1;l.rotation.x=(i%5===0?.8:.3)+Math.sin(t*.12+i)*.08;l.scale.setScalar((.9+.1*grow)*(1-.25*convergence));l.material.opacity=(i%3?.22:.36)*(1+.2*Math.sin(t*1.2-i))*fade}
back.rotation.y=Math.sin(t*.08)*.1;light.position.set(R*Math.cos(theta),R*Math.sin(theta),2);light.color.setHex(idx===2?[blue,green,gold,red][Math.min(3,Math.floor(theta))]:gold);bloom.strength=.65+.35*Math.pow(Math.sin(t*.4),8)+convergence*.3;composer.render();
window.__state={time,t,theta,camera:camera.position.toArray(),ring:rings[0].rotation.toArray(),curvature:k,scene:idx+1};
}
function fmt(t){return `${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`}
try{setup()}catch(e){$('#fallback').hidden=false;console.error(e)}
function tick(now){if(playing){time+=(now-last)/1000;if(time>=duration){time=duration;playing=false;$('#play').textContent='▶ 再生'}}last=now;renderAt(time);requestAnimationFrame(tick)}
$('#play').onclick=()=>{if(time>=duration)time=0;playing=!playing;$('#play').textContent=playing?'Ⅱ 一時停止':'▶ 再生'};$('#restart').onclick=()=>{time=0;playing=true;$('#play').textContent='Ⅱ 一時停止'};$('#seek').oninput=e=>{time=+e.target.value;renderAt(time)};$('#format').onclick=()=>{portrait=!portrait;duration=portrait?30:90;time=0;document.body.classList.toggle('portrait',portrait);$('#format').textContent=portrait?'横型 90秒へ':'縦型 30秒へ';document.querySelector('.intro small').textContent='数学Ⅱ · 三角関数と弧度法　 /　'+duration+' SEC';resize()};$('#full').onclick=()=>$('#film').requestFullscreen?.();$('#chapters').onclick=e=>{let b=e.target.closest('button');if(b){if(portrait)$('#format').click();time=+b.dataset.t}};
window.seekFilm=t=>{playing=false;renderAt(t)};window.filmReady=true;time=+(params.get('t')||0);renderAt(time);if(!params.has('export'))requestAnimationFrame(tick);
