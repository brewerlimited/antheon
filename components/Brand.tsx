export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand-mark" aria-label="Anthēon Group">
      <span className={compact ? "brand-main brand-main-compact" : "brand-main"}>ANTHĒON</span>
      <span className="brand-sub">GROUP</span>
    </span>
  );
}
