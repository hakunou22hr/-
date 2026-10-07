import katex from 'katex';
import './style.css';
import {scenes,lineage,links} from './scenes.js';
import {Playback,clamp,TAU} from './math.js';
import {Renderer,parameters} from './render.js';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const clock=new Playback(scenes),renderer=new Renderer($('#canvas'));
const state={explore:false,u:.5,frequency:1,phase:0,yaw:-.45,pitch:.32,zoom:1,focus:null,reduced:matchMedia('(prefers-reduced-motion:reduce)').matches};
let raf=0,last=0,lastPaint=0,current=-1,lastFormula='',lastUI=-1;
const seen=new Set(['全体']);
const fmt=s=>`${Math.floor(s/60).toString().padStart(2,'0')}:${Math.floor(s%60).toString().padStart(2,'0')}`;
$('#duration').textContent=fmt(clock.total);$('#seek').max=clock.total;
const nodeInfo={
 '複素数':['z=\\cos\\theta+i\\sin\\theta,\\quad |z|=1','複素数平面でも単位円上の点を表せます。偏角を足す複素数の積は、平面の回転に対応します。'],
 'ベクトル':['\\mathbf r(t)=(x(t),y(t)),\\quad\\mathbf v(t)=\\mathbf r^{\\prime}(t)','位置ベクトルを時間で微分すると速度ベクトル。媒介変数表示から、曲線上の運動を調べられます。'],
 '媒介変数':['x=a\\cos t,\\quad y=b\\sin t','ひとつの媒介変数tで2つの座標を動かすと楕円を描けます。速度は各成分を微分して求めます。'],
 '2次曲線':['\\frac{x^2}{a^2}+\\frac{y^2}{b^2}=1','楕円は媒介変数でx=a cos t、y=b sin tと表せます。単位円を横・縦方向に伸ばした曲線です。'],
 '無限級数':['\\sum_{k=1}^{n}2^{-k}=1-2^{-n}\\longrightarrow1','無限級数の和は、部分和の極限で定義します。各項が0へ近づくことだけでは、和の収束は保証されません。'],
 '回転体':['V=\\pi\\int_0^1x^2\\,dx=\\frac\\pi3','y=x、0≤x≤1の下の領域をx軸のまわりに回転すると円すい。円形断面の面積πx²を積み上げます。'],
 '曲線長':['L=\\int_a^b\\sqrt{1+\\{f^{\\prime}(x)\\}^2}\\,dx','滑らかな曲線を短い線分で近似します。微小な長さを三平方で表し、積分して曲線全体の長さを求めます。'],
 '合成関数':['\\frac d{dx}f(g(x))=f^{\\prime}(g(x))g^{\\prime}(x)','外側と内側、2つの変化率をかける連鎖律。sin(ωt+φ)を微分すると、内側の微分からωが現れます。'],
 '高次導関数':['x^{\\prime}(t)=v(t),\\quad x^{\\prime\\prime}(t)=a(t)','変化率をさらに微分すると、その変化率の変化がわかります。位置の2階導関数は加速度です。'],
 '整数':['a=bq+r,\\quad 0\\le r<b','整数の除法と余りから、最大公約数を求める互除法へ。数学Aの整数も、独自の筋道を持つ系譜です。'],
 'ユークリッド':['\\gcd(a,b)=\\gcd(b,a\\bmod b)','割り算の余りを繰り返し、最大公約数を求めます。例えば48と18なら、余りは12、6、0となり最大公約数は6です。'],
 '相似':['\\frac{PA}{PD}=\\frac{PC}{PB}\\Rightarrow PA\\cdot PB=PC\\cdot PD','円の交わる弦を含む三角形の相似から、線分の積の関係を導けます。方べきの定理へのつながりです。'],
 '方べき':['PA\\cdot PB=PC\\cdot PD','同じ円に対する割線の線分の積は一定です。円の中心O、半径rなら、外部の点ではその積はPO²−r²です。'],
 '正規分布':['p(x)=\\frac1{\\sqrt{2\\pi}}e^{-x^2/2},\\quad\\int_{-\\infty}^{\\infty}p(x)\\,dx=1','指数関数が釣り鐘形の確率密度を作ります。区間の積分は確率。ここでは標準正規分布と数学のつながりだけを紹介します。'],
 'e':['e=\\lim_{n\\to\\infty}(1+1/n)^n','自然対数の底eは数列の極限から現れ、指数関数の「自分自身と同じ変化率」へつながります。'],
 '対数':['\\ln x=\\int_1^x\\frac1t\\,dt,\\quad x>0','自然対数は指数関数eˣの逆関数。1/tの符号付き面積としても表せるため、積分ともつながります。'],
 'エネルギー':['W=\\Delta K=\\frac12mv_2^2-\\frac12mv_1^2','物体に働く合力の仕事は運動エネルギーの変化に等しくなります。力の変位積分が、運動の変化を表します。'],
 '極限':['a_n\\to L,\\quad\\lim_{x\\to a}f(x)=L','数列と関数に共通する「近づく先」。接線の傾き、無限級数の和、区分求積から積分への橋になります。'],
 '微分':['f^{\\prime}(x)=\\lim_{h\\to0}\\frac{f(x+h)-f(x)}h','平均変化率の極限が、瞬間の変化率。接線、増減、極値、速度、加速度へつながります。'],
 '積分':['\\int_a^bf(x)\\,dx=F(b)-F(a)','区分求積の極限が定積分へ。符号付き面積から総量を求め、微積分の基本定理で微分と結ばれます。'],
};

