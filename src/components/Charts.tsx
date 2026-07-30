import { useCallback, useRef, useState } from "react";
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

function pointCoords(points: number[], w: number, h: number) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  return points.map((p, i) => ({
    x: (i / (points.length - 1)) * w,
    y: h - ((p - min) / span) * (h - 8) - 4,
    value: p,
  }));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function TrendChart({
  points,
  tone = "positive",
  height = 140,
  label,
  value,
  unit,
}: {
  points: number[];
  tone?: Tone;
  height?: number;
  label?: string;
  value?: string;
  unit?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const w = 300;
  const d = path(points, w, height);
  const coords = pointCoords(points, w, height);
  const [hover, setHover] = useState<number | null>(null);
  const [mouseY, setMouseY] = useState(0.5);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const relX = ((e.clientX - rect.left) / rect.width) * w;
      const relY = (e.clientY - rect.top) / rect.height;
      setMouseY(relY);
      let closest = 0;
      let closestDist = Infinity;
      for (let i = 0; i < coords.length; i++) {
        const dist = Math.abs(coords[i].x - relX);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      }
      setHover(closest);
    },
    [coords, w],
  );

  const interpolatedValue =
    hover !== null && coords[hover]
      ? (() => {
          const next = coords[Math.min(hover + 1, coords.length - 1)];
          const cur = coords[hover];
          return Math.round(lerp(cur.value, next.value, mouseY * 0.3));
        })()
      : null;

  return (
    <div ref={ref} className="group">
      {(label || value) && (
        <div className="flex items-baseline justify-between">
          <span className="label-mono">{label}</span>
          <span
            className="text-sm font-semibold transition-transform duration-200"
            style={{
              color: stroke[tone],
              transform: hover !== null ? "scale(1.1)" : "scale(1)",
            }}
          >
            {hover !== null && interpolatedValue !== null
              ? `${interpolatedValue}${unit ?? ""}`
              : value}
          </span>
        </div>
      )}
      <div className="relative">
        <svg
          viewBox={`0 0 ${w} ${height}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`${label ?? "trend"} grafiği`}
          className="mt-3 w-full cursor-crosshair"
          style={{ height }}
          onMouseMove={onMouseMove}
          onMouseLeave={() => setHover(null)}
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
          {/* Hover highlight area */}
          {inView && hover !== null && coords[hover] && (
            <rect
              x={Math.max(0, coords[hover].x - w / coords.length / 2)}
              y={0}
              width={w / coords.length}
              height={height}
              fill={stroke[tone]}
              opacity={0.04}
              style={{ transition: "x 0.15s ease, opacity 0.2s ease" }}
            />
          )}
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
          {inView &&
            hover !== null &&
            coords[hover] && (
              <>
                <line
                  x1={coords[hover].x}
                  x2={coords[hover].x}
                  y1={0}
                  y2={height}
                  stroke={stroke[tone]}
                  strokeWidth="1"
                  strokeDasharray="4 3"
                  vectorEffect="non-scaling-stroke"
                  opacity={0.5}
                />
                {/* Horizontal guide line at hover point */}
                <line
                  x1={0}
                  x2={w}
                  y1={coords[hover].y}
                  y2={coords[hover].y}
                  stroke={stroke[tone]}
                  strokeWidth="1"
                  strokeDasharray="2 4"
                  vectorEffect="non-scaling-stroke"
                  opacity={0.25}
                />
                <circle
                  cx={coords[hover].x}
                  cy={coords[hover].y}
                  r="6"
                  fill={stroke[tone]}
                  opacity={0.15}
                />
                <circle
                  cx={coords[hover].x}
                  cy={coords[hover].y}
                  r="4"
                  fill={stroke[tone]}
                  stroke="var(--background)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </>
            )}
          {inView &&
            coords.map((c, i) => (
              <circle
                key={i}
                cx={c.x}
                cy={c.y}
                r={hover === i ? 0 : 2}
                fill={stroke[tone]}
                opacity={hover === null ? 0 : 0.3}
                style={{ transition: "opacity 0.2s, r 0.2s" }}
              />
            ))}
        </svg>
        {hover !== null && coords[hover] && (
          <div
            className="chart-tooltip"
            style={{
              left: `${(coords[hover].x / w) * 100}%`,
              top: 12,
              transform: coords[hover].x > w * 0.7 ? "translateX(-100%)" : "translateX(0)",
            }}
          >
            {interpolatedValue ?? coords[hover].value}
            {unit ?? ""}
          </div>
        )}
      </div>
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
  const [hovering, setHovering] = useState(false);
  const [mouseAngle, setMouseAngle] = useState(0);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
      setMouseAngle(angle);
    },
    [],
  );

  const pulseScale = hovering ? 1 + Math.abs(Math.sin(mouseAngle * 0.02)) * 0.08 : 0;

  return (
    <div
      ref={ref}
      className="flex flex-col items-center"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onMouseMove={onMouseMove}
    >
      <svg viewBox="0 0 128 128" className="h-32 w-32 -rotate-90 cursor-pointer">
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="var(--grid)"
          strokeWidth="8"
        />
        {/* Glow ring behind the arc */}
        {hovering && (
          <circle
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke={stroke[tone]}
            strokeWidth="16"
            strokeDasharray={c}
            strokeDashoffset={c - (value / 100) * c}
            opacity={0.12}
            style={{ filter: "blur(4px)" }}
          />
        )}
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke={stroke[tone]}
          strokeWidth={hovering ? 10 : 8}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={inView ? c - (value / 100) * c : c}
          style={{
            transition:
              "stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1), stroke-width 0.2s ease",
          }}
        />
        {/* Animated tick at the arc end */}
        {inView && hovering && (
          <circle
            cx={64 + r * Math.cos(((value / 100) * 360 * Math.PI) / 180)}
            cy={64 + r * Math.sin(((value / 100) * 360 * Math.PI) / 180)}
            r="3"
            fill="var(--background)"
            stroke={stroke[tone]}
            strokeWidth="2"
          />
        )}
      </svg>
      <span
        className="-mt-20 text-2xl font-bold transition-transform duration-200"
        style={{
          color: stroke[tone],
          transform: hovering ? `scale(${1.15 + pulseScale})` : "scale(1)",
        }}
      >
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
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [mouseX, setMouseX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setMouseX((e.clientX - rect.left) / rect.width);
    },
    [],
  );

  return (
    <div ref={ref}>
      <div ref={containerRef} onMouseMove={onMouseMove}>
        {data.map((b, i) => {
          const isHovered = hoverIdx === i;
          const displayValue = isHovered
            ? Math.round(b.v * (0.6 + mouseX * 0.8))
            : b.v;
          const displayWidth = isHovered
            ? b.v * (0.6 + mouseX * 0.8)
            : b.v;

          return (
            <div
              key={b.k}
              className="border-t border-border py-5 last:border-b"
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            >
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">{b.k}</span>
                <span
                  className="font-semibold tabular-nums transition-all duration-150"
                  style={{
                    color: stroke[b.tone],
                    transform: isHovered ? "scale(1.15)" : "scale(1)",
                  }}
                >
                  %{displayValue}
                </span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-grid">
                <div
                  className="relative h-2 overflow-hidden rounded-full"
                  style={{
                    backgroundColor: stroke[b.tone],
                    width: inView ? `${Math.min(displayWidth, 100)}%` : "0%",
                    transition: isHovered
                      ? "width 0.08s linear"
                      : `width 1.1s cubic-bezier(.22,1,.36,1) ${i * 110}ms`,
                  }}
                >
                  {isHovered && (
                    <span
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(90deg, transparent, color-mix(in oklab, ${stroke[b.tone]} 40%, white), transparent)`,
                        animation: "em-scan 1.5s linear infinite",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
