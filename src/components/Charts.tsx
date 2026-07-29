import { useInView } from "./Reveal";

type Tone = "positive" | "risk" | "primary";

const stroke: Record<Tone, string> = {
  positive: "var(--positive)",
  risk: "var(--risk)",
  primary: "var(--primary)",
};

function path(points: number[], w: number, h: number) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  return points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / span) * (h - 8) - 4;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function TrendChart({
  points,
  tone = "positive",
  height = 140,
  label,
  value,
}: {
  points: number[];
  tone?: Tone;
  height?: number;
  label?: string;
  value?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const w = 300;
  const d = path(points, w, height);

  return (
    <div ref={ref} className="group">
      {(label || value) && (
        <div className="flex items-baseline justify-between">
          <span className="label-mono">{label}</span>
          <span
            className="text-sm"
            style={{ color: stroke[tone] }}
          >
            {value}
          </span>
        </div>
      )}
      <svg
        viewBox={`0 0 ${w} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${label ?? "trend"} grafiği`}
        className="mt-3 w-full"
        style={{ height }}
      >
        {[0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1="0"
            x2={w}
            y1={height * g}
            y2={height * g}
            stroke="var(--grid)"
            strokeWidth="1"
          />
        ))}
        <path
          d={`${d} L${w},${height} L0,${height} Z`}
          fill={stroke[tone]}
          opacity={inView ? 0.08 : 0}
          style={{ transition: "opacity .9s ease .3s" }}
        />
        <path
          d={d}
          fill="none"
          stroke={stroke[tone]}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          style={{
            strokeDasharray: 1200,
            strokeDashoffset: inView ? 0 : 1200,
            transition: "stroke-dashoffset 1.6s cubic-bezier(.22,1,.36,1)",
          }}
        />
      </svg>
    </div>
  );
}

export function Gauge({
  value,
  tone = "positive",
  caption,
}: {
  value: number;
  tone?: Tone;
  caption: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const r = 52;
  const c = 2 * Math.PI * r;

  return (
    <div ref={ref} className="flex flex-col items-center">
      <svg viewBox="0 0 128 128" className="h-32 w-32 -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="var(--grid)" strokeWidth="8" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke={stroke[tone]}
          strokeWidth="8"
          strokeDasharray={c}
          strokeDashoffset={inView ? c - (value / 100) * c : c}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <span className="-mt-20 text-2xl" style={{ color: stroke[tone] }}>
        %{value}
      </span>
      <span className="label-mono mt-14">{caption}</span>
    </div>
  );
}

export function Bars({
  data,
}: {
  data: { k: string; v: number; tone: Tone }[];
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref}>
      {data.map((b, i) => (
        <div key={b.k} className="border-t border-border py-5 last:border-b">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">{b.k}</span>
            <span style={{ color: stroke[b.tone] }}>%{b.v}</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-grid">
            <div
              className="h-1.5"
              style={{
                backgroundColor: stroke[b.tone],
                width: inView ? `${b.v}%` : "0%",
                transition: `width 1.1s cubic-bezier(.22,1,.36,1) ${i * 110}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}