import assert from 'node:assert/strict';
import {rightSum,error,scene} from '../model.js';
for(const n of [1,2,4,8,16,32,64,128,200,1000]){
 let right=0,left=0;for(let k=1;k<=n;k++){right+=(k/n)**2/n;left+=((k-1)/n)**2/n}
 assert.ok(Math.abs(right-rightSum(n))<1e-12);assert.ok(Math.abs(right-1/3-error(n))<1e-12);assert.ok(left<=1/3&&right>=1/3);assert.ok(Math.abs(right-left-1/n)<1e-12);assert.ok(rightSum(n+1)<rightSum(n));
}
for(const portrait of [false,true]){const duration=portrait?30:90;for(let f=0;f<duration*30;f++){const s=scene(f/30,portrait);assert.ok(Number.isInteger(s.n)&&s.n>=1&&s.n<=1000);assert.ok(s.i>=0&&s.i<=6)}assert.equal(scene(duration-1,portrait).i,6)}
console.log('Direct rectangle sums, error, bracketing, monotonic convergence and both complete timelines passed.');
