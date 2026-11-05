"""Japanese narration (Open JTalk / Mei) and original procedural film score."""
import json,pathlib,wave,subprocess,shutil,sys
import numpy as np
if '--short-only' not in sys.argv:import pyopenjtalk
root=pathlib.Path('work/conic-cinema');root.mkdir(parents=True,exist_ok=True)
public=pathlib.Path('public/previews/conic-cinema')
story=json.loads(pathlib.Path('preview-src/conic-cinema/story.json').read_text())
SR=48000
TAU=2*np.pi
def writewav(p,x):
    x=np.asarray(x);channels=1 if x.ndim==1 else x.shape[1]
    with wave.open(str(p),'wb') as f:f.setnchannels(channels);f.setsampwidth(2);f.setframerate(SR);f.writeframes((np.clip(x,-1,1)*32767).astype('<i2').tobytes())
def stamp(t):
    ms=round(t*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
reports={}
for mode,duration in ([('short',30)] if '--short-only' in sys.argv else [('long',90),('short',30)]):
    voice=np.zeros(SR*duration);report=[];subs=[]
    for i,(start,end,text) in enumerate(story[mode]):
        subs.append(f'{i+1}\n{stamp(start)} --> {stamp(end)}\n{text}\n')
        if mode=='short':continue
        p=root/f'{mode}-voice-{i}.wav'
        if not p.exists():
            x,sr=pyopenjtalk.tts(text,speed=1.08,half_tone=-1.5)
            assert sr==SR
            x=x/32768;active=np.where(np.abs(x)>.004)[0]
            if active.size:x=x[max(0,active[0]-2000):min(len(x),active[-1]+4000)]
            x=x/(max(np.max(np.abs(x)),.01))*.64;writewav(p,x)
        with wave.open(str(p)) as f:x=np.frombuffer(f.readframes(f.getnframes()),'<i2').astype(float)/32768
        slot=end-start-.10;ratio=max(1,len(x)/SR/slot)
        if ratio>1:
            fitted=root/f'{mode}-fit-{i}.wav'
            subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(p),'-af',f'atempo={ratio:.6f}','-ar',str(SR),str(fitted)],check=True)
            with wave.open(str(fitted)) as f:x=np.frombuffer(f.readframes(f.getnframes()),'<i2').astype(float)/32768
        x=x[:int(slot*SR)];idx=round(start*SR);voice[idx:idx+len(x)]+=x
        report.append({'text':text,'start':start,'end':end,'speedAdjustment':ratio,'seconds':len(x)/SR})
        print(mode,i,'speech speed',round(ratio,2),flush=True)
    # Original D-minor score: soft pad, resonant arpeggios and transitions.
    n=len(voice);music=np.zeros((n,2));rng=np.random.default_rng(403)
    chords=[[146.832,174.614,220],[130.813,164.814,195.998],[116.541,146.832,174.614],[130.813,174.614,220]]
    for start in np.arange(0,duration,4):
        count=min(int(4.8*SR),n-int(start*SR));t=np.arange(count)/SR;env=np.minimum(t/.8,1)*np.minimum((4.8-t)/1.2,1);env=np.maximum(0,env)
        sig=sum(np.sin(2*np.pi*f*t)+.25*np.sin(2*np.pi*f*2*t) for f in chords[int(start/4)%4])*.008*env
        k=int(start*SR);music[k:k+count,0]+=sig;music[k:k+count,1]+=sig*.95
    for j,start in enumerate(np.arange(1,duration,0.75)):
        count=min(int(2.4*SR),n-int(start*SR));t=np.arange(count)/SR;f=chords[(j//6)%4][j%3]*2
        sig=(np.sin(TAU*f*t)+.2*np.sin(TAU*f*2*t))*np.exp(-t*2.5)*np.minimum(t/.015,1)*.017
        k=int(start*SR);pan=.3 if j%2 else .7;music[k:k+count,0]+=sig*pan;music[k:k+count,1]+=sig*(1-pan)
    # An accelerating air rush into the board and soft cinematic impact.
    for start in ([5.8,19.4,38.5,57.5,76.7] if mode=='long' else [1.8,9.6,15.6,21.6]):
        count=min(int(1.3*SR),n-int(start*SR));t=np.arange(count)/SR;noise=rng.normal(0,1,count);noise=np.convolve(noise,np.ones(28)/28,mode='same');sig=noise*np.sin(np.pi*t/1.3)**2*.10+np.sin(2*np.pi*55*t)*np.exp(-t*5)*.03
        k=int(start*SR);music[k:k+count,:]+=sig[:,None]
    duck=np.ones(n)
    if mode=='long':
        for start,end,_ in story[mode]:duck[int(start*SR):int(end*SR)]=.48
    music*=duck[:,None];fade=np.minimum(np.arange(n)/SR/1.5,1)*np.minimum((n-np.arange(n))/SR/1.5,1)
    audio=(voice[:,None]+music)*fade[:,None];writewav(root/f'{mode}-mix.wav',audio)
    (public/f'{mode}-subtitles.srt').write_text('\n'.join(subs))
    (public/f'{mode}-subtitles.vtt').write_text('WEBVTT\n\n'+'\n'.join(subs).replace(',','.'))
    reports[mode]=report
(root/'speech-report.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2))
if '--short-only' not in sys.argv:
    voice_root=pathlib.Path(pyopenjtalk.__file__).parent/'htsvoice'
    for name in ['LICENSE_mei_normal.htsvoice','README.md']:
        if (voice_root/name).exists():shutil.copy2(voice_root/name,public/('voice-'+name))
print('AUDIO DONE',flush=True)
