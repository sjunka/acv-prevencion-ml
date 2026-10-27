// Tablero de dos carriles: arriba la operación (a quién se cita), abajo el laboratorio (cómo se midió).
// React dibuja el estado final de cada paso (ESTADOS[g]); el guion de GSAP solo anima la llegada:
// el paquete recorre la ruta, la ruta queda encendida y los medidores corren hasta su cifra.
import { useRef } from 'react'
import '@fontsource/barlow-condensed/latin-600.css'
import '@fontsource/barlow-condensed/latin-700.css'
import '@fontsource/barlow-semi-condensed/latin-500.css'
import '@fontsource/barlow-semi-condensed/latin-600.css'
import '@fontsource/dseg7-classic/latin-400.css'
import './tablero.css'
import { familias } from './datos'
import { animarPaso, contar, detener, recorrer } from './motion'
import { B, PasoCtx, useAntesDePintar } from './paso'
import { ESCENAS, ESTADOS, INICIO, MEDS, PASOS, primero } from './tablero-datos'

// Módulos: x, y, ancho, alto, título. Todo en un viewBox de 1000 x 640.
const M = {
  afil: [24, 90, 130, 110, 'Afiliados'],
  regla: [240, 52, 200, 76, 'Regla actual'],
  modelo: [240, 152, 200, 76, 'Modelo'],
  umbral: [490, 152, 130, 76, 'Umbral'],
  citas: [740, 52, 240, 76, 'Citas'],
  sin: [740, 152, 240, 76, 'Sin cita'],
  datos: [24, 314, 140, 76, 'Datos'],
  part: [24, 412, 140, 60, 'Partición'],
  boveda: [24, 516, 140, 100, 'Bóveda'],
  pipe: [230, 318, 200, 110, 'Pipeline'],
  smote: [230, 452, 200, 56, 'SMOTE'],
  eval: [230, 580, 200, 48, 'Evaluación'],
  modelos: [480, 312, 290, 316, ''],
  sel: [810, 312, 172, 316, 'Selección'],
}
const FILAS = ['m-rl', 'm-rls', 'm-knn', 'm-rf', 'm-gb']
const NOMBRES = ['Reg. logística', 'Logística + SMOTE', 'kNN + SMOTE', 'Random forest', 'Gradient boosting']
const fy = (i) => 348 + 54 * i

