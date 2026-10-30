// Clock-driven mathematical light transport. No rigidly rotating wallpaper.
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),fract=x=>x-Math.floor(x);
export function choreography(q){const beat=fract(q.p*(q.s===3?3:4));return{beat,pulse:Math.exp(-beat*7),envelope:Math.sin(Math.PI*q.p)**2,speed:q.s===3?5+q.p*15:3+Math.log2(q.n||4)*.8,contraction:q.s===3?1-clamp((q.p-.15)/.72):1}}
const equations=['∫₀¹ x² dx = ⅓','Rₙ = ∑ k² / n³','Lₙ = ∑ k² / n³','Δx = 1/n','lim Rₙ = lim Lₙ','y = x²','n → ∞','Rₙ − Lₙ = 1/n','∑ k² = n(n+1)(2n+1)/6','0 ≤ x ≤ 1'];
const hash=i=>fract(Math.sin(i*127.1+311.7)*43758.5453);
// A streamline starts upstream, accelerates into a deforming vortex, then ejects a spark.
export function flowPoint(u,t,lane=0){const cx=.76+.025*Math.sin(t*.19),cy=.245+.025*Math.sin(t*.27);if(u<.43){const v=u/.43;const r0=.19+.024*Math.sin(t*.83)+.018*Math.sin(lane*.57+t*1.2);return[-.13+v*(cx-r0+.13),cy+.18*(1-v)+.025*Math.sin(v*8+t*.9+lane*.04)*(1-v)]}const v=clamp((u-.43)/.57),a=Math.PI+v*TAU*(1.85+.17*Math.sin(t*.41))+.11*Math.sin(lane*.4+t+v*12)*Math.sin(Math.PI*v),r=(.19+.024*Math.sin(t*.83+v*8)+.018*Math.sin(lane*.57+t*1.2+v*5))*Math.pow(1-v,.9),flutter=Math.sin(v*24+t*1.6+lane*.2)*.004*(1-v);return[cx+Math.cos(a)*r+flutter,cy+Math.sin(a)*r*.72+flutter]}
export function createDynamicStage(W,H,makeCanvas){
 let activeQ;
 const scale=Math.min(W/1920,H/1080),portrait=H>W,sprites=[];
 if(makeCanvas)for(let k=0;k<equations.length;k++)for(let gold=0;gold<2;gold++){const c=makeCanvas(780,92),g=c.getContext('2d');g.font='italic 38px serif';g.textBaseline='middle';g.fillStyle=gold?'#ffe8ab':'#85ded6';g.shadowColor=gold?'#ffab26':'#28b5b2';g.shadowBlur=gold?16:5;g.fillText(equations[k],8,46);sprites[k*2+gold]=c}
 function glow(g,x,y,r,color,alpha){const a=g.createRadialGradient(x,y,0,x,y,r);a.addColorStop(0,color+'bb');a.addColorStop(.15,color+'55');a.addColorStop(.5,color+'13');a.addColorStop(1,color+'00');g.globalAlpha=alpha;g.fillStyle=a;g.fillRect(x-r,y-r,r*2,r*2)}
 function pos(u,t,lane){const p=flowPoint(u,t,lane),q=activeQ;if(q){const core=flowPoint(1,t,lane),f=q.s===3?1-.62*q.p:q.s===4?.38+.67*q.p:1;p[0]=core[0]+(p[0]-core[0])*f;p[1]=core[1]+(p[1]-core[1])*f}return[p[0]*W,(portrait?.03+p[1]*.75:p[1])*H]}
 function line(g,pts,color,width,alpha){g.beginPath();for(let i=0;i<pts.length;i++)i?g.lineTo(...pts[i]):g.moveTo(...pts[i]);g.strokeStyle=color;g.lineWidth=width;g.globalAlpha=alpha;g.stroke()}
 function text(g,id,x,y,size,hot,alpha,angle=0){g.save();g.translate(x,y);g.rotate(angle);g.globalAlpha=alpha;const s=sprites[id*2+(hot?1:0)];if(s)g.drawImage(s,0,-size*.65,size*8.5,size);else{g.font=`italic ${size*.55}px serif`;g.fillStyle=hot?'#ffe6a1':'#67c9c4';g.fillText(equations[id],0,0)}g.restore()}
 return{render(g,q,project){activeQ=q;const t=q.t,c=choreography(q),energy=.55+.45*Math.sin(Math.PI*q.p)**2,ignition=fract(t*.135),goldSweep=ignition*1.65-.3;g.save();g.globalCompositeOperation='screen';
  // Three spatial walls of mathematical inscriptions. Text moves towards camera in depth;
  // a travelling illumination front turns the turquoise equations into incandescent gold.
  const cells=[];for(let i=0;i<180;i++){const depth=fract(hash(i+9)+t*(.024+(q.s===3?.024*q.p:0))),side=i%3,x=side===0?-10-hash(i)*5:side===1?9+hash(i)*5:(hash(i)-.5)*31,y=side===2?6+hash(i+2)*4:(hash(i+3)-.5)*17,z=-48+depth*43;const p=project(x,y,z),b=project(x+.7,y,z),size=Math.hypot(b[0]-p[0],b[1]-p[1])*1.7;if(size<3||size>H*.1||p[0]<-W*.4||p[0]>W*1.1||p[1]<-H*.1||p[1]>H*.67)continue;cells.push({i,p,size,depth})}
  cells.sort((a,b)=>a.depth-b.depth);for(const{ i,p,size,depth}of cells){const hot=Math.abs(p[0]/W-goldSweep)<.15,alpha=(.19+depth*.48)*(hot?1.7:1)*(p[0]<W*.4&&p[1]<H*.34?.16:1);text(g,i%equations.length,p[0],p[1],size,hot,alpha,(i%3-1)*.045);if(hot&&i%4===0)glow(g,p[0],p[1],size*1.7,'#ffb83c',.35)}
  for(let j=0;j<26;j++){const u=.44+j/26*.54,p=pos(u,t,0);glow(g,p[0],p[1],W*(.025+.028*(1-u)),'#f8a62b',(.16+.10*Math.sin(j*.6-t*2)**2)*energy)}
  // Turbulent, nonuniform comet filaments: only short moving segments emit at a time.
  for(let lane=0;lane<48;lane++){const head=fract(t*(.09+hash(lane)*.065)+hash(lane+80)),len=.055+hash(lane+12)*.19,pts=[];for(let j=0;j<=28;j++){const u=Math.max(0,head-len+j/28*len),p=pos(u,t,lane);p[1]+=Math.sin(u*24+t*1.8+lane)*H*.003*(1-u);pts.push(p)}const a=(.15+hash(lane+22)*.55)*energy;line(g,pts,'#ff9b21',(18+hash(lane)*28)*scale,a*.16);line(g,pts,'#ffc45c',(4+hash(lane)*3)*scale,a*.65);line(g,pts,'#fff0bb',(1+hash(lane)*1.4)*scale,a);const tip=pts[pts.length-1];glow(g,tip[0],tip[1],(9+hash(lane)*15)*scale,'#ffc251',a*.55)}
  // Hundreds of independently accelerating grains leave irregular, curved exposure trails.
  for(let i=0;i<440;i++){const u=fract(hash(i+390)+t*(.075+hash(i+4)*.065)),lane=i%48,p=pos(u,t,lane),jitter=(1-u)*(.001+hash(i+21)*.009);p[0]+=Math.sin(i*1.9+t*(.6+u*4))*W*jitter;p[1]+=Math.cos(i*2.3+t)*H*jitter;const tail=pos(Math.max(0,u-.003-.006*u),t,lane);tail[0]+=Math.sin(i*1.9+t*(.6+u*4))*W*jitter;tail[1]+=Math.cos(i*2.3+t)*H*jitter;const a=(.15+hash(i)*.7)*energy;line(g,[tail,p],i%5?'#ffd67e':'#f8f5e5',(.5+hash(i+2)*1.8)*scale,a);if(i%7===0)glow(g,p[0],p[1],(5+hash(i)*7)*scale,'#ffc45d',a*.7)}
  // Actual formulas ride the light flow; their size, angle and brightness change on approach.
  for(let i=0;i<26;i++){const u=fract(hash(i+902)+t*(.047+hash(i)*.03)),p=pos(u,t,i),p2=pos(Math.min(.998,u+.005),t,i),angle=Math.atan2(p2[1]-p[1],p2[0]-p[0]),fade=clamp(u*8)*clamp((1-u)*8),size=(portrait?H*.020:H*.036)*(1-u*.6);text(g,i%equations.length,p[0],p[1],size,true,fade*.7,Math.max(-.7,Math.min(.7,angle)))}
  // The core breathes, builds pressure, blooms, and sends an asymmetric light front outward.
  const core=pos(.99,t,0),burst=Math.pow(clamp(1-Math.abs(fract(t*.135)-.72)*9),3),r=(.07+.025*Math.sin(t*2.1)+burst*.09)*W;
  glow(g,core[0],core[1],r*2.6,'#d98b20',.24*energy);glow(g,core[0],core[1],r,'#ffc34d',.55+burst*.4);glow(g,core[0],core[1],r*.42,'#fff3ce',.95);
  // Lens streak is driven by bursts, rather than spinning as a geometric decoration.
  const streak=g.createLinearGradient(core[0]-W*.45,0,core[0]+W*.3,0);streak.addColorStop(0,'#ffad2600');streak.addColorStop(.58,'#ffd36a77');streak.addColorStop(.6,'#fff5c9ee');streak.addColorStop(.62,'#ffd36a66');streak.addColorStop(1,'#ffad2600');g.fillStyle=streak;g.globalAlpha=.15+burst*.65;g.fillRect(core[0]-W*.45,core[1]-1.3*scale,W*.75,2.6*scale);
  // During refinement a gold front sweeps over the mathematical space and sheds sparks.
  const sweep=fract(t*.135);if(sweep>.12&&sweep<.88){const x=(sweep*1.65-.3)*W;glow(g,x,H*(portrait?.19:.28),W*.19,'#f6ab39',.12+burst*.12)}
  // Final convergence: a gold stream falls from the vortex toward the accumulated area.
  if(q.s===3||q.s===4){const power=q.s===3?Math.sin(Math.PI*q.p)**2:1-q.p*.5;for(let k=0;k<8;k++){const pts=[];for(let j=0;j<45;j++){const u=j/44,front=fract(t*.3+k*.12);if(u>front||u<front-.35)continue;pts.push([core[0]*(1-u)+W*.51*u+Math.sin(u*9+t*2+k)*W*.018*u,core[1]*(1-u)+H*.56*u])}if(pts.length>1)line(g,pts,k%2?'#f5bdff':'#ffe3a0',(1+k%3)*scale,power*.4)}}
  g.restore();return c;
 }}
}
