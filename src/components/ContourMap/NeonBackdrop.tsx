"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";
import type { PerformanceConfig } from "./usePerformanceTier";

// A neon "downlight" that glows in behind the cube for the bottom of the
// scroll — a lava-lamp backlight (blue→magenta→red) with a soft cone from
// above and slow drifting light, replacing the old radiating speed lines.
// Rendered as a camera-facing plane pinned in front of the camera at a fixed
// distance, drawn first (renderOrder −10, no depth) so it's always the
// backdrop and never occludes the scene.

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uBlue;
  uniform vec3 uRed;
  varying vec2 vUv;

  void main() {
    // Slow lava drift so the light breathes rather than sits flat.
    float n = 0.5 + 0.5 * sin(vUv.y * 5.0 - uTime * 0.5
                              + sin(vUv.x * 3.5 + uTime * 0.28) * 1.6);

    // Downlight cone from above the top-centre.
    float cone = smoothstep(1.25, 0.05, distance(vUv, vec2(0.5, 1.12)));
    // Lava-lamp base glow rising from the bottom.
    float base = smoothstep(0.55, 0.0, vUv.y);

    // Vertical neon gradient, blue up top → red toward the base, wobbled by n.
    vec3 col = mix(uBlue, uRed, clamp(1.0 - vUv.y + 0.22 * (n - 0.5), 0.0, 1.0));
    vec3 magenta = mix(uBlue, uRed, 0.5) + vec3(0.12, 0.0, 0.14);
    col = mix(col, magenta, cone * 0.55);

    float glow = (cone * 0.85 + base * 0.55) * (0.6 + 0.4 * n);
    gl_FragColor = vec4(col * glow * 1.5, glow * uIntensity);
  }
`;

const _dir = new THREE.Vector3();

function smoothstep(min: number, max: number, v: number) {
  const x = Math.max(0, Math.min(1, (v - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

const DIST = 60;

interface NeonBackdropProps {
  perf: PerformanceConfig;
}

const NeonBackdrop: React.FC<NeonBackdropProps> = ({ perf }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const scroll = useScroll();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uBlue: { value: new THREE.Color(0.012, 0.047, 0.671) },
      uRed: { value: new THREE.Color(0.863, 0.0, 0.231) },
    }),
    []
  );

  useFrame((state) => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;

    const cam = state.camera as THREE.PerspectiveCamera;
    cam.getWorldDirection(_dir);
    mesh.position.copy(cam.position).addScaledVector(_dir, DIST);
    mesh.quaternion.copy(cam.quaternion);

    // Fill the frustum at DIST, with margin.
    const h = 2 * DIST * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
    const w = h * (state.size.width / state.size.height);
    mesh.scale.set(w * 1.25, h * 1.25, 1);

    mat.uniforms.uTime.value = perf.reducedMotion ? 0 : state.clock.elapsedTime;
    // Glow in over the bottom of the scroll (the cube section).
    mat.uniforms.uIntensity.value = smoothstep(0.35, 0.9, scroll.offset);
  });

  return (
    <mesh ref={meshRef} renderOrder={-10} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};

export default NeonBackdrop;
