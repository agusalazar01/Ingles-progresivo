import { useState } from 'react';
import { AiSettings } from '../components/AiSettings';
import { forgetFact, forgetOliverMemory } from '../lib/oliver';
import { BackButton } from '../components/BackButton';
import { resetAll, setState, useAppState } from '../lib/store';
import { ACCENT_LABEL, listVoices, openVoiceSettings, say, SYSTEM_VOICE, type Accent } from '../lib/speech';
import { sfxCorrect } from '../lib/sfx';
import { useBack } from '../lib/nav';
import { aiAvailable, packById } from '../lib/ai';
import { APP_VERSION, BUILD } from '../lib/update';

export type SettingsSection = 'look' | 'voice' | 'ai' | 'study' | 'about';

const SECTIONS: { id: SettingsSection; icon: string; title: string; desc: string }[] = [
  { id: 'look', icon: '🎨', title: 'Apariencia y sonido', desc: 'Modo oscuro o claro, sonidos de acierto y error' },
  { id: 'voice', icon: '🗣️', title: 'Voz del teléfono y acento', desc: 'La voz de los ejercicios y el acento de las voces' },
  { id: 'ai', icon: '🤖', title: 'Voces e IA para la llamada', desc: 'Voz de Oliver, reconocimiento de voz y charla sin internet' },
  { id: 'study', icon: '📚', title: 'Estudio', desc: 'Palabras nuevas por sesión' },
  { id: 'about', icon: 'ℹ️', title: 'Datos y acerca de', desc: 'Versión de la app y borrar el progreso' },
];

/** Configuración: un menú con todas las opciones de la app, agrupadas por sección. */
export function Settings({ initial, onExit }: { initial?: SettingsSection; onExit: () => void }) {
  const [section, setSection] = useState<SettingsSection | null>(initial ?? null);
  const close = () => (section && !initial ? setSection(null) : onExit());
  useBack(true, close, 2);
  const s = useAppState();
  const current = SECTIONS.find((x) => x.id === section);

  const summary = (id: SettingsSection) => {
    if (id === 'look') return `${s.settings.theme === 'dark' ? 'Oscuro' : 'Claro'} · sonidos ${s.settings.sounds ? 'prendidos' : 'apagados'}`;
    if (id === 'voice') return s.settings.voice === SYSTEM_VOICE ? 'Voz del teléfono' : ACCENT_LABEL[s.settings.accent];
    if (id === 'ai') {
      if (!aiAvailable()) return 'Solo en la app de Android';
      const v = packById(s.settings.ai.voice)?.title ?? 'voz del teléfono';
      const b = packById(s.settings.ai.brain)?.title ?? 'sin IA de charla';
      return `${v} · ${b}`;
    }
    if (id === 'study') return `${s.settings.newWords} palabras nuevas`;
    return `v${APP_VERSION}`;
  };

  return (
    <div className="screen settings">
      <div className="top-bar">
        <BackButton onClick={close} />
      </div>
      <p className="eyebrow">Configuración</p>
      <h1>{current ? `${current.icon} ${current.title}` : '⚙️ Configuración'}</h1>
      {!current && (
        <div className="settings-menu">
          {SECTIONS.map((x) => (
            <button key={x.id} className="settings-item" onClick={() => setSection(x.id)}>
              <span className="settings-icon">{x.icon}</span>
              <span className="settings-text">
                <b>{x.title}</b>
                <span className="small">{x.desc}</span>
                <span className="small settings-now">{summary(x.id)}</span>
              </span>
              <span className="settings-chev">›</span>
            </button>
          ))}
        </div>
      )}
      {section === 'look' && <LookSettings />}
      {section === 'voice' && (
        <>
          <VoiceSettings />
          <AccentSettings />
        </>
      )}
      {section === 'ai' && (
        <>
          <AiSettings />
          <OliverMemoryCard />
        </>
      )}
      {section === 'study' && <StudySettings />}
      {section === 'about' && <About />}
    </div>
  );
}

function LookSettings() {
  const s = useAppState();
  return (
    <div className="card">
      <p className="card-title">Apariencia</p>
      <div className="row">
        {(['dark', 'light'] as const).map((t) => (
          <button
            key={t}
            className={`option grow ${s.settings.theme === t ? 'right' : ''}`}
            onClick={() => setState((st) => ({ ...st, settings: { ...st.settings, theme: t } }))}
          >
            {t === 'dark' ? '🌙 Oscuro' : '☀️ Claro'}
          </button>
        ))}
      </div>
      <p className="card-title">Sonido</p>
      <button
        className={`option ${s.settings.sounds ? 'right' : ''}`}
        onClick={() => {
          const on = !s.settings.sounds;
          setState((st) => ({ ...st, settings: { ...st.settings, sounds: on } }));
          if (on) setTimeout(sfxCorrect, 50);
        }}
      >
        {s.settings.sounds ? '🔊 Sonidos de acierto y error: prendidos' : '🔇 Sonidos de acierto y error: apagados'}
      </button>
    </div>
  );
}

function AccentSettings() {
  const s = useAppState();
  return (
    <div className="card">
      <p className="card-title">Acento de las voces</p>
      <p className="small">Si no elegiste una voz fija, se usa este acento. "Variado" entrena el oído con muchas voces distintas.</p>
      <div className="options">
        {(Object.keys(ACCENT_LABEL) as Accent[]).map((a) => (
          <button
            key={a}
            className={`option ${s.settings.accent === a ? 'right' : ''}`}
            onClick={() => {
              setState((st) => ({ ...st, settings: { ...st.settings, accent: a } }));
              say('Hello! This is how I sound.', { accent: a, voice: '' });
            }}
          >
            {ACCENT_LABEL[a]}
          </button>
        ))}
      </div>
    </div>
  );
}

