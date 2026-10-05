import{describe,it,expect}from'vitest';import{magnitude,motions,vectorLabelPositions}from'./math'
describe('練習41',()=>{it('(1) t=2',()=>{expect(motions.one.v(2)).toEqual({x:1,y:6});expect(motions.one.a(2)).toEqual({x:0,y:2});expect(magnitude(motions.one.v(2))).toBeCloseTo(Math.sqrt(37))});it('(2) t=2',()=>{expect(motions.two.v(2)).toEqual({x:3,y:4});expect(motions.two.a(2)).toEqual({x:0,y:4});expect(magnitude(motions.two.v(2))).toBe(5)});it('円運動の加速度は中心方向',()=>{expect(motions.circle.a(0).x).toBe(-1);expect(motions.circle.a(0).y).toBeCloseTo(0)})})

describe('vector labels',()=>{
 it('keeps labels separated when all tips coincide',()=>{
  const labels=vectorLabelPositions({x:100,y:100},{x:100,y:100},{x:100,y:100},200,200)
  const points=Object.values(labels)
  for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)
   expect(Math.abs(points[i].x-points[j].x)>=34||Math.abs(points[i].y-points[j].y)>=24).toBe(true)
 })
 it('keeps labels inside the graph near its edges',()=>{
  const labels=vectorLabelPositions({x:198,y:2},{x:205,y:-5},{x:210,y:0},200,200)
  Object.values(labels).forEach(({x,y})=>{expect(x).toBeGreaterThanOrEqual(22);expect(x).toBeLessThanOrEqual(178);expect(y).toBeGreaterThanOrEqual(22);expect(y).toBeLessThanOrEqual(178)})
 })
})
