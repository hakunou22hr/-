import * as THREE from 'three';

/** Two original mathematical environments; no reference photographs are embedded. */
export function createMathematicalSpace(canvas) {
  const renderer = new THREE.WebGLRenderer({canvas, antialias:false, alpha:false, preserveDrawingBuffer:true, powerPreference:'high-performance'});
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#020811');
  scene.fog = new THREE.FogExp2('#03101c', .005);
  const camera = new THREE.PerspectiveCamera(62, 16/9, .1, 260);
  const corridor = new THREE.Group(), gallery = new THREE.Group();
  scene.add(corridor, gallery);
  const cyan = '#66e6e5', gold = '#d5b67c';
  const solid = color => new THREE.MeshBasicMaterial({color, fog:true});
  const lineMat = (color, opacity=1) => new THREE.LineBasicMaterial({color, transparent:true, opacity, fog:true});
  const dark = solid('#091c29'), stone = solid('#14333e'), trim = solid('#345258');
  const matrix = new THREE.Matrix4(), rotation = new THREE.Quaternion();
  function lines(points, material, parent) {
    const object = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))), material);
    parent.add(object); return object;
  }
  function plane(w,h,material,x,y,z,ry=0,parent=corridor) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w,h),material); m.position.set(x,y,z);m.rotation.y=ry;parent.add(m);return m;
  }
  // Each illuminated wall is a generated mathematical manuscript, not an image copy.
  function manuscript() {
    const c=document.createElement('canvas');c.width=1024;c.height=2048;const g=c.getContext('2d');
    g.fillStyle='#03121c';g.fillRect(0,0,c.width,c.height);
    g.strokeStyle='#327b8c';g.lineWidth=2;g.strokeRect(28,25,968,1998);
    const formulas=['d/dx ∫ₐˣ f(t) dt = f(x)','A(x) = ∫₀ˣ sin t dt','F′(x) = f(x)','∫ₐˣ f(t) dt = F(x) − F(a)','ΔA ≈ f(x) Δx','F(x) = ∫₀ˣ (x − t) cos t dt','d/dx ∫₁ˣ t eᵗ dt = x eˣ','∫₀ˣ cos t dt = sin x','F(x) = 1 − cos x','F′(x) = sin x'];
    for(let row=0;row<22;row++) {
      const y=95+row*83;g.fillStyle=row%4===0?'#b2e9e8':'#70b4c4';g.globalAlpha=row%3===0?.9:.6;g.font=`${row%4===0?39:32}px serif`;g.fillText(formulas[row%formulas.length],52,y);
      g.strokeStyle='#34788570';g.beginPath();g.moveTo(52,y+18);g.lineTo(960,y+18);g.stroke();
    }
    g.globalAlpha=.8;g.strokeStyle='#8aebdf';g.lineWidth=2;
    for(let j=0;j<3;j++){g.beginPath();for(let i=0;i<160;i++){const x=70+i*5.5,y=360+j*580+Math.sin(i*.065)*40;i?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();}
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=2;return texture;
  }
  const wallTexture=manuscript();
  const manuscriptMaterial=new THREE.MeshBasicMaterial({map:wallTexture,color:'#9ae9ef',side:THREE.DoubleSide,fog:true});
  const floor = plane(24,190,solid('#071b29'),0,-.03,-76);floor.rotation.x=-Math.PI/2;
  const floorInk=new THREE.MeshBasicMaterial({map:wallTexture,color:'#68dfe2',transparent:true,opacity:.24,blending:THREE.AdditiveBlending,depthWrite:false});
  for(let i=0;i<11;i++){const page=plane(6,12,floorInk,0,.07,8-i*16);page.rotation.x=-Math.PI/2;}
  // The floor carries a luminous perspective lattice and moving pulses.
  const grid=[];
  for(let x=-12;x<=12;x+=1.2)grid.push([x,0,15],[x,0,-168]);
  for(let z=15;z>=-168;z-=2.4)grid.push([-12,0,z],[12,0,z]);
  lines(grid,lineMat('#4bc7d2',.55),corridor);
  const innerGrid=[];for(let x=-4.8;x<=4.8;x+=1.2)innerGrid.push([x,.025,15],[x,.025,-168]);lines(innerGrid,lineMat('#7cfff1',.6),corridor);
  const pulseGeometry=new THREE.PlaneGeometry(22,.13),pulseMaterial=new THREE.MeshBasicMaterial({color:cyan,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false});
  const pulses=Array.from({length:8},()=>{const m=new THREE.Mesh(pulseGeometry,pulseMaterial);m.rotation.x=-Math.PI/2;m.position.y=.06;corridor.add(m);return m;});
  plane(190,17,dark,-12,8.5,-76,Math.PI/2);plane(190,17,dark,12,8.5,-76,-Math.PI/2);
  const columns=new THREE.InstancedMesh(new THREE.CylinderGeometry(.42,.62,11,10),stone,64);
  const bases=new THREE.InstancedMesh(new THREE.BoxGeometry(1.7,.5,1.7),trim,64);corridor.add(columns,bases);
  const archPoints=[],vaultPoints=[];
  let ci=0;
  for(let z=10;z>=-164;z-=6){
    for(const sign of [-1,1]){
      matrix.compose(new THREE.Vector3(sign*10.5,5.5,z),rotation,new THREE.Vector3(1,1,1));columns.setMatrixAt(ci,matrix);
      matrix.compose(new THREE.Vector3(sign*10.5,.25,z),rotation,new THREE.Vector3(1,1,1));bases.setMatrixAt(ci,matrix);ci++;
    }
    // Pointed Gothic ribs, with a second gold line running along the vault.
    for(let j=0;j<40;j++){
      const u=j/40,v=(j+1)/40;
      const arch=u=>{const x=(u*2-1)*10.5;return[x,10.6+6.2*Math.pow(1-Math.abs(u*2-1),.72),z];};
      archPoints.push(arch(u),arch(v));
    }
    for(const sign of [-1,1])vaultPoints.push([sign*10.5,10.6,z],[sign*10.5,10.6,z-6]);
    if(z>-162)for(const sign of [-1,1])plane(4.7,8.7,manuscriptMaterial,sign*11.9,5.1,z-3,sign===-1?Math.PI/2:-Math.PI/2);
  }
  columns.count=ci;bases.count=ci;columns.instanceMatrix.needsUpdate=true;bases.instanceMatrix.needsUpdate=true;
  lines(archPoints,lineMat('#427985',.8),corridor);lines(vaultPoints,lineMat(gold,.38),corridor);
  // The distant rose window provides an illuminated vanishing point.
  const rose=new THREE.Group();rose.position.set(0,8,-170);corridor.add(rose);
  for(const radius of [1.1,2.2,3.3,3.7]){const r=new THREE.Mesh(new THREE.TorusGeometry(radius,.035,5,72),solid('#74e2e5'));rose.add(r);}
  const spokes=[];for(let i=0;i<24;i++){const a=i/24*Math.PI*2;spokes.push([.25*Math.cos(a),.25*Math.sin(a),0],[3.5*Math.cos(a),3.5*Math.sin(a),0]);}lines(spokes,lineMat('#8af3eb',.85),rose);
  const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=128;const gg=glowCanvas.getContext('2d'),gradient=gg.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(120,255,239,.8)');gradient.addColorStop(.15,'rgba(60,211,232,.4)');gradient.addColorStop(1,'rgba(0,30,60,0)');gg.fillStyle=gradient;gg.fillRect(0,0,128,128);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(glowCanvas),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));glow.position.set(0,6,-166);glow.scale.set(22,22,1);corridor.add(glow);
  // A second space: mathematical screens wrap around a circular observatory.
  const galleryFloor=new THREE.Mesh(new THREE.CircleGeometry(24,80),solid('#061421'));galleryFloor.rotation.x=-Math.PI/2;gallery.add(galleryFloor);
  const curvedPoints=[];
  for(let i=0;i<15;i++){
    const a=(i/14-.5)*Math.PI*1.45;const panel=plane(4.4,10,manuscriptMaterial,19*Math.sin(a),6,-19*Math.cos(a),-a,gallery);
    // Face the camera at the centre; double-sided material allows both views.
    panel.rotation.y=-a;
    curvedPoints.push([19*Math.sin(a),.2,-19*Math.cos(a)],[19*Math.sin(a),12,-19*Math.cos(a)]);
  }
  lines(curvedPoints,lineMat('#62cbdc',.55),gallery);
  for(const radius of [6,10,14,19,23]){const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,.025,4,128),solid('#255a6b'));ring.rotation.x=-Math.PI/2;ring.position.y=.03;gallery.add(ring);}
  const galleryGrid=[];for(let i=0;i<24;i++){const a=i/24*Math.PI*2;galleryGrid.push([0,.04,0],[23*Math.sin(a),.04,23*Math.cos(a)]);}lines(galleryGrid,lineMat('#4695a4',.3),gallery);
  const orbit = new THREE.Group();gallery.add(orbit);
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2, sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(glowCanvas),transparent:true,opacity:.45,blending:THREE.AdditiveBlending,depthWrite:false}));sprite.position.set(14*Math.sin(a),1.5,14*Math.cos(a));sprite.scale.set(2.2,2.2,1);orbit.add(sprite);}
  // Shared airborne motes, deterministic for frame-perfect export.
  const positions=[];for(let i=0;i<260;i++)positions.push(Math.sin(i*71.3)*12,1+(Math.cos(i*23.1)+1)*7,-((i*37.3)%180));
  const dust=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(positions,3)),new THREE.PointsMaterial({color:'#a6fff0',size:.045,transparent:true,opacity:.7,sizeAttenuation:true,depthWrite:false}));corridor.add(dust);
  function resize(w,h) {
    const scale=Math.min(1,720/Math.max(w,h));renderer.setSize(Math.round(w*scale),Math.round(h*scale),false);camera.aspect=w/h;camera.fov=w<h?64:62;camera.updateProjectionMatrix();
  }
  function frame(t,id,progress) {
    const inGallery=['proof','law','cancel','result'].includes(id);corridor.visible=!inGallery;gallery.visible=inGallery;
    if(inGallery){camera.position.set(1.3*Math.sin(t*.12),4.8+.25*Math.sin(t*.17),4+1.1*Math.sin(t*.08));camera.lookAt(1.8*Math.sin(t*.1),5.3,-17);orbit.rotation.y=t*.13;}
    else{camera.position.set(.65*Math.sin(t*.12),4.2+.15*Math.sin(t*.21),12-t*.72);camera.lookAt(.7*Math.sin(t*.07),5,-170);pulses.forEach((m,i)=>m.position.z=12-((t*14+i*23)%180));dust.position.y=.15*Math.sin(t*.1);rose.rotation.z=.015*Math.sin(t*.15);glow.material.opacity=.6+.13*Math.sin(t*1.8);}
    renderer.render(scene,camera);
    window.mathematicalSpaceRendered=true;
  }
  return {resize,frame};
}
