import {state,clamp} from './model.js';
// Dedicated edit; these source ranges reuse the mathematical scene materials.
export const reelsCuts=[0,3,9,14,21,24.5,27,30];
export const sourceRanges=[[0,12],[12,30],[40,53],[53,72],[72,78],[78,83],[83,90]];
export function reelsState(time){const t=clamp(time,0,30);let segment=6;for(let i=0;i<7;i++)if(t>=reelsCuts[i]&&t<reelsCuts[i+1]){segment=i;break;}const u=(t-reelsCuts[segment])/(reelsCuts[segment+1]-reelsCuts[segment]),[a,b]=sourceRanges[segment],source=a+(b-a)*u,q=state(source);return {...q,objective:segment>=2&&t>=10,shortTime:t,segment,shortU:u,sourceTime:source};}
