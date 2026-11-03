import { useState } from 'react';
import { ExerciseRunner, type RunnerItem } from '../components/ExerciseRunner';
import { exerciseRef, recordReview } from '../lib/actions';

export function Review({ keys, title, onExit }: { keys: string[]; title: string; onExit: () => void }) {
  // Se mezclan ejercicios de distintas unidades (práctica intercalada).
  const [items] = useState<RunnerItem[]>(() =>
    keys
      .map(exerciseRef)
      .filter((x): x is RunnerItem => !!x)
      .map((x) => ({ x, k: Math.random() }))
      .sort((a, b) => a.k - b.k)
      .map((p) => p.x),
  );
  const [stats, setStats] = useState({ ok: 0, total: 0 });
  const [done, setDone] = useState(items.length === 0);

  if (done) {
    return (
      <div className="screen">
        <h1>{items.length ? 'Repaso terminado' : 'Nada para repasar'}</h1>
        {items.length > 0 && (
          <p className="big">
            {stats.ok} de {stats.total} bien
          </p>
        )}
        <p>
          Cada ejercicio se reprogramó según cómo te fue: lo que te costó vuelve pronto y lo que sabés bien, más
          adelante.
        </p>
        <button className="primary" onClick={onExit}>
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <p className="eyebrow">{title}</p>
      <ExerciseRunner
        items={items}
        showUnit
        onItem={(r) => {
          recordReview(r);
          setStats((s) => ({ ok: s.ok + (r.outcome === 'again' ? 0 : 1), total: s.total + 1 }));
        }}
        onDone={() => setDone(true)}
      />
    </div>
  );
}
