import {describe,it,expect} from 'vitest';
import {outcomes} from './math.js';
import {extractionPositions,MIN_SEPARATION} from './motion.js';
const homes=Array.from({length:12},(_,i)=>{const layer=i<4?0:i<9?1:2,j=layer===0?i:layer===1?i-4:i-9,n=[4,5,3][layer],t=j/n*Math.PI*2+.4*layer;return [Math.cos(t)*[.75,.85,.65][layer],[.5,1.14,1.8][layer],Math.sin(t)*[.75,.85,.65][layer]];});
describe('3球の同時取り出し経路',()=>{
 it('全220組の途中でも球同士が接触しない',()=>{
  for(const ids of outcomes)for(let step=0;step<=100;step++){
   const p=extractionPositions(ids.map(id=>homes[id]),step/100,[.842,0,-.539]);
   for(let a=0;a<3;a++)for(let b=a+1;b<3;b++)expect(Math.hypot(...p[a].map((v,k)=>v-p[b][k]))).toBeGreaterThanOrEqual(MIN_SEPARATION-1e-5);
  }
 });
 it('口を通る瞬間も3個を別々の位置に置く',()=>{const p=extractionPositions(homes.slice(0,3),.52);expect(p.map(v=>v[0])).toEqual([-.8,0,.8]);expect(p.every(v=>v[1]===3.6)).toBe(true);});
 it('最終位置は1.1間隔の3個の並び',()=>expect(extractionPositions(homes.slice(0,3),1)).toEqual([[-1.1,3.25,1.8],[0,3.25,1.8],[1.1,3.25,1.8]]));
});
