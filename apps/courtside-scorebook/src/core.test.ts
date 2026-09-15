import { describe,expect,it } from 'vitest'
import { aggregate, buildRunningScore, GameEvent, Player } from './core'
const players:Player[]=[{id:'p',number:'7',name:'Player'}]
const event=(type:GameEvent['type'],quarter=1):GameEvent=>({id:type+quarter,teamId:'A',playerId:'p',type,quarter,clock:'08:00',createdAt:''})
describe('event log aggregation',()=>{
 it('calculates made and missed shots from events',()=>{const x=aggregate([event('2P_MADE'),event('2P_MISS'),event('3P_MADE'),event('FT_MADE')],players);expect(x.score.A).toBe(6);expect(x.lines.p).toMatchObject({pts:6,twoM:1,twoA:2,threeM:1,threeA:1,ftM:1,ftA:1})})
 it('recalculates after soft deletion (undo)',()=>{const e={...event('2P_MADE'),deletedAt:'now'};expect(aggregate([e],players).score.A).toBe(0)})
 it('keeps player and team fouls synchronized by quarter',()=>{const x=aggregate([event('FOUL',2)],players);expect(x.lines.p.pf).toBe(1);expect(x.fouls.A[1]).toBe(1)})
 it('preserves period scores and player totals',()=>{const x=aggregate([event('2P_MADE',1),event('3P_MADE',2)],players);expect(x.periods.A.slice(0,2)).toEqual([2,3]);expect(x.score.A).toBe(x.lines.p.pts)})
})

it('keeps score, running score and PDF source state synchronized through foul undo',()=>{
 const roster:Player[]=[{id:'a7',number:'7',name:'田中',starter:true},{id:'b12',number:'12',name:'佐藤',starter:true}]
 const made:GameEvent={...event('2P_MADE'),id:'score',playerId:'a7'}
 const foul:GameEvent={...event('FOUL'),id:'foul',teamId:'B',playerId:'b12',metadata:{foulType:'Personal'}}
 let log=[made,foul],state=aggregate(log,roster)
 expect(state.score.A).toBe(2);expect(state.lines.a7.pts).toBe(2);expect(state.periods.A[0]).toBe(2)
 expect(buildRunningScore(log)).toEqual([{teamId:'A',score:2,playerId:'a7',eventId:'score'}])
 expect(state.lines.b12.pf).toBe(1);expect(state.fouls.B[0]).toBe(1)
 log=log.map(e=>e.id==='foul'?{...e,deletedAt:'undo'}:e);state=aggregate(log,roster)
 expect(state.lines.b12.pf).toBe(0);expect(state.fouls.B[0]).toBe(0);expect(buildRunningScore(log)).toHaveLength(1)
})
