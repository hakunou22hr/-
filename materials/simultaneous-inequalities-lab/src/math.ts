export type Op='<'|'<='|'>'|'>='|'='
export type Inequality={op:Op,value:number}
export type Bound={value:number,inclusive:boolean}
export type Solution={lower:Bound|null,upper:Bound|null,empty:boolean,point:boolean}

export function parseInequality(raw:string):Inequality|null{
 const s=raw.trim().replace(/≤/g,'<=').replace(/≥/g,'>=').replace(/\s/g,'')
 const m=s.match(/^x(<=|>=|<|>|=)([-+]?(?:\d+(?:\.\d*)?|\.\d+))$/)
 if(!m)return null
 return{op:m[1] as Op,value:Number(m[2])}
}
export function solve(items:Inequality[]):Solution{
 let lower:Bound|null=null,upper:Bound|null=null
 for(const q of items){
  if(q.op==='>'||q.op==='>='){const b={value:q.value,inclusive:q.op==='>='};if(!lower||b.value>lower.value||(b.value===lower.value&&!b.inclusive))lower=b}
  else if(q.op==='<'||q.op==='<='){const b={value:q.value,inclusive:q.op==='<='};if(!upper||b.value<upper.value||(b.value===upper.value&&!b.inclusive))upper=b}
  else{const b={value:q.value,inclusive:true};lower=b;upper=b}
 }
 const empty=!!(lower&&upper&&(lower.value>upper.value||(lower.value===upper.value&&(!lower.inclusive||!upper.inclusive))))
 return{lower,upper,empty,point:!empty&&!!lower&&!!upper&&lower.value===upper.value}
}
export const n=(x:number)=>Number.isInteger(x)?String(x):String(x)
export function formatInequality(q:Inequality){return`x ${q.op.replace('<=','≤').replace('>=','≥')} ${n(q.value)}`}
export function answer(s:Solution){if(s.empty)return'解なし';if(s.point)return`x = ${n(s.lower!.value)}`;if(s.lower&&s.upper)return`${n(s.lower.value)} ${s.lower.inclusive?'≤':'<'} x ${s.upper.inclusive?'≤':'<'} ${n(s.upper.value)}`;if(s.lower)return`x ${s.lower.inclusive?'≥':'>'} ${n(s.lower.value)}`;if(s.upper)return`x ${s.upper.inclusive?'≤':'<'} ${n(s.upper.value)}`;return'すべての実数'}
export function reading(q:Inequality){const words:Record<Op,string>={'<':'より小さい','<=':'以下','>':'より大きい','>=':'以上','=':'と等しい'};return`x は ${n(q.value)} ${words[q.op]}`}
export const contains=(q:Inequality,x:number)=>q.op==='<'?x<q.value:q.op==='<='?x<=q.value:q.op==='>'?x>q.value:q.op==='>='?x>=q.value:x===q.value
