"use client";

import React from "react";
import SpeedLines from "./SpeedLines";
import Terrain from "./Terrain";
import Planet from "./Planet";
import CameraHandler from "./CameraHandler";
import type { PerformanceConfig } from "./usePerformanceTier";

interface ExperienceProps {
  overlayRef: React.RefObject<HTMLDivElement | null>;
  perf: PerformanceConfig;
}

const Experience: React.FC<ExperienceProps> = ({ overlayRef, perf }) => {
  return (
    <>
      <CameraHandler perf={perf} />
      <SpeedLines count={perf.speedLineCount} />
      
      {/* Light that follows the camera's view */}
      <directionalLight position={[0, 0, 1]} intensity={1.5} />
      
      <Terrain perf={perf} />
      <Planet overlayRef={overlayRef} />
    </>
  );
};

export default Experience;
