const {createCanvas,loadImage}=require(process.env.CANVAS_MODULE||'@napi-rs/canvas');
const {createStorm,realAt}=require('./storm.cjs');const fs=require('fs'),path=require('path');
(async()=>{
 const W=1280,H=720,canvas=createCanvas(W,H),ctx=canvas.getContext('2d'),image=await loadImage(path.join(__dirname,'assets/environment.png')),storm=createStorm(W,H,30,image);
 const at=(t,story=22)=>{storm.render(ctx,t,story);return ctx.getImageData(0,0,W,H).data};
 function difference(a,b,x0,y0,x1,y1){let sum=0,n=0;for(let y=y0;y<y1;y+=3)for(let x=x0;x<x1;x+=3)for(let c=0;c<3;c++){sum+=Math.abs(a[(y*W+x)*4+c]-b[(y*W+x)*4+c]);n++}return sum/n}
 const a=at(8),b=at(9),fixedCameraSkyChange=difference(a,b,0,40,1280,450);
 const strike=realAt(28.2,30),before=at(strike-.4,28.2),peak=at(strike+.025,28.2),after=at(strike+1,28.2);
 const cloudFlashChange=difference(before,peak,0,60,400,460),floorWaveChange=difference(peak,after,0,490,1200,680);
 if(fixedCameraSkyChange<5||cloudFlashChange<12||floorWaveChange<3)throw Error('Background lacks independent deformation, illumination or floor animation');
 const results={edition:'infinite-area-cinema-v3',fixedCameraSkyChange,cloudFlashChange,floorWaveChange,flashTimes30s:storm.strikes.map(e=>e.real),thunderDelaySeconds:.22};
 const out=process.env.OUTPUT||'work/infinite-area-v3';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'storm-check.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));
})();
