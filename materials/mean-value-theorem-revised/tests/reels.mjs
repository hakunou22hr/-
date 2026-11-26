import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {reelState,reelGuide,reelSpeech} from '../reels.mjs';
const report=JSON.parse(readFileSync(new URL('../narration/reels-timing.json',import.meta.url))),script=JSON.parse(readFileSync(new URL('../narration/reels-script.json',import.meta.url)));
assert.equal(script.duration,30);assert.equal(report.duration,30);let end=0;
for(const cue of report.cues){assert.ok(cue.start>=end&&cue.speechEnd<=cue.end&&cue.end<=30);assert.ok(cue.tempo<=1.2);end=cue.end;if(/同じだね/.test(cue.text))assert.equal(reelState(cue.start).math.exact,true)}
for(const [t,slope] of [[11.5,1],[14,2],[16,3],[19,2]])assert.equal(reelState(t).math.slope,slope);
assert.equal(reelState(17.5).math.matched,false);assert.equal(reelState(19).math.matched,true);
let previous=-1,voiced=0;for(let t=0;t<30;t+=1/60){const r=reelState(t),g=reelGuide(t);assert.ok(r.stage>=previous);previous=r.stage;assert.equal(r.math.sec,2);assert.equal(g.scale,1);assert.ok(g.bounds.x>625&&g.bounds.x+g.bounds.width<975&&g.bounds.y>450&&g.bounds.y+g.bounds.height<1650);if(reelSpeech(t)>.1)voiced++}
assert.ok(voiced>300);assert.ok(reelGuide(9).y<700&&reelGuide(14).y>1400&&reelGuide(28).y<700);
console.log('PASS: 30s timeline, measured ratio, slopes 1→2→3, parallel match before announcement, constant-size safe guide and timed assistant voice');
