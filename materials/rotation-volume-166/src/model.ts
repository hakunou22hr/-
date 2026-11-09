export const TAU=2*Math.PI;
export const R=(x:number)=>-x*x+4*x;
export const r=(x:number)=>x;
export const area=(x:number)=>Math.PI*(R(x)**2-r(x)**2);
export const primitive=(x:number)=>x**5/5-2*x**4+5*x**3;
export const VOLUME=108*Math.PI/5;
export const outerVolume=153*Math.PI/5;
export const innerVolume=9*Math.PI;
export const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const smooth=(x:number)=>{x=clamp(x);return x*x*(3-2*x)};
export type Display='difference'|'outer'|'inner';
export type Pose={time:number;scene:number;angle:number;cut:number;opacity:number;display:Display;graph:number;slices:number;separate:number;dissolve:number;camera:number[];target:number[]};
export const scenes=[{start:0,end:12,title:'光の曲線から、領域へ',caption:'交点は x=0 と x=3。この間では、放物線が直線の上にあります。'}, {start:12,end:30,title:'平面が回り、立体が生まれる',caption:'同じ領域を x 軸のまわりに回す。外側だけでなく、内側にも曲面が生まれます。'},{start:30,end:45,title:'内側には、円すいの空洞',caption:'直線 y=x から x 軸までの部分は、もとの領域に含まれません。そこが空洞になります。'},{start:45,end:60,title:'輪切りは、円ではなく円環',caption:'外側の円から内側の円を引く。断面積は πR²−πr² です。'},{start:60,end:76,title:'薄い円環を、限りなく足す',caption:'断面積に小さな厚さを掛け、足し合わせる。厚さを 0 に近づけると定積分になります。'},{start:76,end:90,title:'外側の体積 − 内側の体積',caption:'外側の回転体から円すいを差し引くと、求める体積が残ります。'}];
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
export function filmPose(t:number):Pose{
 t=clamp(t,0,90);const scene=Math.max(0,scenes.findIndex(s=>t<s.end));const i=t===90?5:scene;const u=clamp((t-scenes[i].start)/(scenes[i].end-scenes[i].start));
 let camera=[8,7,11],target=[0,0,0];
 if(i===0){camera=[lerp(0,7,smooth(u)),lerp(1.5,5.5,smooth(u)),lerp(14,12,smooth(u))];target=[0,1.5,0]}
 if(i===1){camera=[7+2*Math.sin(u*Math.PI),6,12-3*u];target=[0,0,0]}
 if(i===2){if(u<.52){const a=u/.52*Math.PI*1.3;camera=[10*Math.cos(a),4,10*Math.sin(a)];}else{const v=smooth((u-.52)/.48);camera=[lerp(-5.9,.65,v),lerp(4,.35,v),lerp(-8.1,.3,v)];target=[lerp(0,-.8,v),0,0];}}
 if(i===3){camera=[lerp(12,10,smooth(u)),lerp(3,5,u),lerp(5,9,u)];target=[0,0,0]}
 if(i===4){camera=[8,7,12];target=[0,0,0]}
 if(i===5){camera=[8+2*Math.sin(u*2),6,15];target=[0,0,0]}
 return {time:t,scene:i,angle:i===0?0:i===1?TAU*smooth(u):TAU,cut:i===3?3*smooth(u):1.6,opacity:i===2?.14:.3,display:'difference',graph:i===0?smooth((u-.08)/.74):1,slices:i===4?Math.round(6+74*smooth(u)):0,separate:i===5?smooth(u/.48)*4:0,dissolve:i===5?smooth((u-.48)/.26):0,camera,target};
}
export function surfacePoint(x:number,theta:number,inner=false):[number,number,number]{const radius=inner?r(x):R(x);return [x,radius*Math.cos(theta),radius*Math.sin(theta)]}
// Outward from the material: the cavity normal points toward the rotation axis.
export function surfaceNormal(x:number,theta:number,inner=false):[number,number,number]{const d=inner?1:4-2*x,s=inner?-1:1,n=Math.hypot(d,1);return [-s*d/n,s*Math.cos(theta)/n,s*Math.sin(theta)/n]}
export function midpointVolume(n:number){let sum=0;for(let i=0;i<n;i++)sum+=area((i+.5)*3/n)*3/n;return sum}
