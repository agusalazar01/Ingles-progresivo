# Inglés Progresivo

App para aprender inglés pensada para hispanohablantes. Cada tema se apoya en el anterior, y usa los métodos con más evidencia científica.

## Qué hace la versión 0.1

- **Test de nivel adaptativo** (A1–C1). Empieza en B1 y sube o baja según las respuestas. Mide gramática, vocabulario y lectura, y se puede repetir: se sugiere cada 4 semanas.
- **Camino escalonado**: 15 unidades de tiempos verbales con prerrequisitos. Una unidad se desbloquea al dominar las anteriores (85% de aciertos al primer intento).
- **Repaso espaciado con FSRS**, el algoritmo de Anki. Mezcla ejercicios de distintas unidades.
- **Recuperación activa**: siempre tenés que producir o elegir la respuesta, nunca solo releer.
- **Corrección que hace pensar**: si fallás, primero recibís una pista y un segundo intento, y recién después la respuesta.
- **Trampas para hispanohablantes**: cada unidad explica el error típico que viene del español.
- **Registro de errores** con práctica dirigida.
- **Progreso real**: muestra tu nivel según el camino y según el test, no puntos.

Todo se guarda en el teléfono. No necesita internet ni cuenta.

## Obtener la APK

El workflow `.github/workflows/android.yml` compila la APK en GitHub en cada push a `main`:

1. Subí este proyecto a un repositorio de GitHub.
2. Entrá a la pestaña **Actions**, abrí la última ejecución de "Compilar APK" y descargá el artefacto `ingles-progresivo-apk`.
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

Escucha y entrenamiento de sonidos con varias voces, hablar con corrección por IA, ejes de vocabulario y frases hechas, y módulos para superar el estancamiento de B2.
