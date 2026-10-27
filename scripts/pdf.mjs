// Imprime dist/index.html?vista=imprimir a public/sustentacion.pdf con Chrome y exige 8 páginas:
// la portada y las 7 láminas, cada una en su último paso. Uso: npm run pdf (después de npm run build).
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const PAGINAS = 8
const root = new URL('..', import.meta.url).pathname
const chrome = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const html = join(root, 'dist/index.html')
const out = join(root, 'public/sustentacion.pdf')
if (!existsSync(html)) throw new Error('Falta dist/index.html: corre npm run build primero')

execFileSync(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--no-pdf-header-footer',
  '--window-size=1920,1080',
  '--virtual-time-budget=8000',
  `--print-to-pdf=${out}`,
  `file://${html}?vista=imprimir`,
], { stdio: 'ignore' })

const paginas = (readFileSync(out, 'latin1').match(/\/Type\s*\/Page(?!s)/g) ?? []).length
copyFileSync(out, join(root, 'dist/sustentacion.pdf'))
if (paginas !== PAGINAS) {
  console.error(`pdf: salió con ${paginas} páginas; deben ser ${PAGINAS} (portada y 7 láminas)`)
  process.exit(1)
}
console.log(`pdf: public/sustentacion.pdf con ${PAGINAS} páginas (copiado a dist/)`)
