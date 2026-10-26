import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {resolve} from 'node:path';
import {stateAt} from '../timeline.js';
import {drawWorld,createFormulaTargets} from '../world.js';
const require=createRequire(import.meta.url),{createCanvas,GlobalFonts}=require('@napi-rs/canvas');
GlobalFonts.registerFromPath('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf','DejaVu Sans');
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','Noto Sans CJK JP');
const portrait=process.argv.includes('--portrait'),W=portrait?1080:1920,H=portrait?1920:1080,duration=portrait?30:120,fps=30;
const output=resolve(process.env.RIEMANN_OUTPUT||'work/riemann'),samples=process.argv.includes('--samples');await mkdir(output,{recursive:true});
const clipStart=Number(process.env.RIEMANN_START||0),clipDuration=Number(process.env.RIEMANN_DURATION||duration),name=process.env.RIEMANN_NAME||`riemann-integral-${portrait?'30s-instagram':'120s-pc'}`,canvas=createCanvas(W,H),ctx=canvas.getContext('2d');
const formulaTargets=createFormulaTargets(createCanvas,W,H,portrait);
const times=process.env.RIEMANN_SAMPLE_TIMES?JSON.parse(process.env.RIEMANN_SAMPLE_TIMES):portrait?[0,2,3.9,4,8,11.9,12,16,19.9,20,23,25.9,26,28,29.9]:[0,7.5,14.9,15,23.5,31.9,32,41,49.9,50,53.2,56.4,59.5,62.7,65.8,69,71.9,72,80.5,88.9,89,94,99,104.9,105,108.5,111,114,119.9];
if(samples){for(const t of times){drawWorld(ctx,W,H,stateAt(t,portrait),{formulaTargets});await writeFile(resolve(output,`${name}-${t.toFixed(1)}.jpg`),canvas.toBuffer('image/jpeg',85))}console.log('Sample frames saved');process.exit(0)}
const ffmpeg=spawn('ffmpeg',['-hide_banner','-loglevel','warning','-y','-f','rawvideo','-pixel_format','rgba','-video_size',`${W}x${H}`,'-framerate',String(fps),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','21','-maxrate','6M','-bufsize','12M','-pix_fmt','yuv420p','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-threads','4','-movflags','+faststart',resolve(output,`${name}.mp4`)],{stdio:['pipe','ignore','pipe']});
let err='';ffmpeg.stderr.on('data',b=>err=(err+b).slice(-6000));const done=once(ffmpeg,'close'),start=Date.now();
for(let frame=0;frame<clipDuration*fps;frame++){drawWorld(ctx,W,H,stateAt(clipStart+frame/fps,portrait),{formulaTargets});const bytes=canvas.data();if(!ffmpeg.stdin.write(bytes))await once(ffmpeg.stdin,'drain');if(frame%300===0)console.log(`${name}: ${frame}/${clipDuration*fps}; ${((Date.now()-start)/1000).toFixed(1)}s`)}ffmpeg.stdin.end();const [code]=await done;if(code)throw Error(err);console.log(`DONE ${name}; ${((Date.now()-start)/1000).toFixed(1)}s`);
