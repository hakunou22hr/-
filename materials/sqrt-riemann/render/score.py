import numpy as np,wave,sys
from pathlib import Path
root=Path(sys.argv[2]) if len(sys.argv)>2 else Path('public/media/sqrt-riemann');sr=48000
for dur,cuts in [(90,[10,24,40,45,50,55,68,80]),(30,[4,6.5,10,12.7,15.4,18,24])]:
 if len(sys.argv)>1 and dur!=int(sys.argv[1]):continue
 t=np.arange(dur*sr)/sr;left=np.zeros(len(t));right=left.copy();rng=np.random.default_rng(248)
 chords=[[110,130.8128,164.8138],[87.307,110,130.8128],[130.8128,164.8138,195.9977],[97.9989,123.4708,146.8324]]
 # An original, restrained ambient score with slow attacks and no speech.
 for j,start in enumerate(np.arange(-2,dur,9)):
  u=t-start;env=np.clip(u/2.2,0,1)*np.clip((12-u)/3.3,0,1)
  for k,f in enumerate(chords[j%4]):
   sig=.014*np.sin(2*np.pi*f*t+.08*np.sin(t*.12+k))+.0035*np.sin(2*np.pi*f*2*t)
   left+=sig*env*(.8+.2*np.sin(j+k));right+=sig*env*(.8+.2*np.cos(j+k))
 # Warm sub pulses and soft, filtered air swells mark camera cuts.
 noise=rng.normal(0,1,len(t));noise=np.convolve(noise,np.ones(19)/19,mode='same')
 for cut in cuts:
  u=t-cut;env=np.exp(-((u+.15)/.5)**2);left+=noise*env*.022;right+=np.roll(noise,430)*env*.022
  sub=np.sin(2*np.pi*(48*u-5*u*u))*np.exp(-np.maximum(0,u)*4)*((u>=0)&(u<1.2))*.03
  left+=sub;right+=sub
 envelope=np.minimum(1,t/2)*np.minimum(1,(dur-t)/2)
 stereo=np.stack([left*envelope,right*envelope],axis=1);stereo=np.clip(stereo,-.7,.7)
 with wave.open(str(root/f'score-{dur}.wav'),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr);f.writeframes((stereo*32767).astype('<i2').tobytes())
