// Figuras de la sustentación: SVG a mano (sin librería de gráficos).
// Lienzo lógico de ~1400 px de ancho que se muestra a 1.24x (texto de 23 px lógicos = 28 px en 1080p).
// Rojo = casos de ACV y la marca que sostiene el titular (una por lámina); azul = modelo; gris = contexto.
// Los casos son círculos y el resto cuadros: la forma también los distingue, no solo el color.
import { useMemo, useState } from 'react'
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
export function Matriz() {
  const N = 1000, COLS = 50, P = 19, S = 16
  const citados = Math.round(regla.citados * N)
  const casos = Math.round(datos.prevalencia * N)
  const captados = Math.round(casos * regla.recall)
  const fuera = casos - captados
  const rojas = useMemo(() => {
    const r = rng(11)
    return new Set([...barajar(rango(0, citados), r).slice(0, captados), ...barajar(rango(citados, N), r).slice(0, fuera)])
  }, [citados, captados, fuera])
  const filas = Math.floor(citados / COLS)
  const resto = citados - filas * COLS
  const x1 = COLS * P - 3 + 6
  const yA = filas * P - 1.5
  const yB = filas * P + S + 1.5
  const xR = (resto - 1) * P + S + 1.5
  const borde = `M -6 -6 H ${x1} V ${yA} H ${xR} V ${yB} H -6 Z`
  const dx = 10, dy = 14
  const lx = dx + COLS * P + 44
  return (
    <Svg w={1400} h={470} label={`Mil afiliados como cuadros. La regla cita a ${citados}; de ${casos} casos de ACV capta ${captados} y deja ${fuera} fuera.`}>
      <g transform={`translate(${dx} ${dy})`}>
        {rango(0, N).map((i) => {
          const x = (i % COLS) * P
          const y = Math.floor(i / COLS) * P
          return rojas.has(i) ? (
            <circle key={i} className="pop" style={{ '--i': i % 50 }} cx={x + S / 2} cy={y + S / 2} r={S / 2 + 0.8} fill={C.caso} />
          ) : (
            <rect key={i} className="pop" style={{ '--i': i % 50 }} x={x} y={y} width={S} height={S} rx="2" fill={i < citados ? C.gray : C.grayLt} />
          )
        })}
        <path className="late" d={borde} fill="none" stroke={C.ink} strokeWidth="4.5" strokeLinejoin="round" />
      </g>
      <g className="late">
        <line x1={dx + x1 + 2} y1={dy + 56} x2={lx - 12} y2={dy + 56} stroke={C.ink} strokeWidth="2.5" />
        <text className="lx" x={lx} y={dy + 72}>{citados}</text>
        <text className="l" x={lx} y={dy + 106}>afiliados citados</text>
        <text className="l" x={lx} y={dy + 136}>({pct(regla.citados)} del total)</text>

        <circle cx={lx + 12} cy={dy + 198} r="13" fill={C.caso} />
        <text className="lx" x={lx + 36} y={dy + 218}>{captados} de {casos}</text>
        <text className="l" x={lx} y={dy + 256}>casos de ACV captados</text>
        <text className="l" x={lx} y={dy + 286}>({pct(regla.recall)} de los casos)</text>

        <text className="lb" x={lx} y={dy + 342}>{fuera} casos quedan fuera</text>
        <text className="s" x={lx} y={dy + 376}>La regla no ordena: cita a todo</text>
        <text className="s" x={lx} y={dy + 406}>el grupo por igual.</text>
      </g>
      <g transform={`translate(${dx} ${dy + 380 + 50})`} className="l">
        <circle cx="9" cy="-7" r="9.5" fill={C.caso} />
        <text x="26" y="0">caso de ACV</text>
        <rect x="232" y="-16" width="18" height="18" rx="2" fill={C.gray} />
        <text x="260" y="0">afiliado citado</text>
        <rect x="500" y="-16" width="18" height="18" rx="2" fill={C.grayLt} />
        <text x="528" y="0">no citado</text>
      </g>
    </Svg>
  )
}

