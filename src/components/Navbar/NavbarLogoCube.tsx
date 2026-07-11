"use client";

import React, { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import MnetCube from "../MnetCube";

// The "magic angle": the orientation at which the 3D impossible cube's
// orthographic projection snaps into the flat MNET logo. Near-isometric
// starting point tuned against public/img/logo.png — fine-tune by eye in a
// real browser (this pane can't sustain the canvas's render loop). The cube
// can be dragged away from it but always eases back here, so at rest the
// navbar mark always reads as the logo.
const HOME_EULER = new THREE.Euler(0.42, 0.66, 0);
// Orthographic pixels per world unit. The glb is a 2×2×2 cube centred at the
// origin (verified from its POSITION bounds); at a 3/4 view its projected
// span is ~2.8–3.5 units. Lower = more zoomed out. At ~5 the whole cube sits
// well inside the 32px canvas with generous margin.
const CAMERA_ZOOM = 5;
// Radians of rotation per pixel dragged.
const DRAG_SENSITIVITY = 0.01;
// How hard the cube springs back to the logo view (higher = snappier).
const RETURN_STIFFNESS = 9;

interface DragState {
  dragging: boolean;
  pointerId: number;
  lastX: number;
  lastY: number;
  yaw: number; // offset from HOME, radians
  pitch: number;
}

const _home = new THREE.Quaternion().setFromEuler(HOME_EULER);
const _offset = new THREE.Quaternion();
const _target = new THREE.Quaternion();
const _e = new THREE.Euler();

const LogoCube: React.FC<{ drag: React.MutableRefObject<DragState> }> = ({ drag }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { invalidate } = useThree();

  // frameloop is "demand", so once the glb has loaded and this mounts, force
  // one render so the resting logo view paints without any interaction.
  useEffect(() => {
    invalidate();
  }, [invalidate]);

  // Keep rendering while the cube is away from home or being dragged, so the
  // spring-back animates; stop once it has settled.
  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const d = drag.current;

    if (!d.dragging) {
      // Ease the drag offset back to zero → snap to the logo view.
      const k = 1 - Math.exp(-RETURN_STIFFNESS * Math.min(delta, 0.05));
      d.yaw += (0 - d.yaw) * k;
      d.pitch += (0 - d.pitch) * k;
      if (Math.abs(d.yaw) < 1e-4 && Math.abs(d.pitch) < 1e-4) {
        d.yaw = 0;
        d.pitch = 0;
      } else {
        invalidate();
      }
    }

    _e.set(d.pitch, d.yaw, 0, "YXZ");
    _offset.setFromEuler(_e);
    _target.copy(_offset).multiply(_home);
    g.quaternion.copy(_target);
  });

  return (
    <group ref={groupRef}>
      <MnetCube scale={1} edges={false} />
    </group>
  );
};

/**
 * The navbar's MNET mark as an interactive 3D impossible cube. At rest it sits
 * at the magic angle so it looks like the flat logo; drag to tilt it and watch
 * the impossible illusion come apart, then it springs straight back.
 */
const NavbarLogoCube: React.FC<{ className?: string }> = ({ className }) => {
  const drag = useRef<DragState>({
    dragging: false,
    pointerId: -1,
    lastX: 0,
    lastY: 0,
    yaw: 0,
    pitch: 0,
  });
  const invalidateRef = useRef<() => void>(() => {});

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      if (!d.dragging || e.pointerId !== d.pointerId) return;
      d.yaw += (e.clientX - d.lastX) * DRAG_SENSITIVITY;
      d.pitch += (e.clientY - d.lastY) * DRAG_SENSITIVITY;
      // Keep the tilt within a range that still reads as the cube.
      d.yaw = THREE.MathUtils.clamp(d.yaw, -1.3, 1.3);
      d.pitch = THREE.MathUtils.clamp(d.pitch, -1.0, 1.0);
      d.lastX = e.clientX;
      d.lastY = e.clientY;
      invalidateRef.current();
    };
    const onUp = (e: PointerEvent) => {
      const d = drag.current;
      if (e.pointerId !== d.pointerId) return;
      d.dragging = false;
      invalidateRef.current(); // kick off the spring-back
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div
      className={className}
      aria-label="MNET logo"
      role="img"
      style={{ touchAction: "none", cursor: "grab" }}
      onPointerDown={(e) => {
        const d = drag.current;
        d.dragging = true;
        d.pointerId = e.pointerId;
        d.lastX = e.clientX;
        d.lastY = e.clientY;
        (e.currentTarget as HTMLElement).style.cursor = "grabbing";
      }}
      onPointerUp={(e) => {
        (e.currentTarget as HTMLElement).style.cursor = "grab";
      }}
    >
      <Canvas
        orthographic
        camera={{ position: [0, 0, 6], zoom: CAMERA_ZOOM, near: 0.1, far: 100 }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
        // "always" (not "demand"): a demand-mode canvas' drawing buffer gets
        // cleared by the compositor on scroll/repaint and, with nothing
        // re-rendering it, the logo vanishes. Rendering every frame keeps the
        // little cube on screen at all times. It's ~12 triangles — negligible.
        frameloop="always"
        dpr={[1, 2]}
        onCreated={({ invalidate }) => {
          invalidateRef.current = invalidate;
        }}
      >
        <ambientLight intensity={3.2} />
        <pointLight position={[4, 4, 6]} intensity={90} />
        <pointLight position={[-4, -2, 4]} color="#0033ff" intensity={55} />
        <Suspense fallback={null}>
          <LogoCube drag={drag} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default NavbarLogoCube;
