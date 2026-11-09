export const PI=Math.PI,TAU=2*PI;
export const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const ease=(x:number)=>{x=clamp(x);return x*x*(3-2*x)};
export type Kind='general'|'astroid'|'function'|'unit';
export function point(kind:Kind,t:number):[number,number]{if(kind==='astroid')return [Math.cos(t)**3,Math.sin(t)**3];if(kind==='function')return [t,(Math.exp(t)+Math.exp(-t))/2];if(kind==='unit')return [Math.cos(t),Math.sin(t)];return [t,.5*t+.1*t**3]}
export function derivative(kind:Kind,t:number):[number,number]{if(kind==='astroid')return [-3*Math.cos(t)**2*Math.sin(t),3*Math.sin(t)**2*Math.cos(t)];if(kind==='function')return [1,(Math.exp(t)-Math.exp(-t))/2];if(kind==='unit')return [-Math.sin(t),Math.cos(t)];return [1,.5+.3*t*t]}
export const speed=(k:Kind,t:number)=>Math.hypot(...derivative(k,t));
export function polygon(k:Kind,n:number,end?:number){const b=end??(k==='astroid'?PI/2:k==='function'?1:3);let total=0;for(let i=0;i<n;i++){const p=point(k,b*i/n),q=point(k,b*(i+1)/n);total+=Math.hypot(q[0]-p[0],q[1]-p[1])}return total}
export function integral(k:Kind,b:number,n=1000){let sum=speed(k,0)+speed(k,b);for(let i=1;i<n;i++)sum+=(i%2?4:2)*speed(k,b*i/n);return sum*b/n/3}
export const astroLength=(t:number)=>1.5*Math.sin(t)**2;
export const functionLength=(x:number)=>(Math.exp(x)-Math.exp(-x))/2;
export const stages=[
 {start:0,end:15,title:'黒板の曲線。その長さを、どう測る？',caption:'生徒のノートから、黒板の向こうの数学空間へ。',kind:'general' as Kind,tex:[],note:''},
 {start:15,end:27,title:'曲線を、短い線分に分ける',caption:'分割を細かくすると、点を結ぶ折れ線が曲線に近づきます。',kind:'general' as Kind,tex:[String.raw`L_n=\sum_{i=1}^{n}\Delta\ell_i`,String.raw`n\ \longrightarrow\ \infty`],note:'有限の折れ線の長さは、曲線の長さの近似です。'},
 {start:27,end:40,title:'小さな長さを、順番に足す',caption:'線分の長さを保ったまま、一列の測定レールへ並べます。',kind:'general' as Kind,tex:[String.raw`L_n=\Delta\ell_1+\cdots+\Delta\ell_n`,String.raw`L_n\ \longrightarrow\ L`],note:'一本ずつの長さを足したものが、全体の長さに近づきます。'},
 {start:40,end:50,title:'小さな部分に、直角三角形',caption:'横の変化はシアン、縦の変化は紫。斜辺は点を結ぶ線分です。',kind:'general' as Kind,tex:[String.raw`\Delta\ell=\sqrt{(\Delta x)^2+(\Delta y)^2}`],note:'これは弧そのものではなく、2点を結ぶ線分の長さ。三平方の定理で測ります。'},
 {start:50,end:57,title:'変化を、時間の変化で割る',caption:'Δt>0 として、横・縦の変化を Δt あたりで表します。',kind:'general' as Kind,tex:[String.raw`\Delta\ell=\sqrt{\left(\frac{\Delta x}{\Delta t}\right)^2+\left(\frac{\Delta y}{\Delta t}\right)^2}\,\Delta t`],note:'Δtを小さくすると、Δx/ΔtとΔy/Δtは微分係数へ近づきます。'},
 {start:57,end:65,title:'細分化の極限が、積分になる',caption:'小さな長さを足す極限。それが曲線の長さの積分です。',kind:'general' as Kind,tex:[String.raw`x=f(t),\quad y=g(t)\quad(a\leqq t\leqq b)`,String.raw`L=\int_a^b\sqrt{\{f'(t)\}^2+\{g'(t)\}^2}\,dt`],note:'横・縦の変化を微分で求め、小さな長さを積分で足します。'},
 {start:65,end:78,title:'例題26｜測るのは第1象限の部分',caption:'t が0からπ/2へ進むと、点は(1,0)から(0,1)へ動きます。',kind:'astroid' as Kind,tex:[String.raw`x=\cos^3t,\quad y=\sin^3t`,String.raw`0\leqq t\leqq\frac{\pi}{2}`],note:'金色に光る第1象限の部分だけの長さを求めます。'},
 {start:78,end:90,title:'まず、横と縦の変化を微分する',caption:'横方向の微分は負。長さでは成分を二乗するため、向きの符号を扱えます。',kind:'astroid' as Kind,tex:[String.raw`\frac{dx}{dt}=-3\cos^2t\sin t`,String.raw`\frac{dy}{dt}=3\sin^2t\cos t`],note:'合成関数の微分：3乗を微分し、中のcos t、sin tの微分を掛けます。'},
 {start:90,end:97,title:'二乗して足し、共通因子をくくる',caption:'両方の項にある 9sin²t cos²t を、ひとまとめにします。',kind:'astroid' as Kind,tex:[String.raw`\left(\frac{dx}{dt}\right)^2+\left(\frac{dy}{dt}\right)^2`,String.raw`=9\cos^4t\sin^2t+9\sin^4t\cos^2t`,String.raw`=9\sin^2t\cos^2t(\cos^2t+\sin^2t)`],note:'二つの項の共通部分を外へ出すと、三角関数の基本関係が現れます。'},
 {start:97,end:103,title:'cos²t＋sin²t は、1',caption:'括弧の中を1に置き換えると、平方根の中が整理されます。',kind:'astroid' as Kind,tex:[String.raw`\underbrace{\cos^2t+\sin^2t}_{=1}`,String.raw`\sqrt{9\sin^2t\cos^2t}`,String.raw`=3|\sin t\cos t|`],note:'平方根を外すときは、絶対値を忘れないようにします。'},
 {start:103,end:113,title:'区間を確かめて、絶対値を外す',caption:'第1象限では sin t と cos t はともに0以上です。',kind:'unit' as Kind,tex:[String.raw`0\leqq t\leqq\frac{\pi}{2}`,String.raw`\sin t\geqq0,\quad\cos t\geqq0`,String.raw`3|\sin t\cos t|=3\sin t\cos t`],note:'単位円の横・縦の成分を見て、符号を確かめます。'},
 {start:113,end:125,title:'積分して、長さが確定する',caption:'sin²t の微分は2sin t cos t。端の値を代入すると3/2です。',kind:'astroid' as Kind,tex:[String.raw`L=\int_0^{\pi/2}3\sin t\cos t\,dt`,String.raw`=\left[\frac32\sin^2t\right]_0^{\pi/2}`,String.raw`\boxed{L=\frac32}`],note:'(1,0)から(0,1)までの、曲がった部分の長さです。'},
 {start:125,end:137,title:'例題27｜yがxの関数なら',caption:'xを媒介変数とみなすと、横方向の微分は1になります。',kind:'function' as Kind,tex:[String.raw`y=\frac12(e^x+e^{-x}),\quad0\leqq x\leqq1`,String.raw`\frac{dx}{dx}=1`,String.raw`L=\int_0^1\sqrt{1+\left(\frac{dy}{dx}\right)^2}\,dx`],note:'媒介変数の公式から、y=f(x)の曲線の長さの公式が得られます。'},
 {start:137,end:146,title:'指数の式を微分し、二乗する',caption:'eの−x乗を微分すると符号が変わります。',kind:'function' as Kind,tex:[String.raw`\frac{dy}{dx}=\frac12(e^x-e^{-x})`,String.raw`1+\left(\frac{dy}{dx}\right)^2`,String.raw`=1+\frac14(e^{2x}-2+e^{-2x})`],note:'e^xとe^(−x)の積は1。二乗の展開では、真ん中の項が−2になります。'},
 {start:146,end:154,title:'完全な平方の形へ、組み直す',caption:'1を4/4とみて定数項をまとめると、真ん中が＋2になります。',kind:'function' as Kind,tex:[String.raw`1+\frac14(e^{2x}-2+e^{-2x})`,String.raw`=\frac14(e^{2x}+2+e^{-2x})`,String.raw`=\frac14(e^x+e^{-x})^2`],note:'二乗の形が見つかると、平方根を外せます。'},
 {start:154,end:165,title:'正であることを確認して、積分',caption:'e^x＋e^(−x)は正。平方根を外し、上下の値を代入します。',kind:'function' as Kind,tex:[String.raw`e^x+e^{-x}>0`,String.raw`\sqrt{1+(y')^2}=\frac12(e^x+e^{-x})`,String.raw`L=\frac12\left[e^x-e^{-x}\right]_0^1`,String.raw`\boxed{L=\frac12(e-e^{-1})}`],note:'x=0では1−1=0。x=1でe−e^(−1)が残ります。'},
 {start:165,end:174,title:'曲線の長さは、小さな長さの積分',caption:'横と縦の変化を微分で測り、三平方で長さにして、積分で足す。',kind:'general' as Kind,tex:[String.raw`L=\int_a^b\sqrt{\{f'(t)\}^2+\{g'(t)\}^2}\,dt`,String.raw`y=f(x):\quad L=\int_a^b\sqrt{1+\{f'(x)\}^2}\,dx`],note:'細分化 → 三平方 → 微分 → 積分。この順に、公式の意味をたどれます。'},
 {start:174,end:180,title:'黒板に戻っても、曲線の見方は変わる',caption:'曲線の長さ。その答えは、小さな変化の積み重ね。',kind:'general' as Kind,tex:[],note:''}
];
export function stageAt(t:number){return Math.max(0,Math.min(stages.length-1,stages.findIndex(s=>t<s.end)===-1?stages.length-1:stages.findIndex(s=>t<s.end)))}
export function worldPoint(k:Kind,t:number):[number,number,number]{const p=point(k,t),s=k==='general'?1.3:4;return [s*p[0]-2,s*p[1]-(k==='function'?2:1.5),0]}
