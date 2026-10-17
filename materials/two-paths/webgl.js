// WebGL third edition. Ported from trig-integral-cinema's FormulaTunnel,
// textures, FormulaFlow, GoldenRelease and Bloom (Three.js), with a new layout.
import * as THREE from 'three';
import {Reflector} from 'three/examples/jsm/objects/Reflector.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {drawMath} from './math.js';
const TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v)},mix=(a,b,t)=>a+(b-a)*t;
// Same deterministic seed and glow sprite as the reference material.
const seeded=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v)};
const make=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
function glowTexture(){const c=make(64,64),g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'#ffffffff');r.addColorStop(.18,'#ffffffd9');r.addColorStop(.5,'#ffffff33');r.addColorStop(1,'#ffffff00');g.fillStyle=r;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);}
export function createWorld(width=1280,height=720){
 const renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});renderer.setPixelRatio(1);renderer.setSize(width,height);renderer.setClearColor('#020613',1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;renderer.toneMappingExposure=1.05;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#030816');scene.fog=new THREE.FogExp2('#030816',.016);const portrait=height>width,camera=new THREE.PerspectiveCamera(portrait?68:56,width/height,.1,180);camera.position.set(0,.8,16);
 const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new THREE.Vector2(width,height),.68,.48,1.05);composer.addPass(bloom);composer.addPass(new OutputPass());
 const sprite=glowTexture(),gold=new THREE.Color(2.1,1.25,.38),blue=new THREE.Color(.22,.95,1.75),teal=new THREE.Color(.3,1.8,1.7),white=new THREE.Color(2,2.2,2.5);
 const basic=(color,opacity=1)=>new THREE.MeshBasicMaterial({color,transparent:opacity<1,opacity,side:THREE.DoubleSide,toneMapped:false});
 const add=(geo,mat,parent=scene)=>{const m=new THREE.Mesh(geo,mat);parent.add(m);return m};
 const luminous=(color,opacity=1)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,depthWrite:false,toneMapped:false});
 // The original Reflector supplies real, view-dependent mathematical reflections.
 const floor=new Reflector(new THREE.PlaneGeometry(100,160),{textureWidth:384,textureHeight:384,color:'#456677',clipBias:.003,multisample:0});floor.rotation.x=-Math.PI/2;floor.position.set(0,-5.3,-42);scene.add(floor);
 const floorVeil=add(new THREE.PlaneGeometry(100,160),basic('#071321',.63));floorVeil.rotation.x=-Math.PI/2;floorVeil.position.copy(floor.position);floorVeil.position.y+=.015;
 const gallery=new THREE.Group();scene.add(gallery);const panelList=[];
 const keys=['problem','part','bracket','Fx','FTC','split','I','J','linear','dI','dJ','cancellation','eval','ans'];
 // TeX is baked from the same KaTeX assets as foreground, never fake formula text.
 const atlases=[0,1,2].map(k=>{const c=make(1024,1024),g=c.getContext('2d');g.fillStyle='#04121b';g.fillRect(0,0,1024,1024);for(let r=0;r<11;r++){drawMath(g,make,keys[(r+k*4)%keys.length],500,48+r*90,r%3?29:35,r%4?'#75c5dd':'#ffe1a0');}g.strokeStyle='#326479';g.globalAlpha=.32;for(let x=0;x<=1024;x+=128){g.beginPath();g.moveTo(x,0);g.lineTo(x,1024);g.stroke();}for(let y=0;y<=1024;y+=128){g.beginPath();g.moveTo(0,y);g.lineTo(1024,y);g.stroke();}const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;return tex;});
 const panelGeo=new THREE.PlaneGeometry(7,9);
 // Open, curved wings of suspended pages replace the reference's straight tunnel.
 for(let i=0;i<9;i++)for(const side of [-1,1]){const group=new THREE.Group();gallery.add(group);const z=-i*9;const x=side*(8.2+Math.sin(i*.62)*2.3);group.position.set(x,-.15+Math.sin(i*.7)*.8,z);group.rotation.y=-side*(.42+.10*Math.cos(i));
  const mat=new THREE.MeshBasicMaterial({map:atlases[i%3],color:new THREE.Color(.65,1.05,1.3),side:THREE.DoubleSide,toneMapped:false});add(panelGeo,mat,group);
panelList.push({group,side,i,mat});
 }
 const frameGeo=new THREE.BoxGeometry(1,1,1),frameMat=basic('#ffffff',.8),frames=new THREE.InstancedMesh(frameGeo,frameMat,panelList.length*5);frames.frustumCulled=false;scene.add(frames);const frameTemp=new THREE.Object3D(),frameMatrix=new THREE.Matrix4();
 const frameParts=[[-3.58,0,.018,9.18],[3.58,0,.018,9.18],[0,-4.58,7.18,.018],[0,4.58,7.18,.018],[0,0,.045,9.3]];
 // Engraved floor lanes and suspended ceiling ribs occupy actual 3D planes.
 const grid=new THREE.GridHelper(110,44,new THREE.Color('#236579'),new THREE.Color('#102a40'));grid.position.set(0,-5.25,-35);grid.material.transparent=true;grid.material.opacity=.38;scene.add(grid);
 const ribData=new Float32Array(14*100*2*3),ribColors=new Float32Array(ribData.length),ribCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-13,-5,0),new THREE.Vector3(-12,5,0),new THREE.Vector3(0,9,0),new THREE.Vector3(12,5,0),new THREE.Vector3(13,-5,0)]).getPoints(100);for(let i=0;i<14;i++)for(let j=0;j<200;j++){const c=i%3?blue:gold;ribColors.set([c.r,c.g,c.b],(i*200+j)*3);}const ribGeo=new THREE.BufferGeometry();ribGeo.setAttribute('position',new THREE.BufferAttribute(ribData,3));ribGeo.setAttribute('color',new THREE.BufferAttribute(ribColors,3));const ribs=new THREE.LineSegments(ribGeo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.32,toneMapped:false}));ribs.frustumCulled=false;scene.add(ribs);
 // Thousands of true depth-tested additive particles: reference count and shader.
 const count=4200,positions=new Float32Array(count*3),colors=new Float32Array(count*3);for(let i=0;i<count;i++){const c=i%3?blue:gold;colors.set([c.r,c.g,c.b],i*3);}const pGeo=new THREE.BufferGeometry();pGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));pGeo.setAttribute('color',new THREE.BufferAttribute(colors,3));const pMat=new THREE.PointsMaterial({map:sprite,size:.085,vertexColors:true,transparent:true,opacity:.72,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});const particles=new THREE.Points(pGeo,pMat);particles.frustumCulled=false;scene.add(particles);
 const starsPos=new Float32Array(1300*3);for(let i=0;i<1300;i++)starsPos.set([(seeded(i+3)-.5)*70,(seeded(i+12)-.5)*34,-seeded(i+21)*110],i*3);const starGeo=new THREE.BufferGeometry();starGeo.setAttribute('position',new THREE.BufferAttribute(starsPos,3));const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({map:sprite,size:.055,color:blue,transparent:true,opacity:.42,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));scene.add(stars);
 // The reference's evolving transport-wave lines become two independent streams.
 const streamData=new Float32Array(18*180*2*3),streamColors=new Float32Array(streamData.length),streamGeo=new THREE.BufferGeometry();streamGeo.setAttribute('position',new THREE.BufferAttribute(streamData,3));for(let j=0;j<18;j++)for(let i=0;i<360;i++){const c=j<9?gold:blue;streamColors.set([c.r,c.g,c.b],(j*360+i)*3);}streamGeo.setAttribute('color',new THREE.BufferAttribute(streamColors,3));const streams=new THREE.LineSegments(streamGeo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.38,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));streams.frustumCulled=false;scene.add(streams);
 const haloGroup=new THREE.Group();scene.add(haloGroup);const halos=[];for(let i=0;i<7;i++){const mesh=add(new THREE.TorusGeometry(4.5+i*.8,.012+i*.002,5,160),basic(i%2?blue:gold,.35+i*.04),haloGroup);mesh.position.set(0,-1,-20-i*4);halos.push(mesh);}
 // Port of GoldenRelease's open cylinders, with two columns merging into one.
 const beams=[];for(let side of [-1,1])for(let j=0;j<3;j++){const m=add(new THREE.CylinderGeometry(.035+j*.08,.15+j*.3,35,32,1,true),luminous(side<0?gold:blue,.075-j*.015));m.position.set(side*7,3,-20);beams.push({m,side,j});}
 const diamondMat=basic(gold,.27);diamondMat.wireframe=true;const diamonds=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.35),diamondMat,70);scene.add(diamonds);const temp=new THREE.Object3D();
 // A limited number of large optical bokeh sprites near the camera add depth.
 const bokeh=[];for(let i=0;i<14;i++){const mat=new THREE.SpriteMaterial({map:sprite,color:i%2?blue:gold,transparent:true,opacity:.13,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});const s=new THREE.Sprite(mat);s.scale.setScalar(.6+seeded(i)*.8);scene.add(s);bokeh.push(s);}
 // Second act: a circular observatory, with no forward-moving gallery.
 // Preserve the first act exactly; the shared mirror now reflects a new space.
 const firstAct=scene.children.filter(o=>o!==floor&&o!==floorVeil);
 const arena=new THREE.Group();arena.visible=false;scene.add(arena);
 const orbitRoot=new THREE.Group();orbitRoot.position.set(0,0,-24);arena.add(orbitRoot);
 const orbitPages=[];
 for(let i=0;i<12;i++){
  const group=new THREE.Group(),a=i*TAU/12;
  group.position.set(Math.sin(a)*19,Math.sin(i*1.7)*1.3,Math.cos(a)*15);
  group.rotation.y=a+Math.PI;orbitRoot.add(group);
  const mat=new THREE.MeshBasicMaterial({map:atlases[(i+1)%3],color:new THREE.Color(.42,.88,1.22),side:THREE.DoubleSide,transparent:true,opacity:.85,toneMapped:false});
  add(new THREE.PlaneGeometry(7.2,10.2),mat,group);
  const edges=new THREE.EdgesGeometry(new THREE.PlaneGeometry(7.32,10.32));
  group.add(new THREE.LineSegments(edges,new THREE.LineBasicMaterial({color:i%3?blue:gold,transparent:true,opacity:.8,toneMapped:false})));
  orbitPages.push({group,a,mat});
 }
 const gyroscope=new THREE.Group();gyroscope.position.set(0,-.4,-27);arena.add(gyroscope);
 const orbitRings=[];
 for(let i=0;i<9;i++){
  const ring=add(new THREE.TorusGeometry(10.5+i*.58,.035+(i%3)*.015,6,180),basic(i%3?new THREE.Color(.3,1.6,2.7):gold,.48),gyroscope);
  orbitRings.push(ring);
 }
 const radialFloor=new THREE.Group();radialFloor.position.set(0,-5.18,-25);arena.add(radialFloor);
 for(let i=1;i<=13;i++){const r=add(new THREE.TorusGeometry(i*2.1,.018,4,140),basic(i%4?blue:gold,.26),radialFloor);r.rotation.x=Math.PI/2;}
 const spokesData=[];for(let i=0;i<48;i++){const a=i*TAU/48;spokesData.push(2*Math.cos(a),0,2*Math.sin(a),29*Math.cos(a),0,29*Math.sin(a));}
 const spokesGeo=new THREE.BufferGeometry();spokesGeo.setAttribute('position',new THREE.Float32BufferAttribute(spokesData,3));radialFloor.add(new THREE.LineSegments(spokesGeo,new THREE.LineBasicMaterial({color:blue,transparent:true,opacity:.21,toneMapped:false})));
 const constellationData=new Float32Array(2200*3),constellationGeo=new THREE.BufferGeometry();constellationGeo.setAttribute('position',new THREE.BufferAttribute(constellationData,3));
 const constellation=new THREE.Points(constellationGeo,new THREE.PointsMaterial({map:sprite,color:blue,size:.13,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));constellation.frustumCulled=false;arena.add(constellation);
 const waves=[];for(let i=0;i<4;i++){const wave=add(new THREE.TorusGeometry(15,.018,6,180),luminous(i%2?gold:blue,0),arena);wave.position.set(0,-.4,-24);waves.push(wave);}
 const crown=new THREE.Group();crown.position.set(0,0,-26);arena.add(crown);
 const crownBars=new THREE.InstancedMesh(new THREE.BoxGeometry(.055,1,.055),luminous(gold,.65),64);crown.add(crownBars);crownBars.frustumCulled=false;
 const trails=new THREE.Group();trails.position.set(0,-.2,-23);arena.add(trails);const spiralData=new Float32Array(4*220*2*3),spiralColors=new Float32Array(spiralData.length);for(let j=0;j<4;j++)for(let k=0;k<440;k++){const c=j%2?blue:gold;spiralColors.set([c.r,c.g,c.b],(j*440+k)*3);}const spiralGeo=new THREE.BufferGeometry();spiralGeo.setAttribute('position',new THREE.BufferAttribute(spiralData,3));spiralGeo.setAttribute('color',new THREE.BufferAttribute(spiralColors,3));const spiral=new THREE.LineSegments(spiralGeo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));spiral.frustumCulled=false;trails.add(spiral);
 function renderArena(q){const {t,scene:s,u}=q,arrival=s===3?ease(u/.1):1,join=s===3?0:s===4?ease(u/.8):1;
  firstAct.forEach(o=>o.visible=false);arena.visible=true;
  // Establish a wide chamber, then orbit laterally instead of travelling forward.
  camera.position.set(Math.sin((t-43)*.045)*2.4,1.7+Math.sin(t*.047)*.6,18+Math.sin(t*.04)*1.2);camera.lookAt(0,-.6,-24);
  scene.fog.density=.012;scene.background.set('#020c18');
  orbitRoot.rotation.y=Math.sin(t*.045)*.16;orbitRoot.rotation.z=Math.sin(t*.025)*.025;
  orbitPages.forEach(({group,a,mat},i)=>{group.position.y=Math.sin(t*.23+i*.7)*1.35+(s>=4?Math.sin(t*.16+i)*1.5:0);group.rotation.z=Math.sin(t*.12+i)*.05;mat.opacity=.7+Math.sin(t*.18+i)*.12;});
  gyroscope.rotation.set(.16+Math.sin(t*.09)*.18,Math.sin(t*.075)*.26,t*.025);
  orbitRings.forEach((r,i)=>{r.rotation.set(i*.37+t*(i%2?.045:-.038),i*.29+Math.sin(t*.08+i)*.35,i*.41+t*.028);r.material.opacity=.25+join*.13;});
  radialFloor.rotation.y=t*.055;radialFloor.position.y=-5.18+Math.sin(t*.2)*.04;
  for(let i=0;i<2200;i++){const a=seeded(i+4)*TAU+t*(i%2?.035:-.055),band=i%5,rad=band===0?mix(19,3,join):8+seeded(i+13)*19;constellationData[i*3]=Math.cos(a)*rad;constellationData[i*3+1]=-4+seeded(i+19)*15+Math.sin(a*3+t*.3)*.7;constellationData[i*3+2]=-25+Math.sin(a)*rad;}
  constellationGeo.attributes.position.needsUpdate=true;constellation.rotation.y=t*.013;
  const event=s===3?.75:s===4?.56:.18,age=u-event;
  waves.forEach((w,i)=>{const p=clamp((age-i*.016)/.19),scale=.04+p*1.65;w.scale.setScalar(scale);w.rotation.set(.15*Math.sin(t*.2+i),.25*Math.cos(t*.15+i),t*.04);w.material.opacity=age>=i*.016&&p<1?(1-p)*.65:0;});
  crown.rotation.y=t*.12;crown.rotation.z=Math.sin(t*.06)*.08;
  for(let i=0;i<64;i++){const a=i*TAU/64,r=11.8+Math.sin(i*.8+t*.45)*.4;temp.position.set(Math.cos(a)*r,Math.sin(a)*r,Math.sin(a*3+t*.16)*2);temp.rotation.set(0,0,a);temp.scale.set(1,1.1+Math.sin(i*.9+t*.8)**2*2,1);temp.updateMatrix();crownBars.setMatrixAt(i,temp.matrix);}crownBars.instanceMatrix.needsUpdate=true;crownBars.material.opacity=.35+join*.3;
  for(let j=0;j<4;j++)for(let i=0;i<220;i++)for(let k=0;k<2;k++){const v=(i+k)/220,a=v*TAU*1.8+t*(j%2?-.16:.19)+j*Math.PI/2,r=7.8+Math.sin(v*Math.PI)*2-join*2.2,n=(j*440+i*2+k)*3;spiralData[n]=Math.cos(a)*r;spiralData[n+1]=Math.sin(a)*r*.52+(v-.5)*5;spiralData[n+2]=Math.sin(a)*4+(v-.5)*15;}spiralGeo.attributes.position.needsUpdate=true;trails.rotation.y=Math.sin(t*.07)*.35;
  // One broad exposure swell at arrival/cancellation/merger, no rapid flicker.
  bloom.strength=.72+Math.exp(-((age/.045)**2))*.36+(1-arrival)*.18;
 }

 function render(q){firstAct.forEach(o=>o.visible=true);arena.visible=false;scene.fog.density=.016;scene.background.set('#030816');const {t,scene:s,u}=q;const merge=s===5?1:s===4?ease(u/.65):0;const aWarm=s===2?1:s===3?.12:.55;
  // Drift, dolly and lateral arcs are slower while main equations must be read.
  camera.position.set((s===2?-1.1:s===3?1.1:0)+Math.sin(t*.075)*(s===1?1.9:.75),.6+Math.cos(t*.063)*.26,16-(s===0?ease(u)*3:s===1?3:s>=4?merge*2:1.4));camera.lookAt(Math.sin(t*.048)*.4,-.15,-24);
  gallery.position.z=(t*(s===1?1.2:.48))%9;gallery.rotation.y=Math.sin(t*.045)*.035;for(const p of panelList){p.group.rotation.z=Math.sin(t*.08+p.i)*.014;p.group.rotation.y=-p.side*(.42+.10*Math.cos(p.i)+merge*.28);p.mat.color.setRGB(.55+aWarm*.12,.85+(1-aWarm)*.2,1.05+(1-aWarm)*.25);}
  gallery.updateMatrixWorld(true);let fi=0;for(const p of panelList)for(let j=0;j<5;j++){const [x,y,sx,sy]=frameParts[j];frameTemp.position.set(j===4?-p.side*3.62:x,y,.025);frameTemp.scale.set(sx,sy,.025);frameTemp.rotation.set(0,0,0);frameTemp.updateMatrix();frameMatrix.multiplyMatrices(p.group.matrixWorld,frameTemp.matrix);frames.setMatrixAt(fi,frameMatrix);frames.setColorAt(fi,j===4?(p.i%2?gold:blue):(p.i%3===0?gold:blue));fi++;}frames.instanceMatrix.needsUpdate=true;frames.instanceColor.needsUpdate=true;
  for(let i=0;i<14;i++){const angle=Math.sin(t*.05+i*.2)*.025,ca=Math.cos(angle),sa=Math.sin(angle);for(let j=0;j<100;j++)for(let k=0;k<2;k++){const p=ribCurve[j+k],n=(i*200+j*2+k)*3;ribData[n]=p.x*ca-p.y*sa;ribData[n+1]=p.x*sa+p.y*ca;ribData[n+2]=-i*7+(t*.55)%7;}}ribGeo.attributes.position.needsUpdate=true;grid.position.z=-35+(t*.5)%2.5;stars.position.z=(t*.3)%12;stars.rotation.z=t*.002;
  for(let i=0;i<count;i++){const f=seeded(i+1),v=(f+t*(.014+.006*seeded(i+9)))%1,side=i%2?1:-1;const z=12-v*100;const spiral=v*TAU*2.5-t*.32+side*.4;const separation=mix(s===1?7.8:5.8,1.8,merge);let x=side*separation+Math.cos(spiral)*1.9,y=-1.8+Math.sin(spiral)*1.5;
   if(i%5===0){x=(seeded(i+28)-.5)*32;y=(seeded(i+66)-.5)*18;}positions[i*3]=x;positions[i*3+1]=y;positions[i*3+2]=z;
  }pGeo.attributes.position.needsUpdate=true;pMat.opacity=s>=4?.92:.72;
  for(let j=0;j<18;j++){const side=j<9?-1:1,k=j%9;for(let i=0;i<180;i++)for(let end=0;end<2;end++){const v=(i+end)/180,z=8-v*95,angle=v*TAU*2.4-t*.32+k*.045,env=.6+.4*Math.sin(v*Math.PI),spread=mix(s===1?8:5.8,1.8,merge),n=(j*360+i*2+end)*3;streamData[n]=side*spread+Math.cos(angle)*(1.7+k*.045)*env;streamData[n+1]=-2+Math.sin(angle)*(1.3+k*.025)*env;streamData[n+2]=z;}}streamGeo.attributes.position.needsUpdate=true;streams.material.opacity=s>=4?.44:.34;
  haloGroup.rotation.y=Math.sin(t*.10)*.13;halos.forEach((h,i)=>{h.rotation.set(.12*Math.sin(t*.1+i),.22*Math.cos(t*.09+i),t*(i%2?-.035:.045)+i*.25);h.scale.setScalar(s>=4?1+merge*.12:1);h.material.opacity=s>=4?.55:.20;});
  for(const {m,side,j} of beams){m.position.x=side*mix(7,0,merge);m.rotation.z=side*(1-merge)*.08+Math.sin(t*.06+j)*.015;m.visible=s>=4;m.material.opacity=.032-j*.007;}
  for(let i=0;i<70;i++){const side=i%2?1:-1;temp.position.set(side*(9+seeded(i)*7),-3+seeded(i+13)*10,-seeded(i+17)*75+(t*.32)%10);temp.rotation.set(t*.055+i,t*.07+i*.4,i*.7);const sc=.3+seeded(i+8)*1.3;temp.scale.setScalar(sc);temp.updateMatrix();diamonds.setMatrixAt(i,temp.matrix);}diamonds.instanceMatrix.needsUpdate=true;
  bokeh.forEach((b,i)=>{b.position.set((i%2?1:-1)*(8+seeded(i+27)*8)+Math.sin(t*.15+i),Math.sin(t*.13+i)*5,7+seeded(i+44)*5);b.material.opacity=.018+.012*Math.sin(t*.5+i)**2;});
  const pulse=s===3?Math.exp(-(((u-.75)/.04)**2)):s===2?Math.exp(-(((u-.69)/.06)**2)):s===4?Math.exp(-(((u-.56)/.09)**2)):0;
  bloom.strength=.68+pulse*.35+(s>=4?.06:0);if(s>=3)renderArena(q);composer.render();
 }
 return {canvas:renderer.domElement,render,renderer,scene,dispose(){composer.dispose();renderer.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});atlases.forEach(t=>t.dispose());sprite.dispose();}};
}
