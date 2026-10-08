// 玉を個体として区別する。色の組合せ10種類は等確率ではない。
export const balls = ['W','W','W','R','R','R','R','B','B','B','B','B'].map((color,id)=>({id,color,label:({W:'白',R:'赤',B:'黒'})[color]+(id+1)}));
export function choose(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);}
export const outcomes=[];for(let a=0;a<12;a++)for(let b=a+1;b<12;b++)for(let c=b+1;c<12;c++)outcomes.push([a,b,c]);
export function types(ids){return new Set(ids.map(id=>balls[id].color)).size;}
export const conditions={same:{name:'3個とも同じ色',count:15,types:1,fraction:[3,44]},different:{name:'3個すべて異なる色',count:60,types:3,fraction:[3,11]},two:{name:'色が2種類',count:145,types:2,fraction:[29,44]}};
export function matches(ids,key){return types(ids)===conditions[key].types;}
export const patterns=[
 {colors:['W','W','W'],formula:'₃C₃',count:1}, {colors:['R','R','R'],formula:'₄C₃',count:4},{colors:['B','B','B'],formula:'₅C₃',count:10},
 {colors:['W','R','B'],formula:'₃C₁ × ₄C₁ × ₅C₁',count:60},
 {colors:['W','W','R'],formula:'₃C₂ × ₄C₁',count:12},{colors:['W','W','B'],formula:'₃C₂ × ₅C₁',count:15},
 {colors:['R','R','W'],formula:'₄C₂ × ₃C₁',count:18},{colors:['R','R','B'],formula:'₄C₂ × ₅C₁',count:30},
 {colors:['B','B','W'],formula:'₅C₂ × ₃C₁',count:30},{colors:['B','B','R'],formula:'₅C₂ × ₄C₁',count:40},
];
export function patternKey(ids){return ids.map(id=>balls[id].color).sort().join('');}
export function sample(random=Math.random){return outcomes[Math.min(outcomes.length-1,Math.floor(random()*outcomes.length))].slice();}
