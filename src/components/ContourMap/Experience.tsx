"use client";

import React from "react";
import SpeedLines from "./SpeedLines";
import Terrain from "./Terrain";
import Planet from "./Planet";
import CameraHandler from "./CameraHandler";
import MemoryFlashbacks from "./MemoryFlashbacks";
import type { PerformanceConfig } from "./usePerformanceTier";

interface ExperienceProps {
  overlayRef: React.RefObject<HTMLDivElement | null>;
  perf: PerformanceConfig;
  flashbackUrls?: string[];
}

const Experience: React.FC<ExperienceProps> = ({ overlayRef, perf, flashbackUrls = [] }) => {
  return (
    <>
      <CameraHandler perf={perf} />
      <SpeedLines count={perf.speedLineCount} />
      
      {/* Light that follows the camera's view */}
      <directionalLight position={[0, 0, 1]} intensity={1.5} />
      
      <Terrain perf={perf} />
      <MemoryFlashbacks flashbackUrls={flashbackUrls} />
      <Planet overlayRef={overlayRef} />
    </>
  );
};

export default Experience;
