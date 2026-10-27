// Texto de la sustentación (10 min + 3 de preguntas). Las cifras vienen de datos.js, no se teclean aquí.
import {
  curvas, datos, dec, eda, fam, gana, grupo, mas, mejorNegocio, mejorPrAuc, miles, operacion, pct, pesoEdad, prueba,
  recallAl, regla, umbral,
} from './datos'

const lr = fam('Regresión logística')
const rf = fam('Random forest')
const gb = fam('Gradient boosting')
const op = (r) => operacion.find((o) => o.recall_objetivo === r)
const p = prueba.puntual
const ic = prueba.ic
const mayores = grupo('Edad', '≥60')
const jovenes = grupo('Edad', '18-59')
const dosDeTres = 1 - jovenes.recall_cv // casos de 18 a 59 años que el modelo no capta
const mil = (x) => Math.round(x * 1000) // escala de la Fig. 1: 1 000 afiliados
const casos1000 = mil(datos.prevalencia)
const captados1000 = Math.round(casos1000 * regla.recall)
const brecha = (recallAl(regla.citados) - regla.recall) * 100 // puntos de recall con las mismas citas que la regla

export const fases = [
  { id: 'porque', nombre: 'Por qué' },
  { id: 'como', nombre: 'Datos y método' },
  { id: 'interesante', nombre: 'Qué interesante' },
  { id: 'resolvimos', nombre: 'Cómo lo resolvimos' },
  { id: 'conclusion', nombre: 'Conclusión' },
]

export const portada = {
  titulo: '¿A quién citamos primero?',
  subtitulo: 'Priorizar pacientes con alto riesgo de ACV para un programa de prevención',
  autor: 'Sergio Alfredo Junca Valero',
  curso: 'ST1613 Aprendizaje de Máquina Aplicado',
  fecha: 'Universidad EAFIT · Octubre de 2026',
}

