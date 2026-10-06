import {describe,it,expect} from 'vitest'
import {values,tangent,logGap,logSlope} from './math'
describe('exponential inequality',()=>{
 it('has exact equality and horizontal difference tangent at zero',()=>{expect(values(0)).toEqual({exp:1,line:1,gap:0,slope:0});expect(tangent(0,2)).toBe(0)})
 it('has positive gap on both sides and correct derivative signs',()=>{for(const x of [-3,-1,-.01,.01,1,4]){expect(values(x).gap).toBeGreaterThan(0);expect(Math.sign(values(x).slope)).toBe(Math.sign(x));expect(values(x).exp-values(x).line).toBeCloseTo(values(x).gap,12)}})
 it('derivative matches numerical rate of change and tangent passes through point',()=>{for(const x of [-3,-1,0,1,4]){const h=1e-5;expect((values(x+h).gap-values(x-h).gap)/(2*h)).toBeCloseTo(values(x).slope,6);expect(tangent(x,x)).toBe(values(x).gap)}})
 it('log proof has correct base point and positive derivative',()=>{expect(logGap(0)).toBe(0);for(const x of [.01,1,4]){expect(logGap(x)).toBeGreaterThan(0);expect(logSlope(x)).toBeGreaterThan(0);expect(logSlope(x)).toBeCloseTo(1-1/(1+x),12)}})
})
