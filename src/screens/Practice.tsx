import { useRef, useState } from 'react';
import { ExerciseRunner, type RunnerItem } from '../components/ExerciseRunner';
import { UNITS } from '../content/curriculum';
import type { Level } from '../content/types';
import { generate, generateMixed, supports, type Pattern } from '../gen/generate';
import { recordReview, saveLevelScore, type ItemResult } from '../lib/actions';
import { isDone, nextUnit } from '../lib/progress';
import { getState } from '../lib/store';
import { vocabExamItems } from '../lib/vocab';
import { Explanation } from '../components/Explanation';

const shuffle = <T,>(a: T[]) => a.map((x) => ({ x, k: Math.random() })).sort((p, q) => p.k - q.k).map((p) => p.x);

/** Familias de reglas parecidas, para practicarlas mezcladas. */
export const FAMILIES: { name: string; units: string[] }[] = [
  { name: 'Presentes', units: ['pres-simple', 'pres-cont', 'to-be'] },
  { name: 'Pasados', units: ['past-simple', 'past-cont', 'pres-perfect', 'past-perfect'] },
  { name: 'Futuros', units: ['future', 'future-perf', 'pres-cont'] },
  { name: 'Perfectos', units: ['pres-perfect', 'pres-perf-cont', 'past-perfect', 'future-perf'] },
  { name: 'Condicionales', units: ['cond-1-2', 'cond-3', 'past-modals'] },
  { name: 'Todo lo que sé', units: UNITS.map((u) => u.id) },
];

export function availableFamilies() {
  const s = getState();
  return FAMILIES.map((f) => ({ ...f, units: f.units.filter((id) => isDone(s, id)) })).filter((f) => f.units.length >= 2);
}

function mixedItems(unitIds: string[], n: number): RunnerItem[] {
  const out: RunnerItem[] = [];
  for (let i = 0; i < n * 3 && out.length < n; i++) {
    const g = generateMixed(unitIds);
    if (!g) break;
    const unit = UNITS.find((u) => u.id === g.unitId)!;
    out.push({ key: `${unit.id}@complete`, unit, exercise: g.exercise });
  }
  return out;
}

function Session({ title, intro, items, timed, onItem, onDone }: { title: string; intro?: string; items: RunnerItem[]; timed: boolean; onItem: (r: ItemResult, first: boolean) => void; onDone: () => void }) {
  return (
    <div className="screen">
      <p className="eyebrow">{title}</p>
      {intro && <p className="small">{intro}</p>}
      <ExerciseRunner items={items} showUnit timed={timed} onItem={onItem} onDone={onDone} />
    </div>
  );
}

/** Práctica mezclada: varias reglas parecidas, hay que elegir la correcta sin la pista de la unidad. */
export function Mixed({ family, onExit }: { family: string; onExit: () => void }) {
  const fam = availableFamilies().find((f) => f.name === family);
  const [items] = useState(() => (fam ? mixedItems(fam.units, 12) : []));
  const [stats, setStats] = useState({ ok: 0, total: 0 });
  const [done, setDone] = useState(!items.length);
  if (done)
    return (
      <div className="screen">
        <h1>Práctica mezclada</h1>
        {items.length ? (
          <p className="big">
            {stats.ok} de {stats.total} bien
          </p>
        ) : (
          <p>Todavía no hay suficientes unidades dominadas en este grupo.</p>
        )}
        <button className="primary" onClick={onExit}>
          Volver al inicio
        </button>
      </div>
    );
  return (
    <Session
      title={`Práctica mezclada · ${family}`}
      intro="Las reglas están mezcladas: fijate en las pistas de tiempo para elegir la correcta."
      items={items}
      timed
      onItem={(r) => {
        recordReview(r);
        setStats((s) => ({ ok: s.ok + (r.outcome === 'good' ? 1 : 0), total: s.total + 1 }));
      }}
      onDone={() => setDone(true)}
    />
  );
}

export const GOOD_SCORE = 0.8;

function examItems(level: Level): RunnerItem[] {
  const units = UNITS.filter((u) => u.level === level);
  const production: Pattern[] = ['recognize', 'complete', 'transform', 'translate', 'order'];
  const out: RunnerItem[] = [];
  for (const unit of units) {
    const pats = shuffle(production.filter((p) => supports(unit.id, p)));
    if (pats.length) {
      // Tres preguntas por tema, de tipos distintos.
      for (const p of pats.slice(0, 3)) {
        const exercise = generate(unit.id, p);
        if (exercise) out.push({ key: `${unit.id}@${p}`, unit, exercise });
      }
    } else {
      shuffle(unit.exercises.map((exercise, i) => ({ exercise, i })))
        .slice(0, 3)
        .forEach(({ exercise, i }) => out.push({ key: `${unit.id}#${i}`, unit, exercise }));
    }
  }
  return [...shuffle(out).slice(0, 40), ...vocabExamItems(level, 5)];
}

const answerOf = (r: RunnerItem) => {
  const e = r.exercise;
  return 'options' in e ? e.options[e.answer] : 'answers' in e ? e.answers[0] : e.prompt;
};

