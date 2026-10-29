import assert from 'node:assert/strict';import {MIN,MAX,MIN_POINT,MAX_POINT,feasible,intersections,state,arc} from '../model.js';
const near=(a,b,e=1e-7)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
for(const p of [[1,3],MIN_POINT]){near(p[0]**2+p[1]**2,10);near(p[1],-2*p[0]+5);}
near(MIN_POINT[0]+MIN_POINT[1],MIN);near(MAX_POINT[0]+MAX_POINT[1],MAX);near(MAX_POINT[0]**2+MAX_POINT[1]**2,10);assert.ok(feasible(...MAX_POINT));
// Radius is perpendicular to the objective direction (1,-1) at the maximum.
near(MAX_POINT[0]-MAX_POINT[1],0);
// Independent exhaustive check across the disk and straight boundary.
let lo=Infinity,hi=-Infinity;
for(let i=0;i<=200000;i++){const a=i/200000*2*Math.PI,x=Math.sqrt(10)*Math.cos(a),y=Math.sqrt(10)*Math.sin(a);if(feasible(x,y)){lo=Math.min(lo,x+y);hi=Math.max(hi,x+y);}}
for(let i=0;i<=10000;i++){const x=1+2*i/10000,y=5-2*x;assert.ok(feasible(x,y));lo=Math.min(lo,x+y);hi=Math.max(hi,x+y);}
near(lo,MIN,1e-5);near(hi,MAX,1e-5);
assert.deepEqual(intersections(1.999),[]);assert.deepEqual(intersections(MAX+.001),[]);assert.equal(intersections(MIN).length,1);assert.equal(intersections(MAX).length,1);
for(const p of arc){near(p[0]**2+p[1]**2,10);assert.ok(feasible(...p));}
for(const portrait of [false,true]){const duration=portrait?30:90;for(let i=0;i<=duration*30;i++){const q=state(i/30,portrait);assert.ok(Number.isFinite(q.k));for(const p of q.contacts){assert.ok(feasible(...p));near(p[0]+p[1],q.k);}if(q.min){near(q.k,MIN);assert.equal(q.contacts.length,1);}if(q.max){near(q.k,MAX);assert.equal(q.contacts.length,1);}}}
console.log('PASS: circle, boundary, feasible region, extrema, tangency and all 3602 timeline states.');
