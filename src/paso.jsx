// Armado por pasos: cada lámina avanza con el control remoto y cada paso suma una parte de la figura.
// React dibuja el estado final del paso; los guiones de figs.jsx solo animan la llegada a ese estado.
import { createContext, useContext, useEffect, useLayoutEffect } from 'react'

export const PasoCtx = createContext(Infinity) // fuera de una lámina, todo visible
export const usePaso = () => useContext(PasoCtx)

// Antes de pintar, para que lo nuevo arranque oculto y no parpadee; en las pruebas (sin window) no hace nada.
export const useAntesDePintar = typeof window === 'undefined' ? useEffect : useLayoutEffect

// Grupo que aparece en el paso k. Antes de ese paso queda oculto con visibility, así los estilos en línea
// que deja GSAP no lo vuelven a mostrar al retroceder.
export function B({ k, as: T = 'g', className, children, ...rest }) {
  const paso = usePaso()
  const cls = [className, k > paso && 'b-off'].filter(Boolean).join(' ')
  return (
    <T data-b={k} className={cls || undefined} {...rest}>
      {children}
    </T>
  )
}
