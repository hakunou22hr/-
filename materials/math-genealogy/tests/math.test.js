import {test} from 'vitest';
import assert from 'node:assert/strict';
import katex from 'katex';
import {concepts,connections,byId,chapters,relations} from '../src/data.js';
import {quadratic,f,df,area,midpoint,choose,binomial,correlation,secantCircle} from '../src/math.js';
import {createModelState,renderModel,modelControls,toss,sample} from '../src/models.js';
test('quadratic roots satisfy the polynomial, including conjugate imaginary roots',()=>{for(const c of [-2,-1,0,.01,1,2])for(const z of quadratic(c).roots){assert.ok(Math.abs(z.re*z.re-z.im*z.im+c)<1e-12);assert.ok(Math.abs(2*z.re*z.im)<1e-12);}});
test('derivative matches a central difference on the plotted cubic',()=>{for(const x of [-1.8,-1,0,1,1.8])assert.ok(Math.abs((f(x+1e-5)-f(x-1e-5))/2e-5-df(x))<1e-7);});
test('area derivative matches integrand; midpoint sums converge to exact integral',()=>{assert.equal(area(0),0);assert.ok(Math.abs(area(4)-28/3)<1e-12);let err=Infinity;for(const n of [4,8,20,100]){const next=Math.abs(midpoint(n)-area(4));assert.ok(next<err);err=next;}assert.ok(err<.001);});
test('secant products are invariant for moving external points',()=>{for(const px of [-3.7,-3,-1.9])for(const py of [-.5,0,.5]){const angle=Math.atan2(-py,-px);for(const d of [-.25,.05,.2]){const q=secantCircle(px,py,angle+d);assert.ok(q);assert.ok(Math.abs(q.product-(px*px+py*py-1.6**2))<1e-12);}}});
test('combination, Pascal and binomial distributions preserve totals and moments',()=>{assert.equal(choose(7,3),35);for(let n=1;n<=8;n++){for(let k=0;k<=n;k++)assert.equal(choose(n,k),choose(n-1,k-1)+choose(n-1,k));}for(const n of [4,10,20,50]){const p=binomial(n);assert.ok(Math.abs(p.reduce((a,b)=>a+b,0)-1)<1e-10);assert.ok(Math.abs(p.reduce((a,b,k)=>a+k*b,0)-n/2)<1e-10);assert.ok(Math.abs(p.reduce((a,b,k)=>a+(k-n/2)**2*b,0)-n/4)<1e-9);}});
test('correlation handles positive, negative and degenerate samples',()=>{assert.equal(correlation([[0,0],[1,1],[2,2]]),1);assert.equal(correlation([[0,2],[1,1],[2,0]]),-1);assert.equal(correlation([[1,1],[1,2]]),null);});
test('simulated experiments sum to actual trial count; samples come from population',()=>{const s=createModelState();for(const n of [4,10,20,50]){s.tossN=n;s.trials=0;s.counts=[];toss(s,1000);assert.equal(s.counts.reduce((a,b)=>a+b,0),1000);assert.equal(s.trials,1000);}sample(s);assert.equal(s.sample.length,30);assert.ok(s.sample.every(x=>s.population.includes(x)));});
test('all data references are valid; required course topics have incoming and outgoing links',()=>{assert.equal(new Set(concepts.map(c=>c.id)).size,concepts.length);assert.equal(new Set(connections.map(e=>e.id)).size,connections.length);for(const e of connections){assert.ok(byId[e.from]);assert.ok(byId[e.to]);assert.ok(relations[e.relation]);assert.ok(e.explanation.length>10);}for(const c of chapters)assert.ok(c.path.every(id=>byId[id]));const core=['algebra','logic','quadratic','measurement','analysis','counting','probability','geometry','human','expressions','binomial-theorem','complex','analytic-geometry','trig','exponential','log','derivative','integral','sequence','inference','society','limit','advanced-derivative','advanced-integral','vector','curves','complex-plane','representation'];for(const id of core){assert.ok(connections.some(e=>e.to===id),id+' must have a predecessor');assert.ok(connections.some(e=>e.from===id),id+' must have a development');}});
test('every concept formula renders in KaTeX without parse errors',()=>{for(const c of concepts)assert.doesNotThrow(()=>katex.renderToString(c.formula,{throwOnError:true}),c.id);});
test('all dynamic models produce finite geometry and renderable mathematical expressions',()=>{const models=[...new Set(concepts.map(c=>c.model))];for(const model of models){const s=createModelState();if(model==='counting'||model==='binomial')s.n=4;for(const t of [0,1,8,20])for(const auto of [true,false]){const result=renderModel(model,s,t,auto);assert.ok(!/NaN|Infinity|undefined/.test(result.svg),model);if(result.formula)assert.doesNotThrow(()=>katex.renderToString(result.formula,{throwOnError:true}),model);assert.ok(modelControls(model,s));}}});

test('pulsing changes glow geometry while preserving mathematical point positions',()=>{
 const s=createModelState();s.theta=90;
 const a=renderModel('circle',s,0,false,{phase:0,pulse:true});
 const b=renderModel('circle',s,0,false,{phase:1,pulse:true});
 const coords=svg=>[...svg.matchAll(/c[xy]="([^"]+)"/g)].map(m=>m[0]);
 assert.deepEqual(coords(a.svg),coords(b.svg));assert.notEqual(a.svg,b.svg);
 assert.equal(a.formula,b.formula);assert.match(a.insight,/1.000/);
 const calm1=renderModel('circle',s,0,false,{phase:0,pulse:false});
 const calm2=renderModel('circle',s,0,false,{phase:2,pulse:false});
 assert.equal(calm1.svg,calm2.svg);
});
test('key models expose the expected direct manipulation and linked highlighting targets',()=>{
 const cases=[['circle',['angle'],['cos','sin','point']],['quadratic',['quadratic-c'],['vertex','roots']],['derivative',['derivative-p','derivative-q'],['secant','tangent','point']],['integral',['integral-x'],['area','point']],['vector',['vector-angle'],['point']]];
 for(const [model,handles,parts]of cases){const result=renderModel(model,createModelState(),0,false);for(const handle of handles)assert.ok(result.svg.includes(`data-drag="${handle}"`),model+' '+handle);for(const part of parts)assert.ok(result.svg.includes(`data-part="${part}"`),model+' '+part);assert.ok(result.insight.length>10);}
});

test('new models preserve numerical examples and valid formulas',()=>{const s=createModelState();assert.match(renderModel('euclid',s,0,false).caption,/最大公約数 = 6/);assert.match(renderModel('normal',s,0,false).caption,/68.27%/);assert.match(renderModel('series',s,0,false).caption,/極限 2.0000/);for(const model of ['natural','normal','series','euclid']){const out=renderModel(model,s,0,false);assert.doesNotThrow(()=>katex.renderToString(out.formula,{throwOnError:true}));assert.ok(!/NaN|Infinity/.test(out.svg));}s.curve='hyperbola';assert.doesNotThrow(()=>katex.renderToString(renderModel('curve',s,0,false).formula,{throwOnError:true}));});
