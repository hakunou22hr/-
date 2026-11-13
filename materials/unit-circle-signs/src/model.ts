export const PI=Math.PI,TAU=2*PI;export const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));export const ease=(t:number)=>{t=clamp(t);return t*t*(3-2*t)};
export function atAngle(deg:number){const x=Math.cos(deg*PI/180),y=Math.sin(deg*PI/180);return [Math.abs(x)<1e-10?0:x,Math.abs(y)<1e-10?0:y] as const}
export const sign=(x:number)=>Math.abs(x)<1e-10?'0':x>0?'+':'−';
export function quadrant(deg:number){const [x,y]=atAngle(deg);return x===0||y===0?0:x>0?(y>0?1:4):(y>0?2:3)}
export function describe(deg:number){const [x,y]=atAngle(deg);return {theta:deg,x,y,point:[x,y],quadrant:quadrant(deg),cosSign:sign(x),sinSign:sign(y),foot:[x,0],lengths:[Math.abs(x),Math.abs(y)],tan:x===0?null:y/x}}
export function radian(deg:number){let n=Math.round(deg*10),d=1800;if(n===0)return '0';const gcd=(a:number,b:number):number=>b?gcd(b,a%b):a;const g=gcd(n,d);n/=g;d/=g;const p=n===1?'\\pi':`${n}\\pi`;return d===1?p:`\\frac{${p}}{${d}}`}
const move=(t:number,a:number,b:number,start:number,end:number)=>start+(end-start)*ease((t-a)/(b-a));
export function film(t:number){let theta=0;if(t<6)theta=0;else if(t<12)theta=move(t,6,12,0,45);else if(t<24)theta=45;else if(t<32)theta=move(t,24,32,45,135);else if(t<38)theta=135;else if(t<46)theta=move(t,38,46,135,225);else if(t<52)theta=225;else if(t<60)theta=move(t,52,60,225,315);else if(t<66)theta=315;else if(t<70)theta=move(t,66,70,315,360);else if(t<73)theta=0;else if(t<76)theta=90;else if(t<79)theta=180;else if(t<82)theta=270;else theta=move(t,82,90,0,360);return {...describe(theta),time:t,classroom:t<6,scene:t<12?1:t<24?2:t<38?3:t<52?4:t<66?5:t<82?6:7}}
export const stages=[
 {start:0,end:6,title:'黒板から、符号を体験する空間へ',tex:[],caption:'角度が変わると、sinとcosの符号は、なぜ変わるのだろう。'},
 {start:6,end:12,title:'半径1。点Pが、円を進む',tex:[String.raw`OP=1`,String.raw`P=(\cos\theta,\sin\theta)`],caption:'正のx軸から、反時計回りに角度を測る。半径は、いつも1。'},
 {start:12,end:18,title:'横はcosθ、縦はsinθ',tex:[String.raw`x=\cos\theta`,String.raw`y=\sin\theta`],caption:'横の座標がcosθ、縦の座標がsinθ。矢印の向きも見よう。'},
 {start:18,end:24,title:'第1象限：右へ、上へ',tex:[String.raw`x>0,\quad y>0`,String.raw`\cos\theta>0,\ \sin\theta>0`],caption:'右にあるからxはプラス。上にあるからyもプラス。どちらも正。'},
 {start:24,end:32,title:'縦軸を越えると、横の符号が変わる',tex:[String.raw`\cos\theta:\ +\to0\to-`,String.raw`\sin\theta>0`],caption:'第2象限へ。縦軸を越える瞬間、xは0。そしてマイナスになる。'},
 {start:32,end:38,title:'第2象限：左へ、上へ',tex:[String.raw`x<0,\quad y>0`,String.raw`\cos\theta<0,\ \sin\theta>0`],caption:'点Pは左上。cosはマイナス、sinはプラス。横と縦を分けて考える。'},
 {start:38,end:46,title:'横軸を越えると、縦の符号が変わる',tex:[String.raw`\sin\theta:\ +\to0\to-`,String.raw`\cos\theta<0`],caption:'第3象限へ。横軸を越えると、yが0からマイナスへ変わる。'},
 {start:46,end:52,title:'第3象限：左へ、下へ',tex:[String.raw`x<0,\quad y<0`,String.raw`\cos\theta<0,\ \sin\theta<0`],caption:'左にあるからcosは負。下にあるからsinも負。両方ともマイナス。'},
 {start:52,end:60,title:'縦軸を越えて、右側へ',tex:[String.raw`\cos\theta:\ -\to0\to+`,String.raw`\sin\theta<0`],caption:'第4象限へ。xがマイナスからプラスへ戻る。yは、まだ負。'},
 {start:60,end:66,title:'第4象限：右へ、下へ',tex:[String.raw`x>0,\quad y<0`,String.raw`\cos\theta>0,\ \sin\theta<0`],caption:'右下だから、cosはプラス、sinはマイナス。'},
 {start:66,end:70,title:'一周して、出発点へ',tex:[String.raw`360^\circ=2\pi`,String.raw`P=(1,0)`],caption:'一周すると出発点へ戻る。sinは0、cosは1。'},
 {start:70,end:82,title:'軸上では、どちらかが0',tex:[String.raw`(x,y)=(1,0),(0,1)`,String.raw`(-1,0),(0,-1)`],caption:'軸上の点は、どの象限にも属さない。座標の0も、忘れずに。'},
 {start:82,end:90,title:'符号は、点の位置から判断できる',tex:[String.raw`\cos\theta=x,\quad\sin\theta=y`,String.raw`\text{長さは}\ |x|,\ |y|`],caption:'右左でcos、上下でsin。辺の長さは絶対値。符号は座標の向きで決まる。'}
];
export const stageAt=(t:number)=>Math.max(0,stages.findIndex(s=>t>=s.start&&t<s.end));
export function shortTime(t:number){return t<2?t*3:t<6?6+(t-2)*3:t<10?18+(t-6)*5:t<14?38+(t-10)*3.5:t<18?52+(t-14)*3.5:t<22?66+(t-18)*4:t<26?82+(t-22):86+(t-26)}
export const shortCaption=(t:number)=>t<12?'半径1の円。横がcosθ、縦がsinθ。':t<24?'第1象限：cos＋、sin＋':t<38?'第2象限：cos−、sin＋':t<52?'第3象限：cos−、sin−':t<66?'第4象限：cos＋、sin−':t<82?'軸上では0。象限には属さない。':'右左でcos、上下でsin。長さは絶対値。';
