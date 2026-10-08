// テキスト中の分数を、分子・横線・分母の順に表示する。入力欄は変更しない。
export function formatFractions(root) {
  const pattern = /([0-9]+(?:\.[0-9]+)?π?|π|ℓ|r²θ|rℓ|r²|θ)\s*\/\s*([0-9]+(?:\.[0-9]+)?|π|r)/g;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.parentElement?.closest('.fraction,input,textarea,option,script,style')) nodes.push(node);
  }
  for (const node of nodes) {
    const text = node.textContent.replaceAll('½', '1/2');
    const matches = [...text.matchAll(pattern)];
    if (!matches.length) continue;
    const fragment = document.createDocumentFragment();
    let offset = 0;
    for (const match of matches) {
      fragment.append(document.createTextNode(text.slice(offset, match.index)));
      const fraction = document.createElement('span');
      fraction.className = 'fraction';
      fraction.setAttribute('role', 'math');
      fraction.setAttribute('aria-label', `${match[2]}分の${match[1]}`);
      const numerator = document.createElement('span'), denominator = document.createElement('span');
      numerator.className = 'numerator'; denominator.className = 'denominator';
      numerator.textContent = match[1]; denominator.textContent = match[2];
      numerator.setAttribute('aria-hidden', 'true'); denominator.setAttribute('aria-hidden', 'true');
      fraction.append(numerator, denominator); fragment.append(fraction);
      offset = match.index + match[0].length;
    }
    fragment.append(document.createTextNode(text.slice(offset)));
    node.replaceWith(fragment);
  }
}
