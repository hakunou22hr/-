import assert from 'node:assert/strict';import {cinematicCue,cinematicModes,cinematicReadability} from '../renderer.mjs';
assert.equal(cinematicModes.length,6);assert.ok(cinematicModes.includes('meteors'));
for(let stage=0;stage<8;stage++)assert.equal(cinematicCue({stage,t:stage*25,film:true}).current,'meteors');
for(const atmosphere of cinematicModes){assert.equal(cinematicCue({stage:5,t:120,film:false,atmosphere}).current,atmosphere);assert.equal(cinematicCue({stage:5,t:120,film:true,atmosphere}).current,'meteors')}
assert.equal(cinematicReadability({stage:3,t:70,film:true}),.68);assert.ok(Math.abs(cinematicReadability({stage:3,t:71.4,film:true})-.84)<1e-10);assert.equal(cinematicReadability({stage:3,t:73,film:true}),1);
console.log('Six modes, continuous automatic meteors, smooth exposure and manual selection: passed');
