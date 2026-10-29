import { useRef } from 'react'
import { fases, laminas, portada } from './content'
import { Campo, Captura, Edad, Matriz, Metodo, Prueba, Tira, guiones } from './figs'
import { datos, dec, grupo, miles, operacion, pct, pesoEdad, recallAl, regla, reglaTrain } from './datos'
import { animarPaso, detener } from './motion'
import { B, PasoCtx, useAntesDePintar } from './paso'

const Chevron = ({ d }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
)

// Riel de cinco fases: la audiencia siempre sabe en cuál va. Los cuadros junto al contador son los pasos de la lámina.
export function Foot({ fase, n, total, paso, pasos, tiempo, onPrev, onNext, onSup }) {
  const k = fases.findIndex((f) => f.id === fase)
  return (
    <footer className="foot">
      <ol className="fases" aria-label="Fases de la exposición">
        {fases.map((f, i) => (
          <li key={f.id} className={`fase${i < k ? ' past' : ''}${i === k ? ' now' : ''}`} aria-current={i === k ? 'step' : undefined}>
            {f.nombre}
          </li>
        ))}
      </ol>
      <div className="nav">
        {tiempo && <span className="tm">{tiempo}</span>}
        <span className="pips" aria-hidden="true">
          {Array.from({ length: pasos }, (_, i) => (
            <i key={i} className={i <= paso ? 'on' : undefined} />
          ))}
        </span>
        <span>
          {n} / {total}
        </span>
        <button className="link-s" onClick={onSup}>
          Suplemento
        </button>
        <button className="btn" aria-label="Anterior" onClick={onPrev}>
          <Chevron d="M15 5l-7 7 7 7" />
        </button>
        <button className="btn" aria-label="Siguiente" onClick={onNext} disabled={n >= total && paso >= pasos - 1}>
          <Chevron d="M9 5l7 7-7 7" />
        </button>
      </div>
    </footer>
  )
}

// Al imprimir no hay animación: el campo debe estar completo en el PDF.
export function Portada({ onStart, animar = true }) {
  return (
    <section className="plate cover" aria-label="Portada">
      <div className="stage">
        <h1>{portada.titulo}</h1>
        <div>
          <p className="sub">{portada.subtitulo}</p>
          <p className="who">
            {portada.autor}
            <span>{portada.curso}</span>
            <span>{portada.fecha}</span>
          </p>
        </div>
        <Campo animar={animar} />
        <div className="go">
          <button type="button" className="btn" onClick={onStart}>
            Comenzar
          </button>
        </div>
      </div>
    </section>
  )
}

// El subtítulo (dek) aparece en el paso dekK: en varias láminas cierra el razonamiento de la figura.
function Plate({ l, n, dek, dekK = 0, legend, foot, refEl, children }) {
  return (
    <section ref={refEl} className="plate" aria-label={`Fig. ${n}: ${l.titulo}`}>
      <div className="stage">
        <div className="head">
          <h2 className="claim">{l.titulo}</h2>
          {dek && (
            <B as="p" k={dekK} className="dek">
              {dek}
            </B>
          )}
        </div>
        <div className="fig">{children}</div>
        {legend && (
          <p className="legend">
            <b className="fig-n">Fig. {n} |</b>
            {legend}
          </p>
        )}
        {foot}
      </div>
    </section>
  )
}

// `paso` es el paso que se ve; con `animar`, la llegada a ese paso se anima con el guion de la lámina.
export function Lamina({ l, n, paso, animar, foot }) {
  const ref = useRef(null)
  useAntesDePintar(() => {
    if (!animar) return undefined
    const tl = animarPaso(ref.current, guiones[l.id], paso)
    return () => detener(tl)
  }, [l.id, paso, animar])
  return <PasoCtx.Provider value={paso}>{cuerpo(l, n, foot, ref)}</PasoCtx.Provider>
}

