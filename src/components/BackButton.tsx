/** Flecha para volver al paso anterior (arriba a la izquierda). */
export function BackButton({ onClick, label = 'Volver' }: { onClick: () => void; label?: string }) {
  return (
    <button className="back-btn" aria-label={label} onClick={onClick}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 5l-7 7 7 7" />
      </svg>
    </button>
  );
}
