import { useEffect, useState } from 'react';
import { lookup, onlineDefinition } from '../lib/dictionary';
import { say } from '../lib/speech';
import { getState } from '../lib/store';

/** Ficha de una palabra: significado en español, forma base y ejemplos. Con internet, también la definición en inglés. */
export function WordSheet({ word, sentence, onClose }: { word: string; sentence: string; onClose: () => void }) {
  const info = lookup(word);
  const [online, setOnline] = useState<{ definition: string; example?: string }[] | null>(null);
  const [loading, setLoading] = useState(false);
  const accent = getState().settings.accent;
  const head = info.lemma ?? word;

  useEffect(() => {
    say(word, { accent });
  }, [word, accent]);

  const fetchOnline = async () => {
    setLoading(true);
    try {
      setOnline(await onlineDefinition(head));
    } catch {
      setOnline([]);
    } finally {
      setLoading(false);
    }
  };

  const [pos, meaning, ex1, ex2] = info.entry ?? [];

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`Significado de ${word}`}>
        <div className="sheet-head">
          <div>
            <p className="sheet-word">{word}</p>
            {info.note && <p className="small">{info.note}</p>}
          </div>
          <button className="icon" onClick={() => say(word, { accent })} aria-label="Escuchar">
            ▶
          </button>
        </div>

        {info.contraction && (
          <p>
            Contracción de <b>{info.contraction}</b>.
          </p>
        )}

        {info.entry && (
          <>
            {pos && <p className="small">{pos}</p>}
            <p className="meaning">{meaning}</p>
            {(ex1 || ex2) && <p className="eyebrow">Ejemplos</p>}
            {[ex1, ex2].filter(Boolean).map((ex) => (
              <button key={ex} className="example-line" onClick={() => say(ex!, { accent })}>
                ▶ {ex}
              </button>
            ))}
          </>
        )}

        {!info.entry && !info.contraction && (
          <p>
            {/^[A-Z]/.test(word) ? 'Parece un nombre propio.' : 'Esta palabra todavía no está en el glosario de la app.'}
          </p>
        )}

        {sentence !== ex1 && sentence !== ex2 && sentence.toLowerCase() !== word.toLowerCase() && (
          <>
            <p className="eyebrow">En la oración</p>
            <button className="example-line" onClick={() => say(sentence, { accent })}>
              ▶ {sentence}
            </button>
          </>
        )}

        {online === null ? (
          <button className="link" onClick={fetchOnline} disabled={loading}>
            {loading ? 'Buscando…' : 'Ver definición en inglés (usa internet)'}
          </button>
        ) : online.length ? (
          <div className="online">
            <p className="eyebrow">Definición en inglés</p>
            {online.map((d) => (
              <div key={d.definition}>
                <p>{d.definition}</p>
                {d.example && <p className="small">“{d.example}”</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="small">No se encontró una definición en línea.</p>
        )}

        <button className="primary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
