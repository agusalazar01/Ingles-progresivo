import { useMemo, useState } from 'react';
import { BackButton } from '../components/BackButton';
import { ExerciseRunner, type RunnerItem } from '../components/ExerciseRunner';
import type { Unit } from '../content/types';
import { GENRE_LABEL, ROLE_LABEL, WRITING, WRITING_LEVELS, type WritingLesson } from '../content/writing';
import { useBack } from '../lib/nav';
import { say } from '../lib/speech';
import { useAppState } from '../lib/store';
import {
  connectorGaps,
  countWords,
  frequentErrors,
  lessonPassed,
  levelOpen,
  markStep,
  nextLesson,
  orderOk,
  orderPieces,
  progressOf,
  review,
  saveText,
} from '../lib/writing';

type View =
  | { v: 'list' }
  | { v: 'lesson'; id: string }
  | { v: 'model'; id: string }
  | { v: 'order'; id: string }
  | { v: 'gaps'; id: string }
  | { v: 'combine'; id: string }
  | { v: 'write'; id: string; prompt?: string; text?: string; index?: number }
  | { v: 'texts'; id: string };

const STEPS = [
  { key: 'model', title: 'Leé el modelo', detail: 'Mirá cómo está armado, parte por parte' },
  { key: 'order', title: 'Ordená el texto', detail: 'Armalo de nuevo con las partes mezcladas' },
  { key: 'gaps', title: 'Conectores', detail: 'Elegí la palabra que une las ideas' },
  { key: 'combine', title: 'Uní oraciones', detail: 'De dos oraciones cortas, una más rica' },
  { key: 'write', title: 'Escribí el tuyo', detail: 'Con la revisión y la reescritura' },
] as const;

const lessonOf = (id: string) => WRITING.find((l) => l.id === id)!;

/** «Escribir en inglés»: de oraciones sueltas a 200 palabras sobre cualquier tema. */
export function Writing({ onExit, onPhrases }: { onExit: () => void; onPhrases: () => void }) {
  const [view, setView] = useState<View>({ v: 'list' });
  const back = () => {
    if (view.v === 'list') onExit();
    else if (view.v === 'lesson') setView({ v: 'list' });
    else setView({ v: 'lesson', id: view.id });
  };
  useBack(true, back, 2);

  if (view.v === 'list') return <List onExit={onExit} onPhrases={onPhrases} open={(id) => setView({ v: 'lesson', id })} />;
  const lesson = lessonOf(view.id);
  const done = (step: string) => {
    markStep(lesson.id, step);
    setView({ v: 'lesson', id: lesson.id });
  };
  switch (view.v) {
    case 'lesson':
      return <Lesson lesson={lesson} onBack={back} go={setView} />;
    case 'model':
      return <Model lesson={lesson} onBack={back} onDone={() => done('model')} />;
    case 'order':
      return <Order lesson={lesson} onBack={back} onDone={() => done('order')} />;
    case 'gaps':
      return <Runner lesson={lesson} kind="gaps" onBack={back} onDone={() => done('gaps')} />;
    case 'combine':
      return <Runner lesson={lesson} kind="combine" onBack={back} onDone={() => done('combine')} />;
    case 'write':
      return <Write lesson={lesson} initial={view} onBack={back} onSaved={() => setView({ v: 'texts', id: lesson.id })} />;
    case 'texts':
      return <Texts lesson={lesson} onBack={back} onRewrite={(index, prompt, text) => setView({ v: 'write', id: lesson.id, index, prompt, text })} />;
  }
}

