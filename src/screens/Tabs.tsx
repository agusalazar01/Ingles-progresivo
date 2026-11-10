import { Fragment, useState } from 'react';
import { TENSE_UNIT_IDS } from './Tenses';
import { LEVELS } from '../content/types';
import { UNITS } from '../content/curriculum';
import { daysSince, groupPercent, isDone, lastTest, nextUnit, pathLevel, previousLevelDone, unitPercent, unitStatus, userLevel } from '../lib/progress';
import { THEMES, themeOf, themeUnits } from '../content/themes';
import { unitById } from '../content/curriculum';
import { dueKeys, lastRun, streak, useAppState } from '../lib/store';
import { activeSteps } from '../lib/ladder';
import { callsForUnit } from '../content/calls';
import { APP_VERSION, BUILD } from '../lib/update';
import type { Route } from '../App';
import { BackButton } from '../components/BackButton';
import { availableFamilies } from './Practice';
import { nextVerb } from './Verbs';
import { WORKSHOP } from '../gen/verbs';
import { levelUnitsDone } from '../lib/progress';
import { nextLesson } from '../lib/writing';
import { BAND_NAME, BANDS, bandProgress, defaultBand, nextNewWords } from '../lib/vocab';
import { Icon, Ring, TaskRow, Tile, WeekBars, WeekDots } from '../components/ui';

const REVIEW_BATCH = 20;
const RETEST_DAYS = 28;

