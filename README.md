# CriollEnglish

> **Learn English, a lo criollo.**

App para aprender inglés pensada para hispanohablantes. Cada tema se apoya en el anterior, y usa los métodos con más evidencia científica.

## Novedades de la versión 0.8

- **Llamada tipo selfie**: Oliver más grande, con más outback y menos cielo, y el brazo bajando hacia la cámara (como una videollamada). El micrófono grande queda siempre a mano y se sigue abriendo solo cuando Oliver termina de hablar; lo demás (repetir, pista, escribir) sigue detrás de la flechita.
- **IA sin internet y gratis** (Ajustes › Voces e IA, solo en Android). Cada parte se baja una sola vez y se elige cuál usar:
  - Voz de Oliver: **Piper australiano** (10 narradores australianos de LibriVox) o **Kokoro** (británico), además de la voz del teléfono.
  - Oído: **Moonshine Tiny**, además del reconocimiento del teléfono.
  - Charla: **LFM2.5 1.2B** (Liquid AI) o **Qwen3 1.7B**, con LiteRT-LM de Google.
  - Todo se carga al atender y se libera al cortar: fuera de la llamada no usa memoria, procesador ni batería. Nada sale del teléfono.
- **Las llamadas mantienen su temática**: con IA, Oliver responde a lo que digas pero siempre dentro del roleplay de la unidad, y al final te da 3 consejos sobre tu inglés.
- **Llamada libre**: pestaña «Llamar» para charlar con Oliver de cualquier tema (necesita una IA de charla descargada).

Los modelos de voz y oído se preparan en GitHub Actions (`scripts/preparar-modelos.py`) y quedan en el Release «modelos-2»; las IA de charla se bajan de Hugging Face (litert-community).

## Qué hace la versión 0.7

Se centra en una sola cosa: **armar oraciones correctas, rápido y sin traducir en la cabeza**. La escucha y la conversación se practican fuera de la app.

