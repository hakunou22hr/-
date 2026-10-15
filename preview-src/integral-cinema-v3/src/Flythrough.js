/** A perspective-projected textured passage. Camera position advances in world Z.
 * Wall/floor textures retain the approved reference art; geometry supplies parallax.
 * The lesson formulas are composited separately at full resolution. */
export function drawFlythrough(ctx,image,panel,t,w,h,alpha=1){
 const sw=Math.floor(image.naturalWidth/2),sh=Math.floor(image.naturalHeight/2);
 const ox=(panel%2)*sw,oy=Math.floor(panel/2)*sh;
 const f=w*.88,cx=w*.5,cy=h*.46,camera=t*1.8;
 const project=(x,y,z)=>({x:cx+x*f/z,y:cy+y*f/z});
 const texture=(a,b,c,s0,s1,s2)=>{
  const det=s0.x*(s1.y-s2.y)+s1.x*(s2.y-s0.y)+s2.x*(s0.y-s1.y);if(Math.abs(det)<1e-6)return;
  const A=(a.x*(s1.y-s2.y)+b.x*(s2.y-s0.y)+c.x*(s0.y-s1.y))/det;
  const B=(a.y*(s1.y-s2.y)+b.y*(s2.y-s0.y)+c.y*(s0.y-s1.y))/det;
  const C=(a.x*(s2.x-s1.x)+b.x*(s0.x-s2.x)+c.x*(s1.x-s0.x))/det;
  const D=(a.y*(s2.x-s1.x)+b.y*(s0.x-s2.x)+c.y*(s1.x-s0.x))/det;
  const E=a.x-A*s0.x-C*s0.y,F=a.y-B*s0.x-D*s0.y;
  ctx.save();ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.closePath();ctx.clip();ctx.setTransform(A,B,C,D,E,F);ctx.drawImage(image,0,0);ctx.restore();
 };
 const face=(points,uv)=>{texture(points[0],points[1],points[2],uv[0],uv[1],uv[2]);texture(points[0],points[2],points[3],uv[0],uv[2],uv[3]);};
 const uv=(x,y)=>({x:ox+sw*x,y:oy+sh*y});
 // Far architectural view remains photographic, rather than a low-poly backdrop.
 const scale=Math.max(w/(sw-6),h/(sh-6))*1.04;
 const dw=(sw-6)*scale,dh=(sh-6)*scale;
 ctx.globalAlpha=alpha;ctx.drawImage(image,ox+3,oy+3,sw-6,sh-6,(w-dw)/2,h*.46-dh*.46,dw,dh);
 const spacing=3.8,base=Math.floor(camera/spacing),segments=18;
 // Fixed world surfaces pass the camera. Near surfaces expand faster than far ones.
 for(let n=segments;n>=0;n--){
  const z0=(base+n)*spacing-camera,z1=z0+spacing;
  if(z1<.22)continue;
  // Subdivide each bay in Z to prevent affine texture swimming.
  const steps=3;
  for(let k=steps-1;k>=0;k--){
   const za=Math.max(.22,z0+spacing*k/steps),zb=z0+spacing*(k+1)/steps;if(zb<=za)continue;
   const ta=(za-z0)/spacing,tb=(zb-z0)/spacing;
   const farFade=Math.min(1,5/zb);ctx.globalAlpha=alpha*.82*farFade;
   for(const side of [-1,1]){
    const x=side*1.26;
    const top=-2.3,bottom=2.7;
    const p=[project(x,top,za),project(x,top,zb),project(x,bottom,zb),project(x,bottom,za)];
    const a=side<0?.025:.975,b=side<0?.29:.71;
    face(p,[uv(a+(b-a)*ta,.04),uv(a+(b-a)*tb,.04),uv(a+(b-a)*tb,.94),uv(a+(b-a)*ta,.94)]);
   }
   ctx.globalAlpha=alpha*.64*farFade;
   const floor=[project(-1.26,2.7,za),project(1.26,2.7,za),project(1.26,2.7,zb),project(-1.26,2.7,zb)];
   face(floor,[uv(.28,.98-ta*.27),uv(.72,.98-ta*.27),uv(.72,.98-tb*.27),uv(.28,.98-tb*.27)]);
  }
  // Portal ribs are world-space geometry: the camera flies through each opening.
  if(z0>.22&&z0<32){
   const gold=panel===1||panel===2,colour=gold?'255,205,126':'108,225,255';
   const points=[project(-1.26,2.7,z0),project(-1.26,-2.3,z0),project(1.26,-2.3,z0),project(1.26,2.7,z0)];
   ctx.globalAlpha=alpha*Math.min(.65,2/z0);ctx.strokeStyle=`rgba(${colour},.8)`;ctx.lineWidth=Math.min(9,4/z0)*w/1080;
   ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
  }
 }
 // Formula cards share the world Z motion, rather than oscillating in screen space.
 ctx.save();ctx.globalCompositeOperation='screen';
 const texts=['∫ f(t) dt','sin x','F′(x)','cos t','Δx → 0'];
 for(let n=0;n<32;n++){
  const z=((n*1.71-camera)%24+24)%24+.25,side=n%2?1:-1;
  const p=project(side*1.4,(n%5-2)*.85,z),size=f*.14/z;
  if(size>150||p.x<-200||p.x>w+200)continue;
  ctx.globalAlpha=alpha*Math.min(.36,1.4/z)*Math.min(1,z);
  ctx.font=`italic ${Math.max(5,size)}px Georgia`;ctx.textAlign='center';ctx.fillStyle=panel===1||panel===2?'#ffdfa8':'#b2f8ff';ctx.fillText(texts[n%texts.length],p.x,p.y);
 }
 ctx.restore();ctx.globalAlpha=1;
}
