package uy.agustin.inglesprogresivo

import android.Manifest
import android.annotation.SuppressLint
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.AudioTrack
import android.media.MediaRecorder
import android.os.SystemClock
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
import com.google.ai.edge.litertlm.Backend
import com.google.ai.edge.litertlm.Contents
import com.google.ai.edge.litertlm.Conversation
import com.google.ai.edge.litertlm.ConversationConfig
import com.google.ai.edge.litertlm.Engine
import com.google.ai.edge.litertlm.EngineConfig
import com.google.ai.edge.litertlm.Message
import com.google.ai.edge.litertlm.MessageCallback
import com.google.ai.edge.litertlm.SamplerConfig
import com.google.ai.edge.litertlm.ThinkingConfig
import com.k2fsa.sherpa.onnx.GenerationConfig
import com.k2fsa.sherpa.onnx.OfflineModelConfig
import com.k2fsa.sherpa.onnx.OfflineMoonshineModelConfig
import com.k2fsa.sherpa.onnx.OfflineRecognizer
import com.k2fsa.sherpa.onnx.OfflineRecognizerConfig
import com.k2fsa.sherpa.onnx.OfflineTts
import com.k2fsa.sherpa.onnx.OfflineTtsConfig
import com.k2fsa.sherpa.onnx.OfflineTtsKokoroModelConfig
import com.k2fsa.sherpa.onnx.OfflineTtsModelConfig
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
    private val brainWork = Executors.newSingleThreadExecutor() // IA de charla
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

    @Volatile private var engine: Engine? = null
    @Volatile private var engineId: String? = null
    @Volatile private var conversation: Conversation? = null

    @Volatile private var phonemizerReady = false

    private fun root(): File = File(context.filesDir, "ai").apply { mkdirs() }
    private fun dir(id: String): File = File(root(), id.replace(Regex("[^a-zA-Z0-9_.-]"), "_"))

    // ───────────── descargas ─────────────

    @PluginMethod
    fun status(call: PluginCall) {
        val installed = JSObject()
        root().listFiles()?.forEach { d ->
            if (File(d, ".ok").exists()) installed.put(d.name, d.listFiles()?.sumOf { it.length() } ?: 0L)
        }
        val ret = JSObject()
        ret.put("installed", installed)
        ret.put("freeBytes", context.filesDir.usableSpace)
        val loaded = JSArray()
        listOfNotNull(ttsId, earId, engineId).forEach { loaded.put(it) }
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
                    if (!out.exists()) {
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
                    }
                    before += weights[i]
                }
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
            if (engineId == id) releaseBrain()
            dir(id).deleteRecursively()
            call.resolve()
        }
    }

    // ───────────── voz de Oliver ─────────────

    @PluginMethod
    fun loadVoice(call: PluginCall) {
        val id = call.getString("id") ?: return call.reject("Falta id")
        val kind = call.getString("kind") ?: "piper"
        val voice = call.getString("espeak") ?: "en-gb-x-rp"
        work.execute {
            try {
                if (ttsId != id) {
                    releaseTts()
                    if (!phonemizerReady) {
                        piperPhonemizeInitialize(context)
                        phonemizerReady = true
                    }
                    val d = dir(id)
                    val model = OfflineTtsModelConfig()
                    model.numThreads = 2
                    if (kind == "kokoro") {
                        val k = OfflineTtsKokoroModelConfig()
                        k.model = File(d, "model.onnx").absolutePath
                        k.voices = File(d, "voices.bin").absolutePath
                        k.tokens = File(d, "tokens.txt").absolutePath
                        model.kokoro = k
                    } else {
                        val v = OfflineTtsVitsModelConfig()
                        v.model = File(d, "model.onnx").absolutePath
                        v.tokens = File(d, "tokens.txt").absolutePath
                        model.vits = v
                    }
                    val config = OfflineTtsConfig()
                    config.model = model
                    tts = OfflineTts(null, config)
                    ttsId = id
                }
                espeakVoice = voice
                val ret = JSObject()
                ret.put("speakers", tts?.numSpeakers() ?: 1)
                ret.put("sampleRate", tts?.sampleRate() ?: 22050)
                call.resolve(ret)
            } catch (e: Throwable) {
                releaseTts()
                call.reject("No se pudo cargar la voz: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun speak(call: PluginCall) {
        val text = call.getString("text") ?: ""
        val sid = call.getInt("speaker") ?: 0
        val speed = call.getFloat("speed") ?: 1.0f
        stopSpeech = false
        work.execute {
            val voice = tts
            if (voice == null) {
                call.reject("La voz no está cargada")
                return@execute
            }
            var player: AudioTrack? = null
            try {
                val rate = voice.sampleRate()
                val minBuf = AudioTrack.getMinBufferSize(rate, AudioFormat.CHANNEL_OUT_MONO, AudioFormat.ENCODING_PCM_FLOAT)
                player = AudioTrack.Builder()
                    .setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_MEDIA)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                            .build(),
                    )
                    .setAudioFormat(
                        AudioFormat.Builder()
                            .setEncoding(AudioFormat.ENCODING_PCM_FLOAT)
                            .setSampleRate(rate)
                            .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                            .build(),
                    )
                    .setBufferSizeInBytes(max(minBuf, rate * 4))
                    .setTransferMode(AudioTrack.MODE_STREAM)
                    .build()
                track = player
                player.play()
                var frames = 0L
                // Frase por frase: mientras suena una, se genera la siguiente.
                for (sentence in splitSentences(text)) {
                    if (stopSpeech) break
                    val res = piperPhonemizeText(sentence, espeakVoice) ?: continue
                    val phonemes: Array<IntArray>
                    try {
                        phonemes = Array(res.numSentences) { res.getPhonemes(it) }
                    } finally {
                        res.close()
                    }
                    if (phonemes.isEmpty()) continue
                    val gen = GenerationConfig()
                    gen.sid = sid
                    gen.speed = speed
                    gen.phonemeCodepoints = phonemes
                    val audio = voice.generateWithConfig("", gen)
                    val samples = audio.samples
                    if (stopSpeech) break
                    var off = 0
                    while (off < samples.size && !stopSpeech) {
                        val n = player.write(samples, off, min(4096, samples.size - off), AudioTrack.WRITE_BLOCKING)
                        if (n <= 0) break
                        off += n
                    }
                    frames += samples.size
                }
                // Esperar a que termine de sonar.
                val deadline = SystemClock.elapsedRealtime() + frames * 1000 / rate + 1500
                while (!stopSpeech && player.playbackHeadPosition < frames && SystemClock.elapsedRealtime() < deadline) {
                    Thread.sleep(30)
                }
                call.resolve()
            } catch (e: Throwable) {
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

    private fun splitSentences(text: String): List<String> {
        val parts = text.trim().split(Regex("(?<=[.!?])\\s+")).map { it.trim() }.filter { it.isNotEmpty() }
        return parts.ifEmpty { listOf(text) }
    }

    // ───────────── oído ─────────────

    @PluginMethod
    fun loadEar(call: PluginCall) {
        val id = call.getString("id") ?: return call.reject("Falta id")
        work.execute {
            try {
                if (earId != id) {
                    releaseEar()
                    val d = dir(id)
                    val moon = OfflineMoonshineModelConfig()
                    moon.encoder = File(d, "encoder_model.ort").absolutePath
                    moon.mergedDecoder = File(d, "decoder_model_merged.ort").absolutePath
                    val model = OfflineModelConfig()
                    model.moonshine = moon
                    model.tokens = File(d, "tokens.txt").absolutePath
                    model.numThreads = 2
                    val config = OfflineRecognizerConfig()
                    config.modelConfig = model
                    ear = OfflineRecognizer(null, config)
                    earId = id
                }
                call.resolve()
            } catch (e: Throwable) {
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

    @SuppressLint("MissingPermission")
    private fun doListen(call: PluginCall) {
        val maxMs = (call.getInt("maxMs") ?: 15000).toLong()
        val silenceMs = (call.getInt("silenceMs") ?: 1100).toLong()
        val waitMs = (call.getInt("waitMs") ?: 8000).toLong()
        stopListen = false
        ioWork.execute {
            val recognizer = ear
            if (recognizer == null) {
                call.reject("El reconocimiento de voz no está cargado")
                return@execute
            }
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
                        if (!started) {
                            started = true
                            speechStart = max(0, audio.size - n * 3)
                            notifyListeners("speechStart", JSObject())
                        }
                        lastVoice = now
                    }
                    val lv = JSObject()
                    lv.put("level", min(1.0, rms * 12))
                    notifyListeners("level", lv)
                    if (started && now - lastVoice > silenceMs) break
                    if (!started && now - start > waitMs) break
                    if (now - start > maxMs) break
                }
                rec.stop()
                val ret = JSObject()
                if (!started) {
                    ret.put("text", "")
                    call.resolve(ret)
                    return@execute
                }
                val samples = FloatArray(audio.size - speechStart) { audio[speechStart + it] }
                val stream = recognizer.createStream()
                try {
                    stream.acceptWaveform(samples, rate)
                    recognizer.decode(stream)
                    ret.put("text", recognizer.getResult(stream).text.trim())
                } finally {
                    stream.release()
                }
                call.resolve(ret)
            } catch (e: Throwable) {
                call.reject("No se pudo escuchar: ${e.message}")
            } finally {
                rec?.release()
            }
        }
    }

    @PluginMethod
    fun stopListening(call: PluginCall) {
        stopListen = true
        call.resolve()
    }

    // ───────────── charla ─────────────

    @PluginMethod
    fun loadBrain(call: PluginCall) {
        val id = call.getString("id") ?: return call.reject("Falta id")
        val file = call.getString("file") ?: return call.reject("Falta archivo")
        val system = call.getString("system") ?: ""
        brainWork.execute {
            try {
                if (engineId != id) {
                    releaseBrain()
                    val config = EngineConfig(
                        modelPath = File(dir(id), file).absolutePath,
                        backend = Backend.CPU(),
                        maxNumTokens = 4096,
                        cacheDir = context.cacheDir.absolutePath,
                    )
                    val e = Engine(config)
                    e.initialize()
                    engine = e
                    engineId = id
                }
                newConversation(system)
                call.resolve()
            } catch (e: Throwable) {
                releaseBrain()
                call.reject("No se pudo cargar la IA: ${e.message}")
            }
        }
    }

    private fun newConversation(system: String) {
        try {
            conversation?.close()
        } catch (_: Throwable) {
        }
        conversation = null
        val e = engine ?: throw IllegalStateException("La IA no está cargada")
        conversation = e.createConversation(
            ConversationConfig(
                systemInstruction = if (system.isNotBlank()) Contents.of(system) else null,
                samplerConfig = SamplerConfig(topK = 40, topP = 0.95, temperature = 0.8),
                thinkingConfig = ThinkingConfig(enableThinking = false),
            ),
        )
    }

    @PluginMethod
    fun resetChat(call: PluginCall) {
        val system = call.getString("system") ?: ""
        brainWork.execute {
            try {
                newConversation(system)
                call.resolve()
            } catch (e: Throwable) {
                call.reject(e.message ?: "error")
            }
        }
    }

    @PluginMethod
    fun chat(call: PluginCall) {
        val text = call.getString("text") ?: ""
        brainWork.execute {
            val conv = conversation
            if (conv == null) {
                call.reject("La IA no está cargada")
                return@execute
            }
            val out = StringBuilder()
            val done = CountDownLatch(1)
            val error = AtomicReference<Throwable?>(null)
            try {
                conv.sendMessageAsync(
                    Message.user(text),
                    object : MessageCallback {
                        override fun onMessage(message: Message) {
                            val piece = message.toString()
                            out.append(piece)
                            val ev = JSObject()
                            ev.put("text", piece)
                            notifyListeners("token", ev)
                        }

                        override fun onDone() {
                            done.countDown()
                        }

                        override fun onError(throwable: Throwable) {
                            error.set(throwable)
                            done.countDown()
                        }
                    },
                )
                if (!done.await(120, TimeUnit.SECONDS)) {
                    try {
                        conv.cancelProcess()
                    } catch (_: Throwable) {
                    }
                }
                val err = error.get()
                if (err != null && out.isEmpty()) {
                    call.reject("La IA falló: ${err.message}")
                } else {
                    val ret = JSObject()
                    ret.put("text", out.toString())
                    call.resolve(ret)
                }
            } catch (e: Throwable) {
                call.reject("La IA falló: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun cancelChat(call: PluginCall) {
        try {
            conversation?.cancelProcess()
        } catch (_: Throwable) {
        }
        call.resolve()
    }

    // ───────────── liberar todo ─────────────

    /** Se llama al cortar la llamada: libera memoria y procesador. */
    @PluginMethod
    fun unloadAll(call: PluginCall) {
        stopSpeech = true
        stopListen = true
        try {
            conversation?.cancelProcess()
        } catch (_: Throwable) {
        }
        brainWork.execute { releaseBrain() }
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
    }

    private fun releaseEar() {
        try {
            ear?.release()
        } catch (_: Throwable) {
        }
        ear = null
        earId = null
    }

    private fun releaseBrain() {
        try {
            conversation?.close()
        } catch (_: Throwable) {
        }
        conversation = null
        try {
            engine?.close()
        } catch (_: Throwable) {
        }
        engine = null
        engineId = null
    }

    override fun handleOnDestroy() {
        stopSpeech = true
        stopListen = true
        releaseBrain()
        releaseTts()
        releaseEar()
        work.shutdown()
        brainWork.shutdown()
        ioWork.shutdown()
        super.handleOnDestroy()
    }
}
