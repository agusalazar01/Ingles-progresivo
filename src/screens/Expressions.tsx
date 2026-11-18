import { useMemo, useState } from 'react';
import { BackButton } from '../components/BackButton';
import { ExprCard } from '../components/ExprCard';
import { CATALOG, EXPR_TYPE_LABEL, exprKeys, type ExprType } from '../content/context';

const TYPES = Object.keys(EXPR_TYPE_LABEL) as ExprType[];
const shuffle = <T,>(a: T[]) => a.map((x) => ({ x, k: Math.random() })).sort((p, q) => p.k - q.k).map((p) => p.x);
const fold = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’]/g, "'");

/**
 * Catálogo de expresiones: phrasal verbs, modales, coloquiales, Australia, combinaciones y el inglés hablado.
 * Cada ficha muestra la expresión en varios tiempos y estructuras, y se puede practicar sola.
 */
export function Expressions({ onExit, onPractice }: { onExit: () => void; onPractice: (keys: string[], title: string) => void }) {
  const [type, setType] = useState<ExprType | null>(null);
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const f = fold(q.trim());
    return CATALOG.filter((e) => (!type || e.type === type) && (!f || fold(`${e.en} ${e.es} ${e.note}`).includes(f)));
  }, [type, q]);
  return (
    <div className="screen expressions">
      <div className="top-bar">
        <BackButton onClick={onExit} />
        <p className="eyebrow">Catálogo</p>
      </div>
      <h1>Expresiones</h1>
      <p className="small">
        {CATALOG.length} expresiones del inglés de todos los días, cada una en varios tiempos y estructuras. Se aprenden en las unidades de situaciones del camino; acá las podés consultar y practicar sueltas.
      </p>
      <input className="answer" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar (en inglés o en español)" autoCapitalize="off" autoCorrect="off" spellCheck={false} />
      <div className="chips">
        <button className={`chip ${type === null ? 'chosen' : ''}`} onClick={() => setType(null)}>
          Todas
        </button>
        {TYPES.map((t) => {
          const n = CATALOG.filter((e) => e.type === t).length;
          if (!n) return null;
          return (
            <button key={t} className={`chip ${type === t ? 'chosen' : ''}`} onClick={() => setType(type === t ? null : t)}>
              {EXPR_TYPE_LABEL[t]} · {n}
            </button>
          );
        })}
      </div>
      {list.length === 0 && <p className="small">No encontré nada con eso.</p>}
      <div className="expr-list">
        {list.map((e) => {
          const keys = exprKeys(e);
          return <ExprCard key={e.id} e={e} onPractice={keys.length ? () => onPractice(shuffle(keys).slice(0, 12), `Practicar «${e.en}»`) : undefined} />;
        })}
      </div>
    </div>
  );
}
