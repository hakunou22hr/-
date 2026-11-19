export const TAU=Math.PI*2,DURATION=90;
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
export const stages=[0,12,27,34,42,54,72,82,90];
export const titles=['30°から始まる物語','斜辺を1にそろえる','比が、そのまま座標になる','点Pの軌跡が、単位円になる','90°の向こうへ','sinは、同じ高さを探す','cosは、同じ横位置を探す','範囲で、答えが変わる'];
export function solve(mode,k,range='full'){let all=[];if(Number.isFinite(k)&&Math.abs(k)<=1){let a=mode==='sin'?Math.asin(k):Math.acos(k);all=(mode==='sin'?[a,Math.PI-a]:[a,-a]).map(a=>((a%TAU)+TAU)%TAU*180/Math.PI).sort((a,b)=>a-b).filter((a,i,arr)=>!i||Math.abs(a-arr[i-1])>1e-7)}return {all,valid:all.filter(a=>range==='full'||a<=180+1e-7)}}
export function exact(v){const near=a=>Math.abs(v-a)<1e-5;for(const [a,s] of [[0,'0'],[.5,'1/2'],[Math.sqrt(2)/2,'√2/2'],[Math.sqrt(3)/2,'√3/2'],[1,'1'],[1.5,'3/2'],[2,'2'],[3,'3'],[Math.sqrt(3),'√3'],[3*Math.sqrt(3)/2,'3√3/2'],[Math.sqrt(3)/4,'√3/4'],[.25,'1/4']]){if(near(a))return s;if(near(-a))return '−'+s}return v.toFixed(3).replace('-','−')}
export function angleText(deg,rad=false){if(!rad)return `${Number(deg.toFixed(1))}°`;let n=Math.round(deg*10),d=1800;const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);const g=gcd(n,d);n/=g;d/=g;return n===0?'0':`${n===1?'':n}π${d===1?'':'/'+d}`}
export function timeline(time){const t=clamp(time,0,90);let stage=stages.findIndex((s,i)=>t>=s&&t<stages[i+1]);if(stage<0)stage=7;let a=30,r=1,mode='sin',k=.5,range='full',rad=false,trace=360;
if(t<12)r=t<5?2:2+.18*Math.sin((t-5)/7*TAU);
else if(t<27)r=2-ease((t-12)/12);
else if(t<34)a=30;
else if(t<42){a=t<39?30+330*ease((t-34)/5):90*ease((t-39)/3);trace=t<39?a:360;}
else if(t<54)a=90+30*ease((t-42)/8);
else if(t<72){k=1.25-1.75*ease((t-54)/6);a=t<60?120+90*ease((t-54)/6):t<64?210:t<68?210+120*ease((t-64)/4):330;}
else if(t<82){mode='cos';k=.8-1.8*ease((t-72)/6);a=330-150*ease((t-72)/6);}
else{mode='sin';k=-.5;a=330;range=t<86?'school':'full';rad=t>=87;}
return {t,stage,a,r,mode,k,range,rad,trace};}
export function caption(t){if(t<5)return '30°の直角三角形。斜辺2、高さ1、底辺√3から始めよう。';if(t<12)return '三角形の大きさが変わっても、同じ角度なら辺の比は変わらない。';if(t<20)return '相似のまま縮めて、斜辺を1にそろえる。高さも底辺も同じ倍率で変わる。';if(t<27)return '斜辺1なら、高さは1/2、底辺は√3/2。比の値を直接読める。';if(t<34)return 'cos θ = x/1 = x、sin θ = y/1 = y。だから P = (cos θ, sin θ)。';if(t<39)return '長さ1の半径を回す。先端Pが描く軌跡が、単位円になる。';if(t<42)return '横の座標はcos、縦の座標はsin。90°では x = 0、y = 1。';if(t<48)return '90°を越えても補助三角形は作れる。120°自体をその内角にはできない。';if(t<54)return '辺の長さは負にならない。でも座標なら、左側を負の値で表せる。';if(t<60)return '今度は値から角度へ。sin θ = −1/2 を、横線 y = −1/2 で探そう。';if(t<64)return '左の交点は、180° + 30° = 210°。同じ高さの点は、もう一つある。';if(t<68)return '正のx軸から反時計回りに測る。回転中の座標と角度も変化する。';if(t<72)return '全周では θ = 210°、330°。どちらの点も y = −1/2。';if(t<78)return 'cos θ = −1 は、縦線 x = −1。左端の接点を探す。';if(t<82)return '接点は1つ、θ = 180°。高さが0になり、三角形は一直線へ。';if(t<86)return '数学Ⅰの上半円では、sin θ = −1/2 は解なし。cos θ = −1 は180°。';return '単位円なら、値から角度を探せる。答えは、指定された範囲で決まる。';}
