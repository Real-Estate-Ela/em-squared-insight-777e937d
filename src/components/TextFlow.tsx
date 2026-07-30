export function TextFlow({ className }: { className?: string }) {
  const words = [
    "m²",
    "KİRA GETİRİSİ",
    "ROI",
    "₺",
    "%",
    "AMORTİSMAN",
    "YATIRIM",
    "ANALİZ",
    "KONUT",
    "ARSA",
    "DÜKKAN",
    "MEDYAN",
    "GETİRİ",
    "RİSK",
    "DEĞERLEME",
  ];

  const line = words.join(" · ");

  return (
    <div
      className={className}
      aria-hidden="true"
      style={{ overflow: "hidden", pointerEvents: "none", userSelect: "none" }}
    >
      {/* Row 1 — scrolls left */}
      <div
        style={{
          display: "flex",
          whiteSpace: "nowrap",
          animation: "em-text-flow 35s linear infinite",
          willChange: "transform",
        }}
      >
        <span
          style={{
            fontSize: "clamp(4rem, 8vw, 7rem)",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "var(--foreground)",
            opacity: 0.03,
            paddingRight: "2rem",
          }}
        >
          {line}
        </span>
        <span
          style={{
            fontSize: "clamp(4rem, 8vw, 7rem)",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "var(--foreground)",
            opacity: 0.03,
            paddingRight: "2rem",
          }}
        >
          {line}
        </span>
      </div>

      {/* Row 2 — scrolls right (reverse direction) */}
      <div
        style={{
          display: "flex",
          whiteSpace: "nowrap",
          animation: "em-text-flow 38s linear infinite reverse",
          willChange: "transform",
          marginTop: "-0.5rem",
        }}
      >
        <span
          style={{
            fontSize: "clamp(4rem, 8vw, 7rem)",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "var(--foreground)",
            opacity: 0.03,
            paddingRight: "2rem",
          }}
        >
          {line}
        </span>
        <span
          style={{
            fontSize: "clamp(4rem, 8vw, 7rem)",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "var(--foreground)",
            opacity: 0.03,
            paddingRight: "2rem",
          }}
        >
          {line}
        </span>
      </div>
    </div>
  );
}
