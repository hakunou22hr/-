import json, subprocess, pathlib, hashlib
root=pathlib.Path('public/media/riemann-two-ends');results=[]
for name,w,h,d,frames in [('lesson-90s',1920,1080,90,5400),('instagram-30s',1080,1920,30,1800),('motion-preview-6s',1920,1080,6,360)]:
 p=root/(name+'.mp4')
 info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]));s=next(s for s in info['streams'] if s['codec_type']=='video')
 assert (s['width'],s['height'])==(w,h)
 assert s['codec_name']=='h264' and s['pix_fmt']=='yuv420p'
 assert s['avg_frame_rate']=='60/1' and int(s['nb_frames'])==frames
 assert abs(float(info['format']['duration'])-d)<.001
 subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],check=True)
 sums=[];formula_pixels=[]
 for t in ([0,8,18,40,61,70,89.9] if d==90 else [0,1,2,3,4,5.9] if d==6 else [0,3,8,15,22,29.9]):
  jpg=subprocess.check_output(['ffmpeg','-v','error','-ss',str(t),'-i',str(p),'-frames:v','1','-f','image2pipe','-vcodec','mjpeg','-'])
  sums.append(hashlib.sha256(jpg).hexdigest())
  # Inspect native pixels so thin mathematical strokes survive the check.
  raw=subprocess.check_output(['ffmpeg','-v','error','-ss',str(t),'-i',str(p),'-frames:v','1','-vf','crop=iw*.9:ih*.27:iw*.05:ih*.69','-pix_fmt','rgb24','-f','rawvideo','-'])
  visible=sum(min(raw[i:i+3])>125 and max(raw[i:i+3])-min(raw[i:i+3])<70 for i in range(0,len(raw),3))
  assert visible>300,f'Main formula missing at {name} {t}: {visible}'
  formula_pixels.append(visible)
 assert len(set(sums))==len(sums),'Repeated static scenes'
 results.append({'file':str(p),'width':w,'height':h,'duration':d,'fps':60,'frames':frames,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'fullDecode':True,'distinctSamples':len(sums),'mainFormulaVisible':True,'minimumFormulaPixels':min(formula_pixels)})
pathlib.Path('work/riemann-two-ends/video.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
print('PASS dimensions, duration, all frames, H264, 60fps, full decode, changing scenes, visible main formulas')
