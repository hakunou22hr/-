import {describe,it,expect} from 'vitest';
import {balls,outcomes,choose,types,matches,patterns,patternKey,sample,conditions} from './math.js';
describe('12個から同時に3個取り出す確率',()=>{
 it('全体は重複・順序なしの220組',()=>{expect(choose(12,3)).toBe(220);expect(outcomes).toHaveLength(220);expect(new Set(outcomes.map(ids=>ids.join(','))).size).toBe(220);outcomes.forEach(ids=>{expect(new Set(ids).size).toBe(3);expect(ids.every(id=>id>=0&&id<12)).toBe(true);});});
 it('白3個・赤4個・黒5個である',()=>{for(const [color,n] of [['W',3],['R',4],['B',5]])expect(balls.filter(b=>b.color===color)).toHaveLength(n);});
 it('3条件は全体を分け尽くし、理論分数が合う',()=>{for(const key of ['different','same','two']){const c=conditions[key],count=outcomes.filter(ids=>matches(ids,key)).length;expect(count).toBe(c.count);expect(count/220).toBeCloseTo(c.fraction[0]/c.fraction[1]);}outcomes.forEach(ids=>expect(['different','same','two'].filter(key=>matches(ids,key))).toHaveLength(1));});
 it('10色パターンは等確率ではなく、個体の選び方を反映する',()=>{for(const p of patterns){const key=p.colors.slice().sort().join('');expect(outcomes.filter(ids=>patternKey(ids)===key)).toHaveLength(p.count);}expect(patterns.reduce((n,p)=>n+p.count,0)).toBe(220);});
 it('抽選は220組のそれぞれを選択可能で、玉は重複しない',()=>{outcomes.forEach((ids,i)=>expect(sample(()=>(i+.5)/220)).toEqual(ids));expect(types([0,3,7])).toBe(3);});
});
