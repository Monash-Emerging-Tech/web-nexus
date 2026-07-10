"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";
import { collideWax, decayWaxSquash, updateWaxDeform, type WaxBody } from "./waxPhysics";
import type { PerformanceConfig } from "./usePerformanceTier";
import "../LavaBlob/LavaBlobMaterial";
import type { LavaBlobMaterialImpl } from "../LavaBlob/LavaBlobMaterial";

// Three wax bloblets — MNET red, blue, and black — wrestle inside the
// contour mega-sphere while it's up, then get crushed into the center just
// as the cube springs in: the fight forges the cube.

const SHELL_RADIUS = 9; // terrain sphere radius (Shaders.ts baseRadius)
const DRAG = 1.2;
const MAX_SPEED = 14;

interface ForgeSpec {
  ink: string;
  line: string;
  contour: number;
  baseScale: number;
}

const FORGE_SPECS: ForgeSpec[] = [
  { ink: "#3A0110", line: "#DC003B", contour: 1.6, baseScale: 3.2 }, // red
  { ink: "#010530", line: "#030CAB", contour: 1.6, baseScale: 3.0 }, // blue
  // Black wax reads against the void via dim white topo lines
  { ink: "#0B0B0B", line: "#FFFFFF", contour: 0.45, baseScale: 2.6 },
];

interface ForgeBody extends WaxBody {
  phase: number;
  wander: THREE.Vector3; // per-axis wander frequencies
  orbitAxis: THREE.Vector3;
}

const _camRight = new THREE.Vector3();
const _camUp = new THREE.Vector3();
const _force = new THREE.Vector3();
const _rHat = new THREE.Vector3();
const _orbit = new THREE.Vector3();

function smoothstep(min: number, max: number, value: number) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

interface CubeForgeProps {
  perf: PerformanceConfig;
}

