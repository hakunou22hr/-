import {smooth} from './math.js';
const TAU=Math.PI*2,fract=x=>x-Math.floor(x),rnd=i=>fract(Math.sin(i*127.1+31.7)*43758.5453);
function path(c,p){c.beginPath();let first=true;for(const q of p){if(!q){first=true;continue}if(first){c.moveTo(q[0],q[1]);first=false}else c.lineTo(q[0],q[1])}}
function glow(c,p,color,w,a){c.save();c.globalCompositeOperation='screen';path(c,p);c.strokeStyle=color;for(const [m,b] of [[7,.045],[2.5,.18],[1,.78]]){c.globalAlpha=a*b;c.lineWidth=w*m;c.stroke()}c.restore()}
function halo(c,x,y,r,col,a){if(!Number.isFinite(x+y+r)||r<.2)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#fff6e6');g.addColorStop(.055,col);g.addColorStop(.3,col+'40');g.addColorStop(1,col+'00');c.save();c.globalCompositeOperation='screen';c.globalAlpha=a;c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);c.restore()}
function rot(p,rx,ry,rz){let[x,y,z]=p;[y,z]=[y*Math.cos(rx)-z*Math.sin(rx),y*Math.sin(rx)+z*Math.cos(rx)];[x,z]=[x*Math.cos(ry)+z*Math.sin(ry),-x*Math.sin(ry)+z*Math.cos(ry)];return[x*Math.cos(rz)-y*Math.sin(rz),x*Math.sin(rz)+y*Math.cos(rz),z]}
function triangle(ctx,img,sx,sy,sw,sh,a,b,c,second){
 const cx=(a[0]+b[0]+c[0])/3,cy=(a[1]+b[1]+c[1])/3,expand=p=>{const dx=p[0]-cx,dy=p[1]-cy,l=Math.hypot(dx,dy)||1;return[p[0]+dx/l*.45,p[1]+dy/l*.45]};
 ctx.save();path(ctx,[expand(a),expand(b),expand(c),expand(a)]);ctx.clip();
 if(!second)ctx.transform((b[0]-a[0])/sw,(b[1]-a[1])/sw,(c[0]-b[0])/sh,(c[1]-b[1])/sh,a[0],a[1]);else ctx.transform((b[0]-c[0])/sw,(b[1]-c[1])/sw,(c[0]-a[0])/sh,(c[1]-a[1])/sh,a[0],a[1]);
 ctx.drawImage(img,sx,sy,sw,sh,0,0,sw,sh);ctx.restore();
}
export function drawReferenceUniverse(ctx,W,H,s,img,selection='auto',camera={}){
 if(!img)throw new Error('Reference background image has not loaded');
 const motion=camera.mode||'still', clock=camera.time??s.time, automatic=motion==='cinematic';
 const angle=(camera.yaw||0)+(automatic?.48*Math.sin(clock*.24):0), tilt=(camera.pitch||0)+(automatic?.12*Math.sin(clock*.19):0), zoom=(camera.zoom||1)*(automatic?1+.22*Math.sin(clock*.32):1), mirror=camera.mirror?-1:1, gather=Math.max(0,Math.min(1,(camera.gather||0)+(automatic?.32*(.5+.5*Math.sin(clock*.27)):0)));
 const t=s.time,K=W/(s.portrait?1080:1920),moment=40+t*.27,effect=selection==='auto'?(s.formation>0&&s.crystal<1?'threads':s.tunnel>.1?'orbit':s.n>4&&t<(s.portrait?12:72)?'ripple':'standard'):selection;
 const pulse=(1-s.splitT)*(s.n>4?1:0),unravel=effect==='threads'?(.35+.65*smooth((Math.sin(t*.43)+1)*.5)):0;
 ctx.save();ctx.fillStyle='#01050d';ctx.fillRect(0,0,W,H);
 // The exact source artwork is a texture on a changing depth mesh. All vertices
 // are recomputed from t; peaks deform independently rather than panning a bitmap.
 const nx=32,ny=18,iw=img.width,ih=img.height,grid=[];
 const imageAspect=iw/ih,cover=(s.portrait?W/iw:Math.max(W/iw,H/ih))*1.035,baseW=iw*cover,baseH=ih*cover,imageCenterY=H*(s.portrait?.34:.5);
 for(let j=0;j<=ny;j++){grid[j]=[];for(let i=0;i<=nx;i++){const u=i/nx,v=j/ny,left=Math.exp(-(((u-.14)/.16)**2)-(((v-.48)/.32)**2)),right=Math.exp(-(((u-.86)/.16)**2)-(((v-.48)/.32)**2)),peak=left+right;
  const wave=peak*(.65*Math.sin(t*.68+u*5+v*2)+.3*Math.cos(t*.39-v*7)),r=Math.hypot((u-.5)*2,(v-.61)*1.4),rip=effect==='ripple'?pulse*1.4*Math.sin(r*24-t*1.8)*Math.exp(-r*2):0;
  const z=wave+rip+(effect==='orbit'?peak*.65*Math.sin(t*.8+v*6):0),p=24/(24+z),yaw=.009*Math.sin(t*.16),pitch=.006*Math.cos(t*.19);
  const x=(u-.5)*baseW,y=(v-.5)*baseH;const q=rot([x*p/W*18,y*p/W*18,z+peak*1.2],tilt,angle,0),depth=20/(20-q[2]);grid[j][i]=[W*.5+mirror*q[0]*W/18*depth*zoom,imageCenterY+q[1]*W/18*depth*zoom+peak*H*.008*Math.sin(t*.8+u*6)];
 }}
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=grid[j][i],b=grid[j][i+1],c=grid[j+1][i+1],d=grid[j+1][i],sx=i*iw/nx,sy=j*ih/ny,sw=iw/nx,sh=ih/ny;triangle(ctx,img,sx,sy,sw,sh,a,b,c,false);triangle(ctx,img,sx,sy,sw,sh,a,c,d,true)}
 if(s.portrait){const top=imageCenterY-baseH*.5,bottom=imageCenterY+baseH*.5,fade=baseH*.17;let g=ctx.createLinearGradient(0,top,0,top+fade);g.addColorStop(0,'#01050d');g.addColorStop(1,'#01050d00');ctx.fillStyle=g;ctx.fillRect(0,top-2,W,fade+2);g=ctx.createLinearGradient(0,bottom-fade,0,bottom);g.addColorStop(0,'#01050d00');g.addColorStop(1,'#01050d');ctx.fillStyle=g;ctx.fillRect(0,bottom-fade,W,fade+2)}
 // Projection reproduces the reference's perspective and orbital parallax.
 const yaw=.12*Math.sin(moment*.15),pitch=.12*Math.sin(moment*.4),camZ=14+1.1*Math.cos(moment*.45)-(effect==='orbit'?1.6*Math.sin(t*.42):0);
 function P(x,y,z){let q=rot([x,y-.35,z],pitch,yaw,0);q=rot(q,tilt,angle,0);const depth=camZ-q[2];if(depth<2)return null;const p=14/depth,unit=W*(s.portrait?.075:.052);return[W*.5+mirror*q[0]*unit*p*zoom,H*(s.portrait?.43:.44)-q[1]*unit*p*zoom,p]}
 // Reference Scene.tsx: point clouds and warm/cool mathematical wave sheets.
 ctx.save();ctx.globalCompositeOperation='screen';
 for(let i=0;i<1600;i++){const x=(rnd(i+10)-.5)*39+.15*Math.sin(moment*.8+i*.07),y=(rnd(i+20)-.5)*23,z=((rnd(i+30)*50+moment*1.8)%50)-25,p=P(x*(1-gather*.88),y*(1-gather*.88),z*(1-gather*.82));if(!p)continue;const size=K*(.5+rnd(i+40)*1.4)*p[2];ctx.globalAlpha=.2+.5*rnd(i+50);ctx.fillStyle=i%4?'#75cfff':'#ffd18d';ctx.fillRect(p[0],p[1],size,size)}ctx.restore();
 for(const side of [0,1]){const color=side===0?'#58dfff':'#ff7847',separation=.65*Math.sin(t*.19),ncols=141,nrows=25;
  const F=x=>side===0?Math.sin(x):x*Math.cos(x);
  for(let row=0;row<nrows;row+=3){const z=-2.7+row*5.4/24,pts=[];for(let i=0;i<ncols;i++){const v=-Math.PI+i*TAU/(ncols-1),lift=unravel*.7*Math.sin(v*1.7+t*.6+row);pts.push(P(v*1.7+(side===0?-1:1)*separation,F(v)*1.05+lift,z+unravel*.35*Math.cos(v+t)))}glow(ctx,pts,color,K*.8,.24+unravel*.24)}
  ctx.save();ctx.globalCompositeOperation='screen';for(let a=0;a<ncols;a+=2){const v=-Math.PI+a*TAU/(ncols-1);for(let b=0;b<nrows;b++){const z=-2.7+b*5.4/24,id=a*nrows+b+side*10000,lift=unravel*(.2+1.5*rnd(id)),p=P(v*1.7+(side===0?-1:1)*separation+unravel*.13*Math.sin(id+t),F(v)*1.05+lift,z+unravel*.3*Math.cos(id+t*.5));if(!p)continue;ctx.globalAlpha=.2+.55*rnd(id+11);ctx.fillStyle=id%13===0?'#ffe4b3':color;const size=K*(.55+.9*rnd(id+21))*p[2];ctx.fillRect(p[0],p[1],size,size)}}ctx.restore();
 }
 // Reference torus orientations; each ring also rotates in its own plane.
 for(let ring=0;ring<4;ring++){const pts=[],radius=7.2+ring*.65;function point(a){let q=rot([radius*Math.cos(a),radius*Math.sin(a),0],.4+ring*.45+Math.sin(moment*.9+ring)*.55,ring*.4+moment*.4*(ring%2?1:-1),.2+ring*.35);q=rot(q,Math.sin(moment*.7)*.5,moment*.25,moment*.3);const scale=.85+.12*Math.sin(moment*.8);return P(q[0]*scale-1,q[1]*scale-1,q[2]*scale-6+Math.sin(moment*.8)*1.6)}for(let i=0;i<=150;i++)pts.push(point(i/150*TAU));glow(ctx,pts,ring===1?'#e9cb8b':'#83dbeb',K*(ring===1?1.3:.9),.62);const p=point(moment*.21+ring);if(p)halo(ctx,p[0],p[1],K*26*p[2],ring===1?'#ffcd82':'#7feeff',.65)}
 // A sectional scan is a distinct effect, not a hue or brightness change.
 if(effect==='scan'){const z=-3+fract(t*.12)*7,quad=[P(-6,-3,z),P(6,-3,z),P(6,5,z),P(-6,5,z)];if(quad.every(Boolean)){ctx.save();path(ctx,[...quad,quad[0]]);ctx.fillStyle='rgba(95,220,255,.06)';ctx.fill();ctx.restore();glow(ctx,[...quad,quad[0]],'#adf6ff',K*1.4,.8)}for(const side of [0,1]){const pts=[];for(let i=0;i<=140;i++){const v=-Math.PI+i*TAU/140;pts.push(P(v*1.7,side===0?Math.sin(v)*1.05:v*Math.cos(v)*1.05,z))}glow(ctx,pts,side===0?'#a6f5ff':'#ffbf80',K*2,.9)}}
 // Subdivision emits an outward travelling ring across the image depth mesh.
 if(effect==='ripple'){const phase=fract(t*.28),pts=[];for(let i=0;i<=100;i++){const a=i/100*TAU,r=.4+phase*8;pts.push(P(Math.cos(a)*r,-1.3+.2*Math.sin(a*3-t),Math.sin(a)*r))}glow(ctx,pts,'#f7cf8b',K*1.1,(1-phase)*(.25+pulse*.65))}
 ctx.restore();return{camera:{angle,tilt,zoom,mirror,gather},effect,textureColumns:nx,textureRows:ny,deformedTriangles:nx*ny*2,pointSheets:2,orbitCount:4,meshProbe:[grid[3][4],grid[3][28],grid[10][5],grid[10][27],grid[16][16]]};
}
