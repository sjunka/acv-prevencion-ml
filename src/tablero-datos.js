// Guion del tablero: 7 escenas, 33 pasos. Cada paso dice qué viaja, qué se enciende y qué cambia.
// Las cifras salen de datos.js (resultados.json); lo único escalado es «1 000 afiliados de ejemplo».
import {
  datos, dec, eda, fam, grupo, mas, miles, operacion, pct, pesoEdad, prueba, regla, umbral, familias,
} from './datos'

const mil = (x) => Math.round(x * 1000)
const casos1000 = mil(datos.prevalencia)
const captados1000 = Math.round(casos1000 * regla.recall)
const lr = fam('Regresión logística')
const rf = fam('Random forest')
const gb = fam('Gradient boosting')
const op = (r) => operacion.find((o) => o.recall_objetivo === r)
const p = prueba.puntual
const ic = prueba.ic
const jov = grupo('Edad', '18-59')
const gana = (f) => f.por_fold.filter((x) => x > 0).length
const nConfigs = familias.reduce((s, f) => s + f.configs, 0)
const n1 = (x) => (x * 100).toFixed(1)
const n2 = (x) => x.toFixed(2)
// TODO: «5 folds × 4 repeticiones» no está en resultados.json (solo folds = 20); se deja tecleado hasta que el notebook lo exporte.
const REPS = '5 folds × 4 repeticiones'

