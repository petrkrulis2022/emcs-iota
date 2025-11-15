import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { IotaWalletProvider } from './contexts/IotaWalletProvider'
import '@iota/dapp-kit/dist/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IotaWalletProvider>
      <App />
    </IotaWalletProvider>
  </StrictMode>,
)
