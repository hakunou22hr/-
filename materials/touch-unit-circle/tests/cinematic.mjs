import assert from 'node:assert/strict';import {cinematicCue,cinematicModes} from '../renderer.mjs';
assert.equal(cinematicModes.length,5);assert.equal(cinematicCue({stage:0,t:0,film:true}).current,'vortex');
const a=cinematicCue({stage:1,t:25,film:true});assert.equal(a.previous,'vortex');assert.equal(a.current,'warp');assert.equal(a.blend,0);
assert.ok(Math.abs(cinematicCue({stage:1,t:26.4,film:true}).blend-.5)<1e-10);assert.equal(cinematicCue({stage:1,t:28,film:true}).blend,1);
assert.equal(cinematicCue({stage:4,t:96,film:true}).current,'horizon');assert.equal(cinematicCue({stage:5,t:120,film:true}).current,'sphere');assert.equal(cinematicCue({stage:6,t:150,film:true}).current,'arches');
for(const atmosphere of cinematicModes){assert.equal(cinematicCue({stage:5,t:120,film:false,atmosphere}).current,atmosphere);assert.equal(cinematicCue({stage:5,t:120,film:true,atmosphere}).current,'sphere')}
console.log('Five modes, film timeline, smooth midpoint and manual selection: passed');
