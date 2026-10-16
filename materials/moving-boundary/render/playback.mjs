// Network/decoder-friendly playback copies. The full-HD download masters stay intact.
import {spawn} from 'node:child_process';import {once} from 'node:events';import {writeFile,mkdir,readFile} from 'node:fs/promises';
async function run(command,args){const p=spawn(command,args,{stdio:['ignore','pipe','inherit']});let out='';p.stdout.on('data',b=>out+=b);const [code]=await once(p,'close');if(code)throw Error(`${command}: ${code}`);return out;}
await mkdir('work/moving-boundary-v2',{recursive:true});
const dir=process.env.MB_OUTPUT||'work/moving-boundary-v2/media';
const results=[];const requested=Number(process.argv[2]||0);
for(const [tag,duration,width,height] of [['90s',90,1280,720],['30s',30,720,1280]].filter(p=>!requested||p[1]===requested)){
 const input=`${dir}/moving-boundary-${tag}.mp4`,output=input.replace('.mp4','-play.mp4');
 await run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',input,'-map','0:v:0','-map','0:a:0','-vf',`scale=${width}:${height}:flags=lanczos:in_range=tv:out_range=tv,format=yuv420p`,'-c:v','libx264','-preset','fast','-threads','2','-profile:v','baseline','-level:v','3.1','-crf','22','-maxrate','2000k','-bufsize','4000k','-g','60','-keyint_min','30','-r','30','-fps_mode','cfr','-video_track_timescale','15360','-c:a','copy','-t',String(duration),'-movflags','+faststart',output]);
 const p=JSON.parse(await run('ffprobe',['-v','error','-count_frames','-show_streams','-show_format','-of','json',output])),v=p.streams.find(s=>s.codec_type==='video');
 if(+p.format.duration!==duration||+v.nb_read_frames!==duration*30||v.width!==width||v.height!==height||v.profile!=='Constrained Baseline')throw Error('Invalid playback copy');
 await run('ffmpeg',['-v','error','-i',output,'-f','null','-']);results.push(p);console.log('VERIFIED',output,p.format.size);
}
let existing=[];try{existing=JSON.parse(await readFile('work/moving-boundary-v2/streams.json','utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
await writeFile('work/moving-boundary-v2/streams.json',JSON.stringify([...existing.filter(p=>!results.some(r=>r.format.filename===p.format.filename)),...results],null,2));
