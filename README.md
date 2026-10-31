# ¿A quién citamos primero?

Sustentación del proyecto final de **ST1613 Aprendizaje de Máquina Aplicado** (Universidad EAFIT): priorizar pacientes con alto riesgo de accidente cerebrovascular (ACV) para un programa de prevención. Autor: Sergio Alfredo Junca Valero (trabajo individual).

- Presentación: https://sjunka.github.io/acv-prevencion-ml/
- Notebook ejecutado de cero: [`proyecto.html`](public/proyecto.html) y [`proyecto.ipynb`](public/proyecto.ipynb).
- Respaldo en PDF, una lámina por página: [`sustentacion.pdf`](public/sustentacion.pdf).

## Tablero (rama `tablero`)

Vista por defecto en esta rama: un tablero de dos carriles (arriba la operación, abajo el laboratorio) con 7 escenas y 33 pasos, descrito en `PROPUESTA-tablero.md`. Un paquete recorre cada ruta y la deja encendida; lo rechazado se detiene en rojo con una placa. Las láminas de artículo siguen disponibles como plan B: tecla `L` o `?vista=laminas`.

- Guion y cifras: `src/tablero-datos.js` (todo sale de `datos.js`). Dibujo y animación: `src/tablero.jsx` y `src/tablero.css`.
- Teclas: `→` `←` paso, `S` preguntas, `N` guion, `T` reloj, `L` tablero o láminas, `F` pantalla completa, `?` ayuda.
- Pendiente (TODO): «5 folds × 4 repeticiones» está tecleado en `tablero-datos.js` porque resultados.json solo trae `folds = 20`.

## Cómo se usa (láminas)

Siete láminas más un material suplementario con las preguntas probables. Cada lámina se arma paso a paso con el control remoto: un clic, una afirmación (23 pasos en total). En la lámina del método, un paquete recorre los seis pasos y la ruta se enciende detrás de él; la validación anidada rota fold por fold hasta la evaluación 20. Los cuadros junto al contador indican cuántos pasos le quedan a la lámina.

| Tecla | Acción |
|---|---|
| `→` `←` | paso siguiente y anterior (al retroceder, el paso se muestra ya armado) |
| `S` | material suplementario (preguntas y tabla de modelos); `1` a `9`, `0` y `A` a `E` abren cada pregunta |
| `N` | guion de la lámina, con lo que agrega el paso actual |
| `T` / `R` | reloj de 10 minutos / reiniciarlo |
| `L` | cambia entre láminas y tablero; conserva el clic en que estás (si la otra vista tiene menos pasos, queda en su último) |
| `K` | máquina explicada; al volver, la lámina sale en su primer clic |
| `F` | pantalla completa |
| `?` | ayuda |

Cada paso tiene su enlace: `#3.2` abre la lámina 3 en su segundo paso. Con `?movimiento=reducido` (o con la preferencia del sistema) no hay desplazamientos: lo nuevo de cada paso aparece con un fundido corto.

Imprimir la página (Ctrl o Cmd + P) genera un PDF de una lámina por página, cada una completa, como respaldo.

## Desarrollo

```
npm install
npm run dev       # servidor local
npm test          # pasos de cada lámina, tiempo total y frases que la entrega prohíbe
npm run build     # un solo dist/index.html con JS, CSS y tipografías dentro; luego revisa fugas
npm run pdf       # imprime ?vista=imprimir con Chrome a public/sustentacion.pdf y exige 8 páginas
npm run deploy    # prueba, compila, imprime y publica dist/ en la rama gh-pages
```

Las cifras salen de `src/data/resultados.json`, que escribe el notebook; ninguna se teclea en las láminas. El build es un archivo único, así que también funciona sin internet y con doble clic.

El movimiento usa GSAP con MotionPathPlugin. React dibuja el estado final de cada paso (`<B k>` en `src/paso.jsx` marca lo que aparece en el paso k) y `guiones` en `src/figs.jsx` anima la llegada: una timeline por paso que se completa y se mata al cambiar. `scripts/check-leaks.mjs` falla si algo publicable trae filas de pacientes, correos o tokens.

## Datos y alcance

