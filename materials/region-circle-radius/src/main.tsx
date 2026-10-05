import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'

const rootElement=document.getElementById('root')

function showBootError(message:string){
  if(!rootElement)return
  rootElement.innerHTML=`<section class="boot-error"><h2>教材を起動できませんでした</h2><p>${message}</p><p>画面を再読み込みしてください。改善しない場合は、この表示をそのままお知らせください。</p></section>`
}

if(!rootElement){
  console.error('region-circle-radius: #root not found')
}else{
  import('./App')
    .then(({default:App})=>{
      ReactDOM.createRoot(rootElement).render(<React.StrictMode><App/></React.StrictMode>)
    })
    .catch(error=>{
      console.error('region-circle-radius bootstrap error',error)
      showBootError(error instanceof Error?error.message:'JavaScript の読み込みに失敗しました。')
    })
}
