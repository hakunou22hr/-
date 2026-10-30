import assert from 'node:assert/strict';import{createHash}from'node:crypto';import{createCanvas}from'@napi-rs/canvas';import * as T from'three';import{state,cameraPose}from'../model.js';import{createDynamicStage,flowPoint}from'../dynamic-stage.js';
const W=640,H=360,c=createCanvas(W,H),g=c.getContext('2d'),cam=new T.PerspectiveCamera(40,W/H,.1,150),v=new T.Vector3(),fx=createDynamicStage(W,H,createCanvas),project=(x,y,z=0)=>{v.set(x,y,z).project(cam);return[(v.x+1)*W/2,(1-v.y)*H/2]};
function draw(t,d=90,poseTime=t){const q=state(t,d),p=cameraPose(state(poseTime,d),false);cam.position.set(p.x,p.y,p.z);cam.lookAt(0,p.targetY,0);cam.updateMatrixWorld();g.fillStyle='#020610';g.fillRect(0,0,W,H);fx.render(g,q,project);return Buffer.from(c.data())}
const result=[];for(let t of[19,37,64,80]){const a=draw(t,90,t),b=draw(t+.5,90,t);let changed=0,gold=0;for(let i=0;i<a.length;i+=4){if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>20)changed++;if(a[i]>100&&a[i+1]>65&&a[i]>a[i+2]*1.2)gold++}assert(changed>W*H*.045,'Visible transport required with camera fixed');assert(gold>W*H*.01,'Gold emission must be visible');result.push({scene:state(t,90).s,changedPixels:changed,goldPixels:gold,clouds:false,cameraHeldFixed:true})}
const hash=x=>createHash('sha256').update(x).digest('hex'),a=hash(draw(19));draw(69);assert.equal(a,hash(draw(19)),'Seek reproducibility');
// Sweep the whole flow and timeline, including the floating point endpoint u=1.
for(let d of[30,90])for(let t=0;t<=d;t+=.25)for(let u of[0,.42999,.43,.8,.99999,1])assert(flowPoint(u,t,7).every(Number.isFinite));
// The field changes shape: pairwise distances do not stay fixed as in rigid rotation.
const distance=(u,v,t)=>{const a=flowPoint(u,t,0),b=flowPoint(v,t,0);return Math.hypot(a[0]-b[0],a[1]-b[1])};assert(Math.abs(distance(.5,.75,18)-distance(.5,.75,20))>.005);
for(let t of[0,3,8,15,22,29.9,30])draw(t,30);
console.log(JSON.stringify({lightTransport:result,fieldDeforms:true,finiteAtEndpoints:true,deterministicSeek:true,bothTimelines:true},null,2));
