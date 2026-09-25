import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import ComingSoon from './pages/ComingSoon.tsx'
import { comingSoon, noIndex } from './siteMode.ts'

if (noIndex) {
  const m = document.createElement('meta')
  m.name = 'robots'
  m.content = 'noindex, nofollow'
  document.head.appendChild(m)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {comingSoon ? (
      <ComingSoon />
    ) : (
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )}
  </StrictMode>,
)
