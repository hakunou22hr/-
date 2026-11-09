import {describe,it,expect} from 'vitest';
import {R,r,area,primitive,VOLUME,outerVolume,innerVolume,surfacePoint,surfaceNormal,midpointVolume,filmPose,TAU} from '../src/model';
describe('Example166 exact geometry',()=>{
 it('intersections and endpoint annuli',()=>{for(const x of [0,3]){expect(R(x)).toBe(r(x));expect(area(x)).toBe(0)}expect(R(2)).toBe(4)});
 it('ordered radii, equations, normals at 1001 positions',()=>{for(let i=0;i<=1000;i++){const x=3*i/1000,t=i*.071;expect(R(x)).toBeGreaterThanOrEqual(r(x)-1e-12);for(const inner of [false,true]){const p=surfacePoint(x,t,inner),n=surfaceNormal(x,t,inner),rad=inner?r(x):R(x);expect(p[0]).toBe(x);expect(Math.hypot(p[1],p[2])).toBeCloseTo(rad,11);expect(Math.hypot(...n)).toBeCloseTo(1,12);expect(n[1]*Math.cos(t)+n[2]*Math.sin(t)).toBeCloseTo(inner?-1/Math.hypot(1,1):1/Math.hypot(4-2*x,1),12)}}});
 it('integral and subtraction equal108π/5',()=>{expect(Math.PI*(primitive(3)-primitive(0))).toBeCloseTo(VOLUME,12);expect(outerVolume-innerVolume).toBeCloseTo(VOLUME,12);expect(midpointVolume(5000)).toBeCloseTo(VOLUME,5);expect(Math.abs(midpointVolume(64)-VOLUME)).toBeLessThan(Math.abs(midpointVolume(8)-VOLUME))});
 it('sweep grows continuously and end section vanishes',()=>{let last=0;for(let t=12;t<=30;t+=.05){const a=filmPose(t).angle;expect(a).toBeGreaterThanOrEqual(last);last=a}expect(filmPose(12).angle).toBe(0);expect(filmPose(30).angle).toBe(TAU);expect(filmPose(45).cut).toBe(0);expect(filmPose(59.999).cut).toBeCloseTo(3,5);expect(filmPose(90).scene).toBe(5)});
});
