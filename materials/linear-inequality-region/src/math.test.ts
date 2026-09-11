import {describe,expect,it} from 'vitest'
import {INEQUALITIES,commonPolygon,extrema,feasibleVertices,satisfies} from './math'
describe('連立不等式の領域',()=>{
 it('x≧0 は右側を採用する',()=>{expect(satisfies({x:1,y:-5},INEQUALITIES[0])).toBe(true);expect(satisfies({x:-1,y:5},INEQUALITIES[0])).toBe(false)})
 it.each([1,2,3,4])('%i条件の共通領域を計算できる',n=>{const p=commonPolygon(INEQUALITIES.slice(0,n));expect(p.length).toBeGreaterThanOrEqual(3);expect(p.every(v=>INEQUALITIES.slice(0,n).every(q=>satisfies(v,q)))).toBe(true)})
 it('4条件の実頂点と最大・最小を求める',()=>{const v=feasibleVertices(INEQUALITIES),e=extrema(v)!;expect(v).toHaveLength(4);expect(e.min).toEqual({x:0,y:0});expect(e.max.x+e.max.y).toBeCloseTo(16/3)})
})
