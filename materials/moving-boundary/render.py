import os, math, subprocess, io, wave, json
import tempfile
WORK=tempfile.mkdtemp(prefix='moving-boundary-')
os.environ['MPLCONFIGDIR']=WORK
import numpy as np
from PIL import Image,ImageDraw,ImageFont
from matplotlib.mathtext import math_to_image
from cinema import Cinema
OUT=os.path.abspath(os.path.join(os.path.dirname(__file__),'../../public/media/moving-boundary'))
os.makedirs(OUT,exist_ok=True)
FONT='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
cyan='#61e6ff'; gold='#ffd37b'; white='#e8f2ff'
cache={}
def formula(s,width,color=white):
 key=(s,width,color)
 if key not in cache:
  b=io.BytesIO(); math_to_image('$'+s+'$',b,dpi=900,color='black',format='png'); b.seek(0)
  a=Image.open(b).convert('RGBA'); ar=np.array(a); ar[:,:,3]=255-ar[:,:,:3].min(axis=2); ar[:,:,:3]=tuple(bytes.fromhex(color[1:])); a=Image.fromarray(ar)
  ratio=min(width/a.width,190/a.height); a=a.resize((int(a.width*ratio),int(a.height*ratio)),Image.Resampling.LANCZOS); cache[key]=a
 return cache[key]
def audio(dur,events,path):
 sr=48000;t=np.arange(dur*sr)/sr
 a=sum(.04*np.sin(2*np.pi*f*t+0.25*np.sin(t*.3)) for f in [55,82.4069,110,164.8138])
 a*=.65+.25*np.sin(t*.4)
 for e in events:
  q=t-e; env=np.exp(-np.maximum(q,0)*2.5)*(q>=0); a+=.16*env*np.sin(2*np.pi*(350*q+70*q*q))
 a*=np.minimum(t/2,1)*np.minimum((dur-t)/2,1)
 st=np.stack([a,a*.95+.01*np.sin(t*2*np.pi*220)],axis=1)
 with wave.open(path,'wb') as w:w.setparams((2,2,sr,0,'NONE',''));w.writeframes((np.clip(st,-1,1)*32767).astype('<i2').tobytes())
