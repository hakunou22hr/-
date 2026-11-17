import {chromium} from '/tmp/integral-browser-tools/node_modules/playwright/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.SQRT_BASE_URL||'https://hakunou22hr.github.io/-/';const url=new URL('materials/sqrt-riemann/',base).href;
const EDITIONS=[{seconds:90,id:'i3yUSK_x3zQ',aspect:16/9},{seconds:30,id:'fjvd68SIHnI',aspect:9/16}];
async function embedFrame(page,id){
 await page.waitForFunction(id=>[...document.querySelectorAll('iframe')].some(f=>f.src.includes('youtube.com/embed/'+id)),id,{timeout:90000});
 for(let n=0;n<60;n++){const f=page.frames().find(f=>f.url().includes('youtube.com/embed/'+id));if(f)return f;await page.waitForTimeout(500)}
 throw Error('YouTube embed frame not found: '+id);
}
const browser=await chromium.launch({args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 let ready=false;for(let attempt=0;attempt<8;attempt++){await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});if(await page.locator('#n').count()){ready=true;break}await page.waitForTimeout(3000)}if(!ready)throw Error('New lesson not available at Pages edge');
 await page.locator('#n').fill('200');await page.locator('#n').dispatchEvent('input');
 if(await page.locator('#approx').textContent()!=='0.669094')throw Error('Right-endpoint sum mismatch');
 await page.locator('#formulaToggle').uncheck();if(await page.locator('#formulas').isVisible())throw Error('Formula toggle');await page.locator('#formulaToggle').check();
 await page.locator('#view').click();await page.locator('#view').click();await page.locator('#reset').click();await page.locator('#play').click();await page.waitForTimeout(750);if(Number(await page.locator('#nv').textContent())<=4)throw Error('Autoplay');await page.locator('#play').click();
 await page.locator('[data-tab="movies"]').click();
 if(await page.locator('iframe.yt').count()!==2)throw Error('YouTube embeds missing');
 const videos=[];
 for(let i=0;i<2;i++){
  const ed=EDITIONS[i];
  await page.locator('iframe.yt').nth(i).scrollIntoViewIfNeeded();
  const frame=await embedFrame(page,ed.id);
  await frame.waitForFunction(()=>{const v=document.querySelector('video');return v&&v.readyState>=1&&v.duration>0},null,{timeout:90000});
  const info=await frame.evaluate(()=>{const v=document.querySelector('video');return{duration:v.duration,width:v.videoWidth,height:v.videoHeight}});
  if(Math.abs(info.duration-ed.seconds)>1.5||Math.abs(info.width/info.height-ed.aspect)>.05)throw Error(JSON.stringify(info));
  await frame.evaluate(()=>{const v=document.querySelector('video');v.muted=true;return v.play()});await frame.waitForFunction(()=>document.querySelector('video').currentTime>.6,null,{timeout:60000});
  await frame.evaluate(()=>new Promise(resolve=>{const v=document.querySelector('video');v.pause();v.addEventListener('seeked',resolve,{once:true});v.currentTime=v.duration-2;}));
  await frame.evaluate(()=>{const v=document.querySelector('video');v.playbackRate=2;return v.play()});await frame.waitForFunction(()=>document.querySelector('video').ended,null,{timeout:60000});
  const href=await page.locator('a.download').nth(i).evaluate(a=>a.href);if(href!=='https://youtu.be/'+ed.id)throw Error('YouTube link mismatch: '+href);
  const response=await page.request.get(href);if(!response.ok())throw Error('YouTube watch page '+response.status());
  videos.push({id:ed.id,...info,played:true,seeked:true,ended:true,linkStatus:response.status()});
 }
 await page.locator('[data-tab="lab"]').click();await page.setViewportSize({width:390,height:844});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow');
 await page.goto(base,{waitUntil:'domcontentloaded'});if(await page.locator('a[href*="sqrt-riemann"]').count()<1)throw Error('Library registration');
 if(errors.length)throw Error(errors.join('\n'));await mkdir('work/sqrt-riemann-check',{recursive:true});await writeFile('work/sqrt-riemann-check/playback.json',JSON.stringify({url,videos,interactive:true,mobileOverflow:false,libraryRegistered:true,errors},null,2));console.log(JSON.stringify(videos));
}finally{await browser.close()}
