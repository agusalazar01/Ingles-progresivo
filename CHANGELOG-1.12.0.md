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

## 1.14.0
- Fondo oscuro de Duolingo (#141F23) con bordes grises azulados.
- Vibración que acompaña las animaciones (plugin @capacitor/haptics), con interruptor en Configuración.
- Texto que aparece letra a letra en las charlas (toque suave por palabra). Se descartaron las animaciones de flor, pétalos y mate; quedan para armarlas aparte.

## 1.15.0
- Voces: quitar motores y voces sueltas (con opción de volver a mostrarlos); el ▶ corta la voz que suena y arranca la nueva.
- Charla libre: elegir con quién hablar (Kate, Emma, Jack, Liam) y cambiar de voz.

## 1.16.0 — inglés en situaciones reales
- 12 unidades temáticas mezcladas en el camino (A1–B2): saludos, café, planes, playa (el diálogo de Jack y Tom), transporte, casa compartida, cómo te sentís, resolver problemas, salud, el laburo en la viña, plata y contar historias. Combinan gramática y vocabulario; no reemplazan ni bloquean las unidades de gramática.
- Cada unidad: diálogo real desglosado frase por frase (partes, gramática y cómo cambia con otros tiempos), unas 15–19 expresiones, ~50 ejercicios de 11 tipos y 2 llamadas con Oliver.
- Escalón nuevo «Charla»: «Respondé con tus palabras» (preguntas sin pista de qué estructura usar; con IA online se corrige libre, sin internet se compara con respuestas modelo y se revisan errores típicos) y «Armá tu propia pregunta».
- Catálogo de 194 expresiones (phrasal verbs, modales, coloquiales, Australia, combinaciones, inglés hablado): significado, registro, frecuencia, pronunciación, la expresión en varios tiempos y estructuras, diferencias con expresiones parecidas y «Practicar esta expresión».
- Repaso intercalado: la fluidez de cada unidad trae expresiones de las unidades de situaciones anteriores, primero las que te costaron. Las tarjetas entran al repaso espaciado de siempre.
- Las unidades temáticas no se dan por sabidas con el test de ubicación (son vocabulario nuevo) y no bloquean el nivel siguiente.

## 1.16.1
- 5 roleplays nuevos (categoría 14: cafés, estaciones de servicio y naturaleza): estación de servicio, menú de cafés australianos, centro de visitantes de un parque nacional, camping y caminata.
- Estación de servicio más realista: pedir un monto fijo en el surtidor («Can I put fifty dollars on pump six?»), que te lo habiliten, o llenar el tanque; precios como se dicen («two oh five a litre»).
- Camping y parque nacional: sin preguntas repetidas y con respuestas concretas (pase del parque, prohibición de fuego). Caminata: qué hacer si alguien se lastima y el 000 (triple zero).
- Voces: todo personaje de roleplay tiene voz de hombre o de mujer; si el nombre no lo dice (Agente, Officer Brown), se elige una fija por personaje en vez de usar la voz de Oliver.
- Correcciones de contenido: «sílabas», people/persons, consignas de backshift y futuro perfecto. Numeración de roleplays sin huecos.

## 1.18.0 — el camino, los cuentos y la gran revisión
**Camino**
- Camino nuevo con nodos (diseño provisorio: círculos y línea): 33 secciones de A1 a C1, cada una con una meta comunicativa, que reúnen las 57 unidades. Los ejercicios de siempre son los nodos de lección: no se perdió ninguno.
- Intermedio para afianzar sin repetir: cada unidad tiene su Escucha a mitad de camino (dictados) y su Práctica al final (lo que te costó, con otro tipo de ejercicio). Cada sección cierra con un Repaso final, y cada nivel con un **Repaso de etapa 🏆** con todo el nivel (75 % para aprobar).
- Nodos: guía, lecciones, escucha, práctica, roleplay, cuento, postal de Australia 💌, repaso final y repaso de etapa.
- Bloqueos: dentro de cada sección las lecciones se abren en orden; la sección siguiente se abre al terminar la gramática de la anterior. Al empezar cada nivel bloqueado, «Saltar con una prueba».
- La vista anterior por temas sigue en «Ver por temas».

**Unidades nuevas (situaciones)**
- Tu familia y tu gente (A1), De compras (A2), El clima y el aire libre (A2), Buscar trabajo (B1), Noticias y chismes (B2), Opinar y debatir (C1). Cada una con diálogo desglosado, unas 12 expresiones nuevas al catálogo, más de 50 ejercicios y 2 llamadas con Oliver.

**Cuentos**
- 33 cuentos, uno por sección, sin «motor de cuentos»: texto original sin tocar. De A1 a B1, cuentos ilustrados de Global Storybooks (CC BY) y fábulas de Esopo (dominio público). En B2 y C1, clásicos en dominio público: O. Henry («After Twenty Years», «Hearts and Hands», «The Gift of the Magi»), Saki («The Open Window», «The Story-Teller», «The Lumber-Room»), Oscar Wilde («The Selfish Giant»), Frank Stockton («The Lady, or the Tiger?») y Edgar Allan Poe («The Tell-Tale Heart»).
- Cada cuento tiene traducción por página, desglose de frases, preguntas de comprensión, vocabulario y ejercicios. Audio grabado si existe; si no, lectura con la voz del teléfono.

**Revisión de contenido (todo el inglés)**
- Ejercicios generados de tiempos verbales: las opciones falsas ahora son errores de forma del mismo tiempo (antes a veces había 2 o 3 respuestas válidas); se muestra la oración en español; se evitan combinaciones absurdas («gets a new job every day»), «we» con «my», modales con verbos de estado; will y going to se aceptan los dos; le/les en español («le doy un regalo a mi mamá»).
- Respuestas válidas que antes se rechazaban (which/that, although/even though, take/have a shower, at/on the weekend, y muchas más en gramática, corregí el error y escritura).
- Traducciones al español que empujaban a otra respuesta (tengo que → necesito), explicaciones corregidas (condicional cero, say/tell, falsos amigos, «too» vs «very»), inglés poco natural reemplazado.
- Llamadas y roleplays: el motor ya no manda «OK» o «Yes» a la rama del «no», y si decís que no, gana la respuesta del no. Patrones que nunca coincidían por las contracciones ahora funcionan. Respuestas que suponían un sí, corregidas.
- Datos de Australia actualizados: impuesto del DASP (65 %), salario mínimo casual, garantía mínima por hora en la cosecha, NRMA en NSW, Opal/TrainLink, licencia de conducir para Uruguay, reglas de alquiler y mascotas en NSW, alergias en restaurantes, medidas en milímetros en obra.
