import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { laminas, preguntas } from './content'
import { guiones } from './figs'
import { Lamina } from './slides'

const rango = (n) => Array.from({ length: n }, (_, i) => i)

// Pasos (data-b) que usa una lámina dibujada completa, en orden
function bloques(l, i) {
  const html = renderToStaticMarkup(createElement(Lamina, { l, n: i + 1, paso: l.pasos.length - 1, animar: false, foot: null }))
  return [...new Set([...html.matchAll(/data-b="(\d+)"/g)].map((m) => Number(m[1])))].sort((a, b) => a - b)
}

describe('sustentación', () => {
  it('cada lámina tiene un guion animado con tantos pasos como pasos de texto', () => {
    for (const l of laminas) expect(guiones[l.id]?.length, l.id).toBe(l.pasos.length)
  })

  it('cada paso muestra algo y ninguna figura usa un paso que no existe', () => {
    laminas.forEach((l, i) => expect(bloques(l, i), l.id).toEqual(rango(l.pasos.length)))
  })

  it('el tiempo sugerido cabe en los 10 minutos de la presentación', () => {
    expect(laminas.reduce((s, l) => s + l.seg, 0)).toBeLessThanOrEqual(600)
  })

  it('las láminas no dicen lo que la entrega prohíbe (PRODUCT.md)', () => {
    const t = JSON.stringify(laminas)
    for (const re of [/predice/i, /ahorr/i, /pesos/i, /la EPS usa/i, /estado del arte/i]) expect(t).not.toMatch(re)
  })

  it('el texto no usa el signo de sección', () => {
    expect(JSON.stringify({ laminas, preguntas })).not.toContain('§')
  })
})
