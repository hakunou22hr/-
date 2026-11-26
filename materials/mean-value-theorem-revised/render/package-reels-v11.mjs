import {spawn} from 'node:child_process';import {once} from 'node:events';import {resolve,dirname} from 'node:path';import {fileURLToPath} from 'node:url';
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'../../..'),out=resolve(process.env.OUTPUT||'/workspace/work/mvt-reels-v11/delivery'),media=repo+'/public/media/mean-value-theorem-revised',main=media+'/instagram-30s-v11.mp4';
const run=async args=>{const p=spawn('ffmpeg',['-y','-v','error',...args],{stdio:'inherit'});if((await once(p,'exit'))[0])throw Error('ffmpeg failed')};
await run(['-i',out+'/instagram-30s-v11-silent.mp4','-i',media+'/narration-instagram-30s-v10.m4a','-map','0:v:0','-map','1:a:0','-c','copy','-t','30','-movflags','+faststart',main]);
for(const t of [3,5.6,19.5,25.3,28])await run(['-ss',String(t),'-i',main,'-frames:v','1','-q:v','2',media+'/instagram-frame-'+String(t).replace('.','-')+'-v11.jpg']);
await run(['-ss','19.5','-i',main,'-frames:v','1','-q:v','2',media+'/instagram-poster-v11.jpg']);
console.log('Packaged v11: upper-right assistant and uniform mathematical close-ups');
