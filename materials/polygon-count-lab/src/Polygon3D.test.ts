import {describe,expect,it} from 'vitest'
import * as THREE from 'three'
import {createTriangleRenderData,SHARED_EDGE_ORANGE,TRIANGLE_GOLD} from './Polygon3D'

const decagonPoints=Array.from({length:10},(_,i)=>{
 const angle=-Math.PI/2+i*2*Math.PI/10
 return new THREE.Vector3(2.25*Math.cos(angle),0,2.25*Math.sin(angle))
})

describe('3D active triangle render data',()=>{
 it('uses the dedicated gold palette for triangle edges, cores, glows and fills',()=>{
  expect(TRIANGLE_GOLD).toEqual({main:'#FFD54A',core:'#FFF4B0',glow:'#FFB300',fill:'#FFC107'})
  expect(SHARED_EDGE_ORANGE).toEqual({main:'#FF6B3D',core:'#FFF4B0',glow:'#FF8A00'})
 })
 it.each([[[0,1,3],'0-1-3'],[[2,4,5],'2-4-5']] as const)('derives vertices, all three edges and fill from %j',(vertices,key)=>{
  const data=createTriangleRenderData([...vertices],decagonPoints)
  expect(data.key).toBe(key)
  expect(data.edges).toEqual([[vertices[0],vertices[1]],[vertices[1],vertices[2]],[vertices[2],vertices[0]]])
  expect(data.shapePoints).toEqual(vertices.map(i=>[decagonPoints[i].x,-decagonPoints[i].z]))
 })
 it('does not retain a triangle for a partial selection',()=>{
  expect(createTriangleRenderData([0,1],decagonPoints)).toEqual({triangle:null,key:null,edges:[],shapePoints:[]})
 })
})
