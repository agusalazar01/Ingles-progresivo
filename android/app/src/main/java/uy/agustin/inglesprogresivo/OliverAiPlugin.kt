package uy.agustin.inglesprogresivo

import android.Manifest
import android.annotation.SuppressLint
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.AudioTrack
import android.media.MediaRecorder
import android.media.PlaybackParams
import android.os.Build
import android.os.SystemClock
import com.google.mediapipe.tasks.text.textproofreader.TextProofreader
import com.google.mediapipe.tasks.text.textproofreader.TextProofreader.TextProofreaderOptions
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.PermissionState
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback
import com.github.csukuangfj.piper.phonemize.piperPhonemizeInitialize
import com.github.csukuangfj.piper.phonemize.piperPhonemizeText
import com.k2fsa.sherpa.onnx.GenerationConfig
import com.k2fsa.sherpa.onnx.OfflineModelConfig
import com.k2fsa.sherpa.onnx.OfflineMoonshineModelConfig
import com.k2fsa.sherpa.onnx.OfflineQwen3AsrModelConfig
import com.k2fsa.sherpa.onnx.OfflineTransducerModelConfig
import com.k2fsa.sherpa.onnx.OfflineRecognizer
import com.k2fsa.sherpa.onnx.OfflineRecognizerConfig
import com.k2fsa.sherpa.onnx.OfflineTts
import com.k2fsa.sherpa.onnx.OfflineTtsConfig
import com.k2fsa.sherpa.onnx.OfflineTtsKittenModelConfig
import com.k2fsa.sherpa.onnx.OfflineTtsKokoroModelConfig
import com.k2fsa.sherpa.onnx.OfflineTtsModelConfig
import com.k2fsa.sherpa.onnx.OfflineTtsPocketModelConfig
import com.k2fsa.sherpa.onnx.OfflineTtsSupertonicModelConfig
import com.k2fsa.sherpa.onnx.OfflineTtsVitsModelConfig
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicReference
import java.util.concurrent.Executors
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sqrt

/**
 * IA sin internet para la llamada con Oliver.
 *
 * - Voz (Piper / Kokoro) y oído (Moonshine) con sherpa-onnx; charla con LiteRT-LM.
 * - Los modelos se bajan una sola vez a la memoria del teléfono y desde ahí funcionan sin conexión.
 * - Solo ocupan memoria y procesador mientras dura la llamada: la app los carga al atender y llama a
 *   unloadAll() al cortar. Si Android cierra la app, también se liberan.
 * - Nada de lo que decís sale del teléfono.
 */
@CapacitorPlugin(
    name = "OliverAi",
    permissions = [Permission(alias = "microphone", strings = [Manifest.permission.RECORD_AUDIO])],
)
class OliverAiPlugin : Plugin() {
    private val work = Executors.newSingleThreadExecutor() // carga de modelos y generación de voz
    private val proofWork = Executors.newSingleThreadExecutor() // corrector de textos
    private val genWork = Executors.newSingleThreadExecutor() // genera la frase siguiente mientras suena la actual
    private val ioWork = Executors.newCachedThreadPool() // descargas y micrófono

    private val cancelled = ConcurrentHashMap<String, Boolean>()

    @Volatile private var tts: OfflineTts? = null
    @Volatile private var ttsId: String? = null
    @Volatile private var espeakVoice = "en-gb-x-rp"
    @Volatile private var stopSpeech = false
    @Volatile private var track: AudioTrack? = null

    @Volatile private var ear: OfflineRecognizer? = null
    @Volatile private var earId: String? = null
    @Volatile private var stopListen = false

    @Volatile private var proofreader: TextProofreader? = null
    @Volatile private var proofId: String? = null

    @Volatile private var phonemizerReady = false

    /**
     * Si una librería nativa cierra la app de golpe no hay forma de atrapar el error: antes de cada paso
     * delicado se anota cuál es y al terminar se borra. Si la app se cerró, la próxima vez queda el aviso.
     */
    private var lastCrash: String? = null
    private fun crumb(): File = File(root(), ".paso")
    private fun step(what: String) {
        try {
            crumb().writeText(what)
        } catch (_: Throwable) {
        }
    }
    private fun stepDone() {
        crumb().delete()
    }

    override fun load() {
        super.load()
        val f = crumb()
        if (f.exists()) {
            lastCrash = f.readText()
            f.delete()
        }
    }

    private fun root(): File = File(context.filesDir, "ai").apply { mkdirs() }
    private fun dir(id: String): File = File(root(), id.replace(Regex("[^a-zA-Z0-9_.-]"), "_"))

    // ───────────── descargas ─────────────

    @PluginMethod
    fun status(call: PluginCall) {
        val installed = JSObject()
        val files = JSObject()
        root().listFiles()?.forEach { d ->
            if (File(d, ".ok").exists()) {
                installed.put(d.name, d.listFiles()?.sumOf { it.length() } ?: 0L)
                val names = JSArray()
                d.listFiles()?.filter { !it.name.startsWith(".") && !it.name.endsWith(".part") }?.forEach { names.put(it.name) }
                files.put(d.name, names)
            }
        }
        val ret = JSObject()
        ret.put("installed", installed)
        ret.put("files", files)
        ret.put("crashed", lastCrash)
        ret.put("freeBytes", context.filesDir.usableSpace)
        ret.put("root", root().absolutePath)
        val loaded = JSArray()
        listOfNotNull(ttsId, earId, proofId).forEach { loaded.put(it) }
        ret.put("loaded", loaded)
        call.resolve(ret)
    }

