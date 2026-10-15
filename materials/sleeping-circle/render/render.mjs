import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdir,writeFile} from 'node:fs/promises';
import {createFilm} from '../film.js';
async function run(cmd,args){const p=spawn(cmd,args,{stdio:['ignore','pipe','inherit']});let data='';p.stdout.on('data',v=>data+=v);const [code]=await once(p,'close');if(code)throw Error(cmd+' '+code);return data;}
const require=createRequire(import.meta.url);const {createCanvas,GlobalFonts}=require('@napi-rs/canvas');
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','Noto Sans CJK JP');
const duration=Number(process.argv[2]||90),portrait=process.argv[3]==='portrait';
const start=Number(process.argv[4]||0),end=Number(process.argv[5]||duration);const frames=(end-start)*30;
const w=portrait?1080:1920,h=portrait?1920:1080,tag=`${duration}s${portrait?'-vertical':''}`;
const dir=process.env.CIRCLE_OUTPUT||'public/media/sleeping-circle',work='work/sleeping-circle';await mkdir(dir,{recursive:true});
const film=createFilm(createCanvas,w,h),out=createCanvas(w,h),g=out.getContext('2d');
const file=start?`${dir}/sleeping-circle-${tag}-from-${start}.mp4`:`${dir}/sleeping-circle-${tag}.mp4`;
const ff=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-vcodec','mjpeg','-framerate','30','-i','pipe:0','-ss',String(start),'-i',`${work}/audio-${duration}.wav`,'-vf','scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-r','30','-fps_mode','cfr','-video_track_timescale','15360','-c:v','libx264','-preset','fast','-threads','4','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-t',String(end-start),'-movflags','+faststart',file],{stdio:['pipe','ignore','inherit']});
const finish=once(ff,'close');
const samples=new Set([0,Math.round(duration*.18*30),Math.round(duration*.32*30),Math.round(duration*.48*30),Math.round(duration*.65*30),Math.round(duration*.82*30),Math.round(duration*.95*30)]);
for(let n=start*30;n<end*30;n++){film.render(n/30,duration);g.clearRect(0,0,w,h);film.layers.forEach(c=>g.drawImage(c,0,0));if(samples.has(n))await writeFile(`${work}/${tag}-${n}.jpg`,out.toBuffer('image/jpeg',90));const frame=out.toBuffer('image/jpeg',93);if(!ff.stdin.write(frame))await once(ff.stdin,'drain');if(n%300===0)console.log(tag,n,'/',duration*30);}
ff.stdin.end();const [code]=await finish;if(code)throw Error('ffmpeg '+code);
const probe=JSON.parse(await run('ffprobe',['-v','error','-count_frames','-show_streams','-show_format','-of','json',file]));const v=probe.streams.find(s=>s.codec_type==='video'),a=probe.streams.find(s=>s.codec_type==='audio');
if(v.width!==w||v.height!==h||+v.nb_read_frames!==frames||+probe.format.duration!==end-start||a.codec_name!=='aac'||v.codec_name!=='h264')throw Error('Invalid encode');
await run('ffmpeg',['-v','error','-i',file,'-f','null','-']);await writeFile(`${work}/probe-${tag}.json`,JSON.stringify(probe,null,2));console.log('VERIFIED',file,probe.format.duration);
