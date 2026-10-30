// Reference: trig-integral-cinema FormulaTunnel / GoldenRelease and two-paths WebGL.
// Real perspective, additive particles, HDR bloom and a view-dependent Reflector.
import * as THREE from 'three';
import {Reflector} from 'three/examples/jsm/objects/Reflector.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {FXAAShader} from 'three/examples/jsm/shaders/FXAAShader.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {drawMath} from './math.js';import {R,MIN,MAX,MIN_POINT,MAX_POINT,arc,ease,mix} from './model.js';
const seed=i=>{const a=Math.sin(i*127.1+311.7)*43758.5453;return a-Math.floor(a)},TAU=Math.PI*2;
export function createWorld(w=1280,h=720,view={}){
 const portrait=view.portrait===true;
 const make=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
 const renderer=new THREE.WebGLRenderer({antialias:false,preserveDrawingBuffer:true});renderer.setSize(w,h);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#030b17');scene.fog=new THREE.FogExp2('#030b17',.012);const camera=new THREE.PerspectiveCamera(48,w/h,.1,160);
 const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new THREE.Vector2(w,h),.85,.65,.9);composer.addPass(bloom);composer.addPass(new OutputPass());const fxaa=new ShaderPass(FXAAShader);fxaa.material.uniforms.resolution.value.set(1/w,1/h);composer.addPass(fxaa);
 const gold=new THREE.Color(3.8,2.2,.6),ice=new THREE.Color(.45,1.45,2.1),makeMat=(color,opacity=1)=>new THREE.MeshBasicMaterial({color,transparent:opacity<1,opacity,side:THREE.DoubleSide,depthWrite:opacity===1,toneMapped:false});
 const add=(geo,mat,parent=scene)=>{const m=new THREE.Mesh(geo,mat);parent.add(m);return m};
 const sprite=make(64,64),sg=sprite.getContext('2d'),grad=sg.createRadialGradient(32,32,0,32,32,32);grad.addColorStop(0,'white');grad.addColorStop(.2,'#ffffffcc');grad.addColorStop(.55,'#ffffff22');grad.addColorStop(1,'#ffffff00');sg.fillStyle=grad;sg.fillRect(0,0,64,64);const tex=new THREE.CanvasTexture(sprite);
 const hall=new THREE.Group();if(portrait)hall.scale.x=.42;scene.add(hall);const atl=make(1024,1024),ag=atl.getContext('2d');ag.fillStyle='#05111e';ag.fillRect(0,0,1024,1024);for(let i=0;i<12;i++)drawMath(ag,make,['disk','half','circle','boundary','sum','line','range','normal'][i%8],512,45+i*83,30,i%3?'#74c6e9':'#ffe3a1');ag.strokeStyle='#1b3d57';ag.lineWidth=1;for(let i=0;i<=8;i++){ag.beginPath();ag.moveTo(i*128,0);ag.lineTo(i*128,1024);ag.moveTo(0,i*128);ag.lineTo(1024,i*128);ag.stroke();}const atlas=new THREE.CanvasTexture(atl);atlas.colorSpace=THREE.SRGBColorSpace;
 const walls=new THREE.InstancedMesh(new THREE.PlaneGeometry(11,12),new THREE.MeshBasicMaterial({map:atlas,side:THREE.DoubleSide}),20);hall.add(walls);
 const pillars=new THREE.InstancedMesh(new THREE.BoxGeometry(.045,12,.06),makeMat(gold),60);hall.add(pillars);const bars=new THREE.InstancedMesh(new THREE.BoxGeometry(29,.025,.04),makeMat(ice),20);hall.add(bars);const tmp=new THREE.Object3D();let a=0,b=0;
 for(let i=0;i<10;i++){for(const side of [-1,1]){tmp.position.set(side*14.8,0,-i*11);tmp.rotation.set(0,-side*Math.PI/2,0);tmp.scale.setScalar(1);tmp.updateMatrix();walls.setMatrixAt(a++,tmp.matrix);for(let j=0;j<3;j++){tmp.position.set(side*(14.6-j*.24),0,-i*11+5.3);tmp.rotation.set(0,0,0);tmp.updateMatrix();pillars.setMatrixAt(b++,tmp.matrix);}}for(const [j,y] of [-6,6].entries()){tmp.position.set(0,y,-i*11+5.3);tmp.rotation.set(0,0,0);tmp.updateMatrix();bars.setMatrixAt(i*2+j,tmp.matrix);}}
 const mirror=new Reflector(new THREE.PlaneGeometry(90,150),{textureWidth:384,textureHeight:384,color:'#89a0b6',clipBias:.003,multisample:0});mirror.rotation.x=-Math.PI/2;mirror.position.set(0,-6.15,-42);scene.add(mirror);
 const veil=add(new THREE.PlaneGeometry(90,150),makeMat('#041321',.48));veil.rotation.x=-Math.PI/2;veil.position.copy(mirror.position);veil.position.y+=.01;
 const floorGrid=new THREE.GridHelper(100,50,'#2c8aab','#17334d');floorGrid.position.set(0,-6.12,-35);floorGrid.material.transparent=true;floorGrid.material.opacity=.4;scene.add(floorGrid);
 const dustN=2200,dustP=new Float32Array(dustN*3),dustC=new Float32Array(dustN*3);for(let i=0;i<dustN;i++){const c=i%3?ice:gold;dustC.set([c.r,c.g,c.b],i*3);}const dustG=new THREE.BufferGeometry();dustG.setAttribute('position',new THREE.BufferAttribute(dustP,3));dustG.setAttribute('color',new THREE.BufferAttribute(dustC,3));const dust=new THREE.Points(dustG,new THREE.PointsMaterial({map:tex,size:.06,vertexColors:true,transparent:true,opacity:.65,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));dust.frustumCulled=false;scene.add(dust);
 const ribbons=[];for(let j=0;j<8;j++){const data=new Float32Array(160*3),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(data,3));const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:j%2?ice:gold,transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));line.frustumCulled=false;scene.add(line);ribbons.push({data,geo,line,j});}
 const rings=[];for(let i=0;i<4;i++){const m=add(new THREE.TorusGeometry(9+i*.8,.012,4,144),makeMat(i%2?ice:gold,.28));m.position.set(0,0,-25-i*8);rings.push(m);}
 // A Euclidean x-y plane staged in a real perspective camera. All label positions
 // are projected from these exact objects; the graph is never independently warped.
 const graph=new THREE.Group();scene.add(graph);
 const plate=add(new THREE.PlaneGeometry(9.3,8.7),makeMat('#06101e',.65),graph);plate.position.z=-.15;
 const gridPts=[];for(let i=-4;i<=4;i++){gridPts.push(new THREE.Vector3(i,-4.2,-.08),new THREE.Vector3(i,4.2,-.08));gridPts.push(new THREE.Vector3(-4.4,i,-.08),new THREE.Vector3(4.4,i,-.08));}
 const grid=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(gridPts),new THREE.LineBasicMaterial({color:'#497890',transparent:true,opacity:.25}));graph.add(grid);
 const upperGrid=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(5,-4.2,-.08),new THREE.Vector3(5,5.6,-.08),new THREE.Vector3(-4.4,5,-.08),new THREE.Vector3(5.4,5,-.08)]),grid.material.clone());upperGrid.visible=false;graph.add(upperGrid);
 const lineObject=(points,color,opacity=1,parent=graph)=>{const obj=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color,transparent:true,opacity,toneMapped:false,depthWrite:false}));parent.add(obj);return obj;};
 const tube=(points,radius,color,opacity=1)=>{const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return add(new THREE.TubeGeometry(path,Math.max(1,points.length*2),radius,5,false),makeMat(color,opacity),graph);};
 const axisX=lineObject([[-4.4,0,0],[4.4,0,0]],ice,.8),axisY=lineObject([[0,-4.2,0],[0,4.2,0]],ice,.8);
 const axisArrows=[];
 for(const [x,y,rot] of [[4.36,0,-Math.PI/2],[0,4.16,0]]){const m=add(new THREE.ConeGeometry(.048,.16,8),makeMat(ice),graph);m.position.set(x,y,.015);m.rotation.z=rot;axisArrows.push(m);}
 const circlePts=Array.from({length:257},(_,i)=>[R*Math.cos(i/256*TAU),R*Math.sin(i/256*TAU),.04]);
 const circle=tube(circlePts,.012,new THREE.Color(1.15,1.65,2.05));
 const boundary=tube([[.4,4.2,.075],[4.3,-3.6,.075]],.018,ice);
 const shape=new THREE.Shape(arc.map(p=>new THREE.Vector2(...p)));const region=add(new THREE.ShapeGeometry(shape),new THREE.ShaderMaterial({uniforms:{time:{value:0},strength:{value:1}},vertexShader:'varying vec2 uvv;void main(){uvv=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 uvv;uniform float time;uniform float strength;void main(){float scan=pow(.5+.5*sin(uvv.y*5.-time*1.6+uvv.x*2.),8.);vec3 col=vec3(.04,.3,.38)+scan*vec3(.03,.12,.15);gl_FragColor=vec4(col,(.45+scan*.12)*strength);}',transparent:true,side:THREE.DoubleSide,depthWrite:false}),graph);region.position.z=.06;
 const arcEdge=tube(arc.map(p=>[...p,.09]),.017,new THREE.Color(.5,2.1,2.4));
 const chord=tube([[1,3,.095],[3,-1,.095]],.022,new THREE.Color(.5,2.1,2.4));
 const objective=lineObject([[-4,3,.14],[4,-5,.14]],gold);const goldTube=add(new THREE.CylinderGeometry(.018,.018,1,8),makeMat(gold),graph);
 const goldHalo=add(new THREE.CylinderGeometry(.052,.052,1,8),makeMat(new THREE.Color(1.5,.8,.15),.16),graph);
 const trail=Array.from({length:5},()=>lineObject([[-4,0,.12],[4,-8,.12]],gold,.06));
 function frameFor(q){const fit=q.s>=4?(q.s===4?ease(q.u):1):0;return {fit,top:4.2+1.4*fit,right:4.4+fit};}
 function segment(k,fit=0){const top=4.2+1.4*fit,right=4.4+fit,a=Math.max(-4.4,k-top),b=Math.min(right,k+4.2);return [[a,k-a,.16],[b,k-b,.16]];}
 const ghosts=[MIN,MAX].map(k=>lineObject(segment(k,portrait?0:1),gold,.28));
 function glowPoint(color,size){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));s.scale.setScalar(size);graph.add(s);return s;}
 const vertices=[[1,3],[3,-1]].map(p=>{const s=glowPoint(ice,.18);s.position.set(...p,.2);return s;});
 const hit=glowPoint(gold,.5),hitCore=glowPoint(new THREE.Color(5,4,2),.13),star=glowPoint(gold,.3);star.scale.set(1.8,.025,1);
 const contacts=[glowPoint(gold,.22),glowPoint(gold,.22)];
 // The y-intercept is a separate point on the axis, not a point of the region.
 const yIntercept=glowPoint(gold,.32),yInterceptCore=glowPoint(new THREE.Color(3,2.6,1.5),.10);yIntercept.visible=yInterceptCore.visible=false;
 const interceptGuide=lineObject([[0,0,.18],[0,0,.18]],gold,.2),interceptTick=lineObject([[-.11,0,.23],[.11,0,.23]],gold,.8);interceptGuide.visible=interceptTick.visible=false;
 const waves=Array.from({length:3},()=>add(new THREE.TorusGeometry(1,.009,4,96),makeMat(gold,.6),graph));
 const burstN=200,burstP=new Float32Array(burstN*3),burstG=new THREE.BufferGeometry();burstG.setAttribute('position',new THREE.BufferAttribute(burstP,3));
 const burst=new THREE.Points(burstG,new THREE.PointsMaterial({map:tex,size:.05,color:gold,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));graph.add(burst);
 const radius=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,.17),new THREE.Vector3(...MAX_POINT,.17)]),new THREE.LineDashedMaterial({color:ice,dashSize:.1,gapSize:.09,transparent:true,opacity:.55}));radius.computeLineDistances();graph.add(radius);
 const n=Math.SQRT1_2,z=.19,P=MAX_POINT;const square=lineObject([[P[0]-n*.24,P[1]-n*.24,z],[P[0],P[1]-n*.48,z],[P[0]+n*.24,P[1]-n*.24,z]],ice,.7);
 let last;
 function render(q){last=q;const {t,s,u,k,portrait,min,max,impact}=q,rear=s>=2,{fit,top,right}=frameFor(q);
  // Slow fly-through at the opening; distinct dolly/orbit shots in the graph scenes.
  camera.position.set(s===0?Math.sin(t*.13)*.65:Math.sin(t*.07)*.16,s===0?.28*Math.cos(t*.1):.1*Math.sin(t*.11),s===0?23-ease(u)*1.2:22);camera.lookAt(0,0,-12);camera.updateMatrixWorld();
  hall.position.z=(t*(s===0?1.3:.42))%11;hall.rotation.y=Math.sin(t*.06)*.012;hall.visible=s<2;mirror.visible=true;
  veil.material.opacity=rear?.30:.5;floorGrid.position.z=-35+(t*.5)%2;floorGrid.material.opacity=rear?.2:.4;
  let rotY=0,rotX=0,zoom=1;
  if(s===0){rotY=mix(-.5,-.1,u);rotX=mix(.25,.04,u);zoom=mix(.92,1,u);}
  if(s===1){rotY=mix(-.1,.03,u);rotX=.06*Math.sin(u*Math.PI);}
  if(s===2){rotY=.12*Math.sin(u*Math.PI*2);rotX=.05*Math.sin(u*Math.PI);}
  if(s===3){rotY=mix(.04,0,u);zoom=1+.09*ease(u);}
  if(s===4){rotY=.16*Math.sin(u*Math.PI);rotX=.055*Math.sin(u*Math.PI);zoom=1+.035*Math.sin(u*Math.PI);}
  if(s===5){zoom=1.06-.04*ease(u);rotY=.025*Math.sin(u*Math.PI);}
  if(s===6){zoom=mix(1.03,.96,u);}
  graph.visible=q.graph;if(portrait)zoom=1+(zoom-1)*.35;graph.position.set(portrait?0:6.5+.5*fit,portrait?-.9-.42*fit:-.15-1.4*fit,portrait?1.2:0);graph.scale.setScalar((portrait?.90:1.56)*zoom*(1-.20*fit));graph.rotation.set(rotX,rotY,0);graph.updateMatrixWorld(true);
  // Extend the actual graph as well as the view; k=2√5 is above the old y=4.2 crop.
  axisX.geometry.setFromPoints([new THREE.Vector3(-4.4,0,.16*fit),new THREE.Vector3(right,0,.16*fit)]);axisY.geometry.setFromPoints([new THREE.Vector3(0,-4.2,.16*fit),new THREE.Vector3(0,top,.16*fit)]);axisArrows[0].position.x=right-.04;axisArrows[1].position.y=top-.04;axisArrows.forEach(a=>a.position.z=.015+.16*fit);
  const extended=[];for(let i=-4;i<=4;i++){extended.push(new THREE.Vector3(i,-4.2,-.08),new THREE.Vector3(i,top,-.08));extended.push(new THREE.Vector3(-4.4,i,-.08),new THREE.Vector3(right,i,-.08));}grid.geometry.setFromPoints(extended);upperGrid.geometry.setFromPoints([new THREE.Vector3(5,-4.2,-.08),new THREE.Vector3(5,top,-.08),new THREE.Vector3(-4.4,5,-.08),new THREE.Vector3(right,5,-.08)]);upperGrid.visible=fit>.6;upperGrid.material.opacity=.25*ease((fit-.6)/.4);
  plate.position.set(.5*fit,.7*fit,-.15);plate.scale.set(1+.09*fit,1+.16*fit,1);
  yIntercept.visible=yInterceptCore.visible=interceptGuide.visible=interceptTick.visible=Boolean((min||s>=4)&&q.objective);
  if(yIntercept.visible){yIntercept.position.set(0,k,.16);yInterceptCore.position.copy(yIntercept.position);yIntercept.scale.setScalar(.30+.045*Math.sin(t*3));interceptGuide.geometry.setFromPoints([new THREE.Vector3(0,0,.16),new THREE.Vector3(0,k,.16)]);interceptTick.geometry.setFromPoints([new THREE.Vector3(-.11,k,.16),new THREE.Vector3(.11,k,.16)]);}
  if(fit>0){const ax=(5-top)/2,bx=4.3+.3*fit,by=5-2*bx,scale=(bx-ax)/3.9;boundary.scale.set(scale,scale,1);boundary.position.set((ax+bx)/2-2.35*scale,(top+by)/2-.3*scale,0);}else{boundary.scale.set(1,1,1);boundary.position.set(0,0,0);}
  // Intro draws each boundary, then illuminates only the exact circular segment.
  const circleCount=circle.geometry.index.count;circle.geometry.setDrawRange(0,Math.floor(circleCount*ease(q.reveal*1.7)/3)*3);
  boundary.visible=q.reveal>.35;boundary.material.opacity=ease((q.reveal-.35)/.3);
  region.visible=q.reveal>.6;region.material.uniforms.time.value=t;region.material.uniforms.strength.value=ease((q.reveal-.6)/.3)*(1+impact*.5);
  arcEdge.visible=chord.visible=q.reveal>.72;arcEdge.material.opacity=chord.material.opacity=ease((q.reveal-.72)/.28);
  grid.material.opacity=.12+.14*q.reveal;axisX.material.opacity=axisY.material.opacity=.3+.55*q.reveal;vertices.forEach(v=>v.visible=q.reveal>.85);
  const ps=segment(k,fit).map(p=>new THREE.Vector3(...p));
  objective.visible=goldTube.visible=goldHalo.visible=q.objective;
  if(q.objective){objective.geometry.setFromPoints(ps);for(const m of [goldTube,goldHalo]){m.position.copy(ps[0]).add(ps[1]).multiplyScalar(.5);m.scale.set(1,ps[0].distanceTo(ps[1]),1);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),ps[1].clone().sub(ps[0]).normalize());}}
  for(let i=0;i<trail.length;i++){const obj=trail[i];obj.visible=q.objective&&!(min||max);obj.geometry.setFromPoints(segment(k-(i+1)*.045,fit).map(p=>new THREE.Vector3(...p)));obj.material.opacity=.065*(1-i/5);}
  contacts.forEach((m,i)=>{m.visible=Boolean(q.objective&&q.contacts[i]&&!min&&!max);m.scale.setScalar(.20+.04*Math.sin(t*2));if(q.contacts[i])m.position.set(...q.contacts[i],.21);});
  const active=min||max,point=max?MAX_POINT:MIN_POINT,age=portrait?t-(max?22:12):t-(max?74:48);
  hit.visible=hitCore.visible=star.visible=burst.visible=active;
  if(active){for(const m of [hit,hitCore,star])m.position.set(...point,.24);hit.scale.setScalar(.52+.1*Math.sin(t*4)+impact*.6);hitCore.scale.setScalar(.12+impact*.12);star.scale.set(1.6+impact*1.6,.025+impact*.03,1);
   for(let i=0;i<burstN;i++){const a=seed(i)*TAU,phase=(Math.max(0,age)*.24+seed(i+8))%1,rr=(.12+phase*1.4);burstP[i*3]=point[0]+Math.cos(a)*rr;burstP[i*3+1]=point[1]+Math.sin(a)*rr;burstP[i*3+2]=.22+Math.sin(phase*Math.PI)*seed(i+9)*.5;}burstG.attributes.position.needsUpdate=true;burst.material.opacity=.35+impact*.5;}
  for(let i=0;i<waves.length;i++){const m=waves[i];m.visible=active;if(active){const phase=(Math.max(0,age)*.6+i/3)%1;m.position.set(...point,.25);m.scale.setScalar(.1+phase*1.1);m.material.opacity=.5*(1-phase)*(1-phase);}}
  radius.visible=square.visible=max;ghosts.forEach(g=>g.visible=s===6);
  if(s===6){vertices[1].visible=true;vertices[1].material.color.copy(gold);vertices[1].scale.setScalar(.35+.05*Math.sin(t*4));}else vertices[1].material.color.copy(ice);
  rings.forEach((r,i)=>{r.position.set(rear?(portrait?0:6):0,0,rear?-12-i*6:-25-i*8);r.rotation.set(rear?Math.PI/2+.1*Math.sin(t*.1+i):.1*Math.sin(t*.1+i),.3*Math.cos(t*.09+i),t*(i%2?-.05:.04));r.material.opacity=rear?.32:.25;r.scale.setScalar(portrait?.7:1);});
  for(let i=0;i<dustN;i++){const a=seed(i+3)*TAU+t*.08,z=12-((seed(i)+t*(rear?.017:.011))%1)*110;dustP[i*3]=(rear?9:12)*Math.cos(a)+(rear?3:0);dustP[i*3+1]=(rear?6:7)*Math.sin(a);dustP[i*3+2]=z;if(portrait)dustP[i*3]*=.5;}dustG.attributes.position.needsUpdate=true;
  for(const r of ribbons){for(let i=0;i<160;i++){const f=i/159,a=f*TAU*1.4-t*.4+r.j*.06;r.data[i*3]=(rear?7:10)*Math.cos(a)+(rear?4:0);r.data[i*3+1]=(rear?3:4)*Math.sin(a)-2;r.data[i*3+2]=8-f*100;if(portrait)r.data[i*3]*=.48;}r.geo.attributes.position.needsUpdate=true;r.line.material.opacity=rear?.16:.3;}
  const suspense=s===4?ease((u-.65)/.35):0;bloom.strength=.8+impact*.7-suspense*.12;scene.traverse(o=>{if(typeof o.visible!=='boolean')throw Error('Object visibility must be explicit: '+o.type);});composer.render();return labels(q);
 }
 function project(x,y,z=.22){const v=new THREE.Vector3(x,y,z);graph.localToWorld(v);v.project(camera);return [(v.x+1)*(portrait?540:960),(1-v.y)*(portrait?960:540)];}
 function labels(q=last){const {fit,top,right}=frameFor(q),labelLift=ease(fit/.35),values=[-3,-2,-1,1,2,3,...(fit>.6?[4,5]:[])];return {ticks:values.flatMap(i=>[{text:String(i),p:project(i,-.24),kind:'x'},{text:String(i),p:project(-.24,i),kind:'y'}]),min:project(...MIN_POINT),max:project(...MAX_POINT),other:project(1,3),origin:project(0,0),region:project(2.55,1.1),x:project(right-.1+.4*labelLift,-.25),y:project(portrait?.35:-.24,portrait?top-.35:top-.15+.5*labelLift),yIntercept:(q.min||q.s>=4)&&q.objective?project(0,q.k,.16):null,axisTop:project(0,top,.16*fit),objectiveEndpoints:q.objective?segment(q.k,fit).map(p=>project(p[0],p[1],p[2])):[],plotBounds:{left:-4.4,right,bottom:-4.2,top}};}

 return {canvas:renderer.domElement,renderer,render,labels,dispose(){composer.dispose();renderer.dispose();}};
}
