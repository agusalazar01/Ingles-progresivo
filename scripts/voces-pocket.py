#!/usr/bin/env python3
"""Arma las 20 voces de Pocket TTS (10 de hombre y 10 de mujer, con varios acentos). Se corre en GitHub Actions.

Fuentes (todas con licencia libre):
  - VCTK (CC BY 4.0), grabado en estudio: se usa la versión ya limpiada que publica Kyutai (kyutai/tts-voices).
    Acentos australiano, neozelandés, británico, escocés, irlandés, estadounidense y canadiense.
  - ablmontazer/australian-english-speech (LibriVox, dominio público): narradores australianos. Se elige el tramo
    más limpio de cada uno y se le saca el ruido de fondo.

Las referencias son cortas (6–10 s) y de un solo tramo: a Pocket TTS le alcanza y la voz sale más pareja.
Cada voz se prueba: Pocket TTS dice una frase y, si sale mal (muy corta, muy larga o rota), se pasa a la siguiente.

Deja en ./voces-pocket/:
  ref-m01.wav … ref-m10.wav   voces de hombre
  ref-f01.wav … ref-f10.wav   voces de mujer
  prueba-<voz>.wav            Pocket TTS hablando con esa voz
  voces.json                  nombre, acento y origen de cada voz (lo lee la app)
  indice.txt                  lo mismo, para leer
"""
import heapq
import io
import json
import os
import subprocess
import tarfile

import numpy as np
import soundfile as sf

DATASET = "ablmontazer/australian-english-speech"
# Acento australiano verificado por los autores de la voz Piper australiana.
VERIFIED = ["Timothy Ferguson", "Son of the Exiles", "Algy Pug", "Howard Skyman"]
OUT = os.path.abspath("voces-pocket")
POCKET = "https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/sherpa-onnx-pocket-tts-int8-2026-01-26.tar.bz2"
TEXT = "G'day! Welcome to the hostel. How was your trip? Let me know if you need a hand with anything."
PER_GENDER = 10
SR = 24000

# VCTK: hablante → (género, acento en español). En orden de preferencia para completar los 10 de cada género.
VCTK_M = [
    ("p326", "australiano"),
    ("p374", "australiano"),
    ("p254", "británico"),
    ("p360", "estadounidense"),
    ("p252", "escocés"),
    ("p259", "británico"),
    ("p315", "estadounidense"),
    ("p245", "irlandés"),
    ("p302", "canadiense"),
    ("p232", "británico"),
    ("p345", "estadounidense"),
    ("p334", "estadounidense"),
    ("p243", "británico"),
]
VCTK_F = [
    ("p335", "neozelandesa"),
    ("p228", "británica"),
    ("p361", "estadounidense"),
    ("p262", "escocesa"),
    ("p339", "estadounidense"),
    ("p229", "británica"),
    ("p288", "irlandesa"),
    ("p303", "canadiense"),
    ("p333", "estadounidense"),
    ("p244", "británica"),
    ("p276", "británica"),
    ("p300", "estadounidense"),
    ("p225", "británica"),
    ("p294", "estadounidense"),
]
# Cuántos narradores australianos de LibriVox entran como máximo (el resto se completa con VCTK).
LIBRIVOX_M = 3
LIBRIVOX_F = 4


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


def pitch(x: np.ndarray, sr: int) -> float:
    """Tono medio de la voz (Hz): por debajo de ~160 es de hombre; por arriba, de mujer."""
    import librosa

    f0 = librosa.yin(x, fmin=65, fmax=400, sr=sr, frame_length=2048)
    rms = librosa.feature.rms(y=x, frame_length=2048, hop_length=512)[0]
    n = min(len(f0), len(rms))
    f0, rms = f0[:n], rms[:n]
    voiced = f0[(rms > np.percentile(rms, 60)) & (f0 > 70) & (f0 < 380)]
    return float(np.median(voiced)) if len(voiced) else 0.0


