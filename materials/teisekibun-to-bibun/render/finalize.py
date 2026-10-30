"""Copy the verified exports into the library and record media hashes."""
from pathlib import Path
import hashlib,json,subprocess,shutil,os
root=Path(__file__).resolve().parents[3]
source=Path(os.environ.get('MOVIE_OUTPUT_DIR','/workspace/output/teisekibun-to-bibun'))
dest=root/'public/media/teisekibun-to-bibun';dest.mkdir(parents=True,exist_ok=True)
archive=root/'materials/teisekibun-to-bibun/archive';archive.mkdir(exist_ok=True)
files=[]
for name,n in [('teisekibun_to_bibun_90s.mp4',90),('teisekibun_to_bibun_instagram_30s.mp4',30)]:
 p=source/name;d=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]))
 v=next(x for x in d['streams'] if x['codec_type']=='video');a=next(x for x in d['streams'] if x['codec_type']=='audio')
 assert float(d['format']['duration'])==n and float(v['duration'])==n and float(a['duration'])==n
 assert v['codec_name']=='h264' and v['pix_fmt']=='yuv420p' and a['codec_name']=='aac' and a['channels']==2
 assert int(v['nb_frames'])==n*30
 if n==90:
  original=archive/'teisekibun_to_bibun_90s_fullhd.mp4';shutil.copyfile(p,original)
  files.append(dict(kind='original',file=original.name,seconds=n,width=v['width'],height=v['height'],frames=int(v['nb_frames']),bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
  video=source/'90s-web-video.mp4'
  subprocess.run(['ffmpeg','-v','error','-y','-i',str(p),'-vf','scale=1280:720:flags=lanczos','-an','-c:v','libx264','-preset','fast','-threads','2','-crf','23','-pix_fmt','yuv420p','-t','90',str(video)],check=True)
  subprocess.run(['ffmpeg','-v','error','-y','-i',str(video),'-i',str(p),'-map','0:v','-map','1:a','-c','copy','-t','90','-movflags','+faststart',str(dest/name)],check=True)
 else:shutil.copyfile(p,dest/name)
 p=dest/name;d=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]));v=next(x for x in d['streams'] if x['codec_type']=='video');a=next(x for x in d['streams'] if x['codec_type']=='audio')
 assert float(d['format']['duration'])==n and float(v['duration'])==n and float(a['duration'])==n
 assert int(v['nb_frames'])==n*30
 if n==90:subprocess.run(['ffmpeg','-v','error','-xerror','-i',str(p),'-f','null','-'],check=True)
 files.append(dict(file=name,seconds=n,width=v['width'],height=v['height'],frames=int(v['nb_frames']),bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
(root/'materials/teisekibun-to-bibun/media-manifest.json').write_text(json.dumps(dict(revision='reference-worlds-v3-golden-dust',files=files),indent=2)+'\n')
print(json.dumps(files))