function List({ onExit, onPhrases, open }: { onExit: () => void; onPhrases: () => void; open: (id: string) => void }) {
  const s = useAppState();
  const next = nextLesson(s);
  const freq = frequentErrors(s).slice(0, 3);
  return (
    <div className="screen writing">
      <div className="top-bar">
        <BackButton onClick={onExit} />
        <p className="eyebrow">Escribir en inglés</p>
      </div>
      <h1>✍️ Escribir en inglés</h1>
      <p className="small">
        De oraciones sueltas a un texto de 200 palabras sobre cualquier tema. Cada lección: leés un modelo, lo armás, practicás los conectores, escribís el tuyo y lo
        mejorás con la revisión.
      </p>
      {next && (
        <button className="resume-card" onClick={() => open(next.id)}>
          <span className="small-title">Seguí con</span>
          <b>{next.title}</b>
          <span className="small">
            {next.level} · {GENRE_LABEL[next.genre]} · {next.words} palabras
          </span>
        </button>
      )}
      {freq.length > 0 && (
        <div className="card">
          <p className="card-title">Tus errores más frecuentes al escribir</p>
          {freq.map((f) => (
            <p key={f.id} className="small">
              <b>{f.n}×</b> {f.msg} {f.fix && <i>{f.fix}</i>}
            </p>
          ))}
        </div>
      )}
      {WRITING_LEVELS.map((level) => {
        const lessons = WRITING.filter((l) => l.level === level);
        const open_ = levelOpen(s, level);
        const passed = lessons.filter((l) => lessonPassed(s, l.id)).length;
        return (
          <div key={level} className="card">
            <p className="card-title">
              {level} · unas {lessons[0].words} palabras <span className="small">({passed} de {lessons.length})</span>
            </p>
            {!open_ && <p className="small">🔒 Se abre cuando apruebes 3 lecciones del nivel anterior.</p>}
            {lessons.map((l) => {
              const ok = lessonPassed(s, l.id);
              return (
                <button key={l.id} className="w-row" disabled={!open_} onClick={() => open(l.id)}>
                  <span className="w-mark">{ok ? '✅' : open_ ? '○' : '🔒'}</span>
                  <span className="w-text">
                    <b>{l.title}</b>
                    <span className="small">{GENRE_LABEL[l.genre]}</span>
                  </span>
                </button>
              );
            })}
          </div>
        );
      })}
      <button className="secondary" onClick={onPhrases}>
        🗣️ Mis frases (Decilo en inglés)
      </button>
    </div>
  );
}

function Lesson({ lesson, onBack, go }: { lesson: WritingLesson; onBack: () => void; go: (v: View) => void }) {
  const s = useAppState();
  const p = progressOf(s, lesson.id);
  const passed = lessonPassed(s, lesson.id);
  return (
    <div className="screen writing">
      <div className="top-bar">
        <BackButton onClick={onBack} />
        <p className="eyebrow">
          {lesson.level} · {GENRE_LABEL[lesson.genre]}
        </p>
      </div>
      <h1>{lesson.title}</h1>
      <p>{lesson.goal}</p>
      {passed && <p className="notice">✅ Aprobada. Podés escribir otro texto con otro tema para afianzar.</p>}
      {STEPS.map((st, i) => {
        const done = st.key === 'write' ? p.texts.length > 0 : p.steps.includes(st.key);
        return (
          <button key={st.key} className="w-row" onClick={() => go({ v: st.key, id: lesson.id })}>
            <span className="w-mark">{done ? '✅' : i + 1}</span>
            <span className="w-text">
              <b>{st.title}</b>
              <span className="small">{st.key === 'write' ? `${lesson.words} palabras · ${st.detail}` : st.detail}</span>
            </span>
          </button>
        );
      })}
      {p.texts.length > 0 && (
        <button className="secondary" onClick={() => go({ v: 'texts', id: lesson.id })}>
          📄 Mis textos ({p.texts.length})
        </button>
      )}
    </div>
  );
}

function Model({ lesson, onBack, onDone }: { lesson: WritingLesson; onBack: () => void; onDone: () => void }) {
  const [showEs, setEs] = useState(false);
  const full = lesson.model.parts.map((p) => p.text).join(' ');
  return (
    <div className="screen writing">
      <div className="top-bar">
        <BackButton onClick={onBack} />
        <p className="eyebrow">Modelo · {countWords(full)} palabras</p>
      </div>
      <h1>{lesson.model.title}</h1>
      <div className="w-model">
        {lesson.model.parts.map((p, i) => (
          <div key={i} className={`w-part role-${p.role}`}>
            <span className="w-role">{ROLE_LABEL[p.role]}</span>
            <p>{p.text}</p>
          </div>
        ))}
      </div>
      <div className="chips">
        <button className="chip" onClick={() => say(full)}>
          🔊 Escuchar
        </button>
        <button className="chip" onClick={() => say(full, { slow: true })}>
          🐢 Lento
        </button>
        <button className={`chip${showEs ? ' chosen' : ''}`} onClick={() => setEs(!showEs)}>
          🇪🇸 De qué trata
        </button>
      </div>
      {showEs && <p className="small">{lesson.model.es}</p>}
      <div className="card">
        <p className="card-title">Cómo está armado</p>
        <p>{lesson.tip}</p>
      </div>
      <button className="primary" onClick={onDone}>
        Entendido
      </button>
    </div>
  );
}

