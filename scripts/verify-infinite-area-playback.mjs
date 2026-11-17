import {chromium} from '/tmp/integral-browser-tools/node_modules/playwright/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.INFINITE_AREA_BASE_URL||'https://hakunou22hr.github.io/-/';
async function embedFrame(page,id){
 await page.waitForFunction(id=>[...document.querySelectorAll('iframe')].some(f=>f.src.includes('youtube.com/embed/'+id)),id,{timeout:90000});
 for(let n=0;n<60;n++){const f=page.frames().find(f=>f.url().includes('youtube.com/embed/'+id));if(f)return f;await page.waitForTimeout(500)}
 throw Error('YouTube embed frame not found: '+id);
}
async function frameMeta(frame){
 await frame.waitForFunction(()=>{const v=document.querySelector('video');return v&&v.readyState>=1&&v.duration>0},null,{timeout:90000});
 return frame.evaluate(()=>{const v=document.querySelector('video');return{duration:v.duration,width:v.videoWidth,height:v.videoHeight}});
}
const browser=await chromium.launch({args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(new URL('materials/infinite-area-cinema/',base).href,{waitUntil:'domcontentloaded'});
 if(!await page.getByText('FULL SKY STORM EDITION 08 / SHORT FILM',{exact:true}).count())throw Error('Old lesson edition');
 // 30-second landscape edition on YouTube (Cujt620N7U0)
 const shortFrame=await embedFrame(page,'Cujt620N7U0');
 const metadata=await frameMeta(shortFrame);
 if(Math.abs(metadata.duration-30)>1.5||Math.abs(metadata.width/metadata.height-16/9)>.05)throw Error(JSON.stringify(metadata));
 await shortFrame.evaluate(()=>{const v=document.querySelector('video');v.muted=true;return v.play()});
 await shortFrame.waitForFunction(()=>document.querySelector('video').currentTime>.5,null,{timeout:60000});
 await shortFrame.evaluate(()=>new Promise(resolve=>{const v=document.querySelector('video');v.pause();v.addEventListener('seeked',resolve,{once:true});v.currentTime=28}));
 await shortFrame.evaluate(()=>{const v=document.querySelector('video');v.playbackRate=2;return v.play()});
 await shortFrame.waitForFunction(()=>document.querySelector('video').ended,null,{timeout:60000});
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
 const watchResponse=await page.request.get('https://youtu.be/Cujt620N7U0');if(!watchResponse.ok())throw Error('YouTube watch page unavailable');
 const thunderResponse=await page.request.get(new URL('../../media/infinite-area/thunder-preview.wav',page.url()).href);if(!thunderResponse.ok()||(await thunderResponse.body()).subarray(0,4).toString()!=='RIFF')throw Error('Preview thunder missing');
 const manifestResponse=await page.request.get(new URL('../../media/infinite-area/media-manifest.json',page.url()).href);
 const manifest=await manifestResponse.json();if(manifest.edition!=='infinite-area-cinema-v8')throw Error('Old video manifest');
 // Vertical reels edition on YouTube (BzqQlLFjfJM)
 const reelsFrame=await embedFrame(page,'BzqQlLFjfJM');
 const reelsMetadata=await frameMeta(reelsFrame);
 if(Math.abs(reelsMetadata.width/reelsMetadata.height-9/16)>.05||Math.abs(reelsMetadata.duration-30)>1.5)throw Error('Invalid reels metadata '+JSON.stringify(reelsMetadata));
 await reelsFrame.evaluate(()=>{const v=document.querySelector('video');v.muted=true;return v.play()});await reelsFrame.waitForFunction(()=>document.querySelector('video').currentTime>.5,null,{timeout:60000});await reelsFrame.evaluate(()=>document.querySelector('video').pause());
 await page.setViewportSize({width:390,height:844});
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow');
 await page.goto(base,{waitUntil:'domcontentloaded'});
 if(await page.locator('a[href*="infinite-area-cinema"]').count()<1)throw Error('Library card missing');
 if(errors.length)throw Error(errors.join('\n'));
 await mkdir('work/infinite-area-check',{recursive:true});
 await writeFile('work/infinite-area-check/playback.json',JSON.stringify({base,edition:manifest.edition,youtubeLinksVerified:true,interactiveEffects:true,metadata,played:true,seeked:true,ended:true,mobileOverflow:false,libraryRegistered:true,errors},null,2));
 console.log('Infinite-area YouTube playback, links and library card verified');
}finally{await browser.close()}
