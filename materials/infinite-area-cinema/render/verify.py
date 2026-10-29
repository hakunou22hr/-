import subprocess,json,hashlib,sys
import numpy as np
from pathlib import Path
root=Path(sys.argv[1]);files=[];schedule=json.loads((Path(__file__).parent/'storm.json').read_text())
for duration in (30,120):
 events=schedule["thunder"][str(duration)]
 assert all(any(i/5<=e["x"]<(i+1)/5 for e in events) for i in range(5))
 assert {e["kind"] for e in events}=={"ground","crawler","sheet"}
 p=root/f'infinite-area-{duration}s.mp4'
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_streams','-show_format','-of','json',str(p)]))
 v=next(s for s in probe['streams'] if s['codec_type']=='video');a=next(s for s in probe['streams'] if s['codec_type']=='audio')
 assert abs(float(probe['format']['duration'])-duration)<.1
 assert (v['width'],v['height'],v['pix_fmt'],v['r_frame_rate'])==(1280,720,'yuv420p','24/1')
 assert int(v['nb_read_frames'])==duration*24
 assert a['codec_name']=='aac'
 assert a['channels']==2
 assert abs(float(a['duration'])-duration)<.05
 data=p.read_bytes();assert data.find(b'moov')<data.find(b'mdat')
 subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],check=True)
 decoded=np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-vn','-f','f32le','-acodec','pcm_f32le','pipe:1']),dtype='<f4');peak=float(np.max(abs(decoded)));assert peak<.98
 files.append(dict(thunderEvents=len(schedule['thunder'][str(duration)]),decodedAudioPeak=peak,file=p.name,duration=duration,width=1280,height=720,fps=24,frames=duration*24,audio='aac',bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
for n in (1,4,16,256):
 actual=sum((2+3*k/n)**2*3/n for k in range(1,n+1));assert abs(actual-(39+31.5/n+4.5/n**2))<1e-10
(root/'media-manifest.json').write_text(json.dumps(dict(edition='infinite-area-cinema-v8',files=files,fullDecode=True,rightEndpointFormulaVerified=True),indent=2)+'\n')
print('Both films: duration, frame count, audio, full decode and mathematics verified')
