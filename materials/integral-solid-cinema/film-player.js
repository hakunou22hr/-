const films=[...document.querySelectorAll('#classroom90,#classroom30,#convergencePreview')];
if(new URLSearchParams(location.search).has('surface')){for(const film of films){film.preload='none';film.querySelectorAll('source').forEach(s=>s.removeAttribute('src'));film.load()}}
else for(const film of films)film.addEventListener('play',()=>{for(const other of films)if(other!==film)other.pause();const legacyPlay=document.querySelector('#play');if(legacyPlay?.getAttribute('aria-label')==='一時停止')legacyPlay.click()});

const preview=document.querySelector('#convergencePreview');if(preview&&!new URLSearchParams(location.search).has('surface')){preview.muted=true;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting&&!reduced&&!films.some(f=>f!==preview&&!f.paused))preview.play().catch(()=>{});else preview.pause()}},{threshold:.2}).observe(preview)}
