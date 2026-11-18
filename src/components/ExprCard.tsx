import { useEffect, useRef, useState } from 'react';
import { EXPR_TYPE_LABEL, exprById, unitsOfExpr, type Expression } from '../content/context';
import type { DialogueLine, Unit } from '../content/types';
import { say } from '../lib/speech';
import { DialogueVoices } from '../lib/dialogueVoice';
import { getState } from '../lib/store';
import { Words } from './Words';

const accent = () => getState().settings.accent;
const FREQ = ['', 'de vez en cuando', 'común', 'la vas a escuchar todo el tiempo'];

/** Ficha de una expresión: qué significa, registro, frecuencia, pronunciación y la misma expresión en varios tiempos. */
export function ExprCard({ e, open: start = false, onPractice }: { e: Expression; open?: boolean; onPractice?: () => void }) {
  const [open, setOpen] = useState(start);
  const units = unitsOfExpr(e.id);
  return (
    <div className={`expr-card ${open ? 'open' : ''}`}>
      <button className="expr-head" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="expr-en">{e.en}</span>
        <span className="expr-es">{e.es}</span>
        <span className="expr-tags">
          <span className="tag">{EXPR_TYPE_LABEL[e.type]}</span>
          <span className="tag soft">{e.register}</span>
          <span className="freq" title={FREQ[e.freq]} aria-label={`Frecuencia: ${FREQ[e.freq]}`}>
            {'●'.repeat(e.freq)}
            {'○'.repeat(3 - e.freq)}
          </span>
        </span>
      </button>
      {open && (
        <div className="expr-body">
          <p>{e.note}</p>
          {e.say && <p className="small">🗣 Se pronuncia: {e.say}</p>}
          <p className="small">Frecuencia: {FREQ[e.freq]}.</p>
          <p className="ex-head">En distintas estructuras</p>
          <div className="expr-forms">
            {e.forms.map(([label, en, es]) => (
              <div key={en} className="expr-form">
                <span className="form-label">{label}</span>
                <div className="example-row">
                  <Words text={en} className="en" />
                  <button className="icon" onClick={() => say(en.replace(/^—\s*/, '').replace(/\s—\s/g, '. '), { accent: accent() })} aria-label="Escuchar">
                    ▶
                  </button>
                </div>
                <p className="es">{es}</p>
              </div>
            ))}
          </div>
          {e.vs && (
            <div className="trap">
              <p className="trap-title">≠ No confundir</p>
              <p>{e.vs}</p>
            </div>
          )}
          {units.length > 0 && <p className="small">Se aprende en: {units.map((u) => u.title).join(' · ')}</p>}
          {onPractice && (
            <button className="secondary" onClick={onPractice}>
              Practicar esta expresión
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Una línea del diálogo: se escucha y se desglosa (partes, gramática y cómo cambia con otros tiempos). */
function Line({ l, speak }: { l: DialogueLine; speak: (who: string, text: string) => void }) {
  const [open, setOpen] = useState(false);
  const more = (l.parts?.length ?? 0) + (l.swap?.length ?? 0) > 0;
  return (
    <div className={`dlg-line ${open ? 'open' : ''}`}>
      <div className="example-row">
        <p>
          <b className="dlg-who">{l.who}:</b> <Words text={l.en} className="en" />
        </p>
        <button className="icon" onClick={() => speak(l.who, l.en)} aria-label="Escuchar">
          ▶
        </button>
      </div>
      <p className="es">{l.es}</p>
      {more && (
        <button className="link" onClick={() => setOpen(!open)}>
          {open ? 'Cerrar el desglose' : '🔍 Desglosar la frase'}
        </button>
      )}
      {open && (
        <div className="dlg-break">
          {l.parts?.map(([frag, why]) => (
            <p key={frag}>
              <span className="en-hl">{frag}</span> → {why}
            </p>
          ))}
          {!!l.swap?.length && <p className="ex-head">Cómo cambia</p>}
          {l.swap?.map(([what, en, es]) => (
            <div key={en} className="expr-form">
              <span className="form-label">{what}</span>
              <div className="example-row">
                <Words text={en} className="en" />
                <button className="icon" onClick={() => speak(l.who, en)} aria-label="Escuchar">
                  ▶
                </button>
              </div>
              <p className="es">{es}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Parte de la explicación propia de las unidades temáticas: la escena, el diálogo y las expresiones. */
export function ContextExplanation({ unit }: { unit: Unit }) {
  const c = unit.context!;
  const [playing, setPlaying] = useState(false);
  const stop = useRef(false);
  // Cada personaje con su voz (de su género, distinta de la del otro), igual en ▶ y en «Escuchar todo».
  const voices = useRef<DialogueVoices | null>(null);
  voices.current ??= new DialogueVoices(
    c.dialogue.map((l) => l.who),
    accent,
  );
  useEffect(() => () => voices.current?.release(), []);
  const speak = (who: string, text: string) => {
    stop.current = true;
    setPlaying(false);
    voices.current!.stop();
    voices.current!.say(who, text).catch(() => {});
  };
  const playAll = async () => {
    if (playing) {
      stop.current = true;
      voices.current!.stop();
      setPlaying(false);
      return;
    }
    stop.current = false;
    setPlaying(true);
    for (const l of c.dialogue) {
      if (stop.current) break;
      try {
        await voices.current!.say(l.who, l.en);
      } catch {
        break;
      }
    }
    setPlaying(false);
  };
  const exprs = c.expressions.map(exprById).filter((e): e is Expression => !!e);
  return (
    <div className="context-ex">
      <p className="ex-head">La situación</p>
      <p>{c.scene}</p>
      <div className="row">
        <p className="ex-head grow">Diálogo</p>
        <button className="secondary small-btn" onClick={playAll}>
          {playing ? '⏹ Parar' : '▶ Escuchar todo'}
        </button>
      </div>
      <p className="small">Tocá «Desglosar» para ver qué es cada parte y cómo cambia con otros tiempos. Tocá una palabra para ver qué significa.</p>
      <div className="dialogue">
        {c.dialogue.map((l, i) => (
          <Line key={i} l={l} speak={speak} />
        ))}
      </div>
      <p className="ex-head">Expresiones de esta unidad ({exprs.length})</p>
      <div className="expr-list">
        {exprs.map((e) => (
          <ExprCard key={e.id} e={e} />
        ))}
      </div>
      <p className="ex-head">Gramática que se mezcla</p>
      <div className="chips">
        {c.grammar.map((g) => (
          <span key={g} className="tag">
            {g}
          </span>
        ))}
      </div>
    </div>
  );
}