// Campos de cada paso: t texto; ruta = viajes en orden (un arreglo = en paralelo); rojo = rutas rechazadas;
// mods = módulos encendidos ahora; lec/med/lamp/umb = lecturas; ann = anunciadores; flag = cosas que aparecen.
const DEF = [
  {
    id: 'problema', fase: 'porque', seg: 60,
    titulo: 'La regla cita a 3 de cada 10 y deja casos fuera.',
    apoyo: 'Escenario supuesto: un programa de prevención con citas limitadas.',
    notas: [
      'Escenario supuesto: un programa de prevención con cupos limitados de citas. No es una EPS real.',
      `La regla cita al ${pct(regla.citados)} y capta el ${pct(regla.recall)} de los casos de ACV.`,
      'La pregunta es de negocio: ¿se llega al 80 % de los casos citando a menos gente?',
    ],
    pasos: [
      { t: `Un programa de prevención no puede citar a todos: de cada 1 000 afiliados, unos ${casos1000} tuvieron un ACV.`, mods: ['afil'], lec: { afil: `${casos1000} de 1 000` } },
      { t: 'Hoy cita con una regla: edad ≥ 60 o hipertensión. Es un supuesto del ejercicio, no una EPS real.', ruta: ['af-regla'], rafaga: true, mods: ['afil', 'regla'], lamp: { regla: 'verde' } },
      { t: `La regla cita a ${mil(regla.citados)} de cada 1 000 (${pct(regla.citados)}) y encuentra ${captados1000} de los ${casos1000} casos: recall ${pct(regla.recall)}.`, ruta: ['regla-citas'], mods: ['regla', 'citas'], lec: { citas: `${mil(regla.citados)} · ${captados1000} casos` }, med: { citados: n1(regla.citados), recall: n1(regla.recall) } },
      { t: `${casos1000 - captados1000} casos quedan sin cita, y la regla no ordena: trata igual a todos los del grupo.`, ruta: ['regla-fuera'], mods: ['regla', 'sin'], lec: { sin: `${casos1000 - captados1000} casos` }, lamp: { sin: 'ambar' } },
      { t: 'La pregunta: ¿un modelo encuentra al menos el 80 % de los casos citando a menos gente?', mods: ['modelo'], lec: { modelo: 'por construir' }, flag: ['meta80'] },
    ],
  },
  {
    id: 'datos', fase: 'como', seg: 70,
    titulo: `${miles(datos.filas)} pacientes y solo 1 de cada 20 tuvo un ACV.`,
    apoyo: 'La prueba queda sellada en una bóveda hasta el final.',
    notas: [
      'Stroke Prediction Dataset de Kaggle, uso educativo. Quedan 5 109 filas tras quitar el identificador y un registro «Other».',
      `Solo el ${pct(datos.prevalencia)} son casos: por eso no se usa accuracy.`,
      'La etiqueta dice quién ya tuvo un ACV, no quién lo tendrá.',
    ],
    pasos: [
      { t: `Stroke Prediction Dataset de Kaggle: ${miles(datos.filas)} pacientes, tras quitar el identificador y un registro «Other».`, mods: ['datos'], lec: { datos: `${miles(datos.filas)} · ${datos.casos} casos` } },
      { t: `Solo 1 de cada 20 tuvo un ACV. Un modelo que siempre dice «no» acierta el ${pct(1 - datos.prevalencia, 0)} y no encuentra a nadie: no usamos accuracy.`, mods: ['datos'], ann: ['desbalance'] },
      { t: `Primero, partición 80/20 estratificada, para conservar el ${pct(datos.prevalencia)} de casos en ambos lados.`, ruta: ['datos-part'], mods: ['datos', 'part'], lec: { part: '80 / 20' } },
      { t: `El 20 % va a la bóveda: ${miles(datos.n_test)} pacientes y ${datos.casos_test} casos que no se tocan hasta el final.`, ruta: ['part-boveda'], mods: ['part', 'boveda'], lec: { boveda: 'sellada', boveda2: `${miles(datos.n_test)} · ${datos.casos_test} casos` }, lamp: { boveda: 'blanca' } },
      { t: `Con el 80 % (${miles(datos.n_train)} pacientes y ${datos.casos_train} casos) exploramos: la edad separa más que nada, de ${pct(eda.tasa_edad['<40'] / 100)} de ACV bajo 40 años a ${pct(eda.tasa_edad['70+'] / 100)} sobre 70.`, mods: ['datos', 'part'], lec: { datos2: `edad ${(eda.tasa_edad['<40']).toFixed(1)}→${eda.tasa_edad['70+'].toFixed(1)} %` } },
    ],
  },
  {
    id: 'fuga', fase: 'como', seg: 60,
    titulo: 'Sin fuga: todo se ajusta solo con el entrenamiento.',
    apoyo: 'SMOTE y la bóveda quedan bloqueados.',
    notas: [
      'El pipeline (imputar, escalar, one-hot) se ajusta en cada fold solo con su entrenamiento.',
      'SMOTE solo crea casos sintéticos en el entrenamiento del fold.',
      'La bóveda no entra ni para elegir el umbral.',
    ],
    pasos: [
      { t: 'Todo el preprocesamiento vive en un pipeline que se ajusta solo con el entrenamiento de cada fold.', ruta: ['part-pipe'], mods: ['part', 'pipe'], lamp: { pipe: 'verde' } },
      { t: `Imputa el IMC (${datos.nulos_bmi} nulos) con la mediana, escala las numéricas y codifica las categóricas con one-hot.`, mods: ['pipe'], lec: { nulos: `${datos.nulos_bmi} nulos` }, flag: ['celdas'] },
      { t: 'SMOTE crea casos sintéticos solo con el entrenamiento del fold: nunca toca los datos con que se evalúa.', ruta: ['pipe-smote'], rojo: ['smote-eval'], mods: ['pipe', 'smote', 'eval'] },
      { t: 'La bóveda tampoco entra: ningún dato de prueba ayuda a ajustar, elegir ni fijar el umbral.', rojo: ['boveda-pipe'], mods: ['boveda', 'pipe'], ann: ['fuga'] },
    ],
  },
  {
    id: 'torneo', fase: 'como', seg: 80,
    titulo: 'El torneo: cada modelo, 20 evaluaciones contra la regla.',
    apoyo: 'Una lámpara por evaluación: verde si el modelo supera a la regla.',
    notas: [
      `${familias.length} variantes y ${nConfigs} configuraciones; el ciclo interno elige con PR-AUC.`,
      `${REPS}: unos ${Math.round(regla.casos_por_fold)} casos por evaluación.`,
      'Se compara con la regla citando al mismo número de pacientes.',
    ],
    pasos: [
      { t: `Compiten cinco variantes: logística con y sin SMOTE, kNN con SMOTE, random forest y gradient boosting. Son ${nConfigs} configuraciones.`, ruta: [['pipe-modelos', 'smote-modelos']], rafaga: true, mods: ['pipe', 'smote', 'modelos'], flag: ['configs'] },
      { t: 'Ciclo interno: dentro del entrenamiento, 5 folds eligen los hiperparámetros de cada variante con PR-AUC.', ruta: ['interno'], mods: ['modelos'], flag: ['interno'] },
      { t: 'Ciclo externo: el modelo elegido puntúa un fold que no vio, y lo comparo con la regla citando al mismo número de pacientes.', ruta: ['modelos-eval'], mods: ['modelos', 'eval'], lec: { eval: 'mismas citas' }, med: { eval: '1' } },
      { t: `Se repite 20 veces (${REPS}, unos ${Math.round(regla.casos_por_fold)} casos cada vez). Cada lámpara es una evaluación: verde si el modelo supera a la regla.`, ruta: ['externo', 'modelos-eval'], mods: ['pipe', 'modelos', 'eval'], flag: ['lamparas'], med: { eval: '20' } },
      { t: `Casos extra con las mismas citas: random forest ${mas(rf.extra)}, logística ${mas(lr.extra)}, logística con SMOTE ${mas(fam('Regresión logística + SMOTE').extra)}, gradient boosting ${mas(gb.extra)} y kNN ${mas(fam('kNN + SMOTE').extra)}, que no supera a la regla.`, mods: ['modelos'], flag: ['extras'] },
    ],
  },
  {
    id: 'criterios', fase: 'interesante', seg: 90,
    titulo: 'Tres criterios eligen tres modelos distintos.',
    apoyo: 'Gradient boosting y random forest se rechazan; pasa la regresión logística.',
    notas: [
      `PR-AUC elegiría gradient boosting (${dec(gb.pr_auc, 3)}), pero cita al ${pct(gb.citados)}.`,
      `Casos extra elegiría random forest, que le saca a la logística ${dec(rf.extra - lr.extra)} casos, menos que una desviación estándar (${dec(rf.extra_sd)}).`,
      'La regla de desempate se fijó en el anteproyecto: gana el más simple.',
    ],
    pasos: [
      { t: `Con PR-AUC, la métrica estándar, ganaría gradient boosting (${dec(gb.pr_auc, 3)}). Pero es el que más cita: ${pct(gb.citados)} de los pacientes, para ${mas(gb.extra)} casos.`, rojo: ['gb-sel'], mods: ['m-gb', 'sel'], med: { citados: n1(gb.citados) }, flag: ['sel1'] },
      { t: `Con casos extra, la métrica del negocio, ganaría random forest: ${mas(rf.extra)}. Pero le saca a la logística ${dec(rf.extra - lr.extra)} casos, menos que una desviación estándar (${dec(rf.extra_sd)}).`, rojo: ['rf-sel'], mods: ['m-rf', 'sel'], ann: ['empate'], flag: ['sel2'] },
      { t: 'La regla la fijé en el anteproyecto, antes de ver resultados: con empate, gana el más simple. Gana la regresión logística, que se lee coeficiente a coeficiente.', ruta: ['rl-sel', 'sel-modelo'], mods: ['m-rl', 'sel', 'modelo'], lec: { modelo: 'regresión logística' }, lamp: { modelo: 'verde' }, flag: ['sel3'] },
      { t: 'Tres criterios eligen tres modelos, y la métrica estándar habría elegido el que más citas cuesta.', mods: ['m-rl', 'm-rf', 'm-gb', 'sel'], flag: ['resumen'] },
    ],
  },
  {
    id: 'operacion', fase: 'resolvimos', seg: 80,
    titulo: 'El umbral es una perilla: las mismas citas, más casos.',
    apoyo: 'Cada punto de recall cuesta más que el anterior.',
    notas: [
      `Umbral ${dec(umbral, 3)}: el más alto que capta al menos el 80 % de los casos fuera de fold.`,
      `Con las mismas citas que la regla: ${mas(lr.extra)} casos de cada 40 (± ${dec(lr.extra_sd)}).`,
      'Subir el recall tiene costo en citas: esa decisión es del programa.',
    ],
    pasos: [
      { t: 'En operación, el modelo da a cada afiliado un puntaje de riesgo y ordena la lista de mayor a menor.', ruta: ['af-modelo'], rafaga: true, mods: ['afil', 'modelo'], lec: { modelo: 'puntaje de 0 a 1' } },
      { t: `El umbral es el más alto que capta al menos el 80 % de los casos fuera de fold: ${dec(umbral, 3)}. Cita al ${pct(op(0.8).citados)} en lugar del ${pct(regla.citados)}.`, ruta: ['modelo-umbral', 'umbral-citas'], mods: ['modelo', 'umbral', 'citas'], umb: umbral, med: { recall: n1(op(0.8).recall), citados: n1(op(0.8).citados) } },
      { t: `Con las mismas citas que la regla: ${mas(lr.extra)} casos de cada 40 (± ${dec(lr.extra_sd)}), y la supera en ${gana(lr)} de las 20 evaluaciones.`, ruta: ['umbral-citas'], mods: ['umbral', 'citas'], med: { extra: n2(lr.extra) } },
      { t: `Cada punto de recall cuesta más que el anterior: para el 90 % habría que citar al ${pct(op(0.9).citados)}. Esa decisión es del programa, no del modelo.`, mods: ['umbral'], umb: op(0.9).umbral, med: { recall: n1(op(0.9).recall), citados: n1(op(0.9).citados) } },
    ],
  },
  {
    id: 'prueba', fase: 'conclusion', seg: 100,
    titulo: 'La prueba confirma el rumbo, pero tiene límites.',
    apoyo: 'La bóveda se abre una sola vez, con el umbral ya fijo.',
    notas: [
      `Recall ${dec(p.recall)} con IC 95 % de ${dec(ic.recall[0])} a ${dec(ic.recall[1])}; casos extra ${mas(p.casos_extra, 0)}, IC de ${ic.casos_extra[0]} a ${ic.casos_extra[1]}.`,
      `Bajo 60 años el modelo capta ${pct(jov.recall_cv, 0)} de los casos y la regla ${pct(jov.recall_regla_cv, 0)}.`,
      'La evidencia principal es la validación anidada, no la prueba.',
    ],
    pasos: [
      { t: `Al final abrí la bóveda una sola vez, con el umbral ya fijo: ${miles(datos.n_test)} pacientes y ${datos.casos_test} casos.`, ruta: ['boveda-modelo'], mods: ['boveda', 'modelo'], lec: { boveda: 'abierta una vez' }, lamp: { boveda: 'verde' }, umb: umbral, ann: ['abierta'] },
      { t: `El modelo encontró ${Math.round(p.recall * p.casos)} de ${p.casos} casos citando al ${pct(p.citados)}, y la regla ${Math.round(p.recall_regla * p.casos)} citando al ${pct(p.citados_regla)}. Recall ${dec(p.recall)}, con IC 95 % de ${dec(ic.recall[0])} a ${dec(ic.recall[1])}.`, ruta: ['modelo-umbral', 'umbral-citas'], mods: ['modelo', 'umbral', 'citas'], lec: { citas: `${Math.round(p.recall * p.casos)} de ${p.casos}` }, med: { recall: n1(p.recall), citados: n1(p.citados) } },
      { t: `Con las mismas citas, ${p.casos_extra === 1 ? 'un caso más' : `${p.casos_extra} casos más`}, y el intervalo va de ${ic.casos_extra[0]} a ${ic.casos_extra[1]}. La prueba confirma el rumbo pero no lo demuestra: la evidencia principal es la anidada.`, mods: ['boveda', 'modelo'], med: { extra: String(p.casos_extra) }, ann: ['ic'] },
      { t: `Límite: bajo 60 años el modelo capta solo el ${pct(jov.recall_cv, 0)} de los casos (la regla, el ${pct(jov.recall_regla_cv, 0)}). Casi 2 de cada 3 quedan sin cita.`, ruta: ['umbral-fuera'], mods: ['umbral', 'sin'], lec: { sin: `bajo 60: ${pct(1 - jov.recall_cv, 0)}` }, lamp: { sin: 'ambar' } },
      { t: `Límite: la etiqueta dice quién ya tuvo un ACV, no quién lo tendrá. Además, la edad pesa el ${pct(pesoEdad, 0)} del modelo.`, mods: ['datos', 'modelo'], lec: { datos2: 'etiqueta pasada', modelo: `edad ${pct(pesoEdad, 0)}` } },
      { t: 'Una mejora real, moderada y bien medida. Siguiente paso: una etiqueta posterior a una fecha de corte y datos reales de la EPS.', mods: ['afil', 'regla', 'modelo', 'umbral', 'citas', 'sin', 'datos', 'part', 'boveda', 'pipe', 'smote', 'eval', 'modelos', 'sel'] },
    ],
  },
]