    @PluginMethod
    fun download(call: PluginCall) {
        val id = call.getString("id") ?: return call.reject("Falta id")
        val files = call.getArray("files") ?: return call.reject("Faltan archivos")
        val list = (0 until files.length()).map { i ->
            val o = files.getJSONObject(i)
            Triple(o.getString("url"), o.getString("name"), o.optLong("size", 0L))
        }
        cancelled.remove(id)
        ioWork.execute {
            try {
                val target = dir(id).apply { mkdirs() }
                File(target, ".ok").delete()
                // El tamaño de cada archivo es aproximado: solo sirve para repartir la barra de progreso.
                val weights = list.map { if (it.third > 0) it.third.toDouble() else 1.0 }
                val total = weights.sum()
                var before = 0.0
                var lastEmit = 0L
                for ((i, f) in list.withIndex()) {
                    val (url, name, _) = f
                    val out = File(target, name)
                    // Un .tgz ya descomprimido no se vuelve a bajar.
                    val unpacked = name.endsWith(".tgz") && File(target, name.removeSuffix(".tgz")).isDirectory
                    if (!out.exists() && !unpacked) {
                        out.parentFile?.mkdirs()
                        val part = File(target, "$name.part")
                        fetch(url, part, id) { got, len ->
                            val now = SystemClock.elapsedRealtime()
                            if (now - lastEmit > 300) {
                                lastEmit = now
                                val frac = if (len > 0) min(1.0, got.toDouble() / len) else 0.0
                                val ev = JSObject()
                                ev.put("id", id)
                                ev.put("progress", min(1.0, (before + frac * weights[i]) / total))
                                ev.put("bytes", got)
                                notifyListeners("download", ev)
                            }
                        }
                        if (!part.renameTo(out)) throw Exception("No se pudo guardar $name")
                        // Un .zip se descomprime en una carpeta con su nombre (por ejemplo, el tokenizer de Qwen3-ASR).
                        if (name.endsWith(".zip")) unzip(out, File(target, name.removeSuffix(".zip")))
                        // Un .tgz (paquete de npm) se descomprime y se borra: solo quedan el modelo y su vocabulario.
                        if (name.endsWith(".tgz")) {
                            untgz(out, File(target, name.removeSuffix(".tgz"))) { it.endsWith(".onnx") || it.endsWith("tokenizer.json") }
                            out.delete()
                        }
                    }
                    before += weights[i]
                }
                // Borra archivos viejos que el paquete ya no usa (por ejemplo, voces de ejemplo reemplazadas).
                val keep = list.map { it.second }.toSet() + setOf("mi-voz.wav", ".ok")
                target.listFiles()?.forEach { if (it.isFile && it.name !in keep && !it.name.endsWith(".part")) it.delete() }
                File(target, ".ok").writeText("ok")
                val ev = JSObject()
                ev.put("id", id)
                ev.put("progress", 1.0)
                ev.put("done", true)
                notifyListeners("download", ev)
                call.resolve()
            } catch (e: Exception) {
                val ev = JSObject()
                ev.put("id", id)
                ev.put("error", e.message ?: "error")
                notifyListeners("download", ev)
                call.reject(if (cancelled[id] == true) "cancelado" else (e.message ?: "No se pudo descargar"))
            }
        }
    }

    private fun unzip(zip: File, dest: File) {
        dest.deleteRecursively()
        dest.mkdirs()
        java.util.zip.ZipInputStream(zip.inputStream().buffered()).use { zin ->
            while (true) {
                val e = zin.nextEntry ?: break
                val f = File(dest, e.name)
                if (!f.canonicalPath.startsWith(dest.canonicalPath + File.separator)) continue
                if (e.isDirectory) f.mkdirs()
                else {
                    f.parentFile?.mkdirs()
                    FileOutputStream(f).use { zin.copyTo(it) }
                }
            }
        }
    }

    /** Descomprime un .tar.gz guardando (sin carpetas) solo los archivos que pide `wanted`. */
    private fun untgz(tgz: File, dest: File, wanted: (String) -> Boolean) {
        dest.deleteRecursively()
        dest.mkdirs()
        java.util.zip.GZIPInputStream(tgz.inputStream().buffered()).use { gz ->
            val header = ByteArray(512)
            val buf = ByteArray(64 * 1024)
            while (true) {
                if (!readBlock(gz, header)) break
                if (header.all { it.toInt() == 0 }) break
                val name = String(header, 0, 100, Charsets.UTF_8).trimEnd('\u0000')
                val prefix = String(header, 345, 155, Charsets.UTF_8).trimEnd('\u0000')
                val sizeText = String(header, 124, 12, Charsets.US_ASCII).trim('\u0000', ' ')
                val size = if (sizeText.isEmpty()) 0L else sizeText.toLong(8)
                val type = header[156].toInt()
                val full = if (prefix.isNotEmpty()) "$prefix/$name" else name
                val base = full.substringAfterLast('/')
                val keep = (type == '0'.code || type == 0) && base.isNotEmpty() && !base.startsWith(".") && wanted(full)
                val out = if (keep) FileOutputStream(File(dest, base)) else null
                try {
                    var left = size
                    while (left > 0) {
                        val n = gz.read(buf, 0, min(buf.size.toLong(), left).toInt())
                        if (n < 0) throw Exception("Archivo incompleto")
                        out?.write(buf, 0, n)
                        left -= n
                    }
                } finally {
                    out?.close()
                }
                var pad = (512 - size % 512) % 512
                while (pad > 0) {
                    val n = gz.read(buf, 0, pad.toInt())
                    if (n < 0) break
                    pad -= n
                }
            }
        }
    }

    private fun readBlock(input: java.io.InputStream, b: ByteArray): Boolean {
        var off = 0
        while (off < b.size) {
            val n = input.read(b, off, b.size - off)
            if (n < 0) return false
            off += n
        }
        return true
    }

