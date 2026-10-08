export const rise = (d:number, theta:number) => d*Math.tan(theta*Math.PI/180)
export function geometry(d:number,theta:number,n:number){const h=rise(d,theta);return {h,length:d*n,height:h*n,steps:Array.from({length:n},(_,i)=>({x:i*d,top:(i+1)*h,corner:[(i+1)*d,(i+1)*h]}))}}
export function cameraPose(view:string,L:number,H:number,zoom=1,rotation=35){const r=Math.max(L,H,150)*1.3/zoom;const t=[L/2,H/2,0];const a=rotation*Math.PI/180;return {target:t,position:view==='側面'?[L/2,H/2,r]:view==='正面'?[-r,H/2,0]:view==='真上'?[L/2,H/2+r,0.001]:[L/2-r*Math.cos(a),H/2+r*.6,r*Math.sin(a)]}}
