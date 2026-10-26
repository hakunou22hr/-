import assert from 'node:assert/strict';
import {calculate,functions} from '../math.js';
import {stateAt} from '../timeline.js';
let checked=0;const near=(a,b,tol=1e-10)=>{assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);checked++};
for(const n of [1,4,8,16,32,64,128,256,1000]){
 const d=calculate('square',0,1,n);near(d.sum,(n+1)*(2*n+1)/(6*n*n));near(d.exact,1/3);
 for(let k=0;k<n;k++){near(d.rectangles[k].right,(k+1)/n);near(d.rectangles[k].height,d.rectangles[k].right**2)}
}
assert.throws(()=>calculate('sqrt',-.1,1,10),RangeError);assert.throws(()=>calculate('sin',1,0,10),RangeError);assert.throws(()=>calculate('sin',0,1,1001),RangeError);
for(const [key,a,b] of [['wave',0,3],['square',-1,2],['sqrt',0,1],['sin',0,5],['cos',-2,3],['cubic',-1.35,1.35]]){
 const coarse=calculate(key,a,b,4),fine=calculate(key,a,b,1000);assert.ok(fine.absError<.02);assert.ok(fine.absError<=coarse.absError+1e-12);near(fine.exact,functions[key].F(b)-functions[key].F(a));
}
assert.ok(calculate('sin',0,3,10).error>0);assert.ok(calculate('cos',0,3,10).error<0);
assert.ok(calculate('cubic',-1.35,1.35,32).rectangles.some(r=>r.height<0));
const seen=[];let previous=0;
for(let frame=0;frame<3600;frame++){
 const s=stateAt(frame/30);assert.equal(s.data.n,s.n);assert.equal(s.gridLevel,s.n);const f=s.data.f||functions[s.data.key].f;
 near(s.data.dx,(s.data.b-s.data.a)/s.n);near(s.data.sum,s.data.rectangles.reduce((sum,r)=>sum+r.height*s.data.dx,0));
 for(const r of s.data.rectangles)near(r.height,f(r.right));
 if(s.n!==previous){seen.push(s.n);previous=s.n}checked++;
}
assert.deepEqual(seen,[4,8,16,32,64,128,256]);
for(let frame=0;frame<900;frame++){const s=stateAt(frame/30,true);near(s.data.dx,(s.data.b-s.data.a)/s.n);for(const r of s.data.rectangles)near(r.height,functions[s.data.key].f(r.right));}

assert.deepEqual([0,4,8,12,20,26,29.9].map(t=>stateAt(t,true).n),[4,4,32,128,128,128,128]);
for(const t of [0,5,17,34,55,72,80,94,102,108,116])assert.equal(JSON.stringify(stateAt(t)),JSON.stringify(stateAt(t)));
console.log(JSON.stringify({passed:true,assertions:checked,framesChecked:4500,sequences:seen,functions:Object.keys(functions)},null,2));