function shuffle<T>(a: T[]): T[] {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  // Que no quede igual al original.
  if (x.every((v, i) => v === a[i]) && x.length > 1) [x[0], x[1]] = [x[1], x[0]];
  return x;
}

function Order({ lesson, onBack, onDone }: { lesson: WritingLesson; onBack: () => void; onDone: () => void }) {
  const pieces = useMemo(() => orderPieces(lesson), [lesson]);
  const [bank] = useState(() => shuffle(pieces.map((_, i) => i)));
  const [picked, setPicked] = useState<number[]>([]);
  const [result, setResult] = useState<null | boolean>(null);
  const long = lesson.level === 'B1' || lesson.level === 'B2';
  const check = () => setResult(orderOk(pieces, picked));
  return (
    <div className="screen writing">
      <div className="top-bar">
        <BackButton onClick={onBack} />
        <p className="eyebrow">Ordená el texto</p>
      </div>
      <p className="task">Tocá {long ? 'los párrafos' : 'las oraciones'} en el orden correcto.</p>
      <p className="small">Pistas: la primera presenta el tema; los conectores (First, Then, However, To sum up…) te dicen qué va después.</p>
      <ol className="w-order">
        {picked.map((i, k) => (
          <li key={i} className={result == null ? '' : pieces[i].slot === pieces[k].slot ? 'ok' : 'bad'} onClick={() => result == null && setPicked(picked.filter((x) => x !== i))}>
            {pieces[i].text}
          </li>
        ))}
      </ol>
      <div className="w-bank">
        {bank
          .filter((i) => !picked.includes(i))
          .map((i) => (
            <button key={i} className="w-piece" onClick={() => setPicked([...picked, i])}>
              {pieces[i].text}
            </button>
          ))}
      </div>
      {result == null && picked.length === pieces.length && (
        <button className="primary" onClick={check}>
          Comprobar
        </button>
      )}
      {result === true && (
        <>
          <p className="feedback correct">¡Perfecto! El texto quedó en orden.</p>
          <button className="primary" onClick={onDone}>
            Seguir
          </button>
        </>
      )}
      {result === false && (
        <>
          <p className="feedback">Hay partes fuera de lugar (en rojo). Este es el orden del modelo:</p>
          <ol className="w-order">
            {pieces.map((p, i) => (
              <li key={i}>{p.text}</li>
            ))}
          </ol>
          <button className="primary" onClick={() => { setPicked([]); setResult(null); }}>
            Probar de nuevo
          </button>
          <button className="link" onClick={onDone}>
            Seguir igual
          </button>
        </>
      )}
    </div>
  );
}

function fakeUnit(lesson: WritingLesson): Unit {
  return { id: `writing-${lesson.id}`, level: lesson.level, axis: 'Estructura', title: lesson.title, prereqs: [], explanation: [], examples: [], trap: '', exercises: [] };
}

