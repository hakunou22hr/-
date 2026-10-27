// All geometric calculations use the two-dimensional x,y plane.
export const cuts=[0,12,30,40,53,72,78,83,90];
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v)},mix=(a,b,t)=>a+(b-a)*t;
export const constraints=[{a:-1,b:0,c:0,color:'#58d7ff',key:'c0'},{a:0,b:-1,c:0,color:'#b89aff',key:'c1'},{a:2,b:3,c:12,color:'#69efcb',key:'c2'},{a:2,b:1,c:8,color:'#ffae72',key:'c3'}];
export const box=[[-1,-1],[8,-1],[8,7],[-1,7]],vertices=[[0,0],[4,0],[3,2],[0,4]];
export function clip(poly,{a,b,c}){const result=[];if(!poly.length)return result;for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],dp=a*p[0]+b*p[1]-c,dq=a*q[0]+b*q[1]-c;if(dp<=1e-9)result.push(p);if((dp>1e-9)!==(dq>1e-9)){const r=dp/(dp-dq);result.push([mix(p[0],q[0],r),mix(p[1],q[1],r)]);}}return result;}
export function region(enabled=[true,true,true,true]){return constraints.reduce((p,c,i)=>enabled[i]?clip(p,c):p,box);}
export function objectiveSegment(k){let p=clip(box,{a:1,b:1,c:k});const pts=[];for(const v of p)if(Math.abs(v[0]+v[1]-k)<1e-7&&!pts.some(a=>Math.hypot(v[0]-a[0],v[1]-a[1])<1e-7))pts.push(v);return pts;}
export function intersects(k,enabled=[true,true,true,true]){const p=region(enabled);if(!p.length)return false;const sums=p.map(v=>v[0]+v[1]);return k>=Math.min(...sums)-1e-8&&k<=Math.max(...sums)+1e-8;}
export function state(time,options={}){const t=clamp(time,0,90),s=Math.min(7,cuts.findIndex((c,i)=>i<8&&t>=c&&t<cuts[i+1])<0?7:cuts.findIndex((c,i)=>i<8&&t>=c&&t<cuts[i+1])),u=clamp((t-cuts[s])/(cuts[s+1]-cuts[s]));let k=s<4?2:s===4?mix(-.7,5.8,ease(u)):s===5?5:s===6?0:5;
 const manual=options.manual===true;if(manual)k=options.k??2.5;
 const enabled=options.enabled||[true,true,true,true],reveal=manual?4:s===0?0:s===1?Math.min(4,1+Math.floor(u*4)):4;
 return {t:manual?Math.max(0,time):t,s,u,k,enabled,reveal,manual,flat:manual?1:ease((t-25)/6),objective:manual||s>=3,common:manual||t>=26,intersects:intersects(k,enabled),max:Math.abs(k-5)<.001,min:Math.abs(k)<.001,orbit:options.orbit||0};}
