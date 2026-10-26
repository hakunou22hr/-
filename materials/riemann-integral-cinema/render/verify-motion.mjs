import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {writeFile,mkdir} from 'node:fs/promises';
import {stateAt} from '../timeline.js';
import {drawWorld,createFormulaTargets} from '../world.js';
const require=createRequire(import.meta.url),{createCanvas,GlobalFonts}=require('@napi-rs/canvas');
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','Noto Sans CJK JP');GlobalFonts.registerFromPath('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf','DejaVu Sans');
const results=[];
for(const portrait of [false,true]){
 const W=portrait?540:960,H=portrait?960:540,c=createCanvas(W,H),ctx=c.getContext('2d'),formulaTargets=createFormulaTargets(createCanvas,W,H,portrait),times=portrait?[1,5,9,13,17,21,24,27,29]:[1,8,16,24,33,42,51,58,65,73,80,86,90,96,101,106,109,114,118];
 const draw=t=>{drawWorld(ctx,W,H,stateAt(t,portrait),{formulaTargets});return Buffer.from(c.data())};
 for(const t of times){const a=draw(t),again=draw(t);assert.equal(createHash('sha256').update(a).digest('hex'),createHash('sha256').update(again).digest('hex'));const b=draw(t+.5);let changed=0,bg=0,bgCount=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const idx=(y*W+x)*4,diff=Math.abs(a[idx]-b[idx])+Math.abs(a[idx+1]-b[idx+1])+Math.abs(a[idx+2]-b[idx+2]);if(diff>3)changed++;if(x>W*.82&&y>H*.25&&y<H*.65){bgCount++;if(diff>3)bg++}}assert.ok(changed/(W*H)>.001,`Frozen full frame at ${t}`);assert.ok(bg/bgCount>.0001,`Frozen background at ${t}`);results.push({portrait,time:t,changedFraction:changed/(W*H),backgroundChangedFraction:bg/bgCount,deterministic:true})}
}
for(let i=1;i<=6;i++){const t=50+i*22/7,a=stateAt(t-.02),b=stateAt(t+.02);assert.equal(b.n,a.n*2);assert.equal(b.data.dx,a.data.dx/2);assert.equal(b.gridLevel,a.gridLevel*2);assert.notEqual(b.yaw,a.yaw);assert.notEqual(b.data.sum,a.data.sum)}
await mkdir('work/riemann',{recursive:true});await writeFile('work/riemann/motion-validation.json',JSON.stringify({passed:true,samplePairs:results.length,partitionTransitionsChecked:6,results},null,2));console.log('Deterministic motion, moving backgrounds and all six partition transitions passed');
