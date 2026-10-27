"""Original procedural score; no external music or sample license required."""
import numpy as np,wave
from pathlib import Path
p=Path('work/moving-line');p.mkdir(parents=True,exist_ok=True)
rate=48000;duration=90;t=np.arange(duration*rate)/rate;L=np.zeros_like(t);R=np.zeros_like(t)
# Four harmonic spaces, ending on a luminous C major resolution.
for a,b,notes in [(0,30,[55,110,164.81,220]),(30,53,[65.406,130.813,196,261.626]),(53,72,[48.999,97.999,146.832,195.998]),(72,90,[65.406,130.813,196,261.626,329.628])]:
 e=np.clip((t-a)/2,0,1)*np.clip((b+2-t)/2,0,1)
 for j,f in enumerate(notes):
  L+=.036*e*np.sin(2*np.pi*f*t+.04*np.sin(t*.2));R+=.035*e*np.sin(2*np.pi*(f+.06)*t)
# Half-plane arrivals, merge, insight, maximum, minimum and resolution.
for n,c in enumerate([12,16.5,21,25.5,30,40,45,53,72,78,83]):
 d=np.maximum(t-c,0);e=(t>=c)*np.minimum(d/.04,1)*np.exp(-d*2.2)
 for i,f in enumerate([261.626,329.628,392,523.251]):
  tone=.027*e*np.sin(2*np.pi*f*d);L+=tone*(1-i*.12);R+=tone*(.65+i*.1)
 rng=np.random.default_rng(n);noise=rng.standard_normal(t.size);fx=.018*noise*e*np.exp(-d*7);L+=fx;R+=fx
 if c in [30,40,72,78,83]:
  boom=.12*(t>=c)*np.sin(2*np.pi*(44*d+16*d*d))*np.exp(-d*3);L+=boom;R+=boom
for i,c in enumerate(np.arange(40,87,.72)):
 d=np.maximum(t-c,0);e=(t>=c)*np.minimum(d/.015,1)*np.exp(-d*3.5);f=[261.626,329.628,392,523.251,659.255,783.991][i%6];L+=.018*e*np.sin(2*np.pi*f*d);R+=.015*e*np.sin(2*np.pi*(f+.1)*d)
fade=np.clip(t/2,0,1)*np.clip((90-t)/2,0,1);data=np.column_stack([L*fade,R*fade]);peak=np.abs(data).max();assert peak<.95
with wave.open(str(p/'audio-90.wav'),'wb') as o:o.setnchannels(2);o.setsampwidth(2);o.setframerate(rate);o.writeframes((data*32767).astype(np.int16).tobytes())
print('PASS 90-second stereo original score, peak',peak)
