export const PI=Math.PI,TAU=2*PI,DURATION=90;
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
export const starts=[0,18,33,52,65,80,90];
export const titles=['円周をほどくと、πが見える','直径から、半径のものさしへ','半径1本分のひもを、弧へ','大きさが違っても、角度は同じ','1周は、2πラジアン','度数法とつながる'];
export const defaults={mode:0,r:1.2,phi:0,theta:1,bend:1,ruler:'diameter',unit:'rad',spatial:true,reduced:false,compare:false,film:false,t:0};
export function roll(r,phi){phi=clamp(phi,0,TAU);return {center:[r*phi,r],rotation:-phi,contact:[r*phi,0],unwrapped:r*phi,wrapped:r*(TAU-phi),circumference:TAU*r,diameter:2*r,materialEnd:[r*phi+r*Math.cos(-PI/2-phi),r+r*Math.sin(-PI/2-phi)]}}
// Unit-speed constant-curvature interpolation. The curve length is r for every b.
export function bendPoint(r,b,u){b=clamp(b);u=clamp(u);if(b<1e-12)return [r,r*u];return [r-2*r/b*Math.sin(b*u/2)**2,r/b*Math.sin(b*u)]}
export function bendDerivative(r,b,u){return [-r*Math.sin(b*u),r*Math.cos(b*u)]}
export const arcLength=(r,theta)=>r*theta;
export const chordLength=(r,theta)=>2*r*Math.sin(theta/2);
export function rulerMeasures(r,kind){const unit=kind==='diameter'?2*r:r,count=kind==='diameter'?3:6;return {unit,count,circumference:TAU*r,covered:count*unit,remainder:TAU*r-count*unit,ratio:TAU*r/unit}}
export function inverseEase(y){let lo=0,hi=1;for(let i=0;i<45;i++){const m=(lo+hi)/2;if(ease(m)<y)lo=m;else hi=m}return (lo+hi)/2}
export const radEvents=Array.from({length:6},(_,i)=>65+8*inverseEase((i+1)/TAU));
export function timeline(time){const t=clamp(time,0,90);let mode=starts.findIndex((s,i)=>t>=s&&t<starts[i+1]);if(mode<0)mode=5;const s={...defaults,t,mode,film:true};
 if(mode===0){s.phi=TAU*ease((t-2)/10);s.placed=t<13?0:Math.min(3,Math.floor(t-13)+1);s.event=13+Math.max(0,s.placed-1);}
 if(mode===1){s.phi=TAU;s.ruler='radius';s.split=ease((t-18)/6);s.placed=Math.min(6,Math.max(0,Math.floor((t-24)/1.4+1e-9)+1));s.event=24+Math.max(0,s.placed-1)*1.4;}
 if(mode===2){s.bend=ease((t-36)/10);s.theta=1;s.event=46;}
 if(mode===3){s.theta=1;s.event=52;}
 if(mode===4){s.theta=t<76?TAU*ease((t-65)/8):TAU-PI*ease((t-76)/2);s.half=t>=76;s.event=s.half?78:s.theta>=TAU-1e-9?73:radEvents.filter(e=>e<=t).at(-1)??65;}
 if(mode===5){s.theta=PI/3;s.compare=true;s.event=82;}
 return s;
}
export function numeric(s){const C=TAU*s.r,arc=s.r*s.theta;return {radius:s.r,diameter:2*s.r,C,pi:C/(2*s.r),theta:s.theta,degrees:s.theta*180/PI,arc,ratio:arc/s.r,...roll(s.r,s.phi),rulers:rulerMeasures(s.r,s.ruler),ropeLength:s.r,angleDefined:s.mode!==2||s.bend>=1-1e-9}}
export function number(x,n=3){return Number(x.toFixed(n)).toString()}
export function angle(theta,unit='rad'){if(unit==='deg'){const d=theta*180/PI;return (Math.abs(d-Math.round(d))<1e-8?'':'≈')+number(d,1)+'°'}for(const [v,label] of [[0,'0'],[1,'1'],[PI/6,'{π|6}'],[PI/3,'{π|3}'],[PI/2,'{π|2}'],[PI,'π'],[TAU,'2π']])if(Math.abs(theta-v)<1e-8)return label+' rad';return '≈'+number(theta)+' rad'}
export function caption(t){if(t<6)return '円を1回転させると、進んだ距離は円周の長さ。光のひもをほどいてみよう。';if(t<13)return '円は滑らずに転がる。ほどいた長さと、円に残る長さの和はいつも同じ。';if(t<18)return '円周は直径3本と少し。πは、円周が直径の何個分あるかを表す数。';if(t<24)return '直径は半径2本分。測る円周は同じまま、ものさしだけを切り替える。';if(t<33)return '同じ円周は、半径の約6.28個分。C = πd = 2πr。';if(t<39)return '半径と同じ長さの柔らかいひもを取り出す。長さを変えずに曲げよう。';if(t<46)return '曲がっても、ひもの長さはずっとr。円周に沿う弧へ、ぴったり巻き付ける。';if(t<52)return '弧の長さが半径と等しいとき、中心角は1 rad。約57.3°で、60°とは違う。';if(t<58)return '半径を2倍にすると、同じ角度の弧の長さも2倍になる。';if(t<65)return '弧の長さを半径で割れば、円の大きさに左右されない角度になる。';if(t<73)return '半径1本分の弧を順に並べる。1、2、3、4、5、6……まだ少し残る。';if(t<76)return '1周は6 radちょうどではない。残りも含めて、2π rad。';if(t<80)return '1周360°は2π rad。その半分、180°はπ rad。';if(t<85)return '半円を3等分すると、60° = π/3 rad。1 radとは少し違う。';return '円周を直径で比べるとπ。弧の長さを半径で比べると、ラジアン。';}
