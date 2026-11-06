const films=[...document.querySelectorAll('#classroom90,#classroom30')];
if(new URLSearchParams(location.search).has('surface')){for(const film of films){film.preload='none';film.querySelectorAll('source').forEach(s=>s.removeAttribute('src'));film.load()}}
else for(const film of films)film.addEventListener('play',()=>{for(const other of films)if(other!==film)other.pause();const legacyPlay=document.querySelector('#play');if(legacyPlay?.getAttribute('aria-label')==='一時停止')legacyPlay.click()});
