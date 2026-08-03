import { useRef, useEffect } from "react";
import { createSection, type FloorData } from "./HeroSection";
import { useI18n } from "@/lib/i18n";

const PRICES = [172400, 164900, 158200, 151600, 146300, 141800, 136500, 128900];

export function HeroSectionCanvas() {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const floors: FloorData[] = t.hero.floorLabels.map((label, i) => ({
      label,
      price: PRICES[i],
      ...(i === 0 && t.hero.floorNoteTop ? { note: t.hero.floorNoteTop } : {}),
      ...(i === PRICES.length - 1 && t.hero.floorNoteBottom ? { note: t.hero.floorNoteBottom } : {}),
    }));

    const section = createSection(canvas, {
      floors,
      unitLabel: t.hero.unitLabel,
      medianLabel: t.hero.medianLabel,
    });

    return () => section.destroy();
  }, [t]);

  return (
    <div className="relative h-[clamp(260px,60vw,340px)] w-full min-[880px]:h-[clamp(320px,38vw,460px)]">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="block h-full w-full"
        style={{ touchAction: "pan-y" }}
      />
      <ul className="sr-only">
        {t.hero.floorLabels.map((label, i) => (
          <li key={label}>
            {label}: {Math.round(PRICES[i]).toLocaleString("tr-TR")} {t.hero.unitLabel}
          </li>
        ))}
      </ul>
    </div>
  );
}
