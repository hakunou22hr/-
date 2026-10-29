"""Original cinematic score: string harmonics, brass, pulse, timpani and impact FX.
All tones/noise are synthesized here. No voice, samples, third-party music or API.
"""
from pathlib import Path
import numpy as np
from scipy.signal import butter,sosfilt
import wave,json
ROOT=Path('/workspace/work/golden-cinema');ROOT.mkdir(exist_ok=True,parents=True)
SR=48000

def produce(dur):
 short=dur==30; t=np.arange(dur*SR)/SR; n=t.size
 L=np.zeros(n);R=np.zeros(n);rng=np.random.default_rng(8271)
 def add(start,sig,gain=1,pan=0):
  i=int(start*SR);lo=max(i,0);hi=min(i+len(sig),n)
  if hi<=lo:return
  v=sig[lo-i:hi-i]*gain;L[lo:hi]+=v*np.sqrt((1-pan)/2);R[lo:hi]+=v*np.sqrt((1+pan)/2)
 def tone(freq,length,kind='string'):
  u=np.arange(int(length*SR))/SR;v=np.zeros_like(u)
  if kind=='string':
   for det,pan in [(-.002,0),(.0017,0)]:
    for h in range(1,6):v+=np.sin(2*np.pi*freq*(1+det)*h*u+.025*np.sin(u*5.3))/(h**1.7)*.26
  elif kind=='brass':
   for h in range(1,8):v+=np.sin(2*np.pi*freq*h*u)/(h**1.45)*.30
  return v
 beat=.625 # 96 BPM
 # Evolving, swelling minor chords. Lower registers leave captions unhurried.
 chords=[[73.416,87.307,110,146.832],[58.27,73.416,87.307,116.54],[65.406,87.307,97.999,130.813],[55,69.296,82.407,110]]
 block=5.0
 for idx,a in enumerate(np.arange(0,dur,block)):
  chord=chords[idx%4];length=min(block+1.3,dur-a);u=np.arange(int(length*SR))/SR
  env=np.clip(u/1.6,0,1)*np.clip((length-u)/1.3,0,1)
  intensity=.040 if a<(5 if short else 12) else .055
  for j,f in enumerate(chord):add(a,tone(f,length)*env,intensity,[-.65,.4,-.2,.7][j])
  # Slow, warm sub bass with orchestral overtones.
  f=chord[0]/2;sub=np.sin(2*np.pi*f*u)+.22*np.sin(2*np.pi*2*f*u)
  add(a,sub*env,.065)
 # A repeating low string pulse builds momentum; dynamic levels follow acts.
 start=5 if short else 12
 for idx,a in enumerate(np.arange(start,dur-2,beat)):
  length=.56;u=np.arange(int(length*SR))/SR;chord=chords[int(a/block)%4]
  f=chord[[0,2,1,2,0,3,2,1][idx%8]]*2
  env=(1-np.exp(-u*60))*np.exp(-u*7)
  lev=.022*(.7+.3*np.sin(a*.1))
  if (18<a<22 if short else 58<a<74):lev*=1.5
  add(a,tone(f,length)*env,lev,(-.5 if idx%2 else .5))
 # Low timpani, noise transients, and measured, non-verbal orchestral booms.
 for idx,a in enumerate(np.arange(start,dur-2,beat*4)):
  u=np.arange(int(1.5*SR))/SR;f=43 if idx%2 else 52
  drum=np.sin(2*np.pi*(f*u+26*(1-np.exp(-u*12))/12))*np.exp(-u*5)
  add(a,drum,.15)
 cues=[5,12,18,22,25] if short else [3,12,24,42,48,58,74,86]
 for idx,a in enumerate(cues):
  length=min(4,dur-a);u=np.arange(int(length*SR))/SR
  boom=(np.sin(2*np.pi*36*u)+.3*np.sin(2*np.pi*72*u))*np.exp(-u*1.6)
  noise=sosfilt(butter(2,1600,fs=SR,output='sos'),rng.standard_normal(len(u)))*np.exp(-u*3)
  add(a,boom,.19);add(a,noise,.09,idx%2*.5-.25)
  # Bell-like high transient that coincides with light ripples.
  bell=sum(np.sin(2*np.pi*f*u)*np.exp(-u*(1.8+j*.5))/(j+1) for j,f in enumerate([587.33,880,1174.66]))
  add(a,bell,.025,.3)
 # Brass release at minimum and maximum. The final limit is the strongest chord.
 for a in ([12,22] if short else [48,74]):
  length=min(4.8,dur-a);u=np.arange(int(length*SR))/SR
  env=(1-np.exp(-u*9))*np.exp(-u*.8)
  for j,f in enumerate([146.832,174.614,220,293.665]):add(a,tone(f,length,'brass')*env,.045 if j<3 else .027,[-.4,.4,-.2,.2][j])
 # Reverse swells stop just before the contact: audible space gives impact weight.
 for at in ([12,22] if short else [48,74]):
  a=at-2.2;u=np.arange(int(2.2*SR))/SR
  swell=sosfilt(butter(2,[250,2500],btype='bandpass',fs=SR,output='sos'),rng.standard_normal(len(u)))
  add(a,swell*(u/2.2)**3,.13)
 # Stereo early reflections: generated room, no reverb sample.
 dryL=L.copy();dryR=R.copy()
 for delay,gain in [(.071,.15),(.137,.11),(.241,.08),(.389,.06),(.613,.04)]:
  k=int(delay*SR);L[k:]+=dryR[:-k]*gain;R[k:]+=dryL[:-k]*gain
 fade=np.minimum(t/.8,1)*np.minimum((dur-t)/1.5,1)
 L*=fade;R*=fade
 # Create a short breath before maximum, then an uncompressed harmonic release.
 at=22 if short else 74
 mask=(t>at-.45)&(t<at-.03);L[mask]*=.32;R[mask]*=.32
 data=np.stack([L,R],axis=1);peak=np.abs(data).max();data*=.86/max(peak,1e-9)
 path=ROOT/f'audio-{dur}.wav'
 with wave.open(str(path),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((data*32767).astype('<i2').tobytes())
 (ROOT/f'audio-{dur}.json').write_text(json.dumps({'duration':dur,'sampleRate':SR,'channels':2,'peak':float(np.abs(data).max()),'cues':cues,'original':True},indent=2))
 print('SCORE',dur,'seconds, stereo 48kHz, peak',float(np.abs(data).max()),flush=True)
produce(30);produce(90)
