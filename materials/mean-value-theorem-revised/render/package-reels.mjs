import {spawn} from 'node:child_process';import {once} from 'node:events';import {resolve,dirname} from 'node:path';import {fileURLToPath} from 'node:url';import {existsSync} from 'node:fs';
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'../../..'),out=resolve(process.env.OUTPUT||'/workspace/work/mvt-reels/delivery'),media=repo+'/public/media/mean-value-theorem-revised',main=media+'/instagram-30s-v10.mp4';
const run=async args=>{const p=spawn('ffmpeg',['-y','-v','error',...args],{stdio:'inherit'});if((await once(p,'exit'))[0])throw Error('ffmpeg failed')};
// Optional cached typography correction. Fresh full renders already use the
// corrected point label, so they can be muxed directly without this cache.
if(existsSync(out+'/instagram-patch-v10.mov'))await run(['-i',out+'/instagram-30s-v10-silent.mp4','-i',out+'/instagram-patch-v10.mov','-i',media+'/narration-instagram-30s-v10.m4a','-filter_complex_threads','1','-filter_complex',"[0:v]format=rgba[base];[1:v]setpts=PTS+18.5/TB,format=rgba[fix];[base][fix]overlay=x=270:y=900:format=rgb:eof_action=pass:repeatlast=0:enable='gte(t,18.5)',scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p[film]",'-map','[film]','-map','2:a:0','-c:a','copy','-c:v','libx264','-threads','3','-preset','fast','-crf','18','-r','30','-t','30','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart',main]);
else await run(['-i',out+'/instagram-30s-v10-silent.mp4','-i',media+'/narration-instagram-30s-v10.m4a','-map','0:v:0','-map','1:a:0','-c','copy','-t','30','-movflags','+faststart',main]);
for(const t of [3,9.8,13.8,19.5,25.5,28])await run(['-ss',String(t),'-i',main,'-frames:v','1','-q:v','2',media+'/instagram-frame-'+String(t).replace('.','-')+'-v10.jpg']);
await run(['-ss','19.5','-i',main,'-frames:v','1','-q:v','2',media+'/instagram-poster-v10.jpg']);
console.log('Packaged Instagram MP4: 1080×1920, 30 seconds, assistant voice');
