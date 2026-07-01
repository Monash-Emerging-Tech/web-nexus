"use client";

import { useEffect, useRef } from "react";
import { StarfieldInstance } from "./types";
import { initializeStarColors, startSparkleEffect } from "./effects";
import { usePerformanceTier } from "../ContourMap/usePerformanceTier";

export function Starfield() {
  const containerRef = useRef<HTMLDivElement>(null);
  const perf = usePerformanceTier();

  useEffect(() => {
    if (perf.tier === "low") return;

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

        (window as any).updateStarfield = (
          opacity: number,
          zoomOut: number,
        ) => {
          if (container) container.style.opacity = opacity.toString();
          bg.three.camera.position.set(0, 0, zoomOut);
        };

        destroyStarfield = () => {
          if (sparkleInterval) clearInterval(sparkleInterval);
          bg.destroy?.();
          delete (window as any).updateStarfield;
        };
      })
      .catch(() => {});

    return () => {
      mounted = false;
      destroyStarfield?.();
    };
  }, []);

  if (perf.tier === "low") {
    return (
      <div
        id="starfield-bg"
        className="absolute inset-0 z-0 bg-[#050505] pointer-events-none"
      />
    );
  }

  return (
    <div
      id="starfield-bg"
      ref={containerRef}
      className="absolute inset-0 z-0 bg-black pointer-events-none brightness-200"
      style={{ opacity: 0 }}
    />
  );
}
