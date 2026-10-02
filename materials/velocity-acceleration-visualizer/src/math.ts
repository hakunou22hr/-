export type Motion = { id: string; label: string; formula: string; velocity: string; acceleration: string; duration: number; x: (t:number)=>number; v:(t:number)=>number; a:(t:number)=>number }

export const motions: Record<string, Motion> = {
  linear: { id:'linear', label:'x = t', formula:'x(t)=t', velocity:'v(t)=1', acceleration:'a(t)=0', duration:4, x:t=>t, v:()=>1, a:()=>0 },
  square: { id:'square', label:'x = t²', formula:'x(t)=t^2', velocity:'v(t)=2t', acceleration:'a(t)=2', duration:4, x:t=>t*t, v:t=>2*t, a:()=>2 },
  ex21: { id:'ex21', label:'x = t² − 3t', formula:'x(t)=t^2-3t', velocity:'v(t)=2t-3', acceleration:'a(t)=2', duration:4, x:t=>t*t-3*t, v:t=>2*t-3, a:()=>2 },
  p39: { id:'p39', label:'x = t³ − 8t + 4', formula:'x(t)=t^3-8t+4', velocity:'v(t)=3t^2-8', acceleration:'a(t)=6t', duration:3, x:t=>t**3-8*t+4, v:t=>3*t*t-8, a:t=>6*t },
  throw245: { id:'throw245', label:'y = 24.5t − 4.9t²', formula:'y(t)=24.5t-4.9t^2', velocity:'v(t)=24.5-9.8t', acceleration:'a(t)=-9.8', duration:5, x:t=>24.5*t-4.9*t*t, v:t=>24.5-9.8*t, a:()=>-9.8 },
  throw196: { id:'throw196', label:'y = 19.6t − 4.9t²', formula:'y(t)=19.6t-4.9t^2', velocity:'v(t)=19.6-9.8t', acceleration:'a(t)=-9.8', duration:4, x:t=>19.6*t-4.9*t*t, v:t=>19.6-9.8*t, a:()=>-9.8 },
}
export const averageVelocity = (m:Motion,t:number,dt:number)=>(m.x(t+dt)-m.x(t))/dt
export const signs = (v:number,a:number) => ({ direction: Math.abs(v)<.005?'停止':v>0?'右向き':'左向き', speed:Math.abs(v)<.005?'一瞬停止':v*a>0?'速さが増える':'速さが減る' })
export type HorizontalDirection = 'right' | 'left'
export const directionFromVelocity = (v:number,previous:HorizontalDirection):HorizontalDirection => v>0?'right':v<0?'left':previous
