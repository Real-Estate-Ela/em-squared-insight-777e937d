import { ArrowRight } from "lucide-react";

export function EmptyState({
  title = "Henüz analiz yapılmadı",
  description = "İlan linkini yapıştırarak ilk yatırım analizinizi başlatın.",
  cta = "Analiz Et",
  onAction,
}: {
  title?: string;
  description?: string;
  cta?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <svg
        viewBox="0 0 200 160"
        fill="none"
        className="h-40 w-40 float-anim"
        aria-hidden="true"
      >
        {/* Building silhouette */}
        <rect x="60" y="50" width="30" height="70" rx="3" fill="var(--muted)" stroke="var(--border)" strokeWidth="1.5" />
        <rect x="100" y="30" width="40" height="90" rx="3" fill="var(--muted)" stroke="var(--border)" strokeWidth="1.5" />
        {/* Windows */}
        <rect x="68" y="60" width="6" height="8" rx="1" fill="var(--primary)" opacity="0.2" />
        <rect x="78" y="60" width="6" height="8" rx="1" fill="var(--primary)" opacity="0.15" />
        <rect x="68" y="75" width="6" height="8" rx="1" fill="var(--primary)" opacity="0.15" />
        <rect x="78" y="75" width="6" height="8" rx="1" fill="var(--primary)" opacity="0.2" />
        <rect x="108" y="42" width="8" height="10" rx="1.5" fill="var(--primary)" opacity="0.2" />
        <rect x="122" y="42" width="8" height="10" rx="1.5" fill="var(--primary)" opacity="0.15" />
        <rect x="108" y="60" width="8" height="10" rx="1.5" fill="var(--primary)" opacity="0.15" />
        <rect x="122" y="60" width="8" height="10" rx="1.5" fill="var(--primary)" opacity="0.2" />
        <rect x="108" y="78" width="8" height="10" rx="1.5" fill="var(--primary)" opacity="0.15" />
        <rect x="122" y="78" width="8" height="10" rx="1.5" fill="var(--primary)" opacity="0.15" />
        <rect x="108" y="96" width="8" height="10" rx="1.5" fill="var(--primary)" opacity="0.1" />
        <rect x="122" y="96" width="8" height="10" rx="1.5" fill="var(--primary)" opacity="0.1" />
        {/* Ground line */}
        <line x1="30" y1="120" x2="170" y2="120" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" />
        {/* Magnifier glass */}
        <circle cx="55" cy="45" r="16" fill="none" stroke="var(--primary)" strokeWidth="2" opacity="0.5" />
        <line x1="66" y1="56" x2="76" y2="66" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
        {/* Question marks */}
        <text x="51" y="50" fontFamily="Space Grotesk" fontSize="14" fontWeight="700" fill="var(--primary)" opacity="0.3">?</text>
        {/* Small chart dots */}
        <circle cx="148" cy="45" r="2" fill="var(--positive)" opacity="0.4" />
        <circle cx="155" cy="38" r="2" fill="var(--positive)" opacity="0.5" />
        <circle cx="162" cy="32" r="2" fill="var(--positive)" opacity="0.6" />
        <line x1="148" y1="45" x2="155" y2="38" stroke="var(--positive)" strokeWidth="1" opacity="0.3" />
        <line x1="155" y1="38" x2="162" y2="32" stroke="var(--positive)" strokeWidth="1" opacity="0.3" />
        {/* Shadow */}
        <ellipse cx="100" cy="140" rx="50" ry="5" fill="var(--foreground)" opacity="0.04" />
      </svg>
      <h3 className="mt-6 text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="group mt-6 flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
        >
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </div>
  );
}
