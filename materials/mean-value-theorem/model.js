(function(root){
  const E={glow:4,entry:10,points:13,secant:16,measure:21,move:27,approach:43,match:48,ripple:48,compute:57,corner:73,return:84};
  const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
  const mix=(a,b,t)=>a+(b-a)*t;
  function model(kind,c){
    const abs=kind==='abs', a=abs?-1:0,b=abs?1:2;
    const f=abs?Math.abs:x=>x*x;
    const sec=(f(b)-f(a))/(b-a);
    const slope=abs?(c===0?null:Math.sign(c)):2*c;
    return {kind,a,b,c,f,sec,slope,tangent:x=>slope===null?null:f(c)+slope*(x-c),
      exact:c>a&&c<b&&sec===slope,near:slope!==null&&Math.abs(sec-slope)<=0.04+Number.EPSILON};
  }
  function timeline(t){
    let c=.25,kind='square';
    if(t>=E.move&&t<E.approach)c=.25+1.46*(.5-.5*Math.cos((t-E.move)/16*3*Math.PI));
    if(t>=E.approach)c=mix(1.71,1,ease((t-E.approach)/(E.match-E.approach)));
    if(t>=E.corner&&t<E.return){kind='abs';c=t>=78.5&&t<=79.5?0:t<78.5?mix(-.8,0,ease((t-74)/4.5)):mix(0,.8,ease((t-79.5)/3));}
    return model(kind,c);
  }
  root.MVT={E,clamp,ease,mix,model,timeline};
})(globalThis);
