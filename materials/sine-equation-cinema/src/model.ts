export const PI=Math.PI,TAU=PI*2;
export const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const ease=(x:number)=>{x=clamp(x);return x*x*(3-2*x)};
export const atAngle=(deg:number)=>{const x=Math.cos(deg*PI/180),y=Math.sin(deg*PI/180);return [Math.abs(x)<1e-12?0:x,Math.abs(y)<1e-12?0:y] as const};
export function intersections(k:number):[number,number][]{if(!Number.isFinite(k)||Math.abs(k)>1)return [];if(Math.abs(k)===1)return [[0,k]];const x=Math.sqrt(Math.max(0,1-k*k));return [[x,k],[-x,k]]}
export function angles(k:number){return intersections(k).map(([x,y])=>(Math.atan2(y,x)*180/PI+360)%360).sort((a,b)=>a-b)}
export const residual=(t:number)=>2*t*t-3*t+1;
export function radian(deg:number){let n=Math.round(deg*10),d=1800;if(n===0)return '0';const gcd=(a:number,b:number):number=>b===0?Math.abs(a):gcd(b,a%b);const g=gcd(n,d);n/=g;d/=g;const top=n===1?String.raw`\pi`:`${n}\\pi`;return d===1?top:`\\frac{${top}}{${d}}`}
export const solutionTex=String.raw`\boxed{\theta=\frac{\pi}{6},\frac{\pi}{2},\frac{5\pi}{6}}`;
export const stages=[
 {start:0,end:6,title:'授業の黒板から、光の空間へ',tex:[],caption:'二つの t の値から、角度の解はいくつ生まれるだろう。'},
 {start:6,end:10,title:'まず、置き換える文字の範囲',tex:[String.raw`t=\sin\theta`,String.raw`-1\leqq t\leqq1`],caption:'sinθ は単位円の高さ。置き換えた t も、−1から1まで。'},
 {start:10,end:16,title:'sinθ を、一つの文字に',tex:[String.raw`2t^2-3t+1=0`,String.raw`t=\sin\theta`],caption:'同じ sinθ を t に置き換えると、二次方程式になる。'},
 {start:16,end:22,title:'因数分解し、候補を取り出す',tex:[String.raw`(2t-1)(t-1)=0`,String.raw`t=\frac12\quad\text{または}\quad t=1`],caption:'積が0なら、どちらかの因数が0。t は1/2、または1。'},
 {start:22,end:28,title:'二つとも、範囲に含まれる',tex:[String.raw`-1\leqq\frac12\leqq1`,String.raw`-1\leqq1\leqq1`],caption:'1/2 も1も、−1≦t≦1 に含まれる。どちらも採用する。'},
 {start:28,end:34,title:'sinθ に戻し、高さを見る',tex:[String.raw`\sin\theta=\frac12\quad\text{または}\quad\sin\theta=1`,String.raw`P=(\cos\theta,\sin\theta)`],caption:'単位円上の点P。その y 座標が sinθ、つまり高さを表す。'},
 {start:34,end:42,title:'高さ1/2に、二つの交点',tex:[String.raw`y=\frac12`,String.raw`\left(\pm\frac{\sqrt3}{2},\frac12\right)`],caption:'水平な直線 y＝1/2 は、単位円と左右二つの点で交わる。'},
 {start:42,end:49,title:'半径1、高さ1/2の直角三角形',tex:[String.raw`\sin\theta=\frac{\text{高さ}}{\text{半径}}=\frac12`,String.raw`\theta=30^\circ=\frac{\pi}{6}`],caption:'半径1に対し、高さは1/2。右側の交点の角度は30°、π/6。'},
 {start:49,end:56,title:'左側も、同じ高さ',tex:[String.raw`180^\circ-30^\circ=150^\circ`,String.raw`\pi-\frac{\pi}{6}=\frac{5\pi}{6}`],caption:'左側は180°から30°を引く。150°、つまり5π/6。'},
 {start:56,end:62,title:'もう一つの候補、高さ1へ',tex:[String.raw`\sin\theta=1\ \Longleftrightarrow\ y=1`,String.raw`x^2+1=1\ \Longrightarrow\ x=0`],caption:'水平線を高さ1へ上げる。二つの交点が、円の真上で重なる。'},
 {start:62,end:68,title:'接する点は、一つだけ',tex:[String.raw`P=(0,1)`,String.raw`\theta=90^\circ=\frac{\pi}{2}`],caption:'y＝1 は円に接する。対応する角度は90°、π/2だけ。'},
 {start:68,end:77,title:'二つの候補から、三つの角度',tex:[String.raw`\sin\theta=\frac12:\quad\frac{\pi}{6},\frac{5\pi}{6}`,String.raw`\sin\theta=1:\quad\frac{\pi}{2}`],caption:'高さ1/2に二点、高さ1に一点。二つの t の値から、角度は三つ。'},
 {start:77,end:84,title:'範囲を確認し、小さい順に',tex:[String.raw`0\leqq\theta<2\pi`,solutionTex],caption:'0≦θ＜2π の範囲で、解を小さい順に並べる。2πは含まない。'},
 {start:84,end:90,title:'答えは、三つの光る点',tex:[String.raw`30^\circ,90^\circ,150^\circ`,solutionTex],caption:'π/6、π/2、5π/6。高さを見れば、三つの解がつながる。'}
];
export const stageAt=(t:number)=>{const i=stages.findIndex(s=>t>=s.start&&t<s.end);return i<0?stages.length-1:i};
export function film(t:number){const scene=t<16?1:t<28?2:t<42?3:t<68?4:5;const k=t<34?.5:t<56?.5:t<62?.5+.5*ease((t-56)/6):1;const theta=t<49?30:t<56?30+120*ease((t-49)/7):t<62?150-60*ease((t-56)/6):90;return {scene,k,theta,mathTime:t,classroom:t<6,showCircle:t>=28,showRadius:t>=42,red:false,redOpacity:1,shock:t>=36&&t<40?(t-36)/4:t>=62&&t<66?(t-62)/4:-1}}
export function shortTime(t:number){return t<2?t*3:t<8?6+(t-2)/6*22:t<16?28+(t-8)/8*28:t<23?56+(t-16)/7*12:68+(t-23)/7*22}
export const shortCaptions=['t＝sinθ と置き、−1≦t≦1 を確認。\nt＝1/2 と1は、どちらも採用。','y＝1/2には二つの交点。\n角度はπ/6と5π/6。','y＝1は円の真上で接する。\n角度はπ/2、一つだけ。','0≦θ＜2π の解は三つ。\nπ/6、π/2、5π/6。'];
export const shortCaption=(t:number)=>shortCaptions[t<28?0:t<56?1:t<68?2:3];
