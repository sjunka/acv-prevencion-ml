// Página /about: qué se hizo, cómo, con qué datos y dónde está cada archivo. Es la dirección que se entrega.
// Las cifras salen de datos.js (resultados.json), como en las láminas.
import './acerca.css'
import { laminas, portada } from './content'
import { datos, dec, fam, gana, mas, miles, pct, pesoEdad, prueba, regla, sesgo, umbral } from './datos'

// Desde /about/ los archivos publicados están un nivel arriba; desde ?vista=about, en la misma carpeta
export const raiz = /\/about\/?$/.test(window.location.pathname) ? '../' : './'
const REPO = 'https://github.com/sjunka/acv-prevencion-ml'

const lr = fam(gana)
const p = prueba.puntual
const ic = prueba.ic
const cv = sesgo.cv
const METODOS = ['Regla actual', 'Modelo', 'Modelo + umbral por edad', 'Sin reflejos de la edad', 'Sin reflejos de la edad + umbral por edad']

const columnas = [
  ['gender', 'Sexo (se quitó el único registro «Other»)'],
  ['age', 'Edad en años'],
  ['hypertension', 'Hipertensión: 1 sí, 0 no'],
  ['heart_disease', 'Cardiopatía: 1 sí, 0 no'],
  ['ever_married', 'Alguna vez casado (reflejo de la edad)'],
  ['work_type', 'Tipo de trabajo; «children» agrupa a los menores (reflejo de la edad)'],
  ['Residence_type', 'Zona urbana o rural'],
  ['avg_glucose_level', 'Glucosa promedio en sangre (mg/dL)'],
  ['bmi', `Índice de masa corporal; ${datos.nulos_bmi} nulos, imputados con la mediana dentro del pipeline`],
  ['smoking_status', `Tabaquismo; «Unknown» en el ${pct(datos.unknown_fumador, 0)}, se deja como categoría`],
  ['stroke', 'Objetivo: 1 si el paciente ya tuvo un ACV'],
]

const pasos = [
  `Datos: ${miles(datos.filas)} pacientes del Stroke Prediction Dataset; ${datos.casos} tuvieron un ACV (${pct(datos.prevalencia)}).`,
  `Partición 80/20 estratificada antes de mirar nada: ${miles(datos.n_test)} pacientes (${datos.casos_test} casos) quedan sellados como prueba.`,
  'Exploración solo con el entrenamiento: la edad domina; hipertensión, cardiopatía y glucosa alta suben la tasa.',
  'Un solo pipeline (imputar, escalar, codificar y SMOTE donde aplica) ajustado dentro de cada fold, para no filtrar datos.',
  `Cinco modelos comparados con validación cruzada anidada (20 evaluaciones de unos 40 casos) contra la regla «edad ≥ 60 o hipertensión».`,
  `Gana la regresión logística, el más simple a menos de una desviación estándar del mejor: ${mas(lr.extra)} casos con las mismas citas que la regla.`,
  `Umbral de operación ${dec(umbral, 3)} (recall 0.80 fuera de fold) y una sola apertura de la prueba: recall ${dec(p.recall)}, ${mas(p.casos_extra, 0)} caso con IC 95 % de ${ic.casos_extra[0]} a ${ic.casos_extra[1]}.`,
  `Sesgo por edad: un umbral por grupo de edad sube el recall en menores de 60 de ${dec(cv.Modelo.recall_joven)} a ${dec(cv['Modelo + umbral por edad'].recall_joven)}, citando al ${pct(cv['Modelo + umbral por edad'].citados)}.`,
]

function Barra({ v, color }) {
  return (
    <span className="ac-barra">
      <span className="ac-pista">
        <i style={{ width: `${v * 100}%`, background: color }} />
      </span>
      <span>{dec(v)}</span>
    </span>
  )
}