/* ---------- Fig. 2: 1 de cada 20 y la edad ---------- */
export function Edad() {
  const bandas = ['<40', '40-49', '50-59', '60-69', '70+']
  const vals = bandas.map((b) => eda.tasa_edad[b])
  const x0 = 660, ancho = 700, y0 = 56, alto = 310, max = 20
  const yv = (v) => y0 + alto - (v / max) * alto
  const paso = ancho / bandas.length
  return (
    <Svg w={1400} h={480} label={`Uno de cada veinte pacientes tuvo un ACV. La tasa sube de ${vals[0]} % bajo 40 años a ${vals[4]} % sobre 70.`}>
      <text className="pl" x="0" y="30">a</text>
      <g transform="translate(0 64)">
        {rango(0, 20).map((i) => {
          const x = (i % 10) * 44
          const y = Math.floor(i / 10) * 44
          return i === 0 ? (
            <circle key={i} className="pop" style={{ '--i': i }} cx={x + 19} cy={y + 19} r="21" fill={C.caso} />
          ) : (
            <rect key={i} className="pop" style={{ '--i': i }} x={x} y={y} width="38" height="38" rx="4" fill={C.grayLt} />
          )
        })}
      </g>
      <text className="lx" x="0" y="232">1 de cada 20</text>
      <text className="l" x="0" y="268">pacientes tuvo un ACV:</text>
      <text className="l" x="0" y="298">{datos.casos} de {miles(datos.filas)} ({pct(datos.prevalencia, 2)})</text>
      <text className="s" x="0" y="352">Un modelo que siempre dice</text>
      <text className="s" x="0" y="382">«no ACV» acierta el {pct(1 - datos.prevalencia, 0)} y no</text>
      <text className="s" x="0" y="412">detecta a nadie: no se usa accuracy.</text>

      <text className="pl" x="530" y="30">b</text>
      <text className="l" x={x0 - 60} y="30">% con ACV por edad (entrenamiento, n = {miles(datos.n_train)})</text>
      {[0, 5, 10, 15, 20].map((t) => (
        <g key={t}>
          <line className="gr" x1={x0 - 30} x2={x0 + ancho} y1={yv(t)} y2={yv(t)} />
          <text className="tick" x={x0 - 42} y={yv(t) + 8} textAnchor="end">{t} %</text>
        </g>
      ))}
      {vals.map((v, i) => {
        const cx = x0 + paso * i + paso / 2
        const ultimo = i === vals.length - 1
        return (
          <g key={bandas[i]}>
            <rect className="grow" style={{ '--i': i }} x={cx - 32} y={yv(v)} width="64" height={y0 + alto - yv(v)} rx="5" fill={ultimo ? C.caso : C.gray} />
            <text className="l" x={cx} y={y0 + alto + 38} textAnchor="middle">{bandas[i]}</text>
            {(i === 0 || ultimo) && (
              <text className="lk late" x={cx} y={yv(v) - 14} textAnchor="middle">{dec(v, 1)} %</text>
            )}
          </g>
        )
      })}
      <line className="ax" x1={x0 - 30} x2={x0 + ancho} y1={y0 + alto} y2={y0 + alto} />
      <text className="l" x={x0 + ancho / 2} y={y0 + alto + 84} textAnchor="middle">Edad (años)</text>
    </Svg>
  )
}

