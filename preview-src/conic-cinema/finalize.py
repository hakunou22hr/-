import pathlib,subprocess,json,hashlib,sys
r=pathlib.Path('work/conic-cinema');out=pathlib.Path('public/previews/conic-cinema')
for mode,seconds in ([('short',30)] if '--short-only' in sys.argv else [('long',90),('short',30)]):
    if mode=='short':
        subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(r/'short-silent.mp4'),'-i',str(r/'short-mix.wav'),'-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','160k','-t','30','-movflags','+faststart','-metadata','title=黒板の向こう側 — 二次曲線の世界（画面内解説版）','-metadata','comment=No voice narration. In-scene Japanese explanations, original procedural music and effects. No bottom subtitle strip.',str(out/'conic-30s.mp4')],check=True)
        print('MUX DONE short — subtitles, music and effects; no narration',flush=True)
        continue
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(r/f'{mode}-silent.mp4'),'-i',str(r/f'{mode}-mix.wav'),'-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','160k','-t',str(seconds),'-movflags','+faststart','-metadata','title=黒板の向こう側 — 二次曲線の世界','-metadata','comment=Voice: Open JTalk / HTS Voice Mei, MMDAgent Project Team, Nagoya Institute of Technology, CC BY 3.0 https://creativecommons.org/licenses/by/3.0/ — pitch and speed adjusted; original procedural music and effects.',str(out/f'conic-{seconds}s.mp4')],check=True)
    print('MUX DONE',mode,flush=True)
if '--short-only' in sys.argv:
    print('FINAL FILES READY',flush=True)
    sys.exit(0)
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(out/'conic-90s.mp4'),'-filter_complex','[0:v]trim=start=1:end=5,setpts=PTS-STARTPTS[v0];[0:a]atrim=start=1:end=5,asetpts=PTS-STARTPTS[a0];[0:v]trim=start=12:end=16,setpts=PTS-STARTPTS[v1];[0:a]atrim=start=12:end=16,asetpts=PTS-STARTPTS[a1];[0:v]trim=start=26:end=30,setpts=PTS-STARTPTS[v2];[0:a]atrim=start=26:end=30,asetpts=PTS-STARTPTS[a2];[v0][a0][v1][a1][v2][a2]concat=n=3:v=1:a=1[v][a]','-map','[v]','-map','[a]','-c:v','libx264','-threads','3','-preset','fast','-crf','20','-c:a','aac','-b:a','160k','-movflags','+faststart',str(out/'preview-12s.mp4')],check=True)
print('FINAL FILES READY',flush=True)
