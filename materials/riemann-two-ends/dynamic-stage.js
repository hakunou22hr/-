// Stage choreography: all large motions are derived from the lesson clock.
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),fract=x=>x-Math.floor(x);
export function choreography(q){const divisions=q.s===3?3:4,beat=fract(q.p*divisions),pulse=Math.exp(-beat*7),envelope=Math.sin(Math.PI*q.p)**2;return{beat,pulse,envelope,speed:q.s===3?5+q.p*15:q.s===1||q.s===2?3+Math.log2(q.n)*.8:3,contraction:q.s===3?1-clamp((q.p-.15)/.72):1}}
export function createDynamicStage(W,H){
 function stroke(g,project,pts,color,width=2,alpha=1){g.beginPath();let active=false;for(const p of pts){const v=project(...p);if(!Number.isFinite(v[0])||!Number.isFinite(v[1])||Math.abs(v[0])>W*7||Math.abs(v[1])>H*7){active=false;continue}if(active)g.lineTo(v[0],v[1]);else{g.moveTo(v[0],v[1]);active=true}}g.strokeStyle=color;g.lineWidth=width;g.globalAlpha=alpha;g.stroke()}
 function ribbon(g,project,pts,color,width=2,alpha=1){stroke(g,project,pts,color,width*7,.035*alpha);stroke(g,project,pts,color,width*3,.14*alpha);stroke(g,project,pts,color,width,alpha)}
 function floorWave(g,project,q,color,phase,alpha=1){const r=.5+phase*20,pts=[];for(let j=0;j<=100;j++){let a=j/100*TAU;pts.push([Math.cos(a)*r*.65,-3.12,-8+Math.sin(a)*r*.55])}ribbon(g,project,pts,color,3.5,(1-phase)*alpha)}
 return{render(g,q,project){const c=choreography(q),t=q.t,left=q.s===2,color=left?'#b68bff':'#ffd47d';g.save();g.globalCompositeOperation='screen';
  // An illuminated corridor races towards the viewer; its architecture changes by scene.
  if(q.s!==4){
   const turn=q.s===2?Math.sin(t*.7)*.34:Math.sin(t*.4)*.13;
   for(let k=0;k<12;k++){
    const depth=fract(k/12+t*c.speed*.018),z=-36+depth*34,rx=5.8+Math.sin(t*.7+k*.38)*.6,ry=4.8,pts=[];
    for(let j=0;j<=40;j++){const a=j/40*TAU+turn,x=Math.cos(a)*rx,y=Math.sin(a)*ry+.1;pts.push([x,y,z])}
    const col=q.s===3?(k%2?'#d6a1ff':'#ffda8c'):q.s===2?'#bd9aff':k%3===0?'#ffe8b4':'#78cfff';
    ribbon(g,project,pts,col,depth>0.7?2.5:1.2,.10+depth*.48);
   }
   // Perspective floor tiles, moving rails and tall side pylons create measurable parallax.
   for(let lane=-3;lane<=3;lane++){
    const x=lane*2.2,pts=[];for(let j=0;j<=48;j++){const z=-34+j*34/48;pts.push([x+.18*Math.sin(z*.3+t*1.5),-3.1,z])}ribbon(g,project,pts,lane%2?'#7cbfff':color,1.3,.4);
    for(let k=0;k<12;k++){const z=-34+fract(k/12+t*c.speed*.023)*34,alpha=.15+.45*(z+34)/34;const corners=[[x-.72,-3.08,z],[x+.72,-3.08,z],[x+.72,-3.08,z-1.2],[x-.72,-3.08,z-1.2]].map(v=>project(...v));g.beginPath();corners.forEach((v,i)=>i?g.lineTo(v[0],v[1]):g.moveTo(v[0],v[1]));g.closePath();g.fillStyle=q.s===2?'#3774ff':q.s===1?'#d9a13c':'#9676e8';g.globalAlpha=alpha*.38;g.fill();stroke(g,project,[[x-.72,-3.08,z],[x+.72,-3.08,z],[x+.72,-3.08,z-1.2],[x-.72,-3.08,z-1.2],[x-.72,-3.08,z]],color,1.6,alpha)}
   }
   for(let side of[-1,1])for(let k=0;k<9;k++){const z=-32+fract(k/9+t*c.speed*.013)*31,x=side*(6.7+.5*Math.sin(k+t*.5)),height=3+2.4*Math.sin(k*.9+t*1.3)**2;
    const face=[[x-.24,-3,z],[x+.24,-3,z],[x+.24,-3+height,z],[x-.24,-3+height,z]].map(v=>project(...v));g.beginPath();face.forEach((v,i)=>i?g.lineTo(v[0],v[1]):g.moveTo(v[0],v[1]));g.closePath();g.fillStyle=q.s===3?(side<0?'#ffd689':'#c292ff'):color;g.globalAlpha=.12+.12*c.pulse;g.fill();ribbon(g,project,[[x,-3,z],[x,-3+height,z]],q.s===3?(side<0?'#ffcc66':'#b98cff'):color,3,.25+.35*c.pulse);
    stroke(g,project,[[x-.12,-3,z],[x+.12,-3,z],[x+.12,-3+height,z],[x-.12,-3+height,z],[x-.12,-3,z]],color,1,.28);
   }
  }
  // A travelling overhead helix bends, twists and sweeps through depth, not just around the screen.
  if(q.s===1||q.s===2){for(let strand=0;strand<3;strand++){const pts=[];for(let j=0;j<=150;j++){const z=-29+j*.2,a=z*.38-t*(left?1.7:1.1)+strand*TAU/3,r=5.1+.55*Math.sin(z*.2+t);pts.push([Math.cos(a)*r,2.5+Math.sin(a)*2.3,z])}ribbon(g,project,pts,strand===0?'#f4f5ff':left?'#a878ff':'#ffcf72',strand===0?3.3:2.2,.65)}
   floorWave(g,project,q,color,c.beat,.9);
   // Each subdivision triggers a rising curtain and an expanding floor shockwave.
   const sweep=-6+c.beat*12,curtain=[];for(let j=0;j<=40;j++){let z=-22+j*.5;curtain.push([sweep,-3+(3+Math.sin(z*.2+t))*c.pulse,z])}ribbon(g,project,curtain,color,4,c.pulse*.75);
  }
  // Convergence: gold and violet streams accelerate inward and collapse to one bright centre.
  if(q.s===3){
   for(let side of[-1,1])for(let strand=0;strand<18;strand++){
    const pts=[];for(let j=0;j<=45;j++){const u=j/45,twist=t*(1.4+q.p*3)+strand*.41+u*7,r=(1-u)*(3.2+strand*.045)*c.contraction+.10,x=side*(1-u)*11*c.contraction+Math.sin(twist)*r*.36,y=.1+Math.cos(twist)*r*.7,z=-3-u*18;pts.push([x,y,z])}ribbon(g,project,pts,side<0?'#ffd782':'#bd8fff',1.5,.52);
   }
   for(let k=0;k<7;k++){const r=(1.2+k*1.05)*(c.contraction+.07),pts=[];for(let j=0;j<=80;j++){let a=j/80*TAU+t*(k%2?1:-1)*.9;pts.push([Math.cos(a)*r,Math.sin(a)*r*.7+.25,-7-k*.4])}ribbon(g,project,pts,k%2?'#bd8fff':'#ffd782',2.2,.6)}
   const core=project(0,.25,-10);for(let i=0;i<72;i++){let a=i/72*TAU+t*.2,r=(.08+fract(i*.618+t*.9))*Math.min(W,H)*.8,inner=r*.22,fade=clamp((q.p-.42)*3)*(.3+.7*Math.sin(Math.PI*q.p)**2);g.beginPath();g.moveTo(core[0]+Math.cos(a)*inner,core[1]+Math.sin(a)*inner*.55);g.lineTo(core[0]+Math.cos(a)*r,core[1]+Math.sin(a)*r*.55);g.strokeStyle=i%2?'#cfaaff':'#ffe1a0';g.globalAlpha=fade*.34;g.lineWidth=i%5===0?2:1;g.stroke()}
   floorWave(g,project,q,'#ffe6b2',fract(q.p*3),1.15);
  }
  // Opening and ending: a 3D galaxy of points rises from the floor and winds around the area.
  if(q.s===0||q.s===4){const energy=q.s===0?clamp(q.p*3):1;for(let arm=0;arm<4;arm++){const pts=[];for(let j=0;j<=150;j++){const u=j/150,a=u*TAU*1.65+t*.8+arm*TAU/4,r=1.0+u*10;pts.push([Math.cos(a)*r,-2.8+u*6+Math.sin(a)*.65,-7+Math.sin(a)*r*.55])}ribbon(g,project,pts,arm%2?'#7acfff':'#ffe1a0',2.1,energy*.58)}
   floorWave(g,project,q,'#8fdfff',fract(t*.34),.65);
   if(q.s===4){const calc=q.p<.32?q.p/.32:q.p<.65?(q.p-.32)/.33:(q.p-.65)/.35;floorWave(g,project,q,'#ffe1a0',clamp(calc*1.8),1)}
  }
  g.restore();return c;
 }}
}