function Runner({ lesson, kind, onBack, onDone }: { lesson: WritingLesson; kind: 'gaps' | 'combine'; onBack: () => void; onDone: () => void }) {
  const items: RunnerItem[] = useMemo(() => {
    const unit = fakeUnit(lesson);
    if (kind === 'gaps')
      return connectorGaps(lesson).map((g, i) => ({ key: `w:${lesson.id}:gap${i}`, unit, exercise: { kind: 'choice', prompt: g.prompt, options: g.options, answer: g.answer } }));
    return lesson.combine.map((c, i) => ({ key: `w:${lesson.id}:comb${i}`, unit, exercise: { kind: 'transform', prompt: c.parts, task: c.task, answers: c.answers } }));
  }, [lesson, kind]);
  const [done, setDone] = useState(false);
  if (!items.length)
    return (
      <div className="screen writing">
        <div className="top-bar">
          <BackButton onClick={onBack} />
        </div>
        <p>En este texto los conectores son and y but: ya los practicaste al ordenar. ¡Seguí con el siguiente paso!</p>
        <button className="primary" onClick={onDone}>
          Seguir
        </button>
      </div>
    );
  return (
    <div className="screen writing">
      <div className="top-bar">
        <BackButton onClick={onBack} />
        <p className="eyebrow">{kind === 'gaps' ? 'Conectores' : 'Uní oraciones'}</p>
      </div>
      {kind === 'gaps' && !done && <p className="small">Son oraciones del modelo: elegí la palabra que une bien las dos ideas.</p>}
      {!done ? (
        <ExerciseRunner items={items} requeue onItem={() => {}} onDone={() => setDone(true)} />
      ) : (
        <>
          <p className="summary-emoji">💪</p>
          <p className="big center">¡Listo!</p>
          <button className="primary" onClick={onDone}>
            Seguir
          </button>
        </>
      )}
    </div>
  );
}

function Write({
  lesson,
  initial,
  onBack,
  onSaved,
}: {
  lesson: WritingLesson;
  initial: { prompt?: string; text?: string; index?: number };
  onBack: () => void;
  onSaved: () => void;
}) {
  const [prompt, setPrompt] = useState<string | undefined>(initial.prompt);
  const [text, setText] = useState(initial.text ?? '');
  const [result, setResult] = useState<ReturnType<typeof review> | null>(null);
  const [index, setIndex] = useState<number | undefined>(initial.index);
  const [rounds, setRounds] = useState(0);
  const s = useAppState();
  const words = countWords(text);
  const rewriting = initial.index != null;

  if (!prompt)
    return (
      <div className="screen writing">
        <div className="top-bar">
          <BackButton onClick={onBack} />
          <p className="eyebrow">Escribí el tuyo</p>
        </div>
        <h1>Elegí un tema</h1>
        {lesson.prompts.map((p) => (
          <button key={p} className="w-row" onClick={() => setPrompt(p)}>
            <span className="w-mark">✏️</span>
            <span className="w-text">
              <b>{p}</b>
            </span>
          </button>
        ))}
      </div>
    );

  const check = () => {
    const r = review(lesson, text);
    setResult(r);
    setRounds(rounds + 1);
    const errors = r.hits.filter((h) => !h.soft).map((h) => h.id);
    if (index == null) {
      // El primer borrador queda guardado tal cual, con sus errores (para ver tu evolución).
      saveText(lesson.id, { prompt, text, words: r.words, passed: r.passed, errors });
      setIndex(progressOf(s, lesson.id).texts.length);
    } else {
      saveText(lesson.id, { prompt, text: progressOf(s, lesson.id).texts[index]?.text ?? text, final: text, words: r.words, passed: r.passed, errors: progressOf(s, lesson.id).texts[index]?.errors ?? errors }, index);
    }
  };

  return (
    <div className="screen writing">
      <div className="top-bar">
        <BackButton onClick={onBack} />
        <p className="eyebrow">{rewriting ? 'Reescribí tu texto' : 'Escribí el tuyo'}</p>
      </div>
      <p className="task">{prompt}</p>
      {!result && (
        <>
          <p className="small">Usá el modelo como guía: mismas partes, tus ideas. Podés empezar con:</p>
          <div className="chips">
            {lesson.frames.map((f) => (
              <button key={f} className="chip" onClick={() => setText((t) => (t && !/\s$/.test(t) ? t + ' ' : t) + f.replace(/…$/, ''))}>
                {f}
              </button>
            ))}
          </div>
        </>
      )}
      <textarea
        className="w-area"
        value={text}
        rows={lesson.level === 'A1' ? 6 : lesson.level === 'A2' ? 9 : 14}
        placeholder={lesson.level === 'B1' || lesson.level === 'B2' ? 'Escribí acá. Dejá una línea en blanco entre párrafos.' : 'Escribí acá.'}
        onChange={(e) => {
          setText(e.target.value);
          if (result) setResult(null);
        }}
        autoCapitalize="sentences"
        spellCheck={false}
      />
      <div className="counter">
        <span>
          {words} / {lesson.words} palabras
        </span>
        <span className="small">{words >= lesson.words * 0.85 ? '✓ largo' : ''}</span>
      </div>
      <div className="mini-bar">
        <div className="bar-fill" style={{ width: `${Math.min(100, (words / lesson.words) * 100)}%` }} />
      </div>
      {!result && (
        <button className="primary" disabled={words < 5} onClick={check}>
          Revisar
        </button>
      )}
      {result && (
        <>
          <div className="card">
            <p className="card-title">{result.passed ? '✅ ¡Aprobado!' : 'Revisión'}</p>
            <ul className="checklist">
              {result.checks.map((c) => (
                <li key={c.label}>
                  {c.ok ? '✅' : c.required ? '❌' : '💡'} <b>{c.label}</b>
                  {c.detail && <span className="small"> — {c.detail}</span>}
                </li>
              ))}
            </ul>
          </div>
          {result.hits.length > 0 && (
            <div className="card">
              <p className="card-title">Para corregir</p>
              {result.hits.map((h, i) => (
                <div key={i} className={`w-hit${h.soft ? ' soft' : ''}`}>
                  <p>
                    <span className="w-found">«{h.found}»</span> {h.msg}
                  </p>
                  {h.fix && <p className="small">✔ {h.fix}</p>}
                </div>
              ))}
              <p className="small">Corregí el texto vos (arriba) y volvé a revisar. Así se aprende más que leyendo la corrección.</p>
            </div>
          )}
          <p className="small">
            Esta revisión encuentra los errores típicos de hispanohablantes y mira la estructura, pero no ve todo. Si te queda una duda, guardalo y mostráselo a tu profe.
          </p>
          {!result.passed && (
            <button className="primary" onClick={() => setResult(null)}>
              Corregir el texto
            </button>
          )}
          {result.passed && rounds === 1 && !rewriting && (
            <button className="primary" onClick={() => setResult(null)}>
              Mejorarlo un poco más
            </button>
          )}
          <button className={result.passed ? 'primary' : 'link'} onClick={onSaved}>
            {result.passed ? 'Guardar y terminar' : 'Guardar y seguir otro día'}
          </button>
        </>
      )}
    </div>
  );
}

