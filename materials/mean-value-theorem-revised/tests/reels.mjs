import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {reelState,reelGuide,reelSpeech,reelCamera} from '../reels.mjs';
const report=JSON.parse(readFileSync(new URL('../narration/reels-timing.json',import.meta.url))),script=JSON.parse(readFileSync(new URL('../narration/reels-script.json',import.meta.url)));
assert.equal(script.duration,30);assert.equal(report.duration,30);let end=0;
for(const cue of report.cues){assert.ok(cue.start>=end&&cue.speechEnd<=cue.end&&cue.end<=30);assert.ok(cue.tempo<=1.2);end=cue.end;if(/同じだね/.test(cue.text))assert.equal(reelState(cue.start).math.exact,true)}
for(const [t,slope] of [[11.5,1],[14,2],[16,3],[19,2]])assert.equal(reelState(t).math.slope,slope);
assert.equal(reelState(17.5).math.matched,false);assert.equal(reelState(19).math.matched,true);
let previous=-1,voiced=0;for(let t=0;t<30;t+=1/60){const r=reelState(t),g=reelGuide(t);assert.ok(r.stage>=previous);previous=r.stage;assert.equal(r.math.sec,2);assert.equal(g.scale,1);assert.ok(g.bounds.x>600&&g.bounds.x+g.bounds.width<1000&&g.bounds.y>35&&g.bounds.y+g.bounds.height<435);if(reelSpeech(t)>.1)voiced++}
assert.ok(voiced>300);assert.ok([3,9,14,19,25,28].every(t=>Math.abs(reelGuide(t).y-235)<5));
console.log('PASS: 30s timeline, measured ratio, slopes 1→2→3, parallel match before announcement, constant-size safe guide and timed assistant voice');

for(const t of [9.8,19.5,25.3]){const camera=reelCamera(t);assert.ok(camera.zoom>=1.7);assert.equal(camera.sx,camera.sy)}assert.equal(reelCamera(29).zoom,1.4);for(const t of [19.5,25.3]){const r=reelState(t),camera=reelCamera(t),x=camera.x+camera.sx*r.math.c,y=camera.y-camera.sy*r.math.f(r.math.c);assert.ok(x>40&&x<650&&y>435&&y<1450,'close-up must retain its mathematical focus')}console.log('PASS: upper-right guide, uniform close-ups and visible point of tangency');

assert.equal(reelGuide(19.5).hideLabel,true);assert.equal(reelGuide(19.5).flareBoost,0);

assert.equal(reelGuide(19.5).noFlare,true);for(const t of [0,1,3.8,4.9]){assert.equal(reelState(t).explanationVisible,false);assert.equal(reelSpeech(t),0);assert.equal(reelGuide(t).visible,false)}assert.equal(reelState(5).explanationVisible,true);