/* ---------- Fig. 3: método ---------- */
export function Metodo({ pasos }) {
  return (
    <Svg w={1400} h={500} label="Seis pasos del método y esquema de la validación cruzada anidada.">
      <text className="pl" x="0" y="30">a</text>
      <line x1="26" x2="26" y1="86" y2="470" stroke={C.grid} strokeWidth="4" />
      {pasos.map((p, i) => (
        <g key={p.n} className="late" style={{ animationDelay: `${i * 90 + 200}ms` }} transform={`translate(0 ${60 + i * 76})`}>
          <rect x="0" y="0" width="52" height="52" rx="7" fill="#fff" stroke={C.ink} strokeWidth="4" />
          <text className="lk" x="26" y="38" textAnchor="middle">{p.n}</text>
          <text className="lb" x="74" y="37" style={{ fontSize: 27 }}>{p.t}</text>
        </g>
      ))}

      <text className="pl" x="740" y="30">b</text>
      <g transform="translate(760 40)">
        <text className="lb" x="0" y="22">Ciclo externo: evalúa</text>
        <text className="s" x="0" y="54">20 evaluaciones: 5 folds × 4 repeticiones</text>
        {rango(0, 5).map((i) => (
          <g key={i}>
            <rect className="grow" style={{ '--i': i }} x={i * 126} y="84" width="118" height="72" rx="5" fill={i === 0 ? C.model : C.grayLt} />
            <text className="lb" x={i * 126 + 59} y="128" textAnchor="middle" style={{ fill: i === 0 ? '#fff' : C.ink2 }}>
              {i === 0 ? 'evalúa' : 'entrena'}
            </text>
          </g>
        ))}
        <path d="M 185 166 V 226" stroke={C.ink} strokeWidth="3.5" fill="none" />
        <path d="M 174 214 L 185 232 L 196 214" stroke={C.ink} strokeWidth="3.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <text className="lb" x="214" y="202">Ciclo interno: elige</text>
        <text className="s" x="214" y="232">5 folds, PR-AUC</text>
        {rango(0, 5).map((i) => (
          <g key={i}>
            <rect className="grow" style={{ '--i': i + 5 }} x={30 + i * 122} y="262" width="114" height="68" rx="5" fill={i === 4 ? C.gray : C.grayLt} />
            <text className="lb" x={30 + i * 122 + 57} y="303" textAnchor="middle" style={{ fill: i === 4 ? '#fff' : C.ink2 }}>
              {i === 4 ? 'valida' : 'entrena'}
            </text>
          </g>
        ))}
      </g>
    </Svg>
  )
}

/* ---------- Fig. 4: tres criterios, tres modelos (puntos por evaluación) ---------- */
export function Tira({ criterios }) {
  const dom = [-9, 7]
  const x0 = 330, ancho = 690
  const xs = (v) => x0 + ((v - dom[0]) / (dom[1] - dom[0])) * ancho
  const filaH = 80, y0 = 62
  const corto = (n) => n.replace('Regresión logística', 'Reg. logística')
  const eligeA = Object.fromEntries(criterios.map((c) => [c.modelo, c]))
  const yAxis = y0 + filaH * familias.length
  return (
    <Svg w={1400} h={yAxis + 90} label="Casos extra frente a la regla en cada una de 20 evaluaciones, por familia de modelos.">
      {rango(-8, 8).filter((v) => v % 2 === 0).map((v) => (
        <g key={v}>
          <line className="gr" x1={xs(v)} x2={xs(v)} y1={y0 - 10} y2={yAxis} />
          <text className="tick" x={xs(v)} y={yAxis + 34} textAnchor="middle">{v > 0 ? `+${v}` : v}</text>
        </g>
      ))}
      <line x1={xs(0)} x2={xs(0)} y1={y0 - 14} y2={yAxis} stroke={C.ink} strokeWidth="3.5" />
      <text className="lb" x={xs(0)} y={y0 - 26} textAnchor="middle">Regla actual = 0</text>
      {familias.map((f, k) => {
        const base = y0 + filaH * k + 56
        const gana_ = f.nombre === gana
        const col = gana_ ? C.model : C.gray
        const cuenta = {}
        const c = eligeA[f.nombre]
        return (
          <g key={f.nombre}>
            <text className="l" x={x0 - 26} y={base - 2} textAnchor="end" style={{ fontWeight: gana_ ? 800 : 500, fill: gana_ ? C.ink : C.ink2 }}>
              {corto(f.nombre)}
            </text>
            {f.por_fold.map((v, j) => {
              const n = (cuenta[v] = (cuenta[v] || 0) + 1)
              return (
                <circle key={j} className="pop" style={{ '--i': j + k * 4 }} cx={xs(v)} cy={base - 5 - (n - 1) * 7.4} r="3.9" fill={col} fillOpacity={gana_ ? 0.95 : 0.7} stroke="#fff" strokeWidth="1.4">
                  <title>{`${corto(f.nombre)}: ${mas(v, 0)} casos extra en una evaluación`}</title>
                </circle>
              )
            })}
            <line className="late" x1={xs(f.extra - f.extra_sd)} x2={xs(f.extra + f.extra_sd)} y1={base + 14} y2={base + 14} stroke={col} strokeWidth="4.5" strokeLinecap="round" />
            <circle className="late" cx={xs(f.extra)} cy={base + 14} r="8.5" fill={gana_ ? C.caso : col} stroke="#fff" strokeWidth="2.5">
              <title>{`${corto(f.nombre)}: promedio ${mas(f.extra)} ± ${dec(f.extra_sd)}`}</title>
            </circle>
            {c && (
              <g className="late">
                <line x1={xs(Math.max(...f.por_fold, f.extra + f.extra_sd)) + 22} x2="1052" y1={base - 4} y2={base - 4} stroke={C.grayLt} strokeWidth="2.5" />
                <text className="lb" x="1068" y={base - 10}>{c.criterio}</text>
                <text className="s" x="1068" y={base + 20}>elige este: {mas(f.extra)} casos</text>
                {c.criterio === 'PR-AUC' && <text className="s" x="1068" y={base + 48}>y cita al {pct(f.citados)}</text>}
              </g>
            )}
          </g>
        )
      })}
      <line className="ax" x1={x0 - 10} x2={x0 + ancho + 10} y1={yAxis} y2={yAxis} />
      <text className="l" x={x0 + ancho / 2} y={yAxis + 76} textAnchor="middle">Casos extra frente a la regla, con las mismas citas (por cada ~40 casos)</text>
    </Svg>
  )
}

