import subprocess,json,hashlib,os,math
import numpy as np
out=os.path.abspath(os.path.join(os.path.dirname(__file__),'../../public/media/moving-boundary'));results={}
for dur,w,h in [(90,1920,1080),(30,1080,1920)]:
 p=f'{out}/moving-boundary-{dur}s.mp4'
 r=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',p]));v=next(s for s in r['streams'] if s['codec_type']=='video');a=next(s for s in r['streams'] if s['codec_type']=='audio')
 assert (v['width'],v['height'])==(w,h);assert v['r_frame_rate']=='30/1';assert int(v['nb_frames'])==dur*30;assert abs(float(r['format']['duration'])-dur)<.05
 subprocess.run(['ffmpeg','-v','error','-xerror','-i',p,'-f','null','-'],check=True,stdout=subprocess.DEVNULL)
 results[str(dur)]={'size_bytes':os.path.getsize(p),'sha256':hashlib.sha256(open(p,'rb').read()).hexdigest(),'width':w,'height':h,'fps':30,'frames':int(v['nb_frames']),'duration':r['format']['duration'],'video':v['codec_name'],'audio':a['codec_name'],'full_decode':'PASS'}
# Numerical integration verifies both signs and the parameter dependence.
err=0
for x in np.linspace(-6,6,31):
 t=np.linspace(0,x,20001);y=(x-t)*np.cos(t);area=np.trapz(y,t);err=max(err,abs(area-(1-math.cos(x))))
 assert abs(area-(1-math.cos(x)))<2e-7
 eps=1e-5
 derivative=((1-math.cos(x+eps))-(1-math.cos(x-eps)))/(2*eps)
 assert abs(derivative-math.sin(x))<1e-9
results['mathematics']={'F':'1-cos(x)','derivative':'sin(x)','signed_integral_max_error':err,'numerical_check':'PASS'}
json.dump(results,open(out+'/verification.json','w'),ensure_ascii=False,indent=2)
print(json.dumps(results,indent=2))
