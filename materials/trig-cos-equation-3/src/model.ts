export const PI=Math.PI,TAU=2*PI;
export const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const ease=(x:number)=>{x=clamp(x);return x*x*(3-2*x)};
export const atAngle=(d:number)=>[Math.cos(d*PI/180),Math.sin(d*PI/180)].map(x=>Math.abs(x)<1e-12?0:x);
export function intersections(k:number):[number,number][]{if(!Number.isFinite(k)||Math.abs(k)>1)return [];if(Math.abs(k)===1)return [[k,0]];const y=Math.sqrt(1-k*k);return [[k,y],[k,-y]]}
export const residual=(x:number)=>2*x*x+x-1;
export function angles(k:number,half=false){return intersections(k).map(([x,y])=>(Math.atan2(y,x)*180/PI+360)%360).filter(d=>!half||d<=180).sort((a,b)=>a-b)}
export function radian(deg:number){let n=Math.round(deg*10),d=1800;const gcd=(a:number,b:number):number=>b?gcd(b,a%b):Math.abs(a);const g=gcd(n,d);n/=g;d/=g;const top=n===1?'\\pi':`${n}\\pi`;return n===0?'0':d===1?top:`\\frac{${top}}{${d}}`}
export function solutionTex(half:boolean,radians:boolean){return radians?(half?String.raw`\theta=\frac{\pi}{3},\ \pi`:String.raw`\boxed{\theta=\frac{\pi}{3},\ \pi,\ \frac{5\pi}{3}}`):(half?String.raw`\theta=60^\circ,\ 180^\circ`:String.raw`\theta=60^\circ,\ 180^\circ,\ 300^\circ`)}
export const steps=[String.raw`t=\cos\theta,\quad -1\le t\le1`,String.raw`2t^2+t-1=0`,String.raw`(2t-1)(t+1)=0\ \Rightarrow\ t=\frac12,\ -1`,String.raw`\cos\theta=\frac12\ \text{または}\ \cos\theta=-1`,String.raw`x=\frac12:\ 2\text{交点},\quad x=-1:\ 1\text{接点}`,String.raw`\theta=\frac\pi3,\ \pi,\ \frac{5\pi}3`];
export const stages=[
 {start:0,end:5,title:'方程式が、光の空間に現れる',tex:[String.raw`2{\color{#65dcf4}\cos^2\theta}+{\color{#65dcf4}\cos\theta}-1=0`],caption:'同じ cosθ に注目しよう。'},
 {start:5,end:9,title:'STEP 1｜cosθ を t に置き換える',tex:[String.raw`t=\cos\theta`,String.raw`-1\le t\le1`],caption:'cosθ は単位円上の x 座標。値は −1 から 1。'},
 {start:9,end:12,title:'STEP 2｜二次方程式にする',tex:[String.raw`2t^2+t-1=0`,String.raw`t=\cos\theta`],caption:'cosθ を t にそろえると、二次方程式になる。'},
 {start:12,end:18,title:'STEP 3｜因数分解で、道が分かれる',tex:[String.raw`2t^2+t-1`,String.raw`=(2t-1)(t+1)`,String.raw`(2t-1)(t+1)=0`],caption:'積が 0 なら、少なくとも一方の因数が 0。'},
 {start:18,end:22,title:'二つの候補、二つの光',tex:[String.raw`{\color{#ffce79}t=\frac12}`,String.raw`{\color{#ff5264}t=-1}`],caption:'金色は 1/2。赤色は −1。どちらも値域の中。'},
 {start:22,end:25,title:'STEP 4｜cosθ に戻す',tex:[String.raw`\cos\theta=\frac12`,String.raw`\text{または}\quad\cos\theta=-1`,String.raw`-1\le\frac12\le1,\quad-1\le-1\le1`],caption:'今回は両方採用する。二つの光を単位円へ進めよう。'},
 {start:25,end:32,title:'STEP 5｜金色の直線を、単位円へ',tex:[String.raw`x^2+y^2=1`,String.raw`{\color{#ffce79}x=\frac12}`],caption:'直線 x=1/2 が動く。円と交わる位置を見つけよう。'},
 {start:32,end:38,title:'二つの交点が、同時に輝く',tex:[String.raw`\left(\frac12,\frac{\sqrt3}{2}\right)`,String.raw`\left(\frac12,-\frac{\sqrt3}{2}\right)`],caption:'同じ x 座標に、上と下の二つの点がある。'},
 {start:38,end:43,title:'半径1の直角三角形',tex:[String.raw`1^2=\left(\frac12\right)^2+\left(\frac{\sqrt3}{2}\right)^2`,String.raw`\theta=60^\circ`],caption:'斜辺は1、底辺は1/2、高さは √3/2。上側は60°。'},
 {start:43,end:48,title:'半径を回して、下側の交点へ',tex:[String.raw`\cos60^\circ=\cos300^\circ=\frac12`,String.raw`\theta=60^\circ,\ 300^\circ`],caption:'反時計回りに300°。回転の途中では x 座標も変わる。'},
 {start:48,end:55,title:'赤い直線は、左端を目指す',tex:[String.raw`{\color{#ff5264}x=-1}`,String.raw`x^2+y^2=1`],caption:'次は cosθ=−1。赤い直線を左へ動かそう。'},
 {start:55,end:61,title:'左端では、接点が一つ',tex:[String.raw`(-1,0)`,String.raw`\cos180^\circ=-1`],caption:'x=−1 は単位円の接線。上下の二点が一つに重なる。'},
 {start:61,end:68,title:'三角形は、一直線に退化する',tex:[String.raw`\theta=180^\circ`,String.raw`\sin180^\circ=0`],caption:'高さが0になり、三角形は水平な線分になる。'},
 {start:68,end:74,title:'STEP 6｜三つの角度を、弧度法へ',tex:[String.raw`60^\circ\longrightarrow\frac\pi3`,String.raw`180^\circ\longrightarrow\pi`,String.raw`300^\circ\longrightarrow\frac{5\pi}3`],caption:'180°＝π rad。角度の表し方を変えても、点は同じ。'},
 {start:74,end:82,title:'範囲が変わると、解の数も変わる',tex:[String.raw`0^\circ\le\theta\le180^\circ`,String.raw`\theta=60^\circ,\ 180^\circ`],caption:'数学Ⅰの範囲では、下側の300°は含まれない。'},
 {start:82,end:90,title:'三つの光が、解になる',tex:[String.raw`0\le\theta<2\pi`,String.raw`\boxed{\theta=\frac\pi3,\ \pi,\ \frac{5\pi}3}`],caption:'発展の範囲では三つの解。次は、自分の手で確かめよう。'}
];
export const stageAt=(t:number)=>Math.max(0,stages.findIndex(s=>t>=s.start&&t<s.end));
export function film(t:number){const scene=t<12?1:t<25?2:t<48?3:t<68?4:5;const k=t<25?.5:t<32?1.5-ease((t-25)/7):t<48?.5:t<55?.5-1.5*ease((t-48)/7):-1;const theta=t<38?60:t<43?60:t<48?60+240*ease((t-43)/5):t<55?300-120*ease((t-48)/7):180;return {scene,k,theta,mathTime:t,showCircle:t>=25,showRadius:t>=38,red:t>=48&&t<68,redOpacity:1,shock:t>=32&&t<36?(t-32)/4:t>=55&&t<59?(t-55)/4:-1}}
export function shortTime(t:number){return t<6?t*2:t<12?12+(t-6)*13/6:t<20?25+(t-12)*23/8:t<25?48+(t-20)*4:68+(t-25)*22/5}
