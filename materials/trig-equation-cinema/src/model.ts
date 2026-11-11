export const PI=Math.PI,TAU=PI*2;
export const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const ease=(x:number)=>{x=clamp(x);return x*x*(3-2*x)};
export const atAngle=(deg:number)=>{const x=Math.cos(deg*PI/180),y=Math.sin(deg*PI/180);return [Math.abs(x)<1e-12?0:x,Math.abs(y)<1e-12?0:y] as const};
export function intersections(k:number):[number,number][]{if(!Number.isFinite(k)||Math.abs(k)>1)return [];if(Math.abs(k)===1)return [[k,0]];const y=Math.sqrt(Math.max(0,1-k*k));return [[k,y],[k,-y]]}
export function angles(k:number,half=false){return intersections(k).map(([x,y])=>{const d=(Math.atan2(y,x)*180/PI+360)%360;return Math.abs(d)<1e-10?0:d}).concat(!half&&k===1?[360]:[]).filter(d=>!half||d<=180+1e-9).sort((a,b)=>a-b)}
export const residual=(x:number)=>2*x*x-5*x+2;
export function radian(deg:number){let n=Math.round(deg*10),d=1800;if(n===0)return '0';const gcd=(a:number,b:number):number=>b===0?Math.abs(a):gcd(b,a%b);const g=gcd(n,d);n/=g;d/=g;const top=n===1?String.raw`\pi`:`${n}\\pi`;return d===1?top:`\\frac{${top}}{${d}}`}
export function solutionTex(half:boolean,radians:boolean){if(radians)return half?String.raw`0\leqq\theta\leqq\pi:\quad\boxed{\theta=\frac{\pi}{3}}`:String.raw`0\leqq\theta\leqq2\pi:\quad\boxed{\theta=\frac{\pi}{3},\frac{5\pi}{3}}`;return half?String.raw`0^\circ\leqq\theta\leqq180^\circ:\quad\boxed{\theta=60^\circ}`:String.raw`0^\circ\leqq\theta\leqq360^\circ:\quad\boxed{\theta=60^\circ,300^\circ}`}

