// Japanese-style double-bar inequalities: geqq / leqq (≧ / ≦).
export const equations={
 c0:String.raw`x\geqq0`,c1:String.raw`y\geqq0`,c2:String.raw`2x+3y\leqq12`,c3:String.raw`2x+y\leqq8`,
 target:String.raw`x+y=\,?`,sum:String.raw`x+y=k`,line:String.raw`y=-x+k`,slope:String.raw`m=-1`,
 range:String.raw`0\leqq k\leqq5`,max:String.raw`\max(x+y)=5`,min:String.raw`\min(x+y)=0`,
 maxPoint:String.raw`(x,y)=(3,2)`,minPoint:String.raw`(x,y)=(0,0)`,
 evalMax:String.raw`3+2=5`,evalMin:String.raw`0+0=0`,
 ans:String.raw`\boxed{0\leqq x+y\leqq5}`,proof:String.raw`(2x+3y)+(2x+y)\leqq12+8`,proof2:String.raw`4(x+y)\leqq20`,
 b2:String.raw`2x+3y=12`,b3:String.raw`2x+y=8`,general:String.raw`ax+by=k`,
};
