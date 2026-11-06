import assert from 'node:assert/strict';
import {A,H,chord,area,volumeTo,totalVolume,solidVertices,reelTime} from '../model.js';
assert.equal(chord(0),2*A);assert.equal(area(0),A*H);
for(const x of [-A,A]){assert.equal(chord(x),0);assert.equal(area(x),0)}
assert.equal(volumeTo(-A),0);assert.ok(Math.abs(volumeTo(0)-totalVolume()/2)<1e-12);assert.ok(Math.abs(volumeTo(A)-totalVolume())<1e-12);
// Compare the mesh's signed tetrahedral volume against the independent exact integral.
for(const to of [-1.7,-.8,0,1.3,A]){
for(const segments of [180,1000]){
const v=solidVertices(to,segments);let meshVolume=0;
for(let i=0;i<v.length;i+=9){const [ax,ay,az,bx,by,bz,cx,cy,cz]=v.slice(i,i+9);meshVolume+=(ax*(by*cz-bz*cy)+ay*(bz*cx-bx*cz)+az*(bx*cy-by*cx))/6;}
assert.ok(Math.abs(Math.abs(meshVolume)-volumeTo(to))<(segments===180?.008:.004),`mesh volume at ${to}: ${meshVolume} vs ${volumeTo(to)}`);
for(let i=0;i<v.length;i+=3){assert.ok(v[i]>=-A-1e-6&&v[i]<=to+1e-6);assert.ok(v[i+1]===0||v[i+1]===H,'altitude is always h');const w=chord(v[i])/2;assert.ok(Math.abs(v[i+2])<=w+.001,'section remains inside chord');}
}
}
for(let i=0;i<=200;i++){const x=-A+2*A*i/200;assert.ok(Math.abs(area(x)-area(-x))<1e-10);if(i>0)assert.ok(volumeTo(x)>=volumeTo(x-2*A/200)-1e-10)}
assert.equal(reelTime(0),0);assert.equal(reelTime(4),12);assert.equal(reelTime(9),27);assert.equal(reelTime(23),76);assert.equal(reelTime(30),90);
console.log('PASS: chord, constant altitude, section area, mesh volume, swept volume and shared timelines');
