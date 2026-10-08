import {describe,it,expect} from 'vitest';import {measure,degToRad,radToDeg,piLabel,parseNumber,exercises} from './math.js';
describe('弧度法の数学',()=>{
 it('1radで弧と半径が等しく、半径変更でも角度が一定',()=>{for(const r of [1,2,3]){const m=measure(radToDeg(1),r);expect(m.length).toBeCloseTo(r);expect(m.length/r).toBeCloseTo(1);}});
 it('基準角と換算の往復',()=>{for(const d of [0,30,45,60,90,180,210,240,270,330,360,540,720])expect(radToDeg(degToRad(d))).toBeCloseTo(d);expect(piLabel(210)).toBe('7π/6');expect(piLabel(720)).toBe('4π');});
 it('周回後も累積角・弧長が増える',()=>{const a=measure(360,2),b=measure(720,2);expect(b.x).toBeCloseTo(a.x);expect(b.y).toBeCloseTo(a.y);expect(b.length).toBeCloseTo(2*a.length);expect(b.laps).toBe(2);});
 it('半径10・π/6の資料例と半径2倍の面積',()=>{const m=measure(30,10);expect(m.length).toBeCloseTo(5*Math.PI/3);expect(m.area).toBeCloseTo(25*Math.PI/3);expect(measure(30,2).area).toBeCloseTo(4*measure(30,1).area);});
 it('換算練習の答えを検証',()=>exercises.forEach(q=>expect(q.unit==='°'?q.answer:q.answer*180).toBeCloseTo(q.deg)));
 it('分数を受け付け、空・不正・ゼロ除算を拒否',()=>{expect(parseNumber('7/6')).toBeCloseTo(7/6);for(const s of ['', '1/0','/2','NaN','1/2/3'])expect(parseNumber(s)).toBeNull();});
});
