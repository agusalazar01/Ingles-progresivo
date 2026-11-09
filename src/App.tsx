import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { runBack, useBack } from './lib/nav';
import { Lesson } from './screens/Lesson';
import { Placement } from './screens/Placement';
import { Review } from './screens/Review';
import { Errors, Home, Path, Progress, Welcome } from './screens/Tabs';
import { Exam, Mixed, Remedial } from './screens/Practice';
import { Vocab } from './screens/Vocab';
import { Call } from './screens/Call';
import { Phrases } from './screens/Phrases';
import { Structures } from './screens/Structures';
import { Settings, type SettingsSection } from './screens/Settings';
import { VerbLesson, VerbWorkshop } from './screens/Verbs';
import type { Level } from './content/types';
import { markActive, setState, useAppState } from './lib/store';
import { syncPlacedUnits } from './lib/actions';
import { checkUpdate, type UpdateInfo } from './lib/update';
import { WordContext } from './components/Words';
import { setPreferredVoice, SYSTEM_VOICE } from './lib/speech';
import { WordSheet } from './components/WordSheet';
import './App.css';

export type Route =
  | { name: 'home'; skipWelcome?: boolean }
  | { name: 'path' }
  | { name: 'errors' }
  | { name: 'progress' }
  | { name: 'settings'; section?: SettingsSection }
  | { name: 'vocab' }
  | { name: 'phrases' }
  | { name: 'structures' }
  | { name: 'verbs' }
  | { name: 'verb'; verbId: string; banner?: string }
  | { name: 'mixed'; family: string }
  | { name: 'exam'; level: Level }
  | { name: 'remedial'; unitIds: string[]; level: Level }
  | { name: 'placement'; retest: boolean }
  | { name: 'lesson'; unitId: string; banner?: string; resume?: boolean }
  | { name: 'call'; callId?: string; unitId?: string; free?: boolean }
  | { name: 'review'; keys: string[]; title: string };

const TABS: { name: 'home' | 'path' | 'vocab' | 'call' | 'errors' | 'progress'; label: string }[] = [
  { name: 'home', label: 'Hoy' },
  { name: 'path', label: 'Camino' },
  { name: 'vocab', label: 'Palabras' },
  { name: 'call', label: 'Llamar' },
  { name: 'errors', label: 'Errores' },
  { name: 'progress', label: 'Progreso' },
];