/** Prueba de práctica de un nivel: todo lo del nivel mezclado. No bloquea nada; se puede repetir cuando quieras. */
export function Exam({
  level,
  onExit,
  onContinue,
  onPractice,
}: {
  level: Level;
  onExit: () => void;
  onContinue: (unitId: string, banner: string) => void;
  onPractice: (unitIds: string[]) => void;
}) {
  const [phase, setPhase] = useState<'intro' | 'run' | 'done'>('intro');
  const [items, setItems] = useState<RunnerItem[]>([]);
  const results = useRef<ItemResult[]>([]);
  const [score, setScore] = useState(0);

  if (phase === 'intro')
    return (
      <div className="screen">
        <h1>Prueba de práctica: {level}</h1>
        <p>
          Todo lo que aprendiste en {level}, mezclado: tres preguntas por tema (elegir, completar, transformar, ordenar y traducir) más
          vocabulario del nivel. Unas {UNITS.filter((u) => u.level === level).length * 3 + 5} preguntas.
        </p>
        <p className="small">No bloquea nada: es para comprobar cuánto te quedó. Al final ves cada error explicado y podés practicar los temas que fallaste.</p>
        <div className="row">
          <button className="secondary" onClick={onExit}>
            Volver
          </button>
          <button
            className="primary"
            onClick={() => {
              results.current = [];
              setItems(examItems(level));
              setPhase('run');
            }}
          >
            Empezar
          </button>
        </div>
      </div>
    );

  if (phase === 'run')
    return (
      <div className="screen">
        <div className="row between">
          <p className="eyebrow">Prueba de práctica {level}</p>
          <button className="link" onClick={onExit}>
            Volver
          </button>
        </div>
        <ExerciseRunner
          items={items}
          showUnit
          onItem={(r, first) => {
            if (first) results.current.push(r);
          }}
          onDone={() => {
            const graded = results.current.filter((r) => r.outcome !== 'skip');
            const sc = graded.length ? graded.filter((r) => r.outcome !== 'again').length / graded.length : 0;
            setScore(sc);
            saveLevelScore(level, sc);
            for (const r of results.current) recordReview(r);
            setPhase('done');
          }}
        />
      </div>
    );

  const wrong = results.current
    .map((r, i) => ({ r, item: items[i] }))
    .filter(({ r }) => r.outcome === 'again');
  const failedUnits = [...new Set(wrong.map(({ r }) => r.unitId).filter((id) => id !== 'vocab'))];
  const st = getState();
  const nxt = nextUnit(st);
  return (
    <div className="screen">
      <h1>{score >= GOOD_SCORE ? `¡Muy bien en ${level}!` : `Prueba de ${level}: a repasar`}</h1>
      <p className="big">{Math.round(score * 100)}% correcto</p>
      <p className="small">
        {score >= GOOD_SCORE
          ? 'Lo que fallaste quedó en tus errores y vuelve en los repasos.'
          : 'Te conviene practicar los temas que fallaste y volver a hacer la prueba más adelante (las preguntas cambian).'}
      </p>
      {failedUnits.length > 0 && (
        <button className="primary" onClick={() => onPractice(failedUnits)}>
          Practicar los temas fallados ({failedUnits.length})
        </button>
      )}
      {nxt && (
        <button className="secondary" onClick={() => onContinue(nxt.id, `Seguimos con «${nxt.title}».`)}>
          Seguir con «{nxt.title}»
        </button>
      )}
      {wrong.length > 0 && (
        <>
          <h2>Tus errores, explicados</h2>
          <ul className="errors">
            {wrong.map(({ r, item }, i) => (
              <li key={i}>
                <p className="small">{item.unit.title}</p>
                <p className="prompt-sm">{item.exercise.kind === 'transform' ? `${item.exercise.prompt} → ${item.exercise.task}` : item.exercise.prompt}</p>
                <p className="given">Pusiste: {r.given || '—'}</p>
                <p className="correct">Correcto: {answerOf(item)}</p>
                <p className="why">{('explain' in item.exercise && item.exercise.explain) || item.unit.trap || ''}</p>
              </li>
            ))}
          </ul>
        </>
      )}
      <button className="link" onClick={onExit}>
        Volver al camino
      </button>
    </div>
  );
}

/** Práctica dirigida de los temas fallados: explicación breve y ejercicios nuevos de cada tema. */
export function Remedial({ unitIds, onExit }: { unitIds: string[]; onExit: () => void }) {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'explain' | 'run'>('explain');
  const [items, setItems] = useState<RunnerItem[]>([]);
  const unit = UNITS.find((u) => u.id === unitIds[idx]);
  if (!unit) {
    onExit();
    return null;
  }
  const nextTopic = () => {
    if (idx + 1 < unitIds.length) {
      setIdx(idx + 1);
      setPhase('explain');
    } else onExit();
  };
  if (phase === 'explain')
    return (
      <div className="screen">
        <div className="row between">
          <p className="eyebrow">
            Tema {idx + 1} de {unitIds.length}
          </p>
          <button className="link" onClick={onExit}>
            Volver
          </button>
        </div>
        <h1>{unit.title}</h1>
        <Explanation unit={unit} />
        <button
          className="primary"
          onClick={() => {
            const pats: Pattern[] = ['recognize', 'complete', 'transform', 'translate', 'order', 'complete'];
            const gen = pats
              .filter((p) => supports(unit.id, p))
              .map((p) => ({ p, e: generate(unit.id, p) }))
              .filter((x) => x.e)
              .map(({ p, e }) => ({ key: `${unit.id}@${p}`, unit, exercise: e! }));
            const cur = unit.exercises.map((exercise, i) => ({ key: `${unit.id}#${i}`, unit, exercise }));
            setItems(shuffle(gen.length >= 4 ? gen : [...gen, ...cur]).slice(0, 6));
            setPhase('run');
          }}
        >
          Practicar este tema
        </button>
      </div>
    );
  return (
    <div className="screen">
      <p className="eyebrow">Práctica: {unit.title}</p>
      <ExerciseRunner key={idx} items={items} requeue onItem={(r) => recordReview(r)} onDone={nextTopic} />
    </div>
  );
}