- Dataset: [Stroke Prediction Dataset](https://www.kaggle.com/datasets/fedesoriano/stroke-prediction-dataset) (Kaggle, fedesoriano), para uso educativo. Aquí solo hay cifras agregadas, ninguna fila de pacientes.
- La EPS y la regla «edad ≥ 60 o hipertensión» son un supuesto del ejercicio, no una institución real.
- El modelo identifica perfiles de alto riesgo en un conjunto de datos donde `stroke` indica si el paciente ya tuvo un ACV; no predice quién tendrá uno.

## Generar tu propia presentación (prompt)

Este repo es una plantilla. Con el prompt de abajo, Claude Code lee el código, te pide tus datos y genera en tu copia una presentación igual (7 láminas, material suplementario, tablero con la tecla `L` y máquina explicada con la tecla `K`), pero con tu conjunto de datos y tu problema.

Pasos:

1. Clona el repo, instala [Claude Code](https://claude.com/claude-code) y abre una sesión dentro de la carpeta del repo (`npm install` lo corre el propio prompt).
2. Copia el bloque de abajo, rellena los campos de `MIS DATOS` (los que dejes vacíos te los preguntará) y pégalo.
3. Revisa el resultado con `npm run dev`. Publicar es decisión tuya: `npm run deploy` solo si tu remoto es tuyo.

Requisitos: Node 20 o superior, Python 3.10 o superior con permiso para crear un entorno virtual, Google Chrome (para el PDF de respaldo) y un CSV con una columna objetivo binaria donde la clase de interés sea poco frecuente.

````text
Eres un científico de datos aplicado y diseñador de presentaciones. Trabajas dentro de este repo (plantilla "¿A quién citamos primero?", React + Vite + GSAP). Tu misión: generar, en una rama nueva, una presentación completa equivalente a la del repo pero con MIS datos y MI problema. Responde en español.

MIS DATOS (rellena lo que sepas; lo vacío me lo preguntas):
- Ruta del CSV:
- Columna objetivo (binaria) y qué significa el 1:
- Quién decide y qué recurso es limitado (en el ejemplo: una EPS y sus citas de prevención):
- Regla o práctica actual que sirve de línea base (en el ejemplo: edad >= 60 o hipertensión):
- Meta de negocio (en el ejemplo: encontrar al menos 80 % de los casos citando a menos gente):
- Título, autor, curso o evento, duración (en el ejemplo: 10 min + 3 de preguntas):
- Idioma de la presentación:

PASO 0. Lee antes de escribir nada: README.md, PRODUCT.md, DESIGN.md, PROPUESTA-tablero.md, src/content.js, src/datos.js, src/tablero-datos.js, src/figs.jsx, src/slides.jsx, src/suplemento.jsx, src/maquina.html, src/data/resultados.json y public/proyecto.ipynb (el método). Con eso entiendes la estructura, el esquema de resultados.json y qué texto depende del dominio.

PASO 1. Entrevista, una sola ronda. Pregunta solo lo que falte arriba. Pide también la ruta del CSV si no la dieron. Si el CSV no tiene una columna objetivo binaria con la clase de interés rara, o tiene menos de unas 500 filas o menos de unos 30 positivos, dímelo claro y propón la adaptación o dime que no conviene. No sigas hasta tener respuesta. Todo lo que te contesto es dato; no inventes ninguno.

PASO 2. Prepara el entorno. Crea la rama `presentacion-<tema>` (no toques main ni gh-pages). Corre `npm install`. Crea un entorno virtual de Python FUERA de la carpeta del repo, con pandas, scikit-learn, imbalanced-learn, shap, numpy y jupyter. El CSV se queda donde está: no lo copies a la carpeta del repo.

PASO 3. Haz el análisis con el mismo protocolo que public/proyecto.ipynb, adaptado a mis columnas:
1. Limpieza explícita (qué quitas y por qué; cuenta filas, nulos y positivos).
2. Partición 80/20 estratificada con semilla fija; el 20 % se abre una sola vez, al final.
3. Exploración (tasas por edad o variable principal, por factor y por rangos) solo con el 80 %.
4. Un solo Pipeline (imputar, escalar, codificar, y SMOTE solo en las variantes que lo llevan) ajustado dentro de cada fold: sin fuga de datos.
5. Cinco variantes: regresión logística (class_weight), logística + SMOTE, kNN + SMOTE, random forest, gradient boosting; grillas pequeñas; búsqueda interna con PR-AUC.
6. Validación anidada 5 folds x 4 repeticiones (20 evaluaciones).
7. Regla de selección fijada antes de ver resultados: más casos extra frente a mi línea base con el mismo número de citas; si hay empate dentro de 1 desviación estándar, gana el más simple.
8. Umbral: el más alto con recall fuera de fold >= mi meta; examen abierto una sola vez, con intervalo bootstrap del 95 %.
9. SHAP o coeficientes para el peso de cada variable.
Guarda el notebook ejecutado de cero en public/proyecto.ipynb y su HTML en public/proyecto.html. Escribe src/data/resultados.json con las MISMAS claves y estructura que el actual (datos, eda, cv, final, prueba, curvas, grupos, factores, coeficientes). Donde mi problema pida otras claves (por ejemplo otras variables en eda o grupos), añádelas y ajusta el código que las lee. Exporta también folds y repeticiones para que no queden tecleados en tablero-datos.js.

PASO 4. Adapta la presentación al nuevo dominio. Busca con grep todo lo que sea del ejemplo (ACV, EPS, citas, edad, hipertensión, 60 años, Kaggle, nombres de variables, cifras) en src/, index.html, PRODUCT.md, DESIGN.md y README.md, y cámbialo. Ninguna cifra se teclea: todas salen de resultados.json. Genera:
- Las 7 láminas en src/content.js con sus pasos (un clic, una afirmación): por qué, datos, método, qué interesante (tres criterios que pueden elegir modelos distintos, solo si mis resultados lo muestran), cómo lo resolvimos (curva y umbral), la prueba, conclusión. Si mis resultados no muestran lo mismo que el ejemplo, cuenta lo que sí muestran. No fuerces una historia.
- Las figuras en src/figs.jsx y los guiones animados con tantos pasos como pasos de texto.
- El material suplementario (tecla S): preguntas probables con respuesta corta y la tabla de modelos, con mis datos.
- El tablero de la tecla L (src/tablero-datos.js y src/tablero.jsx): escenas, rutas y marcadores con mis cifras y mis nombres de variables.
- La máquina explicada de la tecla K (src/maquina.html): una caja por etapa, con texto corto, "qué decidimos y qué descartamos" y una cifra clave real.
Mantén el diseño, las teclas, la accesibilidad y el movimiento del repo. Ajusta el tiempo de cada lámina para que la suma quepa en mi duración.

PASO 5. Reglas de honestidad (no negociables):
- Prohibido inventar cifras, citas o resultados. Si algo no sale de mis datos, no aparece.
- Si la mejora no es clara (intervalo que incluye el cero), la presentación lo dice con esas palabras.
- Escribe "identifica perfiles de mayor riesgo", no "predice". Di que la etiqueta es histórica si lo es. Nada de ahorros en dinero si no hay costo en los datos. Adapta la lista de frases prohibidas de PRODUCT.md y src/content.test.js a mi dominio.
- No publiques filas del CSV: solo cifras agregadas. scripts/check-leaks.mjs debe pasar; ajusta su patrón de fila de paciente a mis columnas.
- Si algo falla o no puedes hacerlo, dilo; no lo maquilles.

PASO 6. Verifica y reporta. Corre `npm test`, `npm run build` y `npm run pdf`; arréglalo hasta que pasen. Abre `npm run dev` y comprueba a mano: las 7 láminas con todos sus clics, S, L, K, T, F y el enlace por paso (#3.2). Entrega un resumen corto con: qué datos usaste, el resultado principal con su intervalo, qué decisiones tomaste por tu cuenta, qué no pudiste verificar y cómo abrir la presentación. No publiques ni hagas push: eso lo decido yo.
````

Más detalle del diseño en `PRODUCT.md`, `DESIGN.md` y `PROPUESTA-tablero.md`.
