// Reference: trig-integral-cinema FormulaTunnel / GoldenRelease and two-paths WebGL.
// Real perspective, additive particles, HDR bloom and a view-dependent Reflector.
import * as THREE from 'three';
import {Reflector} from 'three/examples/jsm/objects/Reflector.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {drawMath} from './math.js';import {constraints,box,clip,region,vertices,objectiveSegment,ease,mix} from './model.js';
const seed=i=>{const a=Math.sin(i*127.1+311.7)*43758.5453;return a-Math.floor(a)},TAU=Math.PI*2;
export function createWorld(w=1280,h=720){
 const make=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
 const renderer=new THREE.WebGLRenderer({antialias:false,preserveDrawingBuffer:true});renderer.setSize(w,h);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#030b17');scene.fog=new THREE.FogExp2('#030b17',.012);const camera=new THREE.PerspectiveCamera(54,w/h,.1,160);
 const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new THREE.Vector2(w,h),.68,.5,1.05);composer.addPass(bloom);composer.addPass(new OutputPass());
 const gold=new THREE.Color(3.8,2.2,.6),ice=new THREE.Color(.45,1.45,2.1),makeMat=(color,opacity=1)=>new THREE.MeshBasicMaterial({color,transparent:opacity<1,opacity,side:THREE.DoubleSide,depthWrite:opacity===1,toneMapped:false});
 const add=(geo,mat,parent=scene)=>{const m=new THREE.Mesh(geo,mat);parent.add(m);return m};
 const sprite=make(64,64),sg=sprite.getContext('2d'),grad=sg.createRadialGradient(32,32,0,32,32,32);grad.addColorStop(0,'white');grad.addColorStop(.2,'#ffffffcc');grad.addColorStop(.55,'#ffffff22');grad.addColorStop(1,'#ffffff00');sg.fillStyle=grad;sg.fillRect(0,0,64,64);const tex=new THREE.CanvasTexture(sprite);
 const hall=new THREE.Group();scene.add(hall);const atl=make(1024,1024),ag=atl.getContext('2d');ag.fillStyle='#05111e';ag.fillRect(0,0,1024,1024);for(let i=0;i<12;i++)drawMath(ag,make,['c0','c1','c2','c3','sum','line','ans','general'][i%8],512,45+i*83,30,i%3?'#74c6e9':'#ffe3a1');ag.strokeStyle='#1b3d57';ag.lineWidth=1;for(let i=0;i<=8;i++){ag.beginPath();ag.moveTo(i*128,0);ag.lineTo(i*128,1024);ag.moveTo(0,i*128);ag.lineTo(1024,i*128);ag.stroke();}const atlas=new THREE.CanvasTexture(atl);atlas.colorSpace=THREE.SRGBColorSpace;
 const walls=new THREE.InstancedMesh(new THREE.PlaneGeometry(11,12),new THREE.MeshBasicMaterial({map:atlas,side:THREE.DoubleSide}),20);hall.add(walls);
 const pillars=new THREE.InstancedMesh(new THREE.BoxGeometry(.045,12,.06),makeMat(gold),60);hall.add(pillars);const bars=new THREE.InstancedMesh(new THREE.BoxGeometry(29,.025,.04),makeMat(ice),20);hall.add(bars);const tmp=new THREE.Object3D();let a=0,b=0;
 for(let i=0;i<10;i++){for(const side of [-1,1]){tmp.position.set(side*14.8,0,-i*11);tmp.rotation.set(0,-side*Math.PI/2,0);tmp.scale.setScalar(1);tmp.updateMatrix();walls.setMatrixAt(a++,tmp.matrix);for(let j=0;j<3;j++){tmp.position.set(side*(14.6-j*.24),0,-i*11+5.3);tmp.rotation.set(0,0,0);tmp.updateMatrix();pillars.setMatrixAt(b++,tmp.matrix);}}for(const [j,y] of [-6,6].entries()){tmp.position.set(0,y,-i*11+5.3);tmp.rotation.set(0,0,0);tmp.updateMatrix();bars.setMatrixAt(i*2+j,tmp.matrix);}}
 const mirror=new Reflector(new THREE.PlaneGeometry(90,150),{textureWidth:384,textureHeight:384,color:'#89a0b6',clipBias:.003,multisample:0});mirror.rotation.x=-Math.PI/2;mirror.position.set(0,-6.15,-42);scene.add(mirror);
 const veil=add(new THREE.PlaneGeometry(90,150),makeMat('#041321',.48));veil.rotation.x=-Math.PI/2;veil.position.copy(mirror.position);veil.position.y+=.01;
 const floorGrid=new THREE.GridHelper(100,50,'#2c8aab','#17334d');floorGrid.position.set(0,-6.12,-35);floorGrid.material.transparent=true;floorGrid.material.opacity=.4;scene.add(floorGrid);
 const dustN=2200,dustP=new Float32Array(dustN*3),dustC=new Float32Array(dustN*3);for(let i=0;i<dustN;i++){const c=i%3?ice:gold;dustC.set([c.r,c.g,c.b],i*3);}const dustG=new THREE.BufferGeometry();dustG.setAttribute('position',new THREE.BufferAttribute(dustP,3));dustG.setAttribute('color',new THREE.BufferAttribute(dustC,3));const dust=new THREE.Points(dustG,new THREE.PointsMaterial({map:tex,size:.06,vertexColors:true,transparent:true,opacity:.65,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));dust.frustumCulled=false;scene.add(dust);
 const ribbons=[];for(let j=0;j<8;j++){const data=new Float32Array(160*3),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(data,3));const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:j%2?ice:gold,transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));line.frustumCulled=false;scene.add(line);ribbons.push({data,geo,line,j});}
 const rings=[];for(let i=0;i<4;i++){const m=add(new THREE.TorusGeometry(9+i*.8,.012,4,144),makeMat(i%2?ice:gold,.28));m.position.set(0,0,-25-i*8);rings.push(m);}
 // The mathematical stage is a two-dimensional coordinate plane in 3D space.
 const graph=new THREE.Group();graph.position.set(1,-4,3.5);graph.scale.setScalar(1.45);scene.add(graph);
 const plate=add(new THREE.PlaneGeometry(9.4,8.5),makeMat('#071321',.82),graph);plate.position.set(3.5,3,-.20);
 const gridPts=[];for(let i=-1;i<=8;i++)gridPts.push(new THREE.Vector3(i,-1,-.10),new THREE.Vector3(i,7,-.10));for(let i=-1;i<=7;i++)gridPts.push(new THREE.Vector3(-1,i,-.10),new THREE.Vector3(8,i,-.10));const grid=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(gridPts),new THREE.LineBasicMaterial({color:'#44829f',transparent:true,opacity:.35}));graph.add(grid);
 const lineObject=(points,color,opacity=1,parent=graph)=>{const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color,transparent:opacity<1,opacity,toneMapped:false}));parent.add(line);return line};
 lineObject([[-1,0,.06],[8,0,.06]],ice);lineObject([[0,-1,.06],[0,7,.06]],ice);
 for(const [x,y,rot] of [[7.9,0,-Math.PI/2],[0,6.9,0]]){const cone=add(new THREE.ConeGeometry(.065,.2,8),makeMat(ice),graph);cone.position.set(x,y,.06);cone.rotation.z=rot;}
 const shapeGeo=poly=>{const shape=new THREE.Shape(poly.map(p=>new THREE.Vector2(...p)));return new THREE.ShapeGeometry(shape);};
 const sheets=constraints.map((c,i)=>{const poly=clip(box,c),m=add(shapeGeo(poly),makeMat(c.color,.16),graph);m.renderOrder=i+1;return m;});
 const boundaries=constraints.map(c=>{const p=[];for(let i=0;i<box.length;i++){const v=box[i],q=box[(i+1)%box.length],d=c.a*v[0]+c.b*v[1]-c.c,e=c.a*q[0]+c.b*q[1]-c.c;if(Math.abs(d)<1e-8)p.push(v);if(d*e<0){const u=d/(d-e);p.push([mix(v[0],q[0],u),mix(v[1],q[1],u)]);}}return lineObject(p.map(p=>[...p,.08]),new THREE.Color(c.color).multiplyScalar(1.3));});
 let regionKey='',commonGeo=shapeGeo(vertices);const common=add(commonGeo,makeMat(new THREE.Color(1.5,.85,.2),.28),graph);common.position.z=.03;common.renderOrder=6;
 const edge=lineObject([...vertices,vertices[0]].map(p=>[...p,.12]),new THREE.Color(2.2,1.35,.4));
 const vertexLights=vertices.map(p=>{const m=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:gold,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));m.position.set(...p,.17);m.scale.setScalar(.36);graph.add(m);return m;});
 const objective=lineObject([[0,0,.2],[0,0,.2]],gold);const objectiveGlow=lineObject([[0,0,.18],[0,0,.18]],new THREE.Color(2,1.3,.35),.4);const goldTube=add(new THREE.CylinderGeometry(.024,.024,1,8),makeMat(gold),graph);
 const intercept=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:gold,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));graph.add(intercept);intercept.scale.setScalar(.72);
 const hit=new THREE.Sprite(intercept.material.clone());graph.add(hit);hit.scale.setScalar(.7);
 const wave=add(new THREE.TorusGeometry(1,.012,4,100),makeMat(gold,.5),graph);wave.position.z=.22;
 const ghosts=[0,5].map(k=>lineObject(objectiveSegment(k).map(p=>[...p,.15]),new THREE.Color(1.4,.8,.22),.3));
 let last;
 function render(q){last=q;const {t,s,u,k}=q,rear=s>=3||q.manual,pulse=(s===5||s===6)?Math.exp(-u*3):s===2?Math.exp(-u*4):0;
  camera.position.set(s===0?Math.sin(t*.12)*.8:Math.sin(t*.055)*.08,s===0?.4:0,22-(s===0?ease(u)*2:0));camera.lookAt(0,0,-10);camera.updateMatrixWorld();
  hall.position.z=(t*(s===0?1.4:.55))%11;hall.rotation.y=Math.sin(t*.06)*.016;hall.visible=!rear;mirror.visible=true;veil.material.opacity=rear?.36:.48;
  pillars.material.color.copy(rear?gold:new THREE.Color(2.6,1.5,.45));floorGrid.position.z=-35+(t*.5)%2;scene.fog.color.set(rear?'#0e1420':'#030b17');
  graph.visible=s>0||q.manual;graph.rotation.set((1-q.flat)*.24,(1-q.flat)*-.38+q.orbit,0);graph.updateMatrixWorld(true);
  const merge=ease((t-25)/5);for(let i=0;i<4;i++){sheets[i].visible=q.enabled[i]&&i<q.reveal&&(s<=1||q.manual);sheets[i].position.z=(1-merge)*(3-i)*.6;sheets[i].material.opacity=q.manual?.09:.15;boundaries[i].visible=q.enabled[i]&&i<q.reveal;boundaries[i].position.z=sheets[i].visible?sheets[i].position.z:0;}
  const r=region(q.enabled),key=JSON.stringify(q.enabled);if(key!==regionKey){common.geometry.dispose();common.geometry=shapeGeo(r);edge.geometry.dispose();edge.geometry=new THREE.BufferGeometry().setFromPoints([...r,r[0]].filter(Boolean).map(p=>new THREE.Vector3(...p,.12)));regionKey=key;}
  common.visible=q.common;edge.visible=q.common;common.material.opacity=.24+pulse*.15;for(let i=0;i<4;i++)vertexLights[i].visible=q.common&&q.enabled.every(Boolean);
  objective.visible=q.objective;objectiveGlow.visible=q.objective;goldTube.visible=q.objective;intercept.visible=q.objective;hit.visible=q.objective&&(q.max||q.min)&&q.enabled.every(Boolean);wave.visible=hit.visible;
  const seg=objectiveSegment(k);if(seg.length===2){const ps=seg.map(p=>new THREE.Vector3(...p,.2));objective.geometry.setFromPoints(ps);objectiveGlow.geometry.setFromPoints(ps.map(p=>p.clone().setZ(.18)));const mid=ps[0].clone().add(ps[1]).multiplyScalar(.5),length=ps[0].distanceTo(ps[1]);goldTube.position.copy(mid);goldTube.scale.set(1,length,1);goldTube.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),ps[1].clone().sub(ps[0]).normalize());}
  const color=q.intersects?gold:new THREE.Color(.3,.65,.9);objective.material.color.copy(color);goldTube.material.color.copy(color);intercept.material.color.copy(color);intercept.position.set(0,k,.24);intercept.scale.setScalar(.6+pulse*.8+.06*Math.sin(t*2));hit.position.set(q.max?3:0,q.max?2:0,.24);hit.scale.setScalar(.7+pulse*.8);wave.position.copy(hit.position);wave.scale.setScalar(.3+(t*.65)%1.6);wave.material.opacity=.35*(1-((t*.65)%1.6)/1.6);
  ghosts.forEach(g=>g.visible=s===7&&!q.manual);
  // Open rear stage: orbiting gold beams and a sweeping energy crown replace walls.
  rings.forEach((r,i)=>{r.position.set(rear?6:0,rear?0:0,rear?-12-i*6:-25-i*8);r.rotation.set(rear?Math.PI/2+.1*Math.sin(t*.1+i):.1*Math.sin(t*.1+i),.3*Math.cos(t*.09+i),t*(i%2?-.05:.04));r.material.opacity=rear?.4:.22;r.scale.setScalar(rear?.9:1);});
  for(let i=0;i<dustN;i++){const a=seed(i+3)*TAU+t*.08,z=12-((seed(i)+t*(rear?.017:.011))%1)*110;dustP[i*3]=(rear?8:12)*Math.cos(a)+(rear?3:0);dustP[i*3+1]=(rear?6:7)*Math.sin(a);dustP[i*3+2]=z;}dustG.attributes.position.needsUpdate=true;
  for(const r of ribbons){for(let i=0;i<160;i++){const f=i/159,a=f*TAU*1.4-t*.4+r.j*.06;r.data[i*3]=(rear?7:10)*Math.cos(a)+(rear?4:0);r.data[i*3+1]=(rear?2.8:4)*Math.sin(a)-2;r.data[i*3+2]=8-f*100;}r.geo.attributes.position.needsUpdate=true;r.line.material.opacity=rear?.2:.32;}
  bloom.strength=(rear?.7:.6)+pulse*.27;composer.render();return labels(q);
 }
 function project(x,y,z=.3){const v=new THREE.Vector3(x,y,z);graph.localToWorld(v);v.project(camera);return [(v.x+1)*960,(1-v.y)*540];}
 function labels(q=last){const ticks=[];for(let i=1;i<=6;i++)ticks.push({text:String(i),p:project(i,-.27),kind:'x'},{text:String(i),p:project(-.27,i),kind:'y'});return {ticks,vertices:vertices.map(p=>({text:`(${p[0]}, ${p[1]})`,p:project(...p)})),origin:project(0,0),x:project(7.8,-.25),y:project(-.25,6.9),intercept:project(0,q.k),hit:project(q.max?3:0,q.max?2:0)};}
 return {canvas:renderer.domElement,renderer,render,labels,dispose(){composer.dispose();renderer.dispose();}};
}
