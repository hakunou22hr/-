import {chromium} from '/tmp/integral-browser-tools/node_modules/playwright/index.mjs';
import {writeFile,mkdir} from 'node:fs/promises';
const url='https://hakunou22hr.github.io/-/materials/integral-differentiation-cinema-90s/?v=playback1';
const browser=await chromium.launch({args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1365,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 // A new Pages deployment may take a moment to reach the edge serving this runner.
 let ready=false;
 for(let i=0;i<12;i++){
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  ready=await page.locator('video source').getAttribute('src').then(s=>s?.includes('90s-web-v1.mp4'));
  if(ready)break;await page.waitForTimeout(3000);await page.reload({waitUntil:'domcontentloaded'});
 }
 if(!ready)throw Error('New page did not reach Pages edge');
 await page.locator('#play').click();await page.waitForFunction(()=>document.querySelector('video').currentTime>.5,null,{timeout:45000});
 const video=page.locator('video');
 const src=await video.evaluate(v=>v.currentSrc);if(new URL(src).origin!==new URL(url).origin)throw Error('Player still uses cross-origin delivery');
 const range=await page.request.get(src,{headers:{Range:'bytes=0-1023'}});if(range.status()!==206)throw Error('Byte range not supported: '+range.status());
 await video.evaluate(v=>new Promise(resolve=>{v.pause();v.addEventListener('seeked',resolve,{once:true});v.currentTime=24;}));
 await page.locator('#play').click();await page.waitForFunction(()=>document.querySelector('video').currentTime>=29,null,{timeout:30000});
 await page.locator('#play').click();if(!await video.evaluate(v=>v.paused))throw Error('Pause button failed');
 await video.evaluate(v=>{v.currentTime=0;v.playbackRate=4;});await page.locator('#play').click();
 await page.waitForFunction(()=>document.querySelector('video').ended,null,{timeout:90000});
 const info=await video.evaluate(v=>({duration:v.duration,time:v.currentTime,ended:v.ended,width:v.videoWidth,height:v.videoHeight,error:v.error?.message||null,audioBytes:v.webkitAudioDecodedByteCount,frames:v.getVideoPlaybackQuality().totalVideoFrames,source:v.currentSrc}));
 if(Math.abs(info.duration-90)>.02||!info.ended||info.error||!info.audioBytes)throw Error(JSON.stringify(info));
 await page.locator('#play').click();await page.waitForFunction(()=>document.querySelector('video').currentTime>.5&&document.querySelector('video').currentTime<10,null,{timeout:15000});await video.evaluate(v=>v.pause());
 await page.setViewportSize({width:390,height:844});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow||errors.length)throw Error(JSON.stringify({overflow,errors}));
 await mkdir('work/playback-check',{recursive:true});await writeFile('work/playback-check/live-site.json',JSON.stringify({url,rangeStatus:range.status(),passed26SecondsAtNormalSpeed:true,fullPlayback:info,replay:true,mobileOverflow:overflow,errors},null,2));console.log(JSON.stringify(info));
}finally{await browser.close();}
