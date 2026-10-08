// 道は外側の熱い光・金色・白い芯を重ね、光粒を流して動きを見せる。
export function drawPathGlow(c,points,time){
 if(points.length<2)return;
 const trace=()=>{c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));};
 c.save();c.lineJoin='round';c.lineCap='round';
 for(const [width,color,blur,alpha] of [[25,'#ff661a',32,.3],[14,'#ffab32',22,.7],[7,'#ffdc75',12,1],[2.5,'#fffbe3',5,1]]){c.lineWidth=width;c.strokeStyle=color;c.shadowColor=color;c.shadowBlur=blur;c.globalAlpha=alpha;trace();c.stroke();}
 c.globalAlpha=.95;c.shadowColor='#fff5b6';c.shadowBlur=15;c.strokeStyle='#fffdf1';c.lineWidth=4;c.setLineDash([17,48]);c.lineDashOffset=-time*.12;trace();c.stroke();c.setLineDash([]);
 const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1])),total=lengths.reduce((a,b)=>a+b,0);
 if(total>.01)for(let n=0;n<7;n++){
  let distance=(time*.15+n*total/7)%total,index=0;
  while(index<lengths.length-1&&distance>lengths[index]){distance-=lengths[index];index++;}
  const q=lengths[index]?distance/lengths[index]:0,a=points[index],b=points[index+1],x=a[0]+(b[0]-a[0])*q,y=a[1]+(b[1]-a[1])*q;
  c.fillStyle='#fffbd8';c.shadowBlur=22;c.beginPath();c.arc(x,y,3.5,0,Math.PI*2);c.fill();
 }
 c.restore();
}
export function drawArrival(c,x,y,time){
 const beat=(1+Math.sin(time*Math.PI*2/1400))/2,size=18+12*beat;
 c.save();
 const glow=c.createRadialGradient(x,y,0,x,y,75);glow.addColorStop(0,'#fffbd8');glow.addColorStop(.2,'#ffcf7899');glow.addColorStop(.55,'#ff6e3044');glow.addColorStop(1,'#ff6e3000');c.fillStyle=glow;c.beginPath();c.arc(x,y,75,0,7);c.fill();
 for(let i=0;i<2;i++){const p=(time/1700+i*.5)%1;c.globalAlpha=(1-p)*.85;c.strokeStyle=i?'#ff9b40':'#fff3b1';c.lineWidth=4-2*p;c.shadowColor='#ff9238';c.shadowBlur=24;c.beginPath();c.arc(x,y,24+p*65,0,7);c.stroke();}
 c.globalAlpha=1;c.shadowColor='#ff9d36';c.shadowBlur=38;c.fillStyle='#ffce66';c.beginPath();c.arc(x,y,size,0,7);c.fill();c.shadowBlur=12;c.fillStyle='#fffbea';c.beginPath();c.arc(x,y,size*.47,0,7);c.fill();
 c.shadowBlur=0;c.fillStyle='#fff5d4';c.font='bold 19px sans-serif';c.fillText('到着！',x-28,y+67);c.restore();
}
