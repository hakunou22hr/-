import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {ClassroomFrames,classroomTime,sourceFrame,classroomLayout} from '../classroom.mjs';
const root=new URL('../../../public/media/mean-value-theorem-revised/classroom-v10/',import.meta.url),files=readdirSync(root);
assert.equal(files.length,240);
for(const file of files){const b=readFileSync(new URL(file,root));assert.equal(b[0],255);assert.equal(b[1],216)}
let previous=-1;
for(let t=0;t<12;t+=1/24){const frame=sourceFrame(t);assert.ok(frame>=previous&&frame<240);previous=frame;const {graph,board}=classroomLayout(classroomTime(t));assert.ok(graph.y-board.y>=25);assert.ok(graph.y>=100&&graph.y+graph.h<950)}
assert.ok(sourceFrame(0)>=6,'skip source opening border');assert.equal(sourceFrame(10),239);assert.equal(sourceFrame(84),239);assert.equal(sourceFrame(90),sourceFrame(0));
for(const t of [0,3,6,9])assert.notEqual(createHash('sha256').update(readFileSync(new URL(`frame-${String(sourceFrame(t)).padStart(3,'0')}.jpg`,root))).digest('hex'),createHash('sha256').update(readFileSync(new URL('frame-239.jpg',root))).digest('hex'));
// A small LRU remains bounded during playback and backward seeks; it must not
// accumulate all 240 decoded frames on phones/tablets.
globalThis.document={baseURI:'https://hakunou22hr.github.io/-/materials/mean-value-theorem-revised/'};
globalThis.Image=class{set src(value){this.value=value;queueMicrotask(()=>this.onload())}};
const cache=new ClassroomFrames();for(let t=0;t<12;t+=.1)await cache.prepare(t);for(const t of [3,8,0,6])await cache.prepare(t);assert.ok(cache.cache.size<=10);assert.equal(cache.index,sourceFrame(6));assert.match(cache.url(6),/^https:\/\/hakunou22hr.github.io\/-\/media\/mean-value-theorem-revised\/classroom-v14\/frame-006.jpg$/);
console.log('PASS: 240 supplied motion frames, monotonic intro/reverse return, no opening border, graph/board clearance and bounded seek cache');

const corrected=new URL('../../../public/media/mean-value-theorem-revised/classroom-v14/',import.meta.url);assert.equal(readdirSync(corrected).length,54);assert.match(cache.url(54),/classroom-v10/);for(let i=0;i<54;i++){const b=readFileSync(new URL(`frame-${String(i).padStart(3,'0')}.jpg`,corrected));assert.equal(b[0],255);assert.equal(b[1],216)}
