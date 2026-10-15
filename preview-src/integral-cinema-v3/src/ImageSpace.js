import landscapeURL from '../assets/reference-atlas.jpg';
import portraitURL from '../assets/reference-atlas-portrait.jpg';

/** Reference-image art direction, composited at the final video resolution. */
export function createImageSpace(canvas,portrait) {
 const ctx=canvas.getContext('2d',{alpha:false,willReadFrequently:true}),image=new Image();
 let w=1,h=1;
 const ready=new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('Background image could not be loaded'));});
 image.src=portrait?portraitURL:landscapeURL;
 const ids=['intro','area','proof','law','sine','exercise','challenge','split','cancel','result','ending'];
 const panels=[0,0,3,3,1,1,0,3,3,2,2];
 const clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);};
 function resize(width,height){w=width;h=height;canvas.width=w;canvas.height=h;}
 function tile(index,t,p,alpha){
  const sw=Math.floor(image.naturalWidth/2),sh=Math.floor(image.naturalHeight/2);
  const sx=index%2*sw+2,sy=Math.floor(index/2)*sh+2,sourceW=sw-4,sourceH=sh-4;
  const scale=Math.max(w/sourceW,h/sourceH)*(1.025+.05*ease(p));
  const dw=sourceW*scale,dh=sourceH*scale;
  const x=(w-dw)/2+Math.sin(t*.13)*w*.008,y=(h-dh)/2+Math.cos(t*.11)*h*.006;
  ctx.globalAlpha=alpha;
  // Deform the luminous image itself, with a fixed architectural horizon.
  // Continuous horizontal ribbons avoid seams; the room edges remain anchored.
  const strips=Math.ceil(h/2);
  for(let k=0;k<strips;k++){
   const v=k/strips, envelope=Math.sin(Math.PI*v)**2;
   const flow=index===1?Math.sin(v*13-t*1.4)*.026:
    index===3?Math.sin(v*10-t*.85)*.012:
    index===2?Math.sin(v*18-t*1.2)*.007:
    Math.sin(v*22-t*2.2)*.008*Math.exp(-(((v-.52)/.2)**2));
   ctx.drawImage(image,sx,sy+sourceH*v,sourceW,sourceH/strips+.5,
    x+w*flow*envelope,y+dh*v,dw,dh/strips+1);
  }
 }
 function frame(t,id,p){
  ctx.globalAlpha=1;ctx.fillStyle='#030713';ctx.fillRect(0,0,w,h);
  if(!image.complete||!image.naturalWidth)return;
  const i=Math.max(0,ids.indexOf(id)),panel=panels[i],previous=panels[Math.max(0,i-1)],transition=ease(p/.08);
  if(previous!==panel&&transition<1){tile(previous,t,1,1);tile(panel,t,p,transition);}else tile(panel,t,p,1);
  ctx.globalAlpha=1;
  // Depth-projected flow, coherent waves and moving equation planes.
  ctx.save();ctx.globalCompositeOperation='screen';
  const gold=panel===1||panel===2, color=gold?'255,208,120':'100,235,255';
  const cx=w*.5, horizon=h*(portrait?.57:.51);
  // Perspective floor: rings accelerate towards the viewer, never a static grid.
  for(let n=0;n<16;n++){
   const d=((n/16+t*.22)%1),z=d*d,yy=horizon+z*h*.65;
   ctx.strokeStyle=`rgba(${color},${Math.sin(d*Math.PI)*.43})`;
   ctx.lineWidth=(.7+z*2.5)*w/1920;
   ctx.beginPath();ctx.moveTo(cx-w*(.02+z*.95),yy);
   ctx.lineTo(cx+w*(.02+z*.95),yy);ctx.stroke();
  }
  // A living interference ribbon runs across the corridor, with two counter waves.
  if(panel===0){
   for(let strand=0;strand<9;strand++){
    ctx.beginPath();
    for(let j=0;j<=160;j++){
     const u=j/160,xx=w*(.06+.88*u),amp=Math.sin(Math.PI*u)*h*.065;
     const yy=h*.49+Math.sin(u*Math.PI*4-t*2.6+strand*.12)*amp;
     j?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);
    }
    ctx.strokeStyle=`rgba(${color},${strand===4?.8:.17})`;
    ctx.lineWidth=(strand===4?2:1)*w/1080;ctx.stroke();
   }
  }
  // Golden spiral streams have individually moving heads, rather than a rotated still.
  if(panel===1||panel===2){
   const vx=w*(panel===1?.87:.5),vy=h*(panel===1?.4:.29);
   for(let n=0;n<65;n++){
    const q=(n/65+t*.16)%1,a=n*2.399+t*.65,r=q*q;
    const xx=vx+Math.cos(a)*r*w*.8,yy=vy+Math.sin(a)*r*h*.48;
    ctx.strokeStyle=`rgba(${color},${Math.sin(q*Math.PI)*.65})`;
    ctx.lineWidth=(1+q)*w/1080;ctx.beginPath();
    ctx.moveTo(xx,yy);ctx.lineTo(xx-Math.sin(a)*w*.015*q,yy+Math.cos(a)*h*.015*q);ctx.stroke();
   }
  }
  // Equations occupy moving side planes; the lesson's central formula remains separate.
  const symbols=['∫ f(t) dt','sin x','d/dx','F′(x)','Δx → 0','cos t'];
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(let n=0;n<18;n++){
   const d=(n/18+t*.065)%1,z=.18+d*d,side=n%2?1:-1;
   const xx=cx+side*w*(.24+z*.38),yy=h*(.13+((n*.173+t*.035)% .74));
   ctx.save();ctx.translate(xx,yy);ctx.scale(1,.88);ctx.rotate(side*.07);
   ctx.font=`italic ${Math.max(14,w*.03*z)}px Georgia`;
   ctx.fillStyle=`rgba(${color},${Math.sin(d*Math.PI)*.62})`;
   ctx.fillText(symbols[n%symbols.length],0,0);ctx.restore();
  }
  for(let n=0;n<100;n++){
   const d=(n*.113+t*.17)%1,a=n*2.399+t*.14;
   const xx=cx+Math.cos(a)*d*w*.75,yy=h*.5+Math.sin(a)*d*h*.65;
   ctx.fillStyle=`rgba(${color},${.12+.55*d})`;ctx.beginPath();
   ctx.arc(xx,yy,(.6+d*2)*w/1080,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();window.mathematicalSpaceRendered=true;
 }
 return {resize,frame,ready};
}
