import { preguntas, repro } from './content'
import { dec, familias, gana, mas, pct, regla } from './datos'

// Una tecla por pregunta: 1 a 9, 0, A a E y G (F es pantalla completa; App.jsx las lee)
export const TECLAS = '1234567890abcdeg'

export function Suplemento({ tab, q, setTab, setQ, foot }) {
  const cur = preguntas[Math.min(q, preguntas.length - 1)]
  return (
    <section className="plate sup" aria-label="Material suplementario">
      <div className="stage">
        <div className="head">
          <h2 className="claim">Material suplementario</h2>
          <div className="sup-tabs" role="tablist" aria-label="Secciones del material suplementario">
            <button role="tab" aria-selected={tab === 'preguntas'} onClick={() => setTab('preguntas')}>
              Preguntas probables
            </button>
            <button role="tab" aria-selected={tab === 'tabla'} onClick={() => setTab('tabla')}>
              Tabla de modelos
            </button>
          </div>
        </div>
        <div className="sup-body">
          {tab === 'preguntas' ? (
            <>
              <ol className="qlist">
                {preguntas.map((p, i) => (
                  <li key={p.q}>
                    <button aria-current={i === q} onClick={() => setQ(i)}>
                      <b>{(TECLAS[i] ?? '·').toUpperCase()}</b>
                      <span>{p.q}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className="resp" aria-live="polite">
                <h2>{cur.q}</h2>
                <p>{cur.a}</p>
                <div className="refs">
                  <a href={repro.notebook} target="_blank" rel="noreferrer">
                    Notebook (HTML)
                  </a>
                  <a href={repro.ipynb} download>
                    Notebook (.ipynb)
                  </a>
                  <a href={repro.pdf} target="_blank" rel="noreferrer">
                    Láminas en PDF
                  </a>
                  <a href="./about/">Cómo se hizo</a>
                </div>
              </div>
            </>
          ) : (
            <div className="sup-tabla">
              <table className="tabla compacta">
                <caption>
                  <b>Tabla S1 |</b> Validación cruzada anidada: 20 evaluaciones externas de unos 40 casos (promedios). «Casos extra» y «supera» se miden con las mismas citas que la regla.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Modelo</th>
                    <th scope="col">Config.</th>
                    <th scope="col">PR-AUC</th>
                    <th scope="col">ROC-AUC</th>
                    <th scope="col">Recall</th>
                    <th scope="col">Precisión</th>
                    <th scope="col">Citados</th>
                    <th scope="col">Casos extra</th>
                    <th scope="col">Supera a la regla</th>
                  </tr>
                </thead>
                <tbody>
                  {familias.map((f) => (
                    <tr key={f.nombre}>
                      <td className={f.nombre === gana ? 'sel' : ''}>
                        {f.nombre === gana && <span className="punto" aria-hidden="true" />}
                        {f.nombre}
                      </td>
                      <td>{f.configs}</td>
                      <td>{dec(f.pr_auc, 3)}</td>
                      <td>{dec(f.roc_auc, 3)}</td>
                      <td>{dec(f.recall, 3)}</td>
                      <td>{dec(f.precision, 3)}</td>
                      <td>{pct(f.citados)}</td>
                      <td>
                        {mas(f.extra)} ± {dec(f.extra_sd)}
                      </td>
                      <td>{Math.round(f.supera * 20)} de 20</td>
                    </tr>
                  ))}
                  <tr className="ref">
                    <td>Regla actual</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>{dec(regla.recall, 3)}</td>
                    <td>{dec(regla.precision, 3)}</td>
                    <td>{pct(regla.citados)}</td>
                    <td>0</td>
                    <td>-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
        {foot}
      </div>
    </section>
  )
}