    /** Descarga con reanudación: si se corta, sigue desde donde quedó. */
    private fun fetch(url: String, part: File, id: String, progress: (Long, Long) -> Unit) {
        var current = url
        var have = if (part.exists()) part.length() else 0L
        var redirects = 0
        while (true) {
            val c = URL(current).openConnection() as HttpURLConnection
            c.instanceFollowRedirects = false
            c.connectTimeout = 20000
            c.readTimeout = 30000
            c.setRequestProperty("User-Agent", "CriollEnglish")
            if (have > 0) c.setRequestProperty("Range", "bytes=$have-")
            val code = c.responseCode
            if (code in 300..399) {
                val loc = c.getHeaderField("Location") ?: throw Exception("Redirección sin destino")
                current = URL(URL(current), loc).toString()
                c.disconnect()
                if (++redirects > 8) throw Exception("Demasiadas redirecciones")
                continue
            }
            if (code == 416) {
                c.disconnect()
                return // ya estaba completo
            }
            if (code != 200 && code != 206) throw Exception("Error $code al descargar")
            if (code == 200) have = 0L
            val len = if (c.contentLengthLong > 0) have + c.contentLengthLong else -1L
            c.inputStream.use { input ->
                FileOutputStream(part, code == 206).use { output ->
                    val buf = ByteArray(256 * 1024)
                    var got = have
                    while (true) {
                        if (cancelled[id] == true) throw Exception("cancelado")
                        val n = input.read(buf)
                        if (n < 0) break
                        output.write(buf, 0, n)
                        got += n
                        progress(got, len)
                    }
                }
            }
            c.disconnect()
            return
        }
    }

    /** Lee un archivo de texto chico de un paquete (por ejemplo, los nombres de las voces). */
    @PluginMethod
    fun readText(call: PluginCall) {
        val id = call.getString("id") ?: return call.reject("Falta id")
        val name = call.getString("name") ?: return call.reject("Falta nombre")
        val f = File(dir(id), name.replace("/", "_"))
        if (!f.exists() || f.length() > 1_000_000) return call.reject("No existe")
        val ret = JSObject()
        ret.put("text", f.readText())
        call.resolve(ret)
    }

    @PluginMethod
    fun cancelDownload(call: PluginCall) {
        call.getString("id")?.let { cancelled[it] = true }
        call.resolve()
    }

    @PluginMethod
    fun remove(call: PluginCall) {
        val id = call.getString("id") ?: return call.reject("Falta id")
        work.execute {
            if (ttsId == id) releaseTts()
            if (earId == id) releaseEar()
            if (proofId == id) releaseProof()
            dir(id).deleteRecursively()
            call.resolve()
        }
    }

    // ───────────── voz de Oliver ─────────────

    @Volatile private var ttsKind = "piper"
    @Volatile private var ttsKey = ""
    @Volatile private var reference: FloatArray? = null
    @Volatile private var referenceRate = 16000
    @Volatile private var referenceName = ""

    /**
     * Carga una voz: piper (Piper australiano), kokoro, supertonic o pocket (Pocket TTS, que imita la voz de
     * una grabación). La expresividad y el ritmo de Piper son parte del modelo: si cambian, se vuelve a cargar.
     */
    @PluginMethod
    fun loadVoice(call: PluginCall) {
        val id = call.getString("id") ?: return call.reject("Falta id")
        val kind = call.getString("kind") ?: "piper"
        val voice = call.getString("espeak") ?: "en-gb-x-rp"
        val noise = call.getFloat("noise") ?: 0.667f
        val noiseW = call.getFloat("noiseW") ?: 0.8f
        work.execute {
            try {
                val key = "$id|$noise|$noiseW"
                if (ttsKey != key) {
                    releaseTts()
                    val d = dir(id)
                    if (kind == "piper" && !File(d, "tokens2.txt").exists()) {
                        call.reject("Hay que actualizar esta voz (Ajustes › Voces e IA)")
                        return@execute
                    }
                    if ((kind == "piper" || kind == "kokoro" || kind == "kitten") && !phonemizerReady) {
                        step("preparar el fonemizador")
                        piperPhonemizeInitialize(context)
                        phonemizerReady = true
                    }
                    step("cargar la voz $id")
                    val model = OfflineTtsModelConfig()
                    model.numThreads = 2
                    when (kind) {
                        "kokoro" -> {
                            val k = OfflineTtsKokoroModelConfig()
                            k.model = File(d, "model.onnx").absolutePath
                            k.voices = File(d, "voices.bin").absolutePath
                            k.tokens = File(d, "tokens.txt").absolutePath
                            model.kokoro = k
                        }
                        "kitten" -> {
                            val k = OfflineTtsKittenModelConfig()
                            k.model = File(d, "model.onnx").absolutePath
                            k.voices = File(d, "voices.bin").absolutePath
                            k.tokens = File(d, "tokens.txt").absolutePath
                            model.kitten = k
                        }
                        "supertonic" -> {
                            val t = OfflineTtsSupertonicModelConfig()
                            t.durationPredictor = File(d, "duration_predictor.onnx").absolutePath
                            t.textEncoder = File(d, "text_encoder.onnx").absolutePath
                            t.vectorEstimator = File(d, "vector_estimator.onnx").absolutePath
                            t.vocoder = File(d, "vocoder.onnx").absolutePath
                            t.ttsJson = File(d, "tts.json").absolutePath
                            t.unicodeIndexer = File(d, "unicode_indexer.bin").absolutePath
                            t.voiceStyle = File(d, "voice.bin").absolutePath
                            model.supertonic = t
                        }
                        "pocket" -> {
                            val t = OfflineTtsPocketModelConfig()
                            t.lmFlow = File(d, "lm_flow.onnx").absolutePath
                            t.lmMain = File(d, "lm_main.onnx").absolutePath
                            t.encoder = File(d, "encoder.onnx").absolutePath
                            t.decoder = File(d, "decoder.onnx").absolutePath
                            t.textConditioner = File(d, "text_conditioner.onnx").absolutePath
                            t.vocabJson = File(d, "vocab.json").absolutePath
                            t.tokenScoresJson = File(d, "token_scores.json").absolutePath
                            model.pocket = t
                        }
                        else -> {
                            val v = OfflineTtsVitsModelConfig()
                            v.model = File(d, "model.onnx").absolutePath
                            v.tokens = File(d, "tokens2.txt").absolutePath
                            v.noiseScale = noise
                            v.noiseScaleW = noiseW
                            model.vits = v
                        }
                    }
                    val config = OfflineTtsConfig()
                    config.model = model
                    tts = OfflineTts(null, config)
                    ttsId = id
                    ttsKind = kind
                    ttsKey = key
                    reference = null
                    referenceName = ""
                    stepDone()
                }
                espeakVoice = voice
                val ret = JSObject()
                ret.put("speakers", tts?.numSpeakers() ?: 1)
                ret.put("sampleRate", tts?.sampleRate() ?: 22050)
                call.resolve(ret)
            } catch (e: Throwable) {
                stepDone()
                releaseTts()
                call.reject("No se pudo cargar la voz: ${e.message}")
            }
        }
    }

