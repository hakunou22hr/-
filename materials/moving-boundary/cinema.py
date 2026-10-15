"""Deterministic depth particles, volumetric bloom, energy ribbons and nebula parallax."""
from pathlib import Path
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageEnhance, ImageOps

class Cinema:
 def __init__(self,W,H):
  self.W,self.H=W,H;self.w,self.h=W//2,H//2
  asset='nebula-portrait.png' if H>W else 'nebula.png'
  src=Image.open(Path(__file__).parent/'assets'/asset).convert('RGB')
  self.plate=ImageOps.fit(src,(int(W*1.16),int(H*1.16)),centering=(.52,.52))
  self.rng=np.random.default_rng(241);self.cloud=self.rng.random((1100,5));self.burst=self.rng.random((900,4))
  # Keep titles, equations, and subtitles readable without reducing edge detail.
  y,x=np.mgrid[0:H,0:W];edge=np.abs(x/W-.5)*2
  dark=.34+.32*edge+.10*np.sin(y/H*np.pi)
  dark*=1-.60*np.clip((y/H-.76)/.10,0,1)
  self.shade=Image.fromarray(np.uint8(np.clip(dark,0,1)*255),'L')
  self.smallblack=Image.new('RGB',(self.w,self.h));self.black=Image.new('RGB',(W,H))
 def background(self,t,scene,u):
  W,H,w,h=self.W,self.H,self.w,self.h
  # Slow orbital camera on the distant plate; foreground particles move independently.
  ox=int(W*.08+W*.047*math.sin(t*.065+scene*.3));oy=int(H*.08+H*.035*math.cos(t*.08))
  plate=self.plate.crop((ox,oy,ox+W,oy+H));plate=Image.composite(plate,self.black,self.shade)
  fx=self.smallblack.copy();d=ImageDraw.Draw(fx)
  cx=w*.50;cy=h*(.61 if H>W else .66)
  # Perspective flight: inverse depth determines speed, size, and parallax.
  z=(self.cloud[:,2]+t*.017)%1;depth=.13+z*3.0
  theta=self.cloud[:,0]*math.tau+t*.035
  radius=(.12+self.cloud[:,1]*1.2)/depth
  px=cx+np.cos(theta)*radius*w*.58;py=cy+np.sin(theta)*radius*h*.55
  for i in range(len(z)):
   xx,yy=px[i],py[i]
   if xx<0 or xx>w or yy<0 or yy>h:continue
   bright=int(70+165*(1-z[i])**2);r=.45+1.5*(1-z[i])**4
   col=(bright,int(bright*.75),int(bright*.36)) if self.cloud[i,4]>.7 else (int(bright*.40),int(bright*.80),bright)
   d.ellipse((xx-r,yy-r,xx+r,yy+r),fill=col)
   if z[i]<.12:
    dx=(xx-cx)*.025;dy=(yy-cy)*.025;d.line((xx,yy,xx+dx,yy+dy),fill=col,width=1)
  # Light filaments occupy the edges and sweep around the mathematical stage.
  for side in [-1,1]:
   for j in range(15):
    pts=[]
    for q in np.linspace(0,1,80):
     xx=w*(.5+side*(.12+.65*q))
     yy=h*(.72+.13*math.sin(q*6.5-t*.19+j*.11)+.012*j)+h*.05*q
     pts.append((xx,yy))
    col=(40+5*j,65+5*j,95+7*j) if side<0 else (95+7*j,60+5*j,20+2*j)
    d.line(pts,fill=col,width=1)
  if scene==3:
   # Two opposite-sign flows converge exactly at the algebraic cancellation.
   contact=.68;v=u-contact;center=(w*.5,h*(.43 if H>W else .49))
   if v<0:
    travel=max(0,min(1,u/contact))
    for side in [-1,1]:
     for j in range(18):
      pts=[]
      for q in np.linspace(0,1,70):
       xx=center[0]+side*w*(.05+(1-travel)*.42+q*.48)
       yy=center[1]+math.sin(q*11-t*.9+j*.12)*h*(.008+.055*q)
       pts.append((xx,yy))
      d.line(pts,fill=(30,120+5*j,160+5*j) if side<0 else (170+4*j,90+6*j,30+4*j),width=1)
   else:
    phase=v/.32
    for a,s,life,seed in self.burst:
     ang=a*math.tau;r=(.015+phase*(.14+s*.65))*w
     xx=center[0]+math.cos(ang)*r;yy=center[1]+math.sin(ang)*r*.68
     bright=int(255*max(0,1-phase*.8)*(0.4+.6*life))
     col=(bright,int(bright*.75),int(bright*.35)) if seed>.5 else (int(bright*.4),int(bright*.8),bright)
     d.line((xx,yy,xx-math.cos(ang)*w*.012,yy-math.sin(ang)*w*.009),fill=col,width=1)
    rr=int(w*(.04+phase*.7));d.ellipse((center[0]-rr,center[1]-rr*.4,center[0]+rr,center[1]+rr*.4),outline=(90,130,180),width=2)
    flash=max(0,1-phase*4)
    if flash>0:
     for rr in range(16,0,-1):
      c=int(flash*(255-rr*12));d.ellipse((center[0]-rr*3,center[1]-rr,center[0]+rr*3,center[1]+rr),fill=(c,c,int(c*.85)))
  halo=fx.filter(ImageFilter.GaussianBlur(5))
  fx=ImageChops.add(fx,halo,scale=1.0)
  plate=ImageChops.screen(plate,fx.resize((W,H),Image.Resampling.BILINEAR))
  return plate
 def finish(self,im):
  # Thresholded bloom preserves sharp equation cores and blooms only bright light.
  small=im.resize((self.W//4,self.H//4),Image.Resampling.BILINEAR)
  a=np.asarray(small).astype(np.int16);a=np.maximum(a-90,0);a=np.uint8(np.minimum(a*1.0,255))
  glow=Image.fromarray(a).filter(ImageFilter.GaussianBlur(3)).resize(im.size,Image.Resampling.BILINEAR)
  return ImageChops.add(im,glow,scale=1.0)
