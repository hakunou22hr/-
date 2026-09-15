import {describe,expect,it} from 'vitest'
import {polygonMetrics,type Sides} from './polygonMath'
describe('regular polygon area',()=>{it.each([[5,1.72048],[6,2.59808],[7,3.63391],[8,4.82843],[9,6.18182],[10,7.69421]] as [Sides,number][])('正%d角形', (n,expected)=>expect(polygonMetrics(n).area).toBeCloseTo(expected,4));it('derives area from n congruent triangles',()=>{const m=polygonMetrics(8);expect(m.triangleArea*8).toBeCloseTo(m.area,10)})})
