import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';import fs from 'node:fs';import {once} from 'node:events';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto((process.env.BIRTH_E_URL||'http://127.0.0.1:5173/materials/birth-of-e/')+'?render');await page.waitForFunction(()=>window.__birthReady);await page.waitForTimeout(1200);
const cdp=await page.context().newCDPSession(page);
const encoder=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate','30','-vcodec','mjpeg','-i','pipe:0','-i','public/media/birth-of-e-narration.m4a','-map','0:v','-map','1:a','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-t','90','-movflags','+faststart','public/media/birth-of-e-90s.mp4']);
process.on('SIGINT',async()=>{encoder.kill();await browser.close();process.exit(130)});
encoder.stderr.on('data',d=>process.stderr.write(d));encoder.stdin.on('error',e=>console.error(e));
for(let f=0;f<2700;f++){
 await page.evaluate(time=>window.__renderAt(time),f/30);
 const {data}=await cdp.send('Page.captureScreenshot',{format:'jpeg',quality:92,fromSurface:true,captureBeyondViewport:false});const buffer=Buffer.from(data,'base64');
 if(!encoder.stdin.write(buffer))await once(encoder.stdin,'drain');
 
 if(f%30===0)console.log(JSON.stringify({frame:f,total:2700,errors}));
}
encoder.stdin.end();const [code]=await once(encoder,'close');await browser.close();if(code!==0||errors.length)throw new Error(JSON.stringify({code,errors}));console.log('RENDER COMPLETE');
