# Propuesta: tablero animado para la sustentación (rama `tablero`)

Experimento pedido por Sergio el 2026-10-27 para ver la idea completa. La versión publicada (láminas animadas por pasos) queda intacta en `main`; esto vive solo en la rama local `tablero`.

## La idea

Un tablero de control con dos carriles:
- **Arriba, la operación del programa:** a quién se cita.
- **Abajo, el laboratorio:** cómo se construyó y se midió el modelo sin engañarnos.

En cada paso, un paquete recorre el camino y la ruta se enciende detrás de él. Las lecturas y los medidores son cifras reales del notebook (`src/data/resultados.json`, vía `src/datos.js`). Lo rechazado va en rojo y se detiene en una barra con una placa que dice por qué: la fuga de datos, el modelo que eligió el PR-AUC y el empate.

Lo que lo hace único:
- **El torneo:** cada modelo tiene una fila de 20 lámparas, una por evaluación (`por_fold` en resultados.json). Verde si supera a la regla, gris si empata, roja si pierde: 15 de 20 para la logística, 19 para random forest, 11 para gradient boosting, 3 para kNN.
- **La bóveda:** la prueba está sellada, el intento de usarla se bloquea en rojo, y en la escena final se abre una sola vez.
- **El umbral es una perilla:** al girarla, los medidores de siete segmentos corren de 28.5 % a 38.9 % de citados.

## Mundo visual: A, sala de control clínica

Tablero mímico gris claro como Digital Café Luna (RAL 7035), vías negras, ruta del paso en ámbar con borde oscuro, placas grabadas, lámparas y medidores de siete segmentos. Diferencias con Café Luna: la mitad de módulos y letra de casi el doble, porque se proyecta en un aula con la luz encendida y debe leerse desde el fondo (títulos de módulo de al menos 18 px reales a 1280×720).

## Mapa del tablero (viewBox 1000 × 660)

```
┌ OPERACIÓN DEL PROGRAMA · escenario supuesto ───────────────────────────────────┐
│               ┌──────────────┐                            ┌──────────────────┐ │
│ ┌─────────┐ ─▶│ Regla actual │─────────────────┬─────────▶│ Citas            │ │
│ │Afiliados│   └──────────────┘                 │          └──────────────────┘ │
│ │ 1 000   │   ┌──────────────┐   ┌────────┐    │          ┌──────────────────┐ │
│ └─────────┘ ─▶│ Modelo       │──▶│ Umbral │────┴─────────▶│ Sin cita         │ │
│   ┌──────────▶└──────────────┘   └────────┘               └──────────────────┘ │
└───┼───────────────────▲────────────────────────────────────────────────────────┘
    │                   └─────────── el ganador sube ─────────────────┐
┌───┼ LABORATORIO · solo entrenamiento ───────────────────────────────┼──────────┐
│   │ ┌─────────┐   ┌──────────────────┐   ┌ 5 variantes · 57 ───┐ ┌─┴───────┐  │
│   │ │ Datos   │   │ Pipeline         │──▶│ Reg. logística ●●○● │─│Selección│  │
│   │ └────┬────┘   │ imputar · escalar│   │ RL + SMOTE     ●○●● │ │ regla   │  │
│   │ ┌────▼────┐ ─▶│ · one-hot        │   │ kNN + SMOTE    ○○●○ │ │ previa  │  │
│   │ │Partición│   └───────┬──────────┘   │ Random forest  ●●●● │─│ casos   │  │
│   │ └────┬────┘   ┌───────▼──────────┐   │ Gradient boost ●○●○ │─│ extra   │  │
│   │ ┌────▼────┐   │ SMOTE solo fold  │──▶└─────────┬───────────┘ │ PR-AUC  │  │
│   └─┤ BÓVEDA  │   └──────────────────┘   ┌─────────▼───────────┐ └─────────┘  │
│     │ prueba  │ ✕ fuga bloqueada         │ Evaluación externa  │ ⟲ al pipeline│
│     └─────────┘                          └─────────────────────┘              │
└────────────────────────────────────────────────────────────────────────────────┘
 [Recall %] [Citados %] [Casos extra /40] [Umbral] [Evaluación n/20]
 Anunciadores: DESBALANCE 1:20 · FUGA BLOQUEADA · EMPATE EN EL RUIDO · PRUEBA ABIERTA · IC INCLUYE 0
```

