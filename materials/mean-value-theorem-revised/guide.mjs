// Original particle narrator: fixed screen position, deterministic subtitle/event response, no audio input.
import {phase,clamp} from './model.mjs';
export const guideBounds={x:1688,y:754,width:190,height:192};
export function guideState(t,{calm=false}={}){const visible=t>=12&&t<84,angle=calm?0:(t-12)*.66,events=[14,17,22,29,35,41,47,57,60,63,66,69,72,76,80];let accent=0;for(const cue of events){const age=t-cue;if(age>=0&&age<1.3)accent=Math.max(accent,Math.exp(-age*3))}const activity=calm?.45:clamp(.5+.13*Math.sin(t*7)+.1*Math.sin(t*13)+accent*.25);return {visible,angle,activity,accent:calm?0:accent,gold:t>=47&&t<72,opacity:visible?phase(t,12,12.5)*(1-phase(t,83.5,84)):0,bounds:guideBounds};}
