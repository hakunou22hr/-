import json,subprocess,pathlib,math,hashlib,os
from PIL import Image,ImageDraw,ImageFont,ImageChops,ImageStat
root=pathlib.Path(os.environ.get('RIEMANN_OUTPUT','work/riemann')); report={}
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',15)
for name,w,h,duration,count,times in [
('riemann-integral-120s-pc',1920,1080,120,3600,[0,7.5,14.9,15,23.5,31.9,32,41,49.9,50,61,71.9,72,80.5,88.9,89,97,104.9,105,108.5,111.5,113,116,119.9]),
('riemann-integral-30s-instagram',1080,1920,30,900,[0,2,3.9,4,8,11.9,12,16,19.9,20,23,25.9,26,28,29.9])]:
 p=root/(name+'.mp4'); probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_streams','-show_format','-of','json',str(p)]));v=next(s for s in probe['streams'] if s['codec_type']=='video');assert (v['width'],v['height'],v['avg_frame_rate'],v['codec_name'],v['pix_fmt'],int(v['nb_read_frames']))==(w,h,'30/1','h264','yuv420p',count);assert abs(float(probe['format']['duration'])-duration)<.01
 subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],check=True)
 thumbw,thumbh=(480,270) if w>h else (216,384);cols=4 if w>h else 5;rows=math.ceil(len(times)/cols);sheet=Image.new('RGB',(cols*thumbw,rows*(thumbh+30)), '#0b1520');draw=ImageDraw.Draw(sheet)
 for i,t in enumerate(times):
  out=root/f'{name}-verified-{t:.1f}.png';subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(p),'-frames:v','1',str(out)],check=True);img=Image.open(out);img.thumbnail((thumbw,thumbh));x=(i%cols)*thumbw;y=(i//cols)*(thumbh+30);sheet.paste(img,(x,y));draw.text((x+9,y+thumbh+6),f'{t:.1f}s',font=font,fill='#ffda96')
 sheet.save(root/(name+'-contact-sheet.jpg'),quality=90)
 report[name]={'passed':True,'width':w,'height':h,'fps':30,'duration':duration,'frames':count,'codec':'H.264','pixelFormat':'yuv420p','decodedAllFrames':True,'sampleTimes':times,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
(root/'video-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
