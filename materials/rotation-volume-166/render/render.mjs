// Usage: PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node render/render.mjs
// First run the library with npm run dev -- --host 127.0.0.1 --port 8770.
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {once} from 'node:events';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const output=process.env.OUTPUT||'public/media/rotation-volume-166/rotation-volume-166-90s.mp4';
await mkdir(output.slice(0,output.lastIndexOf('/')),{recursive:true});
const fps=24,duration=Number(process.env.DURATION||90),frames=Math.round(duration*fps);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const encoder=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-vcodec','mjpeg','-r',String(fps),'-i','pipe:0','-vf','scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',output],{stdio:['pipe','inherit','inherit']});
const exited=once(encoder,'exit');
try{const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto((process.env.APP_URL||'http://127.0.0.1:8770/materials/rotation-volume-166/')+'?render=1');await page.waitForFunction(()=>window.rotation166?.getState().ready);await page.evaluate(()=>document.fonts.ready);
for(let f=0;f<frames;f++){const t=f/fps;await page.evaluate(t=>window.rotation166.setTime(t),t);await page.waitForFunction(t=>Math.abs(window.rotation166.getState().time-t)<1e-8,t);const jpg=await page.screenshot({type:'jpeg',quality:93});if(!encoder.stdin.write(jpg))await once(encoder.stdin,'drain');if(f%120===0)console.log(`render ${f}/${frames} (${t}s)`)}
if(errors.length)throw Error(errors.join('\n'));encoder.stdin.end();const [code]=await exited;if(code!==0)throw Error('ffmpeg failed '+code);console.log('DONE '+output);
}finally{encoder.stdin.destroy();await browser.close()}
