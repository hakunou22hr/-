import './model.js';
import './film.js';
const el=id=>document.getElementById(id);
const video=el('movie'), canvas=el('plot'), slider=el('point'), example=el('example');
const preferred=matchMedia('(prefers-reduced-motion: reduce)');
let c=.25, kind='square', spatial=false, projection, saved=null, answer=false, dragging=false;
let calm=preferred.matches;
el('calm').checked=calm;
const number=n=>n.toFixed(2).replace('-', '−');
function draw(time=0){
  const m=MVT.model(kind,c);
  projection=Film.render(canvas,time,{model:m,spatial,calm:calm||!spatial}).project;
}
function render(){
  const m=MVT.model(kind,c);
  example.value=kind;
  slider.min=(m.a+.01).toFixed(2);
  slider.max=(m.b-.01).toFixed(2);
  slider.value=c.toFixed(2);
  el('position').value='c = '+number(c);
  el('sec').textContent=number(m.sec);
  el('tan').textContent=m.slope===null?'微分不可':number(m.slope);
  const message=m.slope===null?'原点では左と右の傾きが異なります。':
    m.near?'傾きが近いと発光します（差が 0.04 以下）。':'割線と接線の傾きを比べてみましょう。';
  if(el('match').textContent!==message)el('match').textContent=message;
  el('solution').hidden=!answer;
  el('solution').textContent=kind==='square'?
    '2c = 2 より、厳密な解は c = 1。割線 y = 2x と接線 y = 2x − 1 は平行です。':
    '一致する点はありません。左側の傾きは −1、右側は 1。原点では微分できません。';
  el('answer').setAttribute('aria-expanded',String(answer));
  el('answer').textContent=answer?'答えを隠す':'答えを見る';
  el('front').setAttribute('aria-pressed',String(!spatial));
  el('space').setAttribute('aria-pressed',String(spatial));
  el('resume').disabled=saved===null;
  draw(performance.now()/1000);
}
function pointer(e){
  const rect=canvas.getBoundingClientRect(), px=(e.clientX-rect.left)*960/rect.width;
  const m=MVT.model(kind,c);
  const a=projection([m.a,m.f(m.a)])[0],b=projection([m.b,m.f(m.b)])[0];
  c=Math.round(100*MVT.clamp(m.a+(m.b-m.a)*(px-a)/(b-a),m.a+.01,m.b-.01))/100;
  render();
}
canvas.addEventListener('pointerdown',e=>{dragging=true;canvas.setPointerCapture(e.pointerId);pointer(e)});
canvas.addEventListener('pointermove',e=>{if(dragging)pointer(e)});
for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>{dragging=false});
slider.addEventListener('input',()=>{c=Number(slider.value);render()});
example.addEventListener('change',()=>{kind=example.value;c=kind==='square'?.25:-.65;answer=false;render()});
el('front').onclick=()=>{spatial=false;render()};
el('space').onclick=()=>{spatial=true;render()};
el('calm').onchange=()=>{calm=el('calm').checked;render()};
el('answer').onclick=()=>{answer=!answer;render()};
el('reset').onclick=()=>{kind='square';c=.25;answer=false;spatial=false;calm=preferred.matches;el('calm').checked=calm;render()};
el('enter').onclick=()=>{
  saved=video.currentTime;
  video.pause();
  const m=MVT.timeline(saved);
  kind=m.kind;c=m.c;answer=false;
  render();
  el('explore-title').focus();
};
el('resume').onclick=()=>{
  if(saved===null)return;
  video.currentTime=saved;
  saved=null;render();
  video.focus();
  video.scrollIntoView({block:'center'});
  video.play().catch(()=>{});
};
function animate(now){
  if(spatial&&!calm&&!document.hidden&&canvas.getBoundingClientRect().top<innerHeight)draw(now/1000);
  requestAnimationFrame(animate);
}
render();
requestAnimationFrame(animate);
