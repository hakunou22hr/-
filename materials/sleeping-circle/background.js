import {drawMath,mathMetrics} from './math.js';
// Procedural volumetric atlas, individually advected cloud volumes, luminous
// formula currents and a camera-projected mathematical cathedral. No photo plate.
const TAU=Math.PI*2;
const resources=new WeakMap();
const rand=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v)};
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
function noise(x,y){const a=Math.floor(x),b=Math.floor(y),u=smooth(x-a),v=smooth(y-b);return mix(mix(rand(a+b*71),rand(a+1+b*71),u),mix(rand(a+(b+1)*71),rand(a+1+(b+1)*71),u),v);}
function fbm(x,y){let n=0,s=.56;for(let k=0;k<6;k++){n+=s*noise(x,y);x=x*2.07+7.1;y=y*2.03+3.7;s*=.49;}return n;}
export function createBackdrop(makeCanvas,W,H){
 const portrait=H>W,cached=resources.get(makeCanvas);const clouds=cached?.clouds||[];const flares=cached?.flares||new Map(),glyphCache=cached?.glyphCache||new Map();
 const bloom=makeCanvas(320,Math.round(320*H/W)),bloomContext=bloom.getContext('2d');
 // Fractal domain warping produces billowing, illuminated edges and dark folds.
 if(!cached)for(let k=0;k<3;k++){const c=makeCanvas(512,384),g=c.getContext('2d'),im=g.createImageData(512,384);for(let y=0;y<384;y++)for(let x=0;x<512;x++){const nx=x/512*5,ny=y/384*5;const a=fbm(nx+k*11,ny+k*7),b=fbm(nx+3.5,ny-4.2);const n=fbm(nx+a*3,ny+b*3);const edge=Math.max(0,1-Math.pow((x-256)/256,2)-Math.pow((y-192)/192,2));const dens=Math.pow(Math.max(0,n-.27)*2.7,1.5)*edge;const rim=Math.max(0,fbm(nx+a*3+.045,ny+b*3-.035)-n)*14;const i=(y*512+x)*4;im.data[i]=18+rim*85+dens*18;im.data[i+1]=45+rim*115+dens*44;im.data[i+2]=80+rim*125+dens*88;im.data[i+3]=Math.min(245,dens*320);}g.putImageData(im,0,0);clouds.push(c);}
 const formulas=['∫ √(4 − x²) dx','sin²θ + cos²θ = 1','x² + y² = 4','x = 2 sin θ','dx = 2 cos θ dθ','cos²θ = (1 + cos 2θ) / 2','0 ≤ θ ≤ π/2','∫ cos 2θ dθ = ½ sin 2θ + C','r² = x² + y²','A = ¼πr²'];
 const walls=cached?.walls||Array.from({length:3},(_,k)=>{const c=makeCanvas(1024,768),g=c.getContext('2d');g.fillStyle='#041e24';g.fillRect(0,0,1024,768);g.textBaseline='middle';for(let row=0;row<24;row++){const size=19+rand(row+k*7)*19;g.fillStyle=row%5===0?'#f0d69b':row%3?'#42acb8':'#b0f5e9';g.globalAlpha=.35+rand(row+3)*.55;const formula=formulas[(row+k*3)%formulas.length],m=mathMetrics(formula,size);drawMath(g,makeCanvas,formula,16+(row%4)*12+m.width/2,row*33+16,size,g.fillStyle);}g.globalAlpha=.4;g.strokeStyle='#40b6b8';g.lineWidth=1;for(let x=0;x<1024;x+=64){g.beginPath();g.moveTo(x,0);g.lineTo(x,768);g.stroke();}for(let y=0;y<768;y+=64){g.beginPath();g.moveTo(0,y);g.lineTo(1024,y);g.stroke();}return c;});
 resources.set(makeCanvas,{clouds,walls,flares,glyphCache});
 function flare(g,x,y,r,color,alpha=1){let tex=flares.get(color);if(!tex){tex=makeCanvas(128,128);const c=tex.getContext('2d'),gr=c.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'#ffffff');gr.addColorStop(.035,color);gr.addColorStop(.13,color+'a0');gr.addColorStop(.4,color+'26');gr.addColorStop(1,color+'00');c.fillStyle=gr;c.fillRect(0,0,128,128);flares.set(color,tex);}g.globalAlpha=alpha;g.drawImage(tex,x-r,y-r,2*r,2*r);g.globalAlpha=1;}
 function path(g,pts,color,width,alpha=1){g.globalAlpha=alpha;g.strokeStyle=color;g.lineWidth=width;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();g.globalAlpha=1;}
 function glyph(g,s,x,y,size,color,alpha,rot=0){const key=s+color;let atlas=glyphCache.get(key);if(!atlas){const m=mathMetrics(s,64);atlas=makeCanvas(Math.ceil(m.width)+20,Math.ceil(m.height)+20);const a=atlas.getContext('2d');a.shadowColor=color;a.shadowBlur=5;drawMath(a,makeCanvas,s,atlas.width/2,atlas.height/2,64,color);glyphCache.set(key,atlas);}g.save();g.translate(x,y);g.rotate(rot);g.globalAlpha=alpha;const scale=size/64;g.drawImage(atlas,-atlas.width*scale/2,-atlas.height*scale/2,atlas.width*scale,atlas.height*scale);g.restore();}
 function project(t){const yaw=.14*Math.sin(t*.07),pitch=.035*Math.sin(t*.12),cx=W*(.55+.06*Math.sin(t*.045)),cy=H*(portrait?.48:.46);return (x,y,z)=>{const xx=x*Math.cos(yaw)-z*Math.sin(yaw);const zz=z*Math.cos(yaw)+x*Math.sin(yaw);const yy=y*Math.cos(pitch)-zz*Math.sin(pitch);const k=(portrait?620:950)/(zz+9);return [cx+xx*k,cy+yy*k,k];};}
 function cosmic(g,t,strength){
  g.save();g.globalCompositeOperation='screen';
  // Twelve independent volumes at different depths, each deformed into strips.
  for(let j=0;j<8;j++){const depth=.6+rand(j+80)*.8;const x=W*(rand(j+41)*1.3-.15)+Math.sin(t*.075+j)*W*.10;const y=H*(.15+rand(j+8)*.85)+Math.cos(t*.05+j)*H*.08;const w=(portrait?900:1350)*depth,h=620*depth;g.save();g.translate(x,y);g.rotate(Math.sin(t*.035+j)*.17+j*.7);g.globalAlpha=strength*(.48+.28*rand(j));for(let s=0;s<16;s++){const v=s/16;const warp=Math.sin(v*5.4+t*.12+j)*6+Math.sin(v*11-t*.09)*4;g.drawImage(clouds[j%3],0,s*24,512,24,-w/2+warp,-h/2+v*h,w,h/16);}g.restore();}
  for(let j=0;j<15;j++){const a=rand(j+113)*TAU;const x=W*(.18+.7*rand(j+94))+Math.sin(t*.06+j)*55;const y=H*(.25+.55*rand(j+103))+Math.cos(t*.08+j)*45;const w=320+rand(j+122)*450,h=200+rand(j+130)*260;g.save();g.translate(x,y);g.rotate(a+t*(j%2?.006:-.004));g.globalAlpha=strength*(.32+.35*rand(j));g.drawImage(clouds[j%3],-w/2,-h/2,w,h);g.restore();}
  // Deep starfield, lens diffraction and spatial constellation grid.
  for(let i=0;i<430;i++){const z=1+((rand(i+1)*9-t*.025)%9+9)%9,k=1/z;const x=W/2+(rand(i+9)-.5)*W*3*k+Math.sin(t*.08)*45*k,y=H/2+(rand(i+21)-.5)*H*3*k;const a=(.2+.8*rand(i))*strength;if(x<0||x>W||y<0||y>H)continue;if(i%19===0){flare(g,x,y,26*k+9,'#7acbff',a);path(g,[[x-18*k,y],[x+18*k,y]],'#b0eaff',1,a*.6);path(g,[[x,y-18*k],[x,y+18*k]],'#b0eaff',1,a*.6);}else{g.globalAlpha=a*.7;g.fillStyle=i%7?'#a9d7ef':'#ffdfaa';g.fillRect(x,y,Math.max(1,1.7*k),Math.max(1,1.7*k));}}
  g.globalAlpha=1;
  // A gold/blue mathematical current follows a real 3D helical trajectory.
  const centerY=H*(portrait?.67:.59),vortexX=W*(portrait?.76:.89),vortexY=H*(portrait?.38:.39);
  function flow(v,j=0){const a=v*8.8-t*.34+j*.12;const radius=(1-v)*(portrait?430:380)+24;const x=mix(-W*.1,vortexX,v)+Math.sin(a)*radius*.25;const y=mix(centerY,vortexY,v)+Math.sin(a)*radius*.52+Math.sin(v*TAU+t*.15)*70;return [x,y,1-v*.65];}
  bloomContext.setTransform(bloom.width/W,0,0,bloom.height/H,0,0);bloomContext.clearRect(0,0,W,H);for(let j=0;j<3;j++){const pts=[];for(let i=0;i<=150;i++)pts.push(flow(i/150,j*6));path(bloomContext,pts,j?'#ffb94d':'#9fb9ff',65,strength*.13);path(bloomContext,pts,j?'#ffca75':'#aec6ff',28,strength*.35);}g.drawImage(bloom,0,0,W,H);for(let j=0;j<3;j++){const pts=[];for(let i=0;i<=150;i++)pts.push(flow(i/150,j*6));path(g,pts,j?'#ffcb7e':'#adcaff',j?8:6,strength*.7);path(g,pts,j?'#fff3ce':'#e1eaff',1.5,strength*.8);}
  for(let j=0;j<22;j++){const pts=[];for(let i=0;i<=125;i++){const v=i/125,p=flow(v,j);pts.push([p[0],p[1]+Math.sin(v*30+t*.7+j)*9]);}const color=j%5===0?'#98bdff':j%3?'#ffc775':'#fff1b9';path(g,pts,color,j%4===0?7:1.4,strength*(j%4===0?.06:.42));}
  for(let i=0;i<260;i++){const v=((rand(i+72)+t*(.018+.008*rand(i)))%1),p=flow(v,rand(i+81)*20);const x=p[0]+(rand(i+101)-.5)*36,y=p[1]+(rand(i+12)-.5)*48;const size=1.2+rand(i+55)*2.3;g.globalAlpha=strength*(.3+.7*rand(i));g.fillStyle=i%6?'#ffdb8d':'#b3c9ff';g.fillRect(x,y,size,size);if(i%29===0)flare(g,x,y,27,'#ffd17d',strength*.6);}
  for(let i=0;i<25;i++){const v=((i/25+t*.018)%1),p=flow(v,(i%5)*3);glyph(g,formulas[i%formulas.length],p[0],p[1]+(i%3-1)*36,14+31*p[2],i%4?'#ffe7ae':'#b8daff',strength*(.26+.4*p[2]),Math.cos(v*8.8-t*.34)*.16);}
  // Particle-driven vortex: different angular velocities and changing inclination.
  for(let j=0;j<9;j++){const pts=[];for(let i=0;i<=130;i++){const a=i/130*TAU+t*(.2+j*.025),r=25+j*8+5*Math.sin(t*.2+j);pts.push([vortexX+Math.cos(a)*r,vortexY+Math.sin(a)*r*(.62+.14*Math.sin(t*.15))]);}path(g,pts,j%3?'#ffd597':'#a8ceff',j%3?1:3,strength*(.28-j*.015));}flare(g,vortexX,vortexY,160,'#ffbd65',strength*.72);
  g.restore();
 }
 // Affine strips project formula textures onto continuous walls and floor.
 function plane(g,tex,proj,map,alpha){g.save();g.globalAlpha=alpha;for(let j=0;j<22;j++){const a=j/22,b=(j+1)/22;const A=proj(...map(a,0)),B=proj(...map(a,1)),C=proj(...map(b,0));g.save();g.setTransform(g.getTransform());g.transform((B[0]-A[0])/tex.width,(B[1]-A[1])/tex.width,(C[0]-A[0])/(tex.height/22),(C[1]-A[1])/(tex.height/22),A[0],A[1]);g.drawImage(tex,0,j*tex.height/22,tex.width,tex.height/22,0,0,tex.width,tex.height/22+1);g.restore();}g.restore();}
 function cathedral(g,t,strength){if(strength<.01)return;const proj=project(t),offset=(t*.9)%8;
  for(let section=7;section>=0;section--){const z=section*8+2-offset;if(z<1)continue;
   for(const side of [-1,1]){plane(g,walls[section%3],proj,(v,u)=>[side*13,mix(-8,8,v),z+u*8],strength*.83);const a=proj(side*13,-8,z),b=proj(side*13,8,z);path(g,[a,b],'#65fff1',2.8,strength*.83);flare(g,b[0],b[1],22,'#f6c673',strength*.6);}
   plane(g,walls[(section+1)%3],proj,(v,u)=>[mix(-13,13,u),8,z+v*8],strength*.46);
   for(let x=-13;x<=13;x+=2.6)path(g,[proj(x,8,z),proj(x,8,z+8)],'#41adbc',.9,strength*.3);
   path(g,[proj(-13,8,z),proj(13,8,z)],'#9affec',1.8,strength*.72);
   path(g,[proj(-13,-8,z),proj(13,-8,z)],'#6bd9f1',1.5,strength*.6);
  }
  g.save();g.globalCompositeOperation='screen';for(let i=0;i<100;i++){const z=2+((rand(i+8)*62-t*.65)%62+62)%62,p=proj((rand(i+5)-.5)*24,(rand(i+17)-.5)*13,z);flare(g,p[0],p[1],Math.max(4,p[2]*.08),i%5?'#6fe7e4':'#ffca72',strength*(.3+rand(i)*.6));}
  for(let i=0;i<32;i++){const z=3+((i*2.7-t*.7)%65+65)%65,p=proj((i%2?1:-1)*(6+rand(i)*5),(rand(i+22)-.5)*13,z);glyph(g,formulas[i%10],p[0],p[1],Math.min(43,Math.max(11,p[2]*.5)),i%5?'#7fdedb':'#ffdf9b',strength*.6,Math.sin(t*.07+i)*.08);}
  for(let j=0;j<3;j++){const yy=2+j*1.4,pts=[];for(let i=0;i<=120;i++){const a=i/120*TAU;pts.push(proj(Math.cos(a)*7,yy+Math.sin(a*3+t*.6)*.3,25+Math.sin(a)*7));}path(g,pts,j%2?'#6bfff2':'#ffcd79',2,strength*.65);const p=proj(Math.cos(t*.6+j)*7,yy,25+Math.sin(t*.6+j)*7);flare(g,p[0],p[1],55,'#ffc46c',strength*.8);}g.restore();
 }
 // Traveling luminous ribs and deterministic branched electrical discharges.
 // The rails stay in the same projected space as the wall/floor atlas.
 function electrical(g,t,q,corridor){
  const proj=project(t),strength=.4+.6*corridor;g.save();g.globalCompositeOperation='screen';
  for(let side of [-1,1])for(let rail=0;rail<3;rail++){
   const y=rail===0?-8:rail===1?8:0,pts=[];
   for(let j=0;j<=70;j++)pts.push(proj(side*13,y,2+j));
   path(g,pts,rail===1?'#72fff2':'#61bdff',7,strength*.09);path(g,pts,'#a9f6ff',1.6,strength*.5);
   for(let j=0;j<3;j++){
    const z=3+((j*23+t*(rail===1?-7:5)+side*4)%68+68)%68,trail=[];
    for(let k=0;k<=18;k++)trail.push(proj(side*13,y,z+k*.11));
    path(g,trail,j%2?'#ffd587':'#a2fff4',14,strength*.1);path(g,trail,'#e7ffff',3,strength*.85);
    const p=proj(side*13,y,z);flare(g,p[0],p[1],rail===1?70:48,j%2?'#ffdba1':'#90fff0',strength*.75);
   }
  }
  // Light sweeps move through the entire portal, illuminating its four edges.
  for(let j=0;j<3;j++){
   const z=4+((j*24-t*6)%70+70)%70,p=[proj(-13,-8,z),proj(13,-8,z),proj(13,8,z),proj(-13,8,z),proj(-13,-8,z)];
   path(g,p,j%2?'#ffdb8c':'#66eaff',11,strength*.08);path(g,p,j%2?'#ffdc96':'#9df8ff',2.4,strength*.7);
  }
  // A blue-white bolt occurs about every 3.8 seconds on alternating walls.
  // Branches persist 0.55 s; a broad wall glow decays more gently than the core.
  const event=Math.floor(t/3.8),age=t-event*3.8-.7;
  if(age>=0&&age<.8){const side=event%2?1:-1,z=9+rand(event+400)*24,energy=Math.exp(-age*5)*(1+.22*Math.sin(age*34));
   const points=[];for(let i=0;i<=19;i++)points.push(proj(side*(12.9+Math.sin(i*2.3+event)*.65),-8+i*16/19,z+(rand(event*47+i)-.5)*2.8));
   path(g,points,'#4e9aff',24,energy*strength*.14);path(g,points,'#7de7ff',7,energy*strength*.6);path(g,points,'#edffff',2,energy*strength);
   for(let b=0;b<3;b++){const i=4+b*5,p=points[i],fork=[p];for(let k=1;k<=5;k++){const v=proj(side*(12.9-k*.27),-8+(i+k*.5)*16/19,z+k*.65);fork.push([v[0]+(rand(k+event*6)-.5)*15,v[1]]);}path(g,fork,'#b7f7ff',1.3,energy*strength*.7);}
   const p=points[9];flare(g,p[0],p[1],portrait?380:500,'#61baff',energy*strength*.4);
   // The spatial wash raises the surrounding wall illumination without obscuring math.
   const wash=g.createRadialGradient(p[0],p[1],0,p[0],p[1],W*.8);wash.addColorStop(0,`rgba(105,195,255,${energy*.12})`);wash.addColorStop(1,'rgba(30,100,255,0)');g.fillStyle=wash;g.fillRect(0,0,W,H);
  }
  // Formula transformations trigger a slower, gold portal pulse.
  const beat=Math.sin(q.u*Math.PI*3)**12;
  for(let side of [-1,1]){const p=proj(side*13,8,15+8*Math.sin(t*.13));flare(g,p[0],p[1],150,'#ffd68e',beat*.22*strength);}
  g.restore();
 }
 function polar(g,t,q){const visible=q.scene===1||q.scene===2||q.scene===6;if(!visible)return;const cx=portrait?W/2:1300,cy=portrait?(q.scene===6?1180:1080):610,r=portrait?345:330;g.save();g.globalCompositeOperation='screen';for(let j=1;j<=16;j++){g.strokeStyle=j%4?'#36a9c7':'#8fe7ff';g.globalAlpha=j%4?.17:.38;g.lineWidth=j%4?.7:1.3;g.beginPath();g.arc(cx,cy,r*j/16,0,TAU);g.stroke();}for(let j=0;j<72;j++){const a=j/72*TAU;path(g,[[cx,cy],[cx+Math.cos(a)*r,cy+Math.sin(a)*r]],'#5bc9df',j%6? .55:1.2,j%6?.16:.32);}const scan=t*.42,pts=[];for(let i=0;i<=65;i++){const a=scan+i/65*.28;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}path(g,pts,'#6afae8',4,.7);const p=pts[pts.length-1];flare(g,p[0],p[1],38,'#87fff0',.9);for(let j=0;j<4;j++){const rr=r+18+j*8;const a=t*(j%2?-.18:.13)+j;const arc=[];for(let i=0;i<=75;i++){const v=a+i/75*Math.PI*1.2;arc.push([cx+Math.cos(v)*rr,cy+Math.sin(v)*rr]);}path(g,arc,j%2?'#b79aff':'#62d2ed',1.3,.35);}g.restore();}
 return {render(g,q){const {t,scene,u}=q;const gradient=g.createLinearGradient(0,0,W,H);gradient.addColorStop(0,'#050e20');gradient.addColorStop(.5,'#102d47');gradient.addColorStop(1,'#06182b');g.fillStyle=gradient;g.fillRect(0,0,W,H);const corridor=(scene===4||scene===5)?.92:scene===3?.5:scene===6?.34:.15;cosmic(g,t,1-corridor*.45);cathedral(g,t,corridor);electrical(g,t,q,corridor);polar(g,t,q);
 // Preserve equation contrast with a soft, local optical matte.
 const mx=(scene===1||scene===2||scene===6)&&!portrait?W*.29:W*.5,my=portrait?H*.31:H*.50;
 const matte=g.createRadialGradient(mx,my,20,mx,my,portrait?W*.64:W*.44);matte.addColorStop(0,'#0209148c');matte.addColorStop(.52,'#02091455');matte.addColorStop(1,'#02091400');g.fillStyle=matte;g.fillRect(0,0,W,H);
 const vign=g.createRadialGradient(W/2,H*.5,Math.min(W,H)*.25,W/2,H*.5,Math.max(W,H)*.65);vign.addColorStop(0,'#01020a00');vign.addColorStop(.75,'#01020a22');vign.addColorStop(1,'#01020a70');g.fillStyle=vign;g.fillRect(0,0,W,H);
 }};
}