export function Home({ go }: { go: (r: Route) => void }) {
  const s = useAppState();
  const due = dueKeys(s);
  const unit = nextUnit(s);
  const test = lastTest(s);
  const errorCount = Object.keys(s.errors).length;
  const days = streak(s);
  const pathPct = groupPercent(s, UNITS.map((u) => u.id));
  const band = defaultBand(s);
  const fresh = nextNewWords(s, band, s.settings.newWords).length;
  const bp = bandProgress(s, band);
  const nw = nextLesson(s);
  // «Armá la frase» entra al plan desde B1 (por el test o porque ya pasaste A2).
  const lvl = userLevel(s);
  const buildOn = (!!lvl && ['B1', 'B2', 'C1'].includes(lvl)) || !!s.levels.A2;
  const bMissed = s.build?.missed.length ?? 0;
  const nv = nextVerb(s.verbs);
  const rpDone = Object.keys(s.roleplays ?? {}).length;
  // Llamada sugerida: de la unidad que estás haciendo (o la última dominada), la que todavía no hiciste.
  const call = (() => {
    const started = UNITS.filter((u) => s.units[u.id]?.step || s.units[u.id]?.status === 'mastered');
    const base = unit && s.units[unit.id]?.step ? unit : started[started.length - 1] ?? unit;
    if (!base) return null;
    const calls = callsForUnit(base.id);
    const c = calls.find((x) => !s.calls[x.id]) ?? calls[0];
    return c ? { c, base } : null;
  })();

  return (
    <div className="screen">
      <div className="brand-row">
        <p className="brand">
          Crioll<span>English</span>
        </p>
        <p className="slogan">Learn English, a lo criollo</p>
      </div>
      <div className="hero">
        <div className="hero-top">
          <Ring value={pathPct}>
            <span className="ring-num">{Math.round(pathPct * 100)}%</span>
          </Ring>
          <div className="hero-level">
            <p className="eyebrow">{test ? 'Tu nivel (según el test)' : 'Tu nivel'}</p>
            <p className="level">{test ? (test.level ?? 'A1 inicial') : (pathLevel(s).level ?? 'A1 inicial')}</p>
            <p className="small">del camino completado</p>
          </div>
          <div className={`streak ${days > 0 ? 'on' : ''}`}>
            <Icon name="flame" size={22} />
            <p className="streak-num">{days}</p>
            <p className="small">{days === 1 ? 'día' : 'días'}</p>
          </div>
        </div>
        <WeekDots activity={s.activity} />
      </div>

      {(() => {
        const lr = lastRun(s);
        if (!lr) return null;
        const u = unitById(lr.unitId);
        const steps = activeSteps(u);
        const p = unitPercent(s, u.id);
        return (
          <div className="card resume-card">
            <p className="card-title">Seguí donde quedaste</p>
            <p>
              <b>{u.title}</b> · escalón «{steps[lr.run.stepIndex]?.title}», pregunta {Math.min(lr.run.pos + 1, lr.run.queue.length)} de {lr.run.queue.length}
            </p>
            <Bar value={p} />
            <p className="small">{Math.round(p * 100)}% de la unidad</p>
            <button className="primary" onClick={() => go({ name: 'lesson', unitId: u.id, resume: true })}>
              Retomar
            </button>
          </div>
        );
      })()}

      <h2>Tu plan de hoy</h2>
      <div className="card plan">
        <TaskRow
          icon="review"
          tone="sun"
          title="Repasos"
          done={due.length === 0}
          detail={due.length ? `${due.length} para recordar antes de que se olviden` : 'Al día: no hay nada pendiente'}
          cta={due.length ? `Repasar ${Math.min(due.length, REVIEW_BATCH)}` : undefined}
          onClick={due.length ? () => go({ name: 'review', keys: due.slice(0, REVIEW_BATCH), title: 'Repaso del día' }) : undefined}
        />
        {unit ? (
          <TaskRow
            icon="spark"
            tone="violet"
            title={unit.title}
            detail={
              <>
                Unidad nueva · {themeOf(unit).title}
                {unitPercent(s, unit.id) > 0 && ` · ${Math.round(unitPercent(s, unit.id) * 100)}%`}
              </>
            }
            cta={s.resume[unit.id] ? 'Seguir' : 'Aprender'}
            onClick={() => go({ name: 'lesson', unitId: unit.id, resume: !!s.resume[unit.id] })}
          />
        ) : (
          <TaskRow icon="spark" tone="violet" title="Algo nuevo" done detail="No hay unidades nuevas por ahora: repasá para afianzar" />
        )}
        {buildOn && (
          <TaskRow
            icon="blocks"
            tone="sky"
            title="Armá la frase"
            detail={bMissed ? `${bMissed} para repasar · varios tiempos en una oración` : 'Palabras clave + tiempo verbal → la oración entera'}
            cta="10 frases"
            onClick={() => go({ name: 'build' })}
          />
        )}
        <TaskRow
          icon="words"
          tone="good"
          title="Palabras nuevas"
          done={fresh === 0}
          detail={`${BAND_NAME[band] ?? band}: ${bp.added} de ${bp.total} vistas`}
          cta={fresh > 0 ? `+${fresh}` : undefined}
          onClick={fresh > 0 ? () => go({ name: 'vocab' }) : undefined}
        />
      </div>

      <h2>Practicar</h2>
      <div className="tiles">
        <Tile icon="masks" tone="sky" title="Roleplays" detail={rpDone ? `${rpDone} hechos · situaciones reales` : 'El café, el banco, una entrevista…'} onClick={() => go({ name: 'roleplays' })} />
        {call && (
          <Tile
            icon={
              <span className="tile-face">
                <img src={`${import.meta.env.BASE_URL}call/character.svg`} alt="" />
              </span>
            }
            tone="none"
            title="Llamar a Oliver"
            detail={call.c.title}
            onClick={() => go({ name: 'call', callId: call.c.id, unitId: call.base.id })}
          />
        )}
        <Tile icon="blocks" tone="sky" title="Armá la frase" detail="Como en clase: palabras clave y el tiempo" onClick={() => go({ name: 'build' })} />
        <Tile icon="blocks" tone="violet" title="Frases por estructura" detail="Patrones para armar oraciones largas" onClick={() => go({ name: 'structures' })} />
        <Tile
          icon="chat"
          tone="good"
          title="Escribir en inglés"
          detail={nw ? `Seguí: ${nw.title} (${nw.level})` : 'Textos de hasta 200 palabras'}
          onClick={() => go({ name: 'writing' })}
        />
        <Tile icon="grid" tone="sky" title="Los 12 tiempos" detail="La tabla entera y práctica mezclada" onClick={() => go({ name: 'tenses' })} />
        {nv && <Tile icon="verb" tone="sun" title="Taller de verbos" detail={`Próximo: ${nv.base} (${nv.es})`} onClick={() => go({ name: 'verb', verbId: nv.id })} />}
        <Tile
          icon="alert"
          tone="bad"
          title="Mis errores"
          detail={errorCount ? `${errorCount} para practicar` : 'Todavía no hay'}
          onClick={() => go({ name: 'errors' })}
        />
      </div>
      {availableFamilies().length > 0 && (
        <div className="card">
          <p className="card-title">Práctica mezclada</p>
          <p className="small">Reglas parecidas mezcladas y contra reloj: hay que elegir la correcta sin la pista de la unidad.</p>
          <div className="chips">
            {availableFamilies().map((f) => (
              <button key={f.name} className="chip" onClick={() => go({ name: 'mixed', family: f.name })}>
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {test && daysSince(test.date) >= RETEST_DAYS && (
        <div className="card accent">
          <p className="card-title">Hora de medir tu nivel</p>
          <p>Pasaron {daysSince(test.date)} días desde tu último test.</p>
          <button className="primary" onClick={() => go({ name: 'placement', retest: true })}>
            Hacer el test
          </button>
        </div>
      )}
    </div>
  );
}

const STATUS_LABEL = { locked: 'Bloqueada', available: 'Disponible', progress: 'En curso', mastered: '✓ Completada', placed: 'Disponible · ya la conocés por el test' } as const;

const Bar = ({ value }: { value: number }) => (
  <div className="mini-bar">
    <div style={{ width: `${Math.round(value * 100)}%` }} />
  </div>
);

export function Path({ go }: { go: (r: Route) => void }) {
  const s = useAppState();
  const next = nextUnit(s);
  // Se abre solo el tema donde estás; los demás se despliegan al tocarlos.
  const current = THEMES.find((t) => next && t.units.includes(next.id))?.id ?? THEMES[0]?.id;
  const [open, setOpen] = useState<Record<string, boolean>>(current ? { [current]: true } : {});
  const total = UNITS.length;
  const doneAll = UNITS.filter((u) => isDone(s, u.id)).length;
  return (
    <div className="screen">
      <h1>Tu camino</h1>
      <p className="small">
        {doneAll} de {total} unidades completadas. Dentro de cada tema van de fácil a difícil y se abren a medida que dominás lo anterior.
      </p>
      <button className="practice-test" onClick={() => go({ name: 'verbs' })}>
        <span className="unit-title">Taller de verbos</span>
        <span className="unit-status">
          {WORKSHOP.filter((v) => (s.verbs[v.id] ?? 0) >= 4).length} de {WORKSHOP.length} verbos dominados · de los más usados a los menos, en todos los tiempos
        </span>
      </button>
      {THEMES.map((t) => {
        const units = themeUnits(t);
        const pct = groupPercent(s, t.units);
        const done = units.filter((u) => isDone(s, u.id)).length;
        const isOpen = !!open[t.id];
        const block = (
          <section key={t.id} className={`theme ${isOpen ? 'open' : ''} ${done === units.length ? 'complete' : ''}`}>
            <button className="theme-head" aria-expanded={isOpen} onClick={() => setOpen((o) => ({ ...o, [t.id]: !o[t.id] }))}>
              <Ring value={pct} size={44} stroke={5}>
                {done === units.length ? <Icon name="check" size={16} /> : <span className="ring-small">{done}/{units.length}</span>}
              </Ring>
              <span className="theme-text">
                <span className="theme-title">
                  {t.title}
                  {t.id === current && <span className="tag here">Estás acá</span>}
                </span>
                <span className="small">{t.desc}</span>
              </span>
              <span className="theme-chev">
                <Icon name="chevron" size={18} />
              </span>
            </button>
            {isOpen && (
              <div className="theme-units">
                {units.map((u) => {
                  const st = unitStatus(s, u.id);
                  const needs = u.prereqs.filter((p) => !isDone(s, p)).map((p) => UNITS.find((x) => x.id === p)!.title);
                  if (!previousLevelDone(s, u.level)) {
                    const prev = LEVELS[LEVELS.indexOf(u.level) - 1];
                    const left = UNITS.filter((x) => x.level === prev && !isDone(s, x.id)).length;
                    needs.push(`${left} ${left === 1 ? 'unidad más básica' : 'unidades más básicas'}`);
                  }
                  const p = unitPercent(s, u.id);
                  const r = s.resume[u.id];
                  return (
                    <button key={u.id} className={`unit ${st}`} disabled={st === 'locked'} onClick={() => go({ name: 'lesson', unitId: u.id, resume: !!r })}>
                      <span className="unit-mark">
                        <Icon name={st === 'mastered' ? 'check' : st === 'locked' ? 'lock' : 'chevron'} size={16} />
                      </span>
                      <span className="unit-body">
                        <span className="unit-title">
                          {u.title} <span className="tag">{u.axis}</span>
                        </span>
                        <span className="unit-status">
                          {STATUS_LABEL[st]}
                          {st === 'progress' && ` · ${Math.round(p * 100)}%`}
                          {r && ' · seguí donde quedaste'}
                          {st === 'locked' && needs.length > 0 && ` · antes: ${needs.join(', ')}`}
                        </span>
                        {st === 'progress' && <Bar value={p} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        );
        return t.id === 'future' ? (
          <Fragment key={t.id}>
            {block}
            <button className="practice-test" onClick={() => go({ name: 'tenses' })}>
              <span className="unit-title">Los 12 tiempos juntos</span>
              <span className="unit-status">
                {TENSE_UNIT_IDS.filter((id) => isDone(s, id)).length} de 12 completados · la tabla entera y práctica con frases nuevas de cada tiempo o de todos mezclados
              </span>
            </button>
          </Fragment>
        ) : (
          block
        );
      })}
      <section className="level-block">
        <h2>Pruebas de nivel</h2>
        <p className="small">Para saber en qué nivel estás (A1 a C1). Cada prueba se habilita al terminar todas las unidades de ese nivel; no bloquea nada y se repite cuando quieras.</p>
        {LEVELS.map((L) => {
          const units = UNITS.filter((u) => u.level === L);
          const done = units.filter((u) => isDone(s, u.id)).length;
          const open = levelUnitsDone(s, L);
          return (
            <button key={L} className={`practice-test ${open ? '' : 'locked'}`} disabled={!open} onClick={() => go({ name: 'exam', level: L })}>
              <span className="unit-title">Prueba de práctica {L}</span>
              <span className="unit-status">
                {open
                  ? `Todo lo de ${L} mezclado, con explicación de cada error${s.levels[L] && s.levels[L]!.score < 1 ? ` · mejor resultado: ${Math.round(s.levels[L]!.score * 100)}%` : ''}`
                  : `Se habilita al terminar ${units.length - done} ${units.length - done === 1 ? 'unidad' : 'unidades'} más`}
              </span>
            </button>
          );
        })}
      </section>
    </div>
  );
}

export function Errors({ go, onBack }: { go: (r: Route) => void; onBack: () => void }) {
  const s = useAppState();
  const list = Object.values(s.errors).sort((a, b) => b.count - a.count || b.last.localeCompare(a.last));
  return (
    <div className="screen">
      <div className="top-bar">
        <BackButton onClick={onBack} />
      </div>
      <h1>Mis errores</h1>
      <p className="small">
        Lo que fallás queda acá. Cuando lo respondés bien a la primera en un repaso, baja; si lo acertás de nuevo, desaparece.
      </p>
      {list.length === 0 ? (
        <p>Todavía no hay errores registrados.</p>
      ) : (
        <>
          <button className="primary" onClick={() => go({ name: 'review', keys: list.slice(0, 15).map((e) => e.key), title: 'Práctica de errores' })}>
            Practicar los {Math.min(list.length, 15)} más frecuentes
          </button>
          <ul className="errors">
            {list.map((e) => (
              <li key={e.key}>
                <p className="small">
                  {UNITS.find((u) => u.id === e.unitId)?.title} · {e.count} {e.count === 1 ? 'vez' : 'veces'}
                </p>
                <p className="prompt-sm">{e.prompt}</p>
                <p className="given">Pusiste: {e.given}</p>
                <p className="correct">Correcto: {e.correct}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export function Progress({ go }: { go: (r: Route) => void }) {
  const s = useAppState();
  const { level, next, progress } = pathLevel(s);
  const test = lastTest(s);
  const mastered = Object.values(s.units).filter((u) => u.status === 'mastered').length;
  const retention = s.stats.reviews ? Math.round((s.stats.correct / s.stats.reviews) * 100) : null;
  return (
    <div className="screen">
      <h1>Progreso</h1>
      <div className="card">
        <p className="card-title">Nivel según tu camino</p>
        <p className="level">{level ?? 'A1 inicial'}</p>
        {next && (
          <>
            <div className="bar">
              <div className="bar-fill" style={{ width: `${progress * 100}%` }} />
            </div>
            <p className="small">
              {Math.round(progress * 100)}% de las unidades de {next}
            </p>
          </>
        )}
      </div>
      <div className="card">
        <p className="card-title">Último test de nivel</p>
        {test ? (
          <>
            <p>
              {test.level ?? 'A1 inicial'} · hace {daysSince(test.date)} días
            </p>
            <ul className="stats">
              {Object.entries(test.perSkill).map(([k, v]) => (
                <li key={k}>
                  <span>{k}</span>
                  <span>{Math.round((v!.correct / v!.total) * 100)}%</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>Todavía no hiciste el test.</p>
        )}
        <button className="secondary" onClick={() => go({ name: 'placement', retest: !!test })}>
          {test ? 'Repetir el test' : 'Hacer el test'}
        </button>
      </div>
      <div className="card">
        <p className="card-title">Constancia</p>
        <p className="small">
          Días que practicaste cada semana (últimas 8). Racha actual: <b>{streak(s)}</b> {streak(s) === 1 ? 'día' : 'días'}.
        </p>
        <WeekBars activity={s.activity} />
      </div>
      <div className="card">
        <p className="card-title">Unidades por nivel</p>
        <div className="level-rows">
          {LEVELS.map((L) => {
            const us = UNITS.filter((u) => u.level === L);
            if (!us.length) return null;
            const d = us.filter((u) => isDone(s, u.id)).length;
            return (
              <div key={L} className="level-row">
                <span className="level-name">{L}</span>
                <span className="mini-bar">
                  <div style={{ width: `${(d / us.length) * 100}%` }} />
                </span>
                <span className="level-count">
                  {d}/{us.length}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="card">
        <p className="card-title">Vocabulario</p>
        <div className="level-rows">
          {BANDS.map((b) => {
            const bp = bandProgress(s, b.level);
            return (
              <div key={b.level} className="level-row">
                <span className="level-name">{b.level}</span>
                <span className="mini-bar">
                  <div style={{ width: `${(bp.added / bp.total) * 100}%` }} />
                </span>
                <span className="level-count">
                  {bp.added}/{bp.total}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {s.tests.length > 1 && (
        <div className="card">
          <p className="card-title">Historial de tests</p>
          <ul className="stats">
            {s.tests.map((t) => (
              <li key={t.date}>
                <span>{new Date(t.date).toLocaleDateString('es-UY')}</span>
                <span>{t.level ?? 'A1 inicial'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="card">
        <p className="card-title">Números</p>
        <ul className="stats">
          <li>
            <span>Unidades dominadas</span>
            <span>{mastered}</span>
          </li>
          <li>
            <span>Roleplays hechos</span>
            <span>{Object.keys(s.roleplays ?? {}).length}</span>
          </li>
          <li>
            <span>Llamadas con Oliver</span>
            <span>{Object.keys(s.calls).length}</span>
          </li>
          <li>
            <span>Repasos hechos</span>
            <span>{s.stats.reviews}</span>
          </li>
          <li>
            <span>Aciertos en repasos</span>
            <span>{retention === null ? '—' : `${retention}%`}</span>
          </li>
        </ul>
      </div>
      <button className="secondary" onClick={() => go({ name: 'errors' })}>
        Mis errores ({Object.keys(s.errors).length})
      </button>
      <button className="secondary" onClick={() => go({ name: 'settings' })}>
        Configuración (apariencia, voces y más)
      </button>
      <p className="small center">
        CriollEnglish · Learn English, a lo criollo · v{APP_VERSION}
        {BUILD ? ` · compilación ${BUILD}` : ' · desarrollo'}
      </p>
    </div>
  );
}

export function Welcome({ go }: { go: (r: Route) => void }) {
  return (
    <div className="screen welcome">
      <div className="brand-block">
        <p className="brand big-brand">
          Crioll<span>English</span>
        </p>
        <p className="slogan">Learn English, a lo criollo.</p>
      </div>
      <p>
        Aprendés en orden: cada tema se apoya en el anterior. Usamos los métodos con más evidencia: recordar activamente en vez de releer, repasos espaciados en el tiempo, y corrección que te hace pensar.
      </p>
      <p>Primero, veamos tu nivel para no empezar de cero si ya sabés.</p>
      <button className="primary" onClick={() => go({ name: 'placement', retest: false })}>
        Hacer el test de nivel
      </button>
      <button className="link" onClick={() => go({ name: 'home', skipWelcome: true })}>
        Empezar desde el principio (A1)
      </button>
    </div>
  );
}

/** Elegir la voz: la del teléfono (recomendado) o una voz fija de la lista. */
