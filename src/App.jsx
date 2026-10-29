import { useCallback, useEffect, useRef, useState } from 'react'
import { laminas, preguntas } from './content'
import { Foot, Lamina, Portada } from './slides'
import { Suplemento, TECLAS } from './suplemento'
import { EscenaTablero } from './tablero'
import { ESCENAS } from './tablero-datos'

const TOTAL = laminas.length // escenas o láminas numeradas 1..TOTAL (7 en ambos modos); la 0 es la portada
const PRESUPUESTO = 600 // segundos de exposición

const clamp = (v, a, b) => Math.min(Math.max(v, a), b)
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
// Dos vistas con la misma estructura: las láminas de artículo (por defecto) y el tablero (?vista=tablero, tecla L o botón).
const listaDe = (m) => (m === 'tablero' ? ESCENAS : laminas)
const nPasos = (m, i) => (i >= 1 ? listaDe(m)[i - 1].pasos.length : 1)
const ultimo = (m, i) => nPasos(m, i) - 1
const MODO0 = new URLSearchParams(window.location.search).get('vista') === 'tablero' ? 'tablero' : 'laminas'
// #3 abre la lámina 3 en su primer paso y #3.2 en el segundo; #s4 abre la pregunta 4 y #st la tabla.
function leerHash(m) {
  const h = window.location.hash.replace('#', '')
  if (h.startsWith('s')) {
    const vuelve = { i: 1, paso: 0 }
    if (h[1] === 't') return { sup: true, tab: 'tabla', q: 0, vuelve }
    const q = clamp((parseInt(h.slice(1), 10) || 1) - 1, 0, preguntas.length - 1)
    return { sup: true, tab: 'preguntas', q, vuelve }
  }
  const [a, b] = h.split('.')
  const n = parseInt(a, 10)
  const i = Number.isFinite(n) ? clamp(n, 0, TOTAL) : 0
  const k = parseInt(b, 10)
  return { sup: false, i, paso: Number.isFinite(k) ? clamp(k - 1, 0, ultimo(m, i)) : 0, animar: false }
}
const hashDe = (p) => (p.sup ? (p.tab === 'tabla' ? '#st' : `#s${p.q + 1}`) : p.paso > 0 ? `#${p.i}.${p.paso + 1}` : `#${p.i}`)

function useMedia(q) {
  const [m, setM] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const mm = window.matchMedia(q)
    const f = () => setM(mm.matches)
    mm.addEventListener('change', f)
    return () => mm.removeEventListener('change', f)
  }, [q])
  return m
}

// ?vista=imprimir deja todas las láminas en su último paso: de ahí sale el PDF de respaldo.
const vistaImprimir = new URLSearchParams(window.location.search).get('vista') === 'imprimir'

