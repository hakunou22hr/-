export type Problem = {
  id:string; label:string; numerator:string; denominator?:string; outer?:boolean
  parts:[string,string,string]; values:(n:number)=>[number,number,number]
  answer:string; transform:string; insight:string
}

export const problems:Problem[]=[
 {id:'2-1',label:'問2 (1)',numerator:'1',denominator:'n²+1',parts:['分子 1','分母 n²+1','商'],values:n=>[1,n*n+1,1/(n*n+1)],answer:'0',transform:'\\frac{1/n^2}{1+1/n^2} → \\frac{0}{1+0}',insight:'分子は1のまま、分母はn²により急速に大きくなります。'},
 {id:'2-2',label:'問2 (2)',numerator:'n³+4n²',parts:['n³','4n²','和'],values:n=>[n**3,4*n*n,n**3+4*n*n],answer:'∞',transform:'n^2(n+4) → ∞',insight:'両方とも増え、やがてn³の増え方が強くなります。'},
 {id:'2-3',label:'問2 (3)',numerator:'n−5',denominator:'2n+1',parts:['分子 n−5','分母 2n+1','商'],values:n=>[n-5,2*n+1,(n-5)/(2*n+1)],answer:'1/2',transform:'\\frac{1-5/n}{2+1/n} → \\frac12',insight:'∞/∞という形だけでは判断できません。最高次nで割って比べます。'},
 {id:'2-4',label:'問2 (4)',numerator:'n+2',denominator:'n²−2',parts:['分子 n+2','分母 n²−2','商'],values:n=>[n+2,n*n-2,(n+2)/(n*n-2)],answer:'0',transform:'\\frac{1/n+2/n^2}{1-2/n^2} → 0',insight:'およそnの分子より、およそn²の分母が圧倒的に速く増えます。'},
 {id:'2-5',label:'問2 (5)',numerator:'n²+5n+4',denominator:'3−2n²',parts:['分子','分母（負方向）','商'],values:n=>[n*n+5*n+4,3-2*n*n,(n*n+5*n+4)/(3-2*n*n)],answer:'−1/2',transform:'\\frac{1+5/n+4/n^2}{3/n^2-2} → -\\frac12',insight:'分子と分母の絶対値はともにn²程度。分母は負方向へ進みます。'},
 {id:'2-6',label:'問2 (6)',numerator:'2 −',denominator:'(n+1)/(3n−1)',outer:true,parts:['定数 2','分数部分','差'],values:n=>[2,(n+1)/(3*n-1),2-(n+1)/(3*n-1)],answer:'5/3',transform:'2-\\frac{1+1/n}{3-1/n} → 2-\\frac13=\\frac53',insight:'まず分数部分が1/3へ近づくことを確認し、2から引きます。'}
]

export const nSteps=[1,2,3,4,5,10,20,50,100,200,500,1000]
export const formatValue=(v:number)=>Math.abs(v)>=100000?v.toExponential(3):Math.abs(v)<.001&&v!==0?v.toExponential(4):Number(v.toPrecision(7)).toString()
export const finiteLimit=(p:Problem)=>p.answer
