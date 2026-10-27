import assert from 'node:assert/strict';import {region,vertices,intersects,objectiveSegment,state,constraints} from '../model.js';
const actual=region();assert.equal(actual.length,4);for(const v of vertices)assert(actual.some(p=>Math.hypot(p[0]-v[0],p[1]-v[1])<1e-8));
for(let k=-1;k<=7;k+=.01){assert.equal(intersects(k),k>=-1e-8&&k<=5+1e-8);for(const p of objectiveSegment(k))assert(Math.abs(p[0]+p[1]-k)<1e-8);}
for(let mask=0;mask<16;mask++){const enabled=constraints.map((_,i)=>!!(mask&(1<<i))),p=region(enabled);for(const v of p)for(let i=0;i<4;i++)if(enabled[i])assert(constraints[i].a*v[0]+constraints[i].b*v[1]<=constraints[i].c+1e-8);}
for(let i=0;i<=900;i++){const a=state(i/10);assert(a.s>=0&&a.s<=7);assert(Number.isFinite(a.k));}
assert(state(74).max);assert(state(80).min);assert.equal(state(1000,{manual:true,k:5}).t,1000);assert(state(1000,{manual:true,k:5}).max);assert(!state(60,{manual:true,k:5.6}).intersects);
// An algebraic bound independent of graphical clipping: adding the last two
// inequalities yields 4(x+y)<=20; nonnegative x,y gives x+y>=0.
for(let i=0;i<1000;i++){const x=8*i/999,y=7*((i*37)%1000)/999;if(constraints.every(c=>c.a*x+c.b*y<=c.c))assert(x+y>=0&&x+y<=5+1e-8);}
console.log('PASS exact vertices, all 16 condition combinations, objective contacts, timeline and algebraic bounds');
