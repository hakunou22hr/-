"""Check the delivered short contains the music/effects master, without voice."""
import pathlib,json,hashlib,subprocess,wave
import numpy as np
p=pathlib.Path('public/previews/conic-cinema/conic-30s.mp4')
with wave.open('work/conic-cinema/short-mix.wav') as f:
    master=np.frombuffer(f.readframes(f.getnframes()),'<i2').astype(float)/32768
decoded=np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-map','0:a','-ar','48000','-ac','2','-f','f32le','-']),'<f4')
n=min(len(master),len(decoded));master=master[:n];decoded=decoded[:n]
correlation=float(np.corrcoef(master,decoded)[0,1])
relative_error=float(np.mean((master-decoded)**2)/np.mean(master**2))
assert correlation>.98 and relative_error<.08
assert np.sqrt(np.mean(decoded**2))>.001
def video_hash(file):
    return hashlib.sha256(subprocess.check_output(['ffmpeg','-v','error','-i',str(file),'-map','0:v','-c','copy','-f','h264','-'])).hexdigest()
assert video_hash(p)==video_hash('work/conic-cinema/short-silent.mp4')
report={'revision':'conic-v3','narration':False,'subtitles':True,'musicAndEffects':True,'matchesMusicOnlyMaster':True,'audioCorrelation':correlation,'relativeAudioError':relative_error,'videoMatchesOriginalSubtitleRender':True,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
pathlib.Path('preview-src/conic-cinema/short-audio-verification.json').write_text(json.dumps(report,indent=2)+'\n')
print('PASS music/effects-only master, no narration, subtitle frames preserved')