export function Acerca() {
  const e = cv['Modelo + umbral por edad']
  const sp = sesgo.prueba
  return (
    <div className="ac">
      <header className="ac-top">
        <p className="ac-kicker">{portada.curso} · Universidad EAFIT · trabajo individual</p>
        <h1>{portada.titulo}</h1>
        <p className="ac-dek">{portada.subtitulo}. Esta página cuenta qué se hizo, cómo, con qué datos, y deja ver y descargar cada archivo.</p>
        <p className="ac-who">{portada.autor} · Octubre de 2026</p>
        <nav className="ac-acciones" aria-label="Archivos principales">
          <a className="ac-btn ac-btn-1" href={raiz}>Ver la presentación</a>
          <a className="ac-btn" href={`${raiz}proyecto.html`} target="_blank" rel="noreferrer">Notebook (HTML)</a>
          <a className="ac-btn" href={`${raiz}proyecto.ipynb`} download>Notebook (.ipynb)</a>
          <a className="ac-btn" href={`${raiz}sustentacion.pdf`} download>Láminas en PDF</a>
          <a className="ac-btn" href={REPO} target="_blank" rel="noreferrer">Código fuente</a>
        </nav>
      </header>

      <section className="ac-sec">
        <h2>Qué hicimos</h2>
        <p>
          Un programa de prevención (una EPS supuesta, no real) solo puede citar cada mes a una parte de sus afiliados y hoy los escoge con la regla «edad ≥ 60 o hipertensión»: cita al {pct(regla.citados)} y encuentra al {pct(regla.recall, 0)} de los casos. La pregunta: ¿un modelo ordena mejor a los pacientes por riesgo, de modo que se encuentre al menos el 80 % de los casos citando a menos gente?
        </p>
        <p>
          <strong>Respuesta:</strong> sí, con una mejora real pero moderada. La regresión logística capta {mas(lr.extra)} casos de cada 40 con las mismas citas (supera a la regla en {Math.round(lr.supera * 20)} de 20 evaluaciones), o recall 0.80 citando al {pct(lr.citados, 0)} en lugar del {pct(regla.citados, 0)}. La edad pesa el {pct(pesoEdad, 0)} del modelo. El modelo identifica perfiles de mayor riesgo; no dice quién tendrá un ACV, porque la etiqueta es histórica.
        </p>
      </section>

      <section className="ac-sec">
        <h2>Cómo lo hicimos</h2>
        <ol className="ac-pasos">
          {pasos.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
        <p className="ac-nota">
          Cada paso, con su código, sus salidas y el porqué, está en el notebook: corre de cero en unos minutos y descarga los datos solo.
        </p>
      </section>

      <section className="ac-sec">
        <h2>Sesgo por edad</h2>
        <p>
          En la sustentación la profesora pidió reducir el sesgo. Con un solo umbral, el modelo encuentra casi todos los casos de 60 años o más y solo {dec(cv.Modelo.recall_joven)} de los menores de 60: corta la lista donde están casi todos los casos. Se probaron dos correcciones con la misma validación anidada (20 evaluaciones), sin usar la prueba para decidir.
        </p>
        <div className="ac-tabla-envoltura">
          <table className="ac-tabla">
            <caption>Recall (fracción de casos con ACV que quedan citados) por grupo de edad, promedio de 20 evaluaciones. Unos {Math.round(cv.Modelo.casos_joven)} casos menores de 60 por evaluación.</caption>
            <thead>
              <tr>
                <th scope="col">Método</th>
                <th scope="col">Menores de 60</th>
                <th scope="col">60 o más</th>
                <th scope="col">Total</th>
                <th scope="col">Cita al</th>
              </tr>
            </thead>
            <tbody>
              {METODOS.map((m) => (
                <tr key={m} className={m === 'Modelo + umbral por edad' ? 'ac-sel' : ''}>
                  <th scope="row">{m}</th>
                  <td><Barra v={cv[m].recall_joven} color="var(--case)" /></td>
                  <td><Barra v={cv[m].recall_mayor} color="var(--model)" /></td>
                  <td>{dec(cv[m].recall)}</td>
                  <td>{pct(cv[m].citados)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="ac-lista">
          <li>
            <strong>Un umbral por grupo de edad</strong> (igualdad de oportunidad, Hardt et al., 2016) deja a los dos grupos cerca de 0.80 a cambio de citar al {pct(e.citados)} en lugar del {pct(cv.Modelo.citados)}. En la prueba, ya abierta, solo para describir: {sp.por_edad.joven} de {sp.casos_joven} casos menores de 60 en lugar de {sp.unico.joven}, y {sp.por_edad.mayor} de {sp.casos_mayor} mayores en lugar de {sp.unico.mayor}. Con {sesgo.casos_joven_train} casos jóvenes en entrenamiento, ese umbral es inestable.
          </li>
          <li>
            <strong>Quitar las variables que reflejan la edad</strong> (tipo de trabajo y estado civil) no ayuda: el recall en jóvenes casi no cambia y el peso de la edad sube del {pct(sesgo.peso_edad, 0)} al {pct(sesgo.peso_edad_sin_reflejos, 0)}.
          </li>
          <li>
            <strong>Decisión:</strong> el modelo no cambia; el umbral por edad queda como una opción de operación para quien decide. El sesgo se reduce, no se elimina: la etiqueta es histórica y hay pocos casos jóvenes. Siguiente paso: datos reales de la EPS y más casos menores de 60.
          </li>
        </ul>
      </section>

      <section className="ac-sec">
        <h2>Datos</h2>
        <p>
          <a href="https://www.kaggle.com/datasets/fedesoriano/stroke-prediction-dataset" target="_blank" rel="noreferrer">Stroke Prediction Dataset</a> (Kaggle, fedesoriano), de uso educativo: {miles(datos.filas_csv)} filas y 12 columnas; se quitan <code>id</code> y un registro, y quedan {miles(datos.filas)} pacientes. El CSV no se vuelve a publicar aquí: el notebook lo descarga de Kaggle con <code>kagglehub</code>, sin credenciales. En la web solo hay cifras agregadas.
        </p>
        <div className="ac-tabla-envoltura">
          <table className="ac-tabla ac-dic">
            <caption>Columnas que usa el modelo</caption>
            <tbody>
              {columnas.map(([c, d]) => (
                <tr key={c}>
                  <th scope="row"><code>{c}</code></th>
                  <td>{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ac-sec">
        <h2>Las láminas</h2>
        <p>Siete láminas para 10 minutos, cada una armada clic a clic. Un clic en la imagen abre esa lámina en la presentación.</p>
        <ul className="ac-laminas">
          {laminas.map((l, i) => (
            <li key={l.id}>
              <a href={`${raiz}#${i + 1}`}>
                <img src={`${raiz}capturas/lamina-${i + 1}.png`} alt={`Lámina ${i + 1}: ${l.titulo}`} loading="lazy" width="1280" height="720" />
                <span>
                  <b>{i + 1}</b> {l.titulo}
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p>
          Otras dos vistas de la misma presentación: el <a href={`${raiz}?vista=tablero`}>tablero</a> (tecla L), que recorre el método como una máquina, y la <a href={`${raiz}?vista=maquina`}>máquina explicada</a> (tecla K), con el porqué de cada decisión. La tecla S abre las preguntas probables.
        </p>
      </section>

      <section className="ac-sec">
        <h2>El notebook</h2>
        <p>
          <a href={`${raiz}proyecto.html`} target="_blank" rel="noreferrer">Abrir en otra pestaña</a> ·{' '}
          <a href={`${raiz}proyecto.ipynb`} download>Descargar .ipynb</a> ·{' '}
          <a href={`${raiz}proyecto.html`} download>Descargar HTML</a>
        </p>
        <details className="ac-nb">
          <summary>Verlo aquí</summary>
          <iframe src={`${raiz}proyecto.html`} title="Notebook del proyecto" loading="lazy" />
        </details>
      </section>

      <section className="ac-sec">
        <h2>Rehacerla con otros datos</h2>
        <p>
          El repositorio es una plantilla. El <a href={`${REPO}#generar-tu-propia-presentación-prompt`} target="_blank" rel="noreferrer">prompt del README</a> le pide a Claude Code que repita el método con otro CSV y genere la presentación, el notebook y esta página.
        </p>
      </section>

      <footer className="ac-pie">
        <a href={raiz}>Ir a la presentación</a>
        <span>{portada.autor} · {portada.curso}</span>
      </footer>
    </div>
  )
}
