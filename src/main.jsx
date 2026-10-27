import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App'

// ?movimiento=reducido apaga también las entradas por CSS (titular y leyenda), como la preferencia del sistema
if (new URLSearchParams(window.location.search).get('movimiento') === 'reducido') document.documentElement.dataset.movimiento = 'reducido'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
