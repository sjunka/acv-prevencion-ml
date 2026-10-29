// Vista K: el tablero explicado como FAQ (hover = vista previa, clic = lightbox con carrusel).
// Es el HTML autónomo de src/maquina.html dentro de un iframe; las tipografías se inyectan en línea
// (siguen funcionando sin internet) y las teclas K y L se reenvían desde el iframe.
import fBc6 from '@fontsource/barlow-condensed/latin-600.css?inline'
import fBc7 from '@fontsource/barlow-condensed/latin-700.css?inline'
import fBs5 from '@fontsource/barlow-semi-condensed/latin-500.css?inline'
import fBs6 from '@fontsource/barlow-semi-condensed/latin-600.css?inline'
import fDseg from '@fontsource/dseg7-classic/latin-400.css?inline'
import html from './maquina.html?raw'

const DOC = html.replace('</head>', () => `<style>${[fBc6, fBc7, fBs5, fBs6, fDseg].join('\n')}</style></head>`)

export function VistaMaquina() {
  return <iframe className="vista-maquina" title="Cómo piensa la máquina" srcDoc={DOC} />
}
