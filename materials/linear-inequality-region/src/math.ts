export type Point={x:number,y:number}
export type Inequality={id:string,label:string,boundary:string,a:number,b:number,c:number,color:string}
export const EPS=1e-7
// ax+by<=c の形に統一する。既存の4条件は表示文字列と計算を同じ配列で管理する。
export const INEQUALITIES:Inequality[]=[
 {id:'x',label:'x ≧ 0',boundary:'x = 0',a:-1,b:0,c:0,color:'#2364d2'},
 {id:'y',label:'y ≧ 0',boundary:'y = 0',a:0,b:-1,c:0,color:'#12966f'},
 {id:'top',label:'2x + y ≦ 8',boundary:'2x + y = 8',a:2,b:1,c:8,color:'#e07a17'},
 {id:'side',label:'2x + 3y ≦ 12',boundary:'2x + 3y = 12',a:2,b:3,c:12,color:'#8b4eb5'}]
export const satisfies=(p:Point,q:Inequality,tol=EPS)=>q.a*p.x+q.b*p.y<=q.c+tol
export function intersection(p:Inequality,q:Inequality):Point|null{const d=p.a*q.b-q.a*p.b;if(Math.abs(d)<EPS)return null;const x=(p.c*q.b-q.c*p.b)/d,y=(p.a*q.c-q.a*p.c)/d;return{x:Math.abs(x)<EPS?0:x,y:Math.abs(y)<EPS?0:y}}
export function feasibleVertices(items:Inequality[]){const out:Point[]=[];for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){const p=intersection(items[i],items[j]);if(p&&items.every(q=>satisfies(p,q))&&!out.some(v=>Math.hypot(v.x-p.x,v.y-p.y)<EPS))out.push(p)}return out.sort((p,q)=>Math.atan2(p.y-2.5,p.x-2.5)-Math.atan2(q.y-2.5,q.x-2.5))}
export function clipPolygon(poly:Point[],q:Inequality){const out:Point[]=[];poly.forEach((p,i)=>{const n=poly[(i+1)%poly.length],pin=satisfies(p,q),nin=satisfies(n,q);if(pin)out.push(p);if(pin!==nin){const dx=n.x-p.x,dy=n.y-p.y,t=(q.c-q.a*p.x-q.b*p.y)/(q.a*dx+q.b*dy);out.push({x:p.x+t*dx,y:p.y+t*dy})}});return out}
export function commonPolygon(items:Inequality[],min=-2,max=9){return items.reduce((p,q)=>clipPolygon(p,q),[{x:min,y:min},{x:max,y:min},{x:max,y:max},{x:min,y:max}])}
export function extrema(vertices:Point[]){if(!vertices.length)return null;return{min:vertices.reduce((a,b)=>a.x+a.y<=b.x+b.y?a:b),max:vertices.reduce((a,b)=>a.x+a.y>=b.x+b.y?a:b)}}
export function formatNumber(n:number){if(Math.abs(n-Math.round(n))<EPS)return String(Math.round(n));return String(Math.round(n*100)/100)}
export function advancePingPong(value:number,direction:1|-1,delta:number,min:number,max:number){
 let next=value+direction*delta, nextDirection=direction
 while(next>max||next<min){if(next>max){next=max-(next-max);nextDirection=-1}else{next=min+(min-next);nextDirection=1}}
 return{value:next,direction:nextDirection as 1|-1}
}