// Rutas: trazos ortogonales de borde a borde de módulo.
const R = {
  'af-regla': 'M154 120 H197 V90 H240',
  'af-modelo': 'M154 170 H197 V190 H240',
  'regla-citas': 'M440 76 H740',
  'regla-fuera': 'M440 108 H660 V200 H740',
  'modelo-umbral': 'M440 190 H490',
  'umbral-citas': 'M620 172 H710 V116 H740',
  'umbral-fuera': 'M620 214 H740',
  'datos-part': 'M94 390 V412',
  'part-boveda': 'M94 472 V516',
  'part-pipe': 'M164 442 H186 V350 H230',
  'pipe-smote': 'M330 428 V452',
  'pipe-modelos': 'M430 360 H480',
  'smote-modelos': 'M430 480 H480',
  interno: 'M490 346 H762 V622 H490 Z',
  'modelos-eval': 'M480 612 H430',
  externo: 'M430 592 H455 V334 H430',
  'rl-sel': 'M770 368 H810',
  'sel-modelo': 'M896 312 V246 H340 V228',
  'boveda-modelo': 'M24 570 H14 V246 H290 V228',
  'smote-eval': 'M330 508 V522',
  'boveda-pipe': 'M164 580 H206 V396 H230',
  'gb-sel': 'M770 591 H796',
  'rf-sel': 'M770 537 H796',
}
// Barra roja donde se detiene lo rechazado, y placa que dice por qué.
const BARRA = {
  'smote-eval': [300, 520, 60, 6],
  'boveda-pipe': [213, 382, 6, 28],
  'gb-sel': [794, 577, 6, 28],
  'rf-sel': [794, 523, 6, 28],
}
const PLACA = {
  'smote-eval': [240, 530, 180, 44, ['SMOTE no toca', 'la evaluación']],
  'boveda-pipe': [30, 562, 128, 48, ['Sellada hasta', 'el final']],
  'gb-sel': [816, 566, 160, 38, [`Cita al ${(familias[4].citados * 100).toFixed(1)} %`]],
  'rf-sel': [816, 500, 160, 54, ['Empate: gana', 'el más simple']],
}
const FMT = {
  recall: (v) => v.toFixed(1),
  citados: (v) => v.toFixed(1),
  extra: (v) => v.toFixed(2),
  umb: (v) => v.toFixed(3),
  eval: (v) => String(Math.round(v)),
}
const ROTULO = { recall: 'Recall %', citados: 'Citados %', extra: 'Casos extra /40', umb: 'Umbral', eval: 'Evaluación n/20' }
const GHOST = { recall: '88.8', citados: '88.8', extra: '8.88', umb: '8.888', eval: '88' }
const ANUN = [
  ['desbalance', 'DESBALANCE 1:20', 'ambar'],
  ['fuga', 'FUGA BLOQUEADA', 'rojo'],
  ['empate', 'EMPATE EN EL RUIDO', 'ambar'],
  ['abierta', 'PRUEBA ABIERTA', 'verde'],
  ['ic', 'IC INCLUYE 0', 'ambar'],
]
const angulo = (u) => (0.5 - u) * 600 // perilla: 0.504 casi vertical, 0.359 girada a la derecha
const valMed = (est, k) => (k === 'umb' ? est.umb : est.med[k] == null ? null : Number(est.med[k]))

// Guion de cada paso, armado a partir de los datos: paquetes, rutas, rechazos y medidores.
function guionDe(s, g) {
  return (tl, q) => {
    const pk = q('.pk')
    const pr = q('.pkr')
    let n = 0
    const largo = (el) => Math.min(1.1, Math.max(0.4, el.getTotalLength() / 420))
    const viaje = (id, at, { rojo = false, extra = 0 } = {}) => {
      const el = q(`.r-${id}`)[0]
      const borde = q(`.b-${id}`)[0]
      if (!el) return at
      const dur = largo(el)
      const pool = rojo ? pr : pk
      const fin = recorrer(tl, pool[n++ % pool.length], el, { dur, at })
      if (borde) tl.fromTo(borde, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: dur, ease: 'power1.inOut' }, at)
      for (let j = 1; j <= extra; j++) {
        const p = pk[n++ % pk.length]
        tl.set(p, { opacity: 1 }, at + 0.16 * j)
        tl.to(p, { motionPath: { path: el }, duration: dur, ease: 'power1.inOut' }, at + 0.16 * j)
        tl.set(p, { opacity: 0 }, at + 0.16 * j + dur)
      }
      return fin + 0.16 * extra
    }
    let t = 0.1
    const ruta = s.ruta ?? []
    ruta.forEach((grupo) => {
      const ids = Array.isArray(grupo) ? grupo : [grupo]
      t = Math.max(...ids.map((id) => viaje(id, t, { extra: s.rafaga ? 2 : 0 }))) + 0.1
    })
    ;(s.rojo ?? []).forEach((id) => { t = viaje(id, t, { rojo: true }) + 0.05 })
    tl.from(q(`[data-b="${g}"].fade`), { opacity: 0, duration: 0.35 }, t)
    tl.from(q('.luz'), { opacity: 0, duration: 0.4 }, Math.max(0, t - 0.25))
    if (s.flag?.includes('lamparas')) {
      tl.from(q('.lamp-t'), { opacity: 0, duration: 0.1, stagger: { each: 0.12, grid: [5, 20], axis: 'x' } }, 0.2)
    }
    // Medidores: corren desde la cifra anterior hasta la nueva (mismo formato que dibuja React).
    const antes = ESTADOS[g - 1]
    const ahora = ESTADOS[g]
    for (const k of MEDS) {
      const a = antes ? valMed(antes, k) : null
      const b = valMed(ahora, k)
      if (b == null || a === b) continue
      contar(tl, q(`[data-med="${k}"]`)[0], a ?? 0, b, FMT[k], { dur: k === 'eval' && s.flag?.includes('lamparas') ? 2.4 : 0.9, at: k === 'eval' ? 0.2 : Math.max(0, t - 0.2) })
    }
    // La perilla gira con un objeto auxiliar: así no hay estilos de GSAP que limpiar en el SVG.
    if (antes && ahora.umb != null && antes.umb !== ahora.umb) {
      const el = q('.perilla')[0]
      const o = { u: antes.umb ?? ahora.umb }
      tl.to(o, { u: ahora.umb, duration: 1.1, ease: 'power2.inOut', onUpdate: () => el?.setAttribute('transform', `rotate(${angulo(o.u)})`) }, Math.max(0, t - 0.2))
    }
  }
}
const GUION = PASOS.map(guionDe)

