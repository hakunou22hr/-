import {useEffect,useRef,useState} from 'react';
import {smoothProgress,substitutionSample}from'./model';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
export function Scene({time,explore,flat,x,mode,reverse=0,reverseActive=false,travel=0,space=false}:{time:number;explore:boolean;flat:boolean;x:number;mode:'substitution'|'parts';reverse?:number;reverseActive?:boolean;travel?:number;space?:boolean}){
 const host=useRef<HTMLDivElement>(null);const state=useRef({time,explore,flat,x,mode,reverse,reverseActive,travel,space});state.current={time,explore,flat,x,mode,reverse,reverseActive,travel,space};const[error,setError]=useState(false);
 useEffect(()=>{
  if(!host.current)return;let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch{setError(true);return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0x000000,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;host.current.appendChild(renderer.domElement);
  const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(48,1,.1,180);camera.position.set(8,5,15);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=5;controls.maxDistance=45;controls.enablePan=true;
  const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new THREE.Vector2(800,450),.8,.45,.65);composer.addPass(bloom);
  const world=new THREE.Group();scene.add(world);const surfaceGroup=new THREE.Group();world.add(surfaceGroup);
  const grid=new THREE.GridHelper(45,45,0x2284a8,0x164059);grid.position.y=-3.5;(grid.material as THREE.Material).transparent=true;(grid.material as THREE.Material).opacity=.42;world.add(grid);
  let seed=418;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const glowCanvas=document.createElement('canvas');glowCanvas.width=32;glowCanvas.height=32;const g=glowCanvas.getContext('2d')!;const grad=g.createRadialGradient(16,16,0,16,16,16);grad.addColorStop(0,'#fff');grad.addColorStop(.15,'#fff');grad.addColorStop(.5,'#ffffff55');grad.addColorStop(1,'#ffffff00');g.fillStyle=grad;g.fillRect(0,0,32,32);const glowTexture=new THREE.CanvasTexture(glowCanvas);
  function pointCloud(count:number,color:string,size:number){const coords=new Float32Array(count*3);for(let i=0;i<count;i++){coords[i*3]=(rnd()-.5)*48;coords[i*3+1]=(rnd()-.5)*26;coords[i*3+2]=(rnd()-.5)*50;}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(coords,3));const mat=new THREE.PointsMaterial({color,size,map:glowTexture,transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending});const p=new THREE.Points(geo,mat);world.add(p);return p;}
  const stars=pointCloud(1800,'#5fcaff',.11),gold=pointCloud(700,'#ffc979',.09);const starBase=(stars.geometry.attributes.position.array as Float32Array).slice();const goldBase=(gold.geometry.attributes.position.array as Float32Array).slice();
  const formulaField=new THREE.Group();world.add(formulaField);const textures:THREE.Texture[]=[glowTexture];const equations=['∫ sin²x cos x dx','u = sin x','du = cos x dx','∫ u² du','u³ / 3 + C','(fg)′ = f′g + fg′','∫ x cos x dx','x sin x + cos x + C','F′(g(x)) g′(x)','∫ f g′ dx = fg − ∫ f′g dx'];
  for(let i=0;i<24;i++){const c=document.createElement('canvas');c.width=768;c.height=128;const ctx=c.getContext('2d')!;ctx.font='44px Georgia,serif';ctx.fillStyle=i%3===0?'#ffd393':'#92e9ff';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=14;ctx.fillText(equations[i%equations.length],18,80);const tex=new THREE.CanvasTexture(c);textures.push(tex);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,opacity:.38,depthWrite:false}));sprite.scale.set(6.5,1.1,1);sprite.position.set((i%2===0?-1:1)*(8+rnd()*7),-1+rnd()*10,-22+rnd()*34);sprite.userData.baseY=sprite.position.y;formulaField.add(sprite);}
  function makeLine(color:string){const line=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color,transparent:true,opacity:.95}));surfaceGroup.add(line);return line;}
  const curve=makeLine('#73f3ff'),second=makeLine('#ffd289'),axis=makeLine('#3e9db9'),tangent=makeLine('#ffffff');
  axis.geometry.setFromPoints([new THREE.Vector3(-6,0,0),new THREE.Vector3(6,0,0),new THREE.Vector3(0,0,0),new THREE.Vector3(0,4,0),new THREE.Vector3(0,-4,0)]);
  const bead=new THREE.Mesh(new THREE.SphereGeometry(.095,14,14),new THREE.MeshBasicMaterial({color:'#f6fcff'}));surfaceGroup.add(bead);
  const surfaces=[0,1].map(i=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(141*25*3),3));const p=new THREE.Points(geo,new THREE.PointsMaterial({color:i===0?'#69ddff':'#ff7667',size:.045,map:glowTexture,transparent:true,opacity:.6,depthWrite:false,blending:THREE.AdditiveBlending}));surfaceGroup.add(p);return p;});
  const wireLines=Array.from({length:16},(_,i)=>makeLine(i<8?'#40ccff':'#ff695c'));
  const portal=new THREE.Group();world.add(portal);for(let i=0;i<4;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(7.2+i*.65,.04,6,160),new THREE.MeshBasicMaterial({color:i===1?'#ffc06a':'#5bd6ff',transparent:true,opacity:.7}));ring.rotation.set(.4+i*.45,i*.4,.2+i*.35);portal.add(ring);}portal.position.set(-1,-1,-6);
  const traceGeo=new THREE.BufferGeometry();traceGeo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(360*3),3));const traceColors=new Float32Array(360*3);for(let i=0;i<360;i++){const c=new THREE.Color(i<180?'#66e7ff':'#ff9867');traceColors.set([c.r,c.g,c.b],i*3);}traceGeo.setAttribute('color',new THREE.BufferAttribute(traceColors,3));const traces=new THREE.Points(traceGeo,new THREE.PointsMaterial({vertexColors:true,map:glowTexture,size:.13,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));surfaceGroup.add(traces);
  const constellation=new THREE.Group();world.add(constellation);const constellations=[] as THREE.Vector3[];for(let i=0;i<24;i++){const v=new THREE.Vector3((i%6-2.5)*4,Math.floor(i/6)*3-3,-10+(i%3)*6);constellations.push(v);}
  const dots=new THREE.Points(new THREE.BufferGeometry().setFromPoints(constellations),new THREE.PointsMaterial({color:'#69e7ff',map:glowTexture,size:.2,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));constellation.add(dots);
  const lattice=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(constellations.flatMap((p,i)=>i%6<5?[p,constellations[i+1]]:[])),new THREE.LineBasicMaterial({color:'#47bdda',transparent:true,opacity:.36}));constellation.add(lattice);
  for(const [i,p]of constellations.entries()){if(i%4)continue;const c=document.createElement('canvas');c.width=384;c.height=80;const ctx=c.getContext('2d')!;ctx.font='28px monospace';ctx.fillStyle='#9eefff';ctx.shadowColor='#26d7ff';ctx.shadowBlur=12;ctx.fillText(`(${p.x}, ${p.y}, ${p.z})`,8,48);const tex=new THREE.CanvasTexture(c);textures.push(tex);const label=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,opacity:.7,depthWrite:false}));label.position.copy(p).add(new THREE.Vector3(.7,.4,0));label.scale.set(3.5,.75,1);constellation.add(label);}
  const intersection=new THREE.Mesh(new THREE.SphereGeometry(.12,12,12),new THREE.MeshBasicMaterial({color:'#fff3c5'}));surfaceGroup.add(intersection);
  let prevMode='',prevSample=99,prevReverse=-1,prevActive=false;const plot=(m:string,r:number,active:boolean)=>{
   const sub=m==='substitution';const F=sub?(v:number)=>Math.sin(v):(v:number)=>v*Math.sin(v);const df=sub?(v:number)=>Math.cos(v):(v:number)=>Math.sin(v)+v*Math.cos(v);
   const functions=active?[sub?(v:number)=>Math.sin(v)**3/3:(v:number)=>v*Math.sin(v)+Math.cos(v),sub?(v:number)=>Math.sin(v)**2*Math.cos(v):(v:number)=>v*Math.cos(v)]:[F,df];
   [curve,second].forEach((line,i)=>{line.geometry.dispose();line.geometry=new THREE.BufferGeometry().setFromPoints(Array.from({length:241},(_,j)=>{const v=-Math.PI+j*Math.PI*2/240;return new THREE.Vector3(v*1.7,functions[i](v)*.85,0);}));(line.material as THREE.LineBasicMaterial).opacity=active?(i===0?1-r*.7:.25+r*.75):.95;});
   surfaces.forEach((p,i)=>{const vals=p.geometry.attributes.position.array as Float32Array;const fun=sub?(i===0?Math.sin:Math.cos):(i===0?Math.sin:(v:number)=>v*Math.cos(v));for(let a=0;a<141;a++){const v=-Math.PI+a*Math.PI*2/140;for(let b=0;b<25;b++){const idx=(a*25+b)*3;const z=-2.7+b*5.4/24;vals[idx]=v*1.7;vals[idx+1]=fun(v)*1.05;vals[idx+2]=z;}}p.geometry.attributes.position.needsUpdate=true;});
   wireLines.forEach((l,i)=>{const row=i%8,z=-2.7+row*5.4/7;const fun=sub?(i<8?Math.sin:Math.cos):(i<8?Math.sin:(v:number)=>v*Math.cos(v));l.geometry.dispose();l.geometry=new THREE.BufferGeometry().setFromPoints(Array.from({length:141},(_,j)=>{const v=-Math.PI+j*Math.PI*2/140;return new THREE.Vector3(v*1.7,fun(v)*1.05,z);}));(l.material as THREE.LineBasicMaterial).opacity=.18;});
  };
  const exportFrames=new URLSearchParams(location.search).has('exportFrames');const exportTarget=window as unknown as {__renderScene?:()=>void};
  let frame=0,destroyed=false,last=performance.now(),ambient=0,oldExplore=false,oldTravel=0,renderStamp='',lastRender=0;
  const draw=(now:number)=>{if(destroyed)return;if(!exportFrames)frame=requestAnimationFrame(draw);const s=state.current;const stamp=[s.time,s.explore,s.flat,s.x,s.mode,s.reverse,s.reverseActive,s.travel,s.space].join('|');if(!exportFrames&&now-lastRender<33)return;if(!exportFrames&&!s.space&&stamp===renderStamp)return;renderStamp=stamp;lastRender=now;const dt=Math.min(.05,(now-last)/1000);last=now;if(s.explore&&s.space)ambient+=dt;const moment=s.reverseActive?(1-s.reverse)*6.5:s.explore?ambient:s.time;
   const classroom=!s.explore&&(s.time<5||s.time>=82);world.visible=!classroom;controls.enabled=s.explore&&s.space&&!s.flat;
   const m=s.explore?s.mode:s.time>=40&&s.time<82?'parts':'substitution';const sample=s.reverse>0?3-s.reverse*6:s.explore?s.x:s.time>=20&&s.time<40?substitutionSample(s.time):Math.sin(s.time*.6)*2.7;
   if(m!==prevMode||Math.abs(s.reverse-prevReverse)>.015||s.reverseActive!==prevActive){plot(m,s.reverse,s.reverseActive);prevMode=m;prevReverse=s.reverse;prevActive=s.reverseActive;}
   if(sample!==prevSample){const fn=m==='substitution'?Math.sin:(v:number)=>v*Math.sin(v);const df=m==='substitution'?Math.cos:(v:number)=>Math.sin(v)+v*Math.cos(v);const y=fn(sample)*.85;bead.position.set(sample*1.7,y,.08);tangent.geometry.dispose();tangent.geometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(sample*1.7-.8,y-df(sample)*.85*.8/1.7,.05),new THREE.Vector3(sample*1.7+.8,y+df(sample)*.85*.8/1.7,.05)]);prevSample=sample;}
   surfaces.forEach(p=>p.visible=!s.flat&&!s.reverseActive);wireLines.forEach(l=>l.visible=!s.flat&&!s.reverseActive);bead.visible=!s.reverseActive;tangent.visible=!s.reverseActive;formulaField.visible=!s.flat;portal.visible=!s.flat;grid.visible=!s.flat;
   if(s.flat){camera.position.set(0,0,16);controls.target.set(0,0,0);}else if(!s.explore){const entry=s.time>=5&&s.time<20;const p=smoothProgress(s.time,5,20);camera.position.set(entry?6*Math.sin(moment*.45)*(1-p*.55):4.5*Math.sin(moment*.15),entry?3.3+Math.sin(moment*.7)*1.4:2.6+Math.sin(moment*.4)*.8,entry?17-p*8+Math.sin(moment*.9)*1.2:12.5+Math.cos(moment*.45)*2);controls.target.set(0,entry?.6:.2,entry?-4*p:0);}else if(!oldExplore){camera.position.set(7,4.5,15);controls.target.set(0,0,0);}if(s.explore&&s.travel!==oldTravel){const delta=s.travel-oldTravel;camera.position.z-=delta*3;controls.target.z-=delta*3;}
   oldExplore=s.explore;oldTravel=s.travel;const entry=!s.explore&&s.time>=5&&s.time<20;const motion=entry?1.7:m==='parts'?1.25:1;
   stars.rotation.y=moment*.075*motion;gold.rotation.y=-moment*.095*motion;
   [stars,gold].forEach((cloud,k)=>{const values=cloud.geometry.attributes.position.array as Float32Array,base=k===0?starBase:goldBase;for(let i=0;i<values.length/3;i++){values[i*3]=base[i*3]+Math.sin(moment*.8+i*.07)*.18;values[i*3+1]=base[i*3+1];values[i*3+2]=((base[i*3+2]+moment*motion*2+250)%50)-25;}cloud.geometry.attributes.position.needsUpdate=true;});
   portal.rotation.set(Math.sin(moment*.7)*.5,moment*(entry?.75:.25),moment*(entry?1.05:.3));portal.scale.setScalar((entry?1.15:.85)+(entry?.38:.12)*Math.sin(moment*(entry?1.5:.8)));portal.position.z=-6+Math.sin(moment*.8)*(entry?4:1.6);
   portal.children.forEach((ring,i)=>{ring.rotation.x=.4+i*.45+Math.sin(moment*.9+i)*.55;ring.rotation.y=i*.4+moment*.4*(i%2?1:-1);});
   constellation.rotation.y=moment*.06;constellation.position.z=Math.sin(moment*.65)*2;(dots.material as THREE.PointsMaterial).opacity=.55+.4*Math.abs(Math.sin(moment*1.8));
   surfaceGroup.rotation.y=s.flat?0:Math.sin(moment*.4)*.13;surfaceGroup.position.z=s.flat?0:Math.sin(moment*.7)*.55;
   const separation=!s.explore&&m==='parts'?1.15*Math.sin(smoothProgress(s.time,40,62)*Math.PI):0;
   surfaces.forEach((p,i)=>{p.position.x=(i===0?-1:1)*separation;p.position.z=s.flat?0:Math.sin(moment*.9+i*Math.PI)*.3;(p.material as THREE.PointsMaterial).opacity=.55+.3*Math.abs(Math.sin(moment*2.1+i));});
   wireLines.forEach((line,i)=>{line.position.x=(i<8?-1:1)*separation;});
   const vals=traceGeo.attributes.position.array as Float32Array;for(let i=0;i<360;i++){const side=i<180?0:1;const v=-Math.PI+((i%180/180+moment*.2)%1)*Math.PI*2;const fn=m==='substitution'?(side===0?Math.sin:Math.cos):(side===0?Math.sin:(x:number)=>x*Math.cos(x));vals[i*3]=v*1.7+(side===0?-1:1)*separation;vals[i*3+1]=fn(v)*1.05;vals[i*3+2]=Math.sin(i*.15+moment*.75)*2.7;}traceGeo.attributes.position.needsUpdate=true;
   traces.visible=!s.flat&&!s.reverseActive;intersection.visible=!s.reverseActive;intersection.position.set(m==='substitution'?Math.PI/4*1.7:0,m==='substitution'?Math.SQRT1_2*.85:0,.1);intersection.scale.setScalar(1+.35*Math.sin(moment*3));
   if(s.flat){constellation.visible=false;surfaceGroup.rotation.set(0,0,0);surfaceGroup.position.set(0,0,0);}else constellation.visible=true;

   const reading=!s.explore&&s.time>=20&&s.time<62;
   formulaField.children.forEach((obj,i)=>{obj.position.y=obj.userData.baseY+Math.sin(moment*.9+i)*.5;const sprite=obj as THREE.Sprite;sprite.scale.set(reading?3.6:6.5,reading?.61:1.1,1);sprite.material.opacity=reading?.08+.035*Math.abs(Math.sin(moment*1.3+i)):.28+.18*Math.abs(Math.sin(moment*1.3+i));sprite.visible=true;});
   bead.scale.setScalar(1+.22*Math.sin(moment*3));bloom.strength=s.flat?.3:entry?1.12:.88;controls.update();
   // Reserve screen-space regions for the actual foreground layout, including animation clearance.
   if(reading&&host.current){
    const view=host.current.getBoundingClientRect();const stage=host.current.closest('.stage');
    const reserved=Array.from(stage?.querySelectorAll<HTMLElement>('.formula-scene,.substitution-map,.parts-terms,.graph-card,.subtitle')||[]).map(el=>{const r=el.getBoundingClientRect();return{left:r.left-view.left-24,right:r.right-view.left+24,top:r.top-view.top-24,bottom:r.bottom-view.top+28};});
    camera.updateMatrixWorld();scene.updateMatrixWorld(true);
    const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0),up=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1);
    for(const child of formulaField.children){const sprite=child as THREE.Sprite;const center=new THREE.Vector3();sprite.getWorldPosition(center);const corners=[[-1,-1],[-1,1],[1,-1],[1,1]].map(([a,b])=>center.clone().addScaledVector(right,a*sprite.scale.x/2).addScaledVector(up,b*sprite.scale.y/2).project(camera));
     if(corners.some(p=>p.z< -1||p.z>1)){sprite.visible=false;continue;}
     const left=Math.min(...corners.map(p=>(p.x+1)*view.width/2)),r=Math.max(...corners.map(p=>(p.x+1)*view.width/2)),top=Math.min(...corners.map(p=>(1-p.y)*view.height/2)),bottom=Math.max(...corners.map(p=>(1-p.y)*view.height/2));
     sprite.visible=!reserved.some(box=>left<box.right&&r>box.left&&top<box.bottom&&bottom>box.top);
    }
   }
   if(exportFrames&&classroom)renderer.clear();else composer.render();
  };
  const resize=()=>{if(!host.current)return;const {width,height}=host.current.getBoundingClientRect();if(!width||!height)return;renderStamp='';renderer.setSize(width,height);composer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(host.current);resize();if(exportFrames){exportTarget.__renderScene=()=>draw(performance.now());draw(performance.now());}else frame=requestAnimationFrame(draw);
  return()=>{if(exportFrames)delete exportTarget.__renderScene;destroyed=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();scene.traverse(obj=>{if(obj instanceof THREE.Mesh||obj instanceof THREE.Line||obj instanceof THREE.Points){obj.geometry.dispose();const mats=Array.isArray(obj.material)?obj.material:[obj.material];mats.forEach(m=>m.dispose());}else if(obj instanceof THREE.Sprite)obj.material.dispose();});textures.forEach(t=>t.dispose());bloom.dispose();composer.dispose();renderer.dispose();renderer.domElement.remove();};
 },[]);
 return <div className="webgl" ref={host}>{error&&<div className="fallback">WebGLを利用できません。数式・字幕・2Dグラフで学習できます。</div>}</div>;
}
