#!/usr/bin/env python3
"""Prepara los modelos de voz y oído para la llamada con Oliver (se corre en GitHub Actions).

Deja en ./modelos/ los archivos que la app baja una sola vez desde el Release «modelos-1»:

- Piper australiano (DataCraftsmanAustralia/piper-en_AU-librivox-medium): se le agregan los datos
  que necesita sherpa-onnx (como hace scripts/piper/add_meta_data.py de sherpa-onnx) y tokens.txt.
- Kokoro (inglés británico/estadounidense, int8) desde los modelos de sherpa-onnx.
- Moonshine Tiny (reconocimiento de voz en inglés) desde los modelos de sherpa-onnx.
"""
import json
import os
import shutil
import subprocess
import sys
import tarfile
import urllib.request

import onnx

OUT = os.path.abspath("modelos")
TMP = os.path.abspath("tmp-modelos")
HF_REPO = "DataCraftsmanAustralia/piper-en_AU-librivox-medium"
SHERPA = "https://github.com/k2-fsa/sherpa-onnx/releases/download"
KOKORO = f"{SHERPA}/tts-models/kokoro-int8-en-v0_19.tar.bz2"
MOONSHINE = f"{SHERPA}/asr-models/sherpa-onnx-moonshine-tiny-en-quantized-2026-02-27.tar.bz2"


def get(url: str, dest: str) -> str:
    print("Bajando", url, flush=True)
    subprocess.run(["curl", "-fsSL", "--retry", "5", "-o", dest, url], check=True)
    return dest


def untar(path: str) -> str:
    dest = path + ".dir"
    with tarfile.open(path) as t:
        t.extractall(dest)
    return dest


def find(root: str, pred) -> str:
    for d, _, files in os.walk(root):
        for f in sorted(files):
            if pred(f):
                return os.path.join(d, f)
    raise SystemExit(f"No encontré el archivo en {root}")


def piper_au():
    info = json.load(urllib.request.urlopen(f"https://huggingface.co/api/models/{HF_REPO}"))
    names = [s["rfilename"] for s in info.get("siblings", [])]
    print("Archivos del modelo australiano:", names)
    onnx_name = next(n for n in names if n.endswith(".onnx") and "/" not in n)
    json_name = onnx_name + ".json" if onnx_name + ".json" in names else next(n for n in names if n.endswith(".onnx.json"))
    base = f"https://huggingface.co/{HF_REPO}/resolve/main/"
    model = get(base + onnx_name, os.path.join(TMP, "piper-au.onnx"))
    config = json.load(open(get(base + json_name, os.path.join(TMP, "piper-au.onnx.json")), encoding="utf-8"))

    with open(os.path.join(OUT, "piper-au-tokens.txt"), "w", encoding="utf-8") as f:
        for s, i in config["phoneme_id_map"].items():
            if s == "\n":
                continue
            f.write(f"{s} {i[0] if isinstance(i, list) else i}\n")

    rate = config["audio"]["sample_rate"]
    voice = config.get("lang_code") or config["espeak"]["voice"]
    meta = {
        "model_type": "vits",
        "comment": "piper",
        "language": "English",
        "voice": voice,
        "version": 1,
        "has_espeak": 1,
        "has_g2pw": 0,
        "n_speakers": config.get("num_speakers", 1),
        "sample_rate": 22050 if rate == 22500 else rate,
    }
    m = onnx.load(model)
    while len(m.metadata_props):
        m.metadata_props.pop()
    for k, v in meta.items():
        p = m.metadata_props.add()
        p.key = k
        p.value = str(v)
    onnx.save(m, os.path.join(OUT, "piper-au-model.onnx"))

    speakers = config.get("speaker_id_map") or {}
    ordered = [name for name, _ in sorted(speakers.items(), key=lambda kv: kv[1])]
    json.dump(
        {"espeak": voice, "speakers": ordered or ["default"], "license": info.get("cardData", {}).get("license")},
        open(os.path.join(OUT, "piper-au-speakers.json"), "w", encoding="utf-8"),
        ensure_ascii=False,
    )
    print("Piper australiano listo:", meta, ordered)


def kokoro():
    d = untar(get(KOKORO, os.path.join(TMP, "kokoro.tar.bz2")))
    shutil.copy(find(d, lambda f: f.endswith(".onnx")), os.path.join(OUT, "kokoro-model.onnx"))
    shutil.copy(find(d, lambda f: f == "voices.bin"), os.path.join(OUT, "kokoro-voices.bin"))
    shutil.copy(find(d, lambda f: f == "tokens.txt"), os.path.join(OUT, "kokoro-tokens.txt"))
    print("Kokoro listo")


def moonshine():
    d = untar(get(MOONSHINE, os.path.join(TMP, "moonshine.tar.bz2")))
    shutil.copy(find(d, lambda f: f == "encoder_model.ort"), os.path.join(OUT, "moonshine-encoder_model.ort"))
    shutil.copy(find(d, lambda f: f == "decoder_model_merged.ort"), os.path.join(OUT, "moonshine-decoder_model_merged.ort"))
    shutil.copy(find(d, lambda f: f == "tokens.txt"), os.path.join(OUT, "moonshine-tokens.txt"))
    print("Moonshine listo")


def main():
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(TMP, exist_ok=True)
    piper_au()
    kokoro()
    moonshine()
    sizes = {f: os.path.getsize(os.path.join(OUT, f)) for f in sorted(os.listdir(OUT))}
    json.dump(sizes, open(os.path.join(OUT, "modelos.json"), "w"), indent=1)
    print(json.dumps(sizes, indent=1))


if __name__ == "__main__":
    sys.exit(main())
