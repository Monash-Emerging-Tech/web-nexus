"use client";

import React from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";
import type { PerformanceConfig } from "./usePerformanceTier";

interface CameraHandlerProps {
  perf: PerformanceConfig;
}

const CameraHandler: React.FC<CameraHandlerProps> = ({ perf }) => {
  const scroll = useScroll();

  useFrame((state, delta) => {
    const scrollOffset = scroll.offset;
    const dt = Math.min(delta, 0.05);
    
    // Warp Intensity: Start immediately, peak fast, fade out at the very end
    const warpIntensity = Math.sin(Math.pow(scrollOffset, 0.5) * Math.PI); 
    
    // FOV stretches immediately during the warp
    const targetFov = 40 + warpIntensity * 60; 
    const camera = state.camera as THREE.PerspectiveCamera;
    const prevFov = camera.fov;
    camera.fov = THREE.MathUtils.damp(prevFov, targetFov, 6, dt);
    if (Math.abs(camera.fov - prevFov) > 0.01) {
      camera.updateProjectionMatrix();
    }

    // Map Angle
    const mapAngle = -Math.PI / 2.5;

    // Perpendicular Movement Vector (The Normal)
    const ny = -Math.sin(mapAngle); // positive
    const nz = Math.cos(mapAngle);  // positive
    
    // Move along the normal
    const distance = THREE.MathUtils.lerp(20, 120, scrollOffset);
    const targetCamX = 0;
    const targetCamY = ny * distance - 5; // offset to stay centered
    const targetCamZ = nz * distance;
    
    // Coherent shake during the early warp only. The previous per-frame
    // random offsets made the arriving cube visibly judder even when its own
    // transform was smooth.
    let shakeX = 0, shakeY = 0, shakeZ = 0;
    if (perf.cameraShake) {
      const cubeApproachFade = 1 - THREE.MathUtils.smoothstep(scrollOffset, 0.34, 0.68);
      const shake = warpIntensity * cubeApproachFade * 0.1;
      const time = state.clock.elapsedTime;
      shakeX = Math.sin(time * 7.1) * shake * 0.55;
      shakeY = Math.sin(time * 5.3 + 1.2) * shake * 0.4;
      shakeZ = Math.sin(time * 6.2 + 2.4) * shake * 0.3;
    }
    
    state.camera.position.set(targetCamX + shakeX, targetCamY + shakeY, targetCamZ + shakeZ);
    const targetLookAtY = ny * 80 * scrollOffset;
    const targetLookAtZ = nz * 80 * scrollOffset;
    state.camera.lookAt(0, targetLookAtY, targetLookAtZ);
  });

  return null;
};

export default CameraHandler;
