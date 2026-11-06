import numpy as np,wave
from pathlib import Path
import sys
audio_root=Path(sys.argv[1]) if len(sys.argv)>1 else Path.cwd()
audio_root.mkdir(parents=True,exist_ok=True)
R=44100

def make(duration,path):
 t=np.arange(R*duration)/R;y=np.zeros(len(t));rng=np.random.default_rng(226)
 chords=[[50,57,60,64],[46,53,57,62],[48,55,60,64],[45,52,57,62]]
 for i in range(int(duration/6)+1):
  st=i*6;u=t-st;m=(u>=0)&(u<8);v=u[m];env=(1-np.exp(-v*1.5))*np.exp(-v/3.8)
  for n in chords[i%4]:
   f=440*2**((n-69)/12);y[m]+=.019*env*(np.sin(2*np.pi*f*v)+.23*np.sin(2*np.pi*f*2.003*v))
  for j,n in enumerate(chords[i%4][1:]):
   p=t-(st+j*.65+.5);m=(p>=0)&(p<3);v=p[m];f=440*2**((n+12-69)/12);y[m]+=.021*np.exp(-v*2.4)*(1-np.exp(-v*60))*np.sin(2*np.pi*f*v)
 intro=12.5 if duration==90 else 4.5
 noise=rng.standard_normal(len(t));soft=np.convolve(noise,np.ones(21)/21,mode='same');y+=soft*.004
 for start,length in [(intro*.1,intro*.13),(intro*.29,intro*.12),(intro*.5,intro*.1)]:
  u=t-start;mask=(u>=0)&(u<length);e=np.sin(np.pi*u[mask]/length)**2;y[mask]+=.024*noise[mask]*e*(.4+.6*np.sin(u[mask]*87)**2)
 st=intro*.58;en=intro;mask=(t>st)&(t<en);u=(t[mask]-st)/(en-st);y[mask]+=.055*soft[mask]*np.sin(np.pi*u)**2+.012*np.sin(2*np.pi*(130+240*u)*t[mask])*np.sin(np.pi*u)**2
 for cue in ([14,26,44,58,75,82] if duration==90 else[5,9,17,23,26]):
  u=t-cue;mask=(u>=0)&(u<3.5);v=u[mask];y[mask]+=.035*np.exp(-v*1.7)*(1-np.exp(-v*60))*(np.sin(2*np.pi*587.33*v)+.35*np.sin(2*np.pi*1174.66*v))
 y*=np.minimum(1,t/.6)*np.minimum(1,(duration-t)/1.4);y=np.tanh(y*1.5)*.65
 # Gentle stereo width, no speech or third-party samples.
 right=np.r_[np.zeros(320),y[:-320]]*.98;stereo=np.column_stack([y,right]);pcm=(np.clip(stereo,-1,1)*32767).astype('<i2')
 with wave.open(str(path),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(R);f.writeframes(pcm.tobytes())
for d in [90,30]:make(d,audio_root/f'ambience-{d}.wav')
