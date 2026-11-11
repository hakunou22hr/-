export const TAU=2*Math.PI, EPS=1e-10;
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
export const mix=(a,b,p)=>a+(b-a)*p;
export const SOLUTIONS=[30,150,270];
const snap=x=>Math.abs(x)<EPS?0:Math.abs(x-1)<EPS?1:Math.abs(x+1)<EPS?-1:x;
export function pointAt(degrees){const a=degrees*Math.PI/180;return {x:snap(Math.cos(a)),y:snap(Math.sin(a))};}
export function inDomain(deg,domain='extended'){return domain==='math1'?deg>=0&&deg<=180:deg>=0&&deg<360;}
export function intersections(k,domain='extended'){
 if(!Number.isFinite(k)||Math.abs(k)>1)return [];
 const y=k===0?0:k,a=Math.sqrt(Math.max(0,1-y*y)),xs=a<EPS?[0]:[a,-a];
 return xs.map(x=>{let rad=Math.atan2(y,x);if(rad<0)rad+=TAU;const deg=rad*180/Math.PI;return {x:snap(x),y,rad,deg,allowed:domain==='math1'?y>=0:true}});
}
export function solutions(domain='extended'){return SOLUTIONS.filter(d=>inDomain(d,domain));}
export function piLatex(deg){let n=Math.round(deg),d=180;const gcd=(a,b)=>b?gcd(b,a%b):a;const g=gcd(Math.abs(n),d);n/=g;d/=g;if(!n)return '0';const top=n===1?'\\pi':n===-1?'-\\pi':`${n}\\pi`;return d===1?top:`\\frac{${top}}{${d}}`;}
export const angleLatex=(deg,unit='deg')=>unit==='rad'?piLatex(deg):`${deg}^\\circ`;
export const residual=degrees=>{const t=pointAt(degrees).y;return 2*t*t+t-1;};
const inverseSmooth=v=>{let a=0,b=1;for(let i=0;i<50;i++){const m=(a+b)/2;if(smooth(m)<v)a=m;else b=m;}return (a+b)/2;};
export const LINE_HIT_TIMES={left:29+3*inverseSmooth((1.45-Math.sqrt(3)/2)/2.9),right:29+3*inverseSmooth((1.45+Math.sqrt(3)/2)/2.9)};
export const sceneAt=t=>t<12?0:t<25?1:t<48?2:t<65?3:4;
export function filmState(raw){
 const t=clamp(raw,0,90),scene=sceneAt(t);let theta=0,k=.5,circle=0,line=0,triangle=false,camera=[0,1,15],look=[0,.2,0],energy=.25,color='cyan';
 if(scene===0){theta=-90+360*smooth((t-7)/4.5);circle=smooth((t-6.5)/1.5);camera=[mix(1.2,0,smooth(t/12)),mix(2,.6,smooth(t/12)),mix(20,13,smooth(t/12))];energy=.3+.5*Math.sin(t*3)**2;}
 if(scene===1){let p=smooth((t-12)/13);camera=[Math.sin(p*Math.PI)*1.2,.6,t<23?mix(15,13,smooth((t-12)/11)):mix(13,7,smooth((t-23)/2))];energy=.4+smooth((t-16)/4);color='split';}
 if(scene===2){circle=smooth((t-25)/4);line=smooth((t-29)/3);theta=t<38?30*smooth((t-33)/2):30+120*smooth((t-38)/4);triangle=t>=33;const p=smooth((t-25)/9);camera=[mix(4.5,0,p),mix(3.4,.5,p),mix(15,12.3,p)];energy=.4+Math.exp(-(((t-31.5)/.8)**2))*1.8+Math.exp(-(((t-42)/.8)**2));color='gold';}
 if(scene===3){circle=1;line=1;k=mix(.5,-1,smooth((t-48)/6));theta=mix(150,270,smooth((t-50)/8));triangle=t<58;camera=[mix(.5,0,smooth((t-48)/7)),.5,12.3];energy=.5+Math.exp(-(((t-54)/.7)**2))*2+Math.exp(-(((t-58)/1)**2));color='red';}
 if(scene===4){circle=1;line=0;theta=t<72?30:t<77?150:270;camera=[0,.5,mix(13.9,16,smooth((t-80)/10))];energy=.6;color='all';}
 const p=pointAt(theta),hits=intersections(k).filter(h=>scene!==2||h.x<=mix(-1.45,1.45,line)+EPS);
 return {t,scene,theta,k,circle,line,triangle:triangle&&Math.abs(p.x)>EPS&&Math.abs(p.y)>EPS,point:p,hits,camera,look,energy,color,degenerate:Math.abs(p.x)<EPS||Math.abs(p.y)<EPS,domain:'extended'};
}
export function shortTime(raw){if(raw<3)return raw*4;if(raw<8)return 12+(raw-3)*13/5;if(raw<17)return 25+(raw-8)*23/9;if(raw<23)return 48+(raw-17)*17/6;return 65+(raw-23)*25/7;}
export const captions=[
 t=>t<3?'この方程式の解を、光の単位円で探します。':t<7?'sinθを、ひとつの数 t に置き換える。':'単位円の高さだから、t は −1 から 1 の間。',
 t=>t<17?'二次方程式を、共通のかたまりで因数分解。':t<21?'積が0なら、どちらかの因数が0。':'t を sinθ に戻す。2つの高さを円に探そう。',
 t=>t<30?'単位円は、原点からの距離がいつも1。':t<34?'高さが1/2の直線は、円と2か所で交わる。':t<38?'右の点は30°。高さは半分、斜辺は1。':t<42?'半径を反時計回りに回す。三角形も一緒に動く。':'左の点は150°。高さは同じ半分、基準角は30°。',
 t=>t<54?'水平線を下げて、円の最下点を調べよう。':t<58?'y = −1 に触れるのは、いちばん下の1点だけ。':'270°では x = 0。三角形は下向きの半径に退化する。',
 t=>t<70?'単位円では、弧の長さで角度を測れる。':t<80?'光の円弧と一緒に、度からπを使う表示へ。':t<86?'360°未満まで広げると、解はこの3つ。':'次は自分の手で、交点と角度を確かめよう。'
];
