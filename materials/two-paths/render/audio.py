"""Original synthesis adapted from trig-integral-cinema/src/utils/shortAudio.ts.
Same drone frequencies and split/merge/gold cue design; new score and edit cues.
"""
import numpy as np,wave,sys
from pathlib import Path
root=Path(sys.argv[1]);root.mkdir(parents=True,exist_ok=True)
for duration,cuts in [(90,[0,12,20,25.52,30.12,34.95,39.09,43,49,57.3,62.5,69,76.15,82]),(30,[0,5,8,9.68,11.08,12.55,13.81,15,17.07,19.95,21.75,24,26.2,28])]:
 rate=48000;t=np.arange(duration*rate)/rate
 left=np.zeros_like(t);right=np.zeros_like(t)
 # evolving A-minor / F / C / G harmonic bed, rather than a repeated loop
 for k,freqs in enumerate([[55,82.4069,110.15,164.8138],[43.6535,65.406,87.307,130.813],[65.406,98,130.813,196],[48.999,73.416,98,146.832]]):
  a=duration*k/4;b=duration*(k+1)/4
  env=np.clip((t-a)/1.4,0,1)*np.clip((b+1.4-t)/1.4,0,1)
  for j,f in enumerate(freqs):
   tone=.042*env*np.sin(2*np.pi*f*t+.003*np.sin(t*.3))
   left+=tone;right+=.97*.042*env*np.sin(2*np.pi*(f+.08)*t)
 for c in cuts[1:]+([62.5] if duration==90 else [21.75]):
  dt=t-c;mask=dt>=0;d=np.maximum(dt,0)
  # split transient and rising merge, deterministic sound-effects
  rng=np.random.default_rng(int(c*99));noise=rng.standard_normal(len(t))
  fx=mask*(.026*noise*np.exp(-d*14)+.06*np.sin(2*np.pi*(95*d+110*d*d))*np.exp(-d*2.5))
  left+=fx;right+=fx
  for i,n in enumerate([0,4,7,12]):
   f=440*2**(n/12);env=mask*np.minimum(d/.06,1)*np.exp(-d/(1.3 if c==cuts[-1] else .65))
   tone=.026*np.sin(2*np.pi*f*d)*env
   left+=tone*(1-i*.12);right+=tone*(.64+i*.12)
 # A rising whoosh and sub impact meet at the term collision (u = .74).
 impact=62.5 if duration==90 else 21.75
 d=t-impact
 envelope=(d>=0)*np.exp(-np.maximum(d,0)*4)
 boom=.16*np.sin(2*np.pi*(45*d+18*np.maximum(d,0)**.4))*envelope
 left+=boom;right+=boom*.95
 rise=np.clip((d+1.2)/1.2,0,1)*(d<0)
 sweep=.035*rise**2*np.sin(2*np.pi*(460*t+130*t*t))
 left+=sweep;right+=sweep*.8
 # gently accelerating arpeggio, resolves at climax
 for i,start in enumerate(np.arange(duration*.24,duration-.6,.63)):
  d=np.maximum(0,t-start);env=(t>=start)*np.minimum(d/.02,1)*np.exp(-d*3.4)
  f=[220,261.626,329.628,440,523.251,659.255][i%6]
  tone=.023*np.sin(2*np.pi*f*d)*env
  left+=tone;right+=tone*.8
 fade=np.clip(t/1.8,0,1)*np.clip((duration-t)/1.3,0,1)
 data=np.column_stack([left*fade,right*fade]);data=np.int16(np.clip(data,-.94,.94)*32767)
 with wave.open(str(root/f'audio-{duration}.wav'),'wb') as out:
  out.setnchannels(2);out.setsampwidth(2);out.setframerate(rate);out.writeframes(data.tobytes())
 print(duration,'peak',abs(data.astype(float)).max()/32767)