- **Test de nivel adaptativo** (A1–C1): empieza en B1 y sube o baja según las respuestas. Se puede repetir.
- **Llamadas con Oliver**: un australiano te llama (suena el teléfono, atiende y aparece animado) y charlan unos minutos en roleplays de cada unidad (72 conversaciones, 2 por unidad). Hablás con el micrófono o escribís; al final, el repaso de la charla con lo que dijiste bien y consejos. Sin IA en el teléfono: guiones con ramas y el reconocimiento de voz del propio celular.
- **Modo oscuro** (o claro), **sonidos** de acierto, error y festejo (generados en el momento, se pueden apagar), **panel de respuesta** que sube desde abajo, **racha** de aciertos y **resumen** al terminar cada escalón.
- **Voz fija**: elegí cualquier voz instalada en el teléfono, por ejemplo la australiana de Samsung.
- **Más modos**: traducir armando la oración con fichas, «Repetí lo que dice Oliver», aviso de palabra nueva y «Ahora no puedo hablar / escuchar» (15 minutos sin ejercicios de voz).
- **Camino por temas**: lo básico, preguntas, presente, pasado, futuro, tiempos perfectos, condicionales, cantidades, preposiciones, conectar ideas, pasiva y estilo indirecto, vocabulario, sonidos y énfasis. Cada tema muestra su porcentaje. Los niveles A1–C1 aparecen solo al evaluar (test de ubicación y pruebas de nivel).
- **Retomar donde quedaste**: si salís a mitad de un escalón o cerrás la app, seguís desde la misma pregunta. Cada unidad muestra cuánto llevás.
- **Explicación de cada error**: por qué va la respuesta correcta en ese ejercicio y por qué no va lo que pusiste.
- **Tic solo al completar**: lo que el test da por sabido queda abierto, pero se marca como completado recién cuando lo hacés.
- **36 unidades en 5 ejes**: estructura, verbos, vocabulario, sonidos y escucha. Cada unidad tiene prerrequisitos.
- **Escalera de 6 escalones por unidad**, de muy fácil a difícil: explicación → reconocer → completar → transformar → construir (ordenar y traducir) → fluidez contra reloj. Cada escalón se aprueba con 80% al primer intento.
- **Ejercicios que no se repiten**: un generador de oraciones (inglés y español) y bancos por unidad crean oraciones nuevas cada vez, así se aprende la regla y no la frase.
- **Modo fluidez**: en el último escalón y en los repasos, una respuesta correcta pero lenta vuelve antes.
- **Práctica mezclada**: reglas parecidas juntas (todos los pasados, todos los futuros…), para elegir la correcta sin la pista de la unidad.
- **Vocabulario**: las 2801 palabras más usadas (NGSL) en bandas A1–B2, con traducción, audio y repaso espaciado.
- **Avance automático**: al aprobar un escalón sigue el próximo, y al dominar una unidad pasa sola a la siguiente. «Volver» lleva al menú.
- **Taller de verbos**: 63 verbos ordenados del más usado al menos, cada uno en 4 etapas: formas (opción múltiple) → conjugar → completar oraciones en todos los tiempos → crear tus propias oraciones.
- **Prueba de práctica por nivel**: debajo de cada nivel terminado, todo lo del nivel mezclado (3 preguntas por tema + vocabulario). Explica cada error y permite practicar los temas fallados. No bloquea nada; se repite cuando quieras.
- **Frases con sabor local**: oraciones con tono uruguayo en español (vos, laburo, la rambla, el mate) y vida cotidiana australiana en inglés (arvo, servo, mate, the ute to the vineyard). Unidad nueva **Inglés de Australia**.
- **Contexto en cada hueco**: los ejercicios de completar muestran la oración en español, así no hay dos respuestas posibles.
- **Explicación siempre a mano**: en el menú de la unidad (también después de terminarla) y con el botón «📖 Explicación» durante los ejercicios. Puntos numerados, inglés resaltado y «trampas» en color.
- **Repaso espaciado con FSRS**, corrección con pista y segundo intento, registro de errores, diccionario al tocar cualquier palabra y voces del teléfono.

**Versión web**: https://agusalazar01.github.io/Ingles-progresivo/ (se actualiza con cada versión publicada; el progreso queda en ese navegador).

Todo se guarda en el teléfono. No necesita internet ni cuenta.

### Créditos

Vocabulario: New General Service List (Browne, Culligan & Phillips, 2013), licencia Creative Commons Attribution-ShareAlike 4.0 — https://www.newgeneralservicelist.com

## Obtener la APK

El workflow `.github/workflows/android.yml` compila la APK en GitHub en cada push a `main`:

1. Subí este proyecto a un repositorio de GitHub.
2. Entrá a la pestaña **Actions**, abrí la última ejecución de "Compilar APK" y descargá el artefacto `criollenglish-apk`.
3. Si creás un tag `v0.1.0` (`git tag v0.1.0 && git push --tags`), la APK también queda publicada en **Releases**.

Es una APK *debug*, instalable directamente en Android 7 o superior. Hay que permitir "instalar apps de origen desconocido". Para publicarla en Google Play hace falta firmarla con una clave propia (pendiente).

## Desarrollo

```bash
npm install
npm run dev      # versión web en el navegador
npm test         # tests de la lógica y del contenido
npm run sync     # compila y copia al proyecto Android
```

Para compilar en tu computadora necesitás Android Studio: `npx cap open android`.

## Estructura

- `src/content/`: unidades, ejercicios y banco del test (para agregar contenido, se edita acá).
- `src/lib/`: corrección de respuestas, repaso espaciado, test adaptativo y progreso.
- `src/screens/`: pantallas.
- `android/`: proyecto nativo generado por Capacitor.

## Próximos pasos

Más conversaciones por unidad, gesto con la mano de Oliver, lectura graduada y ajustar la IA de la llamada según cómo ande en el teléfono.
