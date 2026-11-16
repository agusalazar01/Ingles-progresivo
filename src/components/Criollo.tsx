import { useEffect, useRef, useState } from 'react';
import { hapticTick } from '../lib/haptics';

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Texto que aparece letra a letra, con un toque suave por palabra. Tocá el texto para verlo completo. */
export function Typed({ text, animate, speed = 26 }: { text: string; animate: boolean; speed?: number }) {
  const [n, setN] = useState(animate && !reduced() ? 0 : text.length);
  const done = useRef(n >= text.length);
  useEffect(() => {
    if (done.current) return;
    const id = setInterval(() => {
      setN((k) => {
        const next = Math.min(text.length, k + 1);
        if (text[next - 1] === ' ') hapticTick();
        if (next >= text.length) {
          done.current = true;
          clearInterval(id);
        }
        return next;
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  if (n >= text.length) return <>{text}</>;
  return (
    <span onClick={() => setN(text.length)} className="typed">
      {text.slice(0, n)}
      <span className="typed-hide">{text.slice(n)}</span>
    </span>
  );
}