Rutas (trazos ortogonales de borde a borde de módulo):
- Problema: `af-regla`, `regla-citas`, `regla-fuera`.
- Operación: `af-modelo`, `modelo-umbral`, `umbral-citas`, `umbral-fuera`.
- Datos: `datos-part`, `part-boveda`, `part-pipe`.
- Pipeline: `pipe-smote`, `pipe-modelos`, `smote-modelos`.
- Validación anidada: `interno` (lazo dentro del marco de modelos), `modelos-eval` y `externo` (lazo de la evaluación al pipeline).
- Selección: `rl-sel` y `sel-modelo`, que lleva el ganador al carril de operación.
- Prueba: `boveda-modelo`, solo en la escena 7.
- Rechazadas (rojo, barra y placa):
  - `boveda-pipe`: «Sellada hasta el final».
  - `smote-eval`: «SMOTE no toca la evaluación».
  - `gb-sel`: «Cita al 35.2 %».
  - `rf-sel`: «Empate: gana el más simple».

Medidores y registro: rótulo «Lecturas de resultados.json». Lo único escalado es «1 000 afiliados de ejemplo», y se rotula así.

## Escenas y pasos

7 escenas, 33 pasos, unos 540 s de 600. Teclas `1` a `7`. Todas las cifras deben salir de `datos.js` (ninguna tecleada); las de abajo son las que dan hoy.

### 1 · El problema (Por qué) · 60 s

| # | Texto del paso | Ruta | Se enciende | Cambia |
|---|---|---|---|---|
| 1 | Un programa de prevención no puede citar a todos: de cada 1 000 afiliados, unos 49 tuvieron un ACV. | (ninguna) | Afiliados | lectura «49 de 1 000» |
| 2 | Hoy cita con una regla: edad ≥ 60 o hipertensión. Es un supuesto del ejercicio, no una EPS real. | `af-regla` (ráfaga) | Afiliados, Regla | lámpara Regla verde |
| 3 | La regla cita a 308 de cada 1 000 (30.8 %) y encuentra 38 de los 49 casos: recall 77.9 %. | `regla-citas` | Regla, Citas | Citas «308 · 38 casos»; medidores Citados 30.8, Recall 77.9 |
| 4 | 11 casos quedan sin cita, y la regla no ordena: trata igual a todos los del grupo. | `regla-fuera` | Regla, Sin cita | Sin cita «11 casos», lámpara ámbar |
| 5 | La pregunta: ¿un modelo encuentra al menos el 80 % de los casos citando a menos gente? | (ninguna) | Modelo | Modelo «por construir»; marca de meta 80 en Recall |

### 2 · Los datos (Datos y método) · 70 s

| # | Texto del paso | Ruta | Se enciende | Cambia |
|---|---|---|---|---|
| 1 | Stroke Prediction Dataset de Kaggle: 5 109 pacientes, tras quitar el identificador y un registro «Other». | (ninguna) | Datos | Datos «5 109 · 249 casos» |
| 2 | Solo 1 de cada 20 tuvo un ACV. Un modelo que siempre dice «no» acierta el 95 % y no encuentra a nadie: no usamos accuracy. | (ninguna) | Datos | anunciador DESBALANCE 1:20 |
| 3 | Primero, partición 80/20 estratificada, para conservar el 4.9 % de casos en ambos lados. | `datos-part` | Datos, Partición | Partición «80 / 20» |
| 4 | El 20 % va a la bóveda: 1 022 pacientes y 50 casos que no se tocan hasta el final. | `part-boveda` | Partición, Bóveda | Bóveda «sellada», lámpara blanca (espera) |
| 5 | Con el 80 % (4 087 pacientes y 199 casos) exploramos: la edad separa más que nada, de 0.2 % de ACV bajo 40 años a 16.9 % sobre 70. | (ninguna) | Datos, Partición | Datos «edad: 0.2 % → 16.9 %» |

