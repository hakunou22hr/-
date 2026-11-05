export const parabola=(u,p=1)=>[u*u/(4*p),u];
export const ellipse=(u,a=3,b=1.8)=>[a*Math.cos(u),b*Math.sin(u)];
export const hyperbola=(u,branch=1,a=1.6,b=1)=>[branch*a*Math.cosh(u),b*Math.sinh(u)];
// Cone surface x²+z²=y². The cutting planes deliberately avoid the vertex.
export function section(kind,u){
  if(kind==='ellipse'){const m=.42,d=1.45,y=d/(1-m*Math.cos(u));return[y*Math.cos(u),y,y*Math.sin(u)];}
  if(kind==='parabola'){const d=.9,z=u;return[(z*z-d*d)/(2*d),(z*z+d*d)/(2*d),z];}
  const d=1.15,z=u;return[d,Math.sqrt(d*d+z*z),z];
}
