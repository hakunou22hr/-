// Large moving light fronts, perspective fly-throughs and impacts, all seekable.
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),fract=x=>x-Math.floor(x),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},hash=i=>fract(Math.sin(i*127.1+311.7)*43758.5453);
// Continuous multi-scale density and domain warping, shared by smoke and flow.
const field=new Float32Array(32768);for(let i=0;i<field.length;i++)field[i]=hash(i+143);
function noise(x,y,z){const a=Math.floor(x),b=Math.floor(y),c=Math.floor(z),u=smooth(x-a),v=smooth(y-b),w=smooth(z-c),at=(i,j,k)=>field[(i&31)+((j&31)<<5)+((k&31)<<10)],mix=(a,b,p)=>a+(b-a)*p;return mix(mix(mix(at(a,b,c),at(a+1,b,c),u),mix(at(a,b+1,c),at(a+1,b+1,c),u),v),mix(mix(at(a,b,c+1),at(a+1,b,c+1),u),mix(at(a,b+1,c+1),at(a+1,b+1,c+1),u),v),w)}
export function organicNoise(x,y,z){return noise(x,y,z)*.53+noise(x*2.03,y*2.03,z*2.03)*.27+noise(x*4.07,y*4.07,z*4.07)*.14+noise(x*8.1,y*8.1,z*8.1)*.06}
const equations=['∫₀¹ x² dx = ⅓','Rₙ = ∑ k² / n³','Lₙ = ∑ k² / n³','Δx = 1/n','lim Rₙ = lim Lₙ','y = x²','n → ∞','Rₙ − Lₙ = 1/n','∑ k² = n(n+1)(2n+1)/6','0 ≤ x ≤ 1'];
// Three overlapping shots of a storm front passing through the viewer's space.
// Size increases with approach; there are no satellite-sized rotating ornaments.
export function stormActors(q){return[0,1,2].map(id=>{const phase=fract(q.t/8.4+id/3),forward=phase*phase,alpha=smooth(phase/.13)*smooth((1-phase)/.16),direction=id%2?-1:1;return{id,phase,alpha,direction,x:id===0?-.3+phase*1.7:id===1?1.35-phase*1.7:.45+.22*Math.sin(phase*TAU),y:.25+.12*Math.sin(phase*Math.PI+id*1.7),radius:.18+forward*.88,tilt:direction*(-1.05+phase*2.1),squash:.22+.51*Math.sin(phase*Math.PI),flash:Math.exp(-(((phase-.68)/.075)**2))}})}
export function stormPoint(v,u,lane,t){const seed=hash(lane+v.id*37),warp=organicNoise(u*4,seed*6,t*.17+v.id),a=v.direction*(u*TAU*(1.2+.14*noise(t*.13,v.id,1))+.4)+(seed-.5)*.35+t*.25*(1-u)+(warp-.5)*.75,r=v.radius*(1-u*.78)*(.75+.55*organicNoise(u*5-t*.11,seed*4,v.id+t*.09)),perspective=1/(1+.58*Math.sin(a)),x=Math.cos(a)*r*perspective,y=Math.sin(a)*r*v.squash*perspective,dx=(organicNoise(u*7,seed*3,t*.2)-.5)*v.radius*.14,dy=(organicNoise(seed*3,u*7,t*.16+9)-.5)*v.radius*.12;return[v.x+x*Math.cos(v.tilt)-y*Math.sin(v.tilt)+dx,v.y+x*Math.sin(v.tilt)*.55+y*Math.cos(v.tilt)+dy]}
export function createDynamicStage(W,H,makeCanvas){
 const scale=Math.min(W/1920,H/1080),portrait=H>W,sprites=[],clouds=[],halos=new Map();
 if(makeCanvas)for(let k=0;k<equations.length;k++)for(let hot=0;hot<2;hot++){const c=makeCanvas(780,92),g=c.getContext('2d');g.font='italic 38px serif';g.textBaseline='middle';g.fillStyle=hot?'#ffe8ab':'#85ded6';g.shadowColor=hot?'#ffab26':'#28b5b2';g.shadowBlur=hot?16:5;g.fillText(equations[k],8,46);sprites[k*2+hot]=c}
 // Ragged volumetric puffs: holes, bright edges and branching density, not a flat disc.
 if(makeCanvas)for(let seed=0;seed<8;seed++){const size=160,c=makeCanvas(size,size),cg=c.getContext('2d'),im=cg.createImageData(size,size);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const nx=x/size*2-1,ny=y/size*2-1,warp=organicNoise(nx*2+7,ny*2+3,seed*.73),f=organicNoise(nx*3.7+warp*1.8+11,ny*3.7-warp*1.2+9,seed*.91),r2=nx*nx+ny*ny,edge=clamp((1.18-r2)*3),density=clamp((f-.25)*2.2)*Math.exp(-r2*2.1)*edge,hot=clamp((f-.32)*2.2),i=(y*size+x)*4;im.data[i]=205+50*hot;im.data[i+1]=112+116*hot;im.data[i+2]=12+74*hot;im.data[i+3]=Math.round(density*245)}cg.putImageData(im,0,0);clouds.push(c)}
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
   // Advected smoke supplies the body of the vortex. Puffs stretch along the flow,
   // with density gaps, irregular bright knots and smaller eddies that shear apart.
   for(let i=0;i<108;i++){const u=fract(hash(i+v.id*197)+t*(.046+hash(i+53)*.038)),lane=i%26,p=point(u,lane),ahead=point(Math.min(1,u+.008),lane),density=organicNoise(u*8-t*.07,hash(i)*5,v.id+t*.15),size=W*(.025+.052*hash(i+18))*(.7+v.phase*.65),angle=Math.atan2(ahead[1]-p[1],ahead[0]-p[0]),alpha=v.alpha*(.21+.41*density)*smooth(u/.045)*smooth((1-u)/.06);if(p[0]<-size*3||p[0]>W+size*3||p[1]<-size*3||p[1]>H*.78)continue;if(clouds.length){g.save();g.translate(...p);g.rotate(angle);g.globalAlpha=clamp(alpha);g.drawImage(clouds[(i+v.id*3)%clouds.length],-size*1.6,-size*.65,size*3.2,size*1.3);g.restore()}else glow(g,...p,size,'#ffc43b',alpha)}
   // Short, faint filaments emerge from the mist instead of uniform parallel bands.
   for(let lane=0;lane<10;lane++){const head=fract(t*(.12+hash(lane)*.1)+hash(lane+v.id*17)),len=.04+hash(lane+19)*.08,pts=[];for(let j=0;j<=24;j++)pts.push(point(Math.max(0,head-len+j/24*len),lane));filaments.push(pts)}
   line(g,filaments,'#ffc044',2.5*scale,v.alpha*.18);line(g,filaments,'#ffe092',.65*scale,v.alpha*.19);
   for(let k=0;k<12;k++){const p=point(.08+k*.073,k);glow(g,...p,W*(.026+v.phase*.04),'#ffb923',v.alpha*(.13+.12*noise(k*.3,t*.3,v.id)))}
   for(let i=0;i<180;i++){const u=fract(hash(i+v.id*251)+t*(.14+hash(i)*.18)),p=point(u,i%26),tail=point(Math.max(0,u-.002-v.phase*.006),i%26);if(p[0]<-W*.3||p[0]>W*1.3||p[1]<-H*.3||p[1]>H*.75)continue;sparks[i%3].push([tail,p]);if(i%13===0)glow(g,...p,(7+v.phase*14)*scale,'#ffd56c',v.alpha*.65)}
   for(let k=0;k<3;k++)line(g,sparks[k],k===0?'#ffe2a0':'#ffc239',(k===0?1.5:.8)*scale*(1+v.phase),v.alpha*(.75-k*.14));
   // Formulas are carried past the camera and change scale with the approaching sheet.
   for(let i=0;i<7;i++){const u=fract(t*.16+i*.137+v.id*.2),p=point(u,i*3);if(p[1]>H*.65)continue;text(g,(i+v.id)%equations.length,...p,H*.025*(.6+v.phase),true,v.alpha*.65,Math.sin(t+i)*.25)}
   // A pressure front expands across the full screen following the closest approach.
   const hit=clamp((v.phase-.53)/.36),impact=v.flash,core=screen([.57+.1*Math.sin(v.id*2),.29]);
   // A ragged pressure veil breaks into uneven embers, rather than a perfect ring.
   if(hit>0&&hit<1){for(let k=0;k<24;k++){const a=k/24*TAU+hash(k+v.id)*.18,r=W*(.1+hit*1.3)*(.8+.4*noise(k*.4,t*.24,v.id)),p=[core[0]+Math.cos(a)*r,core[1]+Math.sin(a)*r*(portrait?.75:.48)];glow(g,...p,W*(.025+hash(k)*.045),'#ffbd35',(1-hit)*v.alpha*(.12+.17*hash(k)))}}
   glow(g,...core,W*(.12+impact*.23),'#ffc12c',impact*.57);
   if(impact>.02){const jets=[];for(let i=0;i<65;i++){const a=hash(i+v.id*83)*TAU,r=W*(.10+hit*.7)*(.5+.6*hash(i+6)),s=.7+hash(i+11)*.22;jets.push([[core[0]+Math.cos(a)*r*s,core[1]+Math.sin(a)*r*s*.45],[core[0]+Math.cos(a)*r,core[1]+Math.sin(a)*r*.45]])}line(g,jets,'#ffd564',1.3*scale,impact*.55)}
  }
  // A travelling anamorphic light streak accompanies the sweep, not a stationary halo.
  const phase=fract(t/8.4),x=(-.2+phase*1.4)*W,y=H*(.23+.1*Math.sin(phase*TAU)),beam=g.createLinearGradient(x-W*.5,0,x+W*.5,0);beam.addColorStop(0,'#ffb42b00');beam.addColorStop(.48,'#ffd57435');beam.addColorStop(.5,'#fff1bccc');beam.addColorStop(.52,'#ffd57435');beam.addColorStop(1,'#ffb42b00');g.fillStyle=beam;g.globalAlpha=.2;g.fillRect(x-W*.5,y-1.5*scale,W,3*scale);
  g.restore();return{largeStormFronts:true};
 }}
}
