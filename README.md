# ¿A quién citamos primero?

Sustentación del proyecto final de **ST1613 Aprendizaje de Máquina Aplicado** (Universidad EAFIT): priorizar pacientes con alto riesgo de accidente cerebrovascular (ACV) para un programa de prevención. Autor: Sergio Alfredo Junca Valero (trabajo individual).

- Presentación: https://sjunka.github.io/acv-prevencion-ml/
- Notebook ejecutado de cero: [`proyecto.html`](public/proyecto.html) y [`proyecto.ipynb`](public/proyecto.ipynb).
- Respaldo en PDF, una lámina por página: [`sustentacion.pdf`](public/sustentacion.pdf).

## Cómo se usa

Siete láminas más un material suplementario con las preguntas probables. Cada lámina se arma paso a paso con el control remoto: un clic, una afirmación (23 pasos en total). En la lámina del método, un paquete recorre los seis pasos y la ruta se enciende detrás de él; la validación anidada rota fold por fold hasta la evaluación 20. Los cuadros junto al contador indican cuántos pasos le quedan a la lámina.

| Tecla | Acción |
|---|---|
| `→` `←` | paso siguiente y anterior (al retroceder, el paso se muestra ya armado) |
| `S` | material suplementario (preguntas y tabla de modelos); `1` a `9`, `0` y `A` a `E` abren cada pregunta |
| `N` | guion de la lámina, con lo que agrega el paso actual |
| `T` / `R` | reloj de 10 minutos / reiniciarlo |
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
