"use client";

import React, { Suspense } from "react";
import SpeedLines from "./SpeedLines";
import Terrain from "./Terrain";
import Planet from "./Planet";
import CameraHandler from "./CameraHandler";
import MemoryFlashbacks from "./MemoryFlashbacks";
import type { PerformanceConfig } from "./usePerformanceTier";

interface ExperienceProps {
  overlayRef: React.RefObject<HTMLDivElement | null>;
  perf: PerformanceConfig;
  onNavigate: (route: string) => void;
}

const Experience: React.FC<ExperienceProps> = ({ overlayRef, perf, onNavigate }) => {
  return (
    <>
      <CameraHandler perf={perf} />
      <SpeedLines count={perf.speedLineCount} />

      {/* Light that follows the camera's view */}
      <directionalLight position={[0, 0, 1]} intensity={1.5} />

      <Terrain perf={perf} />
      {/* Suspends on the four page textures; the rest of the scene renders
          immediately, so blobs only ever appear with images ready. */}
      <Suspense fallback={null}>
        <MemoryFlashbacks perf={perf} onNavigate={onNavigate} />
      </Suspense>
      <Planet overlayRef={overlayRef} />
    </>
  );
};

export default Experience;
