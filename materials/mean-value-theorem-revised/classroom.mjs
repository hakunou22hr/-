// Absolute-time sampling of the supplied MUSE shot. Bounded frame cache keeps
// playback and arbitrary lesson seeks deterministic without loading the whole clip.
import {clamp,mix,phase} from './model.mjs';
export const referenceStillURL=new URL('./assets/v4/classroom.png',import.meta.url).href;
export const classroomSource={width:1280,height:720,fps:24,frames:240,duration:10};
export function classroomTime(t){return t<12?clamp(t,0,12):clamp(12-2*(t-84),0,12)}
export function sourceTime(u){return u<=6?.25+u*(4.25/6):Math.min(10-1/24,4.5+(u-6)*1.375)}
export function sourceFrame(t){return clamp(Math.floor(sourceTime(classroomTime(t))*24),0,239)}
// The visible board border was measured from the supplied shot (720p pixels).
const boardKeys=[[0,265,72,785,307],[1,234,50,850,337],[2,197,32,920,360],[3,153,5,1005,410],[4,74,-20,1165,470],[5,-40,-70,1360,555],[6,-150,-150,1580,705],[7,-290,-260,1860,900],[8,-410,-390,2110,1095],[9,-440,-430,2170,1150],[10,-440,-430,2170,1150]];
export function classroomLayout(u){
 const at=sourceTime(u),i=Math.min(9,Math.floor(at)),a=boardKeys[i],b=boardKeys[i+1],p=clamp(at-i),v=a.slice(1).map((x,k)=>mix(x,b[k+1],p)*1.5),board={x:v[0],y:v[1],w:v[2],h:v[3]};
 // Let the chalk diagram rise into the foreground during the approach, so the
 // board's upper edge and the students never cut through the coordinate labels.
 const w=mix(460,900,phase(u,0,9)),h=w/1.28,center=mix(board.x+board.w/2,960,phase(u,3,8)),y=Math.max(105,board.y+40);
 return {board,graph:{x:center-w/2,y,w,h}};
}
export class ClassroomFrames{
 constructor(){this.cache=new Map();this.index=-1;this.requested=-1}
 url(index){return new URL(`../../media/mean-value-theorem-revised/${index<54?'classroom-v14':'classroom-v10'}/frame-${String(index).padStart(3,'0')}.jpg`,document.baseURI).href}
 async frame(index){
  let entry=this.cache.get(index);
  if(!entry){entry=new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Classroom frame unavailable: '+index));image.src=this.url(index)});this.cache.set(index,entry)}
  else {this.cache.delete(index);this.cache.set(index,entry)}
  while(this.cache.size>10)this.cache.delete(this.cache.keys().next().value);
  return entry;
 }
 async prepare(t){const index=sourceFrame(t);this.requested=index;const image=await this.frame(index);if(this.requested!==index)return null;this.index=index;return image}
}