// Pasos en una sola lista y estado acumulado de cada uno (lo que React dibuja al llegar al paso g).
// Mismo molde que las láminas (content.js): pasos = texto de cada paso, para el guion (N), el pie y las pruebas.
export const ESCENAS = DEF.map((e) => ({ ...e, pasos: e.pasos.map((s) => s.t) }))
export const PASOS = DEF.flatMap((e, ei) => e.pasos.map((s, pi) => ({ ...s, ei, pi })))
export const INICIO = DEF.map((_, i) => DEF.slice(0, i).reduce((s, e) => s + e.pasos.length, 0))
const lista = (x) => (Array.isArray(x) ? x.flat() : x ? [x] : [])

export const ESTADOS = []
export const PRIMERO = {} // clave -> primer paso en que existe (ruta, bandera)
{
  const vistos = new Set()
  let acum = { lec: {}, med: {}, lamp: {}, umb: null, ann: new Set(), flags: new Set(), rutas: {}, rojas: new Set() }
  PASOS.forEach((s, g) => {
    const mark = (k) => { if (!(k in PRIMERO)) PRIMERO[k] = g }
    lista(s.ruta).forEach((id) => { acum.rutas[id] ??= { g, ei: s.ei }; mark(id) })
    lista(s.rojo).forEach((id) => { acum.rutas[id] ??= { g, ei: s.ei }; acum.rojas.add(id); mark(id) })
    lista(s.flag).forEach((f) => { acum.flags.add(f); mark(f) })
    lista(s.ann).forEach((a) => acum.ann.add(a))
    acum = { ...acum, lec: { ...acum.lec, ...s.lec }, med: { ...acum.med, ...s.med }, lamp: { ...acum.lamp, ...s.lamp }, umb: s.umb ?? acum.umb }
    const ahora = new Set(s.mods)
    ESTADOS.push({ ...acum, ann: new Set(acum.ann), flags: new Set(acum.flags), rutas: { ...acum.rutas }, rojas: new Set(acum.rojas), ahora, vistos: new Set(vistos), g })
    s.mods?.forEach((m) => vistos.add(m))
  })
}
export const MEDS = ['recall', 'citados', 'extra', 'umb', 'eval']
export const primero = (k) => PRIMERO[k] ?? Infinity
