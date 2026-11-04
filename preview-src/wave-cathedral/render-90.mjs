import{createCanvas,loadImage,GlobalFonts}from'@napi-rs/canvas';import * as T from'three';import{writeFileSync}from'node:fs';import{spawn,spawnSync}from'node:child_process';import{once}from'node:events';
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','Noto Sans CJK JP');
const W=1920,H=1080,FPS=60,D=78,root='public/previews/wave-cathedral/',c=createCanvas(W,H),g=c.getContext('2d'),camera=new T.PerspectiveCamera(47,W/H,.1,100),v=new T.Vector3(),bg=await loadImage(root+'background.jpg'),math=await Promise.all(Array.from({length:10},(_,i)=>loadImage(root+`formula-90-${i}.png`))),clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},hash=i=>{const a=Math.sin(i*127.1+311.7)*43758.5;return a-Math.floor(a)},TAU=Math.PI*2,A=Math.PI/4,B=5*Math.PI/4;
const spr=createCanvas(64,64),sg=spr.getContext('2d'),halo=sg.createRadialGradient(32,32,0,32,32,32);halo.addColorStop(0,'#fff8df');halo.addColorStop(.1,'#ffe6a7dd');halo.addColorStop(.35,'#ffc96045');halo.addColorStop(1,'#ffb83300');sg.fillStyle=halo;sg.fillRect(0,0,64,64);
function project(x,y,z=0){const m=camera.matrixWorldInverse.elements;if(m[2]*x+m[6]*y+m[10]*z+m[14]>-.4)return[-9999,-9999];v.set(x,y,z).project(camera);return[(v.x+1)*W/2,(1-v.y)*H/2]}
function point(x,y,z=0){return project((x/TAU-.5)*14,y*2.55+.2,z)}
function stroke(pts,color,w,a=1){g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.strokeStyle=color;g.lineWidth=w;g.globalAlpha=a;g.stroke()}
function glow(x,y,r,color,a){g.save();g.globalCompositeOperation='screen';g.globalAlpha=a;const h=g.createRadialGradient(x,y,0,x,y,r);h.addColorStop(0,color+'bb');h.addColorStop(.2,color+'55');h.addColorStop(1,color+'00');g.fillStyle=h;g.fillRect(x-r,y-r,r*2,r*2);g.restore()}
function curve(t,fn,col,reveal,reflection=false){const pts=[];for(let i=0;i<=240*reveal;i++){const x=i/240*TAU,y=fn(x);pts.push(reflection?project((x/TAU-.5)*14,-6.6-(y*2.55+.2),0):point(x,y,.05))}if(pts.length<2)return;g.save();g.globalCompositeOperation='screen';if(reflection){stroke(pts,col,4,.12);g.restore();return}stroke(pts,col,34,.04);stroke(pts,col,14,.12);stroke(pts,col,5,.75);stroke(pts,'#effbff',1.6,.95);const end=pts.at(-1);glow(...end,36,col,.9);g.restore()}
function draw(t){const advance=smooth(t/64),retreat=smooth((t-44)/6),inside=smooth((t-31)/5)*(1-smooth((t-44)/6)),z=24-6*smooth(t/20)-10*inside+Math.sin(t*.07)*.3,camx=(-2.4+3.6*advance+.3*Math.sin(t*.09))*(1-inside)-1.75*inside;camera.position.set(camx,1.8-.8*smooth(t/30),z);camera.lookAt(-1.75*inside,-.35*(1-inside),0);camera.updateMatrixWorld();g.globalAlpha=1;g.globalCompositeOperation='source-over';g.fillStyle='#01050b';g.fillRect(0,0,W,H);
// Architectural background dolly; the mathematical plane and dust use a true 3D camera.
const zoom=1+.12*advance+.035*inside,bw=W*zoom,bh=H*zoom;g.drawImage(bg,(W-bw)*.53-camx*4,(H-bh)*.47,bw,bh);g.fillStyle='#01060c25';g.fillRect(0,0,W,H);
// Inscribed mathematical light on receding side walls.
g.save();g.globalCompositeOperation='screen';for(let i=0;i<18;i++){const side=i%2?-1:1,x=side*(8.3+(i%3)*.6),y=1+(i%5)*.9,z=-16+Math.floor(i/5)*3,p=project(x,y,z);if(p[0]<-200||p[0]>W||p[1]<0||p[1]>H*.72)continue;g.font=`italic ${18+(i%3)*5}px serif`;g.fillStyle=i%3?'#84c9e8':'#ffe0a1';g.globalAlpha=(.07+.10*smooth((t-.5-i*.035)/2))*(.8+.2*Math.sin(t*.7+i));g.fillText(['y = sin x','y = cos x','sin x = cos x','0 ≤ x ≤ 2π','π/4    5π/4','∫ (sin x − cos x) dx'][i%6],p[0],p[1])}g.restore();
// Floating grains occupy depth, showing parallax as the camera approaches.
g.save();g.globalCompositeOperation='screen';for(let i=0;i<230;i++){const x=(hash(i)-.5)*27+Math.sin(t*.3+i)*.3,y=-2+hash(i+300)*11+Math.sin(t*.27+i)*.13,z=-20+hash(i+600)*29+t*.035,p=project(x,y,z),r=1.3+hash(i+19)*4;if(p[0]<0||p[0]>W||p[1]<0||p[1]>H)continue;g.globalAlpha=.12+hash(i+11)*.4;g.drawImage(spr,p[0]-r,p[1]-r,r*2,r*2)}g.restore();
const sr=smooth(t/10),cr=smooth((t-5)/11),fill=smooth((t-30)/14),end=A+(B-A)*fill;
// Coordinates are placed on one physical x-y plane, not two displaced curves.
const axes=smooth(t/3);stroke([point(0,0),point(TAU+.15,0)],'#a2d7e5',1.3,axes*.44);stroke([point(0,-1.2),point(0,1.2)],'#a2d7e5',1.3,axes*.44);g.globalAlpha=1;
if(fill>0){const area=[];for(let i=0;i<=160;i++){const x=A+(end-A)*i/160;area.push(point(x,Math.sin(x),-.04))}for(let i=160;i>=0;i--){const x=A+(end-A)*i/160;area.push(point(x,Math.cos(x),-.04))}g.save();g.beginPath();area.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();const grad=g.createLinearGradient(0,H*.3,0,H*.72);grad.addColorStop(0,'#fff0a3a0');grad.addColorStop(.45,'#ffcf5b62');grad.addColorStop(1,'#f6a42f82');g.fillStyle=grad;g.shadowColor='#ffcd64';g.shadowBlur=25;g.fill();g.shadowBlur=0;
// The membrane has moving density and glitter, while the mathematical boundary stays exact.
g.clip();g.globalCompositeOperation='screen';for(let i=0;i<180;i++){const u=(hash(i+1040)+t*(.025+hash(i)*.025))%1,x=A+u*(B-A),lo=Math.cos(x),hi=Math.sin(x),v=(hash(i+1720)+t*.05)%1,y=lo+(hi-lo)*v,p=point(x,y,.01),r=2+hash(i+86)*6;g.globalAlpha=.12+hash(i)*.35;g.drawImage(spr,p[0]-r*2,p[1]-r*2,r*4,r*4)}g.restore();
// A few light strands reveal the varying height between the two curves.
for(let i=0;i<34;i++){const x=A+(B-A)*(i+.5)/34;if(x>end)continue;const a=point(x,Math.cos(x)),b=point(x,Math.sin(x));stroke([a,b],'#ffdb88',1.1,.08+.1*Math.sin(t*1.8+i*.5)**2)}
const center=point(3*Math.PI/4,.1);glow(...center,150,'#ffd174',fill*.17)}
curve(t,Math.sin,'#55d9ff',sr,true);curve(t,Math.cos,'#b18aff',cr,true);curve(t,Math.sin,'#55d9ff',sr);curve(t,Math.cos,'#ba8cff',cr);
g.save();g.font='italic 29px serif';g.textAlign='center';for(const[x,fn,label,col,reveal]of[[Math.PI*.51,Math.sin,'y = sin x','#a7edff',sr],[Math.PI*1.78,Math.cos,'y = cos x','#ddc4ff',cr]]){g.globalAlpha=smooth((reveal-.6)/.3);const p=point(x,fn(x)+.16,.1);g.shadowColor=col;g.shadowBlur=12;g.fillStyle=col;g.fillText(label,p[0],p[1]-7)}g.shadowBlur=0;g.font='23px serif';g.fillStyle='#c2dde8';g.globalAlpha=axes*.8;for(const[x,label]of[[0,'0'],[Math.PI/2,'π/2'],[Math.PI,'π'],[3*Math.PI/2,'3π/2'],[TAU,'2π']]){const p=point(x,0);g.fillText(label,p[0],p[1]+29)}g.restore();
for(const[x,label,delay]of[[A,'π/4',16.2],[B,'5π/4',17.4]]){const a=smooth((t-delay)/.5);if(a===0)continue;const p=point(x,Math.sin(x),.12),base=point(x,0,.12);glow(...p,50,'#ffdf8b',a*.85);g.save();g.globalCompositeOperation='screen';g.globalAlpha=a;g.fillStyle='#fff3ca';g.beginPath();g.arc(...p,4.5,0,TAU);g.fill();stroke([p,base],'#ffe3a1',1.2,a*.4);g.font='25px serif';g.textAlign='center';g.fillStyle='#ffe5aa';g.fillText(label,base[0],base[1]+57);g.restore()}
if(fill>.85){const p=point(3*Math.PI/4,0,.1);g.save();g.globalAlpha=smooth((fill-.85)/.15);g.font='italic 45px serif';g.textAlign='center';g.fillStyle='#fff2bd';g.shadowColor='#ffc75e';g.shadowBlur=15;g.fillText('S',p[0],p[1]);g.restore()}
// A narrow differential strip makes the height between the two curves explicit.
if(t>=44&&t<55){const u=((t-44)/8)%1,x=A+(B-A)*u,dx=.06,x0=Math.max(A,x-dx/2),x1=Math.min(B,x+dx/2),poly=[point(x0,Math.cos(x0),.14),point(x1,Math.cos(x1),.14),point(x1,Math.sin(x1),.14),point(x0,Math.sin(x0),.14)],hi=point(x,Math.sin(x),.15),lo=point(x,Math.cos(x),.15);g.save();g.fillStyle='#fff2ad77';g.beginPath();poly.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.fill();g.globalCompositeOperation='screen';stroke([lo,hi],'#fff2bf',4,.9);glow(...hi,16,'#ffe7a2',.8);glow(...lo,16,'#ffe7a2',.8);g.restore()}
// The analysis develops during the film; each algebraic step has its own reading time.
if(t>=16){g.save();g.globalAlpha=1;const shade=g.createLinearGradient(0,H*.68,0,H);shade.addColorStop(0,'#01050a00');shade.addColorStop(.48,'#01050ac7');shade.addColorStop(1,'#01050ae8');g.fillStyle=shade;g.fillRect(0,H*.68,W,H*.32);
const show=(id,y,h=105)=>{const im=math[id],k=Math.min(W*.88/im.width,h/im.height);g.shadowColor='#ffce67';g.shadowBlur=12;g.drawImage(im,(W-im.width*k)/2,H*y-im.height*k/2,im.width*k,im.height*k);g.shadowBlur=0};
let caption='';
if(t<21){show(0,.83,100);caption='交点では、2つの関数の値が等しくなる';}
else if(t<25){show(1,.83,110);caption='交点の x 座標を求める';}
else if(t<30){show(2,.83,110);caption='区間 0 ≦ x ≦ 2π の中に交点は2つ';}
else if(t<38){show(3,.84,95);caption='この区間では、正弦曲線が上側にある';}
else if(t<44){show(3,.84,90);caption='2つの曲線の間に囲まれた領域 S';}
else if(t<50){show(4,.84,95);caption='細い帯の高さは sin x − cos x、幅は dx';}
else if(t<58){show(5,.82,145);caption='高さを、交点から交点まで積み重ねる';}
else if(t<64){show(5,.75,110);show(6,.875,105);caption='原始関数に端点の値を代入する';}
else if(t<70){show(6,.75,110);show(7,.875,100);caption='上端の値から、下端の値を引く';}
else if(t<74){show(7,.76,95);show(8,.875,115);caption='√2 − (−√2) = 2√2';}
else{show(5,.755,105);show(9,.88,130);caption='囲まれた部分の面積';}
g.font="28px 'Noto Sans CJK JP'";g.textAlign='center';g.fillStyle='#c7d7e3';g.fillText(caption,W/2,H*.975);g.restore();}
// Subtle lens vignette and a brief fade from the entrance darkness.
g.globalAlpha=1;let vig=g.createRadialGradient(W*.5,H*.47,H*.15,W*.5,H*.5,W*.67);vig.addColorStop(0,'#00000000');vig.addColorStop(1,'#00030b99');g.fillStyle=vig;g.fillRect(0,0,W,H);if(t<.55){g.fillStyle=`rgba(0,3,8,${1-smooth(t/.55)})`;g.fillRect(0,0,W,H)}
}
if(process.argv.includes('--samples')){for(const t of[6,19,28,36,43,47,54,61,67,72,77]){draw(t);writeFileSync(`work/wave-cathedral-90/frame-${t+12}.png`,c.toBuffer('image/png'))}process.exit(0)}
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-r',String(FPS),'-i','pipe:0','-an','-c:v','libx264','-threads','2','-preset','veryfast','-crf','20','-maxrate','4000k','-bufsize','8000k','-pix_fmt','yuv420p','-movflags','+faststart','work/wave-cathedral-90/mathematics-78s.mp4'],{stdio:['pipe','ignore','inherit']});for(let f=0;f<D*FPS;f++){draw(f/FPS);if(!ff.stdin.write(c.data()))await once(ff.stdin,'drain');if(f%300===0)console.log('mathematics '+f/FPS+'/'+D)}ff.stdin.end();const[code]=await once(ff,'exit');if(code)throw Error('ffmpeg failed');
writeFileSync('work/wave-cathedral-90/concat.txt',"file '../../public/previews/wave-cathedral/intro-12s.mp4'\nfile 'mathematics-78s.mp4'\n");const joined=spawnSync('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i','work/wave-cathedral-90/concat.txt','-c','copy','-movflags','+faststart',root+'lesson-90s.mp4'],{stdio:'inherit'});if(joined.status)throw Error('concat failed');draw(77);writeFileSync(root+'poster-90s.jpg',c.toBuffer('image/jpeg',92));console.log('DONE 90-second cathedral film');
