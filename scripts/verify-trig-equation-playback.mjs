import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH||'/tmp/trig-equation-browser-tools/node_modules/playwright/index.mjs');
const base=process.env.TRIG_EQUATION_BASE_URL||'https://hakunou22hr.github.io/-/',out='work/trig-equation-live-check',expected=JSON.parse(await readFile(new URL('../materials/trig-equation-unit-circle/verification/media.json',import.meta.url),'utf8'));
await mkdir(out,{recursive:true});
const browser=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'],...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
try{
 const p=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));const url=new URL('materials/trig-equation-unit-circle/?v=unit-circle-cinema-v1&check='+Date.now(),base).href;
 await p.goto(url,{waitUntil:'domcontentloaded',timeout:60000});await p.waitForFunction(()=>window.filmReady,null,{timeout:60000});await p.waitForFunction(()=>document.querySelector('#master').readyState>=1,null,{timeout:60000});const v=p.locator('#master');
 const videos=[];for(const duration of[90,30]){
  if(duration===30){await p.click('#movie-tab');await p.click('#short-film');await p.waitForFunction(()=>document.querySelector('#master').duration===30,null,{timeout:60000})}
  const info=await v.evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight,src:v.currentSrc}));assert.equal(info.duration,duration);assert.equal(info.width,duration===90?1920:1080);assert.equal(info.height,duration===90?1080:1920);
  await v.evaluate(v=>v.play());await p.waitForFunction(()=>document.querySelector('#master').currentTime>.3,null,{timeout:45000});await v.evaluate(v=>v.pause());
  if(duration===90)for(const t of[8,20,36,43,58,82]){await v.evaluate((v,t)=>new Promise(resolve=>{v.addEventListener('seeked',resolve,{once:true});v.currentTime=t}),t);await v.screenshot({path:`${out}/movie-${t}.png`})}
  const response=await p.request.get(info.src,{timeout:120000});assert(response.ok());info.sha256=createHash('sha256').update(await response.body()).digest('hex');assert.equal(info.sha256,expected.videos.find(v=>v.duration===duration).sha256);
  await v.evaluate(v=>new Promise(resolve=>{v.addEventListener('seeked',resolve,{once:true});v.currentTime=v.duration-.7}));await v.evaluate(v=>v.play());await p.waitForFunction(()=>!document.querySelector('#lab-panel').hidden,null,{timeout:45000});videos.push({...info,played:true,endedIntoInquiry:true});
 }
 await p.evaluate(()=>window.__setLab({angle:30,k:.5}));assert((await p.evaluate(()=>window.__lab)).match);await p.click('#unit-rad');assert.equal(await p.locator('#angle-value').getAttribute('data-tex'),'\\frac{\\pi}{6}');await p.click('#range-math1');await p.locator('[data-height="-1"]').click();assert.equal((await p.evaluate(()=>window.__lab)).allowed,0);assert((await p.textContent('#domain-note')).includes('負の高さ'));for(let i=0;i<3;i++)await p.click('#reveal');assert(!(await p.locator('#answer-coordinates').getAttribute('data-tex')).includes('(0,-1)'));assert(await p.locator('#math1-answer-note').isVisible());await p.click('#reset');assert(!await p.locator('#answer-panel').isVisible());
 await p.click('#movie-tab');const [download]=await Promise.all([p.waitForEvent('download',{timeout:120000}),p.click('#download-short')]);assert.equal(await download.failure(),null);const hash=createHash('sha256').update(await readFile(await download.path())).digest('hex');assert.equal(hash,expected.videos.find(v=>v.duration===30).sha256);
 await p.click('#live-film');await p.evaluate(()=>window.seekFilm(89.7));await p.click('#play');await p.waitForFunction(()=>!document.querySelector('#lab-panel').hidden,null,{timeout:25000});
 await p.goto(new URL('materials/trig-equation-unit-circle/verification/',base).href);await p.waitForFunction(()=>document.images.length>=8&&Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0),null,{timeout:45000});
 await p.goto(base);assert(await p.locator('a[href*="trig-equation-unit-circle"]').count());assert.deepEqual(errors,[]);await writeFile(`${out}/result.json`,JSON.stringify({result:'PASS',url,videos,download:{filename:download.suggestedFilename(),sha256:hash},math1NegativeHeightNoSolution:true,exactRadianDisplay:true,resetHidesAnswers:true,liveAnimationEndsIntoInquiry:true,gallery:true,library:true,errors},null,2));console.log('PASS published 90s/30s playback, movie-to-inquiry transition, math controls, verified download and library');
}finally{await browser.close()}
