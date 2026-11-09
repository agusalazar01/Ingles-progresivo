import { useRef, useState } from 'react';
import { BackButton } from '../components/BackButton';
import { ExerciseRunner, type RunnerItem } from '../components/ExerciseRunner';
import type { ItemResult } from '../lib/actions';
import { useBack } from '../lib/nav';
import { say } from '../lib/speech';
import { useAppState, type Outcome } from '../lib/store';
import type { ComboPrompt, Structure } from '../content/structures';
import {
  breakdown,
  checkCombo,
  COMBOS,
  comboAvailable,
  comboUnlocked,
  CONNECTORS,
  gradePhrase,
  learnRound,
  nextNew,
  phraseExercise,
  phraseIdFromKey,
  phrasesOf,
  progressOf,
  pseudoUnit,
  readyForCombo,
  reviewItems,
  roundOutcome,
  saveCombo,
  statusOf,
  STRUCTURES,
  structureById,
  unlocked,
  type ComboCheck,
  type SPhrase,
} from '../lib/structures';

type View =
  | { v: 'home' }
  | { v: 'structure'; id: string }
  | { v: 'cards'; id: string; ids: string[] }
  | { v: 'run'; title: string; items: RunnerItem[]; back: View; learning?: boolean }
  | { v: 'connectors' }
  | { v: 'combos' }
  | { v: 'combo'; id: string };

const STATUS_LABEL = { new: 'nueva', learning: 'aprendiendo', known: 'la sabés', due: 'para repasar' } as const;
const KIND_LABEL: Record<ComboPrompt['kind'], string> = { explicar: 'Explicá', contar: 'Contá', preguntar: 'Preguntá', desarrollar: 'Desarrollá' };

/**
 * «Frases por estructura»: un módulo aparte de las unidades. Aprendés frases que repiten una estructura,
 * con la explicación de cada palabra, y al final las combinás con conectores para armar oraciones largas.
 */
