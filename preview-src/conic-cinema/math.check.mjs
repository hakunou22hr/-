import assert from 'node:assert/strict';
import {parabola,ellipse,hyperbola,section} from './math.mjs';
for(let i=0;i<1000;i++){
  const t=(i/999-.5)*6;
  for(let p of[-2,-1,.5,1,2]){const[x,y]=parabola(t,p);assert(Math.abs(Math.hypot(x-p,y)-Math.abs(x+p))<1e-10);}
  for(let[a,b]of[[3,1.8],[3.2,1.5],[2.8,2]]){const[x,y]=ellipse(t,a,b),c=Math.sqrt(a*a-b*b);assert(Math.abs(Math.hypot(x-c,y)+Math.hypot(x+c,y)-2*a)<1e-10);}
  for(let branch of[-1,1]){const a=1.6,b=1,[x,y]=hyperbola(t,branch,a,b),c=Math.hypot(a,b);assert(Math.abs(Math.abs(Math.hypot(x-c,y)-Math.hypot(x+c,y))-2*a)<1e-10);}
  for(let kind of['ellipse','parabola','hyperbola']){const[x,y,z]=section(kind,t);assert(Math.abs(x*x+z*z-y*y)<1e-9);if(kind==='ellipse')assert(Math.abs(y-.42*x-1.45)<1e-9);if(kind==='parabola')assert(Math.abs(y-x-.9)<1e-9);if(kind==='hyperbola')assert.equal(x,1.15);}
}
console.log('PASS: focus/directrix, focal sums, absolute differences, both branches and 3D cutting planes');
