"""Track a forward-facing head from the supplied shot; no invented person or pose."""
from pathlib import Path
import cv2,json,numpy as np
root=Path(__file__).resolve().parents[3]
src=root/'public/media/mean-value-theorem-revised/classroom-v10'
out=root/'public/media/mean-value-theorem-revised/classroom-v14'
out.mkdir(exist_ok=True)
ref=cv2.imread(str(src/'frame-000.jpg'))
# Blackboard/window anchors measured in the supplied camera shot.
keys=np.array([[0,265,72,785,307],[1,234,50,850,337],[2,197,32,920,360],[3,153,5,1005,410]],float)
mask=np.zeros(ref.shape[:2],np.uint8)
cv2.fillPoly(mask,[np.array([[55,297],[107,289],[132,306],[146,358],[137,409],[109,427],[55,414]],np.int32)],255)
mask=cv2.GaussianBlur(mask,(15,15),3).astype(np.float32)/255
report=[]
for n in range(54):
 img=cv2.imread(str(src/f'frame-{n:03d}.jpg'))
 u=n/24;i=min(2,int(u));v=keys[i,1:]*(1-(u-i))+keys[i+1,1:]*(u-i)
 x,y,w,h=v;sx=w/785;sy=h/307;H=np.array([[sx,0,x-265*sx],[0,sy,y-72*sy],[0,0,1]],float)
 # Mask and source follow the camera transformation estimated from the static wall/window.
 plate=cv2.warpPerspective(ref,H,(1280,720));alpha=cv2.warpPerspective(mask,H,(1280,720))[:,:,None]
 result=np.clip(plate*alpha+img*(1-alpha),0,255).astype(np.uint8)
 cv2.imwrite(str(out/f'frame-{n:03d}.jpg'),result,[cv2.IMWRITE_JPEG_QUALITY,94])
 report.append({'frame':n,'anchorTime':n/24,'matrix':H.tolist(),'maskPixels':int((alpha>.3).sum())})
(root/'materials/mean-value-theorem-revised/classroom-front-v14.json').write_text(json.dumps({'method':'camera-registered composite from original forward-facing frame0 using calibrated board/window anchors','sourceUnchanged':True,'frames':report},indent=2)+'\n')
print('Wrote54 tracked forward-facing classroom frames')