export function Structures({ onExit }: { onExit: () => void }) {
  useAppState();
  const [view, setView] = useState<View>({ v: 'home' });
  const [notice, setNotice] = useState<string>();
  const up = (): View => (view.v === 'structure' || view.v === 'connectors' || view.v === 'combos' ? { v: 'home' } : view.v === 'cards' ? { v: 'structure', id: view.id } : view.v === 'combo' ? { v: 'combos' } : view.v === 'run' ? view.back : { v: 'home' });
  const back = () => (view.v === 'home' ? onExit() : (setNotice(undefined), setView(up())));
  useBack(true, back, 2);

  if (view.v === 'run') return <Run view={view} onDone={(msg) => (setNotice(msg), setView(view.back))} onBack={back} />;
  if (view.v === 'cards') {
    const s = structureById(view.id)!;
    const ps = view.ids.map((id) => phrasesOf(s).find((p) => p.id === id)!);
    return (
      <div className="screen structures">
        <div className="top-bar">
          <BackButton onClick={back} />
        </div>
        <p className="eyebrow">{s.title}</p>
        <h1>Frases nuevas</h1>
        <p className="small">Leé cada frase, escuchala y mirá por qué va cada palabra. Después las practicás.</p>
        {ps.map((p) => (
          <PhraseCard key={p.id} p={p} open />
        ))}
        <button className="primary" onClick={() => setView({ v: 'run', title: `${s.title} · frases nuevas`, items: learnRound(s, view.ids), back: { v: 'structure', id: s.id }, learning: true })}>
          Practicar estas {ps.length}
        </button>
      </div>
    );
  }
  if (view.v === 'structure') return <StructureView s={structureById(view.id)!} notice={notice} onBack={back} go={setView} />;
  if (view.v === 'connectors') return <ConnectorsView onBack={back} />;
  if (view.v === 'combos') return <CombosView onBack={back} go={setView} />;
  if (view.v === 'combo') return <ComboView c={COMBOS.find((c) => c.id === view.id)!} onBack={back} />;

  const due = reviewItems(50).length;
  return (
    <div className="screen structures">
      <div className="top-bar">
        <BackButton onClick={back} />
      </div>
      <p className="eyebrow">Aparte de las unidades</p>
      <h1>🧱 Frases por estructura</h1>
      <p className="small">Aprendé patrones con frases reales, entendé por qué va cada palabra y después combinalos para armar oraciones largas.</p>
      {notice && <p className="notice">{notice}</p>}
      {due > 0 && (
        <div className="card accent">
          <p className="card-title">🔁 {due} frases para repasar hoy</p>
          <p className="small">Vuelven justo antes de que se te olviden. Las escribís de memoria, sin ayuda.</p>
          <button className="primary" onClick={() => setView({ v: 'run', title: 'Repaso de frases', items: reviewItems(15), back: { v: 'home' } })}>
            Repasar
          </button>
        </div>
      )}
      <h2>Estructuras</h2>
      <div className="ladder">
        {STRUCTURES.map((s, i) => {
          const pr = progressOf(s);
          const open = unlocked(i);
          const state = !open ? 'locked' : pr.started >= pr.total ? 'done' : pr.started > 0 ? 'current' : '';
          return (
            <button key={s.id} className={`rung ${state}`} disabled={!open} onClick={() => setView({ v: 'structure', id: s.id })}>
              <span className="rung-num">{state === 'done' ? '✓' : i + 1}</span>
              <span>
                <span className="unit-title">{s.title}</span>
                <span className="unit-status">
                  {s.level} · {open ? `${pr.started} de ${pr.total} frases${pr.due ? ` · ${pr.due} para repasar` : ''}` : 'Se abre al empezar la mitad de la anterior'}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <h2>Combinar todo</h2>
      <button className="rung" onClick={() => setView({ v: 'connectors' })}>
        <span className="rung-num">🔗</span>
        <span>
          <span className="unit-title">Conectores</span>
          <span className="unit-status">and, but, because, so, when, then… para unir ideas</span>
        </span>
      </button>
      <button className={`rung ${comboUnlocked() ? '' : 'locked'}`} disabled={!comboUnlocked()} onClick={() => setView({ v: 'combos' })}>
        <span className="rung-num">✍️</span>
        <span>
          <span className="unit-title">Armá oraciones largas</span>
          <span className="unit-status">{comboUnlocked() ? 'Explicá, contá, preguntá y desarrollá situaciones' : 'Se abre cuando empezaste 5 frases de 3 estructuras'}</span>
        </span>
      </button>
    </div>
  );
}

function PhraseCard({ p, open: startOpen = false }: { p: SPhrase; open?: boolean }) {
  const [open, setOpen] = useState(startOpen);
  const st = statusOf(p.id);
  return (
    <div className="card phrase-card">
      <div className="row between">
        <button className="link left phrase-en-btn" onClick={() => setOpen(!open)}>
          <b>{p.en}</b>
        </button>
        <button className="link" aria-label="Escuchar" onClick={() => say(p.en)}>
          ▶
        </button>
      </div>
      <p className="small">
        {p.es}
        {!startOpen && <span className={`status-pill ${st}`}> · {STATUS_LABEL[st]}</span>}
      </p>
      {open && (
        <ul className="breakdown">
          {breakdown(p).map((w, i) => (
            <li key={i} className={w.key ? 'key' : ''}>
              <b>{w.word}</b>
              {w.why && <span>: {w.why}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StructureView({ s, notice, onBack, go }: { s: Structure; notice?: string; onBack: () => void; go: (v: View) => void }) {
  const pr = progressOf(s);
  const fresh = nextNew(s);
  const started = phrasesOf(s).filter((p) => statusOf(p.id) !== 'new');
  return (
    <div className="screen structures">
      <div className="top-bar">
        <BackButton onClick={onBack} />
      </div>
      <p className="eyebrow">{s.level} · {pr.started} de {pr.total} frases</p>
      <h1>{s.title}</h1>
      {notice && <p className="notice">{notice}</p>}
      <div className="card">
        <p className="card-title">La estructura</p>
        <p className="pattern">{s.pattern}</p>
        {s.explain.map((t, i) => (
          <p key={i}>{t}</p>
        ))}
        {s.table && (
          <table className="forms">
            <thead>
              <tr>
                {s.table.head.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.table.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {fresh.length > 0 && (
        <button className="primary" onClick={() => go({ v: 'cards', id: s.id, ids: fresh.map((p) => p.id) })}>
          Aprender {fresh.length} frases nuevas
        </button>
      )}
      {started.length > 0 && (
        <button
          className="secondary"
          onClick={() =>
            go({
              v: 'run',
              title: `${s.title} · práctica`,
              items: started
                .sort(() => Math.random() - 0.5)
                .slice(0, 10)
                .map((p, i) => ({ key: `st:${p.id}`, unit: pseudoUnit(s), exercise: phraseExercise(p, (['translate', 'complete', 'listen', 'order'] as const)[i % 4]) })),
              back: { v: 'structure', id: s.id },
            })
          }
        >
          Practicar las que ya empecé
        </button>
      )}
      <h2>Las frases</h2>
      <p className="small">Tocá una frase para ver por qué va cada palabra.</p>
      {phrasesOf(s).map((p) => (
        <PhraseCard key={p.id} p={p} />
      ))}
    </div>
  );
}

function Run({ view, onDone, onBack }: { view: Extract<View, { v: 'run' }>; onDone: (msg: string) => void; onBack: () => void }) {
  const results = useRef<Record<string, Outcome[]>>({});
  const all = useRef<ItemResult[]>([]);
  return (
    <div className="screen">
      <div className="top-bar">
        <BackButton onClick={onBack} label="Volver" />
        <p className="eyebrow">{view.title}</p>
      </div>
      <ExerciseRunner
        key={view.title + view.items.length}
        items={view.items}
        requeue
        onItem={(r, first) => {
          if (!first) return;
          all.current.push(r);
          const id = phraseIdFromKey(r.key);
          if (!id) return;
          (results.current[id] ??= []).push(r.outcome);
          // En el repaso cada frase aparece una vez: se califica en el momento.
          if (!view.learning) gradePhrase(id, r.outcome);
        }}
        onDone={() => {
          if (view.learning) for (const [id, outs] of Object.entries(results.current)) gradePhrase(id, roundOutcome(outs));
          const graded = all.current.filter((r) => r.outcome !== 'skip');
          const ok = graded.filter((r) => r.outcome !== 'again').length;
          onDone(graded.length ? `Listo: ${ok} de ${graded.length} bien. Las frases que te costaron vuelven antes.` : 'Listo.');
        }}
      />
    </div>
  );
}

function ConnectorsView({ onBack }: { onBack: () => void }) {
  return (
    <div className="screen structures">
      <div className="top-bar">
        <BackButton onClick={onBack} />
      </div>
      <p className="eyebrow">Para unir ideas</p>
      <h1>🔗 Conectores</h1>
      <p className="small">Con estos conectores juntás las estructuras que ya sabés en oraciones largas y párrafos.</p>
      {CONNECTORS.map((k) => (
        <div key={k.en} className="card">
          <div className="row between">
            <p className="card-title">
              {k.en} <span className="small">= {k.es}</span>
            </p>
            <button className="link" aria-label="Escuchar" onClick={() => say(k.example)}>
              ▶
            </button>
          </div>
          <p className="small">{k.use}</p>
          <p>
            <i>{k.example}</i>
          </p>
        </div>
      ))}
    </div>
  );
}

function CombosView({ onBack, go }: { onBack: () => void; go: (v: View) => void }) {
  const s = useAppState();
  const stages: [1 | 2 | 3, string, string][] = [
    [1, 'Etapa 1: una oración larga', 'Dos estructuras unidas con un conector.'],
    [2, 'Etapa 2: un párrafo', 'Tres estructuras y varios conectores.'],
    [3, 'Etapa 3: una charla', 'Preguntas y respuestas, como en una conversación real.'],
  ];
  return (
    <div className="screen structures">
      <div className="top-bar">
        <BackButton onClick={onBack} />
      </div>
      <p className="eyebrow">Ejercicio final</p>
      <h1>✍️ Armá oraciones largas</h1>
      <p className="small">Usá las estructuras que aprendiste y los conectores. La app revisa que estén y te muestra una respuesta modelo.</p>
      {stages.map(([stage, title, desc]) => (
        <div key={stage}>
          <h2>{title}</h2>
          <p className="small">{desc}</p>
          <div className="ladder">
            {COMBOS.filter((c) => c.stage === stage).map((c) => {
              const open = comboAvailable(c);
              const done = !!s.combos?.[c.id];
              return (
                <button key={c.id} className={`rung ${done ? 'done' : open ? '' : 'locked'}`} disabled={!open} onClick={() => go({ v: 'combo', id: c.id })}>
                  <span className="rung-num">{done ? '✓' : '✍️'}</span>
                  <span>
                    <span className="unit-title">
                      {KIND_LABEL[c.kind]}: {c.prompt}
                    </span>
                    <span className="unit-status">
                      {open
                        ? `Usá: ${c.uses.map((id) => structureById(id)?.title ?? id).join(' · ')}`
                        : `Primero empezá: ${c.uses
                            .map((id) => structureById(id)!)
                            .filter((x) => !readyForCombo(x))
                            .map((x) => x.title)
                            .join(' · ')}`}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ComboView({ c, onBack }: { c: ComboPrompt; onBack: () => void }) {
  const s = useAppState();
  const [text, setText] = useState(s.combos?.[c.id]?.text ?? '');
  const [res, setRes] = useState<ComboCheck | null>(null);
  const [showModel, setShowModel] = useState(false);
  const allOk = res && res.enoughWords && res.structures.every((x) => x.ok) && res.connectors.length > 0 && (c.kind !== 'preguntar' || res.questions > 0);
  return (
    <div className="screen structures">
      <div className="top-bar">
        <BackButton onClick={onBack} />
      </div>
      <p className="eyebrow">
        {KIND_LABEL[c.kind]} · etapa {c.stage}
      </p>
      <h1>{c.prompt}</h1>
      <div className="card">
        <p className="small">
          <b>Tenés que usar:</b> {c.uses.map((id) => structureById(id)?.title ?? id).join(' · ')}
        </p>
        <p className="small">
          <b>Conectores que te sirven:</b> {c.connectors.join(', ')}
        </p>
        <p className="small">Al menos {c.minWords} palabras.</p>
      </div>
      <textarea className="answer combo-text" rows={7} value={text} onChange={(e) => (setText(e.target.value), setRes(null))} placeholder="Escribí en inglés…" autoCapitalize="sentences" />
      <p className="small">{text.trim() ? text.trim().split(/\s+/).length : 0} palabras</p>
      <button className="primary" disabled={!text.trim()} onClick={() => setRes(checkCombo(c, text))}>
        Revisar
      </button>
      {res && (
        <div className={`feedback ${allOk ? 'good' : 'neutral'}`}>
          <p className="verdict">{allOk ? '¡Muy bien! Combinaste todo.' : 'Casi: mirá lo que falta.'}</p>
          <ul className="checklist">
            {res.structures.map((x) => (
              <li key={x.id}>
                {x.ok ? '✓' : '✗'} {x.title}
              </li>
            ))}
            <li>
              {res.connectors.length ? '✓' : '✗'} Conectores{res.connectors.length ? `: ${res.connectors.join(', ')}` : ''}
            </li>
            <li>
              {res.enoughWords ? '✓' : '✗'} {res.words} de {c.minWords} palabras
            </li>
            {c.kind === 'preguntar' && (
              <li>
                {res.questions ? '✓' : '✗'} Preguntas ({res.questions})
              </li>
            )}
          </ul>
          <p className="small">La app revisa que estén las estructuras y los conectores; no corrige cada palabra. Compará con el modelo y, si te queda una duda, marcala para la profe.</p>
          <div className="row">
            <button className="secondary" onClick={() => setShowModel(!showModel)}>
              {showModel ? 'Ocultar el modelo' : 'Ver una respuesta modelo'}
            </button>
            {allOk && (
              <button className="primary" onClick={() => (saveCombo(c.id, text), onBack())}>
                Guardar y seguir
              </button>
            )}
          </div>
          {showModel && (
            <p>
              <i>{c.model}</i>{' '}
              <button className="link" aria-label="Escuchar" onClick={() => say(c.model)}>
                ▶
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
