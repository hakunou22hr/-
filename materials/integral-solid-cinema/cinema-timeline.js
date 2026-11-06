import {clamp} from './model.js';
export const FILM_LONG=[ [0,0],[8,0],[14,12],[26,27],[44,44],[58,59],[75,76],[86,87],[90,90] ];
export const FILM_SHORT=[ [0,0],[2.2,0],[5,12],[9,27],[17,44],[17.001,59],[23,76],[28.5,87],[30,90] ];
export function lessonTime(t,portrait=false){const k=portrait?FILM_SHORT:FILM_LONG;for(let i=1;i<k.length;i++)if(t<=k[i][0])return k[i-1][1]+(k[i][1]-k[i-1][1])*clamp((t-k[i-1][0])/(k[i][0]-k[i-1][0]));return 90}
export function movieState(t,portrait=false){const duration=portrait?30:90,intro=portrait?4.5:12.5,end=portrait?30.1:84.8;return{duration,intro,end,mathTime:lessonTime(t,portrait),enter:clamp(t/intro),exit:t>end?clamp((t-end)/(duration-end)):0,roomVisible:t<intro||t>end,fade:clamp((t-(duration-.6))/.6)}}
