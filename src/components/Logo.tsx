export function EmSquareMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center bg-foreground ${className}`}
      aria-hidden="true"
    >
      <span className="font-display text-[0.9em] font-bold leading-none tracking-tighter text-background">
        em
      </span>
      <span className="absolute right-[8%] top-[6%] font-display text-[0.45em] font-bold leading-none text-primary">
        2
      </span>
    </span>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-display font-bold tracking-[-0.045em] text-foreground ${className}`}
    >
      emlakmetric
    </span>
  );
}
