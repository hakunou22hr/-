export function drawGraph(c,{x,y,w,h,n=4,t=0,view='2d',showCurve=true,showRects=true,fill=true,labels=true,reveal=1,highlight=-1,riseTime=1000,connect=false}){
 c.save();
 const perspective=view==='3d';
 const yaw=perspective?Math.sin(t*.23)*.22+.22:0;
 function p(a,b,depth=0){return {x:x+w*(.12+a*.75)+b*w*yaw*.15+depth*w*.07,y:y+h*.88-b*h*.74-a*h*yaw*.35-depth*h*.09}}
 function path(pts,fillColor,strokeColor,lw=1){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));if(fillColor){c.closePath();c.fillStyle=fillColor;c.fill()}if(strokeColor){c.strokeStyle=strokeColor;c.lineWidth=lw;c.stroke()}}
 const line=(a,b,col='#6cdcff88',lw=1)=>path([p(...a),p(...b)],null,col,lw);
 for(let j=0;j<=4;j++){line([j/4,0],[j/4,1.05],'#5da8c31f');line([0,j/4],[1.08,j/4],'#5da8c31f')}
 if(perspective){for(let z=1;z<=6;z++)path([p(0,0,z/6),p(1,0,z/6),p(1,1,z/6)],null,'#36bdff14');}
 if(fill){const pts=[p(0,0),...Array.from({length:121},(_,i)=>p(i/120,Math.sqrt(i/120))),p(1,0)];path(pts,'#efb44730')}
 const count=Math.min(n,Math.ceil(n*reveal));
 if(showRects)for(let k=1;k<=count;k++){
  const a=(k-1)/n,b=k/n,height=Math.sqrt(b)*Math.max(0,Math.min(1,(riseTime-(k-1)*.9)/1.1));
  if(perspective){path([p(b,0),p(b,height),p(b,height,.36),p(b,0,.36)],'#61cfff12','#6cdaff20');path([p(a,height),p(b,height),p(b,height,.36),p(a,height,.36)],'#ffe8ae20')}
  path([p(a,0),p(b,0),p(b,height),p(a,height)],highlight===k?'#ffe6a680':'#f6bd4d36',n>150?'#ffcf6e32':'#ffd17b99',Math.max(.5,Math.min(1.5,w/n*.08)));
  // Only the cap above x² is error. Its curved lower boundary is exact.
  const excess=[p(a,height),p(b,height),...Array.from({length:7},(_,j)=>{const z=b-(b-a)*j/6;return p(z,Math.sqrt(z))})];if(riseTime>10)path(excess,'#ff946840');
  if(connect&&highlight===k){const q=p(b,height);c.save();c.strokeStyle='#9befff';c.setLineDash([4,5]);c.beginPath();c.moveTo(q.x,q.y);c.lineTo(x+w*.7,y+h*.03);c.stroke();c.restore();}
 }
 line([0,0],[1.13,0],'#b2eaff',1.6);line([0,0],[0,1.12],'#b2eaff',1.6);line([1,0],[1,1.04],'#ffd08088',1.5);
 if(showCurve){c.save();c.shadowColor='#42dfff';c.shadowBlur=12;path(Array.from({length:161},(_,i)=>{const z=i/160*reveal;return p(z,Math.sqrt(z))}),null,'#6cecff',Math.max(2,w*.004));c.restore()}
 if(labels){c.font=`${Math.max(15,w*.034)}px "Noto Sans CJK JP",sans-serif`;c.textAlign='center';c.fillStyle='#e7f7ff';for(const [s,a,b]of[['0',-.035,-.065],['1',1,-.065],['x',1.12,-.065],['y',-.03,1.15]]){const q=p(a,b);c.fillText(s,q.x,q.y)}
 const q=p(.66,.91);c.fillStyle='#75e8ff';c.fillText('y = √x',q.x,q.y);

 }
 c.restore();return {point:p};
}
