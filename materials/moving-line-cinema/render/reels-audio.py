"""Original 30-second edit of the procedural musical design; stereo 48 kHz."""
from pathlib import Path
import numpy as np,wave,json
p=Path('work/moving-line-reels');p.mkdir(parents=True,exist_ok=True)
rate=48000;t=np.arange(30*rate)/rate;L=np.zeros_like(t);R=np.zeros_like(t)
for a,b,notes in [(0,9,[55,110,164.81,220]),(9,14,[65.406,130.813,196,261.626]),(14,21,[48.999,97.999,146.832,195.998]),(21,30,[65.406,130.813,196,261.626,329.628])]:
 e=np.clip((t-a)/.8,0,1)*np.clip((b+.8-t)/.8,0,1)
 for f in notes:L+=.036*e*np.sin(2*np.pi*f*t+.04*np.sin(t*.2));R+=.035*e*np.sin(2*np.pi*(f+.08)*t)
cues=[3,4.5,6,7.5,8,9,10.5,14,21,24.5,27]
for n,c in enumerate(cues):
 d=np.maximum(t-c,0);e=(t>=c)*np.minimum(d/.035,1)*np.exp(-d*3)
 for i,f in enumerate([261.626,329.628,392,523.251]):
  tone=.028*e*np.sin(2*np.pi*f*d);L+=tone*(1-i*.12);R+=tone*(.65+i*.1)
 noise=np.random.default_rng(n).standard_normal(t.size);fx=.018*noise*e*np.exp(-d*7);L+=fx;R+=fx
 if c in [8,9,21,24.5,27]:
  boom=.12*(t>=c)*np.sin(2*np.pi*(44*d+16*d*d))*np.exp(-d*3.5);L+=boom;R+=boom
for i,c in enumerate(np.arange(9,29,.5)):
 d=np.maximum(t-c,0);e=(t>=c)*np.minimum(d/.015,1)*np.exp(-d*4);f=[261.626,329.628,392,523.251,659.255,783.991][i%6];L+=.018*e*np.sin(2*np.pi*f*d);R+=.015*e*np.sin(2*np.pi*(f+.1)*d)
fade=np.clip(t/.7,0,1)*np.clip((30-t)/.9,0,1);data=np.column_stack([L*fade,R*fade]);peak=float(np.abs(data).max());assert peak<.95
with wave.open(str(p/'audio-30.wav'),'wb') as o:o.setnchannels(2);o.setsampwidth(2);o.setframerate(rate);o.writeframes((data*32767).astype(np.int16).tobytes())
(p/'audio.json').write_text(json.dumps({'passed':True,'duration':30,'sampleRate':rate,'channels':2,'peak':peak,'cues':cues},indent=2)+'\n');print('PASS stereo 30s score, peak',peak)
