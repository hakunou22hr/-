const fs=require('node:fs');
const {spawn}=require('node:child_process');
const {once}=require('node:events');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {createCanvas,GlobalFonts}=require(process.env.CANVAS_MODULE_PATH||'@napi-rs/canvas');
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','FilmSans');
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc','FilmSerif');
const out=path.resolve(process.env.FILM_OUTPUT||path.join(__dirname,'../../public/materials/mean-value-theorem'))+path.sep;
async function video(name,start,end,width,height){
  const canvas=createCanvas(width,height);
  const fps=24;
  const child=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate',String(fps),'-vcodec','mjpeg','-i','-','-an','-c:v','libx264','-threads','4','-preset','fast','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',out+name+'.mp4'],{stdio:['pipe','ignore','inherit']});
  const done=once(child,'exit');
  for(let i=0;i<(end-start)*fps;i++){
    Film.render(canvas,start+i/fps);
    if(!child.stdin.write(canvas.toBuffer('image/jpeg',91)))await once(child.stdin,'drain');
  }
  child.stdin.end();
  if((await done)[0])throw Error('ffmpeg failed');
}
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 await import(pathToFileURL(path.join(__dirname,'model.js')));
 await import(pathToFileURL(path.join(__dirname,'film.js')));
 if(process.argv.includes('full'))return video('mean-value-theorem',0,90,1920,1080);
 const canvas=createCanvas(960,540);
 for(const t of [3,10,20,48,88]){
   Film.render(canvas,t);
   fs.writeFileSync(out+'frame-'+String(t).padStart(2,'0')+'.png',canvas.toBuffer('image/png'));
 }
 await video('preview-classroom',0,12,960,540);
 await video('preview-discovery',43,51,960,540);
})().catch(error=>{console.error(error);process.exitCode=1;});
