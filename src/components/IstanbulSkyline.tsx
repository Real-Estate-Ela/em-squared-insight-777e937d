import { useEffect, useRef } from "react";

export function IstanbulSkyline({ className = "" }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const paths = svg.querySelectorAll<SVGElement>("[data-draw]");
    paths.forEach((p, i) => {
      if (p instanceof SVGPathElement || p instanceof SVGLineElement || p instanceof SVGCircleElement || p instanceof SVGEllipseElement) {
        const len = p instanceof SVGPathElement ? p.getTotalLength() : 300;
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = `${len}`;
        p.style.animation = `em-draw 2.2s ${0.2 + i * 0.12}s cubic-bezier(0.22,1,0.36,1) forwards`;
      }
    });
    const fades = svg.querySelectorAll<SVGElement>("[data-fade]");
    fades.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.animation = `em-skyline-fade 1.8s ${0.6 + i * 0.18}s ease forwards`;
    });
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1200 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
    >
      <defs>
        <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.03" />
          <stop offset="40%" stopColor="var(--cyan)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="water-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
          <stop offset="50%" stopColor="var(--cyan)" stopOpacity="0.10" />
          <stop offset="100%" stopColor="var(--positive)" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="building-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.10" />
        </linearGradient>
        <linearGradient id="building-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.40" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="tower-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.50" />
          <stop offset="50%" stopColor="var(--cyan)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="reflection-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.10" />
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="dome-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="mosque-dome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--positive)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.30" />
        </linearGradient>
        <linearGradient id="bridge-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
          <stop offset="50%" stopColor="var(--cyan)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="skyscraper-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.45" />
          <stop offset="40%" stopColor="var(--primary)" stopOpacity="0.30" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="haze-left" x1="0" y1="0.5" x2="1" y2="0.5">
          <stop offset="0%" stopColor="var(--background)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--background)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="haze-right" x1="1" y1="0.5" x2="0" y2="0.5">
          <stop offset="0%" stopColor="var(--background)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--background)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="window-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--amber)" stopOpacity="0.2" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="soft-glow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="water-clip">
          <rect x="0" y="300" width="1200" height="100" />
        </clipPath>
      </defs>

      {/* Atmospheric background */}
      <rect width="1200" height="400" fill="url(#sky-grad)" data-fade />

      {/* ====== BACK LAYER — distant buildings ====== */}
      <g data-fade opacity="0.5">
        <rect x="40" y="230" width="30" height="70" rx="1" fill="url(#building-grad)" />
        <rect x="80" y="245" width="25" height="55" rx="1" fill="url(#building-grad)" />
        <rect x="350" y="240" width="20" height="60" rx="1" fill="url(#building-grad)" />
        <rect x="380" y="235" width="28" height="65" rx="1" fill="url(#building-grad)" />
        <rect x="950" y="235" width="22" height="65" rx="1" fill="url(#building-grad)" />
        <rect x="980" y="242" width="18" height="58" rx="1" fill="url(#building-grad)" />
        <rect x="1050" y="238" width="24" height="62" rx="1" fill="url(#building-grad)" />
        <rect x="1090" y="248" width="20" height="52" rx="1" fill="url(#building-grad)" />
      </g>

      {/* ====== MID LAYER — main landmarks ====== */}

      {/* Galata Tower */}
      <g>
        <path
          data-draw
          d="M155 300 L155 180 L142 180 L142 155 L148 155 L148 100 L150 80 L152 70 L155 65 L158 70 L160 80 L162 100 L162 155 L168 155 L168 180 L155 180"
          stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7"
        />
        <path data-fade d="M148 155 L148 100 L150 80 L155 65 L160 80 L162 100 L162 155 Z" fill="url(#tower-grad)" />
        <path data-fade d="M142 180 L142 155 L168 155 L168 180 Z" fill="url(#building-dark)" />
        <path data-fade d="M145 300 L145 180 L165 180 L165 300 Z" fill="url(#building-grad)" />
        {/* Tower windows */}
        <line data-draw x1="148" y1="165" x2="162" y2="165" stroke="var(--cyan)" strokeWidth="0.5" strokeOpacity="0.5" />
        <line data-draw x1="148" y1="170" x2="162" y2="170" stroke="var(--cyan)" strokeWidth="0.5" strokeOpacity="0.5" />
        <line data-draw x1="148" y1="175" x2="162" y2="175" stroke="var(--cyan)" strokeWidth="0.5" strokeOpacity="0.5" />
        {/* Tower observation deck arches */}
        <path data-draw d="M145 155 Q149 148 153 155" stroke="var(--primary)" strokeWidth="0.8" strokeOpacity="0.6" />
        <path data-draw d="M153 155 Q157 148 161 155" stroke="var(--primary)" strokeWidth="0.8" strokeOpacity="0.6" />
        {/* Window glow */}
        <rect data-fade x="150" y="162" width="3" height="3" rx="0.5" fill="var(--amber)" opacity="0.5" />
        <rect data-fade x="156" y="168" width="3" height="3" rx="0.5" fill="var(--amber)" opacity="0.4" />
      </g>

      {/* Süleymaniye Mosque complex */}
      <g>
        {/* Base structure */}
        <path
          data-draw
          d="M250 300 L250 210 L265 210 L265 140 L268 95 L270 140 L275 210 L330 210 Q330 160 380 140 Q430 160 430 210 L485 210 L488 140 L490 95 L492 140 L495 210 L510 210 L510 300"
          stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6"
        />
        {/* Main dome */}
        <path
          data-draw
          d="M300 210 Q300 150 380 120 Q460 150 460 210"
          stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7"
        />
        {/* Dome fill gradient */}
        <path data-fade d="M300 210 Q300 150 380 120 Q460 150 460 210 Z" fill="url(#mosque-dome)" />
        {/* Secondary domes */}
        <path data-draw d="M290 210 Q290 180 320 170 Q350 180 350 210" stroke="var(--cyan)" strokeWidth="1" strokeOpacity="0.5" />
        <path data-draw d="M410 210 Q410 180 440 170 Q470 180 470 210" stroke="var(--cyan)" strokeWidth="1" strokeOpacity="0.5" />
        {/* Dome crescent */}
        <circle data-draw cx="380" cy="115" r="4" stroke="var(--amber)" strokeWidth="1.2" fill="none" opacity="0.7" />
        <path data-draw d="M380 108 L380 102" stroke="var(--amber)" strokeWidth="1" opacity="0.7" />
        {/* Minaret details */}
        <circle data-draw cx="268" cy="90" r="2" stroke="var(--amber)" strokeWidth="0.8" fill="none" opacity="0.6" />
        <circle data-draw cx="490" cy="90" r="2" stroke="var(--amber)" strokeWidth="0.8" fill="none" opacity="0.6" />
        {/* Building body fill */}
        <path data-fade d="M260 300 L260 210 L500 210 L500 300 Z" fill="url(#building-grad)" />
        {/* Windows on mosque body */}
        <g data-fade opacity="0.5">
          <rect x="310" y="230" width="8" height="14" rx="4" fill="none" stroke="var(--cyan)" strokeWidth="0.6" />
          <rect x="330" y="230" width="8" height="14" rx="4" fill="none" stroke="var(--cyan)" strokeWidth="0.6" />
          <rect x="350" y="230" width="8" height="14" rx="4" fill="none" stroke="var(--cyan)" strokeWidth="0.6" />
          <rect x="400" y="230" width="8" height="14" rx="4" fill="none" stroke="var(--cyan)" strokeWidth="0.6" />
          <rect x="420" y="230" width="8" height="14" rx="4" fill="none" stroke="var(--cyan)" strokeWidth="0.6" />
          <rect x="440" y="230" width="8" height="14" rx="4" fill="none" stroke="var(--cyan)" strokeWidth="0.6" />
        </g>
        {/* Interior glow through windows */}
        <g data-fade>
          <rect x="312" y="233" width="4" height="8" rx="2" fill="var(--amber)" opacity="0.25" />
          <rect x="352" y="233" width="4" height="8" rx="2" fill="var(--amber)" opacity="0.20" />
          <rect x="422" y="233" width="4" height="8" rx="2" fill="var(--amber)" opacity="0.25" />
        </g>
      </g>

      {/* Bosphorus Bridge */}
      <g>
        {/* Tower pylons */}
        <path data-draw d="M560 300 L560 160 L566 155 L572 160 L572 300" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7" />
        <path data-draw d="M808 300 L808 160 L814 155 L820 160 L820 300" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7" />
        {/* Pylon fills */}
        <path data-fade d="M560 300 L560 160 L572 160 L572 300 Z" fill="url(#building-dark)" />
        <path data-fade d="M808 300 L808 160 L820 160 L820 300 Z" fill="url(#building-dark)" />
        {/* Main suspension cables */}
        <path data-draw d="M566 155 Q690 230 814 155" stroke="var(--cyan)" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.7" />
        <path data-draw d="M566 155 Q690 215 814 155" stroke="var(--cyan)" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.4" />
        {/* Vertical cable hangers */}
        {[600, 625, 650, 675, 700, 725, 750, 775].map((x) => (
          <line key={x} data-draw x1={x} y1={260} x2={x} y2={155 + Math.sin(((x - 566) / 248) * Math.PI) * 75} stroke="var(--cyan)" strokeWidth="0.5" strokeOpacity="0.3" />
        ))}
        {/* Bridge deck */}
        <path data-draw d="M540 258 L840 258" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6" />
        <path data-draw d="M540 264 L840 264" stroke="var(--primary)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.25" />
        {/* Deck fill */}
        <path data-fade d="M540 256 L840 256 L840 266 L540 266 Z" fill="url(#bridge-grad)" />
        {/* Pylon crossbars */}
        <line data-draw x1="560" y1="200" x2="572" y2="200" stroke="var(--primary)" strokeWidth="1" strokeOpacity="0.5" />
        <line data-draw x1="808" y1="200" x2="820" y2="200" stroke="var(--primary)" strokeWidth="1" strokeOpacity="0.5" />
        {/* Bridge lights */}
        <g data-fade>
          {[580, 620, 660, 700, 740, 780, 820].map((x) => (
            <circle key={x} cx={x} cy="256" r="1.5" fill="var(--amber)" opacity="0.5" />
          ))}
        </g>
      </g>

      {/* Maiden's Tower (Kız Kulesi) */}
      <g>
        <path
          data-draw
          d="M890 300 L890 268 L878 268 L878 235 L884 235 Q894 210 904 235 L910 235 L910 268 L898 268 L898 300"
          stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7"
        />
        <path data-fade d="M878 235 Q884 210 894 210 Q904 210 910 235 Z" fill="url(#dome-grad)" />
        <path data-fade d="M878 268 L878 235 L910 235 L910 268 Z" fill="url(#building-dark)" />
        <path data-fade d="M885 300 L885 268 L903 268 L903 300 Z" fill="url(#building-grad)" />
        {/* Spire */}
        <path data-draw d="M894 210 L894 195 L892 192 L894 186 L896 192 L894 195" stroke="var(--amber)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7" />
        {/* Windows */}
        <rect data-draw x="886" y="245" width="6" height="8" rx="3" fill="none" stroke="var(--cyan)" strokeWidth="0.6" strokeOpacity="0.6" />
        <rect data-draw x="896" y="245" width="6" height="8" rx="3" fill="none" stroke="var(--cyan)" strokeWidth="0.6" strokeOpacity="0.6" />
        {/* Water platform */}
        <ellipse data-draw cx="894" cy="300" rx="30" ry="6" fill="none" stroke="var(--cyan)" strokeWidth="0.8" strokeOpacity="0.3" />
        {/* Lighthouse glow */}
        <circle data-fade cx="894" cy="186" r="3" fill="var(--amber)" opacity="0.5" filter="url(#glow)" />
      </g>

      {/* Modern skyscrapers — Levent/Maslak district */}
      <g>
        {/* Tallest tower - Sapphire */}
        <path data-draw d="M1010 300 L1010 90 L1014 80 L1018 72 L1022 80 L1026 90 L1026 300" stroke="var(--cyan)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7" />
        <path data-fade d="M1010 300 L1010 90 L1026 90 L1026 300 Z" fill="url(#skyscraper-grad)" />
        {/* Window strips with glow */}
        <g data-fade opacity="0.4">
          {[120, 150, 180, 210, 240, 270].map((y) => (
            <line key={y} x1="1012" y1={y} x2="1024" y2={y} stroke="var(--cyan)" strokeWidth="0.7" />
          ))}
        </g>
        {/* Lit windows */}
        <g data-fade>
          <rect x="1013" y="135" width="3" height="3" rx="0.5" fill="var(--amber)" opacity="0.45" />
          <rect x="1019" y="165" width="3" height="3" rx="0.5" fill="var(--amber)" opacity="0.35" />
          <rect x="1013" y="195" width="3" height="3" rx="0.5" fill="var(--amber)" opacity="0.40" />
          <rect x="1019" y="225" width="3" height="3" rx="0.5" fill="var(--amber)" opacity="0.30" />
        </g>

        {/* Medium tower */}
        <path data-draw d="M1040 300 L1040 140 L1060 140 L1060 300" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" />
        <path data-fade d="M1040 300 L1040 140 L1060 140 L1060 300 Z" fill="url(#building-dark)" />
        <path data-draw d="M1040 135 L1050 128 L1060 135" stroke="var(--cyan)" strokeWidth="1" strokeOpacity="0.5" />
        {/* Lit windows */}
        <g data-fade>
          <rect x="1045" y="155" width="3" height="3" rx="0.5" fill="var(--amber)" opacity="0.35" />
          <rect x="1051" y="185" width="3" height="3" rx="0.5" fill="var(--amber)" opacity="0.30" />
        </g>

        {/* Short wide tower */}
        <path data-draw d="M1072 300 L1072 170 L1098 170 L1098 300" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" />
        <path data-fade d="M1072 300 L1072 170 L1098 170 L1098 300 Z" fill="url(#building-grad)" />

        {/* Slim tower */}
        <path data-draw d="M1110 300 L1110 110 L1116 100 L1122 110 L1122 300" stroke="var(--cyan)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7" />
        <path data-fade d="M1110 300 L1110 110 L1122 110 L1122 300 Z" fill="url(#skyscraper-grad)" />

        {/* Antenna light on tallest */}
        <circle data-fade cx="1018" cy="72" r="3" fill="var(--risk)" opacity="0.7" filter="url(#glow)" />
        {/* Secondary antenna light */}
        <circle data-fade cx="1116" cy="100" r="2" fill="var(--risk)" opacity="0.5" filter="url(#glow)" />
      </g>

      {/* Small residential buildings — left side */}
      <g data-fade>
        <rect x="20" y="265" width="40" height="35" rx="2" fill="url(#building-grad)" stroke="var(--primary)" strokeWidth="0.8" strokeOpacity="0.3" />
        <rect x="70" y="275" width="35" height="25" rx="2" fill="url(#building-grad)" stroke="var(--primary)" strokeWidth="0.8" strokeOpacity="0.3" />
        <rect x="115" y="270" width="25" height="30" rx="2" fill="url(#building-grad)" stroke="var(--primary)" strokeWidth="0.8" strokeOpacity="0.2" />
        <path d="M30 265 Q40 258 50 265" fill="url(#dome-grad)" stroke="var(--cyan)" strokeWidth="0.5" strokeOpacity="0.3" />
      </g>

      {/* Trees / vegetation silhouettes */}
      <g data-fade opacity="0.2">
        <circle cx="200" cy="290" r="12" fill="var(--positive)" opacity="0.4" />
        <circle cx="215" cy="285" r="10" fill="var(--positive)" opacity="0.35" />
        <circle cx="225" cy="292" r="8" fill="var(--positive)" opacity="0.3" />
        <circle cx="530" cy="288" r="10" fill="var(--positive)" opacity="0.35" />
        <circle cx="545" cy="292" r="8" fill="var(--positive)" opacity="0.3" />
        <circle cx="840" cy="290" r="9" fill="var(--positive)" opacity="0.3" />
        <circle cx="855" cy="286" r="11" fill="var(--positive)" opacity="0.35" />
      </g>

      {/* ====== WATER LINE & REFLECTIONS ====== */}
      <path
        data-draw
        d="M0 300 Q60 296 120 300 Q180 304 240 300 Q320 296 400 300 Q480 304 560 300 Q640 296 720 300 Q800 304 880 300 Q960 296 1040 300 Q1120 304 1200 300"
        stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5"
      />

      {/* Water surface */}
      <path data-fade
        d="M0 300 Q60 296 120 300 Q180 304 240 300 Q320 296 400 300 Q480 304 560 300 Q640 296 720 300 Q800 304 880 300 Q960 296 1040 300 Q1120 304 1200 300 L1200 400 L0 400 Z"
        fill="url(#water-grad)"
      />

      {/* Reflections — mirrored and faded */}
      <g clipPath="url(#water-clip)" opacity="0.2" data-fade>
        <g transform="translate(0, 600) scale(1, -1)">
          <path d="M145 300 L145 180 L165 180 L165 300 Z" fill="var(--primary)" opacity="0.5" />
          <path d="M260 300 L260 210 L500 210 L500 300 Z" fill="var(--cyan)" opacity="0.3" />
          <rect x="558" y="256" width="16" height="44" fill="var(--primary)" opacity="0.4" />
          <rect x="806" y="256" width="16" height="44" fill="var(--primary)" opacity="0.4" />
          <rect x="1008" y="250" width="20" height="50" fill="var(--cyan)" opacity="0.4" />
          <rect x="1038" y="260" width="24" height="40" fill="var(--primary)" opacity="0.3" />
          <rect x="1108" y="255" width="16" height="45" fill="var(--cyan)" opacity="0.4" />
        </g>
      </g>

      {/* Shimmering water ripples */}
      <g data-fade opacity="0.12">
        <line x1="100" y1="320" x2="160" y2="320" stroke="var(--cyan)" strokeWidth="0.8" />
        <line x1="300" y1="330" x2="380" y2="330" stroke="var(--primary)" strokeWidth="0.6" />
        <line x1="500" y1="315" x2="560" y2="315" stroke="var(--cyan)" strokeWidth="0.8" />
        <line x1="650" y1="325" x2="730" y2="325" stroke="var(--primary)" strokeWidth="0.6" />
        <line x1="850" y1="318" x2="920" y2="318" stroke="var(--cyan)" strokeWidth="0.8" />
        <line x1="1000" y1="335" x2="1080" y2="335" stroke="var(--primary)" strokeWidth="0.6" />
      </g>

      {/* Atmospheric haze — edges fade into background */}
      <rect x="0" y="0" width="150" height="400" fill="url(#haze-left)" data-fade />
      <rect x="1050" y="0" width="150" height="400" fill="url(#haze-right)" data-fade />

      {/* Subtle light rays from the sky */}
      <g data-fade opacity="0.04">
        <polygon points="500,0 520,300 480,300" fill="var(--primary)" />
        <polygon points="700,0 715,300 685,300" fill="var(--cyan)" />
        <polygon points="400,0 412,300 388,300" fill="var(--primary)" />
      </g>
    </svg>
  );
}
