// Absolute-time, text-aware flight; travel uses a narrow clear lane at the far right.
import {phase,clamp,mix} from './model.mjs';
import {sampleRate,envelope} from './narration/envelope.mjs';
export const guideBounds={x:1578,y:80,width:340,height:875};
// A full-size breathing orbit: all flight phases share the reserved right-hand lane.
const poses=[[12,1748,778,1],[18,1748,778,1],[20.8,1748,252,1],[32,1748,252,1],[34.8,1748,778,1],[41,1748,778,1],[43.8,1748,252,1],[51.5,1748,252,1],[54.3,1748,778,1],[84,1748,778,1]];
export function focusAt(t){
 const f=(id,x,y,width,height)=>({id,x,y,width,height});
 if(t<15)return f('horizontal',1320,251,250,44);
 if(t<20)return f('vertical',1320,367,250,44);
 if(t<23)return f('ratio',1320,360,250,75);
 if(t<27)return f('average-two',1320,360,250,75);
 if(t<31)return f('smaller',1320,691,250,35);
 if(t<37)return f('instant-two',1320,601,190,43);
 if(t<43)return f('larger',1320,691,250,35);
 if(t<50)return f('parallel',1320,481,250,44);
 if(t<57)return f('triangles',1320,603,250,42);
 if(t<60)return f('average-calculation',1320,414,360,68);
 if(t<63)return f('derivative',1320,389,330,55);
 if(t<66)return f('equality',1430,369,270,72);
 if(t<69)return f('c-one',1320,403,300,88);
 if(t<72)return f('existence',1320,721,250,82);
 if(t<76)return f('instant-at-one',1320,581,250,55);
 if(t<80)return f('both-two',1320,616,250,44);
 return f('conditions',1320,318,420,119);
}
export function speechAt(t){const at=Math.max(0,t*sampleRate),i=Math.floor(at);return mix(envelope[i]||0,envelope[i+1]||0,at-i)}
export function guideState(t,{calm=false}={}){
 const visible=t>=12&&t<84,angle=calm?0:(t-12)*.66,events=[14,17,22,29,35,41,47,57,60,63,66,69,72,76,80];let accent=0;
 for(const cue of events){const age=t-cue;if(age>=0&&age<1.3)accent=Math.max(accent,Math.exp(-age*3))}
 let x=1748,y=778,scale=1,moving=false;
 if(!calm){let i=0;while(i<poses.length-2&&t>=poses[i+1][0])i++;const a=poses[i],b=poses[i+1],p=phase(t,a[0],b[0]);x=mix(a[1],b[1],p);y=mix(a[2],b[2],p);scale=mix(a[3],b[3],p);moving=a[1]!==b[1]||a[2]!==b[2]||a[3]!==b[3];x+=Math.sin(t*.73)*3+Math.sin(t*1.31)*1.4;y+=Math.sin(t*.71)*4+Math.sin(t*1.19)*1.5}
 const speech=calm?0:speechAt(t),activity=calm?.45:clamp(.32+.1*Math.sin(t*7)+.42*speech+accent*.22),focus=focusAt(t),bounds={x:x-165*scale,y:y-165*scale,width:330*scale,height:330*scale};
 return {visible,angle,activity,accent:calm?0:accent,gold:true,opacity:visible?phase(t,12,12.5)*(1-phase(t,83.5,84)):0,x,y,scale,moving,upperTitle:t>=18&&t<54.3,focus,speech,bounds};
}
