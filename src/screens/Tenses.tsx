import { useState } from 'react';
import { BackButton } from '../components/BackButton';
import { ExerciseRunner, type RunnerItem } from '../components/ExerciseRunner';
import { UNITS } from '../content/curriculum';
import { generate, type Pattern } from '../gen/generate';
import { recordReview } from '../lib/actions';
import { useBack } from '../lib/nav';
import { isDone } from '../lib/progress';
import { useAppState } from '../lib/store';

/** Los 12 tiempos: 3 momentos × 4 aspectos. Cada uno apunta a su unidad del camino. */
interface TenseCell {
  unit: string;
  name: string;
  form: string;
  example: string;
  es: string;
  use: string;
}

const ROWS: { time: string; cells: TenseCell[] }[] = [
  {
    time: 'Presente',
    cells: [
      { unit: 'pres-simple', name: 'Simple', form: 'verbo (+ -s)', example: 'I work.', es: 'Trabajo.', use: 'Costumbres y hechos.' },
      { unit: 'pres-cont', name: 'Continuo', form: 'am / is / are + -ing', example: "I'm working.", es: 'Estoy trabajando.', use: 'Ahora o en estos días.' },
      { unit: 'pres-perfect', name: 'Perfecto', form: 'have / has + participio', example: "I've worked.", es: 'He trabajado.', use: 'Experiencias y resultados hasta ahora.' },
      { unit: 'pres-perf-cont', name: 'Perfecto continuo', form: 'have / has been + -ing', example: "I've been working.", es: 'Vengo trabajando.', use: 'Empezó antes y sigue: cuánto dura.' },
    ],
  },
  {
    time: 'Pasado',
    cells: [
      { unit: 'past-simple', name: 'Simple', form: 'verbo en pasado (-ed)', example: 'I worked.', es: 'Trabajé.', use: 'Terminado en un momento del pasado.' },
      { unit: 'past-cont', name: 'Continuo', form: 'was / were + -ing', example: 'I was working.', es: 'Estaba trabajando.', use: 'En curso en un momento del pasado.' },
      { unit: 'past-perfect', name: 'Perfecto', form: 'had + participio', example: 'I had worked.', es: 'Había trabajado.', use: 'Antes de otro pasado.' },
      { unit: 'past-perf-cont', name: 'Perfecto continuo', form: 'had been + -ing', example: 'I had been working.', es: 'Venía trabajando.', use: 'Venía durando hasta un momento del pasado.' },
    ],
  },
  {
    time: 'Futuro',
    cells: [
      { unit: 'future', name: 'Simple', form: 'will + verbo · going to', example: "I'll work.", es: 'Voy a trabajar.', use: 'Decisiones, predicciones y planes.' },
      { unit: 'future-cont', name: 'Continuo', form: 'will be + -ing', example: "I'll be working.", es: 'Voy a estar trabajando.', use: 'En curso en un momento del futuro.' },
      { unit: 'future-perf', name: 'Perfecto', form: 'will have + participio', example: "I'll have worked.", es: 'Habré trabajado.', use: 'Terminado antes de un momento del futuro.' },
      { unit: 'future-perf-cont', name: 'Perfecto continuo', form: 'will have been + -ing', example: "I'll have been working.", es: 'Voy a llevar trabajando.', use: 'Cuánto va a llevar en un momento del futuro.' },
    ],
  },
];

export const TENSE_UNIT_IDS = ROWS.flatMap((r) => r.cells.map((c) => c.unit));

const shuffle = <T,>(a: T[]) => a.map((x) => ({ x, k: Math.random() })).sort((p, q) => p.k - q.k).map((p) => p.x);

/** Frases nuevas cada vez: de reconocer a traducir, de uno o de varios tiempos. */
function tenseItems(unitIds: string[], n: number): RunnerItem[] {
  const patterns: Pattern[] = ['recognize', 'complete', 'complete', 'transform', 'translate', 'order'];
  const out: RunnerItem[] = [];
  const used = new Set<string>();
  for (let i = 0; i < n * 6 && out.length < n; i++) {
    const id = unitIds[i % unitIds.length];
    const unit = UNITS.find((u) => u.id === id)!;
    const p = patterns[Math.floor(Math.random() * patterns.length)];
    const exercise = generate(id, p) ?? generate(id, 'complete');
    if (!exercise || used.has(exercise.prompt)) continue;
    used.add(exercise.prompt);
    out.push({ key: `${id}@${p}`, unit, exercise });
  }
  return unitIds.length > 1 ? shuffle(out) : out;
}