def render(dur,W,H,stills=False):
 portrait=H>W; fps=30
 bounds=[0,12,28,45,65,80,90] if dur==90 else [0,5,12,15,22,26,30]
 events=[bounds[1],bounds[2],bounds[3],bounds[3]+(bounds[4]-bounds[3])*.7,bounds[4],bounds[5]]
 ap=os.path.join(WORK,f'audio{dur}.wav');audio(dur,events,ap)
 path=f'{OUT}/moving-boundary-{dur}s.mp4'
 p=None if stills else subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r','30','-i','-','-i',ap,'-c:v','libx264','-preset','veryfast','-crf','22','-maxrate','6500k','-bufsize','13000k','-threads','4','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart','-t',str(dur),path],stdin=subprocess.PIPE)
 rng=np.random.default_rng(9);stars=rng.random((180,3)); fonts={n:ImageFont.truetype(FONT,n) for n in [22,26,30,34,40,48,60]}
 bg=Image.new('RGB',(W,H),'#030711')
 cinema=Cinema(W,H)
 titles=['積分の宇宙へ','動く境界・変わる高さ','積分式を分解する','微分が生む、対称な２項','基本定理がつなぐ','動く境界']
 captions=['積分の上端が動くとき、何が起こるのか。','x は上端と高さの両方を変える。','積分変数 t に対して、x は定数。','同じ大きさ、反対の符号。和は 0。','微積分学の基本定理：sin 0 = 0','動く境界が、微分の答えを導く。']

 # Rasterize all math before creating the frame drawing context.
 specs=[(r'F(x)=\int_0^x(x-t)\cos t\,dt',.82,white),(r'y=\cos t',.82,cyan),(r'y=(x-t)\cos t',.82,cyan),(r'y=[(1-s)+s(x-t)]\cos t',.82,cyan),(r'F(x)=x\int_0^x\cos t\,dt',.82,white),(r'-\int_0^x t\cos t\,dt',.82,white),(r'F(x)=x\int_0^x\cos t\,dt-\int_0^x t\cos t\,dt',.82,white),(r"F'(x)=\int_0^x\cos t\,dt",.82,gold),(r'+x\cos x',.30,gold),(r'-x\cos x',.30,cyan),(r'+x\cos x-x\cos x=0',.58,cyan),(r'=[\sin t]_0^x=\sin x',.82,gold),(r"F'(x)=\sin x",.7,gold)]
 for ss,ww,cc in specs:formula(ss,int(W*ww),cc)
 frames=[int((bounds[i]+(bounds[i+1]-bounds[i])*(.74 if i==3 else .48))*fps) for i in range(6)] if stills else range(dur*fps)
 for frame in frames:
  t=frame/fps; sc=min(5,next((i-1 for i,b in enumerate(bounds) if b>t),5)); u=(t-bounds[sc])/(bounds[sc+1]-bounds[sc]); im=cinema.background(t,sc,u);d=ImageDraw.Draw(im)
  for sx,sy,sz in stars:
   xx=int((sx*W+t*(sz+.2)*7)%W); yy=int((sy*H+t*sz*2)%H); v=int(60+100*sz*(.6+.4*math.sin(t+sx*9)));d.ellipse((xx,yy,xx+2,yy+2),fill=(v//2,v,v))
  margin=65 if portrait else 90
  d.text((margin,60),'MATH III   /   MOVING BOUNDARY',font=fonts[22],fill=cyan)
  d.text((margin,103),titles[sc],font=fonts[48 if portrait else 40],fill=white)
  d.text((W-margin-105,65),f'{sc+1:02d} / 06',font=fonts[22],fill=gold)
  # Camera projects a three-dimensional mathematical film, with orbit and perspective.
  cx=W*.5; cy=H*((.65 if sc in [2,3] else .55) if portrait else (.74 if sc in [2,3] else .67)); scale=W*(.118 if portrait else .095)
  vertical=(.4 if sc in [2,3] else 1) if portrait else (.18 if sc in [2,3] else .42)
  angle=.10+.34*math.sin(t*.12); tilt=.48+.13*math.cos(t*.09)
  def proj(a,b,z=0):
   a=a-2.6; xx=a*math.cos(angle)+z*math.sin(angle); zz=-a*math.sin(angle)+z*math.cos(angle)
   depth=1+zz*.045;return (cx+scale*xx/depth,cy+scale*(-b*vertical*math.cos(tilt)+zz*math.sin(tilt))/depth)
  for a in np.arange(0,6.6,.5):d.line([proj(a,0,-2),proj(a,0,2)],fill='#103344',width=1)
  for z in np.arange(-2,2.1,.5):d.line([proj(0,0,z),proj(6.5,0,z)],fill='#103344',width=1)
  d.line([proj(0,0),proj(6.5,0)],fill='#6b9aad',width=2);d.line([proj(0,-2),proj(0,3)],fill='#6b9aad',width=2)
  x=1+4.3*(.5+.5*math.sin(t*.36-1))
  blend=min(1,max(0,(u-.15)/.35)) if sc==1 else 1
  def value(a):
   if sc in [0,4]:return math.cos(a)
   if sc==5:return math.sin(a)
   return ((1-blend)+blend*(x-a))*math.cos(a)
  if sc in [1,2,3,4]:
   ts=np.linspace(0,x,130)
   for a,b in zip(ts[:-1],ts[1:]):
    va,vb=value(a),value(b);intensity=int(100+80*(.5+.5*math.sin(a*2.4-t*.5)));col=(intensity,int(intensity*.68),32) if (va+vb)>0 else (16,int(intensity*.44),intensity)
    d.polygon([proj(a,0),proj(a,va),proj(b,vb),proj(b,0)],fill=col)
    if int(a*55)%5==0:d.line([proj(a,0),proj(a,va)],fill='#ffdc91' if va>0 else '#4fa9e3',width=1)
    # Extruded rim gives the signed film a visible depth.
    d.line([proj(a,va,-.04),proj(b,vb,-.04)],fill='#b1f4ff',width=2)
   d.line([proj(x,0),proj(x,2.8)],fill=gold,width=3)
   px,py=proj(x,0);py+=48 if portrait else 0;d.rounded_rectangle((px+3,py+12,px+130,py+53),radius=6,fill='#071422');d.text((px+8,py+12),f'x={x:.2f}',font=fonts[26],fill=gold)
  pts=[proj(a,value(a)) for a in np.linspace(0,6.3,210)]
  d.line(pts,fill='#123443',width=20);d.line(pts,fill='#247189',width=9);d.line(pts,fill=cyan if sc!=5 else gold,width=4)
  d.text(proj(6.5,0),' t',font=fonts[26],fill=cyan)
  for a in [0,math.pi/2,math.pi,3*math.pi/2,2*math.pi]:
   px,py=proj(a,0); d.text((px-10,py+10),f'{a:.2f}',font=fonts[22],fill='#7693a9')
  def eq(s,y,width=None,color=white,dx=0):
   a=formula(s,width or int(W*.82),color); im.paste(a,(int((W-a.width)/2+dx),int(y)),a)
  top=H*.21 + (18*math.sin(u*math.pi) if sc==0 else 0)
  if sc==0:
   eq(r'F(x)=\int_0^x(x-t)\cos t\,dt',top)
   d.text((margin,H*.83),'金：上端 x     シアン：積分変数 t',font=fonts[26],fill=gold)
  elif sc==1:
   eq(r'y=\cos t' if blend==0 else (r'y=(x-t)\cos t' if blend==1 else r'y=[(1-s)+s(x-t)]\cos t'),top,color=cyan)
   if 0<blend<1:d.text((margin,H*.74),f'変形の進行 s = {blend:.2f}',font=fonts[26],fill=cyan)
   d.text((margin,H*.79),'金：正の面積  /  青：負の面積',font=fonts[26],fill=gold)
  elif sc==2:
   if portrait:
    eq(r'F(x)=x\int_0^x\cos t\,dt',top);eq(r'-\int_0^x t\cos t\,dt',top+220)
   else:eq(r'F(x)=x\int_0^x\cos t\,dt-\int_0^x t\cos t\,dt',top)
  elif sc==3:
   eq(r"F'(x)=\int_0^x\cos t\,dt",top,color=gold)
   y=H*(.39 if portrait else .42)
   if u<.68:
    shift=(1-min(1,u/.65))*(W*.15+25)-25
    a=formula(r'+x\cos x',int(W*.30),gold);b=formula(r'-x\cos x',int(W*.30),cyan)
    im.paste(a,(int(W*.5-a.width-25-shift),int(y)),a); im.paste(b,(int(W*.5+25+shift),int(y)),b)
   else:
    for k in range(90):
     an=k*2.399; r=(u-.68)*W*(.4+(k%7)/10);px=W*.5+math.cos(an)*r;py=y+45+math.sin(an)*r*.5;d.ellipse((px,py,px+4,py+4),fill=gold if k%2 else cyan)
    eq(r'+x\cos x-x\cos x=0',H*.43,width=int(W*.58),color=cyan)
   d.text((margin,H*.80),'積の微分 ＋ 積分上端の微分',font=fonts[26],fill=white)
  elif sc==4:
   eq(r"F'(x)=\int_0^x\cos t\,dt",top,color=gold)
   eq(r'=[\sin t]_0^x=\sin x',top+220,color=gold)
  else:
   eq(r"F'(x)=\sin x",top,int(W*.7),gold)
   pulse=5+int(3*(1+math.sin(u*6*math.pi)))
   d.rounded_rectangle((W*.12,top-25,W*.88,top+215),radius=15,outline=gold,width=pulse)
  cap=captions[sc]; size=30 if portrait else 34
  if portrait and len(cap)>23:
   parts=cap.split('、'); yy=H-210
   for part in parts:d.text((margin,yy),part,font=fonts[size],fill=white);yy+=50
  else:d.text((margin,H-150),cap,font=fonts[size],fill=white)
  d.line((margin,H-60,W-margin,H-60),fill='#233747',width=3);d.line((margin,H-60,margin+(W-2*margin)*t/dur,H-60),fill=gold,width=4)
  im=cinema.finish(im)
  fade=min(1,t/1.2,(dur-t)/1.5)
  if fade<1:im=Image.blend(bg,im,max(0,fade))
  if stills or frame in [int(dur*.20)*30,int(dur*.57)*30,int(dur*.9)*30]:im.save(f'{OUT}/preview-{dur}-{sc}.jpg')
  if p:p.stdin.write(im.tobytes())
  if frame%300==0:print(f'{dur}s {frame}/{dur*fps}',flush=True)
 if p:
  p.stdin.close();assert p.wait()==0
 if p:print(path,os.path.getsize(path),flush=True)
if __name__=='__main__':
 import sys
 dur=int(sys.argv[1]);render(dur,1920 if dur==90 else 1080,1080 if dur==90 else 1920,stills="--stills" in sys.argv)
