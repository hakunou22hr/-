import {filmPose,clamp,type Pose} from './model';
export const shortScenes=[
 {start:0,end:4,sourceStart:0,sourceEnd:12,title:'この領域を、回してみる。',caption:'2曲線で囲まれた領域を x 軸のまわりに。'},
 {start:4,end:10,sourceStart:12,sourceEnd:30,title:'回転の軌跡が、立体になる。',caption:'外側と内側に、2つの曲面が生まれる。'},
 {start:10,end:15,sourceStart:30,sourceEnd:45,title:'内側には、円すいの空洞。',caption:'直線 y=x の内側は、もとの領域に含まれない。'},
 {start:15,end:21,sourceStart:45,sourceEnd:60,title:'輪切りにすると、円環。',caption:'外の円の面積から、穴の面積を引く。'},
 {start:21,end:25,sourceStart:60,sourceEnd:76,title:'薄い円環を、足し合わせる。',caption:'断面積 × 小さな厚さ。それを限りなく足す。'},
 {start:25,end:30,sourceStart:76,sourceEnd:90,title:'外側の体積 − 内側の体積',caption:'円すいの分を引けば、求める体積になる。'}
];
export function shortPose(time:number):Pose{
 time=clamp(time,0,30);const i=time===30?5:shortScenes.findIndex(s=>time<s.end),s=shortScenes[i],u=(time-s.start)/(s.end-s.start);
 const p=filmPose(s.sourceStart+(s.sourceEnd-s.sourceStart)*u);
 // Dedicated portrait camera: a fresh frustum, with a closer establishing view.
 p.camera=p.camera.map((v,j)=>p.target[j]+(v-p.target[j])*.9);
 return p;
}
