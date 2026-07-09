"use client";

import { useEffect, useRef } from "react";
import { StarfieldInstance } from "./types";
import { initializeStarColors, startSparkleEffect } from "./effects";
import type { PerformanceConfig } from "../ContourMap/usePerformanceTier";

interface StarfieldProps {
  perf: PerformanceConfig;
}

export function Starfield({ perf }: StarfieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    let destroyStarfield: (() => void) | undefined;
    const container = containerRef.current;

    if (!container) return;

    void import("threejs-toys")
      .then(({ swarmBackground }) => {
        if (!mounted) return;

        const bg = swarmBackground({
          el: container,
          eventsEl: container,
          gpgpuSize: perf.starfieldGpgpuSize,
          geometry: "cube",
        }) as StarfieldInstance;

        bg.three.camera.position.set(0, 0, 100);

        const sceneData = initializeStarColors(bg.three.scene);
        const sparkleInterval = startSparkleEffect(sceneData, perf);

        window.updateStarfield = (
          opacity: number,
          zoomOut: number,
        ) => {
          if (container) container.style.opacity = opacity.toString();
          bg.three.camera.position.set(0, 0, zoomOut);
        };

        destroyStarfield = () => {
          if (sparkleInterval) clearInterval(sparkleInterval);
          bg.destroy?.();
          delete window.updateStarfield;
        };
      })
      .catch(() => {});

    return () => {
      mounted = false;
      destroyStarfield?.();
    };
    // perf is intentionally captured once: it seeds a one-time WebGL scene setup,
    // and re-running this effect would tear down and rebuild the whole starfield.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      id="starfield-bg"
      ref={containerRef}
      className="absolute inset-0 z-0 bg-black pointer-events-none brightness-200"
      style={{ opacity: 0 }}
    />
  );
}
