import {spawn} from 'node:child_process';import {once} from 'node:events';import {resolve,dirname} from 'node:path';import {fileURLToPath} from 'node:url';
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'../../..'),out=resolve(process.env.OUTPUT||'/workspace/work/mvt-reels-v18/delivery'),media=repo+'/public/media/mean-value-theorem-revised',main=media+'/instagram-30s-v18.mp4';
const run=async args=>{const p=spawn('ffmpeg',['-y','-v','error',...args],{stdio:'inherit'});if((await once(p,'exit'))[0])throw Error('ffmpeg failed')};
await run(['-i',out+'/instagram-30s-v18-silent.mp4','-map','0:v:0','-an','-c:v','copy','-t','30','-movflags','+faststart',main]);
for(const t of [1,19.5,26.5,28.5,29.9])await run(['-ss',String(t),'-i',main,'-frames:v','1','-q:v','2',media+'/instagram-frame-'+String(t).replace('.','-')+'-v18.jpg']);
await run(['-ss','19.5','-i',main,'-frames:v','1','-q:v','2',media+'/instagram-poster-v18.jpg']);
console.log('Packaged v18: assistant visuals and voice removed; silent; three-second classroom return');
