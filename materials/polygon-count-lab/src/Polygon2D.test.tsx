import {renderToStaticMarkup} from 'react-dom/server'
import {describe,expect,it} from 'vitest'
import {Polygon2D} from './App'
import {diagonalKey,diagonals,type Pair} from './math'

const noop=()=>undefined
function render(active:Pair,completed=new Set<string>(),showAll=false){
 return renderToStaticMarkup(<Polygon2D n={10} mode="diag" current={active} activePair={active} activeTriple={null} showAll={showAll} completedDiagonalKeys={completed} manual={false} base={null} picked={[]} onVertex={noop} onEdge={noop} onDiagonal={noop}/>)
}
describe('2D diagonal rendering',()=>{
 it.each([[0,2],[0,3],[0,5],[1,9]] as Pair[])('draws active diagonal %i-%i as a halo and bright line',(a,b)=>{
  const html=render([a,b]);expect(html.match(new RegExp(`data-diagonal="${diagonalKey(a,b)}"`,'g'))).toHaveLength(2)
 })
 it('places polygon, completed, active, vertex and label layers in DOM paint order',()=>{
  const html=render([1,9],new Set(['0-2']));const layers=['polygon-edges','completed-diagonals','active-diagonal','vertices','labels'].map(x=>html.indexOf(`data-layer="${x}"`));expect(layers).toEqual([...layers].sort((a,b)=>a-b));expect(Math.min(...layers)).toBeGreaterThan(-1)
 })
 it('uses the B and J coordinates for both active line elements',()=>{
  const html=render([1,9]);const angle=(i:number)=>-Math.PI/2+i*2*Math.PI/10;const point=(i:number)=>({x:300+220*Math.cos(angle(i)),y:275+220*Math.sin(angle(i))});const b=point(1),j=point(9);const coordinates=`x1="${b.x}" y1="${b.y}" x2="${j.x}" y2="${j.y}"`;expect(html.split(coordinates)).toHaveLength(3)
 })
 it('renders all 35 diagonals while retaining a two-line active highlight',()=>{
  const html=render([1,9],new Set(),true);expect((html.match(/class="diagonal all"/g)||[])).toHaveLength(diagonals(10).length-1);expect((html.match(/data-diagonal="1-9"/g)||[])).toHaveLength(2)
 })
})
