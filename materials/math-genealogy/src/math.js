export function quadratic(c,a=1,b=0){const d=b*b-4*a*c;if(d>=0)return {d,roots:[{re:(-b-Math.sqrt(d))/(2*a),im:0},{re:(-b+Math.sqrt(d))/(2*a),im:0}]};return {d,roots:[{re:-b/(2*a),im:-Math.sqrt(-d)/(2*Math.abs(a))},{re:-b/(2*a),im:Math.sqrt(-d)/(2*Math.abs(a))}]};}
export const f=x=>x**3/3-x;
export const df=x=>x*x-1;
export const area=x=>x+x**3/12;
export const integrand=x=>1+x*x/4;
export function midpoint(n){let s=0;for(let k=0;k<n;k++)s+=integrand((k+.5)*4/n)*4/n;return s;}
export function choose(n,k){if(k<0||k>n)return 0;let r=1;for(let i=1;i<=k;i++)r=r*(n-i+1)/i;return Math.round(r);}
export function binomial(n,p=.5){return Array.from({length:n+1},(_,k)=>choose(n,k)*p**k*(1-p)**(n-k));}
export function correlation(points){const n=points.length,mx=points.reduce((s,p)=>s+p[0],0)/n,my=points.reduce((s,p)=>s+p[1],0)/n;let xx=0,yy=0,xy=0;for(const [x,y]of points){xx+=(x-mx)**2;yy+=(y-my)**2;xy+=(x-mx)*(y-my);}return xx*yy>0?xy/Math.sqrt(xx*yy):null;}
export function secantCircle(px,py,angle,r=1.6){const dx=Math.cos(angle),dy=Math.sin(angle),b=px*dx+py*dy,disc=b*b-px*px-py*py+r*r;if(disc<0)return null;const a=-b-Math.sqrt(disc),c=-b+Math.sqrt(disc);if(a<0)return null;return {a,c,product:a*c,A:[px+a*dx,py+a*dy],B:[px+c*dx,py+c*dy]};}
export const sampleMean=(points)=>points.reduce((s,x)=>s+x,0)/points.length;
