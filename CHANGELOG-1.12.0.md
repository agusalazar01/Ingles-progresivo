# CriollEnglish 1.12.0 — corrección offline y enfoque en conversación

## Principio de funcionamiento

- Los ejercicios, la escritura guiada, los roleplays con guion, el progreso y los repasos no dependen de conexión ni llaman a servicios de IA.
- La IA online queda limitada a los modos conversacionales: tutor y conversación opcional dentro de roleplays.
- Se retiró la corrección generativa de la sección de escritura y el corrector generativo posterior al roleplay. La escritura vuelve a depender de las reglas locales y de las pistas pedagógicas.

## Motor de respuestas

- Se conservaron equivalencias frecuentes y se acotaron normalizaciones sensibles al contexto.
- `please` solo se ignora cuando aparece al final como cortesía añadida; no se elimina en cualquier posición.
- `have got` se normaliza a `have` únicamente en posesión y en la construcción `have got to` → `have to`.
- Se corrigió la conversión de `will` a `going to`: el auxiliar `is/are` ya no se decide por la última letra del sujeto.

## Explicaciones

- La comparación de palabras respeta las repeticiones.
- Se eliminaron las explicaciones genéricas que mostraban la primera regla de una unidad aunque no correspondiera al error.
- Se agregaron pistas locales para patrones comunes: Present Simple de tercera persona, `did` + verbo base, `since/for`, `a/an` en casos frecuentes, preposiciones y concordancia de `people`.

## Voz y tutor

- Los ejercicios de micrófono usan el acento elegido; «variado» toma `en-AU` como idioma base de reconocimiento.
- El filtro del tutor evita aceptar correcciones de fragmentos inventados o demasiado alejados de lo que se dijo.
- El prompt del tutor distingue errores reales de sugerencias opcionales de naturalidad y acepta variantes australianas/británicas.

## Validación

- Se añadieron pruebas para contracciones, cortesía, `have got`, variantes de futuro y sujetos singulares terminados en -s.
- Se verificó la sintaxis de los archivos TypeScript modificados y se ejecutaron comprobaciones aisladas del motor de respuestas.
- No se pudo ejecutar la compilación completa ni la suite Vitest en este entorno porque las dependencias npm no llegaron a instalarse.

## 1.12.0 (revisada)
- Restauradas todas las funciones de la 1.11: corrección con IA en «Escribir en inglés» (corrector offline Gemma + IA online), evaluación con IA al terminar los roleplays.
- Filtro de correcciones de la IA en las charlas: coincidencia por palabras completas, tolera pequeños desvíos de reconocimiento de voz, descarta ortografía regional (colour/color), apóstrofos y puntuación.
- Arreglos: plural en el futuro (My parents will…), explicación de respaldo en los ejercicios.

## 1.13.0
- Test de nivel completo: 8 preguntas por nivel (4 gramática, 2 vocabulario, 2 lectura), de 16 a 32 en total (~10 min), banco de ~26 preguntas por nivel con las opciones mezcladas; se pasa un nivel con 6 de 8.
- Se quitó la insignia del logo del encabezado (el logo queda en el ícono, el arranque y la bienvenida).
- Colores con función: títulos crema; verde = acciones; ámbar = disponible/actual; azul = completada; violeta = ubicada por el test; gris = bloqueada.

## 1.14.0 (en preparación)
- Fondo oscuro de Duolingo (#141F23) con bordes grises azulados.
- Vibración que acompaña las animaciones (plugin @capacitor/haptics), con interruptor en Configuración.
- Texto que aparece letra a letra en las charlas (toque suave por palabra). Se descartaron las animaciones de flor, pétalos y mate; quedan para armarlas aparte.
