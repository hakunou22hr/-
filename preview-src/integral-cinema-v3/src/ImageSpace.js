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
  ctx.globalAlpha=alpha;ctx.drawImage(image,sx,sy,sourceW,sourceH,x,y,dw,dh);
 }
 function frame(t,id,p){
  ctx.globalAlpha=1;ctx.fillStyle='#030713';ctx.fillRect(0,0,w,h);
  if(!image.complete||!image.naturalWidth)return;
  const i=Math.max(0,ids.indexOf(id)),panel=panels[i],previous=panels[Math.max(0,i-1)],transition=ease(p/.08);
  if(previous!==panel&&transition<1){tile(previous,t,1,1);tile(panel,t,p,transition);}else tile(panel,t,p,1);
  ctx.globalAlpha=1;
  // Animated light passes and drifting sparks are independent of the painted image.
  ctx.save();ctx.globalCompositeOperation='screen';
  const gold=panel===1||panel===2, color=gold?'255,208,120':'100,235,255';
  for(let n=0;n<95;n++){
   const depth=((n*.113+t*.12)%1),a=n*2.399+t*.05;
   const x=w*.5+Math.cos(a)*depth*w*.68,y=h*.5+Math.sin(a)*depth*h*.6;
   ctx.fillStyle=`rgba(${color},${.08+.32*depth})`;ctx.beginPath();ctx.arc(x,y,(.7+depth*1.7)*w/1080,0,Math.PI*2);ctx.fill();
  }
  for(let n=0;n<3;n++){
   const travel=(t*.26+n/3)%1,y=h*(.52+travel*.55),spread=w*(.05+travel*.8);
   const gradient=ctx.createLinearGradient(w*.5-spread,y,w*.5+spread,y);gradient.addColorStop(0,`rgba(${color},0)`);gradient.addColorStop(.5,`rgba(${color},${.08*(1-travel)})`);gradient.addColorStop(1,`rgba(${color},0)`);
   ctx.strokeStyle=gradient;ctx.lineWidth=2+travel*2;ctx.beginPath();ctx.moveTo(w*.5-spread,y);ctx.quadraticCurveTo(w*.5,y-h*.025,w*.5+spread,y);ctx.stroke();
  }
  ctx.restore();window.mathematicalSpaceRendered=true;
 }
 return {resize,frame,ready};
}
