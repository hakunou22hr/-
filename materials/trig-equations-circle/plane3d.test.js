import {describe,it,expect} from 'vitest';
import * as THREE from 'three';
import {buildDiagram} from './plane3d.js';
describe('3D図の実体',()=>{
 it('円の線、半径の管、点の球を画像に依存せず生成する',()=>{
  const points=Array.from({length:65},(_,i)=>[Math.cos(i*Math.PI/32),Math.sin(i*Math.PI/32),0]);
  const group=buildDiagram([{type:'line',points,color:'#65e3e6'},{type:'line',points:[[0,0,0],[1,0,0]],color:'#65e3e6',thick:true},{type:'point',position:[1,0,.06],radius:.07,color:'#ffcf76'}]);
  expect(group.children.filter(x=>x instanceof THREE.Line)).toHaveLength(2);
  expect(group.children.some(x=>x.geometry instanceof THREE.TubeGeometry)).toBe(true);
  const sphere=group.children.find(x=>x.geometry instanceof THREE.SphereGeometry);
  expect(sphere.position.x).toBe(1);
  expect(group.children.every(x=>!x.material.map)).toBe(true);
 });
 it('扇形と発光の輪を生成する',()=>{
  const g=buildDiagram([{type:'sector',points:[[0,0,0],[1,0,0],[0,1,0]],color:'#65e3e6'},{type:'halo',position:[0,1,.01],radius:.13,color:'#ffcf76'}]);
  expect(g.children.some(x=>x.geometry instanceof THREE.ShapeGeometry)).toBe(true);
  expect(g.children.some(x=>x.userData.pulse)).toBe(true);
 });
});