// ---------- piezas del SVG ----------
function Modulo({ id, est, lamp, children }) {
  const [x, y, w, h, t] = M[id]
  const on = est.ahora.has(id)
  const vivo = on || est.vistos.has(id)
  return (
    <g className={`mod${vivo ? ' vivo' : ''}`}>
      <rect className="cara" x={x} y={y} width={w} height={h} rx="5" />
      {on && <rect className="luz" x={x - 3} y={y - 3} width={w + 6} height={h + 6} rx="7" />}
      {t && <text className="mt" x={x + 10} y={y + 25}>{t}</text>}
      {lamp && <circle className={`lp ${est.lamp[id] ?? ''}`} cx={x + w - 18} cy={y + 18} r="8" />}
      {children}
    </g>
  )
}
const Lec = ({ x, y, k, est, cls = 'ml' }) => <text className={cls} x={x} y={y} data-l={k}>{est.lec[k] ?? ''}</text>

function Ruta({ id, est, g }) {
  const info = est.rutas[id]
  if (!info) return null
  const rojo = est.rojas.has(id)
  const ahora = info.g === g
  const vieja = !ahora && info.ei !== PASOS[g].ei
  return (
    <B k={info.g} className={`rt${rojo ? ' rojo' : ''}${vieja ? ' vieja' : ''}`} data-ruta={id}>
      <path className={`borde trazo b-${id}`} pathLength="1" d={R[id]} />
      <path className={`ruta trazo r-${id}`} pathLength="1" d={R[id]} />
    </B>
  )
}

function Lamparas({ i, f, k }) {
  return (
    <B k={k}>
      {f.por_fold.map((v, j) => (
        <rect key={j} className={`lamp-t ${v > 0 ? 'v' : v < 0 ? 'r' : 'g'}`} x={488 + j * 11.5} y={fy(i) + 30} width="8.5" height="14" rx="2" />
      ))}
    </B>
  )
}

