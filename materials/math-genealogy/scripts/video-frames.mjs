import {concepts,byId,connections,subjects} from '../src/data.js';
import {tourIds,sceneSeconds,routeBetween,demoState} from '../src/tour.js';
import {createModelState,renderModel,toss,sample} from '../src/models.js';
const fps=12;console.log(JSON.stringify({type:'meta',fps,seconds:tourIds.length*sceneSeconds,concepts,connections,subjects,ids:tourIds}));
for(let index=0;index<tourIds.length;index++){
const c=byId[tourIds[index]],s=createModelState(),route=routeBetween(tourIds[index-1],c.id);if(['counting','binomial'].includes(c.model))s.n=4;if(c.model==='statistics')sample(s);
for(let frame=0;frame<fps*sceneSeconds;frame++){const t=frame/fps;Object.assign(s,demoState(c.model,t));if(c.model==='probability'&&frame%fps===0)toss(s,100);if(c.model==='statistics'&&frame===fps*3)sample(s);const result=renderModel(c.model,s,t*2.8,false,{phase:index*sceneSeconds+t,pulse:true});console.log(JSON.stringify({type:'frame',index,t,route,svg:result.svg,caption:result.caption,state:s}));}
}
