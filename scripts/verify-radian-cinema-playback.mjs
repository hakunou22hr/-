import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH||'/tmp/radian-browser-tools/node_modules/playwright/index.mjs');
const base=process.env.RADIAN_BASE_URL||'https://hakunou22hr.github.io/-/',out='work/radian-playback-check';
const expected=JSON.parse(await readFile(new URL('../materials/birth-of-radian/verification/cinema/media.json',import.meta.url),'utf8'));
await mkdir(out,{recursive:true});
const browser=await chromium.launch({args:['--no-sandbox'],...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const url=new URL('materials/birth-of-radian/?v=cinema-half-count-v2&check='+Date.now(),base).href;
 let ready=false;for(let n=0;n<8;n++){await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});if(await page.locator('#restart').count()){ready=true;break}await page.waitForTimeout(3000)}assert(ready,'Published cinema edition missing');
 const videos=[];
 for(const seconds of [90,30]){
  if(seconds===30)await page.click('[data-edition="30"]');
  await page.waitForFunction(s=>{const v=document.querySelector('#player');return v.readyState>=1&&v.duration===s},seconds,{timeout:60000});
  const info=await page.locator('#player').evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight,src:v.currentSrc}));
  assert.equal(info.width,seconds===90?1920:1080);assert.equal(info.height,seconds===90?1080:1920);assert(info.src.includes(`birth-of-radian-cinema-${seconds}s.mp4`));
  await page.locator('#player').evaluate(v=>v.play());await page.waitForFunction(()=>document.querySelector('#player').currentTime>.5,null,{timeout:45000});await page.locator('#player').evaluate(v=>v.pause());
  if(seconds===90)for(const t of [6,20,42,44,48.6,51,55,62,82]){await page.locator('#player').evaluate((v,t)=>new Promise((resolve,reject)=>{v.addEventListener('seeked',resolve,{once:true});v.addEventListener('error',reject,{once:true});v.currentTime=t}),t);await page.locator('#player').screenshot({path:`${out}/90-${t}.png`})}
  await page.locator('#player').evaluate(v=>new Promise(resolve=>{v.addEventListener('seeked',resolve,{once:true});v.currentTime=v.duration-2}));await page.locator('#player').evaluate(v=>{v.playbackRate=2;return v.play()});await page.waitForFunction(()=>document.querySelector('#player').ended,null,{timeout:45000});
  if(seconds===90){const response=await page.request.get(info.src,{timeout:120000});assert(response.ok());info.sha256=createHash('sha256').update(await response.body()).digest('hex');assert.equal(info.sha256,expected.videos.find(v=>v.duration===90).sha256)}
  videos.push({...info,played:true,seeked:true,ended:true});
 }
 const [download]=await Promise.all([page.waitForEvent('download',{timeout:120000}),page.click('#download')]);const path=await download.path();assert.equal(await download.failure(),null);const sha256=createHash('sha256').update(await readFile(path)).digest('hex');assert.equal(sha256,expected.videos.find(v=>v.duration===30).sha256);
 await page.click('[data-time="72"]');await page.waitForFunction(()=>document.querySelector('#player').duration===90&&document.querySelector('#player').currentTime>=72);
 await page.click('#restart');await page.waitForFunction(()=>document.querySelector('#player').currentTime<3);await page.locator('#player').evaluate(v=>v.pause());
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:`${out}/mobile.png`,fullPage:true});
 await page.goto(base,{waitUntil:'domcontentloaded'});assert((await page.locator('a[href*="birth-of-radian"]').first().getAttribute('href')).includes('v=cinema-half-count-v2'));assert.deepEqual(errors,[]);
 await writeFile(`${out}/result.json`,JSON.stringify({result:'PASS',url,videos,download:{filename:download.suggestedFilename(),sha256},restart:true,chapters:true,mobileWidth:390,errors},null,2));console.log('PASS: published 90s and 30s cinema, scene seeks, playback to end, verified download, restart, mobile and library link');
}finally{await browser.close()}
