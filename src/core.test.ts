import { describe,expect,it } from 'vitest'
import { aggregate, GameEvent, Player } from './core'
const players:Player[]=[{id:'p',number:'7',name:'Player'}]
const event=(type:GameEvent['type'],quarter=1):GameEvent=>({id:type+quarter,teamId:'A',playerId:'p',type,quarter,clock:'08:00',createdAt:''})
describe('event log aggregation',()=>{
 it('calculates made and missed shots from events',()=>{const x=aggregate([event('2P_MADE'),event('2P_MISS'),event('3P_MADE'),event('FT_MADE')],players);expect(x.score.A).toBe(6);expect(x.lines.p).toMatchObject({pts:6,twoM:1,twoA:2,threeM:1,threeA:1,ftM:1,ftA:1})})
 it('recalculates after soft deletion (undo)',()=>{const e={...event('2P_MADE'),deletedAt:'now'};expect(aggregate([e],players).score.A).toBe(0)})
 it('keeps player and team fouls synchronized by quarter',()=>{const x=aggregate([event('FOUL',2)],players);expect(x.lines.p.pf).toBe(1);expect(x.fouls.A[1]).toBe(1)})
 it('preserves period scores and player totals',()=>{const x=aggregate([event('2P_MADE',1),event('3P_MADE',2)],players);expect(x.periods.A.slice(0,2)).toEqual([2,3]);expect(x.score.A).toBe(x.lines.p.pts)})
})
