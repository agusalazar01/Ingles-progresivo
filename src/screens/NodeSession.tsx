import { useRef, useState } from 'react';
import { BackButton } from '../components/BackButton';
import { ExerciseRunner, type RunnerItem } from '../components/ExerciseRunner';
import { SECTIONS } from '../content/path';
import { unitById } from '../content/curriculum';
import { recordReview, stepScore, type ItemResult } from '../lib/actions';
import { NODE_ICON, NODE_LABEL, REVIEW_PASS, findNode, markNode, nodeItems } from '../lib/path';
import { sfxFinish } from '../lib/sfx';

/** Escucha, práctica o repaso final de una sección del camino. */
export function NodeSession({ nodeId, onExit }: { nodeId: string; onExit: () => void }) {
  const { sec, node } = findNode(nodeId) ?? { sec: SECTIONS[0], node: { id: nodeId, kind: 'practice' as const, label: '', sectionId: SECTIONS[0].id } };
  const graded = node.kind === 'review' || node.kind === 'exam';
  const [items] = useState<RunnerItem[]>(() => nodeItems(sec, node));
  const res = useRef<ItemResult[]>([]);
  const results = res.current;
  const [done, setDone] = useState(false);

  if (done) {
    const score = stepScore(results);
    const passed = !graded || score >= REVIEW_PASS;
    return (
      <div className="screen">
        <h1>{passed ? `${NODE_ICON[node.kind]} ¡${NODE_LABEL[node.kind]}: listo!` : 'Todavía no'}</h1>
        <p className="big">{Math.round(score * 100)}% bien</p>
        <p>
          {graded
            ? passed
              ? node.kind === 'exam'
                ? `Afianzaste todo el nivel ${sec.level}. Lo que te costó vuelve en tus repasos.`
                : `Completaste «${sec.title}». Lo que te costó vuelve en tus repasos.`
              : `Para aprobar el repaso hace falta ${Math.round(REVIEW_PASS * 100)}%. Repasá con la Práctica y probá de nuevo.`
            : 'Lo que te costó queda anotado para la Práctica y el repaso espaciado.'}
        </p>
        <button className="primary" onClick={onExit}>
          Volver al camino
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <BackButton onClick={onExit} />
        <p className="eyebrow">
          {node.kind === 'exam' ? `Nivel ${sec.level}` : node.unitId ? unitById(node.unitId).title : sec.title} · {NODE_ICON[node.kind]} {NODE_LABEL[node.kind]}
        </p>
      </div>
      <ExerciseRunner
        items={items}
        showUnit
        timed={graded}
        onItem={(r, first) => {
          if (!first) return;
          if (!r.key.startsWith('x:')) recordReview(r);
          res.current.push(r);
        }}
        onDone={() => {
          const all = res.current;
          const passed = !graded || stepScore(all) >= REVIEW_PASS;
          if (passed) {
            markNode(nodeId);
            sfxFinish();
          }
          setDone(true);
        }}
      />
    </div>
  );
}