    /** Pocket TTS: la voz sale de una grabación (ref-N.wav del paquete o mi-voz.wav grabada en la app). */
    private fun loadReference(file: String) {
        if (referenceName == file && reference != null) return
        val f = File(dir(ttsId ?: "pocket"), file)
        if (!f.exists()) throw IllegalStateException("Falta la grabación de la voz")
        val (data, rate) = readWav(f)
        reference = data
        referenceRate = rate
        referenceName = file
    }

    /** Lee un WAV PCM de 16 bits o float de 32 bits (mono, o se queda con el primer canal). */
    private fun readWav(f: File): Pair<FloatArray, Int> {
        val b = f.readBytes()
        val bb = java.nio.ByteBuffer.wrap(b).order(java.nio.ByteOrder.LITTLE_ENDIAN)
        var pos = 12
        var rate = 16000
        var channels = 1
        var bits = 16
        var format = 1
        while (pos + 8 <= b.size) {
            val id = String(b, pos, 4, Charsets.US_ASCII)
            val size = bb.getInt(pos + 4)
            val body = pos + 8
            if (id == "fmt ") {
                format = bb.getShort(body).toInt()
                channels = bb.getShort(body + 2).toInt()
                rate = bb.getInt(body + 4)
                bits = bb.getShort(body + 14).toInt()
            } else if (id == "data") {
                val len = min(size, b.size - body)
                val frame = channels * bits / 8
                val n = len / frame
                val out = FloatArray(n)
                for (i in 0 until n) {
                    val at = body + i * frame
                    out[i] = if (format == 3 || bits == 32) bb.getFloat(at) else bb.getShort(at) / 32768f
                }
                return Pair(out, rate)
            }
            pos = body + size + (size and 1)
        }
        throw IllegalStateException("Grabación inválida")
    }

