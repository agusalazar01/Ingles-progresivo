import { useEffect, useRef } from 'react';
import svg from '../assets/call/character.svg?raw';

/**
 * Oliver animado con clases CSS sobre el dibujo vectorial (sin imágenes pesadas ni IA):
 * respira, inclina la cabeza, pestañea, mira de costado, levanta las cejas y, mientras habla,
 * alterna 4 bocas y mueve el mostacho.
 */
export function Oliver({ talking, className = '' }: { talking: boolean; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const talkingRef = useRef(talking);
  talkingRef.current = talking;

  useEffect(() => {
    const el = box.current?.querySelector('svg');
    if (!el) return;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    const flag = (cls: string, ms: number) => {
      el.classList.add(cls);
      later(() => el.classList.remove(cls), ms);
    };
    const blink = () => later(() => (flag('blink', 130), blink()), 2200 + Math.random() * 3200);
    const glance = () => later(() => (flag('glance', 1100 + Math.random() * 900), glance()), 6000 + Math.random() * 5000);
    const brow = () => later(() => (flag('brow-up', 500), brow()), 7000 + Math.random() * 6000);
    const MOUTHS = ['mouth-closed', 'mouth-slight', 'mouth-open', 'mouth-round'];
    let mouth = 'mouth-closed';
    const setMouth = (m: string) => {
      if (m === mouth) return;
      el.classList.remove(mouth);
      el.classList.add(m);
      mouth = m;
    };
    el.classList.add(mouth);
    const talk = () =>
      later(() => {
        el.classList.toggle('talking', talkingRef.current);
        if (talkingRef.current) {
          const r = Math.random();
          setMouth(r < 0.4 ? MOUTHS[1] : r < 0.75 ? MOUTHS[2] : r < 0.88 ? MOUTHS[3] : MOUTHS[0]);
        } else setMouth(MOUTHS[0]);
        talk();
      }, 110 + Math.random() * 70);
    blink();
    glance();
    brow();
    talk();
    return () => timers.forEach(clearTimeout);
  }, []);

  return <div ref={box} className={`oliver ${className}`} role="img" aria-label="Oliver" dangerouslySetInnerHTML={{ __html: svg }} />;
}
