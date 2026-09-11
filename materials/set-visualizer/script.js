/* Four disjoint regions: A only, intersection, B only, outside both. */
(function () {
  'use strict';
  const over = s => '<span class="over">' + s + '</span>';
  const operations = {
    union: ['A∪B','和集合','AまたはBの少なくとも一方に入っている要素',[0,1,2]],
    intersection: ['A∩B','共通部分','AにもBにも入っている要素',[1]],
    notA: [over('A'),'Aの補集合','全体集合Uの中でAに入っていない要素',[2,3]],
    notB: [over('B'),'Bの補集合','全体集合Uの中でBに入っていない要素',[0,3]],
    aMinusB: ['A−B','差集合','Aには入っているが、Bには入っていない要素',[0]],
    bMinusA: ['B−A','差集合','Aには入っていないが、Bには入っている要素',[2]],
    aNotB: ['A∩'+over('B'),'AとBの補集合','Aには入っているが、Bには入っていない要素',[0]],
    notAB: [over('A')+'∩B','Aの補集合とB','Aには入っていないが、Bには入っている要素',[2]],
    neither: [over('A')+'∩'+over('B'),'両方の補集合の共通部分','全体集合Uの中でAにもBにも入っていない要素',[3]],
    notAOrNotB: [over('A')+'∪'+over('B'),'両方の補集合の和集合','全体集合Uの中で、AとBの両方に入っている部分以外の要素',[0,2,3]],
    notUnion: [over('(A∪B)'),'和集合の補集合','全体集合Uの中でAにもBにも入っていない要素',[3]],
    notIntersection: [over('(A∩B)'),'共通部分の補集合','全体集合Uの中で、AとBの両方に入っている部分以外の要素',[0,2,3]]
  };
  function parseSet(raw) {
    const text = raw.normalize('NFKC').trim().replace(/、/g, ',');
    if (!text) return [];
    const parts = text.split(',').map(x=>x.trim());
    if (parts.some(x=>!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(x) || !Number.isFinite(Number(x)) || Math.abs(Number(x))>Number.MAX_SAFE_INTEGER)) throw new Error('数字をカンマで区切って入力してください（例：1,2,3）。空の区切りや文字は使えません。');
    return [...new Set(parts.map(Number))].sort((a,b)=>a-b);
  }
  function partition(u,a,b) {
    const U=new Set(u), A=new Set(a), B=new Set(b);
    if ([...a,...b].some(x=>!U.has(x))) throw new Error('集合A、Bの要素は全体集合Uに含まれる必要があります。Uに要素を追加するか、A・Bの入力を見直してください。');
    return [u.filter(x=>A.has(x)&&!B.has(x)),u.filter(x=>A.has(x)&&B.has(x)),u.filter(x=>!A.has(x)&&B.has(x)),u.filter(x=>!A.has(x)&&!B.has(x))];
  }
  function calculate(key,regions) { return operations[key][3].flatMap(i=>regions[i]).sort((a,b)=>a-b); }
  if (typeof module !== 'undefined') module.exports={parseSet,partition,calculate,operations};
  if (typeof document === 'undefined') return;
  const $=id=>document.getElementById(id), ns='http://www.w3.org/2000/svg';
  let selected='union', group='basic', regions=[], valid=true, comparison=null, seen=new Set();
  const defaults=['1,2,3,4,5,6,7,8,9,10','1,2,3,4,5','4,5,6,7'];
  const fields=[$('input-u'),$('input-a'),$('input-b')];
  const names=['Aだけ','A∩B','Bだけ','AにもBにも属さない'];
  const y=Math.sqrt(160*160-75*75), top=235-y, bottom=235+y;
  const circle=(cx)=>`M ${cx-160} 235 a 160 160 0 1 0 320 0 a 160 160 0 1 0 -320 0 Z`;
  const lens=`M 360 ${top} A 160 160 0 0 1 360 ${bottom} A 160 160 0 0 1 360 ${top} Z`;
  const union=`M 360 ${top} A 160 160 0 1 0 360 ${bottom} A 160 160 0 1 0 360 ${top} Z`;
  const paths=[circle(285)+' '+lens,lens,circle(435)+' '+lens,`M20 38 Q20 20 38 20 H682 Q700 20 700 38 V462 Q700 480 682 480 H38 Q20 480 20 462 Z ${union}`];
  paths.forEach((d,i)=>{const g=document.createElementNS(ns,'g');g.setAttribute('class','region');g.id='region-'+i;['halo','solid'].forEach(c=>{const p=document.createElementNS(ns,'path');p.setAttribute('d',d);p.setAttribute('fill-rule','evenodd');p.setAttribute('class',c);g.append(p)});$('regions').append(g)});
  const format=values=>values.length?'{'+values.join(', ')+'}':'∅';
  function renderButtons() {
    $('operations').replaceChildren();
    const keys=group==='basic'?['union','intersection','notA','notB','aMinusB','bMinusA']:group==='combination'?['aNotB','notAB','neither','notAOrNotB','notUnion','notIntersection']:['law1','law2'];
    keys.forEach(key=>{const b=document.createElement('button');b.disabled=!valid;b.dataset.key=key;b.setAttribute('aria-pressed',String(comparison===key || (!comparison&&selected===key)));b.innerHTML=key.startsWith('law')?`<span class="symbol">${key==='law1'?'①':'②'}</span><small>ド・モルガン${key==='law1'?'①':'②'}</small>`:`<span class="symbol">${operations[key][0]}</span><small>${operations[key][1]}</small>`;b.onclick=()=>{if(key.startsWith('law'))startComparison(key);else{comparison=null;seen.clear();$('comparison').hidden=true;selected=key;render()}};$('operations').append(b)});
  }
  function startComparison(law) {
    comparison=law;seen.clear();$('comparison').hidden=false;
    const pair=law==='law1'?['notUnion','neither']:['notIntersection','notAOrNotB'];
    ['left-side','right-side'].forEach((id,i)=>{const b=$(id);b.innerHTML=operations[pair[i]][0];b.onclick=()=>{selected=pair[i];seen.add(i);render();b.setAttribute('aria-pressed','true');$('discovery-message').textContent=seen.size===2?'発光する場所が同じ！ だから、この2つの集合は等しい。'+(calculate(selected,regions).length?'':' 今回はどちらも空集合です。'):'もう一方の式もタップして、同じ領域か確認しよう。'}});
    selected=pair[0];render();$('discovery-message').textContent='左辺からタップしてみよう。';
  }
  function render() {
    renderButtons();
    const op=operations[selected], answer=valid?calculate(selected,regions):[];
    const active=valid&&answer.length?op[3]:[];
    paths.forEach((_,i)=>$('region-'+i).classList.toggle('active',active.includes(i)));
    $('result-symbol').innerHTML=op[0];$('result-meaning').textContent=op[2];$('diagram-caption').textContent=op[2];
    $('result-elements').textContent=valid?format(answer):'入力を確認してください';
    $('empty-message').textContent=valid&&!answer.length?(selected==='intersection'?'∅ 空集合 — 共通する要素はありません':'∅ 空集合 — 条件に当てはまる要素はありません'):'';
    $('empty-marker').toggleAttribute('hidden',!valid||answer.length>0);
    $('region-labels').replaceChildren();$('region-list').replaceChildren();
    if(valid) regions.forEach((values,i)=>{
      const p=document.createElement('p');p.textContent=names[i]+'：'+format(values);$('region-list').append(p);
      const pos=[[220,195],[360,182],[500,195],[360,426]][i];
      const t=document.createElementNS(ns,'text');t.setAttribute('class','region-text'+(active.includes(i)?' selected':''));
      const add=(str,y,cls)=>{const s=document.createElementNS(ns,'tspan');s.setAttribute('x',pos[0]);s.setAttribute('y',y);if(cls)s.setAttribute('class',cls);s.textContent=str;t.append(s)};
      add(names[i],pos[1],'region-name');
      // Keep labels inside each shape; the disclosure below always contains every element.
      const maxChars=i===1?9:i===3?34:12, maxLines=i===3?1:4;
      const lines=[];let line='';values.forEach(v=>{const next=(line?', ':'')+v;if(line.length+next.length>maxChars&&line){lines.push(line);line=String(v)}else line+=next});if(line)lines.push(line);if(!values.length)lines.push('∅');
      let displayed=lines.slice(0,maxLines).map(s=>s.length>maxChars?s.slice(0,maxChars-1)+'…':s);if(lines.length>maxLines)displayed[maxLines-1]='…（下に全要素）';
      displayed.forEach((s,j)=>add(s,pos[1]+30+j*28));$('region-labels').append(t);
    });
    $('venn-desc').textContent=valid?op[2]+'。答え '+format(answer)+'。'+regions.map((r,i)=>names[i]+format(r)).join('。'):'集合の入力に誤りがあります。';
    ['left-side','right-side'].forEach(id=>{$(id).disabled=!valid;$(id).setAttribute('aria-pressed','false')});
  }
  function update() {seen.clear();try{regions=partition(...fields.map(f=>parseSet(f.value)));valid=true;$('error').textContent=''}catch(e){valid=false;$('error').textContent=e.message}if(comparison)$('discovery-message').textContent='入力が変わりました。左右の式をもう一度比べよう。';render()}
  fields.forEach(f=>f.addEventListener('input',update));
  const tabs=[...document.querySelectorAll('[data-tab]')];
  tabs.forEach((b,index)=>{b.onclick=()=>{group=b.dataset.tab;tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===b));t.tabIndex=t===b?0:-1});$('operations').setAttribute('aria-labelledby',b.id);if(group!=='discovery'){comparison=null;$('comparison').hidden=true}renderButtons()};b.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?2:(index+(e.key==='ArrowRight'?1:2))%3;tabs[n].click();tabs[n].focus()}}});
  $('reset').onclick=()=>{fields.forEach((f,i)=>f.value=defaults[i]);selected='union';comparison=null;seen.clear();$('comparison').hidden=true;tabs[0].click();update()};
  update();
})();
