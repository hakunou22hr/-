import * as T from 'three';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},lerp=(a,b,t)=>a+(b-a)*t;
const vertex=`varying vec2 vUv; varying vec3 vWorld; void main(){vUv=uv;vec4 p=modelMatrix*vec4(position,1.);vWorld=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}`;
// All light is attached to geometry in world space; there are no background images.
function ringMaterial(color){return new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{clock:{value:0},energy:{value:1},tint:{value:new T.Color(color)},viewport:{value:new T.Vector2(1920,1080)}},vertexShader:vertex,fragmentShader:`varying vec2 vUv;varying vec3 vWorld;uniform float clock,energy;uniform vec3 tint;uniform vec2 viewport;void main(){float sweep=pow(.5+.5*cos(vUv.x*6.28318-clock),18.);float ribs=.45+.55*pow(.5+.5*cos(vUv.x*1005.3),5.);float hot=.18+3.6*sweep;float depth=exp(-max(0.,-vWorld.z)*.025);vec2 p=gl_FragCoord.xy/viewport;p-=vec2(.5,.43);p.x*=viewport.x/viewport.y;float focus=.09+.91*smoothstep(.22,.44,length(p));float title=1.-.65*exp(-pow(abs((p.y-.37)*13.),2.))*exp(-pow(abs(p.x*1.2),6.));gl_FragColor=vec4(tint*hot*energy,depth*(.3+.65*sweep)*ribs*focus*title);}`})}
export class CinematicSpace{
 constructor(scene){
 this.root=new T.Group();scene.add(this.root);this.orbit=new T.Group();this.root.add(this.orbit);this.rings=[];this.floor=new T.Group();this.floor.position.set(0,-3.5,-5);this.root.add(this.floor);
 for(let i=0;i<24;i++){
  const radius=3.8+i*.36,m=ringMaterial(i%4===0?0xffbb45:0x18aaff);
  const ring=new T.Mesh(new T.TorusGeometry(radius,i%4===0?.028:.014,5,200),m);ring.position.z=-3-i*.85;this.orbit.add(ring);this.rings.push(ring);
 }
 // A second, horizontal set of circles makes axial motion readable as parallax.
 for(let i=0;i<15;i++){
  let m=ringMaterial(i%3===0?0xf0b552:0x1b9cde),r=new T.Mesh(new T.TorusGeometry(2+i*.65,.015,4,160),m);r.rotation.x=-Math.PI/2;r.position.y=-i*.018;this.floor.add(r);
 }
 const grid=[],c=new T.Color(0x217dab);for(let i=0;i<72;i++){let a=i*TAU/72;grid.push(2*Math.cos(a),0,2*Math.sin(a),13*Math.cos(a),0,13*Math.sin(a))}let gg=new T.BufferGeometry();gg.setAttribute('position',new T.Float32BufferAttribute(grid,3));this.spokes=new T.LineSegments(gg,new T.LineBasicMaterial({color:c,transparent:true,opacity:.38,blending:T.AdditiveBlending,depthWrite:false}));this.floor.add(this.spokes);
 // Swept ribbons have finite width and thickness in 3D, with luminous travelling pulses.
 this.ribbons=[];for(let j=0;j<7;j++){
  let positions=[],uv=[],indices=[];const count=220;
  for(let i=0;i<=count;i++)for(let side=0;side<2;side++){
   let u=i/count,a=u*TAU*1.4+j*.7,r=4.2+.7*Math.sin(u*TAU*2+j),w=(side-.5)*(.07+(j%3===0?.16:.03));
   positions.push((r+w)*Math.cos(a),(r+w)*Math.sin(a),-2-u*20);uv.push(u,side);
  }
  for(let i=0;i<count;i++){let a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2)}let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);let m=ringMaterial(j%2?0x18baff:0xffbd4d);m.side=T.DoubleSide;let ribbon=new T.Mesh(g,m);this.root.add(ribbon);this.ribbons.push(ribbon);
 }
 const seeds=[],colors=[];for(let i=0;i<4200;i++){let q=(Math.sin(i*127.1+311.7)*43758.5453)%1;q=q<0?q+1:q;seeds.push(i/4200,q,(i*.61803398875)%1);let c=new T.Color(i%4?0x36bfff:0xffc65a);colors.push(c.r,c.g,c.b)}let pg=new T.BufferGeometry();pg.setAttribute('position',new T.Float32BufferAttribute(seeds,3));pg.setAttribute('color',new T.Float32BufferAttribute(colors,3));
 this.particles=new T.Points(pg,new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,vertexColors:true,uniforms:{clock:{value:0},collapse:{value:0},energy:{value:1},birth:{value:0}},vertexShader:`varying vec3 vColor;varying float vAlpha;uniform float clock,collapse,energy,birth;void main(){float lane=position.x,seed=position.y;float a=lane*250.+clock*(.14+seed*.2);float r=(3.5+seed*11.)*(1.-collapse*.93);float travel=fract(position.z+clock*(.025+.03*seed));vec3 p=vec3(cos(a)*r,sin(a)*r,2.-travel*37.);p.y+=sin(clock*.4+lane*30.)*.3;vec4 eye=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*eye;gl_PointSize=clamp((18.+24.*seed)/max(1.,-eye.z),1.,7.);vColor=color*(1.+energy*.7);vAlpha=birth*(.3+seed*.7)*(1.-smoothstep(.88,1.,travel));}`,fragmentShader:`varying vec3 vColor;varying float vAlpha;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;gl_FragColor=vec4(vColor,pow(1.-d,2.)*vAlpha);}`}));this.root.add(this.particles);
 // Long radial photon trails, not a flat star field.
 this.trails=[];for(let j=0;j<110;j++){let a=j*2.39996,r=4+(j%23)*.32,z=-3-(j%17)*1.7;let g=new T.BufferGeometry().setFromPoints([new T.Vector3(Math.cos(a)*r,Math.sin(a)*r,z),new T.Vector3(Math.cos(a)*r*1.04,Math.sin(a)*r*1.04,z+1.1)]);let l=new T.Line(g,new T.LineBasicMaterial({color:j%4?0x168ed3:0xffb94c,transparent:true,opacity:.3,blending:T.AdditiveBlending,depthWrite:false}));this.root.add(l);this.trails.push(l)}
 this.shock=new T.Mesh(new T.TorusGeometry(1,.035,6,220),ringMaterial(0xffce70));this.shock.position.z=-3;this.root.add(this.shock);
 }
 update(t,{theta,grow,fade,viewport}){
 for(const obj of [...this.rings,...this.ribbons,...this.floor.children,this.shock])if(obj.material.uniforms?.viewport)obj.material.uniforms.viewport.value.copy(viewport);
 const birth=smooth(t/5),collapse=smooth((t-59)/5)*(1-smooth((t-67)/5));
 // Every completed unit sends a wave into the architecture; the last fraction uses π exactly.
 const events=[5,11,25,34.6,40,45.4,50.8,64,85,87.5];
 const event=events.filter(x=>x<=t).at(-1),age=event===undefined?10:t-event;
 const pulse=Math.exp(-Math.pow(age/.65,2)),release=smooth((t-64)/3)*(1-smooth((t-69)/3));
 const accent=t>=31&&t<52?[0x37bbff,0x56f5ab,0xffc75e,0xff6478][Math.min(3,Math.floor(theta))]:0xffbb45;
 const activity=.65+grow*.45+pulse*.7+collapse*.6;
 this.root.visible=t>0;this.root.rotation.z=.055*Math.sin(t*.13);
 this.orbit.rotation.x=.12+Math.sin(t*.13)*.32+smooth((t-30)/5)*.4-smooth((t-52)/4)*.4;
 this.orbit.rotation.y=Math.sin(t*.1)*.36;
 this.orbit.position.x=Math.sin(t*.17)*.65;
 this.orbit.position.z=2*Math.sin(t*.23)-collapse*3;
 for(let i=0;i<this.rings.length;i++){
  let r=this.rings[i],wave=Math.sin(t*1.5-i*.43),scale=(.72+.28*grow)*(1-collapse*.52)*(1+.045*wave+pulse*.07);
  r.scale.setScalar(scale);r.rotation.z=t*(i%2?.11:-.08)+theta*(i%2?.3:-.2);r.rotation.x=Math.sin(t*.16+i*.3)*.1;
  if(i%4===0)r.material.uniforms.tint.value.setHex(accent);r.material.uniforms.clock.value=t*(i%2?1.1:-.85)+i*.43+theta*1.4;r.material.uniforms.energy.value=birth*fade*activity*(i%4===0?1.1:.7);
 }
 this.floor.rotation.y=t*.09+theta*.23;this.floor.rotation.z=Math.sin(t*.15)*.12;
 this.floor.position.y=-3.7+Math.sin(t*.25)*.35;this.floor.position.z=-6+Math.sin(t*.18)*2;
 for(let i=0;i<this.floor.children.length;i++){let r=this.floor.children[i];if(r.material.uniforms){r.material.uniforms.clock.value=-t*1.4+i*.6;r.material.uniforms.energy.value=birth*fade*(.5+pulse*.9+release);r.scale.setScalar(1+.06*Math.sin(t*1.8-i*.5))}}
 this.spokes.material.opacity=birth*fade*(.2+pulse*.25);
 for(let j=0;j<this.ribbons.length;j++){let r=this.ribbons[j];r.rotation.z=t*(j%2?.17:-.13)+j*.8+theta*.35;r.rotation.y=Math.sin(t*.17+j)*.1;r.scale.setScalar(1-collapse*.65);r.position.x=Math.sin(t*.21+j)*.4;r.material.uniforms.clock.value=t*2.5+j;r.material.uniforms.energy.value=birth*fade*(.8+pulse*.7+collapse*.5)}
 let u=this.particles.material.uniforms;u.clock.value=t;u.collapse.value=collapse;u.energy.value=activity;u.birth.value=birth*fade;
 for(let j=0;j<this.trails.length;j++){let l=this.trails[j];l.position.z=((t*(2.4+(j%5)*.3)+j*.1)%9)-5;l.rotation.z=t*.06;l.material.opacity=birth*fade*(.18+pulse*.35+collapse*.15)}
 const wave=clamp(age/3.5);this.shock.visible=age<3.5;this.shock.scale.setScalar(2+wave*10+release*5);this.shock.material.uniforms.clock.value=t*2;this.shock.material.uniforms.energy.value=birth*fade*(1-wave)*(pulse+.25+release*2);
 this.state={collapse,pulse,accent,event,orbit:this.orbit.rotation.toArray(),ribbon:this.ribbons[0].rotation.z,particlePhase:t,shockScale:this.shock.scale.x};return this.state;
 }
}