function cuerpo(l, n, foot, refEl) {
  const met = laminas.find((x) => x.id === 'metodo')
  const int = laminas.find((x) => x.id === 'interesante')
  const jov = grupo('Edad', '18-59')
  const may = grupo('Edad', '≥60')
  const N = 1000
  const props = { l, n, foot, refEl }

  switch (l.id) {
    case 'porque':
      return (
        <Plate {...props} dek={l.pregunta} dekK={2} legend={
          <>
            Mil afiliados escalados desde las tasas de entrenamiento: {Math.round(datos.prevalencia * N)} con ACV. El contorno encierra a los{' '}
            {Math.round(regla.citados * N)} que cita la regla «edad ≥ 60 o hipertensión» (supuesto, no una EPS real).
          </>
        }>
          <Matriz />
        </Plate>
      )
    case 'datos':
      return (
        <Plate {...props} dek={l.apoyo} dekK={2} legend={
          <>
            <strong>a,</strong> Pacientes con ACV: {datos.casos} de {miles(datos.filas)} (Kaggle, uso educativo). <strong>b,</strong> Tasa por edad en el entrenamiento ({miles(datos.n_train)} pacientes,{' '}
            {datos.casos_train} casos). La prueba ({datos.casos_test} casos) sigue sellada.
          </>
        }>
          <Edad />
        </Plate>
      )
    case 'metodo':
      return (
        <Plate {...props} legend={
          <>
            <strong>a,</strong> Orden de los pasos. <strong>b,</strong> Validación anidada: el ciclo interno elige hiperparámetros (<span className="nb">PR-AUC</span>); el externo evalúa con datos que no
            intervinieron en esa elección.
          </>
        }>
          <Metodo etapas={met.etapas} />
        </Plate>
      )
    case 'interesante':
      return (
        <Plate {...props} dek={l.cierre} dekK={4} legend={
          <>
            Casos extra frente a la regla (mismas citas) en 20 evaluaciones de ~40 casos. Barra: ±1 desviación estándar; rojo: el elegido. Las barras se solapan: gana la más
            simple (Tabla S1).
          </>
        }>
          <Tira criterios={int.criterios} />
        </Plate>
      )
    case 'modelo':
      return (
        <Plate {...props} dek={`${l.apoyo} ${l.alterno}`} dekK={2} legend={
          <>
            Fuera de fold ({miles(datos.n_train)} pacientes, {datos.casos_train} casos); cada punto de la curva es un umbral. Ampliación: con las mismas citas que la regla, el recall sube de{' '}
            {pct(regla.recall)} a {pct(recallAl(regla.citados))}.
          </>
        }>
          <Captura />
        </Plate>
      )
    case 'prueba':
      return (
        <Plate {...props} dek={l.apoyo} dekK={1} legend={
          <>
            <strong>a,</strong> Prueba abierta una vez: punto observado; barra, IC 95 % <em>bootstrap</em>. <strong>b,</strong> Recall fuera de fold por edad ({jov.casos_cv} y {may.casos_cv} casos; falta 1 caso de menores de 18).
            La edad pesa el {pct(pesoEdad, 0)} del modelo.
          </>
        }>
          <Prueba />
        </Plate>
      )
    case 'conclusion':
      return (
        <Plate {...props}>
          <div className="concl">
            <ol>
              {l.puntos.map((p, i) => (
                <B as="li" k={i} key={p.t}>
                  <b>{p.t}</b>
                  <span>{p.d}</span>
                </B>
              ))}
            </ol>
            <B as="table" k={0} className="tabla">
              <caption>
                <b>Tabla 1 |</b> Puntos de operación fuera de fold; se entregan con la lista de pacientes ordenada por riesgo. Cada punto de recall cuesta más citas al subir.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Recall objetivo</th>
                  <th scope="col">Citados</th>
                  <th scope="col">Precisión</th>
                  <th scope="col">Umbral</th>
                </tr>
              </thead>
              <tbody>
                {operacion.map((o) => {
                  const sel = o.recall_objetivo === 0.8
                  return (
                    <tr key={o.recall_objetivo}>
                      <td className={sel ? 'sel' : ''}>
                        {sel && <span className="punto" aria-hidden="true" />}
                        {dec(o.recall_objetivo, 2)}
                      </td>
                      <td className={sel ? 'sel' : ''}>{pct(o.citados)}</td>
                      <td className={sel ? 'sel' : ''}>{dec(o.precision, 3)}</td>
                      <td className={sel ? 'sel' : ''}>{dec(o.umbral, 3)}</td>
                    </tr>
                  )
                })}
                <tr className="ref">
                  <td>Regla actual ({dec(reglaTrain.recall, 2)})</td>
                  <td>{pct(reglaTrain.citados)}</td>
                  <td>{dec(reglaTrain.precision, 3)}</td>
                  <td>-</td>
                </tr>
              </tbody>
            </B>
          </div>
        </Plate>
      )
    default:
      return null
  }
}
