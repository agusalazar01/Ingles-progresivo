import { useState } from 'react';
import { LEVELS } from '../content/types';
import { applyPlacement } from '../lib/actions';
import { answerPlacement, placementResult, startPlacement, type PlacementRun } from '../lib/progress';
import type { TestResult } from '../lib/store';

export function Placement({ onExit, retest }: { onExit: () => void; retest: boolean }) {
  const [run, setRun] = useState<PlacementRun | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [count, setCount] = useState(0);

  if (!run) {
    return (
      <div className="screen">
        <h1>{retest ? 'Nuevo test de nivel' : 'Test de nivel'}</h1>
        <p>
          Son preguntas cortas de gramática, vocabulario y lectura. El test se adapta: empieza en B1 y sube o baja
          según tus respuestas, así que normalmente lleva entre 8 y 16 preguntas.
        </p>
        <p>No adivines: si no sabés, elegí la que te parezca y seguí. El objetivo es ubicarte bien, no sacar nota.</p>
        {retest && <p className="small">Las preguntas se eligen al azar, así que pueden ser distintas a las de la vez anterior.</p>}
        <div className="row">
          <button className="secondary" onClick={onExit}>
            Volver
          </button>
          <button className="primary" onClick={() => setRun(startPlacement())}>
            Empezar
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    const lvl = result.level;
    return (
      <div className="screen">
        <h1>Tu nivel: {lvl ?? 'A1 inicial'}</h1>
        <p>
          {lvl
            ? `Marqué como ubicadas las unidades hasta ${lvl}. No las vas a tener que hacer de nuevo, pero van a aparecer en tus repasos durante las próximas dos semanas para detectar huecos.`
            : 'Empezás desde el principio del camino. Cada unidad se desbloquea cuando dominás la anterior.'}
        </p>
        <h2>Por nivel</h2>
        <ul className="stats">
          {LEVELS.filter((L) => result.perLevel[L]).map((L) => (
            <li key={L}>
              <span>{L}</span>
              <span>
                {result.perLevel[L]!.correct} / {result.perLevel[L]!.total}
              </span>
            </li>
          ))}
        </ul>
        <h2>Por habilidad</h2>
        <ul className="stats">
          {Object.entries(result.perSkill).map(([k, v]) => (
            <li key={k}>
              <span>{k}</span>
              <span>{Math.round((v!.correct / v!.total) * 100)}%</span>
            </li>
          ))}
        </ul>
        <button className="primary" onClick={onExit}>
          Ir a mi camino
        </button>
      </div>
    );
  }

  const item = run.items[run.index];
  const answer = (i: number) => {
    const next = answerPlacement(run, i === item.answer);
    setCount(count + 1);
    if (next.done) {
      const r = placementResult(next);
      applyPlacement(r);
      setResult(r);
    }
    setRun(next);
  };

  return (
    <div className="screen">
      <p className="eyebrow">Pregunta {count + 1} · nivel {run.current}</p>
      {item.text && <p className="reading">{item.text}</p>}
      <p className="prompt">{item.prompt}</p>
      <div className="options">
        {item.options.map((o, i) => (
          <button key={o} className="option" onClick={() => answer(i)}>
            {o}
          </button>
        ))}
      </div>
      <button className="link" onClick={onExit}>
        Salir del test
      </button>
    </div>
  );
}
