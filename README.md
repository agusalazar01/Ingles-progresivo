# CriollEnglish

> **Learn English, a lo criollo.**

App para aprender inglés pensada para hispanohablantes. Cada tema se apoya en el anterior, y usa los métodos con más evidencia científica.

## Qué hace la versión 0.4

Se centra en una sola cosa: **armar oraciones correctas, rápido y sin traducir en la cabeza**. La escucha y la conversación se practican fuera de la app.

- **Test de nivel adaptativo** (A1–C1): empieza en B1 y sube o baja según las respuestas. Se puede repetir.
- **35 unidades en 5 ejes**: estructura, verbos, vocabulario, sonidos y escucha. Cada unidad tiene prerrequisitos.
- **Escalera de 6 escalones por unidad**, de muy fácil a difícil: explicación → reconocer → completar → transformar → construir (ordenar y traducir) → fluidez contra reloj. Cada escalón se aprueba con 80% al primer intento.
- **Ejercicios que no se repiten**: un generador de oraciones (inglés y español) y bancos por unidad crean oraciones nuevas cada vez, así se aprende la regla y no la frase.
- **Modo fluidez**: en el último escalón y en los repasos, una respuesta correcta pero lenta vuelve antes.
- **Práctica mezclada**: reglas parecidas juntas (todos los pasados, todos los futuros…), para elegir la correcta sin la pista de la unidad.
- **Vocabulario**: las 2801 palabras más usadas (NGSL) en bandas A1–B2, con traducción, audio y repaso espaciado.
- **Avance automático**: al aprobar un escalón sigue el próximo, y al dominar una unidad pasa sola a la siguiente. «Volver» lleva al menú.
- **Taller de verbos**: 63 verbos ordenados del más usado al menos, cada uno en 4 etapas: formas (opción múltiple) → conjugar → completar oraciones en todos los tiempos → crear tus propias oraciones.
- **Prueba de práctica por nivel**: debajo de cada nivel terminado, todo lo del nivel mezclado (3 preguntas por tema + vocabulario). Explica cada error y permite practicar los temas fallados. No bloquea nada; se repite cuando quieras.
- **Repaso espaciado con FSRS**, corrección con pista y segundo intento, registro de errores, diccionario al tocar cualquier palabra y voces del teléfono.

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

Más contenido por unidad, vocabulario por bandas de frecuencia, lectura graduada y conversación con corrección por IA (en servidor, para no gastar batería).
