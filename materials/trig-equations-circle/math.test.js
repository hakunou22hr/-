import {describe,it,expect} from 'vitest';
import {problems,values,satisfies,collisionSolution} from './math.js';
describe('一般の円の三角方程式',()=>{
 it('全解が元の方程式を満たし、範囲内に他の整数角の解がない',()=>{problems.forEach((p,i)=>{p.solutions.forEach(a=>expect(satisfies(i,a)).toBe(true));for(let a=0;a<=180;a++)expect(satisfies(i,a)).toBe(p.solutions.includes(a));});});
 it('問題2の半径√2は交点(±1,1)を与える',()=>{for(const [a,x] of [[45,1],[135,-1]]){const v=values(a,Math.SQRT2);expect(v.x).toBeCloseTo(x);expect(v.y).toBeCloseTo(1);}});
 it('半径変更でも条件線と円の交点の角度は一定',()=>{for(const r of [1,Math.SQRT2,2,3])problems.forEach(p=>p.solutions.forEach(a=>{const v=values(a,r);expect(v.x*v.x+v.y*v.y).toBeCloseTo(r*r);if(p.kind==='sin')expect(v.y).toBeCloseTo(r*p.a);if(p.kind==='cos')expect(v.x).toBeCloseTo(r*p.a);if(p.kind==='tan')expect(v.y/v.x).toBeCloseTo(p.a);}));});
 it('補角はxが反転しyが一致する',()=>{for(const a of [0,20,30,90,150,180]){const p=values(a,2),q=values(180-a,2);expect(q.x).toBeCloseTo(-p.x);expect(q.y).toBeCloseTo(p.y);}});
 it('90°のtanを未定義にする',()=>expect(values(90,2).tan).toBeNull());
});

describe('画面上の点の重なり',()=>{
 it('正確な解だけでなく、見た目が重なる45.5°でも強調する',()=>{expect(collisionSolution(1,45.5,Math.SQRT2)).toBe(45);expect(satisfies(1,45.5)).toBe(false);});
 it('離れた点は強調せず、両方の交点を検出する',()=>{expect(collisionSolution(1,60,Math.SQRT2)).toBeUndefined();expect(collisionSolution(1,135,Math.SQRT2)).toBe(135);});
 it('全問題で解に到達した点を検出する',()=>{problems.forEach((p,i)=>p.solutions.forEach(a=>expect(collisionSolution(i,a,p.r)).toBe(a)));});
});
