const TAU=Math.PI*2;
const clamp=x=>Math.max(0,Math.min(1,x));
const rnd=i=>{const v=Math.sin(i*127.1+23.7)*43758.5453;return v-Math.floor(v)};
export function background(c,w,h,t,tunnel=0){
 c.fillStyle='#030914';c.fillRect(0,0,w,h);
 for(let j=0;j<3;j++){
  const x=w*(.2+j*.29)+Math.sin(t*.16+j)*w*.13,y=h*(.3+j*.18)+Math.cos(t*.13+j)*h*.1,r=w*(.4+j*.07);
  const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,j===1?'#74552942':'#087ea64a');g.addColorStop(1,'#03091400');c.fillStyle=g;c.fillRect(0,0,w,h);
 }
 c.save();c.translate(w*.5,h*.51);c.rotate(Math.sin(t*.08)*.045+tunnel*t*.015);
 for(let j=0;j<30;j++){
  const z=((j/30+t*(.015+tunnel*.075))%1),r=20+z*z*Math.max(w,h)*.85,alpha=(.06+z*.25)*(tunnel?.9:.45);
  c.strokeStyle=j%3===0?`rgba(255,194,95,${alpha})`:`rgba(65,207,255,${alpha})`;c.lineWidth=(1+z*2)*Math.max(.6,w/1280);
  c.beginPath();c.moveTo(-r*.68,-r*.47);c.lineTo(r*.68,-r*.47);c.lineTo(r*.68,r*.47);c.lineTo(-r*.68,r*.47);c.closePath();c.stroke();
 }
 for(let j=0;j<12;j++){const a=j/12*TAU;c.strokeStyle='#3eafff17';c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a)*w,Math.sin(a)*h);c.stroke()}
 c.restore();
 for(let j=0;j<190;j++){
  const z=(rnd(j+7)+t*(.009+tunnel*.1))%1,a=rnd(j+250)*TAU+t*.025,r=z*z*Math.max(w,h),x=w*.5+Math.cos(a)*r,y=h*.51+Math.sin(a)*r;
  c.strokeStyle=j%4===0?'#ffc76d99':'#6bdfff88';c.lineWidth=1+z;
  c.beginPath();c.moveTo(x,y);c.lineTo(x-Math.cos(a)*(2+tunnel*z*40),y-Math.sin(a)*(2+tunnel*z*40));c.stroke();
 }
 const tokens=['∫','Σ','lim','x²','⅓','n → ∞'];
 c.font=`${Math.round(w*.022)}px Georgia`;c.textAlign='center';
 tokens.forEach((s,j)=>{const x=w*(.08+rnd(j+400)*.84)+Math.sin(t*.2+j)*w*.025,y=h*(.12+rnd(j+500)*.76)+Math.cos(t*.14+j)*h*.025;c.fillStyle=j%2?'#ffd28330':'#70dfff30';c.fillText(s,x,y)});
}
export function drawGraph(c,{x,y,w,h,n=4,t=0,view='2d',showCurve=true,showRects=true,fill=true,labels=true,reveal=1,highlight=-1}){
 c.save();
 const perspective=view==='3d';
 const yaw=perspective?Math.sin(t*.23)*.22+.22:0;
 function p(a,b,depth=0){return {x:x+w*(.12+a*.75)+b*w*yaw*.15+depth*w*.07,y:y+h*.88-b*h*.74-a*h*yaw*.35-depth*h*.09}}
 function path(pts,fillColor,strokeColor,lw=1){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));if(fillColor){c.closePath();c.fillStyle=fillColor;c.fill()}if(strokeColor){c.strokeStyle=strokeColor;c.lineWidth=lw;c.stroke()}}
 const line=(a,b,col='#6cdcff88',lw=1)=>path([p(...a),p(...b)],null,col,lw);
 for(let j=0;j<=4;j++){line([j/4,0],[j/4,1.05],'#5da8c31f');line([0,j/4],[1.08,j/4],'#5da8c31f')}
 if(perspective){for(let z=1;z<=6;z++)path([p(0,0,z/6),p(1,0,z/6),p(1,1,z/6)],null,'#36bdff14');}
 if(fill){const pts=[p(0,0),...Array.from({length:121},(_,i)=>p(i/120,(i/120)**2)),p(1,0)];path(pts,'#efb44730')}
 const count=Math.min(n,Math.ceil(n*reveal));
 if(showRects)for(let k=1;k<=count;k++){
  const a=(k-1)/n,b=k/n,height=b*b;
  if(perspective){path([p(b,0),p(b,height),p(b,height,.36),p(b,0,.36)],'#61cfff12','#6cdaff20');path([p(a,height),p(b,height),p(b,height,.36),p(a,height,.36)],'#ffe8ae20')}
  path([p(a,0),p(b,0),p(b,height),p(a,height)],highlight===k?'#ffe6a680':'#f6bd4d36',n>150?'#ffcf6e32':'#ffd17b99',Math.max(.5,Math.min(1.5,w/n*.08)));
  // Only the cap above x² is error. Its curved lower boundary is exact.
  const excess=[p(a,height),p(b,height),...Array.from({length:7},(_,j)=>{const z=b-(b-a)*j/6;return p(z,z*z)})];path(excess,'#ff946840');
 }
 line([0,0],[1.13,0],'#b2eaff',1.6);line([0,0],[0,1.12],'#b2eaff',1.6);line([1,0],[1,1.04],'#ffd08088',1.5);
 if(showCurve){c.save();c.shadowColor='#42dfff';c.shadowBlur=12;path(Array.from({length:161},(_,i)=>{const z=i/160*reveal;return p(z,z*z)}),null,'#6cecff',Math.max(2,w*.004));c.restore()}
 if(labels){c.font=`${Math.max(15,w*.034)}px "Noto Sans CJK JP",sans-serif`;c.textAlign='center';c.fillStyle='#e7f7ff';for(const [s,a,b]of[['0',-.035,-.065],['1',1,-.065],['x',1.12,-.065],['y',-.03,1.15]]){const q=p(a,b);c.fillText(s,q.x,q.y)}
 const q=p(.66,.91);c.fillStyle='#75e8ff';c.fillText('y = x²',q.x,q.y);
 if(fill){const q=p(.7,.24);c.fillStyle='#ffd483';c.fillText('S = 1/3',q.x,q.y)}
 }
 c.restore();return {point:p};
}
