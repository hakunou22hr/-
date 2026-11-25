import {chromium} from '/tmp/integral-browser-tools/node_modules/playwright/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.SQRT_BASE_URL||'https://hakunou22hr.github.io/-/';const url=new URL('materials/sqrt-riemann/',base).href;
const EDITIONS=[{seconds:90,id:'i3yUSK_x3zQ',aspect:16/9},{seconds:30,id:'fjvd68SIHnI',aspect:9/16}];
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
  // LIGHT CHECK (draft): do not drive the <video> inside the cross-origin
  // YouTube embed; in the CI browser the embed's video never becomes ready.
  // Verify the embed itself (correct video ID in src) and the watch link.
  const src=await page.locator('iframe.yt').nth(i).evaluate(f=>f.src);
  if(!src.includes('youtube.com/embed/'+ed.id))throw Error('Embed src mismatch: '+src);
  const href=await page.locator('a.download').nth(i).evaluate(a=>a.href);if(href!=='https://youtu.be/'+ed.id)throw Error('YouTube link mismatch: '+href);
  videos.push({id:ed.id,embedVerified:true});
 }
 await page.locator('[data-tab="lab"]').click();await page.setViewportSize({width:390,height:844});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow');
 await page.goto(base,{waitUntil:'domcontentloaded'});if(await page.locator('a[href*="sqrt-riemann"]').count()<1)throw Error('Library registration');
 if(errors.length)throw Error(errors.join('\n'));await mkdir('work/sqrt-riemann-check',{recursive:true});await writeFile('work/sqrt-riemann-check/playback.json',JSON.stringify({url,videos,interactive:true,mobileOverflow:false,libraryRegistered:true,errors},null,2));console.log(JSON.stringify(videos));
}finally{await browser.close()}
