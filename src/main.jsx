import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App'
import { Acerca } from './acerca'

// ?movimiento=reducido apaga también las entradas por CSS (titular y leyenda), como la preferencia del sistema
if (new URLSearchParams(window.location.search).get('movimiento') === 'reducido') document.documentElement.dataset.movimiento = 'reducido'

// /about/ (copia de index.html que hace el build) o ?vista=about muestran la página de qué se hizo y cómo
const acerca = /\/about\/?$/.test(window.location.pathname) || new URLSearchParams(window.location.search).get('vista') === 'about'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {acerca ? <Acerca /> : <App />}
  </StrictMode>,
)
