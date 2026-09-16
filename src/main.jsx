import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/cinzel/500.css'
import '@fontsource/cinzel/700.css'
import '@fontsource/montserrat/400.css'
import '@fontsource/montserrat/500.css'
import '@fontsource/montserrat/600.css'
import '@fontsource/cormorant-garamond/400.css'
import '@fontsource/cormorant-garamond/400-italic.css'
import '@fontsource/cormorant-garamond/500-italic.css'
import './index.css'
import App from './App.jsx'
import { lazy, Suspense } from 'react'

const Admin = lazy(() => import('./pages/Admin.jsx'))
const isAdmin = /^\/admin\/?$/.test(window.location.pathname)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdmin ? <Suspense fallback={null}><Admin /></Suspense> : <App />}
  </StrictMode>,
)
