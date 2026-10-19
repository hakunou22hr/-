import assert from 'node:assert/strict';
import {functions,byId,integrals} from '../model.js';
// Independent Simpson quadrature validates the analytic area readouts,
// including functions that change sign on each half of the interval.
function numeric(f,l,r){const n=4000,h=(r-l)/n;let s=f(l)+f(r);for(let i=1;i<n;i++)s+=(i%2?4:2)*f(l+i*h);return s*h/3;}
for(const f of functions){for(const a of [.1,.5,1,1.75,2.5]){const v=integrals(f,a);for(const [key,l,r] of [['left',-a,0],['right',0,a],['total',-a,a]])assert.ok(Math.abs(v[key]-numeric(f.f,l,r))<1e-7,`${f.id}/${a}/${key}`);if(f.kind==='even')assert.ok(Math.abs(v.left-v.right)<1e-10);if(f.kind==='odd')assert.ok(Math.abs(v.total)<1e-10);}}
assert.ok(Math.abs(integrals(byId('mixed'),1).total-8/3)<1e-12);
assert.ok(Math.abs(integrals(byId('cos'),Math.PI/4).total-Math.sqrt(2))<1e-12);
assert.ok(integrals(byId('cubic'),.5).right<0);
assert.ok(integrals(byId('quartic'),.5).total<0);
console.log('Area quadrature, sign changes, parity, and both examples: passed');
