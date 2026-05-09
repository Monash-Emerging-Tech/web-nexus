"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "./Shaders";
import type { PerformanceConfig } from "./usePerformanceTier";

interface TerrainProps {
  perf: PerformanceConfig;
}

const Terrain: React.FC<TerrainProps> = ({ perf }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const scroll = useScroll();

  const uniforms = React.useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uScroll: { value: 0 },
      uContourFrequency: { value: perf.contourFrequency },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((state) => {
    const scrollOffset = scroll.offset;
    const time = state.clock.elapsedTime;

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uScroll.value = scrollOffset;
      materialRef.current.uniforms.uContourFrequency.value = perf.contourFrequency;

      const targetMouseX = (state.mouse.x + 1.0) * 0.5;
      const targetMouseY = (state.mouse.y + 1.0) * 0.5;
      materialRef.current.uniforms.uMouse.value.x += (targetMouseX - materialRef.current.uniforms.uMouse.value.x) * perf.lerpFactor;
      materialRef.current.uniforms.uMouse.value.y += (targetMouseY - materialRef.current.uniforms.uMouse.value.y) * perf.lerpFactor;
    }

    if (meshRef.current) {
      const mapAngle = -Math.PI / 2.5;
      const targetRotationX = mapAngle - state.mouse.y * 0.1;
      const targetRotationY = state.mouse.x * 0.1;
      meshRef.current.rotation.x += (targetRotationX - meshRef.current.rotation.x) * 0.05;
      meshRef.current.rotation.y += (targetRotationY - meshRef.current.rotation.y) * 0.05;

      const parallaxY = -1.5 - scrollOffset * 60;
      const warpProgress = smoothstep(0.0, 0.125, scrollOffset);
      meshRef.current.position.y = THREE.MathUtils.lerp(parallaxY, 0.0, warpProgress);

      const shrink = smoothstep(0.8, 0.2, scrollOffset);
      meshRef.current.scale.setScalar(shrink);
    }
  });

  function smoothstep(min: number, max: number, value: number) {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
  }

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -1.5, 0]}>
      <planeGeometry args={[40, 40, perf.terrainSegments, perf.terrainSegments]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
};

export default Terrain;
