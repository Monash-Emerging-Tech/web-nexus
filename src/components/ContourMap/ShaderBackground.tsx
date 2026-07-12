"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

// The plasma fragment from the moons branch, hosted directly in Three so it
// remains compatible with React 19. The R3F pass uses raw RGB vectors and a
// red/crimson/black palette so the final result retains the branch's visible
// red-on-black look instead of being shifted blue by renderer color handling.
const fragmentShader = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uOpacity;
uniform vec2 uResolution;
uniform vec3 uColor1, uColor2, uColor3, uColor4;

float cheapNoise(vec3 stp) {
  vec3 p = vec3(stp.st, stp.p);
  vec4 a = vec4(5.0, 7.0, 9.0, 13.0);
  return mix(
    sin(p.z + p.x*a.x + cos(p.x*a.x-p.z))*cos(p.z+p.y*a.y+cos(p.y*a.x+p.z)),
    sin(1.0+p.x*a.z+p.z+cos(p.y*a.w-p.z))*cos(1.0+p.y*a.w+p.z+cos(p.x*a.x+p.z)),
    0.436
  );
}

void main() {
  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  // Shader Art's custom buffer used a top-left UV origin. PlaneGeometry uses
  // bottom-left, so flip Y to preserve the moons branch composition exactly.
  vec2 st = vec2(vUv.x, 1.0 - vUv.y) * aspect * 0.1;
  float s = sin(uTime * 0.005);
  float c = cos(uTime * 0.005);
  vec2 v1 = vec2(cheapNoise(vec3(st, 2.0)), cheapNoise(vec3(st, 1.0)));
  vec2 v2 = vec2(
    cheapNoise(vec3(st + v1 + vec2(c*1.7, s*9.2), 0.15*uTime)),
    cheapNoise(vec3(st + v1 + vec2(s*8.3, c*2.8), 0.126*uTime))
  );
  float n = 0.5 + 0.5 * cheapNoise(vec3(st + v2, 0.0));
  vec3 color = mix(uColor1, uColor2, clamp((n*n)*8.0, 0.0, 1.0));
  color = mix(color, uColor3, clamp(length(v1), 0.0, 1.0));
  color = mix(color, uColor4, clamp(abs(v2.x), 0.0, 1.0));
  color /= n*n + n*7.0;
  gl_FragColor = vec4(color * uOpacity, 1.0);
}`;

export function ShaderBackground() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const scroll = useScroll();
  const opacityRef = useRef(0);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uOpacity: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uColor1: { value: new THREE.Vector3(1, 0, 0.24) },
    uColor2: { value: new THREE.Vector3(0.58, 0, 0.08) },
    uColor3: { value: new THREE.Vector3(0.09, 0, 0.015) },
    uColor4: { value: new THREE.Vector3(0, 0, 0) },
  }), []);

  useFrame((state, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    // Crossfade while the terrain and forge are still present. This keeps a
    // continuous red energy field underneath the transition instead of
    // dropping to black and revealing the final backdrop afterward.
    const targetOpacity = THREE.MathUtils.smoothstep(scroll.offset, 0.18, 0.72);
    opacityRef.current = THREE.MathUtils.damp(
      opacityRef.current,
      targetOpacity,
      3.5,
      Math.min(delta, 0.05),
    );
    materialRef.current.uniforms.uOpacity.value = opacityRef.current;
  });

  return (
    <mesh frustumCulled={false} renderOrder={-100}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        toneMapped={false}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
