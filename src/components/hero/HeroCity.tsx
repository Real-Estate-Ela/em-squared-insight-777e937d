import { useEffect, useRef } from "react";
import { mount } from "./emlakmetric-hero.js";

export function HeroCity() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctrl = mount(canvas);
    return () => ctrl.destroy();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        touchAction: "pan-y",
        maxWidth: "100%",
      }}
    />
  );
}
