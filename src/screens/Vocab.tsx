import { useState } from 'react';
import { ExerciseRunner } from '../components/ExerciseRunner';
import { recordReview } from '../lib/actions';
import { say } from '../lib/speech';
import { dueKeys, getState, setState, useAppState } from '../lib/store';
import { BANDS, bandProgress, defaultBand, introduceWord, nextNewWords, wordItem } from '../lib/vocab';
import type { Level } from '../content/types';
import type { Route } from '../App';

export function Vocab({ go }: { go: (r: Route) => void }) {
  const s = useAppState();
  const [band, setBand] = useState<Level>(() => defaultBand(getState()));
  const [learning, setLearning] = useState<[string, string][] | null>(null);
  const [pos, setPos] = useState(0);
  const [shown, setShown] = useState(false);
  const [practice, setPractice] = useState<string[] | null>(null);
  const due = dueKeys(s).filter((k) => k.startsWith('w:'));
  const n = s.settings.newWords;

  if (practice) {
    return (
      <div className="screen">
        <p className="eyebrow">Práctica: escribí la palabra en inglés</p>
        <ExerciseRunner
          items={practice.map(wordItem)}
          onItem={(r) => recordReview(r)}
          onDone={() => setPractice(null)}
        />
      </div>
    );
  }

  if (learning) {
    const [word, es] = learning[pos];
    const next = (known: boolean) => {
      introduceWord(word, known);
      setShown(false);
      if (pos + 1 < learning.length) setPos(pos + 1);
      else {
        // Recuperación inmediata de las que no sabías: producirlas una vez antes de terminar.
        const unknown = learning.map(([w]) => w).filter((w) => !getState().words[w]?.known);
        setLearning(null);
        setPos(0);
        if (unknown.length) setPractice(unknown);
      }
    };
    return (
      <div className="screen">
        <div className="counter">
          <span>
            Palabra {pos + 1} de {learning.length}
          </span>
          <span className="small">banda {band}</span>
        </div>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${(pos / learning.length) * 100}%` }} />
        </div>
        <div className="word-card">
          <p className="sheet-word">{word}</p>
          <button className="icon" onClick={() => say(word, { accent: s.settings.accent })} aria-label="Escuchar">
            ▶
          </button>
        </div>
        {!shown ? (
          <>
            <p className="small">Pensá qué significa antes de mirar: tratar de recordar es lo que fija la palabra.</p>
            <button className="primary" onClick={() => setShown(true)}>
              Mostrar significado
            </button>
          </>
        ) : (
          <>
            <p className="meaning center">{es}</p>
            <div className="row">
              <button className="secondary" onClick={() => next(false)}>
                No la sabía
              </button>
              <button className="primary" onClick={() => next(true)}>
                La sabía
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  const p = bandProgress(s, band);
  const fresh = nextNewWords(s, band, n);

  return (
    <div className="screen">
      <h1>Vocabulario</h1>
      <p className="small">Las 2801 palabras más usadas del inglés (lista NGSL), ordenadas por frecuencia: cubren cerca del 92% del inglés cotidiano.</p>

      <div className="bands">
        {BANDS.map((b) => {
          const bp = bandProgress(s, b.level);
          return (
            <button key={b.level} className={`band ${band === b.level ? 'active' : ''}`} onClick={() => setBand(b.level)}>
              <span className="unit-title">{b.level}</span>
              <span className="unit-status">
                {bp.added}/{bp.total}
              </span>
              <span className="mini-bar">
                <span style={{ width: `${(bp.added / bp.total) * 100}%` }} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="card">
        <p className="card-title">Banda {band}</p>
        <p className="small">
          {p.added} de {p.total} palabras vistas · {p.solid} ya consolidadas
        </p>
        {fresh.length ? (
          <button
            className="primary"
            onClick={() => {
              setPos(0);
              setShown(false);
              setLearning(fresh);
            }}
          >
            Aprender {fresh.length} palabras nuevas
          </button>
        ) : (
          <p>Ya viste todas las palabras de esta banda.</p>
        )}
      </div>

      {due.length > 0 && (
        <div className="card">
          <p className="card-title">Repaso de palabras</p>
          <p>{due.length} palabras para recordar hoy.</p>
          <button className="secondary" onClick={() => go({ name: 'review', keys: due.slice(0, 25), title: 'Repaso de palabras' })}>
            Repasar
          </button>
        </div>
      )}

      <div className="card">
        <p className="card-title">Palabras nuevas por sesión</p>
        <div className="row">
          {[5, 10, 20].map((k) => (
            <button
              key={k}
              className={`option ${n === k ? 'right' : ''}`}
              onClick={() => setState((st) => ({ ...st, settings: { ...st.settings, newWords: k } }))}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
