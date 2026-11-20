import { useRef, useState } from 'react';
import { BackButton } from '../components/BackButton';
import { ExerciseRunner, type RunnerItem } from '../components/ExerciseRunner';
import { Words } from '../components/Words';
import { unitById } from '../content/curriculum';
import { SECTIONS } from '../content/path';
import { FREE_STORIES } from '../content/stories/free';
import { studyOf } from '../content/stories/study';
import { markNode } from '../lib/path';
import { say, stopSpeaking } from '../lib/speech';
import { sfxCorrect, sfxFinish, sfxWrong } from '../lib/sfx';
import { getState } from '../lib/store';

/**
 * Cuento libre: el texto original página por página, con el audio grabado (si hay internet; si no, la voz del
 * teléfono), traducción y desglose a pedido, preguntas de comprensión en el medio y ejercicios al final.
 */
export function StoryReader({ storyId, nodeId, onExit }: { storyId: string; nodeId?: string; onExit: () => void }) {
  const story = FREE_STORIES.find((x) => x.id === storyId)!;
  const study = studyOf(storyId)!;
  const [page, setPage] = useState(-1);
  const [showEs, setShowEs] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [asked, setAsked] = useState<number | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [phase, setPhase] = useState<'read' | 'vocab' | 'practice' | 'done'>('read');
  const [imgOk, setImgOk] = useState(true);
  const audio = useRef<HTMLAudioElement | null>(null);
  const sec = SECTIONS.find((x) => x.story === storyId);
  const unit = unitById(sec?.units[0] ?? 'to-be');

  const play = (i: number) => {
    stopSpeaking();
    audio.current?.pause();
    const p = story.pages[i];
    const speak = () => say(p.text, { accent: getState().settings.accent });
    if (!p.audio) return void speak();
    const a = new Audio(p.audio);
    audio.current = a;
    a.play().catch(speak);
  };
  const leave = () => {
    audio.current?.pause();
    stopSpeaking();
    onExit();
  };
  const question = study.questions.find((q) => q.after === page);
  const credits = (<p className="small credits">
        «{story.title}», de {story.author}.{story.art ? ` Ilustraciones: ${story.art}.` : ''}{story.voice ? ` Leído por ${story.voice}.` : ''} Fuente: {story.source}. Licencia: {story.license}. Texto original sin cambios.
      </p>
  );

  const next = () => {
    if (question && asked !== page) {
      setAsked(page);
      setPicked(null);
      return;
    }
    setShowEs(false);
    setShowNotes(false);
    setImgOk(true);
    if (page + 1 >= story.pages.length) return setPhase('vocab');
    setPage(page + 1);
  };

  if (phase === 'practice') {
    const items: RunnerItem[] = study.exercises.map((exercise, i) => ({ key: `x:story:${storyId}#${i}`, unit, exercise }));
    return (
      <div className="screen">
        <div className="top-bar">
          <BackButton onClick={leave} />
          <p className="eyebrow">📖 {story.title} · ejercicios</p>
        </div>
        <ExerciseRunner items={items} onItem={() => {}} onDone={() => (nodeId && markNode(nodeId), sfxFinish(), setPhase('done'))} />
      </div>
    );
  }

  if (phase === 'done' || phase === 'vocab') {
    return (
      <div className="screen story">
        <div className="top-bar">
          <BackButton onClick={leave} />
          <p className="eyebrow">📖 {story.title}</p>
        </div>
        <h1>{phase === 'done' ? '¡Cuento terminado!' : 'Palabras del cuento'}</h1>
        <div className="vocab-list">
          {study.vocab.map(([en, es]) => (
            <p key={en}>
              <b>{en}</b> — {es}
            </p>
          ))}
        </div>
        {phase === 'vocab' ? (
          <button className="primary" onClick={() => setPhase('practice')}>
            Hacer los ejercicios ({study.exercises.length})
          </button>
        ) : (
          <button className="primary" onClick={leave}>
            Volver al camino
          </button>
        )}
        {credits}
      </div>
    );
  }

  if (page < 0) {
    return (
      <div className="screen story">
        <div className="top-bar">
          <BackButton onClick={leave} />
          <p className="eyebrow">📖 Cuento · {study.level}</p>
        </div>
        <h1>{story.title}</h1>
        <p>{study.intro.replace(/\*\*/g, '')}</p>
        <p className="small">Es un cuento real, sin cambios. Tocá cualquier palabra para ver qué significa, ▶ para escucharlo y «Traducir» o «Desglosar» si te trabás.</p>
        <button className="primary" onClick={() => (setPage(0), play(0))}>
          Empezar a leer
        </button>
        {credits}
      </div>
    );
  }

  const p = story.pages[page];
  const asking = question && asked === page;
  return (
    <div className="screen story">
      <div className="top-bar">
        <BackButton onClick={leave} />
        <p className="eyebrow">
          📖 {story.title} · {page + 1} de {story.pages.length}
        </p>
      </div>
      {p.img && imgOk && <img className="story-img" src={p.img} alt="" onError={() => setImgOk(false)} />}
      <div className="story-text">
        <Words text={p.text} className="en" />
        <button className="icon" onClick={() => play(page)} aria-label="Escuchar">
          ▶
        </button>
      </div>
      {!asking && (
        <div className="row">
          <button className="link" onClick={() => setShowEs(!showEs)}>
            {showEs ? 'Ocultar traducción' : '🇪🇸 Traducir'}
          </button>
          {!!study.notes[page]?.length && (
            <button className="link" onClick={() => setShowNotes(!showNotes)}>
              {showNotes ? 'Cerrar desglose' : '🔍 Desglosar'}
            </button>
          )}
        </div>
      )}
      {showEs && <p className="es">{study.es[page]}</p>}
      {showNotes && (
        <div className="dlg-break">
          {study.notes[page].map(([frag, why]) => (
            <p key={frag}>
              <span className="en-hl">{frag}</span> → {why}
            </p>
          ))}
        </div>
      )}
      {asking && (
        <div className="story-q">
          <p className="kind">Pregunta</p>
          <p className="prompt">{question.prompt}</p>
          <div className="options">
            {question.options.map((o, i) => (
              <button
                key={o}
                className={`option ${picked === null ? '' : i === question.answer ? 'correct' : i === picked ? 'wrong' : ''}`}
                disabled={picked !== null}
                onClick={() => {
                  setPicked(i);
                  if (i === question.answer) sfxCorrect();
                  else sfxWrong();
                }}
              >
                {o}
              </button>
            ))}
          </div>
          {picked !== null && <p className="small">{question.why}</p>}
        </div>
      )}
      <button
        className="primary"
        disabled={!!asking && picked === null}
        onClick={() => {
          next();
          const np = question && asked !== page ? page : page + 1;
          if (np !== page && np < story.pages.length) play(np);
        }}
      >
        {question && asked !== page ? 'Responder una pregunta' : page + 1 >= story.pages.length ? 'Terminar' : 'Siguiente'}
      </button>
    </div>
  );
}
