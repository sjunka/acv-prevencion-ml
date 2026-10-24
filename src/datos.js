// Cifras del proyecto: todo sale de resultados.json (lo escribe proyecto.ipynb). Nada se escribe a mano en las láminas.
import R from './data/resultados.json'

const NB = ' ' // espacio que no parte la línea (cifra y unidad juntas)

export const pct = (x, d = 1) => `${(x * 100).toFixed(d)}${NB}%`
export const dec = (x, d = 2) => x.toFixed(d)
export const mas = (x, d = 2) => `${x > 0 ? '+' : x < 0 ? '−' : ''}${Math.abs(x).toFixed(d)}`
export const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB)

export const datos = R.datos
export const regla = R.cv.regla // recall, precision y citados de la regla en los folds de la CV anidada
export const reglaTrain = R.final.regla_train
export const umbral = R.final.umbral
export const prueba = R.prueba
export const curvas = R.curvas
export const operacion = R.final.operacion // puntos de operación fuera de fold, recall objetivo 0.70 a 0.90

// Orden de lectura = de la más simple a la más compleja
export const familias = Object.entries(R.cv.familias).map(([nombre, f]) => ({ nombre, ...f }))
export const gana = R.cv.ganador
export const mejorNegocio = R.cv.mejor_casos_extra
export const mejorPrAuc = R.cv.mejor_pr_auc
export const fam = (n) => R.cv.familias[n]

export const grupo = (g, v) => R.grupos.find((r) => r.grupo === g && r.valor === v)
export const factores = Object.entries(R.factores)
  .map(([variable, f]) => ({ variable, ...f }))
  .sort((a, b) => b.shap - a.shap)
export const pesoEdad = R.factores.age.shap / factores.reduce((s, f) => s + f.shap, 0)
export const eda = R.eda

// Recall fuera de fold que logra el modelo al citar al x % (x entre 0 y 1), por interpolación de la curva
export function recallAl(x) {
  const xs = curvas.x
  const i = Math.min(xs.length - 2, Math.max(0, Math.floor(x * (xs.length - 1))))
  const t = (x - xs[i]) / (xs[i + 1] - xs[i])
  return curvas.fuera_de_fold[i] * (1 - t) + curvas.fuera_de_fold[i + 1] * t
}

// Fracción de pacientes que hay que citar para captar al menos `r` de los casos (inversa de la curva)
export function citasPara(r) {
  const ys = curvas.fuera_de_fold
  const j = ys.findIndex((y) => y >= r)
  if (j <= 0) return curvas.x[Math.max(j, 0)]
  const t = (r - ys[j - 1]) / (ys[j] - ys[j - 1])
  return curvas.x[j - 1] + t * (curvas.x[j] - curvas.x[j - 1])
}
