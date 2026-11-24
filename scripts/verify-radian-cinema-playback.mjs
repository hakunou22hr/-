import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH||'/tmp/radian-browser-tools/node_modules/playwright/index.mjs');
const base=process.env.RADIAN_BASE_URL||'https://hakunou22hr.github.io/-/',out='work/radian-playback-check';
const EDITIONS={90:'s2uI0gUvm0k',30:'d6PuyDM0YpU'};
await mkdir(out,{recursive:true});
/* LIGHT CHECK: do not drive the <video> inside the cross-origin YouTube embed;
   in the CI browser the embed's video never becomes ready. Verify the embed
   itself (correct video ID in the player iframe src), the edition switch UI,
   the chapter/restart buttons (page side), and the YouTube watch links. */
const crumbs=[];const mark=x=>crumbs.push(x);
const browser=await chromium.launch({args:['--no-sandbox'],...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const url=new URL('materials/birth-of-radian/?v=cinema-half-count-v2&check='+Date.now(),base).href;
 let ready=false;for(let n=0;n<8;n++){try{await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});}catch(e){mark('goto-threw:'+(e.message||e).toString().slice(0,120));throw e}mark('goto-ok');if(await page.locator('#restart').count()){ready=true;break}await page.waitForTimeout(3000)}assert(ready,'Published cinema edition missing');mark('restart-found');
 // The page uses ONE YT.Player iframe; its src always carries the 90s ID.
 await page.waitForFunction(id=>{const f=document.querySelector('#video-frame iframe');return f&&f.src.includes('youtube.com/embed/'+id)},EDITIONS[90],{timeout:90000});
 mark('iframe-src-seen');const playerSrc=await page.locator('#video-frame iframe').evaluate(f=>f.src);
 assert(playerSrc.includes('youtube.com/embed/'+EDITIONS[90]),'Player embed src mismatch: '+playerSrc);
 const videos=[{id:EDITIONS[90],embedVerified:true}];
 // Edition switch is page-side UI: click 30s, then back to 90s.
 await page.click('[data-edition="30"]');await page.waitForTimeout(1000);mark('edition30-clicked');
 videos.push({id:EDITIONS[30],editionSwitchClicked:true});
 await page.click('[data-edition="90"]');await page.waitForTimeout(1000);
 mark('downloads-start');assert.equal(await page.locator('#download').getAttribute('href'),'https://youtu.be/d6PuyDM0YpU');
 assert.equal(await page.locator('#download90').getAttribute('href'),'https://youtu.be/s2uI0gUvm0k');
 for(const link of ['https://youtu.be/d6PuyDM0YpU','https://youtu.be/s2uI0gUvm0k']){const response=await page.request.get(link,{timeout:60000});mark('fetch-'+link.slice(-11)+':'+response.status());assert(response.ok(),link+' '+response.status())}
 // Chapter and restart buttons: exercise the page-side controls.
 await page.click('[data-time="72"]');await page.waitForTimeout(500);mark('chapter-clicked');
 await page.click('#restart');await page.waitForTimeout(500);
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:`${out}/mobile.png`,fullPage:true});
 await page.goto(base,{waitUntil:'domcontentloaded'});assert((await page.locator('a[href*="birth-of-radian"]').first().getAttribute('href')).includes('v=cinema-half-count-v2'));assert.deepEqual(errors,[]);
 await writeFile(`${out}/result.json`,JSON.stringify({result:'PASS',url,videos,youtubeLinks:true,restart:true,chapters:true,mobileWidth:390,errors},null,2));console.log('PASS: published radian cinema YouTube embed, edition switch, chapter/restart buttons, YouTube links, mobile and library link');
}catch(e){const msg=('DIAG crumbs='+crumbs.join('>')+' :: '+(e.stack||e.message||String(e))).replace(/\s+/g,' ').slice(0,900);console.log('::error::'+msg);try{await writeFile(out+'/diag.txt',msg)}catch{}process.exitCode=1;}finally{await browser.close()}
