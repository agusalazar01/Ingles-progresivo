import { useEffect, useRef } from 'react';

/**
 * Botón «atrás» del celular (y del navegador): cada pantalla registra qué hacer al volver
 * (cerrar un panel, salir de un escalón al menú de la unidad, cortar la llamada…).
 * Gana el manejador de mayor nivel; si hay empate, el último registrado.
 */
type Entry = { level: number; run: () => void };
const entries: Entry[] = [];

export function useBack(active: boolean, fn: () => void, level = 1) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!active) return;
    const e: Entry = { level, run: () => ref.current() };
    entries.push(e);
    return () => {
      const i = entries.indexOf(e);
      if (i >= 0) entries.splice(i, 1);
    };
  }, [active, level]);
}

/** Ejecuta el manejador más específico. Devuelve false si ninguna pantalla lo tomó. */
export function runBack(): boolean {
  if (!entries.length) return false;
  let best = entries[0];
  for (const e of entries) if (e.level >= best.level) best = e;
  best.run();
  return true;
}
