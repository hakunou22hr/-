import json,subprocess,hashlib,sys
from pathlib import Path
import numpy as np
root=Path(sys.argv[1]);p=root/'infinite-area-30s-reels.mp4'
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_streams','-show_format','-of','json',str(p)]))
v=next(s for s in probe['streams'] if s['codec_type']=='video');a=next(s for s in probe['streams'] if s['codec_type']=='audio')
assert (v['width'],v['height'],v['r_frame_rate'],v['pix_fmt'],v['codec_name'])==(1080,1920,'30/1','yuv420p','h264')
assert int(v['nb_read_frames'])==900 and abs(float(probe['format']['duration'])-30)<.05
assert a['codec_name']=='aac' and a['channels']==2 and abs(float(a['duration'])-30)<.05
data=p.read_bytes();assert data.find(b'moov')<data.find(b'mdat')
subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],check=True)
audio=np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-vn','-f','f32le','pipe:1']),dtype='<f4');assert abs(audio).max()<.98
manifest=dict(edition='infinite-area-reels-v1',file=p.name,width=1080,height=1920,aspect='9:16',fps=30,frames=900,duration=30,video='h264',audio='aac stereo',fullDecode=True,bytes=p.stat().st_size,sha256=hashlib.sha256(data).hexdigest())
(root/'reels-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print(json.dumps(manifest))
