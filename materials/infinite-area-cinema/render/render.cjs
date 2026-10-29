// Dynamic lightning edition v8: atmospheric plate, a moving perspective camera,
// projected planar mathematics, floor reflections, layered fog and light.
const {createCanvas,GlobalFonts,loadImage}=require(process.env.CANVAS_MODULE||'@napi-rs/canvas');
const {spawn}=require('child_process'),{once}=require('events'),fs=require('fs'),path=require('path');
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','JP');
GlobalFonts.registerFromPath('/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf','Math');
const W=1280,H=720,FPS=24,D=Number(process.env.DURATION||120),out=path.resolve(process.env.OUTPUT||'work/infinite-area-v8');
if(![30,120].includes(D))throw Error('DURATION must be 30 or 120');fs.mkdirSync(out,{recursive:true});
const C=createCanvas(W,H),c=C.getContext('2d'),R=createCanvas(W,H),r=R.getContext('2d');
const F=createCanvas(W,H),fctx=F.getContext('2d'),G=createCanvas(W,H),gctx=G.getContext('2d');
const cuts=D===120?[0,16,30,46,78,96,108,120]:[0,4,7,11,19,24,27,30];
const original=[0,10,18,28,47,59,67,75],CY='#92e9ff',GOLD='#ffdb9b',WHITE='#edf8ff';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),smooth=x=>(x=clamp(x),x*x*(3-2*x)),mix=(a,b,t)=>a+(b-a)*t;
const rand=i=>{let a=Math.sin(i*127.12+42)*43758.53;return a-Math.floor(a)};
function timeAt(t){let i=cuts.findIndex((v,j)=>j>0&&t<v)-1;if(i<0)i=6;return original[i]+(t-cuts[i])/(cuts[i+1]-cuts[i])*(original[i+1]-original[i])}
function shape(ctx,pts,close=false){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));if(close)ctx.closePath()}
function stroke(ctx,pts,col,width=1,glow=0,close=false){shape(ctx,pts,close);ctx.strokeStyle=col;ctx.lineWidth=width;ctx.shadowColor=col;ctx.shadowBlur=glow;ctx.stroke();ctx.shadowBlur=0}
function text(ctx,s,x,y,size=22,col=WHITE,align='left',alpha=1){ctx.save();ctx.globalAlpha*=alpha;ctx.font=`${size}px JP`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.shadowColor='#00101c';ctx.shadowBlur=9;ctx.fillStyle=col;ctx.fillText(s,x,y);ctx.restore()}
let images={},storm;const {createStorm}=require('./storm.cjs');
function equation(ctx,name,x,y,w,a=1,reflection=false){let im=images[name],h=w*im.height/im.width;ctx.save();ctx.globalAlpha*=a;ctx.shadowColor='#95d9ff';ctx.shadowBlur=14;ctx.drawImage(im,x-w/2,y-h/2,w,h);ctx.shadowBlur=0;if(reflection){ctx.globalAlpha*=.15;ctx.translate(0,1000);ctx.scale(1,-.47);ctx.drawImage(im,x-w/2,y-h/2,w,h)}ctx.restore()}
function ellipseGlow(ctx,x,y,rx,ry,color,alpha){ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);let g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.globalAlpha*=alpha;ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore()}
function background(t,shot,realTime){storm.render(c,realTime,t);}
function camera(t){
 let yaw,dist,base,center,pitch;
 if(t<18){let u=smooth((t-10)/8);yaw=mix(-.62,-.30,u);dist=mix(22,19,u);base=mix(526,515,u);center=570;pitch=.06;}
 else if(t<28){let u=smooth((t-18)/10);yaw=mix(.38,.12,u);dist=mix(17.8,19,u);base=516;center=535;pitch=.025;}
 else if(t<47){let u=smooth((t-28)/19);yaw=mix(-.48,.025,u);dist=mix(18.8,20,u);base=mix(538,509,u);center=mix(585,540,u);pitch=mix(.09,.0,u);}
 else if(t<59){let u=smooth((t-47)/12);yaw=mix(.18,0,u);dist=mix(20.5,21,u);base=503;center=510;pitch=0;}
 else if(t<67){yaw=-.05;dist=21;base=493;center=510;pitch=0;}
 else {let u=smooth((t-67)/8);yaw=mix(.10,-.03,u);dist=mix(20.5,23,u);base=mix(523,500,u);center=470;pitch=.018;}
 return {yaw,dist,base,center,pitch};
}
function projector(cam,mirror=false){return (x,y,z=0)=>{let xx=(x-3)*2.5,yy=y*.24*(mirror?-1:1),zz=z;let a=xx*Math.cos(cam.yaw)+zz*Math.sin(cam.yaw),b=-xx*Math.sin(cam.yaw)+zz*Math.cos(cam.yaw),v=yy*Math.cos(cam.pitch)-b*Math.sin(cam.pitch),d=yy*Math.sin(cam.pitch)+b*Math.cos(cam.pitch),s=1030/(cam.dist+d);return [cam.center+a*s,cam.base-v*s]}}
function graphLayer(ctx,t,cam,mirror=false){let p=projector(cam,mirror),n=t<28?4:4*2**Math.min(6,Math.floor((t-28)/3)),solid=smooth((t-47)/4),reveal=smooth((t-17)/6);
 // The graph is a plane in world space; reflections mirror only its height.
 ctx.save();ctx.lineJoin='round';
 stroke(ctx,[p(-.25,0),p(6.12,0)],WHITE,1.4,5);stroke(ctx,[p(0,-.2),p(0,28.5)],WHITE,1.2,4);
 if(!mirror){let ax=p(6.12,0);stroke(ctx,[[ax[0]-8,ax[1]-4],ax,[ax[0]-9,ax[1]+4]],WHITE,1.2);let ay=p(0,28.5);stroke(ctx,[[ay[0]-4,ay[1]+8],ay,[ay[0]+4,ay[1]+8]],WHITE,1.2);}
 if(solid>.001){let pts=[p(2,0)];for(let i=0;i<=120;i++){let x=2+3*i/120;pts.push(p(x,x*x))}pts.push(p(5,0));shape(ctx,pts,true);let g=ctx.createLinearGradient(0,160,0,cam.base+80);g.addColorStop(0,`rgba(255,212,137,${.68*solid})`);g.addColorStop(1,`rgba(255,187,80,${.10*solid})`);ctx.fillStyle=g;ctx.fill();stroke(ctx,[p(2,0),p(2,4)],GOLD,1.2,6);stroke(ctx,[p(5,0),p(5,25)],GOLD,1.2,6)}
 if(t>=17&&solid<.999){for(let k=1;k<=n;k++){let x=2+3*k/n,l=x-3/n,h=x*x,phase=(t-28)%3,blend=smooth(phase/.6);if(t>=28&&n>4){let old=2+Math.ceil(k/2)*6/n;h=mix(old*old,h,blend)}h*=smooth(reveal*1.55-k/n*.55);let pts=[p(l,0),p(l,h),p(x,h),p(x,0)];shape(ctx,pts,true);let top=p(x,h),foot=p(x,0),grad=ctx.createLinearGradient(top[0],top[1],foot[0],foot[1]);grad.addColorStop(0,`rgba(136,228,255,${.28*(1-solid)})`);grad.addColorStop(.6,`rgba(77,167,211,${.13*(1-solid)})`);grad.addColorStop(1,`rgba(77,167,211,${.03*(1-solid)})`);ctx.fillStyle=grad;ctx.fill();ctx.globalAlpha=1-solid;stroke(ctx,pts,CY,n<=16?1.25:n<=64?.8:.45,n<=16?6:0,true);ctx.globalAlpha=1;
 if(!mirror&&n<=16){ellipseGlow(ctx,foot[0],foot[1]+2,18,2.4,'#6edbff',.12*(1-solid));ellipseGlow(ctx,top[0],top[1],7,7,'#b5f0ff',.09*(1-solid));}
 if(t>=18&&t<28&&k===2){stroke(ctx,[p(l,0),p(x,0)],CY,3.5,9);stroke(ctx,[p(x,0),p(x,h)],'#ffb2a5',2,9);let a=p(x,0);ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(a[0],a[1],3,0,Math.PI*2);ctx.fill()}
 }}
 let curve=[];let revealCurve=smooth((t-10)/3);for(let i=0;i<=180;i++){let x=5.48*i/180*revealCurve;curve.push(p(x,x*x))}stroke(ctx,curve,GOLD,2.2,9);
 if(!mirror){for(let x of [2,5]){stroke(ctx,[p(x,0),p(x,-.65)],WHITE,1,2);let a=p(x,-2);text(ctx,''+x,a[0],a[1],23,WHITE,'center');}
 let f=p(5.45,29.7);text(ctx,'y = x²',f[0]+8,f[1]+18,21,GOLD);
 if(t>=10&&t<18){let u=smooth((t-11)/2);ctx.globalAlpha=u;stroke(ctx,[p(2,-3.8),p(5,-3.8)],CY,1.4,7);let q=p(3.5,-5.8);text(ctx,'5 − 2 = 3',q[0],q[1],23,CY,'center');ctx.globalAlpha=1}
 }
 ctx.restore();return {n,p};
}
function graph(t,cam){
 r.clearRect(0,0,W,H);graphLayer(r,t,cam,true);
 // A Fresnel-like fade and small animated surface distortion in the reflection.
 r.globalCompositeOperation='destination-in';let grad=r.createLinearGradient(0,cam.base-10,0,710);grad.addColorStop(0,'rgba(255,255,255,.29)');grad.addColorStop(.3,'rgba(255,255,255,.13)');grad.addColorStop(1,'transparent');r.fillStyle=grad;r.fillRect(0,0,W,H);r.globalCompositeOperation='source-over';
 gctx.clearRect(0,0,W,H);gctx.filter='blur(1.1px)';gctx.drawImage(R,0,0);gctx.filter='none';c.save();for(let y=Math.floor(cam.base);y<675;y+=6){let dx=Math.sin(y*.16+t*1.8)*(y-cam.base)*.012;c.drawImage(G,0,y,W,6,dx,y,W,6)}c.restore();
 return graphLayer(c,t,cam,false);
}
function intro(t){let u=smooth(t/5),w=mix(1220,870,u),h=w*images.sum.height/images.sum.width,cx=640+mix(90,-18,u),cy=310,tilt=mix(32,-6,u),skew=mix(50,-4,u);let quad=[[cx-w/2+skew,cy-h/2+tilt],[cx+w/2,cy-h/2-tilt],[cx+w/2-skew,cy+h/2-tilt],[cx-w/2,cy+h/2+tilt]];
 fctx.clearRect(0,0,W,H);fctx.save();fctx.translate(cx,cy);fctx.transform(1,-2*tilt/w,skew/w,1,0,0);fctx.globalAlpha=smooth(t/1.3);fctx.drawImage(images.sum,-w/2,-h/2,w,h);fctx.restore();c.save();c.shadowBlur=14;c.shadowColor='#b6e9ff';c.drawImage(F,0,0);c.shadowBlur=0;c.restore();
 c.save();c.globalAlpha=.19;c.translate(0,707);c.scale(1,-.45);c.filter='blur(2px)';c.drawImage(F,0,0);c.restore();
 ellipseGlow(c,640,493,430,18,'#93d9ff',.09);text(c,'無限が、面積になる瞬間',640,113,25,WHITE,'center',smooth((t-.6)/1.3));text(c,'無限の足し算。その先にある、ひとつの形。',640,580,20,'#bed5e4','center',smooth((t-2)/1.5));
}
const titles=['','2から5へ。','幅と、高さ。','細分化。','和から、積分へ。','計算する。','無限の先に、39。'];
const captions=['','幅は 3/n。区間の長さは3。','右端の位置を二乗した値が、長方形の高さになる。','分けるほど細かく。面積の和は39へ近づく。','無限に細かい長方形の和。それが、定積分。','原始関数に、5と2を代入する。','無数の長方形が、ひとつの面積へ。'];
function draw(realTime){let t=timeAt(realTime),shot=Math.max(0,original.findIndex((v,i)=>i>0&&t<v)-1),local=t-original[shot];background(t,shot,realTime);
 if(t<10)intro(t);else{let cam=camera(t),{n}=graph(t,cam);text(c,titles[shot],74,76,21,WHITE,'left',smooth(local/.6));
 if(t<18){text(c,'a = 2',1040,284,25,CY,'center');text(c,'b = 5',1040,330,25,GOLD,'center');}
 else if(t<28){equation(c,'parts',640,602,780,smooth((t-18)/1.2));}
 else if(t<47){text(c,'n = '+n,1090,281,38,CY,'center');text(c,'Δx → 0',1090,337,23,WHITE,'center');let sum=39+31.5/n+4.5/n**2;if(n>4)sum=mix(39+31.5/(n/2)+4.5/(n/2)**2,sum,smooth(((t-28)%3)/.6));text(c,sum.toFixed(3),1090,412,30,GOLD,'center');text(c,'→ 39',1090,452,21,GOLD,'center');
 // A moving plane of light passes through the set at each split.
 let since=(t-28)%3,pulse=Math.exp(-since*5);ellipseGlow(c,590,cam.base,450,3,'#a6eaff',.18*pulse);
 }
 else if(t<59){let k=smooth((t-47)/3);equation(c,'sum',340,597,325,1);text(c,'=',635,597,32,GOLD,'center');equation(c,'integral',880,595,185,k);text(c,'n → ∞',1085,292,30,CY,'center');text(c,'Δx → 0',1085,340,25,WHITE,'center');}
 else if(t<67){equation(c,'calc',640,594,565,smooth((t-59)/1.5));}
 else{equation(c,'answer',1020,343,350,smooth((t-67)/2));text(c,'THE AREA',1035,425,12,'#c8bca0','center',smooth((t-68)/2));}
 // Subtitle light is localized, keeping the reflective floor visible.
 ellipseGlow(c,640,658,550,37,'#00050c',.78);text(c,captions[shot],640,660,20,WHITE,'center',smooth(local/.5));
 }
 // Small foreground bokeh and a restrained photographic vignette.
 ellipseGlow(c,80+Math.sin(t*.12)*60,560,40,26,'#7bc9ff',.025);let v=c.createRadialGradient(640,340,210,640,340,780);v.addColorStop(0,'transparent');v.addColorStop(1,'rgba(0,0,0,.52)');c.fillStyle=v;c.fillRect(0,0,W,H);
 // Short optical dissolves make the change of camera angle a deliberate cut.
 if(shot>0&&local<.24){c.fillStyle=`rgba(3,11,20,${.44*(1-smooth(local/.24))})`;c.fillRect(0,0,W,H)}
 c.fillStyle='#000';c.fillRect(0,0,W,34);c.fillRect(0,686,W,34);
 let fade=smooth(realTime/.7)*(1-smooth((realTime-(D-1.2))/1.2));if(fade<1){c.fillStyle=`rgba(0,0,0,${1-fade})`;c.fillRect(0,0,W,H)}
}
(async()=>{
 for(let n of ['sum','parts','integral','calc','answer'])images[n]=await loadImage(Buffer.from(fs.readFileSync(path.join(__dirname,'assets',n+'.png.b64'),'utf8').trim(),'base64'));
 images.environment=await loadImage(path.join(__dirname,'assets','environment.png'));storm=createStorm(W,H,D,images.environment);
 const samples=process.env.SAMPLE_TIMES?JSON.parse(process.env.SAMPLE_TIMES):(D===120?[4,10,22,38,53,66,84,102,114]:[1.25,1.5,3,5.5,9,11.15,13,13.7,16,19.15,21.5,25.5,27.1,28.5]);
 for(let t of samples){draw(t);fs.writeFileSync(path.join(out,`v8-${D}s-${t}.jpg`),C.toBuffer('image/jpeg',90))}
 if(process.argv.includes('--samples'))return;
 const start=Number(process.env.CLIP_START||0),end=Number(process.env.CLIP_END||D);
 const finalPath=process.env.VIDEO_OUT||path.join(out,`infinite-area-${D}s.mp4`),tempPath=finalPath.replace(/\.mp4$/,`.rendering-${process.pid}.mp4`);
 let args=['-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgba','-video_size',`${W}x${H}`,'-framerate',String(FPS),'-i','pipe:0','-ss',String(start),'-i',path.join(out,`score-${D}.wav`),'-c:v','libx264','-preset','fast','-crf','24','-profile:v','high','-pix_fmt','yuv420p','-af','apad','-c:a','aac','-b:a','128k','-movflags','+faststart','-t',String(end-start),tempPath];
 const ff=spawn('ffmpeg',args,{stdio:['pipe','ignore','pipe']});let err='';ff.stderr.on('data',b=>err=(err+b).slice(-6000));ff.stdin.on('error',()=>{});let done=once(ff,'close');const began=Date.now();
 for(let i=Math.round(start*FPS);i<Math.round(end*FPS);i++){draw(i/FPS);if(ff.exitCode!==null)throw Error(err);if(!ff.stdin.write(C.data()))await once(ff.stdin,'drain');if(i%240===0)console.log(`v8 ${D}s ${i}/${D*FPS} | ${((Date.now()-began)/1000).toFixed(1)}s`)}ff.stdin.end();let [code]=await done;if(code)throw Error(err);fs.renameSync(tempPath,finalPath);console.log('DONE');
})();
