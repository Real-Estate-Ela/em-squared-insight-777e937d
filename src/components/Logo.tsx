export function EmSquareMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center rounded-lg border-2 border-foreground ${className}`}
      aria-hidden="true"
    >
      <span className="font-display text-[0.85em] font-bold leading-none tracking-tighter text-foreground">
        em
      </span>
      <span className="absolute right-[6%] top-[4%] font-display text-[0.42em] font-bold leading-none text-primary">
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

export function LogoWatermark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
    >
      <rect
        x="4"
        y="4"
        width="192"
        height="192"
        rx="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <text
        x="24"
        y="132"
        fontFamily="Space Grotesk, sans-serif"
        fontWeight="700"
        fontSize="104"
        letterSpacing="-6"
        fill="currentColor"
      >
        em
      </text>
      <text
        x="150"
        y="76"
        fontFamily="Space Grotesk, sans-serif"
        fontWeight="700"
        fontSize="46"
        fill="var(--primary)"
      >
        2
      </text>
    </svg>
  );
}
