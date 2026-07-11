"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";

const vertexShader = `
  uniform float uTime;
  uniform float uScroll;
  attribute vec3 aInitialPos; // x, y, randomOffsetZ
  attribute float aSpeed;
  varying float vOpacity;

  void main() {
    vec3 pos = position;
    
    // Speed depends on base speed + scroll velocity
    float speedMultiplier = 1.0 + uScroll * 5.0;
    float totalSpeed = aSpeed * speedMultiplier * 8.0;
    
    // Movement along Z
    float z = aInitialPos.z + uTime * totalSpeed;
    
    // Loop between -150 and 50 (Range 200)
    z = mod(z + 150.0, 200.0) - 150.0;
    
    // Offset the instance
    pos.x += aInitialPos.x;
    pos.y += aInitialPos.y;
    pos.z += z;
    
    // Fade in based on scroll
    float warpIntensity = sin(pow(uScroll, 0.5) * 3.14159265);
    vOpacity = warpIntensity * 0.4;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying float vOpacity;
  void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, vOpacity);
  }
`;

interface SpeedLinesProps {
  count?: number;
}

const SpeedLines: React.FC<SpeedLinesProps> = ({ count = 100 }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const scroll = useScroll();
  // Tracks the visible -> hidden transition (not the initial hidden state at
  // scroll 0), so the "gone" signal fires once the warp has actually played
  // and finished, not immediately on page load.
  const wasVisible = useRef(false);
  const hasFiredGone = useRef(false);

  // Create attributes once
  const { initialPositions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 60; // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60; // y
      pos[i * 3 + 2] = Math.random() * 200 - 100; // initial z offset
      spd[i] = Math.random() * 2 + 1; // speed
    }
    return { initialPositions: pos, speeds: spd };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
    }),
    [],
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uScroll.value = scroll.offset;
    }
    // Speed lines are only visible during active warp scroll transition
    const isVisible = scroll.offset > 0.001 && scroll.offset < 0.999;
    if (meshRef.current) {
      meshRef.current.visible = isVisible;
    }

    if (wasVisible.current && !isVisible && !hasFiredGone.current) {
      hasFiredGone.current = true;
      // Signals ShaderBackground to start animating — the plasma shader
      // stays on a static first frame until the warp streaks have played
      // through and faded, so it doesn't compete for attention mid-warp.
      window.dispatchEvent(new CustomEvent("mnet:speedlines-gone"));
    }
    wasVisible.current = isVisible;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      rotation={[-Math.PI / 2.5, 0, 0]}
    >
      <boxGeometry args={[0.03, 0.03, 10]}>
        <instancedBufferAttribute
          attach="attributes-aInitialPos"
          args={[initialPositions, 3]}
        />
        <instancedBufferAttribute
          attach="attributes-aSpeed"
          args={[speeds, 1]}
        />
      </boxGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
};

export default SpeedLines;
