import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// VITE_NOINDEX=true (e.g. on Vercel Preview / the test site) keeps that deployment out of search engines.
if (import.meta.env.VITE_NOINDEX === 'true') {
  const m = document.createElement('meta')
  m.name = 'robots'
  m.content = 'noindex, nofollow'
  document.head.appendChild(m)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
