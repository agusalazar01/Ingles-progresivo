import { LEVELS } from '../content/types';
import { UNITS } from '../content/curriculum';
import { daysSince, isDone, lastTest, nextUnit, pathLevel, previousLevelDone, unitStatus } from '../lib/progress';
import { dueKeys, resetAll, setState, streak, useAppState } from '../lib/store';
import { ACCENT_LABEL, say, type Accent } from '../lib/speech';
import { APP_VERSION, BUILD } from '../lib/update';
import type { Route } from '../App';
import { availableFamilies } from './Practice';
import { levelUnitsDone } from '../lib/progress';
import { bandProgress, defaultBand, nextNewWords } from '../lib/vocab';

const REVIEW_BATCH = 20;
const RETEST_DAYS = 28;

export function Home({ go }: { go: (r: Route) => void }) {
  const s = useAppState();
  const due = dueKeys(s);
  const unit = nextUnit(s);
  const { level, next, progress } = pathLevel(s);
  const test = lastTest(s);
  const errorCount = Object.keys(s.errors).length;
  const days = streak(s);

  return (
    <div className="screen">
      <div className="hero">
        <div>
          <p className="eyebrow">Tu nivel</p>
          <p className="level">{level ?? 'A1 inicial'}</p>
          {next && (
            <p className="small">
              {Math.round(progress * 100)}% de {next}
            </p>
          )}
        </div>
        <div className="streak">
          <p className="level">{days}</p>
          <p className="small">{days === 1 ? 'día seguido' : 'días seguidos'}</p>
        </div>
      </div>

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
              {unit.title} <span className="tag">{unit.level}</span>
            </p>
            <button className={due.length ? 'secondary' : 'primary'} onClick={() => go({ name: 'lesson', unitId: unit.id })}>
              Aprender
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
                Banda {b}: {bp.added} de {bp.total} palabras vistas.
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

const STATUS_LABEL = { locked: 'Bloqueada', available: 'Disponible', progress: 'En curso', mastered: 'Dominada', placed: 'Ubicada por test' } as const;

export function Path({ go }: { go: (r: Route) => void }) {
  const s = useAppState();
  return (
    <div className="screen">
      <h1>Tu camino</h1>
      <p className="small">
        Cada unidad tiene una escalera de 6 escalones. Un nivel se abre al dominar el anterior y aprobar su examen de cierre.
      </p>
      {LEVELS.map((L) => (
        <section key={L} className="level-block">
          <h2>{L}</h2>
          {UNITS.filter((u) => u.level === L).map((u) => {
            const st = unitStatus(s, u.id);
            const needs = u.prereqs.filter((p) => !isDone(s, p)).map((p) => UNITS.find((x) => x.id === p)!.title);
            if (!previousLevelDone(s, u.level)) needs.push(`completar ${LEVELS[LEVELS.indexOf(u.level) - 1]}`);
            return (
              <button key={u.id} className={`unit ${st}`} disabled={st === 'locked'} onClick={() => go({ name: 'lesson', unitId: u.id })}>
                <span className="unit-title">
                  {u.title} <span className="tag">{u.axis}</span>
                </span>
                <span className="unit-status">
                  {STATUS_LABEL[st]}
                  {st === 'progress' && ` · escalón ${s.units[u.id]?.step ?? 0}`}
                  {st === 'locked' && needs.length > 0 && ` · antes: ${needs.join(', ')}`}
                </span>
              </button>
            );
          })}
          {s.levels[L] ? (
            <p className="small level-ok">✓ Nivel {L} cerrado{s.levels[L]!.score < 1 ? ` con ${Math.round(s.levels[L]!.score * 100)}% en el examen` : ''}</p>
          ) : levelUnitsDone(s, L) ? (
            <button className="primary" onClick={() => go({ name: 'exam', level: L })}>
              Examen de cierre de {L}
            </button>
          ) : (
            <p className="small">Al dominar todas las unidades se habilita el examen de cierre de {L}.</p>
          )}
        </section>
      ))}
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
      <div className="card">
        <p className="card-title">Acento de las voces</p>
        <p className="small">Usa las voces que tenga instaladas tu teléfono. "Variado" entrena el oído con muchas voces distintas.</p>
        <div className="options">
          {(Object.keys(ACCENT_LABEL) as Accent[]).map((a) => (
            <button
              key={a}
              className={`option ${s.settings.accent === a ? 'right' : ''}`}
              onClick={() => {
                setState((st) => ({ ...st, settings: { ...st.settings, accent: a } }));
                say('Hello! This is how I sound.', { accent: a });
              }}
            >
              {ACCENT_LABEL[a]}
            </button>
          ))}
        </div>
      </div>
      <button
        className="link"
        onClick={() => {
          if (window.confirm('¿Borrar todo el progreso? No se puede deshacer.')) resetAll();
        }}
      >
        Borrar mi progreso
      </button>
      <p className="small center">
        Versión {APP_VERSION}
        {BUILD ? ` · compilación ${BUILD}` : ' · desarrollo'}
      </p>
    </div>
  );
}

export function Welcome({ go }: { go: (r: Route) => void }) {
  return (
    <div className="screen welcome">
      <h1>Inglés Progresivo</h1>
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
