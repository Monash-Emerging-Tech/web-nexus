"use client";

import React, { Suspense, useRef } from "react";
import SpeedLines from "./SpeedLines";
import Terrain from "./Terrain";
import Planet from "./Planet";
import CameraHandler from "./CameraHandler";
import MemoryFlashbacks from "./MemoryFlashbacks";
import NavBubbles, { type CubeState } from "./NavBubbles";
import CubeForge from "./CubeForge";
import NeonBackdrop from "./NeonBackdrop";
import type { PerformanceConfig } from "./usePerformanceTier";

interface ExperienceProps {
  perf: PerformanceConfig;
  onNavigate: (route: string) => void;
}

const Experience: React.FC<ExperienceProps> = ({ perf, onNavigate }) => {
  // Written by Planet each frame; read by NavBubbles for cube-relative sizing.
  const cubeStateRef = useRef<CubeState>({ scale: 0, worldRadius: 0 });

  return (
    <>
      <CameraHandler perf={perf} />
      {/* Warp "force lines" — the rush streaks during the scroll transition. */}
      <SpeedLines count={perf.speedLineCount} />
      {/* Neon lava-lamp downlight backdrop — glows in for the bottom/cube
          section. */}
      <NeonBackdrop perf={perf} />

      {/* Light that follows the camera's view */}
      <directionalLight position={[0, 0, 1]} intensity={1.5} />

      <Terrain perf={perf} />
      <CubeForge perf={perf} />
      {/* Suspends on the four page textures; the rest of the scene renders
          immediately, so blobs only ever appear with images ready. */}
      <Suspense fallback={null}>
        <MemoryFlashbacks perf={perf} onNavigate={onNavigate} />
        <NavBubbles cubeStateRef={cubeStateRef} perf={perf} onNavigate={onNavigate} />
      </Suspense>
      <Planet cubeStateRef={cubeStateRef} reducedMotion={perf.reducedMotion} />
    </>
  );
};

export default Experience;
