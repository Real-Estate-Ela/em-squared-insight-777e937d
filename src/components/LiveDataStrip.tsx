import { useEffect, useRef, useState } from "react";

type Metric = {
  label: string;
  value: number;
  suffix: string;
  tone: "positive" | "risk" | "primary";
  prefix?: string;
};

const baseMetrics: Metric[] = [
  { label: "İstanbul m²", value: 42650, suffix: " ₺", tone: "positive", prefix: "" },
  { label: "Kira Getirisi", value: 5.8, suffix: "%", tone: "primary", prefix: "" },
  { label: "Arz Endeksi", value: 1247, suffix: "", tone: "risk", prefix: "" },
  { label: "ROI (5Y)", value: 38, suffix: "%", tone: "positive", prefix: "+" },
  { label: "Amortisman", value: 16.2, suffix: " yıl", tone: "primary", prefix: "" },
  { label: "Talep Skoru", value: 74, suffix: "/100", tone: "primary", prefix: "" },
  { label: "Volatilite", value: 12.5, suffix: "%", tone: "risk", prefix: "" },
  { label: "Aktif İlan", value: 84320, suffix: "", tone: "risk", prefix: "" },
];

const toneColor: Record<string, string> = {
  positive: "var(--positive)",
  risk: "var(--risk)",
  primary: "var(--primary)",
};

function jitter(val: number, pct: number) {
  const delta = val * (pct / 100);
  return +(val + (Math.random() * 2 - 1) * delta).toFixed(
    val % 1 === 0 ? 0 : 1,
  );
}

function formatNumber(n: number) {
  if (n >= 1000) return n.toLocaleString("tr-TR");
  return String(n);
}

export function LiveDataStrip() {
  const [metrics, setMetrics] = useState(baseMetrics);
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m) => ({ ...m, value: jitter(m.value, 1.5) })),
      );
      setTick((t) => t + 1);
    }, 3800);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-2.5 md:px-8">
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-positive/10 px-2 py-0.5 text-xs font-semibold text-positive">
          <span className="live-dot" style={{ width: 5, height: 5 }} />
          Canlı
        </span>
        <div className="h-4 w-px bg-border" />
        <div className="flex flex-1 items-center gap-5 overflow-x-auto scrollbar-none">
          {metrics.map((m) => (
            <span key={m.label} className="flex shrink-0 items-center gap-1.5">
              <span className="whitespace-nowrap text-xs text-muted-foreground">
                {m.label}
              </span>
              <span
                key={tick}
                className="number-in whitespace-nowrap text-xs font-bold"
                style={{ color: toneColor[m.tone] }}
              >
                {m.prefix}
                {formatNumber(m.value)}
                {m.suffix}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