// seg = segundos sugeridos; suman 560 de los 600 (queda holgura para preguntas del público).
// pasos = lo que agrega cada clic del control remoto; su número es el de pasos del guion animado (figs.jsx).
export const laminas = [
  {
    id: 'porque',
    fase: 'porque',
    seg: 60,
    titulo: 'Una EPS no puede citar a todos sus afiliados.',
    apoyo: 'Hoy escoge con la regla «edad ≥ 60 o hipertensión» (supuesto de este escenario).',
    pregunta: '¿Un modelo capta al menos el 80 % de los casos de ACV citando a menos gente?',
    pasos: [
      `De cada 1 000 afiliados, ${casos1000} tuvieron un ACV.`,
      `La regla «edad ≥ 60 o hipertensión» cita a ${mil(regla.citados)} de cada 1 000 (${pct(regla.citados)}).`,
      `Capta ${captados1000} de ${casos1000} casos y deja ${casos1000 - captados1000} fuera. La pregunta: ¿un modelo lo hace mejor?`,
    ],
    notas: [
      'Escenario supuesto: un programa de prevención con cupos limitados de citas. No es una EPS real.',
      `La regla actual cita al ${pct(regla.citados)} de los pacientes y capta el ${pct(regla.recall)} de los casos de ACV.`,
      'La pregunta es de negocio, no de modelo: ¿se puede ordenar mejor la fila para captar 80 de cada 100 con menos citas?',
    ],
  },
  {
    id: 'datos',
    fase: 'como',
    seg: 70,
    titulo: `${miles(datos.filas)} pacientes y solo 1 de cada 20 tuvo un ACV.`,
    apoyo: `La edad separa más que cualquier otra variable: de ${pct(eda.tasa_edad['<40'] / 100)} bajo 40 años a ${pct(eda.tasa_edad['70+'] / 100)} sobre 70.`,
    pasos: [
      `Solo 1 de cada 20 pacientes tuvo un ACV: ${datos.casos} de ${miles(datos.filas)}.`,
      `Decir siempre «no ACV» acierta el ${pct(1 - datos.prevalencia, 0)} y no detecta a nadie: no se usa accuracy.`,
      `La tasa de ACV sube con la edad: de ${pct(eda.tasa_edad['<40'] / 100)} bajo 40 años a ${pct(eda.tasa_edad['70+'] / 100)} sobre 70.`,
    ],
    claves: [
      `No usamos accuracy: un modelo que siempre dice «no ACV» acierta el ${pct(1 - datos.prevalencia, 0)} y no detecta a nadie.`,
      `Prueba sellada: ${miles(datos.n_test)} pacientes y ${datos.casos_test} casos, abierta una sola vez al final.`,
    ],
    notas: [
      'Stroke Prediction Dataset de Kaggle, uso educativo. Quedan 5 109 filas tras quitar el identificador y un registro «Other».',
      'Solo el 4.87 % son casos: por eso se mide con recall, precisión y casos captados, no con accuracy.',
      'La variable y dice si el paciente ya tuvo un ACV, no si lo tendrá: es la principal limitación y se declara desde el inicio.',
    ],
  },
  {
    id: 'metodo',
    fase: 'como',
    seg: 80,
    titulo: 'Seis pasos, en este orden, para no engañarnos.',
    pasos: [
      'Pasos 1 y 2: partir 80/20, sellar la prueba y preprocesar dentro del pipeline.',
      'Pasos 3 y 4: cinco variantes en validación cruzada anidada; el ciclo interno elige y el externo evalúa, 20 veces.',
      'Pasos 5 y 6: gana el que capta más casos con las mismas citas; umbral con recall de al menos 0.80.',
    ],
    // los seis pasos del método (Fig. 3); se encienden de dos en dos, uno por cada paso de la lámina
    etapas: [
      { n: 1, t: 'Partir 80/20 y sellar la prueba' },
      { n: 2, t: 'Pipeline sin fuga de datos' },
      { n: 3, t: 'Cinco variantes, 57 configuraciones' },
      { n: 4, t: 'Validación cruzada anidada ×20' },
      { n: 5, t: 'Ganador: más casos con las mismas citas' },
      { n: 6, t: 'Umbral con recall ≥ 0.80; prueba una vez' },
    ],
    notas: [
      'Pasos 1 y 2: partición estratificada (conserva el 4.9 % de casos); imputar, escalar y codificar dentro de cada fold. Paso 3: regresión logística (con y sin SMOTE), kNN con SMOTE, random forest y gradient boosting.',
      'La anidada tiene dos ciclos: el interno elige hiperparámetros con PR-AUC; el externo mide con datos que no participaron en esa elección. Son 20 evaluaciones de unos 817 pacientes y 40 casos: permiten ver el ruido en vez de adivinarlo.',
      'La regla del ganador la fijé en el anteproyecto, antes de ver estos resultados: más casos con las citas de la regla; si hay empate dentro de una desviación estándar, el más simple. El umbral es el más alto con recall de al menos 0.80, sin reajustes después.',
    ],
  },
  {
    id: 'interesante',
    fase: 'interesante',
    seg: 100,
    titulo: 'Tres criterios eligen tres modelos distintos.',
    pasos: [
      'Eje: casos extra frente a la regla, citando al mismo número de pacientes.',
      'Las 20 evaluaciones de cada modelo, con su promedio y una desviación estándar.',
      `PR-AUC elige ${mejorPrAuc.toLowerCase()}, el modelo que más cita.`,
      `La métrica de negocio elige ${mejorNegocio.toLowerCase()}.`,
      `La regla fijada antes elige la ${gana.toLowerCase()}: las diferencias caben en el ruido y gana la más simple.`,
    ],
    criterios: [
      {
        criterio: 'PR-AUC',
        modelo: mejorPrAuc,
        dato: `Es el que más cita (${pct(gb.citados)}) y capta solo ${mas(gb.extra)} casos con las citas de la regla.`,
      },
      {
        criterio: 'Métrica de negocio',
        modelo: mejorNegocio,
        dato: `Capta ${mas(rf.extra)} casos de cada ~40, en ${Math.round(rf.supera * 20)} de 20 evaluaciones.`,
      },
      {
        criterio: 'Parsimonia',
        modelo: gana,
        dato: `${mas(lr.extra)} casos: ${dec(rf.extra - lr.extra)} menos que el random forest, y una desviación estándar mide ${dec(rf.extra_sd)}.`,
      },
    ],
    cierre: 'Elegir con la métrica estándar habría costado más citas.',
    notas: [
      '«Casos extra» es cuántos casos más capta el modelo que la regla si ambos citan al mismo número de pacientes, por cada evaluación de unos 40 casos.',
      'Cada punto de la gráfica es una de las 20 evaluaciones: se ve que las diferencias entre los tres caben en el ruido.',
      `Por la regla fijada de antemano gana la regresión logística: capta ${dec(rf.extra - lr.extra)} casos menos que el random forest, menos que una desviación estándar (${dec(rf.extra_sd)}), y se lee coeficiente a coeficiente.`,
      'SMOTE no mejoró la regresión logística y kNN no supera a la regla.',
    ],
  },
  {
    id: 'modelo',
    fase: 'resolvimos',
    seg: 100,
    titulo: 'Con las mismas citas, 2 casos más de cada 40.',
    pasos: [
      'La curva: casos captados según el porcentaje de pacientes citados; cada punto es un umbral.',
      `Con recall ${dec(op(0.8).recall)} el modelo cita al ${pct(op(0.8).citados)}; la regla, al ${pct(regla.citados)}.`,
      `Con las mismas citas que la regla, el recall sube ${dec(brecha, 1)} puntos: unos 2 casos de cada 40.`,
    ],
    apoyo: `${mas(lr.extra)} ± ${dec(lr.extra_sd)} casos, y supera a la regla en ${Math.round(lr.supera * 20)} de 20 evaluaciones.`,
    alterno: `O un recall igual o mayor con ${dec((regla.citados - lr.citados) * 100, 0)} puntos menos de citas: ${pct(lr.citados, 0)} en lugar de ${pct(regla.citados, 0)}.`,
    notas: [
      `El umbral operativo es ${dec(umbral, 3)}: el más alto con recall de al menos 0.80 en predicciones fuera de fold.`,
      'Cada punto de recall cuesta más citas al subir. Esta es la decisión de quien administra el programa; por eso se entrega la tabla de puntos de operación, no un solo número.',
      'Mover el control: con recall 0.90 hay que citar casi al 39 % de los pacientes.',
    ],
  },
  {
    id: 'prueba',
    fase: 'resolvimos',
    seg: 90,
    titulo: 'La prueba confirma el rumbo, pero no lo demuestra.',
    pasos: [
      `Prueba abierta una vez: recall ${dec(p.recall)} del modelo y ${dec(p.recall_regla)} de la regla, con sus intervalos.`,
      `Casos extra con las mismas citas: ${mas(p.casos_extra, 0)}, con intervalo de ${ic.casos_extra[0]} a ${ic.casos_extra[1]}; incluye el cero.`,
      `Por edad: bajo 60 años el modelo capta ${dec(jovenes.recall_cv)} de los casos; la regla, ${dec(jovenes.recall_regla_cv)}.`,
    ],
    apoyo: `Con ${datos.casos_test} casos, un caso mueve el recall 2 puntos.`,
    notas: [
      `Abierta una sola vez: recall ${dec(p.recall)} (IC 95 % ${dec(ic.recall[0])} a ${dec(ic.recall[1])}), precisión ${dec(p.precision, 3)} y cita al ${pct(p.citados)}.`,
      `Con las mismas citas que la regla capta ${p.casos_extra > 0 ? mas(p.casos_extra, 0) : p.casos_extra} caso (IC 95 % ${ic.casos_extra[0]} a ${ic.casos_extra[1]}): el signo coincide con la validación anidada, pero el intervalo incluye el cero.`,
      `Por eso la estimación principal es la anidada. Además, el modelo deja fuera a casi dos de cada tres casos menores de 60 años (recall ${dec(jovenes.recall_cv)} frente a ${dec(jovenes.recall_regla_cv)} de la regla), aunque mejora a la regla ahí.`,
      `La edad pesa el ${pct(pesoEdad, 0)} del modelo; de los cinco factores principales, cuatro coinciden con la evidencia clínica.`,
    ],
  },
  {
    id: 'conclusion',
    fase: 'conclusion',
    seg: 60,
    titulo: 'Una mejora real, moderada y bien medida.',
    pasos: ['Resultado, con la tabla de puntos de operación.', 'Lo interesante.', 'Límites y siguiente paso.'],
    puntos: [
      {
        t: 'Resultado',
        d: `Gana la regresión logística: ${mas(lr.extra)} casos de cada 40 con las mismas citas, o ${dec((regla.citados - lr.citados) * 100, 0)} puntos menos de citas con un recall igual o mayor.`,
      },
      {
        t: 'Lo interesante',
        d: 'La métrica estándar (PR-AUC) habría elegido el modelo que más cita, y las diferencias entre modelos caben en el ruido.',
      },
      {
        t: 'Límites y siguiente paso',
        d: `La etiqueta dice quién ya tuvo un ACV, no quién lo tendrá, y bajo 60 años el modelo capta solo ${dec(jovenes.recall_cv)}. Siguiente paso: una etiqueta posterior a una fecha de corte y datos de la EPS.`,
      },
    ],
    notas: [
      'No promete detectar quién tendrá un ACV: identifica perfiles de alto riesgo para repartir mejor un número limitado de citas.',
      'Todo es reproducible: el notebook corre de cero en pocos minutos y está publicado junto a esta página.',
    ],
  },
]

