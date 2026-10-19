import {mathjax} from 'mathjax-full/js/mathjax.js';
import {TeX} from 'mathjax-full/js/input/tex.js';
import {SVG} from 'mathjax-full/js/output/svg.js';
import {liteAdaptor} from 'mathjax-full/js/adaptors/liteAdaptor.js';
import {RegisterHTMLHandler} from 'mathjax-full/js/handlers/html.js';
import {AllPackages} from 'mathjax-full/js/input/tex/AllPackages.js';
import {loadImage} from '@napi-rs/canvas/index.js';
const adaptor=liteAdaptor();RegisterHTMLHandler(adaptor);const doc=mathjax.document('',{InputJax:new TeX({packages:AllPackages}),OutputJax:new SVG({fontCache:'none'})});
const formulas={evenDef:'f(-x)=f(x)',oddDef:'f(-x)=-f(x)',even:'\\int_{-a}^a f(x)\\,dx=2\\int_0^a f(x)\\,dx',odd:'\\int_{-a}^a f(x)\\,dx=0',example:'\\int_{-1}^1(\\color{#ff9b70}{6x^3}+\\color{#ffd17c}{x^2}+\\color{#ff9b70}{2x}+\\color{#ffd17c}{1})\\,dx',oddterms:'\\underbrace{6x^3+2x}_{\\text{odd}}\\quad\\Longrightarrow\\quad\\int_{-1}^{1}(6x^3+2x)\\,dx=0',result:'2\\int_0^1(x^2+1)\\,dx=2\\left[\\frac{x^3}{3}+x\\right]_0^1=\\frac83',coscalc:'2[\\sin x]_0^{\\pi/4}=2\\cdot\\frac{\\sqrt2}{2}=\\sqrt2',cos:'\\int_{-\\pi/4}^{\\pi/4}\\cos x\\,dx=2\\int_0^{\\pi/4}\\cos x\\,dx=\\sqrt2'};
export async function mathImages(){const result={};for(const [key,tex] of Object.entries(formulas)){let svg=adaptor.outerHTML(adaptor.firstChild(doc.convert(tex,{display:true})));const vb=svg.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number),ratio=vb[2]/vb[3],height=150;svg=svg.replace(/width="[^"]+"/,`width="${height*ratio}"`).replace(/height="[^"]+"/,`height="${height}"`).replace('currentColor','#eaf7ff');svg=svg.replaceAll('currentColor','#eaf7ff');result[key]={image:await loadImage(Buffer.from(svg)),ratio};}return result;}
