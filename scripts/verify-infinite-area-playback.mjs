import {chromium} from '/tmp/integral-browser-tools/node_modules/playwright/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.INFINITE_AREA_BASE_URL||'https://hakunou22hr.github.io/-/';
const browser=await chromium.launch({args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(new URL('materials/infinite-area-cinema/',base).href,{waitUntil:'domcontentloaded'});
 if(!await page.getByText('FULL SKY STORM EDITION 08 / SHORT FILM',{exact:true}).count())throw Error('Old lesson edition');
 // 30-second landscape edition on YouTube (Cujt620N7U0)
 // LIGHT CHECK (draft): verify the embed iframe itself, not the <video> inside it.
 {const srcs=await page.evaluate(()=>[...document.querySelectorAll('iframe')].map(f=>f.src));if(!srcs.some(x=>x.includes('youtube.com/embed/Cujt620N7U0')))throw Error('Short-edition embed missing');}
 const stage=page.locator('#effects-stage');await stage.scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>document.querySelector('#effects-stage').dataset.ready==='true');
 for(const type of ['gather','vortex','wave']){const before=Number(await stage.getAttribute('data-events'));await page.locator(`[data-effect="${type}"]`).click();if(Number(await stage.getAttribute('data-events'))!==before+1||await stage.getAttribute('data-last-effect')!==type)throw Error('Effect does not respond: '+type)}
 await stage.click({position:{x:150,y:150}});if(Number(await stage.getAttribute('data-events'))!==4)throw Error('Pointer trigger');
 await page.locator('#effect-n').evaluate(el=>{el.value='3';el.dispatchEvent(new Event('input',{bubbles:true}))});if(await page.locator('#effect-n-value').textContent()!=='32')throw Error('Partition interaction');
 await page.locator('#effects-reset').click();if(await stage.getAttribute('data-events')!=='0')throw Error('Reset');
 // YouTube watch links replaced the MP4 downloads
 for(const link of ['https://youtu.be/Cujt620N7U0','https://youtu.be/BzqQlLFjfJM','https://youtu.be/WIAd2gtvPCs']){
  if(await page.locator(`a[href="${link}"]`).count()<1)throw Error('YouTube link missing: '+link);
 }
 const thunderResponse=await page.request.get(new URL('../../media/infinite-area/thunder-preview.wav',page.url()).href);if(!thunderResponse.ok()||(await thunderResponse.body()).subarray(0,4).toString()!=='RIFF')throw Error('Preview thunder missing');
 const manifestResponse=await page.request.get(new URL('../../media/infinite-area/media-manifest.json',page.url()).href);
 const manifest=await manifestResponse.json();if(manifest.edition!=='infinite-area-cinema-v8')throw Error('Old video manifest');
 // Vertical reels edition on YouTube (BzqQlLFjfJM)
 {const srcs=await page.evaluate(()=>[...document.querySelectorAll('iframe')].map(f=>f.src));if(!srcs.some(x=>x.includes('youtube.com/embed/BzqQlLFjfJM')))throw Error('Reels embed missing');}
 await page.setViewportSize({width:390,height:844});
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow');
 await page.goto(base,{waitUntil:'domcontentloaded'});
 if(await page.locator('a[href*="infinite-area-cinema"]').count()<1)throw Error('Library card missing');
 if(errors.length)throw Error(errors.join('\n'));
 await mkdir('work/infinite-area-check',{recursive:true});
 await writeFile('work/infinite-area-check/playback.json',JSON.stringify({base,edition:manifest.edition,youtubeLinksVerified:true,interactiveEffects:true,embedsVerified:true,mobileOverflow:false,libraryRegistered:true,errors},null,2));
 console.log('Infinite-area YouTube playback, links and library card verified');
}finally{await browser.close()}
