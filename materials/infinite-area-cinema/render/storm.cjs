// Evolving density/flow field, colored cloud lighting, branched discharges,
// expanding floor shockwaves. The still plate is used only as a material texture.
const {createCanvas}=require(process.env.CANVAS_MODULE||'@napi-rs/canvas');
const schedule=require('./storm.json');
const lerp=(a,b,t)=>a+(b-a)*t,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const rand=i=>{let x=Math.sin(i*127.12+41)*43758.5453;return x-Math.floor(x)};
function realAt(t,d){const c=schedule.editions[d],s=schedule.storyCuts;let i=s.findIndex((v,j)=>j&&t<v)-1;if(i<0)i=6;return c[i]+(t-s[i])/(s[i+1]-s[i])*(c[i+1]-c[i])}
const colors={blue:[28,139,255],violet:[165,64,255],gold:[255,157,36]};
function createStorm(W,H,d,image){
 const w=384,h=148,sky=createCanvas(w,h),s=sky.getContext('2d'),tex=createCanvas(w,h),tc=tex.getContext('2d');
 tc.drawImage(image,0,0,image.width,image.height*.66,0,0,w,h);const pixels=tc.getImageData(0,0,w,h).data,frame=s.createImageData(w,h),data=frame.data;
 const size=32,field=new Float32Array(size**3);for(let i=0;i<field.length;i++)field[i]=rand(i+940);
 function noise(x,y,z){let xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),u=x-xi,v=y-yi,q=z-zi;u=u*u*(3-2*u);v=v*v*(3-2*v);q=q*q*(3-2*q);xi&=31;yi&=31;zi&=31;let xx=(xi+1)&31,yy=(yi+1)&31,zz=(zi+1)&31;let a=lerp(field[xi+yi*32+zi*1024],field[xx+yi*32+zi*1024],u),b=lerp(field[xi+yy*32+zi*1024],field[xx+yy*32+zi*1024],u),c=lerp(field[xi+yi*32+zz*1024],field[xx+yi*32+zz*1024],u),e=lerp(field[xi+yy*32+zz*1024],field[xx+yy*32+zz*1024],u);return lerp(lerp(a,b,v),lerp(c,e,v),q)}
 const strikes=schedule.strikes.map((e,i)=>({...e,real:realAt(e.t,d),seed:i+30,rgb:colors[e.color]}));
 function glow(ctx,x,y,rx,ry,rgb,a){ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);let g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,`rgba(${rgb},${clamp(a)})`);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore()}
 function boltPoints(e){const pts=[];let x=e.x*W,y=55;pts.push([x,y]);for(let i=1;i<=15;i++){x+=(rand(e.seed*90+i)-.5)*65;y=55+i*27;pts.push([x,y])}const detailed=[pts[0]];for(let i=1;i<pts.length;i++){let a=pts[i-1],b=pts[i];for(let k=1;k<=4;k++)detailed.push([lerp(a[0],b[0],k/4)+(k<4?(rand(e.seed*1000+i*4+k)-.5)*8:0),lerp(a[1],b[1],k/4)])}return detailed}
 function drawBolt(ctx,pts,a,rgb,width=2){ctx.save();ctx.globalAlpha=a;ctx.lineJoin='round';ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle=`rgb(${rgb})`;ctx.lineWidth=width*2.2;ctx.shadowColor=`rgb(${rgb})`;ctx.shadowBlur=25;ctx.stroke();ctx.shadowBlur=9;ctx.lineWidth=width;ctx.strokeStyle='#e8f8ff';ctx.stroke();ctx.restore()}
 function render(ctx,real,story){
  const active=strikes.filter(e=>real>=e.real&&real<e.real+3.2),flash=active.map(e=>({...e,a:Math.exp(-(real-e.real)*5)}));
  let gold=clamp((story-44)/12),cycle=.5+.5*Math.sin(real*.85),base=gold>.8?colors.gold:[lerp(20,88,cycle),lerp(115,40,cycle),lerp(220,240,cycle)];
  for(let y=0;y<h;y++){let v=y/(h-1);for(let x=0;x<w;x++){let u=x/(w-1),n=noise(u*4+real*.13,v*3-real*.09,real*.13),fine=noise(u*11-real*.06,v*8+real*.07,real*.2),flow=noise(u*2-real*.1,v*3,real*.09);
   let du=.045*Math.sin(v*9+real*.65)+.11*(flow-.5),dv=.035*Math.sin(u*8-real*.5)+.08*(n-.5);let sx=clamp(u+du)* (w-1),sy=clamp(v+dv)*(h-1),ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy,ix1=Math.min(w-1,ix+1),iy1=Math.min(h-1,iy+1),a=(iy*w+ix)*4,b=(iy*w+ix1)*4,c=(iy1*w+ix)*4,e=(iy1*w+ix1)*4,j=(y*w+x)*4;
   let wave=Math.max(0,Math.sin(real*1.45-u*7+v*3))**4,density=clamp((n*.73+fine*.27-.32)*2.4),edge=.23+.77*Math.abs(u-.5)*2,illum=(.12+wave*.7)*density*edge,light=[base[0]*illum,base[1]*illum,base[2]*illum];
   for(const fl of flash){let dx=u-fl.x,dy=v-.45,spatial=Math.exp(-(dx*dx*7+dy*dy*1.3));for(let k=0;k<3;k++)light[k]+=fl.rgb[k]*fl.a*spatial*(.35+density*.9)}
   for(let k=0;k<3;k++){let sample=lerp(lerp(pixels[a+k],pixels[b+k],fx),lerp(pixels[c+k],pixels[e+k],fx),fy);let tint=lerp(1,k===2?.65:k===0?1.35:.92,gold);data[j+k]=clamp(sample*(.56+density*.6)*tint+light[k]*.85,0,255)}data[j+3]=255;
  }}s.putImageData(frame,0,0);
  ctx.fillStyle='#01050c';ctx.fillRect(0,0,W,H);ctx.drawImage(sky,0,15,W,480);
  // The floor material stays planar while its reflected sky and light move.
  ctx.drawImage(image,0,image.height*.65,image.width,image.height*.35,0,480,W,240);
  ctx.save();ctx.globalAlpha=.26;ctx.translate(0,690);ctx.scale(1,-.42);ctx.drawImage(sky,0,0,W,480);ctx.restore();
  for(let i=0;i<9;i++){let p=((real*.25+i/9)%1),y=488+p*p*200;glow(ctx,W*(.5+.35*Math.sin(real*.22+i)),y,200+200*p,2+p*7,base,.045+.05*(1-p))}
  // Traveling ribbons of emitted color, clearly independent of camera motion.
  glow(ctx,160+980*(.5+.5*Math.sin(real*.34)),350+60*Math.sin(real*.5),300,140,base,.08);
  for(const e of active){let dt=real-e.real,a=Math.exp(-dt*7),pts=boltPoints(e),end=pts[pts.length-1];
   if(a>.025){drawBolt(ctx,pts,a,e.rgb);for(let b=0;b<3;b++){let at=pts[16+b*12],branch=[at];for(let k=1;k<=4;k++)branch.push([at[0]+(b%2?1:-1)*k*17+(rand(e.seed+b*23+k)-.5)*22,at[1]+k*15]);drawBolt(ctx,branch,a*.75,e.rgb,1)}
    ctx.save();ctx.globalAlpha=.32;ctx.translate(0,660);ctx.scale(1,-.35);drawBolt(ctx,pts,a,e.rgb);ctx.restore();
   }
   glow(ctx,e.x*W,330,450,270,e.rgb,a*.28);glow(ctx,end[0],497,110,15,e.rgb,Math.exp(-dt*2)*.65);
   // Expanding waves are projected ellipses on the reflective floor.
   for(let k=0;k<3;k++){let age=dt-k*.14;if(age<0)continue;let radius=30+age*300,alpha=clamp((1-age/2.8)*.5);ctx.save();ctx.strokeStyle=`rgba(${e.rgb},${alpha})`;ctx.shadowColor=`rgb(${e.rgb})`;ctx.shadowBlur=12;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(end[0],505,radius,radius*.15,0,0,Math.PI*2);ctx.stroke();ctx.restore()}
  }
  // Depth-sorted luminous dust speeds up during the splitting sequence.
  let speed=story>=28&&story<47?1.8:.7;for(let i=0;i<100;i++){let z=.3+rand(i+600),x=(rand(i+90)*W+real*(rand(i+70)-.5)*30*speed+W*8)%W,y=(rand(i+800)*H-real*(5+rand(i+700)*15)*speed+H*20)%H;ctx.strokeStyle=`rgba(120,197,255,${.1+.25*z})`;ctx.lineWidth=z;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+speed*z*2,y+speed*z*5);ctx.stroke()}
 }
 return {render,strikes};
}
module.exports={createStorm,realAt};
