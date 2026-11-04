const VERSION='cinema-90-30-v1';
const player=document.querySelector('#player'),frame=document.querySelector('#video-frame'),label=document.querySelector('#edition-label');let current='90';
async function select(edition){if(current===edition)return;player.pause();current=edition;player.poster=edition==='30'?'../../media/birth-of-radian-cinema-30s-poster.jpg':'../../media/birth-of-radian-cinema-poster.jpg';player.src=`../../media/birth-of-radian-cinema-${edition}s.mp4?v=${VERSION}`;frame.classList.toggle('portrait',edition==='30');label.textContent=edition==='30'?'映画版30秒 · 縦9:16':'映画版90秒 · 横16:9';document.querySelectorAll('[data-edition]').forEach(b=>{const active=b.dataset.edition===edition;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});player.load();await new Promise((resolve,reject)=>{player.addEventListener('loadedmetadata',resolve,{once:true});player.addEventListener('error',reject,{once:true})})}
document.querySelectorAll('[data-edition]').forEach(b=>b.onclick=()=>select(b.dataset.edition).catch(()=>{label.textContent='動画を読み込めません。下の保存リンクをご利用ください。'}));document.querySelectorAll('[data-time]').forEach(b=>b.onclick=async()=>{await select('90');player.currentTime=Number(b.dataset.time)+.5});window.__selectEdition=select;

if(new URLSearchParams(location.search).has('portrait'))select('30').catch(()=>{});

document.querySelector('#restart').onclick=()=>{player.currentTime=0;player.play().catch(()=>{label.textContent='再生ボタンを押してください。'})};
