import { LEVELS } from '../content/types';
import { UNITS } from '../content/curriculum';
import { daysSince, groupPercent, isDone, lastTest, nextUnit, pathLevel, previousLevelDone, unitPercent, unitStatus } from '../lib/progress';
import { THEMES, themeOf, themeUnits } from '../content/themes';
import { unitById } from '../content/curriculum';
import { dueKeys, lastRun, streak, useAppState } from '../lib/store';
import { activeSteps } from '../lib/ladder';
import { callsForUnit } from '../content/calls';
import { APP_VERSION, BUILD } from '../lib/update';
import type { Route } from '../App';
import { availableFamilies } from './Practice';
import { nextVerb } from './Verbs';
import { WORKSHOP } from '../gen/verbs';
import { levelUnitsDone } from '../lib/progress';
import { duePhrases } from '../lib/phrases';
import { BAND_NAME, bandProgress, defaultBand, nextNewWords } from '../lib/vocab';

const REVIEW_BATCH = 20;
const RETEST_DAYS = 28;

export function Home({ go }: { go: (r: Route) => void }) {
  const s = useAppState();
  const due = dueKeys(s);
  const unit = nextUnit(s);
  const test = lastTest(s);
  const errorCount = Object.keys(s.errors).length;
  const days = streak(s);

  return (
    <div className="screen">
      <div className="brand-row">
        <p className="brand">
          Crioll<span>English</span>
        </p>
        <p className="slogan">Learn English, a lo criollo</p>
      </div>
      <div className="hero">
        <div>
          <p className="eyebrow">Tu nivel (según el test)</p>
          <p className="level">{test?.level ?? (test ? 'Inicial' : 'Sin test')}</p>
          <p className="small">{Math.round(groupPercent(s, UNITS.map((u) => u.id)) * 100)}% del camino completado</p>
        </div>
        <div className="streak">
          <p className="level">{days}</p>
          <p className="small">{days === 1 ? 'día seguido' : 'días seguidos'}</p>
        </div>
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

      <h2>Hoy</h2>
      <div className="card">
        <p className="card-title">1. Repasos</p>
        <p>{due.length ? `${due.length} ejercicios para recordar antes de que se olviden.` : 'No hay repasos pendientes. ¡Al día!'}</p>
        {due.length > 0 && (
          <button className="primary" onClick={() => go({ name: 'review', keys: due.slice(0, REVIEW_BATCH), title: 'Repaso del día' })}>
            Repasar {Math.min(due.length, REVIEW_BATCH)}
          </button>
        )}
      </div>
      <div className="card">
        <p className="card-title">2. Algo nuevo</p>
        {unit ? (
          <>
            <p>
              {unit.title} <span className="tag">{themeOf(unit).title}</span>
            </p>
            {unitPercent(s, unit.id) > 0 && (
              <>
                <Bar value={unitPercent(s, unit.id)} />
                <p className="small">{Math.round(unitPercent(s, unit.id) * 100)}% de la unidad</p>
              </>
            )}
            <button className={due.length ? 'secondary' : 'primary'} onClick={() => go({ name: 'lesson', unitId: unit.id, resume: !!s.resume[unit.id] })}>
              {s.resume[unit.id] ? 'Seguir' : 'Aprender'}
            </button>
          </>
        ) : (
          <p>No hay unidades nuevas disponibles por ahora: repasá para afianzar lo aprendido.</p>
        )}
      </div>
      <div className="card">
        <p className="card-title">3. Palabras nuevas</p>
        {(() => {
          const b = defaultBand(s);
          const fresh = nextNewWords(s, b, s.settings.newWords).length;
          const bp = bandProgress(s, b);
          return (
            <>
              <p>
                Palabras {(BAND_NAME[b] ?? b).toLowerCase()}: {bp.added} de {bp.total} vistas.
              </p>
              {fresh > 0 && (
                <button className="secondary" onClick={() => go({ name: 'vocab' })}>
                  Aprender {fresh} palabras
                </button>
              )}
            </>
          );
        })()}
      </div>
      {(() => {
        const ph = s.phrases ?? [];
        const dueP = duePhrases(ph).length;
        return (
          <div className="card">
            <p className="card-title">🗣️ Decilo en inglés</p>
            <p className="small">
              {ph.length ? `${ph.length} frases tuyas${dueP ? ` · ${dueP} para repasar hoy` : ''}.` : 'Algo que pensaste en español: intentalo en inglés y mirá cómo lo diría un australiano.'}
            </p>
            <button className="secondary" onClick={() => go({ name: 'phrases' })}>
              {dueP ? 'Repasar mis frases' : 'Decir algo nuevo'}
            </button>
          </div>
        );
      })()}
      {(() => {
        // Llamada sugerida: de la unidad que estás haciendo (o la última dominada), la que todavía no hiciste.
        const started = UNITS.filter((u) => s.units[u.id]?.step || s.units[u.id]?.status === 'mastered');
        const base = unit && s.units[unit.id]?.step ? unit : started[started.length - 1] ?? unit;
        if (!base) return null;
        const calls = callsForUnit(base.id);
        const c = calls.find((x) => !s.calls[x.id]) ?? calls[0];
        if (!c) return null;
        return (
          <div className="card">
            <p className="card-title">📞 Llamá a Oliver</p>
            <p className="small">Una charla corta con un australiano para usar lo de «{base.title}».</p>
            <button className="call-card" onClick={() => go({ name: 'call', callId: c.id, unitId: base.id })}>
              <span className="face">
                <img src={`${import.meta.env.BASE_URL}call/character.svg`} alt="" />
              </span>
              <span className="grow">
                <span className="unit-title">{c.title}</span>
                <span className="unit-status">{c.scene}</span>
              </span>
              <span aria-hidden="true">📞</span>
            </button>
          </div>
        );
      })()}
      {(() => {
        const nv = nextVerb(s.verbs);
        return nv ? (
          <div className="card">
            <p className="card-title">Taller de verbos</p>
            <p>
              Próximo verbo: <b>{nv.base}</b> ({nv.es})
            </p>
            <button className="secondary" onClick={() => go({ name: 'verb', verbId: nv.id })}>
              Practicar «{nv.base}»
            </button>
          </div>
        ) : null;
      })()}
      {availableFamilies().length > 0 && (
        <div className="card">
          <p className="card-title">4. Práctica mezclada</p>
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
      {errorCount > 0 && (
        <div className="card">
          <p className="card-title">Tus errores</p>
          <p>{errorCount} ejercicios que te costaron.</p>
          <button className="secondary" onClick={() => go({ name: 'errors' })}>
            Ver y practicar
          </button>
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
  return (
    <div className="screen">
      <h1>Tu camino</h1>
      <p className="small">
        Organizado por temas. Dentro de cada tema las unidades van de fácil a difícil, y se abren a medida que dominás lo que hace falta saber antes.
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
        return (
          <section key={t.id} className="level-block">
            <div className="theme-head">
              <h2>{t.title}</h2>
              <span className="theme-pct">{Math.round(pct * 100)}%</span>
            </div>
            <p className="small">{t.desc}</p>
            <Bar value={pct} />
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
                </button>
              );
            })}
          </section>
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

export function Errors({ go }: { go: (r: Route) => void }) {
  const s = useAppState();
  const list = Object.values(s.errors).sort((a, b) => b.count - a.count || b.last.localeCompare(a.last));
  return (
    <div className="screen">
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
            <span>Repasos hechos</span>
            <span>{s.stats.reviews}</span>
          </li>
          <li>
            <span>Aciertos en repasos</span>
            <span>{retention === null ? '—' : `${retention}%`}</span>
          </li>
        </ul>
      </div>
      <button className="secondary" onClick={() => go({ name: 'settings' })}>
        ⚙️ Configuración (apariencia, voces, IA y más)
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
