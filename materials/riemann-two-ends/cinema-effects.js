import {createDynamicStage} from './dynamic-stage.js';
import {state,cameraPose} from './model.js';
// Shared procedural atmosphere for WebGL playback and deterministic MP4 rendering.
// The density field evolves in three dimensions: no photograph or backdrop image.
const clamp=x=>Math.max(0,Math.min(1,x));
const mix=(a,b,p)=>a+(b-a)*p;
const table=new Float32Array(32768);
for(let i=0;i<table.length;i++){let z=Math.sin(i*127.1+311.7)*43758.5453;table[i]=z-Math.floor(z)}
function noise(x,y,z){let a=Math.floor(x),b=Math.floor(y),c=Math.floor(z),u=x-a,v=y-b,w=z-c;u=u*u*(3-2*u);v=v*v*(3-2*v);w=w*w*(3-2*w);const at=(i,j,k)=>table[(i&31)+((j&31)<<5)+((k&31)<<10)];return mix(mix(mix(at(a,b,c),at(a+1,b,c),u),mix(at(a,b+1,c),at(a+1,b+1,c),u),v),mix(mix(at(a,b,c+1),at(a+1,b,c+1),u),mix(at(a,b+1,c+1),at(a+1,b+1,c+1),u),v),w)}
function fbm(x,y,z){return noise(x,y,z)*.53+noise(x*2.03,y*2.03,z*2.03)*.27+noise(x*4.07,y*4.07,z*4.07)*.13+noise(x*8.1,y*8.1,z*8.1)*.07}
function glow(g,x,y,r,color,alpha=1){g.save();g.globalCompositeOperation='screen';g.globalAlpha=alpha;let a=g.createRadialGradient(x,y,0,x,y,r);a.addColorStop(0,color+'dd');a.addColorStop(.12,color+'65');a.addColorStop(.45,color+'1c');a.addColorStop(1,color+'00');g.fillStyle=a;g.fillRect(x-r,y-r,r*2,r*2);g.restore()}
export function createAtmosphere(makeCanvas,W,H){
 const dynamics=createDynamicStage(W,H,makeCanvas),lightScale=W>=1000?2/3:1,lightCanvas=makeCanvas(Math.round(W*lightScale),Math.round(H*lightScale)),lightContext=lightCanvas.getContext('2d');const rw=H>W?180:320,rh=Math.round(rw*H/W*.78),buffers=[makeCanvas(rw,rh),makeCanvas(rw,rh)],keys=[null,null];
 // A small procedural emissive sprite is reused for hundreds of moving 3D sparks.
 const spark=makeCanvas(48,48),sg=spark.getContext('2d'),rad=sg.createRadialGradient(24,24,0,24,24,24);rad.addColorStop(0,'#ffffff');rad.addColorStop(.09,'#fff2cf');rad.addColorStop(.23,'#ffc85caa');rad.addColorStop(1,'#ffa83b00');sg.fillStyle=rad;sg.fillRect(0,0,48,48);
 function cloudAt(key,d){const slot=((key%2)+2)%2;if(keys[slot]!==key){const cloud=buffers[slot],cg=cloud.getContext('2d'),pixels=cg.createImageData(rw,rh),sampleTime=key/8,q=state(sampleTime,d),pose=cameraPose(q,H>W),phase=sampleTime*.045,camx=pose.x*.038,camy=pose.y*.04;
  for(let y=0;y<rh;y++)for(let x=0;x<rw;x++){
   const ux=x/rw,uy=y/rh,xx=(ux-.5)*9+camx,yy=uy*5.2+camy;
   const warp=fbm(xx*.65+phase*.2,yy*.8,phase*.4)*1.5;
   const f=fbm(xx+warp+phase*.2,yy-warp*.4,phase+.7);
   const wisps=Math.abs(noise(xx*5+warp,yy*5,phase*.7)-.5)*2;
   const band=Math.exp(-((uy-(.25+.16*Math.sin(ux*5+phase*.3)))**2)/.085);
   const rim=.40+.6*Math.abs(ux-.5)*2;
   const density=Math.max(0,(f-.34))*3.2*band*rim;
   const d=Math.pow(clamp(density),1.35),fine=fbm(xx*3.5+warp,yy*3.5,phase*.7),hot=clamp((f-.48)*5)*band*(.4+fine);
   const violet=q.s===2?.85:q.s===3?clamp((ux-.42)*3):.16;
   const warm=q.s===1?clamp((ux-.55)*1.6)*.28:q.s===3?clamp((.52-ux)*3)*.7:q.s===4?.12:0;
   const i=(y*rw+x)*4;pixels.data[i]=Math.min(255,3+d*mix(mix(35,130,violet),255,warm)+hot*mix(mix(105,145,violet),200,warm));
   pixels.data[i+1]=Math.min(255,8+d*mix(mix(130,55,violet),170,warm)+hot*mix(mix(145,65,violet),140,warm));
   pixels.data[i+2]=Math.min(255,20+d*mix(235,45,warm)+hot*mix(150,45,warm)+wisps*d*24);pixels.data[i+3]=255;
  }
cg.putImageData(pixels,0,0);keys[slot]=key}return buffers[slot]}
 return{background(g,q,project,camera){
  const t=q.t,key=Math.floor(t*8),a=cloudAt(key,q.d),b=cloudAt(key+1,q.d),fraction=t*8-key;
  g.drawImage(a,0,0,W,H*.78);g.save();g.globalAlpha=fraction;g.drawImage(b,0,0,W,H*.78);g.restore();g.fillStyle='#020610a6';g.fillRect(0,0,W,H*.78);
  // Light pools and a luminous horizon give the grid a reflective floor.
  let horizon=project(0,-3.15,-14),floor=g.createLinearGradient(0,H*.39,0,H*.9);floor.addColorStop(0,'#04122a00');floor.addColorStop(.45,'#1267af38');floor.addColorStop(1,'#01071400');g.fillStyle=floor;g.fillRect(0,H*.39,W,H*.51);
  glow(g,horizon[0],horizon[1],W*.42,q.s===2?'#a477ff':'#257ecc',.38);
  // Receding sparks and streaks respond to increasing subdivision density.
  g.save();g.globalCompositeOperation='screen';const speed=q.s===3?2.8:1+Math.log2(q.n||4)*.06;
  for(let i=0;i<65;i++){const z=-25+((i*.719+t*(q.s===3?6:3)*speed)%30),x=Math.sin(i*73.17)*15,y=Math.sin(i*19.43)*7;const p=project(x,y,z),r=1.2+((z+25)/30)*5;g.globalAlpha=.15+((i*11)%17)/26;g.drawImage(spark,p[0]-r,p[1]-r,r*2,r*2);if(i%2===0){const tail=project(x,y,z-1.5*speed);g.beginPath();g.moveTo(...tail);g.lineTo(...p);g.strokeStyle='#a9dcff99';g.lineWidth=1;g.stroke()}}
  g.restore();
  // Soft volumetric light uses its own buffer; graph and main formulas stay native.
  lightContext.setTransform(1,0,0,1,0,0);lightContext.clearRect(0,0,lightCanvas.width,lightCanvas.height);lightContext.setTransform(lightScale,0,0,lightScale,0,0);dynamics.render(lightContext,q,project);g.drawImage(lightCanvas,0,0,W,H);
  if(q.s===3){const pulse=Math.sin(Math.PI*q.p)**6;glow(g,W*.5,H*.43,W*.42,'#ffdfae',pulse*.9);glow(g,W*.5,H*.43,W*.2,'#c4a0ff',pulse*.7)}
 },
 graphLight(g,q,project,{left=false,scale=1,ox=0,oy=0,oz=0}={}){
  const color=left?'#ba82ff':'#ffce72';const p=(x,y,z=0)=>project(x*scale+ox,y*scale+oy,z*scale+oz),n=q.n;
  g.save();g.globalCompositeOperation='screen';
  // Distorted mirrored contours below the actual coordinate plane.
  const fade=q.s===4?1-q.p:1;
  const rn=Math.min(n,32);for(let k=0;k<rn;k++){let x0=k/rn,x1=(k+1)/rn,height=(left?x0:x1)**2*6;const a=p(x1*6-3,-3,.05),b=p(x1*6-3,-3-height*.30,.05),corners=[p(x0*6-3,-3,.05),a,b,p(x0*6-3,-3-height*.30,.05)];const grad=g.createLinearGradient(a[0],a[1]-.01,b[0],b[1]+.01);grad.addColorStop(0,left?'#c091ff85':'#ffd07885');grad.addColorStop(1,left?'#b97fff00':'#ffc35a00');g.fillStyle=grad;g.globalAlpha=.65*fade;g.beginPath();corners.forEach((v,i)=>i?g.lineTo(v[0]+Math.sin(q.t*2+k)*2,v[1]):g.moveTo(...v));g.closePath();g.fill();g.strokeStyle=grad;g.lineWidth=1;g.stroke()}
  const count=q.s===4?80:48;
  for(let i=0;i<count;i++){let x=((i*.618033+q.t*(q.s===3?.7:.38))%1),y=x*x*6-3+Math.sin(q.t*1.1+i)*.16,z=.1+Math.cos(i*7+q.t)*.35;let a=p(x*6-3,y,z),r=(q.s===4?7:4)*(1+.5*Math.sin(i+q.t*3));g.globalAlpha=.45;g.drawImage(spark,a[0]-r,a[1]-r,r*2,r*2)}
  g.restore();const end=p(3,3,.1);glow(g,...end,W*.065,color,.55+.2*Math.sin(q.t*3)**2);
 },glow};
}
