import {mkdir,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const portrait=process.env.CINEMA_EDITION==='instagram',duration=portrait?30:90,width=portrait?1080:1920,height=portrait?1920:1080;
const startFrame=Number(process.env.CINEMA_START_FRAME||0);
const frames=Number(process.env.CINEMA_RENDER_FRAMES||duration*30),output=resolve(process.env.CINEMA_OUTPUT||`work/integral-${portrait?'instagram':'lesson'}`),name=`integral-differentiation-cinema-${portrait?'instagram-30s':'90s'}.mp4`;
await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
let encoder;try{
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1}),cdp=await page.context().newCDPSession(page),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url=new URL(process.env.CINEMA_URL||'http://127.0.0.1:4175/');url.searchParams.set('edition',portrait?'instagram':'lesson');url.searchParams.set('render','1');
 await page.goto(url.href,{waitUntil:'networkidle'});await page.waitForFunction(()=>Boolean(window.cinemaRender));await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>window.cinemaBackgroundReady);if(!await page.evaluate(()=>window.mathematicalSpaceRendered))throw new Error('Missing reference-image background');
 const wav=await page.evaluate(()=>window.cinemaRender.audio());await writeFile(resolve(output,'soundtrack.wav'),Buffer.from(wav,'base64'));
 const videoPath=resolve(output,name);encoder=spawn('ffmpeg',['-hide_banner','-loglevel','warning','-y','-f','image2pipe','-vcodec','mjpeg','-framerate','30','-i','pipe:0','-i',resolve(output,'soundtrack.wav'),'-map','0:v:0','-map','1:a:0','-vf','scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-profile:v','high','-level:v','4.1','-threads','3','-c:a','aac','-b:a','192k','-ar','48000','-t',String(frames/30),'-movflags','+faststart',videoPath],{stdio:['pipe','ignore','pipe']});let log='';encoder.stderr.on('data',b=>log=(log+b).slice(-4000));const done=once(encoder,'close'),started=Date.now(),samples=new Set(portrait?[0,90,210,300,420,570,650,710,780,870]:[0,240,600,900,1140,1380,1530,1830,2130,2250,2430,2640]);
 for(let index=0;index<frames;index++){
  const f=startFrame+index;
  await page.evaluate(t=>window.cinemaRender.frame(t),f/30);
  const layout=await page.evaluate(()=>{
   const portrait=window.cinemaRender.portrait, safe=portrait?{left:innerWidth*.06,right:innerWidth*.82,top:innerHeight*.14,bottom:innerHeight*.75}:{left:innerWidth*.05,right:innerWidth*.95,top:innerHeight*.05,bottom:innerHeight*.95};
   const visible=e=>{for(let p=e;p;p=p.parentElement){const s=getComputedStyle(p);if(s.display==='none'||Number(s.opacity)<.05)return false;}return true;};
   const text=[...document.querySelectorAll('#chapter,#heading,#equations .katex-html > .base,#caption,#condition,#graph-label')].filter(visible).map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent,left:r.left,right:r.right,top:r.top,bottom:r.bottom};});
   const outside=text.filter(r=>r.left<safe.left-2||r.right>safe.right+2||r.top<safe.top-2||r.bottom>safe.bottom+2);
   const intersect=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
   const gr=document.getElementById('graph-box').getBoundingClientRect();const overlap=text.filter(r=>r.text!==document.getElementById('graph-label').textContent&&intersect(r,gr));
   const caption=document.getElementById('caption').getBoundingClientRect(),formulas=text.filter(r=>!['chapter','heading','caption','condition','graph-label'].some(id=>document.getElementById(id).textContent===r.text));
   return {scene:document.getElementById('cinema').dataset.scene,outside,overlap,captionOverlap:formulas.filter(r=>intersect(r,caption))};
  });
  if(layout.outside.length||layout.overlap.length||layout.captionOverlap.length){await page.screenshot({path:resolve(output,'layout-error.png')});throw new Error(`Layout frame ${f}: ${JSON.stringify(layout)}`);}
  const shot=await cdp.send('Page.captureScreenshot',{format:'jpeg',quality:95,fromSurface:true,captureBeyondViewport:false}),jpeg=Buffer.from(shot.data,'base64');if(samples.has(f)||index===0||index===frames-1)await writeFile(resolve(output,`sample-${String(f).padStart(4,'0')}.jpg`),jpeg);
  if(!encoder.stdin.write(jpeg))await once(encoder.stdin,'drain');if(f%90===0)console.log(`Frame ${f}/${frames}, elapsed ${((Date.now()-started)/1000).toFixed(1)}s`);if(errors.length)throw new Error(errors.join('\n'));
 }
 encoder.stdin.end();const [code]=await done;if(code!==0)throw new Error(log);
 const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-count_frames','-show_streams','-show_format','-of','json',videoPath],{encoding:'utf8'})),v=probe.streams.find(s=>s.codec_type==='video'),a=probe.streams.find(s=>s.codec_type==='audio');
 if(v.width!==width||v.height!==height||v.avg_frame_rate!=='30/1'||Number(v.nb_read_frames)!==frames||v.codec_name!=='h264'||v.pix_fmt!=='yuv420p'||a?.codec_name!=='aac'||Math.abs(Number(probe.format.duration)-frames/30)>.05)throw new Error('Invalid MP4 output');
 execFileSync('ffmpeg',['-v','error','-i',videoPath,'-f','null','-']);await writeFile(resolve(output,'ffprobe.json'),JSON.stringify(probe,null,2));await writeFile(resolve(output,'layout-validation.json'),JSON.stringify({checkedFrames:frames,passed:true,portrait,safeArea:portrait?'x6–82%, y14–75%':'x5–95%, y5–95%'},null,2));console.log(`Verified ${videoPath}`);
}finally{if(encoder&&encoder.exitCode===null)encoder.kill();await browser.close();}