export default function App() {
  const [modo, setModo] = useState(MODO0)
  const modoRef = useRef(modo)
  modoRef.current = modo
  const [pos, setPos] = useState(() => leerHash(MODO0))
  const [notas, setNotas] = useState(false)
  const [reloj, setReloj] = useState(false)
  const [ayuda, setAyuda] = useState(false)
  const [t0, setT0] = useState(null)
  const [, setTic] = useState(0)
  const [imprimiendo, setImprimiendo] = useState(false)
  const angosta = useMedia('(max-width: 900px), (max-aspect-ratio: 1/1)')
  const doc = angosta && !vistaImprimir && modo === 'laminas' // el PDF sale con la composición de lámina aunque la ventana sea angosta
  const posRef = useRef(pos)
  posRef.current = pos

  // el hash refleja la lámina y el paso: se puede recargar o compartir un enlace a un paso o a una pregunta
  useEffect(() => {
    if (window.location.hash !== hashDe(pos)) window.history.replaceState(null, '', hashDe(pos))
  }, [pos])
  useEffect(() => {
    const f = () => setPos(leerHash(modoRef.current))
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])

  // el reloj arranca al salir de la portada
  useEffect(() => {
    if (!pos.sup && pos.i >= 1 && t0 === null) setT0(Date.now())
  }, [pos, t0])
  useEffect(() => {
    if (t0 === null) return undefined
    const id = setInterval(() => setTic((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [t0])

  useEffect(() => {
    const a = () => setImprimiendo(true)
    const d = () => setImprimiendo(false)
    window.addEventListener('beforeprint', a)
    window.addEventListener('afterprint', d)
    return () => {
      window.removeEventListener('beforeprint', a)
      window.removeEventListener('afterprint', d)
    }
  }, [])

  // Avanzar recorre los pasos de la lámina y luego pasa a la siguiente, animando la llegada.
  // Retroceder no anima: muestra el paso anterior ya armado (al cambiar de lámina, su último paso).
  const ir = useCallback((d) => {
    setPos((p) => {
      if (p.sup) return p
      if (d > 0) {
        if (p.paso < ultimo(modoRef.current, p.i)) return { ...p, paso: p.paso + 1, animar: true }
        return p.i < TOTAL ? { sup: false, i: p.i + 1, paso: 0, animar: true } : p
      }
      if (p.paso > 0) return { ...p, paso: p.paso - 1, animar: false }
      return p.i > 0 ? { sup: false, i: p.i - 1, paso: ultimo(modoRef.current, p.i - 1), animar: false } : p
    })
  }, [])
  // Alterna la vista y deja la URL en ?vista=tablero para poder compartir el enlace.
  const cambiarModo = useCallback(() => {
    const m = modoRef.current === 'tablero' ? 'laminas' : 'tablero'
    setModo(m)
    setPos((p) => (p.sup ? p : { sup: false, i: p.i, paso: 0, animar: false }))
    const u = new URL(window.location.href)
    if (m === 'tablero') u.searchParams.set('vista', 'tablero')
    else u.searchParams.delete('vista')
    window.history.replaceState(null, '', u)
  }, [])
  const abrirSup = useCallback(() => {
    setPos((p) => (p.sup ? p : { sup: true, tab: 'preguntas', q: 0, vuelve: { i: p.i, paso: p.paso } }))
  }, [])
  const cerrarSup = useCallback(() => {
    setPos((p) => (p.sup ? { sup: false, i: p.vuelve.i, paso: p.vuelve.paso, animar: false } : p))
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target
      if (t.closest?.('[data-captura]') && (e.key.startsWith('Arrow') || e.key === ' ')) return // el control de recall usa las flechas
      if ((t.tagName === 'BUTTON' || t.tagName === 'A') && (e.key === ' ' || e.key === 'Enter')) return
      const p = posRef.current
      const k = e.key
      if (k === 'Escape') {
        setAyuda(false)
        setNotas(false)
        if (p.sup) cerrarSup()
        return
      }
      if (k === 'l') return cambiarModo()
      if (k === 'f') {
        if (document.fullscreenElement) document.exitFullscreen()
        else document.documentElement.requestFullscreen?.()
        return
      }
      if (k === 'n') return setNotas((v) => !v)
      if (k === 't') return setReloj((v) => !v)
      if (k === 'r') return setT0(Date.now())
      if (k === '?' || k === 'h') return setAyuda((v) => !v)
      if (k === 's') return p.sup ? cerrarSup() : abrirSup()
      if (p.sup) {
        const q = TECLAS.indexOf(k)
        if (q >= 0) {
          if (q < preguntas.length) setPos({ ...p, tab: 'preguntas', q })
        } else if (k === 'ArrowDown' || k === 'ArrowRight' || k === 'PageDown') {
          if (p.tab === 'preguntas') setPos({ ...p, q: clamp(p.q + 1, 0, preguntas.length - 1) })
        } else if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'PageUp') {
          if (p.tab === 'preguntas') setPos({ ...p, q: clamp(p.q - 1, 0, preguntas.length - 1) })
        } else if (k === 'Tab') {
          e.preventDefault()
          setPos({ ...p, tab: p.tab === 'preguntas' ? 'tabla' : 'preguntas' })
        }
        return
      }
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) {
        e.preventDefault()
        ir(1)
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) {
        e.preventDefault()
        ir(-1)
      } else if (k === 'Home') setPos({ sup: false, i: 0, paso: 0, animar: false })
      else if (k === 'End') setPos({ sup: false, i: TOTAL, paso: ultimo(modoRef.current, TOTAL), animar: false })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ir, abrirSup, cerrarSup, cambiarModo])

  const tiempo = reloj && t0 !== null ? `${mmss((Date.now() - t0) / 1000)} / ${mmss(PRESUPUESTO)}` : null
  const footDe = (l, n, paso) => (
    <Foot fase={l.fase} n={n} total={TOTAL} paso={paso} pasos={l.pasos.length} tiempo={tiempo} onPrev={() => ir(-1)} onNext={() => ir(1)} onSup={abrirSup} />
  )
  const footSup = (
    <footer className="foot">
      <p className="legend" style={{ alignSelf: 'end', margin: 0, fontSize: 'calc(var(--u) * 2.4)' }}>
        Teclas 1 a 9, 0 y A a E abren cada pregunta; ↑ ↓ las recorren; Tab cambia a la tabla; S o Esc vuelven a la lámina.
      </p>
      <div className="nav">
        <button className="link-s" onClick={cerrarSup}>
          Volver a la lámina
        </button>
      </div>
    </footer>
  )

  const todas = doc || imprimiendo || vistaImprimir
  const lista = listaDe(modo)
  const actual = !pos.sup && pos.i >= 1 ? lista[pos.i - 1] : null

  // En vista de documento o al imprimir, cada lámina va completa (último paso) y sin animación.
  const lamina = (i, paso, animar) => (
    <Lamina key={laminas[i].id} l={laminas[i]} n={i + 1} paso={paso} animar={animar} foot={footDe(laminas[i], i + 1, paso)} />
  )
  const sup = (
    <Suplemento
      tab={pos.sup ? pos.tab : 'preguntas'}
      q={pos.sup ? pos.q : 0}
      setTab={(tab) => setPos((p) => ({ ...p, sup: true, tab }))}
      setQ={(q) => setPos((p) => ({ ...p, sup: true, tab: 'preguntas', q }))}
      foot={footSup}
    />
  )

  return (
    <main className={`deck${doc ? ' doc' : ''}`}>
      {todas ? (
        <>
          <Portada animar={false} onStart={() => setPos({ sup: false, i: 1, paso: 0, animar: true })} />
          {laminas.map((l, i) => lamina(i, l.pasos.length - 1, false))}
          {doc && sup}
        </>
      ) : pos.sup ? (
        sup
      ) : pos.i === 0 ? (
        <Portada onStart={() => ir(1)} />
      ) : (
        modo === 'tablero' ? (
          <EscenaTablero e={pos.i - 1} paso={pos.paso} animar={pos.animar} foot={footDe(ESCENAS[pos.i - 1], pos.i, pos.paso)} />
        ) : (
          lamina(pos.i - 1, pos.paso, pos.animar)
        )
      )}

      {/* Botón flotante de solo icono: muestra la vista a la que lleva; la tecla L hace lo mismo */}
      {!imprimiendo && !vistaImprimir && (
        <button type="button" className="fab-vista" onClick={cambiarModo} aria-label={modo === 'tablero' ? 'Ver láminas (L)' : 'Ver tablero (L)'} title={modo === 'tablero' ? 'Ver láminas (L)' : 'Ver tablero (L)'}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {modo === 'tablero' ? <path d="M4 5h16v11H4zM9 20h6M12 16v4" /> : <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />}
          </svg>
        </button>
      )}

      {/* Para lectores de pantalla: qué agrega cada paso (la lámina no lleva más texto) */}
      {!todas && (
        <p className="sr-only" aria-live="polite">
          {actual ? `Paso ${pos.paso + 1} de ${actual.pasos.length}: ${actual.pasos[pos.paso]}` : ''}
        </p>
      )}

      {!todas && notas && actual && (
        <aside className="hud notas" aria-label="Guion de la lámina">
          <h4>
            Guion · unos {actual.seg} s · paso {pos.paso + 1} de {actual.pasos.length}
          </h4>
          <p className="ahora">{actual.pasos[pos.paso]}</p>
          <ul>
            {actual.notas.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </aside>
      )}
      {!todas && ayuda && (
        <aside className="hud ayuda" aria-label="Atajos de teclado">
          <div><kbd>→</kbd> <kbd>←</kbd> paso siguiente y anterior (también clicker)</div>
          <div><kbd>S</kbd> material suplementario · <kbd>1</kbd>-<kbd>0</kbd> <kbd>A</kbd>-<kbd>E</kbd> abren cada pregunta</div>
          <div><kbd>N</kbd> guion de la escena · <kbd>L</kbd> cambia entre tablero y láminas</div>
          <div><kbd>T</kbd> reloj de 10 minutos · <kbd>R</kbd> reiniciar</div>
          <div><kbd>F</kbd> pantalla completa · <kbd>Esc</kbd> cerrar</div>
        </aside>
      )}
    </main>
  )
}
