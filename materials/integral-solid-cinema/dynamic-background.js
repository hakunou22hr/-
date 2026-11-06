import {SCENES,clamp} from './model.js';
const TAU=Math.PI*2;
const smooth=(a,b,x)=>{const k=clamp((x-a)/(b-a));return k*k*(3-2*k)};
const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
export function backgroundState(t,options={}){let phase=SCENES.findIndex(s=>t<s.end);if(phase<0)phase=5;if(options.phase!==undefined)phase=options.phase;const s=SCENES[phase],u=clamp((t-s.start)/(s.end-s.start));return{phase,u,sweep:options.sweep??u,clock:options.clock??t,opacity:options.opacity??1,portrait:options.portrait??false,safeFrame:options.safeFrame??false}}
function path(ctx,pts){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]))}
function luminous(ctx,pts,color,alpha,width=1){path(ctx,pts);ctx.strokeStyle=color;ctx.globalAlpha=alpha*.12;ctx.lineWidth=width*7;ctx.stroke();ctx.globalAlpha=alpha;ctx.lineWidth=width;ctx.stroke()}
function glow(ctx,x,y,r,color,a){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(.4,color.slice(0,7)+'80');g.addColorStop(1,color.slice(0,7)+'00');ctx.globalAlpha=a;ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)}
export function paintBackground(ctx,w,h,mathTime,options={}){
 const st=backgroundState(mathTime,options),{phase,u,clock:t,opacity,portrait,safeFrame}=st;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h);if(opacity<=0){ctx.restore();return st}
 const m=Math.min(w,h),frameScale=safeFrame?13/15:1,cy=h*(portrait?.50*frameScale:.56),cx=w*(.53+.055*Math.sin(t*.13))+(phase===2?(st.sweep-.5)*w*.10:0);
 const base=ctx.createLinearGradient(0,0,w,h);base.addColorStop(0,'#061737');base.addColorStop(.48,'#073447');base.addColorStop(1,'#07112c');ctx.fillStyle=base;ctx.fillRect(0,0,w,h);
 const heat=phase===5?.95:phase===2?.50:phase===4?.62:.23;
 glow(ctx,w*(.12+.09*Math.sin(t*.16)),h*(.40+.12*Math.cos(t*.12)),m*1.05,'#087bab',.77);
 glow(ctx,w*(.91+.05*Math.sin(t*.11)),h*(.54+.15*Math.sin(t*.17)),m*.95,phase===5?'#a57023':'#116785',.75);
 glow(ctx,w*.50,h*.98,m*.85,'#195794',.6);
 ctx.globalCompositeOperation='screen';
 // Broad aurora ribbons travel through the depth of the scene, not a static wallpaper.
 for(let band=0;band<4;band++){const pts=[];for(let j=0;j<=60;j++){const y=h*j/60;const x=w*(band%2?.93:.08)+Math.sin(j*.075+t*.23+band*1.7)*w*.10+Math.sin(j*.14-t*.15)*w*.025;pts.push([x,y])}luminous(ctx,pts,band===3&&heat>.6?'#dca557':'#1dabc3',.18+band*.025,m*(.013+band*.004));}
 // Perspective rings rotate independently, with a slow orbital camera feeling.
 for(let ring=0;ring<7;ring++){const z=((ring/7+t*.035)%1),r=m*(.48+z*z*1.45),tilt=.28+.13*Math.sin(t*.12+ring*.32),angle=t*.065+ring*.13;const pts=[];for(let j=0;j<=100;j++){const a=j/100*TAU;const xx=Math.cos(a)*r,yy=Math.sin(a)*r*tilt;pts.push([cx+xx*Math.cos(angle)-yy*Math.sin(angle),cy+xx*Math.sin(angle)+yy*Math.cos(angle)])}const al=(.10+.24*z)*(1-smooth(.91,1,z));luminous(ctx,pts,ring%3===0?'#caa66c':'#32bad0',al,.65+z*.8);}
 // Expanding wavefronts correspond to the moving section and later the Riemann layers.
 const layers=phase===4?12:5;for(let k=0;k<layers;k++){const wave=(t*(phase===4?.24:.13)+k/layers)%1;const radius=m*(.17+wave*1.22);const y=cy+h*.25-wave*h*(phase===4?.25:.05);const pts=[];for(let j=0;j<=72;j++){const a=j/72*TAU;pts.push([cx+Math.cos(a)*radius,y+Math.sin(a)*radius*.19])}luminous(ctx,pts,phase>=4?'#e3ba73':'#4cbdd2',Math.sin(wave*Math.PI)*(.10+heat*.15),.8)}
 // Real depth movement: near particles accelerate towards the viewer and leave short trails.
 const count=portrait?155:210;for(let i=0;i<count;i++){const z=(hash(i+1)+t*(.028+hash(i+3)*.024))%1;const distance=.28+z*2.3;const a=hash(i+41)*TAU+t*.022;const rx=Math.cos(a)*w*.24/distance,ry=Math.sin(a)*h*.27/distance;const px=cx+rx,py=cy+ry;if(px<0||px>w||py<0||py>h)continue;const near=1-z,alpha=(.17+near*.45)*(1-smooth(.93,1,z));ctx.globalAlpha=alpha;ctx.strokeStyle=i%7===0?'#f3ca83':'#63d9eb';ctx.lineWidth=.55+near*.7;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+rx*.012*(1+near*2),py+ry*.012*(1+near*2));ctx.stroke();if(i%4===0){ctx.fillStyle='#a6e6ee';ctx.fillRect(px,py,.8+near*.9,.8+near*.9)}}
 if(phase===2){const px=w*(.16+.68*st.sweep);glow(ctx,px,h*.72,m*.48,'#ad8a35',.4);const pts=[];for(let j=0;j<=90;j++){const xx=w*j/90,yy=h*.73+Math.sin(j*.11-t*1.8)*h*.018;pts.push([xx,yy])}luminous(ctx,pts,'#e9bd71',.38,1.1)}
 if(phase===5){const beat=.5+.5*Math.sin(t*2.4);glow(ctx,cx,cy,m*(.5+beat*.08),'#ab7a28',.3+beat*.14)}
 ctx.globalAlpha=1;ctx.globalCompositeOperation='destination-out';
 // Protect the actual object, headings, graph and equations from the light field.
 const center=ctx.createRadialGradient(w*.51,cy,m*.12,w*.51,cy,m*.60);center.addColorStop(0,'rgba(0,0,0,.82)');center.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=center;ctx.fillRect(0,0,w,h);
 if(portrait){const g=ctx.createLinearGradient(0,0,0,h*.32);g.addColorStop(0,'rgba(0,0,0,.72)');g.addColorStop(.8,'rgba(0,0,0,.66)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h*.32)}else{const g=ctx.createRadialGradient(w*.19,h*.12,0,w*.19,h*.12,w*.48);g.addColorStop(0,'rgba(0,0,0,.85)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}
 if((phase===4&&u>.38)||(phase===5&&u<.6)){ctx.save();ctx.translate(w*(portrait?.5:.80),h*(portrait?.71*frameScale:.69));ctx.scale(w*(portrait?.51:.24),h*(portrait?.20*frameScale:.24));const shield=ctx.createRadialGradient(0,0,0,0,0,1);shield.addColorStop(0,'rgba(0,0,0,.96)');shield.addColorStop(.55,'rgba(0,0,0,.90)');shield.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=shield;ctx.fillRect(-1,-1,2,2);ctx.restore();}
 const fy=portrait?h*(safeFrame?.78:.90):h*.92;const fg=ctx.createRadialGradient(w*.5,fy,m*.08,w*.5,fy,m*.64);fg.addColorStop(0,'rgba(0,0,0,.88)');fg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=fg;ctx.fillRect(0,0,w,h);
 ctx.globalCompositeOperation='destination-in';ctx.fillStyle=`rgba(0,0,0,${opacity})`;ctx.fillRect(0,0,w,h);ctx.restore();return st;
}
