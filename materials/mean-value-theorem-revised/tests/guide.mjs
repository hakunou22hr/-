import assert from 'node:assert/strict';import {guideState} from '../guide.mjs';import {timeline} from '../model.mjs';
for(const t of [0,3,11.99,84,88,90])assert.equal(guideState(t).visible,false);
for(const t of [13,20,48,70,78,83]){const s=guideState(t);assert.equal(s.visible,true);assert.ok(s.activity>=0&&s.activity<=1);assert.ok(s.bounds.x>1500);assert.ok(s.bounds.y+s.bounds.height<958);assert.equal(timeline(t).kind,'square')}
assert.ok(guideState(48).bounds.width>=300);assert.ok(guideState(48).bounds.height>=300);
assert.notEqual(guideState(48).angle,guideState(48.5).angle);assert.equal(guideState(48,{calm:true}).angle,guideState(49,{calm:true}).angle);assert.equal(guideState(48,{calm:true}).activity,guideState(49,{calm:true}).activity);assert.ok(guideState(47).accent>guideState(46.9).accent);console.log('PASS: narrator visibility, caption clearance, deterministic rotation, cue response and reduced-motion state');
