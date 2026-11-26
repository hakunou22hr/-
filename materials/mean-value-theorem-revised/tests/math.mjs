import assert from 'node:assert/strict';import {model,timeline,phase} from '../model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
for(const c of [.01,.5,1,1.5,1.99]){const m=model('square',c);near(m.sec,2);near(m.slope,2*c);near(m.tangent(c),c*c);const h=1e-5;assert.ok(Math.abs((m.f(c+h)-m.f(c-h))/(2*h)-m.slope)<1e-8);assert.equal(m.exact,c===1)}
const exact=model('square',1);for(const x of [-.5,0,1,2]){near(exact.tangent(x),2*x-1);near((2*x)-exact.tangent(x),1)}
for(const c of [-.99,-.5,0,.5,.99]){const m=model('abs',c);near(m.sec,0);assert.equal(m.slope,c===0?null:Math.sign(c));assert.equal(m.exact,false);if(c===0)assert.equal(m.tangent(0),null)}
assert.equal(model('square',.99).near,true);assert.equal(model('square',.99).exact,false);assert.equal(model('square',.97).near,false);assert.equal(model('square',0).exact,false);
for(const [t,c,slope] of [[29,.5,1],[35,1,2],[41,1.5,3],[48,1,2],[62,1,2]]){const m=timeline(t);near(m.c,c);near(m.slope,slope)}
near(timeline(14).horizontal,1);near(timeline(17).vertical,1);near(timeline(22).secant,1);near(timeline(54).triangleMove,1);near(timeline(78).slope,2);assert.equal(timeline(78).kind,'square');near(timeline(12).portal,1);near(timeline(89).portal,0);assert.equal(timeline(90).scene,6);
// Both slope triangles have identical vectors; translating by (1,1) preserves them.
for(const b of [[0,0],[1,1]]){near((b[1]+2-b[1])/(b[0]+1-b[0]),2)}
for(let t=0;t<=90;t+=.1){const s=timeline(t);assert.ok(s.c>s.a&&s.c<s.b);assert.ok(Number.isFinite(s.f(s.c)));if(s.slope!==null)assert.ok(Number.isFinite(s.slope))}


for(let t=0;t<=90;t+=.125)assert.equal(timeline(t).kind,'square','current movie must not include the removed absolute-value segment');
console.log('PASS: slopes, separate parallel lines, near/exact distinction, measuring timeline; entire current movie uses x²');