### 3 · Sin fuga (Datos y método) · 60 s

| # | Texto del paso | Ruta | Se enciende | Cambia |
|---|---|---|---|---|
| 1 | Todo el preprocesamiento vive en un pipeline que se ajusta solo con el entrenamiento de cada fold. | `part-pipe` | Partición, Pipeline | lámpara Pipeline verde |
| 2 | Imputa el IMC (201 nulos) con la mediana, escala las numéricas y codifica las categóricas con one-hot. | (ninguna) | Pipeline | celdas «201 nulos», «z», «one-hot» |
| 3 | SMOTE crea casos sintéticos solo con el entrenamiento del fold: nunca toca los datos con que se evalúa. | `pipe-smote` y luego `smote-eval` ✕ | Pipeline, SMOTE, Evaluación | placa «SMOTE no toca la evaluación» |
| 4 | La bóveda tampoco entra: ningún dato de prueba ayuda a ajustar, elegir ni fijar el umbral. | `boveda-pipe` ✕ | Bóveda, Pipeline | placa «Sellada hasta el final»; anunciador FUGA BLOQUEADA |

### 4 · El torneo (Datos y método) · 80 s

| # | Texto del paso | Ruta | Se enciende | Cambia |
|---|---|---|---|---|
| 1 | Compiten cinco variantes: logística con y sin SMOTE, kNN con SMOTE, random forest y gradient boosting. Son 57 configuraciones. | `pipe-modelos` y `smote-modelos` (5 paquetes) | Pipeline, SMOTE, Modelos | cada ranura muestra sus configuraciones (10, 10, 10, 15, 12) |
| 2 | Ciclo interno: dentro del entrenamiento, 5 folds eligen los hiperparámetros de cada variante con PR-AUC. | `interno` (lazo) | Modelos | marco «interno · PR-AUC» |
| 3 | Ciclo externo: el modelo elegido puntúa un fold que no vio, y lo comparo con la regla citando al mismo número de pacientes. | `modelos-eval` | Modelos, Evaluación | Evaluación «mismas citas»; medidor Evaluación 1 |
| 4 | Se repite 20 veces (5 folds × 4 repeticiones, unos 40 casos cada vez). Cada lámpara es una evaluación: verde si el modelo supera a la regla. | `externo` y `modelos-eval` (vueltas) | Pipeline, Modelos, Evaluación | 20 lámparas por ranura (verde, gris o roja); medidor Evaluación de 1 a 20 |
| 5 | Casos extra con las mismas citas: random forest +2.40, logística +1.75, logística con SMOTE +1.55, gradient boosting +1.30 y kNN −1.60, que no supera a la regla. | (ninguna) | Modelos | lecturas por ranura; lámpara de kNN roja |

### 5 · Tres criterios, tres modelos (Qué interesante) · 90 s

