#!/usr/bin/env python3
"""Arma voces australianas para Pocket TTS a partir de grabaciones reales (se corre en GitHub Actions).

Fuente: ablmontazer/australian-english-speech (LibriVox, dominio público CC0). Los narradores varones con acento
australiano verificado por los autores de la voz Piper australiana son: Timothy Ferguson, Son of the Exiles,
Algy Pug y Howard Skyman.

Para cada narrador elige los tramos más limpios (más voz y menos ruido de fondo), arma referencias de ~12 s y
hace hablar a Pocket TTS con cada una. Deja en ./voces-pocket/:
  ref-<narrador>-<n>.wav   la grabación real usada como referencia
  oliver-<narrador>-<n>.wav  Pocket TTS hablando con esa voz
  indice.txt               qué es cada archivo
"""
import io
import os
import subprocess
import tarfile

import numpy as np
import soundfile as sf

DATASET = "ablmontazer/australian-english-speech"
MALES = ["Timothy Ferguson", "Son of the Exiles", "Algy Pug", "Howard Skyman"]
PER_READER = 3
REF_SECONDS = 12.0
OUT = os.path.abspath("voces-pocket")
POCKET = "https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/sherpa-onnx-pocket-tts-int8-2026-01-26.tar.bz2"
TEXT = (
    "G'day mate. Been a long day out on the vines, so I reckon it's time for a cold one. "
    "How are you going? Tell me a bit about yourself."
)


def slug(s: str) -> str:
    return "".join(c.lower() if c.isalnum() else "-" for c in s).strip("-").replace("--", "-")


def snr(x: np.ndarray, sr: int) -> float:
    """Voz vs. ruido de fondo: energía de los tramos fuertes contra los más silenciosos (dB)."""
    f = int(sr * 0.03)
    if len(x) < f * 10:
        return 0.0
    e = np.array([np.sqrt(np.mean(x[i : i + f] ** 2)) + 1e-9 for i in range(0, len(x) - f, f)])
    e.sort()
    lo = e[: max(1, len(e) // 10)].mean()
    hi = e[-max(1, len(e) // 5) :].mean()
    return float(20 * np.log10(hi / lo))


def main():
    os.makedirs(OUT, exist_ok=True)
    from datasets import Audio, load_dataset

    ds = load_dataset(DATASET, split="train", streaming=True)
    feats = ds.features
    print("Columnas:", feats)
    audio_col = next(k for k, v in feats.items() if isinstance(v, Audio))
    reader_col = next(k for k in feats if "reader" in k.lower() or "speaker" in k.lower())
    text_col = next((k for k in feats if k.lower() in ("text", "transcript", "sentence", "normalized_text")), None)
    ds = ds.cast_column(audio_col, Audio(decode=False))

    clips: dict[str, list] = {r: [] for r in MALES}
    seen = 0
    for row in ds:
        seen += 1
        r = str(row[reader_col])
        name = next((m for m in MALES if r.startswith(m)), None)
        if name and len(clips[name]) < 120:
            a = row[audio_col]
            data, sr = sf.read(io.BytesIO(a["bytes"]), dtype="float32")
            if data.ndim > 1:
                data = data.mean(axis=1)
            dur = len(data) / sr
            if 2.0 <= dur <= 20.0:
                clips[name].append((snr(data, sr), dur, data, sr, row.get(text_col, "") if text_col else ""))
        if all(len(v) >= 120 for v in clips.values()) or seen > 70000:
            break
    print("Filas revisadas:", seen, {k: len(v) for k, v in clips.items()})

    # Pocket TTS
    subprocess.run(["curl", "-fsSL", "--retry", "5", "-o", "pocket.tar.bz2", POCKET], check=True)
    with tarfile.open("pocket.tar.bz2") as t:
        t.extractall("pocket")
    root = next(os.path.join("pocket", d) for d in os.listdir("pocket"))

    def f(prefix):
        return next(os.path.join(root, x) for x in sorted(os.listdir(root)) if x.startswith(prefix) and x.endswith(".onnx"))

    import sherpa_onnx

    tts = sherpa_onnx.OfflineTts(
        sherpa_onnx.OfflineTtsConfig(
            model=sherpa_onnx.OfflineTtsModelConfig(
                pocket=sherpa_onnx.OfflineTtsPocketModelConfig(
                    lm_flow=f("lm_flow"),
                    lm_main=f("lm_main"),
                    encoder=f("encoder"),
                    decoder=f("decoder"),
                    text_conditioner=f("text_conditioner"),
                    vocab_json=os.path.join(root, "vocab.json"),
                    token_scores_json=os.path.join(root, "token_scores.json"),
                ),
                num_threads=4,
            )
        )
    )

    index = []
    for name, items in clips.items():
        items.sort(key=lambda c: -c[0])  # más limpios primero
        used = 0
        for n in range(PER_READER):
            # Referencia: juntar tramos limpios hasta ~12 s (con 0,25 s de pausa entre tramos).
            parts, total, texts, ratios = [], 0.0, [], []
            while used < len(items) and total < REF_SECONDS:
                s, dur, data, sr0, txt = items[used]
                used += 1
                if sr0 != 24000:
                    import librosa

                    data = librosa.resample(data, orig_sr=sr0, target_sr=24000)
                parts += [data, np.zeros(6000, dtype=np.float32)]
                total += dur
                texts.append(txt)
                ratios.append(s)
            if not parts:
                break
            ref = np.concatenate(parts)
            ref = ref / (np.abs(ref).max() + 1e-9) * 0.8
            tag = f"{slug(name)}-{n + 1}"
            sf.write(os.path.join(OUT, f"ref-{tag}.wav"), ref, 24000, subtype="PCM_16")
            g = sherpa_onnx.GenerationConfig()
            g.reference_audio = ref
            g.reference_sample_rate = 24000
            g.num_steps = 5
            audio = tts.generate(TEXT, g)
            y = np.array(audio.samples)
            y = y / (np.abs(y).max() + 1e-9) * 0.8
            sf.write(os.path.join(OUT, f"oliver-{tag}.wav"), y, audio.sample_rate, subtype="PCM_16")
            index.append(f"{tag}: {name}, referencia {total:.1f} s, limpieza {np.mean(ratios):.0f} dB, frases: {' / '.join(t for t in texts if t)[:200]}")
            print(index[-1], flush=True)

    with open(os.path.join(OUT, "indice.txt"), "w", encoding="utf-8") as fh:
        fh.write("Voces australianas para Pocket TTS (LibriVox, dominio público CC0)\n\n" + "\n".join(index) + "\n")


if __name__ == "__main__":
    main()
