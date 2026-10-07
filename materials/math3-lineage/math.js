export const TAU = 2 * Math.PI;
export const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
export const mix = (a, b, t) => a + (b - a) * t;
export const smooth = t => { t = clamp(t); return t * t * (3 - 2 * t); };
export const sine = (x, amplitude = 1, frequency = 1, phase = 0) => amplitude * Math.sin(frequency * x + phase);
export const sineDerivative = (x, amplitude = 1, frequency = 1, phase = 0) => amplitude * frequency * Math.cos(frequency * x + phase);
export const converge = n => 2 + 1 / n;
export const eSequence = n => Math.exp(n * Math.log1p(1 / n));
export const secantSlope = (x, h) => 2 * x + h; // f(x)=x²; exact difference quotient, including the limiting value.
export const cubic = x => x * x * x / 3 - x;
export const cubicDerivative = x => x * x - 1;
export const rightRiemann = n => { const dx = 1 / n; let area = 0; for (let i = 1; i <= n; i++) area += (i * dx) ** 2 * dx; return area; };
export const rectangleCount = u => 2 ** Math.round(2 + clamp(u) * 5);
export const motion = t => ({position:t * t / 2, velocity:t, acceleration:1});
export const harmonic = (t, A = 1, w = 1, phi = 0) => ({position:A * Math.sin(w * t + phi), velocity:A * w * Math.cos(w * t + phi), acceleration:-A * w * w * Math.sin(w * t + phi)});
export const geometry = {
  distance:(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]),
  rotationVolume:(a,b)=>(Math.PI/3)*(b**3-a**3), // y=x revolved around x-axis.
  geometricSum:n=>1-2**(-n),
};
export class Playback {
  constructor(scenes){this.scenes=scenes;this.total=scenes.reduce((s,x)=>s+x.duration,0);this.time=0;this.playing=false;this.speed=1;}
  locate(){let start=0;for(let i=0;i<this.scenes.length;i++){const end=start+this.scenes[i].duration;if(this.time<end||i===this.scenes.length-1)return{index:i,progress:clamp((this.time-start)/this.scenes[i].duration),start};start=end;}}
  seek(time){this.time=clamp(time,0,this.total);return this.locate();}
  jump(index){index=clamp(index,0,this.scenes.length-1);this.time=this.scenes.slice(0,index).reduce((s,x)=>s+x.duration,0);return this.locate();}
  tick(seconds){if(this.playing){this.time=clamp(this.time+seconds*this.speed,0,this.total);if(this.time===this.total)this.playing=false;}return this.locate();}
}
