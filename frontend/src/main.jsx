import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'   // Teammate's font baseline reset
import './global.css'  // 👈 Added: Your team's application branding styles
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
