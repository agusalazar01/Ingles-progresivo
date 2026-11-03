import { useEffect, useState } from 'react';
import { Lesson } from './screens/Lesson';
import { Placement } from './screens/Placement';
import { Review } from './screens/Review';
import { Errors, Home, Path, Progress, Welcome } from './screens/Tabs';
import { Exam, Mixed } from './screens/Practice';
import { Vocab } from './screens/Vocab';
import type { Level } from './content/types';
import { markActive, setState, useAppState } from './lib/store';
import { syncPlacedUnits } from './lib/actions';
import { checkUpdate, type UpdateInfo } from './lib/update';
import { WordContext } from './components/Words';
import { WordSheet } from './components/WordSheet';
import './App.css';

export type Route =
  | { name: 'home'; skipWelcome?: boolean }
  | { name: 'path' }
  | { name: 'errors' }
  | { name: 'progress' }
  | { name: 'vocab' }
  | { name: 'mixed'; family: string }
  | { name: 'exam'; level: Level }
  | { name: 'placement'; retest: boolean }
  | { name: 'lesson'; unitId: string }
  | { name: 'review'; keys: string[]; title: string };

const TABS: { name: 'home' | 'path' | 'vocab' | 'errors' | 'progress'; label: string }[] = [
  { name: 'home', label: 'Hoy' },
  { name: 'path', label: 'Camino' },
  { name: 'vocab', label: 'Palabras' },
  { name: 'errors', label: 'Errores' },
  { name: 'progress', label: 'Progreso' },
];

export default function App() {
  const s = useAppState();
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const [word, setWord] = useState<{ word: string; sentence: string } | null>(null);
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const isNew = s.tests.length === 0 && Object.keys(s.units).length === 0 && s.activity.length === 0;

  const go = (r: Route) => {
    if (r.name === 'home' && r.skipWelcome) setState(markActive);
    setRoute(r);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  useEffect(() => {
    syncPlacedUnits();
    checkUpdate().then(setUpdate);
  }, []);

  const home = () => setRoute({ name: 'home' });

  let body;
  switch (route.name) {
    case 'placement':
      body = <Placement retest={route.retest} onExit={home} />;
      break;
    case 'lesson':
      body = <Lesson key={route.unitId} unitId={route.unitId} onExit={home} />;
      break;
    case 'review':
      body = <Review keys={route.keys} title={route.title} onExit={home} />;
      break;
    case 'path':
      body = <Path go={go} />;
      break;
    case 'vocab':
      body = <Vocab go={go} />;
      break;
    case 'mixed':
      body = <Mixed family={route.family} onExit={home} />;
      break;
    case 'exam':
      body = <Exam level={route.level} onExit={() => setRoute({ name: 'path' })} />;
      break;
    case 'errors':
      body = <Errors go={go} />;
      break;
    case 'progress':
      body = <Progress go={go} />;
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
      <main>{body}</main>
      {showTabs && (
        <nav className="tabs">
          {TABS.map((t) => (
            <button key={t.name} className={route.name === t.name ? 'active' : ''} onClick={() => setRoute({ name: t.name } as Route)}>
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
