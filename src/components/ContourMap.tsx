"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// --- Shader Helper ---
// Using a simpler noise function directly in the shader for performance and reliability
const vertexShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;
  
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vUv = uv;
    
    // Create a dynamic "terrain" effect
    float elevation = noise(position.xy * 0.15 + uTime * 0.1) * 2.5;
    // Add multiple layers for more complexity
    elevation += noise(position.xy * 0.4 - uTime * 0.05) * 0.8;
    
    vElevation = elevation;
    
    vec3 newPosition = position;
    // Move slightly towards the camera/away based on elevation
    newPosition.z += elevation;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;

  void main() {
    // Blue-to-Red mapping based on height
    // elevation is roughly between 0.0 and 3.5
    float t = clamp(vElevation / 3.0, 0.0, 1.0);
    
    // Vibrant blue to bright red
    vec3 colorLow = vec3(0.0, 0.4, 1.0);   // Blue
    vec3 colorHigh = vec3(1.0, 0.0, 0.3);  // Red
    
    vec3 lineColor = mix(colorLow, colorHigh, t);
    
    // Dynamic contour lines
    // Increased frequency for a more detailed "nexus" feel
    float line = mod(vElevation * 8.0, 1.0);
    float lineWeight = 0.06;
    float lineHighlight = smoothstep(0.5 - lineWeight, 0.5, line) - smoothstep(0.5, 0.5 + lineWeight, line);
    
    // Only the lines are colored, everything else is black
    // Boosted brightness on the lines for a "glow" effect
    vec3 finalColor = lineColor * lineHighlight * 1.5;
    
    // Fade out towards the edges for a cleaner look
    float edgeFade = 1.0 - smoothstep(0.3, 0.5, length(vUv - 0.5));
    
    gl_FragColor = vec4(finalColor, edgeFade);
  }
`;

const Terrain = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -1.5, 0]}>
      <planeGeometry args={[40, 40, 128, 128]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
};

const ContourMap = () => {
  return (
    <div className="w-full h-full pointer-events-none overflow-hidden">
      <Canvas camera={{ position: [0, 5, 15], fov: 40 }}>
        {/* Black background to match theme */}
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={1.0} />
        <Terrain />
      </Canvas>
    </div>
  );
};

export default ContourMap;
