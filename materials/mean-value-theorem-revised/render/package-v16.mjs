// Restore the original classroom only where the former head composite appeared.
// Keep the reviewed mathematical sequences and their existing voice tracks.
import {spawn} from 'node:child_process';import {once} from 'node:events';import {resolve,dirname} from 'node:path';import {fileURLToPath} from 'node:url';
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'../../..'),out=resolve(process.env.OUTPUT||'/workspace/work/mvt-v16/delivery'),media=repo+'/public/media/mean-value-theorem-revised';
const run=async args=>{const p=spawn('ffmpeg',['-y','-v','error',...args],{stdio:'inherit'});if((await once(p,'exit'))[0])throw Error('ffmpeg failed')};
const encode=['-c:v','libx264','-threads','3','-preset','fast','-crf','18','-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart'];
const main=media+'/mean-value-theorem-revised-90s-v16.mp4',reel=media+'/instagram-30s-v16.mp4';
await run(['-i',out+'/opening-3s.mp4','-i',media+'/mean-value-theorem-revised-90s-v14.mp4','-i',out+'/return-1-5s.mp4','-filter_complex_threads','1','-filter_complex','[0:v]setpts=PTS-STARTPTS[a];[1:v]trim=start_frame=72:end_frame=2124,setpts=PTS-STARTPTS[b];[2:v]setpts=PTS-STARTPTS[c];[a][b][c]concat=n=3:v=1:a=0,format=yuv420p[v]','-map','[v]','-map','1:a:0','-c:a','copy',...encode,'-r','24','-frames:v','2160','-t','90',main]);
await run(['-i',out+'/reel-opening-2s.mp4','-i',media+'/instagram-30s-v15.mp4','-filter_complex_threads','1','-filter_complex','[0:v]setpts=PTS-STARTPTS[a];[1:v]trim=start_frame=60:end_frame=900,setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1:a=0,format=yuv420p[v]','-map','[v]','-map','1:a:0','-c:a','copy',...encode,'-r','30','-frames:v','900','-t','30',reel]);
await run(['-ss','0','-i',main,'-t','12','-c:v','libx264','-threads','3','-preset','fast','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-af','afade=t=in:st=0:d=0.04,afade=t=out:st=11.92:d=0.08','-movflags','+faststart',media+'/preview-classroom-12s-v16.mp4']);
for(const t of [0,1,2,3,89])await run(['-ss',String(t),'-i',main,'-frames:v','1','-q:v','2',media+'/frame-'+String(t).padStart(2,'0')+'-v16.jpg']);
for(const t of [1,19.5,28])await run(['-ss',String(t),'-i',reel,'-frames:v','1','-q:v','2',media+'/instagram-frame-'+String(t).replace('.','-')+'-v16.jpg']);
await run(['-ss','19.5','-i',reel,'-frames:v','1','-q:v','2',media+'/instagram-poster-v16.jpg']);
console.log('Restored original uncomposited conversation: 90s,30s and classroom preview');
