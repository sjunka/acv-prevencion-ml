import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { EscenaTablero } from './tablero'
import { ESCENAS, ESTADOS, PASOS } from './tablero-datos'

describe('tablero', () => {
  it('7 escenas y 33 pasos, dentro de los 10 minutos', () => {
    expect(ESCENAS).toHaveLength(7)
    expect(PASOS).toHaveLength(33)
    expect(ESCENAS.reduce((s, e) => s + e.seg, 0)).toBeLessThanOrEqual(600)
  })

  it('cada paso tiene texto y un estado', () => {
    PASOS.forEach((s, g) => {
      expect(s.t.length, `paso ${g}`).toBeGreaterThan(20)
      expect(ESTADOS[g]).toBeTruthy()
    })
  })

  it('cada escena se dibuja en todos sus pasos, con las rutas que usa', () => {
    ESCENAS.forEach((e, i) => {
      e.pasos.forEach((_, paso) => {
        const html = renderToStaticMarkup(createElement(EscenaTablero, { e: i, paso, animar: false, foot: null }))
        const g = PASOS.findIndex((s) => s.ei === i && s.pi === paso)
        for (const id of [...(PASOS[g].ruta ?? []).flat(), ...(PASOS[g].rojo ?? [])]) expect(html, `${id} en paso ${g}`).toContain(`r-${id}`)
      })
    })
  })

  it('las cifras clave salen de los datos', () => {
    const t = ESCENAS.flatMap((e) => e.pasos).join(' ')
    for (const c of ['30.8', '77.9', '0.504', '28.5', '+1.75', '35.2', '+2.40', '15 de las 20']) expect(t.replaceAll(' ', ' ')).toContain(c)
  })

  it('el texto no usa el signo de sección ni lo que la entrega prohíbe', () => {
    const t = JSON.stringify(ESCENAS)
    expect(t).not.toContain('§')
    for (const re of [/predice/i, /ahorr/i, /pesos/i, /la EPS usa/i, /estado del arte/i]) expect(t).not.toMatch(re)
  })
})