    /**
     * Habla. Opciones de diagnóstico (laboratorio de audio), para probar de a una variable:
     * raw = sin shape(); noParams = sin PlaybackParams; bufferMs = tamaño del búfer (0 = el normal);
     * pcm16 = reproducir en 16 bits en vez de float; save = guardar el audio crudo del motor en Descargas.
     * Devuelve lo que pasó en la reproducción (frecuencia, errores, cortes, picos…).
     */
    @PluginMethod
    fun speak(call: PluginCall) {
        val text = call.getString("text") ?: ""
        val sid = call.getInt("speaker") ?: 0
        val speed = call.getFloat("speed") ?: 1.0f
        val pitch = call.getFloat("pitch") ?: 1.0f
        val volume = call.getFloat("volume") ?: 1.0f
        val ref = call.getString("reference")
        val raw = call.getBoolean("raw", false) ?: false
        val noParams = call.getBoolean("noParams", false) ?: false
        val bufferMs = call.getInt("bufferMs") ?: 0
        val pcm16 = call.getBoolean("pcm16", false) ?: false
        val save = call.getBoolean("save", false) ?: false
        val assistant = call.getBoolean("assistant", false) ?: false
        stopSpeech = false
        work.execute {
            val voice = tts
            if (voice == null) {
                call.reject("La voz no está cargada")
                return@execute
            }
            var player: AudioTrack? = null
            val diag = JSObject()
            val log = StringBuilder()
            try {
                if (ttsKind == "pocket") loadReference(ref ?: "ref-howard-skyman-2.wav")
                val rate = voice.sampleRate()
                val encoding = if (pcm16) AudioFormat.ENCODING_PCM_16BIT else AudioFormat.ENCODING_PCM_FLOAT
                val bytes = if (pcm16) 2 else 4
                val minBuf = AudioTrack.getMinBufferSize(rate, AudioFormat.CHANNEL_OUT_MONO, encoding)
                val bufBytes = if (bufferMs > 0) max(minBuf, rate * bufferMs / 1000 * bytes) else max(minBuf * 2, rate / 5 * bytes)
                val out = AudioTrack.Builder()
                    .setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(if (assistant && Build.VERSION.SDK_INT >= 26) AudioAttributes.USAGE_ASSISTANT else AudioAttributes.USAGE_MEDIA)
                            .setContentType(if (assistant) AudioAttributes.CONTENT_TYPE_MUSIC else AudioAttributes.CONTENT_TYPE_SPEECH)
                            .build(),
                    )
                    .setAudioFormat(
                        AudioFormat.Builder()
                            .setEncoding(encoding)
                            .setSampleRate(rate)
                            .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                            .build(),
                    )
                    .setBufferSizeInBytes(bufBytes)
                    .setTransferMode(AudioTrack.MODE_STREAM)
                    .build()
                player = out
                if (out.state != AudioTrack.STATE_INITIALIZED) log.append("AudioTrack no se inicializó (state=${out.state}). ")
                if (bufferMs == 0 && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    try {
                        out.setStartThresholdInFrames(min(out.bufferSizeInFrames, rate / 20))
                    } catch (e: Throwable) {
                        log.append("startThreshold: ${e.message}. ")
                    }
                }
                if (pitch != 1.0f && !noParams) {
                    try {
                        out.playbackParams = PlaybackParams().setPitch(pitch).setSpeed(1.0f)
                    } catch (e: Throwable) {
                        log.append("PlaybackParams: ${e.message}. ")
                    }
                }
                track = out
                out.play()
                var frames = 0L
                var genMs = 0L
                var writeErrors = 0
                var peak = 0f
                var clipped = 0
                var bad = 0
                val rawAll = if (save) ArrayList<FloatArray>() else null
                val write: (FloatArray) -> Unit = { data ->
                    var off = 0
                    if (pcm16) {
                        val sh = ShortArray(data.size) { (max(-1f, min(1f, data[it])) * 32767f).toInt().toShort() }
                        while (off < sh.size && !stopSpeech) {
                            val k = out.write(sh, off, min(4096, sh.size - off), AudioTrack.WRITE_BLOCKING)
                            if (k < 0) {
                                writeErrors++
                                log.append("write=$k. ")
                                break
                            }
                            if (k == 0) break
                            off += k
                        }
                    } else {
                        while (off < data.size && !stopSpeech) {
                            val k = out.write(data, off, min(4096, data.size - off), AudioTrack.WRITE_BLOCKING)
                            if (k < 0) {
                                writeErrors++
                                log.append("write=$k. ")
                                break
                            }
                            if (k == 0) break
                            off += k
                        }
                    }
                    frames += data.size
                }
                step("hablar con la voz $ttsId")
                // Mientras suena una parte, la siguiente ya se está generando: así no quedan pausas largas
                // entre frases y la primera arranca enseguida (si es larga, se corta en la primera coma).
                val parts = speechParts(forSpeech(text))
                val queue = java.util.concurrent.LinkedBlockingQueue<Any>()
                val end = Any()
                genWork.execute {
                    try {
                        for (part in parts) {
                            if (stopSpeech) break
                            val gen = GenerationConfig()
                            gen.sid = sid
                            gen.speed = speed
                            if (ttsKind == "piper" || ttsKind == "kokoro" || ttsKind == "kitten") {
                                val res = piperPhonemizeText(part.text, espeakVoice) ?: continue
                                val phonemes: Array<IntArray>
                                try {
                                    phonemes = Array(res.numSentences) { res.getPhonemes(it) }
                                } finally {
                                    res.close()
                                }
                                if (phonemes.isEmpty()) continue
                                gen.phonemeCodepoints = phonemes
                            }
                            if (ttsKind == "supertonic") {
                                gen.numSteps = 8
                                gen.extra = mapOf("lang" to "en")
                            }
                            if (ttsKind == "pocket") {
                                gen.sid = 0
                                gen.numSteps = 5
                                gen.referenceAudio = reference
                                gen.referenceSampleRate = referenceRate
                            }
                            val t0 = SystemClock.elapsedRealtime()
                            val audio = voice.generateWithConfig(if (gen.phonemeCodepoints != null) "" else part.text, gen)
                            genMs += SystemClock.elapsedRealtime() - t0
                            val samples = audio.samples
                            if (audio.sampleRate != rate) log.append("El motor devolvió ${audio.sampleRate} Hz y se reproduce a $rate Hz. ")
                            for (v in samples) {
                                if (v.isNaN() || v.isInfinite()) bad++
                                val av = abs(v)
                                if (av > peak) peak = av
                                if (av > 1f) clipped++
                            }
                            rawAll?.add(samples.copyOf())
                            if (!raw) shape(samples, rate, volume)
                            queue.put(Pair(part.pauseMs, samples))
                        }
                    } catch (t: Throwable) {
                        queue.put(t)
                    } finally {
                        queue.put(end)
                    }
                }
                var first = true
                while (true) {
                    val item = queue.poll(60, TimeUnit.SECONDS) ?: break
                    if (item === end) break
                    if (item is Throwable) throw item
                    val pair = item as Pair<*, *>
                    val pauseMs = pair.first as Int
                    val samples = pair.second as FloatArray
                    if (stopSpeech) continue
                    if (!first && pauseMs > 0) write(FloatArray(rate * pauseMs / 1000))
                    first = false
                    write(samples)
                }
                stepDone()
                // Un poco de silencio al final empuja las últimas palabras (si no, quedaban esperando en el búfer).
                if (!stopSpeech && frames > 0) write(FloatArray(rate / 4))
                // Esperar a que termine de sonar.
                val deadline = SystemClock.elapsedRealtime() + (frames * 1000 / rate * 1.3).toLong() + 1500
                while (!stopSpeech && out.playbackHeadPosition < frames && SystemClock.elapsedRealtime() < deadline) {
                    Thread.sleep(30)
                }
                diag.put("engine", ttsKind)
                diag.put("sampleRate", rate)
                diag.put("trackRate", out.sampleRate)
                diag.put("deviceRate", AudioTrack.getNativeOutputSampleRate(android.media.AudioManager.STREAM_MUSIC))
                diag.put("format", (if (pcm16) "PCM 16 bits" else "PCM float") + (if (assistant) ", canal asistente" else ", canal multimedia"))
                diag.put("bufferMs", out.bufferSizeInFrames * 1000 / rate)
                diag.put("underruns", if (Build.VERSION.SDK_INT >= 24) out.underrunCount else -1)
                diag.put("writeErrors", writeErrors)
                diag.put("audioMs", frames * 1000 / rate)
                diag.put("genMs", genMs)
                diag.put("peak", peak.toDouble())
                diag.put("clipped", clipped)
                diag.put("badSamples", bad)
                diag.put("shape", !raw)
                diag.put("playbackParams", pitch != 1.0f && !noParams)
                try {
                    diag.put("output", out.routedDevice?.productName?.toString() ?: "")
                } catch (_: Throwable) {
                }
                if (rawAll != null) {
                    val total = rawAll.sumOf { it.size }
                    val all = FloatArray(total)
                    var at = 0
                    for (c in rawAll) {
                        System.arraycopy(c, 0, all, at, c.size)
                        at += c.size
                    }
                    diag.put("saved", saveToDownloads(all, rate, "criollenglish-${ttsKind}-${System.currentTimeMillis() / 1000}.wav"))
                }
                diag.put("log", log.toString())
                call.resolve(diag)
            } catch (e: Throwable) {
                stepDone()
                call.reject("No se pudo hablar: ${e.message}")
            } finally {
                try {
                    player?.stop()
                } catch (_: Throwable) {
                }
                player?.release()
                track = null
            }
        }
    }

    /** Guarda el audio crudo del motor (antes de cualquier procesamiento) en Descargas/CriollEnglish. */
    private fun saveToDownloads(x: FloatArray, rate: Int, name: String): String {
        val bb = java.nio.ByteBuffer.allocate(44 + x.size * 4).order(java.nio.ByteOrder.LITTLE_ENDIAN)
        bb.put("RIFF".toByteArray()).putInt(36 + x.size * 4).put("WAVE".toByteArray())
        bb.put("fmt ".toByteArray()).putInt(16).putShort(3).putShort(1).putInt(rate).putInt(rate * 4).putShort(4).putShort(32)
        bb.put("data".toByteArray()).putInt(x.size * 4)
        for (v in x) bb.putFloat(v)
        val bytes = bb.array()
        if (Build.VERSION.SDK_INT >= 29) {
            val values = android.content.ContentValues()
            values.put(android.provider.MediaStore.MediaColumns.DISPLAY_NAME, name)
            values.put(android.provider.MediaStore.MediaColumns.MIME_TYPE, "audio/wav")
            values.put(android.provider.MediaStore.MediaColumns.RELATIVE_PATH, android.os.Environment.DIRECTORY_DOWNLOADS + "/CriollEnglish")
            val uri = context.contentResolver.insert(android.provider.MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                ?: throw IllegalStateException("No se pudo crear el archivo en Descargas")
            context.contentResolver.openOutputStream(uri)?.use { it.write(bytes) }
            return "Descargas/CriollEnglish/$name"
        }
        val f = File(context.getExternalFilesDir(null), name)
        f.writeBytes(bytes)
        return f.absolutePath
    }

    /**
     * Pule cada frase: saca el zumbido grave de las grabaciones caseras, suaviza el comienzo y el final
     * (sin clics) y aplica el volumen que elegiste (sin tocar el volumen del teléfono). Si el volumen
     * sube, un limitador suave evita que suene saturado.
     */
    private fun shape(x: FloatArray, rate: Int, volume: Float) {
        if (x.isEmpty()) return
        // Filtro pasa-altos de 1er orden a ~70 Hz.
        val rc = 1.0 / (2 * Math.PI * 70)
        val dt = 1.0 / rate
        val alpha = (rc / (rc + dt)).toFloat()
        var prevIn = x[0]
        var prevOut = 0f
        for (i in x.indices) {
            val v = x[i]
            val o = alpha * (prevOut + v - prevIn)
            prevIn = v
            prevOut = o
            x[i] = o
        }
        val fade = min(x.size / 2, rate / 100) // 10 ms
        for (i in 0 until fade) {
            val g = i.toFloat() / fade
            x[i] *= g
            x[x.size - 1 - i] *= g
        }
        if (volume != 1.0f) {
            for (i in x.indices) {
                val v = x[i] * volume
                x[i] = if (volume > 1f) (kotlin.math.tanh(v.toDouble() * 1.1) / 1.1).toFloat() else v
            }
        }
    }

    /** Graba una voz de referencia para Pocket TTS (con permiso de la persona). Se guarda en el teléfono. */
    @PluginMethod
    fun recordReference(call: PluginCall) {
        if (getPermissionState("microphone") != PermissionState.GRANTED) {
            requestPermissionForAlias("microphone", call, "recordPermission")
            return
        }
        doRecordReference(call)
    }

    @PermissionCallback
    private fun recordPermission(call: PluginCall) {
        if (getPermissionState("microphone") == PermissionState.GRANTED) doRecordReference(call)
        else call.reject("Sin permiso para el micrófono")
    }

    @SuppressLint("MissingPermission")
    private fun doRecordReference(call: PluginCall) {
        val id = call.getString("id") ?: "pocket"
        val seconds = min(20, max(3, call.getInt("seconds") ?: 10))
        stopListen = false
        ioWork.execute {
            val rate = 16000
            var rec: AudioRecord? = null
            try {
                val minBuf = AudioRecord.getMinBufferSize(rate, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT)
                rec = AudioRecord(MediaRecorder.AudioSource.MIC, rate, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT, max(minBuf, rate))
                val total = rate * seconds
                val pcm = ShortArray(total)
                rec.startRecording()
                var got = 0
                while (got < total && !stopListen) {
                    val n = rec.read(pcm, got, min(2400, total - got))
                    if (n <= 0) continue
                    got += n
                    val ev = JSObject()
                    ev.put("progress", got.toDouble() / total)
                    notifyListeners("recording", ev)
                }
                rec.stop()
                val out = File(dir(id), "mi-voz.wav")
                writeWav(out, pcm, got, rate)
                if (ttsId == id && referenceName == "mi-voz.wav") reference = null
                val ret = JSObject()
                ret.put("seconds", got.toDouble() / rate)
                call.resolve(ret)
            } catch (e: Throwable) {
                call.reject("No se pudo grabar: ${e.message}")
            } finally {
                rec?.release()
            }
        }
    }

    private fun writeWav(f: File, pcm: ShortArray, n: Int, rate: Int) {
        val bb = java.nio.ByteBuffer.allocate(44 + n * 2).order(java.nio.ByteOrder.LITTLE_ENDIAN)
        bb.put("RIFF".toByteArray()).putInt(36 + n * 2).put("WAVE".toByteArray())
        bb.put("fmt ".toByteArray()).putInt(16).putShort(1).putShort(1).putInt(rate).putInt(rate * 2).putShort(2).putShort(16)
        bb.put("data".toByteArray()).putInt(n * 2)
        for (i in 0 until n) bb.putShort(pcm[i])
        f.writeBytes(bb.array())
    }

    @PluginMethod
    fun stopSpeaking(call: PluginCall) {
        stopSpeech = true
        try {
            track?.pause()
            track?.flush()
        } catch (_: Throwable) {
        }
        call.resolve()
    }

    /** Palabras que el fonemizador lee mal (por ejemplo «G'day» como la letra G). */
    private fun forSpeech(text: String): String =
        text.replace(Regex("\\bG'?day\\b", RegexOption.IGNORE_CASE), "gidday")
            .replace(Regex("\\bHooroo\\b", RegexOption.IGNORE_CASE), "hoo-roo")

    private data class Part(val text: String, val pauseMs: Int)

    /**
     * Partes para hablar, con la pausa natural antes de cada una: un poco más larga después de una
     * pregunta o exclamación, y corta si se partió en una coma (solo la primera frase, si es larga,
     * para que la voz arranque antes).
     */
    private fun speechParts(text: String): List<Part> {
        val out = ArrayList<Part>()
        var prevEnd = '.'
        for ((i, sentence) in splitSentences(text).withIndex()) {
            val pause = when (prevEnd) {
                '?', '!' -> 300
                else -> 230
            }
            val words = sentence.split(Regex("\\s+")).size
            val comma = sentence.indexOf(", ")
            if (i == 0 && words > 9 && comma > 0 && sentence.substring(0, comma).split(' ').size >= 3) {
                out.add(Part(sentence.substring(0, comma + 1), 0))
                out.add(Part(sentence.substring(comma + 2), 110))
            } else out.add(Part(sentence, if (i == 0) 0 else pause))
            prevEnd = sentence.trimEnd().lastOrNull() ?: '.'
        }
        return out
    }

    private fun splitSentences(text: String): List<String> {
        val parts = text.trim().split(Regex("(?<=[.!?])\\s+")).map { it.trim() }.filter { it.isNotEmpty() }
        return parts.ifEmpty { listOf(text) }
    }

    // ───────────── oído ─────────────

    @Volatile private var earKind = "moonshine"

    /** Carga el reconocimiento de voz: moonshine (liviano), parakeet (NVIDIA, inglés) o qwen3 (Qwen3-ASR, multilingüe). */
    @PluginMethod
    fun loadEar(call: PluginCall) {
        val id = call.getString("id") ?: return call.reject("Falta id")
        val kind = call.getString("kind") ?: "moonshine"
        work.execute {
            try {
                if (earId != id) {
                    releaseEar()
                    step("cargar el reconocimiento de voz $id")
                    val d = dir(id)
                    val model = OfflineModelConfig()
                    model.numThreads = if (kind == "moonshine") 2 else 4
                    when (kind) {
                        "parakeet" -> {
                            val t = OfflineTransducerModelConfig()
                            t.encoder = File(d, "encoder.onnx").absolutePath
                            t.decoder = File(d, "decoder.onnx").absolutePath
                            t.joiner = File(d, "joiner.onnx").absolutePath
                            model.transducer = t
                            model.tokens = File(d, "tokens.txt").absolutePath
                            model.modelType = "nemo_transducer"
                        }
                        "qwen3" -> {
                            val q = OfflineQwen3AsrModelConfig()
                            q.convFrontend = File(d, "conv_frontend.onnx").absolutePath
                            q.encoder = File(d, "encoder.onnx").absolutePath
                            q.decoder = File(d, "decoder.onnx").absolutePath
                            q.tokenizer = File(d, "tokenizer").absolutePath
                            model.qwen3Asr = q
                            model.tokens = ""
                        }
                        else -> {
                            val moon = OfflineMoonshineModelConfig()
                            moon.encoder = File(d, "encoder_model.ort").absolutePath
                            moon.mergedDecoder = File(d, "decoder_model_merged.ort").absolutePath
                            model.moonshine = moon
                            model.tokens = File(d, "tokens.txt").absolutePath
                        }
                    }
                    val config = OfflineRecognizerConfig()
                    config.modelConfig = model
                    ear = OfflineRecognizer(null, config)
                    earId = id
                    earKind = kind
                    stepDone()
                }
                call.resolve()
            } catch (e: Throwable) {
                stepDone()
                releaseEar()
                call.reject("No se pudo cargar el reconocimiento de voz: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun listen(call: PluginCall) {
        if (getPermissionState("microphone") != PermissionState.GRANTED) {
            requestPermissionForAlias("microphone", call, "micPermission")
            return
        }
        doListen(call)
    }

    @PermissionCallback
    private fun micPermission(call: PluginCall) {
        if (getPermissionState("microphone") == PermissionState.GRANTED) doListen(call)
        else call.reject("Sin permiso para el micrófono")
    }

    /**
     * Graba del micrófono hasta que dejás de hablar (o, en modo manual, hasta stopListening).
     * Devuelve el audio a 16 kHz desde un poco antes de la primera palabra, o null si no hablaste.
     */
    @SuppressLint("MissingPermission")
    private fun recordSpeech(maxMs: Long, silenceMs: Long, waitMs: Long, manual: Boolean): FloatArray? {
        val rate = 16000
        val chunk = rate / 10
        var rec: AudioRecord? = null
        try {
            val minBuf = AudioRecord.getMinBufferSize(rate, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT)
            rec = AudioRecord(
                MediaRecorder.AudioSource.VOICE_RECOGNITION,
                rate,
                AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.ENCODING_PCM_16BIT,
                max(minBuf, chunk * 4),
            )
            rec.startRecording()
            val audio = ArrayList<Float>(rate * 8)
            val buf = ShortArray(chunk)
            val start = SystemClock.elapsedRealtime()
            var noise = 0.0
            var noiseN = 0
            var started = false
            var lastVoice = 0L
            var speechStart = 0
            var voicedChunks = 0
            while (!stopListen) {
                val n = rec.read(buf, 0, chunk)
                if (n <= 0) continue
                var sum = 0.0
                for (i in 0 until n) {
                    val f = buf[i] / 32768f
                    audio.add(f)
                    sum += f * f
                }
                val rms = sqrt(sum / n)
                val now = SystemClock.elapsedRealtime()
                if (!started && noiseN < 4) {
                    noise = (noise * noiseN + rms) / (noiseN + 1)
                    noiseN++
                }
                val voiced = rms > max(0.012, noise * 3.0)
                if (voiced) {
                    voicedChunks++
                    if (!started) {
                        started = true
                        // Medio segundo antes de la primera palabra, para no comerse el comienzo.
                        speechStart = max(0, audio.size - n * 5)
                        notifyListeners("speechStart", JSObject())
                    }
                    lastVoice = now
                }
                val lv = JSObject()
                lv.put("level", min(1.0, rms * 12))
                notifyListeners("level", lv)
                if (!manual && started && now - lastVoice > silenceMs) break
                if (!manual && !started && now - start > waitMs) break
                if (now - start > maxMs) break
            }
            rec.stop()
            // Menos de 0,3 s de voz: fue un ruido, no una frase.
            if (!started || voicedChunks < 3) return null
            return FloatArray(audio.size - speechStart) { audio[speechStart + it] }
        } finally {
            rec?.release()
        }
    }

    private fun wavOf(samples: FloatArray, rate: Int): ByteArray {
        val bb = java.nio.ByteBuffer.allocate(44 + samples.size * 2).order(java.nio.ByteOrder.LITTLE_ENDIAN)
        bb.put("RIFF".toByteArray()).putInt(36 + samples.size * 2).put("WAVE".toByteArray())
        bb.put("fmt ".toByteArray()).putInt(16).putShort(1).putShort(1).putInt(rate).putInt(rate * 2).putShort(2).putShort(16)
        bb.put("data".toByteArray()).putInt(samples.size * 2)
        for (v in samples) bb.putShort((max(-1f, min(1f, v)) * 32767f).toInt().toShort())
        return bb.array()
    }

    private fun doListen(call: PluginCall) {
        val maxMs = (call.getInt("maxMs") ?: 15000).toLong()
        val silenceMs = (call.getInt("silenceMs") ?: 1100).toLong()
        val waitMs = (call.getInt("waitMs") ?: 8000).toLong()
        val language = call.getString("language") ?: "English"
        // Modo manual: no corta por silencio; termina cuando tocás el micrófono (stopListening).
        val manual = call.getBoolean("manual", false) ?: false
        stopListen = false
        ioWork.execute {
            val recognizer = ear
            if (recognizer == null) {
                call.reject("El reconocimiento de voz no está cargado")
                return@execute
            }
            try {
                val limit = if (manual) max(maxMs, 60000L) else maxMs
                val samples = recordSpeech(limit, silenceMs, waitMs, manual)
                val ret = JSObject()
                if (samples == null) {
                    ret.put("text", "")
                    call.resolve(ret)
                    return@execute
                }
                notifyListeners("heard", JSObject())
                val rz = recognizer ?: throw IllegalStateException("El reconocimiento de voz no está cargado")
                step("entender lo que dijiste")
                val stream = rz.createStream()
                try {
                    if (earKind == "qwen3") stream.setOption("language", language)
                    stream.acceptWaveform(samples, 16000)
                    rz.decode(stream)
                    ret.put("text", rz.getResult(stream).text.trim())
                } finally {
                    stream.release()
                    stepDone()
                }
                call.resolve(ret)
            } catch (e: Throwable) {
                call.reject("No se pudo escuchar: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun stopListening(call: PluginCall) {
        stopListen = true
        call.resolve()
    }

    // ───────────── corrector de textos ─────────────

    /**
     * Corrige un texto en inglés con el modelo Proofread de Google (200M, MediaPipe). Se carga al primer uso
     * y queda cargado hasta salir de «Escribir en inglés» (unloadProofreader).
     */
    @PluginMethod
    fun proofread(call: PluginCall) {
        val id = call.getString("id") ?: return call.reject("Falta id")
        val file = call.getString("file") ?: "proofread_quant_200m.litertlm"
        val text = call.getString("text") ?: return call.reject("Falta el texto")
        proofWork.execute {
            try {
                if (proofreader == null || proofId != id) {
                    releaseProof()
                    val f = File(dir(id), file)
                    if (!f.exists()) throw IllegalStateException("El corrector no está descargado")
                    step("cargar el corrector de textos")
                    val opts = TextProofreaderOptions.builder().setModelPath(f.absolutePath).setMaxNumTokens(2048).build()
                    proofreader = TextProofreader.createFromOptions(context, opts)
                    proofId = id
                    stepDone()
                }
                val pr = proofreader ?: throw IllegalStateException("El corrector no está cargado")
                step("corregir el texto")
                val started = SystemClock.elapsedRealtime()
                val r = pr.proofread(text)
                stepDone()
                val ret = JSObject()
                ret.put("text", r.getProofreadText() ?: "")
                ret.put("ms", SystemClock.elapsedRealtime() - started)
                call.resolve(ret)
            } catch (e: Throwable) {
                stepDone()
                releaseProof()
                call.reject("No se pudo corregir: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun unloadProofreader(call: PluginCall) {
        proofWork.execute {
            releaseProof()
            call.resolve()
        }
    }

    private fun releaseProof() {
        try {
            proofreader?.close()
        } catch (_: Throwable) {
        }
        proofreader = null
        proofId = null
    }

    // ───────────── liberar todo ─────────────

    /** Se llama al cortar la llamada: libera memoria y procesador. */
    @PluginMethod
    fun unloadAll(call: PluginCall) {
        stopSpeech = true
        stopListen = true
        proofWork.execute { releaseProof() }
        work.execute {
            releaseTts()
            releaseEar()
            call.resolve()
        }
    }

    private fun releaseTts() {
        try {
            tts?.release()
        } catch (_: Throwable) {
        }
        tts = null
        ttsId = null
        ttsKey = ""
        reference = null
        referenceName = ""
    }

    private fun releaseEar() {
        try {
            ear?.release()
        } catch (_: Throwable) {
        }
        ear = null
        earId = null
    }

    override fun handleOnDestroy() {
        stopSpeech = true
        stopListen = true
        releaseProof()
        releaseTts()
        releaseEar()
        work.shutdown()
        proofWork.shutdown()
        genWork.shutdown()
        ioWork.shutdown()
        super.handleOnDestroy()
    }
}
