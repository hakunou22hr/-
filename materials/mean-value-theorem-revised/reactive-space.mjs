// Deterministic 3D depth field. Reacts to measurements and equality, not a looping movie.
export function drawReactiveSpace(c,{width=1080,height=1920,time=0,focus={x:350,y:1100},measure=0,match=0,burst=0,calm=false}={}){
 const W=1080,H=1920,t=calm?0:time,fx=focus.x*W/width,fy=focus.y*H/height;
 c.save();c.scale(width/W,height/H);c.globalCompositeOperation='screen';
 const horizon=820+18*Math.sin(t*.19),vanish=370+30*Math.sin(t*.13),project=(x,y,z)=>{const d=1+z*.085;return[vanish+x/d,horizon+y/d]};
 // Layered luminous atmospheric folds move at different depths, never rotating behind the text.
 for(let j=0;j<7;j++){
  const pts=[];for(let i=0;i<=64;i++){const u=i/64,x=-300+u*1700,z=12+j*7+3*Math.sin(u*6+t*.17),y=-420+j*95+85*Math.sin(u*5+t*.23+j*.7)+30*Math.sin(u*13-t*.33);pts.push(project(x-vanish,y,z))}
  c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));const color=j%3?'#277fbc':'#8566bf',fade=c.createLinearGradient(pts[0][0],pts[0][1],pts[64][0],pts[64][1]);fade.addColorStop(0,color+'00');fade.addColorStop(.3,color+'80');fade.addColorStop(.7,color+'80');fade.addColorStop(1,color+'00');c.save();c.strokeStyle=fade;c.shadowColor=color;c.shadowBlur=32;c.globalAlpha=.12+measure*.04;c.lineWidth=18+j*4;c.stroke();c.shadowBlur=12;c.globalAlpha=.22;c.lineWidth=1;c.stroke();c.restore();
 }
 // Perspective floor lattice: the measurement opens blue lanes; equality sends a golden wave.
 for(let row=0;row<38;row++){
  const z=(row*.95+t*.62)%36,pts=[];for(let col=0;col<=44;col++){const x=-1600+col*75,dist=Math.abs(x-(fx-vanish)),wave=burst*32*Math.sin(dist*.014-z*.7-t*3)*Math.exp(-dist/1200),p=project(x,540+wave,z);pts.push(p)}
  c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=match>.5&&row%4===0?'#f1b955':'#3e96b7';c.globalAlpha=.15+.12*(1-z/36);c.lineWidth=row%5===0?1.4:.65;c.stroke();
 }
 for(let col=-14;col<=16;col++){
  const pts=[];for(let i=0;i<38;i++){const z=i*.95,flow=measure*8*Math.sin(z*.6-t*2+col*.3);pts.push(project(col*95,540+flow,z))}c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=col%5?'#3b8baf':'#6acde2';c.globalAlpha=.17;c.lineWidth=col%5?.65:1.4;c.stroke();
 }
 // Non-orbiting depth streaks carry pulses toward the measured graph and into the contact point.
 for(let i=0;i<125;i++){
  const seed=Math.sin(i*91.73)*43758.5453,u=seed-Math.floor(seed),z=(i*.371+t*(.8+measure*1.6))%42,x=(Math.sin(i*2.41)*1250),y=Math.cos(i*1.73)*560,p=project(x,y,z),q=project(x,y,z+1.8),a=match*.55;
  const px=p[0]*(1-a)+fx*a,py=p[1]*(1-a)+fy*a,qx=q[0]*(1-a)+fx*a,qy=q[1]*(1-a)+fy*a;
  c.beginPath();c.moveTo(px,py);c.lineTo(qx,qy);c.strokeStyle=match>.5?'#ffd17c':i%4?'#56c2ec':'#9c87df';c.globalAlpha=.18+.22*u;c.lineWidth=.7+u*.8;c.stroke();if(i%7===0){c.fillStyle=c.strokeStyle;c.globalAlpha=.5;c.fillRect(px-1,py-1,2.2,2.2)}
 }
 // A local light well ties the backdrop to the actual moving point P.
 const glow=c.createRadialGradient(fx,fy,8,fx,fy,260);glow.addColorStop(0,match>.5?'#ffbf5c25':'#4db7f51b');glow.addColorStop(1,'#152c7300');c.fillStyle=glow;c.globalAlpha=.7;c.fillRect(fx-260,fy-260,520,520);
 if(burst>.01)for(let j=0;j<3;j++){const radius=80+j*110+(1-burst)*380;c.beginPath();c.ellipse(fx,1630,radius,radius*.19,0,0,Math.PI*2);c.strokeStyle='#ffcc80';c.globalAlpha=burst*(.45-j*.1);c.lineWidth=2-j*.4;c.stroke()}
 c.restore();
}
