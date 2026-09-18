export type Pair=[number,number]
export type Triple=[number,number,number]
export const isAdjacent=(a:number,b:number,n:number)=>Math.abs(a-b)===1||Math.abs(a-b)===n-1
/** A direction-independent identity for an edge or diagonal. */
export const diagonalKey=(a:number,b:number)=>a<b?`${a}-${b}`:`${b}-${a}`
export function diagonals(n:number):Pair[]{const out:Pair[]=[];for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)if(!isAdjacent(a,b,n))out.push([a,b]);return out}
export function triangles(n:number):Triple[]{const out:Triple[]=[];for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)for(let c=b+1;c<n;c++)out.push([a,b,c]);return out}
export const sharedEdgeCount=(t:Triple,n:number)=>[[t[0],t[1]],[t[0],t[2]],[t[1],t[2]]].filter(([a,b])=>isAdjacent(a,b,n)).length
/** Returns the polygon side contained in a triangle when there is exactly one. */
export function sharedPolygonEdge(t:Triple,n:number):Pair|null{
 const edges:Pair[]=[[t[0],t[1]],[t[1],t[2]],[t[2],t[0]]]
 const shared=edges.filter(([a,b])=>isAdjacent(a,b,n))
 return shared.length===1?shared[0]:null
}
export const oneEdgeTriangles=(n:number)=>triangles(n).filter(t=>sharedEdgeCount(t,n)===1)
export const choose3=(n:number)=>n*(n-1)*(n-2)/6
