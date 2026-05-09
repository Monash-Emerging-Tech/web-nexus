"use client";

import React, { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll, Float } from "@react-three/drei";
import * as THREE from "three";
import MnetCube from "../MnetCube";
import SpeedLines from "./SpeedLines";
import { vertexShader, fragmentShader } from "./Shaders";
import type { PerformanceConfig } from "./usePerformanceTier";

interface ExperienceProps {
  overlayRef: React.RefObject<HTMLDivElement | null>;
  perf: PerformanceConfig;
}

const Experience: React.FC<ExperienceProps> = ({ overlayRef, perf }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const planetRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const { size } = useThree();
  
  const uniforms = useMemo(
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
    
    // Update uniforms via ref for maximum reliability
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uScroll.value = scrollOffset;
      materialRef.current.uniforms.uContourFrequency.value = perf.contourFrequency;
      
      const targetMouseX = (state.mouse.x + 1.0) * 0.5;
      const targetMouseY = (state.mouse.y + 1.0) * 0.5;
      materialRef.current.uniforms.uMouse.value.x += (targetMouseX - materialRef.current.uniforms.uMouse.value.x) * perf.lerpFactor;
      materialRef.current.uniforms.uMouse.value.y += (targetMouseY - materialRef.current.uniforms.uMouse.value.y) * perf.lerpFactor;
    }
    
    // Warp Intensity: Start immediately, peak fast, fade out at the very end
    const warpIntensity = Math.sin(Math.pow(scrollOffset, 0.5) * Math.PI); 
    
    // FOV stretches immediately during the warp
    const targetFov = 40 + warpIntensity * 60; 
    (state.camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp((state.camera as THREE.PerspectiveCamera).fov, targetFov, 0.15);
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
    state.camera.lookAt(0, 0, 0);

    // Terrain parallax, tilt, and positioning
    if (meshRef.current) {
      const targetRotationX = mapAngle - state.mouse.y * 0.1;
      const targetRotationY = state.mouse.x * 0.1;
      meshRef.current.rotation.x += (targetRotationX - meshRef.current.rotation.x) * 0.05;
      meshRef.current.rotation.y += (targetRotationY - meshRef.current.rotation.y) * 0.05;
      
      // Initially move down for parallax, but bring it back to origin as it becomes a sphere
      // so the camera (which flies away and looks at origin) sees it perfectly centered.
      const parallaxY = -1.5 - scrollOffset * 60;
      // 0.5 pages out of 4 total pages = 0.125 scroll range
      const warpProgress = smoothstep(0.0, 0.125, scrollOffset);
      meshRef.current.position.y = THREE.MathUtils.lerp(parallaxY, 0.0, warpProgress);

      // Shrink the ball as we zoom out instead of fading
      const shrink = smoothstep(0.8, 0.2, scrollOffset);
      meshRef.current.scale.setScalar(shrink);
    }

    // Planet (MnetCube) logic
    if (planetRef.current) {
      const appearance = smoothstep(0.6, 1.0, scrollOffset);
      planetRef.current.scale.setScalar(appearance * 1.5);
      
      planetRef.current.position.y = ny * 80 * appearance;
      planetRef.current.position.z = nz * 80 * appearance;
      
      planetRef.current.rotation.y += 0.005;
      planetRef.current.rotation.x += 0.003;
    }

    // --- Project cube position to screen for HTML overlay labels ---
    if (planetRef.current && overlayRef.current) {
      // Reuse vectors to avoid GC
      const worldPos = state.camera.userData.worldPos || (state.camera.userData.worldPos = new THREE.Vector3());
      const projected = state.camera.userData.projected || (state.camera.userData.projected = new THREE.Vector3());

      planetRef.current.getWorldPosition(worldPos);
      projected.copy(worldPos).project(state.camera);
      
      const screenX = (projected.x * 0.5 + 0.5) * size.width;
      const screenY = (-projected.y * 0.5 + 0.5) * size.height;
      const cubeScale = planetRef.current.scale.x;

      if (cubeScale > 0.3) {
        overlayRef.current.style.opacity = '1';
        overlayRef.current.style.transform = `translate(${screenX}px, ${screenY}px)`;
      } else {
        overlayRef.current.style.opacity = '0';
      }
    }
  });

  function smoothstep(min: number, max: number, value: number) {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
  }

  return (
    <>
      <SpeedLines count={perf.speedLineCount} />
      
      {/* Light that follows the camera's view */}
      <directionalLight position={[0, 0, 1]} intensity={1.5} />
      
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

      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group ref={planetRef} position={[0, 8, 0]} scale={[0, 0, 0]}>
          <MnetCube />
          {/* Light that travels with the planet */}
          <pointLight intensity={500} distance={50} color="#ffffff" />
          <pointLight position={[2, 2, 2]} intensity={200} color="#0033ff" />
        </group>
      </Float>
    </>
  );
};

export default Experience;
