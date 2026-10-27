import json,subprocess,sys,hashlib
from pathlib import Path
from PIL import Image,ImageDraw
mode=sys.argv[1];portrait=mode=='portrait';stem='riemann-integral-30s-classroom' if portrait else 'riemann-integral-120s-classroom';duration=30 if portrait else 120;p=Path('public/media')/(stem+'.mp4');out=Path('work/riemann-classroom')
meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_entries','stream=width,height,r_frame_rate,nb_read_frames,codec_name,pix_fmt','-show_entries','format=duration,size','-of','json',str(p)]));v=meta['streams'][0]
assert (v['width'],v['height'])==((1080,1920) if portrait else (1920,1080));assert v['r_frame_rate']=='30/1';assert int(v['nb_read_frames'])==duration*30;assert float(meta['format']['duration'])==duration
subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],check=True)
times=[0,2,3.2,8,16,23,28,29.9] if portrait else [0,4,8,11,14,23,41,59.5,72,80,89,96,104,108,116,119.9];hashes=[];files=[]
for t in times:
 dest=out/f'{mode}-verified-{t}.jpg';subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(p),'-frames:v','1','-q:v','2',str(dest)],check=True);hashes.append(hashlib.sha256(dest.read_bytes()).hexdigest());files.append(dest)
assert len(set(hashes))==len(times)
tileW=270 if portrait else 480;tileH=480 if portrait else 270;cols=4;sheet=Image.new('RGB',(tileW*cols,(tileH+24)*((len(files)+cols-1)//cols)),'#06130e');draw=ImageDraw.Draw(sheet)
for i,(f,t) in enumerate(zip(files,times)):
 sheet.paste(Image.open(f).resize((tileW,tileH)),(i%cols*tileW,i//cols*(tileH+24)));draw.text((i%cols*tileW+9,i//cols*(tileH+24)+tileH+4),f'{t}s',fill='white')
sheet.save(out/f'{mode}-contact-sheet.jpg',quality=87)
report={'passed':True,'fullFrameDecode':True,'metadata':meta,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'distinctSceneSamples':times};(out/f'{mode}-video-validation.json').write_text(json.dumps(report,indent=2)+'\n');print(f'PASS {mode}: {duration*30} frames, full decode, {len(times)} distinct scene samples',flush=True)
