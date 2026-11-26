import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {timeline} from '../model.mjs';
const root=new URL('../',import.meta.url),script=JSON.parse(readFileSync(new URL('narration/script.json',root))),timing=JSON.parse(readFileSync(new URL('narration/timing-v9.json',root)));
assert.equal(script.duration,90);assert.equal(script.cues.length,timing.cues.length);
let end=0,speech=0;
for(let i=0;i<script.cues.length;i++){
 const c=script.cues[i],actual=timing.cues[i];assert.ok(c.start>=end&&c.end>c.start&&c.end<=90,'spoken cues must not overlap');assert.equal(actual.text,c.text);assert.equal(actual.start,c.start);assert.ok(actual.speechEnd<=c.end&&actual.speechEnd>c.start);assert.ok(actual.tempo<=1.2,'assistant responses must not be rushed');speech+=actual.speechEnd-c.start;end=c.end;
 if(/割線だね/.test(c.text))assert.ok(timeline(c.start).secant>0,'assistant must wait for the secant to appear');
 if(/二になった/.test(c.text))assert.equal(timeline(c.start).slope,2,'do not announce slope 2 before arriving');
 if(/今度は三/.test(c.text))assert.equal(timeline(c.start).slope,3,'do not announce slope 3 early');
 if(/シーは一/.test(c.text)){assert.ok(c.start>=66);assert.equal(timeline(c.start).c,1)}
 if(/傾きが同じだね/.test(c.text))assert.equal(timeline(c.start).matched,true,'discovery response follows the parallel-line match');
}
assert.ok(speech<60,'reserve at least 30 seconds for pauses and teacher explanation');
console.log(`PASS: ${script.cues.length} assistant cues, ${speech.toFixed(2)}s speech; pauses, gentle pace and graph/equation synchronization`);
