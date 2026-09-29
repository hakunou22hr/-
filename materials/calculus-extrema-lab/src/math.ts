export const TAU=2*Math.PI;
export const f=(x:number)=>x-2*Math.sin(x);
export const df=(x:number)=>1-2*Math.cos(x);
export const critical=[Math.PI/3,5*Math.PI/3] as const;
export const sign=(x:number,eps=1e-7):'-'|'0'|'+'=>Math.abs(df(x))<eps?'0':df(x)>0?'+':'-';
export const kind=(x:number)=>Math.abs(x-critical[0])<1e-6?'min':Math.abs(x-critical[1])<1e-6?'max':null;
