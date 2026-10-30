export const R=Math.sqrt(10),MIN=2,MAX=2*Math.sqrt(5),MIN_POINT=[3,-1],MAX_POINT=[Math.sqrt(5),Math.sqrt(5)];
export const clamp=x=>Math.max(0,Math.min(1,x));export const ease=x=>{x=clamp(x);return x*x*(3-2*x)};export const mix=(a,b,u)=>a+(b-a)*ease(u);
export const cuts=[0,12,24,42,58,74,86,90],reelsCuts=[0,5,12,18,22,25,30];
export function feasible(x,y,tol=1e-9){return x*x+y*y<=10+tol&&y>=-2*x+5-tol;}
export function intersections(k){const out=[],push=(x,y)=>{if(feasible(x,y,1e-7)&&!out.some(p=>Math.hypot(p[0]-x,p[1]-y)<1e-6))out.push([x,y]);};const disc=20-k*k;if(disc>=-1e-8){const r=Math.sqrt(Math.max(0,disc));push((k-r)/2,(k+r)/2);push((k+r)/2,(k-r)/2);}push(5-k,2*k-5);return out;}
export const arc=Array.from({length:193},(_,i)=>{const a=mix(Math.atan2(-1,3),Math.atan2(3,1),i/192);return [R*Math.cos(a),R*Math.sin(a)];});
export function state(t,portrait=false){t=Math.max(0,Math.min(portrait?30:90,t));let s,k=-1,u;
 if(portrait){if(t<5){s=0;u=t/5;}else if(t<12){s=1;u=(t-5)/7;k=mix(-.8,2,u);}else if(t<18){s=3;u=(t-12)/6;k=2;}else if(t<22){s=4;u=(t-18)/4;k=mix(2,MAX,u);}else if(t<25){s=5;u=(t-22)/3;k=MAX;}else{s=6;u=(t-25)/5;k=MAX;}}
 else {s=Math.min(6,cuts.findIndex((a,i)=>t>=a&&t<cuts[i+1]));if(s<0)s=6;u=(t-cuts[s])/(cuts[s+1]-cuts[s]);
  if(s===1)k=mix(-1,.5,u);if(s===2)k=mix(.5,3.6,u);if(s===3)k=t<48?mix(.3,2,(t-42)/6):2;if(s===4)k=mix(2,MAX,u);if(s>=5)k=MAX;}
 const min=s===3&&Math.abs(k-2)<1e-7,max=s>=5,objective=s>0,graph=s>0||t>(portrait?1.3:3),reveal=ease((t-(portrait?1.2:3))/(portrait?2.8:6));
 const event=portrait?(min?12:max?22:-10):(min?48:max?74:-10),impact=(min||max)?Math.exp(-Math.max(0,t-event)*2.7):0;
 return {t,s,u,k,portrait,min,max,objective,graph,reveal,impact,intersects:k>=MIN-1e-9&&k<=MAX+1e-9,contacts:objective?intersections(k):[]};
}