function Texts({ lesson, onBack, onRewrite }: { lesson: WritingLesson; onBack: () => void; onRewrite: (index: number, prompt: string, text: string) => void }) {
  const s = useAppState();
  const texts = progressOf(s, lesson.id).texts;
  return (
    <div className="screen writing">
      <div className="top-bar">
        <BackButton onClick={onBack} />
        <p className="eyebrow">Mis textos · {lesson.title}</p>
      </div>
      {texts.length === 0 && <p>Todavía no escribiste ninguno.</p>}
      {[...texts].reverse().map((t, k) => {
        const i = texts.length - 1 - k;
        return (
          <div key={i} className="card">
            <p className="small">
              {t.date} · {t.words} palabras · {t.passed ? '✅ aprobado' : 'sin aprobar'}
            </p>
            <p className="task">{t.prompt}</p>
            {t.final ? (
              <>
                <p className="phrase-label">Versión final</p>
                <p className="w-saved">{t.final}</p>
                <details>
                  <summary className="small">Ver el primer borrador ({t.errors.length} errores típicos)</summary>
                  <p className="w-saved small">{t.text}</p>
                </details>
              </>
            ) : (
              <p className="w-saved">{t.text}</p>
            )}
            <div className="chips">
              <button className="chip" onClick={() => onRewrite(i, t.prompt, t.final ?? t.text)}>
                ✏️ Reescribir
              </button>
              <button className="chip" onClick={() => say(t.final ?? t.text)}>
                🔊 Escuchar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
