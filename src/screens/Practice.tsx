import { useRef, useState } from 'react';
import { ExerciseRunner, type RunnerItem } from '../components/ExerciseRunner';
import { UNITS } from '../content/curriculum';
import type { Level } from '../content/types';
import { generate, generateMixed, supports, type Pattern } from '../gen/generate';
import { passLevel, recordReview, type ItemResult } from '../lib/actions';
import { isDone } from '../lib/progress';
import { getState } from '../lib/store';
import { vocabExamItems } from '../lib/vocab';

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

export const EXAM_PASS = 0.8;

function examItems(level: Level): RunnerItem[] {
  const units = UNITS.filter((u) => u.level === level);
  const production: Pattern[] = ['complete', 'transform', 'translate', 'order'];
  const out: RunnerItem[] = [];
  for (const unit of units) {
    const pats = production.filter((p) => supports(unit.id, p));
    if (pats.length) {
      for (let i = 0; i < 2; i++) {
        const p = pats[Math.floor(Math.random() * pats.length)];
        const exercise = generate(unit.id, p);
        if (exercise) out.push({ key: `${unit.id}@${p}`, unit, exercise });
      }
    } else {
      unit.exercises.forEach((exercise, i) => {
        if (['fix', 'translate', 'type'].includes(exercise.kind)) out.push({ key: `${unit.id}#${i}`, unit, exercise });
      });
    }
  }
  return [...shuffle(out).slice(0, 20), ...vocabExamItems(level, 5)];
}

/** Examen de cierre de nivel: producir oraciones correctas (no solo elegir). Hace falta 80%. */
export function Exam({ level, onExit }: { level: Level; onExit: () => void }) {
  const [phase, setPhase] = useState<'intro' | 'run' | 'done'>('intro');
  const [items, setItems] = useState<RunnerItem[]>([]);
  const results = useRef<ItemResult[]>([]);
  const [score, setScore] = useState(0);

  if (phase === 'intro')
    return (
      <div className="screen">
        <h1>Examen de cierre: {level}</h1>
        <p>
          Para cerrar el nivel tenés que demostrar que podés producir oraciones correctas: completar, transformar, ordenar y traducir, más
          vocabulario del nivel. No hay opción múltiple.
        </p>
        <p>Se aprueba con {Math.round(EXAM_PASS * 100)}% al primer intento. Si no llegás, podés repetirlo cuando quieras: las preguntas cambian.</p>
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
      <Session
        title={`Examen ${level}`}
        items={items}
        timed={false}
        onItem={(r, first) => {
          if (first) results.current.push(r);
        }}
        onDone={() => {
          const graded = results.current.filter((r) => r.outcome !== 'skip');
          const sc = graded.length ? graded.filter((r) => r.outcome !== 'again').length / graded.length : 0;
          setScore(sc);
          if (sc >= EXAM_PASS) passLevel(level, sc);
          for (const r of results.current) recordReview(r);
          setPhase('done');
        }}
      />
    );

  const passed = score >= EXAM_PASS;
  return (
    <div className="screen">
      <h1>{passed ? `¡Nivel ${level} aprobado!` : 'Todavía no'}</h1>
      <p className="big">{Math.round(score * 100)}% correcto</p>
      <p>
        {passed
          ? 'Se abre el nivel siguiente. Lo que fallaste quedó en tus errores y en los repasos.'
          : `Necesitás ${Math.round(EXAM_PASS * 100)}%. Repasá tus errores y la práctica mezclada, y volvé a intentarlo.`}
      </p>
      <button className="primary" onClick={onExit}>
        Volver
      </button>
    </div>
  );
}