function renderFormula(latex){if(latex===lastFormula)return;lastFormula=latex;try{$('#formula').innerHTML=katex.renderToString(latex,{displayMode:true,throwOnError:false,output:'htmlAndMathml'});}catch{$('#formula').textContent=latex;}$('#formula').style.fontSize='';requestAnimationFrame(()=>{const el=$('#formula'),math=el.querySelector('.katex');if(math&&math.scrollWidth>el.clientWidth){el.style.fontSize=`${Math.max(12,parseFloat(getComputedStyle(el).fontSize)*el.clientWidth/(math.scrollWidth+12))}px`;}});}
function updateScene(index){const s=scenes[index];current=index;seen.add(s.group);state.focus=null;$('#title').textContent=s.title;$('#chapter').textContent=s.group==='全体'?'MATHEMATICS GENEALOGY':`${s.group} · ${s.kind==='network'?'EPILOGUE':'DISCOVERY'}`;$('#scene-number').textContent=`${String(index+1).padStart(2,'0')} / ${scenes.length}`;$('#connection').textContent=s.connection;$('#caption').innerHTML=s.caption;$('#canvas').setAttribute('aria-label',`${s.title}：${s.connection}`);renderFormula(s.formula);$('#previous').disabled=index===0;$('#next').disabled=index===scenes.length-1;$$('.scene-choice').forEach((b,i)=>{b.classList.toggle('current',i===index);b.setAttribute('aria-current',i===index?'step':'false')});$$('#lineage button').forEach((b,i)=>{b.classList.toggle('current',lineage[i][0]===s.group);b.classList.toggle('passed',seen.has(lineage[i][0]));b.setAttribute('aria-current',lineage[i][0]===s.group?'step':'false')});configureExplore(s);}
const parameterNames={angle:['角度 θ','円周上の点をドラッグできます'],radius:['半径 r','スライダーで円を縮めます'],n:['項番号 n','nを大きくして極限を探究'],eN:['項番号 n','1・2・5・10・100・1000を比較'],h:['2点の差 h','点Bを横にドラッグできます'],approach:['極限への接近','グラフの点を横にドラッグできます'],rectangles:['長方形の数 n','4・8・16・32・64・128'],amplitude:['振幅 A','振幅・角周波数・位相を操作'],x:['グラフ上の位置 x','グラフを横にドラッグできます'],time:['時刻 t','時刻と物理量を同期'],xIntegral:['面積の右端 x','積み上がる面積を確認'],triangle:['三角形の高さ','図形の形を変えて確認'],distance:['縦方向の差','距離の関係を確認'],rotation:['カメラの向き','点をタップ／ドラッグ回転／ピンチ拡大'],progress:['Sceneの進行','スライダーでこのSceneを往復']};
function configureExplore(s){const [label,hint]=parameterNames[s.param]||parameterNames.progress;$('#param-label').textContent=label;$('#drag-hint').textContent=s.kind==='spring'?'ドラッグ回転／ピンチ拡大':hint;$('#parameter').value=state.u;$('#parameter').setAttribute('aria-label',label);$('#wave-parameters').hidden=!['period','spring'].includes(s.kind);paramOutput();}
function paramOutput(){const q=parameters(scenes[current<0?0:current],clock.locate().progress,true,state.u,state.frequency,state.phase),key=q.kind;$('#param-value').textContent=key==='angle'?`${(q.angle/Math.PI).toFixed(2)}π`:key==='radius'?q.radius.toFixed(2):key==='n'?q.n:key==='eN'?q.eN:key==='h'?q.h.toFixed(3):key==='approach'?q.approach.toFixed(3):key==='rectangles'?q.rectangles:key==='amplitude'?q.amplitude.toFixed(2):key==='time'?`${q.time.toFixed(2)} s`:key==='x'?q.x.toFixed(2):key==='xIntegral'?q.integralX.toFixed(3):`${Math.round(state.u*100)}%`;$('#frequency-value').value=state.frequency.toFixed(1);$('#phase-value').value=state.phase.toFixed(2);}
function updateUI(){const loc=clock.locate();if(loc.index!==current)updateScene(loc.index);$('#seek').value=clock.time;$('#elapsed').textContent=fmt(clock.time);$('#play').textContent=clock.playing?'⏸ 一時停止':'▶ 全編再生';$('#play').setAttribute('aria-label',clock.playing?'一時停止':'全編再生');const sec=Math.floor(clock.time);if(sec!==lastUI){lastUI=sec;$('#seek').setAttribute('aria-valuetext',`${scenes[loc.index].title} ${fmt(clock.time)}`)}return loc;}
function draw(){const loc=updateUI();try{const live=renderer.frame(scenes[loc.index],loc.progress,{...state,time:clock.time,next:scenes[loc.index+1],links});$('#live').textContent=live||'';}catch(error){$('#fallback').hidden=false;console.error('Math lineage rendering failed',error);}if(!renderer.g)$('#fallback').hidden=false;}
function cancel(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;}
function loop(now){raf=0;if(!clock.playing||document.hidden)return;if(last)clock.tick(Math.min((now-last)/1000,.15));last=now;if(now-lastPaint>=(renderer.low?1000/30:1000/60)){draw();lastPaint=now;}if(clock.playing)raf=requestAnimationFrame(loop);else draw();}
function schedule(){cancel();draw();if(clock.playing&&!document.hidden)raf=requestAnimationFrame(loop);}
function setExplore(on){state.explore=on;$('#explore').setAttribute('aria-pressed',on?'true':'false');$('#explore').textContent=on?'◆ 動画へ戻る':'◇ 探究モード';$('#explore-panel').hidden=!on;$('.cinema').classList.toggle('exploring',on);if(on){clock.playing=false;state.u=clock.locate().progress;$('#parameter').value=state.u;paramOutput();}state.focus=null;const scene=scenes[clock.locate().index];renderFormula(scene.formula);$('#caption').innerHTML=scene.caption;$('#connection').textContent=scene.connection;schedule();}
function play(){if(state.explore)setExplore(false);if(!clock.playing&&clock.time>=clock.total)clock.seek(0);clock.playing=!clock.playing;schedule();}
function jump(index,autoplay=false){if(autoplay&&state.explore)setExplore(false);clock.jump(index);clock.playing=autoplay;state.u=0;current=-1;schedule();}
$('#play').onclick=play;$('#previous').onclick=()=>jump(clock.locate().index-1);$('#next').onclick=()=>jump(clock.locate().index+1);$('#restart').onclick=()=>jump(0,clock.playing);$('#explore').onclick=()=>setExplore(!state.explore);
$('#seek').oninput=e=>{clock.seek(+e.target.value);state.u=clock.locate().progress;if(state.explore){$('#parameter').value=state.u;paramOutput();}schedule();};$('#speed').onchange=e=>{clock.speed=+e.target.value;schedule();};
$('#parameter').oninput=e=>{state.u=+e.target.value;paramOutput();draw();};$('#frequency').oninput=e=>{state.frequency=+e.target.value;paramOutput();draw();};$('#phase').oninput=e=>{state.phase=+e.target.value;paramOutput();draw();};
$$('[data-jump]').forEach(b=>b.onclick=()=>jump(+b.dataset.jump,true));
lineage.forEach(([label,index])=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>jump(index,true);$('#lineage').append(b)});
scenes.forEach((s,i)=>{const b=document.createElement('button');b.className='scene-choice';const num=document.createElement('span'),title=document.createElement('span'),chapter=document.createElement('small');num.textContent=String(i+1).padStart(2,'0');title.textContent=s.title;chapter.textContent=s.group;b.append(num,title,chapter);b.onclick=()=>{$('#scene-dialog').close();jump(i,true)};$('#scene-list').append(b)});
$('#scenes').onclick=()=>$('#scene-dialog').showModal();$('#close-scenes').onclick=()=>$('#scene-dialog').close();$('#scene-dialog').onclick=e=>{if(e.target===$('#scene-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}};
$('#fullscreen').disabled=!document.documentElement.requestFullscreen;$('#fullscreen').onclick=()=>{const action=document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();action?.catch(()=>{});};
document.addEventListener('keydown',e=>{if(/INPUT|SELECT|BUTTON/.test(e.target.tagName)||$('#scene-dialog').open)return;if(e.code==='Space'){e.preventDefault();play()}else if(e.code==='ArrowRight'){e.preventDefault();jump(current+1)}else if(e.code==='ArrowLeft'){e.preventDefault();jump(current-1)}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();else schedule()});

const pointers=new Map();let pinch=0,moved=false,startPointer=null;
const distance=()=>{const[a,b]=[...pointers.values()];return Math.hypot(a[0]-b[0],a[1]-b[1])};
function applyDrag(e){const kind=scenes[current].kind,[x,y]=renderer.logical(e.clientX,e.clientY);if(['circle','trig','sin','cos','trigDerivative'].includes(kind)){const cx=['sin','cos','trigDerivative'].includes(kind)?345:590;state.u=((Math.atan2(365-y,x-cx)+TAU)%TAU)/TAU;}else if(['secant','derivative'].includes(kind)){const A=245+(.5+1.5)/3.7*705,h=clamp((x-A)/705*3.7,.001,1);state.u=kind==='secant'?clamp(h-.5):clamp(-Math.log10(h)/3);}else if(kind==='functionLimit'){const center=240+1.1/2.2*740;state.u=1-clamp(Math.abs(x-center)/(740/2.2)/.9);}else if(['slope','monotonic','extrema','fundamental','position','acceleration','work'].includes(kind)){state.u=clamp((x-240)/750);}$('#parameter').value=state.u;paramOutput();draw();}
const canvas=$('#canvas');canvas.addEventListener('pointerdown',e=>{if(!state.explore)return;e.preventDefault();pointers.set(e.pointerId,[e.clientX,e.clientY]);canvas.setPointerCapture(e.pointerId);startPointer=[e.clientX,e.clientY];moved=false;if(pointers.size===2)pinch=distance();if(!['network','spring'].includes(scenes[current].kind))applyDrag(e);});
canvas.addEventListener('pointermove',e=>{const prev=pointers.get(e.pointerId);if(!state.explore||!prev)return;e.preventDefault();pointers.set(e.pointerId,[e.clientX,e.clientY]);if(startPointer&&Math.hypot(e.clientX-startPointer[0],e.clientY-startPointer[1])>5)moved=true;if(['network','spring'].includes(scenes[current].kind)){if(pointers.size===2){const d=distance();if(pinch)state.zoom=clamp(state.zoom*d/pinch,.55,1.8);pinch=d;}else if(pointers.size===1){state.yaw+=(e.clientX-prev[0])*.008;state.pitch=clamp(state.pitch+(e.clientY-prev[1])*.006,-1,1);}draw();}else if(pointers.size===1)applyDrag(e);});
function release(e){if(pointers.has(e.pointerId)&&!moved&&state.explore&&scenes[current].kind==='network'&&e.type==='pointerup'){const[x,y]=renderer.logical(e.clientX,e.clientY);const nearest=renderer.nodes.reduce((best,n)=>{const d=Math.hypot(n.x-x,n.y-y);return!best||d<best.d?{...n,d}:best;},null);if(nearest&&nearest.d<50){state.focus=nearest.name;const relationships=links.filter(([a,b])=>a===nearest.name||b===nearest.name);$('#connection').textContent=relationships.map(([a,b])=>`${a} → ${b}`).join(' / ');const info=nodeInfo[nearest.name];if(info){renderFormula(info[0]);$('#caption').textContent=info[1];}else{renderFormula(scenes[current].formula);$('#caption').textContent=relationships.map(([a,b,why])=>`${a}から${b}へ：${why}`).join('。');}draw();}}pointers.delete(e.pointerId);pinch=pointers.size===2?distance():0;}
for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,release);
canvas.addEventListener('wheel',e=>{if(!state.explore||!['network','spring'].includes(scenes[current].kind))return;e.preventDefault();state.zoom=clamp(state.zoom*(e.deltaY>0?.94:1.06),.55,1.8);draw();},{passive:false});
function placeExplorePanel(){const panel=$('#explore-panel'),portraitPhone=matchMedia('(max-width:700px) and (orientation:portrait)').matches;const parent=portraitPhone?$('.controls'):$('#stage');if(panel.parentElement!==parent){if(portraitPhone)parent.insertBefore(panel,$('.seek-label'));else parent.append(panel)}}
const observer=new ResizeObserver(()=>{placeExplorePanel();renderer.resize();lastFormula='';renderFormula(scenes[clock.locate().index].formula);draw();});observer.observe($('#stage'));addEventListener('pagehide',()=>{cancel();observer.disconnect();pointers.clear();});
addEventListener('pageshow',()=>{observer.observe($('#stage'));schedule()});
renderer.resize();draw();
