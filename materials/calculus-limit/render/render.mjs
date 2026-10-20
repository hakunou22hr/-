import {createCanvas,GlobalFonts} from '@napi-rs/canvas';
import {mathImages} from './math-images.mjs';
import {cinemaFrame,configureCinema} from './cinematic.js';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','Noto Sans CJK JP');
const math=await mathImages();configureCinema({math,createCanvas});
const portrait=process.argv[2]==='short',W=portrait?1080:1920,H=portrait?1920:1080,duration=portrait?30:90;
const start=Number(process.env.CINEMA_START||0);
const c=createCanvas(W,H),ctx=c.getContext('2d'),out=process.env.CINEMA_OUTPUT||`public/media/calculus-limit/calculus-limit-${portrait?'30s-instagram':'90s-pc'}.mp4`;
const ff=spawn('ffmpeg',['-y','-hide_banner','-loglevel','error','-f','rawvideo','-pixel_format','rgba','-video_size',`${W}x${H}`,'-framerate','30','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-threads','4','-movflags','+faststart','-t',String(duration-start),out],{stdio:['pipe','inherit','inherit']});
const exit=once(ff,'close');
for(let frame=0;frame<(duration-start)*30;frame++){cinemaFrame(ctx,W,H,start+frame/30,portrait);const data=ctx.getImageData(0,0,W,H).data;if(!ff.stdin.write(data))await once(ff.stdin,'drain');if(frame%300===0)console.log(`${portrait?'short':'wide'} ${frame/30}/${duration}s`);}
ff.stdin.end();const [code]=await exit;if(code)throw Error(`ffmpeg ${code}`);console.log(out);
