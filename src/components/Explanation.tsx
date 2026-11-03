import type { ReactNode } from 'react';
import type { Unit } from '../content/types';
import { GLOSSARY } from '../content/glossary';
import { NGSL } from '../content/ngsl';
import { say } from '../lib/speech';
import { getState } from '../lib/store';
import { Words } from './Words';
import { lemmaOf } from '../lib/dictionary';

/** Palabras que existen en los dos idiomas: no se marcan como inglés si aparecen solas. */
const SPANISH = new Set(
  'a de la el en y no me se son come sale lo los las al del es su sus mi tu te le les nos si va ver ha con para por que una un como base real final general normal simple total particular plan error idea material animal hotel radio video regular formal local social central capital natural original legal global mental moral actual ideal verbo o e ni ya sin red once ante tan van fin mar sea solo hay era dice mire pan uso'.split(
    ' ',
  ),
);
const ENGLISH = new Set([...Object.keys(GLOSSARY), ...NGSL.map(([w]) => w.toLowerCase())]);
const STRONG = new Set('am is are was were will would have has had did does do can could should must might the an for since ago yet ever never been being got let to of at on in by'.split(' '));

const isEn = (w: string) => {
  const l = w.toLowerCase().replace(/[’]/g, "'");
  if (!/^[a-z']+$/.test(l)) return false;
  if (l.includes("'")) return true;
  if (SPANISH.has(l)) return false;
  return ENGLISH.has(l) || !!lemmaOf(l);
};

/** Marca en color las partes en inglés de una explicación en español. */
function highlightEnglish(text: string, keyBase: string): ReactNode[] {
  const tokens = text.split(/(\s+|[,;:()→·/"«»]+)/);
  const out: ReactNode[] = [];
  let run: string[] = [];
  let runWords = 0;
  let strongish = false;
  const flush = (i: number) => {
    if (!run.length) return;
    const textRun = run.join('');
    const trimmed = textRun.trimEnd();
    const trail = textRun.slice(trimmed.length);
    if (runWords >= 2 || strongish) {
      out.push(
        <span key={`${keyBase}-${i}`} className="en-hl">
          {trimmed}
        </span>,
      );
      if (trail) out.push(trail);
    } else out.push(textRun);
    run = [];
    runWords = 0;
    strongish = false;
  };
  tokens.forEach((tok, i) => {
    if (!tok) return;
    const word = tok.replace(/[.?!]+$/, '');
    if (/^\s+$/.test(tok) && run.length) {
      run.push(tok);
      return;
    }
    if (word && isEn(word)) {
      run.push(tok);
      runWords++;
      const l = word.toLowerCase();
      if (l.includes("'") || /(ing|ed)$/.test(l) || STRONG.has(l) || l.length >= 4) strongish = true;
      return;
    }
    flush(i);
    out.push(tok);
  });
  flush(tokens.length);
  return out;
}

/** Soporta **negrita**, rótulo antes de ":" y resalta el inglés. */
export function RichText({ text, k }: { text: string; k: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  // Rótulo corto al inicio ("Negación: …") en negrita.
  const m = parts[0].match(/^([^:]{2,40}):\s/);
  const nodes: ReactNode[] = [];
  parts.forEach((p, i) => {
    if (/^\*\*[^*]+\*\*$/.test(p)) {
      nodes.push(<strong key={`${k}b${i}`}>{highlightEnglish(p.slice(2, -2), `${k}bh${i}`)}</strong>);
    } else if (i === 0 && m) {
      nodes.push(
        <strong key={`${k}l`} className="label">
          {m[1]}:
        </strong>,
        ' ',
        ...highlightEnglish(p.slice(m[0].length), `${k}t${i}`),
      );
    } else nodes.push(...highlightEnglish(p, `${k}t${i}`));
  });
  return <>{nodes}</>;
}

const AXIS_CLASS: Record<Unit['axis'], string> = {
  Estructura: 'ax-structure',
  Verbos: 'ax-verbs',
  Vocabulario: 'ax-vocab',
  Sonidos: 'ax-sounds',
  Escucha: 'ax-listen',
};

export const axisClass = (u: Unit) => AXIS_CLASS[u.axis];

/** Explicación de una unidad, ordenada y con color. */
export function Explanation({ unit }: { unit: Unit }) {
  const accent = getState().settings.accent;
  return (
    <div className={`explanation ${AXIS_CLASS[unit.axis]}`}>
      <p className="ex-head">Cómo funciona</p>
      <ol className="ex-points">
        {unit.explanation.map((p, i) => (
          <li key={i}>
            <span className="ex-num">{i + 1}</span>
            <p>
              <RichText text={p} k={`p${i}`} />
            </p>
          </li>
        ))}
      </ol>
      {unit.examples.length > 0 && (
        <>
          <p className="ex-head">Ejemplos</p>
          <div className="examples">
            {unit.examples.map(([en, es]) => (
              <div key={en} className="example">
                <div className="example-row">
                  <Words text={en} className="en" />
                  <button className="icon" onClick={() => say(en, { accent })} aria-label="Escuchar">
                    ▶
                  </button>
                </div>
                <p className="es">{es}</p>
              </div>
            ))}
          </div>
        </>
      )}
      {unit.trap && (
        <div className="trap">
          <p className="trap-title">⚠ Trampa para hispanohablantes</p>
          <p>
            <RichText text={unit.trap} k="trap" />
          </p>
        </div>
      )}
    </div>
  );
}

/** La explicación en una hoja que se abre encima de los ejercicios. */
export function ExplanationSheet({ unit, onClose }: { unit: Unit; onClose: () => void }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`Explicación de ${unit.title}`}>
        <div className="sheet-head">
          <p className="sheet-word small-title">{unit.title}</p>
          <button className="icon" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <Explanation unit={unit} />
        <button className="primary" onClick={onClose}>
          Volver a los ejercicios
        </button>
      </div>
    </div>
  );
}
