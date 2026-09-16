import {describe,expect,it} from 'vitest'
import {filterMaterials,type Material} from './materials'
import { materials } from './materials'
const list:Material[]=[{id:'trig',name:'単位円と三角比',subject:'数学Ⅰ',unit:'三角比',description:'角度を調べる'},{id:'set',name:'集合・ベン図',subject:'数学Ⅰ',unit:'集合',description:'共通部分'},{id:'region',name:'連立不等式と領域',subject:'数学Ⅱ',unit:'図形と方程式',description:'領域を調べる'}]
describe('portal filters',()=>{it('filters by subject',()=>expect(filterMaterials(list,'数学Ⅱ','').map(x=>x.id)).toEqual(['region']));it('filters the combined set category',()=>expect(filterMaterials(list,'集合・命題','')).toHaveLength(1));it('searches all metadata in real time',()=>expect(filterMaterials(list,'すべて','領域').map(x=>x.id)).toEqual(['region']));it('normalizes middle dots and spaces',()=>expect(filterMaterials(list,'すべて','集合 ベン図')).toHaveLength(1))})

describe('material catalog',()=>{
  it('loads material metadata files',()=>expect(materials.length).toBeGreaterThan(0))
  it('contains the preserved regular polygon lesson',()=>expect(materials.some(x=>x.id==='regular-polygon-area')).toBe(true))
  it('has unique ids and complete card metadata',()=>{
    expect(new Set(materials.map(x=>x.id)).size).toBe(materials.length)
    materials.forEach(material=>expect([material.name,material.subject,material.unit,material.description].every(Boolean)).toBe(true))
  })
})
