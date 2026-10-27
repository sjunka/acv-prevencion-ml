// Falla si algo publicable (src, public, dist) trae datos que no deben salir: filas de pacientes del dataset
// (la licencia es de uso educativo y solo se publican cifras agregadas), correos o tokens.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const TEXT = new Set(['.js', '.jsx', '.mjs', '.css', '.html', '.json', '.ipynb', '.md', '.txt', '.csv'])
const patrones = [
  // una fila del CSV de Kaggle: id,gender,age,hypertension,heart_disease,ever_married,...
  [/\b\d{1,5},(Male|Female|Other),\d{1,3}(\.\d+)?,[01],[01],(Yes|No),/, 'fila de paciente'],
  [/[\w.+-]+@[\w-]+\.[\w.]+/, 'correo'],
  [/\b(ghp_|github_pat_|sk-ant-|sk-)[A-Za-z0-9_]{16,}/, 'token'],
  [/AKIA[0-9A-Z]{16}/, 'llave de AWS'],
]

function* recorrer(dir) {
  for (const nombre of readdirSync(dir)) {
    const p = join(dir, nombre)
    if (statSync(p).isDirectory()) yield* recorrer(p)
    else if (TEXT.has(extname(p))) yield p
  }
}

const hallazgos = []
for (const d of ['src', 'public', 'dist', 'index.html', 'README.md'].map((d) => join(root, d)).filter(existsSync)) {
  for (const f of statSync(d).isDirectory() ? recorrer(d) : [d]) {
    if (extname(f) === '.csv') {
      hallazgos.push(`${relative(root, f)}: archivo CSV en una carpeta publicable`)
      continue
    }
    readFileSync(f, 'utf8').split('\n').forEach((linea, i) => {
      for (const [re, que] of patrones) {
        const m = linea.match(re)
        if (m) hallazgos.push(`${relative(root, f)}:${i + 1}: ${que} (${m[0].slice(0, 32)})`)
      }
    })
  }
}
if (hallazgos.length) {
  console.error('check-leaks: datos que no deben publicarse:\n' + hallazgos.join('\n'))
  process.exit(1)
}
console.log('check-leaks: sin filas de pacientes, correos ni tokens en lo publicable')
