export const A=2, H=2.5;
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const chord=(x,a=A)=>2*Math.sqrt(Math.max(0,a*a-x*x));
export const area=(x,a=A,h=H)=>h*chord(x,a)/2;
export function volumeTo(x,a=A,h=H){x=clamp(x,-a,a);return h*(.5*(x*Math.sqrt(Math.max(0,a*a-x*x))+a*a*Math.asin(x/a))+Math.PI*a*a/4)}
export const totalVolume=(a=A,h=H)=>Math.PI*a*a*h/2;
export const SCENES=[
 {start:0,end:12,title:'暗闇から、円が生まれる。',short:'円の誕生',en:'A CIRCLE FROM THE DARK',text:'青い粒子が集まり、半径 a の円を描く。'},
 {start:12,end:27,title:'一枚の三角形が、立ち上がる。',short:'三角形の立ち上がり',en:'A PLANE RISES',text:'弦 QR を底辺に。高さ h は、いつも一定。'},
 {start:27,end:44,title:'動きが、立体をつくる。',short:'移動が生む立体',en:'THE BIRTH OF VOLUME',text:'断面を重ねる。それが、積分のはじまり。'},
 {start:44,end:59,title:'断面の幅を、解き明かす。',short:'三平方でつながる',en:'THE GEOMETRY WITHIN',text:'半径と位置 x から、弦の長さが決まる。'},
 {start:59,end:76,title:'限りなく薄く、重ねていく。',short:'断面から積分へ',en:'FROM SLICES TO INTEGRAL',text:'断面積、半円の面積、体積がつながる。'},
 {start:76,end:90,title:'積分が、答えにたどり着く。',short:'光とともに、完成',en:'VOLUME, REVEALED',text:'半円の面積に h を掛ける。それが、この立体の体積。'}
];
export function reelTime(t){const keys=[[0,0],[4,12],[9,27],[17,44],[17.001,59],[23,76],[30,90]];for(let i=1;i<keys.length;i++)if(t<=keys[i][0])return keys[i-1][1]+(keys[i][1]-keys[i-1][1])*(t-keys[i-1][0])/(keys[i][0]-keys[i-1][0]);return 90}
// Each section has Q=(x,0,+sqrt(a²−x²)), R=(x,0,−sqrt(a²−x²)), T=(x,h,0).
// Loft all three corresponding edges. The ridge height is h, including the limiting end sections.
export function solidVertices(to=A,segments=180,a=A,h=H){const out=[];const tri=(p,q,r)=>out.push(...p,...q,...r);for(let i=0;i<segments;i++){const x0=-a+(to+a)*i/segments,x1=-a+(to+a)*(i+1)/segments;const w0=chord(x0,a)/2,w1=chord(x1,a)/2;const v0=[[x0,0,-w0],[x0,0,w0],[x0,h,0]],v1=[[x1,0,-w1],[x1,0,w1],[x1,h,0]];for(let j=0;j<3;j++){const k=(j+1)%3;tri(v0[j],v1[j],v1[k]);tri(v0[j],v1[k],v0[k])}}const w=chord(to,a)/2;tri([to,0,-w],[to,h,0],[to,0,w]);tri([-a,0,0],[-a,0,0],[-a,h,0]);return new Float32Array(out)}
