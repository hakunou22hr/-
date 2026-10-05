import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'

const rootElement=document.getElementById('root')

class RootBoundary extends React.Component<{children:React.ReactNode},{failed:boolean}>{
  state={failed:false}
  static getDerivedStateFromError(){return{failed:true}}
  componentDidCatch(error:unknown){console.error('region-circle-radius root render error',error)}
  render(){return this.state.failed?<section className="boot-error"><h2>表示を安全に停止しました</h2><p>この学習画面で描画エラーが起きました。全面ブラックアウトは防止されています。</p><button onClick={()=>window.location.reload()}>教材を再読み込み</button></section>:this.props.children}
}

function showBootError(message:string){
  if(!rootElement)return
  rootElement.innerHTML=`<section class="boot-error"><h2>教材を起動できませんでした</h2><p>${message}</p><p>画面を再読み込みしてください。改善しない場合は、この表示をそのままお知らせください。</p></section>`
}

if(!rootElement){
  console.error('region-circle-radius: #root not found')
}else{
  import('./App')
    .then(({default:App})=>{
      ReactDOM.createRoot(rootElement).render(<React.StrictMode><RootBoundary><App/></RootBoundary></React.StrictMode>)
    })
    .catch(error=>{
      console.error('region-circle-radius bootstrap error',error)
      showBootError(error instanceof Error?error.message:'JavaScript の読み込みに失敗しました。')
    })
}