function Tablero({ est, g }) {
  const fx = (k) => primero(k)
  const [px, py, pw, ph] = M.modelos
  const [ux, uy] = M.umbral
  return (
    <svg className="svg" viewBox="0 0 1000 640" role="img" aria-label="Tablero: operación del programa arriba, laboratorio abajo">
      <rect className="carril" x="8" y="8" width="984" height="254" rx="8" />
      <rect className="carril" x="8" y="272" width="984" height="360" rx="8" />
      <text className="cl" x="24" y="32">OPERACIÓN DEL PROGRAMA · escenario supuesto</text>
      <text className="cl" x="24" y="296">LABORATORIO · solo entrenamiento</text>

      {Object.entries(R).map(([id, d]) => <path key={id} className="via" d={d} />)}
      {Object.keys(R).map((id) => <Ruta key={id} id={id} est={est} g={g} />)}
      {Array.from({ length: 6 }, (_, i) => <rect key={i} className="pkt pk" x="-8" y="-8" width="16" height="16" rx="3" opacity="0" />)}
      {Array.from({ length: 2 }, (_, i) => <rect key={i} className="pkt pkr" x="-8" y="-8" width="16" height="16" rx="3" opacity="0" />)}

      <Modulo id="afil" est={est}>
        <text className="ms" x="34" y="141">1 000 de ejemplo</text>
        <Lec x={34} y={175} k="afil" est={est} cls="ml tb-gr" />
      </Modulo>
      <Modulo id="regla" est={est} lamp>
        <text className="ms" x="250" y="102">edad ≥ 60 o hipertensión</text>
      </Modulo>
      <Modulo id="modelo" est={est} lamp>
        <Lec x={250} y={206} k="modelo" est={est} />
      </Modulo>
      <Modulo id="umbral" est={est}>
        <circle className="dial" cx={ux + 100} cy={uy + 44} r="22" />
        <g transform={`translate(${ux + 100} ${uy + 44})`}>
          <g className="perilla" transform={`rotate(${angulo(est.umb ?? 0.5)})`}>
            <line className="aguja" x1="0" y1="0" x2="0" y2="-16" />
          </g>
        </g>
      </Modulo>
      <Modulo id="citas" est={est}><Lec x={750} y={110} k="citas" est={est} /></Modulo>
      <Modulo id="sin" est={est} lamp><Lec x={750} y={210} k="sin" est={est} /></Modulo>

      <Modulo id="datos" est={est}>
        <Lec x={34} y={359} k="datos" est={est} cls="ms" />
        <Lec x={34} y={380} k="datos2" est={est} cls="ms" />
      </Modulo>
      <Modulo id="part" est={est}><Lec x={34} y={458} k="part" est={est} /></Modulo>
      <Modulo id="boveda" est={est} lamp>
        <Lec x={34} y={558} k="boveda" est={est} />
        {(!est.rojas.has('boveda-pipe') || est.lec.boveda === 'abierta una vez') && <Lec x={34} y={586} k="boveda2" est={est} cls="ms" />}
      </Modulo>
      <Modulo id="pipe" est={est} lamp>
        <B k={fx('celdas')}>
          <text className="ms" x="240" y="368">imputar · <tspan className="tb-gr">{est.lec.nulos}</tspan></text>
          <text className="ms" x="240" y="392">escalar · z</text>
          <text className="ms" x="240" y="416">codificar · one-hot</text>
        </B>
      </Modulo>
      <Modulo id="smote" est={est}><text className="ms" x="240" y="496">solo en el fold</text></Modulo>
      <Modulo id="eval" est={est}><Lec x={240} y={620} k="eval" est={est} cls="ms" /></Modulo>

      <Modulo id="modelos" est={est}>
        <text className="ml" x={px + 10} y={py + 25}>5 variantes · {familias.reduce((s, x) => s + x.configs, 0)} conf.</text>
        <B k={fx('interno')}><text className="ms tb-gr" style={{ fontSize: 15 }} x={px + pw - 8} y={py + 25} textAnchor="end">interno · PR-AUC</text></B>
        <B k={fx('interno')}><rect className="marco" x="486" y="342" width="278" height="282" rx="4" /></B>
        {familias.map((fa, i) => (
          <g key={fa.nombre}>
            {est.ahora.has(FILAS[i]) && <rect className="luz" x="484" y={fy(i) - 2} width="282" height="54" rx="4" />}
            <text className="mt" x="492" y={fy(i) + 20}>{NOMBRES[i]}</text>
            <B k={fx('configs')}><text className="ms" x="762" y={fy(i) + 20} textAnchor="end">{fa.configs} conf.</text></B>
            <Lamparas i={i} f={fa} k={fx('lamparas')} />
            <B k={fx('extras')}><text className={`ml${fa.extra < 0 ? ' rj' : ''}`} x="764" y={fy(i) + 44} textAnchor="end">{(fa.extra > 0 ? '+' : '−') + Math.abs(fa.extra).toFixed(2)}</text></B>
          </g>
        ))}
      </Modulo>

      <Modulo id="sel" est={est}>
        {[['sel1', 'PR-AUC', 'Gradient boosting'], ['sel2', 'Casos extra', 'Random forest'], ['sel3', 'Regla previa', 'Reg. logística']].map(([k, a, b], i) => (
          <B key={k} k={fx(k)}>
            <text className="ms" x="820" y={358 + 48 * i}>{a}</text>
            <text className={`ml${k === 'sel3' ? ' tb-gr' : ' tach'}`} x="820" y={380 + 48 * i}>{b}</text>
          </B>
        ))}
      </Modulo>

      {Object.keys(BARRA).map((id) => est.rutas[id] && (
        <B key={id} k={est.rutas[id].g} className="fade" data-id={id}>
          <rect className="barra" x={BARRA[id][0]} y={BARRA[id][1]} width={BARRA[id][2]} height={BARRA[id][3]} />
          <g>
 {!(id === 'boveda-pipe' && est.lec.boveda === 'abierta una vez') && <><rect className="placa" x={PLACA[id][0]} y={PLACA[id][1]} width={PLACA[id][2]} height={PLACA[id][3]} rx="4" />
            {PLACA[id][4].map((l, j) => (
              <text key={l} className="tb-pl" x={PLACA[id][0] + PLACA[id][2] / 2} y={PLACA[id][1] + (PLACA[id][4].length === 1 ? 25 : 19) + 18 * j} textAnchor="middle">{l}</text>
            ))}
          </>}
          </g>
        </B>
      ))}
    </svg>
  )
}

