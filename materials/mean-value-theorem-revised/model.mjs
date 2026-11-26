export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
export const mix=(a,b,p)=>a+(b-a)*p;
export const phase=(t,a,b)=>ease((t-a)/(b-a));
export const starts=[0,12,27,43,57,72,84,90];
export const titles=['黒板の向こうへ','横2・縦4を測る','接線の傾きを比べる','同じ傾きを発見','図の発見を計算へ','条件が必要な理由','教室への帰還'];
export const events={horizontal:14,vertical:17,measure:20,secant:22,match:47,ripple:47,compute:57,corner:72,return:84};
export function model(kind='square',c=.5){const abs=kind==='abs',a=abs?-1:0,b=abs?1:2,f=abs?Math.abs:x=>x*x,slope=abs?(c===0?null:Math.sign(c)):2*c,sec=(f(b)-f(a))/(b-a);return {kind,c,a,b,f,sec,slope,P:[c,f(c)],tangent:x=>slope===null?null:f(c)+slope*(x-c),exact:c>a&&c<b&&slope===sec,near:slope!==null&&c>a&&c<b&&Math.abs(slope-sec)<=.04+1e-12}}
export function timeline(value){const t=clamp(value,0,90);let scene=starts.findIndex((a,i)=>t>=a&&t<starts[i+1]);if(scene<0)scene=6;let c=.5,kind='square';if(t>=27&&t<43)c=t<31?.5:t<34?mix(.5,1,phase(t,31,34)):t<37?1:t<40?mix(1,1.5,phase(t,37,40)):1.5;if(t>=43)c=mix(1.5,1,phase(t,43,47));if(t>=72&&t<84){kind='abs';c=t<75?-.65:t<77?mix(-.65,0,phase(t,75,77)):t<79?0:t<81?mix(0,.65,phase(t,79,81)):.65}return {t,scene,c,kind,horizontal:phase(t,12,14),vertical:phase(t,15,17),secant:phase(t,20,22),matched:t>=47&&t<72||t>=84,triangle:phase(t,48,50),triangleMove:phase(t,51,54),step:t<60?0:t<63?1:t<66?2:t<69?3:4,portal:t<12?phase(t,9,12):t>=84?phase(12-2*(t-84),9,12):1,...model(kind,c)}}
export const captions=t=>t<12?'x が0から2へ増えると、y は0から4へ増える。':t<27?'区間全体では、横に1進む間に、縦に平均2増える。':t<43?'その場所での変化の速さは、接線の傾きで分かる。':t<57?'区間全体の平均と同じ変化の速さが、途中に見つかった。':t<60?'両端から求める平均は4÷2＝2。途中の傾きが一定という意味ではない。':t<63?'点Pでの瞬間の変化率は2c。平均の2と一致する場所を探す。':t<66?'全体の平均2と、途中の瞬間2cを等しくする。':t<69?'c＝1。点(1,1)では、接線と割線の傾きが同じ2になる。':t<72?'条件を満たせば、平均と同じ瞬間の傾きが途中に少なくとも1つある。':t<81?'角がある原点では微分できない。この例では、平均と同じ傾きが途中にない。':t<84?'閉区間で連続、開区間で微分可能。この二つが条件。':'条件を満たすと、同じ傾きの点が途中に少なくとも1つある。';
