import { useEffect, useRef } from "react";

export function IstanbulSkyline({ className = "" }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const paths = svg.querySelectorAll<SVGPathElement>("[data-draw]");
    paths.forEach((p, i) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
      p.style.animation = `em-draw 2s ${0.3 + i * 0.15}s cubic-bezier(0.22,1,0.36,1) forwards`;
    });
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 900 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
    >
      {/* Galata Tower */}
      <path
        data-draw
        d="M120 240 L120 120 L110 120 L110 100 L115 100 L115 60 L118 50 L122 50 L125 60 L125 100 L130 100 L130 120 L120 120"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Süleymaniye Mosque */}
      <path
        data-draw
        d="M200 240 L200 160 L210 160 L210 100 L212 60 L214 100 L216 160 L260 160 Q260 100 300 100 Q340 100 340 160 L384 160 L386 100 L388 60 L390 100 L384 160 L400 160 L400 240"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Mosque dome */}
      <path
        data-draw
        d="M240 160 Q240 110 300 90 Q360 110 360 160"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bosphorus Bridge */}
      <path
        data-draw
        d="M430 240 L430 130 L430 110 M430 110 Q530 80 630 110 M630 110 L630 130 L630 240"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bridge cables */}
      <path
        data-draw
        d="M430 110 Q480 140 530 150 Q580 140 630 110"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        data-draw
        d="M430 110 Q480 130 530 135 Q580 130 630 110"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Bridge deck */}
      <path
        data-draw
        d="M420 200 L640 200"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Maiden's Tower (Kız Kulesi) */}
      <path
        data-draw
        d="M690 240 L690 210 L680 210 L680 170 L685 170 Q695 150 705 170 L710 170 L710 210 L700 210 L700 240"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tower spire */}
      <path
        data-draw
        d="M695 150 L695 135 L693 132 L697 128 L695 135"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Modern skyscrapers */}
      <path
        data-draw
        d="M760 240 L760 100 L780 100 L780 240"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        data-draw
        d="M790 240 L790 130 L810 130 L810 240"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        data-draw
        d="M820 240 L820 80 L825 70 L830 80 L830 240"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Small buildings fill */}
      <path
        data-draw
        d="M50 240 L50 200 L70 200 L70 210 L90 210 L90 240"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Water line */}
      <path
        data-draw
        d="M0 240 Q100 235 200 240 Q300 245 400 240 Q500 235 600 240 Q700 245 800 240 L900 240"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
