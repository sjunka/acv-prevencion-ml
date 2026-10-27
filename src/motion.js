// Motor del movimiento: una timeline de GSAP por paso. Se completa y se mata al cambiar de paso o de lámina,
// y limpia sus estilos en línea para que mande otra vez el estado que dibuja React.
import { gsap } from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(MotionPathPlugin)

export const EASE = 'expo.out' // = cubic-bezier(0.16, 1, 0.3, 1), la curva del resto de la página
const RUTA = 'power1.inOut' // el paquete avanza parejo y la ruta se traza a su paso
// Propiedad en línea que deja cada variable de GSAP; al terminar se limpia solo lo que se animó,
// para no borrar estilos que pone React (por ejemplo, el color de una etiqueta).
const EN_LINEA = {
  x: 'transform', y: 'transform', scale: 'transform', scaleX: 'transform', scaleY: 'transform', motionPath: 'transform',
  opacity: 'opacity', fill: 'fill', stroke: 'stroke', strokeWidth: 'strokeWidth', strokeDashoffset: 'strokeDashoffset',
}

// Movimiento reducido: la preferencia del sistema o ?movimiento=reducido (sirve para capturas).
export function reducido() {
  if (typeof window === 'undefined') return true
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    new URLSearchParams(window.location.search).get('movimiento') === 'reducido'
  )
}

// Anima la llegada al paso k. Con movimiento reducido no hay desplazamientos: lo nuevo aparece con un fundido corto.
// autoRound: false porque GSAP redondea los px y el trazo va de 1 a 0: sin esto, la ruta salta a la mitad.
export function animarPaso(root, guion, k) {
  const q = gsap.utils.selector(root)
  const tl = gsap.timeline({ defaults: { ease: EASE, autoRound: false } })
  if (reducido()) tl.from(q(`[data-b="${k}"]`), { opacity: 0, duration: 0.25, ease: 'none' })
  else guion?.[k]?.(tl, q)
  return tl
}

export function detener(tl) {
  if (!tl) return
  const limpiar = new Map()
  for (const tw of tl.getChildren(true, true, false)) {
    const props = Object.keys(tw.vars).map((k) => EN_LINEA[k]).filter(Boolean)
    if (!props.length) continue
    for (const el of tw.targets()) {
      if (!(el instanceof Element)) continue
      const s = limpiar.get(el) ?? new Set()
      props.forEach((p) => s.add(p))
      limpiar.set(el, s)
    }
  }
  tl.progress(1).kill()
  for (const [el, s] of limpiar) gsap.set(el, { clearProps: [...s].join(',') })
}

// El paquete recorre la ruta y la ruta se dibuja detrás de él, con la misma duración y la misma curva.
// La ruta lleva pathLength=1 y la clase .trazo (stroke-dasharray: 1 1). Devuelve el instante de llegada.
// El paquete está centrado en el origen y comparte grupo con la ruta: sus x e y son las coordenadas de la ruta.
// (Con `align`, GSAP le resta la traslación del grupo cuando el grupo tiene transform.)
export function recorrer(tl, paquete, ruta, { dur = 0.6, at } = {}) {
  const t = at ?? tl.duration()
  tl.fromTo(ruta, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: dur, ease: RUTA }, t)
  tl.set(paquete, { opacity: 1 }, t)
  tl.to(paquete, { motionPath: { path: ruta }, duration: dur, ease: RUTA }, t)
  tl.set(paquete, { opacity: 0 }, t + dur)
  return t + dur
}

// Cambia el texto sin reemplazar el nodo que maneja React.
export function texto(el, s) {
  if (el?.firstChild) el.firstChild.nodeValue = s
}

// Una cifra corre hasta su valor; fmt(hasta) debe ser igual a lo que dibuja React.
export function contar(tl, el, desde, hasta, fmt, { dur = 0.9, at } = {}) {
  if (!el?.firstChild) return
  const o = { v: desde }
  const pon = () => texto(el, fmt(o.v))
  pon()
  tl.to(o, { v: hasta, duration: dur, ease: 'power2.out', onUpdate: pon }, at ?? tl.duration())
}
