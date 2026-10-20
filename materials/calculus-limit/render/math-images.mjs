import {mathjax} from 'mathjax-full/js/mathjax.js';
import {TeX} from 'mathjax-full/js/input/tex.js';
import {SVG} from 'mathjax-full/js/output/svg.js';
import {liteAdaptor} from 'mathjax-full/js/adaptors/liteAdaptor.js';
import {RegisterHTMLHandler} from 'mathjax-full/js/handlers/html.js';
import {AllPackages} from 'mathjax-full/js/input/tex/AllPackages.js';
import {loadImage} from '@napi-rs/canvas/index.js';
import {formulas} from '../model.js';
const adaptor=liteAdaptor();RegisterHTMLHandler(adaptor);const doc=mathjax.document('',{InputJax:new TeX({packages:AllPackages}),OutputJax:new SVG({fontCache:'none'})});
export async function mathImages(){const result={};for(const [key,tex] of Object.entries(formulas)){let svg=adaptor.outerHTML(adaptor.firstChild(doc.convert(tex,{display:true})));const vb=svg.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number),ratio=vb[2]/vb[3],height=180;svg=svg.replace(/width="[^"]+"/,`width="${height*ratio}"`).replace(/height="[^"]+"/,`height="${height}"`).replaceAll('currentColor','#eaf7ff');result[key]={image:await loadImage(Buffer.from(svg)),ratio};}return result;}
