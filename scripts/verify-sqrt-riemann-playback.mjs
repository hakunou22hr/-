import {chromium} from '/tmp/integral-browser-tools/node_modules/playwright/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.SQRT_BASE_URL||'https://hakunou22hr.github.io/-/';const url=new URL('materials/sqrt-riemann/',base).href;
const browser=await chromium.launch({args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 let ready=false;for(let attempt=0;attempt<8;attempt++){await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});if(await page.locator('#n').count()){ready=true;break}await page.waitForTimeout(3000)}if(!ready)throw Error('New lesson not available at Pages edge');
 await page.locator('#n').fill('200');await page.locator('#n').dispatchEvent('input');
 if(await page.locator('#approx').textContent()!=='0.669094')throw Error('Right-endpoint sum mismatch');
 await page.locator('#formulaToggle').uncheck();if(await page.locator('#formulas').isVisible())throw Error('Formula toggle');await page.locator('#formulaToggle').check();
 await page.locator('#view').click();await page.locator('#view').click();await page.locator('#reset').click();await page.locator('#play').click();await page.waitForTimeout(750);if(Number(await page.locator('#nv').textContent())<=4)throw Error('Autoplay');await page.locator('#play').click();
 await page.locator('[data-tab="movies"]').click();const videos=[];
 for(let i=0;i<2;i++){
  const video=page.locator('video').nth(i);await video.evaluate(v=>v.load());await video.evaluate(v=>new Promise((resolve,reject)=>{if(v.readyState>=1)return resolve();v.addEventListener('loadedmetadata',resolve,{once:true});v.addEventListener('error',()=>reject(Error(v.error?.message)),{once:true})}));
  const info=await video.evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight,src:v.currentSrc}));
  const expected=i?[30,1080,1920]:[90,1920,1080];if(Math.abs(info.duration-expected[0])>.05||info.width!==expected[1]||info.height!==expected[2])throw Error(JSON.stringify(info));
  await video.evaluate(v=>v.play());await page.waitForFunction(i=>document.querySelectorAll('video')[i].currentTime>.6,i,{timeout:45000});
  await video.evaluate(v=>new Promise(resolve=>{v.pause();v.addEventListener('seeked',resolve,{once:true});v.currentTime=v.duration-2;}));
  await video.evaluate(v=>{v.playbackRate=2;return v.play()});await page.waitForFunction(i=>document.querySelectorAll('video')[i].ended,i,{timeout:30000});
  const href=await page.locator('a.download').nth(i).evaluate(a=>a.href);if(!new URL(href).pathname.startsWith(new URL(base).pathname))throw Error('Download escapes deployment base: '+href);
  const response=await page.request.get(href,{headers:{Range:'bytes=0-1023'}});if(response.status()!==206&&response.status()!==200)throw Error('Download '+response.status());
  videos.push({...info,played:true,seeked:true,ended:true,downloadStatus:response.status()});
 }
 await page.locator('[data-tab="lab"]').click();await page.setViewportSize({width:390,height:844});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow');
 await page.goto(base,{waitUntil:'domcontentloaded'});if(await page.locator('a[href*="sqrt-riemann"]').count()<1)throw Error('Library registration');
 if(errors.length)throw Error(errors.join('\n'));await mkdir('work/sqrt-riemann-check',{recursive:true});await writeFile('work/sqrt-riemann-check/playback.json',JSON.stringify({url,videos,interactive:true,mobileOverflow:false,libraryRegistered:true,errors},null,2));console.log(JSON.stringify(videos));
}finally{await browser.close()}
