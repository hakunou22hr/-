import {mathjax} from 'mathjax-full/js/mathjax.js';
import {TeX} from 'mathjax-full/js/input/tex.js';
import {SVG} from 'mathjax-full/js/output/svg.js';
import {liteAdaptor} from 'mathjax-full/js/adaptors/liteAdaptor.js';
import {RegisterHTMLHandler} from 'mathjax-full/js/handlers/html.js';
import {AllPackages} from 'mathjax-full/js/input/tex/AllPackages.js';
import {loadImage} from '@napi-rs/canvas/index.js';
const formulas={original:String.raw`S=\lim_{n\to\infty}\frac1n\left(\sqrt{\frac1n}+\sqrt{\frac2n}+\cdots+\sqrt{\frac nn}\right)`,dimensions:String.raw`\underbrace{\frac1n}_{\text{width}}\times\underbrace{\sqrt{\frac kn}}_{\text{height}}`,sigma:String.raw`S_n=\frac1n\sum_{k=1}^{n}\sqrt{\frac kn}`,integral:String.raw`S=\int_0^1\sqrt{x}\,dx`,calculation:String.raw`\int_0^1 x^{1/2}\,dx=\left[\frac23x^{3/2}\right]_0^1=\frac23`,final:String.raw`S=\frac23`,function:String.raw`f(x)=\sqrt{x}`,transition:String.raw`\lim_{n\to\infty}\frac1n\sum_{k=1}^{n}\sqrt{\frac kn}=\int_0^1\sqrt{x}\,dx`};
const adaptor=liteAdaptor();RegisterHTMLHandler(adaptor);const doc=mathjax.document('',{InputJax:new TeX({packages:AllPackages}),OutputJax:new SVG({fontCache:'none'})});
export async function mathImages(){const result={};for(const [key,tex] of Object.entries(formulas)){let svg=adaptor.outerHTML(adaptor.firstChild(doc.convert(tex,{display:true})));const vb=svg.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number),ratio=vb[2]/vb[3],height=180;svg=svg.replace(/width="[^"]+"/,`width="${height*ratio}"`).replace(/height="[^"]+"/,`height="${height}"`).replaceAll('currentColor',key==='final'?'#ffda82':'#eaf7ff');result[key]={image:await loadImage(Buffer.from(svg)),ratio};}return result;}
