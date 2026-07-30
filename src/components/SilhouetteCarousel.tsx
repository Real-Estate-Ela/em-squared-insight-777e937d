export function SilhouetteCarousel({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none select-none ${className ?? ""}`}
      aria-hidden="true"
      style={{ position: "relative" }}
    >
      {/* 1. Arsa (Land) — boundary stakes and plot outline */}
      <svg
        viewBox="0 0 800 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          animation: "em-silhouette-cycle 20s ease-in-out infinite",
        }}
      >
        {/* Ground line */}
        <path
          d="M60 240 L740 240"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeOpacity="0.08"
        />
        {/* Plot boundary — dashed */}
        <path
          d="M140 240 L140 160 L660 160 L660 240"
          stroke="var(--primary)"
          strokeWidth="1.5"
          strokeOpacity="0.07"
          strokeDasharray="8 6"
        />
        <path
          d="M140 160 L660 160"
          stroke="var(--primary)"
          strokeWidth="1.5"
          strokeOpacity="0.07"
          strokeDasharray="8 6"
        />
        {/* Corner stakes */}
        {[140, 660].map((x) => (
          <g key={x}>
            <line
              x1={x}
              y1={240}
              x2={x}
              y2={145}
              stroke="var(--primary)"
              strokeWidth="2"
              strokeOpacity="0.08"
            />
            <polygon
              points={`${x - 6},145 ${x + 6},145 ${x},135`}
              fill="var(--primary)"
              fillOpacity="0.07"
            />
          </g>
        ))}
        {/* Mid stakes */}
        {[280, 400, 520].map((x) => (
          <line
            key={x}
            x1={x}
            y1={240}
            x2={x}
            y2={155}
            stroke="var(--primary)"
            strokeWidth="1.2"
            strokeOpacity="0.06"
          />
        ))}
        {/* Dimension arrows */}
        <path
          d="M160 270 L640 270"
          stroke="var(--primary)"
          strokeWidth="1"
          strokeOpacity="0.06"
          markerEnd="url(#arrow)"
          markerStart="url(#arrow-rev)"
        />
        {/* Terrain texture lines */}
        <path
          d="M180 230 Q220 225 260 230 Q300 235 340 228 Q380 222 420 230 Q460 236 500 228 Q540 222 580 230 Q620 236 640 230"
          stroke="var(--primary)"
          strokeWidth="0.8"
          strokeOpacity="0.05"
        />
        <path
          d="M200 220 Q240 215 280 220 Q340 225 400 218 Q460 212 520 220 Q560 226 620 218"
          stroke="var(--primary)"
          strokeWidth="0.6"
          strokeOpacity="0.04"
        />
      </svg>

      {/* 2. Konut (Residential) — house/apartment silhouette */}
      <svg
        viewBox="0 0 800 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          animation: "em-silhouette-cycle-2 20s ease-in-out infinite",
        }}
      >
        {/* Ground */}
        <path
          d="M60 250 L740 250"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeOpacity="0.08"
        />
        {/* Main building body */}
        <path
          d="M200 250 L200 120 L440 120 L440 250"
          fill="var(--primary)"
          fillOpacity="0.06"
          stroke="var(--primary)"
          strokeWidth="1.5"
          strokeOpacity="0.08"
        />
        {/* Roof */}
        <path
          d="M180 120 L320 60 L460 120"
          fill="var(--primary)"
          fillOpacity="0.05"
          stroke="var(--primary)"
          strokeWidth="1.5"
          strokeOpacity="0.08"
        />
        {/* Chimney */}
        <path
          d="M380 100 L380 70 L400 70 L400 95"
          stroke="var(--primary)"
          strokeWidth="1.5"
          strokeOpacity="0.07"
        />
        {/* Windows — row 1 */}
        {[230, 280, 350, 400].map((x) => (
          <rect
            key={`w1-${x}`}
            x={x}
            y={140}
            width={25}
            height={30}
            rx={2}
            fill="var(--primary)"
            fillOpacity="0.04"
            stroke="var(--primary)"
            strokeWidth="1"
            strokeOpacity="0.07"
          />
        ))}
        {/* Windows — row 2 */}
        {[230, 280, 350, 400].map((x) => (
          <rect
            key={`w2-${x}`}
            x={x}
            y={190}
            width={25}
            height={30}
            rx={2}
            fill="var(--primary)"
            fillOpacity="0.04"
            stroke="var(--primary)"
            strokeWidth="1"
            strokeOpacity="0.07"
          />
        ))}
        {/* Door */}
        <rect
          x={305}
          y={210}
          width={30}
          height={40}
          rx={2}
          fill="var(--primary)"
          fillOpacity="0.05"
          stroke="var(--primary)"
          strokeWidth="1"
          strokeOpacity="0.08"
        />
        {/* Side wing */}
        <path
          d="M440 250 L440 160 L560 160 L560 250"
          fill="var(--primary)"
          fillOpacity="0.05"
          stroke="var(--primary)"
          strokeWidth="1.2"
          strokeOpacity="0.07"
        />
        <path
          d="M440 160 L500 130 L560 160"
          fill="var(--primary)"
          fillOpacity="0.04"
          stroke="var(--primary)"
          strokeWidth="1.2"
          strokeOpacity="0.07"
        />
        {/* Side windows */}
        {[470, 520].map((x) => (
          <rect
            key={`sw-${x}`}
            x={x}
            y={180}
            width={20}
            height={25}
            rx={2}
            fill="var(--primary)"
            fillOpacity="0.03"
            stroke="var(--primary)"
            strokeWidth="0.8"
            strokeOpacity="0.06"
          />
        ))}
      </svg>

      {/* 3. Dukkan (Shop) — storefront with awning */}
      <svg
        viewBox="0 0 800 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          animation: "em-silhouette-cycle-3 20s ease-in-out infinite",
        }}
      >
        {/* Ground */}
        <path
          d="M60 250 L740 250"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeOpacity="0.08"
        />
        {/* Building body */}
        <path
          d="M180 250 L180 100 L620 100 L620 250"
          fill="var(--primary)"
          fillOpacity="0.05"
          stroke="var(--primary)"
          strokeWidth="1.5"
          strokeOpacity="0.08"
        />
        {/* Parapet / roofline */}
        <path
          d="M170 100 L630 100 L630 90 L170 90 Z"
          fill="var(--primary)"
          fillOpacity="0.06"
          stroke="var(--primary)"
          strokeWidth="1"
          strokeOpacity="0.07"
        />
        {/* Signboard area */}
        <rect
          x={200}
          y={110}
          width={400}
          height={35}
          rx={3}
          fill="var(--primary)"
          fillOpacity="0.04"
          stroke="var(--primary)"
          strokeWidth="1"
          strokeOpacity="0.07"
        />
        {/* Awning */}
        <path
          d="M190 155 L610 155 L630 175 L170 175 Z"
          fill="var(--primary)"
          fillOpacity="0.07"
          stroke="var(--primary)"
          strokeWidth="1.2"
          strokeOpacity="0.08"
        />
        {/* Awning scallops */}
        <path
          d="M170 175 Q210 185 250 175 Q290 185 330 175 Q370 185 410 175 Q450 185 490 175 Q530 185 570 175 Q610 185 630 175"
          stroke="var(--primary)"
          strokeWidth="1"
          strokeOpacity="0.07"
          fill="none"
        />
        {/* Large shop windows */}
        <rect
          x={200}
          y={185}
          width={160}
          height={55}
          rx={2}
          fill="var(--primary)"
          fillOpacity="0.03"
          stroke="var(--primary)"
          strokeWidth="1.2"
          strokeOpacity="0.07"
        />
        <rect
          x={440}
          y={185}
          width={160}
          height={55}
          rx={2}
          fill="var(--primary)"
          fillOpacity="0.03"
          stroke="var(--primary)"
          strokeWidth="1.2"
          strokeOpacity="0.07"
        />
        {/* Shop door */}
        <rect
          x={375}
          y={190}
          width={50}
          height={60}
          rx={2}
          fill="var(--primary)"
          fillOpacity="0.05"
          stroke="var(--primary)"
          strokeWidth="1.2"
          strokeOpacity="0.08"
        />
        {/* Door handle */}
        <circle
          cx={415}
          cy={220}
          r={3}
          stroke="var(--primary)"
          strokeWidth="1"
          strokeOpacity="0.06"
        />
        {/* Window dividers */}
        <line
          x1={280}
          y1={185}
          x2={280}
          y2={240}
          stroke="var(--primary)"
          strokeWidth="0.8"
          strokeOpacity="0.06"
        />
        <line
          x1={520}
          y1={185}
          x2={520}
          y2={240}
          stroke="var(--primary)"
          strokeWidth="0.8"
          strokeOpacity="0.06"
        />
        {/* Upper floor windows */}
        {[220, 300, 480, 560].map((x) => (
          <rect
            key={`uw-${x}`}
            x={x}
            y={110}
            width={20}
            height={25}
            rx={2}
            fill="var(--primary)"
            fillOpacity="0.03"
            stroke="var(--primary)"
            strokeWidth="0.6"
            strokeOpacity="0.05"
          />
        ))}
      </svg>

      {/* 4. Bina (Building) — modern office tower */}
      <svg
        viewBox="0 0 800 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          animation: "em-silhouette-cycle-4 20s ease-in-out infinite",
        }}
      >
        {/* Ground */}
        <path
          d="M60 260 L740 260"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeOpacity="0.08"
        />
        {/* Main tower */}
        <path
          d="M300 260 L300 40 L500 40 L500 260"
          fill="var(--primary)"
          fillOpacity="0.06"
          stroke="var(--primary)"
          strokeWidth="1.5"
          strokeOpacity="0.08"
        />
        {/* Crown / top detail */}
        <path
          d="M310 40 L310 28 L490 28 L490 40"
          fill="var(--primary)"
          fillOpacity="0.07"
          stroke="var(--primary)"
          strokeWidth="1"
          strokeOpacity="0.08"
        />
        {/* Antenna spire */}
        <line
          x1={400}
          y1={28}
          x2={400}
          y2={8}
          stroke="var(--primary)"
          strokeWidth="1.5"
          strokeOpacity="0.08"
        />
        {/* Window grid — horizontal bands */}
        {[60, 85, 110, 135, 160, 185, 210, 235].map((y) => (
          <line
            key={`h-${y}`}
            x1={305}
            y1={y}
            x2={495}
            y2={y}
            stroke="var(--primary)"
            strokeWidth="0.6"
            strokeOpacity="0.05"
          />
        ))}
        {/* Window grid — vertical mullions */}
        {[330, 360, 400, 440, 470].map((x) => (
          <line
            key={`v-${x}`}
            x1={x}
            y1={42}
            x2={x}
            y2={255}
            stroke="var(--primary)"
            strokeWidth="0.5"
            strokeOpacity="0.04"
          />
        ))}
        {/* Side podium left */}
        <path
          d="M220 260 L220 180 L300 180 L300 260"
          fill="var(--primary)"
          fillOpacity="0.04"
          stroke="var(--primary)"
          strokeWidth="1.2"
          strokeOpacity="0.07"
        />
        {/* Side podium right */}
        <path
          d="M500 260 L500 180 L580 180 L580 260"
          fill="var(--primary)"
          fillOpacity="0.04"
          stroke="var(--primary)"
          strokeWidth="1.2"
          strokeOpacity="0.07"
        />
        {/* Podium windows */}
        {[235, 255, 515, 535, 555].map((x) => (
          <rect
            key={`pw-${x}`}
            x={x}
            y={200}
            width={15}
            height={20}
            rx={1}
            fill="var(--primary)"
            fillOpacity="0.03"
            stroke="var(--primary)"
            strokeWidth="0.6"
            strokeOpacity="0.05"
          />
        ))}
        {/* Entrance canopy */}
        <path
          d="M350 255 L350 248 L450 248 L450 255"
          fill="var(--primary)"
          fillOpacity="0.05"
          stroke="var(--primary)"
          strokeWidth="1"
          strokeOpacity="0.07"
        />
        {/* Entrance doors */}
        <rect
          x={370}
          y={238}
          width={25}
          height={22}
          rx={1}
          fill="var(--primary)"
          fillOpacity="0.04"
          stroke="var(--primary)"
          strokeWidth="0.8"
          strokeOpacity="0.06"
        />
        <rect
          x={405}
          y={238}
          width={25}
          height={22}
          rx={1}
          fill="var(--primary)"
          fillOpacity="0.04"
          stroke="var(--primary)"
          strokeWidth="0.8"
          strokeOpacity="0.06"
        />
      </svg>
    </div>
  );
}
