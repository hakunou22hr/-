from playwright.sync_api import sync_playwright
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from threading import Thread
from pathlib import Path
import json,time
ROOT=Path(__file__).resolve().parents[3]
(ROOT/'work').mkdir(exist_ok=True)
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kw):super().__init__(*args,directory=str(ROOT/'dist'),**kw)
 def translate_path(self,path):return super().translate_path(path[2:] if path.startswith('/-/') else path)
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',4173),Handler);Thread(target=server.serve_forever,daemon=True).start()
results=[];errors=[];failed=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader'])
 version=browser.version
 for name,opts in [('Windows相当',dict(viewport={'width':1440,'height':1000},user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36')),('iPhone相当',pw.devices['iPhone 13']),('iPad相当',pw.devices['iPad (gen 7)'])]:
  opts={k:v for k,v in opts.items() if k!='default_browser_type'}
  context=browser.new_context(**opts);page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:failed.append(r.url) if r.status>=400 else None)
  page.goto('http://127.0.0.1:4173/-/');page.get_by_role('searchbox',name='教材を検索').fill('不定積分と原始関数');assert page.locator('.card').count()==1;assert page.locator('.card img').count()==1;page.wait_for_function('document.querySelector(".card img").complete && document.querySelector(".card img").naturalWidth>0')
  page.get_by_role('link',name='不定積分と原始関数 2D・3D探究を開く').click();page.wait_for_selector('.readouts');assert '/-/materials/antiderivative-explorer/' in page.url
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'), name+' horizontal overflow'
  problem=page.get_by_label('例題・練習')
  for pid in ['e1','e2','p1','p2','p3']:
   problem.select_option(pid)
   for i in range(5):
    page.locator('.steps button').nth(i).click();assert page.locator('.katex-error').count()==0
   assert page.locator('svg[role="img"]').count()==2
   if pid=='p3':assert page.get_by_label('定義域の区間').locator('option').count()==1
  problem.select_option('e2');page.get_by_role('button',name='3D ファミリー',exact=True).click();page.wait_for_selector('.three-host canvas');page.wait_for_timeout(600)
  assert page.get_by_role('alert').count()==0
  def slide(label,value):page.get_by_label(label,exact=True).evaluate('(el,v)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set.call(el,String(v));el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}));}',value);page.wait_for_timeout(100)
  slide('3D共有x',3);assert float(page.get_by_label('共有するx',exact=True).input_value())==3
  slide('積分定数C',2);assert float(page.get_by_label('3D積分定数C',exact=True).input_value())==2
  slide('3D積分定数C',-1);assert float(page.get_by_label('積分定数C',exact=True).input_value())==-1
  slide('共有するx',2.5);assert float(page.get_by_label('3D共有x',exact=True).input_value())==2.5

  if opts['viewport']['width']<720:
   slide('モバイル共有x',2.6);assert float(page.get_by_label('共有するx',exact=True).input_value())==2.6
   slide('モバイル積分定数C',-1.5);assert float(page.get_by_label('3D積分定数C',exact=True).input_value())==-1.5
   slide('共有するx',2.5);slide('積分定数C',-1)
  canvas=page.locator('.three-host canvas');canvas.scroll_into_view_if_needed();box=canvas.bounding_box();page.mouse.move(box['x']+box['width']/2,box['y']+box['height']/2);page.mouse.down();page.mouse.move(box['x']+box['width']/2+65,box['y']+box['height']/2+25,steps=8);page.mouse.up();page.mouse.wheel(0,-150)

  if opts.get('has_touch'):
   cdp=context.new_cdp_session(page);pt={'x':box['x']+box['width']/2,'y':box['y']+box['height']/2}
   cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[pt]})
   cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':pt['x']+45,'y':pt['y']+25}]})
   cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
   points=[{'x':pt['x']-30,'y':pt['y']},{'x':pt['x']+30,'y':pt['y']}]
   cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':points})
   cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':pt['x']-55,'y':pt['y']},{'x':pt['x']+55,'y':pt['y']}]})
   cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
  page.screenshot(path=str(ROOT/'work'/('3d-'+name+'.png')),full_page=True)
  page.get_by_role('button',name='絶対値と対数',exact=True).click();page.get_by_label('定義域の区間').select_option('-1');page.get_by_role('button',name='log x',exact=True).click();assert page.locator('.undefined').count()==1;assert '未定義' in page.locator('.readouts').inner_text()
  page.get_by_role('button',name='log(-x)',exact=True).click();assert page.locator('.undefined').count()==0
  page.get_by_role('button',name='log|x|',exact=True).click();slide('積分定数C',3);page.get_by_label('定義域の区間').select_option('1');assert float(page.get_by_label('積分定数C',exact=True).input_value())==-1
  page.get_by_label('0にさらに近づく',exact=False).check();slide('共有するx',.015);assert float(page.get_by_label('共有するx',exact=True).input_value())==.015
  page.get_by_role('button',name='面積の変化',exact=True).click();slide('面積の基準a',3);slide('共有するx',2);assert 'x<a' in page.locator('.notice').inner_text()
  page.get_by_role('button',name='2D 原始関数',exact=True).click();page.get_by_label('再生速度',exact=True).select_option('0.15');page.get_by_role('button',name='再生',exact=True).click();page.wait_for_timeout(300);page.get_by_role('button',name='停止',exact=True).click();before=float(page.get_by_label('共有するx',exact=True).input_value());page.wait_for_timeout(200);assert float(page.get_by_label('共有するx',exact=True).input_value())==before
  page.get_by_role('button',name='コマ送り',exact=True).click();assert abs(float(page.get_by_label('共有するx',exact=True).input_value())-before-.05)<.002
  page.get_by_role('button',name='曲線を描き直す',exact=True).click();page.wait_for_timeout(100);page.get_by_role('button',name='停止',exact=True).click()
  page.get_by_label('低負荷モード',exact=True).check();page.get_by_label('発光・軌跡の演出',exact=True).uncheck();page.get_by_label('教師用解説を表示',exact=True).check();assert page.locator('.teacher').count()==1
  page.get_by_label('あなたの予想',exact=True).fill('元の関数の値が原始関数の傾きになる');page.get_by_role('button',name='予想を記録して実験へ',exact=True).click();page.get_by_role('button',name='観察を終えて解説へ',exact=True).click();page.get_by_role('button',name='振り返りへ',exact=True).click();page.get_by_label('観察から分かったこと・予想が変わった理由',exact=False).fill('高さと傾きが同じだった')
  page.get_by_label('確認問題の答え',exact=True).fill('0');page.get_by_role('button',name='答え合わせ',exact=True).click();assert 'もう一度' in page.locator('p[role=status]').inner_text()
  page.get_by_label('確認問題の答え',exact=True).fill('1');page.get_by_role('button',name='答え合わせ',exact=True).click();assert '正解' in page.locator('p[role=status]').inner_text()
  page.get_by_role('button',name='初期画面',exact=True).click();assert float(page.get_by_label('共有するx',exact=True).input_value())==2.5
  assert page.locator('.katex-error').count()==0;assert page.locator('#formulas .mfrac').count()>=2;assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  page.screenshot(path=str(ROOT/'work'/('2d-'+name+'.png')),full_page=True)
  results.append({'device':name,'result':'PASS','checks':'一覧・全5問全段階・数式・3D回転・x/C双方向同期・対数定義域・独立C・特異点・面積の向き・再生停止・コマ送り・演出停止・低負荷・探究・確認問題・リセット・横溢れ'});context.close()
 browser.close()
server.shutdown()
report={'results':results,'pageErrors':errors,'httpErrors':failed,'engine':f'Linux Chromium {version} / system executable','limitation':'Windows/iOS実機およびSafari/WebKitでの検証は未実施。画面・UA・タッチ対応のエミュレーション。'}
(ROOT/'work'/'browser-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2));assert not errors and not failed
