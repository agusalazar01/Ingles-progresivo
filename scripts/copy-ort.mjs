// Copia el motor ONNX (WebAssembly) a public/ort para que la app lo cargue sin internet.
import { copyFileSync, mkdirSync } from 'node:fs';
const src = 'node_modules/onnxruntime-web/dist/';
mkdirSync('public/ort', { recursive: true });
for (const f of ['ort-wasm-simd-threaded.wasm', 'ort-wasm-simd-threaded.mjs']) copyFileSync(src + f, 'public/ort/' + f);
