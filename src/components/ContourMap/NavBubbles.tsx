"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import Link from "next/link";
import * as THREE from "three";
import { NAV_PAGES } from "./navPages";
import { usePageTextures } from "./usePageTextures";
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

// Same heavy-wax spring feel as the flashback blobs.
const STIFFNESS = 2.2;
const DAMPING = 1.1;
const BURST_DURATION = 0.35;

// Ring slots mirror the old leader-line quadrants (About top-right,
// Portfolio right, Outreach bottom-left, Collaborators left).
const BASE_ANGLES_DEG = [35, 145, 215, 325];

const _cubeCenter = new THREE.Vector3();
const _camRight = new THREE.Vector3();
const _camUp = new THREE.Vector3();
const _anchor = new THREE.Vector3();
const _spring = new THREE.Vector3();

interface NavBubbleProps {
  pageIndex: number;
  angleDeg: number;
  cubeStateRef: React.MutableRefObject<CubeState>;
  textures: THREE.Texture[];
  aspects: number[];
  perf: PerformanceConfig;
  onNavigate: (route: string) => void;
}

const NavBubble: React.FC<NavBubbleProps> = ({
  pageIndex,
  angleDeg,
  cubeStateRef,
  textures,
  aspects,
  perf,
  onNavigate,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<LavaBlobMaterialImpl>(null);
  const { size, camera } = useThree();

  const [hovered, setHovered] = useState(false);
  // Gates label tabIndex/display; only updated when crossing the threshold.
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);

  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  const convSpeed = useMemo(() => 0.10 + Math.random() * 0.06, []);
  const posRef = useRef(new THREE.Vector3());
  const velRef = useRef(new THREE.Vector3());
  const initializedRef = useRef(false);
  const burstStartRef = useRef(-1);
  const prevHoveredRef = useRef(false);

  const page = NAV_PAGES[pageIndex];
  const angle = (angleDeg * Math.PI) / 180;

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
    // Just smaller than the cube, floored for tap targets, capped for
    // ultrawide screens (where cube size is height-driven anyway).
    let bubblePx = THREE.MathUtils.clamp(
      cubeRadiusPx * 2 * 0.72,
      64,
      minWH * 0.24
    );
    let ringPx = cubeRadiusPx + bubblePx / 2 + 16;
    // Neighbours sit 70° apart at the closest — keep their chord ≥ a bubble
    // diameter by shrinking bubbles (never below the tap floor) if cramped.
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

    // Lava-lamp convection: slow rise/fall proportional to bubble size.
    const bubbleWorld = bubblePx * worldPerPx;
    if (!perf.reducedMotion) {
      _anchor.addScaledVector(
        _camUp,
        Math.sin(t * convSpeed + phase) * bubbleWorld * 0.18
      );
    }

    // ---- heavy-wax spring toward the anchor -------------------------------
    if (!initializedRef.current) {
      posRef.current.copy(_anchor);
      initializedRef.current = true;
    }
    if (perf.reducedMotion) {
      posRef.current.copy(_anchor);
    } else {
      _spring.copy(_anchor).sub(posRef.current).multiplyScalar(STIFFNESS);
      _spring.addScaledVector(velRef.current, -DAMPING);
      velRef.current.addScaledVector(_spring, dt);
      posRef.current.addScaledVector(velRef.current, dt);
    }
    mesh.position.copy(posRef.current);
    mesh.lookAt(camera.position);

    // Quad is 1.5 units; silhouette diameter ≈ 2 × BLOB_BASE_RADIUS of it.
    const springIn = THREE.MathUtils.smoothstep(s, 0.3, 0.7);
    const meshScale =
      (bubbleWorld / (1.5 * 2 * BLOB_BASE_RADIUS)) *
      springIn *
      (hovered ? 1.08 : 1);
    mesh.scale.setScalar(meshScale);
    const visible = s > 0.3;
    mesh.visible = visible;
    if (visible !== activeRef.current) {
      activeRef.current = visible;
      setActive(visible);
    }

    // ---- single glitch burst on hover-in (no page flipping — this bubble
    // IS its destination) ---------------------------------------------------
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

    mat.uniforms.uTime.value = perf.reducedMotion ? phase * 10 : t;
    mat.uniforms.uGlitch.value = glitch;
    mat.uniforms.uHover.value = THREE.MathUtils.lerp(
      mat.uniforms.uHover.value,
      hovered ? 1 : 0,
      0.15
    );
    mat.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      mat.uniforms.uOpacity.value,
      THREE.MathUtils.smoothstep(s, 0.3, 0.6),
      0.15
    );
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
        uHasPhoto={1}
        uRestPhoto={0.25}
        uGlowStrength={1}
        uTexA={textures[pageIndex]}
        uTexB={textures[pageIndex]}
        uAspectA={aspects[pageIndex]}
        uAspectB={aspects[pageIndex]}
      />
      {/* Real link for keyboards, screen readers, and crawlers — routed
          through onNavigate so the frameloop freezes before the transition. */}
      <Html
        center
        position={[0, -0.58, 0]}
        zIndexRange={[40, 0]}
        style={{
          pointerEvents: "none",
          display: active ? undefined : "none",
        }}
      >
        <Link
          href={page.route}
          data-ccursor
          className="cube-label"
          tabIndex={active ? 0 : -1}
          style={{
            pointerEvents: "auto",
            fontFamily: "var(--font-offbit, monospace)",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.2em",
            whiteSpace: "nowrap",
            color: "#fff",
            textDecoration: "none",
            textShadow: "0 0 8px rgba(0,0,0,0.9)",
          }}
          onClick={(e) => {
            e.preventDefault();
            onNavigate(page.route);
          }}
        >
          <span className="cube-label-text">{page.label}</span>
        </Link>
      </Html>
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
 * page — hugging the cube once it arrives, replacing the old SVG
 * leader-line labels.
 */
const NavBubbles: React.FC<NavBubblesProps> = ({
  cubeStateRef,
  perf,
  onNavigate,
}) => {
  const { textures, aspects } = usePageTextures();

  return (
    <group>
      {NAV_PAGES.map((page, i) => (
        <NavBubble
          key={page.route}
          pageIndex={i}
          angleDeg={BASE_ANGLES_DEG[i]}
          cubeStateRef={cubeStateRef}
          textures={textures}
          aspects={aspects}
          perf={perf}
          onNavigate={onNavigate}
        />
      ))}
    </group>
  );
};

export default NavBubbles;
