const {createCanvas}=require(process.env.CANVAS_MODULE||'@napi-rs/canvas');
const fs=require('fs'),path=require('path'),vm=require('vm'),schedule=require('./storm.json');
vm.runInThisContext(fs.readFileSync(path.join(__dirname,'../effects-core.js'),'utf8'));
function createStorm(W,H,d,image){return globalThis.MathFilmEffects.create(W,H,createCanvas,image,schedule,d)}
function realAt(t,d){let s=schedule.storyCuts,c=schedule.editions[d],i=s.findIndex((v,j)=>j&&t<v)-1;if(i<0)i=6;return c[i]+(t-s[i])/(s[i+1]-s[i])*(c[i+1]-c[i])}
module.exports={createStorm,realAt};
