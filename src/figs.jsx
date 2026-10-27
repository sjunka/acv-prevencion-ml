// Figuras de la sustentación: SVG a mano (sin librería de gráficos).
// Lienzo lógico de ~1400 px de ancho que se muestra a 1.24x (texto de 23 px lógicos = 28 px en 1080p).
// Rojo = casos de ACV y la marca que sostiene el titular (una por lámina); azul = modelo; gris = contexto.
// Los casos son círculos y el resto cuadros: la forma también los distingue, no solo el color.
// Cada figura se arma por pasos: <B k> marca lo que aparece en el paso k y `guiones` (al final) anima su llegada.
import { useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { B, useAntesDePintar, usePaso } from './paso'
import { EASE, contar, detener, recorrer, reducido, texto } from './motion'
import {
  curvas, datos, dec, eda, familias, gana, grupo, mas, miles, operacion, pct, prueba, recallAl, regla,
} from './datos'

const K = 1.24
const C = { ink: '#14213d', ink2: '#3d4a63', ink3: '#5a6880', grid: '#dbe1e9', gray: '#6b7a90', grayLt: '#cdd4de', model: '#1d5fb8', caso: '#c8102e' }

function Svg({ w, h, label, children, className = '' }) {
  return (
    <svg className={`svg ${className}`} style={{ '--w': w * K }} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
      {children}
    </svg>
  )
}

// Generador pseudoaleatorio con semilla: la ilustración sale igual en cada carga
function rng(seed) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function barajar(arr, r) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const rango = (a, b) => Array.from({ length: b - a }, (_, i) => a + i)

/* ---------- Fig. 1: 1 000 afiliados y la regla actual ---------- */
const N1 = 1000
const CITADOS = Math.round(regla.citados * N1)
const CASOS = Math.round(datos.prevalencia * N1)
const CAPTADOS = Math.round(CASOS * regla.recall)
const FUERA = CASOS - CAPTADOS

export function Matriz() {
  const paso = usePaso()
  const COLS = 50, P = 19, S = 16
  const rojas = useMemo(() => {
    const r = rng(11)
    return new Set([...barajar(rango(0, CITADOS), r).slice(0, CAPTADOS), ...barajar(rango(CITADOS, N1), r).slice(0, FUERA)])
  }, [])
  const filas = Math.floor(CITADOS / COLS)
  const resto = CITADOS - filas * COLS
  const x1 = COLS * P - 3 + 6
  const yA = filas * P - 1.5
  const yB = filas * P + S + 1.5
  const xR = (resto - 1) * P + S + 1.5
  const borde = `M -6 -6 H ${x1} V ${yA} H ${xR} V ${yB} H -6 Z`
  const dx = 10, dy = 14
  const lx = dx + COLS * P + 44
  const sitio = (i) => [(i % COLS) * P, Math.floor(i / COLS) * P]
  const fuera = [...rojas].filter((i) => i >= CITADOS)
  return (
    <Svg w={1400} h={470} label={`Mil afiliados como cuadros. La regla cita a ${CITADOS}; de ${CASOS} casos de ACV capta ${CAPTADOS} y deja ${FUERA} fuera.`}>
      <g transform={`translate(${dx} ${dy})`}>
        <B k={0}>
          {rango(0, N1).map((i) => {
            const [x, y] = sitio(i)
            return rojas.has(i) ? (
              <circle key={i} className="m-caso" cx={x + S / 2} cy={y + S / 2} r={S / 2 + 0.8} fill={C.caso} />
            ) : (
              <rect key={i} className={i < CITADOS ? 'm-af m-cit' : 'm-af'} data-c={i % COLS} x={x} y={y} width={S} height={S} rx="2" fill={i < CITADOS && paso >= 1 ? C.gray : C.grayLt} />
            )
          })}
        </B>
        {/* La regla traza su contorno detrás de un paquete y los afiliados citados se oscurecen a su paso */}
        <B k={1}>
          <path className="m-borde trazo" pathLength="1" d={borde} fill="none" stroke={C.ink} strokeWidth="4.5" strokeLinejoin="round" />
          <rect className="pkt m-pkt" x="-7" y="-7" width="14" height="14" rx="2" opacity="0" />
        </B>
        <B k={2}>
          {fuera.map((i) => {
            const [x, y] = sitio(i)
            return <circle key={i} className="m-anillo" cx={x + S / 2} cy={y + S / 2} r={S / 2 + 3.5} fill="none" stroke={C.ink} strokeWidth="2.5" />
          })}
        </B>
      </g>
      <B k={1} className="m-cuenta">
        <line x1={dx + x1 + 2} y1={dy + 56} x2={lx - 12} y2={dy + 56} stroke={C.ink} strokeWidth="2.5" />
        <text className="lx m-n" x={lx} y={dy + 72}>{CITADOS}</text>
        <text className="l" x={lx} y={dy + 106}>afiliados citados</text>
        <text className="l" x={lx} y={dy + 136}>({pct(regla.citados)} del total)</text>
      </B>
      <B k={2} className="m-capta">
        <circle cx={lx + 12} cy={dy + 198} r="13" fill={C.caso} />
        <text className="lx" x={lx + 36} y={dy + 218}>{`${CAPTADOS} de ${CASOS}`}</text>
        <text className="l" x={lx} y={dy + 256}>casos de ACV captados</text>
        <text className="l" x={lx} y={dy + 286}>({pct(regla.recall)} de los casos)</text>
        <text className="lb" x={lx} y={dy + 342}>{`${FUERA} casos quedan fuera`}</text>
        <text className="s" x={lx} y={dy + 376}>La regla no ordena: cita a todo</text>
        <text className="s" x={lx} y={dy + 406}>el grupo por igual.</text>
      </B>
      <g transform={`translate(${dx} ${dy + 380 + 50})`} className="l">
        <B k={0}>
          <circle cx="9" cy="-7" r="9.5" fill={C.caso} />
          <text x="26" y="0">caso de ACV</text>
          <rect x="232" y="-16" width="18" height="18" rx="2" fill={C.grayLt} />
          <text x="260" y="0">{paso >= 1 ? 'no citado' : 'afiliado'}</text>
        </B>
        <B k={1}>
          <rect x="430" y="-16" width="18" height="18" rx="2" fill={C.gray} />
          <text x="458" y="0">afiliado citado</text>
        </B>
      </g>
    </Svg>
  )
}

const guionMatriz = [
  // 0: mil afiliados en una ola de izquierda a derecha; después aparecen los casos
  (tl, q) => {
    tl.from(q('.m-af'), { opacity: 0, duration: 0.45, stagger: (i, el) => Number(el.dataset.c) * 0.012 })
    tl.from(q('.m-caso'), { opacity: 0, scale: 0, transformOrigin: '50% 50%', duration: 0.5, stagger: { each: 0.025, from: 'random' } }, 0.55)
  },
  // 1: la regla traza su contorno, los citados se oscurecen y la cifra corre hasta 308
  (tl, q) => {
    const dur = 1.6
    recorrer(tl, q('.m-pkt'), q('.m-borde')[0], { dur, at: 0 })
    tl.from(q('.m-cit'), { fill: C.grayLt, duration: 0.3, ease: 'none', stagger: dur / CITADOS }, 0)
    tl.from(q('.m-cuenta'), { opacity: 0, duration: 0.4 }, 0)
    contar(tl, q('.m-n')[0], 0, CITADOS, (v) => String(Math.round(v)), { dur, at: 0 })
  },
  // 2: los casos que la regla deja fuera quedan señalados; luego, la pregunta
  (tl, q) => {
    tl.from(q('.m-anillo'), { opacity: 0, scale: 2.4, transformOrigin: '50% 50%', duration: 0.6, stagger: 0.07 })
    tl.from(q('.m-capta'), { opacity: 0, y: 12, duration: 0.6 }, 0.15)
    tl.from(q('.dek'), { opacity: 0, y: 12, duration: 0.6 }, 0.9)
  },
]

/* ---------- Fig. 2: 1 de cada 20 y la edad ---------- */
export function Edad() {
  const bandas = ['<40', '40-49', '50-59', '60-69', '70+']
  const vals = bandas.map((b) => eda.tasa_edad[b])
  const x0 = 660, ancho = 700, y0 = 56, alto = 310, max = 20
  const yv = (v) => y0 + alto - (v / max) * alto
  const paso = ancho / bandas.length
  return (
    <Svg w={1400} h={480} label={`Uno de cada veinte pacientes tuvo un ACV. La tasa sube de ${vals[0]} % bajo 40 años a ${vals[4]} % sobre 70.`}>
      <B k={0}>
        <text className="pl" x="0" y="30">a</text>
        <g transform="translate(0 64)">
          {rango(0, 20).map((i) => {
            const x = (i % 10) * 44
            const y = Math.floor(i / 10) * 44
            return i === 0 ? (
              <circle key={i} className="e-caso" cx={x + 19} cy={y + 19} r="21" fill={C.caso} />
            ) : (
              <rect key={i} className="e-af" x={x} y={y} width="38" height="38" rx="4" fill={C.grayLt} />
            )
          })}
        </g>
        <g className="e-uno">
          <text className="lx" x="0" y="232">1 de cada 20</text>
          <text className="l" x="0" y="268">pacientes tuvo un ACV:</text>
          <text className="l" x="0" y="298">{datos.casos} de {miles(datos.filas)} ({pct(datos.prevalencia, 2)})</text>
        </g>
      </B>
      <B k={1} className="e-acc">
        <text className="s" x="0" y="352">Un modelo que siempre dice</text>
        <text className="s" x="0" y="382">«no ACV» acierta el {pct(1 - datos.prevalencia, 0)} y no</text>
        <text className="s" x="0" y="412">detecta a nadie: no se usa accuracy.</text>
      </B>

      <B k={2}>
        <g className="e-ejes">
          <text className="pl" x="530" y="30">b</text>
          <text className="l" x={x0 - 60} y="30">% con ACV por edad (entrenamiento, n = {miles(datos.n_train)})</text>
          {[0, 5, 10, 15, 20].map((t) => (
            <g key={t}>
              <line className="gr" x1={x0 - 30} x2={x0 + ancho} y1={yv(t)} y2={yv(t)} />
              <text className="tick" x={x0 - 42} y={yv(t) + 8} textAnchor="end">{t} %</text>
            </g>
          ))}
          {bandas.map((b, i) => (
            <text key={b} className="l" x={x0 + paso * i + paso / 2} y={y0 + alto + 38} textAnchor="middle">{b}</text>
          ))}
          <text className="l" x={x0 + ancho / 2} y={y0 + alto + 84} textAnchor="middle">Edad (años)</text>
        </g>
        {vals.map((v, i) => {
          const cx = x0 + paso * i + paso / 2
          return <rect key={bandas[i]} className="e-barra" x={cx - 32} y={yv(v)} width="64" height={y0 + alto - yv(v)} rx="5" fill={i === vals.length - 1 ? C.caso : C.gray} />
        })}
        <line className="ax" x1={x0 - 30} x2={x0 + ancho} y1={y0 + alto} y2={y0 + alto} />
        {[0, vals.length - 1].map((i) => (
          <text key={i} className="lk e-dato" x={x0 + paso * i + paso / 2} y={yv(vals[i]) - 14} textAnchor="middle">{dec(vals[i], 1)} %</text>
        ))}
      </B>
    </Svg>
  )
}

const guionEdad = [
  // 0: diecinueve pacientes sin ACV y uno con ACV
  (tl, q) => {
    tl.from(q('.e-af'), { opacity: 0, scale: 0.4, transformOrigin: '50% 50%', duration: 0.4, stagger: 0.03 })
    tl.from(q('.e-caso'), { opacity: 0, scale: 0, transformOrigin: '50% 50%', duration: 0.6 }, '-=0.15')
    tl.from(q('.e-uno text'), { opacity: 0, y: 12, duration: 0.6, stagger: 0.08 }, '-=0.35')
  },
  // 1: por qué no accuracy
  (tl, q) => {
    tl.from(q('.e-acc text'), { opacity: 0, y: 12, duration: 0.6, stagger: 0.1 })
  },
  // 2: la tasa sube con la edad, barra por barra
  (tl, q) => {
    tl.from(q('.e-ejes'), { opacity: 0, duration: 0.4 })
    tl.from(q('.e-barra'), { scaleY: 0, transformOrigin: '50% 100%', duration: 0.7, stagger: 0.12 }, 0.15)
    tl.from(q('.e-dato'), { opacity: 0, y: 8, duration: 0.5, stagger: 0.6 }, 0.75)
    tl.from(q('.dek'), { opacity: 0, y: 12, duration: 0.6 }, 1.4)
  },
]

/* ---------- Fig. 3: método ---------- */
const ETAPA = [0, 0, 1, 1, 2, 2] // paso de la lámina en que se enciende cada uno de los seis pasos del método
const MY = (i) => 60 + i * 76 // borde superior de la caja del paso i
const FE = 126 // ancho de un fold del ciclo externo
const FI = 122 // y del interno

export function Metodo({ etapas }) {
  const paso = usePaso()
  return (
    <Svg w={1400} h={500} label="Seis pasos del método y esquema de la validación cruzada anidada.">
      <text className="pl" x="0" y="30">a</text>
      {/* Riel: vía gris fija y, encima, el tramo que enciende cada paso. El paquete pasa por debajo de las cajas. */}
      <path className="via mt-riel" d={`M26 ${MY(0) + 26} V${MY(5) + 26}`} />
      {etapas.slice(1).map((p, i) => (
        <B key={p.n} k={ETAPA[i + 1]}>
          <path className={`ruta trazo mt-seg${i}`} pathLength="1" d={`M26 ${MY(i) + 26} V${MY(i + 1) + 26}`} />
        </B>
      ))}
      <rect className="pkt mt-pkt" x="-7" y="-7" width="14" height="14" rx="2" opacity="0" />
      {etapas.map((p, i) => {
        const off = paso < ETAPA[i] ? ' off' : ''
        return (
          <g key={p.n} className={`mt-paso mt-paso${i}`} transform={`translate(0 ${MY(i)})`}>
            <rect className="mt-caja" width="52" height="52" rx="7" fill="#fff" stroke={off ? C.grayLt : C.ink} strokeWidth="4" />
            <text className={`lk mt-t${off}`} x="26" y="38" textAnchor="middle">{p.n}</text>
            <text className={`lb mt-t${off}`} x="74" y="37" style={{ fontSize: 27 }}>{p.t}</text>
          </g>
        )
      })}

      <B k={1} className="mt-cv">
        <text className="pl" x="740" y="30">b</text>
        <g transform="translate(760 40)">
          <text className="lb" x="0" y="22">Ciclo externo: evalúa</text>
          <text className="s" x="0" y="54">20 evaluaciones: 5 folds × 4 repeticiones</text>
          <text className="lb mt-n" x="630" y="22" textAnchor="end" opacity="0">evaluación 1 de 20</text>
          {/* Las partes de entrenamiento bajan al ciclo interno, que elige los hiperparámetros */}
          <path className="via" d="M185 156 V256" />
          <path className="ruta trazo mt-baja" pathLength="1" d="M185 156 V256" />
          <rect className="pkt mt-pkt2" x="-7" y="-7" width="14" height="14" rx="2" opacity="0" />
          <path className="punta mt-punta" d="M174 246 L185 264 L196 246" />
          {rango(0, 5).map((i) => (
            <g key={i}>
              <rect x={i * FE} y="84" width="118" height="72" rx="5" fill={C.grayLt} />
              <text className="lb" x={i * FE + 59} y="128" textAnchor="middle" style={{ fill: C.ink2 }}>entrena</text>
            </g>
          ))}
          <g className="mt-ext">
            <rect y="84" width="118" height="72" rx="5" fill={C.model} />
            <text className="lb" x="59" y="128" textAnchor="middle" style={{ fill: '#fff' }}>evalúa</text>
          </g>
          <text className="lb" x="214" y="202">Ciclo interno: elige</text>
          <text className="s" x="214" y="232">5 folds, PR-AUC</text>
          {rango(0, 5).map((i) => (
            <g key={i}>
              <rect x={30 + i * FI} y="262" width="114" height="68" rx="5" fill={C.grayLt} />
              <text className="lb" x={30 + i * FI + 57} y="303" textAnchor="middle" style={{ fill: C.ink2 }}>entrena</text>
            </g>
          ))}
          <g transform={`translate(${30 + 4 * FI} 0)`}>
            <g className="mt-int">
              <rect y="262" width="114" height="68" rx="5" fill={C.gray} />
              <text className="lb" x="57" y="303" textAnchor="middle" style={{ fill: '#fff' }}>valida</text>
            </g>
          </g>
        </g>
      </B>
    </Svg>
  )
}

// Un paso del método se enciende cuando llega el paquete: su caja y su texto pasan de espera a tinta.
function encender(tl, q, i, at) {
  tl.from(q(`.mt-paso${i} .mt-caja`), { stroke: C.grayLt, duration: 0.35, ease: 'none' }, at)
  tl.from(q(`.mt-paso${i} .mt-t`), { fill: C.ink3, duration: 0.35, ease: 'none' }, at)
}

const guionMetodo = [
  // 0: los seis pasos aparecen en espera; el paquete enciende el 1 y baja al 2
  (tl, q) => {
    tl.from(q('.mt-paso, .mt-riel'), { opacity: 0, duration: 0.4, stagger: 0.04 })
    encender(tl, q, 0, 0.35)
    const t = recorrer(tl, q('.mt-pkt'), q('.mt-seg0')[0], { dur: 0.55, at: 0.6 })
    encender(tl, q, 1, t)
  },
  // 1: pasos 3 y 4, y la validación anidada en marcha. Evalúa recorre los folds de derecha a izquierda,
  // así la evaluación 20 termina en el primer fold, que es donde lo dibuja React.
  (tl, q) => {
    let t = recorrer(tl, q('.mt-pkt'), q('.mt-seg1')[0], { dur: 0.55, at: 0 })
    encender(tl, q, 2, t)
    t = recorrer(tl, q('.mt-pkt'), q('.mt-seg2')[0], { dur: 0.55, at: t + 0.15 })
    encender(tl, q, 3, t)
    t += 0.2
    const ext = q('.mt-ext')
    const int = q('.mt-int')
    const n = q('.mt-n')[0]
    tl.from(q('.mt-cv'), { opacity: 0, duration: 0.45 }, t)
    tl.set(ext, { x: 4 * FE }, 0)
    tl.set(int, { x: -4 * FI }, 0)
    tl.call(texto, [n, 'evaluación 1 de 20'], t)
    tl.to(n, { opacity: 1, duration: 0.3 }, t + 0.3)
    t = recorrer(tl, q('.mt-pkt2'), q('.mt-baja')[0], { dur: 0.6, at: t + 0.5 })
    tl.from(q('.mt-punta'), { opacity: 0, duration: 0.2 }, t - 0.1)
    for (let p = 1; p <= 4; p++) tl.to(int, { x: (p - 4) * FI, duration: 0.18, ease: 'power2.inOut' }, t + (p - 1) * 0.22)
    t += 4 * 0.22 + 0.1
    tl.fromTo(ext, { scale: 1.08 }, { scale: 1, transformOrigin: '50% 50%', duration: 0.45, immediateRender: false }, t)
    t += 0.5
    for (let e = 2; e <= 20; e++) {
      const p = 4 - ((e - 1) % 5)
      const largo = p === 4 // de vuelta al último fold: un salto más largo
      tl.to(ext, { x: p * FE, duration: largo ? 0.22 : 0.12, ease: 'power2.inOut' }, t)
      tl.call(texto, [n, `evaluación ${e} de 20`], t + 0.1)
      t += largo ? 0.26 : 0.16
    }
    tl.to(n, { opacity: 0, duration: 0.4 }, t + 0.6)
  },
  // 2: pasos 5 y 6
  (tl, q) => {
    let t = recorrer(tl, q('.mt-pkt'), q('.mt-seg3')[0], { dur: 0.55, at: 0 })
    encender(tl, q, 4, t)
    t = recorrer(tl, q('.mt-pkt'), q('.mt-seg4')[0], { dur: 0.55, at: t + 0.15 })
    encender(tl, q, 5, t)
  },
]

/* ---------- Fig. 4: tres criterios, tres modelos (puntos por evaluación) ---------- */
export function Tira({ criterios }) {
  const paso = usePaso()
  const dom = [-9, 7]
  const x0 = 330, ancho = 690
  const xs = (v) => x0 + ((v - dom[0]) / (dom[1] - dom[0])) * ancho
  const filaH = 80, y0 = 62
  const corto = (n) => n.replace('Regresión logística', 'Reg. logística')
  // el criterio i aparece en el paso i + 2: primero el eje y luego las 20 evaluaciones
  const eligeA = Object.fromEntries(criterios.map((c, i) => [c.modelo, { ...c, k: i + 2 }]))
  const kGana = eligeA[gana]?.k ?? 0
  const yAxis = y0 + filaH * familias.length
  return (
    <Svg w={1400} h={yAxis + 90} label="Casos extra frente a la regla en cada una de 20 evaluaciones, por familia de modelos.">
      <B k={0}>
        <g className="t-ejes">
          {rango(-8, 8).filter((v) => v % 2 === 0).map((v) => (
            <g key={v}>
              <line className="gr" x1={xs(v)} x2={xs(v)} y1={y0 - 10} y2={yAxis} />
              <text className="tick" x={xs(v)} y={yAxis + 34} textAnchor="middle">{v > 0 ? `+${v}` : v}</text>
            </g>
          ))}
          <line className="ax" x1={x0 - 10} x2={x0 + ancho + 10} y1={yAxis} y2={yAxis} />
          <text className="l" x={x0 + ancho / 2} y={yAxis + 76} textAnchor="middle">Casos extra frente a la regla, con las mismas citas (por cada ~40 casos)</text>
        </g>
        <path className="t-cero trazo" pathLength="1" d={`M${xs(0)} ${yAxis} V${y0 - 14}`} stroke={C.ink} strokeWidth="3.5" />
        <text className="lb t-cero-l" x={xs(0)} y={y0 - 26} textAnchor="middle">Regla actual = 0</text>
        {familias.map((f, k) => (
          <text key={f.nombre} className="l t-nombre" x={x0 - 26} y={y0 + filaH * k + 54} textAnchor="end" style={{ fontWeight: f.nombre === gana ? 800 : 500, fill: f.nombre === gana ? C.ink : C.ink2 }}>
            {corto(f.nombre)}
          </text>
        ))}
      </B>

      <B k={1}>
        <text className="s t-n" x="1068" y="30" opacity="0">evaluación 1 de 20</text>
        {familias.map((f, k) => {
          const base = y0 + filaH * k + 56
          const gana_ = f.nombre === gana
          const col = gana_ ? C.model : C.gray
          const cuenta = {}
          return (
            <g key={f.nombre}>
              {f.por_fold.map((v, j) => {
                const n = (cuenta[v] = (cuenta[v] || 0) + 1)
                return (
                  <circle key={j} className="t-punto" data-j={j} cx={xs(v)} cy={base - 5 - (n - 1) * 7.4} r="3.9" fill={col} fillOpacity={gana_ ? 0.95 : 0.7} stroke="#fff" strokeWidth="1.4">
                    <title>{`${corto(f.nombre)}: ${mas(v, 0)} casos extra en una evaluación`}</title>
                  </circle>
                )
              })}
              <line className="t-sd" x1={xs(f.extra - f.extra_sd)} x2={xs(f.extra + f.extra_sd)} y1={base + 14} y2={base + 14} stroke={col} strokeWidth="4.5" strokeLinecap="round" />
              <circle className={`t-media${gana_ ? ' t-media-gana' : ''}`} data-m={f.nombre} cx={xs(f.extra)} cy={base + 14} r="8.5" fill={gana_ ? (paso >= kGana ? C.caso : C.model) : col} stroke="#fff" strokeWidth="2.5">
                <title>{`${corto(f.nombre)}: promedio ${mas(f.extra)} ± ${dec(f.extra_sd)}`}</title>
              </circle>
            </g>
          )
        })}
      </B>

      {familias.map((f, k) => {
        const c = eligeA[f.nombre]
        if (!c) return null
        const base = y0 + filaH * k + 56
        return (
          <B key={f.nombre} k={c.k} data-crit={c.criterio} data-m={f.nombre}>
            {/* El criterio apunta a su modelo: la guía se traza desde la etiqueta hasta la fila */}
            <path className="t-guia trazo" pathLength="1" d={`M1052 ${base - 4} H${xs(Math.max(...f.por_fold, f.extra + f.extra_sd)) + 22}`} stroke={C.grayLt} strokeWidth="2.5" fill="none" />
            <rect className="pkt" x="-6" y="-6" width="12" height="12" rx="2" opacity="0" />
            <text className="lb" x="1068" y={base - 10}>{c.criterio}</text>
            <text className="s" x="1068" y={base + 20}>elige este: {mas(f.extra)} casos</text>
            {c.criterio === 'PR-AUC' && <text className="s" x="1068" y={base + 48}>y cita al {pct(f.citados)}</text>}
          </B>
        )
      })}
    </Svg>
  )
}

// Paso de un criterio: la guía se dibuja hacia el modelo que elige y su promedio late una vez.
const criterio = (id) => (tl, q) => {
  const sel = `[data-crit="${id}"]`
  tl.from(q(`${sel} text`), { opacity: 0, x: 14, duration: 0.5, stagger: 0.08 }, 0)
  const t = recorrer(tl, q(`${sel} .pkt`), q(`${sel} .t-guia`)[0], { dur: 0.6, at: 0.1 })
  const m = q(sel)[0]?.dataset.m
  tl.fromTo(q(`.t-media[data-m="${m}"]`), { scale: 1.8 }, { scale: 1, transformOrigin: '50% 50%', duration: 0.5, immediateRender: false }, t)
  return t
}

const guionTira = [
  // 0: el eje y la regla en cero
  (tl, q) => {
    tl.from(q('.t-ejes'), { opacity: 0, duration: 0.4 })
    tl.from(q('.t-cero'), { strokeDashoffset: 1, duration: 0.6 }, 0.15)
    tl.from(q('.t-cero-l'), { opacity: 0, y: 8, duration: 0.5 }, 0.55)
    tl.from(q('.t-nombre'), { opacity: 0, x: -12, duration: 0.5, stagger: 0.07 }, 0.25)
  },
  // 1: el torneo, evaluación por evaluación; después, promedio y una desviación estándar
  (tl, q) => {
    const n = q('.t-n')[0]
    tl.to(n, { opacity: 1, duration: 0.25 }, 0)
    for (let j = 0; j < 20; j++) {
      tl.from(q(`.t-punto[data-j="${j}"]`), { opacity: 0, scale: 0, transformOrigin: '50% 50%', duration: 0.3 }, 0.1 + j * 0.11)
      tl.call(texto, [n, `evaluación ${j + 1} de 20`], 0.1 + j * 0.11)
    }
    const t = 0.1 + 20 * 0.11 + 0.2
    tl.from(q('.t-sd'), { scaleX: 0, transformOrigin: '50% 50%', duration: 0.7, stagger: 0.08 }, t)
    tl.from(q('.t-media'), { opacity: 0, scale: 0, transformOrigin: '50% 50%', duration: 0.45, stagger: 0.08 }, t + 0.25)
    tl.to(n, { opacity: 0, duration: 0.4 }, t + 1)
  },
  criterio('PR-AUC'),
  criterio('Métrica de negocio'),
  // 4: la regla fijada antes de ver resultados elige al más simple, que queda en rojo
  (tl, q) => {
    const t = criterio('Parsimonia')(tl, q)
    tl.from(q('.t-media-gana'), { fill: C.model, duration: 0.4, ease: 'none' }, t + 0.1)
    tl.from(q('.dek'), { opacity: 0, y: 12, duration: 0.6 }, t + 0.4)
  },
]

/* ---------- Fig. 5: curva de captura y control de recall ---------- */
const W5 = 880, H5 = 520
const PX = 96, PY = 14, GW = 756, GH = 410
const X5 = (v) => PX + v * GW
const Y5 = (v) => PY + GH - v * GH

export function Captura() {
  const [r, setR] = useState(0.8)
  const op = operacion.find((o) => o.recall_objetivo === r)
  const ruta = curvas.x.map((x, i) => `${i ? 'L' : 'M'} ${X5(x).toFixed(1)} ${Y5(curvas.fuera_de_fold[i]).toFixed(1)}`).join(' ')
  const recallRegla = recallAl(regla.citados)
  const gap = (recallRegla - regla.recall) * 100
  const dif = (regla.citados - op.citados) * 100
  // recuadro de zoom: con las mismas citas la brecha es chica en la curva completa
  const z = { x0: 0.27, x1: 0.43, y0: 0.69, y1: 0.915 }
  const ib = { x: 452, y: 240, w: 400, h: 150 } // debajo de la diagonal: ahí no hay datos
  const ix = (v) => ib.x + ((v - z.x0) / (z.x1 - z.x0)) * ib.w
  const iy = (v) => ib.y + ib.h - ((v - z.y0) / (z.y1 - z.y0)) * ib.h
  const segmento = curvas.x.map((x, i) => [x, curvas.fuera_de_fold[i]]).filter(([x]) => x >= z.x0 - 0.02 && x <= z.x1 + 0.02)
  const rutaZoom = segmento.map(([x, y], i) => `${i ? 'L' : 'M'} ${ix(x).toFixed(1)} ${iy(y).toFixed(1)}`).join(' ')
  const medio = (iy(regla.recall) + iy(recallRegla)) / 2
  const bx = ix(regla.citados) + 20
  const marco = `M ${X5(z.x0)} ${Y5(z.y1)} H ${X5(z.x1)} V ${Y5(z.y0)} H ${X5(z.x0)} Z`
  const guiaV = (x, y) => `M ${x} ${y + 13} V ${PY + GH}`
  const guiaH = (x, y) => `M ${x - 13} ${y} H ${PX}`

  // Al cambiar el recall objetivo, el punto viaja por la curva (no en línea recta) y la cifra corre.
  const refs = { punto: useRef(null), v: useRef(null), h: useRef(null), dt: useRef(null) }
  const previo = useRef(r)
  useAntesDePintar(() => {
    const a = operacion.find((o) => o.recall_objetivo === previo.current)
    previo.current = r
    if (!a || a === op || reducido()) return undefined
    // los puntos de operación no caen justo sobre la curva interpolada: el desvío se reparte a lo largo del viaje
    const ea = a.recall - recallAl(a.citados)
    const eb = op.recall - recallAl(op.citados)
    const o = { t: 0 }
    const pon = () => {
      const c = a.citados + (op.citados - a.citados) * o.t
      const x = X5(c)
      const y = Y5(recallAl(c) + ea + (eb - ea) * o.t)
      refs.punto.current?.setAttribute('cx', x)
      refs.punto.current?.setAttribute('cy', y)
      refs.v.current?.setAttribute('d', guiaV(x, y))
      refs.h.current?.setAttribute('d', guiaH(x, y))
      texto(refs.dt.current, pct(c))
    }
    pon()
    const tw = gsap.to(o, { t: 1, duration: 0.6, ease: EASE, onUpdate: pon })
    return () => void tw.progress(1).kill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r])

  return (
    <div className="captura" data-captura>
      <Svg w={W5} h={H5} label="Curva: porcentaje de casos captados según el porcentaje de pacientes citados, con el punto de la regla actual y el punto de operación elegido.">
        <B k={0}>
          <g className="c-ejes">
            {[0, 20, 40, 60, 80, 100].map((t) => (
              <g key={t}>
                <line className="gr" x1={PX} x2={PX + GW} y1={Y5(t / 100)} y2={Y5(t / 100)} />
                <text className="tick" x={PX - 14} y={Y5(t / 100) + 8} textAnchor="end">{t}</text>
                <text className="tick" x={X5(t / 100)} y={PY + GH + 34} textAnchor="middle">{t}</text>
              </g>
            ))}
            <line className="ax" x1={PX} x2={PX + GW} y1={PY + GH} y2={PY + GH} />
            <text className="l" x={PX + GW / 2} y={PY + GH + 80} textAnchor="middle">% de pacientes citados</text>
            <text className="l" x="30" y={PY + GH / 2} textAnchor="middle" transform={`rotate(-90 30 ${PY + GH / 2})`}>% de casos de ACV captados</text>
          </g>
          <path className="c-azar trazo" pathLength="1" d={`M ${PX} ${PY + GH} L ${PX + GW} ${PY}`} stroke={C.grayLt} strokeWidth="2.5" fill="none" />
          {/* Cada punto de la curva es un umbral: un paquete la recorre y la curva se dibuja detrás */}
          <path className="c-curva trazo" pathLength="1" d={ruta} fill="none" stroke={C.model} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
          <circle className="pkt c-pkt" r="9" opacity="0" style={{ stroke: C.model }} />
          <text className="lb halo c-modelo-l" x="194" y="206" textAnchor="end">Modelo</text>
          <text className="l halo c-azar-l" x="655" y="152">Citar al azar</text>
        </B>
        <B k={2}>
          <path className="c-marco trazo" pathLength="1" d={marco} fill="none" stroke={C.ink2} strokeWidth="2" />
          <path className="c-conector trazo" pathLength="1" d={`M ${X5(z.x1)} ${Y5(z.y0)} L ${ib.x} ${ib.y}`} stroke={C.ink2} strokeWidth="1.5" fill="none" />
        </B>
        <B k={1} className="c-regla">
          <line x1={X5(regla.citados)} y1={Y5(regla.recall) + 9} x2={X5(regla.citados)} y2={PY + GH} stroke={C.gray} strokeWidth="2.5" opacity=".45" />
          <rect className="c-regla-m" x={X5(regla.citados) - 8} y={Y5(regla.recall) - 8} width="16" height="16" rx="2" fill={C.ink2} stroke="#fff" strokeWidth="3" />
          <text className="lb halo" x={X5(regla.citados) + 18} y={Y5(regla.recall) + 8}>Regla</text>
        </B>
        <B k={1} className="c-op">
          <path ref={refs.v} className="c-guia trazo" pathLength="1" d={guiaV(X5(op.citados), Y5(op.recall))} stroke={C.model} strokeWidth="2.5" opacity=".45" fill="none" />
          <path ref={refs.h} className="c-guia trazo" pathLength="1" d={guiaH(X5(op.citados), Y5(op.recall))} stroke={C.model} strokeWidth="2.5" opacity=".45" fill="none" />
          <circle ref={refs.punto} className="c-op-m" cx={X5(op.citados)} cy={Y5(op.recall)} r="12" fill={C.model} stroke="#fff" strokeWidth="3.5" />
        </B>
        <B k={2} className="c-zoom">
          <clipPath id="clip-zoom"><rect x={ib.x} y={ib.y} width={ib.w} height={ib.h} /></clipPath>
          <rect x={ib.x} y={ib.y} width={ib.w} height={ib.h} fill="#fff" stroke={C.ink2} strokeWidth="2" />
          {[70, 75, 80, 85, 90].map((t) => (
            <g key={t}>
              <line className="gr" x1={ib.x} x2={ib.x + ib.w} y1={iy(t / 100)} y2={iy(t / 100)} />
              <text className="tick halo" x={ib.x - 8} y={iy(t / 100) + 8} textAnchor="end">{t}</text>
            </g>
          ))}
          {[30, 35, 40].map((t) => (
            <text key={t} className="tick halo" x={ix(t / 100)} y={ib.y + ib.h + 28} textAnchor="middle">{t}</text>
          ))}
          <g clipPath="url(#clip-zoom)">
            <path className="c-zoom-curva trazo" pathLength="1" d={rutaZoom} fill="none" stroke={C.model} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
            <line className="c-brecha" x1={ix(regla.citados)} x2={ix(regla.citados)} y1={iy(regla.recall) - 2} y2={iy(recallRegla) + 2} stroke={C.caso} strokeWidth="9" strokeLinecap="round" />
            <rect x={ix(regla.citados) - 9} y={iy(regla.recall) - 9} width="18" height="18" rx="2" fill={C.ink2} stroke="#fff" strokeWidth="3" />
            <circle cx={ix(op.citados)} cy={iy(op.recall)} r="11" fill={C.model} stroke="#fff" strokeWidth="3" />
          </g>
          <text className="lb c-zoom-t" x={ib.x + 12} y={ib.y + 30}>Ampliación</text>
          <text className="lb halo c-zoom-t" x={bx} y={medio + 18}>{`+${dec(gap, 1)} puntos de recall`}</text>
          <text className="l halo c-zoom-t" x={bx} y={medio + 46}>{`unos ${Math.round((gap / 100) * regla.casos_por_fold)} casos de cada 40`}</text>
        </B>
      </Svg>
      <B as="aside" k={1} className="mando">
        <h3>
          Recall objetivo
          <span>Elige cuántos casos captar y mira lo que cuesta.</span>
        </h3>
        <div
          className="seg"
          role="radiogroup"
          aria-label="Recall objetivo"
          onKeyDown={(e) => {
            const i = operacion.findIndex((o) => o.recall_objetivo === r)
            const j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : i
            if (j !== i && operacion[j]) {
              setR(operacion[j].recall_objetivo)
              e.currentTarget.querySelectorAll('button')[j]?.focus()
            }
          }}
        >
          {/* Con el mouse el botón suelta el foco: las flechas y el control remoto siguen pasando de paso.
              Con teclado (detail 0) el foco se queda y las flechas mueven la selección. */}
          {operacion.map((o) => (
            <button
              key={o.recall_objetivo}
              role="radio"
              aria-checked={o.recall_objetivo === r}
              onClick={(e) => {
                setR(o.recall_objetivo)
                if (e.detail > 0) e.currentTarget.blur()
              }}
            >
              {Math.round(o.recall_objetivo * 100)}
            </button>
          ))}
        </div>
        <dl className="lectura" aria-live="polite">
          <div className="modelo">
            <dt ref={refs.dt}>{pct(op.citados)}</dt>
            <dd>de los afiliados citados capta el {pct(op.recall)} de los casos (precisión {dec(op.precision, 3)}).</dd>
          </div>
          <div className="regla">
            <dt>{pct(regla.citados)}</dt>
            <dd>
              necesita la regla actual y capta el {pct(regla.recall)}.
              {r === 0.8 && ` Con recall 80 %, el modelo cita ${dec(dif, 1)} puntos menos.`}
            </dd>
          </div>
        </dl>
      </B>
    </div>
  )
}

const guionCaptura = [
  // 0: ejes y diagonal del azar; un paquete recorre la curva y la curva se dibuja detrás
  (tl, q) => {
    tl.from(q('.c-ejes'), { opacity: 0, duration: 0.4 })
    tl.from(q('.c-azar'), { strokeDashoffset: 1, duration: 0.8, ease: 'power1.inOut' }, 0.1)
    tl.from(q('.c-azar-l'), { opacity: 0, duration: 0.4 }, 0.7)
    recorrer(tl, q('.c-pkt'), q('.c-curva')[0], { dur: 1.8, at: 0.45 })
    tl.from(q('.c-modelo-l'), { opacity: 0, x: -10, duration: 0.5 }, 1)
  },
  // 1: la regla y el punto de operación; las guías salen del punto hacia los ejes
  (tl, q) => {
    tl.from(q('.c-regla'), { opacity: 0, duration: 0.35 })
    tl.from(q('.c-regla-m'), { scale: 0, transformOrigin: '50% 50%', duration: 0.45 }, 0)
    tl.from(q('.c-op-m'), { opacity: 0, scale: 0, transformOrigin: '50% 50%', duration: 0.5 }, 0.45)
    tl.from(q('.c-guia'), { strokeDashoffset: 1, duration: 0.6 }, 0.7)
    tl.from(q('.mando'), { opacity: 0, x: 18, duration: 0.6 }, 0.55)
  },
  // 2: la ampliación muestra la brecha con las mismas citas
  (tl, q) => {
    tl.from(q('.c-marco'), { strokeDashoffset: 1, duration: 0.6, ease: 'power1.inOut' })
    tl.from(q('.c-conector'), { strokeDashoffset: 1, duration: 0.35 }, 0.55)
    tl.from(q('.c-zoom'), { opacity: 0, duration: 0.4 }, 0.8)
    tl.from(q('.c-zoom-curva'), { strokeDashoffset: 1, duration: 0.6 }, 0.9)
    tl.from(q('.c-brecha'), { scaleY: 0, transformOrigin: '50% 100%', duration: 0.6 }, 1.35)
    tl.from(q('.c-zoom-t'), { opacity: 0, y: 8, duration: 0.5, stagger: 0.12 }, 1.6)
    tl.from(q('.dek'), { opacity: 0, y: 12, duration: 0.6 }, 1.9)
  },
]

/* ---------- Fig. 6: la prueba única y a quién deja fuera ---------- */
export function Prueba() {
  const p = prueba.puntual
  const ic = prueba.ic
  const fa = { x0: 140, ancho: 460 }
  const xr = (v) => fa.x0 + ((v - 0.5) / 0.5) * fa.ancho
  const xe = (v) => fa.x0 + ((v + 1) / 6) * fa.ancho
  const filas = [
    { n: 'Modelo', v: p.recall, lo: ic.recall[0], hi: ic.recall[1], col: C.model },
    { n: 'Regla', v: p.recall_regla, lo: ic.recall_regla[0], hi: ic.recall_regla[1], col: C.gray },
  ]
  const j = grupo('Edad', '18-59')
  const m = grupo('Edad', '≥60')
  const barras = [
    { g: '18 a 59 años', casos: j.casos_cv, modelo: j.recall_cv, regla: j.recall_regla_cv, cm: j.citados_cv, cr: j.citados_regla_cv },
    { g: '60 años o más', casos: m.casos_cv, modelo: m.recall_cv, regla: m.recall_regla_cv, cm: m.citados_cv, cr: m.citados_regla_cv },
  ]
  const by0 = 104, bh = 240, bx0 = 90
  const yb = (v) => by0 + bh - v * bh
  return (
    <div className="dos">
      <Svg w={650} h={480} label={`Intervalos de confianza en la prueba: recall del modelo ${dec(p.recall)} y casos extra ${p.casos_extra} con intervalo de ${ic.casos_extra[0]} a ${ic.casos_extra[1]}.`}>
        <B k={0}>
          <g className="p-ejes-a">
            <text className="pl" x="0" y="28">a</text>
            <text className="lb" x="36" y="28">Recall en la prueba ({datos.casos_test} casos)</text>
            {[0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((t) => (
              <g key={t}>
                <line className="gr" x1={xr(t)} x2={xr(t)} y1="56" y2="200" />
                <text className="tick" x={xr(t)} y="234" textAnchor="middle">{dec(t, 1)}</text>
              </g>
            ))}
            <line className="ax" x1={xr(0.5)} x2={xr(1)} y1="200" y2="200" />
          </g>
          {/* Cada intervalo crece desde su estimación hacia sus dos extremos */}
          {filas.map((f, i) => (
            <g key={f.n}>
              <text className="l p-nom" x={fa.x0 - 20} y={100 + i * 62 + 8} textAnchor="end" style={{ fontWeight: 700 }}>{f.n}</text>
              <line className="p-ic" data-o={`${xr(f.v) - xr(f.lo)}px 50%`} x1={xr(f.lo)} x2={xr(f.hi)} y1={100 + i * 62} y2={100 + i * 62} stroke={f.col} strokeWidth="6" strokeLinecap="round" />
              <circle className="p-pt" cx={xr(f.v)} cy={100 + i * 62} r="11" fill={f.col} stroke="#fff" strokeWidth="3">
                <title>{`${f.n}: ${dec(f.v)} (IC 95 %: ${dec(f.lo)} a ${dec(f.hi)})`}</title>
              </circle>
              <text className="l p-val" x={xr(f.hi) + 18} y={100 + i * 62 + 8}>{dec(f.v)}</text>
            </g>
          ))}
        </B>

        <B k={1}>
          <g className="p-ejes-e">
            <text className="lb" x="0" y="292">Casos extra con las citas de la regla</text>
            {[-1, 0, 1, 2, 3, 4, 5].map((t) => (
              <g key={t}>
                <line className="gr" x1={xe(t)} x2={xe(t)} y1="316" y2="392" />
                <text className="tick" x={xe(t)} y="426" textAnchor="middle">{t > 0 ? `+${t}` : t}</text>
              </g>
            ))}
          </g>
          <path className="p-cero trazo" pathLength="1" d={`M${xe(0)} 394 V308`} stroke={C.ink} strokeWidth="3.5" />
          <line className="p-ic-e" data-o={`${xe(p.casos_extra) - xe(ic.casos_extra[0])}px 50%`} x1={xe(ic.casos_extra[0])} x2={xe(ic.casos_extra[1])} y1="354" y2="354" stroke={C.caso} strokeWidth="8" strokeLinecap="round" />
          <circle className="p-pt-e" cx={xe(p.casos_extra)} cy="354" r="13" fill={C.caso} stroke="#fff" strokeWidth="3.5">
            <title>{`Casos extra: ${mas(p.casos_extra, 0)} (IC 95 %: ${ic.casos_extra[0]} a ${ic.casos_extra[1]})`}</title>
          </circle>
          <text className="s p-e-t" x={xe(5)} y="468" textAnchor="end">{`${mas(p.casos_extra, 0)} caso; IC 95 %: ${ic.casos_extra[0]} a ${ic.casos_extra[1]}, incluye el cero`}</text>
        </B>
      </Svg>

      <Svg w={650} h={480} label="Recall por grupo de edad, modelo frente a la regla actual.">
        <B k={2}>
          <g className="p-ejes-b">
            <text className="pl" x="0" y="28">b</text>
            <text className="lb" x="36" y="28">Recall según la edad (fuera de fold)</text>
            <g className="l" transform="translate(36 66)">
              <rect x="0" y="-16" width="17" height="17" rx="2" fill={C.model} />
              <text x="27" y="0">Modelo</text>
              <rect x="140" y="-16" width="17" height="17" rx="2" fill={C.gray} />
              <text x="167" y="0">Regla actual</text>
            </g>
            {[0, 0.5, 1].map((t) => (
              <g key={t}>
                <line className="gr" x1={bx0 - 14} x2="640" y1={yb(t)} y2={yb(t)} />
                <text className="tick" x={bx0 - 24} y={yb(t) + 8} textAnchor="end">{dec(t, 1)}</text>
              </g>
            ))}
          </g>
          {barras.map((b, gi) => {
            const cx = bx0 + 140 + gi * 260
            return (
              <g key={b.g}>
                {[['modelo', C.model, -54], ['regla', C.gray, 12]].map(([k, col, dxx]) => (
                  <g key={k}>
                    <rect className="p-barra" x={cx + dxx} y={yb(b[k])} width="42" height={by0 + bh - yb(b[k])} rx="5" fill={col} />
                    <text className="lk p-b-val" x={cx + dxx + 21} y={yb(b[k]) - 12} textAnchor="middle" style={{ fontSize: 23 }}>{dec(b[k])}</text>
                  </g>
                ))}
                <g className="p-b-g">
                  <text className="lb" x={cx} y={by0 + bh + 40} textAnchor="middle">{b.g}</text>
                  <text className="s" x={cx} y={by0 + bh + 70} textAnchor="middle">{b.casos} casos</text>
                  <text className="s" x={cx} y={by0 + bh + 98} textAnchor="middle">cita al {pct(b.cm, 0)}</text>
                  <text className="s" x={cx} y={by0 + bh + 126} textAnchor="middle">(regla {pct(b.cr, 0)})</text>
                </g>
              </g>
            )
          })}
          <line className="ax" x1={bx0 - 14} x2="640" y1={by0 + bh} y2={by0 + bh} />
        </B>
      </Svg>
    </div>
  )
}

const guionPrueba = [
  // 0: recall en la prueba; cada intervalo crece desde su estimación
  (tl, q) => {
    tl.from(q('.p-ejes-a'), { opacity: 0, duration: 0.4 })
    tl.from(q('.p-nom'), { opacity: 0, x: -10, duration: 0.45, stagger: 0.1 }, 0.15)
    tl.from(q('.p-pt'), { opacity: 0, scale: 0, transformOrigin: '50% 50%', duration: 0.45, stagger: 0.15 }, 0.3)
    tl.from(q('.p-ic'), { scaleX: 0, transformOrigin: (i, el) => el.dataset.o, duration: 0.8, stagger: 0.15 }, 0.5)
    tl.from(q('.p-val'), { opacity: 0, duration: 0.4, stagger: 0.15 }, 1)
  },
  // 1: casos extra; cuando el intervalo toca el cero, la línea del cero lo marca
  (tl, q) => {
    tl.from(q('.p-ejes-e'), { opacity: 0, duration: 0.4 })
    tl.from(q('.p-cero'), { strokeDashoffset: 1, duration: 0.5 }, 0.15)
    tl.from(q('.p-pt-e'), { opacity: 0, scale: 0, transformOrigin: '50% 50%', duration: 0.45 }, 0.45)
    tl.from(q('.p-ic-e'), { scaleX: 0, transformOrigin: (i, el) => el.dataset.o, duration: 0.9 }, 0.65)
    tl.to(q('.p-cero'), { strokeWidth: 8, duration: 0.18, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 1.3)
    tl.from(q('.p-e-t'), { opacity: 0, y: 8, duration: 0.5 }, 1.5)
    tl.from(q('.dek'), { opacity: 0, y: 12, duration: 0.6 }, 1.7)
  },
  // 2: recall por edad
  (tl, q) => {
    tl.from(q('.p-ejes-b'), { opacity: 0, duration: 0.4 })
    tl.from(q('.p-barra'), { scaleY: 0, transformOrigin: '50% 100%', duration: 0.7, stagger: 0.12 }, 0.15)
    tl.from(q('.p-b-val'), { opacity: 0, y: 8, duration: 0.4, stagger: 0.12 }, 0.7)
    tl.from(q('.p-b-g'), { opacity: 0, duration: 0.4, stagger: 0.12 }, 0.9)
  },
]

/* ---------- Conclusión: un punto por paso; la tabla llega con el resultado ---------- */
const guionConclusion = rango(0, 3).map((k) => (tl, q) => {
  tl.from(q(`.concl li[data-b="${k}"]`), { opacity: 0, y: 14, duration: 0.6 })
  if (k === 0) tl.from(q('.tabla caption, .tabla tr'), { opacity: 0, duration: 0.45, stagger: 0.06 }, 0.25)
})

/* ---------- campo de cuadros de la portada ---------- */
export function Campo({ animar = true }) {
  const ref = useRef(null)
  const cols = 26, filas = 15
  const rojos = useMemo(() => new Set(barajar(rango(0, cols * filas), rng(5)).slice(0, 13)), [])
  // El campo se arma en diagonal y después se encienden los trece casos, uno por uno
  useAntesDePintar(() => {
    if (!animar || reducido()) return undefined
    const q = gsap.utils.selector(ref.current)
    const tl = gsap.timeline({ defaults: { ease: EASE }, delay: 0.25 })
    tl.from(q('rect'), { opacity: 0, duration: 0.6, stagger: (i, el) => (Number(el.dataset.c) + Number(el.dataset.f)) * 0.022 })
    tl.from(q('circle'), { opacity: 0, scale: 0, transformOrigin: '50% 50%', duration: 0.5, stagger: 0.12 }, '-=0.3')
    return () => detener(tl)
  }, [animar])
  return (
    <svg ref={ref} className="campo" viewBox={`0 0 ${cols * 30} ${filas * 30}`} aria-hidden="true">
      {rango(0, cols * filas).map((i) =>
        rojos.has(i) ? (
          <circle key={i} cx={(i % cols) * 30 + 12} cy={Math.floor(i / cols) * 30 + 12} r="13" fill="#ff5a6e" />
        ) : (
          <rect key={i} data-c={i % cols} data-f={Math.floor(i / cols)} x={(i % cols) * 30} y={Math.floor(i / cols) * 30} width="24" height="24" rx="3" fill="#25365c" />
        ),
      )}
    </svg>
  )
}

// Guion de cada lámina: un arreglo con una función por paso (mismo largo que `pasos` en content.js).
export const guiones = {
  porque: guionMatriz,
  datos: guionEdad,
  metodo: guionMetodo,
  interesante: guionTira,
  modelo: guionCaptura,
  prueba: guionPrueba,
  conclusion: guionConclusion,
}
