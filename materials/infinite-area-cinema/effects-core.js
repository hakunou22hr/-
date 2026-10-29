/* Shared particle effects for the film and the user-controlled preview.
   Smoke is emitted, advected, expanded and dissipated; no sky-image warping. */
(function(root){
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t;
 const rand=i=>{let x=Math.sin(i*127.12+41)*43758.5453;return x-Math.floor(x)};
 const palette={blue:[68,159,242],violet:[163,109,232],gold:[255,166,64]};
 function create(W,H,makeCanvas,floor,schedule,duration=30){
  const original=schedule.storyCuts,cuts=schedule.editions[String(duration)];
  function realAt(t){let i=original.findIndex((v,j)=>j&&t<v)-1;if(i<0)i=6;return cuts[i]+(t-original[i])/(original[i+1]-original[i])*(cuts[i+1]-cuts[i])}
  const strikes=schedule.strikes.map((e,i)=>({...e,real:realAt(e.t),seed:i+30,rgb:palette[e.color]}));
  const sprites={};
  // Billowing density sprites are generated from overlapping irregular lobes.
  for(let color of ['blue','violet','gold','ash'])for(let variant=0;variant<4;variant++){
   let cv=makeCanvas(112,112),ct=cv.getContext('2d'),rgb=color==='ash'?[73,90,111]:palette[color];
   let im=ct.createImageData(112,112),data=im.data;
   function hash(x,y){return rand(x*31+y*113+variant*311)}
   function noise(x,y){let ix=Math.floor(x),iy=Math.floor(y),u=x-ix,v=y-iy;u=u*u*(3-2*u);v=v*v*(3-2*v);return mix(mix(hash(ix,iy),hash(ix+1,iy),u),mix(hash(ix,iy+1),hash(ix+1,iy+1),u),v)}
   for(let y=0;y<112;y++)for(let x=0;x<112;x++){let u=(x-56)/52,v=(y-56)/52,n=.52*noise(x/25,y/25)+.28*noise(x/11,y/11)+.14*noise(x/5,y/5)+.06*noise(x/2,y/2),edge=clamp(1-Math.sqrt(u*u+v*v)),density=clamp((n-.31)*3.8)*Math.pow(edge,.55),light=.40+1.0*clamp(n-.35)+.25*clamp(-u-v),j=(y*112+x)*4;
    for(let k=0;k<3;k++)data[j+k]=rgb[k]*light;data[j+3]=255*density*.65;
   }ct.putImageData(im,0,0);
   sprites[color+variant]=cv;
  }
  const manual=[],layer=makeCanvas(W,H),lc=layer.getContext('2d');let serial=200;
  function trigger(type,time,x=.5,y=.6){let e={type,real:time,x:clamp(x,.04,.96),y:clamp(y,.12,.78),seed:serial++,color:type==='explosion'?'gold':'blue'};e.rgb=palette[e.color];manual.push(e);if(manual.length>128)manual.shift();return e}
  function glow(ctx,x,y,rx,ry,rgb,a){if(a<.001||rx<=0||ry<=0)return;ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);let g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,`rgba(${rgb},${clamp(a)})`);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore()}
  function puff(ctx,x,y,r,alpha,color,seed,angle=0){if(alpha<.001||r<1)return;ctx.save();ctx.globalAlpha=clamp(alpha);ctx.translate(x,y);ctx.rotate(angle);ctx.drawImage(sprites[color+(Math.abs(seed)%4)],-r,-r,2*r,2*r);ctx.restore()}
  function jet(ctx,time,side,strength=1,start=0){
   const frequency=22,life=5.4,now=time-start;if(now<0)return;
   for(let j=Math.max(0,Math.floor((now-life)*frequency));j<=Math.floor(now*frequency);j++){
    let age=now-j/frequency,seed=j+side*700,k=rand(seed+40),speed=(78+k*80)*strength,dir=side===0?1:-1;
    let x=(side===0?-45:W+45)+dir*speed*age+(Math.sin(age*2.8+seed)*18)*age;
    let y=H*.64-age*(22+rand(seed+90)*22)-Math.sin(age*2.2+seed)*age*12;
    // Wind injection adds a real force impulse to the particle trajectories.
    for(const e of manual){if(e.type!=='wind')continue;let a=time-e.real;if(a>=0&&a<3){let force=Math.exp(-a*.8)*Math.min(a*3,1);x+=(e.x<.5?1:-1)*force*140;y-=force*30*Math.sin(age+seed)}}
    let centerFade=Math.abs(x-W*.5)<W*.23?.20:1,alpha=Math.sin(clamp(age/life)*Math.PI)*.54*centerFade,r=20+age*18+k*18;
    puff(ctx,x,y,r,alpha,side===0?'blue':'violet',seed,age*.16*(side?1:-1));
   }
  }
  function burst(ctx,e,age){
   if(age<0||age>5.2)return;let x=e.x*W,y=(e.y??.64)*H,rgb=e.rgb||palette.gold;
   glow(ctx,x,y,200*(1+age),130*(1+age*.4),rgb,Math.exp(-age*5)*.65);
   // Fireball shell grows outward, cools, lifts and breaks into smoke lobes.
   for(let i=0;i<105;i++){
    let seed=e.seed*500+i,delay=rand(seed+40)*.16,a=age-delay;if(a<0)continue;
    let theta=rand(seed)*Math.PI*2,speed=80+rand(seed+20)*140,dist=speed*(1-Math.exp(-a*1.25)),xx=x+Math.cos(theta)*dist+Math.sin(a*2+seed)*a*8,yy=y+Math.sin(theta)*dist*.66-a*a*14;
    let radius=12+rand(seed+90)*22+a*(18+rand(seed+22)*12),alpha=clamp(1-a/4.8)*.64,color=a<.52?'gold':a<1.15?e.color||'blue':'ash';
    puff(ctx,xx,yy,radius,alpha,color,seed,a*(rand(seed+3)-.5));
   }
   glow(ctx,x,y,24+age*150,20+age*110,[255,238,194],Math.exp(-age*8)*.95);
   // Ballistic sparks, with gravity and visible fading trails.
   ctx.save();ctx.globalCompositeOperation='screen';for(let i=0;i<75;i++){
    let seed=e.seed*77+i,life=1+rand(seed+55)*1.8;if(age>life)continue;let theta=rand(seed)*Math.PI*2,v=90+rand(seed+12)*240,vx=Math.cos(theta)*v,vy=Math.sin(theta)*v*.75-80,xx=x+vx*age,yy=y+vy*age+65*age*age;
    ctx.strokeStyle=`rgba(255,${150+Math.floor(rand(seed)*90)},100,${clamp(1-age/life)})`;ctx.lineWidth=.7+rand(seed+9)*1.2;ctx.beginPath();ctx.moveTo(xx-vx*.045,yy-(vy+130*age)*.045);ctx.lineTo(xx,yy);ctx.stroke();
   }ctx.restore();
   for(let k=0;k<2;k++){let a=age-k*.12;if(a<0)continue;let r=30+a*390,alpha=clamp((1-a/2.1)*.5);ctx.strokeStyle=`rgba(${rgb},${alpha})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,H*.705,r,r*.18,0,0,Math.PI*2);ctx.stroke()}
  }
  function lightning(ctx,e,age){if(age<0||age>.7)return;let alpha=Math.exp(-age*8),pts=[],x=e.x*W,y=45;pts.push([x,y]);for(let i=1;i<=42;i++){x+=(rand(e.seed*100+i)-.5)*27;y=45+i*10;pts.push([x,y])}
   function path(p,w,col){ctx.beginPath();p.forEach((v,i)=>i?ctx.lineTo(...v):ctx.moveTo(...v));ctx.lineWidth=w;ctx.strokeStyle=col;ctx.stroke()}
   ctx.save();ctx.globalAlpha=alpha;ctx.shadowColor=`rgb(${e.rgb})`;ctx.shadowBlur=22;path(pts,3,`rgb(${e.rgb})`);ctx.shadowBlur=8;path(pts,1.2,'#f1faff');for(let j=0;j<3;j++){let at=pts[10+j*10],p=[at];for(let i=1;i<7;i++)p.push([at[0]+(j%2?-1:1)*i*11+(rand(i+e.seed)-.5)*18,at[1]+i*12]);path(p,.8,'#bfddff')}ctx.restore();glow(ctx,e.x*W,350,300,220,e.rgb,alpha*.2);
  }
  function render(ctx,time,story=22,options={}){
   let automatic=options.automatic!==false,scheduled=automatic?strikes:[],events=scheduled.concat(manual);
   ctx.fillStyle='#020710';ctx.fillRect(0,0,W,H);let sky=ctx.createRadialGradient(W*.5,H*.56,0,W*.5,H*.5,W*.75);sky.addColorStop(0,'#10253b');sky.addColorStop(1,'#01030a');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
   // Only the planar floor uses the photograph; the sky consists of particles.
   if(floor)ctx.drawImage(floor,0,floor.height*.65,floor.width,floor.height*.35,0,H*.665,W,H*.335);
   ctx.fillStyle='rgba(1,5,12,.35)';ctx.fillRect(0,H*.665,W,H*.335);
   for(let j=0;j<50;j++){let x=rand(j+77)*W,y=(rand(j+43)*H-time*(2+rand(j)*4)+H*30)%H;ctx.fillStyle=`rgba(158,198,235,${.08+rand(j+7)*.16})`;ctx.fillRect(x,y,1,1)}
   lc.clearRect(0,0,W,H);jet(lc,time,0);jet(lc,time,1);
   for(const e of events){let age=time-e.real;if(age<0)continue;if(e.type==='wind'){if(age<3){glow(lc,e.x*W,e.y*H,80+age*160,30+age*25,palette.blue,Math.exp(-age)*.2);for(let i=0;i<35;i++){let a=age-i*.02;if(a<0)continue;puff(lc,e.x*W+(e.x<.5?1:-1)*a*260,e.y*H-Math.sin(a*2+i)*35,22+a*22,clamp(1-a/2.5)*.5,'blue',i,a*.2)}}}
    else {if(e.type!=='explosion')lightning(lc,e,age);if(e.type==='explosion'||e.impact==='burst')burst(lc,e,age);}
   }
   ctx.drawImage(layer,0,0);ctx.save();ctx.beginPath();ctx.rect(0,H*.67,W,H*.33);ctx.clip();ctx.translate(0,H*1.03);ctx.scale(1,-.36);ctx.globalAlpha=.20;ctx.drawImage(layer,0,0);ctx.restore();
   // Return values support interaction and allow causal-effect verification.
   return {manualEvents:manual.length,activeEvents:events.filter(e=>time>=e.real&&time-e.real<5.2).length};
  }
  return {render,trigger,strikes,realAt,reset(){manual.length=0}};
 }
 root.MathFilmEffects={create};
})(globalThis);
