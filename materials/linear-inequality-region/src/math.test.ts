import {describe,expect,it} from 'vitest'
import {INEQUALITIES,advancePingPong,commonPolygon,extrema,feasibleVertices,satisfies} from './math'
describe('連立不等式の領域',()=>{
 it('扱う4式と境界式を保持する',()=>{
  expect(INEQUALITIES.map(({label,boundary,a,b,c})=>({label,boundary,a,b,c}))).toEqual([
   {label:'x ≧ 0',boundary:'x = 0',a:-1,b:0,c:0},
   {label:'y ≧ 0',boundary:'y = 0',a:0,b:-1,c:0},
   {label:'2x + y ≦ 8',boundary:'2x + y = 8',a:2,b:1,c:8},
   {label:'2x + 3y ≦ 12',boundary:'2x + 3y = 12',a:2,b:3,c:12},
  ])
 })
 it('x≧0 は右側を採用する',()=>{expect(satisfies({x:1,y:-5},INEQUALITIES[0])).toBe(true);expect(satisfies({x:-1,y:5},INEQUALITIES[0])).toBe(false)})
 it.each([1,2,3,4])('%i条件の共通領域を計算できる',n=>{const p=commonPolygon(INEQUALITIES.slice(0,n));expect(p.length).toBeGreaterThanOrEqual(3);expect(p.every(v=>INEQUALITIES.slice(0,n).every(q=>satisfies(v,q)))).toBe(true)})
 it('4条件の実頂点と最大・最小を求める',()=>{const v=feasibleVertices(INEQUALITIES),e=extrema(v)!;expect(v).toHaveLength(4);expect(v).toContainEqual({x:3,y:2});expect(e.min).toEqual({x:0,y:0});expect(e.max).toEqual({x:3,y:2});expect(e.max.x+e.max.y).toBe(5)})
 it('kの自動移動は端で折り返す',()=>{const upper=advancePingPong(17.9,1,.2,-4,18),lower=advancePingPong(-3.9,-1,.2,-4,18);expect(upper.direction).toBe(-1);expect(upper.value).toBeCloseTo(17.9);expect(lower.direction).toBe(1);expect(lower.value).toBeCloseTo(-3.9)})
})
