import type { ReactNode } from 'react';
import { today } from '../lib/store';

/** Íconos de línea (24×24), del mismo trazo que el engranaje de Configuración. */
const PATHS: Record<string, ReactNode> = {
  home: (
    <>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h5v-6h4v6h5V10" />
    </>
  ),
  path: (
    <>
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M8 19h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7" />
    </>
  ),
  words: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 21V5" />
      <path d="M9 8h6M9 12h4" />
    </>
  ),
  call: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  chart: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </>
  ),
  review: (
    <>
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
      <path d="M3 21v-5h5" />
    </>
  ),
  spark: <path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z" />,
  masks: (
    <>
      <path d="M4 5h9v6a4.5 4.5 0 0 1-9 0z" />
      <path d="M13 10h7v5a4 4 0 0 1-7 2.5" />
      <path d="M7 9h.01M10 9h.01M7 12.5c1 .8 2 .8 3 0" />
    </>
  ),
  blocks: (
    <>
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
      <rect x="8" y="3" width="8" height="8" rx="1.5" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5h16v11H9l-5 4z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
  verb: (
    <>
      <path d="M4 7h16M4 12h10M4 17h13" />
      <path d="M18 14l3 3-3 3" />
    </>
  ),
  shuffle: (
    <>
      <path d="M3 7h4l9 10h5M3 17h4l3-3.3M14 7h7" />
      <path d="M18 4l3 3-3 3M18 14l3 3-3 3" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4l9 16H3z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9.5h18M3 15h18M9 4v16M15 4v16" />
    </>
  ),
  flame: <path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z" />,
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 22 }: { name: string; size?: number }) {
  return (
    <svg className="ico" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}

/** Anillo de progreso (0 a 1) con algo en el centro. */
export function Ring({ value, size = 76, stroke = 8, children }: { value: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle
          className="ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  );
}

const DAY = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

/** Los últimos 7 días: cuáles practicaste. */
export function WeekDots({ activity }: { activity: string[] }) {
  const set = new Set(activity);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { key: today(d), label: DAY[d.getDay()], isToday: i === 6 };
  });
  return (
    <div className="week" aria-label="Días que practicaste esta semana">
      {days.map((d) => (
        <div key={d.key} className={`week-day ${set.has(d.key) ? 'on' : ''} ${d.isToday ? 'today' : ''}`}>
          <span className="week-dot">{set.has(d.key) && <Icon name="check" size={12} />}</span>
          <span className="week-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Días practicados por semana, las últimas `weeks` semanas (la última es la actual). */
export function weeklyActivity(activity: string[], weeks = 8): { label: string; days: number }[] {
  const set = new Set(activity);
  const start = new Date();
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // lunes de esta semana
  return Array.from({ length: weeks }, (_, k) => {
    const monday = new Date(start);
    monday.setDate(start.getDate() - 7 * (weeks - 1 - k));
    let days = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      if (set.has(today(d))) days++;
    }
    return { label: `${monday.getDate()}/${monday.getMonth() + 1}`, days };
  });
}

/** Barras simples: una por semana, de 0 a 7 días. */
export function WeekBars({ activity }: { activity: string[] }) {
  const data = weeklyActivity(activity);
  return (
    <div className="bars" role="img" aria-label={`Días practicados por semana: ${data.map((d) => `${d.label}: ${d.days}`).join(', ')}`}>
      {data.map((d, i) => (
        <div key={i} className={`bars-col ${i === data.length - 1 ? 'now' : ''}`}>
          <span className="bars-num">{d.days || ''}</span>
          <span className="bars-bar">
            <span style={{ height: `${(d.days / 7) * 100}%` }} />
          </span>
          <span className="bars-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Fila tocable: ícono, título, detalle y flecha (o un check si ya está hecho). */
export function TaskRow({
  icon,
  tone,
  title,
  detail,
  done,
  cta,
  onClick,
}: {
  icon: string;
  tone: 'sun' | 'sky' | 'good' | 'violet';
  title: string;
  detail: ReactNode;
  done?: boolean;
  cta?: string;
  onClick?: () => void;
}) {
  const body = (
    <>
      <span className={`task-icon tone-${tone} ${done ? 'done' : ''}`}>
        <Icon name={done ? "check" : icon} size={22} />
      </span>
      <span className="task-text">
        <span className="task-title">{title}</span>
        <span className="task-detail">{detail}</span>
      </span>
      {onClick && (cta ? <span className="task-cta">{cta}</span> : <Icon name="chevron" size={18} />)}
    </>
  );
  return onClick ? (
    <button className="task" onClick={onClick}>
      {body}
    </button>
  ) : (
    <div className="task idle">{body}</div>
  );
}

/** Baldosa de la grilla «Practicar». */
export function Tile({ icon, tone, title, detail, onClick }: { icon: ReactNode; tone: string; title: string; detail: string; onClick: () => void }) {
  return (
    <button className="tile" onClick={onClick}>
      <span className={`tile-icon tone-${tone}`}>{typeof icon === 'string' ? <Icon name={icon} size={22} /> : icon}</span>
      <span className="tile-title">{title}</span>
      <span className="tile-detail">{detail}</span>
    </button>
  );
}
