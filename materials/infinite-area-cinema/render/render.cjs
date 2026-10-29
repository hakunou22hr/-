const {createCanvas,GlobalFonts,loadImage}=require(process.env.CANVAS_MODULE||'@napi-rs/canvas');
const {spawn}=require('child_process');const {once}=require('events');const fs=require('fs');
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','JP');
const pathmod=require('path');
const W=1280,H=720,FPS=24,D=Number(process.env.DURATION||120),C=createCanvas(W,H),c=C.getContext('2d'),dir=pathmod.resolve(process.env.OUTPUT||'work/infinite-area');
if(![30,120].includes(D))throw Error('DURATION must be 30 or 120');fs.mkdirSync(dir,{recursive:true});
const cuts=D===120?[0,16,30,46,78,96,108,120]:[0,4,7,11,19,24,27,30];
const sourceCuts=[0,10,18,28,47,59,67,75];
function storyTime(t){let i=cuts.findIndex((end,j)=>j>0&&t<end)-1;if(i<0)i=6;return sourceCuts[i]+(t-cuts[i])/(cuts[i+1]-cuts[i])*(sourceCuts[i+1]-sourceCuts[i]);}
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
const CY='#65dfff',GO='#ffd082',WH='#e9f7ff';
function txt(s,x,y,size=24,color=WH,align='left'){c.font=`${size}px JP`;c.fillStyle=color;c.textAlign=align;c.textBaseline='middle';c.fillText(s,x,y)}
function path(p,close=false){c.beginPath();p.forEach((v,i)=>i?c.lineTo(...v):c.moveTo(...v));if(close)c.closePath()}
function line(p,col,w=1,glow=0){path(p);c.strokeStyle=col;c.lineWidth=w;c.shadowColor=col;c.shadowBlur=glow;c.stroke();c.shadowBlur=0}
const rnd=i=>{let a=Math.sin(i*127.12+42)*43758.53;return a-Math.floor(a)};
let imgs={};
function formula(name,x,y,width,alpha=1){let im=imgs[name];c.save();c.globalAlpha*=alpha;c.drawImage(im,x-width/2,y-width*im.height/im.width/2,width,width*im.height/im.width);c.restore()}
function bg(t){let g=c.createRadialGradient(700,350,10,640,350,850);g.addColorStop(0,'#102b40');g.addColorStop(.45,'#061422');g.addColorStop(1,'#01050c');c.fillStyle=g;c.fillRect(0,0,W,H);
 // A moving vanishing grid, with a soft pool of light at the horizon.
 let vanX=640+55*Math.sin(t*.09),vanY=395; c.save();c.globalAlpha=.25;
 for(let i=-12;i<=12;i++)line([[vanX+i*15,vanY],[640+i*150+45*Math.sin(t*.09),700]],'#23546a');
 for(let i=0;i<14;i++){let z=((i+t*.13)%14)/14;let y=vanY+z*z*305;line([[0,y],[W,y]],'#23546a')};c.restore();
 for(let i=0;i<100;i++){let x=(rnd(i)*W+t*(rnd(i+150)-.5)*2+W)%W,y=(rnd(i+250)*H-t*(.3+rnd(i+350))+H)%H;c.fillStyle=`rgba(153,206,237,${.08+.28*rnd(i+44)})`;c.fillRect(x,y,rnd(i+5)>.9?2:1,1)}
 let v=c.createLinearGradient(0,0,0,H);v.addColorStop(0,'rgba(0,0,0,.3)');v.addColorStop(.7,'transparent');v.addColorStop(1,'rgba(0,0,0,.6)');c.fillStyle=v;c.fillRect(0,0,W,H);
}
function graph(t,n,reveal,solid=0){let front=smooth((t-28)/19);let scale=1+.035*Math.sin(t*.16);let skew=mix(.32,0,front),left=mix(220,170,front),base=514;
 const p=(x,y)=>[left+x*153*scale+y*skew*1.6,base-y*12.1*scale-x*mix(11,0,front)];
 c.save();
 for(let x=0;x<=6;x++)line([p(x,0),p(x,28)],'rgba(87,166,197,.13)');
 for(let y=0;y<=25;y+=5)line([p(0,y),p(6,y)],'rgba(87,166,197,.13)');
 line([p(0,29),p(0,0),p(6.25,0)],'rgba(223,245,255,.8)',1.4,4);
 txt('x',...p(6.45,-.3),19);txt('y',...p(-.15,29.4),19);
 for(let x of [2,5]){line([p(x,0),p(x,-.55)],WH,1.5);txt(''+x,...p(x,-2),25,WH,'center')}
 if(solid>0){let pts=[p(2,0)];for(let j=0;j<=100;j++){let x=2+3*j/100;pts.push(p(x,x*x))}pts.push(p(5,0));path(pts,true);let g=c.createLinearGradient(0,220,0,540);g.addColorStop(0,`rgba(255,205,120,${.65*solid})`);g.addColorStop(1,`rgba(255,165,52,${.12*solid})`);c.fillStyle=g;c.fill();line([p(2,0),p(2,4)],GO,1.3,8);line([p(5,0),p(5,25)],GO,1.3,8)}
 if(reveal>0&&solid<1){let phase=(t-28)%3,blend=smooth(phase/.75);for(let k=1;k<=n;k++){let x=2+3*k/n,l=x-3/n,ht=x*x;let rise=smooth(reveal*1.6-k/n*.6);if(t>=28&&n>4){let oldx=2+Math.ceil(k/2)*6/n;ht=mix(oldx*oldx,ht,blend)}ht*=rise;
 let pts=[p(l,0),p(l,ht),p(x,ht),p(x,0)];path(pts,true);let g=c.createLinearGradient(0,p(x,ht)[1],0,base);g.addColorStop(0,`rgba(90,214,255,${.35*(1-solid)})`);g.addColorStop(1,`rgba(42,155,200,${.06*(1-solid)})`);c.fillStyle=g;c.fill();c.globalAlpha=1-solid;line(pts.concat([pts[0]]),CY,n>64?.55:1.3,n<=16?5:0);c.globalAlpha=1;
 if(t>=18&&t<28&&k===2){line([p(l,0),p(x,0)],CY,4,8);line([p(x,0),p(x,ht)],'#ff8e85',3,8);c.beginPath();c.arc(...p(x,0),4,0,Math.PI*2);c.fillStyle=GO;c.fill()}}
 }
 let curve=[];for(let j=0;j<=200;j++){let x=j/200*5.55*smooth((t-10)/4);curve.push(p(x,x*x))}line(curve,GO,2.5,9);txt('y = x²',...p(5.35,27.8),23,GO);
 if(t>=10&&t<18){line([p(2,-4),p(5,-4)],CY,2,7);txt('区間の長さ  5 − 2 = 3',...p(3.5,-6.2),20,CY,'center')}
 c.restore();
}
const scenes=[ [0,10,'01 / THE QUESTION','無限が、面積になる瞬間','この足し算には、ひとつの形が隠れている。'],[10,18,'02 / THE INTERVAL','舞台は、2から5まで','幅は 3/n。区間の長さは 3。'],[18,28,'03 / WIDTH × HEIGHT','ひとつの長方形を読み解く','右端の位置の二乗が、高さになる。'],[28,47,'04 / INFINITE DIVISION','分けるほど、曲線に近づく','長方形の幅を小さくし、その面積を足し合わせる。'],[47,59,'05 / SUM TO INTEGRAL','無限の和が、定積分になる','n → ∞ のとき、幅 Δx → 0。'],[59,67,'06 / THE CALCULATION','面積を、計算する','定積分を計算すると、'],[67,75,'07 / THE ANSWER','無限の先に、39','無数の長方形が、ひとつの面積へ。'] ];
function draw(outputTime){let t=storyTime(outputTime);bg(t);let sc=scenes.find(s=>t<s[1])||scenes[6];let local=t-sc[0],a=smooth(local/.7);c.save();c.globalAlpha=a;txt(sc[2],72,68,14,CY);txt(sc[3],72,112,32);c.restore();
 if(t<10){let z=mix(1.2,1,smooth(t/8));c.save();c.translate(640,330);c.scale(z,z);formula('sum',0,0,870,smooth(t/2));c.restore();txt('長方形の和  →  曲線の下の面積',640,478,22,GO,'center');}
 else{let n=t<28?4:4*2**Math.min(6,Math.floor((t-28)/3));let solid=smooth((t-47)/5);graph(t,n,smooth((t-17)/7),solid);
 if(t<18){txt('Δx = 3/n',1040,245,27,CY,'center');txt('a = 2     b = 5',1040,292,23,GO,'center')}
 else if(t<28){formula('parts',640,594,880);}
 else if(t<47){txt('n = '+n,1120,245,40,CY,'center');txt('Δx = '+(3/n).toFixed(5),1120,292,20,WH,'center');let sum=39+31.5/n+4.5/(n*n);txt('長方形の和',1120,350,18,WH,'center');txt(sum.toFixed(3),1120,390,29,GO,'center');txt('→ 39',1120,435,24,GO,'center');}
 else if(t<59){let k=smooth((t-47)/4);c.save();c.globalAlpha=.85;formula('sum',350,588,340,1);formula('integral',850,592,200,k);txt('=',690,592,45,GO,'center');c.restore();txt('n → ∞',1020,255,35,CY,'center');txt('Δx → 0',1020,310,29,CY,'center');}
 else if(t<67){formula('calc',640,600,570,smooth((t-59)/2));}
 else {c.save();let g=c.createRadialGradient(1030,360,0,1030,360,170);g.addColorStop(0,'rgba(255,190,79,.15)');g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(820,150,430,420);txt('39',1040,340,110,GO,'center');txt('THE AREA',1040,426,14,WH,'center');c.restore();formula('integral',640,592,200);}}
 // Stable subtitle band and film frame.
 c.fillStyle='rgba(1,5,12,.78)';c.fillRect(0,646,W,74);txt(sc[4],640,679,23,WH,'center');
 c.fillStyle='#01040a';c.fillRect(0,0,W,25);c.fillRect(0,705,W,15);c.fillStyle='rgba(101,223,255,.55)';c.fillRect(72,704,(W-144)*outputTime/D,1);
 let fade=smooth(t/1.2)*(1-smooth((t-73)/2));if(fade<1){c.fillStyle=`rgba(0,0,0,${1-fade})`;c.fillRect(0,0,W,H)}
}
(async()=>{for(let n of ['sum','parts','integral','calc'])imgs[n]=await loadImage(Buffer.from(fs.readFileSync(pathmod.join(__dirname,'assets',n+'.png.b64'),'utf8').trim(),'base64'));
for(let t of cuts.slice(0,-1).map((v,i)=>(v+cuts[i+1])/2)){draw(t);fs.writeFileSync(dir+'/sample-'+t+'.jpg',C.toBuffer('image/jpeg',88))}
if(process.argv.includes('--samples'))return;
let ff=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgba','-video_size',`${W}x${H}`,'-framerate',''+FPS,'-i','pipe:0','-ss',process.env.CLIP_START||'0','-i',dir+'/score.wav','-c:v','libx264','-preset','fast','-crf','25','-pix_fmt','yuv420p','-af',`atempo=${75/D},apad`,'-c:a','aac','-b:a','128k','-movflags','+faststart','-t',String(D),(process.env.VIDEO_OUT||pathmod.join(dir,`infinite-area-${D}s.mp4`))],{stdio:['pipe','ignore','pipe']});let err='';ff.stderr.on('data',b=>err+=b);const done=once(ff,'close');let start=Number(process.env.CLIP_START||0),end=Number(process.env.CLIP_END||D);for(let i=start*FPS;i<end*FPS;i++){draw(i/FPS);if(!ff.stdin.write(C.data()))await once(ff.stdin,'drain');if(i%240===0)console.log('rendered '+i+'/'+D*FPS)}ff.stdin.end();let [code]=await done;if(code)throw Error(err);console.log('DONE');})();
