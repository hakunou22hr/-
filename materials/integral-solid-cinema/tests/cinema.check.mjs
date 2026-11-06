import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {lessonTime,movieState} from '../cinema-timeline.js';
for(const [portrait,duration] of [[false,90],[true,30]]){let prev=-1;for(let f=0;f<=duration*60;f++){const t=f/60,s=movieState(t,portrait);assert.ok(s.mathTime>=prev-1e-8);assert.ok(s.mathTime>=0&&s.mathTime<=90);prev=s.mathTime}assert.equal(lessonTime(0,portrait),0);assert.equal(lessonTime(duration,portrait),90);assert.equal(movieState(0,portrait).roomVisible,true);assert.equal(movieState(0,portrait).exit,0);assert.equal(movieState(duration/2,portrait).exit,0)}
assert.equal(lessonTime(26,false),27);assert.equal(lessonTime(44,false),44);assert.equal(lessonTime(58,false),59);assert.equal(lessonTime(75,false),76);assert.equal(lessonTime(9,true),27);assert.equal(lessonTime(23,true),76);
// Preserve the already-published lesson implementation, independent of the new film surface.
const base=new URL('../',import.meta.url);for(const [kept,expected] of [['app-original.js','269996ba7e48250785966f26d9c61a55172312a2a7b3a69a5867f707451026b2'],['style-original.css','f46917160b02077bbbca6e7ed5af3aa6571961e3e5c4535a304acf96a0480a08']])assert.equal(createHash('sha256').update(fs.readFileSync(new URL(kept,base))).digest('hex'),expected);
console.log('PASS: 90/30-second timing, six-scene long edit, and exact preservation of original lesson code');

assert.ok(movieState(89.9,false).exit>.9);assert.equal(movieState(29.9,true).exit,0);