def tidy(x: np.ndarray, sr: int, denoise: bool) -> np.ndarray:
    """Deja la referencia lista: 24 kHz, sin ruido de fondo, sin silencios en las puntas y con volumen parejo."""
    import librosa

    if x.ndim > 1:
        x = x.mean(axis=1)
    x = x.astype(np.float32)
    if sr != SR:
        x = librosa.resample(x, orig_sr=sr, target_sr=SR)
    if denoise:
        import noisereduce as nr

        x = nr.reduce_noise(y=x, sr=SR, stationary=True, prop_decrease=0.85).astype(np.float32)
    x, _ = librosa.effects.trim(x, top_db=35)
    x = x[: int(SR * 10.5)]
    fade = int(SR * 0.02)
    if len(x) > fade * 4:
        x[:fade] *= np.linspace(0, 1, fade, dtype=np.float32)
        x[-fade:] *= np.linspace(1, 0, fade, dtype=np.float32)
    return (x / (np.abs(x).max() + 1e-9) * 0.8).astype(np.float32)


def librivox():
    """Narradores australianos de LibriVox: el mejor tramo de cada uno, con su género (por el tono)."""
    from datasets import Audio, load_dataset

    ds = load_dataset(DATASET, split="train", streaming=True)
    feats = ds.features
    print("Columnas:", feats)
    audio_col = next(k for k, v in feats.items() if isinstance(v, Audio))
    reader_col = next(k for k in feats if "reader" in k.lower() or "speaker" in k.lower())
    ds = ds.cast_column(audio_col, Audio(decode=False))

    best: dict[str, list] = {}
    count: dict[str, int] = {}
    seen = 0
    for row in ds:
        seen += 1
        if seen > 70000:
            break
        r = str(row[reader_col]).strip()
        count[r] = count.get(r, 0) + 1
        if count[r] > 400:
            continue
        try:
            data, sr = sf.read(io.BytesIO(row[audio_col]["bytes"]), dtype="float32")
        except Exception:  # noqa: BLE001
            continue
        if data.ndim > 1:
            data = data.mean(axis=1)
        dur = len(data) / sr
        if not 6.0 <= dur <= 11.0 or np.mean(np.abs(data) > 0.99) > 0.001:
            continue
        h = best.setdefault(r, [])
        item = (snr(data, sr), seen, data, sr)
        if len(h) < 12:
            heapq.heappush(h, item)
        elif item[0] > h[0][0]:
            heapq.heapreplace(h, item)
    print("Filas revisadas:", seen)
    print("Narradores:", {k: v for k, v in sorted(count.items(), key=lambda kv: -kv[1])})

    out = []
    for r, h in best.items():
        if count[r] < 30 or len(h) < 4:
            continue
        clips = sorted(h, key=lambda c: -c[0])
        f0 = float(np.median([pitch(c[2], c[3]) for c in clips[:6]]))
        if not f0:
            continue
        s, _, data, sr = clips[0]
        verified = any(r.startswith(v) for v in VERIFIED)
        out.append({"reader": r, "gender": "f" if f0 >= 160 else "m", "f0": f0, "snr": s, "audio": tidy(data, sr, True), "verified": verified})
        print(f"LibriVox: {r}: tono {f0:.0f} Hz → {'mujer' if f0 >= 160 else 'hombre'}, limpieza {s:.0f} dB, {count[r]} frases", flush=True)
    # Dudosos (tono entre 145 y 175 Hz) afuera: no se sabe bien si es voz de hombre o de mujer.
    out = [o for o in out if not 145 <= o["f0"] < 175]
    out.sort(key=lambda o: (-int(o["verified"]), -o["snr"]))
    return out


def vctk(speaker: str):
    """Voz de VCTK ya limpiada por Kyutai (frase 23, la más larga)."""
    from huggingface_hub import hf_hub_download

    for name in (f"vctk/{speaker}_023_enhanced.wav", f"vctk/{speaker}_023.wav"):
        try:
            data, sr = sf.read(hf_hub_download("kyutai/tts-voices", name), dtype="float32")
            return tidy(data, sr, False), name
        except Exception as e:  # noqa: BLE001
            print(f"VCTK {name}: no está ({type(e).__name__})")
    return None, ""


