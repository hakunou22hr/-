// Counts are in units of the radius. The final portion is exact, never 0.14.
export const HALF_LENGTHS = [1, 1, 1, Math.PI - 3];
export const HALF_STARTS = [31, 35.2, 39.4, 47];
const smooth = x => { x = Math.max(0, Math.min(1, x)); return x*x*(3-2*x); };
export function halfLesson(t) {
  const progress = HALF_STARTS.map((start,i) => smooth((t-start)/(i===3?3.2:3)));
  const count = progress.reduce((sum,p,i) => sum+p*HALF_LENGTHS[i],0);
  const phase = t<31?'ready':t<35.2?'first':t<39.4?'second':t<42.4?'third':t<47?'gap':t<50.2?'remainder':t<54?'sum':t<56?'pi':'length';
  const captions = {
    ready:'半径と同じ長さの線を、ものさしにします。',
    first:'まず1本。長さを変えず、半円の弧へ。',
    second:'もう1本。同じ長さを足して、2本分。',
    third:'さらに1本。合わせて3本分。',
    gap:'3本では、半円に少し届きません。',
    remainder:'足りない約0.14本分を、赤で足します。',
    sum:'3本＋0.14159…本分で、半円ぴったり。',
    pi:'半円は3.14159…本分。この数がπです。',
    length:'半円の弧の長さは、半径のπ倍です。'
  };
  return {progress,count,phase,caption:captions[phase],remainder:count>3?count-3:0,complete:count===Math.PI};
}

export function updateHalfMeasure(state, visible) {
  const panel=document.querySelector('#half-count');
  panel.hidden=!visible;
  if(!visible)return;
  const {progress,count,phase}=state;
  document.querySelector('#half-total').textContent=(state.complete?'3.14159…':Number.isInteger(count)?String(count):'≈ '+count.toFixed(3))+' 本分';
  panel.dataset.phase=phase;
  panel.querySelectorAll('.measure-fill').forEach((el,i)=>el.style.width=`${progress[i]*100}%`);
  panel.querySelector('.remainder-measure').style.opacity=['gap','remainder','sum','pi'].includes(phase)?'1':'0';
  document.querySelector('#half-note').textContent=phase==='gap'?'3本では届かない → この隙間を埋める':phase==='remainder'?'赤い部分は、半径1本の約14％の長さ':state.complete?'3本 ＋ 短い赤い部分 ＝ 半円ぴったり':'円弧の色と同じ長さが、下のものさしにもたまります';
}