const CubeForge: React.FC<CubeForgeProps> = ({ perf }) => {
  const scroll = useScroll();
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const materialRefs = useRef<(LavaBlobMaterialImpl | null)[]>([]);
  // Tracks the terrain shell with the same spring constants and target, so
  // the containment radius follows the visible sphere without plumbing.
  const shellSpringRef = useRef({ scale: 1, velocity: 0 });

  const count = perf.tier === "low" ? 2 : 3;

  const bodies = useMemo<ForgeBody[]>(
    () =>
      FORGE_SPECS.slice(0, count).map((_, i) => {
        const ang = (i / count) * Math.PI * 2;
        return {
          pos: new THREE.Vector3(Math.cos(ang) * 3.5, Math.sin(ang) * 3.5, 0),
          vel: new THREE.Vector3(),
          radius: 0,
          deform: new THREE.Vector3(1, 1, 0),
          deformS: 1,
          deformAxis: new THREE.Vector2(1, 0),
          squashAmt: 0,
          squashAxis: new THREE.Vector2(1, 0),
          phase: Math.random() * Math.PI * 2,
          wander: new THREE.Vector3(
            0.5 + Math.random() * 0.6,
            0.5 + Math.random() * 0.6,
            0.5 + Math.random() * 0.6
          ),
          orbitAxis: new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
          ).normalize(),
        };
      }),
    [count]
  );

  useFrame((state, delta) => {
    const offset = scroll.offset;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 1 / 30);

    // Shell scale spring — identical constants/target to Terrain.tsx
    const targetScale = smoothstep(0.8, 0.2, offset);
    const spring = shellSpringRef.current;
    const force = 250 * (targetScale - spring.scale) - 10 * spring.velocity;
    spring.velocity += force * Math.min(delta, 0.1);
    spring.scale += spring.velocity * Math.min(delta, 0.1);
    if (spring.scale < 0) {
      spring.scale = 0;
      spring.velocity = 0;
    }

    const fadeIn = smoothstep(0.1, 0.18, offset);
    const converge = smoothstep(0.6, 0.78, offset);
    const fadeOut = 1 - smoothstep(0.62, 0.78, offset);
    const opacity = fadeIn * fadeOut;

    if (opacity <= 0.001 || spring.scale <= 0.02) {
      bodies.forEach((_, i) => {
        const mesh = meshRefs.current[i];
        if (mesh) mesh.visible = false;
      });
      return;
    }

    _camRight.setFromMatrixColumn(state.camera.matrixWorld, 0);
    _camUp.setFromMatrixColumn(state.camera.matrixWorld, 1);

    const shellScale = spring.scale;
    const rAvail = Math.max(SHELL_RADIUS * shellScale * 0.75, 0.3);
    const attraction = THREE.MathUtils.lerp(1.2, 9.0, converge);
    const wanderAmp = 3.5 * (1 - converge);
    const orbitGain = 2.5 * (1 - converge);

    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i];
      const mesh = meshRefs.current[i];
      const mat = materialRefs.current[i];
      if (!mesh || !mat) continue;

      const scale =
        FORGE_SPECS[i].baseScale *
        THREE.MathUtils.clamp(shellScale, 0.25, 1) *
        (1 - 0.4 * converge);
      b.radius = scale * 1.5 * 0.32;

      // Attraction to the forge center + fighting wander + circling lunges
      _force.copy(b.pos).multiplyScalar(-attraction);
      _force.x += wanderAmp * Math.sin(t * b.wander.x + b.phase);
      _force.y += wanderAmp * Math.sin(t * b.wander.y + b.phase * 2.0);
      _force.z += wanderAmp * Math.cos(t * b.wander.z + b.phase);
      _rHat.copy(b.pos).normalize();
      _orbit.crossVectors(b.orbitAxis, _rHat);
      _force.addScaledVector(_orbit, orbitGain);
      _force.addScaledVector(b.vel, -DRAG);

      b.vel.addScaledVector(_force, dt);
      const speed = b.vel.length();
      if (speed > MAX_SPEED) b.vel.multiplyScalar(MAX_SPEED / speed);
      b.pos.addScaledVector(b.vel, dt);

      decayWaxSquash(b, dt);
    }

    collideWax(bodies, _camRight, _camUp, 0.1);

    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i];
      const mesh = meshRefs.current[i];
      const mat = materialRefs.current[i];
      if (!mesh || !mat) continue;

      // Keep the wax inside the shrinking shell — slide along the wall
      const maxR = Math.max(rAvail - b.radius, 0.1);
      const r = b.pos.length();
      if (r > maxR) {
        b.pos.setLength(maxR);
        _rHat.copy(b.pos).normalize();
        const vOut = b.vel.dot(_rHat);
        if (vOut > 0) b.vel.addScaledVector(_rHat, -vOut);
      }

      updateWaxDeform(b, _camRight, _camUp);

      const scale =
        FORGE_SPECS[i].baseScale *
        THREE.MathUtils.clamp(shellScale, 0.25, 1) *
        (1 - 0.4 * converge);

      mesh.visible = true;
      mesh.position.copy(b.pos);
      mesh.lookAt(state.camera.position);
      mesh.scale.setScalar(scale);

      mat.uniforms.uTime.value = t;
      mat.uniforms.uOpacity.value = opacity;
      // The forge energizes as it collapses — rising glitch into the handoff
      mat.uniforms.uGlitch.value = converge * 0.5;
      (mat.uniforms.uDeform.value as THREE.Vector3).copy(b.deform);
    }
  });

  if (perf.reducedMotion) return null;

  return (
    <group>
      {FORGE_SPECS.slice(0, count).map((spec, i) => (
        <mesh
          key={spec.ink}
          ref={(m) => {
            meshRefs.current[i] = m;
          }}
          visible={false}
          renderOrder={-1}
        >
          <planeGeometry args={[1.5, 1.5]} />
          <lavaBlobMaterial
            ref={(m: LavaBlobMaterialImpl | null) => {
              materialRefs.current[i] = m;
            }}
            transparent
            depthWrite={false}
            uPhase={(i / count) * Math.PI * 2}
            uWobbleAmp={perf.blobWobbleAmp * 1.2}
            uHasPhoto={0}
            uInkColor={new THREE.Color(spec.ink)}
            uColorA={new THREE.Color(spec.line)}
            uColorB={new THREE.Color(spec.line)}
            uContourStrength={spec.contour}
          />
        </mesh>
      ))}
    </group>
  );
};

export default CubeForge;
