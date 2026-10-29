"""Generate each edition directly in real time; thunder follows visual strikes."""
from pathlib import Path
import sys,json,wave
import numpy as np
out=Path(sys.argv[1]);out.mkdir(parents=True,exist_ok=True)
schedule=json.loads((Path(__file__).parent/'storm.json').read_text())
def real_at(story,duration):
 s=schedule['storyCuts'];c=schedule['editions'][str(duration)]
 i=next((i-1 for i in range(1,len(s)) if story<s[i]),6)
 return c[i]+(story-s[i])/(s[i+1]-s[i])*(c[i+1]-c[i])
for duration in ([int(sys.argv[2])] if len(sys.argv)>2 else [30,120]):
 sr=48000;t=np.arange(sr*duration)/sr;rng=np.random.default_rng(23);a=np.zeros((len(t),2))
 for freq in [55,82.4069,110,164.8138,220]:
  pad=.018*np.sin(2*np.pi*freq*t+.5*np.sin(.2*t))*(.7+.3*np.sin(.3*t))
  a[:,0]+=pad;a[:,1]+=np.roll(pad,67)
 for story in [0,10,18,28,31,34,37,40,43,47,59,67]:
  start=real_at(story,duration);q=t-start;env=np.exp(-np.maximum(q,0)*3)*(q>=0)
  hit=.09*env*np.sin(2*np.pi*(48*q+22*(1-np.exp(-np.maximum(q,0)*5))))
  a[:,0]+=hit;a[:,1]+=hit
 for event in schedule['thunder'][str(duration)]:
  start=event['time']+.22
  n=int(sr*4.8);q=np.arange(n)/sr;raw=rng.standard_normal(n);freq=np.fft.rfftfreq(n,1/sr)
  spectrum=np.fft.rfft(raw);low=np.fft.irfft(spectrum/(1+(freq/150)**2),n=n);low/=max(np.std(low),1e-8)
  crack=raw*.13*np.exp(-q*18)
  roll=low*.15*(1-np.exp(-q*45))*np.exp(-q*.70)*(1+.38*np.sin(q*13)+.16*np.sin(q*29))
  mid=np.fft.irfft(spectrum/(1+(freq/750)**4),n=n);mid/=max(np.std(mid),1e-8)
  body=mid*.035*(1-np.exp(-q*24))*np.exp(-q*1.3)
  sub=.035*np.sin(2*np.pi*(31*q+5*(1-np.exp(-q*3))))*(1-np.exp(-q*35))*np.exp(-q*.9)
  thunder=(roll+crack+body+sub)*event['strength'];offset=int(start*sr);count=min(n,len(t)-offset)
  if count<=0:continue
  pan=event['x'];left=np.sqrt(1-pan*.75);right=np.sqrt(.25+pan*.75)
  a[offset:offset+count,0]+=thunder[:count]*left;a[offset:offset+count,1]+=thunder[:count]*right
  # Reflected rumble returns from the other side of the space.
  echo_offset=offset+int(.28*sr);ec=min(n,len(t)-echo_offset)
  if ec>0:
   a[echo_offset:echo_offset+ec,0]+=thunder[:ec]*right*.32;a[echo_offset:echo_offset+ec,1]+=thunder[:ec]*left*.32
 for story,freq in [(47,440),(49,554.365),(51,659.255),(67,440),(67,554.365),(67,659.255)]:
  q=t-real_at(story,duration);tone=.028*np.exp(-np.maximum(q,0)/3)*(q>=0)*np.sin(2*np.pi*freq*q)
  a[:,0]+=tone;a[:,1]+=tone
 a=np.tanh(a*1.9)*.88*np.minimum(t/.8,1)[:,None]*np.minimum((duration-t)/1.2,1)[:,None]
 with wave.open(str(out/f'score-{duration}.wav'),'wb') as w:
  w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((a*32767).astype('<i2').tobytes())
 print(f'{duration}s stereo score with {len(schedule["thunder"][str(duration)])} synchronized thunder events')
