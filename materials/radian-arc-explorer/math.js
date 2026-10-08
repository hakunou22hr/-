export const degToRad=deg=>deg*Math.PI/180;
export const radToDeg=rad=>rad*180/Math.PI;
// theta は累積角（ラジアン）。同じ座標でも周回数を保持する。
export function measure(deg,r){const theta=degToRad(deg);return {theta,length:r*theta,area:r*r*theta/2,x:r*Math.cos(theta),y:r*Math.sin(theta),laps:Math.floor(deg/360),remainder:deg%360};}
export function piLabel(deg){const rounded=Math.round(deg);if(Math.abs(rounded-deg)>1e-7)return null;if(!rounded)return '0';let a=rounded,b=180;while(b){const t=a%b;a=b;b=t;}const n=rounded/a,d=180/a;return `${n===1?'':n}π${d===1?'':'/'+d}`;}
export const exercises=[{question:'210°を弧度法で表すと？（πの係数を入力）',answer:7/6,display:'7π/6',deg:210,unit:'π rad'},{question:'240°を弧度法で表すと？（πの係数を入力）',answer:4/3,display:'4π/3',deg:240,unit:'π rad'},{question:'330°を弧度法で表すと？（πの係数を入力）',answer:11/6,display:'11π/6',deg:330,unit:'π rad'},{question:'5π/4 radを度で表すと？',answer:225,display:'225°',deg:225,unit:'°'},{question:'3π/2 radを度で表すと？',answer:270,display:'270°',deg:270,unit:'°'}];
export function parseNumber(text){const parts=text.trim().split('/');if(parts.length>2||parts.some(x=>x.trim()===''||!Number.isFinite(Number(x))))return null;const n=Number(parts[0])/(parts.length===2?Number(parts[1]):1);return Number.isFinite(n)?n:null;}
