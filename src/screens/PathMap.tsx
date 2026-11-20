import { useEffect, useRef, useState } from 'react';
import type { Route } from '../App';
import { LEVEL_GOALS, SECTIONS, type PathSection } from '../content/path';
import { NODE_ICON, NODE_LABEL, levelStarts, markNode, nodeStates, sectionOpen, sectionRows, type PathNode, type NodeState } from '../lib/path';
import { say } from '../lib/speech';
import { useAppState } from '../lib/store';

/** Alto de cada fila (en px) y zigzag de los nodos alrededor del centro. */
const NODE_H = 86;
const DIV_H = 46;
const W = 320;
const ZIG = [0, 52, 80, 52, 0, -52, -80, -52];

/**
 * El camino: secciones con su meta, y en cada una una fila de círculos unidos por una línea.
 * Diseño provisorio (círculos simples): el definitivo se reemplaza después sin tocar la lógica.
 */
export function PathMap({ go }: { go: (r: Route) => void }) {
  const s = useAppState();
  const states = nodeStates(s);
  const starts = levelStarts();
  const currentRef = useRef<HTMLButtonElement>(null);
  const [card, setCard] = useState<PathSection | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const t = setTimeout(() => currentRef.current?.scrollIntoView({ block: 'center' }), 60);
    return () => clearTimeout(t);
  }, []);

  const open = (n: PathNode, st: NodeState) => {
    if (st === 'locked') {
      setToast('Completá lo anterior para abrir este paso.');
      setTimeout(() => setToast(''), 2200);
      return;
    }
    switch (n.kind) {
      case 'guide':
        return go({ name: 'lesson', unitId: n.unitId!, fromPath: true });
      case 'lesson':
        return go({ name: 'lesson', unitId: n.unitId!, step: n.step, fromPath: true });
      case 'roleplay':
        return go({ name: 'roleplays', startId: n.roleplay });
      case 'story':
        return go({ name: 'story', storyId: n.story!, nodeId: n.id });
      case 'postcard':
        return setCard(SECTIONS.find((x) => x.id === n.sectionId)!);
      default:
        return go({ name: 'node', nodeId: n.id });
    }
  };

  return (
    <div className="screen path-map">
      <div className="row">
        <h1 className="grow">Camino</h1>
        <button className="link" onClick={() => go({ name: 'themes' })}>
          Ver por temas
        </button>
      </div>
      {toast && <p className="notice">{toast}</p>}
      {SECTIONS.map((sec, i) => {
        const rows = sectionRows(sec);
        // Posiciones de cada fila para dibujar la línea que une los nodos.
        let y = 0;
        let k = 0;
        const pos = rows.map((r) => {
          const h = 'node' in r ? NODE_H : DIV_H;
          const p = { y: y + h / 2, x: W / 2 + ('node' in r ? ZIG[k++ % ZIG.length] : 0), h };
          y += h;
          return p;
        });
        const pts = pos.filter((_, j) => 'node' in rows[j]).map((p) => `${p.x},${p.y}`);
        const secOpen = sectionOpen(s, i);
        const firstOfLevel = starts.get(sec.level) === i;
        return (
          <section key={sec.id} className={`path-section c${i % 6} ${secOpen ? '' : 'locked'}`}>
            {firstOfLevel && (
              <div className="level-head">
                <p className="eyebrow">Nivel {sec.level}</p>
                <p className="level-goal">«{LEVEL_GOALS[sec.level]}»</p>
                {!secOpen && (
                  <button className="secondary" onClick={() => go({ name: 'placement', retest: true })}>
                    ⏭ Saltar a {sec.level} con una prueba
                  </button>
                )}
              </div>
            )}
            <div className="section-card">
              <p className="small">
                {sec.level} · Sección {i + 1 - (starts.get(sec.level) ?? 0)}
              </p>
              <p className="section-title">{sec.title}</p>
            </div>
            <div className="path-track" style={{ height: y, width: W }}>
              <svg className="path-line" width={W} height={y} aria-hidden="true">
                <polyline points={pts.join(' ')} />
              </svg>
              {rows.map((r, j) => {
                const p = pos[j];
                if ('divider' in r)
                  return (
                    <p key={`d${j}`} className="path-divider" style={{ top: p.y - p.h / 2, height: p.h }}>
                      {r.divider}
                    </p>
                  );
                const n = r.node;
                const st = states.get(n.id) ?? 'locked';
                return (
                  <div key={n.id} className="path-node-wrap" style={{ top: p.y - p.h / 2, left: p.x - 40 }}>
                    <button
                      ref={st === 'current' ? currentRef : undefined}
                      className={`path-node ${n.kind} ${st}`}
                      onClick={() => open(n, st)}
                      aria-label={`${NODE_LABEL[n.kind]}: ${n.label}${st === 'done' ? ' (hecho)' : st === 'locked' ? ' (bloqueado)' : ''}`}
                    >
                      <span className="node-icon">{st === 'done' ? '✓' : NODE_ICON[n.kind]}</span>
                    </button>
                    <span className="node-label">{st === 'current' ? `▶ ${n.label}` : n.label}</span>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
      {card && <PostcardSheet sec={card} onClose={() => (markNode(`${card.id}:postcard`), setCard(null))} />}
    </div>
  );
}

function PostcardSheet({ sec, onClose }: { sec: PathSection; onClose: () => void }) {
  const p = sec.postcard;
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet postcard" onClick={(e) => e.stopPropagation()}>
        <p className="eyebrow">💌 Postal de Australia</p>
        <h2>{p.title}</h2>
        <p>{p.fact}</p>
        <div className="example-row">
          <p className="en">
            <b>{p.phrase}</b>
          </p>
          <button className="icon" onClick={() => say(p.phrase, { accent: 'en-AU' })} aria-label="Escuchar">
            ▶
          </button>
        </div>
        <p className="small">{p.es}</p>
        <button className="primary" onClick={onClose}>
          Guardar en el álbum
        </button>
      </div>
    </div>
  );
}
