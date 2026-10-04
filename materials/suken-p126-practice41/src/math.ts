export type Vec={x:number,y:number}
export type Motion={id:string;name:string;xTex:string;yTex:string;vTex:string;aTex:string;p:(t:number)=>Vec;v:(t:number)=>Vec;a:(t:number)=>Vec;max?:number}
export const motions:Record<string,Motion>={
 one:{id:'one',name:'(1)',xTex:'x=t',yTex:'y=t^2+2t',vTex:'(1,2t+2)',aTex:'(0,2)',p:t=>({x:t,y:t*t+2*t}),v:t=>({x:1,y:2*t+2}),a:()=>({x:0,y:2})},
 two:{id:'two',name:'(2)',xTex:'x=3t+1',yTex:'y=2t^2-4t',vTex:'(3,4t-4)',aTex:'(0,4)',p:t=>({x:3*t+1,y:2*t*t-4*t}),v:t=>({x:3,y:4*t-4}),a:()=>({x:0,y:4})},
 line:{id:'line',name:'直線運動',xTex:'x=t',yTex:'y=t',vTex:'(1,1)',aTex:'(0,0)',p:t=>({x:t,y:t}),v:()=>({x:1,y:1}),a:()=>({x:0,y:0}),max:6.28},
 parabola:{id:'parabola',name:'放物運動',xTex:'x=t',yTex:'y=t^2',vTex:'(1,2t)',aTex:'(0,2)',p:t=>({x:t,y:t*t}),v:t=>({x:1,y:2*t}),a:()=>({x:0,y:2}),max:4},
 circle:{id:'circle',name:'円運動',xTex:'x=\\cos t',yTex:'y=\\sin t',vTex:'(-\\sin t,\\cos t)',aTex:'(-\\cos t,-\\sin t)',p:t=>({x:Math.cos(t),y:Math.sin(t)}),v:t=>({x:-Math.sin(t),y:Math.cos(t)}),a:t=>({x:-Math.cos(t),y:-Math.sin(t)}),max:6.28},
 ellipse:{id:'ellipse',name:'楕円運動',xTex:'x=3\\cos t',yTex:'y=2\\sin t',vTex:'(-3\\sin t,2\\cos t)',aTex:'(-3\\cos t,-2\\sin t)',p:t=>({x:3*Math.cos(t),y:2*Math.sin(t)}),v:t=>({x:-3*Math.sin(t),y:2*Math.cos(t)}),a:t=>({x:-3*Math.cos(t),y:-2*Math.sin(t)}),max:6.28}
}
export const magnitude=(q:Vec)=>Math.hypot(q.x,q.y)
