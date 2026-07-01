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

  useFrame((state) => {
    const scrollOffset = scroll.offset;
    
    // Warp Intensity: Start immediately, peak fast, fade out at the very end
    const warpIntensity = Math.sin(Math.pow(scrollOffset, 0.5) * Math.PI); 
    
    // FOV stretches immediately during the warp
    const targetFov = 40 + warpIntensity * 60; 
    (state.camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp(
      (state.camera as THREE.PerspectiveCamera).fov, 
      targetFov, 
      0.15
    );
    (state.camera as THREE.PerspectiveCamera).updateProjectionMatrix();

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
    
    // Camera shake — skip entirely on low-end devices
    let shakeX = 0, shakeY = 0, shakeZ = 0;
    if (perf.cameraShake) {
      const shake = warpIntensity * 0.2;
      shakeX = (Math.random() - 0.5) * shake;
      shakeY = (Math.random() - 0.5) * shake;
      shakeZ = (Math.random() - 0.5) * shake;
    }
    
    state.camera.position.set(targetCamX + shakeX, targetCamY + shakeY, targetCamZ + shakeZ);
    const targetLookAtY = ny * 80 * scrollOffset;
    const targetLookAtZ = nz * 80 * scrollOffset;
    state.camera.lookAt(0, targetLookAtY, targetLookAtZ);
  });

  return null;
};

export default CameraHandler;
