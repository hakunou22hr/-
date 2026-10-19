import {createCanvas,GlobalFonts} from '@napi-rs/canvas';
import {mathImages} from './math-images.mjs';
import {film,setMathPainter} from '../visual.js';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {writeFileSync,mkdirSync} from 'node:fs';
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','Noto Sans CJK JP');
const math=await mathImages();setMathPainter((c,key,x,y,maxWidth,height)=>{const m=math[key],ww=Math.min(maxWidth,height*m.ratio),hh=ww/m.ratio;c.drawImage(m.image,x+(maxWidth-ww)/2,y-hh/2,ww,hh)});
const portrait=process.argv[2]==='short',W=portrait?1080:1920,H=portrait?1920:1080,duration=portrait?30:90;
const c=createCanvas(W,H),ctx=c.getContext('2d'),out=`public/media/even-odd/even-odd-integral-${portrait?'30s-instagram':'90s-pc'}.mp4`;
const ff=spawn('ffmpeg',['-y','-hide_banner','-loglevel','error','-f','rawvideo','-pixel_format','rgba','-video_size',`${W}x${H}`,'-framerate','30','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-threads','4','-movflags','+faststart','-t',String(duration),out],{stdio:['pipe','inherit','inherit']});
const exit=once(ff,'close');
for(let frame=0;frame<duration*30;frame++){film(ctx,W,H,frame/30,portrait);const data=ctx.getImageData(0,0,W,H).data;if(!ff.stdin.write(data))await once(ff.stdin,'drain');if(frame%300===0)console.log(`${portrait?'short':'wide'} ${frame/30}/${duration}s`);}
ff.stdin.end();const [code]=await exit;if(code)throw Error(`ffmpeg ${code}`);console.log(out);
