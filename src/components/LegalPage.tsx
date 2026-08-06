import { Link } from "@tanstack/react-router";

interface Section {
  id: string;
  title: string;
}

interface LegalPageProps {
  breadcrumb: string;
  title: string;
  sections: Section[];
  placeholder: string;
}

const separatorStyle: React.CSSProperties = {
  height: 1,
  background: "rgba(14,17,22,.14)",
  margin: "clamp(32px, 4vw, 52px) 0",
  position: "relative",
};

export function LegalPage({ breadcrumb, title, sections, placeholder }: LegalPageProps) {
  return (
    <section
      data-bg="light"
      style={{
        background: "#FFFFFF",
        padding: "clamp(120px, 14vw, 190px) clamp(16px, 4vw, 44px) clamp(64px, 8vw, 120px)",
      }}
    >
      <div style={{ maxWidth: "44rem", margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div style={{
          font: "400 11px 'Space Mono', monospace",
          letterSpacing: ".28em",
          color: "#1B4DFF",
          marginBottom: 20,
        }}>
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>/</Link>
          {" "}
          {breadcrumb}
        </div>

        {/* Title */}
        <h1 style={{
          margin: "0 0 clamp(32px, 4vw, 52px)",
          font: "700 clamp(32px, 5.6vw, 64px) 'Space Grotesk', sans-serif",
          letterSpacing: "-0.06em",
          lineHeight: 0.92,
          color: "#0E1116",
        }}>
          {title}<span style={{ color: "#E23D28" }}>.</span>
        </h1>

        {/* Table of contents */}
        <nav style={{
          padding: "clamp(20px, 3vw, 28px)",
          border: "1px solid rgba(14,17,22,.14)",
          marginBottom: "clamp(36px, 5vw, 56px)",
        }}>
          <div style={{
            font: "400 10px 'Space Mono', monospace",
            letterSpacing: ".22em",
            color: "rgba(14,17,22,.4)",
            marginBottom: 14,
          }}>
            İÇİNDEKİLER
          </div>
          <ol style={{
            margin: 0,
            padding: "0 0 0 18px",
            font: "400 13px 'Space Mono', monospace",
            lineHeight: 2,
            color: "rgba(14,17,22,.7)",
          }}>
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Sections */}
        {sections.map((s, i) => (
          <div key={s.id}>
            {i > 0 && (
              <div style={separatorStyle}>
                <div style={{
                  position: "absolute",
                  left: 0,
                  top: -3,
                  width: 6,
                  height: 6,
                  background: "#1B4DFF",
                }} />
              </div>
            )}
            <div id={s.id} style={{ scrollMarginTop: 100 }}>
              <div style={{
                font: "400 10px 'Space Mono', monospace",
                letterSpacing: ".22em",
                color: "#1B4DFF",
                marginBottom: 12,
              }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <h2 style={{
                margin: "0 0 clamp(16px, 2vw, 24px)",
                font: "700 clamp(20px, 2.8vw, 32px) 'Space Grotesk', sans-serif",
                letterSpacing: "-0.04em",
                lineHeight: 1.1,
                color: "#0E1116",
              }}>
                {s.title}
              </h2>
              <p style={{
                margin: 0,
                font: "400 14px/1.7 'Space Grotesk', sans-serif",
                color: "rgba(14,17,22,.55)",
                fontStyle: "italic",
              }}>
                [{placeholder}]
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
