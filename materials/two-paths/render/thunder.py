"""Deterministic original thunder, matching the storm WebGL cues. No external audio."""
from pathlib import Path
import sys,json,wave,shutil
import numpy as np
root=Path(sys.argv[1]);report=[]
for duration,cuts in [(90,[0,12,20,43,69,82,90]),(30,[0,5,8,15,24,28,30])]:
 path=root/f'audio-{duration}.wav';base=root/f'audio-base-{duration}.wav'
 if not base.exists():shutil.copyfile(path,base)
 with wave.open(str(base),'rb') as f:
  rate=f.getframerate();assert f.getnchannels()==2 and f.getsampwidth()==2
  raw=np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').reshape(-1,2).copy()
 assert len(raw)==duration*rate
 data=raw.astype(np.float64)/32768;fx=np.zeros_like(data);events=[]
 for scene,cues in [(3,[.08,.39,.75]),(4,[.18,.56]),(5,[.16])]:
  for cue in cues:
   flash=cuts[scene]+cue*(cuts[scene+1]-cuts[scene]);onset=flash+.14
   length=2.2 if duration==90 else 1.25;n=int(length*rate);t=np.arange(n)/rate
   rng=np.random.default_rng(int(flash*10000));noise=rng.normal(size=n);freq=np.fft.rfftfreq(n,1/rate)
   shape=np.exp(-(freq/380)**2)*(1-np.exp(-(freq/28)**2));rumble=np.fft.irfft(np.fft.rfft(noise)*shape,n=n);rumble/=max(np.std(rumble),1e-9)
   env=np.minimum(t/.055,1)*np.exp(-t/(.6 if duration==90 else .36))
   signal=(.055*rumble+.035*np.sin(2*np.pi*(52*t-3*t*t)))*env
   start=int(onset*rate);end=min(len(data),start+n);count=end-start
   if count<=0:continue
   fade=np.minimum((len(data)-np.arange(start,end))/(rate*.4),1)
   fx[start:end,0]+=signal[:count]*fade
   fx[start:end,1]+=np.roll(signal,int(rate*.009))[:count]*fade*.92
   events.append({'flash':round(flash,5),'thunder':round(onset,5)})
 mixed=data+fx;peak=float(np.max(np.abs(mixed)));assert peak<.98,'Audio clipping'
 out=np.rint(mixed*32768).astype('<i2');assert np.array_equal(out[:cuts[3]*rate],raw[:cuts[3]*rate])
 with wave.open(str(path),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(rate);f.writeframes(out.tobytes())
 report.append(dict(duration=duration,peak=peak,firstHalfIdentical=True,events=events))
(root/'thunder.json').write_text(json.dumps({'passed':True,'results':report},indent=2)+'\n');print('PASS original thunder, no clipping, unchanged first-half audio')
