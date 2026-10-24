import { useCallback, useEffect, useRef, useState } from 'react'
import { laminas, preguntas } from './content'
import { Foot, Lamina, Portada } from './slides'
import { Suplemento, TECLAS } from './suplemento'

const TOTAL = laminas.length // láminas numeradas 1..TOTAL; la 0 es la portada
const PRESUPUESTO = 600 // segundos de exposición

const clamp = (v, a, b) => Math.min(Math.max(v, a), b)
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

function leerHash() {
  const h = window.location.hash.replace('#', '')
  if (h.startsWith('s')) {
    if (h[1] === 't') return { sup: true, tab: 'tabla', q: 0, vuelve: 1 }
    const q = clamp((parseInt(h.slice(1), 10) || 1) - 1, 0, preguntas.length - 1)
    return { sup: true, tab: 'preguntas', q, vuelve: 1 }
  }
  const i = parseInt(h, 10)
  return { sup: false, i: Number.isFinite(i) ? clamp(i, 0, TOTAL) : 0 }
}
const hashDe = (p) => (p.sup ? (p.tab === 'tabla' ? '#st' : `#s${p.q + 1}`) : `#${p.i}`)

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

export default function App() {
  const [pos, setPos] = useState(leerHash)
  const [notas, setNotas] = useState(false)
  const [reloj, setReloj] = useState(false)
  const [ayuda, setAyuda] = useState(false)
  const [t0, setT0] = useState(null)
  const [, setTic] = useState(0)
  const [imprimiendo, setImprimiendo] = useState(false)
  const doc = useMedia('(max-width: 900px), (max-aspect-ratio: 1/1)')
  const posRef = useRef(pos)
  posRef.current = pos

  // el hash refleja la lámina: se puede recargar o compartir un enlace a una pregunta
  useEffect(() => {
    if (window.location.hash !== hashDe(pos)) window.history.replaceState(null, '', hashDe(pos))
  }, [pos])
  useEffect(() => {
    const f = () => setPos(leerHash())
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

  const ir = useCallback((d) => {
    setPos((p) => (p.sup ? p : { sup: false, i: clamp(p.i + d, 0, TOTAL) }))
  }, [])
  const abrirSup = useCallback(() => {
    setPos((p) => (p.sup ? p : { sup: true, tab: 'preguntas', q: 0, vuelve: p.i }))
  }, [])
  const cerrarSup = useCallback(() => {
    setPos((p) => (p.sup ? { sup: false, i: p.vuelve } : p))
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
      } else if (k === 'Home') setPos({ sup: false, i: 0 })
      else if (k === 'End') setPos({ sup: false, i: TOTAL })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ir, abrirSup, cerrarSup])

  const tiempo = reloj && t0 !== null ? `${mmss((Date.now() - t0) / 1000)} / ${mmss(PRESUPUESTO)}` : null
  const footDe = (l, n) => (
    <Foot fase={l.fase} n={n} total={TOTAL} tiempo={tiempo} onPrev={() => ir(-1)} onNext={() => ir(1)} onSup={abrirSup} />
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

  const todas = doc || imprimiendo
  const actual = !pos.sup && pos.i >= 1 ? laminas[pos.i - 1] : null

  const lamina = (i) => <Lamina key={laminas[i].id} l={laminas[i]} n={i + 1} foot={footDe(laminas[i], i + 1)} />
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
          <Portada onStart={() => setPos({ sup: false, i: 1 })} />
          {laminas.map((_, i) => lamina(i))}
          {doc && sup}
        </>
      ) : pos.sup ? (
        sup
      ) : pos.i === 0 ? (
        <Portada onStart={() => ir(1)} />
      ) : (
        lamina(pos.i - 1)
      )}

      {!todas && notas && actual && (
        <aside className="hud notas" aria-label="Guion de la lámina">
          <h4>
            Guion · unos {actual.seg} s
          </h4>
          <ul>
            {actual.notas.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </aside>
      )}
      {!todas && ayuda && (
        <aside className="hud ayuda" aria-label="Atajos de teclado">
          <div><kbd>→</kbd> <kbd>←</kbd> avanzar y retroceder (también clicker)</div>
          <div><kbd>S</kbd> material suplementario · <kbd>1</kbd>-<kbd>0</kbd> <kbd>A</kbd>-<kbd>E</kbd> abren cada pregunta</div>
          <div><kbd>N</kbd> guion de la lámina</div>
          <div><kbd>T</kbd> reloj de 10 minutos · <kbd>R</kbd> reiniciar</div>
          <div><kbd>F</kbd> pantalla completa · <kbd>Esc</kbd> cerrar</div>
        </aside>
      )}
    </main>
  )
}