export const stages=[
 {start:0,end:6,title:'授業の黒板から、光の空間へ',tex:[],caption:'黒板の方程式。その候補を、単位円で確かめる。'},
 {start:6,end:8,title:'二次方程式の、その先へ',tex:[String.raw`2\cos^2\theta-5\cos\theta+2=0`],caption:'同じ cosθ を、一つの文字に置き換える。'},
 {start:8,end:10.5,title:'cosθ を t に置き換える',tex:[String.raw`t=\cos\theta`,String.raw`-1\leqq t\leqq1`],caption:'単位円のx座標だから、t の範囲も決まる。'},
 {start:10.5,end:12,title:'置き換えると、二次方程式に',tex:[String.raw`2t^2-5t+2=0`,String.raw`t=\cos\theta`],caption:'値域を確認してから、置き換えた二次方程式を解く。'},
 {start:12,end:19,title:'因数分解すると、道が分かれる',tex:[String.raw`2t^2-5t+2=(2t-1)(t-2)`,String.raw`(2t-1)(t-2)=0`],caption:'積が0なら、どちらかの因数が0。'},
 {start:19,end:22,title:'二次方程式の解は、二つ',tex:[String.raw`t=\frac12\quad\text{または}\quad t=2`],caption:'二つとも、そのまま答えにしてよいだろうか。'},
 {start:22,end:25,title:'cosθ に戻して、確かめる',tex:[String.raw`\cos\theta=\frac12\quad\text{または}\quad\cos\theta=2`],caption:'文字を戻してから、単位円との対応を見る。'},
 {start:25,end:34,title:'x=2 は、単位円の外',tex:[String.raw`\cos\theta=2\ \Longleftrightarrow\ x=2`,String.raw`x^2+y^2=1`],caption:'半径1の円と、x=2の直線。二つは交わらない。'},
 {start:34,end:42,title:'範囲外の候補は、採用しない',tex:[String.raw`-1\leqq\cos\theta\leqq1`,String.raw`\cos\theta=2\quad\text{は不適}`],caption:'交点がない。その理由は、cosθ の値域にある。'},
 {start:42,end:49,title:'x=1/2 を、円へ近づける',tex:[String.raw`\cos\theta=\frac12`,String.raw`x=\frac12`],caption:'金色の直線を左へ動かす。円との交点を計算する。'},
 {start:49,end:56,title:'二つの交点が、生まれる',tex:[String.raw`\left(\frac12,\frac{\sqrt3}{2}\right)`,String.raw`\left(\frac12,-\frac{\sqrt3}{2}\right)`],caption:'斜辺1、底辺1/2。高さの大きさは √3/2。'},
 {start:56,end:64,title:'半径を回し、もう一つの点へ',tex:[String.raw`P=(\cos\theta,\sin\theta)`,String.raw`\cos60^\circ=\cos300^\circ=\frac12`],caption:'回転中のx座標は変わる。解の二点で、再び1/2になる。'},
 {start:64,end:68,title:'同じx座標に、二つの角度',tex:[String.raw`\theta=60^\circ,\ 300^\circ`,String.raw`0^\circ\leqq\theta\leqq360^\circ`],caption:'上側は60°、下側は300°。どちらもx座標は1/2。'},
 {start:68,end:77,title:'円周をたどり、二つの角度へ',tex:[String.raw`0^\circ\leqq\theta\leqq360^\circ`,String.raw`\cos60^\circ=\cos300^\circ=\frac12`],caption:'反時計回りに角度を測る。交点の角度は60°と300°。'},
 {start:77,end:84,title:'全周で、二つの解が確定する',tex:[String.raw`0^\circ\leqq\theta\leqq360^\circ`,String.raw`\boxed{\theta=60^\circ,\ 300^\circ}`],caption:'二つの光る交点が、60°と300°を表している。'},
 {start:84,end:90,title:'答えは、60°と300°',tex:[String.raw`0^\circ\leqq\theta\leqq360^\circ`,String.raw`\boxed{\theta=60^\circ,\ 300^\circ}`],caption:'指定範囲を確認して、解は60°と300°。次は自分で動かしてみよう。'}
];
export const stageAt=(t:number)=>stages.findIndex(s=>t>=s.start&&t<s.end)===-1?stages.length-1:stages.findIndex(s=>t>=s.start&&t<s.end);
export function explanationTime(t:number){return t<6?0:t<8?(t-6)/2*5:t<10.5?5+(t-8)/2.5*4:t<12?9+(t-10.5)/1.5*3:t}
export function film(clock:number){const t=explanationTime(clock);const scene=t<12?1:t<25?2:t<42?3:t<68?4:5;const k=t<42?2:t<48?2-1.5*ease((t-42)/6):.5;const theta=t<50?60:t<56?60:t<64?60+240*ease((t-56)/8):t<68?300:Math.min(360,(t-68)/14*360);return {scene,k,theta,mathTime:t,classroom:clock<6,showCircle:t>=25,showRadius:t>=49,red:t>=25&&t<42,redOpacity:1-ease((t-34)/6),shock:t>=48&&t<53?(t-48)/5:-1}}
export function shortTime(t:number){return t<2?t*3:t<2.6?6+(t-2)/.6*2:t<3.2?8+(t-2.6)/.6*2.5:t<3.5?10.5+(t-3.2)/.3*1.5:t<5?12+(t-3.5)/1.5*13:t<12?25+(t-5)/7*17:t<23?42+(t-12)/11*26:68+(t-23)/7*22}
export const shortCaptions=['教室の黒板から、因数分解と単位円の世界へ。','cosθは−1から1。\nx=2は円と交わらない。','x=1/2の交点は二つ。\n60°と300°。','0°≦θ≦360°の解は、\n60°と300°。'];
export const shortCaption=(sourceTime:number)=>shortCaptions[sourceTime<25?0:sourceTime<42?1:sourceTime<68?2:3];
