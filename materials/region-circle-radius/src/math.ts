export type Point={x:number,y:number}
export const base={a:2,b:8,c:4}
const cross=(a:Point,b:Point,c:Point)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)
export function vertices(a=2,b=8,c=4){
 const A={x:(b-a)/3,y:(b+2*a)/3}; const B={x:(2*b-c)/3,y:(2*c-b)/3}; const C={x:(c-2*a)/3,y:(c+a)/3}; return {A,B,C}
}
export function value(p:Point){return p.x*p.x+p.y*p.y}
export function inside(p:Point,a=2,b=8,c=4){return p.x-p.y+a>=-1e-8&&2*p.x+p.y-b<=1e-8&&p.x+2*p.y-c>=-1e-8}
function segmentClosest(p:Point,q:Point){const d={x:q.x-p.x,y:q.y-p.y};const t=Math.max(0,Math.min(1,-(p.x*d.x+p.y*d.y)/(d.x*d.x+d.y*d.y)));return{x:p.x+t*d.x,y:p.y+t*d.y}}
export function extrema(a=2,b=8,c=4){
 const vs=vertices(a,b,c), points=Object.values(vs); if(inside({x:0,y:0},a,b,c)) return {min:{x:0,y:0},max:points.reduce((u,v)=>value(v)>value(u)?v:u)}
 const candidates=[...points,segmentClosest(vs.A,vs.B),segmentClosest(vs.B,vs.C),segmentClosest(vs.C,vs.A)].filter(p=>inside(p,a,b,c));
 return {min:candidates.reduce((u,v)=>value(v)<value(u)?v:u),max:points.reduce((u,v)=>value(v)>value(u)?v:u)}
}
export function orderedTriangle(a=2,b=8,c=4){const p=Object.values(vertices(a,b,c));return cross(p[0],p[1],p[2])<0?p.reverse():p}