/* ---------- Fig. 5: curva de captura y control de recall ---------- */
export function Captura() {
  const [r, setR] = useState(0.8)
  const op = operacion.find((o) => o.recall_objetivo === r)
  const W = 880, H = 520
  const px = 96, py = 14, gw = 756, gh = 410
  const X = (v) => px + v * gw
  const Y = (v) => py + gh - v * gh
  const ruta = curvas.x.map((x, i) => `${i ? 'L' : 'M'} ${X(x).toFixed(1)} ${Y(curvas.fuera_de_fold[i]).toFixed(1)}`).join(' ')
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
  return (
    <div className="captura" data-captura>
      <Svg w={W} h={H} label="Curva: porcentaje de casos captados según el porcentaje de pacientes citados, con el punto de la regla actual y el punto de operación elegido.">
        {[0, 20, 40, 60, 80, 100].map((t) => (
          <g key={t}>
            <line className="gr" x1={px} x2={px + gw} y1={Y(t / 100)} y2={Y(t / 100)} />
            <text className="tick" x={px - 14} y={Y(t / 100) + 8} textAnchor="end">{t}</text>
            <text className="tick" x={X(t / 100)} y={py + gh + 34} textAnchor="middle">{t}</text>
          </g>
        ))}
        <line className="ax" x1={px} x2={px + gw} y1={py + gh} y2={py + gh} />
        <line x1={px} y1={py + gh} x2={px + gw} y2={py} stroke={C.grayLt} strokeWidth="2.5" />
        <path className="draw" d={ruta} pathLength="1" fill="none" stroke={C.model} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
        <text className="lb halo" x="194" y="206" textAnchor="end">Modelo</text>
        <text className="l halo" x="655" y="152">Citar al azar</text>
        <rect x={X(z.x0)} y={Y(z.y1)} width={(z.x1 - z.x0) * gw} height={(z.y1 - z.y0) * gh} fill="none" stroke={C.ink2} strokeWidth="2" />
        <line x1={X(z.x1)} y1={Y(z.y0)} x2={ib.x} y2={ib.y} stroke={C.ink2} strokeWidth="1.5" />
        <line x1={X(regla.citados)} y1={Y(regla.recall) + 9} x2={X(regla.citados)} y2={py + gh} stroke={C.gray} strokeWidth="2.5" opacity=".45" />
        <rect x={X(regla.citados) - 8} y={Y(regla.recall) - 8} width="16" height="16" rx="2" fill={C.ink2} stroke="#fff" strokeWidth="3" />
        <text className="lb halo" x={X(regla.citados) + 18} y={Y(regla.recall) + 8}>Regla</text>
        <line x1={X(op.citados)} x2={X(op.citados)} y1={Y(op.recall) + 13} y2={py + gh} stroke={C.model} strokeWidth="2.5" opacity=".45" />
        <line x1={px} x2={X(op.citados) - 13} y1={Y(op.recall)} y2={Y(op.recall)} stroke={C.model} strokeWidth="2.5" opacity=".45" />
        <circle cx={X(op.citados)} cy={Y(op.recall)} r="12" fill={C.model} stroke="#fff" strokeWidth="3.5" />
        <g className="late">
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
            <path d={rutaZoom} fill="none" stroke={C.model} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
            <line x1={ix(regla.citados)} x2={ix(regla.citados)} y1={iy(regla.recall) - 2} y2={iy(recallRegla) + 2} stroke={C.caso} strokeWidth="9" strokeLinecap="round" />
            <rect x={ix(regla.citados) - 9} y={iy(regla.recall) - 9} width="18" height="18" rx="2" fill={C.ink2} stroke="#fff" strokeWidth="3" />
            <circle cx={ix(op.citados)} cy={iy(op.recall)} r="11" fill={C.model} stroke="#fff" strokeWidth="3" />
          </g>
          <text className="lb" x={ib.x + 12} y={ib.y + 30}>Ampliación</text>
          <text className="lb halo" x={bx} y={medio + 18}>{`+${dec(gap, 1)} puntos de recall`}</text>
          <text className="l halo" x={bx} y={medio + 46}>{`unos ${Math.round((gap / 100) * regla.casos_por_fold)} casos de cada 40`}</text>
        </g>
        <text className="l" x={px + gw / 2} y={py + gh + 80} textAnchor="middle">% de pacientes citados</text>
        <text className="l" x="30" y={py + gh / 2} textAnchor="middle" transform={`rotate(-90 30 ${py + gh / 2})`}>% de casos de ACV captados</text>
      </Svg>
      <aside className="mando">
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
          {operacion.map((o) => (
            <button key={o.recall_objetivo} role="radio" aria-checked={o.recall_objetivo === r} onClick={() => setR(o.recall_objetivo)}>
              {Math.round(o.recall_objetivo * 100)}
            </button>
          ))}
        </div>
        <dl className="lectura" aria-live="polite">
          <div className="modelo">
            <dt>{pct(op.citados)}</dt>
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
      </aside>
    </div>
  )
}

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
        <text className="pl" x="0" y="28">a</text>
        <text className="lb" x="36" y="28">Recall en la prueba ({datos.casos_test} casos)</text>
        {[0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((t) => (
          <g key={t}>
            <line className="gr" x1={xr(t)} x2={xr(t)} y1="56" y2="200" />
            <text className="tick" x={xr(t)} y="234" textAnchor="middle">{dec(t, 1)}</text>
          </g>
        ))}
        {filas.map((f, i) => (
          <g key={f.n} className="late" style={{ animationDelay: `${300 + i * 140}ms` }}>
            <text className="l" x={fa.x0 - 20} y={100 + i * 62 + 8} textAnchor="end" style={{ fontWeight: 700 }}>{f.n}</text>
            <line x1={xr(f.lo)} x2={xr(f.hi)} y1={100 + i * 62} y2={100 + i * 62} stroke={f.col} strokeWidth="6" strokeLinecap="round" />
            <circle cx={xr(f.v)} cy={100 + i * 62} r="11" fill={f.col} stroke="#fff" strokeWidth="3">
              <title>{`${f.n}: ${dec(f.v)} (IC 95 %: ${dec(f.lo)} a ${dec(f.hi)})`}</title>
            </circle>
            <text className="l" x={xr(f.hi) + 18} y={100 + i * 62 + 8}>{dec(f.v)}</text>
          </g>
        ))}
        <line className="ax" x1={xr(0.5)} x2={xr(1)} y1="200" y2="200" />

        <text className="lb" x="0" y="292">Casos extra con las citas de la regla</text>
        {[-1, 0, 1, 2, 3, 4, 5].map((t) => (
          <g key={t}>
            <line className="gr" x1={xe(t)} x2={xe(t)} y1="316" y2="392" />
            <text className="tick" x={xe(t)} y="426" textAnchor="middle">{t > 0 ? `+${t}` : t}</text>
          </g>
        ))}
        <line x1={xe(0)} x2={xe(0)} y1="308" y2="394" stroke={C.ink} strokeWidth="3.5" />
        <g className="late" style={{ animationDelay: '700ms' }}>
          <line x1={xe(ic.casos_extra[0])} x2={xe(ic.casos_extra[1])} y1="354" y2="354" stroke={C.caso} strokeWidth="8" strokeLinecap="round" />
          <circle cx={xe(p.casos_extra)} cy="354" r="13" fill={C.caso} stroke="#fff" strokeWidth="3.5">
            <title>{`Casos extra: ${mas(p.casos_extra, 0)} (IC 95 %: ${ic.casos_extra[0]} a ${ic.casos_extra[1]})`}</title>
          </circle>
        </g>
        <text className="s" x={xe(5)} y="468" textAnchor="end">{`${mas(p.casos_extra, 0)} caso; IC 95 %: ${ic.casos_extra[0]} a ${ic.casos_extra[1]}, incluye el cero`}</text>
      </Svg>

      <Svg w={650} h={480} label="Recall por grupo de edad, modelo frente a la regla actual.">
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
        {barras.map((b, gi) => {
          const cx = bx0 + 140 + gi * 260
          return (
            <g key={b.g}>
              {[['modelo', C.model, -54], ['regla', C.gray, 12]].map(([k, col, dxx], ki) => (
                <g key={k}>
                  <rect className="grow" style={{ '--i': gi * 2 + ki }} x={cx + dxx} y={yb(b[k])} width="42" height={by0 + bh - yb(b[k])} rx="5" fill={col} />
                  <text className="lk late" x={cx + dxx + 21} y={yb(b[k]) - 12} textAnchor="middle" style={{ fontSize: 23 }}>{dec(b[k])}</text>
                </g>
              ))}
              <text className="lb" x={cx} y={by0 + bh + 40} textAnchor="middle">{b.g}</text>
              <text className="s" x={cx} y={by0 + bh + 70} textAnchor="middle">{b.casos} casos</text>
              <text className="s" x={cx} y={by0 + bh + 98} textAnchor="middle">cita al {pct(b.cm, 0)}</text>
              <text className="s" x={cx} y={by0 + bh + 126} textAnchor="middle">(regla {pct(b.cr, 0)})</text>
            </g>
          )
        })}
        <line className="ax" x1={bx0 - 14} x2="640" y1={by0 + bh} y2={by0 + bh} />
      </Svg>
    </div>
  )
}

/* ---------- campo de cuadros de la portada ---------- */
export function Campo() {
  const cols = 26, filas = 15
  const rojos = useMemo(() => new Set(barajar(rango(0, cols * filas), rng(5)).slice(0, 13)), [])
  return (
    <svg className="campo" viewBox={`0 0 ${cols * 30} ${filas * 30}`} aria-hidden="true">
      {rango(0, cols * filas).map((i) =>
        rojos.has(i) ? (
          <circle key={i} cx={(i % cols) * 30 + 12} cy={Math.floor(i / cols) * 30 + 12} r="13" fill="#ff5a6e" />
        ) : (
          <rect key={i} x={(i % cols) * 30} y={Math.floor(i / cols) * 30} width="24" height="24" rx="3" fill="#25365c" />
        ),
      )}
    </svg>
  )
}
