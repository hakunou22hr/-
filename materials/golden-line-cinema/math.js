import {assets} from './math-assets.js';
const images=new Map(),tints=new WeakMap();
export async function loadMath(load){await Promise.all(Object.entries(assets).map(async([key,a])=>images.set(key,await load(a.url))));}
export function mathMetrics(s,size){const a=assets[s];return a?{width:a.width*size,height:a.height*size}:null;}
export function drawMath(g,makeCanvas,s,x,y,size,color='#ffffff'){
 const a=assets[s],im=images.get(s);if(!a)return null;if(!im)throw Error('Math assets must load before createFilm');
 let cache=tints.get(makeCanvas);if(!cache){cache=new Map();tints.set(makeCanvas,cache);}const key=s+color;let tex=cache.get(key);
 if(!tex){tex=makeCanvas(im.width,im.height);const c=tex.getContext('2d');c.drawImage(im,0,0);if(color!=='original'){c.globalCompositeOperation='source-in';c.fillStyle=color;c.fillRect(0,0,tex.width,tex.height);}cache.set(key,tex);}
 const m=mathMetrics(s,size);g.drawImage(tex,x-m.width/2,y-m.height/2,m.width,m.height);return {left:x-m.width/2,right:x+m.width/2,top:y-m.height/2,bottom:y+m.height/2};
}
