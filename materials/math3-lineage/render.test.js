import {it,expect,vi} from 'vitest';
import {Renderer,parameters} from './render.js';
import {scenes,links} from './scenes.js';
it('preserves a usable renderer when Canvas initialization fails',()=>{vi.stubGlobal('matchMedia',()=>({matches:false}));vi.stubGlobal('navigator',{hardwareConcurrency:8});const r=new Renderer({getContext(){throw new Error('unavailable')}});expect(r.g).toBeNull();expect(()=>r.frame(scenes[0],0,{})).not.toThrow();vi.unstubAllGlobals()});
it('all 30 scenes and their geometric transitions draw finite coordinates',()=>{
 vi.stubGlobal('matchMedia',()=>({matches:false}));vi.stubGlobal('navigator',{hardwareConcurrency:8});vi.stubGlobal('devicePixelRatio',1);
 const coords=[];const record=(...a)=>{for(const v of a)if(typeof v==='number'){expect(Number.isFinite(v)).toBe(true);coords.push(v)}};
 const g={save(){},restore(){},setLineDash(){},beginPath(){},closePath(){},stroke(){},fill(){},measureText(t){return{width:t.length*14}},setTransform:record,clearRect:record,translate:record,scale:record,arc:record,moveTo:record,lineTo:record,fillRect:record,strokeRect:record,fillText:(text,...a)=>record(...a)};
 const canvas={getContext:()=>g,getBoundingClientRect:()=>({width:1200,height:675,left:0,top:0})};
 const r=new Renderer(canvas);r.resize();for(let i=0;i<scenes.length;i++)for(const p of [0,.3,.6,.95,1])r.frame(scenes[i],p,{explore:false,u:.5,frequency:1,phase:0,time:21*(i+p),yaw:-.45,pitch:.32,zoom:1,links,next:scenes[i+1]});
 expect(coords.length).toBeGreaterThan(10000);
 for(const i of [6,16,25,28,29])for(const u of [0,.5,1]){const q=parameters(scenes[i],.5,true,u,2.3,.4);expect(Number.isFinite(q.angle)).toBe(true);r.frame(scenes[i],.5,{explore:true,u,frequency:2.3,phase:.4,time:0,yaw:1,pitch:-1,zoom:1.8,links})}
 vi.unstubAllGlobals();
});
