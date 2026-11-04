import json,subprocess,pathlib,hashlib
p=pathlib.Path('public/previews/wave-cathedral/lesson-90s.mp4')
info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]));s=info['streams'][0]
assert (s['width'],s['height'])==(1920,1080)
assert s['codec_name']=='h264' and s['pix_fmt']=='yuv420p'
assert s['avg_frame_rate']=='60/1' and int(s['nb_frames'])==5400
assert abs(float(info['format']['duration'])-90)<.001
assert len(info['streams'])==1
subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],check=True)
samples=[]
for t in [4,8,18,29,34,40,47,53,59,66,73,80,85,89]:
 jpg=subprocess.check_output(['ffmpeg','-v','error','-ss',str(t),'-i',str(p),'-frames:v','1','-f','image2pipe','-vcodec','mjpeg','-'])
 row={'time':t,'sha256':hashlib.sha256(jpg).hexdigest()}
 if t>=28:
  raw=subprocess.check_output(['ffmpeg','-v','error','-ss',str(t),'-i',str(p),'-frames:v','1','-vf','crop=iw*.9:ih*.29:iw*.05:ih*.7','-pix_fmt','rgb24','-f','rawvideo','-'])
  count=sum(min(raw[i:i+3])>125 and max(raw[i:i+3])-min(raw[i:i+3])<80 for i in range(0,len(raw),3));assert count>300,f'Formula absent at {t}: {count}';row['formulaPixels']=count
 samples.append(row)
assert len({r['sha256'] for r in samples})==len(samples)
result={'file':str(p),'duration':90,'dimensions':[1920,1080],'fps':60,'frames':5400,'fullDecode':True,'samples':samples,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
pathlib.Path('work/wave-cathedral-90/video.json').write_text(json.dumps(result,indent=2))
print('PASS 90 seconds, 1080p, 60fps, 5400 frames, full decode, distinct scenes and visible mathematics')
