import {describe,expect,it} from 'vitest'
import {INEQUALITIES,advancePingPong,commonPolygon,extrema,feasibleVertices,satisfies} from './math'
describe('連立不等式の領域②',()=>{
 it('指定された4式と境界式を正しい係数で保持する',()=>{
  expect(INEQUALITIES.map(({label,boundary,a,b,c})=>({label,boundary,a,b,c}))).toEqual([
   {label:'x ≧ 0',boundary:'x = 0',a:-1,b:0,c:0},
   {label:'y ≧ 0',boundary:'y = 0',a:0,b:-1,c:0},
   {label:'3x + y ≦ 9',boundary:'3x + y = 9',a:3,b:1,c:9},
   {label:'x + 2y ≦ 8',boundary:'x + 2y = 8',a:1,b:2,c:8},
  ])
 })
 it('x≧0 は右側だけを領域に含める',()=>{expect(satisfies({x:1,y:-5},INEQUALITIES[0])).toBe(true);expect(satisfies({x:-1,y:5},INEQUALITIES[0])).toBe(false)})
 it.each([1,2,3,4])('%i条件の共通領域を計算できる',n=>{const selected=INEQUALITIES.slice(0,n),p=commonPolygon(selected);expect(p.length).toBeGreaterThanOrEqual(3);expect(p.every(v=>selected.every(q=>satisfies(v,q)))).toBe(true)})
 it('交点から4条件の頂点を動的に求める',()=>{expect(feasibleVertices(INEQUALITIES)).toEqual(expect.arrayContaining([{x:0,y:0},{x:3,y:0},{x:2,y:3},{x:0,y:4}]))})
 it('2x+yの最小値0と最小点(0,0)を求める',()=>{const e=extrema(feasibleVertices(INEQUALITIES))!;expect(e.min).toEqual({x:0,y:0});expect(2*e.min.x+e.min.y).toBe(0)})
 it('2x+yの最大値7と最大点(2,3)を求める',()=>{const e=extrema(feasibleVertices(INEQUALITIES))!;expect(e.max).toEqual({x:2,y:3});expect(2*e.max.x+e.max.y).toBe(7)})
 it('kの自動移動は上下端で折り返す',()=>{const upper=advancePingPong(17.9,1,.2,-4,18),lower=advancePingPong(-3.9,-1,.2,-4,18);expect(upper.value).toBeCloseTo(17.9);expect(upper.direction).toBe(-1);expect(lower.value).toBeCloseTo(-3.9);expect(lower.direction).toBe(1)})
})
