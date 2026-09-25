export type Problem = {
  id:string; label:string; numerator:string; denominator?:string; outer?:boolean
  parts:[string,string,string]; values:(n:number)=>[number,number,number]
  answer:string; formulaLatex:string; insight:string
  derivation:{label:string;latex:string;note?:string;emphasis?:boolean;final?:boolean}[]
}

export const problems:Problem[]=[
 {id:'2-1',label:'問2 (1)',numerator:'1',denominator:'n²+1',parts:['分子 1','分母 n²+1','商'],values:n=>[1,n*n+1,1/(n*n+1)],answer:'0',formulaLatex:'\\displaystyle \\lim_{n\\to\\infty}\\frac{1}{n^2+1}',insight:'分子は1のまま、分母はn²により急速に大きくなります。',derivation:[
  {label:'STEP 1',latex:'\\displaystyle \\lim_{n\\to\\infty}\\frac{1}{n^2+1}'},
  {label:'STEP 2',latex:'\\displaystyle \\lim_{n\\to\\infty}\\frac{1/n^2}{1+1/n^2}',note:'分子・分母を n² で割る'},
  {label:'STEP 3',latex:'\\displaystyle \\frac{1}{n^2}\\to 0',note:'n → ∞ のとき',emphasis:true},
  {label:'STEP 4',latex:'\\displaystyle 1+\\frac{1}{n^2}\\to 1\\quad\\therefore\\quad\\frac{0}{1+0}=0'},
  {label:'STEP 5',latex:'\\displaystyle \\lim_{n\\to\\infty}\\frac{1}{n^2+1}=\\mathbf{0}',final:true}
 ]},
 {id:'2-2',label:'問2 (2)',numerator:'n³+4n²',parts:['n³','4n²','和'],values:n=>[n**3,4*n*n,n**3+4*n*n],answer:'∞',formulaLatex:'\\displaystyle\\lim_{n\\to\\infty}(n^3+4n^2)',insight:'両方とも増え、やがてn³の増え方が強くなります。',derivation:steps('\\lim_{n\\to\\infty}(n^3+4n^2)','n^2(n+4)\\to\\infty','\\infty','n²でくくり出す')},
 {id:'2-3',label:'問2 (3)',numerator:'n−5',denominator:'2n+1',parts:['分子 n−5','分母 2n+1','商'],values:n=>[n-5,2*n+1,(n-5)/(2*n+1)],answer:'1/2',formulaLatex:'\\displaystyle\\lim_{n\\to\\infty}\\frac{n-5}{2n+1}',insight:'∞/∞という形だけでは判断できません。最高次nで割って比べます。',derivation:steps('\\lim_{n\\to\\infty}\\frac{n-5}{2n+1}','\\frac{1-5/n}{2+1/n}\\to\\frac12','\\frac12')},
 {id:'2-4',label:'問2 (4)',numerator:'n+2',denominator:'n²−2',parts:['分子 n+2','分母 n²−2','商'],values:n=>[n+2,n*n-2,(n+2)/(n*n-2)],answer:'0',formulaLatex:'\\displaystyle\\lim_{n\\to\\infty}\\frac{n+2}{n^2-2}',insight:'およそnの分子より、およそn²の分母が圧倒的に速く増えます。',derivation:steps('\\lim_{n\\to\\infty}\\frac{n+2}{n^2-2}','\\frac{1/n+2/n^2}{1-2/n^2}\\to0','0')},
 {id:'2-5',label:'問2 (5)',numerator:'n²+5n+4',denominator:'3−2n²',parts:['分子','分母（負方向）','商'],values:n=>[n*n+5*n+4,3-2*n*n,(n*n+5*n+4)/(3-2*n*n)],answer:'−1/2',formulaLatex:'\\displaystyle\\lim_{n\\to\\infty}\\frac{n^2+5n+4}{3-2n^2}',insight:'分子と分母の絶対値はともにn²程度。分母は負方向へ進みます。',derivation:steps('\\lim_{n\\to\\infty}\\frac{n^2+5n+4}{3-2n^2}','\\frac{1+5/n+4/n^2}{3/n^2-2}\\to-\\frac12','-\\frac12')},
 {id:'2-6',label:'問2 (6)',numerator:'2 −',denominator:'(n+1)/(3n−1)',outer:true,parts:['定数 2','分数部分','差'],values:n=>[2,(n+1)/(3*n-1),2-(n+1)/(3*n-1)],answer:'5/3',formulaLatex:'\\displaystyle\\lim_{n\\to\\infty}\\left(2-\\frac{n+1}{3n-1}\\right)',insight:'まず分数部分が1/3へ近づくことを確認し、2から引きます。',derivation:steps('\\lim_{n\\to\\infty}\\left(2-\\frac{n+1}{3n-1}\\right)','2-\\frac{1+1/n}{3-1/n}\\to2-\\frac13','\\frac53','分数部分を最高次 n で割る')}
]

function steps(start:string,transform:string,answer:string,note='分子・分母を最高次の n で割る'){
 return [{label:'STEP 1',latex:`\\displaystyle ${start}`},{label:'STEP 2',latex:`\\displaystyle ${transform}`,note,emphasis:true},{label:'STEP 3',latex:`\\displaystyle ${start}=${answer}`,final:true}]
}

export const nSteps=[1,2,3,4,5,10,20,50,100,200,500,1000]
export const formatValue=(v:number)=>Math.abs(v)>=100000?v.toExponential(3):Math.abs(v)<.001&&v!==0?v.toExponential(4):Number(v.toPrecision(7)).toString()
export const finiteLimit=(p:Problem)=>p.answer
