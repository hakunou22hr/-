import katex from 'katex';
import 'katex/dist/katex.min.css';

// Only trusted text is accepted; escape prose before adding locally rendered math.
export function fractionText(text){
 const escaped=text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 return escaped.replace(/(√\d+|\d+|[xyra])\/(√\d+|\d+|[xyra])/g,(_,n,d)=>{
  const tex=s=>s.replace(/√(\d+)/g,'\\sqrt{$1}');
  return katex.renderToString(`\\dfrac{${tex(n)}}{${tex(d)}}`,{throwOnError:true,output:'htmlAndMathml'});
 });
}
