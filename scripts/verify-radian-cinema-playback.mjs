import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH||'/tmp/radian-browser-tools/node_modules/playwright/index.mjs');
const base=process.env.RADIAN_BASE_URL||'https://hakunou22hr.github.io/-/',out='work/radian-playback-check';
const EDITIONS={90:'s2uI0gUvm0k',30:'d6PuyDM0YpU'};
await mkdir(out,{recursive:true});
async function embedFrame(page,id){
 await page.waitForFunction(id=>[...document.querySelectorAll('iframe')].some(f=>f.src.includes('youtube.com/embed/'+id)),id,{timeout:90000});
 for(let n=0;n<60;n++){const f=page.frames().find(f=>f.url().includes('youtube.com/embed/'+id));if(f)return f;await page.waitForTimeout(500)}
 throw Error('YouTube embed frame not found: '+id);
}
async function frameMeta(frame){
 await frame.waitForFunction(()=>{const v=document.querySelector('video');return v&&v.readyState>=1&&v.duration>0},null,{timeout:90000});
 return frame.evaluate(()=>{const v=document.querySelector('video');return{duration:v.duration,width:v.videoWidth,height:v.videoHeight}});
}
async function framePlay(frame){
 await frame.evaluate(()=>{const v=document.querySelector('video');v.muted=true;return v.play()});
 await frame.waitForFunction(()=>document.querySelector('video').currentTime>.5,null,{timeout:60000});
}
async function frameSeek(frame,t){
 await frame.evaluate(t=>new Promise((resolve,reject)=>{const v=document.querySelector('video');v.addEventListener('seeked',resolve,{once:true});v.addEventListener('error',reject,{once:true});v.currentTime=t}),t);
}
const browser=await chromium.launch({args:['--no-sandbox'],...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const url=new URL('materials/birth-of-radian/?v=cinema-half-count-v2&check='+Date.now(),base).href;
 let ready=false;for(let n=0;n<8;n++){await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});if(await page.locator('#restart').count()){ready=true;break}await page.waitForTimeout(3000)}assert(ready,'Published cinema edition missing');
 const videos=[];
 for(const seconds of [90,30]){
  const id=EDITIONS[seconds];
  if(seconds===30)await page.click('[data-edition="30"]');
  const frame=await embedFrame(page,id);
  const info=await frameMeta(frame);
  assert(Math.abs(info.duration-seconds)<1.5,`duration ${info.duration} != ${seconds}`);
  const expectedAspect=seconds===90?16/9:9/16;assert(Math.abs(info.width/info.height-expectedAspect)<.05,`aspect ${info.width}x${info.height}`);
  await framePlay(frame);
  await frame.evaluate(()=>document.querySelector('video').pause());
  if(seconds===90)for(const t of [6,20,42,44,48.6,51,55,62,82]){await frameSeek(frame,t);await page.locator('#video-frame iframe').screenshot({path:`${out}/90-${t}.png`})}
  await frameSeek(frame,info.duration-2);await frame.evaluate(()=>{const v=document.querySelector('video');v.playbackRate=2;return v.play()});await frame.waitForFunction(()=>document.querySelector('video').ended,null,{timeout:60000});
  videos.push({id,...info,played:true,seeked:true,ended:true});
 }
 assert.equal(await page.locator('#download').getAttribute('href'),'https://youtu.be/d6PuyDM0YpU');
 assert.equal(await page.locator('#download90').getAttribute('href'),'https://youtu.be/s2uI0gUvm0k');
 for(const link of ['https://youtu.be/d6PuyDM0YpU','https://youtu.be/s2uI0gUvm0k']){const response=await page.request.get(link,{timeout:60000});assert(response.ok(),link+' '+response.status())}
 const frame90=await embedFrame(page,EDITIONS[90]);
 await page.click('[data-time="72"]');await frame90.waitForFunction(()=>document.querySelector('video').currentTime>=71.5,null,{timeout:60000});
 await page.click('#restart');await frame90.waitForFunction(()=>document.querySelector('video').currentTime<3,null,{timeout:60000});await frame90.evaluate(()=>document.querySelector('video').pause());
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:`${out}/mobile.png`,fullPage:true});
 await page.goto(base,{waitUntil:'domcontentloaded'});assert((await page.locator('a[href*="birth-of-radian"]').first().getAttribute('href')).includes('v=cinema-half-count-v2'));assert.deepEqual(errors,[]);
 await writeFile(`${out}/result.json`,JSON.stringify({result:'PASS',url,videos,youtubeLinks:true,restart:true,chapters:true,mobileWidth:390,errors},null,2));console.log('PASS: published 90s and 30s YouTube cinema, scene seeks, playback to end, YouTube links, restart, mobile and library link');
}finally{await browser.close()}
