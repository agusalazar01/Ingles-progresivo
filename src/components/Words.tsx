import { createContext, useContext, type ReactNode } from 'react';

/** Abre la ficha de una palabra. Lo provee App. */
export const WordContext = createContext<(word: string, sentence: string) => void>(() => {});

const TOKEN = /([A-Za-zÀ-ÿ]+(?:['’][A-Za-z]+)?)/;
const ENGLISH = /^[A-Za-z'’]+$/;

/** Muestra un texto en inglés normal, pero cada palabra se puede tocar para ver su significado. */
export function Words({ text, className }: { text: string; className?: string }): ReactNode {
  const open = useContext(WordContext);
  const parts = text.split(TOKEN);
  return (
    <span className={className}>
      {parts.map((p, i) =>
        i % 2 === 1 && ENGLISH.test(p) ? (
          <span
            key={i}
            className="word"
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              open(p, text);
            }}
          >
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  );
}
