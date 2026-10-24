# ¿A quién citamos primero?

Sustentación del proyecto final de **ST1613 Aprendizaje de Máquina Aplicado** (Universidad EAFIT): priorizar pacientes con alto riesgo de accidente cerebrovascular (ACV) para un programa de prevención. Autor: Sergio Alfredo Junca Valero (trabajo individual).

- Presentación: https://sjunka.github.io/acv-prevencion-ml/
- Notebook ejecutado de cero: [`proyecto.html`](public/proyecto.html) y [`proyecto.ipynb`](public/proyecto.ipynb).
- Respaldo en PDF, una lámina por página: [`sustentacion.pdf`](public/sustentacion.pdf).

## Cómo se usa

Siete láminas más un material suplementario con las preguntas probables. Se navega con el teclado o con un control remoto:

| Tecla | Acción |
|---|---|
| `→` `←` | avanzar y retroceder |
| `S` | material suplementario (preguntas y tabla de modelos); `1` a `9`, `0` y `A` a `E` abren cada pregunta |
| `N` | guion de la lámina |
| `T` / `R` | reloj de 10 minutos / reiniciarlo |
| `F` | pantalla completa |
| `?` | ayuda |

Imprimir la página (Ctrl o Cmd + P) genera un PDF de una lámina por página, como respaldo.

## Desarrollo

```
npm install
npm run dev       # servidor local
npm run build     # un solo dist/index.html con JS, CSS y tipografías dentro
npm run deploy    # publica dist/ en la rama gh-pages
```

Las cifras salen de `src/data/resultados.json`, que escribe el notebook; ninguna se teclea en las láminas. El build es un archivo único, así que también funciona sin internet y con doble clic.

## Datos y alcance

- Dataset: [Stroke Prediction Dataset](https://www.kaggle.com/datasets/fedesoriano/stroke-prediction-dataset) (Kaggle, fedesoriano), para uso educativo. Aquí solo hay cifras agregadas, ninguna fila de pacientes.
- La EPS y la regla «edad ≥ 60 o hipertensión» son un supuesto del ejercicio, no una institución real.
- El modelo identifica perfiles de alto riesgo en un conjunto de datos donde `stroke` indica si el paciente ya tuvo un ACV; no predice quién tendrá uno.
