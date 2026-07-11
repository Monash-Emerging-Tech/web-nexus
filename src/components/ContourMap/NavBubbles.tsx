"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { NAV_PAGES } from "./navPages";
import { setLinkCursor } from "./cursor";
import type { PerformanceConfig } from "./usePerformanceTier";
import { BLOB_BASE_RADIUS } from "../LavaBlob/shaders";
import "../LavaBlob/LavaBlobMaterial";
import type { LavaBlobMaterialImpl } from "../LavaBlob/LavaBlobMaterial";

/**
 * Live cube telemetry written by Planet each frame and read here, so bubble
 * size and spacing derive from the cube's actual on-screen presence.
 */
export interface CubeState {
  /** Planet's spring scale, 0 → 1 as the cube arrives. */
  scale: number;
  /** Current world-space bounding radius of the cube (includes its scale). */
  worldRadius: number;
}

// Camera path basis — matches CameraHandler / Planet.
const MAP_ANGLE = -Math.PI / 2.5;
const NY = -Math.sin(MAP_ANGLE);
const NZ = Math.cos(MAP_ANGLE);

// Bubbles rise into place and settle via a smooth exponential follow (no
// overshoot), so they float up from below rather than bouncing toward the
// viewer. Higher = snappier settle.
const FOLLOW_RATE = 6;
const BURST_DURATION = 0.35;

// Ring slots mirror the old leader-line quadrants (About top-right,
// Portfolio right, Outreach bottom-left, Collaborators left).
const BASE_ANGLES_DEG = [35, 145, 215, 325];

const _cubeCenter = new THREE.Vector3();
const _camRight = new THREE.Vector3();
const _camUp = new THREE.Vector3();
const _anchor = new THREE.Vector3();

/**
 * Bake a page label into a CanvasTexture so it can be drawn directly on the
 * blob in-scene — reliable positioning that tracks the blob exactly, unlike a
 * projected HTML overlay.
 */
function makeLabelTexture(text: string): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const dpr = 2;
  const W = 512;
  const H = 160;
  const canvas = document.createElement("canvas");
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(dpr, dpr);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const family = "'OffBit', 'Arial Narrow', Arial, sans-serif";
  let fontSize = 48;
  const setFont = (s: number) => (ctx.font = `700 ${s}px ${family}`);
  setFont(fontSize);
  try {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "2px";
  } catch {
    /* letterSpacing unsupported — fine */
  }
  while (ctx.measureText(text).width > W - 48 && fontSize > 16) {
    fontSize -= 2;
    setFont(fontSize);
  }
  // Dark halo for contrast against the neon wax, then white fill.
  ctx.shadowColor = "rgba(0,0,0,0.95)";
  ctx.shadowBlur = 10;
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(0,0,0,0.6)";
  ctx.strokeText(text, W / 2, H / 2);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, W / 2, H / 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

interface NavBubbleProps {
  pageIndex: number;
  angleDeg: number;
  cubeStateRef: React.MutableRefObject<CubeState>;
  perf: PerformanceConfig;
  onNavigate: (route: string) => void;
}