| # | Texto del paso | Ruta | Se enciende | Cambia |
|---|---|---|---|---|
| 1 | Con PR-AUC, la métrica estándar, ganaría gradient boosting (0.197). Pero es el que más cita: 35.2 % de los pacientes, para +1.30 casos. | `gb-sel` ✕ | Gradient boosting, Selección | placa «Cita al 35.2 %»; medidor Citados 35.2 |
| 2 | Con casos extra, la métrica del negocio, ganaría random forest: +2.40. Pero le saca a la logística 0.65 casos, menos que una desviación estándar (1.67). | `rf-sel` ✕ | Random forest, Selección | placa «Empate: gana el más simple»; anunciador EMPATE EN EL RUIDO |
| 3 | La regla la fijé en el anteproyecto, antes de ver resultados: con empate, gana el más simple. Gana la regresión logística, que se lee coeficiente a coeficiente. | `rl-sel` y luego `sel-modelo` | Reg. logística, Selección, Modelo | Modelo «regresión logística», lámpara verde |
| 4 | Tres criterios eligen tres modelos, y la métrica estándar habría elegido el que más citas cuesta. | (ninguna) | las 3 ranuras, Selección | resumen en la Selección |

### 6 · El modelo en operación (Cómo lo resolvimos) · 80 s

| # | Texto del paso | Ruta | Se enciende | Cambia |
|---|---|---|---|---|
| 1 | En operación, el modelo da a cada afiliado un puntaje de riesgo y ordena la lista de mayor a menor. | `af-modelo` (ráfaga) | Afiliados, Modelo | Modelo «puntaje de 0 a 1» |
| 2 | El umbral es el más alto que capta al menos el 80 % de los casos fuera de fold: 0.504. Cita al 28.5 % en lugar del 30.8 %. | `modelo-umbral` y luego `umbral-citas` | Modelo, Umbral, Citas | Umbral 0.504; medidores Recall 80.4, Citados 28.5 |
| 3 | Con las mismas citas que la regla: +1.75 casos de cada 40 (± 1.55), y la supera en 15 de las 20 evaluaciones. | `umbral-citas` | Umbral, Citas | medidor Casos extra +1.75 |
| 4 | Cada punto de recall cuesta más que el anterior: para el 90 % habría que citar al 38.9 %. Esa decisión es del programa, no del modelo. | (la perilla gira) | Umbral | Umbral 0.359; los medidores corren a Recall 90.5 y Citados 38.9 |

### 7 · La prueba y los límites (Conclusión) · 100 s

| # | Texto del paso | Ruta | Se enciende | Cambia |
|---|---|---|---|---|
| 1 | Al final abrí la bóveda una sola vez, con el umbral ya fijo: 1 022 pacientes y 50 casos. | `boveda-modelo` | Bóveda, Modelo | Bóveda «abierta una vez»; anunciador PRUEBA ABIERTA |
| 2 | El modelo encontró 40 de 50 casos citando al 29.0 %, y la regla 39 citando al 31.3 %. Recall 0.80, con IC 95 % de 0.69 a 0.90. | `modelo-umbral` y luego `umbral-citas` | Modelo, Umbral, Citas | Citas «40 de 50»; medidores Recall 80.0, Citados 29.0 |
| 3 | Con las mismas citas, un caso más, y el intervalo va de 0 a 4. La prueba confirma el rumbo pero no lo demuestra: la evidencia principal es la anidada. | (ninguna) | Bóveda, Modelo | medidor Casos extra +1; anunciador IC INCLUYE 0 |
| 4 | Límite: bajo 60 años el modelo capta solo el 35 % de los casos (la regla, el 22 %). Casi 2 de cada 3 quedan sin cita. | `umbral-fuera` | Umbral, Sin cita | Sin cita «bajo 60: 65 %», lámpara ámbar |
| 5 | Límite: la etiqueta dice quién ya tuvo un ACV, no quién lo tendrá. Además, la edad pesa el 63 % del modelo. | (ninguna) | Datos, Modelo | Datos «etiqueta pasada»; Modelo «edad 63 %» |
| 6 | Una mejora real, moderada y bien medida. Siguiente paso: una etiqueta posterior a una fecha de corte y datos reales de la EPS. | (ninguna) | todo el tablero | estado final |

## Qué se conserva

El suplemento de 15 preguntas (S), el reloj de 10 minutos (T), el guion por escena (N), el notebook publicado y las láminas animadas actuales como plan B en `?vista=laminas`.