type View = { v: 'table' } | { v: 'run'; title: string; items: RunnerItem[]; mixed: boolean } | { v: 'done'; title: string; ok: number; total: number };

/**
 * Los 12 tiempos verbales juntos: la tabla completa y práctica con frases nuevas cada vez,
 * de un tiempo solo, de un momento (presentes, pasados, futuros) o de los 12 mezclados.
 */
export function Tenses({ onExit, onUnit }: { onExit: () => void; onUnit: (unitId: string) => void }) {
  const s = useAppState();
  const [view, setView] = useState<View>({ v: 'table' });
  const [open, setOpen] = useState<string | null>(null);
  const [stats, setStats] = useState({ ok: 0, total: 0 });
  const back = () => (view.v === 'table' ? onExit() : setView({ v: 'table' }));
  useBack(true, back, 2);
  const start = (title: string, ids: string[], n: number) => {
    setStats({ ok: 0, total: 0 });
    setView({ v: 'run', title, items: tenseItems(ids, n), mixed: ids.length > 1 });
  };

  if (view.v === 'run')
    return (
      <div className="screen">
        <div className="top-bar">
          <BackButton onClick={back} />
          <p className="eyebrow">{view.title}</p>
        </div>
        {view.mixed && <p className="small">Los tiempos están mezclados: fijate en la pista de tiempo de cada frase para elegir el correcto.</p>}
        <ExerciseRunner
          items={view.items}
          showUnit={view.mixed}
          onItem={(r) => {
            recordReview(r);
            setStats((x) => ({ ok: x.ok + (r.outcome === 'good' ? 1 : 0), total: x.total + 1 }));
          }}
          onDone={() => setView({ v: 'done', title: view.title, ok: stats.ok, total: stats.total })}
        />
      </div>
    );

  if (view.v === 'done')
    return (
      <div className="screen">
        <p className="summary-emoji" aria-hidden="true">
          {stats.total && stats.ok / stats.total >= 0.8 ? '🏆' : '💪'}
        </p>
        <h1 className="center">{view.title}</h1>
        <p className="big center">
          {stats.ok} de {stats.total} bien a la primera
        </p>
        <button className="primary" onClick={() => setView({ v: 'table' })}>
          Practicar otro
        </button>
        <button className="link" onClick={onExit}>
          Volver
        </button>
      </div>
    );

  return (
    <div className="screen tenses">
      <div className="top-bar">
        <BackButton onClick={back} />
      </div>
      <p className="eyebrow">Presente, pasado y futuro</p>
      <h1>Los 12 tiempos</h1>
      <p className="small">
        Tres momentos por cuatro formas. Tocá un tiempo para ver cuándo se usa y practicarlo con frases nuevas cada vez, o practicá varios mezclados.
      </p>
      <button className="primary" onClick={() => start('Los 12 tiempos mezclados', TENSE_UNIT_IDS, 24)}>
        Practicar los 12 mezclados (24 frases)
      </button>
      {ROWS.map((row) => (
        <section key={row.time} className="tense-row">
          <div className="theme-head-row">
            <h2>{row.time}</h2>
            <button className="chip" onClick={() => start(`${row.time}: los 4 mezclados`, row.cells.map((c) => c.unit), 16)}>
              Mezclar los 4
            </button>
          </div>
          <div className="tense-grid">
            {row.cells.map((c) => {
              const isOpen = open === c.unit;
              const done = isDone(s, c.unit);
              return (
                <div key={c.unit} className={`tense ${isOpen ? 'open' : ''} ${done ? 'done' : ''}`}>
                  <button className="tense-head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : c.unit)}>
                    <span className="tense-name">
                      {c.name}
                      {done && ' ✓'}
                    </span>
                    <span className="tense-example">{c.example}</span>
                    <span className="tense-form">{c.form}</span>
                  </button>
                  {isOpen && (
                    <div className="tense-body">
                      <p className="small">
                        {c.use} <i>{c.es}</i>
                      </p>
                      <button className="primary" onClick={() => start(`${row.time} ${c.name.toLowerCase()}`, [c.unit], 12)}>
                        Practicar 12 frases
                      </button>
                      <button className="link" onClick={() => onUnit(c.unit)}>
                        Ver la unidad con la explicación
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
