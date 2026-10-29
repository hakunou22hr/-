/* Geometric mist: advected ribbons, contour sheets and suspended nodes.
   Atmospheric smoke is a photographic material; the moving geometry is 3D. */
(function(root){
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t;
 const rand=i=>{let x=Math.sin(i*127.12+41)*43758.5453;return x-Math.floor(x)};
 const palette={blue:[85,188,246],violet:[153,167,238],gold:[246,203,139]};
 function create(W,H,makeCanvas,atmosphere,schedule,duration=30){
  const original=schedule.storyCuts,cuts=schedule.editions[String(duration)];
  function realAt(t){let i=original.findIndex((v,j)=>j&&t<v)-1;if(i<0)i=6;return cuts[i]+(t-original[i])/(original[i+1]-original[i])*(cuts[i+1]-cuts[i])}
  const strikes=(schedule.thunder?.[String(duration)]||schedule.strikes).map((e,i)=>({...e,type:'wave',real:e.time??realAt(e.t),y:e.y??.64,seed:i+30,rgb:palette[e.color]})),manual=[],layer=makeCanvas(W,H),lc=layer.getContext('2d');let serial=200;
  function trigger(type,time,x=.5,y=.5){let e={type,real:time,x:clamp(x,.04,.96),y:clamp(y,.1,.8),seed:serial++,rgb:type==='gather'?palette.gold:palette.blue};manual.push(e);if(manual.length>64)manual.shift();return e}
  function glow(ctx,x,y,rx,ry,rgb,a){if(a<.001)return;ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);let g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,`rgba(${rgb},${clamp(a)})`);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore()}
  function render(ctx,time,story=22,options={}){
   const events=(options.automatic===false?[]:strikes).concat(manual).filter(e=>time>=e.real&&time-e.real<5.5),gold=clamp((story-44)/20),base=palette.blue.map((v,i)=>mix(v,palette.gold[i],gold));
   let zoom=1.025+.012*Math.sin(time*.095),pan=12*Math.sin(time*.065);ctx.fillStyle='#01050c';ctx.fillRect(0,0,W,H);
   if(atmosphere)ctx.drawImage(atmosphere,-(zoom-1)*W/2+pan,-(zoom-1)*H/2,W*zoom,H*zoom);
   ctx.fillStyle='rgba(0,7,18,.23)';ctx.fillRect(0,0,W,H);
   glow(ctx,190+55*Math.sin(time*.16),350,300,245,base,.10);glow(ctx,W-150,355,260,230,palette.gold,.055+gold*.06);
   const yaw=.12*Math.sin(time*.09),pitch=.035*Math.cos(time*.075),ca=Math.cos(yaw),sa=Math.sin(yaw);
   function project(v){let x=v[0]*ca+v[2]*sa,z=-v[0]*sa+v[2]*ca,y=v[1]*Math.cos(pitch)-z*Math.sin(pitch),zz=v[1]*Math.sin(pitch)+z*Math.cos(pitch),s=940/(19+zz);return [W*.5+x*s,H*.712-y*s,s]}
   function protect(p){return p[0]>W*.25&&p[0]<W*.9&&p[1]>H*.21&&p[1]<H*.64?.40:1}
   function deform(v){let out=v.slice();for(const e of events){let age=time-e.real,life=Math.sin(clamp(age/5.5)*Math.PI),tx=(e.x-.5)*21,ty=(.71-e.y)*14,dx=out[0]-tx,dy=out[1]-ty,dist=Math.sqrt(dx*dx+dy*dy+out[2]*out[2]*.3),fall=Math.exp(-dist*dist/32);
    if(e.type==='gather'){let pull=life*fall*.72;out[0]=mix(out[0],tx,pull);out[1]=mix(out[1],ty,pull);out[2]*=1-pull*.6}
    if(e.type==='vortex'){let a=life*fall*1.7,cs=Math.cos(a),sn=Math.sin(a);out[0]=tx+dx*cs-dy*sn;out[1]=ty+dx*sn+dy*cs;out[2]+=life*fall*Math.sin(dist*2-age)*.7}
    if(e.type==='wave'){let wave=Math.sin(dist*2.5-age*3.3)*Math.exp(-Math.abs(dist-age*1.9)*.8)*life;out[2]+=wave*.85*(e.visualGain??1);out[1]+=wave*.22*(e.visualGain??1)}
   }return out}
   function point(side,u,b){let theta=u*4.7+time*.18+side*.9,width=1.05+2.1*u,fractal=.30*Math.sin(u*10+time*.24+b)+.14*Math.sin(u*23-time*.36+b*2)+.065*Math.sin(u*51+time*.48+b*4),x=side*(6.9-1.15*u)+Math.sin(u*7-time*.34+side)*(.32+u*.55)+b*width*Math.cos(theta)+Math.sin(b*1.8+theta)*width*.32+fractal,y=.12+u*8.3+.20*Math.sin(u*13+time*.42+b*2)+fractal*.22,z=Math.sin(u*5-time*.25+side)*1.15+b*width*Math.sin(theta)+Math.cos(b*1.8+theta)*width*.40+fractal*.55;return deform([x,y,z])}
   function path(ct,pts){ct.beginPath();pts.forEach((p,i)=>i?ct.lineTo(p[0],p[1]):ct.moveTo(p[0],p[1]))}
   function poly(pts,col,a,width=.7,blur=0){let center=pts[Math.floor(pts.length/2)];lc.strokeStyle=`rgba(${col},${a*protect(center)})`;lc.lineWidth=width;lc.shadowColor=`rgb(${col})`;lc.shadowBlur=blur;path(lc,pts);lc.stroke();lc.shadowBlur=0}
   lc.clearRect(0,0,W,H);
   for(const side of [-1,1]){
    const rows=49,cols=21,grid=[];for(let i=0;i<rows;i++){let row=[];for(let j=0;j<cols;j++)row.push(project(point(side,i/(rows-1),j/(cols-1)*2-1)));grid.push(row)}
    // Longitudinal filaments carry light upward through the volume.
    for(let j=0;j<cols;j+=2){let pts=grid.map(row=>row[j]);poly(pts,base,.66,1.05)}
    // Cross-sections are contours of the same breathing, twisting surface.
    for(let i=0;i<rows;i++){let u=i/(rows-1),pulse=Math.max(0,Math.cos((u-time*.10)*Math.PI*4))**9,eventLight=0;for(const e of events)eventLight+=Math.exp(-Math.abs(u-(time-e.real)*.33)*15)*.65*(e.visualGain??1);
     poly(grid[i],base,.44+pulse*.44+eventLight,1.05+pulse*.5,pulse>.8?5:0);
     if(i%3===0){for(let j=0;j<cols-2;j+=2){let a=grid[i][j],b=grid[i][j+2],d=grid[Math.min(rows-1,i+3)][j+1];path(lc,[a,b,d,a]);lc.fillStyle=`rgba(${base},${.025*protect(a)})`;lc.fill()}}
     for(let j=0;j<cols;j+=3){let p=grid[i][j],bright=.48+pulse*.55+eventLight*.4;lc.fillStyle=`rgba(${base},${clamp(bright)*protect(p)})`;lc.beginPath();lc.arc(p[0],p[1],.65+pulse*.8,0,Math.PI*2);lc.fill()}
    }
    // Free streamlines peel off the sheet and slowly dissolve into points.
    for(let k=0;k<18;k++){let phase=(time*.045+k/18)%1,pts=[];for(let j=0;j<22;j++){let u=phase-j*.009;if(u<0)continue;let v=point(side,u,Math.sin(k*2.4)*1.18);v[2]+=Math.sin(k+time*.2)*.6;pts.push(project(v))}if(pts.length>1)poly(pts,base,.42,1.0)}
   }
   // Shallow wave sheets gather along the floor; no impact rings or fireballs.
   for(let k=0;k<9;k++){let pts=[];for(let j=0;j<=90;j++){let x=-14+j/90*28,y=.16+Math.sin(x*.40-time*.45+k*.24)*.16,z=-1.5+k*.4+Math.sin(x*.35+time*.19)*.8;pts.push(project(deform([x,y,z])))}poly(pts,base,.08,.65)}
   ctx.drawImage(layer,0,0);ctx.save();ctx.beginPath();ctx.rect(0,H*.67,W,H*.33);ctx.clip();ctx.globalAlpha=.17;ctx.translate(0,H*1.02);ctx.scale(1,-.35);ctx.drawImage(layer,0,0);ctx.restore();
   for(let i=0;i<190;i++){let u=(time*.035+rand(i+55))%1,side=i%2?1:-1,v=point(side,u,(rand(i+11)-.5)*2.8),p=project(v),alpha=Math.sin(u*Math.PI)*.58*protect(p);ctx.fillStyle=`rgba(${base},${alpha})`;ctx.beginPath();ctx.arc(p[0],p[1],.7+rand(i+72),0,Math.PI*2);ctx.fill()}
   for(const e of events){let age=time-e.real,a=Math.sin(clamp(age/5.5)*Math.PI),x=e.x*W,y=e.y*H;glow(ctx,x,y,120+age*45,85+age*25,e.rgb,a*.07*(e.visualGain??1))}
   return {manualEvents:manual.length,activeEvents:events.length};
  }
  return {render,trigger,strikes,realAt,reset(){manual.length=0}};
 }
 root.MathFilmEffects={create};
})(globalThis);
