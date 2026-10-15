export const scenes = [
 {id:'intro',start:0,end:6,chapter:'01 / THE QUESTION',title:'面積を、微分すると？',lines:[['A(x)=\\int_0^x\\sin t\\,dt','cyan'],['A\' (x)=\\;?','gold']],caption:'積み上げた面積。その変化の速さは？',graph:'area',label:'面積 A(x) と、その増え方'},
 {id:'area',start:6,end:17,chapter:'02 / ACCUMULATION',title:'端を動かす。面積が変わる。',lines:[['A(x)=\\int_a^x f(t)\\,dt','cyan'],['\\Delta A\\approx f(x)\\,\\Delta x','gold']],caption:'幅がとても小さいと、増える面積は「高さ × 幅」。',graph:'strip',label:'細い帯の高さ = f(x)'},
 {id:'proof',start:17,end:28,chapter:'03 / THE LIMIT',title:'面積の変化率が、高さになる。',lines:[['\\frac{A(x+h)-A(x)}{h}','cyan'],['=\\frac1h\\int_x^{x+h}f(t)\\,dt','cyan'],['\\xrightarrow{h\\to0}f(x)','gold']],caption:'連続な関数なら、帯の平均の高さは f(x) に近づく。',graph:'limit',label:'h → 0 ／ 平均の高さ → f(x)'},
 {id:'law',start:28,end:36,chapter:'04 / FUNDAMENTAL THEOREM',title:'定積分と微分が、つながる。',lines:[['\\frac{d}{dx}\\int_a^x f(t)\\,dt=f(x)','gold'],['\\int_a^x f(t)\\,dt=F(x)-F(a)','cyan'],["F'(x)=f(x)",'small']],caption:'上端 x を微分すると、中の関数が現れる。',graph:'duality',label:'積分で蓄積 → 微分で高さへ'},
 {id:'sine',start:36,end:43,chapter:'05 / FIRST EXAMPLE',title:'積分を計算しなくても。',lines:[['\\frac{d}{dx}\\int_0^x\\sin t\\,dt','cyan'],['=\\sin x','gold']],caption:'積分変数 t が、上端の x に変わる。',graph:'sine',label:'sin x ／ 面積の変化率'},
 {id:'exercise',start:43,end:49,chapter:'06 / TRY IT',title:'同じ仕組みで、もう一問。',lines:[['\\frac{d}{dx}\\int_1^x t e^t\\,dt','cyan'],['=x e^x','gold']],caption:'下端が定数なら、同じ公式が使える。',graph:'exp',label:'f(t) = t eᵗ → f(x) = x eˣ'},
 {id:'challenge',start:49,end:58,chapter:'07 / A TWIST',title:'中にも x があるときは？',lines:[['F(x)=\\int_0^x(x-t)\\cos t\\,dt','cyan'],['F\'(x)=\\;?','gold']],caption:'積分するとき、積分変数と違う x は定数として扱う。',graph:'kernel',label:'(x − t) cos t ／ x はパラメータ'},
 {id:'split',start:58,end:68,chapter:'08 / DECOMPOSE',title:'x を外へ。二つに分ける。',lines:[['F(x)=x\\int_0^x\\cos t\\,dt','cyan'],['-\\int_0^x t\\cos t\\,dt','pink']],caption:'積の微分と、定積分の微分を組み合わせる。',graph:'kernel',label:'x は積分の外へ ／ t は中に残る'},
 {id:'cancel',start:68,end:80,chapter:'09 / DIFFERENTIATE',title:'現れて、打ち消し合う。',lines:[["F'(x)=\\int_0^x\\cos t\\,dt",'cyan']],caption:'積の微分で生まれた二つの項が、ちょうど消える。',graph:'cosine',label:'残るのは ∫₀ˣ cos t dt'},
 {id:'result',start:80,end:85,chapter:'10 / RESOLUTION',title:'残った積分は、sin x。',lines:[["F'(x)=\\int_0^x\\cos t\\,dt",'cyan'],['=[\\sin t]_0^x=\\sin x','gold']],caption:'複雑に見えた微分が、一つの波になる。',graph:'sine',label:"F′(x) = sin x"},
 {id:'ending',start:85,end:90,chapter:'MATHEMATICS Ⅲ / 定積分と微分法',title:'面積と高さは、つながっている。',lines:[['\\frac{d}{dx}\\int_a^x f(t)\\,dt=f(x)','gold'],["F(x)=\\int_0^x(x-t)\\cos t\\,dt",'small'],["F'(x)=\\sin x",'cyan']],caption:'積分で蓄積し、微分で取り出す。',graph:'sine',label:'THE FUNDAMENTAL CONNECTION'},
];
// A fresh edit of the same narrative, with time for the cancellation to be read.
export const shortEdit = [
 {start:0,end:3,from:0,to:6}, {start:3,end:9,from:28,to:36},
 {start:9,end:13,from:36,to:43}, {start:13,end:18,from:49,to:58},
 {start:18,end:25,from:68,to:80}, {start:25,end:30,from:80,to:85},
];
export function sourceTime(t,portrait){if(!portrait)return Math.min(t,89.999);const cut=shortEdit.find(c=>t<c.end)||shortEdit.at(-1);return cut.from+(Math.min(t,29.999)-cut.start)/(cut.end-cut.start)*(cut.to-cut.from);}
export function getScene(t){return scenes.find(s=>t<s.end)||scenes.at(-1);}