function Medidores({ est }) {
  return (
    <div className="medidores" aria-label="Lecturas de resultados.json">
      {MEDS.map((k) => {
        const v = valMed(est, k)
        return (
          <div className="med" key={k}>
            <span className="rot">{ROTULO[k]}</span>
            <span className="lcd" aria-hidden="false">
              <span className="gh">{GHOST[k]}</span>
              <span className="dg" data-med={k}>{v == null ? '' : FMT[k](v)}</span>
            </span>
            {k === 'recall' && <span className={`meta${est.flags.has('meta80') ? ' on' : ''}`}>meta 80</span>}
          </div>
        )
      })}
    </div>
  )
}

// Un paso es un punto de PASOS; e = escena (0..6), paso = paso dentro de la escena.
export function EscenaTablero({ e, paso, animar, foot }) {
  const ref = useRef(null)
  const g = INICIO[e] + paso
  const est = ESTADOS[g]
  useAntesDePintar(() => {
    if (!animar) return undefined
    const tl = animarPaso(ref.current, GUION, g)
    return () => detener(tl)
  }, [g, animar])
  const esc = ESCENAS[e]
  return (
    <PasoCtx.Provider value={g}>
      <section ref={ref} className="tabl" aria-label={`Escena ${e + 1}: ${esc.titulo}`}>
        <div className="stage">
          <header className="tb-head">
            <span className="tb-n">ESCENA {e + 1} / {ESCENAS.length}</span>
            <h2>{esc.titulo}</h2>
          </header>
          <div className="tb-main">
            <Tablero est={est} g={g} />
            <aside className="tb-col">
              <p className="tb-paso" key={g}>{PASOS[g].t}</p>
              <ul className="anun" aria-label="Anunciadores">
                {ANUN.map(([k, t, c]) => (
                  <li key={k} className={est.ann.has(k) ? `on ${c}` : undefined}>{t}</li>
                ))}
              </ul>
            </aside>
          </div>
          <Medidores est={est} />
          {foot}
        </div>
      </section>
    </PasoCtx.Provider>
  )
}
