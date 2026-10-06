export const subjects={middle:{name:'中学数学',color:'#e7edf9'},I:{name:'数学Ⅰ',color:'#55dce9'},A:{name:'数学A',color:'#82d5a1'},II:{name:'数学Ⅱ',color:'#e7c56b'},B:{name:'数学B',color:'#ec9b65'},III:{name:'数学Ⅲ',color:'#b59aef'},C:{name:'数学C',color:'#eb99c9'}};
// Positions describe a conceptual constellation, rather than a textbook order.
const rows=[
['number','middle','数','a+b=b+a','数を数える、測る。数学の共通の出発点。','language',-6,1,0],
['expression','middle','式','a(b+c)=ab+ac','数量の関係を文字で表す。','language',-5,3,1],
['shape','middle','図形','S=\\frac12 bh','形・長さ・角度・面積を捉える。','geometry',-6,-2,-1],
['function','middle','関数','y=f(x)','一つの量から、もう一つの量が決まる対応。','calculus',-2,0,2],
['chance','middle','確率の出発点','P(A)=\\frac{|A|}{|\\Omega|}','同様に確からしい場合を数えて確率を求める。','probability',2,-5,0],
['data','middle','データ','\\bar{x}=\\frac1n\\sum x_i','観測を集め、ばらつきや傾向を調べる。','statistics',6,-4,1],
['pythagorean','middle','三平方の定理','a^2+b^2=c^2','直角三角形の辺の長さを結ぶ。','triangle',-5,-1,1],
['similarity','middle','相似','\\frac{a}{a\prime}=\\frac{b}{b\prime}','形が同じ図形では対応する辺の比が等しい。','triangle',-6,-3,1],
['circle','middle','円','x^2+y^2=r^2','中心から一定の距離にある点の集まり。','circle',-4,-4,0],
['quadratic-equation','middle','二次方程式','ax^2+bx+c=0','二次式が0になる値を探す。','quadratic',-4,4,0],
['coordinate','middle','座標','P(x,y)','数の組で位置を表す。','coordinate',-3,-2,2],
['algebra','I','数と式','(a+b)^2=a^2+2ab+b^2','展開・因数分解・実数の性質で式を扱う。','language',-3,3,-1],
['logic','I','集合と命題','A\\subset B','条件・集合・必要十分を使って論理を明確にする。','language',-1,4,-2],
['quadratic','I','二次関数','y=a(x-p)^2+q','平方完成で頂点を捉え、方程式をグラフとして見る。','quadratic',-2,3,0],
['complete-square','I','平方完成','x^2+bx+c=(x+b/2)^2+c-b^2/4','式を頂点が見える形に変える。','quadratic',-3,5,-1],
['extrema','I','最大・最小','y_{\\min}=q\\quad(a>0)','二次関数の頂点や区間の端で値を比較する。','derivative',0,3,1],
['trig-ratio','I','三角比','\\sin\\theta=\\frac{a}{c},\\quad\\cos\\theta=\\frac{b}{c}','直角三角形の比を、角度の量として扱う。','triangle',-3,-1,0],
['sine-law','I','正弦定理','\\frac{a}{\\sin A}=2R','辺と対角の比を外接円の半径で結ぶ。','triangle',-2,-4,1],
['cosine-law','I','余弦定理','c^2=a^2+b^2-2ab\\cos C','三平方の定理を一般の三角形へ広げる。','vector',-1,-2,0],
['measurement','I','図形と計量','S=\\frac12 ab\\sin C','三角比で図形の長さ・角度・面積を測る。','triangle',-1,-4,-1],
['analysis','I','データの分析','s^2=\\frac1n\\sum(x_i-\\bar x)^2','平均・中央値・四分位数・箱ひげ図・分散・標準偏差でデータを捉える。仮説検定の考え方にも触れる。','statistics',5,-3,0],
['correlation','I','相関','r=\\frac{\\sum (x_i-\\bar x)(y_i-\\bar y)}{\\sqrt{\\sum(x_i-\\bar x)^2\\sum(y_i-\\bar y)^2}}','散布図の線形な関係の強さを表す。相関は因果関係を意味しない。','scatter',7,-2,0],
['counting','A','場合の数','{}_nP_r=\\frac{n!}{(n-r)!}','順序や条件に注意し、もれなく数える。','counting',1,-4,-2],
['permutation','A','順列','{}_nP_r','順番を区別して選び、並べる。','counting',0,-6,0],
['combination','A','組合せ','{}_nC_r=\\frac{n!}{r!(n-r)!}','順番を区別せずに選ぶ。','counting',2,-3,0],
['probability','A','確率','P(A\\cup B)=P(A)+P(B)-P(A\\cap B)','場合の数を用い、事象の起こりやすさを考える。','probability',4,-5,0],
['conditional','A','条件付き確率','P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}','Bが起きたという条件のもとでAの確率を考える。P(B)>0。','probability',6,-6,-1],
['independent','A','独立試行','P(A\\cap B)=P(A)P(B)','一方の結果が他方の確率に影響しない場合。','probability',4,-6,2],
['geometry','A','図形の性質','PA\\cdot PB=PC\\cdot PD','三角形・円・空間図形を、性質と証明から捉える。','power',-5,-5,-2],
['power','A','方べきの定理','PA\\cdot PB=PC\\cdot PD','外部の点から引いた2本の割線では、交点までの距離の積が等しい。','power',-3,-6,0],
['human','A','数学と人間の活動','N=\\sum a_k b^k','記数法・整数・測量など、人間の活動と数学を結ぶ。','language',-6,5,1],
['expressions','II','いろいろな式','(a+b)^n=\\sum_{k=0}^n{}_nC_k a^{n-k}b^k','恒等式、式の除法、分数式などから式の構造を調べる。','binomial',0,5,0],
['binomial-theorem','II','二項定理','(a+b)^n=\\sum_{k=0}^n{}_nC_k a^{n-k}b^k','展開の係数は、どの因子からbを選ぶかの組合せで決まる。','binomial',3,-1,0],
['pascal','A','パスカルの三角形','{}_nC_k={}_{n-1}C_{k-1}+{}_{n-1}C_k','一つの組合せの数は、直前の二つの数の和になる。','binomial',2,-2,2],
['discriminant','II','判別式','D=b^2-4ac','二次方程式の実数解の個数を決める。二次関数の交点と接続する。','quadratic',0,4,0],
['complex','II','複素数と方程式','i^2=-1','実数の範囲を複素数へ広げ、二次方程式の解を捉える。','quadratic',2,4,1],
['analytic-geometry','II','図形と方程式','(x-a)^2+(y-b)^2=r^2','直線・円・軌跡・領域を、座標と方程式で表す。','curve',-1,-1,-2],
['unit-circle','II','単位円','(x,y)=(\\cos\\theta,\\sin\\theta)','三角比を一般角へ広げるための、半径1の円。','circle',0,0,1],
['trig','II','三角関数','y=\\sin x','角度を入力とする周期的な関数。','circle',2,0,0],
['addition','II','加法定理','\\sin(\\alpha+\\beta)=\\sin\\alpha\\cos\\beta+\\cos\\alpha\\sin\\beta','角度の和を、元の二つの角の三角関数で表す。','circle',3,1,2],
['wave','II','周期と波','y=A\\sin(\\omega t+\\phi)','振幅・周期・位相で繰り返す現象を表す。','circle',4,0,-1],
['exponential','II','指数関数','y=a^x\\quad(a>0,a\\ne1)','一定の倍率で増減する量を表す。','exponential',0,2,-2],
['log','II','対数関数','y=\\log_a x\\iff x=a^y','指数関数の逆関数。倍率を加法的な量へ変える。','exponential',2,2,-1],
['derivative','II','微分','f\prime(x)=\\lim_{h\\to0}\\frac{f(x+h)-f(x)}{h}','主に多項式の瞬間の変化率を調べる。','derivative',3,3,0],
['integral','II','積分','\\int_a^b f(x)\\,dx=F(b)-F(a)','原始関数を使い、主に多項式で面積や累積量を求める。','integral',5,2,0],
['sequence','B','数列','a_n=a_1+(n-1)d','等差・等比・漸化式を使って、順番に並ぶ数を捉える。','sequence',0,6,1],
['sigma','B','Σ','S_n=\\sum_{k=1}^n a_k','離散的な量の総和を一つの式で表す。','sequence',2,6,0],
['distribution','B','確率分布','E[X]=\\sum x_kP(X=x_k)','確率変数がどの値をどの確率でとるかを表す。','probability',6,-4,-2],
['binomial','B','二項分布','P(X=k)={}_nC_k p^k(1-p)^{n-k}','独立なn回の試行での成功数。平均np、分散np(1-p)。','probability',5,-1,1],
['normal','B','正規分布','f(x)=\\frac{e^{-(x-\\mu)^2/(2\\sigma^2)}}{\\sigma\\sqrt{2\\pi}}','平均μ・標準偏差σで決まる連続分布。','normal',7,0,0],
['inference','B','統計的な推測','\\bar X\\pm1.96\\frac{\\sigma}{\\sqrt n}','標本から母集団を推定し、仮説を検定する。式は母標準偏差既知で正規近似が適切なときの95%信頼区間。','statistics',8,-3,1],
['society','B','数学と社会生活','\\text{data}\\longrightarrow\\text{model}','社会の問題を、数列や統計モデルで考察する。','statistics',8,-5,-1],
['limit','III','極限','\\lim_{n\\to\\infty}\\frac1n=0','数列や関数が近づいていく先を、無限の過程として捉える。','sequence',4,5,0],
['advanced-derivative','III','微分法','(\\sin x)\prime=\\cos x','合成・逆関数、指数・対数・三角関数へ微分を広げる。','derivative',5,4,2],
['advanced-integral','III','積分法','\\int_a^b f(x)\\,dx=\\lim_{n\\to\\infty}\\sum f(x_k)\\Delta x','置換・部分積分や区分求積で、一般の関数の面積・体積を求める。','integral',7,3,1],
['tangent','III','接線・局所線形化','f(x+h)\\approx f(x)+f\prime(x)h','微分可能な関数を、近くでは直線として捉える。','derivative',6,5,-1],
['e','III','自然対数・e','(e^x)\prime=e^x','微分で姿が変わらない指数関数と、その逆関数。','natural',3,5,-2],
['volume','III','回転体の体積','V=\\pi\\int_a^b f(x)^2\\,dx','x軸周りに回転させた領域を、薄い円板で積み重ねる。','volume',8,4,-1],
['vector','C','ベクトル','\\vec a=(a_x,a_y,a_z)','向きと大きさを持つ量で、平面や空間の図形を扱う。','vector',1,-1,2],
['dot','C','内積','\\vec a\\cdot\\vec b=|\\vec a||\\vec b|\\cos\\theta','長さと角度を、成分による計算へつなぐ。','vector',1,-3,1],
['complex-plane','C','複素数平面','z=r(\\cos\\theta+i\\sin\\theta)','複素数を平面の点として表し、計算を図形として見る。','complex',4,1,0],
['rotation','C','回転・極形式','z\\mapsto re^{i\\theta}z','複素数の掛け算は、拡大縮小と回転に対応する。指数表記は発展的な表現。','complex',5,0,2],
['de-moivre','C','ド・モアブルの定理','(\\cos\\theta+i\\sin\\theta)^n=\\cos n\\theta+i\\sin n\\theta','極形式の積で角度が加わることを、整数乗へ広げる。','complex',6,1,-2],
['curves','C','平面上の曲線','\\frac{x^2}{a^2}+\\frac{y^2}{b^2}=1','楕円・双曲線・放物線を方程式で捉える。','curve',-1,1,-1],
['parameter','C','媒介変数','(x,y)=(x(t),y(t))','一つの変数tで、動く点と曲線を記述する。','curve',1,1,-3],
['representation','C','数学的な表現の工夫','(x,y)\\longleftrightarrow x+yi','図・グラフ・行列などで、対象に合った表現を選ぶ。','coordinate',6,6,1],
['area','middle','面積','S=ab','図形が占める広さを数で表す。','integral',-6,0,-2],
['change','II','変化率','\\frac{f(x+h)-f(x)}h','入力の変化に対する出力の変化の割合。','derivative',1,3,-2],
];
rows.push(...[["euclid", "A", "ユークリッドの互除法", "\\gcd(a,b)=\\gcd(b,a\\bmod b)", "割り算の余りへ置き換えても最大公約数は変わらない。", "euclid", -5, 6, -2], ["series", "III", "無限級数", "\\sum_{k=0}^{\\infty}r^k=\\frac1{1-r}\\quad(|r|<1)", "部分和の数列の極限。項が0に近づくだけでは収束は保証されない。", "series", 3, 7, 1], ["riemann", "III", "区分求積法", "\\int_a^b f(x)dx=\\lim_{n\\to\\infty}\\sum_{k=1}^n f(\\xi_k)\\Delta x", "区間を細分し、小さな長方形の面積の有限和の極限を取る。", "integral", 6, 6, 2], ["natural-log", "III", "自然対数", "\\ln x=\\int_1^x\\frac1t\\,dt", "底eの対数。正のxで微分すると1/xになる。", "natural", 4, 6, -3], ["conic", "C", "二次曲線", "\\frac{x^2}{a^2}\\pm\\frac{y^2}{b^2}=1", "楕円・双曲線・放物線を、二次方程式や焦点の条件で関連付ける。", "curve", -2, 1, -3]]);
export const concepts=rows.map(([id,subject,title,formula,description,model,x,y,z])=>({id,subject,title,formula,description,model,position:[x,y,z]}));
export const byId=Object.fromEntries(concepts.map(c=>[c.id,c]));
export const relations={'foundation':'前提','generalization':'一般化','equivalent-view':'別の表現','application':'応用','inverse':'逆操作','limit':'極限による発展','geometric-interpretation':'幾何学的解釈','probabilistic-extension':'確率的拡張'};
const links=[];
function link(from,to,relation,explanation){links.push({id:`${from}:${to}`,from,to,relation,explanation});}
function chain(ids,relation,explanations){for(let i=0;i<ids.length-1;i++)link(ids[i],ids[i+1],relation,explanations[i]);}
chain(['number','expression','algebra','expressions'],'foundation',['数の関係を、文字を使った式で表す。','文字式の計算を、実数・展開・因数分解へ広げる。','基本的な式の計算を、恒等式や式の除法へ広げる。']);
link('algebra','logic','foundation','不等式の解を集合として表すと、条件と集合の包含が結び付く。');
link('logic','conditional','foundation','事象を集合として捉え、共通部分と条件の意味を明確にする。');
link('number','human','application','整数や記数法は、数を記録・計算する人間の活動と結び付く。');
link('human','counting','application','ゲームや配置の規則を、場合の数として数学化する。');
chain(['shape','similarity','trig-ratio'],'foundation',['相似は形が同じ図形の対応する辺の比を捉える。','相似な直角三角形では辺の比が角度だけで決まる。']);
chain(['pythagorean','trig-ratio','cosine-law','dot'],'generalization',['三平方の定理から単位円上の座標の関係sin²θ+cos²θ=1が得られる。','三角比を使って、直角でない三角形の辺の関係を表す。','|a−b|²を成分で展開すると、余弦定理のcosθの項が内積に対応する。']);
link('shape','pythagorean','foundation','直角三角形の辺に作った正方形の面積を比較する。');
link('pythagorean','circle','geometric-interpretation','原点からの距離がrという条件は、x²+y²=r²になる。');
link('circle','unit-circle','application','円の半径を1に固定すると、三角関数を定義する単位円になる。');
link('trig-ratio','sine-law','generalization','三角比と外接円を使い、一般の三角形の辺と角を結ぶ。');
link('sine-law','measurement','application','正弦定理で、辺と角から未知の長さを測る。');
link('cosine-law','measurement','application','余弦定理で、二辺と挟む角から残りの辺を求める。');
link('measurement','vector','equivalent-view','辺の長さと角度を、ベクトルと内積で計算できる。');
chain(['unit-circle','trig','addition','complex-plane','rotation','de-moivre'],'foundation',['一般角に対する単位円上の座標がcosθとsinθになる。','二つの角度を合成するときの三角関数の関係を調べる。','加法定理によって、極形式の複素数の積で偏角が加わると分かる。','複素数の掛け算を、平面上の回転と拡大縮小で解釈する。','同じ回転をn回繰り返すと、偏角がn倍になる。']);
link('trig','wave','application','三角関数の周期性で、繰り返す振動を表す。');
link('wave','parameter','application','円運動の座標を時間tで表すと、周期運動の媒介変数表示になる。');
chain(['shape','geometry','power'],'foundation',['図形の見た目から、性質の証明へ進む。','相似な三角形から、円と割線の距離の積の等しさを導く。']);
link('power','analytic-geometry','equivalent-view','中心O、半径rの円では方べきがPO²−r²になり、距離の二乗で表せる。');
chain(['coordinate','analytic-geometry','vector','curves','advanced-integral'],'application',['位置を座標で表すことで、直線・円を方程式にできる。','二点の差をベクトルとして表すと、図形の位置関係を計算できる。','方向や位置の関係を、曲線の接線や媒介変数表示にも用いる。','曲線で囲まれた領域の面積を、積分で求める。']);
link('similarity','vector','geometric-interpretation','同じ向きで長さだけが異なるベクトルは、実数倍で表せる。');
link('vector','dot','foundation','ベクトルの成分から内積を定義し、長さと角度を求める。');
link('dot','analytic-geometry','application','内積0という垂直条件を、座標で書いた直線や図形に用いる。');
link('coordinate','complex-plane','equivalent-view','点(x,y)を複素数x+yiとして表す。');
link('vector','complex-plane','equivalent-view','平面ベクトルの加法は、複素数の加法と同じ成分の計算になる。');
chain(['quadratic-equation','quadratic','complete-square','extrema'],'geometric-interpretation',['二次方程式の実数解を、二次関数とx軸の交点として見る。','平方完成で、グラフの頂点が直接読める式に変える。','平方完成した式から、頂点と定義域の端を比較する。']);
link('algebra','quadratic','foundation','二次式の計算を、入力と出力の対応として捉える。');
chain(['quadratic','discriminant','complex','complex-plane'],'generalization',['x軸との交点の数は、二次方程式の判別式で決まる。','D<0でも複素数の範囲では共役な二つの解がある。','複素数を点として配置すると、実部と虚部の位置が見える。']);
link('quadratic','curves','equivalent-view','二次関数のグラフは放物線という平面曲線でもある。');
chain(['function','change','derivative','extrema'],'foundation',['入力の増分に対する出力の増分から平均変化率を計算する。','増分hを0に近づけると、平均変化率から瞬間の変化率へ進む。','導関数の符号で増減を調べ、極値や最大最小を考える。']);
link('quadratic','derivative','application','放物線の傾きを微分で調べると、頂点で傾きが0になる。');
link('derivative','integral','inverse','原始関数を求める不定積分は微分の逆操作。定積分は端点での原始関数の差になる。');
link('integral','derivative','inverse','連続なfに対し、F(x)=∫ₐˣf(t)dtはF′(x)=f(x)を満たす。');
link('area','integral','generalization','長方形の面積の考えを、曲線下の領域に広げる。定積分は符号付き面積。');
chain(['sequence','sigma','limit','advanced-integral','volume'],'limit',['並んだ数の和をΣで表す。','部分和や数列が無限に進んだときの振る舞いを調べる。','分割した長方形の総和の極限が定積分になる。','薄い円板の体積を積分すると回転体の体積になる。']);
link('number','sequence','foundation','数を規則と順番をもつ並びとして捉える。');
link('integral','advanced-integral','generalization','多項式中心の積分から、置換積分・部分積分や体積へ広げる。');
link('limit','advanced-derivative','limit','差商の極限を使って、一般の関数の微分を定義する。');
link('derivative','advanced-derivative','generalization','多項式の微分を、三角・指数・対数関数や合成関数へ広げる。');
link('trig','advanced-derivative','application','ラジアンを使うと、sinの導関数はcosになる。');
link('advanced-derivative','tangent','geometric-interpretation','微分係数を傾きとする接線は、曲線の近くを直線で近似する。');
link('tangent','parameter','application','媒介変数表示の速度ベクトル(dx/dt,dy/dt)は、正則な点で接線方向を表す。');
link('function','exponential','generalization','一定の倍率で増減する対応を、指数関数として表す。');
link('exponential','log','inverse','指数関数の入力と出力を入れ替えると対数関数になる。');
link('log','e','application','底をeとする自然対数の導関数は1/xになり、微積分で特別な役割を持つ。');
link('e','advanced-derivative','foundation','eˣの導関数はeˣとなり、一般の指数関数の微分も表せる。');
link('sequence','exponential','equivalent-view','等比数列は、指数関数を整数の添字で観測したものとして見られる。');
chain(['chance','counting','permutation','combination','pascal','binomial-theorem','binomial','normal','inference'],'foundation',['確率を求めるには、可能な場合と有利な場合を数える。','順序を区別すると順列になる。','同じ選び方をr!通りの順番で数えた重複を除くと組合せになる。','ある要素を含むか含まないかで分けると、組合せの漸化式が生まれる。','パスカルの三角形の各行が二項展開の係数になる。','展開のa,bをp,1−pに置くと、二項分布の確率が現れる。','独立試行でnpとn(1−p)が十分大きいと、二項分布を正規分布で近似できる。','標本平均の分布の正規近似を使って、推定や検定を行う。']);
link('expressions','binomial-theorem','foundation','積の展開に組合せの構造を見いだす。');
chain(['chance','probability','conditional','independent','binomial'],'probabilistic-extension',['事象の和・積・余事象を使って確率を扱う。','追加の情報のもとで、確率を考え直す。','P(A|B)=P(A)となる場合、事象AとBは独立。','独立なベルヌーイ試行の成功数は二項分布に従う。']);
link('probability','distribution','probabilistic-extension','事象の確率から、数値をとる確率変数の分布へ広げる。');
link('distribution','binomial','application','独立な試行の成功数という確率変数の分布を調べる。');
chain(['data','analysis','correlation','inference','society'],'application',['観測値から代表値とばらつきを計算する。','二変量のデータを散布図にし、線形な関連を調べる。','標本の相関を観測する立場から、母集団の関連を推測する立場へ進む。','標本調査や意思決定に、推定と検定を用いる。']);
link('analysis','distribution','probabilistic-extension','手元のデータの平均・分散から、確率モデルの期待値・分散へ発展する。');
link('distribution','inference','foundation','標本統計量の確率分布を使って、推定の不確実性を評価する。');
link('society','sequence','application','人口や金融などの時間変化を、数列のモデルで考える。');
link('geometry','measurement','equivalent-view','図形の性質を、三角比による計量の立場でも捉える。');
chain(['curves','parameter','advanced-derivative'],'equivalent-view',['曲線を方程式だけでなく、動く点の座標x(t),y(t)でも表す。','dy/dx=(dy/dt)/(dx/dt)により、dx/dt≠0の点で接線の傾きを求める。']);
link('complex-plane','representation','equivalent-view','同じ点を座標・ベクトル・複素数という異なる言語で表す。');
link('representation','analytic-geometry','application','適した図や座標表現を選ぶことで、図形の関係を式で調べられる。');
link('circle','sine-law','foundation','外接円の弦と中心角の関係から正弦定理を導く。');
link("number","euclid","application","整数の除法を繰り返して最大公約数を計算する。");
link("human","euclid","application","古代からの計算法が、現代のアルゴリズムへつながる。");
link("euclid","algebra","application","最大公約数を使うと分数の約分と整数比の整理ができる。");
link("sigma","series","generalization","有限和を部分和の数列とみなし、その極限が存在するとき無限級数を定義する。");
link("limit","series","foundation","級数の収束は、部分和の極限によって判定する。");
link("series","riemann","equivalent-view","ともに有限和の極限。ただし区分求積では分割と各項が同時に変わり、固定した数列の級数とは区別する。");
link("sigma","riemann","application","各長方形の面積をΣで足し合わせる。");
link("riemann","integral","limit","連続関数では分割幅を0へ近づけると長方形の和が定積分になる。");
link("riemann","volume","application","面積の和を円板の体積の和へ変えると、回転体の積分公式になる。");
link("log","natural-log","application","対数の底をeに選んだものが自然対数。");
link("e","natural-log","inverse","指数関数e^xと自然対数ln xは逆関数。");
link("natural-log","advanced-derivative","application","(ln x)′=1/x。指数関数と対数関数の変化率が結び付く。");
link("advanced-integral","natural-log","application","正の範囲で1/xの積分は自然対数の差になる。");
link("e","normal","application","正規分布の密度はeの負の二次式乗で表される。密度の導出・全体面積の証明は発展事項。");
link("quadratic","normal","equivalent-view","指数の中に−(x−μ)²/(2σ²)が入り、平方と左右対称性が分布の形を決める。");
link("integral","normal","probabilistic-extension","連続型分布では区間の確率を密度曲線の下の面積で表す。");
link("normal","analysis","application","平均μは中心、標準偏差σは横の広がりに対応する。");
link("curves","conic","generalization","二次方程式で表される曲線を楕円・双曲線・放物線として分類する。");
link("circle","conic","generalization","円は長半径と短半径が等しい楕円。");
link("quadratic","conic","geometric-interpretation","二次関数のグラフは放物線であり、二次曲線の一種。");
link("conic","parameter","equivalent-view","楕円は(a cos t,b sin t)、双曲線は(±a cosh t,b sinh t)でも表せる。双曲線のこの表現は発展。");
link("conic","volume","application","半楕円を長軸の周りに回すと回転楕円体。円板積分で体積を求められる。");
link("similarity","power","foundation","二つの割線が作る三角形の相似から、線分の積の等式が得られる。");
link("quadratic-equation","power","equivalent-view","円の方程式へ直線を代入した二次方程式で、解の積が点の方べきに対応する。");
link("power","tangent","geometric-interpretation","割線の二交点が一致する接線の場合、外部の点PではPT²=PO²−r²。");
link("complex-plane","circle","equivalent-view","|z−z₀|=rは複素数平面上の円。絶対値が距離を表す。");
link("dot","power","equivalent-view","中心Oに対する方べきはベクトルOPの自己内積−r²で表せる。");
export const connections=links;
export const chapters=[
{title:'数学の宇宙',subtitle:'すべての数学は、つながっている',path:['number','expression','shape','function','chance','data'],model:'universe'},
{title:'直角三角形から数学が広がる',subtitle:'長さの関係が、角度と回転の言語になる',path:['pythagorean','trig-ratio','cosine-law','dot','unit-circle','trig','complex-plane','de-moivre'],model:'triangle'},
{title:'図形から解析へ',subtitle:'形を、方程式で語る',path:['similarity','geometry','power','measurement','analytic-geometry','vector','curves','advanced-integral'],model:'power'},
{title:'二次方程式から複素数へ',subtitle:'実数の交点が消えても、解は消えない',path:['quadratic-equation','quadratic','complete-square','extrema','discriminant','complex','complex-plane','rotation'],model:'quadratic'},
{title:'二次関数から微積分へ',subtitle:'二点の傾きから、瞬間の変化へ',path:['quadratic','exponential','log','trig','change','derivative','integral','limit','advanced-derivative'],model:'derivative'},
{title:'積分＝面積',subtitle:'小さな面積の和が、なめらかな領域になる',path:['area','sigma','riemann','integral','advanced-integral','volume'],model:'integral'},
{title:'数列から極限へ',subtitle:'無限に進むことを、点の動きで見る',path:['number','euclid','sequence','sigma','series','limit','riemann','advanced-integral'],model:'sequence'},
{title:'場合の数から二項定理へ',subtitle:'道を数えることと、式の展開は同じ構造',path:['counting','permutation','combination','pascal','binomial-theorem','binomial','normal','inference'],model:'counting'},
{title:'確率から統計へ',subtitle:'偶然のばらつきに、形が現れる',path:['probability','conditional','independent','distribution','binomial','normal','inference'],model:'probability'},
{title:'データの分析から推測へ',subtitle:'手元の標本から、見えない母集団へ',path:['analysis','correlation','distribution','inference','society'],model:'statistics'},
{title:'ベクトルが図形を統一する',subtitle:'角度と長さを、一つの積で表す',path:['trig-ratio','cosine-law','vector','dot','analytic-geometry'],model:'vector'},
{title:'座標・ベクトル・複素数の統合',subtitle:'同じ点。三つの言語。',path:['coordinate','vector','complex-plane','representation','rotation'],model:'coordinate'},
{title:'軌跡・媒介変数・微積分',subtitle:'動く点が、曲線を描く',path:['analytic-geometry','curves','parameter','advanced-derivative','advanced-integral'],model:'curve'},
{title:'すべては、つながっている',subtitle:'数学は、単元ではない。',path:[],model:'universe'}
];
