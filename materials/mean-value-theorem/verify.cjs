const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const local=process.env.LESSON_URL||'http://127.0.0.1:4280/materials/mean-value-theorem/';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:850}});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  if(process.env.LIBRARY_URL){
   const library=new URL(process.env.LIBRARY_URL);library.searchParams.set('v','mvt-hidden18');await page.goto(library.href);
   await page.getByRole('button',{name:'数学Ⅱ',exact:true}).click();
   const search=page.getByRole('searchbox',{name:'教材を検索'});
   const card=page.getByRole('link',{name:'傾きが出会う瞬間 ― 平均値の定理を開く'});
   for(const term of ['平均値の定理','微分係数','平均変化率','接線','割線']){
    await search.fill(term);
    await card.waitFor({state:'detached'});
   }
   await search.fill('傾きが出会う瞬間');assert.equal(await page.locator('.card').count(),0);
   await page.goto(local);
   assert.equal(new URL(page.url()).pathname,new URL(local).pathname);
  }else{
   await page.goto(local);
  }
  await page.waitForFunction(()=>document.querySelector('video').readyState>=1);
  const state=async()=>page.locator('#point').inputValue();
  assert.equal(await state(),'0.25');
  assert.equal(await page.locator('#sec').textContent(),'2.00');
  assert(await page.locator('#solution').isHidden());
  await page.locator('#point').focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await state(),'0.26');
  let box=await page.locator('canvas').boundingBox();
  await page.mouse.move(box.x+box.width*.44,box.y+box.height*.58);
  await page.mouse.down();
  await page.mouse.move(box.x+box.width*.505,box.y+box.height*.58,{steps:7});
  await page.mouse.up();
  assert.equal(await state(),'1');
  await page.locator('#answer').click();
  assert.match(await page.locator('#solution').textContent(),/厳密な解は c = 1/);
  await page.locator('#space').click();
  assert.equal(await page.locator('#space').getAttribute('aria-pressed'),'true');
  await page.locator('#calm').check();
  await page.locator('#example').selectOption('abs');
  await page.locator('#point').evaluate(n=>{n.value=0;n.dispatchEvent(new Event('input'))});
  assert.equal(await page.locator('#tan').textContent(),'微分不可');
  const duration=await page.locator('video').evaluate(v=>v.duration);
  assert.equal(duration,90);
  await page.locator('video').evaluate(async v=>{v.currentTime=79;await new Promise(r=>v.addEventListener('seeked',r,{once:true}));});
  await page.locator('#enter').click();
  assert.equal(await page.locator('#example').inputValue(),'abs');
  assert.equal(await page.locator('#tan').textContent(),'微分不可');
  await page.locator('#reset').click();
  assert.equal(await state(),'0.25');
  await page.locator('#resume').click();
  await page.waitForFunction(()=>{const v=document.querySelector('video');return v.currentTime>=79&&v.currentTime<84&&!v.paused;});
  const download=page.waitForEvent('download');
  await page.getByRole('link',{name:/MP4を保存/}).click();
  const file=await download;
  assert.equal(file.suggestedFilename(),'mean-value-theorem.mp4');
  assert.equal(await file.failure(),null);
  assert.deepEqual(errors,[]);
  for(const [width,height] of [[390,844],[844,390],[768,1024],[1920,1080]]){
    const mobile=await browser.newPage({viewport:{width,height},hasTouch:true,isMobile:width<900});
    await mobile.goto(local);
    assert(await mobile.locator('canvas').isVisible());
    assert(await mobile.evaluate(()=>document.documentElement.scrollWidth===innerWidth));
    if(width===390){
      const plot=mobile.locator('canvas');
      await plot.scrollIntoViewIfNeeded();
      box=await plot.boundingBox();
      await mobile.touchscreen.tap(box.x+box.width*.505,box.y+box.height*.58);
      assert.equal(await mobile.locator('#point').inputValue(),'1');
    }
    await mobile.close();
  }
  console.log('Verified desktop keyboard and drag, touch, four viewports, ± slopes, corner, solution, resume from 79s, and MP4 download.');
 } finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