const NavBubble: React.FC<NavBubbleProps> = ({
  pageIndex,
  angleDeg,
  cubeStateRef,
  perf,
  onNavigate,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<LavaBlobMaterialImpl>(null);
  const labelMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const { size, camera } = useThree();

  const [hovered, setHovered] = useState(false);

  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  const convSpeed = useMemo(() => 0.1 + Math.random() * 0.06, []);
  const posRef = useRef(new THREE.Vector3());
  const initializedRef = useRef(false);
  const burstStartRef = useRef(-1);
  const prevHoveredRef = useRef(false);

  const page = NAV_PAGES[pageIndex];
  const angle = (angleDeg * Math.PI) / 180;

  const labelTex = useMemo(() => makeLabelTexture(page.label), [page.label]);
  useEffect(() => () => labelTex?.dispose(), [labelTex]);

  useEffect(() => {
    return () => {
      if (prevHoveredRef.current) setLinkCursor(false);
    };
  }, []);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const mat = materialRef.current;
    if (!mesh || !mat) return;

    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 1 / 30);
    const s = cubeStateRef.current.scale;

    // ---- sizing from the cube's on-screen presence ------------------------
    _cubeCenter.set(0, NY * 80 * s, NZ * 80 * s);
    const dist = Math.max(camera.position.distanceTo(_cubeCenter), 1);
    const fovRad = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180;
    const worldPerPx = (2 * dist * Math.tan(fovRad / 2)) / size.height;

    const cubeRadiusPx = cubeStateRef.current.worldRadius / worldPerPx;
    const minWH = Math.min(size.width, size.height);
    let bubblePx = THREE.MathUtils.clamp(cubeRadiusPx * 2 * 0.72, 64, minWH * 0.24);
    let ringPx = cubeRadiusPx + bubblePx / 2 + 16;
    if (ringPx < 0.9 * bubblePx) {
      bubblePx = Math.max(64, ringPx / 0.9);
      ringPx = cubeRadiusPx + bubblePx / 2 + 16;
    }
    const landscape = size.width > size.height;
    const rxPx = ringPx * (landscape ? 1.15 : 1.0);
    const ryPx = ringPx * (landscape ? 0.9 : 1.1);

    _camRight.setFromMatrixColumn(camera.matrixWorld, 0);
    _camUp.setFromMatrixColumn(camera.matrixWorld, 1);
    _anchor
      .copy(_cubeCenter)
      .addScaledVector(_camRight, rxPx * Math.cos(angle) * worldPerPx)
      .addScaledVector(_camUp, ryPx * Math.sin(angle) * worldPerPx);

    const bubbleWorld = bubblePx * worldPerPx;

    // Entrance: start below the ring spot and float straight up as the cube
    // arrives, then hold. `entry` is 1 while below, 0 once settled.
    const settle = THREE.MathUtils.smoothstep(s, 0.3, 0.85);
    const entry = 1 - settle;
    _anchor.addScaledVector(_camUp, -entry * bubbleWorld * 3.0);

    // Gentle lava-lamp bob once settled — vertical only, never toward camera.
    if (!perf.reducedMotion) {
      _anchor.addScaledVector(
        _camUp,
        Math.sin(t * convSpeed + phase) * bubbleWorld * 0.12 * settle
      );
    }

    // Smooth exponential follow — eases up and settles, no overshoot.
    if (!initializedRef.current) {
      posRef.current.copy(_anchor);
      initializedRef.current = true;
    }
    const follow = perf.reducedMotion ? 1 : 1 - Math.exp(-FOLLOW_RATE * dt);
    posRef.current.lerp(_anchor, follow);
    mesh.position.copy(posRef.current);
    // Screen-parallel billboard (match the camera's orientation) rather than
    // lookAt — keeps the baked label text dead horizontal for every bubble,
    // no roll from off-centre positions.
    mesh.quaternion.copy(camera.quaternion);

    // Scale eases from near-full to full as it rises.
    const meshScale =
      (bubbleWorld / (1.5 * 2 * BLOB_BASE_RADIUS)) *
      THREE.MathUtils.lerp(0.82, 1, settle) *
      (hovered ? 1.06 : 1);
    mesh.scale.setScalar(meshScale);
    mesh.visible = s > 0.3;

    // ---- single glitch burst on hover-in ---------------------------------
    if (hovered && !prevHoveredRef.current && !perf.reducedMotion) {
      burstStartRef.current = t;
    }
    prevHoveredRef.current = hovered;
    let glitch = 0;
    if (burstStartRef.current >= 0) {
      const bt = (t - burstStartRef.current) / BURST_DURATION;
      if (bt >= 1) burstStartRef.current = -1;
      else glitch = 1 - bt;
    }

    const fade = THREE.MathUtils.smoothstep(s, 0.3, 0.6);
    mat.uniforms.uTime.value = perf.reducedMotion ? phase * 10 : t;
    mat.uniforms.uGlitch.value = glitch;
    mat.uniforms.uHover.value = THREE.MathUtils.lerp(
      mat.uniforms.uHover.value,
      hovered ? 1 : 0,
      0.15
    );
    mat.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      mat.uniforms.uOpacity.value,
      fade,
      0.15
    );
    if (labelMatRef.current) labelMatRef.current.opacity = fade;
  });

  return (
    <mesh
      ref={meshRef}
      scale={[0, 0, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        setLinkCursor(true);
      }}
      onPointerOut={() => {
        setHovered(false);
        setLinkCursor(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        setLinkCursor(false);
        onNavigate(page.route);
      }}
    >
      <planeGeometry args={[1.5, 1.5]} />
      <lavaBlobMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        uPhase={phase}
        uWobbleAmp={perf.reducedMotion ? 0 : perf.blobWobbleAmp * 1.1}
        uHasPhoto={0}
        uGlowStrength={1}
      />
      {/* Page title baked onto the blob so you always know what you're
          clicking — drawn on top of the wax, tracks the blob exactly. */}
      {labelTex && (
        <mesh position={[0, 0, 0.02]} renderOrder={5}>
          <planeGeometry args={[1.2, 0.375]} />
          <meshBasicMaterial
            ref={labelMatRef}
            map={labelTex}
            transparent
            depthTest={false}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}
    </mesh>
  );
};

interface NavBubblesProps {
  cubeStateRef: React.MutableRefObject<CubeState>;
  perf: PerformanceConfig;
  onNavigate: (route: string) => void;
}

/**
 * The cube's navigation, lava-lamp style: four neon wax bubbles — one per
 * page, its title drawn on the wax — hugging the cube once it arrives,
 * replacing the old SVG leader-line labels.
 */
const NavBubbles: React.FC<NavBubblesProps> = ({
  cubeStateRef,
  perf,
  onNavigate,
}) => {
  return (
    <group>
      {NAV_PAGES.map((page, i) => (
        <NavBubble
          key={page.route}
          pageIndex={i}
          angleDeg={BASE_ANGLES_DEG[i]}
          cubeStateRef={cubeStateRef}
          perf={perf}
          onNavigate={onNavigate}
        />
      ))}
    </group>
  );
};

export default NavBubbles;