export default function App() {
  const s = useAppState();
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const [word, setWord] = useState<{ word: string; sentence: string } | null>(null);
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const isNew = s.tests.length === 0 && Object.keys(s.units).length === 0 && s.activity.length === 0;

  // Historial para el botón «atrás»: cada pantalla vuelve a la anterior, no al menú ni afuera de la app.
  const [stack, setStack] = useState<Route[]>([]);
  const TAB_NAMES = ['home', 'path', 'vocab', 'errors', 'progress'];
  const go = (r: Route) => {
    if (r.name === 'home' && r.skipWelcome) setState(markActive);
    if (TAB_NAMES.includes(r.name)) setStack(r.name === 'home' ? [] : [{ name: 'home' }]);
    else setStack((st) => [...st, route.name === 'lesson' ? { ...route, resume: false, banner: undefined } : route]);
    setRoute(r);
  };
  /** Cambia la pantalla sin sumar un paso al historial (por ejemplo, pasar a la unidad siguiente). */
  const replace = (r: Route) => setRoute(r);
  const back = () => {
    if (stack.length) {
      setRoute(stack[stack.length - 1]);
      setStack(stack.slice(0, -1));
    } else if (route.name !== 'home') setRoute({ name: 'home' });
    else if (Capacitor.isNativePlatform()) CapApp.minimizeApp().catch(() => {});
  };
  const backRef = useRef(back);
  backRef.current = back;

  useEffect(() => {
    const handle = () => {
      if (!runBack()) backRef.current();
    };
    if (Capacitor.isNativePlatform()) {
      const l = CapApp.addListener('backButton', handle);
      return () => {
        l.then((x) => x.remove());
      };
    }
    // Navegador: el «atrás» del navegador hace lo mismo y no saca de la app.
    history.pushState({ criollenglish: 1 }, '');
    const onPop = () => {
      handle();
      history.pushState({ criollenglish: 1 }, '');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  useEffect(() => {
    document.documentElement.dataset.theme = s.settings.theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', s.settings.theme === 'dark' ? '#131f24' : '#f6f4ef');
  }, [s.settings.theme]);

  useEffect(() => {
    // La v0.7 guardaba el nombre visible («English Australia»), que en Android se repite: pasa a «voz del teléfono».
    if (s.settings.voice && s.settings.voice !== SYSTEM_VOICE && /\s/.test(s.settings.voice)) {
      setState((st) => ({ ...st, settings: { ...st.settings, voice: SYSTEM_VOICE } }));
      return;
    }
    setPreferredVoice(s.settings.voice);
  }, [s.settings.voice]);

  useEffect(() => {
    syncPlacedUnits();
    checkUpdate().then(setUpdate);
  }, []);

  useBack(!!word, () => setWord(null), 9);

  let body;
  switch (route.name) {
    case 'placement':
      body = <Placement retest={route.retest} onExit={back} />;
      break;
    case 'lesson':
      body = (
        <Lesson
          key={route.unitId}
          unitId={route.unitId}
          banner={route.banner}
          resume={route.resume}
          onExit={back}
          onNextUnit={(unitId, banner) => replace({ name: 'lesson', unitId, banner })}
          onCall={(callId) => go({ name: 'call', callId })}
        />
      );
      break;
    case 'call':
      body = (
        <Call
          key={route.callId ?? 'libre'}
          callId={route.callId}
          free={route.free}
          onExit={back}
          onSettings={() => replace({ name: 'settings', section: 'ai' })}
        />
      );
      break;
    case 'review':
      body = <Review keys={route.keys} title={route.title} onExit={back} />;
      break;
    case 'path':
      body = <Path go={go} />;
      break;
    case 'vocab':
      body = <Vocab go={go} />;
      break;
    case 'verbs':
      body = <VerbWorkshop go={go} onBack={back} />;
      break;
    case 'verb':
      body = (
        <VerbLesson
          key={route.verbId}
          verbId={route.verbId}
          banner={route.banner}
          onExit={back}
          onNext={(verbId, banner) => replace({ name: 'verb', verbId, banner })}
        />
      );
      break;
    case 'mixed':
      body = <Mixed family={route.family} onExit={back} />;
      break;
    case 'exam':
      body = (
        <Exam
          level={route.level}
          onExit={back}
          onContinue={(unitId, banner) => replace({ name: 'lesson', unitId, banner })}
          onPractice={(unitIds) => go({ name: 'remedial', unitIds, level: route.level })}
        />
      );
      break;
    case 'remedial':
      body = <Remedial unitIds={route.unitIds} onExit={back} />;
      break;
    case 'errors':
      body = <Errors go={go} />;
      break;
    case 'progress':
      body = <Progress go={go} />;
      break;
    case 'structures':
      body = <Structures onExit={back} />;
      break;
    case 'phrases':
      body = <Phrases onExit={back} />;
      break;
    case 'settings':
      body = <Settings key={route.section ?? 'menu'} initial={route.section} onExit={back} />;
      break;
    default:
      body = isNew ? <Welcome go={go} /> : <Home go={go} />;
  }

  const showTabs = ['home', 'path', 'vocab', 'errors', 'progress'].includes(route.name) && !(route.name === 'home' && isNew);

  return (
    <WordContext.Provider value={(w, sentence) => setWord({ word: w, sentence })}>
    <div className="app">
      {update && showTabs && (
        <div className="update">
          <p>
            Hay una versión nueva: <b>{update.version}</b> (compilación {update.build}).
          </p>
          <a className="primary" href={update.apkUrl} target="_blank" rel="noreferrer">
            Descargar e instalar
          </a>
          <button className="link" onClick={() => setUpdate(null)}>
            Más tarde
          </button>
        </div>
      )}
      {showTabs && (
        <button className="gear-btn" aria-label="Configuración" onClick={() => go({ name: 'settings' })}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      )}
      <main className={showTabs ? "has-gear" : undefined}>{body}</main>
      {showTabs && (
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.name}
              className={route.name === t.name ? 'active' : ''}
              onClick={() => go(t.name === 'call' ? { name: 'call', free: true } : ({ name: t.name } as Route))}
            >
              {t.label}
            </button>
          ))}
        </nav>
      )}
      {word && <WordSheet word={word.word} sentence={word.sentence} onClose={() => setWord(null)} />}
    </div>
    </WordContext.Provider>
  );
}
