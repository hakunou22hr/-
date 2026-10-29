const {createCanvas,loadImage}=require(process.env.CANVAS_MODULE||'@napi-rs/canvas');
const {createStorm}=require('./storm.cjs');const fs=require('fs'),path=require('path');
(async()=>{
 const W=1280,H=720,canvas=createCanvas(W,H),ctx=canvas.getContext('2d'),image=await loadImage(path.join(__dirname,'assets/environment.png')),engine=createStorm(W,H,30,image);
 const at=t=>{engine.render(ctx,t,22,{automatic:false});return ctx.getImageData(0,0,W,H).data};
 const diff=(a,b)=>{let sum=0,n=0,changed=0;for(let i=0;i<a.length;i+=16)for(let k=0;k<3;k++){let d=Math.abs(a[i+k]-b[i+k]);sum+=d;n++;if(d>25)changed++}return {mean:sum/n,changed}};
 const checks={};for(const type of ['gather','vortex','wave']){engine.reset();let when=10.15,baseline=at(when);engine.trigger(type,9,.75,.45);let activated=at(when);checks[type]=diff(baseline,activated);if(checks[type].mean<.15||checks[type].changed<100)throw Error('Input does not change pixels: '+type);engine.reset();let reset=diff(baseline,at(when));if(reset.mean>.01)throw Error('Reset leaves a residual effect')}
 const results={edition:'infinite-area-cinema-v5',inputCausesPixelChanges:checks,resetRestoresBaseline:true,skyImageWarping:false};const out=process.env.OUTPUT||'work/infinite-area-v5';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'storm-check.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));
})();
