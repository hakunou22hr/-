// 球半径0.29に対し中心間隔0.68以上を保ち、取り出し中の合体を防ぐ。
export const MIN_SEPARATION = .68;
export function extractionPositions(homes,t,right=[1,0,0]) {
 const u=Math.max(0,Math.min(1,t));
 const points=homes.map((home,j)=>{
  const lane=(j-1)*.8;
  const mouth=[lane*right[0],3.6,lane*right[2]];
  if(u<=.52){const p=u/.52,q=p*p*(3-2*p);return home.map((v,k)=>v+(mouth[k]-v)*q);}
  const p=(u-.52)/.48,q=1-(1-p)**3;
  return [mouth[0]+((j-1)*1.1-mouth[0])*q,3.6-.35*q,mouth[2]+(1.8-mouth[2])*q];
 });
 // 中間経路で交差しても、3球を一緒に補正して接触させない。
 for(let pass=0;pass<16;pass++)for(let a=0;a<points.length;a++)for(let b=a+1;b<points.length;b++){
  let delta=points[b].map((v,k)=>v-points[a][k]),distance=Math.hypot(...delta);
  if(distance>=MIN_SEPARATION)continue;
  if(distance<1e-8){delta=[right[0],0,right[2]];distance=1;}
  const offset=(MIN_SEPARATION-Math.hypot(...points[b].map((v,k)=>v-points[a][k])))/2;
  for(let k=0;k<3;k++){const move=delta[k]/distance*offset;points[a][k]-=move;points[b][k]+=move;}
 }
 return points;
}
