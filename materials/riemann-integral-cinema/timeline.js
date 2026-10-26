import {calculate,blendData,smooth,lerp} from './math.js';
export const chapters=[
 [0,15,'曲線の宇宙へ','曲線の面積を、どう求めるのか。'],
 [15,32,'区間を等分する','同じ幅 Δx で、区間 [a, b] を分ける。'],
 [32,50,'幅 × 高さ','右端の値 f(xₖ) を、長方形の高さに。'],
 [50,72,'長方形の連鎖分裂','4 → 8 → 16 → 32 → 64 → 128 → 256'],
 [72,89,'極限の回廊','分割を限りなく細かくする。その先へ。'],
 [89,105,'Σ から ∫ へ','長方形の和に、極限をとる。'],
 [105,120,'定積分の完成','無限の和が、定積分になる。'],
];
export const verticalChapters=[
 [0,4,'曲線の宇宙へ','無限分割が、積分を生む。'],
 [4,12,'連鎖する分割','右端の高さ × 小さな幅'],
 [12,20,'極限の回廊','n → ∞   ／   Δx → 0'],
 [20,26,'Σ から ∫ へ','和に極限をとる。'],
 [26,30,'定積分の完成','無限の和が、面積をつくる。'],
];
export function stateAt(time,portrait=false){
 const duration=portrait?30:120,t=Math.max(0,Math.min(duration,time));
 const cs=portrait?verticalChapters:chapters,ci=Math.max(0,cs.findIndex(c=>t<c[1])),chapter=cs[t===duration?cs.length-1:ci];
 let n=4,split=0,previous=4,splitT=1;
 const start=portrait?4:50,end=portrait?12:72,steps=portrait?5:6;
 if(t>=start){split=Math.min(steps,Math.floor((t-start)/(end-start)*(steps+1)));n=4*2**split;previous=Math.max(4,n/2);splitT=smooth(((t-start)%( (end-start)/(steps+1)))/.7);}
 const tunnelStart=portrait?12:72,tunnelEnd=portrait?20:89;
 const tunnel=smooth((t-tunnelStart)/1.6)*(1-smooth((t-(tunnelEnd-1.8))/1.8));
 const formation=smooth((t-(portrait?20:89))/(portrait?4.8:13));
 const crystal=smooth((t-(portrait?26:104))/(portrait?2:2));
 const signed=!portrait&&t>=105&&t<113;
 let data=calculate('wave',0,4,n);
 if(!portrait&&t>=105){const up=smooth((t-105)/1.3),down=smooth((t-110.8)/2.2),blend=up*(1-down),a=lerp(0,-1.35,blend),b=lerp(lerp(4,1.35,up),1,down);data=blendData(n,a,b,blend);}
 return {time:t,portrait,duration,chapter:chapter[2],caption:chapter[3],chapterIndex:cs.indexOf(chapter),n,previous,splitT,split,tunnel,formation,crystal,signed,data,
 curveReveal:smooth(t/(portrait?2.2:8)),rectReveal:smooth((t-(portrait?3:32))/(portrait?1.5:8)),
 gridLevel:n,yaw:lerp(.32*Math.sin(t*.17),-.3*Math.sin(t*.23),formation),pitch:.12*Math.cos(t*.12),
 progress:t/duration,unitInterval:!portrait&&t>=113,
 formulaStage:portrait?(t<4?'curve':t<12?'sum':t<20?'limit':t<23?'sum-limit':'identity'):(t<15?'curve':t<32?'partition':t<50?'rectangle':t<72?'sum':t<89?'limit':t<94?'sum':t<99?'sum-limit':t<113?'identity':'unit'),
 };
}
