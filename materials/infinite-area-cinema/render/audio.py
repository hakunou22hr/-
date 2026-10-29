from pathlib import Path
import sys
out=Path(sys.argv[1]);out.mkdir(parents=True,exist_ok=True)
import numpy as np,wave
sr=44100;t=np.arange(sr*75)/sr;a=np.zeros(len(t));rng=np.random.default_rng(22)
for freq in [55,82.4069,110,164.8138,220]:a+=.025*np.sin(2*np.pi*freq*t+.6*np.sin(.21*t))*(.7+.3*np.sin(.17*t))
for start in [0,10,18,28,31,34,37,40,43,47,59,67]:
 q=t-start;env=np.exp(-np.maximum(q,0)*3)*(q>=0);a+=.16*env*np.sin(2*np.pi*(48*q+22*(1-np.exp(-np.maximum(q,0)*5))))
for start in [10,28,47,59,67]:a+=.015*np.exp(-((t-start)/1.0)**2)*rng.standard_normal(len(t))
for start,freq in [(47,440),(49,554.365),(51,659.255),(67,440),(67,554.365),(67,659.255)]:
 q=t-start;a+=.035*np.exp(-np.maximum(q,0)/3)*(q>=0)*np.sin(2*np.pi*freq*q)
a=np.tanh(a)*.8*np.minimum(t/2,1)*np.minimum((75-t)/3,1)
with wave.open(str(out/'score.wav'),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes((a*32767).astype('<i2').tobytes())
