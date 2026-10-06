"""Render the teaching models into a silent MP4; this is not a screen recording."""
import sys,json,io,subprocess,math,textwrap
from pathlib import Path
import cairosvg
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).resolve().parents[1];out=root/'public/videos';out.mkdir(parents=True,exist_ok=True)
meta=json.loads(sys.stdin.readline());fps=meta['fps'];W,H=1280,720
font='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc';bold='/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
fonts={n:ImageFont.truetype(font,n) for n in [12,14,16,18,20,24,32]};titlefont=ImageFont.truetype(bold,32)
proc=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(fps),'-i','-','-an','-c:v','libx264','-preset','veryfast','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',str(out/'mathematics-genealogy.mp4')],stdin=subprocess.PIPE)
byid={c['id']:c for c in meta['concepts']};cache={}
def put(d,xy,text,size=18,color='#afc6dc',maxwidth=360):
 x,y=xy;line=''
 for char in str(text):
  if d.textlength(line+char,font=fonts[size])>maxwidth or char=='\n':d.text((x,y),line,font=fonts[size],fill=color);y+=size*1.5;line='' if char=='\n' else char
  else:line+=char
 if line:d.text((x,y),line,font=fonts[size],fill=color)
 return y+size*1.5
params={'circle':[('theta','角度 θ',0,360)],'triangle':[('theta','角度 θ',0,360)],'complex':[('theta','偏角 θ',0,360)],'quadratic':[('c','定数項 c',-2,2)],'vector':[('theta','角度 θ',0,180)],'derivative':[('x','点Pの x',-1.8,1.8),('h','二点の間隔 h',.001,1)],'integral':[('x','面積の境界 x',0,4),('n','分割数 n',4,100)],'normal':[('mu','平均 μ',-2,2),('sd','標準偏差 σ',.4,1.5),('k','区間 μ±kσ',.1,3)],'natural':[('x','指数関数の x',-2,1.5),('n','eの近似 n',1,200)],'series':[('r','公比 r',-.9,1.1),('n','項数 n',1,40)],'euclid':[('a','整数 a',2,120),('b','整数 b',1,100)],'volume':[('n','円板の数 n',4,40)],'sequence':[('n','項数 n',4,100)],'exponential':[('x','点の x',-2,2)],'curve':[('x','媒介変数 t',0,6.283)]}
count=0
for line in sys.stdin:
 f=json.loads(line);idx=f['index'];c=byid[meta['ids'][idx]];color=meta['subjects'][c['subject']]['color']
 if idx not in cache:
  img=Image.new('RGB',(W,H),'#071525');d=ImageDraw.Draw(img);d.rounded_rectangle((24,112,816,593),radius=18,fill='#0a1b2e',outline='#24465d',width=2);d.text((36,20),'高校数学の系譜  /  MATHEMATICS GENEALOGY',font=fonts[16],fill='#93c9d6');d.text((36,52),c['title'],font=titlefont,fill='#e5f3ff');d.text((846,56),meta['subjects'][c['subject']]['name'],font=fonts[20],fill=color);d.text((1110,28),f'{idx+1:02d} / {len(meta["ids"])}',font=fonts[24],fill='#d5e8f8');put(d,(846,126),c['description'],20,'#b9cddd',380);d.text((846,254),'AUTO DEMONSTRATION',font=fonts[14],fill='#68dce8');d.line((24,616,1256,616),fill='#24465d',width=1);cache[idx]=img
 img=cache[idx].copy();d=ImageDraw.Draw(img)
 svg=f['svg'].replace('font-family="system-ui"','font-family="Noto Sans CJK JP"')
 graph=Image.open(io.BytesIO(cairosvg.svg2png(bytestring=svg.encode(),output_width=780,output_height=450))).convert('RGBA');img.paste(graph,(30,122),graph)
 y=280
 for key,label,low,high in params.get(c['model'],[]):
  val=f['state'][key];d.text((846,y),label,font=fonts[16],fill='#aac0d6');d.text((1120,y),f'{val:.2f}',font=fonts[16],fill=color);y+=33;d.line((850,y,1215,y),fill='#32495e',width=4);u=max(0,min(1,(val-low)/(high-low)));x=850+u*365;d.ellipse((x-11,y-11,x+11,y+11),fill='#204d60');d.ellipse((x-5,y-5,x+5,y+5),fill='#e7c56b');y+=28
 y=max(y,460);put(d,(846,y),f['caption'],16,'#e7c56b',380)
 if f['route']:
  titles=' → '.join(byid[k]['title'] for k in f['route']);put(d,(35,586),titles,12,'#a9cddd',1170)
 # Compact perspective projection of the same 3D genealogy coordinates.
 angle=.08*math.sin((idx*6+f['t'])*.15)
 def pos(node):
  x,y,z=byid[node]['position'];return 38+(x*math.cos(angle)+z*math.sin(angle)+6)*45,674-y*5
 for e in meta['connections']:d.line((*pos(e['from']),*pos(e['to'])),fill='#182e41',width=1)
 for a,b in zip(f['route'],f['route'][1:]):
  p,q=pos(a),pos(b);d.line((*p,*q),fill='#74b9ce',width=2);u=(f['t']*.7)%1;x=p[0]+(q[0]-p[0])*u;y=p[1]+(q[1]-p[1])*u;d.ellipse((x-3,y-3,x+3,y+3),fill='#e7f9ff')
 for node in meta['concepts']:
  x,y=pos(node['id']);r=2;fill=meta['subjects'][node['subject']]['color'];d.ellipse((x-r,y-r,x+r,y+r),fill=fill)
 x,y=pos(c['id']);r=6+2*math.sin(f['t']*4);d.ellipse((x-r,y-r,x+r,y+r),outline=color,width=2);d.ellipse((x-3,y-3,x+3,y+3),fill='#fff0b0')
 d.text((770,645),'系譜MAP：光が関連をたどる',font=fonts[16],fill='#afd4df');d.text((770,673),'逆方向は前提へ戻る見方 / 字幕・音声なし',font=fonts[12],fill='#698ba4');progress=(idx*6+f['t'])/meta['seconds'];d.line((24,714,24+1232*progress,714),fill='#55dce9',width=3)
 if count==24:img.save(out/'poster.jpg',quality=92)
 proc.stdin.write(img.tobytes());count+=1
 if count%(fps*6)==0:print(f'{idx+1}/{len(meta["ids"])} scenes rendered',file=sys.stderr,flush=True)
proc.stdin.close();code=proc.wait()
if code:raise SystemExit(code)
(out/'video-info.json').write_text(json.dumps({'seconds':meta['seconds'],'fps':fps,'width':W,'height':H,'concepts':len(meta['ids']),'audio':False,'render':'same SVG math models, not screen recording'},ensure_ascii=False))
print('Video complete',file=sys.stderr)
