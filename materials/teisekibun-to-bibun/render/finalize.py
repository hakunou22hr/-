"""Copy the verified exports into the library and record media hashes."""
from pathlib import Path
import hashlib,json,subprocess,shutil
root=Path(__file__).resolve().parents[3]
source=Path('/workspace/output/teisekibun-to-bibun')
dest=root/'public/media/teisekibun-to-bibun';dest.mkdir(parents=True,exist_ok=True)
files=[]
for name,n in [('teisekibun_to_bibun_90s.mp4',90),('teisekibun_to_bibun_instagram_30s.mp4',30)]:
 p=source/name;d=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]))
 v=next(x for x in d['streams'] if x['codec_type']=='video');a=next(x for x in d['streams'] if x['codec_type']=='audio')
 assert float(d['format']['duration'])==n and float(v['duration'])==n and float(a['duration'])==n
 assert v['codec_name']=='h264' and v['pix_fmt']=='yuv420p' and a['codec_name']=='aac' and a['channels']==2
 assert int(v['nb_frames'])==n*30
 shutil.copyfile(p,dest/name)
 files.append(dict(file=name,seconds=n,width=v['width'],height=v['height'],frames=int(v['nb_frames']),bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
(root/'materials/teisekibun-to-bibun/media-manifest.json').write_text(json.dumps(dict(files=files),indent=2)+'\n')
print(json.dumps(files))
