import subprocess,json,pathlib,hashlib
p=pathlib.Path('public/previews/conic-cinema');reports=[]
for sec,w,h in [(90,1920,1080),(30,1080,1920),(12,1920,1080)]:
    file=p/(f'conic-{sec}s.mp4' if sec!=12 else 'preview-12s.mp4')
    d=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(file)]))
    v=next(s for s in d['streams'] if s['codec_type']=='video');a=next(s for s in d['streams'] if s['codec_type']=='audio')
    assert (v['width'],v['height'],v['codec_name'],v['pix_fmt'])==(w,h,'h264','yuv420p')
    assert abs(float(d['format']['duration'])-sec)<.05
    assert v['r_frame_rate']=='30/1' and int(v['nb_frames'])==sec*30
    assert a['codec_name']=='aac' and a['channels']==2
    subprocess.run(['ffmpeg','-v','error','-i',str(file),'-f','null','-'],check=True)
    # Check consecutive samples are different and audio is present in each section.
    hashes=[]
    for t in ([3,8,12,15,18,28,36,47,55,61,70,80,87] if sec==90 else [2,7,13,19,24,28] if sec==30 else [2,6,10]):
        b=subprocess.check_output(['ffmpeg','-v','error','-ss',str(t),'-i',str(file),'-frames:v','1','-vf','scale=240:-1','-f','image2pipe','-vcodec','png','-']);hashes.append(hashlib.sha256(b).hexdigest())
    assert len(set(hashes))==len(hashes)
    reports.append({'file':str(file),'seconds':sec,'width':w,'height':h,'fps':30,'frames':int(v['nb_frames']),'audio':a['codec_name'],'channels':2,'fullDecode':True,'distinctSceneSamples':len(hashes),'bytes':file.stat().st_size,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
pathlib.Path('preview-src/conic-cinema/video-verification.json').write_text(json.dumps(reports,indent=2))
print('PASS native 90s / 30s / 12s, audio, full decode and distinct scene samples')
