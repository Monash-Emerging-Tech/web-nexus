"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import "./LavaBlobMaterial";
import type { LavaBlobMaterialImpl } from "./LavaBlobMaterial";
import { MNET_BLOB_COLORS } from "./shaders";

/** Per-blob palette override for a field. */
export interface FieldBlobColors {
  ink?: string;
  colorA?: string;
  colorB?: string;
}

export interface LavaBlobFieldProps {
  /** Number of ambient blobs (2–4). Default 3. */
  count?: 2 | 3 | 4;
  className?: string;
  /** Optional per-blob palette overrides, cycled if shorter than count. */
  colors?: FieldBlobColors[];
  dpr?: [number, number];
}

// One quad shared by every field blob across all mounted fields.
let sharedGeometry: THREE.PlaneGeometry | null = null;
const getSharedGeometry = () => {
  if (!sharedGeometry) sharedGeometry = new THREE.PlaneGeometry(1.9, 1.9);
  return sharedGeometry;
};

interface FieldBlobProps {
  index: number;
  count: number;
  reduced: boolean;
  colors?: FieldBlobColors;
}

const FieldBlob: React.FC<FieldBlobProps> = ({ index, count, reduced, colors }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<LavaBlobMaterialImpl>(null);

  const cfg = useMemo(() => {
    const spreadX = count > 1 ? (index / (count - 1) - 0.5) * 1.5 : 0;
    return {
      phase: Math.random() * Math.PI * 2,
      x0: spreadX,
      y0: (index % 2 === 0 ? 1 : -1) * 0.25,
      // Lissajous drift, 20–40 s periods — slow wax circulation
      ax: 0.25 + Math.random() * 0.25,
      ay: 0.3 + Math.random() * 0.3,
      wx: (Math.PI * 2) / (20 + Math.random() * 20),
      wy: (Math.PI * 2) / (20 + Math.random() * 20),
      scale: 0.75 + Math.random() * 0.3,
    };
  }, [index, count]);

  useFrame((state) => {
    const mesh = meshRef.current;
    const mat = materialRef.current;
    if (!mesh || !mat) return;
    const t = state.clock.elapsedTime;
    mat.uniforms.uTime.value = reduced ? cfg.phase * 10 : t;
    mat.uniforms.uOpacity.value = 1;
    if (!reduced) {
      mesh.position.set(
        cfg.x0 + Math.sin(t * cfg.wx + cfg.phase) * cfg.ax,
        cfg.y0 + Math.sin(t * cfg.wy + cfg.phase * 2.3) * cfg.ay,
        0
      );
    } else {
      mesh.position.set(cfg.x0, cfg.y0, 0);
    }
  });

  return (
    <mesh ref={meshRef} scale={cfg.scale} geometry={getSharedGeometry()}>
      <lavaBlobMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        uPhase={cfg.phase}
        uWobbleAmp={reduced ? 0 : 0.16}
        uHasPhoto={0}
        uContourStrength={1.4}
        uInkColor={new THREE.Color(colors?.ink ?? MNET_BLOB_COLORS.ink)}
        uColorA={
          new THREE.Color(
            colors?.colorA ??
              (index % 2 === 0 ? MNET_BLOB_COLORS.colorA : MNET_BLOB_COLORS.colorB)
          )
        }
        uColorB={
          new THREE.Color(
            colors?.colorB ??
              (index % 2 === 0 ? MNET_BLOB_COLORS.colorB : MNET_BLOB_COLORS.colorA)
          )
        }
      />
    </mesh>
  );
};

/**
 * Ambient lava-lamp decoration for any page: a handful of slow matte contour
 * blobs drifting in their own lightweight canvas. Non-interactive, pauses
 * off-screen and in background tabs.
 */
const LavaBlobField: React.FC<LavaBlobFieldProps> = ({
  count = 3,
  className,
  colors,
  dpr = [1, 1.5],
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    });
    io.observe(el);
    const onVisibility = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReduced(mql.matches);
    onMotion();
    mql.addEventListener("change", onMotion);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      mql.removeEventListener("change", onMotion);
    };
  }, []);

  const active = visible && pageVisible;

  return (
    <div
      ref={wrapperRef}
      className={className}
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
    >
      <Canvas
        dpr={dpr}
        gl={{ alpha: true, antialias: false }}
        camera={{ position: [0, 0, 2], fov: 50 }}
        frameloop={active ? "always" : "never"}
      >
        {Array.from({ length: count }, (_, i) => (
          <FieldBlob
            key={i}
            index={i}
            count={count}
            reduced={reduced}
            colors={colors?.[i % (colors.length || 1)]}
          />
        ))}
      </Canvas>
    </div>
  );
};

export default LavaBlobField;