// Preguntas probables: respuesta corta para decir en voz alta (máx. unas 45 palabras).
export const preguntas = [
  {
    q: '¿Por qué no accuracy?',
    a: `Con ${pct(datos.prevalencia)} de casos, un modelo que siempre dice «no ACV» acierta el ${pct(1 - datos.prevalencia, 0)} y no detecta a nadie.`,
  },
  {
    q: '¿Por qué PR-AUC y no ROC-AUC?',
    a: `El PR-AUC resume precisión y recall; su valor por azar es la prevalencia (${dec(datos.prevalencia, 3)}). El ROC usa la tasa de falsos positivos, con unos 4 900 sanos en el denominador, y se ve optimista (Saito y Rehmsmeier, 2015).`,
  },
  {
    q: '¿Por qué ganó la regresión logística si el random forest captó más?',
    a: `La diferencia, ${dec(rf.extra - lr.extra)} casos, es menor que una desviación estándar (${dec(rf.extra_sd)}): no se distingue del ruido. Entonces gana el más simple y explicable. Esa regla la fijé antes de ver los resultados.`,
  },
  {
    q: '¿Qué es la validación cruzada anidada?',
    a: 'Dos ciclos: el interno elige hiperparámetros y el externo evalúa con datos que no participaron en esa elección. Así la estimación no queda inflada por probar muchas configuraciones. Aquí, 20 evaluaciones.',
  },
  {
    q: '¿Cómo evitas la fuga de datos?',
    a: 'Parto primero; todo el preprocesamiento va dentro del pipeline y se ajusta solo con el entrenamiento de cada fold; SMOTE solo actúa dentro del fold; la prueba se abre una sola vez.',
  },
  {
    q: '¿Por qué recall 0.80 y no 0.90?',
    a: `Es una decisión de negocio. De 0.80 a 0.90 hay que pasar de citar al ${pct(op(0.8).citados)} a citar al ${pct(op(0.9).citados)} de los pacientes. La tabla de puntos de operación deja elegir.`,
  },
  {
    q: '¿De dónde sale la regla «edad ≥ 60 o hipertensión»?',
    a: 'Es un supuesto: dos factores centrales del perfil de Framingham que sirven de línea base. No es de una EPS real.',
  },
  {
    q: '¿El modelo predice quién tendrá un ACV?',
    a: 'No con estos datos: «stroke» dice si el paciente ya tuvo un ACV. El modelo aprende ese perfil de riesgo. Para producción se necesita una etiqueta de ACV posterior a una fecha de corte.',
  },
  {
    q: '¿La mejora es estadísticamente significativa?',
    a: `En la prueba sola, no: +${p.casos_extra} caso con IC de ${ic.casos_extra[0]} a ${ic.casos_extra[1]}. La evidencia principal es la anidada: ${mas(lr.extra)} ± ${dec(lr.extra_sd)} y supera a la regla en ${Math.round(lr.supera * 20)} de 20 evaluaciones.`,
  },
  {
    q: '¿Por qué no redes neuronales?',
    a: 'Hay solo 199 casos de entrenamiento, y con estas variables una red no superó a la regresión logística en AUC (Kokkotis et al., 2022).',
  },
  {
    q: '¿Cuánto vale para la EPS?',
    a: `Con las mismas citas, unos 2 casos más de cada 40; o, con recall cercano a 0.80, unas 200 citas menos por cada 10 000 afiliados. Sin costo por cita en los datos, no lo convierto a pesos.`,
  },
  {
    q: '¿Qué es SMOTE y qué es class_weight?',
    a: `SMOTE crea casos sintéticos de la clase minoritaria interpolando entre vecinos. class_weight no crea datos: hace que cada error en un caso de ACV pese unas 20 veces más. Aquí SMOTE no mejoró a la regresión logística (${mas(fam('Regresión logística + SMOTE').extra)} frente a ${mas(lr.extra)}).`,
  },
  {
    q: '¿Qué es SHAP?',
    a: `Reparte la predicción de cada paciente entre las variables: cuánto sube o baja su riesgo por su edad, su glucosa, etc., frente al promedio. En un modelo lineal es el coeficiente por la distancia al promedio (Lundberg y Lee, 2017). La edad aporta el ${pct(pesoEdad, 0)} del peso.`,
  },
  {
    q: '¿Qué es el intervalo bootstrap?',
    a: 'Se remuestrea la prueba con reemplazo 1 000 veces y se recalcula la métrica; el 95 % central de esos valores es el intervalo. Con 50 casos sale ancho, y eso es lo honesto.',
  },
  {
    q: '¿Es legal usar estos datos?',
    a: 'Para el curso sí: uso educativo. En producción hay que reentrenar con datos de la EPS y contar con autorización de los titulares (Ley 1581 de 2012).',
  },
]

export const repro = {
  notebook: './proyecto.html',
  ipynb: './proyecto.ipynb',
  pdf: './sustentacion.pdf',
}

export const curvasListas = curvas // alias para los gráficos
