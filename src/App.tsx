import { useEffect, useState } from 'react';
import { Lesson } from './screens/Lesson';
import { Placement } from './screens/Placement';
import { Review } from './screens/Review';
import { Errors, Home, Path, Progress, Welcome } from './screens/Tabs';
import { markActive, setState, useAppState } from './lib/store';
import './App.css';

export type Route =
  | { name: 'home'; skipWelcome?: boolean }
  | { name: 'path' }
  | { name: 'errors' }
  | { name: 'progress' }
  | { name: 'placement'; retest: boolean }
  | { name: 'lesson'; unitId: string }
  | { name: 'review'; keys: string[]; title: string };

const TABS: { name: 'home' | 'path' | 'errors' | 'progress'; label: string }[] = [
  { name: 'home', label: 'Hoy' },
  { name: 'path', label: 'Camino' },
  { name: 'errors', label: 'Errores' },
  { name: 'progress', label: 'Progreso' },
];

export default function App() {
  const s = useAppState();
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const isNew = s.tests.length === 0 && Object.keys(s.units).length === 0 && s.activity.length === 0;

  const go = (r: Route) => {
    if (r.name === 'home' && r.skipWelcome) setState(markActive);
    setRoute(r);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

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
    case 'errors':
      body = <Errors go={go} />;
      break;
    case 'progress':
      body = <Progress go={go} />;
      break;
    default:
      body = isNew ? <Welcome go={go} /> : <Home go={go} />;
  }

  const showTabs = ['home', 'path', 'errors', 'progress'].includes(route.name) && !(route.name === 'home' && isNew);

  return (
    <div className="app">
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
    </div>
  );
}