def load_pocket():
    subprocess.run(["curl", "-fsSL", "--retry", "5", "-o", "pocket.tar.bz2", POCKET], check=True)
    with tarfile.open("pocket.tar.bz2") as t:
        t.extractall("pocket")
    root = next(os.path.join("pocket", d) for d in os.listdir("pocket"))

    def f(prefix):
        return next(os.path.join(root, x) for x in sorted(os.listdir(root)) if x.startswith(prefix) and x.endswith(".onnx"))

    import sherpa_onnx

    return sherpa_onnx.OfflineTts(
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


def try_voice(tts, ref: np.ndarray):
    """Pocket TTS dice la frase de prueba con esta voz. Devuelve el audio, o None si salió mal."""
    import sherpa_onnx

    g = sherpa_onnx.GenerationConfig()
    g.reference_audio = ref
    g.reference_sample_rate = SR
    g.num_steps = 5
    audio = tts.generate(TEXT, g)
    y = np.array(audio.samples, dtype=np.float32)
    dur = len(y) / audio.sample_rate
    if not np.isfinite(y).all() or not 2.5 <= dur <= 14 or np.abs(y).max() < 0.02:
        print(f"  prueba mala: {dur:.1f} s")
        return None, 0, 0.0
    return y / (np.abs(y).max() + 1e-9) * 0.8, audio.sample_rate, dur


def main():
    os.makedirs(OUT, exist_ok=True)
    tts = load_pocket()
    try:
        lv = librivox()
    except Exception as e:  # noqa: BLE001
        print("Sin LibriVox:", e)
        lv = []

    voices = []
    for gender, letter, table, lv_max, aussie in (("m", "m", VCTK_M, LIBRIVOX_M, "australiano"), ("f", "f", VCTK_F, LIBRIVOX_F, "australiana")):
        # Candidatos en orden: los australianos de estudio, los de LibriVox y después el resto de los acentos.
        studio = [c for c in table if c[1] == aussie]
        rest = [c for c in table if c[1] != aussie]
        cands = [("vctk", c) for c in studio] + [("lv", o) for o in lv if o["gender"] == gender][:lv_max] + [("vctk", c) for c in rest]
        chosen = []
        for kind, c in cands:
            if len(chosen) >= PER_GENDER:
                break
            if kind == "vctk":
                speaker, accent = c
                ref, path = vctk(speaker)
                if ref is None:
                    continue
                f0 = pitch(ref, SR)
                if (gender == "m") != (f0 < 160):
                    print(f"VCTK {speaker}: tono {f0:.0f} Hz no coincide con {gender}; se saltea")
                    continue
                info = {"accent": accent, "source": f"VCTK {speaker} (estudio)", "license": "CC BY 4.0", "studio": True}
            else:
                ref, f0 = c["audio"], c["f0"]
                info = {"accent": aussie, "source": f"LibriVox: {c['reader']}", "license": "dominio público", "studio": False}
            if len(ref) < SR * 4:
                print(f"  {info['source']}: referencia muy corta ({len(ref) / SR:.1f} s)")
                continue
            y, sr, dur = try_voice(tts, ref)
            if y is None:
                continue
            slot = f"{letter}{len(chosen) + 1:02d}"
            sf.write(os.path.join(OUT, f"ref-{slot}.wav"), ref, SR, subtype="PCM_16")
            sf.write(os.path.join(OUT, f"prueba-{slot}.wav"), y, sr, subtype="PCM_16")
            chosen.append({"file": f"ref-{slot}.wav", "gender": gender, "f0": round(f0), "ref_s": round(len(ref) / SR, 1), "test_s": round(dur, 1), **info})
            print(f"{slot}: {info['accent']} · {info['source']} · tono {f0:.0f} Hz · referencia {len(ref) / SR:.1f} s", flush=True)
        if len(chosen) < PER_GENDER:
            raise SystemExit(f"Solo salieron {len(chosen)} voces de {gender}")
        # Nombre: acento + número dentro del acento.
        seen: dict[str, int] = {}
        total = {a: sum(1 for v in chosen if v["accent"] == a) for a in {v["accent"] for v in chosen}}
        for v in chosen:
            seen[v["accent"]] = seen.get(v["accent"], 0) + 1
            a = v["accent"][0].upper() + v["accent"][1:]
            v["name"] = f"{a} {seen[v['accent']]}" if total[v["accent"]] > 1 else a
        voices += chosen

    json.dump({"voices": voices}, open(os.path.join(OUT, "voces.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    with open(os.path.join(OUT, "indice.txt"), "w", encoding="utf-8") as fh:
        fh.write("Voces de Pocket TTS (VCTK, CC BY 4.0; LibriVox, dominio público)\n\n")
        for v in voices:
            fh.write(f"{v['file']}: {'hombre' if v['gender'] == 'm' else 'mujer'} · {v['name']} · {v['source']} · tono {v['f0']} Hz · referencia {v['ref_s']} s\n")
    print(open(os.path.join(OUT, "indice.txt"), encoding="utf-8").read())


if __name__ == "__main__":
    main()
