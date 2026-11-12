// 座標は描画とは独立した実数値。tan は x=0 で定義されない。
export const problems = [
 {equation:'cosθ = 0',r:2,rLabel:'2',kind:'cos',a:0,solutions:[90],steps:['cosθ = 0','x = r cosθ = 2 × 0','x = 0'],line:'x = 0',thought:'cos は横の座標と半径の比。横の座標が 0 になる場所を探そう。',notice:'上半円と y 軸の交点は1つ。下側の交点は範囲外。',question:'半径を変えても、x = 0 となる角度は変わる？',extension:'cosθ = −1/2 なら、線は円の左右どちらを通る？'},
 {equation:'√2 sinθ = 1',r:Math.SQRT2,rLabel:'√2',kind:'sin',a:1/Math.SQRT2,solutions:[45,135],steps:['sinθ = 1/√2','r = √2 を選ぶ','y = √2 × 1/√2 = 1'],line:'y = 1',thought:'sin は縦の座標と半径の比。係数 √2 を半径にすると、縦の座標がそのまま 1 になる。',notice:'同じ高さに2つの交点。x は 1 と −1、y はどちらも 1。',question:'なぜ半径を √2 にする？ なぜ2つの解がある？',extension:'r = 2 に変えると線は y = √2。角度は変わるだろうか？'},
 {equation:'tanθ + 1 = 0',r:Math.SQRT2,rLabel:'√2',kind:'tan',a:-1,solutions:[135],steps:['tanθ = −1','y/x = −1（x ≠ 0）','y = −x、上半円では x < 0'],line:'y = −x',thought:'tan は y と x の比。第2象限では y > 0、x < 0 なので負になる。',notice:'原点から左上に進む半直線の傾きは −1。交点 (−1, 1) では y/x = −1。',question:'傾きが負なのに、点が左上にあるのはなぜ？',extension:'90°では x = 0。tan が定義されない理由を図で説明しよう。'},
 {equation:'2 sin(180° − θ) = 1',r:2,rLabel:'2',kind:'sin',a:.5,solutions:[30,150],steps:['φ = 180° − θ → sinφ = 1/2','0° ≤ φ ≤ 180° → φ = 30°, 150°','θ = 180° − φ → θ = 150°, 30°'],line:'y = 1',thought:'補角の点 Q は P と y 軸について対称。高さが等しいので sin(180° − θ) = sinθ。',notice:'φ = 30° なら θ = 150°、φ = 150° なら θ = 30°。最終的な θ は 30°, 150°。',question:'P と補角の点 Q は、どの座標が同じ？',extension:'cos(180° − θ) と cosθ の符号を、対称な点から考えよう。'},
 {equation:'sinθ = 1',r:1,rLabel:'1',kind:'sin',a:1,solutions:[90],steps:['sinθ = y/r = 1','r = 1 を選ぶ','y = 1'],line:'y = 1',thought:'sin は縦の座標と半径の比。高さが半径と等しくなる点を探そう。',notice:'直線は円の最上部で接するので、交点は1つだけ。解は θ = 90°。',question:'sinθ = 1/2 では2つあった交点が、1ではなぜ1つになる？',extension:'sinθ の値が1より大きいと、円と直線は交わるだろうか？'},
 {equation:'cosθ = −√2/2',r:Math.SQRT2,rLabel:'√2',kind:'cos',a:-Math.SQRT1_2,solutions:[135],steps:['cosθ = −√2/2','r = √2 を選ぶ','x = √2 × (−√2/2) = −1'],line:'x = −1',thought:'cos は横の座標と半径の比。半径を √2 にすると、条件は x = −1 になる。',notice:'上半円で x が負になるのは第2象限。交点 (−1, 1) の角度は135°。',question:'cosθ が負のとき、交点は y 軸のどちら側にある？',extension:'cosθ = √2/2 の交点と比べ、角度の関係を考えよう。'},
 {equation:'tanθ = 0',r:2,rLabel:'2',kind:'tan',a:0,solutions:[0,180],steps:['tanθ = y/x = 0（x ≠ 0）','y = 0','0° ≦ θ ≦ 180° → θ = 0°, 180°'],line:'y = 0',thought:'tan は y と x の比。x が0でないとき、比が0になる条件は y = 0。',notice:'円と x 軸は両端で交わる。範囲に0°と180°を含むので、どちらも解。',question:'0°と180°では x の符号が異なるのに、なぜ tanθ は同じ0になる？',extension:'90°では x = 0 なので tanθ は定義されない。0°との違いを説明しよう。'}

];
export function values(theta,r){const t=theta*Math.PI/180;const sin=Math.sin(t),cos=Math.cos(t);return {sin,cos,tan:Math.abs(cos)<1e-10?null:sin/cos,x:r*cos,y:r*sin};}
export function satisfies(index,theta){const p=problems[index],v=values(theta,1);return v[p.kind]!==null&&Math.abs(v[p.kind]-p.a)<1e-8;}

// 描画上の点（Pの半径7px、交点の半径6px）が触れる距離で発光を始める。
// 方程式の厳密な解判定とは分離し、近い角度を解そのものとは扱わない。
export function collisionSolution(index,theta,r){
 const p=values(theta,r);
 return problems[index].solutions.find(angle=>{const q=values(angle,r);return Math.hypot(p.x-q.x,p.y-q.y)*82<=13;});
}
