export type TeamId = 'A' | 'B'
export type EventType = '2P_MADE'|'2P_MISS'|'3P_MADE'|'3P_MISS'|'FT_MADE'|'FT_MISS'|'OREB'|'DREB'|'AST'|'TOV'|'STL'|'BLK'|'FOUL'|'TIMEOUT'
export interface Player { id:string; number:string; name:string; captain?:boolean; starter?:boolean }
export interface GameEvent { id:string; teamId:TeamId; playerId?:string; type:EventType; quarter:number; clock:string; createdAt:string; deletedAt?:string; metadata?:Record<string, unknown> }
export interface Line { pts:number; twoM:number; twoA:number; threeM:number; threeA:number; ftM:number; ftA:number; oreb:number; dreb:number; ast:number; tov:number; stl:number; blk:number; pf:number }
export const emptyLine=():Line=>({pts:0,twoM:0,twoA:0,threeM:0,threeA:0,ftM:0,ftA:0,oreb:0,dreb:0,ast:0,tov:0,stl:0,blk:0,pf:0})
export function aggregate(events:GameEvent[], players:Player[]) {
 const active=events.filter(e=>!e.deletedAt), lines:Record<string,Line>=Object.fromEntries(players.map(p=>[p.id,emptyLine()]));
 const score={A:0,B:0}, fouls:{A:number[],B:number[]}={A:[0,0,0,0,0],B:[0,0,0,0,0]}, periods={A:[0,0,0,0,0],B:[0,0,0,0,0]};
 for(const e of active){ const l=e.playerId?lines[e.playerId]:undefined; let pts=0;
  if(e.type==='2P_MADE'){pts=2;if(l){l.twoM++;l.twoA++}} if(e.type==='2P_MISS'&&l)l.twoA++;
  if(e.type==='3P_MADE'){pts=3;if(l){l.threeM++;l.threeA++}} if(e.type==='3P_MISS'&&l)l.threeA++;
  if(e.type==='FT_MADE'){pts=1;if(l){l.ftM++;l.ftA++}} if(e.type==='FT_MISS'&&l)l.ftA++;
  if(l){l.pts+=pts;if(e.type==='OREB')l.oreb++;if(e.type==='DREB')l.dreb++;if(e.type==='AST')l.ast++;if(e.type==='TOV')l.tov++;if(e.type==='STL')l.stl++;if(e.type==='BLK')l.blk++;if(e.type==='FOUL')l.pf++}
  score[e.teamId]+=pts; periods[e.teamId][Math.min(e.quarter-1,4)]+=pts;if(e.type==='FOUL')fouls[e.teamId][Math.min(e.quarter-1,4)]++;
 }
 return {active,lines,score,fouls,periods};
}
export const pct=(m:number,a:number)=>a?`${Math.round(m/a*100)}%`:'—';
