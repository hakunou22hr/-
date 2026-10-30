// Large moving light fronts, perspective fly-throughs and impacts, all seekable.
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),fract=x=>x-Math.floor(x),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},hash=i=>fract(Math.sin(i*127.1+311.7)*43758.5453);
const equations=['∫₀¹ x² dx = ⅓','Rₙ = ∑ k² / n³','Lₙ = ∑ k² / n³','Δx = 1/n','lim Rₙ = lim Lₙ','y = x²','n → ∞','Rₙ − Lₙ = 1/n','∑ k² = n(n+1)(2n+1)/6','0 ≤ x ≤ 1'];
// Three overlapping shots of a storm front passing through the viewer's space.
// Size increases with approach; there are no satellite-sized rotating ornaments.
export function stormActors(q){return[0,1,2].map(id=>{const phase=fract(q.t/8.4+id/3),forward=phase*phase,alpha=smooth(phase/.13)*smooth((1-phase)/.16),direction=id%2?-1:1;return{id,phase,alpha,direction,x:id===0?-.3+phase*1.7:id===1?1.35-phase*1.7:.45+.22*Math.sin(phase*TAU),y:.25+.12*Math.sin(phase*Math.PI+id*1.7),radius:.18+forward*.88,tilt:direction*(-1.05+phase*2.1),squash:.22+.51*Math.sin(phase*Math.PI),flash:Math.exp(-(((phase-.68)/.075)**2))}})}
export function stormPoint(v,u,lane,t){const a=v.direction*(u*TAU*(1.2+.12*Math.sin(t*.7+v.id))+.4)+lane*.023+t*.25*(1-u),turbulence=1+.09*Math.sin(u*23-t*2.3+lane*.5),r=v.radius*(1-u*.78)*turbulence,perspective=1/(1+.58*Math.sin(a)),x=Math.cos(a)*r*perspective,y=Math.sin(a)*r*v.squash*perspective;return[v.x+x*Math.cos(v.tilt)-y*Math.sin(v.tilt),v.y+x*Math.sin(v.tilt)*.55+y*Math.cos(v.tilt)]}
export function createDynamicStage(W,H,makeCanvas){
 const scale=Math.min(W/1920,H/1080),portrait=H>W,sprites=[],halos=new Map();
 if(makeCanvas)for(let k=0;k<equations.length;k++)for(let hot=0;hot<2;hot++){const c=makeCanvas(780,92),g=c.getContext('2d');g.font='italic 38px serif';g.textBaseline='middle';g.fillStyle=hot?'#ffe8ab':'#85ded6';g.shadowColor=hot?'#ffab26':'#28b5b2';g.shadowBlur=hot?16:5;g.fillText(equations[k],8,46);sprites[k*2+hot]=c}
 function glow(g,x,y,r,color,alpha){if(![x,y,r].every(Number.isFinite)||r<=0)return;g.globalAlpha=clamp(alpha);if(makeCanvas){if(!halos.has(color)){const c=makeCanvas(128,128),cg=c.getContext('2d'),a=cg.createRadialGradient(64,64,0,64,64,64);a.addColorStop(0,color+'cc');a.addColorStop(.15,color+'65');a.addColorStop(.5,color+'18');a.addColorStop(1,color+'00');cg.fillStyle=a;cg.fillRect(0,0,128,128);halos.set(color,c)}g.drawImage(halos.get(color),x-r,y-r,r*2,r*2)}else{const a=g.createRadialGradient(x,y,0,x,y,r);a.addColorStop(0,color+'bb');a.addColorStop(1,color+'00');g.fillStyle=a;g.fillRect(x-r,y-r,r*2,r*2)}}
 function line(g,groups,color,width,alpha){g.beginPath();for(const pts of groups){if(!pts.length)continue;g.moveTo(...pts[0]);if(pts.length===2){g.lineTo(...pts[1]);continue}for(let j=1;j<pts.length-1;j++){const a=pts[j],b=pts[j+1];g.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2)}g.lineTo(...pts[pts.length-1])}g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';g.lineJoin='round';g.globalAlpha=clamp(alpha);g.stroke()}
 function text(g,id,x,y,size,hot,alpha,angle=0){g.save();g.translate(x,y);g.rotate(angle);g.globalAlpha=clamp(alpha);const s=sprites[id*2+(hot?1:0)];if(s)g.drawImage(s,0,-size*.65,size*8.5,size);else{g.font=`italic ${size*.55}px serif`;g.fillStyle=hot?'#ffe6a1':'#67c9c4';g.fillText(equations[id],0,0)}g.restore()}
 const screen=p=>[p[0]*W,(portrait?.02+p[1]*.85:p[1])*H];
 return{render(g,q,project){const t=q.t;g.save();g.globalCompositeOperation='screen';
  // Mathematical walls travel in depth; the passing storm lights them gold.
  const sweep=fract(t/8.4)*1.8-.4,cells=[];
  for(let i=0;i<170;i++){const depth=fract(hash(i+9)+t*.038),side=i%3,x=side===0?-10-hash(i)*5:side===1?9+hash(i)*5:(hash(i)-.5)*31,y=side===2?6+hash(i+2)*4:(hash(i+3)-.5)*17,z=-48+depth*43,p=project(x,y,z),b=project(x+.7,y,z),size=Math.hypot(b[0]-p[0],b[1]-p[1])*1.7;if(!Number.isFinite(size)||size<3||size>H*.1||p[0]<-W*.4||p[0]>W*1.1||p[1]<-H*.1||p[1]>H*.66)continue;cells.push({i,p,size,depth})}
  cells.sort((a,b)=>a.depth-b.depth);for(const{i,p,size,depth}of cells){const hot=Math.abs(p[0]/W-sweep)<.25; text(g,i%equations.length,p[0],p[1],size,hot,(.19+depth*.48)*(hot?1.5:1)*(p[0]<W*.4&&p[1]<H*.34?.13:1),(i%3-1)*.045)}
  for(const v of stormActors(q)){
   if(v.alpha<.005)continue;
   const point=(u,lane)=>screen(stormPoint(v,u,lane,t)),filaments=[],sparks=[[],[],[]];
   // Broad, broken plumes fill and cross the frame, instead of closed spinning discs.
   for(let lane=0;lane<26;lane++){const head=fract(t*(.29+hash(lane)*.19)+lane*.071+v.id*.3),len=.12+hash(lane+v.id)*.28,pts=[];for(let j=0;j<=36;j++)pts.push(point(Math.max(0,head-len+j/36*len),lane));filaments.push(pts)}
   line(g,filaments,'#d8750d',(48+v.phase*64)*scale,v.alpha*.14);line(g,filaments,'#ffb839',(10+v.phase*14)*scale,v.alpha*.4);line(g,filaments,'#ffe2a0',(1.8+v.phase*2)*scale,v.alpha*.5);
   for(let k=0;k<10;k++){const p=point(.14+k*.075,k);glow(g,...p,W*(.035+v.phase*.035),'#e99c2e',v.alpha*.25)}
   // Different grains have different speeds. Long exposure grows as the front approaches.
   for(let i=0;i<240;i++){const u=fract(hash(i+v.id*251)+t*(.22+hash(i)*.3)),p=point(u,i%26),tail=point(Math.max(0,u-.012-v.phase*.027),i%26);if(p[0]<-W*.3||p[0]>W*1.3||p[1]<-H*.3||p[1]>H*.75)continue;sparks[i%3].push([tail,p]);if(i%19===0)glow(g,...p,(10+v.phase*16)*scale,'#ffcf72',v.alpha*.7)}
   for(let k=0;k<3;k++)line(g,sparks[k],k===0?'#fff0c3':'#ffc65c',(k===0?1.6:.8)*scale*(1+v.phase),v.alpha*(.75-k*.16));
   // Formulas are carried past the camera and change scale with the approaching sheet.
   for(let i=0;i<7;i++){const u=fract(t*.16+i*.137+v.id*.2),p=point(u,i*3);if(p[1]>H*.65)continue;text(g,(i+v.id)%equations.length,...p,H*.025*(.6+v.phase),true,v.alpha*.65,Math.sin(t+i)*.25)}
   // A pressure front expands across the full screen following the closest approach.
   const hit=clamp((v.phase-.53)/.36),impact=v.flash,core=screen([.57+.1*Math.sin(v.id*2),.29]);
   if(hit>0&&hit<1){const shock=[];for(let j=0;j<=90;j++){const a=-Math.PI*.95+j/90*Math.PI*1.9,r=W*(.08+hit*1.4);shock.push([core[0]+Math.cos(a)*r,core[1]+Math.sin(a)*r*(portrait?.75:.48)])}line(g,[shock],'#f5a32f',22*scale,(1-hit)*v.alpha*.08);line(g,[shock],'#ffe7ad',3*scale,(1-hit)*v.alpha*.5)}
   glow(g,...core,W*(.12+impact*.20),'#ffc44c',impact*.55);
   if(impact>.02){const jets=[];for(let i=0;i<34;i++){const a=i/34*TAU+.3*Math.sin(t),r=W*(.12+hit*.65),s=.2+hash(i)*.7;jets.push([[core[0]+Math.cos(a)*r*s,core[1]+Math.sin(a)*r*s*.45],[core[0]+Math.cos(a)*r,core[1]+Math.sin(a)*r*.45]])}line(g,jets,'#ffdf8d',1.6*scale,impact*.55)}
  }
  // A travelling anamorphic light streak accompanies the sweep, not a stationary halo.
  const phase=fract(t/8.4),x=(-.2+phase*1.4)*W,y=H*(.23+.1*Math.sin(phase*TAU)),beam=g.createLinearGradient(x-W*.5,0,x+W*.5,0);beam.addColorStop(0,'#ffb42b00');beam.addColorStop(.48,'#ffd57435');beam.addColorStop(.5,'#fff1bccc');beam.addColorStop(.52,'#ffd57435');beam.addColorStop(1,'#ffb42b00');g.fillStyle=beam;g.globalAlpha=.4;g.fillRect(x-W*.5,y-1.5*scale,W,3*scale);
  g.restore();return{largeStormFronts:true};
 }}
}