function StudySettings() {
  const s = useAppState();
  return (
    <div className="card">
      <p className="card-title">Palabras nuevas por sesión</p>
      <p className="small">Cuántas palabras nuevas aparecen cada vez que practicás vocabulario.</p>
      <div className="row">
        {[5, 10, 20].map((k) => (
          <button
            key={k}
            className={`option grow ${s.settings.newWords === k ? 'right' : ''}`}
            onClick={() => setState((st) => ({ ...st, settings: { ...st.settings, newWords: k } }))}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

function About() {
  return (
    <>
      <div className="card">
        <p className="card-title">CriollEnglish</p>
        <p className="small">Learn English, a lo criollo.</p>
        <p className="small">
          Versión {APP_VERSION}
          {BUILD ? ` · compilación ${BUILD}` : ' · desarrollo'}
        </p>
        <p className="small">Tu progreso y tus llamadas se guardan solo en este teléfono. La IA de la llamada funciona sin internet: nada de lo que decís sale del teléfono.</p>
      </div>
      <div className="card">
        <p className="card-title">Borrar el progreso</p>
        <p className="small">Borra unidades, repasos, palabras, errores y llamadas. Las voces e IA descargadas se mantienen.</p>
        <button
          className="secondary"
          onClick={() => {
            if (window.confirm('¿Borrar todo el progreso? No se puede deshacer.')) resetAll();
          }}
        >
          🗑️ Borrar mi progreso
        </button>
      </div>
    </>
  );
}

function VoiceSettings() {
  const s = useAppState();
  const [voices, setVoices] = useState<{ id: string; name: string; lang: string; local: boolean }[] | null>(null);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const set = (voice: string) => setState((st) => ({ ...st, settings: { ...st.settings, voice } }));
  const load = () => {
    setOpen(true);
    listVoices().then((v) => setVoices([...v].sort((a, b) => Number(b.lang === 'en-AU') - Number(a.lang === 'en-AU') || a.lang.localeCompare(b.lang) || a.id.localeCompare(b.id))));
  };
  const pick = (id: string) => {
    set(id);
    say("G'day! This is how I sound.", { voice: id, lang: 'en-AU' });
  };
  const current = s.settings.voice === SYSTEM_VOICE ? 'la voz del teléfono (Ajustes › Texto a voz)' : s.settings.voice || 'según el acento elegido';
  return (
    <div className="card">
      <p className="card-title">Voz (Oliver y ejercicios)</p>
      <p className="small">
        Ahora: <b>{current}</b>
      </p>
      <button
        className={`option ${s.settings.voice === SYSTEM_VOICE ? 'right' : ''}`}
        onClick={() => {
          set(SYSTEM_VOICE);
          say("G'day! This is how I sound.", { voice: SYSTEM_VOICE, lang: 'en-AU' });
        }}
      >
        📱 Usar la voz del teléfono (recomendado)
      </button>
      <button
        className="secondary"
        onClick={async () => {
          const ok = await openVoiceSettings();
          setMsg(ok ? 'Elegí el motor (por ejemplo Samsung), el idioma English (Australia) y la voz que te guste. Después volvé y tocá «Usar la voz del teléfono».' : 'En este dispositivo no puedo abrir los ajustes de voz. Buscá «Texto a voz» en los ajustes del teléfono.');
        }}
      >
        ⚙️ Abrir los ajustes de voz del teléfono
      </button>
      {msg && <p className="small">{msg}</p>}
      {!open && (
        <button className="link" onClick={load}>
          O elegir una voz de la lista
        </button>
      )}
      {open && voices === null && <p className="small">Buscando voces…</p>}
      {open && voices && (
        <div className="options">
          <button className={`option ${!s.settings.voice ? 'right' : ''}`} onClick={() => set('')}>
            Ninguna fija (usar el acento)
          </button>
          {voices.length === 0 && <p className="small">No encontré voces en inglés. Revisá el motor de texto a voz del teléfono.</p>}
          {voices.map((v) => (
            <button key={v.id} className={`option ${s.settings.voice === v.id ? 'right' : ''}`} onClick={() => pick(v.id)}>
              {v.lang === 'en-AU' ? '🇦🇺 ' : ''}
              {v.name} <span className="small">· {v.id}{v.local ? '' : ' · necesita internet'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Lo que Oliver anotó de vos en las llamadas libres (queda solo en el teléfono). */
function OliverMemoryCard() {
  const s = useAppState();
  const facts = s.oliver?.facts ?? [];
  return (
    <div className="card">
      <p className="card-title">🧠 Lo que Oliver recuerda de vos</p>
      <p className="small">
        Después de cada llamada libre con IA, Oliver anota datos que le contaste para retomarlos la próxima vez. Queda solo en tu teléfono.
      </p>
      {!facts.length && <p className="small">Todavía nada.</p>}
      {facts.map((f, i) => (
        <div key={i} className="row between">
          <span>{f}</span>
          <button className="link" aria-label="Olvidar" onClick={() => forgetFact(i)}>
            ✕
          </button>
        </div>
      ))}
      {facts.length > 0 && (
        <button className="link" onClick={() => forgetOliverMemory()}>
          Que olvide todo
        </button>
      )}
    </div>
  );
}
